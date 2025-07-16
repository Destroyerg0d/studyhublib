import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  Play, 
  Users, 
  Clock, 
  Shield, 
  Wifi, 
  Coffee, 
  Star,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Utensils,
  Book,
  GraduationCap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [plans, setPlans] = useState([]);
  const [seats, setSeats] = useState([]);
  const [timetableSlots, setTimetableSlots] = useState([]);

  const images = [
    "/lovable-uploads/b82a01cd-18b1-4292-b3f9-ada86c446819.png",
    "/lovable-uploads/fb88974f-8904-47f4-88b9-99a4ead397dc.png",
    "/lovable-uploads/28736efb-5531-412f-a862-33a18c0718c1.png",
    "/lovable-uploads/0f9729a5-880d-4da7-af99-e2578732fc6b.png",
    "/lovable-uploads/0b708e45-fd8b-40b5-a870-69e66123e70c.png",
    "/lovable-uploads/71d328ef-fd14-426c-976f-254e3d033b7d.png",
    "/lovable-uploads/607f8b56-97ae-4f18-ae19-6fd686fd3cdd.png"
  ];

  // Fetch real data from database
  useEffect(() => {
    const fetchData = async () => {
      // Fetch plans
      const { data: plansData } = await supabase
        .from('plans')
        .select('*')
        .eq('active', true)
        .order('price');
      
      if (plansData) setPlans(plansData);

      // Fetch seats
      const { data: seatsData } = await supabase
        .from('seats')
        .select('*')
        .order('row_letter, seat_number');
      
      if (seatsData) setSeats(seatsData);

      // Fetch timetable slots
      const { data: slotsData } = await supabase
        .from('timetable_slots')
        .select('*')
        .eq('active', true)
        .order('time');
      
      if (slotsData) setTimetableSlots(slotsData);
    };

    fetchData();

    // Set up real-time subscriptions
    const plansSubscription = supabase
      .channel('plans-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'plans' }, fetchData)
      .subscribe();

    const seatsSubscription = supabase
      .channel('seats-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seats' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(plansSubscription);
      supabase.removeChannel(seatsSubscription);
    };
  }, []);

  // Auto-rotate slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(timer);
  }, [images.length]);

  const nextImage = () => {
    setCurrentImageIndex(currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1);
  };

  const prevImage = () => {
    setCurrentImageIndex(currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1);
  };

  const availableSeats = seats.filter(seat => seat.status === 'available').length;
  const occupiedSeats = seats.filter(seat => seat.status === 'occupied').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">The Study Hub</h1>
                <p className="text-sm text-gray-600">Premium Learning Environment</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium">Features</a>
              <a href="#gallery" className="text-gray-700 hover:text-blue-600 font-medium">Gallery</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 font-medium">Pricing</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium">Contact</a>
            </nav>
            <Link to="/auth">
              <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
            </Link>
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
              <span className="text-blue-400 drop-shadow-2xl"> Environment</span>
            </h2>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white/95 animate-fade-in drop-shadow-lg font-medium">
              Experience premium library facilities with 24/7 access, comfortable wooden seating, 
              and a peaceful environment designed for serious students.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Link to="/auth">
                <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg px-8 py-4 shadow-xl">
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

      {/* Real-time Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">{seats.length}</div>
              <div className="text-gray-600">Total Seats</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-green-600 mb-2">{availableSeats}</div>
              <div className="text-gray-600">Available Now</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">{occupiedSeats}</div>
              <div className="text-gray-600">Currently Occupied</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">Access Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery with Slideshow */}
      <section id="gallery" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Experience Our Space</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Take a virtual tour of our premium study facilities designed for your success
            </p>
          </div>

          {/* Main Slideshow */}
          <div className="relative max-w-4xl mx-auto mb-12">
            <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={images[currentImageIndex]} 
                alt={`Study Hub ${currentImageIndex + 1}`}
                className="w-full h-full object-cover transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              
              {/* Navigation Arrows */}
              <button 
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 transition-all duration-200"
              >
                <ChevronLeft className="h-6 w-6 text-gray-800" />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 transition-all duration-200"
              >
                <ChevronRight className="h-6 w-6 text-gray-800" />
              </button>
              
              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Thumbnail Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {images.map((image, index) => (
              <div 
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`relative h-24 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                  index === currentImageIndex ? 'ring-4 ring-blue-500 scale-105' : 'hover:scale-105'
                }`}
              >
                <img 
                  src={image} 
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Premium Features</h2>
            <p className="text-xl text-gray-600">Everything you need for productive studying</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>24/7 Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Study at your own pace with round-the-clock access to our facilities.</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Wifi className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>High-Speed WiFi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Lightning-fast internet connectivity for all your research needs.</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Secure Environment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">CCTV monitoring and secure access ensure your safety and belongings.</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Utensils className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Refreshment Area</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Order refreshments online with your seat number and get delivery directly to your seat.</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Join a community of serious students and motivated learners.</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <GraduationCap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Study Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Students bring their own study materials and focus on independent learning in our peaceful environment.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* New Refreshment Area Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Online Refreshment Ordering</h2>
            <p className="text-xl text-gray-600">Order food and beverages online and get them delivered directly to your seat</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <ShoppingCart className="h-8 w-8 mr-3 text-blue-600" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                      <span className="text-blue-600 font-bold text-lg">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Browse Menu Online</h4>
                      <p className="text-gray-600">Access our digital menu from your dashboard or mobile app</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                      <span className="text-blue-600 font-bold text-lg">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Enter Your Seat Number</h4>
                      <p className="text-gray-600">Specify your exact seat location for accurate delivery</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                      <span className="text-blue-600 font-bold text-lg">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Place Your Order</h4>
                      <p className="text-gray-600">Select items, customize your order, and make payment online</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                      <span className="text-blue-600 font-bold text-lg">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">Enjoy Seat Delivery</h4>
                      <p className="text-gray-600">Receive your order directly at your seat without interrupting your study</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Coffee className="h-8 w-8 mr-3 text-blue-600" />
                  Available Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-3">🥤 Beverages</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Fresh Coffee & Tea</li>
                      <li>• Cold Drinks & Juices</li>
                      <li>• Energy Drinks</li>
                      <li>• Fresh Lime Water</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-3">🍽️ Snacks & Meals</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Sandwiches & Wraps</li>
                      <li>• Light Meals & Combos</li>
                      <li>• Biscuits & Namkeen</li>
                      <li>• Fresh Fruits</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">Student-friendly pricing</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">Quick 15-minute delivery</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link to="/auth">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4">
                Start Ordering Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* New Study Resources Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Independent Study Environment</h2>
            <p className="text-xl text-gray-600">Focused learning space where students bring their own materials and study independently</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="text-center shadow-lg">
              <CardHeader>
                <Book className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-xl">Bring Your Own Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Students come prepared with their own books, notes, laptops, and study materials for focused independent learning.</p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg">
              <CardHeader>
                <Users className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-xl">Self-Directed Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Our environment supports independent study where students can focus on their own curriculum and learning goals.</p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg">
              <CardHeader>
                <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-xl">Distraction-Free Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Quiet, peaceful environment designed to minimize distractions and maximize concentration for serious students.</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16">
            <Card className="max-w-4xl mx-auto shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">What Students Typically Bring</CardTitle>
                <CardDescription>Common study materials students use in our facility</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-4 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Study Materials
                    </h4>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Textbooks and reference books</li>
                      <li>• Personal notebooks and journals</li>
                      <li>• Printed notes and handouts</li>
                      <li>• Practice test papers</li>
                      <li>• Highlighters and stationery</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-4 flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Digital Resources
                    </h4>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Personal laptops and tablets</li>
                      <li>• Online course materials</li>
                      <li>• Digital study apps</li>
                      <li>• E-books and PDFs</li>
                      <li>• Noise-cancelling headphones</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-3">Why Independent Study Works</h4>
                  <p className="text-blue-800">
                    Our facility provides the perfect environment for self-directed learning. Students have the freedom to study at their own pace, 
                    use their preferred materials, and follow their personal study schedules while being surrounded by like-minded, focused learners.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section - Connected to Real Data */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
            <p className="text-xl text-gray-600">Flexible options to suit your study schedule</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card key={plan.id} className="relative hover:shadow-xl transition-shadow">
                {plan.type === '24/7' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold text-blue-600 my-4">
                    ₹{plan.price}
                    <span className="text-lg font-normal text-gray-500">/{plan.duration_months}mo</span>
                  </div>
                  <CardDescription>
                    {plan.type === 'day' && '8 AM - 10 PM Access'}
                    {plan.type === 'night' && '10 PM - 6 AM Access'}
                    {plan.type === '24/7' && '24/7 Unlimited Access'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features?.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Choose Plan
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timetable Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Operating Hours</h2>
            <p className="text-xl text-gray-600">Our schedule to help you plan your study time</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-4 h-4 bg-blue-400 rounded-full mr-3"></div>
                  Day Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {timetableSlots
                    .filter(slot => slot.type === 'day')
                    .map((slot) => (
                      <div key={slot.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <div className="font-medium">{slot.name}</div>
                          <div className="text-sm text-gray-500">{slot.description}</div>
                        </div>
                        <Badge variant="outline">{slot.time}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-4 h-4 bg-indigo-400 rounded-full mr-3"></div>
                  Night Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {timetableSlots
                    .filter(slot => slot.type === 'night')
                    .map((slot) => (
                      <div key={slot.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div>
                          <div className="font-medium">{slot.name}</div>
                          <div className="text-sm text-gray-500">{slot.description}</div>
                        </div>
                        <Badge variant="outline">{slot.time}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Students Say</h2>
            <p className="text-xl text-gray-600">Hear from our successful students</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "The best study environment I've ever experienced. The 24/7 access helped me prepare for my competitive exams efficiently."
                </p>
                <div className="font-semibold">Rahul Kumar</div>
                <div className="text-sm text-gray-500">JEE Aspirant</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "Clean, quiet, and professionally managed. The wooden furniture and peaceful environment make studying a pleasure."
                </p>
                <div className="font-semibold">Priya Sharma</div>
                <div className="text-sm text-gray-500">CA Student</div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "Great community of serious students. The high-speed internet and comfortable seating are perfect for long study sessions."
                </p>
                <div className="font-semibold">Amit Singh</div>
                <div className="text-sm text-gray-500">UPSC Aspirant</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get In Touch</h2>
            <p className="text-xl text-gray-600">Visit us or contact us for any queries</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 text-blue-600 mr-4 mt-1" />
                  <div>
                    <div className="font-semibold">Address</div>
                    <div className="text-gray-600">123 Study Street, Education District<br />Bangalore, Karnataka 560001</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-6 w-6 text-blue-600 mr-4" />
                  <div>
                    <div className="font-semibold">Phone</div>
                    <div className="text-gray-600">+91 9876543210</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-6 w-6 text-blue-600 mr-4" />
                  <div>
                    <div className="font-semibold">Email</div>
                    <div className="text-gray-600">info@thestudyhub.com</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Visit Us</h3>
              <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-2" />
                  <p>Interactive map coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-xl font-bold">The Study Hub</h3>
                  <p className="text-sm text-gray-400">Premium Learning Environment</p>
                </div>
              </div>
              <p className="text-gray-400">
                Empowering students with the perfect study environment since 2020.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#gallery" className="hover:text-white">Gallery</a></li>
                <li><a href="#contact" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Day Study Plans</li>
                <li>Night Study Plans</li>
                <li>24/7 Access</li>
                <li>Group Study Rooms</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li>+91 9876543210</li>
                <li>info@thestudyhub.com</li>
                <li>Follow us on social media</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 The Study Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
