
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import {
  Calendar,
  CreditCard,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  IndianRupee,
} from "lucide-react";

const DashboardHome = () => {
  const { user } = useAuth();

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
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100">
          Ready to continue your study journey? Your premium study environment awaits.
        </p>
      </div>

      {/* Status Alert */}
      {!user?.verified && (
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membership Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">
              Valid until Jan 2025
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Slot</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Day Time</div>
            <p className="text-xs text-muted-foreground">
              8:00 AM - 10:00 PM
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seat Number</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">A-15</div>
            <p className="text-xs text-muted-foreground">
              Row 3, Column 5
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
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Payment received for December 2024</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Seat A-15 booked successfully</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Profile verification submitted</p>
                <p className="text-xs text-gray-500">3 days ago</p>
              </div>
            </div>
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
