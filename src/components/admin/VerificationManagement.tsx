
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  User,
  FileText,
  Search,
  AlertTriangle,
  Download,
} from "lucide-react";

const VerificationManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Mock data for demonstration
  useEffect(() => {
    const mockRequests = [
      {
        id: '1',
        status: 'pending',
        created_at: new Date().toISOString(),
        profiles: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+91 98765 43210',
          address: '123 Main Street, City',
          date_of_birth: '1995-01-15',
          emergency_contact_name: 'Jane Doe',
          emergency_contact_phone: '+91 98765 43211',
          emergency_contact_relation: 'Mother'
        },
        aadhar_front_url: 'mock-front-url',
        aadhar_back_url: 'mock-back-url'
      },
      {
        id: '2',
        status: 'approved',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        reviewed_at: new Date().toISOString(),
        profiles: {
          name: 'Alice Smith',
          email: 'alice@example.com',
          phone: '+91 98765 43212',
          address: '456 Oak Avenue, City',
          date_of_birth: '1997-03-20',
          emergency_contact_name: 'Bob Smith',
          emergency_contact_phone: '+91 98765 43213',
          emergency_contact_relation: 'Father'
        },
        aadhar_front_url: 'mock-front-url-2',
        aadhar_back_url: 'mock-back-url-2'
      }
    ];
    
    setVerificationRequests(mockRequests);
  }, []);

  const handleVerificationAction = async (action: 'approved' | 'rejected', requestId: string, reason?: string) => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local state
      setVerificationRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { 
                ...req, 
                status: action, 
                reviewed_at: new Date().toISOString(),
                rejection_reason: action === 'rejected' ? reason : undefined
              }
            : req
        )
      );

      toast({
        title: `Verification ${action}`,
        description: `Request has been ${action} successfully.`,
      });

      setRejectionReason("");
      setSelectedRequest(null);

    } catch (error) {
      console.error('Error processing verification:', error);
      toast({
        title: "Error",
        description: "Failed to process verification request.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadDocument = async (url: string, fileName: string) => {
    toast({
      title: "Download Started",
      description: "Document download would start in a real implementation.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredRequests = verificationRequests.filter(request =>
    request.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = verificationRequests.filter(r => r.status === "pending").length;
  const approvedCount = verificationRequests.filter(r => r.status === "approved").length;
  const rejectedCount = verificationRequests.filter(r => r.status === "rejected").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
              <div className="text-sm text-gray-600">Pending Review</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {verificationRequests.length > 0 ? Math.round((approvedCount / verificationRequests.length) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Approval Rate</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Actions */}
      {pendingCount > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center p-4">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
            <div className="flex-1">
              <p className="text-sm text-yellow-800">
                <strong>Urgent:</strong> {pendingCount} verification request{pendingCount > 1 ? 's' : ''} pending review.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Verification Management
              </CardTitle>
              <CardDescription>Review and manage student verification requests</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.profiles?.name}</div>
                        <div className="text-sm text-gray-500">{request.profiles?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{request.profiles?.phone}</div>
                      <div className="text-xs text-gray-500">
                        Emergency: {request.profiles?.emergency_contact_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(request.created_at).toLocaleDateString()}
                      </div>
                      {request.reviewed_at && (
                        <div className="text-xs text-gray-500">
                          Reviewed: {new Date(request.reviewed_at).toLocaleDateString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Verification Details - {request.profiles?.name}</DialogTitle>
                              <DialogDescription>
                                Review all submitted information and documents
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedRequest && (
                              <div className="space-y-6">
                                {/* Personal Information */}
                                <div>
                                  <h4 className="font-medium mb-3">Personal Information</h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-600">Name:</span>
                                      <p>{selectedRequest.profiles?.name}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Email:</span>
                                      <p>{selectedRequest.profiles?.email}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Phone:</span>
                                      <p>{selectedRequest.profiles?.phone}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Date of Birth:</span>
                                      <p>{selectedRequest.profiles?.date_of_birth || 'Not provided'}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <span className="text-gray-600">Status:</span>
                                      <Badge className={getStatusColor(selectedRequest.status)}>
                                        {selectedRequest.status}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>

                                {/* Address */}
                                <div>
                                  <h4 className="font-medium mb-2">Address</h4>
                                  <p className="text-sm text-gray-700">{selectedRequest.profiles?.address || 'Not provided'}</p>
                                </div>

                                {/* Emergency Contact */}
                                <div>
                                  <h4 className="font-medium mb-3">Emergency Contact</h4>
                                  <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-600">Name:</span>
                                      <p>{selectedRequest.profiles?.emergency_contact_name || 'Not provided'}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Phone:</span>
                                      <p>{selectedRequest.profiles?.emergency_contact_phone || 'Not provided'}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Relation:</span>
                                      <p>{selectedRequest.profiles?.emergency_contact_relation || 'Not provided'}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Documents */}
                                <div>
                                  <h4 className="font-medium mb-3">Uploaded Documents</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="border rounded-lg p-3">
                                      <p className="text-sm font-medium">Aadhar Front</p>
                                      {selectedRequest.aadhar_front_url ? (
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          className="mt-2"
                                          onClick={() => downloadDocument(selectedRequest.aadhar_front_url, 'aadhar_front.jpg')}
                                        >
                                          <Download className="h-3 w-3 mr-1" />
                                          Download
                                        </Button>
                                      ) : (
                                        <p className="text-xs text-gray-500 mt-2">Not uploaded</p>
                                      )}
                                    </div>
                                    <div className="border rounded-lg p-3">
                                      <p className="text-sm font-medium">Aadhar Back</p>
                                      {selectedRequest.aadhar_back_url ? (
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          className="mt-2"
                                          onClick={() => downloadDocument(selectedRequest.aadhar_back_url, 'aadhar_back.jpg')}
                                        >
                                          <Download className="h-3 w-3 mr-1" />
                                          Download
                                        </Button>
                                      ) : (
                                        <p className="text-xs text-gray-500 mt-2">Not uploaded</p>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Rejection Reason (if applicable) */}
                                {selectedRequest.status === "rejected" && selectedRequest.rejection_reason && (
                                  <div>
                                    <h4 className="font-medium mb-2 text-red-700">Rejection Reason</h4>
                                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                      {selectedRequest.rejection_reason}
                                    </p>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                {selectedRequest.status === "pending" && (
                                  <div className="flex space-x-3 pt-4 border-t">
                                    <Button
                                      onClick={() => handleVerificationAction("approved", selectedRequest.id)}
                                      className="flex-1"
                                      disabled={isProcessing}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve
                                    </Button>
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" className="flex-1" disabled={isProcessing}>
                                          <XCircle className="h-4 w-4 mr-2" />
                                          Reject
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Reject Verification</DialogTitle>
                                          <DialogDescription>
                                            Please provide a reason for rejection
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <Textarea
                                            placeholder="Enter rejection reason..."
                                            className="min-h-20"
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                          />
                                          <Button
                                            onClick={() => handleVerificationAction("rejected", selectedRequest.id, rejectionReason)}
                                            variant="destructive"
                                            className="w-full"
                                            disabled={isProcessing || !rejectionReason.trim()}
                                          >
                                            {isProcessing ? "Processing..." : "Reject Verification"}
                                          </Button>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        {request.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerificationAction("approved", request.id)}
                              disabled={isProcessing}
                            >
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={isProcessing}
                                >
                                  <XCircle className="h-3 w-3 text-red-600" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reject Verification</DialogTitle>
                                  <DialogDescription>
                                    Please provide a reason for rejection
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Textarea
                                    placeholder="Enter rejection reason..."
                                    className="min-h-20"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                  />
                                  <Button
                                    onClick={() => handleVerificationAction("rejected", request.id, rejectionReason)}
                                    variant="destructive"
                                    className="w-full"
                                    disabled={isProcessing || !rejectionReason.trim()}
                                  >
                                    {isProcessing ? "Processing..." : "Reject Verification"}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationManagement;
