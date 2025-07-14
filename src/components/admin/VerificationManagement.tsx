
import { useState } from "react";
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
} from "lucide-react";

const VerificationManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const verificationRequests = [
    {
      id: 1,
      studentName: "Rahul Kumar",
      email: "rahul@email.com",
      phone: "+91 9876543210",
      submitDate: "2024-12-18",
      status: "pending",
      documents: {
        aadharFront: "aadhar_front_rahul.jpg",
        aadharBack: "aadhar_back_rahul.jpg",
      },
      address: "123 MG Road, Bangalore, Karnataka - 560001",
      emergencyContact: {
        name: "Suresh Kumar",
        phone: "+91 9876543200",
        relation: "Father",
      },
    },
    {
      id: 2,
      studentName: "Priya Sharma", 
      email: "priya@email.com",
      phone: "+91 9876543211",
      submitDate: "2024-12-17",
      status: "approved",
      documents: {
        aadharFront: "aadhar_front_priya.jpg",
        aadharBack: "aadhar_back_priya.jpg",
      },
      address: "456 Brigade Road, Bangalore, Karnataka - 560025",
      emergencyContact: {
        name: "Raj Sharma",
        phone: "+91 9876543201",
        relation: "Father",
      },
      reviewDate: "2024-12-17",
      reviewedBy: "Admin",
    },
    {
      id: 3,
      studentName: "Amit Singh",
      email: "amit@email.com", 
      phone: "+91 9876543212",
      submitDate: "2024-12-16",
      status: "pending",
      documents: {
        aadharFront: "aadhar_front_amit.jpg",
        aadharBack: "aadhar_back_amit.jpg",
      },
      address: "789 Commercial Street, Bangalore, Karnataka - 560001",
      emergencyContact: {
        name: "Sunita Singh",
        phone: "+91 9876543202",
        relation: "Mother",
      },
    },
    {
      id: 4,
      studentName: "Sneha Patel",
      email: "sneha@email.com",
      phone: "+91 9876543213", 
      submitDate: "2024-12-15",
      status: "rejected",
      documents: {
        aadharFront: "aadhar_front_sneha.jpg",
        aadharBack: "aadhar_back_sneha.jpg",
      },
      address: "321 Residency Road, Bangalore, Karnataka - 560025",
      emergencyContact: {
        name: "Kiran Patel",
        phone: "+91 9876543203",
        relation: "Father",
      },
      reviewDate: "2024-12-15",
      reviewedBy: "Admin",
      rejectionReason: "Unclear document images. Please resubmit with clearer photos.",
    },
  ];

  const handleVerificationAction = (action: string, requestId: number, reason?: string) => {
    toast({
      title: `Verification ${action}`,
      description: `Request has been ${action.toLowerCase()} successfully.`,
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
    request.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                {Math.round((approvedCount / verificationRequests.length) * 100)}%
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
            <Button size="sm" variant="outline" className="border-yellow-600 text-yellow-600">
              Review Now
            </Button>
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
                        <div className="font-medium">{request.studentName}</div>
                        <div className="text-sm text-gray-500">{request.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{request.phone}</div>
                      <div className="text-xs text-gray-500">
                        Emergency: {request.emergencyContact.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(request.submitDate).toLocaleDateString()}
                      </div>
                      {request.reviewDate && (
                        <div className="text-xs text-gray-500">
                          Reviewed: {new Date(request.reviewDate).toLocaleDateString()}
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
                              <DialogTitle>Verification Details - {request.studentName}</DialogTitle>
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
                                    <p>{request.studentName}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Email:</span>
                                    <p>{request.email}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Phone:</span>
                                    <p>{request.phone}</p>
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
                                <p className="text-sm text-gray-700">{request.address}</p>
                              </div>

                              {/* Emergency Contact */}
                              <div>
                                <h4 className="font-medium mb-3">Emergency Contact</h4>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">Name:</span>
                                    <p>{request.emergencyContact.name}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Phone:</span>
                                    <p>{request.emergencyContact.phone}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Relation:</span>
                                    <p>{request.emergencyContact.relation}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Documents */}
                              <div>
                                <h4 className="font-medium mb-3">Uploaded Documents</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="border rounded-lg p-3">
                                    <p className="text-sm font-medium">Aadhar Front</p>
                                    <p className="text-xs text-gray-500">{request.documents.aadharFront}</p>
                                    <Button size="sm" variant="outline" className="mt-2">
                                      View Document
                                    </Button>
                                  </div>
                                  <div className="border rounded-lg p-3">
                                    <p className="text-sm font-medium">Aadhar Back</p>
                                    <p className="text-xs text-gray-500">{request.documents.aadharBack}</p>
                                    <Button size="sm" variant="outline" className="mt-2">
                                      View Document
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              {/* Rejection Reason (if applicable) */}
                              {request.status === "rejected" && request.rejectionReason && (
                                <div>
                                  <h4 className="font-medium mb-2 text-red-700">Rejection Reason</h4>
                                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                    {request.rejectionReason}
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
                                          className="min-h-20"
                                        />
                                        <Button
                                          onClick={() => handleVerificationAction("Rejected", request.id)}
                                          variant="destructive"
                                          className="w-full"
                                        >
                                          Reject Verification
                                        </Button>
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
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerificationAction("Rejected", request.id)}
                            >
                              <XCircle className="h-3 w-3 text-red-600" />
                            </Button>
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
