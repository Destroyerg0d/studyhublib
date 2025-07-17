
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Coffee, ShoppingCart, Plus, Minus, Utensils, Clock, Truck, Star } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
  popular?: boolean;
}

const Canteen = () => {
  const { toast } = useToast();
  const [cart, setCart] = useState<{ [key: string]: number }>({});

  const menuItems: MenuItem[] = [
    // Hot Beverages
    { id: "hot-coffee", name: "Hot Coffee", price: 20, category: "Hot Beverages", description: "Freshly brewed aromatic coffee", popular: true },
    { id: "tea", name: "Tea", price: 10, category: "Hot Beverages", description: "Classic Indian chai" },
    
    // Cold Beverages
    { id: "cold-coffee", name: "Cold Coffee", price: 50, category: "Cold Beverages", description: "Refreshing iced coffee", popular: true },
    { id: "flavour-cold-coffee", name: "Flavoured Cold Coffee", price: 60, category: "Cold Beverages", description: "Vanilla, caramel or chocolate" },
    
    // Shakes
    { id: "banana-shake", name: "Banana Shake", price: 50, category: "Shakes", description: "Creamy banana milkshake" },
    { id: "oreo-shake", name: "Oreo Shake", price: 50, category: "Shakes", description: "Cookies & cream delight", popular: true },
    { id: "kitkat-shake", name: "KitKat Shake", price: 50, category: "Shakes", description: "Chocolate wafer shake" },
    
    // Food
    { id: "maggie", name: "Maggie", price: 40, category: "Food", description: "Classic instant noodles" },
    { id: "veg-maggie", name: "Veg Maggie", price: 50, category: "Food", description: "Loaded with fresh vegetables", popular: true },
    { id: "paneer-maggie", name: "Paneer Maggie", price: 60, category: "Food", description: "Rich paneer and spices" },
    
    // Protein Shakes
    { id: "protein-milk", name: "Protein Shake (Milk)", price: 100, category: "Protein Shakes", description: "27g protein chocolate with milk" },
    { id: "protein-water", name: "Protein Shake (Water)", price: 80, category: "Protein Shakes", description: "27g protein chocolate with water" },
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-8 shadow-xl">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
              <Coffee className="h-16 w-16" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">Study Hub Canteen</h1>
          <p className="text-xl opacity-90">Fresh food & beverages delivered to your seat</p>
          <div className="flex items-center justify-center mt-4 space-x-6 text-sm">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>10-15 min delivery</span>
            </div>
            <div className="flex items-center">
              <Truck className="h-4 w-4 mr-1" />
              <span>Free delivery</span>
            </div>
          </div>
        </div>

        {/* Cart Summary - Sticky */}
        {getTotalItems() > 0 && (
          <div className="sticky top-4 z-10">
            <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-xl border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ShoppingCart className="h-6 w-6" />
                    <div>
                      <h3 className="font-semibold text-lg">Your Cart</h3>
                      <p className="text-green-100">{getTotalItems()} items • ₹{getTotalPrice()}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={placeOrder} 
                    className="bg-white text-green-600 hover:bg-green-50 font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Place Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Menu Categories */}
        <div className="space-y-8">
          {categories.map(category => {
            const categoryItems = menuItems.filter(item => item.category === category);
            const categoryIcons = {
              "Hot Beverages": "☕",
              "Cold Beverages": "🥤",
              "Shakes": "🥤",
              "Food": "🍜",
              "Protein Shakes": "💪"
            };

            return (
              <Card key={category} className="shadow-lg border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <CardTitle className="flex items-center text-2xl text-gray-800">
                    <span className="text-3xl mr-3">{categoryIcons[category as keyof typeof categoryIcons]}</span>
                    {category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryItems.map(item => (
                      <div key={item.id} className="group relative bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200">
                        {item.popular && (
                          <div className="absolute -top-2 -right-2">
                            <Badge className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                              <Star className="h-3 w-3 mr-1" />
                              Popular
                            </Badge>
                          </div>
                        )}
                        
                        <div className="flex flex-col h-full">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                              {item.name}
                            </h4>
                            {item.description && (
                              <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-2xl font-bold text-green-600">₹{item.price}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            {cart[item.id] ? (
                              <div className="flex items-center space-x-3 bg-gray-50 rounded-full p-1">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => removeFromCart(item.id)}
                                  className="h-10 w-10 rounded-full border-2 hover:bg-red-50 hover:border-red-300"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="font-bold text-lg min-w-[2rem] text-center">{cart[item.id]}</span>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => addToCart(item.id)}
                                  className="h-10 w-10 rounded-full border-2 hover:bg-green-50 hover:border-green-300"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                onClick={() => addToCart(item.id)}
                                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add to Cart
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Service Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-700">
                <Truck className="h-6 w-6 mr-2" />
                Quick Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Orders delivered directly to your seat
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Average delivery time: 10-15 minutes
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Fresh preparation for every order
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Digital payment accepted
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-green-700">
                <Clock className="h-6 w-6 mr-2" />
                Service Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Monday to Sunday: 8:00 AM - 10:00 PM
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Special night service: 10:00 PM - 6:00 AM
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Hot beverages available 24/7
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Fresh food prepared daily
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Canteen;
