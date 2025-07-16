
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, Users, Shield, MapPin, Phone, Mail, Play, Star, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Index = () => {
  const studyHubImages = [
    "/lovable-uploads/71d328ef-fd14-426c-976f-254e3d033b7d.png",
    "/lovable-uploads/607f8b56-97ae-4f18-ae19-6fd686fd3cdd.png",
    "/lovable-uploads/b82a01cd-18b1-4292-b3f9-ada86c446819.png",
    "/lovable-uploads/fb88974f-8904-47f4-88b9-99a4ead397dc.png",
    "/lovable-uploads/28736efb-5531-412f-a862-33a18c0718c1.png",
    "/lovable-uploads/0f9729a5-880d-4da7-af99-e2578732fc6b.png",
    "/lovable-uploads/0b708e45-fd8b-40b5-a870-69e66123e70c.png"
  ];

  const testimonials = [
    {
      name: "Arjun Kumar",
      role: "CA Student",
      content: "The Study Hub provides the perfect environment for focused studying. The wooden desks and comfortable seating make long study sessions productive.",
      rating: 5
    },
    {
      name: "Priya Sharma", 
      role: "Engineering Student",
      content: "24/7 access is a game-changer for me. The modern facilities and peaceful atmosphere help me stay motivated throughout my preparation.",
      rating: 5
    },
    {
      name: "Rohit Patel",
      role: "Medical Student", 
      content: "Best study library in the area! Clean, well-maintained, and the individual seating arrangement ensures no distractions.",
      rating: 5
    }
  ];

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
            <div className="flex gap-4">
              <Button variant="outline" className="hidden sm:inline-flex">
                Learn More
              </Button>
              <Link to="/auth">
                <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Video Background - Made Taller */}
      <section className="relative py-32 md:py-40 lg:py-48 overflow-hidden min-h-[70vh]">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
        <div className="absolute inset-0">
          <video 
            autoPlay 
            muted 
            loop 
            className="w-full h-full object-cover"
            poster="/lovable-uploads/b82a01cd-18b1-4292-b3f9-ada86c446819.png"
          >
            <source src="https://drive.google.com/uc?export=download&id=1-MdNvuca-knHGp-H9UQ7_GGK9tNMcjHF" type="video/mp4" />
          </video>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white h-full flex flex-col justify-center">
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-white/10">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in text-white drop-shadow-2xl">
              Your Perfect Study
              <span className="text-yellow-400 drop-shadow-2xl"> Environment</span>
            </h2>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white/95 animate-fade-in drop-shadow-lg font-medium">
              Experience premium library facilities with 24/7 access, comfortable wooden seating, 
              and a peaceful environment designed for serious students.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Link to="/auth">
                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-lg px-8 py-4 shadow-xl">
                  Book Your Seat Today
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-black font-semibold text-lg px-8 py-4 shadow-xl">
                <Play className="mr-2 h-5 w-5" />
                Watch Tour
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery Slideshow */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Experience Our Premium Facilities</h3>
            <p className="text-lg text-gray-600">Take a virtual tour of our modern study environment</p>
          </div>
          
          <Carousel className="w-full max-w-4xl mx-auto">
            <CarouselContent>
              {studyHubImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-0">
                        <div className="relative aspect-video overflow-hidden rounded-lg">
                          <img
                            src={image}
                            alt={`Study Hub Interior ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                          <div className="absolute bottom-4 left-4 text-white">
                            <h4 className="text-lg font-semibold">Modern Study Environment</h4>
                            <p className="text-sm opacity-90">Premium wooden desks & comfortable seating</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose The Study Hub?</h3>
            <p className="text-lg text-gray-600">Premium facilities designed for your success</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow border-0 bg-white">
              <CardHeader>
                <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-xl">24/7 Access</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Day timing (8AM-10PM) and Night timing (10PM-6AM) options available for your convenience
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-0 bg-white">
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-xl">Premium Seating</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Individual wooden desks with comfortable ergonomic chairs for optimal study posture
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-0 bg-white">
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-xl">Secure Environment</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Verified members only with biometric access and security deposit for peace of mind
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-0 bg-white">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-xl">Study Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Modern amenities including fans, power outlets, and upcoming canteen & stationery store
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">What Our Students Say</h3>
            <p className="text-lg text-gray-600">Hear from our successful members</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
            <Card className="border-2 border-blue-200 hover:shadow-xl transition-shadow bg-white">
              <CardHeader className="text-center bg-blue-50">
                <CardTitle className="text-2xl text-blue-600">Day Time</CardTitle>
                <CardDescription className="text-lg">8:00 AM - 10:00 PM</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">₹1,000</div>
                  <div className="text-gray-600">per month</div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>3 months: ₹2,800 (Save ₹200)</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>6 months: ₹5,200 (Save ₹800)</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>12 months: ₹10,000 (Save ₹2,000)</span>
                  </div>
                </div>
                <Link to="/auth" className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Choose Day Plan</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 hover:shadow-xl transition-shadow bg-white relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">Popular</span>
              </div>
              <CardHeader className="text-center bg-purple-50">
                <CardTitle className="text-2xl text-purple-600">Night Time</CardTitle>
                <CardDescription className="text-lg">10:00 PM - 6:00 AM</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600">₹1,400</div>
                  <div className="text-gray-600">per month</div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>3 months: ₹3,500 (Save ₹700)</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Security: ₹1,000 (one-time)</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span>Perfect for night owls</span>
                  </div>
                </div>
                <Link to="/auth" className="block">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">Choose Night Plan</Button>
                </Link>
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
            <div className="flex items-center hover:scale-105 transition-transform">
              <MapPin className="h-5 w-5 mr-2" />
              <span>thestudyhublib.com</span>
            </div>
            <div className="flex items-center hover:scale-105 transition-transform">
              <Phone className="h-5 w-5 mr-2" />
              <span>+91 12345 67890</span>
            </div>
            <div className="flex items-center hover:scale-105 transition-transform">
              <Mail className="h-5 w-5 mr-2" />
              <span>info@thestudyhublib.com</span>
            </div>
          </div>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="hover:scale-105 transition-transform">
              Join The Study Hub Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center mb-4">
                <BookOpen className="h-6 w-6 mr-2" />
                <span className="text-lg font-semibold">The Study Hub</span>
              </div>
              <p className="text-gray-400 mb-4">
                Premium library experience with modern facilities, comfortable seating, 
                and a peaceful environment for focused studying.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/auth" className="hover:text-white transition-colors">Get Started</Link></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Timings</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Day: 8:00 AM - 10:00 PM</li>
                <li>Night: 10:00 PM - 6:00 AM</li>
                <li>24/7 Access Available</li>
              </ul>
            </div>
          </div>
          <hr className="border-gray-800 my-8" />
          <div className="text-center text-gray-400">
            <p>© 2024 The Study Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
