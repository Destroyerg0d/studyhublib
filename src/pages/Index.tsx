
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, Users, Shield, Wifi, Coffee } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">The Study Hub</span>
            </div>
            <div className="flex space-x-4">
              <Link to="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Link to="/admin">
                <Button>Admin Panel</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Premium Study Environment
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Experience the perfect blend of comfort, technology, and community in our state-of-the-art study facility.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link to="/dashboard">
                <Button size="lg" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Clock className="h-8 w-8 text-blue-600" />
                <CardTitle>Flexible Hours</CardTitle>
                <CardDescription>
                  24/7 access with day and night time options to fit your schedule
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-blue-600" />
                <CardTitle>Reserved Seating</CardTitle>
                <CardDescription>
                  Guaranteed comfortable seating with your personal study space
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-blue-600" />
                <CardTitle>Secure Environment</CardTitle>
                <CardDescription>
                  Safe and monitored premises with fingerprint access control
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Wifi className="h-8 w-8 text-blue-600" />
                <CardTitle>High-Speed WiFi</CardTitle>
                <CardDescription>
                  Reliable internet connectivity for all your digital study needs
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Coffee className="h-8 w-8 text-blue-600" />
                <CardTitle>Canteen Services</CardTitle>
                <CardDescription>
                  Fresh snacks and beverages to keep you energized throughout your study sessions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BookOpen className="h-8 w-8 text-blue-600" />
                <CardTitle>Study Resources</CardTitle>
                <CardDescription>
                  Access to stationery, study materials, and a quiet learning environment
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
