import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, Filter, Download, Eye, CheckCircle, XCircle, Clock, 
  Package, Calendar, Users, DollarSign, ChevronLeft, ChevronRight, 
  Trash2, Edit, Save, X, FileText, Star, Utensils, Upload
} from 'lucide-react';
import { DataStore } from '@/data/store';
import { uploadImage } from '@/lib/uploadImage';
import type { CateringOrder, CateringPackage, CateringType, CateringStatus } from '@/types';

const STATUS_BADGES: Record<CateringStatus, { color: string; icon: React.ReactNode; label: string }> = {
  pending: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-4 h-4" />, label: 'Pending' },
  confirmed: { color: 'bg-blue-100 text-blue-700', icon: <CheckCircle className="w-4 h-4" />, label: 'Confirmed' },
  in_progress: { color: 'bg-purple-100 text-purple-700', icon: <Clock className="w-4 h-4" />, label: 'In Progress' },
  completed: { color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-4 h-4" />, label: 'Completed' },
  cancelled: { color: 'bg-red-100 text-red-700', icon: <XCircle className="w-4 h-4" />, label: 'Cancelled' },
};

const CATERING_TYPE_LABELS: Record<CateringType, string> = {
  wedding: 'Wedding',
  corporate: 'Corporate',
  private: 'Private Event',
};

export default function AdminCatering() {
  const [activeTab, setActiveTab] = useState<'orders' | 'packages' | 'quotes'>('orders');
  
  // Orders state
  const [orders, setOrders] = useState<CateringOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<CateringOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CateringStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<CateringType | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<CateringOrder | null>(null);
  const [orderNotes, setOrderNotes] = useState('');
  
  // Packages state
  const [packages, setPackages] = useState<CateringPackage[]>([]);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<CateringPackage | null>(null);
  
  // Custom quote state
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter, typeFilter]);

  const loadData = () => {
    setOrders(DataStore.getCateringOrders());
    setPackages(DataStore.getCateringPackages());
  };

  const filterOrders = () => {
    let filtered = orders;
    
    if (searchQuery) {
      filtered = filtered.filter(o => 
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(o => o.cateringType === typeFilter);
    }
    
    setFilteredOrders(filtered);
  };

  const handleUpdateStatus = (orderId: string, status: CateringStatus) => {
    DataStore.updateCateringOrderStatus(orderId, status);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status });
    }
    loadData();
  };

  const handleSaveNotes = () => {
    if (!selectedOrder) return;
    DataStore.updateCateringOrderNotes(selectedOrder.id, orderNotes);
    setSelectedOrder({ ...selectedOrder, adminNotes: orderNotes });
    loadData();
  };

  const exportToCSV = () => {
    const headers = ['Order #', 'Date', 'Customer', 'Type', 'Event Date', 'Guests', 'Status'];
    const rows = filteredOrders.map(o => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString(),
      o.customerName,
      CATERING_TYPE_LABELS[o.cateringType],
      new Date(o.eventDate).toLocaleDateString(),
      o.guestCount,
      o.status
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `catering-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-lotus-dark">Catering Management</h1>
          <p className="text-gray-600">Manage catering orders, packages, and custom quotes</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'orders' ? 'bg-lotus-gold text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Orders
          </button>
          <button 
            onClick={() => setActiveTab('packages')}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'packages' ? 'bg-lotus-gold text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Packages
          </button>
          <button 
            onClick={() => setIsQuoteModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Custom Quote
          </button>
        </div>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-lotus-gold"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CateringStatus | 'all')}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-lotus-gold"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as CateringType | 'all')}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-lotus-gold"
            >
              <option value="all">All Types</option>
              <option value="wedding">Wedding</option>
              <option value="corporate">Corporate</option>
              <option value="private">Private</option>
            </select>
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Order #</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Event Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Guests</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customerEmail}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm">
                          {CATERING_TYPE_LABELS[order.cateringType]}
                        </span>
                        {order.customQuote && (
                          <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 bg-lotus-gold/10 text-lotus-gold rounded text-xs">
                            Custom
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">{new Date(order.eventDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3">{order.guestCount}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGES[order.status].color}`}>
                          {STATUS_BADGES[order.status].icon}
                          {STATUS_BADGES[order.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => {
                            setSelectedOrder(order);
                            setOrderNotes(order.adminNotes || '');
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Packages Tab */}
      {activeTab === 'packages' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Catering Packages</h2>
            <button 
              onClick={() => {
                setEditingPackage(null);
                setIsPackageModalOpen(true);
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Package
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {pkg.gallery[0] && (
                  <div className="h-40 overflow-hidden">
                    <img src={pkg.gallery[0]} alt={pkg.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lotus-dark">{pkg.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${pkg.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {pkg.active ? 'Active' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{pkg.description}</p>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-xl font-bold text-lotus-gold">${pkg.pricePerHead}</span>
                    <span className="text-sm text-gray-500">/person</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setEditingPackage(pkg);
                        setIsPackageModalOpen(true);
                      }}
                      className="flex-1 py-2 text-sm border rounded-lg hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => {
                        const updated = packages.filter(p => p.id !== pkg.id);
                        DataStore.setCateringPackages(updated);
                        loadData();
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Order {selectedOrder.orderNumber}</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3">
                <span className="text-gray-600">Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value as CateringStatus)}
                  className="px-3 py-1 border rounded-lg"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <p className="font-medium">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-medium">{selectedOrder.customerEmail}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <p className="font-medium">{selectedOrder.customerPhone}</p>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Event Details</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <p className="font-medium">{CATERING_TYPE_LABELS[selectedOrder.cateringType]}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Package:</span>
                    <p className="font-medium">{selectedOrder.packageName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Event Date:</span>
                    <p className="font-medium">{new Date(selectedOrder.eventDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Guests:</span>
                    <p className="font-medium">{selectedOrder.guestCount}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-500">Location:</span>
                    <p className="font-medium">{selectedOrder.eventLocation}</p>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <h3 className="font-semibold mb-2">Admin Notes</h3>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg resize-none"
                  placeholder="Add internal notes about this order..."
                />
                <button 
                  onClick={handleSaveNotes}
                  className="mt-2 btn-primary text-sm"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Package Modal */}
      {isPackageModalOpen && (
        <PackageModal 
          pkg={editingPackage}
          onClose={() => setIsPackageModalOpen(false)}
          onSave={() => {
            loadData();
            setIsPackageModalOpen(false);
          }}
        />
      )}

      {/* Custom Quote Modal */}
      {isQuoteModalOpen && (
        <QuoteModal 
          onClose={() => setIsQuoteModalOpen(false)}
          onSave={() => {
            loadData();
            setIsQuoteModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

// Package Modal Component
function PackageModal({ pkg, onClose, onSave }: { pkg: CateringPackage | null; onClose: () => void; onSave: () => void }) {
  const [formData, setFormData] = useState<Partial<CateringPackage>>({
    name: pkg?.name || '',
    cateringType: pkg?.cateringType || 'wedding',
    description: pkg?.description || '',
    pricePerHead: pkg?.pricePerHead || 0,
    minGuests: pkg?.minGuests || 50,
    maxGuests: pkg?.maxGuests || 100,
    includedItems: pkg?.includedItems || [],
    active: pkg?.active !== false,
  });
  const [newItem, setNewItem] = useState('');

  const handleSave = () => {
    const packages = DataStore.getCateringPackages();
    
    if (pkg) {
      // Edit existing
      const updated = packages.map(p => p.id === pkg.id ? { ...p, ...formData } as CateringPackage : p);
      DataStore.setCateringPackages(updated);
    } else {
      // Create new
      const newPackage: CateringPackage = {
        ...formData as CateringPackage,
        id: Date.now().toString(),
        dishes: [],
        addOns: [],
        gallery: [],
        features: [],
        order: packages.length + 1,
      };
      DataStore.setCateringPackages([...packages, newPackage]);
    }
    
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{pkg ? 'Edit Package' : 'Create Package'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Package Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Catering Type</label>
            <select
              value={formData.cateringType}
              onChange={(e) => setFormData({ ...formData, cateringType: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="wedding">Wedding</option>
              <option value="corporate">Corporate</option>
              <option value="private">Private Event</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg resize-none"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price/Person</label>
              <input
                type="number"
                value={formData.pricePerHead}
                onChange={(e) => setFormData({ ...formData, pricePerHead: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Min Guests</label>
              <input
                type="number"
                value={formData.minGuests}
                onChange={(e) => setFormData({ ...formData, minGuests: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Guests</label>
              <input
                type="number"
                value={formData.maxGuests}
                onChange={(e) => setFormData({ ...formData, maxGuests: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Included Items</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newItem.trim()) {
                      setFormData({ ...formData, includedItems: [...(formData.includedItems || []), newItem.trim()] });
                      setNewItem('');
                    }
                  }
                }}
                placeholder="Add item..."
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <button 
                onClick={() => {
                  if (newItem.trim()) {
                    setFormData({ ...formData, includedItems: [...(formData.includedItems || []), newItem.trim()] });
                    setNewItem('');
                  }
                }}
                className="px-4 py-2 bg-gray-100 rounded-lg"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.includedItems?.map((item, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                  {item}
                  <button 
                    onClick={() => setFormData({ ...formData, includedItems: formData.includedItems?.filter((_, i) => i !== idx) })}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="active">Active (visible on website)</label>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={onClose} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button onClick={handleSave} className="btn-primary">Save Package</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quote Modal Component
function QuoteModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cateringType: 'wedding' as CateringType,
    eventDate: '',
    guestCount: '',
    customMenu: '',
    customPricing: '',
    notes: '',
  });

  const handleSave = () => {
    const newOrder: CateringOrder = {
      id: Date.now().toString(),
      orderNumber: `CAT-${Date.now().toString().slice(-6)}`,
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      cateringType: formData.cateringType,
      packageName: 'Custom Quote',
      eventDate: formData.eventDate,
      eventLocation: '',
      guestCount: parseInt(formData.guestCount) || 0,
      specialRequests: formData.customMenu,
      adminNotes: formData.notes,
      customPricing: parseInt(formData.customPricing) || undefined,
      status: 'pending',
      customQuote: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    DataStore.addCateringOrder(newOrder);
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Create Custom Quote</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Customer Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Event Type</label>
              <select
                value={formData.cateringType}
                onChange={(e) => setFormData({ ...formData, cateringType: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="wedding">Wedding</option>
                <option value="corporate">Corporate</option>
                <option value="private">Private Event</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Event Date</label>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Guest Count</label>
            <input
              type="number"
              value={formData.guestCount}
              onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Custom Menu Items</label>
            <textarea
              value={formData.customMenu}
              onChange={(e) => setFormData({ ...formData, customMenu: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Custom Pricing ($)</label>
            <input
              type="number"
              value={formData.customPricing}
              onChange={(e) => setFormData({ ...formData, customPricing: e.target.value })}
              placeholder="Total price or per person"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Internal Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg resize-none"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={onClose} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button onClick={handleSave} className="btn-primary">Create Quote</button>
          </div>
        </div>
      </div>
    </div>
  );
}
