import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, MapPin, ShoppingBag, Star, Loader2, Plus, Trash2, Edit2, Check, Package, 
  ChevronDown, ChevronUp, LogOut, Phone, Mail, Calendar, Home, 
  Briefcase, MapPinned, X, AlertCircle, CheckCircle2, Upload
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

type Tab = 'personal' | 'addresses' | 'orders' | 'loyalty';

interface Address { 
  _id: string; 
  id?: string;
  label: string; 
  fullName?: string;
  phone?: string;
  street: string; 
  apt?: string; 
  city: string; 
  state: string; 
  zip: string;
  landmark?: string;
  isDefault: boolean 
}

interface OrderItem { name: string; price: number; quantity: number }
interface Order { 
  id: string; 
  orderNumber: string; 
  createdAt: string; 
  items: OrderItem[]; 
  total: number; 
  status: string; 
  paymentMethod: string; 
  orderType: string 
}

interface LoyaltyEntry { date: string; orderId: string; action: string; points: number }

const TABS: { key: Tab; label: string; icon: React.ElementType; description: string }[] = [
  { key: 'personal', label: 'Personal Info', icon: User, description: 'Manage your profile details' },
  { key: 'addresses', label: 'Addresses', icon: MapPin, description: 'Manage delivery addresses' },
  { key: 'orders', label: 'Orders', icon: ShoppingBag, description: 'View your order history' },
  { key: 'loyalty', label: 'Loyalty', icon: Star, description: 'Check your reward points' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  preparing: 'bg-purple-100 text-purple-800 border-purple-200',
  ready: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  out_for_delivery: 'bg-orange-100 text-orange-800 border-orange-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PROFILE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function Profile() {
  const { user: authUser, token, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('personal');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login?redirect=/profile');
    } else {
      const timer = setTimeout(() => setLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn || !authUser) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-white pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid lg:grid-cols-4 gap-6">
            <Skeleton className="lg:col-span-1 h-80 rounded-2xl" />
            <Skeleton className="lg:col-span-3 h-96 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="My Profile | Golden Lotus Rewards"
        description="Manage your Golden Lotus account. View order history, update personal information, track loyalty points, and manage saved addresses."
        url="https://www.goldenlotusgrill.com/profile"
        noIndex={true}
      />
      <Toaster />
      <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-white pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-6 overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-r from-[#F97316] via-[#ea6c10] to-[#F97316] p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <Avatar className="w-24 h-24 border-4 border-white/30 shadow-xl">
                  <AvatarImage src={authUser?.avatar || ''} />
                  <AvatarFallback className="bg-white/20 text-white text-3xl font-bold">
                    {(authUser?.name?.charAt(0) || authUser?.email?.charAt(0) || 'U').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    {authUser?.name || 'Welcome!'}
                  </h1>
                  <p className="text-white/80 flex items-center justify-center sm:justify-start gap-2 mb-3">
                    <Mail className="w-4 h-4" />
                    {authUser?.email}
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      {authUser?.loyaltyPoints || 0} Points
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      Member
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { logout(); navigate('/'); }}
                  className="bg-white/20 text-white border-0 hover:bg-white/30 backdrop-blur-sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="border border-gray-200 shadow-sm lg:sticky lg:top-24">
                <CardContent className="p-2">
                  <nav className="space-y-1">
                    {TABS.map((t) => {
                      const Icon = t.icon;
                      const isActive = tab === t.key;
                      return (
                        <button
                          key={t.key}
                          onClick={() => setTab(t.key)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-left text-sm transition-all duration-200 border-l-4 ${
                            isActive
                              ? 'bg-[#FFF7ED] text-[#F97316] border-[#F97316] shadow-sm'
                              : 'bg-white text-gray-700 border-transparent hover:bg-gray-50 hover:text-[#F97316]'
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 flex-shrink-0 ${
                              isActive ? 'text-[#F97316]' : 'text-gray-400'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{t.label}</p>
                            <p
                              className={`text-xs ${
                                isActive ? 'text-[#F97316]' : 'text-gray-400'
                              }`}
                            >
                              {t.description}
                            </p>
                          </div>
                          {isActive && (
                            <ChevronDown className="w-4 h-4 text-[#F97316] rotate-[-90deg]" />
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {tab === 'personal' && <PersonalInfoTab token={token} />}
              {tab === 'addresses' && <AddressesTab token={token} />}
              {tab === 'orders' && <OrderHistoryTab token={token} />}
              {tab === 'loyalty' && <LoyaltyTab token={token} userPoints={authUser.loyaltyPoints || 0} />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERSONAL INFO TAB
// ═══════════════════════════════════════════════════════════════════════════════

function PersonalInfoTab({ token }: { token: string | null }) {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/users?action=profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        const userData = data.user || data;
        setFormData({
          fullName: userData.fullName || userData.name || '',
          email: userData.email || '',
          phone: userData.phone || userData.phoneNumber || '',
          dateOfBirth: userData.dateOfBirth || userData.dob || '',
        });
      } else {
        const saved = localStorage.getItem('user_data');
        if (saved) {
          const userData = JSON.parse(saved);
          setFormData({
            fullName: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            dateOfBirth: userData.dateOfBirth || '',
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({ title: "Invalid file", description: "Please select an image file", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum size is 2MB", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });

      // Upload to server
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ file: base64, type: 'avatar' }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update user avatar in profile
        await fetch('/api/users?action=update-profile', {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ avatar: data.url })
        });
        
        updateUser({ avatar: data.url });
        toast({ title: "Photo Updated", description: "Your profile picture has been updated." });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({ title: "Upload Failed", description: "Could not upload photo. Please try again.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }
    
    if (formData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/users?action=update-profile', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth
        })
      });
      
      if (res.ok) {
        updateUser({ 
          name: formData.fullName, 
          fullName: formData.fullName, 
          phone: formData.phone 
        });
        toast({
          title: "Profile Updated",
          description: "Your personal information has been saved successfully.",
          variant: "default",
        });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <User className="w-5 h-5 text-[#F97316]" />
          Personal Information
        </CardTitle>
        <CardDescription>
          Update your personal details and contact information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={user?.avatar || ''} />
            <AvatarFallback className="bg-gradient-to-br from-[#F97316] to-[#ea6c10] text-white text-2xl font-bold">
              {(formData.fullName?.charAt(0) || formData.email?.charAt(0) || 'U').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={isUploading}
              />
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <span>
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {isUploading ? 'Uploading...' : 'Change Photo'}
                </span>
              </Button>
            </label>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max 2MB.</p>
          </div>
        </div>

        <Separator />

        {/* Form Fields */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              Full Name
            </Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, fullName: e.target.value }));
                if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
              }}
              placeholder="Enter your full name"
              className={errors.fullName ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.fullName && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.fullName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
              className="bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, phone: e.target.value }));
                if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
              }}
              placeholder="(555) 123-4567"
              className={errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.phone}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob" className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              Date of Birth
            </Label>
            <Input
              id="dob"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-gradient-to-r from-[#F97316] to-[#ea6c10] hover:shadow-lg hover:shadow-orange-200 transition-all"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADDRESSES TAB
// ═══════════════════════════════════════════════════════════════════════════════

// Address Form Component - DEFINED OUTSIDE to prevent re-renders causing focus loss
interface AddressFormProps {
  form: {
    label: string;
    fullName: string;
    phone: string;
    street: string;
    apt: string;
    city: string;
    state: string;
    zip: string;
    landmark: string;
  };
  setForm: React.Dispatch<React.SetStateAction<AddressFormProps['form']>>;
  onSubmit: () => void;
  onCancel: () => void;
  title: string;
  isSubmitting: boolean;
}

function AddressForm({ form, setForm, onSubmit, onCancel, title, isSubmitting }: AddressFormProps) {
  return (
    <Card className="border-orange-200 bg-orange-50/30">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center justify-between">
          {title}
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Label Selection */}
        <div className="flex gap-2">
          {['Home', 'Office', 'Other'].map(l => (
            <button
              key={l}
              type="button"
              onClick={() => setForm(p => ({ ...p, label: l }))}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                form.label === l 
                  ? 'bg-[#F97316] text-white shadow-sm' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Input 
            placeholder="Full Name" 
            value={form.fullName}
            onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
          />
          <Input 
            placeholder="Phone Number" 
            value={form.phone}
            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
          />
        </div>

        <Input 
          placeholder="Street Address *" 
          value={form.street}
          onChange={e => setForm(p => ({ ...p, street: e.target.value }))}
        />
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Input 
            placeholder="Apt/Suite" 
            value={form.apt}
            onChange={e => setForm(p => ({ ...p, apt: e.target.value }))}
          />
          <Input 
            placeholder="City *" 
            value={form.city}
            onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
          />
          <Input 
            placeholder="State *" 
            value={form.state}
            onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
          />
          <Input 
            placeholder="ZIP *" 
            value={form.zip}
            onChange={e => setForm(p => ({ ...p, zip: e.target.value }))}
          />
        </div>

        <Input 
          placeholder="Landmark (optional)" 
          value={form.landmark}
          onChange={e => setForm(p => ({ ...p, landmark: e.target.value }))}
        />

        <div className="flex gap-2 pt-2">
          <Button 
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-[#F97316] hover:bg-[#ea6c10]"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Address'}
          </Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AddressesTab({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState({ 
    label: 'Home', 
    fullName: '',
    phone: '',
    street: '', 
    apt: '', 
    city: '', 
    state: '', 
    zip: '',
    landmark: ''
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/users?action=addresses', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    setForm({ 
      label: 'Home', 
      fullName: '',
      phone: '',
      street: '', 
      apt: '', 
      city: '', 
      state: '', 
      zip: '',
      landmark: ''
    });
  }, []);

  const handleAdd = async () => {
    if (!form.street || !form.city || !form.state || !form.zip) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/users?action=add-address', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(form)
      });
      
      if (res.ok) {
        const data = await res.json();
        setAddresses(prev => [...prev, data.address]);
        setShowAddForm(false);
        resetForm();
        toast({
          title: "Address Added",
          description: "Your new address has been saved successfully.",
        });
      } else {
        throw new Error('Failed to add address');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add address. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingAddress || !form.street || !form.city || !form.state || !form.zip) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const addressId = editingAddress._id || editingAddress.id;
      const res = await fetch(`/api/users?action=edit-address&id=${addressId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(form)
      });
      
      if (res.ok) {
        setAddresses(prev => prev.map(addr => {
          const addrId = addr._id || addr.id;
          if (addrId === addressId) {
            return { ...addr, ...form };
          }
          return addr;
        }));
        setEditingAddress(null);
        resetForm();
        toast({
          title: "Address Updated",
          description: "Your address has been updated successfully.",
        });
      } else {
        throw new Error('Failed to update address');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update address. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    try {
      const res = await fetch(`/api/users?action=delete-address&id=${addressId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setAddresses(prev => prev.filter(addr => (addr._id || addr.id) !== addressId));
        toast({
          title: "Address Deleted",
          description: "The address has been removed from your account.",
        });
      } else {
        throw new Error('Failed to delete address');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete address. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const res = await fetch(`/api/users?action=set-default-address&id=${addressId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setAddresses(prev => prev.map(addr => ({
          ...addr,
          isDefault: (addr._id || addr.id) === addressId
        })));
        toast({
          title: "Default Updated",
          description: "Your default address has been updated.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update default address.",
        variant: "destructive",
      });
    }
  };

  const startEdit = useCallback((addr: Address) => {
    setEditingAddress(addr);
    setForm({
      label: addr.label || 'Home',
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      street: addr.street || '',
      apt: addr.apt || '',
      city: addr.city || '',
      state: addr.state || '',
      zip: addr.zip || '',
      landmark: addr.landmark || ''
    });
  }, []);

  const getLabelIcon = (label: string) => {
    switch (label?.toLowerCase()) {
      case 'home': return Home;
      case 'office': return Briefcase;
      default: return MapPinned;
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#F97316] mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#F97316]" />
              Saved Addresses
            </CardTitle>
            <CardDescription>Manage your delivery addresses</CardDescription>
          </div>
          {!showAddForm && !editingAddress && (
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-[#F97316] hover:bg-[#ea6c10]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {showAddForm && (
            <AddressForm 
              form={form}
              setForm={setForm}
              onSubmit={handleAdd}
              onCancel={() => { setShowAddForm(false); resetForm(); }}
              title="Add New Address"
              isSubmitting={isSubmitting}
            />
          )}

          {editingAddress && (
            <AddressForm 
              form={form}
              setForm={setForm}
              onSubmit={handleEdit}
              onCancel={() => { setEditingAddress(null); resetForm(); }}
              title="Edit Address"
              isSubmitting={isSubmitting}
            />
          )}

          {addresses.length === 0 && !showAddForm ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-[#F97316]" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No saved addresses</h3>
              <p className="text-gray-500 mb-4">Add an address to make checkout faster</p>
              <Button 
                onClick={() => setShowAddForm(true)}
                variant="outline"
                className="border-[#F97316] text-[#F97316] hover:bg-orange-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Address
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => {
                const addrId = addr._id || addr.id;
                const LabelIcon = getLabelIcon(addr.label);
                return (
                  <Card key={addrId} className={`border ${addr.isDefault ? 'border-[#F97316] bg-orange-50/20' : 'border-gray-200'} hover:shadow-md transition-shadow`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${addr.isDefault ? 'bg-[#F97316] text-white' : 'bg-orange-100 text-[#F97316]'}`}>
                          <LabelIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900">{addr.label || 'Address'}</span>
                            {addr.isDefault && (
                              <Badge className="bg-[#F97316] text-white hover:bg-[#ea6c10]">
                                Default
                              </Badge>
                            )}
                          </div>
                          {addr.fullName && (
                            <p className="text-sm text-gray-600 font-medium">{addr.fullName}</p>
                          )}
                          <p className="text-sm text-gray-600 mt-0.5">
                            {addr.street}{addr.apt ? `, ${addr.apt}` : ''}
                          </p>
                          <p className="text-sm text-gray-600">
                            {addr.city}, {addr.state} {addr.zip}
                          </p>
                          {addr.landmark && (
                            <p className="text-xs text-gray-500 mt-1">Near: {addr.landmark}</p>
                          )}
                          {addr.phone && (
                            <p className="text-sm text-gray-500 mt-1">{addr.phone}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-gray-400 hover:text-blue-600"
                            onClick={() => startEdit(addr)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-gray-400 hover:text-red-600"
                            onClick={() => handleDelete(addrId || '')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {!addr.isDefault && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-[#F97316] hover:text-[#ea6c10] hover:bg-orange-50"
                            onClick={() => handleSetDefault(addrId || '')}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Set as Default
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ORDER HISTORY TAB
// ═══════════════════════════════════════════════════════════════════════════════

function OrderHistoryTab({ token }: { token: string | null }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      const res = await fetch('/api/orders?action=history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = (_order: Order) => {
    toast({
      title: "Reorder Feature",
      description: "This feature will be available soon!",
    });
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#F97316] mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-[#F97316]" />
          Order History
        </CardTitle>
        <CardDescription>View and track your past orders</CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-[#F97316]" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No orders yet</h3>
            <p className="text-gray-500 mb-4">Start ordering to see your history here</p>
            <Button 
              onClick={() => window.location.href = '/menu'}
              className="bg-[#F97316] hover:bg-[#ea6c10]"
            >
              Browse Menu
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <button 
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  className="w-full p-4 flex items-center gap-4 text-left"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-[#F97316]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{order.orderNumber}</span>
                      <Badge className={STATUS_COLORS[order.status] || 'bg-gray-100'}>
                        {STATUS_LABELS[order.status] || order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })} · {order.items?.length || 0} items · ${order.total?.toFixed(2)}
                    </p>
                  </div>
                  {expanded === order.id ? 
                    <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  }
                </button>
                
                {expanded === order.id && (
                  <div className="px-4 pb-4 border-t bg-gray-50/50">
                    <div className="pt-4 space-y-3">
                      <h4 className="font-medium text-sm text-gray-700">Order Items</h4>
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            {item.name} <span className="text-gray-400">×{item.quantity}</span>
                          </span>
                          <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center font-bold">
                        <span>Total</span>
                        <span className="text-[#F97316]">${order.total?.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          className="bg-[#F97316] hover:bg-[#ea6c10]"
                          onClick={() => handleReorder(order)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Reorder
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.location.href = `/order-tracking?id=${order.id}`}
                        >
                          Track Order
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOYALTY TAB
// ═══════════════════════════════════════════════════════════════════════════════

function LoyaltyTab({ token, userPoints }: { token: string | null; userPoints: number }) {
  const [points, setPoints] = useState(userPoints);
  const [history, setHistory] = useState<LoyaltyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    try {
      const res = await fetch('/api/users?action=loyalty', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (res.ok) {
        const data = await res.json();
        setPoints(data.points || 0);
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to fetch loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    const redeemAmount = Math.floor(points / 100) * 100;
    if (redeemAmount < 100) return;

    try {
      const res = await fetch('/api/users?action=redeem-points', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ pointsToRedeem: redeemAmount })
      });
      
      if (res.ok) {
        setPoints(prev => prev - redeemAmount);
        toast({
          title: "Points Redeemed!",
          description: `${redeemAmount} points have been redeemed for $${(redeemAmount / 100).toFixed(2)} off your next order.`,
        });
        fetchLoyaltyData();
      } else {
        throw new Error('Failed to redeem points');
      }
    } catch (error) {
      toast({
        title: "Redemption Failed",
        description: "Could not redeem points. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#F97316] mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Points Card */}
      <div className="bg-gradient-to-r from-[#F97316] to-[#ea6c10] rounded-2xl p-8 text-white shadow-xl shadow-orange-500/20">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
            <Star className="w-10 h-10 fill-current" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-white/80 text-sm font-medium mb-1">Your Loyalty Points</p>
            <p className="text-5xl font-bold">{points}</p>
            <p className="text-white/80 mt-1">= ${(points / 100).toFixed(2)} value</p>
          </div>
          {points >= 100 && (
            <Button 
              onClick={handleRedeem}
              className="bg-white text-[#F97316] hover:bg-white/90 font-semibold"
            >
              Redeem {Math.floor(points / 100) * 100} Points
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
            <p className="text-xs text-white/70 mb-1">Earn Rate</p>
            <p className="text-xl font-bold">1 pt / $1</p>
            <p className="text-xs text-white/70">On every order</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
            <p className="text-xs text-white/70 mb-1">Redeem Rate</p>
            <p className="text-xl font-bold">100 pts = $1</p>
            <p className="text-xs text-white/70">Min. 100 points</p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-[#F97316]" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400">Start ordering to earn points!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      entry.points > 0 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-[#F97316]'
                    }`}>
                      {entry.points > 0 ? <Plus className="w-5 h-5" /> : <Star className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {entry.action === 'earned' ? 'Points Earned' : 'Points Redeemed'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(entry.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold text-lg ${entry.points > 0 ? 'text-green-600' : 'text-[#F97316]'}`}>
                    {entry.points > 0 ? '+' : ''}{entry.points}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
