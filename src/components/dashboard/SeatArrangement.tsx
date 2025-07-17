
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Users, CheckCircle, User, Building, Building2, Lock, AlertCircle } from "lucide-react";

interface Seat {
  id: string;
  row_letter: string;
  seat_number: number;
  status: string;
  assigned_user_id: string | null;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  type: string;
}

interface Profile {
  id: string;
  name: string;
  email: string;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  start_date: string;
  end_date: string;
  plans: {
    name: string;
    type: string;
  };
}

const SeatArrangement = () => {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [userSeat, setUserSeat] = useState<number | null>(null);
  const [userSubscription, setUserSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // First floor layout - arranged as specified
  const firstFloorLayout = {
    corner: [1, 2],
    rowA: [3, 4, 5, 6, 7, 8],
    rowB: [13, 12, 11, 10, 9],
    rowC: [19, 18, 17, 16, 15, 14]
  };

  // Second floor layout - arranged as specified
  const secondFloorLayout = {
    rowD: [20, 21, 22, 23, 24, 25],
    rowE: [30, 29, 28, 27, 26],
    rowF: [35, 34, 33, 32, 31],
    rowG: [40, 39, 38, 37, 36]
  };

  const fetchData = async () => {
    try {
      const [seatsData, plansData, profilesData, subscriptionsData] = await Promise.all([
        supabase.from('seats').select('*').order('seat_number'),
        supabase.from('plans').select('*').eq('active', true).order('price'),
        supabase.from('profiles').select('id, name, email'),
        supabase.from('subscriptions').select(`
          id,
          user_id,
          plan_id,
          status,
          start_date,
          end_date,
          plans (
            name,
            type
          )
        `).eq('status', 'active')
      ]);

      if (seatsData.error) throw seatsData.error;
      if (plansData.error) throw plansData.error;
      if (profilesData.error) throw profilesData.error;
      if (subscriptionsData.error) throw subscriptionsData.error;

      setSeats(seatsData.data || []);
      setPlans(plansData.data || []);
      setProfiles(profilesData.data || []);
      setSubscriptions(subscriptionsData.data || []);

      // Find user's current seat
      const currentUserSeat = seatsData.data?.find(seat => seat.assigned_user_id === user?.id);
      setUserSeat(currentUserSeat?.seat_number || null);

      // Find user's active subscription
      const currentUserSubscription = subscriptionsData.data?.find(sub => sub.user_id === user?.id);
      setUserSubscription(currentUserSubscription || null);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch seats",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up real-time subscription for seats
    const channel = supabase
      .channel('seat-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'seats' }, 
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const canSelectSeat = (seatNumber: number) => {
    if (!userSubscription) return false;
    
    const seat = seats.find(s => s.seat_number === seatNumber);
    if (!seat || seat.status === 'occupied' || seatNumber === userSeat) return false;

    // Check if current time allows seat selection based on user's plan
    const now = new Date();
    const currentHour = now.getHours();
    const planType = userSubscription.plans.type.toLowerCase();

    // Check subscription validity
    const endDate = new Date(userSubscription.end_date);
    if (endDate < now) return false;

    // Time-based restrictions based on plan type
    switch (planType) {
      case 'morning':
        return currentHour >= 8 && currentHour < 14; // 8 AM - 2 PM
      case 'evening':
        return currentHour >= 14 && currentHour < 20; // 2 PM - 8 PM
      case 'full shift':
        return currentHour >= 8 && currentHour < 20; // 8 AM - 8 PM
      case 'full day':
        return true; // 24/7 access
      default:
        return false;
    }
  };

  const handleSeatClick = (seatNumber: number) => {
    if (!userSubscription) {
      toast({
        title: "No Active Plan",
        description: "Please purchase a plan first to book a seat.",
        variant: "destructive",
      });
      return;
    }

    if (!canSelectSeat(seatNumber)) {
      const planType = userSubscription.plans.type.toLowerCase();
      let timeSlot = "";
      
      switch (planType) {
        case 'morning':
          timeSlot = "8:00 AM - 2:00 PM";
          break;
        case 'evening':
          timeSlot = "2:00 PM - 8:00 PM";
          break;
        case 'full shift':
          timeSlot = "8:00 AM - 8:00 PM";
          break;
        case 'full day':
          timeSlot = "24/7";
          break;
      }

      toast({
        title: "Seat Not Available",
        description: `This seat can only be selected during your plan's time slot: ${timeSlot}`,
        variant: "destructive",
      });
      return;
    }

    setSelectedSeat(selectedSeat === seatNumber ? null : seatNumber);
  };

  const handleBookSeat = async () => {
    if (!selectedSeat || !user) {
      toast({
        title: "Please select a seat",
        description: "Choose an available seat to book.",
        variant: "destructive",
      });
      return;
    }

    if (!userSubscription) {
      toast({
        title: "No Active Plan",
        description: "Please purchase a plan first to book a seat.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Release current seat if user has one
      if (userSeat) {
        await supabase
          .from('seats')
          .update({ 
            status: 'available', 
            assigned_user_id: null 
          })
          .eq('seat_number', userSeat);
      }

      // Book new seat
      const { error } = await supabase
        .from('seats')
        .update({ 
          status: 'occupied', 
          assigned_user_id: user.id 
        })
        .eq('seat_number', selectedSeat);

      if (error) throw error;

      toast({
        title: "Seat booked successfully!",
        description: `You have booked seat ${selectedSeat}. ${userSeat ? 'Your previous seat has been released.' : ''}`,
      });

      setSelectedSeat(null);
      fetchData();
    } catch (error) {
      console.error('Error booking seat:', error);
      toast({
        title: "Error",
        description: "Failed to book seat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getSeatInfo = (seatNumber: number) => {
    const seat = seats.find(s => s.seat_number === seatNumber);
    if (!seat || !seat.assigned_user_id) return null;

    const profile = profiles.find(p => p.id === seat.assigned_user_id);
    const subscription = subscriptions.find(s => s.user_id === seat.assigned_user_id);

    return {
      user: profile,
      subscription: subscription,
      seat: seat
    };
  };

  const getPlanColor = (planType: string) => {
    switch (planType?.toLowerCase()) {
      case 'full shift': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'morning': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'evening': return 'bg-green-100 text-green-800 border-green-300';
      case 'full day': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeatStatus = (seatNumber: number) => {
    const seat = seats.find(s => s.seat_number === seatNumber);
    
    if (seatNumber === userSeat) return 'my-seat';
    if (!seat || seat.status === 'occupied') return 'booked';
    if (selectedSeat === seatNumber) return 'selected';
    if (!canSelectSeat(seatNumber)) return 'restricted';
    return 'available';
  };

  const getSeatColor = (status: string, seatNumber?: number) => {
    if (status === 'my-seat') return 'bg-blue-500 text-white border-blue-600';
    if (status === 'selected') return 'bg-yellow-200 text-yellow-900 border-yellow-400';
    if (status === 'restricted') return 'bg-gray-200 text-gray-500 border-gray-400 cursor-not-allowed opacity-60';
    if (status === 'available') return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200 cursor-pointer';
    
    // For occupied seats, get plan color
    if (seatNumber) {
      const seatInfo = getSeatInfo(seatNumber);
      if (seatInfo?.subscription?.plans) {
        return getPlanColor(seatInfo.subscription.plans.type) + ' cursor-not-allowed';
      }
    }
    
    return 'bg-red-100 text-red-800 border-red-300 cursor-not-allowed';
  };

  const renderSeat = (seatNumber: number) => {
    const seatInfo = getSeatInfo(seatNumber);
    const status = getSeatStatus(seatNumber);
    const seatColor = getSeatColor(status, seatNumber);
    const isRestricted = status === 'restricted';
    
    return (
      <button
        key={seatNumber}
        onClick={() => handleSeatClick(seatNumber)}
        disabled={status === 'booked' || status === 'my-seat' || isRestricted}
        className={`
          w-12 h-12 rounded-lg border-2 text-xs font-medium
          flex flex-col items-center justify-center transition-colors relative
          ${seatColor}
        `}
      >
        {isRestricted && (
          <Lock className="absolute top-0 right-0 h-3 w-3 text-gray-400 transform translate-x-1 -translate-y-1" />
        )}
        <span className="font-bold">{seatNumber}</span>
        {seatInfo?.user && (
          <span className="text-[8px] leading-none truncate w-full text-center">
            {seatInfo.user.name.split(' ')[0]}
          </span>
        )}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading seats...</div>
      </div>
    );
  }

  const totalSeats = 40; // Fixed total seats
  const occupiedSeats = seats.filter(seat => seat.status === 'occupied').length;
  const availableSeats = totalSeats - occupiedSeats;

  return (
    <div className="space-y-6">
      {/* User Plan Status */}
      {userSubscription ? (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <CardTitle className="text-blue-900">Active Plan: {userSubscription.plans.name}</CardTitle>
                  <CardDescription className="text-blue-700">
                    Plan Type: {userSubscription.plans.type} | Valid until: {new Date(userSubscription.end_date).toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-blue-500 text-white">Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-sm font-medium text-gray-700">Seat Selection Available</p>
                <p className="text-xs text-gray-600">
                  {userSubscription.plans.type.toLowerCase() === 'morning' && 'During 8:00 AM - 2:00 PM'}
                  {userSubscription.plans.type.toLowerCase() === 'evening' && 'During 2:00 PM - 8:00 PM'}
                  {userSubscription.plans.type.toLowerCase() === 'full shift' && 'During 8:00 AM - 8:00 PM'}
                  {userSubscription.plans.type.toLowerCase() === 'full day' && '24/7 Access'}
                </p>
              </div>
              {userSeat && (
                <div className="p-3 bg-white rounded-lg border">
                  <p className="text-sm font-medium text-gray-700">Your Current Seat</p>
                  <p className="text-lg font-bold text-blue-600">Seat {userSeat}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-yellow-600 mr-3" />
              <div>
                <CardTitle className="text-yellow-900">No Active Plan</CardTitle>
                <CardDescription className="text-yellow-700">
                  You need to purchase a plan to book seats. Visit the Fees & Payment section to get started.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalSeats}</div>
              <div className="text-sm text-gray-600">Total Seats</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{availableSeats}</div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{occupiedSeats}</div>
              <div className="text-sm text-gray-600">Occupied</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userSeat || 'None'}</div>
              <div className="text-sm text-gray-600">My Seat</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Pricing Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Available Plans
          </CardTitle>
          <CardDescription>
            Current pricing and available time slots
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-orange-50 rounded-lg border">
              <h4 className="font-semibold text-orange-900">Full Shift</h4>
              <p className="text-sm text-orange-700">8 AM - 8 PM</p>
              <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded mt-2"></div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border">
              <h4 className="font-semibold text-purple-900">Morning</h4>
              <p className="text-sm text-purple-700">8 AM - 2 PM</p>
              <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded mt-2"></div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border">
              <h4 className="font-semibold text-green-900">Evening</h4>
              <p className="text-sm text-green-700">2 PM - 8 PM</p>
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mt-2"></div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border">
              <h4 className="font-semibold text-blue-900">Full Day</h4>
              <p className="text-sm text-blue-700">24/7 Access</p>
              <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded mt-2"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* First Floor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            First Floor Layout (19 Seats)
          </CardTitle>
          <CardDescription>
            Corner seats (1,2) at top-left, with vertical columns A, B, C and central door - Click on an available seat to select and book it
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded mr-2"></div>
              <span className="text-sm">Your Seat</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded mr-2"></div>
              <span className="text-sm">Selected</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded mr-2 opacity-60 relative">
                <Lock className="absolute -top-1 -right-1 h-2 w-2 text-gray-400" />
              </div>
              <span className="text-sm">Restricted (Plan Required)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded mr-2"></div>
              <span className="text-sm">Full Shift</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded mr-2"></div>
              <span className="text-sm">Morning</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
              <span className="text-sm">Evening</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded mr-2"></div>
              <span className="text-sm">Full Day</span>
            </div>
          </div>

          {/* First Floor Layout */}
          <div className="flex justify-center">
            <div className="grid grid-cols-4 gap-8 items-start">
              
              {/* Corner Seats (Top-Left) */}
              <div className="flex flex-col items-center space-y-2">
                <h3 className="font-medium text-gray-700 text-sm">Corner</h3>
                <div className="flex flex-col space-y-2">
                  {firstFloorLayout.corner.map((seatNumber) => renderSeat(seatNumber))}
                </div>
              </div>

              {/* Column A (Left Section) */}
              <div className="flex flex-col items-center space-y-2">
                <h3 className="font-medium text-gray-700 text-sm">Column A</h3>
                <div className="flex flex-col space-y-2">
                  {firstFloorLayout.rowA.map((seatNumber) => renderSeat(seatNumber))}
                </div>
              </div>

              {/* Column B (Middle Section) with Door */}
              <div className="flex flex-col items-center space-y-2">
                {/* Door positioned at top */}
                <div className="w-20 h-12 bg-gray-500 text-white flex items-center justify-center text-xs font-bold rounded border-2 border-gray-600 mb-2">
                  DOOR
                </div>
                <h3 className="font-medium text-gray-700 text-sm">Column B</h3>
                <div className="flex flex-col space-y-2">
                  {firstFloorLayout.rowB.map((seatNumber) => renderSeat(seatNumber))}
                </div>
              </div>

              {/* Column C (Right Section) */}
              <div className="flex flex-col items-center space-y-2">
                <h3 className="font-medium text-gray-700 text-sm">Column C</h3>
                <div className="flex flex-col space-y-2">
                  {firstFloorLayout.rowC.map((seatNumber) => renderSeat(seatNumber))}
                </div>
              </div>

            </div>
          </div>
        </CardContent>
      </Card>

      {/* Second Floor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Second Floor Layout (21 Seats)
          </CardTitle>
          <CardDescription>
            Four vertical columns D, E, F, G with stair and door at top-right above Column G
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Second Floor Layout */}
          <div className="flex justify-center">
            <div className="grid grid-cols-4 gap-8 items-start">
              
              {/* Column D (Far Left) */}
              <div className="flex flex-col items-center space-y-2">
                <h3 className="font-medium text-gray-700 text-sm">Column D</h3>
                <div className="flex flex-col space-y-2">
                  {secondFloorLayout.rowD.map((seatNumber) => renderSeat(seatNumber))}
                </div>
              </div>

              {/* Column E (Second from Left) */}
              <div className="flex flex-col items-center space-y-2">
                <h3 className="font-medium text-gray-700 text-sm">Column E</h3>
                <div className="flex flex-col space-y-2">
                  {secondFloorLayout.rowE.map((seatNumber) => renderSeat(seatNumber))}
                </div>
              </div>

              {/* Column F (Third from Left) */}
              <div className="flex flex-col items-center space-y-2">
                <h3 className="font-medium text-gray-700 text-sm">Column F</h3>
                <div className="flex flex-col space-y-2">
                  {secondFloorLayout.rowF.map((seatNumber) => renderSeat(seatNumber))}
                </div>
              </div>

              {/* Column G (Far Right) with Stair and Door */}
              <div className="flex flex-col items-center space-y-2">
                {/* Stair and Door positioned at top-right */}
                <div className="flex flex-col items-center mb-2">
                  <div className="w-16 h-8 bg-gray-600 text-white flex items-center justify-center text-xs font-bold rounded mb-1">
                    STAIR
                  </div>
                  <div className="w-16 h-8 bg-gray-500 text-white flex items-center justify-center text-xs font-bold rounded border-2 border-gray-600">
                    DOOR
                  </div>
                </div>
                <h3 className="font-medium text-gray-700 text-sm">Column G</h3>
                <div className="flex flex-col space-y-2">
                  {secondFloorLayout.rowG.map((seatNumber) => renderSeat(seatNumber))}
                </div>
              </div>

            </div>
          </div>

          {/* Book Button */}
          {selectedSeat && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Selected Seat: {selectedSeat}</p>
                  <p className="text-sm text-gray-600">Ready to book this seat</p>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => setSelectedSeat(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleBookSeat}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Book Seat
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SeatArrangement;
