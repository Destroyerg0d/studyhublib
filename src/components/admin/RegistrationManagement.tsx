
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import GoogleSheetsSync from "./GoogleSheetsSync";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Users,
  Filter,
  RefreshCw,
} from "lucide-react";

interface RegistrationForm {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  email: string;
  phone: string;
  purpose: string;
  preferred_study_time: string;
  special_requirements: string | null;
  registration_agreed: boolean;
  terms_accepted: boolean;
  registration_experience: string | null;
  status: string;
  notes: string | null;
  processed_by: string | null;
  processed_at: string | null;
  form_submitted_at: string;
  created_at: string;
  updated_at: string;
}

const RegistrationManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedForm, setSelectedForm] = useState<RegistrationForm | null>(null);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: registrationForms = [], isLoading } = useQuery({
    queryKey: ['registration-forms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registration_forms')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as RegistrationForm[];
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { error } = await supabase
        .from('registration_forms')
        .update({
          status,
          notes: notes || null,
          processed_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registration-forms'] });
      toast({
        title: "Status updated",
        description: "Registration form status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleStatusUpdate = (id: string, status: string, formNotes?: string) => {
    updateStatusMutation.mutate({ id, status, notes: formNotes });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected": return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending": return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredForms = registrationForms.filter(form => {
    const matchesSearch = 
      form.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || form.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: registrationForms.length,
    pending: registrationForms.filter(f => f.status === 'pending').length,
    approved: registrationForms.filter(f => f.status === 'approved').length,
    rejected: registrationForms.filter(f => f.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="forms" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="forms">Registration Forms</TabsTrigger>
          <TabsTrigger value="sync">Google Sheets Sync</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sync">
          <GoogleSheetsSync />
        </TabsContent>
        
        <TabsContent value="forms">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total Forms</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                  <div className="text-sm text-gray-600">Approved</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                  <div className="text-sm text-gray-600">Rejected</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                <div>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Registration Forms
                  </CardTitle>
                  <CardDescription>Manage student registration applications</CardDescription>
                </div>
                <Button
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['registration-forms'] })}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by name, email, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Registration Forms Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Study Time</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredForms.map((form) => (
                      <TableRow key={form.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{form.first_name} {form.last_name}</div>
                            <div className="text-sm text-gray-500">{form.gender}</div>
                            <div className="text-sm text-gray-500">
                              DOB: {new Date(form.date_of_birth).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{form.email}</div>
                          <div className="text-sm text-gray-500">{form.phone}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{form.preferred_study_time}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm max-w-48 truncate">{form.purpose}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(form.status)}
                            <Badge className={getStatusColor(form.status)}>
                              {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(form.form_submitted_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedForm(form);
                                    setNotes(form.notes || "");
                                  }}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Registration Details</DialogTitle>
                                  <DialogDescription>
                                    Review and process the registration form
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedForm && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium">First Name</label>
                                        <p className="text-sm text-gray-600">{selectedForm.first_name}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Last Name</label>
                                        <p className="text-sm text-gray-600">{selectedForm.last_name}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Date of Birth</label>
                                        <p className="text-sm text-gray-600">
                                          {new Date(selectedForm.date_of_birth).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Gender</label>
                                        <p className="text-sm text-gray-600">{selectedForm.gender}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Email</label>
                                        <p className="text-sm text-gray-600">{selectedForm.email}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Phone</label>
                                        <p className="text-sm text-gray-600">{selectedForm.phone}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Preferred Study Time</label>
                                        <p className="text-sm text-gray-600">{selectedForm.preferred_study_time}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Current Status</label>
                                        <div className="flex items-center space-x-2">
                                          {getStatusIcon(selectedForm.status)}
                                          <Badge className={getStatusColor(selectedForm.status)}>
                                            {selectedForm.status.charAt(0).toUpperCase() + selectedForm.status.slice(1)}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <label className="text-sm font-medium">Purpose</label>
                                      <p className="text-sm text-gray-600">{selectedForm.purpose}</p>
                                    </div>
                                    
                                    {selectedForm.special_requirements && (
                                      <div>
                                        <label className="text-sm font-medium">Special Requirements</label>
                                        <p className="text-sm text-gray-600">{selectedForm.special_requirements}</p>
                                      </div>
                                    )}
                                    
                                    {selectedForm.registration_experience && (
                                      <div>
                                        <label className="text-sm font-medium">Registration Experience</label>
                                        <p className="text-sm text-gray-600">{selectedForm.registration_experience}</p>
                                      </div>
                                    )}
                                    
                                    <div>
                                      <label className="text-sm font-medium">Admin Notes</label>
                                      <Textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add notes about this registration..."
                                        className="mt-1"
                                      />
                                    </div>
                                    
                                    <div className="flex justify-end space-x-2">
                                      {selectedForm.status === 'pending' && (
                                        <>
                                          <Button
                                            onClick={() => handleStatusUpdate(selectedForm.id, 'approved', notes)}
                                            className="bg-green-600 hover:bg-green-700"
                                          >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Approve
                                          </Button>
                                          <Button
                                            onClick={() => handleStatusUpdate(selectedForm.id, 'rejected', notes)}
                                            variant="destructive"
                                          >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reject
                                          </Button>
                                        </>
                                      )}
                                      {selectedForm.status !== 'pending' && (
                                        <Button
                                          onClick={() => handleStatusUpdate(selectedForm.id, 'pending', notes)}
                                          variant="outline"
                                        >
                                          <Clock className="h-4 w-4 mr-2" />
                                          Mark as Pending
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            
                            {form.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(form.id, 'approved')}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(form.id, 'rejected')}
                                  variant="destructive"
                                >
                                  <XCircle className="h-3 w-3" />
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

              {filteredForms.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No registration forms found matching your criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RegistrationManagement;
