
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Eye, CheckCircle, XCircle, Clock, MessageSquare, Download } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type RegistrationForm = Tables<'registration_forms'>;

const RegistrationManagement = () => {
  const [registrations, setRegistrations] = useState<RegistrationForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationForm | null>(null);
  const [notes, setNotes] = useState("");
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    fetchRegistrations();
    setupRealtimeSubscription();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('registration_forms')
        .select('*')
        .order('form_submitted_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch registrations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('registration-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registration_forms',
        },
        (payload) => {
          console.log('Registration updated:', payload);
          fetchRegistrations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateRegistrationStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('registration_forms')
        .update({
          status,
          notes: notes || undefined,
          processed_at: new Date().toISOString(),
          processed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Registration ${status} successfully`,
      });
      
      setSelectedRegistration(null);
      setNotes("");
      fetchRegistrations();
    } catch (error) {
      console.error('Error updating registration:', error);
      toast({
        title: "Error",
        description: "Failed to update registration",
        variant: "destructive",
      });
    }
  };

  const syncFromGoogleSheets = async () => {
    try {
      setProcessingStatus("syncing");
      
      const { data, error } = await supabase.functions.invoke('sync-google-sheets', {
        body: {}
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Synced ${data?.count || 0} new registrations from Google Sheets`,
      });
      
      fetchRegistrations();
    } catch (error) {
      console.error('Error syncing from Google Sheets:', error);
      toast({
        title: "Error",
        description: "Failed to sync from Google Sheets",
        variant: "destructive",
      });
    } finally {
      setProcessingStatus("");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      contacted: "bg-blue-100 text-blue-800",
    };
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4" />;
      case "rejected": return <XCircle className="h-4 w-4" />;
      case "contacted": return <MessageSquare className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Registration Management</h2>
          <p className="text-gray-600">Manage library registration forms and applications</p>
        </div>
        <Button 
          onClick={syncFromGoogleSheets}
          disabled={processingStatus === "syncing"}
          className="bg-green-600 hover:bg-green-700"
        >
          <Download className="h-4 w-4 mr-2" />
          {processingStatus === "syncing" ? "Syncing..." : "Sync from Google Sheets"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Registrations</p>
                <p className="text-2xl font-bold">{registrations.length}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Eye className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {registrations.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {registrations.filter(r => r.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {registrations.filter(r => r.status === 'rejected').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {registrations.map((registration) => (
              <div key={registration.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">
                        {registration.first_name} {registration.last_name}
                      </h3>
                      <Badge className={getStatusBadge(registration.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(registration.status)}
                          {registration.status}
                        </div>
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Email:</span> {registration.email}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> {registration.phone}
                      </div>
                      <div>
                        <span className="font-medium">Study Time:</span> {registration.preferred_study_time}
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span> {new Date(registration.form_submitted_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedRegistration(registration)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Registration Details</DialogTitle>
                      </DialogHeader>
                      {selectedRegistration && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="font-medium">First Name</Label>
                              <p>{selectedRegistration.first_name}</p>
                            </div>
                            <div>
                              <Label className="font-medium">Last Name</Label>
                              <p>{selectedRegistration.last_name}</p>
                            </div>
                            <div>
                              <Label className="font-medium">Date of Birth</Label>
                              <p>{new Date(selectedRegistration.date_of_birth).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <Label className="font-medium">Gender</Label>
                              <p>{selectedRegistration.gender}</p>
                            </div>
                            <div>
                              <Label className="font-medium">Email</Label>
                              <p>{selectedRegistration.email}</p>
                            </div>
                            <div>
                              <Label className="font-medium">Phone</Label>
                              <p>{selectedRegistration.phone}</p>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="font-medium">Purpose</Label>
                            <p>{selectedRegistration.purpose}</p>
                          </div>
                          
                          <div>
                            <Label className="font-medium">Preferred Study Time</Label>
                            <p>{selectedRegistration.preferred_study_time}</p>
                          </div>
                          
                          {selectedRegistration.special_requirements && (
                            <div>
                              <Label className="font-medium">Special Requirements</Label>
                              <p>{selectedRegistration.special_requirements}</p>
                            </div>
                          )}
                          
                          {selectedRegistration.registration_experience && (
                            <div>
                              <Label className="font-medium">Registration Experience</Label>
                              <p>{selectedRegistration.registration_experience}</p>
                            </div>
                          )}
                          
                          <div>
                            <Label className="font-medium">Notes</Label>
                            <Textarea
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Add notes about this registration..."
                              className="mt-1"
                            />
                          </div>
                          
                          <div className="flex gap-2 pt-4 border-t">
                            <Button
                              onClick={() => updateRegistrationStatus(selectedRegistration.id, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => updateRegistrationStatus(selectedRegistration.id, 'rejected')}
                              variant="destructive"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              onClick={() => updateRegistrationStatus(selectedRegistration.id, 'contacted')}
                              variant="outline"
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Mark as Contacted
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
            
            {registrations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No registrations found.</p>
                <p className="text-sm">Click "Sync from Google Sheets" to import data.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationManagement;
