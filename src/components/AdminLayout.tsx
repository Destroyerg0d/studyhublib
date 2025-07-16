
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Users,
  Calendar,
  CreditCard,
  CheckCircle,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
} from "lucide-react";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    { path: "/admin", icon: Home, label: "Dashboard", exact: true },
    { path: "/admin/users", icon: Users, label: "User Management" },
    { path: "/admin/seats", icon: BarChart3, label: "Seat Management" },
    { path: "/admin/timetable", icon: Calendar, label: "Timetable" },
    { path: "/admin/fees", icon: CreditCard, label: "Fees Management" },
    { path: "/admin/verification", icon: CheckCircle, label: "Verification" },
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static`}>
        
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <h2 className="text-lg font-semibold">The Study Hub</h2>
              <p className="text-sm text-gray-600">Admin Panel</p>
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

        <nav className="mt-6 px-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.path, item.exact)
                      ? "bg-red-100 text-red-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-red-50 rounded-lg p-3 mb-4">
            <div className="flex items-center mb-2">
              <Settings className="h-4 w-4 text-red-600 mr-2" />
              <span className="text-sm font-medium text-red-800">Admin User</span>
            </div>
            <p className="text-sm font-medium">{profile?.name || 'Admin'}</p>
            <p className="text-xs text-gray-600">{profile?.email}</p>
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
                {menuItems.find(item => isActive(item.path, item.exact))?.label || 'Admin Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block">
                <p className="text-sm text-gray-600">Admin: {profile?.name || 'Admin'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
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

export default AdminLayout;
