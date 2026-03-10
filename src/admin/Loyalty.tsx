import { useState, useEffect } from 'react';
import { TrendingUp, Gift, Users, Search, Loader2, Save } from 'lucide-react';

interface LeaderUser { id: string; name: string; email: string; loyaltyPoints: number }

export default function AdminLoyalty() {
  const [settings, setSettings] = useState({ earnRate: 1, earnPer: 1, redeemRate: 100, redeemValue: 1 });
  const [leaderboard, setLeaderboard] = useState<LeaderUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [adjustSearch, setAdjustSearch] = useState('');
  const [adjustUser, setAdjustUser] = useState<LeaderUser | null>(null);
  const [adjustPoints, setAdjustPoints] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin?action=loyalty-settings').then(r => r.json()),
      fetch('/api/admin?action=loyalty-leaderboard').then(r => r.json()),
    ]).then(([s, lb]) => { setSettings(s); setLeaderboard(lb); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    await fetch('/api/admin?action=loyalty-settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const applyAdjustment = async () => {
    if (!adjustUser || adjustPoints === 0) return;
    setAdjusting(true);
    await fetch('/api/admin?action=loyalty-adjust', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: adjustUser.id, points: adjustPoints, reason: adjustReason }) });
    setAdjusting(false); setAdjustUser(null); setAdjustPoints(0); setAdjustReason('');
    const lb = await fetch('/api/admin?action=loyalty-leaderboard').then(r => r.json());
    setLeaderboard(lb);
  };

  const totalIssued = leaderboard.reduce((s, u) => s + Math.max(0, u.loyaltyPoints), 0);
  const activeMembers = leaderboard.filter(u => u.loyaltyPoints > 0).length;

  const statCards = [
    { label: 'Total Points Issued', value: totalIssued.toLocaleString(), icon: TrendingUp, color: 'bg-blue-500' },
    { label: 'Active Members', value: activeMembers, icon: Users, color: 'bg-green-500' },
    { label: 'Points Outstanding', value: `$${(totalIssued * (settings.redeemValue / settings.redeemRate)).toFixed(0)}`, icon: Gift, color: 'bg-purple-500' },
  ];

  const inputCls = "w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold focus:border-transparent";

  if (loading) return <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-lotus-gold mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-lotus-dark">Loyalty Points</h1><p className="text-gray-600">Manage rewards program</p></div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map(s => { const Icon = s.icon; return (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-gray-500 text-sm">{s.label}</p><p className="text-2xl font-bold text-lotus-dark">{s.value}</p></div><div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center`}><Icon className="w-5 h-5 text-white" /></div></div></div>
        ); })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-lotus-dark mb-4">Points Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-gray-600">Earn</span>
              <input type="number" value={settings.earnRate} onChange={e => setSettings(p => ({ ...p, earnRate: parseInt(e.target.value) || 0 }))} className="w-20 px-3 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-lotus-gold" />
              <span className="text-sm text-gray-600">point(s) per $</span>
              <input type="number" value={settings.earnPer} onChange={e => setSettings(p => ({ ...p, earnPer: parseInt(e.target.value) || 0 }))} className="w-20 px-3 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-lotus-gold" />
              <span className="text-sm text-gray-600">spent</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-gray-600">Redeem</span>
              <input type="number" value={settings.redeemRate} onChange={e => setSettings(p => ({ ...p, redeemRate: parseInt(e.target.value) || 0 }))} className="w-20 px-3 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-lotus-gold" />
              <span className="text-sm text-gray-600">points = $</span>
              <input type="number" value={settings.redeemValue} onChange={e => setSettings(p => ({ ...p, redeemValue: parseInt(e.target.value) || 0 }))} className="w-20 px-3 py-2 border rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-lotus-gold" />
              <span className="text-sm text-gray-600">off</span>
            </div>
            <button onClick={saveSettings} disabled={saving} className="px-6 py-2.5 bg-lotus-gold text-white rounded-lg font-medium hover:bg-lotus-gold-dark disabled:opacity-50 flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{saved ? 'Saved!' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Manual Adjustment */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-lotus-dark mb-4">Manual Adjustment</h2>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input value={adjustSearch} onChange={e => setAdjustSearch(e.target.value)} placeholder="Search user by name or email..." className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold" />
            </div>
            {adjustSearch.length >= 2 && (
              <div className="border rounded-lg max-h-32 overflow-y-auto">
                {leaderboard.filter(u => u.name.toLowerCase().includes(adjustSearch.toLowerCase()) || u.email.toLowerCase().includes(adjustSearch.toLowerCase())).slice(0, 5).map(u => (
                  <button key={u.id} onClick={() => { setAdjustUser(u); setAdjustSearch(''); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm text-left">
                    <span className="font-medium text-lotus-dark">{u.name}</span><span className="text-gray-400">{u.email}</span><span className="ml-auto text-lotus-gold">{u.loyaltyPoints} pts</span>
                  </button>
                ))}
              </div>
            )}
            {adjustUser && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm font-medium text-lotus-dark">{adjustUser.name} — {adjustUser.loyaltyPoints} points</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Points (+/-)</label><input type="number" value={adjustPoints} onChange={e => setAdjustPoints(parseInt(e.target.value) || 0)} className={inputCls} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Reason</label><input value={adjustReason} onChange={e => setAdjustReason(e.target.value)} placeholder="Bonus, correction..." className={inputCls} /></div>
            </div>
            <button onClick={applyAdjustment} disabled={!adjustUser || adjustPoints === 0 || adjusting} className="w-full py-2.5 bg-lotus-gold text-white rounded-lg font-medium hover:bg-lotus-gold-dark disabled:opacity-50">
              {adjusting ? 'Applying...' : 'Apply Adjustment'}
            </button>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-lotus-dark mb-4">Points Leaderboard — Top 20</h2>
        {leaderboard.length === 0 ? <p className="text-gray-500 text-center py-6">No users with points</p> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Rank</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">User</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Points Balance</th>
              </tr></thead>
              <tbody>{leaderboard.map((u, i) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3"><span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i < 3 ? 'bg-lotus-gold text-white' : 'bg-gray-100 text-gray-600'}`}>{i + 1}</span></td>
                  <td className="px-4 py-3"><p className="font-medium text-lotus-dark text-sm">{u.name}</p><p className="text-xs text-gray-500">{u.email}</p></td>
                  <td className="px-4 py-3"><span className="font-bold text-lotus-gold">{u.loyaltyPoints.toLocaleString()}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
