
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, CheckCircle, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Seat = Tables<'seats'>;

const SeatArrangement = () => {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

    // Set up real-time subscriptions
    const seatsChannel = supabase
      .channel('seats-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seats' }, fetchSeats)
      .subscribe();

    return () => {
      supabase.removeChannel(seatsChannel);
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

  const handleSeatClick = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat || seat.status !== 'available') return;
    
    setSelectedSeat(selectedSeat === seatId ? null : seatId);
  };

  const handleBookSeat = async () => {
    if (!selectedSeat) {
      toast({
        title: "Please select a seat",
        description: "Choose an available seat to book.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update seat status
      const { error: seatError } = await supabase
        .from('seats')
        .update({ 
          status: 'occupied'
        })
        .eq('id', selectedSeat);

      if (seatError) throw seatError;

      setSelectedSeat(null);
      toast({
        title: "Seat booked successfully!",
        description: `You have booked seat ${selectedSeat}.`,
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
    
    if (seat.status === 'occupied') return 'occupied';
    if (seat.status === 'maintenance') return 'maintenance';
    if (selectedSeat === seatId) return 'selected';
    return 'available';
  };

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'bg-red-100 text-red-800 border-red-300 cursor-not-allowed';
      case 'maintenance': return 'bg-orange-100 text-orange-800 border-orange-300 cursor-not-allowed';
      case 'selected': return 'bg-yellow-200 text-yellow-900 border-yellow-400';
      case 'available': return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200 cursor-pointer';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const totalSeats = Object.values(seatLayout.lowerFloor.leftSide).reduce((sum, row) => sum + row.seats, 0) +
                   Object.values(seatLayout.upperFloor.rightSide).reduce((sum, row) => sum + row.seats, 0);
  const occupiedSeats = seats.filter(s => s.status === 'occupied').length;
  const availableSeats = totalSeats - occupiedSeats;

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
              
              return (
                <button
                  key={seatId}
                  onClick={() => handleSeatClick(seatId)}
                  disabled={status === 'occupied' || status === 'maintenance'}
                  className={`
                    w-16 h-16 rounded-lg border-2 text-xs font-medium
                    flex flex-col items-center justify-center transition-colors
                    ${getSeatColor(status)}
                  `}
                >
                  <span className="font-bold">{seatNumber}</span>
                  {status === 'occupied' && (
                    <span className="text-[8px] leading-none">TAKEN</span>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>

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
                <li>• Seats can be booked anytime</li>
                <li>• First come, first served basis</li>
                <li>• You can change seats as needed</li>
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
