import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Calendar } from 'lucide-react';
import type { Analytics } from '@/types';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [dateRange, setDateRange] = useState<'7days' | '30days' | 'all'>('7days');

  useEffect(() => {
    const token = localStorage.getItem('admin_jwt');
    fetch('/api/admin?action=dashboard-stats', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.json())
      .then(data => setAnalytics(data))
      .catch(err => console.error('Error loading analytics:', err));
  }, []);

  if (!analytics) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Total Orders',
      value: analytics.totalOrders.toString(),
      icon: ShoppingBag,
      color: 'bg-blue-500',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(analytics.totalRevenue),
      icon: DollarSign,
      color: 'bg-green-500',
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Avg Order Value',
      value: formatCurrency(analytics.averageOrderValue),
      icon: TrendingUp,
      color: 'bg-purple-500',
      trend: '+3%',
      trendUp: true,
    },
    {
      title: "Today's Orders",
      value: analytics.todayOrders.toString(),
      icon: Calendar,
      color: 'bg-orange-500',
      trend: analytics.todayOrders > 5 ? '+15%' : '-5%',
      trendUp: analytics.todayOrders > 5,
    },
  ];

  const maxRevenue = Math.max(...analytics.weeklyStats.map((s) => s.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-lotus-dark">Analytics</h1>
          <p className="text-gray-600">Track your restaurant performance</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as '7days' | '30days' | 'all')}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{card.title}</p>
                  <p className="text-2xl font-bold text-lotus-dark mt-1">{card.value}</p>
                </div>
                <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-4">
                {card.trendUp ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={card.trendUp ? 'text-green-600 text-sm' : 'text-red-600 text-sm'}>
                  {card.trend}
                </span>
                <span className="text-gray-400 text-sm">vs last week</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-lotus-dark mb-4">Revenue (Last 7 Days)</h2>
        <div className="h-64 flex items-end gap-2">
          {analytics.weeklyStats.map((stat, index) => {
            const height = (stat.revenue / maxRevenue) * 100;
            const date = new Date(stat.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-lotus-gold rounded-t-lg transition-all hover:bg-lotus-gold-dark relative group"
                  style={{ height: `${Math.max(height, 5)}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatCurrency(stat.revenue)}
                  </div>
                </div>
                <span className="text-xs text-gray-500">{dayName}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Popular Items */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-lotus-dark mb-4">Popular Items</h2>
          <div className="space-y-4">
            {analytics.popularItems.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-lotus-gold/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-lotus-gold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-lotus-dark">{item.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 bg-lotus-gold rounded-full"
                    style={{
                      width: `${(item.count / (analytics.popularItems[0]?.count || 1)) * 100}px`,
                    }}
                  />
                  <span className="text-sm text-gray-500">{item.count} sold</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-lotus-dark mb-4">Daily Performance</h2>
          <div className="space-y-3">
            {analytics.weeklyStats.slice(-5).reverse().map((stat, index) => {
              const date = new Date(stat.date);
              return (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-lotus-dark">
                      {date.toLocaleDateString('en-US', { weekday: 'long' })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-lotus-dark">{stat.orders} orders</p>
                    <p className="text-sm text-lotus-gold">{formatCurrency(stat.revenue)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-lotus-gold to-lotus-gold-light rounded-xl p-6 text-white">
          <p className="text-white/80 text-sm">Today's Revenue</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(analytics.todayRevenue)}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <p className="text-white/80 text-sm">Pending Orders</p>
          <p className="text-3xl font-bold mt-2">{analytics.pendingOrders}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <p className="text-white/80 text-sm">Avg Order Value</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(analytics.averageOrderValue)}</p>
        </div>
      </div>
    </div>
  );
}
