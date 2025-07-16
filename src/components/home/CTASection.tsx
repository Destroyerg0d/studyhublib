
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Phone, Mail } from "lucide-react";

const CTASection = () => {
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
        
        <Link to="/auth">
          <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xl px-12 py-6 hover-scale">
            Join The Study Hub Today
            <ArrowRight className="ml-3 h-6 w-6" />
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default CTASection;
