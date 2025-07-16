
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, CheckCircle, User, Building } from "lucide-react";

const SeatArrangement = () => {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [bookedSeats, setBookedSeats] = useState<Set<string>>(new Set([
    'L-1', 'L-2', 'L-3', 'L-4', 'L-5', 'L-6', 'L-8', 'L-10', 'L-11', 'L-13', 'L-14', 'L-16', 'L-17', 'L-18',
    'U-19', 'U-20', 'U-21', 'U-23', 'U-28', 'U-30', 'U-31', 'U-32', 'U-33', 'U-34', 'U-35', 'U-36', 'U-37', 'U-38', 'U-39', 'U-40'
  ]));
  const [mySeat, setMySeat] = useState<string | null>('L-7');
  const { toast } = useToast();

  // Define seat arrangement based on your Excel sheet: Lower Floor (18 seats) + Upper Floor (18 seats) = 36 total
  const lowerFloorSeats = Array.from({ length: 18 }, (_, i) => `L-${i + 1}`);
  const upperFloorSeats = Array.from({ length: 18 }, (_, i) => `U-${i + 19}`);

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

  const totalSeats = 36;
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
                  {mySeat.startsWith('L') ? 'Lower Floor' : 'Upper Floor'}
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
            Seat Arrangement (36 Seats - 2 Floors)
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

          {/* Lower Floor */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 flex items-center">
                <Building className="h-4 w-4 mr-2" />
                Lower Floor (Seats 1-18)
              </h3>
              <div className="grid grid-cols-6 gap-2">
                {lowerFloorSeats.map((seatId) => {
                  const status = getSeatStatus(seatId);
                  const seatNumber = seatId.split('-')[1];
                  
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

            {/* Upper Floor */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 flex items-center">
                <Building className="h-4 w-4 mr-2" />
                Upper Floor (Seats 19-36)
              </h3>
              <div className="grid grid-cols-6 gap-2">
                {upperFloorSeats.map((seatId) => {
                  const status = getSeatStatus(seatId);
                  const seatNumber = seatId.split('-')[1];
                  
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
          </div>

          {/* Book Button */}
          {selectedSeat && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Selected Seat: {selectedSeat}</p>
                  <p className="text-sm text-gray-600">
                    {selectedSeat.startsWith('L') ? 'Lower Floor' : 'Upper Floor'}
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
          <CardTitle>Current Fees Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-700 mb-3">📅 Day Shifts</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-blue-50 rounded">
                  <span>Full Day (8AM - 10PM)</span>
                  <span className="font-semibold">₹1,000</span>
                </div>
                <div className="flex justify-between p-2 bg-green-50 rounded">
                  <span>Morning (8AM - 3PM)</span>
                  <span className="font-semibold">₹600</span>
                </div>
                <div className="flex justify-between p-2 bg-orange-50 rounded">
                  <span>Evening (3PM - 10PM)</span>
                  <span className="font-semibold">₹600</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-purple-700 mb-3">🌙 Extended Shifts</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-purple-50 rounded">
                  <span>24 Hours (8AM - 8AM)</span>
                  <span className="font-semibold">₹2,000</span>
                </div>
                <div className="flex justify-between p-2 bg-indigo-50 rounded">
                  <span>Night Shift (10PM - 6AM)</span>
                  <span className="font-semibold">₹1,200</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
                <p><strong>Note:</strong> Full Shift allows 2 people to share one seat (Morning + Evening users)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeatArrangement;
