import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Bell, CheckCircle, XCircle, Utensils, User, Hash, Calendar, IndianRupee } from "lucide-react";

interface CanteenOrder {
  id: string;
  order_number: string;
  user_id: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total_amount: number;
  status: string;
  payment_status: string;
  estimated_time?: number;
  special_instructions?: string;
  created_at: string;
  paid_at?: string;
  profiles?: {
    name: string;
    email: string;
  };
}

const CanteenOrderManagement = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<CanteenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  // Notification sound for new orders
  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGm+DyvmwhBjiB0+/LciQBIIjO8d2RQwgXXrbq7qxYFQdMnOT0wWwgCTWAz+7JdyUBLYXJ8N+QSgcXd7ns3qhgFgg+ie3+wWwaEzODzfLBeSIALIzO8t6RTAcXfLrw3q1fFgs4jev+yWYdETKGyfC9fSEBK4rQ8t5sIAc5ju76xWEaFS2IxvHAfCMEJGjI8+KQQgkUZcbz4q1YGQg9je/5xmAVFTGGxvLCfCEFJobP8t5vIAk3jOr6xGMaFy+FyPLBfSMEJmfF8+KQRA4QYbT166llGgk8ju7+yWUZEzGGxvDBfSAEKYzN8t5sIAc5iOz+xWEaEy2MyOjCfSABMYjH8t5vIQcvjOj6xmEcFjGGwvLCfCEEJmfJ8+KQRQ4QYrT666llGQs8ju36yGUaEzCGx+7BfSEDLIzM8t5tIAg3jur6xWAaFyuNyezCfCEFJn/K9OOQRwwRaLvt4ahiFApQpOPotWUeFzN1u+3+wWsQHjCEz+26eSEGKorM9N2QSAoXfLns36xgFgg+ie3/wGwWFTCEz+7JeCQCJoTO9OSZRQ4RdLnw36xfFAM0jun5xWMaFiyOyPHBfCEHJWfM8+CQSAkXdLbz4qxYGQg8ke3/ymUaETOGyPLCfCAEJIXN8t1sJAc1jOr7xmMZFSyIyPPBfCAGJm/O8t6QQAcWfLrw3qxgFgg+jOz+wWsWHTCAye3IciYJKYXQ8NuRQwkYdLvt36NcFQ5FmN7zuGwcBT6B0e/LeiUGJYXS892QRAwXarru4qpjGQk4iuv8xmQdEjSHy+7BeyEHJWXH9OGQRwoVdLXx4axfFAo6ju78x2Mcfy6Oy/HKeSAH');
    audio.play().catch(() => {
      // Fallback for browsers that don't allow auto-play
      console.log('Could not play notification sound');
    });
  };

  const fetchOrders = async () => {
    try {
      let { data, error } = await supabase
        .from('canteen_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        const { data: filteredData, error: filterError } = await supabase
          .from('canteen_orders')
          .select('*')
          .eq('status', filter)
          .order('created_at', { ascending: false });
        
        data = filteredData;
        error = filterError;
      }

      if (error) {
        throw error;
      }

      // Fetch user profiles separately
      const userIds = data?.map(order => order.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', userIds);

      const typedOrders = (data || []).map(order => {
        const userProfile = profilesData?.find(profile => profile.id === order.user_id);
        return {
          ...order,
          items: order.items as CanteenOrder['items'],
          profiles: userProfile
        };
      }) as CanteenOrder[];
      setOrders(typedOrders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, estimatedTime?: number) => {
    try {
      const updateData: any = { status };
      if (estimatedTime !== undefined) {
        updateData.estimated_time = estimatedTime;
      }

      const { error } = await supabase
        .from('canteen_orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) {
        throw error;
      }

      toast({
        title: "Order Updated",
        description: `Order status updated to ${status}`,
      });

      fetchOrders();
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'preparing':
        return <Clock className="h-4 w-4" />;
      case 'ready':
        return <Bell className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    fetchOrders();

    // Set up real-time subscription for new orders
    const channel = supabase
      .channel('canteen-orders-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'canteen_orders',
        },
        (payload) => {
          console.log('New order received:', payload);
          playNotificationSound();
          toast({
            title: "🔔 New Order Received!",
            description: `Order ${payload.new.order_number} has been placed`,
          });
          fetchOrders();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'canteen_orders',
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Utensils className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Canteen Orders</h1>
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Utensils className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Canteen Orders</h1>
            <p className="text-muted-foreground">Manage and track canteen orders</p>
          </div>
        </div>
        
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Orders Found</h3>
              <p className="text-muted-foreground">No canteen orders match the current filter.</p>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status}</span>
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Hash className="h-4 w-4" />
                      <span className="font-mono">{order.order_number}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IndianRupee className="h-4 w-4" />
                    <span className="font-semibold">₹{order.total_amount}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Customer Info */}
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{order.profiles?.name || 'Unknown'}</span>
                  <span className="text-muted-foreground">({order.profiles?.email})</span>
                </div>

                {/* Order Items */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Items:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span className="text-sm">{item.name} × {item.quantity}</span>
                        <span className="text-sm font-medium">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Instructions */}
                {order.special_instructions && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm"><strong>Special Instructions:</strong> {order.special_instructions}</p>
                  </div>
                )}

                {/* Order Time */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Ordered: {new Date(order.created_at).toLocaleString()}</span>
                  {order.paid_at && (
                    <span className="ml-4">Paid: {new Date(order.paid_at).toLocaleString()}</span>
                  )}
                </div>

                {/* Estimated Time */}
                {order.estimated_time && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Estimated time: {order.estimated_time} minutes</span>
                  </div>
                )}

                {/* Action Buttons */}
                {order.status === 'paid' && (
                  <div className="flex gap-2 pt-3 border-t">
                    <div className="flex gap-2 flex-1">
                      <Input
                        type="number"
                        placeholder="Est. time (min)"
                        className="w-32"
                        id={`time-${order.id}`}
                      />
                      <Button
                        onClick={() => {
                          const timeInput = document.getElementById(`time-${order.id}`) as HTMLInputElement;
                          const estimatedTime = parseInt(timeInput.value) || 15;
                          updateOrderStatus(order.id, 'preparing', estimatedTime);
                        }}
                        size="sm"
                      >
                        Start Preparing
                      </Button>
                    </div>
                  </div>
                )}
                
                {order.status === 'preparing' && (
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      size="sm"
                    >
                      Mark Ready
                    </Button>
                  </div>
                )}
                
                {order.status === 'ready' && (
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      size="sm"
                    >
                      Mark Delivered
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CanteenOrderManagement;