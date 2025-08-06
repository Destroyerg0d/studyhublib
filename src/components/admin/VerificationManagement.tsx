import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
} from "lucide-react";

interface VerificationRequest {
  id: string;
  user_id: string;
  aadhar_front_url: string | null;
  aadhar_back_url: string | null;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
  user?: {
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    emergency_contact_relation: string | null;
  };
}

const VerificationManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightPending, setHighlightPending] = useState(false);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const tableRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const fetchVerificationRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select(`
          *,
          profiles!user_id (
            name,
            email,
            phone,
            address,
            emergency_contact_name,
            emergency_contact_phone,
            emergency_contact_relation
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match interface
      const transformedData = data?.map(request => ({
        ...request,
        user: request.profiles
      })) || [];
      
      setVerificationRequests(transformedData);
    } catch (error) {
      console.error('Error fetching verification requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch verification requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationRequests();

    // Set up real-time subscription
    const channel = supabase
      .channel('verification-management')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'verification_requests' }, 
        () => fetchVerificationRequests()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' }, 
        () => fetchVerificationRequests()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleVerificationAction = async (action: string, requestId: string, reason?: string) => {
    try {
      const updateData: any = {
        reviewed_at: new Date().toISOString(),
        reviewed_by: (await supabase.auth.getUser()).data.user?.id,
      };

      if (action === "Approved") {
        updateData.status = "approved";
        
        // Also update the user's verified status in profiles
        const request = verificationRequests.find(r => r.id === requestId);
        if (request?.user_id) {
          await supabase
            .from('profiles')
            .update({ verified: true })
            .eq('id', request.user_id);
        }
      } else if (action === "Rejected") {
        updateData.status = "rejected";
        updateData.rejection_reason = reason;
      }

      const { error } = await supabase
        .from('verification_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: `Verification ${action}`,
        description: `Request has been ${action.toLowerCase()} successfully.`,
      });
      
      fetchVerificationRequests();
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing verification:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action.toLowerCase()} verification`,
        variant: "destructive",
      });
    }
  };

  const handleReviewNow = () => {
    // Scroll to the table
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
    
    // Highlight pending requests
    setHighlightPending(true);
    
    // Filter to show only pending requests
    setSearchTerm("pending");
    
    // Show toast notification
    toast({
      title: "Reviewing Pending Requests",
      description: `Found ${pendingCount} pending verification request${pendingCount > 1 ? 's' : ''} to review.`,
    });
    
    // Remove highlight after 3 seconds
    setTimeout(() => {
      setHighlightPending(false);
      setSearchTerm(""); // Clear filter to show all requests again
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredRequests = verificationRequests.filter(request => {
    const matchesSearch = request.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.status.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const pendingCount = verificationRequests.filter(r => r.status === "pending").length;
  const approvedCount = verificationRequests.filter(r => r.status === "approved").length;
  const rejectedCount = verificationRequests.filter(r => r.status === "rejected").length;
  const approvalRate = verificationRequests.length > 0 ? Math.round((approvedCount / verificationRequests.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading verification requests...</div>
      </div>
    );
  }

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
              <div className="text-2xl font-bold text-blue-600">{approvalRate}%</div>
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
            <Button 
              size="sm" 
              variant="outline" 
              className="border-yellow-600 text-yellow-600 hover:bg-yellow-100"
              onClick={handleReviewNow}
            >
              Review Now
            </Button>
          </CardContent>
        </Card>
      )}

      <Card ref={tableRef}>
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
                placeholder="Search by name, email, or status..."
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
                  <TableRow 
                    key={request.id}
                    className={
                      highlightPending && request.status === "pending" 
                        ? "bg-yellow-50 border-l-4 border-l-yellow-400 animate-pulse" 
                        : ""
                    }
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.user?.name || "Unknown"}</div>
                        <div className="text-sm text-gray-500">{request.user?.email || "No email"}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{request.user?.phone || "No phone"}</div>
                      <div className="text-xs text-gray-500">
                        Emergency: {request.user?.emergency_contact_name || "Not provided"}
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
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Verification Details - {request.user?.name}</DialogTitle>
                              <DialogDescription>
                                Review all submitted information and documents
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-6">
                              {/* Personal Information */}
                              <div>
                                <h4 className="font-medium mb-3">Personal Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">Name:</span>
                                    <p>{request.user?.name || "Not provided"}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Email:</span>
                                    <p>{request.user?.email || "Not provided"}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Phone:</span>
                                    <p>{request.user?.phone || "Not provided"}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Status:</span>
                                    <Badge className={getStatusColor(request.status)}>
                                      {request.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              {/* Address */}
                              <div>
                                <h4 className="font-medium mb-2">Address</h4>
                                <p className="text-sm text-gray-700">{request.user?.address || "Not provided"}</p>
                              </div>

                              {/* Emergency Contact */}
                              <div>
                                <h4 className="font-medium mb-3">Emergency Contact</h4>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">Name:</span>
                                    <p>{request.user?.emergency_contact_name || "Not provided"}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Phone:</span>
                                    <p>{request.user?.emergency_contact_phone || "Not provided"}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Relation:</span>
                                    <p>{request.user?.emergency_contact_relation || "Not provided"}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Documents */}
                              <div>
                                <h4 className="font-medium mb-3">Uploaded Documents</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="border rounded-lg p-3">
                                    <p className="text-sm font-medium">Aadhar Front</p>
                                    <p className="text-xs text-gray-500">{request.aadhar_front_url ? "Document uploaded" : "Not uploaded"}</p>
                                    {request.aadhar_front_url && (
                                      <Button size="sm" variant="outline" className="mt-2" asChild>
                                        <a href={request.aadhar_front_url} target="_blank" rel="noopener noreferrer">
                                          View Document
                                        </a>
                                      </Button>
                                    )}
                                  </div>
                                  <div className="border rounded-lg p-3">
                                    <p className="text-sm font-medium">Aadhar Back</p>
                                    <p className="text-xs text-gray-500">{request.aadhar_back_url ? "Document uploaded" : "Not uploaded"}</p>
                                    {request.aadhar_back_url && (
                                      <Button size="sm" variant="outline" className="mt-2" asChild>
                                        <a href={request.aadhar_back_url} target="_blank" rel="noopener noreferrer">
                                          View Document
                                        </a>
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Rejection Reason (if applicable) */}
                              {request.status === "rejected" && request.rejection_reason && (
                                <div>
                                  <h4 className="font-medium mb-2 text-red-700">Rejection Reason</h4>
                                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                    {request.rejection_reason}
                                  </p>
                                </div>
                              )}

                              {/* Action Buttons */}
                              {request.status === "pending" && (
                                <div className="flex space-x-3 pt-4 border-t">
                                  <Button
                                    onClick={() => handleVerificationAction("Approved", request.id)}
                                    className="flex-1"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" className="flex-1">
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
                                          value={rejectionReason}
                                          onChange={(e) => setRejectionReason(e.target.value)}
                                        />
                                        <div className="flex space-x-2">
                                          <Button 
                                            variant="destructive"
                                            onClick={() => {
                                              handleVerificationAction("Rejected", request.id, rejectionReason);
                                              setRejectionReason("");
                                            }}
                                            disabled={!rejectionReason.trim()}
                                          >
                                            Reject Request
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {request.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerificationAction("Approved", request.id)}
                            >
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
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
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                  />
                                  <Button 
                                    variant="destructive"
                                    onClick={() => {
                                      handleVerificationAction("Rejected", request.id, rejectionReason);
                                      setRejectionReason("");
                                    }}
                                    disabled={!rejectionReason.trim()}
                                  >
                                    Reject Request
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

          {filteredRequests.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No verification requests found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationManagement;