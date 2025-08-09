import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Bell, Coffee, BookOpen, Sun, Moon, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
interface TimetableSlot {
  id: string;
  name: string;
  time: string;
  end_time: string;
  type: string;
  description: string | null;
  active: boolean;
  plan_type: string;
  date: string;
}
interface Holiday {
  id: string;
  name: string;
  date: string;
  type: string;
  recurring: boolean;
}
const Timetable = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const fetchDaySchedule = async (date: Date) => {
    try {
      setLoading(true);
      const dateString = date.toISOString().split('T')[0];

      // Fetch timetable slots for the selected date
      const {
        data: timetableData,
        error: timetableError
      } = await supabase.from('timetable_slots').select('*').eq('active', true).eq('date', dateString).order('time');
      if (timetableError) throw timetableError;

      // Fetch holidays for the selected date
      const {
        data: holidayData,
        error: holidayError
      } = await supabase.from('holidays').select('*').eq('date', dateString);
      if (holidayError) throw holidayError;
      setSlots(timetableData || []);
      setHolidays(holidayData || []);
    } catch (error) {
      console.error('Error fetching schedule for date:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDaySchedule(currentDate);

    // Update current time every minute for real-time updates (only for today)
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Set up real-time subscription for the current date
    const dateString = currentDate.toISOString().split('T')[0];
    const channel = supabase.channel(`day-schedule-${dateString}`).on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'timetable_slots',
      filter: `date=eq.${dateString}`
    }, () => {
      console.log('Timetable slot updated for', dateString);
      fetchDaySchedule(currentDate);
    }).on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'holidays',
      filter: `date=eq.${dateString}`
    }, () => {
      console.log('Holiday updated for', dateString);
      fetchDaySchedule(currentDate);
    }).subscribe();
    return () => {
      clearInterval(timeInterval);
      supabase.removeChannel(channel);
    };
  }, [currentDate]);
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'opening':
        return <Sun className="h-4 w-4" />;
      case 'closing':
        return <Moon className="h-4 w-4" />;
      case 'break':
        return <Coffee className="h-4 w-4" />;
      case 'study':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };
  const getPlanColor = (planType: string) => {
    switch (planType.toLowerCase()) {
      case 'full_shift':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'morning':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'evening':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'full_day':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  const formatTimeRange = (startTime: string, endTime: string) => {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };
  const isCurrentSlot = (time: string, endTime: string) => {
    // Only show live indicator for today's slots
    const today = new Date().toDateString();
    const selectedDay = currentDate.toDateString();
    if (today !== selectedDay) return false;
    const [hours, minutes] = time.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const slotStart = new Date();
    slotStart.setHours(hours, minutes, 0, 0);
    const slotEnd = new Date();
    slotEnd.setHours(endHours, endMinutes, 0, 0);
    const now = currentTime;
    return now >= slotStart && now <= slotEnd;
  };
  const getUpcomingSlot = () => {
    // Only show upcoming slot for today
    const today = new Date().toDateString();
    const selectedDay = currentDate.toDateString();
    if (today !== selectedDay) return null;
    const now = currentTime;
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
    return slots.find(slot => {
      const [hours, minutes] = slot.time.split(':').map(Number);
      const slotTimeMinutes = hours * 60 + minutes;
      return slotTimeMinutes > currentTimeMinutes;
    });
  };
  const currentSlot = slots.find(slot => isCurrentSlot(slot.time, slot.end_time));
  const upcomingSlot = getUpcomingSlot();
  const isToday = currentDate.toDateString() === new Date().toDateString();
  const isHoliday = holidays.length > 0;
  if (loading) {
    return <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading schedule...</div>
      </div>;
  }
  return <div className="space-y-6">
      {/* Date Navigation */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="text-xl font-semibold text-blue-900">
                  {currentDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                </h3>
                <p className="text-blue-700">Study Hub Library</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={() => navigateDate('prev')} className="h-10 w-10">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {!isToday && <Button variant="outline" onClick={goToToday} className="px-3 py-2 text-sm">
                  Today
                </Button>}
              
              <Button variant="outline" size="icon" onClick={() => navigateDate('next')} className="h-10 w-10">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Real-time info for today only */}
          {isToday && <div className="mt-4 flex items-center justify-between">
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-900">
                  {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
                </div>
                {currentSlot && <div className="text-sm text-blue-700 mt-1">
                    Currently: {currentSlot.name}
                  </div>}
                {upcomingSlot && !currentSlot && <div className="text-sm text-blue-700 mt-1">
                    Next: {upcomingSlot.name} at {formatTime(upcomingSlot.time)}
                  </div>}
              </div>
            </div>}
        </CardContent>
      </Card>

      {/* Holiday Notice */}
      {isHoliday && <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            {holidays.map(holiday => <div key={holiday.id} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-900">{holiday.name}</h4>
                  <p className="text-sm text-red-700">
                    {holiday.type === 'closed' ? 'Library is closed' : 'Special schedule'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Badge variant={holiday.type === 'closed' ? 'destructive' : 'secondary'}>
                    {holiday.type}
                  </Badge>
                  {holiday.recurring && <Badge variant="outline">Recurring</Badge>}
                </div>
              </div>)}
          </CardContent>
        </Card>}

      {/* Day's Schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            <CardTitle>
              {isToday ? "Today's Schedule" : "Schedule"}
            </CardTitle>
          </div>
          <CardDescription>
            Operating hours and activities for {currentDate.toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {slots.length === 0 ? <div className="text-center py-8">
              <p className="text-gray-500">No schedule available for this day</p>
            </div> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {slots.map(slot => <div key={slot.id} className={`p-4 rounded-lg border transition-all ${isCurrentSlot(slot.time, slot.end_time) ? 'bg-green-50 border-green-300 shadow-md ring-2 ring-green-200' : 'bg-white border-gray-200 hover:shadow-sm'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(slot.type)}
                      <span className="font-medium">{slot.name}</span>
                    </div>
                    {isCurrentSlot(slot.time, slot.end_time) && <div className="flex items-center space-x-1">
                        <Bell className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-medium text-green-600">LIVE</span>
                      </div>}
                  </div>
                  
                  <div className="text-lg font-semibold text-gray-900 mb-2">
                    {formatTimeRange(slot.time, slot.end_time)}
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getPlanColor(slot.plan_type)}>
                      {slot.plan_type.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">{slot.type}</Badge>
                  </div>
                  
                  {slot.description && <p className="text-sm text-gray-600 mt-2">{slot.description}</p>}
                </div>)}
            </div>}
        </CardContent>
      </Card>

      {/* Plan Types Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Types</CardTitle>
          <CardDescription>Color coding for different study plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm">Full Shift (24 Hours)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span className="text-sm">Morning (8 AM - 2 PM)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">Evening (2 PM - 10 PM)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm">Full Day (8 AM - 10 PM)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default Timetable;