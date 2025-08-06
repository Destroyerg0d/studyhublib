import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  UtensilsCrossed,
  Plus,
  Edit,
  Trash2,
  Eye,
  Coffee,
  Cookie,
  Apple,
  Pizza,
  Clock,
  IndianRupee,
  ChefHat
} from "lucide-react";

interface CanteenItem {
  id: string;
  name: string;
  description: string;
  category: 'snacks' | 'beverages' | 'meals' | 'desserts' | 'healthy';
  price: number;
  image_url?: string;
  available: boolean;
  preparation_time: number;
  ingredients: string[];
  nutritional_info: any;
  created_at: string;
  updated_at: string;
}

const CanteenManagement = () => {
  const [items, setItems] = useState<CanteenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CanteenItem | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    category: 'snacks' | 'beverages' | 'meals' | 'desserts' | 'healthy';
    price: string;
    image_url: string;
    available: boolean;
    preparation_time: string;
    ingredients: string;
  }>({
    name: '',
    description: '',
    category: 'snacks',
    price: '',
    image_url: '',
    available: true,
    preparation_time: '',
    ingredients: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('canteen_items')
        .select('*')
        .order('category')
        .order('name');

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching canteen items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch canteen items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const itemData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        image_url: formData.image_url || null,
        available: formData.available,
        preparation_time: parseInt(formData.preparation_time) || 0,
        ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(Boolean),
      };

      if (editingItem) {
        const { error } = await supabase
          .from('canteen_items')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Item updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('canteen_items')
          .insert([itemData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Item added successfully",
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchItems();
    } catch (error) {
      console.error('Error saving item:', error);
      toast({
        title: "Error",
        description: "Failed to save item",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from('canteen_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
      
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const toggleAvailability = async (item: CanteenItem) => {
    try {
      const { error } = await supabase
        .from('canteen_items')
        .update({ available: !item.available })
        .eq('id', item.id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Item ${!item.available ? 'enabled' : 'disabled'} successfully`,
      });
      
      fetchItems();
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'snacks',
      price: '',
      image_url: '',
      available: true,
      preparation_time: '',
      ingredients: '',
    });
    setEditingItem(null);
  };

  const openEditDialog = (item: CanteenItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category,
      price: item.price.toString(),
      image_url: item.image_url || '',
      available: item.available,
      preparation_time: item.preparation_time.toString(),
      ingredients: item.ingredients.join(', '),
    });
    setDialogOpen(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'beverages': return <Coffee className="h-4 w-4" />;
      case 'snacks': return <Cookie className="h-4 w-4" />;
      case 'meals': return <Pizza className="h-4 w-4" />;
      case 'healthy': return <Apple className="h-4 w-4" />;
      case 'desserts': return <ChefHat className="h-4 w-4" />;
      default: return <UtensilsCrossed className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'beverages': return 'bg-blue-100 text-blue-800';
      case 'snacks': return 'bg-yellow-100 text-yellow-800';
      case 'meals': return 'bg-green-100 text-green-800';
      case 'healthy': return 'bg-emerald-100 text-emerald-800';
      case 'desserts': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  const categoryStats = {
    total: items.length,
    available: items.filter(item => item.available).length,
    snacks: items.filter(item => item.category === 'snacks').length,
    beverages: items.filter(item => item.category === 'beverages').length,
    meals: items.filter(item => item.category === 'meals').length,
    healthy: items.filter(item => item.category === 'healthy').length,
    desserts: items.filter(item => item.category === 'desserts').length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <UtensilsCrossed className="h-6 w-6 mr-3 text-orange-600" />
            Canteen Management
          </h2>
          <p className="text-gray-600">Manage canteen menu items and availability</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </DialogTitle>
              <DialogDescription>
                {editingItem ? 'Update the item details below' : 'Add a new item to the canteen menu'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value: 'snacks' | 'beverages' | 'meals' | 'desserts' | 'healthy') => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="snacks">Snacks</SelectItem>
                      <SelectItem value="beverages">Beverages</SelectItem>
                      <SelectItem value="meals">Meals</SelectItem>
                      <SelectItem value="desserts">Desserts</SelectItem>
                      <SelectItem value="healthy">Healthy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="preparation_time">Preparation Time (minutes)</Label>
                <Input
                  id="preparation_time"
                  type="number"
                  value={formData.preparation_time}
                  onChange={(e) => setFormData({...formData, preparation_time: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="ingredients">Ingredients (comma separated)</Label>
                <Input
                  id="ingredients"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
                  placeholder="flour, potato, spices"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked) => setFormData({...formData, available: checked})}
                />
                <Label htmlFor="available">Available</Label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? 'Update' : 'Add'} Item
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{categoryStats.total}</p>
              <p className="text-sm text-gray-600">Total Items</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{categoryStats.available}</p>
              <p className="text-sm text-gray-600">Available</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{categoryStats.snacks}</p>
              <p className="text-sm text-gray-600">Snacks</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{categoryStats.beverages}</p>
              <p className="text-sm text-gray-600">Beverages</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{categoryStats.meals}</p>
              <p className="text-sm text-gray-600">Meals</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{categoryStats.healthy}</p>
              <p className="text-sm text-gray-600">Healthy</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-pink-600">{categoryStats.desserts}</p>
              <p className="text-sm text-gray-600">Desserts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="snacks">Snacks</TabsTrigger>
          <TabsTrigger value="beverages">Beverages</TabsTrigger>
          <TabsTrigger value="meals">Meals</TabsTrigger>
          <TabsTrigger value="healthy">Healthy</TabsTrigger>
          <TabsTrigger value="desserts">Desserts</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className={`hover:shadow-lg transition-shadow ${!item.available ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      {getCategoryIcon(item.category)}
                      <span className="ml-2">{item.name}</span>
                    </CardTitle>
                    <Badge className={getCategoryColor(item.category)}>
                      {item.category}
                    </Badge>
                  </div>
                  {item.description && (
                    <CardDescription>{item.description}</CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Price and Time */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-lg font-bold text-green-600">
                        <IndianRupee className="h-4 w-4 mr-1" />
                        {item.price}
                      </div>
                      {item.preparation_time > 0 && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          {item.preparation_time}m
                        </div>
                      )}
                    </div>
                    
                    {/* Ingredients */}
                    {item.ingredients.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Ingredients:</p>
                        <div className="flex flex-wrap gap-1">
                          {item.ingredients.slice(0, 3).map((ingredient, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {ingredient}
                            </Badge>
                          ))}
                          {item.ingredients.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.ingredients.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <Badge variant={item.available ? "default" : "secondary"}>
                        {item.available ? "Available" : "Unavailable"}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleAvailability(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <UtensilsCrossed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No items found in this category</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CanteenManagement;