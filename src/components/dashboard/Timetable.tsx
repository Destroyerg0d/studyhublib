
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Sun, Moon, Calendar } from "lucide-react";

const Timetable = () => {
  const dayTimeSlots = [
    { time: "8:00 AM", status: "open", activity: "Library Opens" },
    { time: "9:00 AM", status: "peak", activity: "Peak Hours Begin" },
    { time: "12:00 PM", status: "break", activity: "Lunch Break" },
    { time: "1:00 PM", status: "open", activity: "Afternoon Session" },
    { time: "6:00 PM", status: "peak", activity: "Evening Peak" },
    { time: "10:00 PM", status: "closing", activity: "Day Time Closes" },
  ];

  const nightTimeSlots = [
    { time: "10:00 PM", status: "open", activity: "Night Session Opens" },
    { time: "12:00 AM", status: "quiet", activity: "Quiet Hours" },
    { time: "3:00 AM", status: "deep", activity: "Deep Study Hours" },
    { time: "6:00 AM", status: "closing", activity: "Night Session Ends" },
  ];

  const holidays = [
    { date: "Dec 25, 2024", name: "Christmas Day", type: "closed" },
    { date: "Jan 1, 2025", name: "New Year's Day", type: "half-day" },
    { date: "Jan 26, 2025", name: "Republic Day", type: "closed" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-green-100 text-green-800";
      case "peak": return "bg-blue-100 text-blue-800";
      case "break": return "bg-yellow-100 text-yellow-800";
      case "quiet": return "bg-purple-100 text-purple-800";
      case "deep": return "bg-indigo-100 text-indigo-800";
      case "closing": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <CardTitle className="text-blue-900">Current Status</CardTitle>
              <CardDescription className="text-blue-700">Library is currently open</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-900">Day Time Session</p>
              <p className="text-blue-700">8:00 AM - 10:00 PM</p>
            </div>
            <Badge className="bg-green-500 text-white">Open Now</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Day Time Schedule */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Sun className="h-5 w-5 text-yellow-600 mr-2" />
              <CardTitle>Day Time Schedule</CardTitle>
            </div>
            <CardDescription>8:00 AM - 10:00 PM</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dayTimeSlots.map((slot, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{slot.time}</p>
                    <p className="text-sm text-gray-600">{slot.activity}</p>
                  </div>
                  <Badge className={getStatusColor(slot.status)}>
                    {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Night Time Schedule */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Moon className="h-5 w-5 text-blue-600 mr-2" />
              <CardTitle>Night Time Schedule</CardTitle>
            </div>
            <CardDescription>10:00 PM - 6:00 AM</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nightTimeSlots.map((slot, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{slot.time}</p>
                    <p className="text-sm text-gray-600">{slot.activity}</p>
                  </div>
                  <Badge className={getStatusColor(slot.status)}>
                    {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holidays & Special Days */}
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-red-600 mr-2" />
            <CardTitle>Holidays & Special Days</CardTitle>
          </div>
          <CardDescription>Upcoming closures and modified timings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {holidays.map((holiday, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{holiday.date}</p>
                  <p className="text-sm text-gray-600">{holiday.name}</p>
                </div>
                <Badge variant={holiday.type === 'closed' ? 'destructive' : 'secondary'}>
                  {holiday.type === 'closed' ? 'Closed' : 'Half Day'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rules & Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Library Rules & Guidelines</CardTitle>
          <CardDescription>Please follow these guidelines for a better study environment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-green-700 mb-2">✅ Allowed</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Quiet study and reading</li>
                <li>• Use of personal laptops</li>
                <li>• Taking notes</li>
                <li>• Drinking water</li>
                <li>• Using phone on silent</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-700 mb-2">❌ Not Allowed</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Loud conversations</li>
                <li>• Playing music without headphones</li>
                <li>• Eating messy foods</li>
                <li>• Disturbing others</li>
                <li>• Smoking or vaping</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Timetable;
