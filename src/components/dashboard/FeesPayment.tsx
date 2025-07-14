
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard,
  Calendar,
  IndianRupee,
  CheckCircle,
  Clock,
  Sun,
  Moon,
  AlertCircle,
} from "lucide-react";

const FeesPayment = () => {
  const [selectedPlan, setSelectedPlan] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const dayTimePlans = [
    { id: "day-1", duration: "1 Month", price: 1000, popular: false },
    { id: "day-3", duration: "3 Months", price: 2800, popular: true, savings: 200 },
    { id: "day-6", duration: "6 Months", price: 5200, popular: false, savings: 800 },
    { id: "day-12", duration: "12 Months", price: 10000, popular: false, savings: 2000 },
  ];

  const nightTimePlans = [
    { id: "night-1", duration: "1 Month", price: 1400, popular: false },
    { id: "night-3", duration: "3 Months", price: 3500, popular: true, savings: 700 },
  ];

  const paymentHistory = [
    {
      date: "Dec 1, 2024",
      amount: 1000,
      plan: "Day Time - 1 Month",
      status: "paid",
      method: "UPI",
    },
    {
      date: "Nov 1, 2024",
      amount: 1000,
      plan: "Day Time - 1 Month",
      status: "paid",
      method: "Card",
    },
    {
      date: "Jan 1, 2025",
      amount: 1000,
      plan: "Day Time - 1 Month",
      status: "pending",
      method: "UPI",
    },
  ];

  const handlePayment = async () => {
    if (!selectedPlan) {
      toast({
        title: "Please select a plan",
        description: "Choose a payment plan to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Payment Successful!",
        description: "Your membership has been updated successfully.",
      });
      setSelectedPlan("");
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <CardTitle className="text-green-900">Membership Active</CardTitle>
                <CardDescription className="text-green-700">
                  Your day time membership is active until Jan 31, 2025
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-green-500 text-white">Active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-900">₹1,000</p>
              <p className="text-sm text-green-700">Current Plan</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-900">29</p>
              <p className="text-sm text-green-700">Days Remaining</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-900">Day</p>
              <p className="text-sm text-green-700">Time Slot</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="new-payment" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new-payment">New Payment</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="new-payment" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Day Time Plans */}
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Sun className="h-5 w-5 text-yellow-600 mr-2" />
                  <CardTitle>Day Time Plans</CardTitle>
                </div>
                <CardDescription>8:00 AM - 10:00 PM</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                  <div className="space-y-3">
                    {dayTimePlans.map((plan) => (
                      <div key={plan.id} className="relative">
                        <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value={plan.id} id={plan.id} />
                          <Label htmlFor={plan.id} className="flex-1 cursor-pointer">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{plan.duration}</p>
                                {plan.savings && (
                                  <p className="text-sm text-green-600">
                                    Save ₹{plan.savings}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold">₹{plan.price}</p>
                                <p className="text-sm text-gray-500">
                                  ₹{Math.round(plan.price / parseInt(plan.duration))}/month
                                </p>
                              </div>
                            </div>
                          </Label>
                        </div>
                        {plan.popular && (
                          <Badge className="absolute -top-2 -right-2 bg-blue-500">
                            Popular
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Night Time Plans */}
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Moon className="h-5 w-5 text-blue-600 mr-2" />
                  <CardTitle>Night Time Plans</CardTitle>
                </div>
                <CardDescription>10:00 PM - 6:00 AM (Security deposit required)</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                  <div className="space-y-3">
                    {nightTimePlans.map((plan) => (
                      <div key={plan.id} className="relative">
                        <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value={plan.id} id={plan.id} />
                          <Label htmlFor={plan.id} className="flex-1 cursor-pointer">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{plan.duration}</p>
                                {plan.savings && (
                                  <p className="text-sm text-green-600">
                                    Save ₹{plan.savings}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold">₹{plan.price}</p>
                                <p className="text-sm text-gray-500">
                                  ₹{Math.round(plan.price / parseInt(plan.duration))}/month
                                </p>
                              </div>
                            </div>
                          </Label>
                        </div>
                        {plan.popular && (
                          <Badge className="absolute -top-2 -right-2 bg-purple-500">
                            Popular
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </RadioGroup>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Security Deposit: ₹1,000</p>
                      <p>One-time refundable deposit for night time access</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Section */}
          {selectedPlan && (
            <Card>
              <CardHeader>
                <CardTitle>Complete Payment</CardTitle>
                <CardDescription>
                  Selected: {
                    [...dayTimePlans, ...nightTimePlans]
                      .find(p => p.id === selectedPlan)?.duration
                  } - ₹{
                    [...dayTimePlans, ...nightTimePlans]
                      .find(p => p.id === selectedPlan)?.price
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span>Plan Amount</span>
                    <span className="font-semibold">
                      ₹{[...dayTimePlans, ...nightTimePlans].find(p => p.id === selectedPlan)?.price}
                    </span>
                  </div>
                  
                  {selectedPlan.startsWith('night') && (
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <span>Security Deposit</span>
                      <span className="font-semibold">₹1,000</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <span className="font-semibold">Total Amount</span>
                    <span className="text-xl font-bold text-green-700">
                      ₹{
                        ([...dayTimePlans, ...nightTimePlans].find(p => p.id === selectedPlan)?.price || 0) +
                        (selectedPlan.startsWith('night') ? 1000 : 0)
                      }
                    </span>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {isProcessing ? "Processing..." : "Pay Now"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Your recent transactions and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentHistory.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <IndianRupee className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium">{payment.plan}</p>
                        <p className="text-sm text-gray-600">
                          {payment.date} • {payment.method}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{payment.amount}</p>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeesPayment;
