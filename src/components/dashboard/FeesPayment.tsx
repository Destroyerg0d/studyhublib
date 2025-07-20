import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [selectedPlanType, setSelectedPlanType] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string>("");
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
      timing: '6:00 AM - 10:00 PM',
      description: '16 hours of productive study time',
      icon: Sun,
      color: 'from-yellow-400 to-orange-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      hours: '16 hours'
    },
    {
      type: 'morning',
      name: 'Morning Shift',
      timing: '6:00 AM - 3:00 PM',
      description: 'Perfect for early birds and fresh minds',
      icon: Sun,
      color: 'from-orange-400 to-amber-500',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      hours: '9 hours'
    },
    {
      type: 'evening',
      name: 'Evening Shift',
      timing: '3:00 PM - 10:00 PM',
      description: 'Ideal for working professionals',
      icon: Sun,
      color: 'from-amber-400 to-yellow-500',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      hours: '7 hours'
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
    return plansForType.map(plan => ({
      value: plan.id,
      label: `${plan.duration_months} ${plan.duration_months === 1 ? 'Month' : 'Months'}`,
      price: plan.price,
      originalPrice: plan.duration_months * (plansForType.find(p => p.duration_months === 1)?.price || 0),
      savings: plan.duration_months > 1 ? (plan.duration_months * (plansForType.find(p => p.duration_months === 1)?.price || 0)) - plan.price : 0,
      duration: plan.duration_months
    })).sort((a, b) => a.duration - b.duration);
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
  };

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

        <TabsContent value="new-payment" className="space-y-8">
          {/* Step 1: Plan Type Selection */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Study Schedule</h3>
              <p className="text-gray-600">Select the time slot that works best for you</p>
            </div>
            
            {/* Full Day Plan - Featured prominently */}
            <div className="lg:col-span-3 mb-6">
              {(() => {
                const fullDayType = planTypes.find(p => p.type === 'day');
                const Icon = fullDayType.icon;
                const isSelected = selectedPlanType === 'day';
                const plansForType = plansByType['day'] || [];
                const basePrice = plansForType.find(p => p.duration_months === 1)?.price || 0;
                const savings = plansForType.find(p => p.duration_months === 12) ? 
                  (12 * basePrice) - plansForType.find(p => p.duration_months === 12).price : 0;
                
                return (
                  <Card 
                    className={`relative cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-2 ${
                      isSelected 
                        ? 'ring-4 ring-blue-500 border-blue-400 shadow-2xl' 
                        : 'border-yellow-300 hover:border-yellow-400 shadow-lg'
                    } bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50`}
                    onClick={() => handlePlanTypeSelect('day')}
                  >
                    {/* Most Popular Badge */}
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      ⭐ MOST POPULAR
                    </div>
                    
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-2">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                    )}
                    
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
                            <Icon className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-3xl font-bold text-yellow-700">Full Day Access</CardTitle>
                            <CardDescription className="text-lg font-medium text-gray-700">6:00 AM - 10:00 PM (16 Hours)</CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500 mb-1">Starting from</div>
                          <div className="text-3xl font-bold text-gray-900">₹{basePrice}<span className="text-lg text-gray-600">/month</span></div>
                          {savings > 0 && (
                            <div className="text-sm text-green-600 font-bold">Save up to ₹{savings} yearly!</div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 mb-2">✨ Premium Features</h4>
                          <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Maximum study hours (16/day)</div>
                            <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Private study booth</div>
                            <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />High-speed WiFi & power outlets</div>
                            <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Climate controlled environment</div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 mb-2">🎯 Perfect For</h4>
                          <div className="space-y-2 text-sm text-gray-700">
                            <div>• Competitive exam preparation</div>
                            <div>• Full-time students</div>
                            <div>• Dedicated learners</div>
                            <div>• Maximum productivity seekers</div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900 mb-2">💰 Value Benefits</h4>
                          <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Best value per hour</div>
                            <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Flexible study schedule</div>
                            <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Higher success rate</div>
                            <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />{plansForType.length} duration options</div>
                          </div>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                          <div className="flex items-center justify-center text-blue-700">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            <span className="text-lg font-bold">Excellent Choice! Select your duration below ⬇️</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })()}
            </div>

            {/* Other Plans - Arranged in grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {planTypes.filter(p => p.type !== 'day').map((planType) => {
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
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${planType.color}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">from</div>
                          <div className="text-lg font-bold text-gray-900">₹{basePrice}</div>
                        </div>
                      </div>
                      <CardTitle className={`text-lg ${planType.textColor}`}>{planType.name}</CardTitle>
                      <CardDescription className="text-sm font-medium text-gray-700">{planType.timing}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-3">
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600">{planType.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Duration:</span>
                          <span className="font-medium text-gray-700">{planType.hours}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Options:</span>
                          <span className="font-medium text-gray-700">{plansForType.length} plans</span>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center text-blue-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            <span className="text-xs font-medium">Selected!</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Step 2: Duration Selection */}
          {selectedPlanType && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Select Your Duration</h3>
                <p className="text-gray-600">Longer plans offer better savings</p>
              </div>
              
              <div className="max-w-2xl mx-auto">
                <div className="grid gap-4">
                  {getAvailableDurations(selectedPlanType).map((duration, index) => {
                    const isSelected = selectedDuration === duration.value;
                    const isPopular = duration.duration === 3;
                    
                    return (
                      <Card
                        key={duration.value}
                        className={`relative cursor-pointer transition-all duration-300 hover:shadow-md ${
                          isSelected 
                            ? 'ring-2 ring-blue-500 shadow-md border-blue-200' 
                            : 'hover:border-gray-300'
                        } ${isPopular ? 'border-green-300 bg-green-50' : ''}`}
                        onClick={() => handleDurationSelect(duration.value)}
                      >
                        {isPopular && (
                          <div className="absolute -top-2 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            Most Popular
                          </div>
                        )}
                        
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                isSelected 
                                  ? 'bg-blue-500 border-blue-500' 
                                  : 'border-gray-300'
                              }`}>
                                {isSelected && (
                                  <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{duration.label}</div>
                                {duration.savings > 0 && (
                                  <div className="text-sm text-green-600 font-medium">
                                    Save ₹{duration.savings}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900">₹{duration.price}</div>
                              {duration.savings > 0 && (
                                <div className="text-sm text-gray-500 line-through">₹{duration.originalPrice}</div>
                              )}
                              <div className="text-sm text-gray-600">
                                ₹{Math.round(duration.price / duration.duration)}/month
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Payment Section */}
          {selectedPlan && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Complete Your Purchase
                </CardTitle>
                <CardDescription>
                  {planTypes.find(p => p.type === selectedPlanType)?.name} - {
                    getAvailableDurations(selectedPlanType).find(d => d.value === selectedDuration)?.label
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total Amount</span>
                      <span className="text-2xl font-bold text-blue-700">
                        ₹{plans.find(p => p.id === selectedPlan)?.price}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      One-time payment • Secure checkout
                    </div>
                  </div>

                  <Button 
                    className="w-full py-6 text-lg font-semibold" 
                    size="lg"
                    onClick={handlePayment}
                    disabled={isLoading}
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    {isLoading ? "Processing..." : "Pay with Razorpay"}
                  </Button>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-500">
                      🔒 Secure payment powered by Razorpay
                    </div>
                  </div>
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