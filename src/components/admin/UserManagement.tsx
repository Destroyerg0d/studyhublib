
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  Filter,
  UserX,
  Edit,
  Eye,
  Download,
  Users,
  CheckCircle,
  XCircle,
  Trash2,
  Shield,
  ShieldOff,
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface SeatBooking {
  seat_number: number;
  time_slot: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  verified: boolean;
  role: string;
  created_at: string;
  subscription?: {
    plan: { name: string; price: number; duration_months?: number | null; duration_days?: number | null; type?: string | null } | null;
    status: string;
    amount_paid: number | null;
    start_date?: string;
    end_date: string;
  } | null;
  seat_bookings?: SeatBooking[];
}

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editVerified, setEditVerified] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          subscriptions (
            status,
            amount_paid,
            start_date,
            end_date,
            plan_id,
            plan:plans (
              name,
              price,
              duration_months,
              duration_days,
              type
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const usersBase = (data as unknown as User[]) || [];

      // Fetch seat bookings separately to avoid missing relationship errors
      const userIds = usersBase.map((u: any) => u.id).filter(Boolean);
      if (userIds.length > 0) {
        const { data: seatData, error: seatError } = await supabase
          .from('seat_bookings')
          .select('user_id, seat_number, time_slot, start_date, end_date, status')
          .in('user_id', userIds);

        if (seatError) {
          console.error('Error fetching seat bookings:', seatError);
        }

        const bookingsByUser: Record<string, SeatBooking[]> = {};
        (seatData || []).forEach((sb: any) => {
          const key = sb.user_id as string;
          if (!bookingsByUser[key]) bookingsByUser[key] = [];
          bookingsByUser[key].push({
            seat_number: sb.seat_number,
            time_slot: sb.time_slot,
            start_date: sb.start_date,
            end_date: sb.end_date,
            status: sb.status,
          });
        });

        const merged = usersBase.map((u: any) => ({
          ...u,
          seat_bookings: bookingsByUser[u.id] || [],
        }));

        setUsers(merged as User[]);
      } else {
        setUsers(usersBase);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        setCurrentUser(data);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();

    // Set up real-time subscription
    const channel = supabase
      .channel('user-management')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' }, 
        () => fetchUsers()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'subscriptions' }, 
        () => fetchUsers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUserAction = async (action: string, userId: string, userName: string) => {
    try {
      if (action === "Ban") {
        // Disable the user's account by setting verified to false
        const { error } = await supabase
          .from('profiles')
          .update({ verified: false })
          .eq('id', userId);
        
        if (error) throw error;
      } else if (action === "Unban") {
        // Re-enable the user's account
        const { error } = await supabase
          .from('profiles')
          .update({ verified: true })
          .eq('id', userId);
        
        if (error) throw error;
        // Delete action is handled via secure Edge Function from the delete button handler
        // (admin-delete-user).
      } else if (action === "MakeAdmin") {
        const { error } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', userId);
        
        if (error) throw error;
      } else if (action === "RemoveAdmin") {
        const { error } = await supabase
          .from('profiles')
          .update({ role: 'student' })
          .eq('id', userId);
        
        if (error) throw error;
      }

      toast({
        title: `${action} successful`,
        description: `${action} completed for ${userName}`,
      });
      
      fetchUsers();
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing user:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action.toLowerCase()} user`,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (subscription: any) => {
    if (!subscription) return "bg-gray-100 text-gray-800";
    
    switch (subscription.status) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "expired": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getUserStatus = (user: User) => {
    if (!user.subscription) return "no_subscription";
    return user.subscription.status;
  };

  const getCurrentSeat = (user: User) => {
    const bookings = user.seat_bookings || [];
    const today = new Date();
    const active = bookings.find(b => {
      const s = new Date(b.start_date);
      const e = new Date(b.end_date);
      return b.status === 'active' && s <= today && today <= e;
    });
    return active || null;
  };

  const getDaysLeft = (user: User) => {
    const end = user.subscription?.end_date;
    if (!end) return null;
    const endDate = new Date(end);
    const today = new Date();
    const diffMs = endDate.getTime() - new Date(today.toDateString()).getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return days;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const userStatus = getUserStatus(user);
    const matchesFilter = selectedFilter === "all" || userStatus === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { title: "Total Users", value: users.length, color: "text-blue-600" },
    { title: "Active Users", value: users.filter(u => getUserStatus(u) === "active").length, color: "text-green-600" },
    { title: "Pending Users", value: users.filter(u => getUserStatus(u) === "pending").length, color: "text-yellow-600" },
    { title: "No Subscription", value: users.filter(u => !u.subscription).length, color: "text-gray-600" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="flex items-center justify-center p-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.title}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                User Management
              </CardTitle>
              <CardDescription>Manage all registered students and their details</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <Download className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="no_subscription">No Subscription</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Seat</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="flex items-center mt-1">
                          {user.verified ? (
                            <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500 mr-1" />
                          )}
                          <span className="text-xs text-gray-500">
                            {user.verified ? "Verified" : "Unverified"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{user.phone || "N/A"}</div>
                      <div className="text-xs text-gray-500">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const sb = getCurrentSeat(user);
                        return sb ? (
                          <div>
                            <div className="text-sm">Seat {sb.seat_number} ({sb.time_slot})</div>
                            <div className="text-xs text-gray-500">
                              {new Date(sb.start_date).toLocaleDateString()} - {new Date(sb.end_date).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">No active seat</span>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      {user.subscription ? (
                        <div>
                          <div className="text-sm">{user.subscription.plan?.name || "Unknown Plan"}</div>
                          <div className="text-xs text-gray-500">₹{user.subscription.amount_paid || 0}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">No subscription</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const d = getDaysLeft(user);
                        if (d === null) return <span className="text-gray-400">—</span>;
                        if (d < 0) return <span className="text-red-600">Expired</span>;
                        return <span className="text-gray-700">{d} days</span>;
                      })()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.subscription)}>
                        {user.subscription?.status || "No Subscription"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewUser(user)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditUser(user);
                            setEditName(user.name);
                            setEditPhone(user.phone || "");
                            setEditVerified(!!user.verified);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        
                        {/* Ban/Unban Button */}
                        {user.verified ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserAction("Ban", user.id, user.name)}
                            title="Ban user account"
                          >
                            <UserX className="h-3 w-3 text-red-600" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserAction("Unban", user.id, user.name)}
                            title="Unban user account"
                          >
                            <UserX className="h-3 w-3 text-green-600" />
                          </Button>
                        )}
                        
                        {/* Admin Role Toggle */}
                        {user.role !== 'admin' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserAction("MakeAdmin", user.id, user.name)}
                            title="Make admin"
                          >
                            <Shield className="h-3 w-3 text-blue-600" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserAction("RemoveAdmin", user.id, user.name)}
                            title="Remove admin"
                          >
                            <ShieldOff className="h-3 w-3 text-orange-600" />
                          </Button>
                        )}
                        
                        {/* Delete Button - Only for non-admin users */}
                        {user.role !== 'admin' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              // Check for active subscription and warn accordingly
                              const { data: activeSubs } = await supabase
                                .from('subscriptions')
                                .select('id')
                                .eq('user_id', user.id)
                                .eq('status', 'active')
                                .limit(1);
                              const hasActive = !!(activeSubs && activeSubs.length > 0);
                              const baseMsg = `Are you sure you want to delete ${user.name}? This action cannot be undone.`;
                              const warn = hasActive ? `\n\nWARNING: This user has an active subscription. Deleting will immediately revoke access.` : '';
                              if (!window.confirm(baseMsg + warn)) return;

                              // Call secure Edge Function to perform full deletion (DB + auth user)
                              const { data, error } = await supabase.functions.invoke('admin-delete-user', {
                                body: { userId: user.id },
                              });
                              if (error || (data && (data as any).error)) {
                                toast({ title: 'Error', description: 'Failed to delete user', variant: 'destructive' });
                                return;
                              }
                              toast({ title: 'Delete successful', description: `${user.name} has been deleted.` });
                              fetchUsers();
                            }}
                            title="Delete user"
                          >
                            <Trash2 className="h-3 w-3 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No users found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
