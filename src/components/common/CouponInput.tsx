import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Ticket, Check, X } from "lucide-react";

interface CouponInputProps {
  amount: number;
  orderType: 'subscriptions' | 'canteen';
  onCouponApplied: (coupon: { 
    code: string; 
    id: string; 
    discount_amount: number; 
    final_amount: number; 
  } | null) => void;
  disabled?: boolean;
}

interface CouponValidation {
  valid: boolean;
  coupon_id: string;
  discount_amount: number;
  final_amount: number;
  error_message?: string;
}

const CouponInput = ({ amount, orderType, onCouponApplied, disabled = false }: CouponInputProps) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ 
    code: string; 
    id: string; 
    discount_amount: number; 
    final_amount: number; 
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a coupon code",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('validate_coupon', {
        _coupon_code: couponCode.toUpperCase(),
        _user_id: user.user.id,
        _order_type: orderType,
        _amount: amount
      });

      if (error) {
        throw new Error('Coupon validation failed: ' + error.message);
      }

      if (!data || data.length === 0) {
        throw new Error('Invalid coupon validation response');
      }

      const validation: CouponValidation = data[0];

      if (!validation.valid) {
        throw new Error(validation.error_message || 'Invalid coupon code');
      }

      const couponData = {
        code: couponCode.toUpperCase(),
        id: validation.coupon_id,
        discount_amount: validation.discount_amount,
        final_amount: validation.final_amount,
      };

      setAppliedCoupon(couponData);
      onCouponApplied(couponData);

      toast({
        title: "Coupon Applied!",
        description: `You saved ₹${validation.discount_amount}`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Invalid Coupon",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    onCouponApplied(null);
    
    toast({
      title: "Coupon Removed",
      description: "Coupon has been removed from your order",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateCoupon();
    }
  };

  if (disabled) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Ticket className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Have a coupon code?</span>
      </div>

      {!appliedCoupon ? (
        <div className="flex gap-2">
          <Input
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button 
            onClick={validateCoupon} 
            disabled={loading || !couponCode.trim()}
            variant="outline"
          >
            {loading ? 'Validating...' : 'Apply'}
          </Button>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <div>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  {appliedCoupon.code}
                </Badge>
                <p className="text-sm text-green-700 mt-1">
                  Discount: -₹{appliedCoupon.discount_amount}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeCoupon}
              className="text-green-700 hover:text-green-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {appliedCoupon && (
        <div className="border-t pt-3">
          <div className="flex justify-between text-sm">
            <span>Original Amount:</span>
            <span>₹{amount}</span>
          </div>
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount:</span>
            <span>-₹{appliedCoupon.discount_amount}</span>
          </div>
          <div className="flex justify-between font-semibold border-t pt-2 mt-2">
            <span>Final Amount:</span>
            <span>₹{appliedCoupon.final_amount}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponInput;