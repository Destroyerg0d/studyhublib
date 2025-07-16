
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import PricingSection from "@/components/home/PricingSection";
import GallerySection from "@/components/home/GallerySection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link to="/" className="flex items-center hover-scale">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">The Study Hub</h1>
                <p className="text-sm text-gray-600">Premium Library Experience</p>
              </div>
            </Link>
            <Link to="/auth">
              <Button className="bg-blue-600 hover:bg-blue-700 font-semibold hover-scale">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection />

      {/* Gallery Section */}
      <GallerySection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <BookOpen className="h-6 w-6 mr-2" />
                <span className="text-lg font-semibold">The Study Hub</span>
              </div>
              <p className="text-gray-400 mb-4">
                Your premier destination for focused study with modern amenities and a peaceful environment.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/auth" className="block text-gray-400 hover:text-white transition-colors">
                  Register Now
                </Link>
                <Link to="/auth" className="block text-gray-400 hover:text-white transition-colors">
                  Login
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2 text-gray-400">
                <p>📍 2/20, Ganga Vihar, Khoda Colony</p>
                <p className="ml-4">Near Bhagwati Classes, Mangal Bazar</p>
                <p className="ml-4">Noida - 201309</p>
                <p>📞 +91 8595300308</p>
                <p>✉️ thestudyhublib@gmail.com</p>
                <p>🌐 thestudyhublib.site</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2024 The Study Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
