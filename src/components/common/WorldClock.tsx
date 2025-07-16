
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const WorldClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date, timezone: string, city: string) => {
    return {
      city,
      time: date.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      date: date.toLocaleDateString('en-US', {
        timeZone: timezone,
        month: 'short',
        day: 'numeric'
      })
    };
  };

  const timeZones = [
    { timezone: 'Asia/Kolkata', city: 'India' },
    { timezone: 'America/New_York', city: 'New York' },
    { timezone: 'Europe/London', city: 'London' },
    { timezone: 'Asia/Tokyo', city: 'Tokyo' }
  ];

  const clockData = timeZones.map(tz => formatTime(time, tz.timezone, tz.city));

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center mb-3">
          <Clock className="h-4 w-4 text-blue-600 mr-2" />
          <span className="text-sm font-medium text-blue-900">World Clock</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {clockData.map((clock) => (
            <div key={clock.city} className="text-center">
              <div className="text-xs text-blue-700 font-medium">{clock.city}</div>
              <div className="text-sm font-mono text-blue-900">{clock.time}</div>
              <div className="text-xs text-blue-600">{clock.date}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorldClock;
