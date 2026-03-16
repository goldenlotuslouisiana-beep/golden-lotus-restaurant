import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, MapPin } from 'lucide-react';
import type { Location } from '@/types';

const authHeaders = () => {
  const token = localStorage.getItem('admin_jwt');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

export default function AdminLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState<Partial<Location>>({
    name: '',
    address: '',
    city: '',
    state: 'FL',
    zip: '',
    phone: '',
    email: '',
    googleMapsUrl: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch('/api/menu?action=locations');
      if (res.ok) setLocations(await res.json());
    } catch (err) { console.error('Error loading locations:', err); }
  };

  const saveLocations = async (data: Location[]) => {
    try {
      const res = await fetch('/api/admin?action=save-locations', {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
      });
      if (res.ok) setLocations(await res.json());
    } catch (err) { console.error('Error saving locations:', err); }
  };

  const handleAdd = () => {
    setEditingLocation(null);
    setFormData({
      name: 'Golden Lotus Indian Restaurant',
      address: '',
      city: '',
      state: 'FL',
      zip: '',
      phone: '',
      email: 'golden_lotusmiami@gmail.com',
      googleMapsUrl: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({ ...location });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this location?')) {
      const updated = locations.filter((loc) => loc.id !== id);
      saveLocations(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingLocation) {
      const updated = locations.map((loc) =>
        loc.id === editingLocation.id ? { ...loc, ...formData } as Location : loc
      );
      saveLocations(updated);
    } else {
      const newLocation: Location = {
        ...formData as Location,
        id: Date.now().toString(),
        hours: [
          { day: 'Monday', open: '11:30 AM', close: '10:00 PM' },
          { day: 'Tuesday', open: '11:30 AM', close: '10:00 PM' },
          { day: 'Wednesday', open: '11:30 AM', close: '10:00 PM' },
          { day: 'Thursday', open: '11:30 AM', close: '10:00 PM' },
          { day: 'Friday', open: '11:30 AM', close: '11:00 PM' },
          { day: 'Saturday', open: '11:30 AM', close: '11:00 PM' },
          { day: 'Sunday', open: '11:30 AM', close: '10:00 PM' },
        ],
      };
      saveLocations([...locations, newLocation]);
    }
    
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-lotus-dark">Locations</h1>
          <p className="text-gray-600">Manage restaurant locations</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Location
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {locations.map((location) => (
          <div key={location.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-lotus-gold/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-lotus-gold" />
                </div>
                <div>
                  <h3 className="font-bold text-lotus-dark">{location.name}</h3>
                  <p className="text-lotus-gold">{location.city}, {location.state}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(location)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(location.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="mt-4 space-y-2 text-sm">
              <p className="text-gray-600">{location.address}</p>
              <p className="text-gray-600">{location.city}, {location.state} {location.zip}</p>
              <p className="text-gray-600">{location.phone}</p>
              <p className="text-gray-600">{location.email}</p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-lotus-dark">
                {editingLocation ? 'Edit Location' : 'Add Location'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                  <input
                    type="text"
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps URL</label>
                <input
                  type="url"
                  value={formData.googleMapsUrl}
                  onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {editingLocation ? 'Save' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
