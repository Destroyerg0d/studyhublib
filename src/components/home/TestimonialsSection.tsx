
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Priya Sharma",
      role: "UPSC Aspirant",
      content: "The Study Hub has transformed my preparation. The peaceful environment and 24/7 access helped me maintain consistent study schedule. The individual booths are perfect for focused reading.",
      rating: 5,
      avatar: "PS"
    },
    {
      name: "Arjun Patel",
      role: "Engineering Student",
      content: "Best library in the area! The WiFi is super fast, power outlets at every seat, and the night shift option is perfect for my schedule. Highly recommend for serious students.",
      rating: 5,
      avatar: "AP"
    },
    {
      name: "Sneha Gupta",
      role: "CA Finalist",
      content: "I've been a member for 8 months now. The study environment is excellent, staff is helpful, and the pricing is very reasonable. The security deposit system ensures serious members only.",
      rating: 5,
      avatar: "SG"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Students Say</h2>
          <p className="text-xl text-gray-600">Success stories from our community</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Quote className="h-8 w-8 text-blue-500 mr-2" />
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
