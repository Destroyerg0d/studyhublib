import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Phone, MapPin, Users, Clock } from "lucide-react";

const HomeTuition = () => {
  const locations = [
    {
      name: "Khoda Colony",
      rates: [
        { class: "LKG and UKG Nursery", price: "₹2,500" },
        { class: "1 to 8 Class", price: "₹3,000" },
        { class: "8 to 10 Class", price: "₹4,500" },
        { class: "11 to 12 Class (Math & Science)", price: "₹6,000" }
      ]
    },
    {
      name: "Indrapuram",
      rates: [
        { class: "LKG, UKG Nursery", price: "₹4,000" },
        { class: "1 to 8 Class", price: "₹5,000" },
        { class: "8 to 10 Class", price: "₹6,000" },
        { class: "11 to 12 Class (Math & Science)", price: "₹8,000" }
      ]
    },
    {
      name: "Sector 62",
      rates: [
        { class: "LKG and UKG Nursery", price: "₹3,000" },
        { class: "1 to 8 Class", price: "₹4,000" },
        { class: "8 to 10 Class", price: "₹5,000" },
        { class: "11 to 12 Class (Math & Science)", price: "₹7,000" }
      ]
    },
    {
      name: "Mayur Vihar Phase 3",
      rates: [
        { class: "LKG and UKG Nursery", price: "₹3,000" },
        { class: "1 to 8 Class", price: "₹4,000" },
        { class: "8 to 10 Class", price: "₹5,000" },
        { class: "11 to 12 Class (Math & Science)", price: "₹7,000" }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg p-6">
        <div className="flex items-center mb-4">
          <GraduationCap className="h-8 w-8 mr-3" />
          <h1 className="text-3xl font-bold">Home Tuition Services</h1>
        </div>
        <p className="text-emerald-100 text-lg">
          Professional home tutoring by qualified male and female teachers
        </p>
      </div>

      {/* Contact Information */}
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center">
            <Phone className="h-6 w-6 text-emerald-600 mr-3" />
            <div>
              <h3 className="font-semibold text-emerald-800">For Tuition Enquiry</h3>
              <p className="text-emerald-700">Contact us today to book your tutor</p>
            </div>
          </div>
          <div className="text-right">
            <Badge variant="secondary" className="text-lg px-4 py-2 bg-emerald-600 text-white">
              📞 8595300308
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Teacher Information */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Available Teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>👨‍🏫 Male Teachers</span>
                <Badge variant="outline">Available</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>👩‍🏫 Female Teachers</span>
                <Badge variant="outline">Available</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-purple-600" />
              Flexible Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Per Class (Day-wise)</span>
                <Badge className="bg-purple-600">₹500</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>English Speaking & Writing</span>
                <Badge className="bg-purple-600">₹4,000</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location-wise Pricing */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <MapPin className="h-6 w-6 mr-2 text-emerald-600" />
          Location-wise Monthly Rates
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {locations.map((location, index) => (
            <Card key={location.name} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl text-emerald-700">{location.name}</CardTitle>
                <CardDescription>Monthly tuition rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {location.rates.map((rate, rateIndex) => (
                    <div key={rateIndex}>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm font-medium">{rate.class}</span>
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                          {rate.price}
                        </Badge>
                      </div>
                      {rateIndex < location.rates.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-emerald-50 to-blue-50">
        <CardContent className="text-center p-8">
          <h3 className="text-2xl font-bold mb-4">Ready to Start Learning?</h3>
          <p className="text-gray-600 mb-6">
            Get personalized attention with our experienced tutors. Call now to discuss your requirements and schedule a demo class.
          </p>
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
            <Phone className="mr-2 h-5 w-5" />
            Call 8595300308
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomeTuition;