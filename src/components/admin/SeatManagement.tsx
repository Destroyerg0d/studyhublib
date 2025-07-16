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
import { Users, Settings, Eye, UserX, BarChart3, Building, Building2 } from "lucide-react";
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
  plans: {
    name: string;
    type: string;
  };
}

const SeatManagement = () => {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
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
          plans (
            name,
            type
          )
        `)
        .eq('status', 'active');

      if (subscriptionsError) throw subscriptionsError;

      setSeats(seatsData || []);
      setProfiles(profilesData || []);
      setSubscriptions(subscriptionsData || []);
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSeatAction = async (action: string, seatId: string) => {
    try {
      if (action === "Release Seat") {
        const { error } = await supabase
          .from('seats')
          .update({ 
            status: 'available', 
            assigned_user_id: null 
          })
          .eq('id', seatId);

        if (error) throw error;
      }

      toast({
        title: `${action} successful`,
        description: `Action completed for seat ${seatId}`,
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
    if (!seat) return 'available';
    return seat.status;
  };

  const renderSeat = (seatNumber: number) => {
    const seatInfo = getSeatInfo(seatNumber);
    const status = getSeatStatus(seatNumber);
    
    let seatColor = 'bg-gray-100 text-gray-800 border-gray-300';
    
    if (seatInfo?.subscription?.plans) {
      seatColor = getPlanColor(seatInfo.subscription.plans.type);
    }

    return (
      <Dialog key={seatNumber}>
        <DialogTrigger asChild>
          <button
            className={`
              w-16 h-16 rounded-lg border-2 text-xs font-medium
              flex flex-col items-center justify-center transition-colors
              hover:shadow-md cursor-pointer
              ${seatColor}
            `}
          >
            <span className="font-bold">{seatNumber}</span>
            {seatInfo?.user && (
              <span className="text-[8px] leading-none truncate w-full text-center">
                {seatInfo.user.name.split(' ')[0]}
              </span>
            )}
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seat {seatNumber} Details</DialogTitle>
            <DialogDescription>
              Manage this seat assignment and view details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {seatInfo?.user ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Student Name</Label>
                    <p className="text-sm">{seatInfo.user.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm">{seatInfo.user.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Plan</Label>
                    <p className="text-sm">{seatInfo.subscription?.plans?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Plan Type</Label>
                    <Badge className={getPlanColor(seatInfo.subscription?.plans?.type || '')}>
                      {seatInfo.subscription?.plans?.type || 'N/A'}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSeatAction("View Profile", seatNumber.toString())}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSeatAction("Release Seat", seatNumber.toString())}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Release Seat
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">This seat is available</p>
                <Button
                  className="mt-3"
                  size="sm"
                  onClick={() => handleSeatAction("Assign Seat", seatNumber.toString())}
                >
                  Assign to Student
                </Button>
              </div>
            )}
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
  const occupiedSeats = seats.filter(seat => seat.status === 'occupied').length;
  const availableSeats = totalSeats - occupiedSeats;
  const activeSeats = seats.filter(seat => seat.status === 'occupied').length;

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
              <div className="text-2xl font-bold text-green-600">{activeSeats}</div>
              <div className="text-sm text-gray-600">Active</div>
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
                {totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Occupancy</div>
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
                {totalSeats > 0 ? Math.round((activeSeats / totalSeats) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Active Occupancy Rate</div>
              <div className="text-xs text-green-600">Real-time data</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ₹{(activeSeats * 1000).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Monthly Revenue from Seats</div>
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
    </div>
  );
};

export default SeatManagement;
