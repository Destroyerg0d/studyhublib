import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentOptions {
  planId: string;
  amount: number;
  planName: string;
  onSuccess?: (paymentDetails: any) => void;
  onError?: (error: any) => void;
}

export const useRazorpay = () => {
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

  const initiatePayment = async ({
    planId,
    amount,
    planName,
    onSuccess,
    onError,
  }: PaymentOptions) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to continue with payment",
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

      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          plan_id: planId,
          amount: amount,
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
        key: data.key_id, // Use the actual Razorpay key from backend
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'StudyHub',
        description: `Payment for ${planName}`,
        order_id: data.order.id,
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
              'create-razorpay-order',
              {
                method: 'PUT',
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
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
              title: "Payment Successful!",
              description: "Your payment has been processed successfully.",
            });

            onSuccess?.(response);
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
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Something went wrong with the payment",
        variant: "destructive",
      });
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    initiatePayment,
    isLoading,
  };
};