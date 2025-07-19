
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Phone, Mail, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRazorpay } from "@/hooks/useRazorpay";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const CTASection = () => {
  const { user } = useAuth();
  const { initiatePayment, isLoading } = useRazorpay();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleJoinToday = () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Default to most popular plan - Full Day 1 Month
    initiatePayment({
      planId: 'full-day-1month',
      amount: 1000,
      planName: 'Full Day - 1 Month',
      onSuccess: () => {
        navigate('/dashboard/fees');
      },
    });
  };
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to Start Your Study Journey?</h2>
        <p className="text-xl mb-12 max-w-3xl mx-auto opacity-90">
          Join thousands of successful students who have achieved their goals at The Study Hub. 
          Book your seat today and experience the difference.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-12">
          <div className="flex items-center hover-scale">
            <MapPin className="h-6 w-6 mr-3 text-yellow-400" />
            <span className="text-lg">2/20, Ganga Vihar, Khoda Colony</span>
          </div>
          <div className="flex items-center hover-scale">
            <Phone className="h-6 w-6 mr-3 text-yellow-400" />
            <span className="text-lg">+91 8595300308</span>
          </div>
          <div className="flex items-center hover-scale">
            <Mail className="h-6 w-6 mr-3 text-yellow-400" />
            <span className="text-lg">thestudyhublib@gmail.com</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xl px-12 py-6 hover-scale"
            onClick={handleJoinToday}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Join The Study Hub Today"}
            <ArrowRight className="ml-3 h-6 w-6" />
          </Button>
          
          <a 
            href="https://maps.app.goo.gl/Yz53DfNsn4XHgLGu5" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold text-xl px-12 py-6 hover-scale transition-all duration-300"
            >
              Visit Now
              <ExternalLink className="ml-3 h-6 w-6" />
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
