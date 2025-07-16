
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
        <h1 className="text-2xl font-bold mb-2">Welcome back, Student!</h1>
        <p className="text-blue-100">
          Ready to continue your study journey? Your premium study environment awaits.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Verified</div>
            <p className="text-xs text-muted-foreground">Account verified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Role</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">Student</div>
            <p className="text-xs text-muted-foreground">Access level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Slot</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Day Time</div>
            <p className="text-xs text-muted-foreground">8:00 AM - 10:00 PM</p>
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
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Welcome to The Study Hub!</p>
                <p className="text-xs text-gray-500">Start your study journey today</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">System ready</p>
                <p className="text-xs text-gray-500">All features available</p>
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
