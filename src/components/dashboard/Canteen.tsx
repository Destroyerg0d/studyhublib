
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Coffee, Plus, Minus, ShoppingCart, Clock } from "lucide-react";

const Canteen = () => {
  const [cart, setCart] = useState({});
  const [orderHistory, setOrderHistory] = useState([
    {
      id: "ORD001",
      items: ["Hot Coffee", "Maggie"],
      total: 60,
      status: "Delivered",
      timestamp: "2024-01-15 14:30",
      seatNumber: "A-12"
    },
    {
      id: "ORD002", 
      items: ["Cold Coffee", "Veg Maggie"],
      total: 100,
      status: "Preparing",
      timestamp: "2024-01-15 15:45",
      seatNumber: "A-12"
    }
  ]);
  const { toast } = useToast();

  const menuItems = [
    { id: 1, name: "Hot Coffee", price: 20, category: "Beverages" },
    { id: 2, name: "Tea", price: 10, category: "Beverages" },
    { id: 3, name: "Cold Coffee", price: 50, category: "Beverages" },
    { id: 4, name: "Flavour Cold Coffee", price: 60, category: "Beverages" },
    { id: 5, name: "Banana Shake", price: 50, category: "Shakes" },
    { id: 6, name: "Oreo Shake", price: 50, category: "Shakes" },
    { id: 7, name: "KitKat Shake", price: 50, category: "Shakes" },
    { id: 8, name: "Maggie", price: 40, category: "Food" },
    { id: 9, name: "Veg Maggie", price: 50, category: "Food" },
    { id: 10, name: "Paneer Maggie", price: 60, category: "Food" },
    { id: 11, name: "27G Protein Shake Chocolate with Milk", price: 100, category: "Protein" },
    { id: 12, name: "27G Protein Shake Chocolate with Water", price: 80, category: "Protein" }
  ];

  const categories = ["All", "Beverages", "Shakes", "Food", "Protein"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredItems = selectedCategory === "All" 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const updateCart = (itemId, change) => {
    setCart(prev => {
      const newCart = { ...prev };
      const currentQty = newCart[itemId] || 0;
      const newQty = Math.max(0, currentQty + change);
      
      if (newQty === 0) {
        delete newCart[itemId];
      } else {
        newCart[itemId] = newQty;
      }
      
      return newCart;
    });
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [itemId, qty]) => {
      const item = menuItems.find(item => item.id === parseInt(itemId));
      return total + (item ? item.price * qty : 0);
    }, 0);
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, qty) => total + qty, 0);
  };

  const placeOrder = () => {
    if (Object.keys(cart).length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before placing an order.",
        variant: "destructive",
      });
      return;
    }

    const orderItems = Object.entries(cart).map(([itemId, qty]) => {
      const item = menuItems.find(item => item.id === parseInt(itemId));
      return `${item.name} (${qty})`;
    });

    const newOrder = {
      id: `ORD${String(orderHistory.length + 1).padStart(3, '0')}`,
      items: orderItems,
      total: getCartTotal(),
      status: "Order Placed",
      timestamp: new Date().toLocaleString(),
      seatNumber: "A-12" // This would come from user's assigned seat
    };

    setOrderHistory(prev => [newOrder, ...prev]);
    setCart({});
    
    toast({
      title: "Order Placed Successfully!",
      description: `Your order will be delivered to seat A-12. Total: ₹${getCartTotal()}`,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered": return "bg-green-100 text-green-800";
      case "Preparing": return "bg-yellow-100 text-yellow-800";
      case "Order Placed": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Canteen</h1>
          <p className="text-gray-600">Order food and beverages to your seat</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Delivery to</p>
          <p className="font-semibold">Seat A-12</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Menu Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Menu Items */}
          <div className="grid md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <Badge variant="outline" className="text-xs mt-1">
                        {item.category}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">₹{item.price}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCart(item.id, -1)}
                        disabled={!cart[item.id]}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {cart[item.id] || 0}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCart(item.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {cart[item.id] && (
                      <p className="text-sm font-medium text-blue-600">
                        ₹{item.price * cart[item.id]}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart & Order History */}
        <div className="space-y-6">
          {/* Cart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Cart ({getCartItemCount()})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(cart).length === 0 ? (
                <p className="text-gray-500 text-center py-4">Your cart is empty</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(cart).map(([itemId, qty]) => {
                    const item = menuItems.find(item => item.id === parseInt(itemId));
                    return (
                      <div key={itemId} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">Qty: {qty}</p>
                        </div>
                        <p className="font-semibold">₹{item.price * qty}</p>
                      </div>
                    );
                  })}
                  
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center font-bold">
                      <span>Total</span>
                      <span className="text-lg text-green-600">₹{getCartTotal()}</span>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4" onClick={placeOrder}>
                    Place Order
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orderHistory.map((order) => (
                  <div key={order.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{order.id}</p>
                        <p className="text-xs text-gray-600">{order.timestamp}</p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    
                    <div className="text-sm space-y-1">
                      {order.items.map((item, index) => (
                        <p key={index} className="text-gray-600">{item}</p>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center mt-2 pt-2 border-t">
                      <span className="text-sm text-gray-600">Seat: {order.seatNumber}</span>
                      <span className="font-semibold">₹{order.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Canteen;
