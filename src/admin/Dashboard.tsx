import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Clock,
  Package,
  ChevronRight,
  Users,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface Stats {
  menuItems: number;
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
  todayRevenue: number;
  totalRevenue: number;
  totalUsers: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: { name: string };
  total: number;
  status: string;
  createdAt: string;
}

interface UnavailableItem {
  id: string;
  name: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    menuItems: 0, totalOrders: 0, todayOrders: 0,
    pendingOrders: 0, todayRevenue: 0, totalRevenue: 0, totalUsers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [unavailable, setUnavailable] = useState<UnavailableItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/admin?action=dashboard-stats');
        if (res.ok) {
          const data = await res.json();
          setStats({
            menuItems: data.menuItems || 0,
            totalOrders: data.totalOrders || 0,
            todayOrders: data.todayOrders || 0,
            pendingOrders: data.pendingOrders || 0,
            todayRevenue: data.todayRevenue || 0,
            totalRevenue: data.totalRevenue || 0,
            totalUsers: data.totalUsers || 0,
          });
          setRecentOrders(data.recentOrders || []);
          setUnavailable(data.unavailableItems || []);
        }
      } catch (e) {
        console.error('Dashboard fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const statCards = [
    { name: "Today's Orders", value: stats.todayOrders, icon: ShoppingBag, href: '/admin/orders', color: 'bg-orange-500' },
    { name: "Today's Revenue", value: `$${stats.todayRevenue.toFixed(0)}`, icon: DollarSign, href: '/admin/analytics', color: 'bg-green-500' },
    { name: 'Pending Orders', value: stats.pendingOrders, icon: Clock, href: '/admin/orders', color: 'bg-yellow-500' },
    { name: 'Total Orders', value: stats.totalOrders, icon: Package, href: '/admin/orders', color: 'bg-blue-500' },
    { name: 'Menu Items', value: stats.menuItems, icon: UtensilsCrossed, href: '/admin/menu', color: 'bg-purple-500' },
    { name: 'Total Users', value: stats.totalUsers, icon: Users, href: '/admin/users', color: 'bg-indigo-500' },
    { name: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(0)}`, icon: TrendingUp, href: '/admin/analytics', color: 'bg-emerald-500' },
  ];

  const quickActions = [
    { name: 'View Orders', href: '/admin/orders', icon: ShoppingBag, description: 'Manage and track customer orders' },
    { name: 'View Analytics', href: '/admin/analytics', icon: TrendingUp, description: 'Check sales and performance metrics' },
    { name: 'Add Menu Item', href: '/admin/menu', icon: UtensilsCrossed, description: 'Add a new dish to your menu' },
    { name: 'Manage Users', href: '/admin/users', icon: Users, description: 'View and manage customer accounts' },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-lotus-gold" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-lotus-dark">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your restaurant.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.href}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.name}</p>
                  <p className="text-2xl font-bold text-lotus-dark mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Unavailable Items Alert */}
      {unavailable.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-orange-800">{unavailable.length} item{unavailable.length > 1 ? 's' : ''} currently unavailable</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {unavailable.map(item => (
                <span key={item.id} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-sm">{item.name}</span>
              ))}
            </div>
            <Link to="/admin/menu" className="text-sm text-orange-600 hover:underline mt-2 inline-block">Manage Menu →</Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-lotus-dark mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.name}
                to={action.href}
                className="p-4 border rounded-lg hover:border-lotus-gold hover:bg-lotus-cream transition-colors group"
              >
                <Icon className="w-8 h-8 text-lotus-gold mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-lotus-dark">{action.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-lotus-dark">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-lotus-gold hover:underline flex items-center gap-1">
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-3">
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent orders</p>
          ) : (
            recentOrders.map((order) => (
              <Link
                key={order.id}
                to={`/admin/orders/${order.id}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-lotus-dark">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{order.customer?.name || 'Customer'}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-lotus-gold">${order.total?.toFixed(2) || '0.00'}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'delivered'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}
                  >
                    {order.status}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
