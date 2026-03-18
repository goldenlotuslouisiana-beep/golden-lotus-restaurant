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
      <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: '#F9F4EC' }}>
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
      <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: '#F9F4EC' }}>
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-6 overflow-hidden border-0 shadow-lg">
            <div className="p-6 sm:p-8" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(184,133,58,0.2), transparent 60%), #1E1810' }}>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <Avatar className="w-24 h-24 shadow-xl" style={{ border: '3px solid rgba(184,133,58,0.4)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
                  <AvatarImage src={authUser?.avatar || ''} />
                  <AvatarFallback className="text-white text-3xl font-bold" style={{ background: 'rgba(184,133,58,0.3)' }}>
                    {(authUser?.name?.charAt(0) || authUser?.email?.charAt(0) || 'U').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}>
                    {authUser?.name || 'Welcome!'}
                  </h1>
                  <p className="flex items-center justify-center sm:justify-start gap-2 mb-3" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
                    <Mail className="w-4 h-4" />
                    {authUser?.email}
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(184,133,58,0.2)', border: '1px solid rgba(184,133,58,0.3)', color: '#C9963F' }}>
                      <Star className="w-3 h-3" style={{ fill: '#B8853A', color: '#B8853A' }} />
                      {authUser?.loyaltyPoints || 0} Points
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
                      Member
                    </span>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { logout(); navigate('/'); }}
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}
                  className="hover:bg-white/20 backdrop-blur-sm"
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
              <Card className="shadow-sm lg:sticky lg:top-24" style={{ border: '1px solid #EDE3D2', borderRadius: 16 }}>
                <CardContent className="p-2">
                  <nav className="space-y-1">
                    {TABS.map((t) => {
                      const Icon = t.icon;
                      const isActive = tab === t.key;
                      return (
                        <button
                          key={t.key}
                          onClick={() => setTab(t.key)}
                          className="w-full flex items-center gap-3 text-left transition-all duration-200"
                          style={{
                            padding: '14px 16px',
                            borderRadius: 12,
                            background: isActive ? '#F2E4C8' : 'transparent',
                            border: isActive ? '1px solid #DDD0BB' : '1px solid transparent',
                          }}
                          onMouseOver={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#F9F4EC'; }}
                          onMouseOut={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                        >
                          <Icon
                            className="w-5 h-5 flex-shrink-0"
                            style={{ color: isActive ? '#B8853A' : '#9E8870' }}
                          />
                          <div className="flex-1 min-w-0">
                            <p style={{ fontSize: 14, fontWeight: isActive ? 600 : 500, color: isActive ? '#0F0C08' : '#6B5540', margin: 0 }} className="truncate">{t.label}</p>
                            <p style={{ fontSize: 11.5, color: '#9E8870', margin: 0 }}>{t.description}</p>
                          </div>
                          {isActive && (
                            <ChevronDown className="w-4 h-4 rotate-[-90deg]" style={{ color: '#B8853A' }} />
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
          <User className="w-5 h-5" style={{ color: '#B8853A' }} />
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
            <AvatarFallback className="text-white text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #B8853A, #C9963F)' }}>
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
            className="transition-all"
            style={{ background: '#1E1810', color: 'white', borderRadius: 10 }}
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#B8853A'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(184,133,58,0.35)'; }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = '#1E1810'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
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
    <Card style={{ borderColor: '#EDE3D2', background: 'rgba(249,244,236,0.5)' }}>
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
              style={{
                padding: '7px 16px', borderRadius: 8, fontSize: 13.5, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                background: form.label === l ? '#1E1810' : 'white',
                color: form.label === l ? 'white' : '#6B5540',
                border: form.label === l ? '1.5px solid #1E1810' : '1.5px solid #EDE3D2',
              }}
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
            style={{ background: '#1E1810', color: 'white' }}
            className="hover:opacity-90 transition-opacity"
            onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#B8853A'; }}
            onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = '#1E1810'; }}
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
          <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: '#B8853A' }} />
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
              <MapPin className="w-5 h-5" style={{ color: '#B8853A' }} />
              Saved Addresses
            </CardTitle>
            <CardDescription>Manage your delivery addresses</CardDescription>
          </div>
          {!showAddForm && !editingAddress && (
            <Button 
              onClick={() => setShowAddForm(true)}
              style={{ background: '#1E1810', color: 'white' }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#B8853A'; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = '#1E1810'; }}
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
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#F2E4C8' }}>
                <MapPin className="w-8 h-8" style={{ color: '#B8853A' }} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No saved addresses</h3>
              <p className="text-gray-500 mb-4">Add an address to make checkout faster</p>
              <Button 
                onClick={() => setShowAddForm(true)}
                variant="outline"
                style={{ borderColor: '#B8853A', color: '#B8853A' }}
                className="hover:bg-[#F2E4C8]"
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
                  <Card key={addrId} className="hover:shadow-md transition-shadow" style={{ border: addr.isDefault ? '1px solid #B8853A' : '1px solid #EDE3D2', borderRadius: 14, ...(addr.isDefault ? { borderLeft: '3px solid #B8853A' } : {}) }}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#F2E4C8', color: '#B8853A' }}>
                          <LabelIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900">{addr.label || 'Address'}</span>
                            {addr.isDefault && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(184,133,58,0.1)', color: '#B8853A', border: '1px solid rgba(184,133,58,0.2)' }}>
                                Default
                              </span>
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
                            style={{ color: '#9E8870' }}
                            className="hover:text-[#B8853A]"
                            onClick={() => startEdit(addr)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            style={{ color: '#9E8870' }}
                            className="hover:text-[#C53A3A]"
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
                            style={{ color: '#B8853A' }}
                            className="hover:bg-[#F2E4C8]"
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
          <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: '#B8853A' }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" style={{ color: '#B8853A' }} />
          Order History
        </CardTitle>
        <CardDescription>View and track your past orders</CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#F2E4C8' }}>
              <ShoppingBag className="w-8 h-8" style={{ color: '#B8853A' }} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No orders yet</h3>
            <p className="text-gray-500 mb-4">Start ordering to see your history here</p>
            <Button 
              onClick={() => window.location.href = '/menu'}
              style={{ background: '#1E1810', color: 'white' }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#B8853A'; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = '#1E1810'; }}
            >
              Browse Menu
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="hover:shadow-md transition-shadow overflow-hidden" style={{ border: '1px solid #EDE3D2', borderRadius: 14, background: 'white' }}>
                <button 
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  className="w-full p-4 flex items-center gap-4 text-left"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#F2E4C8' }}>
                    <Package className="w-6 h-6" style={{ color: '#B8853A' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold" style={{ color: '#0F0C08' }}>{order.orderNumber}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" style={
                        order.status === 'completed' || order.status === 'delivered' || order.status === 'ready'
                          ? { background: 'rgba(47,149,85,0.1)', color: '#2F9555' }
                          : order.status === 'cancelled'
                          ? { background: 'rgba(197,58,58,0.1)', color: '#C53A3A' }
                          : order.status === 'pending'
                          ? { background: 'rgba(216,155,35,0.1)', color: '#D89B23' }
                          : { background: 'rgba(30,24,16,0.08)', color: '#6B5540' }
                      }>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: '#9E8870' }}>
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
                  <div className="px-4 pb-4 border-t" style={{ background: '#F9F4EC' }}>
                    <div className="pt-4 space-y-3" style={{ background: '#F9F4EC', borderRadius: 10, padding: 14, marginTop: 4 }}>
                      <h4 className="font-medium text-sm" style={{ color: '#6B5540' }}>Order Items</h4>
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span style={{ color: '#6B5540' }}>
                            {item.name} <span style={{ color: '#9E8870' }}>×{item.quantity}</span>
                          </span>
                          <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center font-bold">
                        <span>Total</span>
                        <span style={{ color: '#B8853A', fontWeight: 700 }}>${order.total?.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          style={{ background: '#1E1810', color: 'white', borderRadius: 8 }}
                          onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = '#B8853A'; }}
                          onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = '#1E1810'; }}
                          onClick={() => handleReorder(order)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Reorder
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          style={{ borderRadius: 8, borderColor: '#EDE3D2', color: '#6B5540' }}
                          className="hover:border-[#B8853A] hover:text-[#B8853A]"
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
          <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: '#B8853A' }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Points Card */}
      <div className="rounded-2xl p-8 text-white shadow-xl" style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(184,133,58,0.2), transparent 50%), #1E1810' }}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(184,133,58,0.2)', border: '1px solid rgba(184,133,58,0.3)' }}>
            <Star className="w-10 h-10" style={{ color: '#B8853A', fill: '#B8853A' }} />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="mb-1" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Your Loyalty Points</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 56, fontWeight: 700, color: 'white', lineHeight: 1 }}>{points}</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 4, fontSize: 13 }}>= ${(points / 100).toFixed(2)} value</p>
          </div>
          {points >= 100 && (
            <Button 
              onClick={handleRedeem}
              style={{ background: '#B8853A', color: 'white', fontWeight: 600 }}
              className="hover:opacity-90"
            >
              Redeem {Math.floor(points / 100) * 100} Points
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
            <p className="mb-1" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Earn Rate</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: '#B8853A', lineHeight: 1 }}>1 pt / $1</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>On every order</p>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
            <p className="mb-1" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Redeem Rate</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: '#B8853A', lineHeight: 1 }}>100 pts = $1</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Min. 100 points</p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600 }}>
            <Package className="w-5 h-5" style={{ color: '#B8853A' }} />
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
                  className="flex items-center justify-between"
                  style={{ background: 'white', border: '1px solid #EDE3D2', borderRadius: 12, padding: '14px 18px', marginBottom: i < history.length - 1 ? 8 : 0 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={
                      entry.points > 0
                        ? { background: 'rgba(47,149,85,0.1)', color: '#2F9555' }
                        : { background: 'rgba(197,58,58,0.1)', color: '#C53A3A' }
                    }>
                      {entry.points > 0 ? <Plus className="w-5 h-5" /> : <Star className="w-5 h-5" />}
                    </div>
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 500, color: '#0F0C08', margin: 0 }}>
                        {entry.action === 'earned' ? 'Points Earned' : 'Points Redeemed'}
                      </p>
                      <p style={{ fontSize: 12, color: '#9E8870', margin: 0 }}>
                        {new Date(entry.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 16, color: entry.points > 0 ? '#2F9555' : '#C53A3A' }}>
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
