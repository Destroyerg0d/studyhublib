import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import QRPayment from "./QRPayment";
import CouponInput from "../common/CouponInput";
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
  const [selectedPlanType, setSelectedPlanType] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [plans, setPlans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [finalAmount, setFinalAmount] = useState(0);
  const { toast } = useToast();
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

      // Fetch payment history including payment verifications
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*, plans(*)')
        .eq('user_id', user.id)
        .eq('status', 'paid')
        .order('created_at', { ascending: false })
        .limit(10);

      if (paymentsData) {
        setPayments(paymentsData);
      }
    };

    fetchData();
  }, [user]);

  // Group plans by type and duration for the new UX
  const plansByType = {
    day: plans.filter(plan => plan.type === 'day'),
    morning: plans.filter(plan => plan.type === 'morning'),
    evening: plans.filter(plan => plan.type === 'evening'),
    night: plans.filter(plan => plan.type === 'night'),
    '24/7': plans.filter(plan => plan.type === '24/7'),
  };

  // Plan type definitions with enhanced styling
  const planTypes = [
    {
      type: 'day',
      name: 'Full Day',
      timing: '8:00 AM - 10:00 PM',
      description: '14 hours of productive study time',
      icon: Sun,
      color: 'from-yellow-400 to-orange-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      hours: '14 hours'
    },
    {
      type: 'morning',
      name: 'Morning Shift',
      timing: '8:00 AM - 2:00 PM',
      description: 'Perfect for early birds and fresh minds',
      icon: Sun,
      color: 'from-orange-400 to-amber-500',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      hours: '6 hours'
    },
    {
      type: 'evening',
      name: 'Evening Shift',
      timing: '2:00 PM - 10:00 PM',
      description: 'Ideal for working professionals',
      icon: Sun,
      color: 'from-amber-400 to-yellow-500',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      hours: '8 hours'
    },
    {
      type: 'night',
      name: 'Night Shift',
      timing: '10:00 PM - 6:00 AM',
      description: 'Quiet environment for night owls',
      icon: Moon,
      color: 'from-blue-400 to-indigo-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hours: '8 hours'
    },
    {
      type: '24/7',
      name: 'Full Shift',
      timing: '24/7 Access',
      description: 'Unlimited access - Premium plan',
      icon: Clock,
      color: 'from-purple-400 to-pink-500',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      hours: '24 hours'
    }
  ];

  // Get available durations for selected plan type
  const getAvailableDurations = (planType: string) => {
    const plansForType = plansByType[planType] || [];
    const monthlyPrice = plansForType.find(p => p.duration_months === 1)?.price || 0;
    
    return plansForType.map(plan => {
      const originalPrice = plan.duration_months * monthlyPrice;
      const savings = plan.duration_months > 1 ? originalPrice - plan.price : 0;
      
      return {
        value: plan.id,
        label: `${plan.duration_months} ${plan.duration_months === 1 ? 'Month' : 'Months'}`,
        price: plan.price,
        originalPrice,
        savings,
        duration: plan.duration_months
      };
    }).sort((a, b) => a.duration - b.duration);
  };

  // Handle plan type selection
  const handlePlanTypeSelect = (planType: string) => {
    setSelectedPlanType(planType);
    setSelectedDuration("");
    setSelectedPlan("");
  };

  // Handle duration selection
  const handleDurationSelect = (planId: string) => {
    setSelectedDuration(planId);
    setSelectedPlan(planId);
    setAppliedCoupon(null);
    const planPrice = plans.find(p => p.id === planId)?.price || 0;
    setFinalAmount(planPrice);
  };

  // Handle coupon application
  const handleCouponApplied = (couponData: any) => {
    setAppliedCoupon(couponData);
    if (couponData) {
      setFinalAmount(couponData.final_amount);
    } else {
      const planPrice = plans.find(p => p.id === selectedPlan)?.price || 0;
      setFinalAmount(planPrice);
    }
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

        <TabsContent value="new-payment" className="space-y-8">
          {/* Step 1: Plan Type Selection */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Study Schedule</h3>
              <p className="text-gray-600">Select the time slot that works best for you</p>
            </div>
            
            {/* Plans Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {planTypes.map((planType) => {
                const Icon = planType.icon;
                const isSelected = selectedPlanType === planType.type;
                const plansForType = plansByType[planType.type] || [];
                const basePrice = plansForType.find(p => p.duration_months === 1)?.price || 0;
                
                return (
                  <Card 
                    key={planType.type}
                    className={`relative cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                      isSelected 
                        ? `ring-2 ring-blue-500 ${planType.borderColor} shadow-lg` 
                        : `${planType.borderColor} hover:${planType.borderColor.replace('border-', 'border-').replace('-200', '-300')}`
                    }`}
                    onClick={() => handlePlanTypeSelect(planType.type)}
                  >
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                    )}
                    
                    <CardHeader className={`${planType.bgColor} rounded-t-lg`}>
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-lg bg-white shadow-sm">
                          <Icon className={`h-6 w-6 ${planType.textColor}`} />
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">from</div>
                          <div className="text-lg font-bold text-gray-900">₹{basePrice}</div>
                        </div>
                      </div>
                      <div>
                        <CardTitle className={`text-xl ${planType.textColor}`}>{planType.name}</CardTitle>
                        <CardDescription className="text-gray-600 font-medium">{planType.timing}</CardDescription>
                        <CardDescription className="text-sm text-gray-500 mt-1">{planType.description}</CardDescription>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Daily Hours:</span>
                          <span className="font-semibold">{planType.hours}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Plans Available:</span>
                          <span className="font-semibold">{plansForType.length} options</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Perfect for {planType.description.toLowerCase()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Step 2: Duration Selection */}
          {selectedPlanType && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Duration</h3>
                <p className="text-gray-600">Select how long you want to study with us</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {getAvailableDurations(selectedPlanType).map((duration) => {
                  const isSelected = selectedDuration === duration.value;
                  const discountPercentage = duration.savings > 0 ? Math.round((duration.savings / duration.originalPrice) * 100) : 0;
                  
                  return (
                    <Card 
                      key={duration.value}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        isSelected 
                          ? 'ring-2 ring-blue-500 border-blue-400 shadow-lg bg-blue-50' 
                          : 'hover:border-blue-300'
                      }`}
                      onClick={() => handleDurationSelect(duration.value)}
                    >
                      {duration.savings > 0 && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          Save {discountPercentage}%
                        </div>
                      )}
                      
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                      )}

                      <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl font-bold">{duration.label}</CardTitle>
                        {duration.savings > 0 && (
                          <div className="text-sm text-gray-500 line-through">₹{duration.originalPrice}</div>
                        )}
                        <div className="text-3xl font-bold text-blue-600">₹{duration.price}</div>
                        <div className="text-sm text-gray-600">₹{Math.round(duration.price / duration.duration)}/month</div>
                      </CardHeader>
                      
                      <CardContent className="text-center pt-0">
                        {duration.savings > 0 && (
                          <div className="text-green-600 font-semibold text-sm mb-2">
                            You save ₹{duration.savings}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          {duration.duration === 1 ? 'Perfect for trial' : 
                           duration.duration <= 3 ? 'Great for short-term goals' :
                           duration.duration <= 6 ? 'Ideal for exam preparation' :
                           'Best value for serious learners'}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {selectedPlan && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-6 w-6" />
                  Payment
                </CardTitle>
                <CardDescription>
                  Complete your payment to activate your {plans.find(p => p.id === selectedPlan)?.name} plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Coupon Input Section */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="text-lg font-semibold mb-3">Apply Coupon Code</h4>
                  <CouponInput
                    amount={plans.find(p => p.id === selectedPlan)?.price || 0}
                    orderType="subscriptions"
                    onCouponApplied={handleCouponApplied}
                  />
                </div>

                {/* Payment Summary */}
                <div className="border rounded-lg p-4">
                  <h4 className="text-lg font-semibold mb-3">Payment Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Plan Amount:</span>
                      <span>₹{plans.find(p => p.id === selectedPlan)?.price}</span>
                    </div>
                     {appliedCoupon && (
                      <>
                        <div className="flex justify-between text-green-600">
                          <span>Discount ({appliedCoupon.code}):</span>
                          <span>-₹{appliedCoupon.discount_amount}</span>
                        </div>
                        <hr />
                        <div className="flex justify-between font-bold text-lg">
                          <span>Final Amount:</span>
                          <span>₹{appliedCoupon.final_amount}</span>
                        </div>
                      </>
                    )}
                    {!appliedCoupon && (
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total Amount:</span>
                        <span>₹{plans.find(p => p.id === selectedPlan)?.price}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-primary mb-2">QR Code Payment</h3>
                  <p className="text-muted-foreground">Pay via UPI by scanning the QR code below</p>
                </div>

                 <QRPayment 
                  plan={{
                    ...plans.find(p => p.id === selectedPlan),
                    price: appliedCoupon ? appliedCoupon.final_amount : plans.find(p => p.id === selectedPlan)?.price
                  }}
                  onSubmitted={() => {
                    toast({
                      title: "Payment verification submitted",
                      description: "Your payment proof has been submitted for admin verification.",
                    });
                    setTimeout(() => {
                      window.location.reload();
                    }, 2000);
                  }}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-6 w-6" />
                Payment History
              </CardTitle>
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
                          {new Date(payment.created_at).toLocaleDateString()} • QR Payment
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