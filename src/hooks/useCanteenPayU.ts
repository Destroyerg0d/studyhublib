import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    bolt: any;
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

export const useCanteenPayU = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadPayUScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.bolt) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout-static.citruspay.com/bolt/run/bolt.min.js';
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
      // Load PayU script
      const scriptLoaded = await loadPayUScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load PayU script');
      }

      // Create order
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke('create-canteen-payu-order', {
        body: {
          items,
          totalAmount,
          specialInstructions,
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

      const payuParams = data.payu_params;

      // Configure PayU options
      window.bolt.launch({
        key: payuParams.key,
        txnid: payuParams.txnid,
        hash: '', // Hash will be generated on server side
        amount: payuParams.amount,
        firstname: payuParams.firstname,
        email: payuParams.email,
        phone: payuParams.phone,
        productinfo: payuParams.productinfo,
        udf1: payuParams.udf1,
        udf2: payuParams.udf2,
        udf3: payuParams.udf3,
        surl: payuParams.surl,
        furl: payuParams.furl,
      }, {
        responseHandler: async (response: any) => {
          try {
            // Verify payment
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
              'create-canteen-payu-order',
              {
                method: 'PUT',
                body: {
                  payu_payment_id: response.mihpayid,
                  payu_order_id: response.txnid,
                  status: response.status === 'success' ? 'success' : 'failed',
                },
                headers: {
                  Authorization: `Bearer ${session.session.access_token}`,
                },
              }
            );

            if (verifyError || !verifyData.success) {
              throw new Error('Payment verification failed');
            }

            if (response.status === 'success') {
              toast({
                title: "Order Placed Successfully!",
                description: "Your canteen order has been placed and payment confirmed.",
              });
              onSuccess?.(verifyData.order);
            } else {
              throw new Error('Payment failed');
            }
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
        catchException: (error: any) => {
          console.error('PayU error:', error);
          toast({
            title: "Payment Error",
            description: "Something went wrong with the payment",
            variant: "destructive",
          });
          onError?.(error);
        }
      });

    } catch (error: any) {
      console.error('Order creation error:', error);
      toast({
        title: "Order Creation Failed",
        description: error.message || "Something went wrong while creating your order",
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