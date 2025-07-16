
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, CheckCircle, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tables } from "@/integrations/supabase/types";

type Seat = Tables<'seats'>;
type Subscription = Tables<'subscriptions'>;

const SeatArrangement = () => {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  // Define seat arrangement: Lower and Upper floors
  const seatLayout = {
    lowerFloor: {
      leftSide: [
        { row: 'A', seats: 8, label: 'Night Ch' },
        { row: 'B', seats: 8, label: 'Morning' },
        { row: 'C', seats: 8, label: 'Evening' },
        { row: 'D', seats: 8, label: 'Full Day' }
      ]
    },
    upperFloor: {
      rightSide: [
        { row: 'E', seats: 10, label: 'Upper Floor A' },
        { row: 'F', seats: 10, label: 'Upper Floor B' },
        { row: 'G', seats: 10, label: 'Upper Floor C' },
        { row: 'H', seats: 10, label: 'Upper Floor D' }
      ]
    }
  };

  useEffect(() => {
    fetchSeats();
    fetchSubscriptions();

    // Set up real-time subscriptions
    const seatsChannel = supabase
      .channel('seats-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seats' }, fetchSeats)
      .subscribe();

    const subscriptionsChannel = supabase
      .channel('subscriptions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, fetchSubscriptions)
      .subscribe();

    return () => {
      supabase.removeChannel(seatsChannel);
      supabase.removeChannel(subscriptionsChannel);
    };
  }, []);

  const fetchSeats = async () => {
    try {
      const { data, error } = await supabase
        .from('seats')
        .select('*')
        .order('row_letter', { ascending: true })
        .order('seat_number', { ascending: true });

      if (error) throw error;
      setSeats(data || []);
    } catch (error) {
      console.error('Error fetching seats:', error);
      toast({
        title: "Error loading seats",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const handleSeatClick = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat || seat.status !== 'available') return;
    
    // Check if user already has an active subscription
    const userSubscription = subscriptions.find(s => s.user_id === user?.id);
    if (userSubscription && userSubscription.seat_id !== seatId) {
      toast({
        title: "Seat change required",
        description: "You already have a seat. Please contact admin to change seats.",
        variant: "destructive",
      });
      return;
    }

    setSelectedSeat(selectedSeat === seatId ? null : seatId);
  };

  const handleBookSeat = async () => {
    if (!selectedSeat || !user || !profile) {
      toast({
        title: "Please select a seat",
        description: "Choose an available seat to book.",
        variant: "destructive",
      });
      return;
    }

    if (!profile.verified) {
      toast({
        title: "Verification required",
        description: "Please complete your profile verification before booking a seat.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update seat status
      const { error: seatError } = await supabase
        .from('seats')
        .update({ 
          status: 'occupied',
          assigned_user_id: user.id
        })
        .eq('id', selectedSeat);

      if (seatError) throw seatError;

      setSelectedSeat(null);
      toast({
        title: "Seat booked successfully!",
        description: `You have booked seat ${selectedSeat}. Please complete payment to activate your subscription.`,
      });
    } catch (error) {
      console.error('Error booking seat:', error);
      toast({
        title: "Booking failed",
        description: "There was an error booking your seat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getSeatStatus = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat) return 'available';
    
    if (seat.assigned_user_id === user?.id) return 'my-seat';
    if (seat.status === 'occupied') return 'occupied';
    if (seat.status === 'maintenance') return 'maintenance';
    if (selectedSeat === seatId) return 'selected';
    return 'available';
  };

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'my-seat': return 'bg-blue-500 text-white border-blue-600';
      case 'occupied': return 'bg-red-100 text-red-800 border-red-300 cursor-not-allowed';
      case 'maintenance': return 'bg-orange-100 text-orange-800 border-orange-300 cursor-not-allowed';
      case 'selected': return 'bg-yellow-200 text-yellow-900 border-yellow-400';
      case 'available': return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200 cursor-pointer';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getOccupantName = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat?.assigned_user_id) return '';
    
    const subscription = subscriptions.find(s => s.seat_id === seatId);
    // This would need a join with profiles table to get the actual name
    return subscription ? 'Occupied' : '';
  };

  const totalSeats = Object.values(seatLayout.lowerFloor.leftSide).reduce((sum, row) => sum + row.seats, 0) +
                   Object.values(seatLayout.upperFloor.rightSide).reduce((sum, row) => sum + row.seats, 0);
  const occupiedSeats = seats.filter(s => s.status === 'occupied').length;
  const availableSeats = totalSeats - occupiedSeats;
  const mySeats = seats.filter(s => s.assigned_user_id === user?.id);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading seats...</div>;
  }

  const renderSeatGrid = (rows: any[], floorLabel: string) => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-center">{floorLabel}</h3>
      {rows.map((row) => (
        <div key={row.row} className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-700">{row.label}</h4>
            <span className="text-sm text-gray-500">Row {row.row}</span>
          </div>
          <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: row.seats }, (_, i) => {
              const seatNumber = i + 1;
              const seatId = `${row.row}-${seatNumber}`;
              const status = getSeatStatus(seatId);
              const occupantName = getOccupantName(seatId);
              
              return (
                <button
                  key={seatId}
                  onClick={() => handleSeatClick(seatId)}
                  disabled={status === 'occupied' || status === 'maintenance' || status === 'my-seat'}
                  className={`
                    w-16 h-16 rounded-lg border-2 text-xs font-medium
                    flex flex-col items-center justify-center transition-colors
                    ${getSeatColor(status)}
                  `}
                >
                  <span className="font-bold">{seatNumber}</span>
                  {occupantName && (
                    <span className="text-[8px] leading-none truncate w-full text-center">
                      {occupantName}
                    </span>
                  )}
                  {status === 'my-seat' && (
                    <span className="text-[8px] leading-none">YOU</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
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
              <div className="text-2xl font-bold text-blue-600">{mySeats.length > 0 ? mySeats[0].id : 'None'}</div>
              <div className="text-sm text-gray-600">My Seat</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Seat Info */}
      {mySeats.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center">
              <User className="h-5 w-5 text-blue-600 mr-2" />
              <CardTitle className="text-blue-900">Your Current Seat</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold text-blue-900">Seat {mySeats[0].id}</p>
                <p className="text-blue-700">
                  Row {mySeats[0].row_letter}, Position {mySeats[0].seat_number}
                </p>
              </div>
              <Badge className="bg-blue-500 text-white">Your Seat</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seat Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Seat Arrangement - Two Floor Layout
          </CardTitle>
          <CardDescription>
            Click on an available seat to select and book it
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
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2"></div>
              <span className="text-sm">Occupied</span>
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
              <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded mr-2"></div>
              <span className="text-sm">Maintenance</span>
            </div>
          </div>

          {/* Two Floor Layout */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Lower Floor - Left Side */}
            <div className="border-2 border-blue-200 p-4 rounded-lg bg-blue-50">
              {renderSeatGrid(seatLayout.lowerFloor.leftSide, "Lower Floor - Left Side")}
            </div>

            {/* Upper Floor - Right Side */}
            <div className="border-2 border-green-200 p-4 rounded-lg bg-green-50">
              {renderSeatGrid(seatLayout.upperFloor.rightSide, "Upper Floor - Right Side")}
            </div>
          </div>

          {/* Book Button */}
          {selectedSeat && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Selected Seat: {selectedSeat}</p>
                  <p className="text-sm text-gray-600">
                    Row {selectedSeat.charAt(0)}, Position {selectedSeat.split('-')[1]}
                  </p>
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

      {/* Booking Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Seat Booking Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-green-700 mb-2">✅ Booking Guidelines</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Seats can only be booked after verification</li>
                <li>• Complete payment to activate your seat</li>
                <li>• You can change seats once per month</li>
                <li>• Inform reception desk for any issues</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-700 mb-2">❌ Restrictions</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Cannot book multiple seats simultaneously</li>
                <li>• Seat sharing is not allowed</li>
                <li>• Late arrivals may lose seat for that day</li>
                <li>• No reserving seats for others</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeatArrangement;
