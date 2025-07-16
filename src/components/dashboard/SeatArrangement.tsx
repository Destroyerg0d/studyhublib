
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, CheckCircle, X, User } from "lucide-react";

const SeatArrangement = () => {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [bookedSeats, setBookedSeats] = useState<Set<string>>(new Set(['A-3', 'A-5', 'B-2', 'B-4', 'C-1', 'C-3', 'D-2', 'D-6']));
  const [mySeat, setMySeat] = useState<string | null>('A-15'); // User's current seat
  const { toast } = useToast();

  // Define seat arrangement: 4 rows with different column counts
  const seatRows = [
    { row: 'A', seats: 5, label: 'Row 1' },
    { row: 'B', seats: 5, label: 'Row 2' },
    { row: 'C', seats: 5, label: 'Row 3' },
    { row: 'D', seats: 6, label: 'Row 4' },
  ];

  const handleSeatClick = (seatId: string) => {
    if (bookedSeats.has(seatId) || seatId === mySeat) return;
    setSelectedSeat(selectedSeat === seatId ? null : seatId);
  };

  const handleBookSeat = () => {
    if (!selectedSeat) {
      toast({
        title: "Please select a seat",
        description: "Choose an available seat to book.",
        variant: "destructive",
      });
      return;
    }

    // Simulate booking
    setBookedSeats(prev => new Set([...prev, selectedSeat]));
    if (mySeat) {
      setBookedSeats(prev => {
        const newSet = new Set(prev);
        newSet.delete(mySeat);
        return newSet;
      });
    }
    setMySeat(selectedSeat);
    setSelectedSeat(null);

    toast({
      title: "Seat booked successfully!",
      description: `You have booked seat ${selectedSeat}. Your previous seat has been released.`,
    });
  };

  const getSeatStatus = (seatId: string) => {
    if (seatId === mySeat) return 'my-seat';
    if (bookedSeats.has(seatId)) return 'booked';
    if (selectedSeat === seatId) return 'selected';
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

  const totalSeats = seatRows.reduce((sum, row) => sum + row.seats, 0);
  const availableSeats = totalSeats - bookedSeats.size;

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
              <div className="text-2xl font-bold text-red-600">{bookedSeats.size}</div>
              <div className="text-sm text-gray-600">Occupied</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{mySeat || 'None'}</div>
              <div className="text-sm text-gray-600">My Seat</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Seat Info */}
      {mySeat && (
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
                <p className="text-lg font-semibold text-blue-900">Seat {mySeat}</p>
                <p className="text-blue-700">
                  Row {mySeat.charAt(0)}, Position {mySeat.split('-')[1]}
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
            Seat Arrangement
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
          </div>

          {/* Seat Grid */}
          <div className="space-y-6">
            {seatRows.map((row) => (
              <div key={row.row} className="space-y-2">
                <h3 className="font-medium text-gray-700">{row.label}</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: row.seats }, (_, i) => {
                    const seatNumber = i + 1;
                    const seatId = `${row.row}-${seatNumber}`;
                    const status = getSeatStatus(seatId);
                    
                    return (
                      <button
                        key={seatId}
                        onClick={() => handleSeatClick(seatId)}
                        disabled={status === 'booked' || status === 'my-seat'}
                        className={`
                          w-12 h-12 rounded-lg border-2 text-xs font-medium
                          flex items-center justify-center transition-colors
                          ${getSeatColor(status)}
                        `}
                      >
                        {seatNumber}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
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
                <li>• Seats can only be booked after fee payment</li>
                <li>• Booking duration matches your payment period</li>
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
