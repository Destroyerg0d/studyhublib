
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Bell, Coffee, BookOpen, Sun, Moon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface TimetableSlot {
  id: string;
  name: string;
  time: string;
  type: string;
  description: string | null;
  active: boolean;
  plan_type: string;
  end_time: string;
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
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchTimetableData = async () => {
    try {
      // Fetch timetable slots for the selected week
      const weekStart = new Date(selectedDate);
      weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const { data: timetableData, error: timetableError } = await supabase
        .from('timetable_slots')
        .select('*')
        .eq('active', true)
        .gte('date', weekStart.toISOString().split('T')[0])
        .lte('date', weekEnd.toISOString().split('T')[0])
        .order('date')
        .order('time');

      if (timetableError) throw timetableError;

      // Fetch holidays
      const { data: holidayData, error: holidayError } = await supabase
        .from('holidays')
        .select('*')
        .order('date');

      if (holidayError) throw holidayError;

      setSlots(timetableData || []);
      setHolidays(holidayData || []);
    } catch (error) {
      console.error('Error fetching timetable data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetableData();

    // Update current time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Set up real-time subscription
    const channel = supabase
      .channel('timetable-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'timetable_slots' }, 
        () => fetchTimetableData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'holidays' }, 
        () => fetchTimetableData()
      )
      .subscribe();

    return () => {
      clearInterval(timeInterval);
      supabase.removeChannel(channel);
    };
  }, [selectedDate]);

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

  const isCurrentSlot = (date: string, time: string, endTime: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (date !== today) return false;

    const [hours, minutes] = time.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const slotStart = new Date();
    slotStart.setHours(hours, minutes, 0, 0);
    
    const slotEnd = new Date();
    slotEnd.setHours(endHours, endMinutes, 0, 0);
    
    const now = currentTime;
    return now >= slotStart && now <= slotEnd;
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
    return slots.filter(slot => slot.date === dateStr);
  };

  const weekDates = getWeekDates();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading timetable...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Time */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="text-xl font-semibold text-blue-900">Current Time</h3>
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
              <div className="text-blue-700">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              <CardTitle>Weekly Schedule</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>Study Hub operating hours and schedule for each day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {weekDates.map((date, index) => {
              const dateSlots = getSlotsForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div key={index} className={`p-4 rounded-lg border ${isToday ? 'bg-yellow-50 border-yellow-300' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`font-semibold ${isToday ? 'text-yellow-900' : 'text-gray-900'}`}>
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </h4>
                    <span className={`text-sm ${isToday ? 'text-yellow-700' : 'text-gray-600'}`}>
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  
                  {dateSlots.length === 0 ? (
                    <p className="text-gray-500 text-sm">No schedule</p>
                  ) : (
                    <div className="space-y-2">
                      {dateSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className={`p-2 rounded border transition-all ${
                            isCurrentSlot(slot.date, slot.time, slot.end_time) 
                              ? 'bg-green-50 border-green-300 shadow-sm' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-1">
                              {getTypeIcon(slot.type)}
                              <span className="text-xs font-medium">{slot.name}</span>
                            </div>
                            {isCurrentSlot(slot.date, slot.time, slot.end_time) && (
                              <Bell className="h-3 w-3 text-green-600" />
                            )}
                          </div>
                          <div className="text-xs text-gray-600 mb-1">
                            {formatTimeRange(slot.time, slot.end_time)}
                          </div>
                          <Badge size="sm" className={getPlanColor(slot.plan_type)}>
                            {slot.plan_type.replace('_', ' ')}
                          </Badge>
                          {slot.description && (
                            <p className="text-xs text-gray-500 mt-1">{slot.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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

      {/* Upcoming Holidays */}
      {holidays.filter(h => new Date(h.date) >= new Date()).slice(0, 3).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Holidays</CardTitle>
            <CardDescription>Library closure dates and special occasions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {holidays.filter(h => new Date(h.date) >= new Date()).slice(0, 3).map((holiday) => (
                <div key={holiday.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-red-900">{holiday.name}</h4>
                      <p className="text-sm text-red-700">
                        {new Date(holiday.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Timetable;
