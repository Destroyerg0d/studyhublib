
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Search,
  Filter,
  UserCheck,
  UserX,
  Edit,
  Eye,
  MoreHorizontal,
  Download,
  Users,
  CheckCircle,
  XCircle,
} from "lucide-react";

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const { toast } = useToast();

  const users = [
    {
      id: 1,
      name: "Rahul Kumar",
      email: "rahul@email.com",
      phone: "+91 9876543210",
      seat: "A-15",
      plan: "Day Time - 3 Months",
      status: "active",
      verified: true,
      joinDate: "2024-10-15",
      lastPayment: "2024-12-01",
      amount: 2800,
    },
    {
      id: 2,
      name: "Priya Sharma",
      email: "priya@email.com",
      phone: "+91 9876543211",
      seat: "B-8",
      plan: "Night Time - 1 Month",
      status: "active",
      verified: true,
      joinDate: "2024-11-20",
      lastPayment: "2024-12-15",
      amount: 1400,
    },
    {
      id: 3,
      name: "Amit Singh",
      email: "amit@email.com",
      phone: "+91 9876543212",
      seat: "C-12",
      plan: "Day Time - 1 Month",
      status: "pending",
      verified: false,
      joinDate: "2024-12-18",
      lastPayment: "2024-12-18",
      amount: 1000,
    },
    {
      id: 4,
      name: "Sneha Patel",
      email: "sneha@email.com",
      phone: "+91 9876543213",
      seat: "D-5",
      plan: "Day Time - 6 Months",
      status: "active",
      verified: true,
      joinDate: "2024-09-10",
      lastPayment: "2024-11-10",
      amount: 5200,
    },
    {
      id: 5,
      name: "Vikash Gupta",
      email: "vikash@email.com",
      phone: "+91 9876543214",
      seat: null,
      plan: "Day Time - 1 Month",
      status: "overdue",
      verified: true,
      joinDate: "2024-11-01",
      lastPayment: "2024-11-01",
      amount: 1000,
    },
  ];

  const handleUserAction = (action: string, userId: number, userName: string) => {
    toast({
      title: `${action} successful`,
      description: `${action} completed for ${userName}`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "overdue": return "bg-red-100 text-red-800";
      case "suspended": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === "all" || user.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { title: "Total Users", value: users.length, color: "text-blue-600" },
    { title: "Active Users", value: users.filter(u => u.status === "active").length, color: "text-green-600" },
    { title: "Pending Users", value: users.filter(u => u.status === "pending").length, color: "text-yellow-600" },
    { title: "Overdue Users", value: users.filter(u => u.status === "overdue").length, color: "text-red-600" },
  ];

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
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
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
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
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
                  <TableHead>Status</TableHead>
                  <TableHead>Last Payment</TableHead>
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
                      <div className="text-sm">{user.phone}</div>
                      <div className="text-xs text-gray-500">
                        Joined: {new Date(user.joinDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.seat ? (
                        <Badge variant="outline">{user.seat}</Badge>
                      ) : (
                        <span className="text-gray-400">No seat</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{user.plan}</div>
                      <div className="text-xs text-gray-500">₹{user.amount}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(user.lastPayment).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUserAction("View", user.id, user.name)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUserAction("Edit", user.id, user.name)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        {user.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserAction("Approve", user.id, user.name)}
                          >
                            <UserCheck className="h-3 w-3 text-green-600" />
                          </Button>
                        )}
                        {user.status === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserAction("Suspend", user.id, user.name)}
                          >
                            <UserX className="h-3 w-3 text-red-600" />
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
