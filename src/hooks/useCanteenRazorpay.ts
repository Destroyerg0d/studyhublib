import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CreateOrderOptions {
  items: OrderItem[];
  totalAmount: number;
  specialInstructions?: string;
  onSuccess?: (orderDetails: any) => void;
  onError?: (error: any) => void;
}

export const useCanteenRazorpay = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createOrder = async ({
    items,
    totalAmount,
    specialInstructions,
    onSuccess,
    onError,
  }: CreateOrderOptions) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to place an order",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      // Create order
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke('create-canteen-order', {
        body: {
          items,
          total_amount: totalAmount,
          special_instructions: specialInstructions,
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to create order');
      }

      // Get user profile for display
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, email, phone')
        .eq('id', user.id)
        .single();

      // Configure Razorpay options
      const options = {
        key: data.key_id,
        amount: data.razorpay_order.amount,
        currency: data.razorpay_order.currency,
        name: 'StudyHub Canteen',
        description: `Order ${data.order.order_number}`,
        order_id: data.razorpay_order.id,
        prefill: {
          name: profile?.name || '',
          email: profile?.email || user.email,
          contact: profile?.phone || '',
        },
        theme: {
          color: '#3B82F6',
        },
        handler: async (response: any) => {
          try {
            // Verify payment
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
              'create-canteen-order',
              {
                method: 'PUT',
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  order_id: data.order.id,
                },
                headers: {
                  Authorization: `Bearer ${session.session.access_token}`,
                },
              }
            );

            if (verifyError || !verifyData.success) {
              throw new Error('Payment verification failed');
            }

            toast({
              title: "Order Placed Successfully!",
              description: `Your order ${data.order.order_number} has been placed and payment processed.`,
            });

            onSuccess?.(verifyData.order);
          } catch (error: any) {
            console.error('Payment verification error:', error);
            toast({
              title: "Payment Verification Failed",
              description: error.message || "Please contact support",
              variant: "destructive",
            });
            onError?.(error);
          }
        },
        modal: {
          ondismiss: () => {
            toast({
              title: "Payment Cancelled",
              description: "You cancelled the payment process",
              variant: "destructive",
            });
            onError?.(new Error('Payment cancelled by user'));
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Order creation error:', error);
      toast({
        title: "Order Creation Failed",
        description: error.message || "Something went wrong with creating the order",
        variant: "destructive",
      });
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createOrder,
    isLoading,
  };
};