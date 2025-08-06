
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import {
  Calendar,
  CreditCard,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  IndianRupee,
  GraduationCap,
  TrendingUp,
} from "lucide-react";

interface UserActivity {
  id: string;
  type: string;
  message: string;
  time: string;
  status: string;
}

interface UserStats {
  currentSeat: string | null;
  nextPaymentDue: string | null;
  activeSubscription: boolean;
  totalPayments: number;
}

const DashboardHome = () => {
  const { profile } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>({
    currentSeat: null,
    nextPaymentDue: null,
    activeSubscription: false,
    totalPayments: 0
  });
  const [recentActivities, setRecentActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserData = async () => {
    if (!profile?.id) return;

    try {
      // Fetch current seat booking
      const { data: seatData, error: seatError } = await supabase
        .from('seat_bookings')
        .select('seat_number, time_slot, start_date, end_date')
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false })
        .limit(1);

      if (seatError) throw seatError;

      // Fetch active subscription
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('end_date, status')
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (subscriptionError) throw subscriptionError;

      // Fetch total payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .eq('user_id', profile.id)
        .eq('status', 'paid');

      if (paymentsError) throw paymentsError;

      // Fetch recent activities
      const activities: UserActivity[] = [];

      // Add seat booking activities
      if (seatData?.length) {
        activities.push({
          id: '1',
          type: 'seat',
          message: `Seat ${seatData[0].seat_number} booked for ${seatData[0].time_slot}`,
          time: new Date(seatData[0].start_date).toLocaleDateString(),
          status: 'active'
        });
      }

      // Add payment activities
      if (paymentsData?.length) {
        activities.push({
          id: '2',
          type: 'payment',
          message: `Last payment of ₹${paymentsData[paymentsData.length - 1]?.amount || 0} received`,
          time: 'Recent',
          status: 'completed'
        });
      }

      // Add verification status
      activities.push({
        id: '3',
        type: 'verification',
        message: profile.verified ? 'Account verified successfully' : 'Verification pending',
        time: profile.verified ? 'Completed' : 'Pending',
        status: profile.verified ? 'completed' : 'pending'
      });

      const totalPayments = paymentsData?.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0) || 0;
      const currentSeat = seatData?.length ? `${seatData[0].seat_number} (${seatData[0].time_slot})` : null;
      const activeSubscription = subscriptionData?.length > 0;
      const nextPaymentDue = subscriptionData?.length ? new Date(subscriptionData[0].end_date).toLocaleDateString() : null;

      setUserStats({
        currentSeat,
        nextPaymentDue,
        activeSubscription,
        totalPayments
      });

      setRecentActivities(activities);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();

    // Set up real-time subscriptions
    const seatBookingsChannel = supabase
      .channel('user-seat-bookings')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'seat_bookings', filter: `user_id=eq.${profile?.id}` },
        () => fetchUserData()
      )
      .subscribe();

    const subscriptionsChannel = supabase
      .channel('user-subscriptions')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'subscriptions', filter: `user_id=eq.${profile?.id}` },
        () => fetchUserData()
      )
      .subscribe();

    const paymentsChannel = supabase
      .channel('user-payments')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'payments', filter: `user_id=eq.${profile?.id}` },
        () => fetchUserData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(seatBookingsChannel);
      supabase.removeChannel(subscriptionsChannel);
      supabase.removeChannel(paymentsChannel);
    };
  }, [profile?.id]);

  const quickActions = [
    {
      title: "Book a Seat",
      description: "Reserve your preferred study spot",
      icon: Users,
      link: "/dashboard/seats",
      color: "text-blue-600",
    },
    {
      title: "Pay Fees",
      description: "Manage your membership payments",
      icon: CreditCard,
      link: "/dashboard/fees",
      color: "text-green-600",
    },
    {
      title: "View Timetable",
      description: "Check library timings and slots",
      icon: Calendar,
      link: "/dashboard/timetable",
      color: "text-purple-600",
    },
    {
      title: "Complete Verification",
      description: "Upload required documents",
      icon: CheckCircle,
      link: "/dashboard/verification",
      color: "text-orange-600",
    },
    {
      title: "Home Tuition",
      description: "Find qualified tutors for home classes",
      icon: GraduationCap,
      link: "/dashboard/tuition",
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-2">Welcome back, {profile?.name}!</h1>
          <p className="text-blue-100">
            Ready to continue your study journey? Your premium study environment awaits.
          </p>
        </div>

        {/* Status Alert */}
        {!profile?.verified && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="flex items-center p-4">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
              <div className="flex-1">
                <p className="text-sm text-yellow-800">
                  <strong>Action Required:</strong> Please complete your verification to access all features.
                </p>
              </div>
              <Link to="/dashboard/verification">
                <Button size="sm" variant="outline" className="border-yellow-600 text-yellow-600">
                  Verify Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Status</CardTitle>
              <CheckCircle className={`h-4 w-4 ${profile?.verified ? 'text-green-600' : 'text-yellow-600'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${profile?.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                {profile?.verified ? 'Verified' : 'Pending'}
              </div>
              <p className="text-xs text-muted-foreground">
                {profile?.verified ? 'Full access enabled' : 'Verification required'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Seat</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : userStats.currentSeat || "None"}
              </div>
              <p className="text-xs text-muted-foreground">
                {userStats.currentSeat ? 'Active booking' : 'No active seat'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscription</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${userStats.activeSubscription ? 'text-green-600' : 'text-red-600'}`}>
                {loading ? "..." : userStats.activeSubscription ? 'Active' : 'Expired'}
              </div>
              <p className="text-xs text-muted-foreground">
                {userStats.nextPaymentDue ? `Expires ${userStats.nextPaymentDue}` : 'Renew subscription'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <IndianRupee className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : `₹${userStats.totalPayments.toLocaleString()}`}
              </div>
              <p className="text-xs text-muted-foreground">
                Lifetime total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} to={action.link}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="text-center">
                      <Icon className={`h-8 w-8 mx-auto mb-2 ${action.color}`} />
                      <CardTitle className="text-base">{action.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-center">
                        {action.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center text-gray-500">Loading activities...</div>
              ) : recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === 'completed' ? 'bg-green-500' : 
                      activity.status === 'active' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">{activity.time}</p>
                        <Badge className={
                          activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                          activity.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">No recent activities</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Features */}
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>Exciting new features we're working on</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">🍕</div>
                <h3 className="font-medium">Canteen Orders</h3>
                <p className="text-sm text-gray-600">Order food directly to your seat</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">📚</div>
                <h3 className="font-medium">Stationery Store</h3>
                <p className="text-sm text-gray-600">Buy study materials online</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">👆</div>
                <h3 className="font-medium">Biometric Access</h3>
                <p className="text-sm text-gray-600">Secure fingerprint entry</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
};

export default DashboardHome;
