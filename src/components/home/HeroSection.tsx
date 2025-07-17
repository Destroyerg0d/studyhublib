
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Users, Clock, Wifi } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            Your Perfect
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 block">
              Study Space
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Experience premium library facilities with modern amenities, peaceful environment, 
            and flexible timing options designed for serious students.
          </p>
          
          {/* CTA Button */}
          <div className="mb-16">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xl px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover-scale">
                Start Your Journey Today
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          </div>
          
          {/* Key Features Grid */}
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover-scale">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Study Environment</h3>
              <p className="text-gray-600 text-center">Quiet, focused atmosphere perfect for deep learning</p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover-scale">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Community of Learners</h3>
              <p className="text-gray-600 text-center">Join motivated students achieving their goals</p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover-scale">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Timings</h3>
              <p className="text-gray-600 text-center">Choose from morning, evening, or full-day plans</p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover-scale">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                <Wifi className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Modern Amenities</h3>
              <p className="text-gray-600 text-center">High-speed WiFi, AC, and comfortable seating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
