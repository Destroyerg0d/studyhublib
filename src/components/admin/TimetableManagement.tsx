
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, Clock, Edit, Plus, Sun, Moon, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TimetableSlot {
  id?: string;
  name: string;
  time: string;
  end_time: string;
  type: string;
  description: string;
  active: boolean;
  plan_type: string;
  date: string;
}

const TimetableManagement = () => {
  const [timeSlots, setTimeSlots] = useState<TimetableSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const planTypes = ['full_shift', 'morning', 'evening', 'full_day'];
  const slotTypes = ['opening', 'closing', 'break', 'study', 'maintenance'];

  const fetchTimetableData = async () => {
    try {
      const weekStart = new Date(selectedDate);
      weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const { data, error } = await supabase
        .from('timetable_slots')
        .select('*')
        .gte('date', weekStart.toISOString().split('T')[0])
        .lte('date', weekEnd.toISOString().split('T')[0])
        .order('date')
        .order('time');

      if (error) throw error;

      setTimeSlots(data || []);
    } catch (error) {
      console.error('Error fetching timetable data:', error);
      toast({
        title: "Error",
        description: "Failed to load timetable data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetableData();
  }, [selectedDate]);

  const generateDefaultSchedule = () => {
    const weekStart = new Date(selectedDate);
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
    
    const defaultSlots: TimetableSlot[] = [];
    
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + day);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Skip if already has slots for this date
      if (timeSlots.some(slot => slot.date === dateStr)) continue;
      
      // Default schedule for each plan type
      const daySlots = [
        // Full Shift Plan (24 hours)
        { name: "Full Shift Opening", time: "00:00", end_time: "01:00", type: "opening", description: "24-hour access begins", active: true, plan_type: "full_shift", date: dateStr },
        { name: "Night Study", time: "01:00", end_time: "06:00", type: "study", description: "Deep focus hours", active: true, plan_type: "full_shift", date: dateStr },
        { name: "Morning Transition", time: "06:00", end_time: "08:00", type: "break", description: "Shift transition", active: true, plan_type: "full_shift", date: dateStr },
        
        // Morning Plan (6 AM - 2 PM)
        { name: "Morning Opening", time: "06:00", end_time: "06:30", type: "opening", description: "Morning session begins", active: true, plan_type: "morning", date: dateStr },
        { name: "Morning Study 1", time: "06:30", end_time: "10:00", type: "study", description: "First study block", active: true, plan_type: "morning", date: dateStr },
        { name: "Morning Break", time: "10:00", end_time: "10:30", type: "break", description: "Tea break", active: true, plan_type: "morning", date: dateStr },
        { name: "Morning Study 2", time: "10:30", end_time: "14:00", type: "study", description: "Second study block", active: true, plan_type: "morning", date: dateStr },
        
        // Evening Plan (2 PM - 10 PM)
        { name: "Evening Opening", time: "14:00", end_time: "14:30", type: "opening", description: "Evening session begins", active: true, plan_type: "evening", date: dateStr },
        { name: "Evening Study 1", time: "14:30", end_time: "17:30", type: "study", description: "First evening block", active: true, plan_type: "evening", date: dateStr },
        { name: "Evening Break", time: "17:30", end_time: "18:00", type: "break", description: "Dinner break", active: true, plan_type: "evening", date: dateStr },
        { name: "Evening Study 2", time: "18:00", end_time: "22:00", type: "study", description: "Second evening block", active: true, plan_type: "evening", date: dateStr },
        
        // Full Day Plan (6 AM - 10 PM)
        { name: "Full Day Opening", time: "06:00", end_time: "06:30", type: "opening", description: "Full day access begins", active: true, plan_type: "full_day", date: dateStr },
        { name: "Full Day Study 1", time: "06:30", end_time: "12:00", type: "study", description: "Morning study session", active: true, plan_type: "full_day", date: dateStr },
        { name: "Lunch Break", time: "12:00", end_time: "13:00", type: "break", description: "Lunch break", active: true, plan_type: "full_day", date: dateStr },
        { name: "Full Day Study 2", time: "13:00", end_time: "18:00", type: "study", description: "Afternoon study session", active: true, plan_type: "full_day", date: dateStr },
        { name: "Evening Break", time: "18:00", end_time: "18:30", type: "break", description: "Evening break", active: true, plan_type: "full_day", date: dateStr },
        { name: "Full Day Study 3", time: "18:30", end_time: "22:00", type: "study", description: "Evening study session", active: true, plan_type: "full_day", date: dateStr },
        { name: "Daily Closing", time: "22:00", end_time: "23:59", type: "closing", description: "Day session ends", active: true, plan_type: "full_day", date: dateStr },
      ];
      
      defaultSlots.push(...daySlots);
    }
    
    return defaultSlots;
  };

  const handleSaveSchedule = async () => {
    try {
      // Delete existing slots for the current week
      const weekStart = new Date(selectedDate);
      weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      await supabase
        .from('timetable_slots')
        .delete()
        .gte('date', weekStart.toISOString().split('T')[0])
        .lte('date', weekEnd.toISOString().split('T')[0]);

      // Insert updated slots
      const slotsToInsert = timeSlots.map(({ id, ...slot }) => slot);
      
      const { error } = await supabase
        .from('timetable_slots')
        .insert(slotsToInsert);

      if (error) throw error;

      toast({
        title: "Schedule Saved",
        description: "Timetable has been updated successfully",
      });

      setIsEditing(false);
      fetchTimetableData();
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast({
        title: "Error",
        description: "Failed to save schedule",
        variant: "destructive",
      });
    }
  };

  const handleSlotUpdate = (index: number, field: string, value: any) => {
    const updatedSlots = [...timeSlots];
    updatedSlots[index] = { ...updatedSlots[index], [field]: value };
    setTimeSlots(updatedSlots);
  };

  const addNewSlot = (date: string) => {
    const newSlot: TimetableSlot = {
      name: "New Slot",
      time: "09:00",
      end_time: "10:00",
      type: "study",
      description: "",
      active: true,
      plan_type: "morning",
      date: date
    };
    setTimeSlots([...timeSlots, newSlot]);
  };

  const removeSlot = (index: number) => {
    const updatedSlots = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(updatedSlots);
  };

  const getWeekDates = () => {
    const weekStart = new Date(selectedDate);
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedDate(newDate);
  };

  const getSlotsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return timeSlots
      .map((slot, index) => ({ ...slot, originalIndex: index }))
      .filter(slot => slot.date === dateStr);
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getPlanColor = (planType: string) => {
    switch (planType.toLowerCase()) {
      case 'full_shift': return 'bg-orange-100 text-orange-800';
      case 'morning': return 'bg-purple-100 text-purple-800';
      case 'evening': return 'bg-green-100 text-green-800';
      case 'full_day': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const weekDates = getWeekDates();

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <CardTitle className="text-blue-900">Weekly Timetable Management</CardTitle>
                <CardDescription className="text-blue-700">
                  Configure operating hours for each day of the week
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing && (
                <Button onClick={handleSaveSchedule} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              )}
              <Button
                variant={isEditing ? "outline" : "default"}
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "Cancel" : "Edit Schedule"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Week Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold">
                Week of {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - 
                {weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            {isEditing && (
              <Button
                onClick={() => {
                  const defaultSlots = generateDefaultSchedule();
                  setTimeSlots([...timeSlots, ...defaultSlots]);
                }}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Generate Default Schedule
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {weekDates.map((date, dayIndex) => {
              const daySlots = getSlotsForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <Card key={dayIndex} className={isToday ? 'ring-2 ring-yellow-400' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {date.toLocaleDateString('en-US', { weekday: 'long' })}
                      </CardTitle>
                      <span className="text-sm text-gray-600">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {isEditing && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addNewSlot(date.toISOString().split('T')[0])}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Slot
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {daySlots.length === 0 ? (
                      <p className="text-gray-500 text-sm">No schedule for this day</p>
                    ) : (
                      daySlots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="p-3 border rounded-lg space-y-2">
                          {isEditing ? (
                            <div className="space-y-2">
                              <Input
                                value={slot.name}
                                onChange={(e) => handleSlotUpdate(slot.originalIndex!, 'name', e.target.value)}
                                placeholder="Slot name"
                                className="text-sm"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  type="time"
                                  value={slot.time}
                                  onChange={(e) => handleSlotUpdate(slot.originalIndex!, 'time', e.target.value)}
                                  className="text-sm"
                                />
                                <Input
                                  type="time"
                                  value={slot.end_time}
                                  onChange={(e) => handleSlotUpdate(slot.originalIndex!, 'end_time', e.target.value)}
                                  className="text-sm"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <Select
                                  value={slot.type}
                                  onValueChange={(value) => handleSlotUpdate(slot.originalIndex!, 'type', value)}
                                >
                                  <SelectTrigger className="text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {slotTypes.map(type => (
                                      <SelectItem key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Select
                                  value={slot.plan_type}
                                  onValueChange={(value) => handleSlotUpdate(slot.originalIndex!, 'plan_type', value)}
                                >
                                  <SelectTrigger className="text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {planTypes.map(plan => (
                                      <SelectItem key={plan} value={plan}>
                                        {plan.replace('_', ' ').charAt(0).toUpperCase() + plan.replace('_', ' ').slice(1)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Input
                                value={slot.description}
                                onChange={(e) => handleSlotUpdate(slot.originalIndex!, 'description', e.target.value)}
                                placeholder="Description"
                                className="text-sm"
                              />
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={slot.active}
                                    onCheckedChange={(checked) => handleSlotUpdate(slot.originalIndex!, 'active', checked)}
                                  />
                                  <Label className="text-sm">Active</Label>
                                </div>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removeSlot(slot.originalIndex!)}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-sm">{slot.name}</h4>
                                {!slot.active && <Badge variant="secondary">Inactive</Badge>}
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                {formatTime(slot.time)} - {formatTime(slot.end_time)}
                              </div>
                              <div className="flex items-center justify-between">
                                <Badge className={getPlanColor(slot.plan_type)}>
                                  {slot.plan_type.replace('_', ' ')}
                                </Badge>
                                <Badge variant="outline">{slot.type}</Badge>
                              </div>
                              {slot.description && (
                                <p className="text-xs text-gray-500 mt-2">{slot.description}</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Plan Types Info */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Types Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-semibold text-orange-800 mb-2">Full Shift</h4>
              <p className="text-sm text-orange-700">24-hour access for round-the-clock study</p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">Morning</h4>
              <p className="text-sm text-purple-700">6:00 AM - 2:00 PM study session</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Evening</h4>
              <p className="text-sm text-green-700">2:00 PM - 10:00 PM study session</p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Full Day</h4>
              <p className="text-sm text-blue-700">6:00 AM - 10:00 PM comprehensive access</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimetableManagement;
