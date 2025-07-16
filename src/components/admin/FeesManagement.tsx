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
      plan: "Full Day - 3 Months",
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
      plan: "Night Shift - 1 Month",
      amount: 1200,
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
      plan: "Half Day Morning - 1 Month",
      amount: 600,
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
      plan: "Full Day - 6 Months",
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
      plan: "Half Day Evening - 1 Month",
      amount: 600,
      paymentDate: null,
      dueDate: "2024-11-20",
      status: "overdue",
      method: null,
      transactionId: null,
    },
  ];

  const feePlans = [
    // Full Day Plans
    { 
      id: 1, 
      name: "Full Day - 1 Month", 
      price: 1000, 
      type: "full_day", 
      duration: 1,
      timeSlot: "8:00 AM - 10:00 PM",
      features: ["14 hours daily access", "Individual study booth", "WiFi & power outlets", "Peaceful environment"]
    },
    { 
      id: 2, 
      name: "Full Day - 3 Months", 
      price: 2800, 
      type: "full_day", 
      duration: 3,
      timeSlot: "8:00 AM - 10:00 PM",
      features: ["14 hours daily access", "Individual study booth", "WiFi & power outlets", "Peaceful environment"],
      savings: 200
    },
    { 
      id: 3, 
      name: "Full Day - 6 Months", 
      price: 5200, 
      type: "full_day", 
      duration: 6,
      timeSlot: "8:00 AM - 10:00 PM",
      features: ["14 hours daily access", "Individual study booth", "WiFi & power outlets", "Peaceful environment"],
      savings: 800
    },
    { 
      id: 4, 
      name: "Full Day - 12 Months", 
      price: 10000, 
      type: "full_day", 
      duration: 12,
      timeSlot: "8:00 AM - 10:00 PM",
      features: ["14 hours daily access", "Individual study booth", "WiFi & power outlets", "Peaceful environment"],
      savings: 2000
    },
    
    // Half Day Morning Plans
    { 
      id: 5, 
      name: "Half Day Morning - 1 Month", 
      price: 600, 
      type: "half_day_morning", 
      duration: 1,
      timeSlot: "8:00 AM - 3:00 PM",
      features: ["7 hours daily access", "Morning focused hours", "Individual study booth", "WiFi & power outlets"]
    },
    { 
      id: 6, 
      name: "Half Day Morning - 3 Months", 
      price: 1700, 
      type: "half_day_morning", 
      duration: 3,
      timeSlot: "8:00 AM - 3:00 PM",
      features: ["7 hours daily access", "Morning focused hours", "Individual study booth", "WiFi & power outlets"],
      savings: 100
    },
    { 
      id: 7, 
      name: "Half Day Morning - 6 Months", 
      price: 3200, 
      type: "half_day_morning", 
      duration: 6,
      timeSlot: "8:00 AM - 3:00 PM",
      features: ["7 hours daily access", "Morning focused hours", "Individual study booth", "WiFi & power outlets"],
      savings: 400
    },
    
    // Half Day Evening Plans
    { 
      id: 8, 
      name: "Half Day Evening - 1 Month", 
      price: 600, 
      type: "half_day_evening", 
      duration: 1,
      timeSlot: "3:00 PM - 10:00 PM",
      features: ["7 hours daily access", "Evening focused hours", "Individual study booth", "WiFi & power outlets"]
    },
    { 
      id: 9, 
      name: "Half Day Evening - 3 Months", 
      price: 1700, 
      type: "half_day_evening", 
      duration: 3,
      timeSlot: "3:00 PM - 10:00 PM",
      features: ["7 hours daily access", "Evening focused hours", "Individual study booth", "WiFi & power outlets"],
      savings: 100
    },
    { 
      id: 10, 
      name: "Half Day Evening - 6 Months", 
      price: 3200, 
      type: "half_day_evening", 
      duration: 6,
      timeSlot: "3:00 PM - 10:00 PM",
      features: ["7 hours daily access", "Evening focused hours", "Individual study booth", "WiFi & power outlets"],
      savings: 400
    },
    
    // Night Shift Plans
    { 
      id: 11, 
      name: "Night Shift - 1 Month", 
      price: 1200, 
      type: "night_shift", 
      duration: 1,
      timeSlot: "10:00 PM - 6:00 AM",
      features: ["8 hours night access", "Quiet study environment", "Individual study booth", "WiFi & power outlets"],
      securityDeposit: 1000
    },
    { 
      id: 12, 
      name: "Night Shift - 3 Months", 
      price: 3500, 
      type: "night_shift", 
      duration: 3,
      timeSlot: "10:00 PM - 6:00 AM",
      features: ["8 hours night access", "Quiet study environment", "Individual study booth", "WiFi & power outlets"],
      savings: 100,
      securityDeposit: 1000
    },
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

  const getPlanTypeColor = (type: string) => {
    switch (type) {
      case "full_day": return "bg-blue-100 text-blue-800";
      case "half_day_morning": return "bg-green-100 text-green-800";
      case "half_day_evening": return "bg-orange-100 text-orange-800";
      case "night_shift": return "bg-purple-100 text-purple-800";
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
              <div className="space-y-6">
                {/* Group plans by type */}
                {[
                  { type: "full_day", title: "Full Day Plans", description: "8:00 AM - 10:00 PM" },
                  { type: "half_day_morning", title: "Half Day Morning Plans", description: "8:00 AM - 3:00 PM" },
                  { type: "half_day_evening", title: "Half Day Evening Plans", description: "3:00 PM - 10:00 PM" },
                  { type: "night_shift", title: "Night Shift Plans", description: "10:00 PM - 6:00 AM" }
                ].map(({ type, title, description }) => (
                  <div key={type} className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold">{title}</h3>
                      <Badge className={getPlanTypeColor(type)}>{description}</Badge>
                    </div>
                    <div className="grid gap-3">
                      {feePlans.filter(plan => plan.type === type).map((plan) => (
                        <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h4 className="font-medium">{plan.name}</h4>
                              {plan.savings && (
                                <Badge variant="outline" className="text-green-600 border-green-200">
                                  Save ₹{plan.savings}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{plan.timeSlot}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {plan.features.slice(0, 2).map((feature, index) => (
                                <span key={index} className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                                  {feature}
                                </span>
                              ))}
                            </div>
                            {plan.securityDeposit && (
                              <p className="text-xs text-orange-600 mt-1">
                                + ₹{plan.securityDeposit} security deposit (one-time)
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-lg font-bold">₹{plan.price.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">{plan.duration} month{plan.duration > 1 ? 's' : ''}</div>
                            <div className="text-xs text-gray-500">
                              ₹{Math.round(plan.price / plan.duration)}/month avg
                            </div>
                          </div>
                        </div>
                      ))}
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
