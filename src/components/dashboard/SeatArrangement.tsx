
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, CheckCircle, User, Building, Building2, Lock, AlertCircle, Clock, Calendar } from "lucide-react";

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

interface SeatBooking {
  id: string;
  seat_number: number;
  user_id: string;
  subscription_id: string;
  time_slot: 'full_day' | 'morning' | 'evening' | 'night';
  start_date: string;
  end_date: string;
  status: string;
}

type TimeSlotType = 'full_day' | 'morning' | 'evening' | 'night';

const SeatArrangement = () => {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlotType | "">("");
  const [seats, setSeats] = useState<Seat[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [seatBookings, setSeatBookings] = useState<SeatBooking[]>([]);
  const [userBookings, setUserBookings] = useState<SeatBooking[]>([]);
  const [userSubscription, setUserSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
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
      const [seatsData, plansData, profilesData, subscriptionsData, bookingsData] = await Promise.all([
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
        `).eq('status', 'active'),
        supabase.from('seat_bookings').select('*').eq('status', 'active')
      ]);

      if (seatsData.error) throw seatsData.error;
      if (plansData.error) throw plansData.error;
      if (profilesData.error) throw profilesData.error;
      if (subscriptionsData.error) throw subscriptionsData.error;
      if (bookingsData.error) throw bookingsData.error;

      setSeats(seatsData.data || []);
      setPlans(plansData.data || []);
      setProfiles(profilesData.data || []);
      setSubscriptions(subscriptionsData.data || []);
      setSeatBookings(bookingsData.data || []);

      // Find user's active subscription
      const currentUserSubscription = subscriptionsData.data?.find(sub => sub.user_id === user?.id);
      setUserSubscription(currentUserSubscription || null);

      // Find user's current bookings
      const currentUserBookings = bookingsData.data?.filter(booking => booking.user_id === user?.id) || [];
      setUserBookings(currentUserBookings);
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

    // Set up real-time subscription for seat bookings
    const channel = supabase
      .channel('seat-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'seat_bookings' }, 
        () => fetchData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'subscriptions' }, 
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const canSelectSeat = (seatNumber: number, timeSlot: TimeSlotType) => {
    if (!userSubscription) return false;
    
    // Check if seat is already booked for this time slot
    const isBooked = seatBookings.some(b => 
      b.seat_number === seatNumber && 
      b.time_slot === timeSlot && 
      b.status === 'active'
    );
    
    if (isBooked) return false;

    // Check if user already has a booking for this time slot
    const userHasSlot = userBookings.some(b => 
      b.time_slot === timeSlot && 
      b.status === 'active'
    );
    
    if (userHasSlot) return false;

    // Check subscription validity
    const now = new Date();
    const endDate = new Date(userSubscription.end_date);
    if (endDate < now) return false;

    return true;
  };

  const getAvailableTimeSlots = (seatNumber: number) => {
    const allSlots: TimeSlotType[] = ['morning', 'evening', 'night', 'full_day'];
    
    return allSlots.filter(slot => {
      // Check if slot is booked
      const isBooked = seatBookings.some(b => 
        b.seat_number === seatNumber && 
        b.time_slot === slot && 
        b.status === 'active'
      );
      
      // Check if user already has this slot
      const userHasSlot = userBookings.some(b => 
        b.time_slot === slot && 
        b.status === 'active'
      );
      
      return !isBooked && !userHasSlot;
    });
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

    const availableSlots = getAvailableTimeSlots(seatNumber);
    
    if (availableSlots.length === 0) {
      toast({
        title: "Seat Not Available",
        description: "This seat has no available time slots or you already have bookings for all slots.",
        variant: "destructive",
      });
      return;
    }

    setSelectedSeat(seatNumber);
    setBookingDialogOpen(true);
  };

  const handleBookSeat = async () => {
    if (!selectedSeat || !selectedTimeSlot || !user || !userSubscription) {
      toast({
        title: "Missing Information",
        description: "Please select a seat and time slot.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if seat is still available for the time slot
      const { data: isAvailable } = await supabase
        .rpc('is_seat_available', {
          _seat_number: selectedSeat,
          _time_slot: selectedTimeSlot as TimeSlotType,
          _start_date: userSubscription.start_date,
          _end_date: userSubscription.end_date
        });

      if (!isAvailable) {
        toast({
          title: "Seat Not Available",
          description: "This seat is no longer available for the selected time slot.",
          variant: "destructive",
        });
        return;
      }

      // Create seat booking
      const { error } = await supabase
        .from('seat_bookings')
        .insert({
          seat_number: selectedSeat,
          user_id: user.id,
          subscription_id: userSubscription.id,
          time_slot: selectedTimeSlot as TimeSlotType,
          start_date: userSubscription.start_date,
          end_date: userSubscription.end_date,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Seat booked successfully!",
        description: `You have booked seat ${selectedSeat} for ${getTimeSlotLabel(selectedTimeSlot)}.`,
      });

      setSelectedSeat(null);
      setSelectedTimeSlot("");
      setBookingDialogOpen(false);
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

  const getSeatBookings = (seatNumber: number) => {
    return seatBookings.filter(b => 
      b.seat_number === seatNumber && 
      b.status === 'active'
    );
  };

  const getTimeSlotLabel = (timeSlot: string) => {
    switch (timeSlot) {
      case 'full_day': return 'Full Day (24/7)';
      case 'morning': return 'Morning (8AM-2PM)';
      case 'evening': return 'Evening (2PM-8PM)';
      case 'night': return 'Night (8PM-8AM)';
      default: return timeSlot;
    }
  };

  const getTimeSlotColor = (timeSlot: string) => {
    switch (timeSlot) {
      case 'full_day': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'morning': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'evening': return 'bg-green-100 text-green-800 border-green-300';
      case 'night': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeatStatus = (seatNumber: number) => {
    const bookings = getSeatBookings(seatNumber);
    const userHasBooking = userBookings.some(b => b.seat_number === seatNumber && b.status === 'active');
    const availableSlots = getAvailableTimeSlots(seatNumber);
    
    if (userHasBooking) return 'my-seat';
    if (bookings.length === 4) return 'fully-booked'; // All time slots taken
    if (bookings.length > 0) return 'partially-booked';
    if (selectedSeat === seatNumber) return 'selected';
    if (availableSlots.length === 0) return 'restricted';
    return 'available';
  };

  const getSeatColor = (status: string, seatNumber?: number) => {
    if (status === 'my-seat') return 'bg-blue-500 text-white border-blue-600';
    if (status === 'selected') return 'bg-yellow-200 text-yellow-900 border-yellow-400';
    if (status === 'restricted') return 'bg-gray-200 text-gray-500 border-gray-400 cursor-not-allowed opacity-60';
    if (status === 'available') return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200 cursor-pointer';
    if (status === 'partially-booked') return 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200 cursor-pointer';
    if (status === 'fully-booked') return 'bg-red-100 text-red-800 border-red-300 cursor-not-allowed';
    
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const renderSeat = (seatNumber: number) => {
    const bookings = getSeatBookings(seatNumber);
    const status = getSeatStatus(seatNumber);
    const seatColor = getSeatColor(status, seatNumber);
    const isDisabled = status === 'fully-booked' || status === 'restricted';
    const occupiedSlots = bookings.map(b => b.time_slot);
    const availableSlots = getAvailableTimeSlots(seatNumber);
    
    return (
      <button
        key={seatNumber}
        onClick={() => handleSeatClick(seatNumber)}
        disabled={isDisabled}
        className={`
          w-16 h-16 rounded-lg border-2 text-xs font-medium
          flex flex-col items-center justify-center transition-colors relative
          ${seatColor}
        `}
      >
        {status === 'restricted' && (
          <Lock className="absolute top-0 right-0 h-3 w-3 text-gray-400 transform translate-x-1 -translate-y-1" />
        )}
        {status === 'my-seat' && (
          <User className="absolute top-0 right-0 h-3 w-3 text-white transform translate-x-1 -translate-y-1" />
        )}
        <span className="font-bold text-sm">{seatNumber}</span>
        {bookings.length > 0 && (
          <div className="flex flex-wrap justify-center gap-0.5 mt-1">
            {occupiedSlots.map((slot, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full ${getTimeSlotColor(slot).split(' ')[0]}`}
              />
            ))}
          </div>
        )}
        {availableSlots.length > 0 && status === 'available' && (
          <div className="text-[8px] text-green-600 leading-none mt-1">
            {availableSlots.length} slot{availableSlots.length > 1 ? 's' : ''}
          </div>
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
  const totalBookings = seatBookings.filter(b => b.status === 'active').length;
  const uniqueOccupiedSeats = new Set(seatBookings.filter(b => b.status === 'active').map(b => b.seat_number)).size;
  const availableSeats = totalSeats - uniqueOccupiedSeats;

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
                <p className="text-sm font-medium text-gray-700">Your Bookings</p>
                <div className="space-y-1 mt-2">
                  {userBookings.length > 0 ? (
                    userBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between">
                        <span className="text-sm">Seat {booking.seat_number}</span>
                        <Badge className={getTimeSlotColor(booking.time_slot)} variant="outline">
                          {getTimeSlotLabel(booking.time_slot)}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-600">No active bookings</p>
                  )}
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-sm font-medium text-gray-700">Available Slots</p>
                <p className="text-xs text-gray-600 mt-1">
                  You can book up to 4 different time slots per subscription
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {['morning', 'evening', 'night', 'full_day'].map((slot) => {
                    const hasSlot = userBookings.some(b => b.time_slot === slot);
                    return (
                      <Badge 
                        key={slot}
                        variant={hasSlot ? "default" : "outline"}
                        className={hasSlot ? getTimeSlotColor(slot) : "text-gray-400"}
                      >
                        {getTimeSlotLabel(slot)}
                      </Badge>
                    );
                  })}
                </div>
              </div>
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
              <div className="text-2xl font-bold text-red-600">{totalBookings}</div>
              <div className="text-sm text-gray-600">Total Bookings</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{userBookings.length}</div>
              <div className="text-sm text-gray-600">My Bookings</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Slot Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Time Slot Information
          </CardTitle>
          <CardDescription>
            Understanding the different time slots available for booking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg border">
              <h4 className="font-semibold text-purple-900">Morning</h4>
              <p className="text-sm text-purple-700">8:00 AM - 2:00 PM</p>
              <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded mt-2"></div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border">
              <h4 className="font-semibold text-green-900">Evening</h4>
              <p className="text-sm text-green-700">2:00 PM - 8:00 PM</p>
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mt-2"></div>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg border">
              <h4 className="font-semibold text-indigo-900">Night</h4>
              <p className="text-sm text-indigo-700">8:00 PM - 8:00 AM</p>
              <div className="w-4 h-4 bg-indigo-100 border border-indigo-300 rounded mt-2"></div>
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
            Corner seats (1,2) at top-left, with vertical columns A, B, C and central door - Click on seats to book specific time slots
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
