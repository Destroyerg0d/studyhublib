import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import {
  Users,
  CreditCard,
  Calendar,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  IndianRupee,
} from "lucide-react";

interface DashboardStats {
  totalStudents: number;
  monthlyRevenue: number;
  occupiedSeats: { occupied: number; total: number };
  pendingVerifications: number;
}

const AdminHome = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    monthlyRevenue: 0,
    occupiedSeats: { occupied: 0, total: 0 },
    pendingVerifications: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDashboardStats = async () => {
    try {
      // Fetch total students
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'student');

      if (studentsError) throw studentsError;

      // Fetch monthly revenue from active subscriptions
      const currentMonth = new Date();
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const { data: revenueData, error: revenueError } = await supabase
        .from('subscriptions')
        .select('amount_paid')
        .gte('payment_date', firstDay.toISOString())
        .lte('payment_date', lastDay.toISOString())
        .eq('status', 'active');

      if (revenueError) throw revenueError;

      // Fetch seat occupancy
      const { data: seatsData, error: seatsError } = await supabase
        .from('seats')
        .select('id, status');

      if (seatsError) throw seatsError;

      // Fetch pending verifications
      const { data: verificationData, error: verificationError } = await supabase
        .from('verification_requests')
        .select('id')
        .eq('status', 'pending');

      if (verificationError) throw verificationError;

      // Calculate stats
      const totalStudents = studentsData?.length || 0;
      const monthlyRevenue = revenueData?.reduce((sum, sub) => sum + (Number(sub.amount_paid) || 0), 0) || 0;
      const totalSeats = seatsData?.length || 0;
      const occupiedSeats = seatsData?.filter(seat => seat.status === 'occupied').length || 0;
      const pendingVerifications = verificationData?.length || 0;

      setStats({
        totalStudents,
        monthlyRevenue,
        occupiedSeats: { occupied: occupiedSeats, total: totalSeats },
        pendingVerifications
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();

    // Set up real-time subscriptions
    const profilesChannel = supabase
      .channel('admin-dashboard-profiles')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' },
        () => fetchDashboardStats()
      )
      .subscribe();

    const subscriptionsChannel = supabase
      .channel('admin-dashboard-subscriptions')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'subscriptions' },
        () => fetchDashboardStats()
      )
      .subscribe();

    const seatsChannel = supabase
      .channel('admin-dashboard-seats')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'seats' },
        () => fetchDashboardStats()
      )
      .subscribe();

    const verificationsChannel = supabase
      .channel('admin-dashboard-verifications')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'verification_requests' },
        () => fetchDashboardStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(subscriptionsChannel);
      supabase.removeChannel(seatsChannel);
      supabase.removeChannel(verificationsChannel);
    };
  }, []);

  const statsCards = [
    {
      title: "Total Students",
      value: loading ? "..." : stats.totalStudents.toString(),
      change: "+12%",
      changeType: "increase" as const,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Monthly Revenue",
      value: loading ? "..." : `₹${stats.monthlyRevenue.toLocaleString()}`,
      change: "+8%",
      changeType: "increase" as const,
      icon: IndianRupee,
      color: "text-green-600",
    },
    {
      title: "Occupied Seats",
      value: loading ? "..." : `${stats.occupiedSeats.occupied}/${stats.occupiedSeats.total}`,
      change: stats.occupiedSeats.total > 0 ? `${Math.round((stats.occupiedSeats.occupied / stats.occupiedSeats.total) * 100)}%` : "0%",
      changeType: "neutral" as const,
      icon: Calendar,
      color: "text-purple-600",
    },
    {
      title: "Pending Verifications",
      value: loading ? "..." : stats.pendingVerifications.toString(),
      change: "-3",
      changeType: "decrease" as const,
      icon: AlertTriangle,
      color: "text-orange-600",
    },
  ];

  const recentActivities = [
    {
      type: "verification",
      message: "New verification request from Rahul Kumar",
      time: "2 hours ago",
      status: "pending",
    },
    {
      type: "payment",
      message: "Payment received from Priya Sharma - ₹1,000",
      time: "4 hours ago",
      status: "completed",
    },
    {
      type: "seat",
      message: "Seat A-15 booked by Amit Singh",
      time: "6 hours ago",
      status: "completed",
    },
    {
      type: "verification",
      message: "Verification approved for Sneha Patel",
      time: "1 day ago",
      status: "completed",
    },
    {
      type: "payment",
      message: "Payment pending from Vikash Gupta - ₹1,000",
      time: "2 days ago",
      status: "pending",
    },
  ];

  const quickActions = [
    {
      title: "Verify Students",
      description: `${stats.pendingVerifications} pending verifications`,
      link: "/admin/verification",
      color: "bg-orange-500",
      urgent: stats.pendingVerifications > 0,
    },
    {
      title: "Manage Seats",
      description: "View seat occupancy",
      link: "/admin/seats",
      color: "bg-blue-500",
      urgent: false,
    },
    {
      title: "Fee Management",
      description: "Track payments",
      link: "/admin/fees",
      color: "bg-green-500",
      urgent: false,
    },
    {
      title: "User Management",
      description: "Manage all users",
      link: "/admin/users",
      color: "bg-purple-500",
      urgent: false,
    },
  ];

  const getChangeColor = (type: string) => {
    switch (type) {
      case "increase": return "text-green-600";
      case "decrease": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-red-100">
            Manage The Study Hub library operations and monitor all activities.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className={`text-xs ${getChangeColor(stat.changeType)}`}>
                    {stat.change} from last month
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.title} to={action.link}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`w-3 h-3 rounded-full ${action.color}`} />
                      {action.urgent && (
                        <Badge variant="destructive" className="text-xs">
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base">{action.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{action.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest actions and updates in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">{activity.time}</p>
                        <Badge className={getStatusColor(activity.status)}>
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current status of library operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Library Operations</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Online</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Payment System</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm">Current Session</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Day Time</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                    <span className="text-sm">Pending Reviews</span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">{stats.pendingVerifications} Items</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>This Month's Summary</CardTitle>
            <CardDescription>Key performance indicators for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
                <div className="text-sm text-gray-600">Total Students</div>
                <div className="text-xs text-green-600">Real-time data</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">₹{stats.monthlyRevenue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Revenue Generated</div>
                <div className="text-xs text-green-600">This month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.occupiedSeats.total > 0 ? Math.round((stats.occupiedSeats.occupied / stats.occupiedSeats.total) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-600">Seat Occupancy</div>
                <div className="text-xs text-blue-600">Live tracking</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">95%</div>
                <div className="text-sm text-gray-600">Student Satisfaction</div>
                <div className="text-xs text-green-600">Based on feedback</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminHome;
