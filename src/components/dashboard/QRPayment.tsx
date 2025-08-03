import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, QrCode, Upload, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface QRPaymentProps {
  plan: {
    id: string;
    name: string;
    price: number;
    type: string;
  };
  onSubmitted?: () => void;
}

const QRPayment = ({ plan, onSubmitted }: QRPaymentProps) => {
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // QR Code details - actual payment details
  const qrDetails = {
    upiId: "8595300308@okbizaxis",
    merchant: "The Study Hub Library",
    amount: plan.price,
    description: `StudyHub ${plan.name} Plan`
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
    const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('payment-proofs')
      .upload(fileName, file);

    if (uploadError) {
      throw new Error('Failed to upload payment proof');
    }

    const { data } = supabase.storage
      .from('payment-proofs')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmitVerification = async () => {
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

      // Submit verification request
      const { error } = await supabase
        .from('payment_verifications' as any)
        .insert({
          user_id: user?.id,
          plan_id: plan.id,
          amount: plan.price,
          payment_proof_url: proofUrl,
          transaction_reference: transactionRef,
          payment_method: 'qr_code'
        });

      if (error) {
        throw error;
      }

      setVerificationStatus('submitted');
      toast({
        title: "Payment verification submitted",
        description: "Your payment proof has been submitted for admin verification. You'll be notified once verified.",
      });

      onSubmitted?.();
    } catch (error: any) {
      console.error('Error submitting payment verification:', error);
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit payment verification",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (verificationStatus === 'submitted') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-green-700">Payment Verification Submitted</CardTitle>
          <CardDescription>
            Your payment proof has been submitted successfully. An admin will verify your payment within 24 hours.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* QR Code Payment Section */}
      <Card>
        <CardHeader className="text-center">
          <QrCode className="w-16 h-16 text-primary mx-auto mb-4" />
          <CardTitle>Scan QR Code to Pay</CardTitle>
          <CardDescription>
            Scan the QR code below with any UPI app to make payment for {plan.name} plan
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
              <span className="font-medium">Plan:</span>
              <Badge variant="secondary">{plan.name}</Badge>
            </div>
          </div>

          <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Payment Instructions:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Scan the QR code with any UPI app (GPay, PhonePe, Paytm, etc.)</li>
                <li>Verify the amount is ₹{plan.price}</li>
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
            onClick={handleSubmitVerification}
            disabled={isSubmitting || !paymentProof || !transactionRef.trim()}
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : "Submit for Verification"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QRPayment;