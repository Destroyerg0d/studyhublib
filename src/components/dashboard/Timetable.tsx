
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Bell, Coffee, BookOpen, Sun, Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TimetableSlot {
  id: string;
  name: string;
  time: string;
  type: string;
  description: string | null;
  active: boolean;
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

  const fetchTimetableData = async () => {
    try {
      // Fetch timetable slots
      const { data: timetableData, error: timetableError } = await supabase
        .from('timetable_slots')
        .select('*')
        .eq('active', true)
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

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'opening': return 'bg-green-100 text-green-800';
      case 'closing': return 'bg-blue-100 text-blue-800';
      case 'break': return 'bg-orange-100 text-orange-800';
      case 'study': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isCurrentSlot = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);
    
    const now = currentTime;
    const timeDiff = Math.abs(now.getTime() - slotTime.getTime());
    return timeDiff <= 30 * 60 * 1000; // Within 30 minutes
  };

  const getUpcomingHolidays = () => {
    const today = new Date();
    return holidays.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate >= today;
    }).slice(0, 3);
  };

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

      {/* Daily Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Daily Schedule
          </CardTitle>
          <CardDescription>Study Hub operating hours and schedule</CardDescription>
        </CardHeader>
        <CardContent>
          {slots.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No schedule available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isCurrentSlot(slot.time) 
                      ? 'bg-yellow-50 border-yellow-300 shadow-md' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${getTypeColor(slot.type)}`}>
                        {getTypeIcon(slot.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{slot.name}</h4>
                        {slot.description && (
                          <p className="text-sm text-gray-600">{slot.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {new Date(`2000-01-01T${slot.time}`).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                      <Badge className={getTypeColor(slot.type)}>
                        {slot.type}
                      </Badge>
                    </div>
                  </div>
                  {isCurrentSlot(slot.time) && (
                    <div className="mt-2 flex items-center text-yellow-700">
                      <Bell className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Current/Upcoming</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Holidays */}
      {getUpcomingHolidays().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Holidays</CardTitle>
            <CardDescription>Library closure dates and special occasions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getUpcomingHolidays().map((holiday) => (
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

      {/* Important Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Important Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-700 mb-2">📚 Study Guidelines</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Maintain silence in study areas</li>
                <li>• Keep your study materials organized</li>
                <li>• Use designated break areas for discussions</li>
                <li>• Follow the library schedule strictly</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-700 mb-2">⏰ Timing Information</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Entry allowed until 15 minutes before closing</li>
                <li>• Break times are mandatory for all students</li>
                <li>• Late arrivals may lose seat for that session</li>
                <li>• Check holiday calendar for closure dates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Timetable;
