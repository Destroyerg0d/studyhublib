
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Coffee, ShoppingCart, Plus, Minus, MapPin } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'beverages' | 'food' | 'shakes' | 'protein';
}

const Canteen = () => {
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const { toast } = useToast();

  const menuItems: MenuItem[] = [
    // Beverages
    { id: 'hot-coffee', name: 'Hot Coffee', price: 20, category: 'beverages' },
    { id: 'tea', name: 'Tea', price: 10, category: 'beverages' },
    { id: 'cold-coffee', name: 'Cold Coffee', price: 50, category: 'beverages' },
    { id: 'flavour-cold-coffee', name: 'Flavour Cold Coffee', price: 60, category: 'beverages' },
    
    // Shakes
    { id: 'banana-shake', name: 'Banana Shake', price: 50, category: 'shakes' },
    { id: 'oreo-shake', name: 'Oreo Shake', price: 50, category: 'shakes' },
    { id: 'kitkat-shake', name: 'KitKat Shake', price: 50, category: 'shakes' },
    
    // Food
    { id: 'maggie', name: 'Maggie', price: 40, category: 'food' },
    { id: 'veg-maggie', name: 'Veg Maggie', price: 50, category: 'food' },
    { id: 'paneer-maggie', name: 'Paneer Maggie', price: 60, category: 'food' },
    
    // Protein
    { id: 'protein-milk', name: '27G Protein Shake (Chocolate + Milk)', price: 100, category: 'protein' },
    { id: 'protein-water', name: '27G Protein Shake (Chocolate + Water)', price: 80, category: 'protein' },
  ];

  const categoryColors = {
    beverages: 'bg-orange-50 border-orange-200',
    shakes: 'bg-purple-50 border-purple-200',
    food: 'bg-green-50 border-green-200',
    protein: 'bg-blue-50 border-blue-200'
  };

  const categoryIcons = {
    beverages: '☕',
    shakes: '🥤',
    food: '🍜',
    protein: '💪'
  };

  const addToCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
    
    const item = menuItems.find(i => i.id === itemId);
    toast({
      title: "Added to cart",
      description: `${item?.name} added to your order`,
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

  const getTotalAmount = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = menuItems.find(i => i.id === itemId);
      return total + (item?.price || 0) * quantity;
    }, 0);
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  const placeOrder = () => {
    if (getTotalItems() === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before placing an order",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Order placed successfully!",
      description: `Your order for ₹${getTotalAmount()} has been placed. It will be delivered to your seat.`,
    });
    setCart({});
  };

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as {[key: string]: MenuItem[]});

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-orange-100 rounded-full">
              <Coffee className="h-12 w-12 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-orange-900">The Study Hub Canteen</CardTitle>
          <CardDescription className="text-orange-700">
            Fresh food and beverages delivered to your seat
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Cart Summary */}
      {getTotalItems() > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2 text-green-600" />
              Your Order ({getTotalItems()} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(cart).map(([itemId, quantity]) => {
                const item = menuItems.find(i => i.id === itemId);
                return (
                  <div key={itemId} className="flex justify-between items-center">
                    <span>{item?.name} x {quantity}</span>
                    <span className="font-semibold">₹{(item?.price || 0) * quantity}</span>
                  </div>
                );
              })}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total</span>
                  <span>₹{getTotalAmount()}</span>
                </div>
              </div>
              <Button onClick={placeOrder} className="w-full mt-4 bg-green-600 hover:bg-green-700">
                Place Order
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Menu */}
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <Card key={category} className={categoryColors[category as keyof typeof categoryColors]}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">{categoryIcons[category as keyof typeof categoryIcons]}</span>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-800">{item.name}</h4>
                      <Badge variant="secondary" className="ml-2">₹{item.price}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {cart[item.id] > 0 && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="font-medium">{cart[item.id]}</span>
                          </>
                        )}
                        <Button
                          size="sm"
                          onClick={() => addToCart(item.id)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Location & Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Visit Us
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Find us at our location for in-person orders and inquiries
            </p>
            <a 
              href="https://share.google/khlhKD1hrIFIMYFx4"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-700"
            >
              <MapPin className="h-4 w-4 mr-1" />
              View Location on Google Maps
            </a>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Order Information</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Orders are delivered directly to your seat</li>
                <li>• Payment can be made via UPI or cash</li>
                <li>• Fresh items prepared on order</li>
                <li>• Average preparation time: 10-15 minutes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Canteen;
