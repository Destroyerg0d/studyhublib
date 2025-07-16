
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

  const formatIndiaTime = (date: Date) => {
    return {
      time: date.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      date: date.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    };
  };

  const indiaTime = formatIndiaTime(time);

  return (
    <Card className="fixed top-4 right-4 z-50 bg-white/95 backdrop-blur-sm border-blue-200 shadow-lg min-w-[180px]">
      <CardContent className="p-3">
        <div className="flex items-center mb-2">
          <Clock className="h-4 w-4 text-blue-600 mr-2" />
          <span className="text-xs font-medium text-blue-900">India Time</span>
        </div>
        <div className="text-center">
          <div className="text-sm font-mono text-blue-900 font-bold">{indiaTime.time}</div>
          <div className="text-xs text-blue-600">{indiaTime.date}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorldClock;
