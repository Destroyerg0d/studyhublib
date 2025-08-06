
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users, Shield, BookOpen, Wifi, Coffee, GraduationCap } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Clock,
      title: "24/7 Access",
      description: "Day timing (8AM-10PM) and Night timing (10PM-6AM) options available",
      color: "text-blue-600"
    },
    {
      icon: Users,
      title: "Premium Seating",
      description: "Individual study booths with power outlets and comfortable ergonomic chairs",
      color: "text-green-600"
    },
    {
      icon: Shield,
      title: "Secure Environment",
      description: "Verified members only with biometric access and security deposit",
      color: "text-purple-600"
    },
    {
      icon: BookOpen,
      title: "Study Resources",
      description: "High-speed WiFi, charging stations, and peaceful environment for focused study",
      color: "text-orange-600"
    },
    {
      icon: Wifi,
      title: "High-Speed Internet",
      description: "Reliable WiFi connection throughout the library for research and online studies",
      color: "text-cyan-600"
    },
    {
      icon: Coffee,
      title: "Refreshments",
      description: "On-site canteen with beverages and snacks to keep you energized",
      color: "text-red-600"
    },
    {
      icon: GraduationCap,
      title: "Home Tuition",
      description: "Professional male and female tutors available for all classes. Contact: 8595300308",
      color: "text-emerald-600"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose The Study Hub?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Premium facilities designed for your success with modern amenities and a focused environment
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.title} 
                className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className={`mx-auto mb-4 p-3 rounded-full bg-gray-50 w-fit`}>
                    <Icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
