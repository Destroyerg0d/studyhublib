
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aadharFront, setAadharFront] = useState<File | null>(null);
  const [aadharBack, setAadharBack] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    fullname: 'Student User',
    phone: '',
    dob: '',
    address: '',
    emergencyName: '',
    emergencyPhone: '',
    relationship: ''
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      // Simulate submission delay
      await new Promise(resolve => setTimeout(resolve, 2000));

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
      status: "pending",
      icon: CreditCard,
    },
    {
      id: 3,
      title: "Admin Review",
      description: "Document verification by admin",
      status: "pending",
      icon: FileText,
    },
    {
      id: 4,
      title: "Account Activation",
      description: "Full access to all features",
      status: "pending",
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
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-yellow-600 mr-3" />
            <div>
              <CardTitle className="text-yellow-900">Verification Required</CardTitle>
              <CardDescription className="text-yellow-700">
                Complete verification to access all features
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Badge className="bg-yellow-500 text-white">Status: Not Submitted</Badge>
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
                <Input id="email" type="email" value="student@studyhub.com" disabled />
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
              {isSubmitting ? "Submitting..." : "Submit for Verification"}
            </Button>
            <p className="text-sm text-gray-600 text-center mt-3">
              By submitting, you agree to our terms and conditions. 
              Your information will be kept secure and used only for verification purposes.
            </p>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default Verification;
