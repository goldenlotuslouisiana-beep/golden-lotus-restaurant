import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Search, Eye, Package, CheckCircle, XCircle, ChevronDown, Trash2 } from 'lucide-react';
import type { Order, OrderStatus } from '@/types';

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  preparing: { label: 'Preparing', color: 'bg-purple-100 text-purple-700', icon: Package },
  ready: { label: 'Ready', color: 'bg-indigo-100 text-indigo-700', icon: CheckCircle },
  picked_up: { label: 'Picked Up', color: 'bg-orange-100 text-orange-700', icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const orderTypeLabels: Record<string, string> = {
  pickup: 'Pickup',
  dine_in: 'Dine In',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ todayCount: 0, pendingCount: 0, preparingCount: 0, readyCount: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin?action=dashboard-stats');
      if (res.ok) {
        const data = await res.json();
        setStats({
          todayCount: data.todayOrders || 0,
          pendingCount: data.pendingOrders || 0,
          preparingCount: data.preparingOrders || 0,
          readyCount: data.readyOrders || 0,
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin?action=orders');
      if (res.ok) {
        let data = await res.json();
        if (!Array.isArray(data)) data = [];
        data = data.map((o: any) => ({
          ...o,
          id: o._id?.toString() || o.id,
          _id: o._id?.toString() || o.id
        }));
        setOrders(data);
      }
    } catch (e) {
      console.error('Failed to load orders', e);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      const res = await fetch(`/api/admin?action=orders&id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Order deleted');
        loadOrders();
        loadStats();
      }
    } catch (e) {
      toast.error('Failed to delete order');
    }
  };

  const clearTestData = async () => {
    if (!confirm('Are you sure you want to delete all test/seed data?')) return;
    try {
      const res = await fetch('/api/admin?action=clear-test', { method: 'DELETE' });
      if (res.ok) {
        toast.success('Test data cleared');
        loadOrders();
        loadStats();
      }
    } catch (e) {
      toast.error('Failed to clear test data');
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const originalOrders = [...orders];
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    try {
        const targetOrder = orders.find(o => o.id === orderId);
        const objectId = (targetOrder as any)?._id?.toString() || orderId;

        const res = await fetch(`/api/admin?action=order-status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: objectId, status: newStatus })
        });
        
        if (res.ok) {
            toast.success('Order status updated');
            loadStats();
        } else {
            throw new Error('Failed to update');
        }
    } catch (error) {
        console.error('Failed to update status:', error);
        toast.error('Failed to update status');
        setOrders(originalOrders);
    }
  };

  const filteredOrders = orders
    .filter((order: any) => {
      const name = order.customerName || order.customer?.name || order.fullName || order.name || 'Unknown';
      const phone = order.customerPhone || order.customer?.phone || order.phone || '';
      const orderNum = order.orderNumber || order.order_number || order._id?.toString()?.slice(-6).toUpperCase() || order.id?.toString()?.slice(-6).toUpperCase() || 'UNKNOWN';

      const matchesSearch =
        orderNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phone.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesType = typeFilter === 'all' || order.orderType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-lotus-dark">Orders</h1>
          <p className="text-gray-600">Manage and track customer orders</p>
        </div>
        <button 
          onClick={clearTestData}
          className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Trash2 className="w-4 h-4" />
          Clear Test Data
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Today's Orders</p>
          <p className="text-2xl font-bold text-lotus-dark">{stats.todayCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Preparing</p>
          <p className="text-2xl font-bold text-purple-600">{stats.preparingCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">Ready</p>
          <p className="text-2xl font-bold text-indigo-600">{stats.readyCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order #, name, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
            >
              <option value="all">All Status</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
            >
              <option value="all">All Types</option>
              <option value="pickup">Pickup</option>
              <option value="dine_in">Dine In</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Order #</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Time</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.map((order: any) => {
                const status = statusConfig[order.status as OrderStatus] || statusConfig['confirmed'] || { label: 'Unknown', color: 'bg-gray-100 text-gray-700', icon: Package };
                const StatusIcon = status.icon;

                const name = order.customerName || order.customer?.name || order.fullName || order.name || 'Unknown';
                const phone = order.customerPhone || order.customer?.phone || order.phone || '—';
                const orderNum = order.orderNumber || order.order_number || order._id?.toString()?.slice(-6).toUpperCase() || order.id?.toString()?.slice(-6).toUpperCase() || 'UNKNOWN';

                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="font-medium text-lotus-gold hover:underline"
                      >
                        {orderNum}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-lotus-dark">{name}</p>
                        <p className="text-sm text-gray-500">{phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {orderTypeLabels[order.orderType]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-lotus-dark">
                        ${order.total.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative group">
                        <button
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        <div className="absolute top-full left-0 mt-1 w-40 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <button
                              key={key}
                              onClick={() => handleStatusChange(order.id, key as OrderStatus)}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                                order.status === key ? 'bg-gray-50 font-medium' : ''
                              }`}
                            >
                              {config.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="p-2 text-lotus-gold hover:bg-lotus-gold/10 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Link>
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!isLoading && filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
