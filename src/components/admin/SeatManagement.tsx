
import { useState } from "react";
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
import { Users, Settings, Eye, UserX, BarChart3 } from "lucide-react";

const SeatManagement = () => {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const { toast } = useToast();

  // Mock seat data with assignments
  const seatAssignments = {
    'A-1': { user: 'Rahul Kumar', email: 'rahul@email.com', plan: 'Day Time', status: 'active' },
    'A-3': { user: 'Priya Sharma', email: 'priya@email.com', plan: 'Night Time', status: 'active' },
    'A-5': { user: 'Amit Singh', email: 'amit@email.com', plan: 'Day Time', status: 'pending' },
    'B-2': { user: 'Sneha Patel', email: 'sneha@email.com', plan: 'Day Time', status: 'active' },
    'B-4': { user: 'Vikash Gupta', email: 'vikash@email.com', plan: 'Day Time', status: 'overdue' },
    'C-1': { user: 'Ravi Sharma', email: 'ravi@email.com', plan: 'Night Time', status: 'active' },
    'C-3': { user: 'Anjali Verma', email: 'anjali@email.com', plan: 'Day Time', status: 'active' },
    'D-2': { user: 'Manish Kumar', email: 'manish@email.com', plan: 'Day Time', status: 'active' },
    'D-6': { user: 'Kavya Singh', email: 'kavya@email.com', plan: 'Night Time', status: 'active' },
  };

  const seatRows = [
    { row: 'A', seats: 5, label: 'Row 1' },
    { row: 'B', seats: 5, label: 'Row 2' },
    { row: 'C', seats: 5, label: 'Row 3' },
    { row: 'D', seats: 6, label: 'Row 4' },
  ];

  const handleSeatAction = (action: string, seatId: string) => {
    toast({
      title: `${action} successful`,
      description: `Action completed for seat ${seatId}`,
    });
  };

  const getSeatStatus = (seatId: string) => {
    const assignment = seatAssignments[seatId as keyof typeof seatAssignments];
    if (!assignment) return 'available';
    return assignment.status;
  };

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-300';
      case 'available': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const totalSeats = seatRows.reduce((sum, row) => sum + row.seats, 0);
  const occupiedSeats = Object.keys(seatAssignments).length;
  const availableSeats = totalSeats - occupiedSeats;
  const activeSeats = Object.values(seatAssignments).filter(a => a.status === 'active').length;

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
            Seat Management
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
              <span className="text-sm">Active</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded mr-2"></div>
              <span className="text-sm">Pending</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2"></div>
              <span className="text-sm">Overdue</span>
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
                    const assignment = seatAssignments[seatId as keyof typeof seatAssignments];
                    
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
                              <span className="text-[8px] leading-none">
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
                                    <Label className="text-sm font-medium">Student Name</Label>
                                    <p className="text-sm">{assignment.user}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Email</Label>
                                    <p className="text-sm">{assignment.email}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Plan</Label>
                                    <p className="text-sm">{assignment.plan}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Status</Label>
                                    <Badge className={getSeatColor(assignment.status)}>
                                      {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
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
              <div className="text-xs text-green-600">+5% from last month</div>
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
                {Object.values(seatAssignments).filter(a => a.status === 'pending').length}
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
