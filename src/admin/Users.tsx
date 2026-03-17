import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminFetch } from '@/lib/adminFetch';
import { Search, Users as UsersIcon, UserPlus, Shield, ShieldOff, Eye, X, ChevronLeft, ChevronRight, ShoppingBag, MapPin, Clock, Loader2, Trash2 } from 'lucide-react';

interface UserRow {
  id: string; name: string; email: string; phone: string; avatar: string;
  createdAt: string; status: string; loyaltyPoints: number; totalOrders: number; totalSpent: number;
}
interface UserDetail {
  user: UserRow & { savedAddresses?: any[]; lastLogin?: string };
  orders: { id: string; orderNumber: string; items: any[]; total: number; status: string; createdAt: string; paymentMethod: string }[];
}

const statusBadge = (s: string) => s === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700';

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, newToday: 0, activeWeek: 0, blocked: 0 });
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<'orders' | 'addresses' | 'activity'>('orders');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`/api/admin?action=users&page=${page}&search=${encodeURIComponent(search)}&status=${filter}`);
      const data = await res.json();
      setUsers(data.users || []); setTotalPages(data.totalPages || 1);
    } catch {} finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const res = await adminFetch('/api/admin?action=dashboard-stats');
      const d = await res.json();
      setStats({ total: d.totalUsers || 0, newToday: d.newUsersToday || 0, activeWeek: d.activeUsersWeek || 0, blocked: d.blockedUsers || 0 });
    } catch {}
  };

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { fetchUsers(); }, [page, search, filter]);

  const openDetail = async (userId: string) => {
    setDetailLoading(true); setDetail(null); setDetailTab('orders');
    try {
      const res = await adminFetch(`/api/admin?action=user-detail&id=${userId}`);
      const data = await res.json();
      setDetail(data);
    } catch {} finally { setDetailLoading(false); }
  };

  const updateUserStatus = async (userId: string, status: string) => {
    await adminFetch(`/api/admin?action=user-detail&id=${userId}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    fetchUsers(); fetchStats();
    if (detail?.user.id === userId) setDetail(d => d ? { ...d, user: { ...d.user, status } } : null);
  };

  const deleteUser = async (userId: string) => {
    await adminFetch(`/api/admin?action=user-detail&id=${userId}`, { method: 'DELETE' });
    setDetail(null); setConfirmDelete(false); fetchUsers(); fetchStats();
  };

  const statCards = [
    { label: 'Total Users', value: stats.total, icon: UsersIcon, color: 'bg-blue-500' },
    { label: 'New Today', value: stats.newToday, icon: UserPlus, color: 'bg-green-500' },
    { label: 'Active This Week', value: stats.activeWeek, icon: Shield, color: 'bg-purple-500' },
    { label: 'Blocked', value: stats.blocked, icon: ShieldOff, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-lotus-dark">Users</h1><p className="text-gray-600">Manage registered customers</p></div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => {
          const Icon = s.icon;
          return (<div key={s.label} className="bg-white rounded-xl p-4 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-gray-500 text-sm">{s.label}</p><p className="text-2xl font-bold text-lotus-dark">{s.value}</p></div><div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center`}><Icon className="w-5 h-5 text-white" /></div></div></div>);
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name, email, phone..." className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold focus:border-transparent" />
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'blocked'].map(f => (
              <button key={f} onClick={() => { setFilter(f); setPage(1); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-lotus-gold text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-lotus-gold mx-auto" /></div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">User</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 hidden md:table-cell">Phone</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 hidden lg:table-cell">Joined</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Orders</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 hidden md:table-cell">Spent</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 hidden lg:table-cell">Points</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
              </tr></thead>
              <tbody>
                {users.map((u: any) => {
                  const displayName = u.fullName || u.name || u.displayName || u.email?.split('@')[0] || 'Unknown User';
                  const initials = displayName.slice(0, 2).toUpperCase();
                  
                  return (
                  <tr key={u.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-9 h-9 bg-gradient-to-br from-lotus-gold to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">{initials}</div><div><p className="font-medium text-lotus-dark text-sm">{displayName}</p><p className="text-xs text-gray-500">{u.email}</p></div></div></td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{u.phone || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm font-medium text-lotus-dark">{u.totalOrders || 0}</td>
                    <td className="px-4 py-3 text-sm font-medium text-lotus-dark hidden md:table-cell">${(u.totalSpent || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-lotus-gold font-medium hidden lg:table-cell">{u.loyaltyPoints || 0}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge(u.status)}`}>{u.status === 'blocked' ? 'Blocked' : 'Active'}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openDetail(u.id)} className="p-1.5 text-gray-400 hover:text-lotus-gold transition-colors"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => updateUserStatus(u.id, u.status === 'blocked' ? 'active' : 'blocked')} className={`p-1.5 transition-colors ${u.status === 'blocked' ? 'text-green-500 hover:text-green-700' : 'text-red-400 hover:text-red-600'}`}>
                          {u.status === 'blocked' ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Slide Panel */}
      {(detail || detailLoading) && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => { setDetail(null); setConfirmDelete(false); }} />
          <div className="relative w-full max-w-lg bg-white shadow-xl overflow-y-auto">
            {detailLoading ? (
              <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-lotus-gold mx-auto" /></div>
            ) : detail ? (
              <div>
                <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
                  <h2 className="text-lg font-bold text-lotus-dark">User Details</h2>
                  <button onClick={() => { setDetail(null); setConfirmDelete(false); }} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                </div>

                {/* User Header */}
                <div className="p-6 border-b">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-lotus-gold to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {((detail.user as any).fullName || detail.user.name || (detail.user as any).displayName || detail.user.email?.split('@')[0] || 'Unknown').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-lotus-dark">{(detail.user as any).fullName || detail.user.name || (detail.user as any).displayName || detail.user.email?.split('@')[0] || 'Unknown User'}</h3>
                      <p className="text-sm text-gray-500">{detail.user.email}</p>
                      <p className="text-sm text-gray-500">{detail.user.phone || '—'}</p>
                    </div>
                    <span className={`ml-auto text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge(detail.user.status)}`}>{detail.user.status === 'blocked' ? 'Blocked' : 'Active'}</span>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-3 p-4 border-b">
                  {[
                    { label: 'Orders', value: detail.orders.length },
                    { label: 'Spent', value: `$${detail.orders.reduce((s, o) => s + o.total, 0).toFixed(0)}` },
                    { label: 'Points', value: detail.user.loyaltyPoints || 0 },
                    { label: 'Addresses', value: detail.user.savedAddresses?.length || 0 },
                  ].map(s => (<div key={s.label} className="text-center"><p className="text-lg font-bold text-lotus-dark">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>))}
                </div>

                {/* Tabs */}
                <div className="flex border-b">{(['orders', 'addresses', 'activity'] as const).map(t => (
                  <button key={t} onClick={() => setDetailTab(t)} className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${detailTab === t ? 'border-lotus-gold text-lotus-gold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t === 'orders' ? 'Order History' : t === 'addresses' ? 'Addresses' : 'Activity'}</button>
                ))}</div>

                <div className="p-4 space-y-3">
                  {detailTab === 'orders' && (detail.orders.length === 0 ? <p className="text-gray-500 text-center py-6">No orders</p> : detail.orders.map(o => (
                    <Link key={o.id} to={`/admin/orders/${o.id}`} onClick={() => setDetail(null)} className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between">
                        <div><p className="font-medium text-sm text-lotus-dark">{o.orderNumber}</p><p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString()} · {o.items.length} items</p></div>
                        <div className="text-right"><p className="font-medium text-lotus-gold text-sm">${o.total.toFixed(2)}</p><span className={`text-xs px-2 py-0.5 rounded-full ${o.status === 'delivered' ? 'bg-green-100 text-green-700' : o.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{o.status}</span></div>
                      </div>
                    </Link>
                  )))}
                  {detailTab === 'addresses' && (
                    (detail.user.savedAddresses?.length || 0) === 0 ? <p className="text-gray-500 text-center py-6">No saved addresses</p> :
                    detail.user.savedAddresses?.map((a: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="w-5 h-5 text-lotus-gold mt-0.5 shrink-0" />
                        <div><p className="font-medium text-sm text-lotus-dark">{a.label || 'Address'}</p><p className="text-xs text-gray-500">{a.street}{a.apt ? `, ${a.apt}` : ''}, {a.city}, {a.state} {a.zip}</p></div>
                      </div>
                    ))
                  )}
                  {detailTab === 'activity' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"><Clock className="w-5 h-5 text-blue-500" /><div><p className="text-sm font-medium text-lotus-dark">Account Created</p><p className="text-xs text-gray-500">{new Date(detail.user.createdAt).toLocaleString()}</p></div></div>
                      {detail.user.lastLogin && <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"><Clock className="w-5 h-5 text-green-500" /><div><p className="text-sm font-medium text-lotus-dark">Last Login</p><p className="text-xs text-gray-500">{new Date(detail.user.lastLogin).toLocaleString()}</p></div></div>}
                      {detail.orders.length > 0 && <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"><ShoppingBag className="w-5 h-5 text-orange-500" /><div><p className="text-sm font-medium text-lotus-dark">Last Order</p><p className="text-xs text-gray-500">{new Date(detail.orders[0].createdAt).toLocaleString()}</p></div></div>}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-4 border-t space-y-2">
                  <button onClick={() => updateUserStatus(detail.user.id, detail.user.status === 'blocked' ? 'active' : 'blocked')} className={`w-full py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 ${detail.user.status === 'blocked' ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200' : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'}`}>
                    {detail.user.status === 'blocked' ? <><Shield className="w-4 h-4" /> Unblock User</> : <><ShieldOff className="w-4 h-4" /> Block User</>}
                  </button>
                  {!confirmDelete ? (
                    <button onClick={() => setConfirmDelete(true)} className="w-full py-2.5 rounded-lg font-medium text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 flex items-center justify-center gap-2"><Trash2 className="w-4 h-4" /> Delete Account</button>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                      <p className="text-sm text-red-700 mb-2">Are you sure? This cannot be undone.</p>
                      <div className="flex gap-2">
                        <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2 border rounded-lg text-sm hover:bg-white">Cancel</button>
                        <button onClick={() => deleteUser(detail.user.id)} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
