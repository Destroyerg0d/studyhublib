import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, QrCode, Upload, CheckCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CanteenQRPaymentProps {
  items: OrderItem[];
  totalAmount: number;
  specialInstructions?: string;
  onBack: () => void;
  onSuccess: () => void;
}

const CanteenQRPayment = ({ items, totalAmount, specialInstructions, onBack, onSuccess }: CanteenQRPaymentProps) => {
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // QR Code details - actual payment details
  const qrDetails = {
    upiId: "8595300308@okbizaxis",
    merchant: "The Study Hub Library",
    amount: totalAmount,
    description: `StudyHub Canteen Order - ₹${totalAmount}`
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please upload an image under 10MB",
          variant: "destructive",
        });
        return;
      }
      setPaymentProof(file);
    }
  };

  const uploadPaymentProof = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `canteen/${user?.id}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(fileName, file);

    if (uploadError) {
      throw new Error('Failed to upload payment proof');
    }

    const { data, error: urlError } = await supabase.storage
      .from('payment-proofs')
      .createSignedUrl(fileName, 365 * 24 * 60 * 60); // 1 year expiry

    if (urlError || !data) {
      throw new Error('Failed to generate signed URL for payment proof');
    }

    return data.signedUrl;
  };

  const handleSubmitOrder = async () => {
    if (!paymentProof) {
      toast({
        title: "Payment proof required",
        description: "Please upload your payment screenshot",
        variant: "destructive",
      });
      return;
    }

    if (!transactionRef.trim()) {
      toast({
        title: "Transaction reference required",
        description: "Please enter your transaction reference number",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload payment proof
      const proofUrl = await uploadPaymentProof(paymentProof);

      // Generate order number
      const { data: orderNumberData, error: orderNumberError } = await supabase
        .rpc('generate_order_number');

      if (orderNumberError) {
        throw new Error('Failed to generate order number');
      }

      // Create canteen order with QR payment
      const { error: orderError } = await supabase
        .from('canteen_orders')
        .insert({
          user_id: user?.id,
          order_number: orderNumberData,
          items: items as any,
          total_amount: totalAmount,
          original_amount: totalAmount,
          discount_amount: 0,
          status: 'payment_verification',
          payment_status: 'verification_pending',
          special_instructions: specialInstructions || null,
          razorpay_order_id: null,
          razorpay_payment_id: transactionRef,
          razorpay_signature: proofUrl // Store payment proof URL in signature field for QR payments
        });

      if (orderError) {
        throw orderError;
      }

      setOrderSubmitted(true);
      toast({
        title: "Order submitted successfully!",
        description: "Your order has been submitted for payment verification. You'll be notified once verified.",
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error submitting order:', error);
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit order",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-green-700">Order Submitted Successfully!</CardTitle>
          <CardDescription>
            Your canteen order has been submitted successfully. An admin will verify your payment and start preparing your order.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <Button variant="outline" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Menu
      </Button>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                <span className="text-sm">{item.name} × {item.quantity}</span>
                <span className="text-sm font-medium">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          
          {specialInstructions && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm"><strong>Special Instructions:</strong> {specialInstructions}</p>
            </div>
          )}
          
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center font-semibold text-lg">
              <span>Total Amount:</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Payment Section */}
      <Card>
        <CardHeader className="text-center">
          <QrCode className="w-16 h-16 text-primary mx-auto mb-4" />
          <CardTitle>Scan QR Code to Pay</CardTitle>
          <CardDescription>
            Scan the QR code below with any UPI app to make payment for your canteen order
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Actual QR Code Image */}
          <div className="flex justify-center">
            <img 
              src="/lovable-uploads/c3f2e18b-0fa9-4de4-8806-37667f7fcafb.png" 
              alt="Payment QR Code - The Study Hub Library" 
              className="max-w-sm w-full h-auto rounded-lg shadow-lg"
            />
          </div>
          
          {/* Payment Details */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Merchant:</span>
              <span className="font-semibold">{qrDetails.merchant}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">UPI ID:</span>
              <span className="font-mono">{qrDetails.upiId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Amount:</span>
              <span className="font-semibold text-lg">₹{qrDetails.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Purpose:</span>
              <Badge variant="secondary">Canteen Order</Badge>
            </div>
          </div>

          <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Payment Instructions:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Scan the QR code with any UPI app (GPay, PhonePe, Paytm, etc.)</li>
                <li>Verify the amount is ₹{totalAmount}</li>
                <li>Complete the payment</li>
                <li>Take a screenshot of the successful transaction</li>
                <li>Upload the screenshot below for verification</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Verification Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Payment Proof</CardTitle>
          <CardDescription>
            Upload your payment screenshot and transaction details for verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transaction-ref">Transaction Reference Number *</Label>
            <Input
              id="transaction-ref"
              placeholder="Enter UPI transaction ID or reference number"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-proof">Payment Screenshot *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                id="payment-proof"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="payment-proof"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Click to upload payment screenshot</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </div>
              </label>
              {paymentProof && (
                <div className="mt-3 text-sm text-green-600">
                  ✓ {paymentProof.name} selected
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSubmitOrder}
            disabled={isSubmitting || !paymentProof || !transactionRef.trim()}
            className="w-full"
          >
            {isSubmitting ? "Submitting Order..." : "Submit Order for Verification"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CanteenQRPayment;