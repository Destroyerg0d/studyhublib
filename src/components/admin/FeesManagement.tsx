import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import {
  IndianRupee,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
} from "lucide-react";

interface Payment {
  id: string;
  user_id: string;
  plan_id?: string | null;
  amount: number;
  status: string;
  payment_method: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
  paid_at: string | null;
  plan?: {
    name: string;
    price: number;
  };
  user?: {
    name: string;
    email: string;
  };
}

const FeesManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("completed");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPayments = async () => {
    try {
      // 1) Load completed online payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;

      // 2) Load approved manual verifications
      const { data: verifData, error: verifError } = await supabase
        .from('payment_verifications' as any)
        .select('*')
        .eq('status', 'approved')
        .order('verified_at', { ascending: false });

      if (verifError) throw verifError;

      const paymentsList = paymentsData ?? [];
      const verifList = verifData ?? [];

      // 3) Collect user and plan ids
      const userIds = Array.from(new Set([
        ...paymentsList.map((p: any) => p.user_id),
        ...verifList.map((v: any) => v.user_id),
      ].filter(Boolean)));

      const planIds = Array.from(new Set([
        ...paymentsList.map((p: any) => p.plan_id),
        ...verifList.map((v: any) => v.plan_id),
      ].filter(Boolean)));

      // 4) Fetch profiles and plans in parallel (guard against empty arrays)
      const [{ data: profilesData }, { data: plansData }] = await Promise.all([
        userIds.length
          ? supabase.from('profiles').select('id, name, email').in('id', userIds)
          : Promise.resolve({ data: [] as any[] } as any),
        planIds.length
          ? supabase.from('plans').select('id, name, price').in('id', planIds)
          : Promise.resolve({ data: [] as any[] } as any),
      ]);

      // 5) Enrich completed online payments
      const enrichedPayments = paymentsList.map((payment: any) => {
        const userProfile = (profilesData as any[])?.find((p: any) => p.id === payment.user_id);
        const plan = (plansData as any[])?.find((pl: any) => pl.id === payment.plan_id);
        return {
          ...payment,
          plan: plan ? { name: plan.name, price: Number(plan.price) } : undefined,
          user: userProfile ? { name: userProfile.name, email: userProfile.email } : undefined,
        } as Payment;
      });

      // 6) Convert approved verifications to Payment-like rows
      const approvedAsPayments: Payment[] = verifList.map((v: any) => {
        const userProfile = (profilesData as any[])?.find((p: any) => p.id === v.user_id);
        const plan = (plansData as any[])?.find((pl: any) => pl.id === v.plan_id);
        return {
          id: v.id,
          user_id: v.user_id,
          plan_id: v.plan_id,
          amount: Math.round(Number(v.amount) * 100), // convert to minor units
          status: 'completed',
          payment_method: v.payment_method ?? 'manual',
          razorpay_payment_id: null,
          created_at: v.submitted_at,
          paid_at: v.verified_at ?? v.submitted_at,
          plan: plan ? { name: plan.name, price: Number(plan.price) } : undefined,
          user: userProfile ? { name: userProfile.name, email: userProfile.email } : undefined,
        } as Payment;
      });

      // 7) Merge and sort by latest paid/created date
      const merged = [...enrichedPayments, ...approvedAsPayments].sort(
        (a, b) => new Date(b.paid_at || b.created_at).getTime() - new Date(a.paid_at || a.created_at).getTime()
      );

      setPayments(merged);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch payments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();

    // Set up real-time subscription
    const channel = supabase
      .channel('fees-management')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'payments' }, 
        () => fetchPayments()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'subscriptions' }, 
        () => fetchPayments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handlePaymentAction = async (action: string, paymentId: string) => {
    try {
      if (action === "Mark Paid") {
        const { error } = await supabase
          .from('payments')
          .update({ 
            status: 'completed',
            paid_at: new Date().toISOString()
          })
          .eq('id', paymentId);
        
        if (error) throw error;
      }
      
      toast({
        title: `${action} successful`,
        description: `Payment ${action.toLowerCase()} completed.`,
      });
      
      fetchPayments();
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing payment:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action.toLowerCase()} payment`,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "created": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      case "refunded": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === "all" || payment.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Calculate stats from real data
  const totalRevenue = payments.filter(p => p.status === "completed").reduce((sum, p) => sum + (p.amount / 100), 0);
  const pendingRevenue = payments.filter(p => p.status === "created").reduce((sum, p) => sum + (p.amount / 100), 0);
  const failedRevenue = payments.filter(p => p.status === "failed").reduce((sum, p) => sum + (p.amount / 100), 0);
  const completedCount = payments.filter(p => p.status === "completed").length;
  const collectionRate = payments.length > 0 ? Math.round((completedCount / payments.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading payments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Revenue</div>
              <div className="text-xs text-green-600">{completedCount} payments</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">₹{pendingRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Pending</div>
              <div className="text-xs text-gray-600">{payments.filter(p => p.status === "created").length} payments</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">₹{failedRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Failed</div>
              <div className="text-xs text-red-600">{payments.filter(p => p.status === "failed").length} payments</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{collectionRate}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
              <div className="text-xs text-green-600">{collectionRate > 70 ? 'Good' : 'Needs improvement'}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div>
              <CardTitle className="flex items-center">
                <IndianRupee className="h-5 w-5 mr-2" />
                Payment Management
              </CardTitle>
              <CardDescription>Track and manage all student payments</CardDescription>
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
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="created">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payments Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.user?.name || "Unknown"}</div>
                        <div className="text-sm text-gray-500">{payment.user?.email || "No email"}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{payment.plan?.name || "Unknown Plan"}</div>
                      <div className="text-xs text-gray-500">₹{payment.plan?.price || 0}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">₹{(payment.amount / 100).toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {payment.paid_at 
                          ? new Date(payment.paid_at).toLocaleDateString()
                          : new Date(payment.created_at).toLocaleDateString()
                        }
                      </div>
                      {payment.razorpay_payment_id && (
                        <div className="text-xs text-gray-500">
                          ID: {payment.razorpay_payment_id.slice(-8)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{payment.payment_method || "Not specified"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePaymentAction("View", payment.id)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        {payment.status === "created" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePaymentAction("Mark Paid", payment.id)}
                          >
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-8">
              <IndianRupee className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No payments found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeesManagement;