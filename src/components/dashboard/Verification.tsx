
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
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
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aadharFront, setAadharFront] = useState<File | null>(null);
  const [aadharBack, setAadharBack] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
    const file = event.target.files?.[0];
    if (file) {
      if (type === 'front') {
        setAadharFront(file);
      } else {
        setAadharBack(file);
      }
      toast({
        title: "File uploaded",
        description: `Aadhar ${type} side uploaded successfully.`,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate verification submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Verification submitted!",
        description: "Your documents have been submitted for review. You'll be notified once verified.",
      });
    }, 2000);
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
      status: profile?.verified ? "completed" : "pending",
      icon: CreditCard,
    },
    {
      id: 3,
      title: "Admin Review",
      description: "Document verification by admin",
      status: profile?.verified ? "completed" : "pending",
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
            {profile?.verified ? "Verified" : "Pending Verification"}
          </Badge>
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
                      step.status === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-300 text-gray-600'}
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
      {!profile?.verified && (
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
                  <Input id="fullname" defaultValue={profile?.name || ''} required />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue={profile?.email || ''} disabled />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+91 12345 67890" required />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" required />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Complete Address</Label>
                <Textarea id="address" placeholder="Enter your complete address" required />
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
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById('aadhar-front')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {aadharFront ? aadharFront.name : "Upload Front Side"}
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
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById('aadhar-back')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {aadharBack ? aadharBack.name : "Upload Back Side"}
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
                      <li>• Accepted formats: JPG, PNG, PDF</li>
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
                  <Input id="emergency-name" placeholder="Parent/Guardian name" required />
                </div>
                <div>
                  <Label htmlFor="emergency-phone">Contact Phone</Label>
                  <Input id="emergency-phone" type="tel" placeholder="+91 12345 67890" required />
                </div>
                <div>
                  <Label htmlFor="relationship">Relationship</Label>
                  <Input id="relationship" placeholder="e.g., Father, Mother, Guardian" required />
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
                {isSubmitting ? "Submitting..." : "Submit for Verification"}
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
