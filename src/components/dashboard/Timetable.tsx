
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Bell, Coffee, BookOpen, Sun, Moon } from "lucide-react";
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
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchTodaySchedule = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Fetch today's timetable slots
      const { data: timetableData, error: timetableError } = await supabase
        .from('timetable_slots')
        .select('*')
        .eq('active', true)
        .eq('date', today)
        .order('time');

      if (timetableError) throw timetableError;

      // Fetch today's holidays
      const { data: holidayData, error: holidayError } = await supabase
        .from('holidays')
        .select('*')
        .eq('date', today);

      if (holidayError) throw holidayError;

      setSlots(timetableData || []);
      setHolidays(holidayData || []);
    } catch (error) {
      console.error('Error fetching today\'s schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaySchedule();

    // Update current time every minute for real-time updates
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Set up real-time subscription for today's data
    const channel = supabase
      .channel('today-schedule-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'timetable_slots',
          filter: `date=eq.${new Date().toISOString().split('T')[0]}`
        }, 
        () => {
          console.log('Timetable slot updated for today');
          fetchTodaySchedule();
        }
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'holidays',
          filter: `date=eq.${new Date().toISOString().split('T')[0]}`
        }, 
        () => {
          console.log('Holiday updated for today');
          fetchTodaySchedule();
        }
      )
      .subscribe();

    // Refresh data at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    const midnightRefresh = setTimeout(() => {
      fetchTodaySchedule();
      // Set up daily refresh
      const dailyRefresh = setInterval(fetchTodaySchedule, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyRefresh);
    }, timeUntilMidnight);

    return () => {
      clearInterval(timeInterval);
      clearTimeout(midnightRefresh);
      supabase.removeChannel(channel);
    };
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'opening': return <Sun className="h-4 w-4" />;
      case 'closing': return <Moon className="h-4 w-4" />;
      case 'break': return <Coffee className="h-4 w-4" />;
      case 'study': return <BookOpen className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType.toLowerCase()) {
      case 'full_shift': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'morning': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'evening': return 'bg-green-100 text-green-800 border-green-300';
      case 'full_day': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading today's schedule...</div>
      </div>
    );
  }

  const today = new Date();
  const isHoliday = holidays.length > 0;

  return (
    <div className="space-y-6">
      {/* Current Time & Status */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="text-xl font-semibold text-blue-900">
                  {today.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                <p className="text-blue-700">Study Hub Library</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-900">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </div>
              {currentSlot && (
                <div className="text-sm text-blue-700 mt-1">
                  Currently: {currentSlot.name}
                </div>
              )}
              {upcomingSlot && !currentSlot && (
                <div className="text-sm text-blue-700 mt-1">
                  Next: {upcomingSlot.name} at {formatTime(upcomingSlot.time)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Holiday Notice */}
      {isHoliday && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            {holidays.map((holiday) => (
              <div key={holiday.id} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-900">{holiday.name}</h4>
                  <p className="text-sm text-red-700">
                    {holiday.type === 'closed' ? 'Library is closed today' : 'Special schedule today'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Badge variant={holiday.type === 'closed' ? 'destructive' : 'secondary'}>
                    {holiday.type}
                  </Badge>
                  {holiday.recurring && (
                    <Badge variant="outline">Recurring</Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            <CardTitle>Today's Schedule</CardTitle>
          </div>
          <CardDescription>
            Operating hours and activities for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          {slots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No schedule available for today</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isCurrentSlot(slot.time, slot.end_time) 
                      ? 'bg-green-50 border-green-300 shadow-md ring-2 ring-green-200' 
                      : 'bg-white border-gray-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(slot.type)}
                      <span className="font-medium">{slot.name}</span>
                    </div>
                    {isCurrentSlot(slot.time, slot.end_time) && (
                      <div className="flex items-center space-x-1">
                        <Bell className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-medium text-green-600">LIVE</span>
                      </div>
                    )}
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
                  
                  {slot.description && (
                    <p className="text-sm text-gray-600 mt-2">{slot.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
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
              <span className="text-sm">Morning (6 AM - 2 PM)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">Evening (2 PM - 10 PM)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm">Full Day (6 AM - 10 PM)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Timetable;
