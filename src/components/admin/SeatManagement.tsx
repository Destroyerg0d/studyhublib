import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
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
import { Users, Settings, Eye, UserX, BarChart3, Building, Building2, Clock, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Seat {
  id: string;
  row_letter: string;
  seat_number: number;
  status: string;
  assigned_user_id: string | null;
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
  profiles?: {
    name: string;
    email: string;
  } | null;
  subscriptions?: {
    plans: {
      name: string;
      type: string;
    };
  } | null;
}

type TimeSlotType = 'full_day' | 'morning' | 'evening' | 'night';

const SeatManagement = () => {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [seatBookings, setSeatBookings] = useState<SeatBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlotType | "">("");
  const { toast } = useToast();

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
      setLoading(true);
      
      // Fetch seats
      const { data: seatsData, error: seatsError } = await supabase
        .from('seats')
        .select('*')
        .order('seat_number');

      if (seatsError) throw seatsError;

      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email');

      if (profilesError) throw profilesError;

      // Fetch subscriptions with plans
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select(`
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
        `)
        .eq('status', 'active');

      if (subscriptionsError) throw subscriptionsError;

      // Fetch seat bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('seat_bookings')
        .select(`
          id,
          seat_number,
          user_id,
          subscription_id,
          time_slot,
          start_date,
          end_date,
          status
        `)
        .eq('status', 'active');

      if (bookingsError) throw bookingsError;

      // Manually join with profiles and subscriptions
      const enrichedBookings: SeatBooking[] = (bookingsData || []).map(booking => {
        const profile = profilesData?.find(p => p.id === booking.user_id);
        const subscription = subscriptionsData?.find(s => s.id === booking.subscription_id);
        
        return {
          ...booking,
          profiles: profile ? { name: profile.name, email: profile.email } : null,
          subscriptions: subscription ? { plans: subscription.plans } : null
        };
      });

      setSeats(seatsData || []);
      setProfiles(profilesData || []);
      setSubscriptions(subscriptionsData || []);
      setSeatBookings(enrichedBookings);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up real-time subscriptions
    const channel = supabase
      .channel('admin-seat-management')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'seats' }, 
        () => fetchData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'subscriptions' }, 
        () => fetchData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'seat_bookings' }, 
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSeatAction = async (action: string, seatNumber: number, timeSlot?: string) => {
    try {
      if (action === "Release Booking") {
        // Find the specific booking to release
        const booking = seatBookings.find(b => 
          b.seat_number === seatNumber && 
          b.time_slot === timeSlot &&
          b.status === 'active'
        );

        if (booking) {
          const { error } = await supabase
            .from('seat_bookings')
            .update({ status: 'cancelled' })
            .eq('id', booking.id);

          if (error) throw error;
        }
      } else if (action === "Assign Seat") {
        setSelectedSeat(seatNumber.toString());
        setAssignDialogOpen(true);
        return;
      }

      toast({
        title: `${action} successful`,
        description: `Action completed for seat ${seatNumber}`,
      });
    } catch (error) {
      console.error('Error performing seat action:', error);
      toast({
        title: "Error",
        description: "Failed to perform action",
        variant: "destructive",
      });
    }
  };

  const handleAssignSeat = async () => {
    if (!selectedSeat || !selectedUser || !selectedTimeSlot) {
      toast({
        title: "Missing Information",
        description: "Please select a user and time slot",
        variant: "destructive",
      });
      return;
    }

    try {
      // Find user's active subscription
      const userSubscription = subscriptions.find(s => s.user_id === selectedUser);
      if (!userSubscription) {
        toast({
          title: "No Active Subscription",
          description: "Selected user doesn't have an active subscription",
          variant: "destructive",
        });
        return;
      }

      // Check if seat is available for the time slot
      const { data: isAvailable } = await supabase
        .rpc('is_seat_available', {
          _seat_number: parseInt(selectedSeat),
          _time_slot: selectedTimeSlot as TimeSlotType,
          _start_date: userSubscription.start_date,
          _end_date: userSubscription.end_date
        });

      if (!isAvailable) {
        toast({
          title: "Seat Not Available",
          description: "This seat is already booked for the selected time slot",
          variant: "destructive",
        });
        return;
      }

      // Create seat booking
      const { error } = await supabase
        .from('seat_bookings')
        .insert({
          seat_number: parseInt(selectedSeat),
          user_id: selectedUser,
          subscription_id: userSubscription.id,
          time_slot: selectedTimeSlot as TimeSlotType,
          start_date: userSubscription.start_date,
          end_date: userSubscription.end_date,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Seat Assigned Successfully",
        description: `Seat ${selectedSeat} assigned for ${selectedTimeSlot} slot`,
      });

      setAssignDialogOpen(false);
      setSelectedSeat(null);
      setSelectedUser("");
      setSelectedTimeSlot("");
      fetchData();
    } catch (error) {
      console.error('Error assigning seat:', error);
      toast({
        title: "Error",
        description: "Failed to assign seat",
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

  const renderSeat = (seatNumber: number) => {
    const bookings = getSeatBookings(seatNumber);
    const hasBookings = bookings.length > 0;
    
    // Create a grid showing different time slots
    const timeSlots = ['morning', 'evening', 'night', 'full_day'];
    const occupiedSlots = bookings.map(b => b.time_slot);

    return (
      <Dialog key={seatNumber}>
        <DialogTrigger asChild>
          <button
            className={`
              w-16 h-16 rounded-lg border-2 text-xs font-medium
              flex flex-col items-center justify-center transition-colors
              hover:shadow-md cursor-pointer relative
              ${hasBookings ? 'bg-red-100 text-red-800 border-red-300' : 'bg-gray-100 text-gray-800 border-gray-300'}
            `}
          >
            <span className="font-bold text-sm">{seatNumber}</span>
            {hasBookings && (
              <div className="flex flex-wrap justify-center gap-0.5 mt-1">
                {occupiedSlots.map((slot, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full ${getTimeSlotColor(slot).split(' ')[0]}`}
                  />
                ))}
              </div>
            )}
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Seat {seatNumber} - Time Slot Management</DialogTitle>
            <DialogDescription>
              Manage bookings for different time slots on this seat
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Time Slot Grid */}
            <div className="grid grid-cols-2 gap-4">
              {timeSlots.map((slot) => {
                const booking = bookings.find(b => b.time_slot === slot);
                const isOccupied = !!booking;
                
                return (
                  <div
                    key={slot}
                    className={`
                      p-4 rounded-lg border-2 
                      ${isOccupied 
                        ? getTimeSlotColor(slot) 
                        : 'bg-gray-50 text-gray-500 border-gray-200'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="font-medium">{getTimeSlotLabel(slot)}</span>
                      </div>
                      {isOccupied && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleSeatAction("Release Booking", seatNumber, slot)}
                        >
                          <UserX className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    {isOccupied && booking ? (
                      <div className="text-xs space-y-1">
                        <p><strong>User:</strong> {booking.profiles?.name}</p>
                        <p><strong>Email:</strong> {booking.profiles?.email}</p>
                        <p><strong>Plan:</strong> {booking.subscriptions?.plans?.name}</p>
                        <p><strong>Valid:</strong> {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}</p>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">
                        Available for booking
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center">
              <Button
                onClick={() => handleSeatAction("Assign Seat", seatNumber)}
                className="flex items-center"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Assign New Booking
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
      {/* Stats */}
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
              <div className="text-2xl font-bold text-green-600">{totalBookings}</div>
              <div className="text-sm text-gray-600">Active Bookings</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{availableSeats}</div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {totalSeats > 0 ? Math.round((uniqueOccupiedSeats / totalSeats) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Seat Occupancy</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* First Floor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            First Floor Layout (19 Seats)
          </CardTitle>
          <CardDescription>
            Corner seats (1,2) at top-left, with vertical columns A, B, C and central door
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded mr-2"></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2"></div>
              <span className="text-sm">Has Bookings</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Time Slots:</span>
              <div className="w-2 h-2 bg-purple-100 rounded-full"></div>
              <span className="text-xs">Morning</span>
              <div className="w-2 h-2 bg-green-100 rounded-full"></div>
              <span className="text-xs">Evening</span>
              <div className="w-2 h-2 bg-indigo-100 rounded-full"></div>
              <span className="text-xs">Night</span>
              <div className="w-2 h-2 bg-blue-100 rounded-full"></div>
              <span className="text-xs">Full Day</span>
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
        </CardContent>
      </Card>

      {/* Seat Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Seat Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalSeats > 0 ? Math.round((uniqueOccupiedSeats / totalSeats) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Active Occupancy Rate</div>
              <div className="text-xs text-green-600">Real-time data</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ₹{(totalBookings * 1000).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Monthly Revenue from Bookings</div>
              <div className="text-xs text-green-600">Estimated average</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {seats.filter(s => s.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending Assignments</div>
              <div className="text-xs text-yellow-600">Require attention</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assign Seat Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Seat {selectedSeat}</DialogTitle>
            <DialogDescription>
              Select a user and time slot to assign this seat
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="user-select">Select User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user with active subscription" />
                </SelectTrigger>
                <SelectContent>
                  {subscriptions.map((sub) => {
                    const profile = profiles.find(p => p.id === sub.user_id);
                    return (
                      <SelectItem key={sub.user_id} value={sub.user_id}>
                        {profile?.name} ({profile?.email}) - {sub.plans.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="slot-select">Select Time Slot</Label>
              <Select value={selectedTimeSlot} onValueChange={(value) => setSelectedTimeSlot(value as TimeSlotType | "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose time slot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (8AM-2PM)</SelectItem>
                  <SelectItem value="evening">Evening (2PM-8PM)</SelectItem>
                  <SelectItem value="night">Night (8PM-8AM)</SelectItem>
                  <SelectItem value="full_day">Full Day (24/7)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignSeat}>
                Assign Seat
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SeatManagement;
