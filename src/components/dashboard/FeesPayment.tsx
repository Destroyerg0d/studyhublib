
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRazorpay } from "@/hooks/useRazorpay";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
  const [plans, setPlans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const { toast } = useToast();
  const { initiatePayment, isLoading } = useRazorpay();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch plans
      const { data: plansData } = await supabase
        .from('plans')
        .select('*')
        .eq('active', true)
        .order('duration_months');

      if (plansData) {
        setPlans(plansData);
      }

      // Fetch current subscription
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('*, plans(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (subscriptionData) {
        setCurrentSubscription(subscriptionData);
      }

      // Fetch payment history
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*, plans(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (paymentsData) {
        setPayments(paymentsData);
      }
    };

    fetchData();
  }, [user]);

  const dayTimePlans = plans.filter(plan => plan.type === 'day');
  const nightTimePlans = plans.filter(plan => plan.type === 'night');
  const fullTimePlans = plans.filter(plan => plan.type === '24/7');

  const handlePayment = async () => {
    if (!selectedPlan) {
      toast({
        title: "Please select a plan",
        description: "Choose a payment plan to continue.",
        variant: "destructive",
      });
      return;
    }

    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return;

    await initiatePayment({
      planId: plan.id,
      amount: plan.price,
      planName: plan.name,
      onSuccess: () => {
        setSelectedPlan("");
        // Refresh data
        window.location.reload();
      },
      onError: (error) => {
        console.error('Payment error:', error);
      },
    });
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
      {currentSubscription ? (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <CardTitle className="text-green-900">Membership Active</CardTitle>
                  <CardDescription className="text-green-700">
                    Your {currentSubscription.plans?.type} membership is active until {new Date(currentSubscription.end_date).toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-green-500 text-white">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-900">₹{currentSubscription.plans?.price}</p>
                <p className="text-sm text-green-700">Current Plan</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-900">
                  {Math.max(0, Math.ceil((new Date(currentSubscription.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                </p>
                <p className="text-sm text-green-700">Days Remaining</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-900 capitalize">{currentSubscription.plans?.type}</p>
                <p className="text-sm text-green-700">Time Slot</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="h-6 w-6 text-yellow-600 mr-3" />
                <div>
                  <CardTitle className="text-yellow-900">No Active Membership</CardTitle>
                  <CardDescription className="text-yellow-700">
                    Select a plan below to start your membership
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-yellow-500 text-white">Inactive</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-sm text-yellow-700">
                Choose from our day time, night time, or 24/7 access plans to get started
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="new-payment" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new-payment">New Payment</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="new-payment" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
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
                                 <p className="font-medium">{plan.name}</p>
                                 <p className="text-sm text-gray-600">{plan.duration_months} months</p>
                               </div>
                               <div className="text-right">
                                 <p className="text-lg font-bold">₹{plan.price}</p>
                                 <p className="text-sm text-gray-500">
                                   ₹{Math.round(plan.price / plan.duration_months)}/month
                                 </p>
                               </div>
                             </div>
                           </Label>
                         </div>
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
                                 <p className="font-medium">{plan.name}</p>
                                 <p className="text-sm text-gray-600">{plan.duration_months} months</p>
                               </div>
                               <div className="text-right">
                                 <p className="text-lg font-bold">₹{plan.price}</p>
                                 <p className="text-sm text-gray-500">
                                   ₹{Math.round(plan.price / plan.duration_months)}/month
                                 </p>
                               </div>
                             </div>
                           </Label>
                         </div>
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

            {/* 24/7 Full Time Plans */}
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-purple-600 mr-2" />
                  <CardTitle>24/7 Access Plans</CardTitle>
                </div>
                <CardDescription>Round the clock access (Premium plan)</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                  <div className="space-y-3">
                     {fullTimePlans.map((plan) => (
                       <div key={plan.id} className="relative">
                         <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                           <RadioGroupItem value={plan.id} id={plan.id} />
                           <Label htmlFor={plan.id} className="flex-1 cursor-pointer">
                             <div className="flex justify-between items-center">
                               <div>
                                 <p className="font-medium">{plan.name}</p>
                                 <p className="text-sm text-gray-600">{plan.duration_months} months</p>
                               </div>
                               <div className="text-right">
                                 <p className="text-lg font-bold">₹{plan.price}</p>
                                 <p className="text-sm text-gray-500">
                                   ₹{Math.round(plan.price / plan.duration_months)}/month
                                 </p>
                               </div>
                             </div>
                           </Label>
                         </div>
                       </div>
                     ))}
                  </div>
                </RadioGroup>

                <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 text-purple-600 mr-2 mt-0.5" />
                    <div className="text-sm text-purple-800">
                      <p className="font-medium">Premium Features Included</p>
                      <p>All facilities with round-the-clock access and premium support</p>
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
                    plans.find(p => p.id === selectedPlan)?.name
                  } - ₹{
                    plans.find(p => p.id === selectedPlan)?.price
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span>Plan Amount</span>
                    <span className="font-semibold">
                      ₹{plans.find(p => p.id === selectedPlan)?.price}
                    </span>
                  </div>
                  
                  {plans.find(p => p.id === selectedPlan)?.type === 'night' && (
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <span>Security Deposit</span>
                      <span className="font-semibold">₹1,000</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <span className="font-semibold">Total Amount</span>
                    <span className="text-xl font-bold text-green-700">
                      ₹{
                        (plans.find(p => p.id === selectedPlan)?.price || 0) +
                        (plans.find(p => p.id === selectedPlan)?.type === 'night' ? 1000 : 0)
                      }
                    </span>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handlePayment}
                    disabled={isLoading}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {isLoading ? "Processing..." : "Pay with Razorpay"}
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
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <IndianRupee className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium">{payment.plans?.name || 'Plan'}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(payment.created_at).toLocaleDateString()} • Razorpay
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{payment.amount / 100}</p>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
                {payments.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No payment history found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeesPayment;
