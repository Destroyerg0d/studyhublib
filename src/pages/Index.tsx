
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, Users, Shield, MapPin, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">The Study Hub</h1>
                <p className="text-sm text-gray-600">Premium Library Experience</p>
              </div>
            </div>
            <Link to="/auth">
              <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Perfect Study
            <span className="text-blue-600"> Environment</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience premium library facilities with 24/7 access, comfortable seating, 
            and a peaceful environment designed for serious students.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Book Your Seat Today
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose The Study Hub?</h3>
            <p className="text-lg text-gray-600">Premium facilities designed for your success</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>24/7 Access</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Day timing (8AM-10PM) and Night timing (10PM-6AM) options available
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Premium Seating</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  21 comfortable seats arranged in 4 rows for optimal study environment
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Secure Environment</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Verified members only with biometric access and security deposit
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Study Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Upcoming: Canteen, Stationery store, and additional study materials
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Affordable Pricing Plans</h3>
            <p className="text-lg text-gray-600">Choose the plan that works best for your schedule</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 border-blue-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-blue-600">Day Time</CardTitle>
                <CardDescription>8:00 AM - 10:00 PM</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">₹1,000</div>
                  <div className="text-gray-600">per month</div>
                </div>
                <div className="space-y-2 text-sm">
                  <div>• 3 months: ₹2,800</div>
                  <div>• 6 months: ₹5,200</div>
                  <div>• 12 months: ₹10,000</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-purple-600">Night Time</CardTitle>
                <CardDescription>10:00 PM - 6:00 AM</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">₹1,400</div>
                  <div className="text-gray-600">per month</div>
                </div>
                <div className="space-y-2 text-sm">
                  <div>• 3 months: ₹3,500</div>
                  <div>• Security: ₹1,000 (one-time)</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-8">Ready to Start Your Study Journey?</h3>
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-8">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              <span>thestudyhublib.com</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              <span>+91 12345 67890</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              <span>info@thestudyhublib.com</span>
            </div>
          </div>
          <Link to="/auth">
            <Button size="lg" variant="secondary">
              Join The Study Hub Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 mr-2" />
            <span className="text-lg font-semibold">The Study Hub</span>
          </div>
          <p className="text-gray-400">© 2024 The Study Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
