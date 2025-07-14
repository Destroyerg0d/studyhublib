
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Bell } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description?: string;
}

const ComingSoon = ({ title, description }: ComingSoonProps) => {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-purple-100 rounded-full">
              <Clock className="h-12 w-12 text-purple-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-purple-900">{title}</CardTitle>
          <CardDescription className="text-purple-700">
            {description || `${title} feature is under development and will be available soon`}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full">
            <Clock className="h-4 w-4 text-purple-600 mr-2" />
            <span className="text-purple-800 font-medium">Coming Soon</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What to Expect</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {title === "Fingerprint Access" && (
              <>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Biometric Security</h4>
                    <p className="text-sm text-gray-600">
                      Secure access using fingerprint authentication
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Quick Entry</h4>
                    <p className="text-sm text-gray-600">
                      Fast and contactless library access
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Attendance Tracking</h4>
                    <p className="text-sm text-gray-600">
                      Automatic attendance logging for all users
                    </p>
                  </div>
                </div>
              </>
            )}
            
            {title === "Stationery Store" && (
              <>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Study Materials</h4>
                    <p className="text-sm text-gray-600">
                      Notebooks, pens, highlighters, and more
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Online Ordering</h4>
                    <p className="text-sm text-gray-600">
                      Order directly from your dashboard
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Seat Delivery</h4>
                    <p className="text-sm text-gray-600">
                      Get items delivered to your study seat
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="text-center">
        <CardContent className="py-8">
          <h3 className="text-lg font-medium mb-2">Stay Updated</h3>
          <p className="text-gray-600 mb-4">
            We'll notify you as soon as this feature is available!
          </p>
          <Button disabled className="cursor-not-allowed">
            <Bell className="h-4 w-4 mr-2" />
            Notify Me (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComingSoon;
