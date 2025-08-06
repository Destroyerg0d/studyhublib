import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { GraduationCap, Plus, Edit, Trash2, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TuitionLocation {
  id: string;
  name: string;
  rates: {
    lkg_ukg: number;
    class_1_8: number;
    class_8_10: number;
    class_11_12: number;
  };
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface LocationFormData {
  name: string;
  lkg_ukg: string;
  class_1_8: string;
  class_8_10: string;
  class_11_12: string;
  active: boolean;
}

const TuitionManagement = () => {
  const [locations, setLocations] = useState<TuitionLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<TuitionLocation | null>(null);
  const [formData, setFormData] = useState<LocationFormData>({
    name: "",
    lkg_ukg: "",
    class_1_8: "",
    class_8_10: "",
    class_11_12: "",
    active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tuition_locations')
        .select('*')
        .order('name');

      if (error) throw error;
      setLocations((data || []).map(item => ({
        ...item,
        rates: item.rates as any
      })));
    } catch (error) {
      console.error('Error fetching tuition locations:', error);
      toast({
        title: "Error",
        description: "Failed to load tuition locations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      lkg_ukg: "",
      class_1_8: "",
      class_8_10: "",
      class_11_12: "",
      active: true,
    });
    setEditingLocation(null);
  };

  const handleOpenDialog = (location?: TuitionLocation) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        name: location.name,
        lkg_ukg: location.rates.lkg_ukg.toString(),
        class_1_8: location.rates.class_1_8.toString(),
        class_8_10: location.rates.class_8_10.toString(),
        class_11_12: location.rates.class_11_12.toString(),
        active: location.active,
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Location name is required",
        variant: "destructive",
      });
      return;
    }

    const rates = {
      lkg_ukg: parseInt(formData.lkg_ukg) || 0,
      class_1_8: parseInt(formData.class_1_8) || 0,
      class_8_10: parseInt(formData.class_8_10) || 0,
      class_11_12: parseInt(formData.class_11_12) || 0,
    };

    try {
      if (editingLocation) {
        const { error } = await supabase
          .from('tuition_locations')
          .update({
            name: formData.name.trim(),
            rates,
            active: formData.active,
          })
          .eq('id', editingLocation.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Location updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('tuition_locations')
          .insert({
            name: formData.name.trim(),
            rates,
            active: formData.active,
          });

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Location added successfully",
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchLocations();
    } catch (error: any) {
      console.error('Error saving location:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save location",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this location?")) return;

    try {
      const { error } = await supabase
        .from('tuition_locations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Location deleted successfully",
      });
      
      fetchLocations();
    } catch (error: any) {
      console.error('Error deleting location:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete location",
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (location: TuitionLocation) => {
    try {
      const { error } = await supabase
        .from('tuition_locations')
        .update({ active: !location.active })
        .eq('id', location.id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Location ${!location.active ? 'activated' : 'deactivated'}`,
      });
      
      fetchLocations();
    } catch (error: any) {
      console.error('Error updating location status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update location status",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString()}`;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <GraduationCap className="h-8 w-8 text-emerald-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold">Tuition Management</h1>
            <p className="text-gray-600">Manage tuition locations and rates</p>
          </div>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingLocation ? 'Edit Location' : 'Add New Location'}
              </DialogTitle>
              <DialogDescription>
                {editingLocation ? 'Update location details and rates.' : 'Create a new tuition location with rates.'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Location Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter location name"
                  required
                />
              </div>
              
              <div className="space-y-3">
                <Label>Monthly Rates</Label>
                
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="lkg_ukg" className="text-sm">LKG and UKG Nursery</Label>
                    <Input
                      id="lkg_ukg"
                      type="number"
                      value={formData.lkg_ukg}
                      onChange={(e) => setFormData(prev => ({ ...prev, lkg_ukg: e.target.value }))}
                      placeholder="Amount in ₹"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="class_1_8" className="text-sm">1 to 8 Class</Label>
                    <Input
                      id="class_1_8"
                      type="number"
                      value={formData.class_1_8}
                      onChange={(e) => setFormData(prev => ({ ...prev, class_1_8: e.target.value }))}
                      placeholder="Amount in ₹"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="class_8_10" className="text-sm">8 to 10 Class</Label>
                    <Input
                      id="class_8_10"
                      type="number"
                      value={formData.class_8_10}
                      onChange={(e) => setFormData(prev => ({ ...prev, class_8_10: e.target.value }))}
                      placeholder="Amount in ₹"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="class_11_12" className="text-sm">11 to 12 Class (Math & Science)</Label>
                    <Input
                      id="class_11_12"
                      type="number"
                      value={formData.class_11_12}
                      onChange={(e) => setFormData(prev => ({ ...prev, class_11_12: e.target.value }))}
                      placeholder="Amount in ₹"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                />
                <Label htmlFor="active">Active</Label>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                  {editingLocation ? 'Update' : 'Add'} Location
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Locations List */}
      <div className="grid md:grid-cols-2 gap-6">
        {locations.map((location) => (
          <Card key={location.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-emerald-600 mr-2" />
                  <CardTitle className="text-xl text-emerald-700">{location.name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={location.active ? "default" : "secondary"}>
                    {location.active ? "Active" : "Inactive"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenDialog(location)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={location.active} 
                      onCheckedChange={() => toggleStatus(location)}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(location.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>Monthly tuition rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">LKG and UKG Nursery</span>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                    {formatPrice(location.rates.lkg_ukg)}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">1 to 8 Class</span>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                    {formatPrice(location.rates.class_1_8)}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">8 to 10 Class</span>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                    {formatPrice(location.rates.class_8_10)}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">11 to 12 Class (Math & Science)</span>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                    {formatPrice(location.rates.class_11_12)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {locations.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No tuition locations found</h3>
            <p className="text-gray-500 mb-4">Add your first tuition location to get started.</p>
            <Button onClick={() => handleOpenDialog()} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TuitionManagement;