
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const PricingSection = () => {
  const plans = [
    {
      name: "Full Day",
      price: "₹1,000",
      period: "per month",
      description: "8:00 AM - 10:00 PM",
      features: [
        "14 hours daily access",
        "Individual study booth",
        "WiFi & power outlets",
        "Peaceful environment",
        "Security deposit: ₹500"
      ],
      discounts: [
        "3 months: ₹2,800 (Save ₹200)",
        "6 months: ₹5,200 (Save ₹800)",
        "12 months: ₹10,000 (Save ₹2,000)"
      ],
      popular: true,
      color: "border-blue-500"
    },
    {
      name: "Half Day Morning",
      price: "₹600",
      period: "per month",
      description: "8:00 AM - 3:00 PM",
      features: [
        "7 hours daily access",
        "Morning focused hours",
        "Individual study booth",
        "WiFi & power outlets",
        "Perfect for early birds"
      ],
      discounts: [
        "3 months: ₹1,700 (Save ₹100)",
        "6 months: ₹3,200 (Save ₹400)"
      ],
      popular: false,
      color: "border-green-500"
    },
    {
      name: "Half Day Evening",
      price: "₹600",
      period: "per month",
      description: "3:00 PM - 10:00 PM",
      features: [
        "7 hours daily access",
        "Evening focused hours",
        "Individual study booth",
        "WiFi & power outlets",
        "Great for working professionals"
      ],
      discounts: [
        "3 months: ₹1,700 (Save ₹100)",
        "6 months: ₹3,200 (Save ₹400)"
      ],
      popular: false,
      color: "border-orange-500"
    },
    {
      name: "Night Shift",
      price: "₹1,200",
      period: "per month",
      description: "10:00 PM - 6:00 AM",
      features: [
        "8 hours night access",
        "Quiet study environment",
        "Individual study booth",
        "WiFi & power outlets",
        "Perfect for night owls"
      ],
      discounts: [
        "3 months: ₹3,500 (Save ₹100)",
        "Security: ₹1,000 (one-time)"
      ],
      popular: false,
      color: "border-purple-500"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Flexible Pricing Plans</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that works best for your schedule and budget
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${plan.color} ${plan.popular ? 'border-2 scale-105' : 'border'}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-lg">{plan.description}</CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-bold text-gray-900">{plan.price}</div>
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
                  <h4 className="font-semibold text-sm mb-2">Discounts Available:</h4>
                  {plan.discounts.map((discount, index) => (
                    <div key={index} className="text-xs text-gray-600 mb-1">
                      • {discount}
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant={plan.popular ? "default" : "outline"}>
                  Choose {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
