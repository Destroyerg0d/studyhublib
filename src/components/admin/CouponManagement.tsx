import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Trash2, Edit, Plus, Copy, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_amount: number;
  max_discount?: number;
  usage_limit?: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  applicable_to: 'all' | 'subscriptions' | 'canteen';
  active: boolean;
  created_at: string;
}

interface CouponUsage {
  id: string;
  coupon_code: string;
  user_name: string;
  user_email: string;
  order_type: string;
  discount_amount: number;
  original_amount: number;
  final_amount: number;
  used_at: string;
}

const CouponManagement = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponUsage, setCouponUsage] = useState<CouponUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [activeTab, setActiveTab] = useState<'coupons' | 'usage'>('coupons');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    min_amount: '',
    max_discount: '',
    usage_limit: '',
    valid_from: '',
    valid_until: '',
    applicable_to: 'all' as 'all' | 'subscriptions' | 'canteen',
    active: true
  });

  useEffect(() => {
    fetchCoupons();
    fetchCouponUsage();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons((data || []) as Coupon[]);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch coupons: " + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCouponUsage = async () => {
    try {
      const { data, error } = await supabase
        .from('coupon_usage')
        .select(`
          *,
          coupons(code),
          profiles(name, email)
        `)
        .order('used_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedUsage = (data || []).map(usage => ({
        id: usage.id,
        coupon_code: usage.coupons?.code || 'Unknown',
        user_name: usage.profiles?.name || 'Unknown',
        user_email: usage.profiles?.email || 'Unknown',
        order_type: usage.order_type,
        discount_amount: usage.discount_amount,
        original_amount: usage.original_amount,
        final_amount: usage.final_amount,
        used_at: usage.used_at
      }));

      setCouponUsage(formattedUsage);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch coupon usage: " + error.message,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const couponData = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        description: formData.description || null,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_amount: parseFloat(formData.min_amount) || 0,
        max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        valid_from: formData.valid_from,
        valid_until: formData.valid_until,
        applicable_to: formData.applicable_to,
        active: formData.active
      };

      let error;
      if (editingCoupon) {
        const result = await supabase
          .from('coupons')
          .update(couponData)
          .eq('id', editingCoupon.id);
        error = result.error;
      } else {
        const result = await supabase
          .from('coupons')
          .insert([couponData]);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Coupon ${editingCoupon ? 'updated' : 'created'} successfully`,
      });

      resetForm();
      setIsDialogOpen(false);
      fetchCoupons();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_amount: coupon.min_amount.toString(),
      max_discount: coupon.max_discount?.toString() || '',
      usage_limit: coupon.usage_limit?.toString() || '',
      valid_from: format(new Date(coupon.valid_from), 'yyyy-MM-dd'),
      valid_until: format(new Date(coupon.valid_until), 'yyyy-MM-dd'),
      applicable_to: coupon.applicable_to,
      active: coupon.active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Coupon deleted successfully",
      });

      fetchCoupons();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const toggleCouponStatus = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ active })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Coupon ${active ? 'activated' : 'deactivated'} successfully`,
      });

      fetchCoupons();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied",
      description: "Coupon code copied to clipboard",
    });
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_amount: '',
      max_discount: '',
      usage_limit: '',
      valid_from: '',
      valid_until: '',
      applicable_to: 'all',
      active: true
    });
    setEditingCoupon(null);
  };

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading coupons...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Coupon Management</h1>
          <p className="text-muted-foreground">Manage discount coupons and track usage</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'coupons' ? 'default' : 'outline'}
            onClick={() => setActiveTab('coupons')}
          >
            Coupons
          </Button>
          <Button
            variant={activeTab === 'usage' ? 'default' : 'outline'}
            onClick={() => setActiveTab('usage')}
            className="gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Usage Analytics
          </Button>
        </div>
      </div>

      {activeTab === 'coupons' && (
        <>
          <div className="flex justify-between items-center">
            <div className="grid grid-cols-4 gap-4 flex-1 mr-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{coupons.length}</div>
                  <div className="text-sm text-muted-foreground">Total Coupons</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{coupons.filter(c => c.active).length}</div>
                  <div className="text-sm text-muted-foreground">Active Coupons</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{coupons.reduce((sum, c) => sum + c.used_count, 0)}</div>
                  <div className="text-sm text-muted-foreground">Total Uses</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">
                    {coupons.filter(c => new Date(c.valid_until) < new Date()).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Expired</div>
                </CardContent>
              </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Coupon
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
                  <DialogDescription>
                    {editingCoupon ? 'Update coupon details' : 'Create a new discount coupon for users'}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Coupon Code</Label>
                      <div className="flex gap-2">
                        <Input
                          id="code"
                          value={formData.code}
                          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                          placeholder="DISCOUNT20"
                          required
                        />
                        <Button type="button" variant="outline" onClick={generateCouponCode}>
                          Generate
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="20% Discount"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Special discount for new users"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="discount_type">Discount Type</Label>
                      <Select value={formData.discount_type} onValueChange={(value: 'percentage' | 'fixed') => 
                        setFormData(prev => ({ ...prev, discount_type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discount_value">
                        {formData.discount_type === 'percentage' ? 'Percentage' : 'Amount (₹)'}
                      </Label>
                      <Input
                        id="discount_value"
                        type="number"
                        value={formData.discount_value}
                        onChange={(e) => setFormData(prev => ({ ...prev, discount_value: e.target.value }))}
                        placeholder={formData.discount_type === 'percentage' ? '20' : '100'}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="min_amount">Min Amount (₹)</Label>
                      <Input
                        id="min_amount"
                        type="number"
                        value={formData.min_amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, min_amount: e.target.value }))}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max_discount">Max Discount (₹)</Label>
                      <Input
                        id="max_discount"
                        type="number"
                        value={formData.max_discount}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_discount: e.target.value }))}
                        placeholder="500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="usage_limit">Usage Limit</Label>
                      <Input
                        id="usage_limit"
                        type="number"
                        value={formData.usage_limit}
                        onChange={(e) => setFormData(prev => ({ ...prev, usage_limit: e.target.value }))}
                        placeholder="100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="applicable_to">Applicable To</Label>
                      <Select value={formData.applicable_to} onValueChange={(value: 'all' | 'subscriptions' | 'canteen') => 
                        setFormData(prev => ({ ...prev, applicable_to: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Orders</SelectItem>
                          <SelectItem value="subscriptions">Subscriptions Only</SelectItem>
                          <SelectItem value="canteen">Canteen Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="valid_from">Valid From</Label>
                      <Input
                        id="valid_from"
                        type="date"
                        value={formData.valid_from}
                        onChange={(e) => setFormData(prev => ({ ...prev, valid_from: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valid_until">Valid Until</Label>
                      <Input
                        id="valid_until"
                        type="date"
                        value={formData.valid_until}
                        onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                        required
                      />
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

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingCoupon ? 'Update' : 'Create'} Coupon
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Coupons</CardTitle>
              <CardDescription>Manage your discount coupons</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-2 py-1 rounded text-sm">{coupon.code}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyCouponCode(coupon.code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{coupon.name}</TableCell>
                      <TableCell>
                        {coupon.discount_type === 'percentage' 
                          ? `${coupon.discount_value}%` 
                          : `₹${coupon.discount_value}`}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {coupon.applicable_to}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {coupon.used_count}
                        {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                      </TableCell>
                      <TableCell>
                        {format(new Date(coupon.valid_until), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={coupon.active}
                            onCheckedChange={(checked) => toggleCouponStatus(coupon.id, checked)}
                          />
                          {new Date(coupon.valid_until) < new Date() && (
                            <Badge variant="destructive">Expired</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(coupon)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(coupon.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'usage' && (
        <Card>
          <CardHeader>
            <CardTitle>Coupon Usage Analytics</CardTitle>
            <CardDescription>Track how coupons are being used</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Coupon Code</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Order Type</TableHead>
                  <TableHead>Original Amount</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Final Amount</TableHead>
                  <TableHead>Used At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {couponUsage.map((usage) => (
                  <TableRow key={usage.id}>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm">{usage.coupon_code}</code>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{usage.user_name}</div>
                        <div className="text-sm text-muted-foreground">{usage.user_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{usage.order_type}</Badge>
                    </TableCell>
                    <TableCell>₹{usage.original_amount}</TableCell>
                    <TableCell className="text-green-600">-₹{usage.discount_amount}</TableCell>
                    <TableCell className="font-medium">₹{usage.final_amount}</TableCell>
                    <TableCell>
                      {format(new Date(usage.used_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CouponManagement;