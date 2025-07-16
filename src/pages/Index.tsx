
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, Users, Wifi, Coffee, Shield } from "lucide-react";
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
              <Link to="/auth">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/auth">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Premium
              <span className="text-blue-600 block">Study Environment</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Experience the perfect blend of comfort, technology, and community in our state-of-the-art study spaces. 
              Designed for serious learners who demand excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="px-8 py-3">
                  Start Your Journey
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-3">
                Take a Virtual Tour
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose The Study Hub?</h2>
            <p className="text-lg text-gray-600">Everything you need for productive studying in one place</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Clock className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>24/7 Access</CardTitle>
                <CardDescription>Study on your schedule with round-the-clock access to our facilities</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Wifi className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>High-Speed Internet</CardTitle>
                <CardDescription>Lightning-fast WiFi and ethernet connections for seamless online research</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Community</CardTitle>
                <CardDescription>Connect with like-minded students and professionals in our collaborative spaces</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Coffee className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Refreshments</CardTitle>
                <CardDescription>Stay energized with our premium coffee bar and healthy snack options</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Secure Environment</CardTitle>
                <CardDescription>Biometric access and 24/7 security for peace of mind while you study</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Premium Amenities</CardTitle>
                <CardDescription>Ergonomic furniture, noise-canceling zones, and printing facilities</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Study Experience?</h2>
          <p className="text-blue-100 text-lg mb-8">Join thousands of successful students who have made The Study Hub their second home</p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="px-8 py-3">
              Sign Up Today
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="h-6 w-6 text-blue-400" />
              <span className="ml-2 text-lg font-semibold">The Study Hub</span>
            </div>
            <p className="text-gray-400">© 2024 The Study Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
