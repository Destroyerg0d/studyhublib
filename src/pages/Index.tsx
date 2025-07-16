
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, Users, Shield, MapPin, Phone, Mail, Play, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useEffect, useState } from "react";

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const galleryImages = [
    {
      src: "/lovable-uploads/ef2d0636-cde8-4bc6-b5b8-def941616221.png",
      alt: "Study area with wooden desks and motivational signage",
      title: "Premium Study Environment"
    },
    {
      src: "/lovable-uploads/8f35572b-d229-467a-a404-15765ce9f7e6.png",
      alt: "Modern library interior with stairs and ceiling fans",
      title: "Modern Infrastructure"
    },
    {
      src: "/lovable-uploads/4943fd41-9a62-4110-8b5f-2eb449c0237e.png",
      alt: "Spacious study hall with wooden partitions",
      title: "Spacious Study Halls"
    },
    {
      src: "/lovable-uploads/6073a091-80f3-4399-bffe-8668a976adc1.png",
      alt: "Individual study booths with power outlets",
      title: "Individual Study Booths"
    },
    {
      src: "/lovable-uploads/ae040354-0626-4deb-a7e5-bb671c4035bd.png",
      alt: "Students studying in a well-lit environment",
      title: "Focused Study Environment"
    },
    {
      src: "/lovable-uploads/f004eb89-a3cf-473a-9680-4d24fa0f3b91.png",
      alt: "Multi-level study area with modern amenities",
      title: "Multi-Level Study Areas"
    },
    {
      src: "/lovable-uploads/790e5486-9319-4cc0-980b-ce003f3659fc.png",
      alt: "Large study hall with students working",
      title: "Collaborative Study Spaces"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
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

      {/* Enhanced Hero Section with Video Background */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-r from-blue-900/90 to-indigo-900/90 absolute z-10"></div>
          <img 
            src="/lovable-uploads/790e5486-9319-4cc0-980b-ce003f3659fc.png" 
            alt="Study environment" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            Your Perfect Study
            <span className="text-yellow-400"> Environment</span>
          </h2>
          <p className="text-xl text-gray-100 mb-8 max-w-3xl mx-auto drop-shadow-md">
            Experience premium library facilities with 24/7 access, comfortable seating, 
            and a peaceful environment designed for serious students.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                Book Your Seat Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
              <Play className="mr-2 h-5 w-5" />
              Watch Tour Video
            </Button>
          </div>
        </div>
      </section>

      {/* Image Gallery Slideshow */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Explore Our Facilities</h3>
            <p className="text-lg text-gray-600">Take a virtual tour of our premium study environment</p>
          </div>
          
          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent>
              {galleryImages.map((image, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="relative overflow-hidden rounded-lg">
                      <img 
                        src={image.src} 
                        alt={image.alt}
                        className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                        <h4 className="text-white font-semibold p-4">{image.title}</h4>
                      </div>
                    </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">See The Study Hub in Action</h3>
            <p className="text-lg text-gray-600">Watch how our students achieve their academic goals</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="overflow-hidden">
              <div className="relative">
                <iframe 
                  width="100%" 
                  height="300" 
                  src="https://drive.google.com/file/d/1-MdNvuca-knHGp-H9UQ7_GGK9tNMcjHF/preview" 
                  className="rounded-t-lg"
                  allowFullScreen
                ></iframe>
                <div className="p-6">
                  <h4 className="font-semibold text-lg mb-2">Virtual Library Tour</h4>
                  <p className="text-gray-600">Get an inside look at our state-of-the-art facilities and study environments.</p>
                </div>
              </div>
            </Card>
            
            <Card className="overflow-hidden">
              <div className="relative h-300 bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <Play className="h-16 w-16 mx-auto mb-4 opacity-80" />
                  <h4 className="font-semibold text-lg mb-2">Student Success Stories</h4>
                  <p className="opacity-90">Hear from our successful students about their study experience</p>
                  <Button variant="secondary" className="mt-4">
                    Coming Soon
                  </Button>
                </div>
              </div>
            </Card>
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
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
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

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Premium Seating</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Individual study booths with power outlets and comfortable ergonomic chairs
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
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

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Study Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  High-speed WiFi, charging stations, and peaceful environment for focused study
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">What Our Students Say</h3>
            <p className="text-lg text-gray-600">Success stories from our community</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, index) => (
                    <Star key={index} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "The Study Hub has transformed my study routine. The peaceful environment and comfortable seating help me focus for hours."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    S{i}
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold">Student {i}</p>
                    <p className="text-sm text-gray-500">Preparing for Competitive Exams</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Affordable Pricing Plans</h3>
            <p className="text-lg text-gray-600">Choose the plan that works best for your schedule</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 border-blue-200 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-blue-600">Day Time</CardTitle>
                <CardDescription>8:00 AM - 10:00 PM</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">₹1,000</div>
                  <div className="text-gray-600">per month</div>
                </div>
                <div className="space-y-2 text-sm">
                  <div>• 3 months: ₹2,800 (Save ₹200)</div>
                  <div>• 6 months: ₹5,200 (Save ₹800)</div>
                  <div>• 12 months: ₹10,000 (Save ₹2,000)</div>
                </div>
                <Button className="w-full" variant="outline">
                  Choose Day Plan
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-purple-600">Night Time</CardTitle>
                <CardDescription>10:00 PM - 6:00 AM</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600">₹1,400</div>
                  <div className="text-gray-600">per month</div>
                </div>
                <div className="space-y-2 text-sm">
                  <div>• 3 months: ₹3,500 (Save ₹700)</div>
                  <div>• Security: ₹1,000 (one-time)</div>
                  <div>• Perfect for working professionals</div>
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Choose Night Plan
                </Button>
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
            <Button size="lg" variant="secondary" className="font-semibold">
              Join The Study Hub Today
              <ArrowRight className="ml-2 h-5 w-5" />
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
