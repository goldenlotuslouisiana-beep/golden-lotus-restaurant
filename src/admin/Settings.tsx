import { useState, useEffect } from 'react';
import { Save, Check, Lock, User, Mail } from 'lucide-react';
import { DataStore } from '@/data/store';
import type { AdminUser } from '@/types';

export default function AdminSettings() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const adminData = DataStore.getAdmin();
    if (adminData) {
      setAdmin(adminData);
      setFormData((prev) => ({
        ...prev,
        username: adminData.username,
        email: adminData.email,
      }));
    }
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
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
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
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert('Current password is incorrect');
      }
    } else if (formData.newPassword !== formData.confirmPassword) {
      alert('New passwords do not match');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-lotus-dark">Settings</h1>
        <p className="text-gray-600">Manage your admin account settings</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-lotus-gold/10 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-lotus-gold" />
            </div>
            <h2 className="text-lg font-bold text-lotus-dark">Profile Settings</h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full btn-primary flex items-center justify-center gap-2 ${saved ? 'bg-green-600' : ''}`}
            >
              {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
              {saved ? 'Saved!' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-lotus-gold/10 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-lotus-gold" />
            </div>
            <h2 className="text-lg font-bold text-lotus-dark">Change Password</h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
              />
            </div>

            <button type="submit" className="w-full btn-primary flex items-center justify-center gap-2">
              <Lock className="w-5 h-5" />
              Change Password
            </button>
          </form>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-lotus-dark mb-4">Data Management</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-lotus-dark">Reset to Default Data</p>
              <p className="text-sm text-gray-500">This will reset all content to the original default values</p>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure? This will reset ALL data to defaults.')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Reset All
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-lotus-dark">Export Data</p>
              <p className="text-sm text-gray-500">Download all your data as JSON</p>
            </div>
            <button
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
              className="px-4 py-2 bg-lotus-gold text-white rounded-lg hover:bg-lotus-gold-dark transition-colors"
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
