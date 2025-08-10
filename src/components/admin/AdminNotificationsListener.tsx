import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminNotificationsListener = () => {
  const { toast } = useToast();

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGm+DyvmwhBjiB0+/LciQBIIjO8d2RQwgXXrbq7qxYFQdMnOT0wWwgCTWAz+7JdyUBLYXJ8N+QSgcXd7ns3qhgFgg+ie3+wWwaEzODzfLBeSIALIzO8t6RTAcXfLrw3q1fFgs4jev+yWYdETKGyfC9fSEBK4rQ8t5sIAc5ju76xWEaFS2IxvHAfCMEJGjI8+KQQgkUZcbz4q1YGQg9je/5xmAVFTGGxvLCfCEFJobP8t5vIAk3jOr6xGMaFy+FyPLBfSMEJmfF8+KQRA4QYbT166llGgk8ju7+yWUZEzGGxvDBfSAEKYzN8t5sIAc5iOz+xWEaEy2MyOjCfSABMYjH8t5vIQcvjOj6xmEcFjGGwvLCfCEEJmfJ8+KQRQ4QYrT666llGQs8ju36yGUaEzCGx+7BfSEDLIzM8t5tIAg3jur6xWAaFyuNyezCfCEFJn/K9OOQRwwRaLvt4ahiFApQpOPotWUeFzN1u+3+wWsQHjCEz+26eSEGKorM9N2QSAoXfLns36xgFgg+ie3/wGwWFTCEz+7JeCQCJoTO9OSZRQ4RdLnw36xfFAM0jun5xWMaFiyOyPHBfCEHJWfM8+CQSAkXdLbz4qxYGQg8ke3/ymUaETOGyPLCfCAEJIXN8t1sJAc1jOr7xmMZFSyIyPPBfCAGJm/O8t6QQAcWfLrw3qxgFgg+jOz+wWsWHTCAye3IciYJKYXQ8NuRQwkYdLvt36NcFQ5FmN7zuGwcBT6B0e/LeiUGJYXS892QRAwXarru4qpjGQk4iuv8xmQdEjSHy+7BeyEHJWXH9OGQRwoVdLXx4axfFAo6ju78x2Mcfy6Oy/HKeSAH');
    audio.play().catch(() => {});
  };

  useEffect(() => {
    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'payment_verifications' },
        (payload) => {
          playNotificationSound();
          toast({
            title: 'New Payment Verification',
            description: `Amount: ₹${payload.new.amount} • Method: ${payload.new.payment_method || 'qr_code'}`,
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'verification_requests' },
        () => {
          playNotificationSound();
          toast({
            title: 'New Profile Verification',
            description: 'A user submitted verification details for review.',
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'canteen_orders' },
        (payload) => {
          playNotificationSound();
          toast({
            title: 'New Canteen Order',
            description: `Order ${payload.new.order_number || ''} • Total: ₹${payload.new.total_amount}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
};

export default AdminNotificationsListener;
