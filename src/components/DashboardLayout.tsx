
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import WorldClock from "@/components/common/WorldClock";
import {
  BookOpen,
  Calendar,
  CreditCard,
  Users,
  Coffee,
  CheckCircle,
  Fingerprint,
  ShoppingBag,
  LogOut,
  Menu,
  X,
  Home,
  GraduationCap,
} from "lucide-react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard", exact: true },
    { path: "/dashboard/timetable", icon: Calendar, label: "Timetable" },
    { path: "/dashboard/fees", icon: CreditCard, label: "Fees & Payment" },
    { path: "/dashboard/seats", icon: Users, label: "Seat Booking" },
    { path: "/dashboard/canteen", icon: Coffee, label: "Canteen" },
    { path: "/dashboard/tuition", icon: GraduationCap, label: "Home Tuition" },
    { path: "/dashboard/verification", icon: CheckCircle, label: "Verification" },
    { path: "/dashboard/fingerprint", icon: Fingerprint, label: "Fingerprint" },
    { path: "/dashboard/stationery", icon: ShoppingBag, label: "Stationery" },
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* World Clock - Only visible on desktop and tablet */}
      <div className="hidden md:block">
        <WorldClock />
      </div>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col`}>
        
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h2 className="text-lg font-semibold">The Study Hub</h2>
              <p className="text-sm text-gray-600">Student Portal</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="mt-6 px-4 flex-1 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.path, item.exact)
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-100 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium">{profile?.name || 'User'}</p>
            <p className="text-xs text-gray-600">{profile?.email}</p>
            <div className="flex items-center mt-2">
              <div className={`w-2 h-2 rounded-full mr-2 ${profile?.verified ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-xs">
                {profile?.verified ? 'Verified' : 'Pending Verification'}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden mr-3"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                {menuItems.find(item => isActive(item.path, item.exact))?.label || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {!profile?.verified && (
                <Link to="/dashboard/verification">
                  <Button size="sm" variant="outline" className="text-yellow-600 border-yellow-600">
                    Complete Verification
                  </Button>
                </Link>
              )}
              <div className="hidden sm:block">
                <p className="text-sm text-gray-600">Welcome, {profile?.name || 'User'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6 overflow-x-auto">
          {children}
        </main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
