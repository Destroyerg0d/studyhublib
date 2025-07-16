
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users, Eye, UserX, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Seat = Tables<'seats'>;
type Profile = Tables<'profiles'>;
type Subscription = Tables<'subscriptions'>;

const SeatManagement = () => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Define seat arrangement matching the user view
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
    fetchData();

    // Set up real-time subscriptions
    const seatsChannel = supabase
      .channel('admin-seats-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seats' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(seatsChannel);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [seatsResult, profilesResult, subscriptionsResult] = await Promise.all([
        supabase.from('seats').select('*').order('row_letter').order('seat_number'),
        supabase.from('profiles').select('*'),
        supabase.from('subscriptions').select('*').eq('status', 'active')
      ]);

      if (seatsResult.error) throw seatsResult.error;
      if (profilesResult.error) throw profilesResult.error;
      if (subscriptionsResult.error) throw subscriptionsResult.error;

      setSeats(seatsResult.data || []);
      setProfiles(profilesResult.data || []);
      setSubscriptions(subscriptionsResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error loading data",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSeatAction = async (action: string, seatId: string) => {
    try {
      if (action === "Release Seat") {
        await supabase
          .from('seats')
          .update({ 
            status: 'available',
            assigned_user_id: null
          })
          .eq('id', seatId);
      }

      toast({
        title: `${action} successful`,
        description: `Action completed for seat ${seatId}`,
      });
    } catch (error) {
      console.error('Error performing seat action:', error);
      toast({
        title: "Action failed",
        description: "There was an error performing the action.",
        variant: "destructive",
      });
    }
  };

  const getSeatStatus = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat) return 'available';
    return seat.status;
  };

  const getSeatAssignment = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat?.assigned_user_id) return null;
    
    const profile = profiles.find(p => p.id === seat.assigned_user_id);
    const subscription = subscriptions.find(s => s.seat_id === seatId);
    
    return profile ? {
      user: profile.name,
      email: profile.email,
      status: subscription?.status || 'inactive'
    } : null;
  };

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'bg-green-100 text-green-800 border-green-300';
      case 'maintenance': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'available': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const totalSeats = Object.values(seatLayout.lowerFloor.leftSide).reduce((sum, row) => sum + row.seats, 0) +
                   Object.values(seatLayout.upperFloor.rightSide).reduce((sum, row) => sum + row.seats, 0);
  const occupiedSeats = seats.filter(s => s.status === 'occupied').length;
  const availableSeats = totalSeats - occupiedSeats;
  const activeSeats = seats.filter(s => s.status === 'occupied').length;

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
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
              const assignment = getSeatAssignment(seatId);
              
              return (
                <Dialog key={seatId}>
                  <DialogTrigger asChild>
                    <button
                      className={`
                        w-16 h-16 rounded-lg border-2 text-xs font-medium
                        flex flex-col items-center justify-center transition-colors
                        hover:shadow-md cursor-pointer
                        ${getSeatColor(status)}
                      `}
                    >
                      <span className="font-bold">{seatNumber}</span>
                      {assignment && (
                        <span className="text-[8px] leading-none truncate w-full text-center">
                          {assignment.user.split(' ')[0]}
                        </span>
                      )}
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Seat {seatId} Details</DialogTitle>
                      <DialogDescription>
                        Manage this seat assignment and view details
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      {assignment ? (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Student Name</label>
                              <p className="text-sm">{assignment.user}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Email</label>
                              <p className="text-sm">{assignment.email}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Status</label>
                              <Badge className={getSeatColor(status)}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSeatAction("View Profile", seatId)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSeatAction("Release Seat", seatId)}
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
                            onClick={() => handleSeatAction("Assign Seat", seatId)}
                          >
                            Assign to Student
                          </Button>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

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
                {Math.round((occupiedSeats / totalSeats) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Occupancy</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Seat Management - Two Floor Layout
          </CardTitle>
          <CardDescription>
            Manage seat assignments and monitor occupancy
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
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
              <span className="text-sm">Occupied</span>
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
                {Math.round((activeSeats / totalSeats) * 100)}%
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
                {seats.filter(s => s.status === 'maintenance').length}
              </div>
              <div className="text-sm text-gray-600">Maintenance Required</div>
              <div className="text-xs text-orange-600">Need attention</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeatManagement;
