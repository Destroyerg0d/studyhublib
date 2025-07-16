
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

      {/* Enhanced Hero Section with Better Banner */}
      <section className="relative py-40 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-r from-blue-900/95 to-indigo-900/90 absolute z-10"></div>
          <img 
            src="/lovable-uploads/790e5486-9319-4cc0-980b-ce003f3659fc.png" 
            alt="Study environment" 
            className="w-full h-full object-cover object-center"
            style={{ minHeight: '600px' }}
          />
        </div>
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 drop-shadow-2xl leading-tight">
            Your Perfect Study
            <span className="text-yellow-400 block"> Environment</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-100 mb-10 max-w-4xl mx-auto drop-shadow-lg leading-relaxed">
            Experience premium library facilities with flexible timing options, comfortable seating, 
            and a peaceful environment designed for serious students. 36 seats across 2 floors.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-lg px-8 py-4">
                Book Your Seat Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black text-lg px-8 py-4">
              <Play className="mr-2 h-5 w-5" />
              Watch Tour Video
            </Button>
          </div>
        </div>
      </section>

      {/* Image Gallery Slideshow */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-6">Explore Our Facilities</h3>
            <p className="text-xl text-gray-600">Take a virtual tour of our premium study environment</p>
          </div>
          
          <Carousel className="w-full max-w-6xl mx-auto">
            <CarouselContent>
              {galleryImages.map((image, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="relative overflow-hidden rounded-lg">
                      <img 
                        src={image.src} 
                        alt={image.alt}
                        className="w-full h-80 object-cover hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                        <h4 className="text-white font-bold text-lg p-6">{image.title}</h4>
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
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-6">See The Study Hub in Action</h3>
            <p className="text-xl text-gray-600">Watch how our students achieve their academic goals</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="overflow-hidden shadow-xl">
              <div className="relative">
                <iframe 
                  width="100%" 
                  height="350" 
                  src="https://drive.google.com/file/d/1-MdNvuca-knHGp-H9UQ7_GGK9tNMcjHF/preview" 
                  className="rounded-t-lg"
                  allowFullScreen
                ></iframe>
                <div className="p-8">
                  <h4 className="font-bold text-xl mb-3">Virtual Library Tour</h4>
                  <p className="text-gray-600 text-lg">Get an inside look at our state-of-the-art facilities and study environments across both floors.</p>
                </div>
              </div>
            </Card>
            
            <Card className="overflow-hidden shadow-xl">
              <div className="relative h-[350px] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <Play className="h-20 w-20 mx-auto mb-6 opacity-80" />
                  <h4 className="font-bold text-xl mb-3">Student Success Stories</h4>
                  <p className="opacity-90 text-lg">Hear from our successful students about their study experience</p>
                  <Button variant="secondary" className="mt-6 text-lg px-6 py-3">
                    Coming Soon
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h3 className="text-4xl font-bold text-gray-900 mb-6">Why Choose The Study Hub?</h3>
            <p className="text-xl text-gray-600">Premium facilities designed for your success</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-8">
              <CardHeader>
                <Clock className="h-16 w-16 text-blue-600 mx-auto mb-6" />
                <CardTitle className="text-xl">Flexible Timing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg">
                  Multiple shift options: Full Day, Morning, Evening, Night, and 24-hour access
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-8">
              <CardHeader>
                <Users className="h-16 w-16 text-blue-600 mx-auto mb-6" />
                <CardTitle className="text-xl">36 Premium Seats</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg">
                  Individual study booths across 2 floors with power outlets and ergonomic chairs
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-8">
              <CardHeader>
                <Shield className="h-16 w-16 text-blue-600 mx-auto mb-6" />
                <CardTitle className="text-xl">Secure Environment</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg">
                  Verified members only with security measures and peaceful study atmosphere
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-8">
              <CardHeader>
                <BookOpen className="h-16 w-16 text-blue-600 mx-auto mb-6" />
                <CardTitle className="text-xl">Modern Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg">
                  High-speed WiFi, charging stations, canteen service, and AC environment
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h3 className="text-4xl font-bold text-gray-900 mb-6">Current Fees Structure</h3>
            <p className="text-xl text-gray-600">Choose the plan that works best for your schedule</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader className="text-center bg-blue-50">
                <CardTitle className="text-2xl text-blue-600">Full Day</CardTitle>
                <CardDescription className="text-lg">8:00 AM - 10:00 PM</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-600">₹1,000</div>
                  <div className="text-gray-600 text-lg">per month</div>
                </div>
                <ul className="space-y-2 text-lg">
                  <li>✓ 14 hours daily access</li>
                  <li>✓ Dedicated personal seat</li>
                  <li>✓ Power & WiFi included</li>
                </ul>
                <Button className="w-full text-lg py-3" variant="outline">
                  Choose Full Day
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader className="text-center bg-green-50">
                <CardTitle className="text-2xl text-green-600">Half Day Options</CardTitle>
                <CardDescription className="text-lg">Morning or Evening</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="text-center">
                  <div className="text-5xl font-bold text-green-600">₹600</div>
                  <div className="text-gray-600 text-lg">per month</div>
                </div>
                <ul className="space-y-2 text-lg">
                  <li>✓ Morning: 8AM - 3PM</li>
                  <li>✓ Evening: 3PM - 10PM</li>
                  <li>✓ 7 hours daily access</li>
                </ul>
                <Button className="w-full text-lg py-3 bg-green-600 hover:bg-green-700">
                  Choose Half Day
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <CardHeader className="text-center bg-purple-50">
                <CardTitle className="text-2xl text-purple-600">Extended Plans</CardTitle>
                <CardDescription className="text-lg">Night & 24 Hours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">₹1,200</div>
                    <div className="text-gray-600">Night (10PM - 6AM)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">₹2,000</div>
                    <div className="text-gray-600">24 Hours (8AM - 8AM)</div>
                  </div>
                </div>
                <Button className="w-full text-lg py-3 bg-purple-600 hover:bg-purple-700">
                  Choose Extended
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h3 className="text-4xl font-bold text-gray-900 mb-6">What Our Students Say</h3>
            <p className="text-xl text-gray-600">Success stories from our community</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-8 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  {[...Array(5)].map((_, index) => (
                    <Star key={index} className="h-6 w-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 text-lg">
                  "The Study Hub has transformed my study routine. The peaceful environment and comfortable seating help me focus for hours."
                </p>
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    S{i}
                  </div>
                  <div className="ml-4">
                    <p className="font-bold text-lg">Student {i}</p>
                    <p className="text-gray-500">Preparing for Competitive Exams</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-24 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-bold mb-12">Ready to Start Your Study Journey?</h3>
          <div className="flex flex-col sm:flex-row gap-12 justify-center items-center mb-12">
            <a 
              href="https://share.google/khlhKD1hrIFIMYFx4"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-xl hover:text-yellow-300 transition-colors"
            >
              <MapPin className="h-6 w-6 mr-3" />
              <span>Visit Our Location</span>
            </a>
            <div className="flex items-center text-xl">
              <Phone className="h-6 w-6 mr-3" />
              <span>+91 12345 67890</span>
            </div>
            <div className="flex items-center text-xl">
              <Mail className="h-6 w-6 mr-3" />
              <span>info@thestudyhublib.com</span>
            </div>
          </div>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="font-bold text-xl px-10 py-4">
              Join The Study Hub Today
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <BookOpen className="h-8 w-8 mr-3" />
            <span className="text-2xl font-bold">The Study Hub</span>
          </div>
          <p className="text-gray-400 text-lg">© 2024 The Study Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
