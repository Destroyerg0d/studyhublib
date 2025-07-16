
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

  const morningEveningPlans = [
    { id: "morning-1", name: "Half Day Morning", duration: "1 Month", price: 600, time: "8:00 AM - 3:00 PM", popular: false },
    { id: "evening-1", name: "Half Day Evening", duration: "1 Month", price: 600, time: "3:00 PM - 10:00 PM", popular: false },
    { id: "morning-3", name: "Half Day Morning", duration: "3 Months", price: 1700, time: "8:00 AM - 3:00 PM", popular: false, savings: 100 },
    { id: "evening-3", name: "Half Day Evening", duration: "3 Months", price: 1700, time: "3:00 PM - 10:00 PM", popular: false, savings: 100 },
  ];

  const fullDayPlans = [
    { id: "full-1", name: "Full Day", duration: "1 Month", price: 1000, time: "8:00 AM - 10:00 PM", popular: true },
    { id: "full-3", name: "Full Day", duration: "3 Months", price: 2800, time: "8:00 AM - 10:00 PM", popular: false, savings: 200 },
    { id: "full-6", name: "Full Day", duration: "6 Months", price: 5200, time: "8:00 AM - 10:00 PM", popular: false, savings: 800 },
    { id: "full-12", name: "Full Day", duration: "12 Months", price: 10000, time: "8:00 AM - 10:00 PM", popular: false, savings: 2000 },
  ];

  const specialPlans = [
    { id: "night-1", name: "Night Shift", duration: "1 Month", price: 1200, time: "10:00 PM - 6:00 AM", popular: false },
    { id: "24hr-1", name: "24 Hours Plan", duration: "1 Month", price: 2000, time: "8:00 AM - 8:00 AM", popular: false },
  ];

  const paymentHistory = [
    {
      date: "Dec 1, 2024",
      amount: 1000,
      plan: "Full Day - 1 Month",
      status: "paid",
      method: "UPI",
    },
    {
      date: "Nov 1, 2024",
      amount: 1000,
      plan: "Full Day - 1 Month",
      status: "paid",
      method: "Card",
    },
    {
      date: "Jan 1, 2025",
      amount: 1000,
      plan: "Full Day - 1 Month",
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

  const getAllPlans = () => [...morningEveningPlans, ...fullDayPlans, ...specialPlans];

  const renderPlanCard = (plan) => (
    <div key={plan.id} className="relative">
      <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
        <RadioGroupItem value={plan.id} id={plan.id} />
        <Label htmlFor={plan.id} className="flex-1 cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{plan.name}</p>
              <p className="text-sm text-gray-600">{plan.time}</p>
              <p className="text-sm text-blue-600">{plan.duration}</p>
              {plan.savings && (
                <p className="text-sm text-green-600">Save ₹{plan.savings}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">₹{plan.price}</p>
              <p className="text-sm text-gray-500">
                ₹{Math.round(plan.price / (parseInt(plan.duration) || 1))}/month
              </p>
            </div>
          </div>
        </Label>
      </div>
      {plan.popular && (
        <Badge className="absolute -top-2 -right-2 bg-blue-500">Popular</Badge>
      )}
    </div>
  );

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
                  Your full day membership is active until Jan 31, 2025
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
              <p className="text-2xl font-bold text-green-900">Full Day</p>
              <p className="text-sm text-green-700">8AM - 10PM</p>
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
          <div className="grid lg:grid-cols-1 gap-6">
            {/* All Plans in One Section */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Plan</CardTitle>
                <CardDescription>Select the plan that best fits your study schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                  <div className="space-y-6">
                    {/* Morning & Evening Plans */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center">
                        <Sun className="h-5 w-5 text-yellow-600 mr-2" />
                        Half Day Plans
                      </h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {morningEveningPlans.map(renderPlanCard)}
                      </div>
                    </div>

                    {/* Full Day Plans */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center">
                        <Clock className="h-5 w-5 text-blue-600 mr-2" />
                        Full Day Plans
                      </h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {fullDayPlans.map(renderPlanCard)}
                      </div>
                    </div>

                    {/* Special Plans */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center">
                        <Moon className="h-5 w-5 text-purple-600 mr-2" />
                        Special Plans
                      </h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {specialPlans.map(renderPlanCard)}
                      </div>
                    </div>
                  </div>
                </RadioGroup>

                {/* Information Cards */}
                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Night Shift Info</p>
                        <p>Security deposit: ₹1,000 (One-time refundable)</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                      <div className="text-sm text-green-800">
                        <p className="font-medium">Full Shift Option Available</p>
                        <p>Morning + Evening = 2 people can share 1 seat</p>
                      </div>
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
                    getAllPlans().find(p => p.id === selectedPlan)?.name
                  } - {
                    getAllPlans().find(p => p.id === selectedPlan)?.duration
                  } - ₹{
                    getAllPlans().find(p => p.id === selectedPlan)?.price
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span>Plan Amount</span>
                    <span className="font-semibold">
                      ₹{getAllPlans().find(p => p.id === selectedPlan)?.price}
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
                        (getAllPlans().find(p => p.id === selectedPlan)?.price || 0) +
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
