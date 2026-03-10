import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Loader2, MapPin, Clock } from 'lucide-react';

interface Rider { id: string; name: string; phone: string; photo: string; status: string; totalDeliveries: number; todayDeliveries: number }
interface Zone { id: string; name: string; fee: number; minOrderFree: number; estimatedTime: string }

export default function AdminDelivery() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRiderForm, setShowRiderForm] = useState(false);
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [riderForm, setRiderForm] = useState({ name: '', phone: '', photo: '' });
  const [zoneForm, setZoneForm] = useState({ name: '', fee: 0, minOrderFree: 0, estimatedTime: '' });
  const [editingRider, setEditingRider] = useState<string | null>(null);
  const [editingZone, setEditingZone] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [r, z] = await Promise.all([fetch('/api/admin?action=riders').then(r => r.json()), fetch('/api/admin?action=zones').then(r => r.json())]);
      setRiders(r); setZones(z);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const saveRider = async () => {
    if (editingRider) {
      await fetch(`/api/admin?action=riders&id=${editingRider}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(riderForm) });
    } else {
      await fetch('/api/admin?action=riders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(riderForm) });
    }
    setShowRiderForm(false); setEditingRider(null); setRiderForm({ name: '', phone: '', photo: '' }); fetchAll();
  };

  const deleteRider = async (id: string) => { await fetch(`/api/admin?action=riders&id=${id}`, { method: 'DELETE' }); fetchAll(); };

  const toggleRiderStatus = async (rider: Rider) => {
    const next = rider.status === 'available' ? 'off_duty' : 'available';
    await fetch(`/api/admin?action=riders&id=${rider.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) });
    fetchAll();
  };

  const saveZone = async () => {
    if (editingZone) {
      await fetch(`/api/admin?action=zones&id=${editingZone}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(zoneForm) });
    } else {
      await fetch('/api/admin?action=zones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(zoneForm) });
    }
    setShowZoneForm(false); setEditingZone(null); setZoneForm({ name: '', fee: 0, minOrderFree: 0, estimatedTime: '' }); fetchAll();
  };

  const deleteZone = async (id: string) => { await fetch(`/api/admin?action=zones&id=${id}`, { method: 'DELETE' }); fetchAll(); };

  const riderStatusColors: Record<string, string> = { available: 'bg-green-100 text-green-700', on_delivery: 'bg-orange-100 text-orange-700', off_duty: 'bg-gray-100 text-gray-600' };
  const riderStatusLabels: Record<string, string> = { available: 'Available', on_delivery: 'On Delivery', off_duty: 'Off Duty' };

  const inputCls = "w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold focus:border-transparent";

  if (loading) return <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-lotus-gold mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-lotus-dark">Delivery Management</h1><p className="text-gray-600">Manage riders and delivery zones</p></div>

      {/* Riders */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-lotus-dark">Delivery Riders</h2>
          <button onClick={() => { setShowRiderForm(true); setEditingRider(null); setRiderForm({ name: '', phone: '', photo: '' }); }} className="px-4 py-2 bg-lotus-gold text-white rounded-lg text-sm font-medium hover:bg-lotus-gold-dark transition-colors flex items-center gap-2"><Plus className="w-4 h-4" /> Add Rider</button>
        </div>
        {riders.length === 0 ? <p className="text-gray-500 text-center py-6">No riders yet</p> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {riders.map(r => (
              <div key={r.id} className="border rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-lotus-gold to-orange-400 rounded-full flex items-center justify-center text-white font-bold">{r.name[0]?.toUpperCase()}</div>
                  <div className="flex-1"><p className="font-medium text-lotus-dark">{r.name}</p><p className="text-sm text-gray-500">{r.phone}</p></div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${riderStatusColors[r.status] || 'bg-gray-100'}`}>{riderStatusLabels[r.status] || r.status}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>Today: {r.todayDeliveries}</span><span>Total: {r.totalDeliveries}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleRiderStatus(r)} className="flex-1 py-2 border rounded-lg text-sm hover:bg-gray-50">{r.status === 'available' ? 'Set Off Duty' : 'Set Available'}</button>
                  <button onClick={() => { setEditingRider(r.id); setRiderForm({ name: r.name, phone: r.phone, photo: r.photo }); setShowRiderForm(true); }} className="p-2 text-gray-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => deleteRider(r.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delivery Zones */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-lotus-dark">Delivery Zones</h2>
          <button onClick={() => { setShowZoneForm(true); setEditingZone(null); setZoneForm({ name: '', fee: 0, minOrderFree: 0, estimatedTime: '' }); }} className="px-4 py-2 bg-lotus-gold text-white rounded-lg text-sm font-medium hover:bg-lotus-gold-dark transition-colors flex items-center gap-2"><Plus className="w-4 h-4" /> Add Zone</button>
        </div>
        {zones.length === 0 ? <p className="text-gray-500 text-center py-6">No zones yet</p> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Zone</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Fee</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Free Delivery Min</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Est. Time</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
              </tr></thead>
              <tbody>{zones.map(z => (
                <tr key={z.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-lotus-dark flex items-center gap-2"><MapPin className="w-4 h-4 text-lotus-gold" />{z.name}</td>
                  <td className="px-4 py-3 text-sm">${z.fee?.toFixed(2) || '0.00'}</td>
                  <td className="px-4 py-3 text-sm">${z.minOrderFree || 0}</td>
                  <td className="px-4 py-3 text-sm flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gray-400" />{z.estimatedTime || '—'}</td>
                  <td className="px-4 py-3"><div className="flex gap-1">
                    <button onClick={() => { setEditingZone(z.id); setZoneForm({ name: z.name, fee: z.fee, minOrderFree: z.minOrderFree, estimatedTime: z.estimatedTime }); setShowZoneForm(true); }} className="p-1.5 text-gray-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => deleteZone(z.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rider Form Modal */}
      {showRiderForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/30" onClick={() => setShowRiderForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-lotus-dark">{editingRider ? 'Edit' : 'Add'} Rider</h3><button onClick={() => setShowRiderForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button></div>
            <div className="space-y-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input value={riderForm.name} onChange={e => setRiderForm(p => ({ ...p, name: e.target.value }))} className={inputCls} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input value={riderForm.phone} onChange={e => setRiderForm(p => ({ ...p, phone: e.target.value }))} className={inputCls} /></div>
              <button onClick={saveRider} className="w-full py-2.5 bg-lotus-gold text-white rounded-lg font-medium hover:bg-lotus-gold-dark">{editingRider ? 'Update' : 'Add'} Rider</button>
            </div>
          </div>
        </div>
      )}

      {/* Zone Form Modal */}
      {showZoneForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/30" onClick={() => setShowZoneForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-lotus-dark">{editingZone ? 'Edit' : 'Add'} Zone</h3><button onClick={() => setShowZoneForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button></div>
            <div className="space-y-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Zone Name</label><input value={zoneForm.name} onChange={e => setZoneForm(p => ({ ...p, name: e.target.value }))} placeholder="Downtown" className={inputCls} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee ($)</label><input type="number" step="0.01" value={zoneForm.fee} onChange={e => setZoneForm(p => ({ ...p, fee: parseFloat(e.target.value) || 0 }))} className={inputCls} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Min Order for Free Delivery ($)</label><input type="number" value={zoneForm.minOrderFree} onChange={e => setZoneForm(p => ({ ...p, minOrderFree: parseFloat(e.target.value) || 0 }))} className={inputCls} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time</label><input value={zoneForm.estimatedTime} onChange={e => setZoneForm(p => ({ ...p, estimatedTime: e.target.value }))} placeholder="20-30 min" className={inputCls} /></div>
              <button onClick={saveZone} className="w-full py-2.5 bg-lotus-gold text-white rounded-lg font-medium hover:bg-lotus-gold-dark">{editingZone ? 'Update' : 'Add'} Zone</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
