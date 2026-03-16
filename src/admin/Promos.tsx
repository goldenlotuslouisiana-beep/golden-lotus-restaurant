import { useState, useEffect } from 'react';
import { Tag, Plus, Edit, Trash2, X, Loader2, Copy, ToggleLeft, ToggleRight, Sparkles, Percent } from 'lucide-react';
import type { Coupon } from '@/types';

const authHeaders = () => {
  const token = localStorage.getItem('admin_jwt');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

interface Promo { id: string; code: string; discountType: string; value: number; minOrder: number; maxUses: number; uses: number; expires: string; status: string; createdAt: string }

const statusColors: Record<string, string> = { active: 'bg-green-100 text-green-700', expired: 'bg-red-100 text-red-700', disabled: 'bg-gray-100 text-gray-600' };

function genCode() { return 'GL' + Math.random().toString(36).substring(2, 8).toUpperCase(); }

export default function AdminPromos() {
  const [activeTab, setActiveTab] = useState<'checkout' | 'display'>('display');
  
  // Checkout Promos (existing API-based)
  const [promos, setPromos] = useState<Promo[]>([]);
  const [promoLoading, setPromoLoading] = useState(true);
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState<string | null>(null);
  const [promoForm, setPromoForm] = useState({ code: '', discountType: 'percentage', value: 0, minOrder: 0, maxUses: 0, expires: '' });

  // Display Coupons (Special Offers shown on Menu page)
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<string | null>(null);
  type CouponFormData = {
    code: string;
    description: string;
    discountType: 'percentage' | 'fixed' | 'free_delivery';
    discountValue: number;
    minOrder: number;
    active: boolean;
  };
  const [couponForm, setCouponForm] = useState<CouponFormData>({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    minOrder: 0,
    active: true,
  });

  // Fetch checkout promos from API
  const fetchPromos = async () => {
    setPromoLoading(true);
    try { 
      const r = await fetch('/api/admin?action=promos'); 
      const raw = await r.json();
      setPromos(Array.isArray(raw) ? raw : []); 
    } catch {} finally { setPromoLoading(false); }
  };

  // Load display coupons from API
  const loadCoupons = async () => {
    try {
      const res = await fetch('/api/admin?action=coupons', { headers: authHeaders() });
      if (res.ok) setCoupons(await res.json());
    } catch (err) { console.error('Error loading coupons:', err); }
  };

  useEffect(() => { 
    fetchPromos(); 
    loadCoupons();
  }, []);

  // Checkout Promo functions
  const getStatus = (p: Promo) => {
    if (p.status === 'disabled') return 'disabled';
    if (p.expires && new Date(p.expires) < new Date()) return 'expired';
    if (p.maxUses > 0 && p.uses >= p.maxUses) return 'expired';
    return 'active';
  };

  const savePromo = async () => {
    if (editingPromo) {
      await fetch(`/api/admin?action=promos&id=${editingPromo}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(promoForm) });
    } else {
      await fetch('/api/admin?action=promos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(promoForm) });
    }
    setShowPromoForm(false); setEditingPromo(null); setPromoForm({ code: '', discountType: 'percentage', value: 0, minOrder: 0, maxUses: 0, expires: '' }); fetchPromos();
  };

  const togglePromo = async (p: Promo) => {
    const newStatus = p.status === 'disabled' ? 'active' : 'disabled';
    await fetch(`/api/admin?action=promos&id=${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
    fetchPromos();
  };

  const deletePromo = async (id: string) => { await fetch(`/api/admin?action=promos&id=${id}`, { method: 'DELETE' }); fetchPromos(); };

  // Display Coupon functions
  const saveCoupon = async () => {
    try {
      if (editingCoupon) {
        await fetch(`/api/admin?action=coupons&id=${editingCoupon}`, {
          method: 'PATCH', headers: authHeaders(), body: JSON.stringify(couponForm)
        });
      } else {
        await fetch('/api/admin?action=coupons', {
          method: 'POST', headers: authHeaders(), body: JSON.stringify(couponForm)
        });
      }
      setShowCouponForm(false);
      setEditingCoupon(null);
      setCouponForm({ code: '', description: '', discountType: 'percentage', discountValue: 0, minOrder: 0, active: true });
      loadCoupons();
    } catch (err) { console.error('Error saving coupon:', err); }
  };

  const toggleCoupon = async (id: string) => {
    const coupon = coupons.find(c => c.id === id);
    if (!coupon) return;
    try {
      await fetch(`/api/admin?action=coupons&id=${id}`, {
        method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ active: !coupon.active })
      });
      loadCoupons();
    } catch (err) { console.error('Error toggling coupon:', err); }
  };

  const deleteCoupon = async (id: string) => {
    try {
      await fetch(`/api/admin?action=coupons&id=${id}`, {
        method: 'DELETE', headers: authHeaders()
      });
      loadCoupons();
    } catch (err) { console.error('Error deleting coupon:', err); }
  };

  const inputCls = "w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold focus:border-transparent";

  const activePromoCount = promos.filter(p => getStatus(p) === 'active').length;
  const totalUses = promos.reduce((s, p) => s + p.uses, 0);
  const activeCouponCount = coupons.filter(c => c.active).length;

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-lotus-dark">Promotions</h1>
          <p className="text-gray-600">Manage promo codes and special offers</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('display')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'display' ? 'bg-white text-lotus-gold shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Sparkles className="w-4 h-4 inline mr-1" />
            Special Offers
          </button>
          <button
            onClick={() => setActiveTab('checkout')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'checkout' ? 'bg-white text-lotus-gold shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Percent className="w-4 h-4 inline mr-1" />
            Checkout Codes
          </button>
        </div>
      </div>

      {/* DISPLAY COUPONS TAB */}
      {activeTab === 'display' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-gray-500 text-sm">Total Offers</p>
              <p className="text-2xl font-bold text-lotus-dark">{coupons.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-gray-500 text-sm">Active</p>
              <p className="text-2xl font-bold text-green-600">{activeCouponCount}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-gray-500 text-sm">Shown on Menu</p>
              <p className="text-2xl font-bold text-lotus-gold">{activeCouponCount}</p>
            </div>
          </div>

          {/* Add Button */}
          <div className="flex justify-end">
            <button 
              onClick={() => { 
                setShowCouponForm(true); 
                setEditingCoupon(null); 
                setCouponForm({ code: '', description: '', discountType: 'percentage', discountValue: 0, minOrder: 0, active: true }); 
              }} 
              className="px-4 py-2.5 bg-lotus-gold text-white rounded-lg font-medium hover:bg-lotus-gold-dark flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Special Offer
            </button>
          </div>

          {/* Coupons Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map(coupon => (
              <div 
                key={coupon.id} 
                className={`bg-gradient-to-r from-amber-50 to-orange-50 border ${coupon.active ? 'border-amber-200' : 'border-gray-200 opacity-60'} rounded-xl p-4 relative group`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="px-3 py-1 bg-gradient-to-r from-lotus-gold to-orange-500 text-white text-xs font-bold rounded-full">
                    {coupon.code}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => toggleCoupon(coupon.id)} 
                      className={`p-1.5 rounded ${coupon.active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                      title={coupon.active ? 'Deactivate' : 'Activate'}
                    >
                      {coupon.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => { 
                        setEditingCoupon(coupon.id); 
                        setCouponForm({
                          code: coupon.code,
                          description: coupon.description,
                          discountType: coupon.discountType,
                          discountValue: coupon.discountValue,
                          minOrder: coupon.minOrder || 0,
                          active: coupon.active,
                        }); 
                        setShowCouponForm(true); 
                      }} 
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteCoupon(coupon.id)} 
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-2">{coupon.description}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="px-2 py-0.5 bg-white rounded border">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : 
                     coupon.discountType === 'fixed' ? `$${coupon.discountValue} off` : 'Free delivery'}
                  </span>
                  {(coupon.minOrder ?? 0) > 0 && (
                    <span>Min: ${coupon.minOrder}</span>
                  )}
                </div>
              </div>
            ))}
            {coupons.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No special offers yet</p>
                <p className="text-sm">Add offers to display them on the menu page</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT PROMOS TAB */}
      {activeTab === 'checkout' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm"><p className="text-gray-500 text-sm">Total Promos</p><p className="text-2xl font-bold text-lotus-dark">{promos.length}</p></div>
            <div className="bg-white rounded-xl p-4 shadow-sm"><p className="text-gray-500 text-sm">Active</p><p className="text-2xl font-bold text-green-600">{activePromoCount}</p></div>
            <div className="bg-white rounded-xl p-4 shadow-sm"><p className="text-gray-500 text-sm">Total Uses</p><p className="text-2xl font-bold text-lotus-gold">{totalUses}</p></div>
          </div>

          {/* Add Button */}
          <div className="flex justify-end">
            <button 
              onClick={() => { setShowPromoForm(true); setEditingPromo(null); setPromoForm({ code: '', discountType: 'percentage', value: 0, minOrder: 0, maxUses: 0, expires: '' }); }} 
              className="px-4 py-2.5 bg-lotus-gold text-white rounded-lg font-medium hover:bg-lotus-gold-dark flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Promo Code
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {promoLoading ? <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-lotus-gold mx-auto" /></div> : promos.length === 0 ? <div className="p-12 text-center text-gray-500">No promo codes yet</div> : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Code</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Discount</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 hidden md:table-cell">Min Order</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Uses</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 hidden md:table-cell">Expires</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                  </tr></thead>
                  <tbody>{promos.map(p => {
                    const st = getStatus(p);
                    return (
                      <tr key={p.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3"><div className="flex items-center gap-2"><Tag className="w-4 h-4 text-lotus-gold" /><code className="font-mono font-bold text-sm text-lotus-dark">{p.code}</code></div></td>
                        <td className="px-4 py-3 text-sm font-medium">{p.discountType === 'percentage' ? `${p.value}%` : `$${p.value}`}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">${p.minOrder || 0}</td>
                        <td className="px-4 py-3 text-sm">{p.uses}{p.maxUses > 0 ? ` / ${p.maxUses}` : ' / ∞'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{p.expires ? new Date(p.expires).toLocaleDateString() : 'Never'}</td>
                        <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[st]}`}>{st.charAt(0).toUpperCase() + st.slice(1)}</span></td>
                        <td className="px-4 py-3"><div className="flex gap-1">
                          <button onClick={() => togglePromo(p)} className="p-1.5 text-gray-400 hover:text-lotus-gold">{p.status === 'disabled' ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}</button>
                          <button onClick={() => { setEditingPromo(p.id); setPromoForm({ code: p.code, discountType: p.discountType, value: p.value, minOrder: p.minOrder, maxUses: p.maxUses, expires: p.expires || '' }); setShowPromoForm(true); }} className="p-1.5 text-gray-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => deletePromo(p.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div></td>
                      </tr>
                    );
                  })}</tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Coupon Form Modal (for Display Offers) */}
      {showCouponForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowCouponForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-lotus-dark">{editingCoupon ? 'Edit' : 'Add'} Special Offer</h3>
              <button onClick={() => setShowCouponForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Offer Code *</label>
                <input 
                  value={couponForm.code} 
                  onChange={e => setCouponForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} 
                  placeholder="e.g. DIMSUM10" 
                  className={inputCls} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea 
                  value={couponForm.description} 
                  onChange={e => setCouponForm(p => ({ ...p, description: e.target.value }))} 
                  placeholder="e.g. Grab 10% off on Dim Sum orders over $50!" 
                  className={inputCls + " min-h-[80px] resize-none"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                <div className="flex gap-2">
                  {(['percentage', 'fixed', 'free_delivery'] as const).map(t => (
                    <button 
                      key={t} 
                      onClick={() => setCouponForm(p => ({ ...p, discountType: t }))} 
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${couponForm.discountType === t ? 'bg-lotus-gold text-white border-lotus-gold' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      {t === 'percentage' ? '% Off' : t === 'fixed' ? '$ Off' : 'Free Delivery'}
                    </button>
                  ))}
                </div>
              </div>
              {couponForm.discountType !== 'free_delivery' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{couponForm.discountType === 'percentage' ? 'Percent Off' : 'Amount Off ($)'}</label>
                    <input 
                      type="number" 
                      value={couponForm.discountValue} 
                      onChange={e => setCouponForm(p => ({ ...p, discountValue: parseFloat(e.target.value) || 0 }))} 
                      className={inputCls} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Order ($)</label>
                    <input 
                      type="number" 
                      value={couponForm.minOrder} 
                      onChange={e => setCouponForm(p => ({ ...p, minOrder: parseFloat(e.target.value) || 0 }))} 
                      className={inputCls} 
                    />
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="couponActive"
                  checked={couponForm.active}
                  onChange={e => setCouponForm(p => ({ ...p, active: e.target.checked }))}
                  className="w-4 h-4 text-lotus-gold rounded focus:ring-lotus-gold"
                />
                <label htmlFor="couponActive" className="text-sm text-gray-700">Active (shown on menu)</label>
              </div>
              <button 
                onClick={saveCoupon} 
                disabled={!couponForm.code || !couponForm.description}
                className="w-full py-2.5 bg-lotus-gold text-white rounded-lg font-medium hover:bg-lotus-gold-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingCoupon ? 'Update' : 'Add'} Special Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promo Form Modal (for Checkout Codes) */}
      {showPromoForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowPromoForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-lotus-dark">{editingPromo ? 'Edit' : 'Create'} Promo Code</h3>
              <button onClick={() => setShowPromoForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Promo Code</label>
                <div className="flex gap-2">
                  <input 
                    value={promoForm.code} 
                    onChange={e => setPromoForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} 
                    placeholder="SUMMER25" 
                    className={inputCls} 
                  />
                  <button 
                    onClick={() => setPromoForm(p => ({ ...p, code: genCode() }))} 
                    className="px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm text-gray-600 shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                <div className="flex gap-2">
                  {['percentage', 'fixed'].map(t => (
                    <button 
                      key={t} 
                      onClick={() => setPromoForm(p => ({ ...p, discountType: t }))} 
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${promoForm.discountType === t ? 'bg-lotus-gold text-white border-lotus-gold' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      {t === 'percentage' ? 'Percentage %' : 'Fixed Amount $'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <input 
                    type="number" 
                    value={promoForm.value} 
                    onChange={e => setPromoForm(p => ({ ...p, value: parseFloat(e.target.value) || 0 }))} 
                    className={inputCls} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Order ($)</label>
                  <input 
                    type="number" 
                    value={promoForm.minOrder} 
                    onChange={e => setPromoForm(p => ({ ...p, minOrder: parseFloat(e.target.value) || 0 }))} 
                    className={inputCls} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses (0 = ∞)</label>
                  <input 
                    type="number" 
                    value={promoForm.maxUses} 
                    onChange={e => setPromoForm(p => ({ ...p, maxUses: parseInt(e.target.value) || 0 }))} 
                    className={inputCls} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expires</label>
                  <input 
                    type="date" 
                    value={promoForm.expires} 
                    onChange={e => setPromoForm(p => ({ ...p, expires: e.target.value }))} 
                    className={inputCls} 
                  />
                </div>
              </div>
              <button 
                onClick={savePromo} 
                className="w-full py-2.5 bg-lotus-gold text-white rounded-lg font-medium hover:bg-lotus-gold-dark"
              >
                {editingPromo ? 'Update' : 'Create'} Promo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
