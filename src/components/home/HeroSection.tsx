
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Play, ArrowRight } from "lucide-react";
import VideoTourDialog from "./VideoTourDialog";

const HeroSection = () => {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="/lovable-uploads/790e5486-9319-4cc0-980b-ce003f3659fc.png" 
          alt="Study environment" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          <div className="bg-blue-900/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 mb-8">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg leading-tight">
              Your Perfect Study
              <span className="text-yellow-400 block"> Environment</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-8 max-w-4xl mx-auto drop-shadow-md leading-relaxed">
              Experience premium library facilities with 24/7 access, comfortable seating, 
              and a peaceful environment designed for serious students.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth">
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-lg px-8 py-4 hover-scale">
                Book Your Seat Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <VideoTourDialog>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-black text-lg px-8 py-4 hover-scale">
                <Play className="mr-2 h-5 w-5" />
                Watch Tour Video
              </Button>
            </VideoTourDialog>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
