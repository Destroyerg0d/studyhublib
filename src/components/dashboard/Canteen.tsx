import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCanteenPayU } from "@/hooks/useCanteenPayU";
import { Coffee, ShoppingCart, Plus, Minus, Utensils, Clock, Truck, Star, CreditCard } from "lucide-react";

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
  const { createOrder, isLoading } = useCanteenPayU();
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

  const placeOrder = async () => {
    if (getTotalItems() === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before placing an order.",
        variant: "destructive",
      });
      return;
    }

    const cartItems = Object.entries(cart).map(([itemId, quantity]) => {
      const item = menuItems.find(item => item.id === itemId);
      return {
        id: itemId,
        name: item?.name || '',
        price: item?.price || 0,
        quantity
      };
    });

    await createOrder({
      items: cartItems,
      totalAmount: getTotalPrice(),
      onSuccess: () => {
        setCart({});
      },
      onError: (error) => {
        console.error('Order failed:', error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Utensils className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Canteen</h1>
            <p className="text-muted-foreground">Order fresh food & beverages delivered to your seat</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>10-15 min delivery</span>
          </div>
          <div className="flex items-center gap-1">
            <Truck className="h-4 w-4" />
            <span>Free delivery</span>
          </div>
        </div>
      </div>

      {/* Cart Summary */}
      {getTotalItems() > 0 && (
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5" />
                <div>
                  <h3 className="font-semibold">Your Cart</h3>
                  <p className="text-sm opacity-90">{getTotalItems()} items • ₹{getTotalPrice()}</p>
                </div>
              </div>
              <Button 
                onClick={placeOrder} 
                variant="secondary"
                className="font-semibold"
                disabled={isLoading}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {isLoading ? "Processing..." : "Pay & Order"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Menu Categories */}
      <div className="space-y-6">
        {categories.map(category => {
          const categoryItems = menuItems.filter(item => item.category === category);
          const categoryIcons = {
            "Hot Beverages": Coffee,
            "Cold Beverages": Coffee,
            "Shakes": Coffee,
            "Food": Utensils,
            "Protein Shakes": Coffee
          };
          const IconComponent = categoryIcons[category as keyof typeof categoryIcons];

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5 text-primary" />
                  {category}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryItems.map(item => (
                    <div key={item.id} className="relative border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      {item.popular && (
                        <Badge className="absolute -top-2 -right-2" variant="secondary">
                          <Star className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-foreground">{item.name}</h4>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          )}
                          <p className="text-lg font-bold text-primary">₹{item.price}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          {cart[item.id] ? (
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => removeFromCart(item.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="font-semibold min-w-[2rem] text-center">{cart[item.id]}</span>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => addToCart(item.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              onClick={() => addToCart(item.id)}
                              size="sm"
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-1" />
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Truck className="h-5 w-5" />
              Quick Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Orders delivered directly to your seat</li>
              <li>• Average delivery time: 10-15 minutes</li>
              <li>• Fresh preparation for every order</li>
              <li>• Digital payment accepted</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Clock className="h-5 w-5" />
              Service Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Monday to Sunday: 8:00 AM - 10:00 PM</li>
              <li>• Special night service: 10:00 PM - 6:00 AM</li>
              <li>• Hot beverages available 24/7</li>
              <li>• Fresh food prepared daily</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Canteen;