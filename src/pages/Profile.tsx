import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, ShoppingBag, Star, Loader2, Plus, Trash2, Edit, Check, Package, ChevronDown, ChevronUp, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import SEO from '@/components/SEO';

type Tab = 'personal' | 'addresses' | 'orders' | 'loyalty';

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'personal', label: 'Personal Info', icon: User },
    { key: 'addresses', label: 'My Addresses', icon: MapPin },
    { key: 'orders', label: 'Order History', icon: ShoppingBag },
    { key: 'loyalty', label: 'Loyalty Points', icon: Star },
];

interface Address { id: string; label: string; street: string; apt: string; city: string; state: string; zip: string; isDefault: boolean }
interface OrderItem { name: string; price: number; quantity: number }
interface Order { id: string; orderNumber: string; createdAt: string; items: OrderItem[]; total: number; status: string; paymentMethod: string; orderType: string }
interface LoyaltyEntry { date: string; orderId: string; action: string; points: number }

export default function Profile() {
    const { user: authUser, token, isLoggedIn, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState<Tab>('personal');
    const [profileData, setProfileData] = useState({
        fullName: authUser?.name || '',
        email: authUser?.email || '',
        phone: authUser?.phone || '',
        dateOfBirth: '',
        avatar: authUser?.avatar || ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => { if (!isLoggedIn) navigate('/login?redirect=/profile'); }, [isLoggedIn, navigate]);

    useEffect(() => {
        if (isLoggedIn && token) {
            fetchProfile();
        }
    }, [isLoggedIn, token]);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/users?action=profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const user = data.user || data;
                setProfileData({
                    fullName: user.fullName || user.name || user.full_name || '',
                    email: user.email || '',
                    phone: user.phone || user.phoneNumber || user.phone_number || '',
                    dateOfBirth: user.dateOfBirth || user.dob || '',
                    avatar: user.avatar || user.photo || ''
                });
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            const saved = localStorage.getItem('user_data');
            if (saved) {
                const user = JSON.parse(saved);
                setProfileData({
                    fullName: user.fullName || user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    dateOfBirth: user.dateOfBirth || '',
                    avatar: user.avatar || ''
                });
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isLoggedIn || !authUser) return null;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-28 pb-16 px-4">
                <div className="max-w-5xl mx-auto animate-pulse">
                    <div className="h-32 bg-orange-200 rounded-2xl mb-6" />
                    <div className="grid lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-1 h-64 bg-gray-200 rounded-2xl" />
                        <div className="lg:col-span-3 h-96 bg-gray-200 rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <SEO 
                title="My Profile | Golden Lotus Rewards"
                description="Manage your Golden Lotus account. View order history, update personal information, track loyalty points, and manage saved addresses."
                url="https://www.goldenlotusgrill.com/profile"
                noIndex={true}
            />
        <div className="min-h-screen bg-gray-50 pt-28 pb-16 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-[#F97316] to-[#ea6c10] rounded-2xl p-6 mb-6 text-white shadow-lg shadow-orange-200/50">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                            {profileData.fullName?.charAt(0).toUpperCase() || profileData.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold">{profileData.fullName || 'Welcome!'}</h1>
                            <p className="opacity-90 text-sm">{profileData.email}</p>
                        </div>
                        <button onClick={() => { logout(); navigate('/'); }} className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"><LogOut className="w-5 h-5" /></button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Sidebar Tabs */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex lg:flex-col gap-1 overflow-x-auto">
                            {TABS.map((t) => {
                                const Icon = t.icon;
                                return (
                                    <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${tab === t.key ? 'bg-[#F97316] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
                                        <Icon className="w-4 h-4" />{t.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        {tab === 'personal' && <PersonalInfo profileData={profileData} setProfileData={setProfileData} token={token} updateUser={updateUser} />}
                        {tab === 'addresses' && <Addresses token={token} />}
                        {tab === 'orders' && <OrderHistory token={token} />}
                        {tab === 'loyalty' && <LoyaltyPoints token={token} userPoints={authUser.loyaltyPoints || 0} />}
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

// ─── PERSONAL INFO TAB ───
function PersonalInfo({ profileData, setProfileData, token, updateUser }: { profileData: any; setProfileData: any; token: string | null; updateUser: (d: Record<string, string>) => void }) {
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const save = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/users?action=update-profile', { 
                method: 'PATCH', 
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, 
                body: JSON.stringify({
                    fullName: profileData.fullName,
                    phone: profileData.phone,
                    dateOfBirth: profileData.dateOfBirth
                }) 
            });
            
            if (res.ok) {
                updateUser({ name: profileData.fullName, fullName: profileData.fullName, phone: profileData.phone } as any);
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        } catch { 
            console.error('Failed to update profile');
        } finally { 
            setSaving(false); 
        }
    };

    const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent bg-gray-50 focus:bg-white transition-all";

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 space-y-5">
            <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>

            <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-[#F97316] to-[#ea6c10] rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {profileData.fullName?.charAt(0).toUpperCase() || profileData.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <button className="text-sm text-[#F97316] hover:underline font-medium">Upload Photo</button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                    <input type="text" value={profileData.fullName} onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })} placeholder="Enter your full name" className={inputCls} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input type="email" value={profileData.email} disabled className={inputCls + ' opacity-60 cursor-not-allowed bg-gray-50'} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                    <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} placeholder="(555) 123-4567" className={inputCls} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
                    <input type="date" value={profileData.dateOfBirth} onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })} className={inputCls} />
                </div>
            </div>

            <button onClick={save} disabled={saving} className="px-8 py-3 bg-gradient-to-r from-[#F97316] to-[#ea6c10] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-200 transition-all disabled:opacity-50 flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <><Check className="w-4 h-4" /> Saved!</> : 'Save Changes'}
            </button>
        </div>
    );
}

// ─── ADDRESSES TAB ───
function Addresses({ token }: { token: string | null }) {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ label: 'Home', street: '', apt: '', city: '', state: '', zip: '' });

    useEffect(() => {
        fetch('/api/users?action=addresses', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(setAddresses).catch(() => { }).finally(() => setLoading(false));
    }, [token]);

    const addAddress = async () => {
        const res = await fetch('/api/users?action=addresses', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
        if (res.ok) { const addr = await res.json(); setAddresses(p => [...p, addr]); setShowForm(false); setForm({ label: 'Home', street: '', apt: '', city: '', state: '', zip: '' }); }
    };

    const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent bg-gray-50 focus:bg-white transition-all";

    if (loading) return <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100"><Loader2 className="w-8 h-8 animate-spin text-[#F97316] mx-auto" /></div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 space-y-5">
            <div className="flex items-center justify-between"><h2 className="text-xl font-bold text-gray-900">My Addresses</h2><button onClick={() => setShowForm(!showForm)} className="text-sm text-[#F97316] hover:underline font-medium flex items-center gap-1"><Plus className="w-4 h-4" /> Add New</button></div>

            {addresses.length === 0 && !showForm && (
                <div className="text-center py-8"><MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No saved addresses</p></div>
            )}

            <div className="space-y-3">
                {addresses.map((a) => (
                    <div key={a.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0"><MapPin className="w-5 h-5 text-[#F97316]" /></div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2"><span className="font-medium text-gray-900">{a.label}</span>{a.isDefault && <span className="text-xs bg-[#F97316] text-white px-2 py-0.5 rounded-full">Default</span>}</div>
                            <p className="text-sm text-gray-600">{a.street}{a.apt ? `, ${a.apt}` : ''}, {a.city}, {a.state} {a.zip}</p>
                        </div>
                        <div className="flex gap-1"><button className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Edit className="w-4 h-4" /></button><button className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button></div>
                    </div>
                ))}
            </div>

            {showForm && (
                <div className="border border-[#F97316]/30 rounded-xl p-4 bg-orange-50/30 space-y-3">
                    <div className="flex gap-2">{['Home', 'Office', 'Other'].map(l => (<button key={l} onClick={() => setForm(p => ({ ...p, label: l }))} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${form.label === l ? 'bg-[#F97316] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{l}</button>))}</div>
                    <input value={form.street} onChange={e => setForm(p => ({ ...p, street: e.target.value }))} placeholder="Street Address" className={inputCls} />
                    <div className="grid grid-cols-2 gap-3">
                        <input value={form.apt} onChange={e => setForm(p => ({ ...p, apt: e.target.value }))} placeholder="Apt" className={inputCls} />
                        <input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="City" className={inputCls} />
                        <input value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} placeholder="State" className={inputCls} />
                        <input value={form.zip} onChange={e => setForm(p => ({ ...p, zip: e.target.value }))} placeholder="ZIP" className={inputCls} />
                    </div>
                    <div className="flex gap-2"><button onClick={addAddress} className="px-6 py-2.5 bg-[#F97316] text-white rounded-xl font-medium text-sm hover:bg-[#ea6c10] transition-colors">Save Address</button><button onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">Cancel</button></div>
                </div>
            )}
        </div>
    );
}

// ─── ORDER HISTORY TAB ───
function OrderHistory({ token }: { token: string | null }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);

    const fetchOrderHistory = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/orders?action=history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) {
          setOrders([]);
          return;
        }
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
        fetchOrderHistory();
    }, []);

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700', preparing: 'bg-purple-100 text-purple-700',
        ready: 'bg-indigo-100 text-indigo-700', out_for_delivery: 'bg-orange-100 text-orange-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700',
    };

    if (loading) return <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100"><Loader2 className="w-8 h-8 animate-spin text-[#F97316] mx-auto" /></div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 space-y-5">
            <h2 className="text-xl font-bold text-gray-900">Order History</h2>
            {orders.length === 0 && <div className="text-center py-8"><ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No orders yet</p></div>}
            <div className="space-y-3">
                {orders.map((o) => (
                    <div key={o.id} className="border border-gray-200 rounded-xl overflow-hidden">
                        <button onClick={() => setExpanded(expanded === o.id ? null : o.id)} className="w-full p-4 flex items-center gap-4 text-left">
                            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0"><Package className="w-5 h-5 text-[#F97316]" /></div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2"><span className="font-medium text-gray-900">{o.orderNumber}</span><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[o.status] || 'bg-gray-100'}`}>{o.status}</span></div>
                                <p className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString()} · {o.items.length} items · ${o.total.toFixed(2)}</p>
                            </div>
                            {expanded === o.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                        </button>
                        {expanded === o.id && (
                            <div className="px-4 pb-4 border-t pt-3 space-y-2">
                                {o.items.map((item, i) => (<div key={i} className="flex justify-between text-sm"><span className="text-gray-600">{item.name} x{item.quantity}</span><span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span></div>))}
                                <div className="flex justify-between font-bold pt-2 border-t"><span>Total</span><span className="text-[#F97316]">${o.total.toFixed(2)}</span></div>
                                <button className="mt-2 px-4 py-2 bg-[#F97316] text-white rounded-lg text-sm font-medium hover:bg-[#ea6c10] transition-colors">Reorder</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── LOYALTY POINTS TAB ───
function LoyaltyPoints({ token, userPoints }: { token: string | null; userPoints: number }) {
    const [points, setPoints] = useState(userPoints);
    const [history, setHistory] = useState<LoyaltyEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/users?action=loyalty', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { setPoints(d.points); setHistory(d.history || []); }).catch(() => { }).finally(() => setLoading(false));
    }, [token]);

    if (loading) return <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100"><Loader2 className="w-8 h-8 animate-spin text-[#F97316] mx-auto" /></div>;

    return (
        <div className="space-y-6">
            {/* Points Card */}
            <div className="bg-gradient-to-r from-[#F97316] to-[#ea6c10] rounded-2xl p-6 text-white shadow-lg shadow-orange-200/50">
                <p className="text-sm opacity-90">Your Loyalty Points</p>
                <p className="text-5xl font-bold mt-1">{points}</p>
                <p className="text-sm opacity-80 mt-2">= ${(points / 100).toFixed(2)} value</p>
                <div className="flex gap-3 mt-4">
                    <div className="bg-white/20 rounded-xl px-4 py-2 flex-1 text-center"><p className="text-xs opacity-80">Earn</p><p className="font-bold">1 pt / $1</p></div>
                    <div className="bg-white/20 rounded-xl px-4 py-2 flex-1 text-center"><p className="text-xs opacity-80">Redeem</p><p className="font-bold">100 pts = $1</p></div>
                </div>
            </div>

            {points >= 100 && (
                <button className="w-full py-3 bg-white border-2 border-[#F97316] text-[#F97316] font-semibold rounded-xl hover:bg-[#F97316]/5 transition-all">
                    Redeem {Math.floor(points / 100) * 100} Points (${Math.floor(points / 100).toFixed(2)} off next order)
                </button>
            )}

            {/* History */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Transaction History</h3>
                {history.length === 0 && <p className="text-center text-gray-500 py-4">No transactions yet</p>}
                <div className="space-y-3">
                    {history.map((entry, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                            <div>
                                <p className="font-medium text-gray-900 text-sm">{entry.action === 'earned' ? 'Points Earned' : 'Points Redeemed'}</p>
                                <p className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString()}</p>
                            </div>
                            <span className={`font-bold ${entry.points > 0 ? 'text-green-600' : 'text-red-600'}`}>{entry.points > 0 ? '+' : ''}{entry.points}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
