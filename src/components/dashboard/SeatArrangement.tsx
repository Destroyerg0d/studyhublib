
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Users, CheckCircle, User, Building, Building2 } from "lucide-react";

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

const SeatArrangement = () => {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [userSeat, setUserSeat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchSeats = async () => {
    try {
      const { data, error } = await supabase
        .from('seats')
        .select('*')
        .order('row_letter')
        .order('seat_number');

      if (error) throw error;
      setSeats(data || []);

      // Find user's current seat
      const currentUserSeat = data?.find(seat => seat.assigned_user_id === user?.id);
      setUserSeat(currentUserSeat?.id || null);
    } catch (error) {
      console.error('Error fetching seats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch seats",
        variant: "destructive",
      });
    }
  };

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('active', true)
        .order('price');

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
    fetchPlans();

    // Set up real-time subscription for seats
    const channel = supabase
      .channel('seat-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'seats' }, 
        () => fetchSeats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleSeatClick = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat || seat.status === 'occupied' || seat.id === userSeat) return;
    setSelectedSeat(selectedSeat === seatId ? null : seatId);
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

    try {
      // Release current seat if user has one
      if (userSeat) {
        await supabase
          .from('seats')
          .update({ 
            status: 'available', 
            assigned_user_id: null 
          })
          .eq('id', userSeat);
      }

      // Book new seat
      const { error } = await supabase
        .from('seats')
        .update({ 
          status: 'occupied', 
          assigned_user_id: user.id 
        })
        .eq('id', selectedSeat);

      if (error) throw error;

      toast({
        title: "Seat booked successfully!",
        description: `You have booked seat ${selectedSeat}. ${userSeat ? 'Your previous seat has been released.' : ''}`,
      });

      setSelectedSeat(null);
      fetchSeats();
    } catch (error) {
      console.error('Error booking seat:', error);
      toast({
        title: "Error",
        description: "Failed to book seat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getSeatStatus = (seat: Seat) => {
    if (seat.id === userSeat) return 'my-seat';
    if (seat.status === 'occupied') return 'booked';
    if (selectedSeat === seat.id) return 'selected';
    return 'available';
  };

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'my-seat': return 'bg-blue-500 text-white border-blue-600';
      case 'booked': return 'bg-red-100 text-red-800 border-red-300 cursor-not-allowed';
      case 'selected': return 'bg-yellow-200 text-yellow-900 border-yellow-400';
      case 'available': return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200 cursor-pointer';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading seats...</div>
      </div>
    );
  }

  const totalSeats = seats.length;
  const occupiedSeats = seats.filter(seat => seat.status === 'occupied').length;
  const availableSeats = totalSeats - occupiedSeats;

  // Group seats by floor and section
  const lowerFloorSeats = seats.filter(seat => seat.row_letter === 'A' || seat.row_letter === 'B');
  const upperFloorSeats = seats.filter(seat => seat.row_letter === 'C' || seat.row_letter === 'D');

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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div key={plan.id} className="p-4 bg-blue-50 rounded-lg border">
                <h4 className="font-semibold text-blue-900">{plan.name}</h4>
                <p className="text-sm text-blue-700">{plan.type}</p>
                <p className="text-xl font-bold text-blue-900">₹{plan.price}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Seat Info */}
      {userSeat && (
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
                <p className="text-lg font-semibold text-blue-900">Seat {userSeat}</p>
                <p className="text-blue-700">
                  Your assigned seat
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
            <Building className="h-5 w-5 mr-2" />
            Lower Floor Layout
          </CardTitle>
          <CardDescription>
            Sections A & B - Click on an available seat to select and book it
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
          </div>

          {/* Lower Floor Grid */}
          <div className="space-y-6">
            {['A', 'B'].map((section) => {
              const sectionSeats = lowerFloorSeats.filter(seat => seat.row_letter === section);
              return (
                <div key={section} className="space-y-2">
                  <h3 className="font-medium text-gray-700">Section {section}</h3>
                  <div className="flex flex-wrap gap-2">
                    {sectionSeats.map((seat) => {
                      const status = getSeatStatus(seat);
                      return (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatClick(seat.id)}
                          disabled={status === 'booked' || status === 'my-seat'}
                          className={`
                            w-12 h-12 rounded-lg border-2 text-xs font-medium
                            flex items-center justify-center transition-colors
                            ${getSeatColor(status)}
                          `}
                        >
                          {seat.seat_number}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upper Floor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Upper Floor Layout
          </CardTitle>
          <CardDescription>
            Sections C & D
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Upper Floor Grid */}
          <div className="space-y-6">
            {['C', 'D'].map((section) => {
              const sectionSeats = upperFloorSeats.filter(seat => seat.row_letter === section);
              return (
                <div key={section} className="space-y-2">
                  <h3 className="font-medium text-gray-700">Section {section}</h3>
                  <div className="flex flex-wrap gap-2">
                    {sectionSeats.map((seat) => {
                      const status = getSeatStatus(seat);
                      return (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatClick(seat.id)}
                          disabled={status === 'booked' || status === 'my-seat'}
                          className={`
                            w-12 h-12 rounded-lg border-2 text-xs font-medium
                            flex items-center justify-center transition-colors
                            ${getSeatColor(status)}
                          `}
                        >
                          {seat.seat_number}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Book Button */}
          {selectedSeat && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Selected Seat: {selectedSeat}</p>
                  <p className="text-sm text-gray-600">
                    Ready to book this seat
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
    </div>
  );
};

export default SeatArrangement;
