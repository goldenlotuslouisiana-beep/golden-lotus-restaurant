import { useState, useEffect } from 'react';
import { 
  Plus, Search, Download, CheckCircle, XCircle, 
  Trash2, X, Calendar, Users, DollarSign, Phone, Mail,
  Star, Utensils, Check,
  Upload
} from 'lucide-react';
import { DataStore } from '@/data/store';
import { uploadImage } from '@/lib/uploadImage';
import type { CateringInquiry, CateringPackage } from '@/types';

// Status badge configurations
const STATUS_CONFIG = {
  new: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Star className="w-4 h-4" />, label: 'New' },
  contacted: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Phone className="w-4 h-4" />, label: 'Contacted' },
  quoted: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: <DollarSign className="w-4 h-4" />, label: 'Quoted' },
  confirmed: { color: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle className="w-4 h-4" />, label: 'Confirmed' },
  completed: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: <Check className="w-4 h-4" />, label: 'Completed' },
  cancelled: { color: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle className="w-4 h-4" />, label: 'Cancelled' },
};

const PRIORITY_CONFIG = {
  low: { color: 'bg-gray-100 text-gray-600', label: 'Low' },
  medium: { color: 'bg-yellow-100 text-yellow-700', label: 'Medium' },
  high: { color: 'bg-orange-100 text-orange-700', label: 'High' },
  urgent: { color: 'bg-red-100 text-red-700', label: 'Urgent' },
};

const CATERING_TYPES = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'private', label: 'Private Event' },
  { value: 'all', label: 'All Types' },
];

export default function AdminCatering() {
  const [activeTab, setActiveTab] = useState<'inquiries' | 'packages'>('inquiries');
  
  // Inquiries state
  const [inquiries, setInquiries] = useState<CateringInquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<CateringInquiry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CateringInquiry['status'] | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<CateringInquiry['priority'] | 'all'>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<CateringInquiry | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Packages state
  const [packages, setPackages] = useState<CateringPackage[]>([]);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<CateringPackage | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterInquiries();
  }, [inquiries, searchQuery, statusFilter, priorityFilter]);

  const loadData = () => {
    setInquiries(DataStore.getCateringInquiries());
    setPackages(DataStore.getCateringPackages());
  };

  const filterInquiries = () => {
    let filtered = inquiries;
    
    if (searchQuery) {
      filtered = filtered.filter(i => 
        i.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.inquiryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.eventType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(i => i.status === statusFilter);
    }
    
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(i => i.priority === priorityFilter);
    }
    
    filtered.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    setFilteredInquiries(filtered);
  };

  const handleUpdateStatus = (inquiryId: string, status: CateringInquiry['status']) => {
    DataStore.updateCateringInquiryStatus(inquiryId, status);
    loadData();
  };

  const handleUpdatePriority = (inquiryId: string, priority: CateringInquiry['priority']) => {
    DataStore.updateCateringInquiry(inquiryId, { priority });
    loadData();
  };

  const handleAddCommunication = (inquiryId: string, type: 'email' | 'phone' | 'meeting' | 'note', notes: string) => {
    DataStore.addCateringInquiryCommunication(inquiryId, {
      date: new Date().toISOString(),
      type,
      notes,
      staffName: 'Admin',
    });
    loadData();
  };

  const handleDeleteInquiry = (inquiryId: string) => {
    if (confirm('Are you sure you want to delete this inquiry?')) {
      DataStore.deleteCateringInquiry(inquiryId);
      loadData();
    }
  };

  const handleSavePackage = (pkg: CateringPackage) => {
    const existingPackages = DataStore.getCateringPackages();
    let updatedPackages;
    
    if (editingPackage) {
      // Update existing
      updatedPackages = existingPackages.map(p => 
        p.id === pkg.id ? { ...pkg, updatedAt: new Date().toISOString() } : p
      );
    } else {
      // Create new
      const newPackage = {
        ...pkg,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedPackages = [...existingPackages, newPackage];
    }
    
    DataStore.setCateringPackages(updatedPackages);
    setIsPackageModalOpen(false);
    setEditingPackage(null);
    loadData();
  };

  const handleDeletePackage = (pkgId: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      const existingPackages = DataStore.getCateringPackages();
      const updatedPackages = existingPackages.filter(p => p.id !== pkgId);
      DataStore.setCateringPackages(updatedPackages);
      loadData();
    }
  };

  const handleTogglePackageActive = (pkg: CateringPackage) => {
    const existingPackages = DataStore.getCateringPackages();
    const updatedPackages = existingPackages.map(p => 
      p.id === pkg.id ? { ...p, active: !p.active, updatedAt: new Date().toISOString() } : p
    );
    DataStore.setCateringPackages(updatedPackages);
    loadData();
  };

  const handleTogglePackageFeatured = (pkg: CateringPackage) => {
    const existingPackages = DataStore.getCateringPackages();
    const updatedPackages = existingPackages.map(p => 
      p.id === pkg.id ? { ...p, featured: !p.featured, updatedAt: new Date().toISOString() } : p
    );
    DataStore.setCateringPackages(updatedPackages);
    loadData();
  };

  const exportToCSV = () => {
    const headers = ['Inquiry #', 'Date', 'Customer', 'Email', 'Phone', 'Event Type', 'Event Date', 'Guests', 'Status', 'Priority', 'Quoted Amount'];
    const rows = filteredInquiries.map(i => [
      i.inquiryNumber,
      new Date(i.submittedAt).toLocaleDateString(),
      i.customerName,
      i.customerEmail,
      i.customerPhone,
      i.eventType,
      new Date(i.eventDate).toLocaleDateString(),
      i.guestCount,
      i.status,
      i.priority,
      i.quotedAmount || '',
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `catering-inquiries-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const stats = {
    total: inquiries.length,
    new: inquiries.filter(i => i.status === 'new').length,
    quoted: inquiries.filter(i => i.status === 'quoted').length,
    confirmed: inquiries.filter(i => i.status === 'confirmed').length,
    revenue: inquiries.filter(i => i.quotedAmount).reduce((sum, i) => sum + (i.quotedAmount || 0), 0),
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Catering Management</h1>
        <p className="text-gray-600 mt-1">Manage catering inquiries, packages, and customer requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Inquiries</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              <Mail className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">New Leads</p>
              <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              <Star className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-lotus-gold">${stats.revenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-lotus-gold/20 rounded-lg flex items-center justify-center text-lotus-gold">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`pb-4 px-2 font-medium transition-colors ${
            activeTab === 'inquiries'
              ? 'text-lotus-gold border-b-2 border-lotus-gold'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Inquiries ({inquiries.length})
        </button>
        <button
          onClick={() => setActiveTab('packages')}
          className={`pb-4 px-2 font-medium transition-colors ${
            activeTab === 'packages'
              ? 'text-lotus-gold border-b-2 border-lotus-gold'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Packages ({packages.length})
        </button>
      </div>

      {activeTab === 'inquiries' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search inquiries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lotus-gold focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lotus-gold"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="quoted">Quoted</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lotus-gold"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Inquiries Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Inquiry #</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Event Details</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Priority</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{inquiry.inquiryNumber}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(inquiry.submittedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{inquiry.customerName}</div>
                        <div className="text-sm text-gray-500">{inquiry.customerEmail}</div>
                        <div className="text-sm text-gray-500">{inquiry.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{inquiry.eventType}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(inquiry.eventDate).toLocaleDateString()} • {inquiry.guestCount} guests
                        </div>
                        {inquiry.packageName && (
                          <div className="text-sm text-lotus-gold">{inquiry.packageName}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={inquiry.status}
                          onChange={(e) => handleUpdateStatus(inquiry.id, e.target.value as any)}
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${STATUS_CONFIG[inquiry.status].color}`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="quoted">Quoted</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={inquiry.priority}
                          onChange={(e) => handleUpdatePriority(inquiry.id, e.target.value as any)}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${PRIORITY_CONFIG[inquiry.priority].color}`}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        {inquiry.quotedAmount ? (
                          <div className="font-medium text-gray-900">
                            ${inquiry.quotedAmount.toLocaleString()}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedInquiry(inquiry);
                              setShowDetailModal(true);
                            }}
                            className="text-lotus-gold hover:text-lotus-gold-dark font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteInquiry(inquiry.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredInquiries.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No inquiries found matching your filters.
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'packages' && (
        <>
          {/* Add Package Button */}
          <div className="mb-6">
            <button
              onClick={() => {
                setEditingPackage(null);
                setIsPackageModalOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-lotus-gold text-white rounded-xl font-semibold hover:bg-lotus-gold-dark transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add New Package
            </button>
          </div>

          {/* Packages Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={pkg.featuredImage || pkg.images[0]} 
                    alt={pkg.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {pkg.featured && (
                      <span className="px-2 py-1 bg-lotus-gold text-white text-xs rounded-full">Featured</span>
                    )}
                    {!pkg.active && (
                      <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded-full">Inactive</span>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{pkg.name}</h3>
                      {pkg.subtitle && <p className="text-sm text-lotus-gold">{pkg.subtitle}</p>}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pkg.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="font-medium text-lotus-gold">${pkg.pricePerPerson}/person</span>
                    <span>•</span>
                    <span>{pkg.minGuests}-{pkg.maxGuests} guests</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => handleTogglePackageActive(pkg)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        pkg.active 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {pkg.active ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => handleTogglePackageFeatured(pkg)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        pkg.featured 
                          ? 'bg-lotus-gold text-white hover:bg-lotus-gold-dark' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {pkg.featured ? 'Featured' : 'Not Featured'}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingPackage(pkg);
                        setIsPackageModalOpen(true);
                      }}
                      className="flex-1 px-4 py-2 bg-lotus-gold text-white rounded-lg hover:bg-lotus-gold-dark transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Inquiry Detail Modal */}
      {showDetailModal && selectedInquiry && (
        <InquiryDetailModal
          inquiry={selectedInquiry}
          onClose={() => setShowDetailModal(false)}
          onUpdate={loadData}
          onAddCommunication={handleAddCommunication}
        />
      )}

      {/* Package Modal */}
      {isPackageModalOpen && (
        <PackageModal
          pkg={editingPackage}
          onClose={() => {
            setIsPackageModalOpen(false);
            setEditingPackage(null);
          }}
          onSave={handleSavePackage}
        />
      )}
    </div>
  );
}

// Package Modal Component
function PackageModal({ 
  pkg, 
  onClose, 
  onSave 
}: { 
  pkg: CateringPackage | null; 
  onClose: () => void; 
  onSave: (pkg: CateringPackage) => void;
}) {
  const [formData, setFormData] = useState<Partial<CateringPackage>>({
    name: '',
    subtitle: '',
    cateringType: 'all',
    description: '',
    longDescription: '',
    pricePerPerson: 0,
    minGuests: 10,
    maxGuests: 100,
    images: [],
    featuredImage: '',
    menuItems: [],
    inclusions: [],
    features: [],
    suitableFor: [],
    availableAddOns: [],
    active: true,
    featured: false,
    order: 0,
    ...pkg,
  });
  
  const [newMenuCategory, setNewMenuCategory] = useState('');
  const [newMenuItems, setNewMenuItems] = useState('');
  const [newInclusion, setNewInclusion] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [newSuitableFor, setNewSuitableFor] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const url = await uploadImage(file);
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), url],
        featuredImage: prev.featuredImage || url
      }));
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddMenuSection = () => {
    if (newMenuCategory && newMenuItems) {
      setFormData(prev => ({
        ...prev,
        menuItems: [...(prev.menuItems || []), { category: newMenuCategory, items: newMenuItems.split(',').map(s => s.trim()) }]
      }));
      setNewMenuCategory('');
      setNewMenuItems('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as CateringPackage);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl my-8">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">{pkg ? 'Edit Package' : 'Create New Package'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Package Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lotus-gold"
                placeholder="e.g., Royal Wedding Feast"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lotus-gold"
                placeholder="e.g., Elegant Celebration"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Per Person *</label>
              <input
                type="number"
                required
                value={formData.pricePerPerson}
                onChange={(e) => setFormData({ ...formData, pricePerPerson: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lotus-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Guests *</label>
              <input
                type="number"
                required
                value={formData.minGuests}
                onChange={(e) => setFormData({ ...formData, minGuests: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lotus-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Guests *</label>
              <input
                type="number"
                required
                value={formData.maxGuests}
                onChange={(e) => setFormData({ ...formData, maxGuests: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lotus-gold"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Catering Type</label>
            <select
              value={formData.cateringType}
              onChange={(e) => setFormData({ ...formData, cateringType: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lotus-gold"
            >
              {CATERING_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Short Description *</label>
            <textarea
              required
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lotus-gold resize-none"
              placeholder="Brief description for package cards..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Long Description</label>
            <textarea
              rows={4}
              value={formData.longDescription}
              onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lotus-gold resize-none"
              placeholder="Detailed description for package detail page..."
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Package Images</label>
            <div className="flex flex-wrap gap-4 mb-4">
              {formData.images?.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24">
                  <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      images: prev.images?.filter((_, i) => i !== idx) || []
                    }))}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-lotus-gold">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" />
                {uploadingImage ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-lotus-gold" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Add Image</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Menu Items */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Menu Items</label>
            <div className="space-y-4">
              {formData.menuItems?.map((section, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{section.category}</h4>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        menuItems: prev.menuItems?.filter((_, i) => i !== idx) || []
                      }))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {section.items.map((item, i) => (
                      <span key={i} className="px-3 py-1 bg-white rounded-full text-sm border border-gray-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Category (e.g., Appetizers)"
                  value={newMenuCategory}
                  onChange={(e) => setNewMenuCategory(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Items (comma separated)"
                  value={newMenuItems}
                  onChange={(e) => setNewMenuItems(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleAddMenuSection}
                  className="px-4 py-2 bg-lotus-gold text-white rounded-lg hover:bg-lotus-gold-dark"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Inclusions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">What's Included</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.inclusions?.map((item, idx) => (
                <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1">
                  {item}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      inclusions: prev.inclusions?.filter((_, i) => i !== idx) || []
                    }))}
                    className="hover:text-green-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add inclusion..."
                value={newInclusion}
                onChange={(e) => setNewInclusion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInclusion())}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
              />
              <button
                type="button"
                onClick={handleAddInclusion}
                className="px-4 py-2 bg-lotus-gold text-white rounded-lg hover:bg-lotus-gold-dark"
              >
                Add
              </button>
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.features?.map((item, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1">
                  {item}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      features: prev.features?.filter((_, i) => i !== idx) || []
                    }))}
                    className="hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add feature..."
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 py-2 bg-lotus-gold text-white rounded-lg hover:bg-lotus-gold-dark"
              >
                Add
              </button>
            </div>
          </div>

          {/* Suitable For */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Suitable For</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.suitableFor?.map((item, idx) => (
                <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-1">
                  {item}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      suitableFor: prev.suitableFor?.filter((_, i) => i !== idx) || []
                    }))}
                    className="hover:text-purple-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add event type..."
                value={newSuitableFor}
                onChange={(e) => setNewSuitableFor(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
              />
              <button
                type="button"
                onClick={handleAddSuitableFor}
                className="px-4 py-2 bg-lotus-gold text-white rounded-lg hover:bg-lotus-gold-dark"
              >
                Add
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-lotus-gold focus:ring-lotus-gold"
              />
              <span className="text-sm font-medium">Active</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-lotus-gold focus:ring-lotus-gold"
              />
              <span className="text-sm font-medium">Featured</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-lotus-gold text-white rounded-lg hover:bg-lotus-gold-dark"
            >
              {pkg ? 'Save Changes' : 'Create Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  function handleAddInclusion() {
    if (newInclusion.trim()) {
      setFormData(prev => ({
        ...prev,
        inclusions: [...(prev.inclusions || []), newInclusion.trim()]
      }));
      setNewInclusion('');
    }
  }

  function handleAddFeature() {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()]
      }));
      setNewFeature('');
    }
  }

  function handleAddSuitableFor() {
    if (newSuitableFor.trim()) {
      setFormData(prev => ({
        ...prev,
        suitableFor: [...(prev.suitableFor || []), newSuitableFor.trim()]
      }));
      setNewSuitableFor('');
    }
  }
}

// Inquiry Detail Modal Component
function InquiryDetailModal({ 
  inquiry, 
  onClose, 
  onUpdate,
  onAddCommunication 
}: { 
  inquiry: CateringInquiry; 
  onClose: () => void; 
  onUpdate: () => void;
  onAddCommunication: (id: string, type: 'email' | 'phone' | 'meeting' | 'note', notes: string) => void;
}) {
  const [activeSection, setActiveSection] = useState<'details' | 'communication' | 'notes'>('details');
  const [newNote, setNewNote] = useState('');
  const [commType, setCommType] = useState<'email' | 'phone' | 'meeting' | 'note'>('note');
  const [quotedAmount, setQuotedAmount] = useState(inquiry.quotedAmount || '');
  const [adminNotes, setAdminNotes] = useState(inquiry.adminNotes || '');

  const handleSaveQuote = () => {
    DataStore.updateCateringInquiry(inquiry.id, { 
      quotedAmount: Number(quotedAmount),
      status: 'quoted'
    });
    onUpdate();
  };

  const handleSaveNotes = () => {
    DataStore.updateCateringInquiry(inquiry.id, { adminNotes });
    onUpdate();
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddCommunication(inquiry.id, commType, newNote);
      setNewNote('');
      onUpdate();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{inquiry.inquiryNumber}</h2>
            <p className="text-sm text-gray-500">
              Submitted {new Date(inquiry.submittedAt).toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveSection('details')}
            className={`px-6 py-3 font-medium ${activeSection === 'details' ? 'text-lotus-gold border-b-2 border-lotus-gold' : 'text-gray-600'}`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveSection('communication')}
            className={`px-6 py-3 font-medium ${activeSection === 'communication' ? 'text-lotus-gold border-b-2 border-lotus-gold' : 'text-gray-600'}`}
          >
            Communication Log
          </button>
          <button
            onClick={() => setActiveSection('notes')}
            className={`px-6 py-3 font-medium ${activeSection === 'notes' ? 'text-lotus-gold border-b-2 border-lotus-gold' : 'text-gray-600'}`}
          >
            Admin Notes
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeSection === 'details' && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-lotus-gold" />
                    Customer Information
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="text-gray-500">Name:</span> {inquiry.customerName}</p>
                    <p className="text-sm"><span className="text-gray-500">Email:</span> {inquiry.customerEmail}</p>
                    <p className="text-sm"><span className="text-gray-500">Phone:</span> {inquiry.customerPhone}</p>
                    {inquiry.companyName && (
                      <p className="text-sm"><span className="text-gray-500">Company:</span> {inquiry.companyName}</p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-lotus-gold" />
                    Event Details
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="text-gray-500">Type:</span> {inquiry.eventType}</p>
                    <p className="text-sm"><span className="text-gray-500">Date:</span> {new Date(inquiry.eventDate).toLocaleString()}</p>
                    <p className="text-sm"><span className="text-gray-500">Guests:</span> {inquiry.guestCount}</p>
                    <p className="text-sm"><span className="text-gray-500">Venue:</span> {inquiry.venueType}</p>
                  </div>
                </div>
              </div>

              {/* Package Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-lotus-gold" />
                  Package Selection
                </h3>
                {inquiry.packageName ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{inquiry.packageName}</p>
                      <p className="text-sm text-gray-500">Standard Package</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Selected</span>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-amber-600">Custom Package Request</p>
                    <p className="text-sm text-gray-500">Client requested custom quote</p>
                  </div>
                )}
              </div>

              {/* Requirements */}
              {(inquiry.dietaryRequirements || inquiry.specialRequests) && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Special Requirements</h3>
                  {inquiry.dietaryRequirements && (
                    <p className="text-sm mb-2"><span className="text-gray-500">Dietary:</span> {inquiry.dietaryRequirements}</p>
                  )}
                  {inquiry.specialRequests && (
                    <p className="text-sm"><span className="text-gray-500">Requests:</span> {inquiry.specialRequests}</p>
                  )}
                </div>
              )}

              {/* Quoting Section */}
              <div className="bg-lotus-cream rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-lotus-gold" />
                  Quote Management
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">Quoted Amount ($)</label>
                    <input
                      type="number"
                      value={quotedAmount}
                      onChange={(e) => setQuotedAmount(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lotus-gold"
                      placeholder="Enter amount..."
                    />
                  </div>
                  <button
                    onClick={handleSaveQuote}
                    className="mt-6 px-6 py-2 bg-lotus-gold text-white rounded-lg hover:bg-lotus-gold-dark transition-colors"
                  >
                    Save Quote
                  </button>
                </div>
                {inquiry.budgetRange && (
                  <p className="text-sm text-gray-500 mt-2">Client budget: {inquiry.budgetRange}</p>
                )}
              </div>
            </div>
          )}

          {activeSection === 'communication' && (
            <div className="space-y-4">
              {/* Add Communication */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Add Communication</h3>
                <div className="flex gap-2 mb-2">
                  <select 
                    value={commType}
                    onChange={(e) => setCommType(e.target.value as any)}
                    className="px-3 py-2 border border-gray-200 rounded-lg"
                  >
                    <option value="note">Note</option>
                    <option value="phone">Phone Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Enter communication details..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lotus-gold"
                  />
                  <button
                    onClick={handleAddNote}
                    className="px-4 py-2 bg-lotus-gold text-white rounded-lg hover:bg-lotus-gold-dark transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Communication Log */}
              <div className="space-y-3">
                {inquiry.communicationLog && inquiry.communicationLog.length > 0 ? (
                  [...inquiry.communicationLog].reverse().map((log, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            log.type === 'email' ? 'bg-blue-100 text-blue-700' :
                            log.type === 'phone' ? 'bg-green-100 text-green-700' :
                            log.type === 'meeting' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                          </span>
                          {log.staffName && (
                            <span className="text-sm text-gray-500">by {log.staffName}</span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(log.date).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{log.notes}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No communication logged yet.</p>
                )}
              </div>
            </div>
          )}

          {activeSection === 'notes' && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-gray-900 mb-2">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-lotus-gold resize-none"
                  placeholder="Enter internal notes about this inquiry..."
                />
              </div>
              <button
                onClick={handleSaveNotes}
                className="px-6 py-2 bg-lotus-gold text-white rounded-lg hover:bg-lotus-gold-dark transition-colors"
              >
                Save Notes
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Current Status:</span>
            <select
              value={inquiry.status}
              onChange={(e) => {
                DataStore.updateCateringInquiryStatus(inquiry.id, e.target.value as any);
                onUpdate();
              }}
              className={`px-3 py-1 rounded-full text-sm font-medium border ${STATUS_CONFIG[inquiry.status].color}`}
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="quoted">Quoted</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
