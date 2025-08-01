import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, CheckCircle, XCircle, Eye, Clock, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PaymentVerification {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  payment_proof_url: string | null;
  payment_method: string;
  transaction_reference: string | null;
  status: string;
  submitted_at: string;
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  user_profile?: {
    name: string;
    email: string;
  };
  plan?: {
    name: string;
    type: string;
  };
}

const PaymentVerificationManagement = () => {
  const [verifications, setVerifications] = useState<PaymentVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVerification, setSelectedVerification] = useState<PaymentVerification | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_verifications' as any)
        .select(`
          *,
          user_profile:profiles!inner(name, email),
          plan:plans!inner(name, type)
        `)
        .order('submitted_at', { ascending: false });

      if (error) {
        throw error;
      }

      setVerifications((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching payment verifications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payment verifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();

    // Set up real-time subscription
    const channel = supabase
      .channel('payment_verifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_verifications'
        },
        () => {
          fetchVerifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleVerificationAction = async (action: 'approve' | 'reject', verificationId: string, reason?: string) => {
    setActionLoading(true);

    try {
      const updateData: any = {
        status: action === 'approve' ? 'approved' : 'rejected',
        verified_by: user?.id,
        verified_at: new Date().toISOString(),
      };

      if (action === 'reject' && reason) {
        updateData.rejection_reason = reason;
      }

      const { error } = await supabase
        .from('payment_verifications' as any)
        .update(updateData)
        .eq('id', verificationId);

      if (error) {
        throw error;
      }

      // If approved, create subscription record
      if (action === 'approve') {
        const verification = verifications.find(v => v.id === verificationId);
        if (verification) {
          const { error: subscriptionError } = await supabase
            .from('subscriptions')
            .insert({
              user_id: verification.user_id,
              plan_id: verification.plan_id,
              start_date: new Date().toISOString().split('T')[0],
              end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
              amount_paid: verification.amount,
              payment_date: new Date().toISOString(),
              status: 'active'
            });

          if (subscriptionError) {
            console.error('Error creating subscription:', subscriptionError);
          }
        }
      }

      toast({
        title: `Payment ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        description: `Payment verification has been ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
      });

      setIsDialogOpen(false);
      setSelectedVerification(null);
      setRejectionReason('');
      fetchVerifications();
    } catch (error: any) {
      console.error('Error updating verification:', error);
      toast({
        title: "Error",
        description: `Failed to ${action} payment verification`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredVerifications = verifications.filter(verification =>
    verification.user_profile?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    verification.user_profile?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    verification.transaction_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    verification.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = verifications.filter(v => v.status === 'pending').length;
  const approvedCount = verifications.filter(v => v.status === 'approved').length;
  const rejectedCount = verifications.filter(v => v.status === 'rejected').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payment Verification</h2>
          <p className="text-muted-foreground">Manage and verify student payment submissions</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Verifications</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifications.length}</div>
          </CardContent>
        </Card>
      </div>

      {pendingCount > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <CardTitle className="text-yellow-800">Urgent Action Required</CardTitle>
            </div>
            <CardDescription className="text-yellow-700">
              You have {pendingCount} pending payment verification{pendingCount !== 1 ? 's' : ''} that need your attention.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user name, email, transaction reference, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Verifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Verifications</CardTitle>
          <CardDescription>All payment verification requests from students</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredVerifications.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">No verifications found</h3>
              <p className="text-muted-foreground">No payment verifications match your search criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Transaction Ref</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVerifications.map((verification) => (
                  <TableRow key={verification.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{verification.user_profile?.name}</div>
                        <div className="text-sm text-muted-foreground">{verification.user_profile?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{verification.plan?.name}</div>
                        <Badge variant="outline" className="text-xs">{verification.plan?.type}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">₹{verification.amount}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm">{verification.transaction_reference || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(verification.submitted_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(verification.status)} flex items-center space-x-1`}>
                        {getStatusIcon(verification.status)}
                        <span className="capitalize">{verification.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedVerification(verification);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Verification Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Verification Details</DialogTitle>
            <DialogDescription>
              Review and verify the payment submission
            </DialogDescription>
          </DialogHeader>

          {selectedVerification && (
            <div className="space-y-6">
              {/* Student and Plan Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Student Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedVerification.user_profile?.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedVerification.user_profile?.email}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Plan Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Plan:</span> {selectedVerification.plan?.name}</p>
                    <p><span className="font-medium">Type:</span> {selectedVerification.plan?.type}</p>
                    <p><span className="font-medium">Amount:</span> ₹{selectedVerification.amount}</p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h4 className="font-semibold mb-2">Payment Details</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Method:</span> {selectedVerification.payment_method}</p>
                  <p><span className="font-medium">Transaction Reference:</span> {selectedVerification.transaction_reference || 'N/A'}</p>
                  <p><span className="font-medium">Submitted:</span> {new Date(selectedVerification.submitted_at).toLocaleString()}</p>
                  <p><span className="font-medium">Status:</span> 
                    <Badge className={`ml-2 ${getStatusColor(selectedVerification.status)}`}>
                      {selectedVerification.status}
                    </Badge>
                  </p>
                </div>
              </div>

              {/* Payment Proof */}
              {selectedVerification.payment_proof_url && (
                <div>
                  <h4 className="font-semibold mb-2">Payment Proof</h4>
                  <div className="border rounded-lg p-4">
                    <img 
                      src={selectedVerification.payment_proof_url} 
                      alt="Payment proof"
                      className="max-w-full h-auto rounded"
                    />
                  </div>
                </div>
              )}

              {/* Rejection Reason Input (for rejection) */}
              {selectedVerification.status === 'pending' && (
                <div>
                  <Label htmlFor="rejection-reason">Rejection Reason (if rejecting)</Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Enter reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              {/* Previous Actions */}
              {selectedVerification.status !== 'pending' && (
                <div>
                  <h4 className="font-semibold mb-2">Verification History</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Verified at:</span> {selectedVerification.verified_at ? new Date(selectedVerification.verified_at).toLocaleString() : 'N/A'}</p>
                    {selectedVerification.rejection_reason && (
                      <p><span className="font-medium">Rejection reason:</span> {selectedVerification.rejection_reason}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedVerification?.status === 'pending' && (
              <div className="flex space-x-2">
                <Button
                  variant="destructive"
                  onClick={() => handleVerificationAction('reject', selectedVerification.id, rejectionReason)}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Processing..." : "Reject"}
                </Button>
                <Button
                  onClick={() => handleVerificationAction('approve', selectedVerification.id)}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Processing..." : "Approve"}
                </Button>
              </div>
            )}
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentVerificationManagement;