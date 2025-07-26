
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, CheckCircle, Sun, Moon, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePayU } from "@/hooks/usePayU";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const PricingSection = () => {
  const { user } = useAuth();
  const { initiatePayment, isLoading } = usePayU();
  const navigate = useNavigate();
  const { toast } = useToast();
  const handlePlanSelect = (plan) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to purchase a plan",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    // Generate a plan ID for payment (you may want to use actual plan IDs from database)
    const planId = `${plan.name.toLowerCase().replace(/\s+/g, '-')}-1month`;
    const amount = parseInt(plan.price.replace('₹', '').replace(',', ''));

    initiatePayment({
      planId,
      amount,
      planName: plan.name,
      onSuccess: () => {
        navigate('/dashboard/fees');
      },
    });
  };

  // Enhanced plan data with icons and better organization
  const fullDayPlan = {
    name: "Full Day Access",
    price: "₹1,000",
    period: "per month",
    description: "6:00 AM - 10:00 PM (16 Hours)",
    icon: Sun,
    color: "from-yellow-400 to-orange-500",
    bgColor: "from-yellow-50 via-orange-50 to-amber-50",
    borderColor: "border-yellow-300",
    features: [
      "Maximum study hours (16/day)",
      "Private study booth",
      "High-speed WiFi & power outlets", 
      "Climate controlled environment",
      "Flexible study schedule",
      "Higher success rate"
    ],
    benefits: [
      "Best value per hour",
      "Perfect for competitive exams",
      "Dedicated learning environment"
    ],
    discounts: [
      "3 months: ₹2,800 (Save ₹200)",
      "6 months: ₹5,200 (Save ₹800)",
      "12 months: ₹10,000 (Save ₹2,000)"
    ],
    savings: "Save up to ₹2,000 yearly!",
    popular: true
  };

  const otherPlans = [
    {
      name: "Morning Shift",
      price: "₹600",
      period: "per month",
      description: "6:00 AM - 3:00 PM",
      icon: Sun,
      color: "border-orange-200",
      bgColor: "bg-orange-50",
      features: [
        "9 hours daily access",
        "Morning focused hours",
        "Individual study booth",
        "WiFi & power outlets"
      ],
      discounts: [
        "3 months: ₹1,700 (Save ₹100)",
        "6 months: ₹3,200 (Save ₹400)"
      ]
    },
    {
      name: "Evening Shift", 
      price: "₹600",
      period: "per month",
      description: "3:00 PM - 10:00 PM",
      icon: Sun,
      color: "border-amber-200",
      bgColor: "bg-amber-50",
      features: [
        "7 hours daily access",
        "Evening focused hours",
        "Individual study booth",
        "WiFi & power outlets"
      ],
      discounts: [
        "3 months: ₹1,700 (Save ₹100)",
        "6 months: ₹3,200 (Save ₹400)"
      ]
    },
    {
      name: "Night Shift",
      price: "₹1,200",
      period: "per month", 
      description: "10:00 PM - 6:00 AM",
      icon: Moon,
      color: "border-blue-200",
      bgColor: "bg-blue-50",
      features: [
        "8 hours night access",
        "Quiet study environment",
        "Individual study booth",
        "WiFi & power outlets"
      ],
      discounts: [
        "3 months: ₹3,500 (Save ₹100)"
      ]
    },
    {
      name: "Full Shift",
      price: "₹2,000", 
      period: "per month",
      description: "24/7 Access",
      icon: Clock,
      color: "border-purple-200",
      bgColor: "bg-purple-50",
      features: [
        "24 hours daily access",
        "Round the clock access",
        "Individual study booth",
        "Premium plan benefits"
      ],
      discounts: [
        "3 months: ₹5,700 (Save ₹300)",
        "6 months: ₹11,000 (Save ₹1,000)"
      ]
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Perfect Study Plan</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Flexible pricing designed for serious students and professionals
          </p>
        </div>
        
        {/* Featured Full Day Plan */}
        <div className="mb-12">
          <Card className={`relative hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 ${fullDayPlan.borderColor} bg-gradient-to-br ${fullDayPlan.bgColor} shadow-xl`}>
            {/* Most Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full text-lg font-bold shadow-lg">
              ⭐ MOST POPULAR - BEST VALUE
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8 p-8">
              {/* Plan Details */}
              <div className="lg:col-span-1">
                <div className="flex items-center space-x-4 mb-6">
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${fullDayPlan.color} shadow-lg`}>
                    <fullDayPlan.icon className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold text-gray-900">{fullDayPlan.name}</CardTitle>
                    <CardDescription className="text-lg font-medium text-gray-700">{fullDayPlan.description}</CardDescription>
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-5xl font-bold text-gray-900">{fullDayPlan.price}</div>
                  <div className="text-xl text-gray-600">{fullDayPlan.period}</div>
                  <div className="text-lg text-green-600 font-bold mt-2">{fullDayPlan.savings}</div>
                </div>
              </div>

              {/* Features */}
              <div className="lg:col-span-1">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">✨ Premium Features</h4>
                <div className="space-y-3">
                  {fullDayPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <h4 className="text-xl font-semibold text-gray-900 mb-3 mt-6">🎯 Perfect For</h4>
                <div className="space-y-2">
                  {fullDayPlan.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing & CTA */}
              <div className="lg:col-span-1">
                <div className="bg-white/80 backdrop-blur rounded-xl p-6 border border-white/20">
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">💰 Savings Options</h4>
                  <div className="space-y-3 mb-6">
                    {fullDayPlan.discounts.map((discount, index) => (
                      <div key={index} className="text-sm text-gray-700 bg-green-50 p-2 rounded-lg">
                        • {discount}
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full text-lg py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    onClick={() => handlePlanSelect(fullDayPlan)}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : `Choose ${fullDayPlan.name}`}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Other Plans */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Other Available Plans</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {otherPlans.map((plan) => {
              const Icon = plan.icon;
              return (
                <Card 
                  key={plan.name} 
                  className={`relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${plan.color} ${plan.bgColor}`}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="flex items-center justify-center mb-4">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-gray-400 to-gray-600">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-sm">{plan.description}</CardDescription>
                    <div className="mt-4">
                      <div className="text-3xl font-bold text-gray-900">{plan.price}</div>
                      <div className="text-gray-600">{plan.period}</div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-sm mb-2">Discounts:</h4>
                      {plan.discounts.map((discount, index) => (
                        <div key={index} className="text-xs text-gray-600 mb-1">
                          • {discount}
                        </div>
                      ))}
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      variant="outline"
                      onClick={() => handlePlanSelect(plan)}
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : `Choose ${plan.name}`}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
