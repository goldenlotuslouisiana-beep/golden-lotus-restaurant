import { useState, useEffect } from 'react';
import { Save, Lock, User, Facebook, Instagram, Twitter, Youtube, Globe, Link2, MapPin, Phone, Mail } from 'lucide-react';
import { DataStore } from '@/data/store';
import type { AdminUser, SiteContent } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettings() {
  const { toast } = useToast();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [siteContent, setSiteContent] = useState<SiteContent>(DataStore.getSiteContent());
  const [activeTab, setActiveTab] = useState<'profile' | 'social' | 'contact' | 'data'>('profile');
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
  });

  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  useEffect(() => {
    const adminData = DataStore.getAdmin();
    const content = DataStore.getSiteContent();
    if (adminData) {
      setAdmin(adminData);
      setFormData((prev) => ({
        ...prev,
        username: adminData.username,
        email: adminData.email,
      }));
    }
    setSiteContent(content);
    setSocialLinks({
      facebook: content.socialLinks?.facebook || '',
      instagram: content.socialLinks?.instagram || '',
      twitter: content.socialLinks?.twitter || '',
      youtube: content.socialLinks?.youtube || '',
    });
    setContactInfo({
      email: content.contactInfo?.email || '',
      phone: content.contactInfo?.phone || '',
      address: content.contactInfo?.address || '',
      city: content.contactInfo?.city || '',
      state: content.contactInfo?.state || '',
      zip: content.contactInfo?.zip || '',
    });
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (admin) {
      const updated: AdminUser = {
        ...admin,
        username: formData.username,
        email: formData.email,
      };
      DataStore.setAdmin(updated);
      toast({
        title: "Profile Updated",
        description: "Your admin profile has been saved successfully.",
      });
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (admin && formData.newPassword === formData.confirmPassword) {
      if (formData.currentPassword === admin.password) {
        const updated: AdminUser = {
          ...admin,
          password: formData.newPassword,
        };
        DataStore.setAdmin(updated);
        setFormData((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
        toast({
          title: "Password Changed",
          description: "Your password has been updated successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: "Current password is incorrect",
          variant: "destructive",
        });
      }
    } else if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
    }
  };

  const handleSaveSocialLinks = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SiteContent = {
      ...siteContent,
      socialLinks: {
        facebook: socialLinks.facebook,
        instagram: socialLinks.instagram,
        twitter: socialLinks.twitter || '',
        youtube: socialLinks.youtube || '',
      },
    };
    DataStore.setSiteContent(updated);
    setSiteContent(updated);
    toast({
      title: "Social Links Updated",
      description: "Your social media links have been saved successfully.",
    });
  };

  const handleSaveContactInfo = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SiteContent = {
      ...siteContent,
      contactInfo: {
        email: contactInfo.email,
        phone: contactInfo.phone,
        address: contactInfo.address,
        city: contactInfo.city,
        state: contactInfo.state,
        zip: contactInfo.zip,
      },
    };
    DataStore.setSiteContent(updated);
    setSiteContent(updated);
    toast({
      title: "Contact Info Updated",
      description: "Your contact details have been saved successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-lotus-dark">Settings</h1>
        <p className="text-gray-600">Manage your admin account and website settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-lotus-gold text-lotus-gold'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <User className="w-4 h-4 inline mr-2" />
          Profile & Password
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'social'
              ? 'border-lotus-gold text-lotus-gold'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Globe className="w-4 h-4 inline mr-2" />
          Social Links
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'contact'
              ? 'border-lotus-gold text-lotus-gold'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <MapPin className="w-4 h-4 inline mr-2" />
          Contact Info
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'data'
              ? 'border-lotus-gold text-lotus-gold'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Link2 className="w-4 h-4 inline mr-2" />
          Data Management
        </button>
      </div>

      {/* Profile & Password Tab */}
      {activeTab === 'profile' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-lotus-gold" />
                Profile Settings
              </CardTitle>
              <CardDescription>Update your admin account details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-lotus-gold" />
                Change Password
              </CardTitle>
              <CardDescription>Update your admin password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Social Links Tab */}
      {activeTab === 'social' && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-lotus-gold" />
              Social Media Links
            </CardTitle>
            <CardDescription>Manage your social media links that appear in the footer</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSocialLinks} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook" className="flex items-center gap-2">
                    <Facebook className="w-4 h-4 text-blue-600" />
                    Facebook URL
                  </Label>
                  <Input
                    id="facebook"
                    type="url"
                    placeholder="https://facebook.com/yourpage"
                    value={socialLinks.facebook}
                    onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram" className="flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-600" />
                    Instagram URL
                  </Label>
                  <Input
                    id="instagram"
                    type="url"
                    placeholder="https://instagram.com/yourhandle"
                    value={socialLinks.instagram}
                    onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter" className="flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-blue-400" />
                    Twitter URL (Optional)
                  </Label>
                  <Input
                    id="twitter"
                    type="url"
                    placeholder="https://twitter.com/yourhandle"
                    value={socialLinks.twitter}
                    onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube" className="flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-red-600" />
                    YouTube URL (Optional)
                  </Label>
                  <Input
                    id="youtube"
                    type="url"
                    placeholder="https://youtube.com/yourchannel"
                    value={socialLinks.youtube}
                    onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  These links will be displayed in the website footer.
                </p>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  Save Social Links
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Contact Info Tab */}
      {activeTab === 'contact' && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-lotus-gold" />
              Contact Information
            </CardTitle>
            <CardDescription>Manage your contact details that appear in the footer</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveContactInfo} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    Email Address
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="contact@example.com"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    Phone Number
                  </Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    placeholder="(318) 555-0123"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactAddress" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    Street Address
                  </Label>
                  <Input
                    id="contactAddress"
                    placeholder="1473 Dorchester Dr"
                    value={contactInfo.address}
                    onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactCity">City</Label>
                    <Input
                      id="contactCity"
                      placeholder="Alexandria"
                      value={contactInfo.city}
                      onChange={(e) => setContactInfo({ ...contactInfo, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactState">State</Label>
                    <Input
                      id="contactState"
                      placeholder="LA"
                      value={contactInfo.state}
                      onChange={(e) => setContactInfo({ ...contactInfo, state: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactZip">ZIP Code</Label>
                    <Input
                      id="contactZip"
                      placeholder="71301"
                      value={contactInfo.zip}
                      onChange={(e) => setContactInfo({ ...contactInfo, zip: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  These details will be displayed in the website footer Contact Us section.
                </p>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  Save Contact Info
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Data Management Tab */}
      {activeTab === 'data' && (
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Manage your website data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-lotus-dark">Reset to Default Data</p>
                <p className="text-sm text-gray-500">This will reset all content to the original default values</p>
              </div>
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm('Are you sure? This will reset ALL data to defaults.')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
              >
                Reset All
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-lotus-dark">Export Data</p>
                <p className="text-sm text-gray-500">Download all your data as JSON</p>
              </div>
              <Button
                onClick={async () => {
                  let liveMenuItems = [];
                  try {
                    const res = await fetch('/api/menu');
                    if (res.ok) {
                      liveMenuItems = await res.json();
                    } else {
                      liveMenuItems = DataStore.getMenuItems();
                    }
                  } catch (e) {
                    liveMenuItems = DataStore.getMenuItems();
                  }

                  const data = {
                    menuItems: liveMenuItems,
                    categories: DataStore.getMenuCategories(),
                    locations: DataStore.getLocations(),
                    testimonials: DataStore.getTestimonials(),
                    gallery: DataStore.getGalleryImages(),
                    content: DataStore.getSiteContent(),
                  };
                  const JSONString = JSON.stringify(data, null, 2);
                  const blob = new Blob([JSONString], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'golden_lotus-data.json';
                  a.click();
                }}
              >
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
