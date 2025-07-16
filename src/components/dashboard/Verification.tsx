
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckCircle,
  Upload,
  AlertCircle,
  User,
  Phone,
  MapPin,
  CreditCard,
  FileText,
} from "lucide-react";

const Verification = () => {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aadharFront, setAadharFront] = useState<File | null>(null);
  const [aadharBack, setAadharBack] = useState<File | null>(null);
  const [verificationRequest, setVerificationRequest] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullname: profile?.name || '',
    phone: profile?.phone || '',
    dob: profile?.date_of_birth || '',
    address: profile?.address || '',
    emergencyName: profile?.emergency_contact_name || '',
    emergencyPhone: profile?.emergency_contact_phone || '',
    relationship: profile?.emergency_contact_relation || ''
  });

  // Fetch existing verification request
  useEffect(() => {
    const fetchVerificationRequest = async () => {
      if (!profile?.id) return;

      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      if (data) {
        setVerificationRequest(data);
      }
    };

    fetchVerificationRequest();

    // Set up real-time subscription for verification updates
    const subscription = supabase
      .channel('verification-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'verification_requests',
          filter: `user_id=eq.${profile?.id}`
        },
        (payload) => {
          console.log('Verification request updated:', payload);
          if (payload.new) {
            setVerificationRequest(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [profile?.id]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB.",
          variant: "destructive"
        });
        return;
      }

      if (type === 'front') {
        setAadharFront(file);
      } else {
        setAadharBack(file);
      }
      toast({
        title: "File selected",
        description: `Aadhar ${type} side selected successfully.`,
      });
    }
  };

  const uploadFile = async (file: File, fileName: string) => {
    const { data, error } = await supabase.storage
      .from('verification-docs')
      .upload(`${profile?.id}/${fileName}`, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    setIsSubmitting(true);

    try {
      // Update profile with form data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formData.fullname,
          phone: formData.phone,
          date_of_birth: formData.dob,
          address: formData.address,
          emergency_contact_name: formData.emergencyName,
          emergency_contact_phone: formData.emergencyPhone,
          emergency_contact_relation: formData.relationship,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (profileError) throw profileError;

      // Upload files if provided
      let aadharFrontUrl = verificationRequest?.aadhar_front_url;
      let aadharBackUrl = verificationRequest?.aadhar_back_url;

      if (aadharFront) {
        aadharFrontUrl = await uploadFile(aadharFront, `aadhar_front_${Date.now()}.${aadharFront.name.split('.').pop()}`);
      }

      if (aadharBack) {
        aadharBackUrl = await uploadFile(aadharBack, `aadhar_back_${Date.now()}.${aadharBack.name.split('.').pop()}`);
      }

      // Create or update verification request
      const verificationData = {
        user_id: profile.id,
        status: 'pending',
        aadhar_front_url: aadharFrontUrl,
        aadhar_back_url: aadharBackUrl,
        updated_at: new Date().toISOString()
      };

      if (verificationRequest) {
        // Update existing request
        const { error } = await supabase
          .from('verification_requests')
          .update(verificationData)
          .eq('id', verificationRequest.id);

        if (error) throw error;
      } else {
        // Create new request
        const { error } = await supabase
          .from('verification_requests')
          .insert(verificationData);

        if (error) throw error;
      }

      // Refresh profile data
      await refreshProfile();

      toast({
        title: "Verification submitted!",
        description: "Your documents have been submitted for review. You'll be notified once verified.",
      });

    } catch (error) {
      console.error('Verification submission error:', error);
      toast({
        title: "Error",
        description: "Failed to submit verification. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const verificationSteps = [
    {
      id: 1,
      title: "Personal Details",
      description: "Basic information verification",
      status: "completed",
      icon: User,
    },
    {
      id: 2,
      title: "Document Upload",
      description: "Aadhar card front and back",
      status: verificationRequest ? "completed" : "pending",
      icon: CreditCard,
    },
    {
      id: 3,
      title: "Admin Review",
      description: "Document verification by admin",
      status: verificationRequest?.status === 'approved' ? "completed" : 
              verificationRequest?.status === 'rejected' ? "failed" : "pending",
      icon: FileText,
    },
    {
      id: 4,
      title: "Account Activation",
      description: "Full access to all features",
      status: profile?.verified ? "completed" : "pending",
      icon: CheckCircle,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed": return "✓";
      case "pending": return "⏳";
      case "failed": return "✗";
      default: return "○";
    }
  };

  return (
    <div className="space-y-6">
      {/* Verification Status */}
      <Card className={profile?.verified ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
        <CardHeader>
          <div className="flex items-center">
            {profile?.verified ? (
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
            ) : (
              <AlertCircle className="h-6 w-6 text-yellow-600 mr-3" />
            )}
            <div>
              <CardTitle className={profile?.verified ? "text-green-900" : "text-yellow-900"}>
                {profile?.verified ? "Account Verified" : "Verification Required"}
              </CardTitle>
              <CardDescription className={profile?.verified ? "text-green-700" : "text-yellow-700"}>
                {profile?.verified 
                  ? "Your account is fully verified and active"
                  : "Complete verification to access all features"
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Badge className={profile?.verified ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}>
            {profile?.verified ? "Verified" : `Status: ${verificationRequest?.status || 'Not Submitted'}`}
          </Badge>
          {verificationRequest?.status === 'rejected' && verificationRequest.rejection_reason && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">
                <strong>Rejection Reason:</strong> {verificationRequest.rejection_reason}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Process</CardTitle>
          <CardDescription>Complete these steps to verify your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {verificationSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center space-x-4">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${step.status === 'completed' ? 'bg-green-500 text-white' : 
                      step.status === 'pending' ? 'bg-yellow-500 text-white' : 
                      step.status === 'failed' ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-600'}
                  `}>
                    {getStepIcon(step.status)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                  <Badge className={getStatusColor(step.status)}>
                    {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Verification Form */}
      {(!profile?.verified && (!verificationRequest || verificationRequest.status === 'rejected')) && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input 
                    id="fullname" 
                    value={formData.fullname}
                    onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={profile?.email || ''} disabled />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+91 12345 67890"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input 
                    id="dob" 
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Complete Address</Label>
                <Textarea 
                  id="address" 
                  placeholder="Enter your complete address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  required 
                />
              </div>
            </CardContent>
          </Card>

          {/* Document Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Aadhar Card Upload
              </CardTitle>
              <CardDescription>
                Upload clear photos of both sides of your Aadhar card
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="aadhar-front">Aadhar Front Side</Label>
                  <div className="mt-2">
                    <input
                      id="aadhar-front"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'front')}
                      className="hidden"
                      required={!verificationRequest?.aadhar_front_url}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById('aadhar-front')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {aadharFront ? aadharFront.name : 
                       verificationRequest?.aadhar_front_url ? "Replace Front Side" : "Upload Front Side"}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="aadhar-back">Aadhar Back Side</Label>
                  <div className="mt-2">
                    <input
                      id="aadhar-back"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'back')}
                      className="hidden"
                      required={!verificationRequest?.aadhar_back_url}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById('aadhar-back')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {aadharBack ? aadharBack.name : 
                       verificationRequest?.aadhar_back_url ? "Replace Back Side" : "Upload Back Side"}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Important Guidelines:</p>
                    <ul className="mt-1 space-y-1">
                      <li>• Images should be clear and readable</li>
                      <li>• File size should be less than 5MB</li>
                      <li>• Accepted formats: JPG, PNG</li>
                      <li>• Ensure all details are visible</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergency-name">Contact Name</Label>
                  <Input 
                    id="emergency-name" 
                    placeholder="Parent/Guardian name"
                    value={formData.emergencyName}
                    onChange={(e) => setFormData({...formData, emergencyName: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="emergency-phone">Contact Phone</Label>
                  <Input 
                    id="emergency-phone" 
                    type="tel" 
                    placeholder="+91 12345 67890"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="relationship">Relationship</Label>
                  <Input 
                    id="relationship" 
                    placeholder="e.g., Father, Mother, Guardian"
                    value={formData.relationship}
                    onChange={(e) => setFormData({...formData, relationship: e.target.value})}
                    required 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Card>
            <CardContent className="pt-6">
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : 
                 verificationRequest ? "Update Verification" : "Submit for Verification"}
              </Button>
              <p className="text-sm text-gray-600 text-center mt-3">
                By submitting, you agree to our terms and conditions. 
                Your information will be kept secure and used only for verification purposes.
              </p>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
};

export default Verification;
