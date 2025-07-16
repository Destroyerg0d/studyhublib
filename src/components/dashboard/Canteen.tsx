
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coffee, Clock, Utensils, IndianRupee } from "lucide-react";

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
            Order food and beverages directly to your seat
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full">
            <Clock className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">Available Now</span>
          </div>
        </CardContent>
      </Card>

      {/* Current Menu */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Utensils className="h-5 w-5 mr-2 text-blue-600" />
            Current Menu
          </CardTitle>
          <CardDescription>
            Order these items and they'll be delivered to your seat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-orange-700 flex items-center">
                ☕ Beverages
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Tea</span>
                  <div className="flex items-center text-green-600 font-medium">
                    <IndianRupee className="h-4 w-4" />
                    <span>10</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Cold Coffee</span>
                  <div className="flex items-center text-green-600 font-medium">
                    <IndianRupee className="h-4 w-4" />
                    <span>50</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Flavor Cold Coffee</span>
                  <div className="flex items-center text-green-600 font-medium">
                    <IndianRupee className="h-4 w-4" />
                    <span>60</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Shakes</span>
                  <div className="flex items-center text-green-600 font-medium">
                    <IndianRupee className="h-4 w-4" />
                    <span>60</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Cold Drinks</span>
                  <div className="text-sm text-gray-500">
                    Price varies
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-blue-700 flex items-center">
                🍜 Maggi
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Plain Maggi</span>
                  <div className="flex items-center text-green-600 font-medium">
                    <IndianRupee className="h-4 w-4" />
                    <span>40</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Veg Maggi</span>
                  <div className="flex items-center text-green-600 font-medium">
                    <IndianRupee className="h-4 w-4" />
                    <span>50</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>Paneer Maggi</span>
                  <div className="flex items-center text-green-600 font-medium">
                    <IndianRupee className="h-4 w-4" />
                    <span>60</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-blue-800 font-medium mb-2">More items coming soon...</p>
            <p className="text-blue-600 text-sm">We're expanding our menu with more delicious options!</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>How to Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h4 className="font-medium">Note Your Seat Number</h4>
                  <p className="text-sm text-gray-600">
                    Remember your seat number for delivery
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h4 className="font-medium">Contact Reception</h4>
                  <p className="text-sm text-gray-600">
                    Call or message reception with your order
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h4 className="font-medium">Enjoy at Your Seat</h4>
                  <p className="text-sm text-gray-600">
                    Your order will be delivered directly to you
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
                <h4 className="font-medium">🥗 Expanded Menu</h4>
                <p className="text-sm text-gray-600">
                  More food items and combo offers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="text-center">
        <CardContent className="py-8">
          <h3 className="text-lg font-medium mb-2">Ready to Order?</h3>
          <p className="text-gray-600 mb-4">
            Contact reception to place your order and get it delivered to your seat!
          </p>
          <Button className="bg-orange-600 hover:bg-orange-700">
            Contact Reception
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Canteen;
