
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

const FeesManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const { toast } = useToast();

  const payments = [
    {
      id: 1,
      studentName: "Rahul Kumar",
      email: "rahul@email.com",
      plan: "Day Time - 3 Months",
      amount: 2800,
      paymentDate: "2024-12-01",
      dueDate: "2024-12-01",
      status: "paid",
      method: "UPI",
      transactionId: "TXN123456789",
    },
    {
      id: 2,
      studentName: "Priya Sharma",
      email: "priya@email.com",
      plan: "Night Time - 1 Month",
      amount: 1400,
      paymentDate: "2024-12-15",
      dueDate: "2024-12-15",
      status: "paid",
      method: "Card",
      transactionId: "TXN987654321",
    },
    {
      id: 3,
      studentName: "Amit Singh",
      email: "amit@email.com",
      plan: "Day Time - 1 Month",
      amount: 1000,
      paymentDate: null,
      dueDate: "2024-12-18",
      status: "pending",
      method: null,
      transactionId: null,
    },
    {
      id: 4,
      studentName: "Sneha Patel",
      email: "sneha@email.com",
      plan: "Day Time - 6 Months",
      amount: 5200,
      paymentDate: "2024-11-10",
      dueDate: "2024-11-10",
      status: "paid",
      method: "Bank Transfer",
      transactionId: "TXN456789123",
    },
    {
      id: 5,
      studentName: "Vikash Gupta",
      email: "vikash@email.com",
      plan: "Day Time - 1 Month",
      amount: 1000,
      paymentDate: null,
      dueDate: "2024-11-20",
      status: "overdue",
      method: null,
      transactionId: null,
    },
  ];

  const feePlans = [
    { id: 1, name: "Day Time - 1 Month", price: 1000, type: "day", duration: 1 },
    { id: 2, name: "Day Time - 3 Months", price: 2800, type: "day", duration: 3 },
    { id: 3, name: "Day Time - 6 Months", price: 5200, type: "day", duration: 6 },
    { id: 4, name: "Day Time - 12 Months", price: 10000, type: "day", duration: 12 },
    { id: 5, name: "Night Time - 1 Month", price: 1400, type: "night", duration: 1 },
    { id: 6, name: "Night Time - 3 Months", price: 3500, type: "night", duration: 3 },
  ];

  const handlePaymentAction = (action: string, paymentId: number) => {
    toast({
      title: `${action} successful`,
      description: `Payment ${action.toLowerCase()} completed.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "overdue": return "bg-red-100 text-red-800";
      case "refunded": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === "all" || payment.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const totalRevenue = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const pendingRevenue = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);
  const overdueRevenue = payments.filter(p => p.status === "overdue").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Revenue</div>
              <div className="text-xs text-green-600">+12% this month</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">₹{pendingRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Pending</div>
              <div className="text-xs text-gray-600">{payments.filter(p => p.status === "pending").length} payments</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">₹{overdueRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Overdue</div>
              <div className="text-xs text-red-600">{payments.filter(p => p.status === "overdue").length} payments</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((payments.filter(p => p.status === "paid").length / payments.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Collection Rate</div>
              <div className="text-xs text-green-600">Above target</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payments">Payment Records</TabsTrigger>
          <TabsTrigger value="plans">Fee Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
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
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
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
                      <TableHead>Due Date</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payment.studentName}</div>
                            <div className="text-sm text-gray-500">{payment.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{payment.plan}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">₹{payment.amount.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(payment.dueDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {payment.paymentDate 
                              ? new Date(payment.paymentDate).toLocaleDateString()
                              : "-"
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </Badge>
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
                            {payment.status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePaymentAction("Mark Paid", payment.id)}
                              >
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              </Button>
                            )}
                            {payment.status === "overdue" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePaymentAction("Send Reminder", payment.id)}
                              >
                                <Clock className="h-3 w-3 text-orange-600" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans">
          <Card>
            <CardHeader>
              <CardTitle>Fee Plans Management</CardTitle>
              <CardDescription>Configure pricing for different membership plans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feePlans.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{plan.name}</h3>
                      <p className="text-sm text-gray-600">
                        {plan.type === "day" ? "Day Time (8AM-10PM)" : "Night Time (10PM-6AM)"}
                      </p>
                      <p className="text-xs text-gray-500">
                        ₹{Math.round(plan.price / plan.duration)}/month average
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">₹{plan.price.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">{plan.duration} month{plan.duration > 1 ? 's' : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeesManagement;
