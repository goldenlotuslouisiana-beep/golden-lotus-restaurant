import { useState, useEffect } from 'react';
import { Tag, Plus, Edit, Trash2, X, Loader2, Copy, ToggleLeft, ToggleRight } from 'lucide-react';

interface Promo { id: string; code: string; discountType: string; value: number; minOrder: number; maxUses: number; uses: number; expires: string; status: string; createdAt: string }

const statusColors: Record<string, string> = { active: 'bg-green-100 text-green-700', expired: 'bg-red-100 text-red-700', disabled: 'bg-gray-100 text-gray-600' };

function genCode() { return 'GL' + Math.random().toString(36).substring(2, 8).toUpperCase(); }

export default function AdminPromos() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ code: '', discountType: 'percentage', value: 0, minOrder: 0, maxUses: 0, expires: '' });

  const fetchPromos = async () => {
    setLoading(true);
    try { const r = await fetch('/api/admin?action=promos'); setPromos(await r.json()); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchPromos(); }, []);

  const getStatus = (p: Promo) => {
    if (p.status === 'disabled') return 'disabled';
    if (p.expires && new Date(p.expires) < new Date()) return 'expired';
    if (p.maxUses > 0 && p.uses >= p.maxUses) return 'expired';
    return 'active';
  };

  const savePromo = async () => {
    if (editing) {
      await fetch(`/api/admin?action=promos&id=${editing}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    } else {
      await fetch('/api/admin?action=promos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setShowForm(false); setEditing(null); setForm({ code: '', discountType: 'percentage', value: 0, minOrder: 0, maxUses: 0, expires: '' }); fetchPromos();
  };

  const togglePromo = async (p: Promo) => {
    const newStatus = p.status === 'disabled' ? 'active' : 'disabled';
    await fetch(`/api/admin?action=promos&id=${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
    fetchPromos();
  };

  const deletePromo = async (id: string) => { await fetch(`/api/admin?action=promos&id=${id}`, { method: 'DELETE' }); fetchPromos(); };

  const inputCls = "w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold focus:border-transparent";

  const activeCount = promos.filter(p => getStatus(p) === 'active').length;
  const totalUses = promos.reduce((s, p) => s + p.uses, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-lotus-dark">Promo Codes</h1><p className="text-gray-600">Manage discounts and promotions</p></div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ code: '', discountType: 'percentage', value: 0, minOrder: 0, maxUses: 0, expires: '' }); }} className="px-4 py-2.5 bg-lotus-gold text-white rounded-lg font-medium hover:bg-lotus-gold-dark flex items-center gap-2"><Plus className="w-4 h-4" /> Create Promo</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm"><p className="text-gray-500 text-sm">Total Promos</p><p className="text-2xl font-bold text-lotus-dark">{promos.length}</p></div>
        <div className="bg-white rounded-xl p-4 shadow-sm"><p className="text-gray-500 text-sm">Active</p><p className="text-2xl font-bold text-green-600">{activeCount}</p></div>
        <div className="bg-white rounded-xl p-4 shadow-sm"><p className="text-gray-500 text-sm">Total Uses</p><p className="text-2xl font-bold text-lotus-gold">{totalUses}</p></div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-lotus-gold mx-auto" /></div> : promos.length === 0 ? <div className="p-12 text-center text-gray-500">No promo codes yet</div> : (
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
                      <button onClick={() => { setEditing(p.id); setForm({ code: p.code, discountType: p.discountType, value: p.value, minOrder: p.minOrder, maxUses: p.maxUses, expires: p.expires || '' }); setShowForm(true); }} className="p-1.5 text-gray-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => deletePromo(p.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div></td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/30" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-lotus-dark">{editing ? 'Edit' : 'Create'} Promo Code</h3><button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button></div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Promo Code</label>
                <div className="flex gap-2"><input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="SUMMER25" className={inputCls} /><button onClick={() => setForm(p => ({ ...p, code: genCode() }))} className="px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm text-gray-600 shrink-0"><Copy className="w-4 h-4" /></button></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                <div className="flex gap-2">
                  {['percentage', 'fixed'].map(t => (<button key={t} onClick={() => setForm(p => ({ ...p, discountType: t }))} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${form.discountType === t ? 'bg-lotus-gold text-white border-lotus-gold' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>{t === 'percentage' ? 'Percentage %' : 'Fixed Amount $'}</button>))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Value</label><input type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: parseFloat(e.target.value) || 0 }))} className={inputCls} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Min Order ($)</label><input type="number" value={form.minOrder} onChange={e => setForm(p => ({ ...p, minOrder: parseFloat(e.target.value) || 0 }))} className={inputCls} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Max Uses (0 = ∞)</label><input type="number" value={form.maxUses} onChange={e => setForm(p => ({ ...p, maxUses: parseInt(e.target.value) || 0 }))} className={inputCls} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Expires</label><input type="date" value={form.expires} onChange={e => setForm(p => ({ ...p, expires: e.target.value }))} className={inputCls} /></div>
              </div>
              <button onClick={savePromo} className="w-full py-2.5 bg-lotus-gold text-white rounded-lg font-medium hover:bg-lotus-gold-dark">{editing ? 'Update' : 'Create'} Promo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
