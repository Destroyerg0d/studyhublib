
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, Clock, Edit, Plus, Sun, Moon, Settings } from "lucide-react";

const TimetableManagement = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const [timeSlots, setTimeSlots] = useState([
    { id: 1, name: "Morning Start", time: "08:00", type: "day", active: true, description: "Library opens for day session" },
    { id: 2, name: "Peak Hours", time: "09:00", type: "day", active: true, description: "Peak study hours begin" },
    { id: 3, name: "Lunch Break", time: "12:00", type: "day", active: true, description: "Lunch break period" },
    { id: 4, name: "Afternoon Session", time: "13:00", type: "day", active: true, description: "Post-lunch session resumes" },
    { id: 5, name: "Evening Peak", time: "18:00", type: "day", active: true, description: "Evening peak hours" },
    { id: 6, name: "Day Close", time: "22:00", type: "day", active: true, description: "Day session ends" },
    { id: 7, name: "Night Start", time: "22:00", type: "night", active: true, description: "Night session begins" },
    { id: 8, name: "Quiet Hours", time: "00:00", type: "night", active: true, description: "Deep focus hours" },
    { id: 9, name: "Deep Study", time: "03:00", type: "night", active: true, description: "Minimal activity period" },
    { id: 10, name: "Night Close", time: "06:00", type: "night", active: true, description: "Night session ends" },
  ]);

  const [holidays, setHolidays] = useState([
    { id: 1, date: "2024-12-25", name: "Christmas Day", type: "closed", recurring: true },
    { id: 2, date: "2025-01-01", name: "New Year's Day", type: "half-day", recurring: true },
    { id: 3, date: "2025-01-26", name: "Republic Day", type: "closed", recurring: true },
    { id: 4, date: "2025-03-08", name: "Holi", type: "closed", recurring: false },
  ]);

  const handleTimeSlotUpdate = (id: number, field: string, value: any) => {
    setTimeSlots(prev => prev.map(slot => 
      slot.id === id ? { ...slot, [field]: value } : slot
    ));
    toast({
      title: "Time slot updated",
      description: "The schedule has been updated successfully.",
    });
  };

  const handleAddHoliday = () => {
    const newHoliday = {
      id: holidays.length + 1,
      date: "",
      name: "",
      type: "closed",
      recurring: false,
    };
    setHolidays(prev => [...prev, newHoliday]);
  };

  const daySlots = timeSlots.filter(slot => slot.type === "day");
  const nightSlots = timeSlots.filter(slot => slot.type === "night");

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <CardTitle className="text-blue-900">Library Schedule Management</CardTitle>
                <CardDescription className="text-blue-700">
                  Configure operating hours and manage special schedules
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-green-500 text-white">Currently Open</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Time Slots Management */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Day Time Slots */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Sun className="h-5 w-5 text-yellow-600 mr-2" />
                <CardTitle>Day Time Schedule</CardTitle>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "Save" : "Edit"}
              </Button>
            </div>
            <CardDescription>8:00 AM - 10:00 PM</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {daySlots.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <Input
                          value={slot.name}
                          onChange={(e) => handleTimeSlotUpdate(slot.id, 'name', e.target.value)}
                          className="text-sm"
                        />
                        <Input
                          type="time"
                          value={slot.time}
                          onChange={(e) => handleTimeSlotUpdate(slot.id, 'time', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    ) : (
                      <>
                        <p className="font-medium">{slot.time}</p>
                        <p className="text-sm text-gray-600">{slot.name}</p>
                        <p className="text-xs text-gray-500">{slot.description}</p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={slot.active}
                      onCheckedChange={(checked) => handleTimeSlotUpdate(slot.id, 'active', checked)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Night Time Slots */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Moon className="h-5 w-5 text-blue-600 mr-2" />
                <CardTitle>Night Time Schedule</CardTitle>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "Save" : "Edit"}
              </Button>
            </div>
            <CardDescription>10:00 PM - 6:00 AM</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nightSlots.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <Input
                          value={slot.name}
                          onChange={(e) => handleTimeSlotUpdate(slot.id, 'name', e.target.value)}
                          className="text-sm"
                        />
                        <Input
                          type="time"
                          value={slot.time}
                          onChange={(e) => handleTimeSlotUpdate(slot.id, 'time', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    ) : (
                      <>
                        <p className="font-medium">{slot.time}</p>
                        <p className="text-sm text-gray-600">{slot.name}</p>
                        <p className="text-xs text-gray-500">{slot.description}</p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={slot.active}
                      onCheckedChange={(checked) => handleTimeSlotUpdate(slot.id, 'active', checked)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holidays Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-red-600 mr-2" />
              <CardTitle>Holidays & Special Days</CardTitle>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Holiday
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Holiday</DialogTitle>
                  <DialogDescription>
                    Configure a new holiday or special day schedule
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="holiday-name">Holiday Name</Label>
                    <Input id="holiday-name" placeholder="e.g., Independence Day" />
                  </div>
                  <div>
                    <Label htmlFor="holiday-date">Date</Label>
                    <Input id="holiday-date" type="date" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="recurring" />
                    <Label htmlFor="recurring">Recurring annually</Label>
                  </div>
                  <Button onClick={handleAddHoliday} className="w-full">
                    Add Holiday
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>Manage library closures and special timings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {holidays.map((holiday) => (
              <div key={holiday.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{holiday.name}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(holiday.date).toLocaleDateString()}
                    {holiday.recurring && " (Annual)"}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={holiday.type === 'closed' ? 'destructive' : 'secondary'}>
                    {holiday.type === 'closed' ? 'Closed' : 'Half Day'}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">14</div>
              <div className="text-sm text-gray-600">Operating Hours/Day</div>
              <div className="text-xs text-green-600">Day + Night sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">24/7</div>
              <div className="text-sm text-gray-600">Availability</div>
              <div className="text-xs text-blue-600">Round-the-clock access</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{holidays.length}</div>
              <div className="text-sm text-gray-600">Scheduled Holidays</div>
              <div className="text-xs text-gray-600">This year</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">95%</div>
              <div className="text-sm text-gray-600">Uptime</div>
              <div className="text-xs text-green-600">This month</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimetableManagement;
