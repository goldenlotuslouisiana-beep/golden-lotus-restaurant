import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Calendar, Users, Clock, CheckCircle } from 'lucide-react';
import { adminFetch } from '@/lib/adminFetch';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  totalUsers: number;
  menuItems: number;
  blockedUsers: number;
  newUsersToday: number;
  activeUsersWeek: number;
  weeklyStats: { date: string; orders: number; revenue: number }[];
  popularItems: { name: string; count: number }[];
  recentOrders: { id: string; orderNumber: string; customer: { name: string }; total: number; status: string; createdAt: string }[];
}

const DEFAULT_STATS: DashboardStats = {
  totalOrders: 0, totalRevenue: 0, averageOrderValue: 0,
  todayOrders: 0, todayRevenue: 0,
  pendingOrders: 0, preparingOrders: 0, readyOrders: 0,
  totalUsers: 0, menuItems: 0, blockedUsers: 0,
  newUsersToday: 0, activeUsersWeek: 0,
  weeklyStats: [], popularItems: [], recentOrders: [],
};

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

export default function AdminAnalytics() {
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState<'7days' | '30days' | 'all'>('7days');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminFetch('/api/admin?action=dashboard-stats');
      const data = await res.json();
      setStats({
        ...DEFAULT_STATS,
        ...data,
        weeklyStats: Array.isArray(data.weeklyStats) ? data.weeklyStats : [],
        popularItems: Array.isArray(data.popularItems) ? data.popularItems : [],
        recentOrders: Array.isArray(data.recentOrders) ? data.recentOrders : [],
      });
    } catch {
      setError('Could not load analytics data. This may mean there are no orders yet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [dateRange]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #EDE3D2', borderTopColor: '#B8853A', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#9E8870', fontSize: 13 }}>Loading analytics…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(197,58,58,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>⚠️</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: '#0F0C08', marginBottom: 8 }}>Analytics Unavailable</div>
        <div style={{ fontSize: 13, color: '#9E8870', marginBottom: 20 }}>{error}</div>
        <button onClick={load} style={{ padding: '10px 20px', background: '#1E1810', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: "'Jost', sans-serif" }}>
          Try Again
        </button>
      </div>
    );
  }

  const avgOrderValue = stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;
  const weeklyStats = stats.weeklyStats || [];
  const popularItems = stats.popularItems || [];
  const recentOrders = stats.recentOrders || [];
  const maxRevenue = Math.max(...weeklyStats.map(s => s.revenue), 1);

  const statCards = [
    { title: 'Total Orders', value: stats.totalOrders.toString(), Icon: ShoppingBag, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
    { title: 'Total Revenue', value: fmt(stats.totalRevenue), Icon: DollarSign, color: '#2F9555', bg: 'rgba(47,149,85,0.1)' },
    { title: 'Avg Order Value', value: fmt(avgOrderValue), Icon: TrendingUp, color: '#B8853A', bg: 'rgba(184,133,58,0.1)' },
    { title: "Today's Orders", value: stats.todayOrders.toString(), Icon: Calendar, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
    { title: 'Total Customers', value: stats.totalUsers.toString(), Icon: Users, color: '#EC4899', bg: 'rgba(236,72,153,0.1)' },
    { title: 'Pending Orders', value: stats.pendingOrders.toString(), Icon: Clock, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    { title: 'Today\'s Revenue', value: fmt(stats.todayRevenue), Icon: TrendingUp, color: '#2F9555', bg: 'rgba(47,149,85,0.1)' },
    { title: 'Orders Ready', value: stats.readyOrders.toString(), Icon: CheckCircle, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  ];

  const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
    pending:  { bg: 'rgba(216,155,35,0.1)',  color: '#D89B23' },
    confirmed:{ bg: 'rgba(59,130,246,0.1)',  color: '#3B82F6' },
    preparing:{ bg: 'rgba(139,92,246,0.1)',  color: '#8B5CF6' },
    ready:    { bg: 'rgba(47,149,85,0.1)',   color: '#2F9555' },
    completed:{ bg: 'rgba(47,149,85,0.1)',   color: '#2F9555' },
    cancelled:{ bg: 'rgba(197,58,58,0.1)',   color: '#C53A3A' },
  };

  return (
    <div style={{ fontFamily: "'Jost', sans-serif", padding: '0 0 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 500, color: '#0F0C08', margin: 0 }}>Analytics</h1>
          <p style={{ color: '#9E8870', fontSize: 13, margin: '4px 0 0' }}>Restaurant performance overview</p>
        </div>
        <select
          value={dateRange}
          onChange={e => setDateRange(e.target.value as typeof dateRange)}
          style={{ padding: '8px 14px', border: '1.5px solid #EDE3D2', borderRadius: 8, fontSize: 13, fontFamily: "'Jost', sans-serif", color: '#0F0C08', background: 'white', outline: 'none', cursor: 'pointer' }}
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {statCards.map(({ title, value, Icon, color, bg }) => (
          <div key={title} style={{ background: 'white', borderRadius: 14, border: '1px solid #EDE3D2', padding: '20px 20px 18px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon style={{ width: 20, height: 20, color }} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: '#9E8870', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{title}</p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: '#0F0C08', margin: '4px 0 0' }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Revenue Chart */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #EDE3D2', padding: 24, gridColumn: weeklyStats.length === 0 ? '1 / -1' : '1 / 2' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: '#0F0C08', margin: '0 0 20px' }}>Revenue (Last 7 Days)</h2>
          {weeklyStats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#9E8870', fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
              No revenue data yet. Revenue will appear once orders are placed.
            </div>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              {weeklyStats.map((stat, i) => {
                const h = Math.max((stat.revenue / maxRevenue) * 100, 4);
                const day = new Date(stat.date).toLocaleDateString('en-US', { weekday: 'short' });
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div title={fmt(stat.revenue)} style={{ width: '100%', height: `${h}%`, background: 'linear-gradient(180deg, #B8853A, #C9963F)', borderRadius: '6px 6px 0 0', cursor: 'pointer', transition: 'opacity 0.2s' }} onMouseOver={e => (e.currentTarget as HTMLElement).style.opacity = '0.8'} onMouseOut={e => (e.currentTarget as HTMLElement).style.opacity = '1'} />
                    <span style={{ fontSize: 10, color: '#9E8870' }}>{day}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Popular Items */}
        {weeklyStats.length > 0 && (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #EDE3D2', padding: 24 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: '#0F0C08', margin: '0 0 20px' }}>Popular Items</h2>
            {popularItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#9E8870', fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🍽️</div>
                No item data yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {(popularItems || []).map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(184,133,58,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#B8853A', flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1, fontSize: 13.5, color: '#0F0C08', fontWeight: 500 }}>{item.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ height: 6, width: `${(item.count / (popularItems[0]?.count || 1)) * 80}px`, background: '#B8853A', borderRadius: 3 }} />
                      <span style={{ fontSize: 12, color: '#9E8870' }}>{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #EDE3D2', padding: 24 }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: '#0F0C08', margin: '0 0 20px' }}>Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9E8870', fontSize: 13 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🛍️</div>
            No orders yet. Orders will appear here once customers start ordering.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #EDE3D2' }}>
                  {['Order', 'Customer', 'Total', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9E8870', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o, i) => {
                  const s = STATUS_STYLE[o.status] || { bg: '#F9F4EC', color: '#6B5540' };
                  return (
                    <tr key={o.id || i} style={{ borderBottom: '1px solid #F9F4EC' }}>
                      <td style={{ padding: '12px 12px', fontSize: 13, fontWeight: 600, color: '#0F0C08' }}>{o.orderNumber}</td>
                      <td style={{ padding: '12px 12px', fontSize: 13, color: '#6B5540' }}>{o.customer?.name || '—'}</td>
                      <td style={{ padding: '12px 12px', fontSize: 13, fontWeight: 600, color: '#B8853A' }}>{fmt(o.total || 0)}</td>
                      <td style={{ padding: '12px 12px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color, textTransform: 'capitalize' }}>{o.status}</span>
                      </td>
                      <td style={{ padding: '12px 12px', fontSize: 12, color: '#9E8870' }}>{new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 20 }}>
        <div style={{ borderRadius: 14, padding: '20px 24px', background: 'radial-gradient(ellipse at 20% 50%, rgba(184,133,58,0.2), transparent 60%), #1E1810', color: 'white' }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Today's Revenue</p>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 700, color: 'white', margin: '8px 0 0' }}>{fmt(stats.todayRevenue)}</p>
        </div>
        <div style={{ borderRadius: 14, padding: '20px 24px', background: 'linear-gradient(135deg, #3B82F6, #2563EB)', color: 'white' }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pending Orders</p>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 700, color: 'white', margin: '8px 0 0' }}>{stats.pendingOrders}</p>
        </div>
        <div style={{ borderRadius: 14, padding: '20px 24px', background: 'linear-gradient(135deg, #2F9555, #1E7A42)', color: 'white' }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>New Users Today</p>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 700, color: 'white', margin: '8px 0 0' }}>{stats.newUsersToday}</p>
        </div>
      </div>
    </div>
  );
}
