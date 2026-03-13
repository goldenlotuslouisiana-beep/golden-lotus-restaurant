import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, Star, Eye, EyeOff, Package, Image } from 'lucide-react';
import { DataStore } from '@/data/store';
import type { Event, EventPackage } from '@/types';

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [packages, setPackages] = useState<EventPackage[]>([]);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  
  // Event modal state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState<Partial<Event>>({
    title: '',
    description: '',
    image: '',
    features: [],
    gallery: [],
    ctaTitle: '',
    ctaDescription: '',
    phone: '',
    active: true,
  });

  // Package modal state
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<EventPackage | null>(null);
  const [packageForm, setPackageForm] = useState<Partial<EventPackage>>({
    name: '',
    price: '',
    per: 'per person',
    features: [],
    popular: false,
  });
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedEvents = DataStore.getEvents();
    const loadedPackages = DataStore.getEventPackages();
    setEvents(loadedEvents);
    setPackages(loadedPackages);
    if (loadedEvents.length > 0 && !activeEventId) {
      setActiveEventId(loadedEvents[0].id);
    }
  };

  const activeEvent = events.find(e => e.id === activeEventId);
  const activeEventPackages = packages.filter(p => p.eventId === activeEventId);

  // Event handlers
  const handleAddEvent = () => {
    setEditingEvent(null);
    setEventForm({
      title: '',
      description: '',
      image: '',
      features: [],
      gallery: [],
      ctaTitle: '',
      ctaDescription: '',
      phone: '',
      active: true,
    });
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEventForm({ ...event });
    setIsEventModalOpen(true);
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm('Are you sure you want to delete this event? All associated packages will also be deleted.')) {
      const updatedEvents = events.filter(e => e.id !== id);
      const updatedPackages = packages.filter(p => p.eventId !== id);
      DataStore.setEvents(updatedEvents);
      DataStore.setEventPackages(updatedPackages);
      if (activeEventId === id) {
        setActiveEventId(updatedEvents[0]?.id || null);
      }
      loadData();
    }
  };

  const handleToggleEventActive = (event: Event) => {
    const updated = events.map(e => 
      e.id === event.id ? { ...e, active: !e.active } : e
    );
    DataStore.setEvents(updated);
    loadData();
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.description) return;

    if (editingEvent) {
      const updated = events.map(ev => 
        ev.id === editingEvent.id ? { ...ev, ...eventForm } as Event : ev
      );
      DataStore.setEvents(updated);
    } else {
      const newEvent: Event = {
        ...eventForm as Event,
        id: Date.now().toString(),
        features: eventForm.features || [],
        gallery: eventForm.gallery || [],
      };
      DataStore.setEvents([...events, newEvent]);
      setActiveEventId(newEvent.id);
    }
    setIsEventModalOpen(false);
    loadData();
  };

  // Package handlers
  const handleAddPackage = () => {
    if (!activeEventId) return;
    setEditingPackage(null);
    setPackageForm({
      name: '',
      price: '',
      per: 'per person',
      features: [],
      popular: false,
    });
    setFeatureInput('');
    setIsPackageModalOpen(true);
  };

  const handleEditPackage = (pkg: EventPackage) => {
    setEditingPackage(pkg);
    setPackageForm({ ...pkg });
    setFeatureInput('');
    setIsPackageModalOpen(true);
  };

  const handleDeletePackage = (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      const updated = packages.filter(p => p.id !== id);
      DataStore.setEventPackages(updated);
      loadData();
    }
  };

  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageForm.name || !packageForm.price || !activeEventId) return;

    if (editingPackage) {
      const updated = packages.map(p => 
        p.id === editingPackage.id ? { ...p, ...packageForm } as EventPackage : p
      );
      DataStore.setEventPackages(updated);
    } else {
      const newPackage: EventPackage = {
        ...packageForm as EventPackage,
        id: Date.now().toString(),
        eventId: activeEventId,
        features: packageForm.features || [],
      };
      DataStore.setEventPackages([...packages, newPackage]);
    }
    setIsPackageModalOpen(false);
    loadData();
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setPackageForm(prev => ({
      ...prev,
      features: [...(prev.features || []), featureInput.trim()]
    }));
    setFeatureInput('');
  };

  const removeFeature = (index: number) => {
    setPackageForm(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-lotus-dark">Events Management</h1>
          <p className="text-gray-600">Manage events and packages</p>
        </div>
        <button onClick={handleAddEvent} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Event
        </button>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-lotus-dark mb-4">Events</h2>
        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No events yet. Create your first event!</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map(event => (
              <div
                key={event.id}
                onClick={() => setActiveEventId(event.id)}
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  activeEventId === event.id
                    ? 'border-lotus-gold bg-lotus-gold/5'
                    : 'border-gray-200 hover:border-lotus-gold/50'
                } ${event.active === false ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-lotus-dark line-clamp-1">{event.title}</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleEventActive(event);
                      }}
                      className={`p-1.5 rounded ${event.active !== false ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                    >
                      {event.active !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEvent(event);
                      }}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event.id);
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{event.description}</p>
                {event.active === false && (
                  <span className="absolute top-2 right-2 text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded">Hidden</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Packages Section */}
      {activeEvent && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-lotus-dark">
                <Package className="w-5 h-5 inline mr-2" />
                Packages for "{activeEvent.title}"
              </h2>
              <p className="text-sm text-gray-500">Manage pricing packages for this event</p>
            </div>
            <button onClick={handleAddPackage} className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" />
              Add Package
            </button>
          </div>

          {activeEventPackages.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No packages yet for this event.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeEventPackages.map(pkg => (
                <div
                  key={pkg.id}
                  className={`relative bg-gray-50 rounded-xl p-6 ${pkg.popular ? 'ring-2 ring-lotus-gold' : ''}`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-lotus-gold text-white text-xs font-bold rounded-full">
                      Most Popular
                    </span>
                  )}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lotus-dark">{pkg.name}</h3>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-bold text-lotus-gold">{pkg.price}</span>
                        <span className="text-sm text-gray-500">{pkg.per}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditPackage(pkg)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <Star className="w-4 h-4 text-lotus-gold flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsEventModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-lotus-dark">
                {editingEvent ? 'Edit Event' : 'Add Event'}
              </h2>
              <button onClick={() => setIsEventModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={eventForm.description}
                  onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold resize-none"
                />
              </div>

              <ImageUploadField 
                label="Hero Image"
                value={eventForm.image || ''}
                onChange={url => setEventForm({ ...eventForm, image: url })}
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CTA Title</label>
                  <input
                    type="text"
                    value={eventForm.ctaTitle}
                    onChange={e => setEventForm({ ...eventForm, ctaTitle: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={eventForm.phone}
                    onChange={e => setEventForm({ ...eventForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CTA Description</label>
                <textarea
                  value={eventForm.ctaDescription}
                  onChange={e => setEventForm({ ...eventForm, ctaDescription: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold resize-none"
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="eventActive"
                  checked={eventForm.active !== false}
                  onChange={e => setEventForm({ ...eventForm, active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-lotus-gold focus:ring-lotus-gold"
                />
                <label htmlFor="eventActive" className="text-sm font-medium text-gray-700">
                  Event is active and visible on website
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {editingEvent ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Package Modal */}
      {isPackageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsPackageModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-lotus-dark">
                {editingPackage ? 'Edit Package' : 'Add Package'}
              </h2>
              <button onClick={() => setIsPackageModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                <input
                  type="text"
                  value={packageForm.name}
                  onChange={e => setPackageForm({ ...packageForm, name: e.target.value })}
                  required
                  placeholder="e.g., Basic Package"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="text"
                    value={packageForm.price}
                    onChange={e => setPackageForm({ ...packageForm, price: e.target.value })}
                    required
                    placeholder="e.g., $35"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Per</label>
                  <input
                    type="text"
                    value={packageForm.per}
                    onChange={e => setPackageForm({ ...packageForm, per: e.target.value })}
                    required
                    placeholder="e.g., per person"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={e => setFeatureInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    placeholder="Add a feature..."
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-1">
                  {packageForm.features?.map((feature, idx) => (
                    <div key={idx} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded">
                      <span className="text-sm">{feature}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(idx)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="popular"
                  checked={packageForm.popular}
                  onChange={e => setPackageForm({ ...packageForm, popular: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-lotus-gold focus:ring-lotus-gold"
                />
                <label htmlFor="popular" className="text-sm font-medium text-gray-700">
                  Mark as "Most Popular"
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsPackageModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {editingPackage ? 'Save Changes' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple Image Upload Component
function ImageUploadField({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  const [method, setMethod] = useState<'url' | 'file'>('url');
  const [preview, setPreview] = useState(value);

  useEffect(() => {
    setPreview(value);
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreview(result);
        onChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => setMethod('url')}
          className={`text-xs px-3 py-1.5 rounded ${method === 'url' ? 'bg-lotus-gold text-white' : 'bg-gray-100'}`}
        >
          URL
        </button>
        <button
          type="button"
          onClick={() => setMethod('file')}
          className={`text-xs px-3 py-1.5 rounded ${method === 'file' ? 'bg-lotus-gold text-white' : 'bg-gray-100'}`}
        >
          Upload
        </button>
      </div>

      {preview && (
        <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded-lg mb-2" />
      )}

      {method === 'url' ? (
        <input
          type="url"
          value={value}
          onChange={e => {
            onChange(e.target.value);
            setPreview(e.target.value);
          }}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
        />
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <label className="cursor-pointer">
            <span className="text-lotus-gold font-medium">Click to upload</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
        </div>
      )}
    </div>
  );
}
