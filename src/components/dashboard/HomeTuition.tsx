import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Phone, MapPin, Users, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TuitionLocation {
  id: string;
  name: string;
  rates: {
    lkg_ukg: number;
    class_1_8: number;
    class_8_10: number;
    class_11_12: number;
  };
  active: boolean;
}

const HomeTuition = () => {
  const [locations, setLocations] = useState<TuitionLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tuition_locations')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setLocations((data || []).map(item => ({
        ...item,
        rates: item.rates as any
      })));
    } catch (error) {
      console.error('Error fetching tuition locations:', error);
      toast({
        title: "Error",
        description: "Failed to load tuition locations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString()}`;

  const formatClassLabel = (key: string) => {
    switch (key) {
      case 'lkg_ukg':
        return 'LKG and UKG Nursery';
      case 'class_1_8':
        return '1 to 8 Class';
      case 'class_8_10':
        return '8 to 10 Class';
      case 'class_11_12':
        return '11 to 12 Class (Math & Science)';
      default:
        return key;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg p-6 animate-pulse">
          <div className="h-8 bg-white/20 rounded mb-4"></div>
          <div className="h-4 bg-white/20 rounded w-3/4"></div>
        </div>
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg p-4 sm:p-6">
        <div className="flex items-center mb-4">
          <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 mr-3 flex-shrink-0" />
          <h1 className="text-xl sm:text-3xl font-bold">Home Tuition Services</h1>
        </div>
        <p className="text-emerald-100 text-sm sm:text-lg">
          Professional home tutoring by qualified male and female teachers
        </p>
      </div>

      {/* Contact Information */}
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center">
              <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-emerald-800 text-sm sm:text-base">For Tuition Enquiry</h3>
                <p className="text-emerald-700 text-xs sm:text-sm">Contact us today to book your tutor</p>
              </div>
            </div>
            <div className="flex justify-center sm:justify-end">
              <Badge 
                variant="secondary" 
                className="text-sm sm:text-lg px-3 py-2 sm:px-4 bg-emerald-600 text-white cursor-pointer hover:bg-emerald-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
                onClick={() => window.open('tel:8595300308', '_self')}
              >
                📞 8595300308
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teacher Information */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm sm:text-base">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600 flex-shrink-0" />
              Available Teachers
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">👨‍🏫 Male Teachers</span>
                <Badge variant="outline" className="text-xs">Available</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">👩‍🏫 Female Teachers</span>
                <Badge variant="outline" className="text-xs">Available</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm sm:text-base">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-600 flex-shrink-0" />
              Flexible Options
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Per Class (Day-wise)</span>
                <Badge className="bg-purple-600 text-xs">₹500</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">English Speaking & Writing</span>
                <Badge className="bg-purple-600 text-xs">₹4,000</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location-wise Pricing */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center">
          <MapPin className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-emerald-600 flex-shrink-0" />
          Location-wise Monthly Rates
        </h2>
        
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {locations.map((location) => (
            <Card key={location.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-xl text-emerald-700">{location.name}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Monthly tuition rates</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {Object.entries(location.rates).map(([key, price], index) => (
                    <div key={key}>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-xs sm:text-sm font-medium">{formatClassLabel(key)}</span>
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-xs">
                          {formatPrice(price)}
                        </Badge>
                      </div>
                      {index < Object.entries(location.rates).length - 1 && <Separator />}
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
        <CardContent className="text-center p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-bold mb-4">Ready to Start Learning?</h3>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            Get personalized attention with our experienced tutors. Call now to discuss your requirements and schedule a demo class.
          </p>
          <Button 
            size="lg" 
            className="bg-emerald-600 hover:bg-emerald-700 text-sm sm:text-base"
            onClick={() => window.open('tel:8595300308', '_self')}
          >
            <Phone className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Call 8595300308
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomeTuition;