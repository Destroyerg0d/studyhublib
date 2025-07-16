
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coffee, Clock, Utensils } from "lucide-react";

const Canteen = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-orange-100 rounded-full">
              <Coffee className="h-12 w-12 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-orange-900">Canteen Service</CardTitle>
          <CardDescription className="text-orange-700">
            Delicious meals and refreshments coming soon to The Study Hub
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full">
            <Clock className="h-4 w-4 text-orange-600 mr-2" />
            <span className="text-orange-800 font-medium">Coming Soon</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Utensils className="h-5 w-5 mr-2 text-blue-600" />
              What to Expect
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium">Fresh Meals</h4>
                  <p className="text-sm text-gray-600">
                    Healthy breakfast, lunch, and dinner options
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium">Quick Snacks</h4>
                  <p className="text-sm text-gray-600">
                    Tea, coffee, sandwiches, and light refreshments
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium">Seat Delivery</h4>
                  <p className="text-sm text-gray-600">
                    Order from your seat and get food delivered directly
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium">Student-Friendly Prices</h4>
                  <p className="text-sm text-gray-600">
                    Affordable pricing designed for students
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium">📱 Mobile Ordering</h4>
                <p className="text-sm text-gray-600">
                  Order directly from this dashboard
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium">💳 Digital Payments</h4>
                <p className="text-sm text-gray-600">
                  Pay with UPI, cards, or digital wallets
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium">⏰ Scheduled Orders</h4>
                <p className="text-sm text-gray-600">
                  Pre-order your meals for specific times
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium">🥗 Daily Specials</h4>
                <p className="text-sm text-gray-600">
                  Special menu items and combo offers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tentative Menu Categories</CardTitle>
          <CardDescription>
            Here's what we're planning to offer once the canteen is operational
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-orange-700">🌅 Breakfast</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Idli, Dosa, Vada</li>
                <li>• Poha, Upma</li>
                <li>• Bread, Butter, Jam</li>
                <li>• Tea, Coffee, Milk</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-blue-700">🍽️ Lunch & Dinner</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Rice, Dal, Curry</li>
                <li>• Roti, Sabzi</li>
                <li>• Biryani, Pulav</li>
                <li>• Thali Combos</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-green-700">☕ Snacks & Beverages</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Samosa, Vada Pav</li>
                <li>• Sandwiches, Burgers</li>
                <li>• Tea, Coffee, Juice</li>
                <li>• Biscuits, Namkeen</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="text-center">
        <CardContent className="py-8">
          <h3 className="text-lg font-medium mb-2">Stay Updated</h3>
          <p className="text-gray-600 mb-4">
            We'll notify you as soon as the canteen service is available!
          </p>
          <Button disabled className="cursor-not-allowed">
            Pre-Order (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Canteen;
