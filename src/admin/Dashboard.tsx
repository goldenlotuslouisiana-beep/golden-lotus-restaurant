import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  FileText,
  ShoppingBag,
  Eye,
  TrendingUp,
  DollarSign,
  Clock,
  Package,
  ChevronRight,
  Users,
} from 'lucide-react';
import { DataStore } from '@/data/store';
import type { Order } from '@/types';

interface Stats {
  menuItems: number;
  categories: number;
  locations: number;
  testimonials: number;
  galleryImages: number;
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
  todayRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    menuItems: 0,
    categories: 0,
    locations: 0,
    testimonials: 0,
    galleryImages: 0,
    totalOrders: 0,
    todayOrders: 0,
    pendingOrders: 0,
    todayRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    const analytics = DataStore.getAnalytics();

    // Set synchronous stats first
    setStats({
      menuItems: 0, // Will be updated by fetch
      categories: DataStore.getMenuCategories().length,
      locations: DataStore.getLocations().length,
      testimonials: DataStore.getTestimonials().length,
      galleryImages: DataStore.getGalleryImages().length,
      totalOrders: analytics.totalOrders,
      todayOrders: analytics.todayOrders,
      pendingOrders: analytics.pendingOrders,
      todayRevenue: analytics.todayRevenue,
    });

    // Fetch live menu items count from MongoDB
    const fetchMenuStats = async () => {
      try {
        const res = await fetch('/api/menu');
        if (res.ok) {
          const items = await res.json();
          setStats(prev => ({ ...prev, menuItems: items.length }));
        } else {
          // Fallback
          setStats(prev => ({ ...prev, menuItems: DataStore.getMenuItems().length }));
        }
      } catch (e) {
        // Fallback
        setStats(prev => ({ ...prev, menuItems: DataStore.getMenuItems().length }));
      }
    };
    fetchMenuStats();

    // Get recent orders
    const orders = DataStore.getOrders();
    setRecentOrders(orders.slice(-5).reverse());
  }, []);

  const statCards = [
    { name: "Today's Orders", value: stats.todayOrders, icon: ShoppingBag, href: '/admin/orders', color: 'bg-orange-500' },
    { name: "Today's Revenue", value: `$${stats.todayRevenue.toFixed(0)}`, icon: DollarSign, href: '/admin/analytics', color: 'bg-green-500' },
    { name: 'Pending Orders', value: stats.pendingOrders, icon: Clock, href: '/admin/orders', color: 'bg-yellow-500' },
    { name: 'Total Orders', value: stats.totalOrders, icon: Package, href: '/admin/orders', color: 'bg-blue-500' },
    { name: 'Menu Items', value: stats.menuItems, icon: UtensilsCrossed, href: '/admin/menu', color: 'bg-purple-500' },
  ];

  const quickActions = [
    { name: 'View Orders', href: '/admin/orders', icon: ShoppingBag, description: 'Manage and track customer orders' },
    { name: 'View Analytics', href: '/admin/analytics', icon: TrendingUp, description: 'Check sales and performance metrics' },
    { name: 'Add Menu Item', href: '/admin/menu', icon: UtensilsCrossed, description: 'Add a new dish to your menu' },
    { name: 'Edit Site Content', href: '/admin/content', icon: FileText, description: 'Update homepage and page content' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-lotus-dark">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your restaurant.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-lotus-dark mb-4">Website Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-lotus-dark">Website Status</p>
                <p className="text-sm text-gray-500">Your website is live and accessible</p>
              </div>
              <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Active
              </span>
            </div>

            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-lotus-dark">Online Ordering</p>
                <p className="text-sm text-gray-500">Customers can place orders online</p>
              </div>
              <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Enabled
              </span>
            </div>

            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-lotus-dark">Customer Accounts</p>
                <p className="text-sm text-gray-500">Reward program is active</p>
              </div>
              <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Active
              </span>
            </div>
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
                    <p className="text-sm text-gray-500">{order.customer.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-lotus-gold">${order.total.toFixed(2)}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'delivered'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
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
    </div>
  );
}
