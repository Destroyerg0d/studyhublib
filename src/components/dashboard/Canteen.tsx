
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Coffee, ShoppingCart, Plus, Minus, Utensils } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

const Canteen = () => {
  const { toast } = useToast();
  const [cart, setCart] = useState<{ [key: string]: number }>({});

  const menuItems: MenuItem[] = [
    // Hot Beverages
    { id: "hot-coffee", name: "HOT COFFEE", price: 20, category: "Hot Beverages" },
    { id: "tea", name: "TEA", price: 10, category: "Hot Beverages" },
    
    // Cold Beverages
    { id: "cold-coffee", name: "COLD COFFEE", price: 50, category: "Cold Beverages" },
    { id: "flavour-cold-coffee", name: "FLAVOUR COLD COFFEE", price: 60, category: "Cold Beverages" },
    
    // Shakes
    { id: "banana-shake", name: "BANANA SHAKE", price: 50, category: "Shakes" },
    { id: "oreo-shake", name: "OREO SHAKE", price: 50, category: "Shakes" },
    { id: "kitkat-shake", name: "KITKAT SHAKE", price: 50, category: "Shakes" },
    
    // Food
    { id: "maggie", name: "MAGGIE", price: 40, category: "Food" },
    { id: "veg-maggie", name: "VEG MAGGIE", price: 50, category: "Food" },
    { id: "paneer-maggie", name: "PANEER MAGGIE", price: 60, category: "Food" },
    
    // Protein Shakes
    { id: "protein-milk", name: "27G PROTEIN SHAKE CHOCOLATE WITH MILK", price: 100, category: "Protein Shakes" },
    { id: "protein-water", name: "27G PROTEIN SHAKE CHOCOLATE WITH WATER", price: 80, category: "Protein Shakes" },
  ];

  const categories = ["Hot Beverages", "Cold Beverages", "Shakes", "Food", "Protein Shakes"];

  const addToCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
    toast({
      title: "Added to cart",
      description: "Item has been added to your cart.",
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId]--;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = menuItems.find(item => item.id === itemId);
      return total + (item ? item.price * quantity : 0);
    }, 0);
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  const placeOrder = () => {
    if (getTotalItems() === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before placing an order.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Order placed successfully!",
      description: `Your order for ₹${getTotalPrice()} has been placed. It will be delivered to your seat.`,
    });
    setCart({});
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-orange-100 rounded-full">
              <Coffee className="h-12 w-12 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-orange-900">Study Hub Canteen</CardTitle>
          <CardDescription className="text-orange-700">
            Fresh food and beverages delivered to your seat
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Cart Summary */}
      {getTotalItems() > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Your Cart
              </span>
              <Badge className="bg-green-500 text-white">
                {getTotalItems()} items
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              {Object.entries(cart).map(([itemId, quantity]) => {
                const item = menuItems.find(item => item.id === itemId);
                if (!item) return null;
                return (
                  <div key={itemId} className="flex justify-between items-center">
                    <span className="text-sm">{item.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">₹{item.price} x {quantity}</span>
                      <Button size="sm" variant="outline" onClick={() => removeFromCart(itemId)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-lg font-semibold">Total: ₹{getTotalPrice()}</span>
              <Button onClick={placeOrder} className="bg-green-600 hover:bg-green-700">
                Place Order
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Menu */}
      <div className="space-y-6">
        {categories.map(category => {
          const categoryItems = menuItems.filter(item => item.category === category);
          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Utensils className="h-5 w-5 mr-2 text-blue-600" />
                  {category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryItems.map(item => (
                    <div key={item.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 leading-tight">{item.name}</h4>
                          <p className="text-xl font-bold text-green-600 mt-1">₹{item.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        {cart[item.id] ? (
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline" onClick={() => removeFromCart(item.id)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="font-medium">{cart[item.id]}</span>
                            <Button size="sm" variant="outline" onClick={() => addToCart(item.id)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" onClick={() => addToCart(item.id)}>
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Service Info */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-700 mb-2">🚀 Quick Service</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Orders delivered directly to your seat</li>
                <li>• Average delivery time: 10-15 minutes</li>
                <li>• Fresh preparation for every order</li>
                <li>• Digital payment accepted</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-700 mb-2">⏰ Service Hours</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Monday to Sunday: 8:00 AM - 10:00 PM</li>
                <li>• Special night service: 10:00 PM - 6:00 AM</li>
                <li>• Hot beverages available 24/7</li>
                <li>• Fresh food prepared daily</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Canteen;
