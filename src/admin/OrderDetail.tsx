import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  Package,
  Truck,
  XCircle,
  CreditCard,
  Banknote,
  Receipt,
} from 'lucide-react';
import { DataStore } from '@/data/store';
import type { Order, OrderStatus } from '@/types';

const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  confirmed: { label: 'Confirmed', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: CheckCircle },
  preparing: { label: 'Preparing', color: 'text-purple-700', bgColor: 'bg-purple-100', icon: Package },
  ready: { label: 'Ready', color: 'text-indigo-700', bgColor: 'bg-indigo-100', icon: CheckCircle },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-orange-700', bgColor: 'bg-orange-100', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircle },
};

const orderTypeLabels: Record<string, string> = {
  pickup: 'Pickup',
  delivery: 'Delivery',
  dine_in: 'Dine In',
};

const paymentMethodLabels: Record<string, string> = {
  cash: 'Cash',
  card: 'Card',
  online: 'Online Payment',
};

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (id) {
      const found = DataStore.getOrderById(id);
      if (found) {
        setOrder(found);
      } else {
        navigate('/admin/orders');
      }
    }
  }, [id, navigate]);

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (order) {
      DataStore.updateOrderStatus(order.id, newStatus);
      setOrder({ ...order, status: newStatus });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!order) return null;

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  const statusFlow: OrderStatus[] = ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
  const currentStepIndex = statusFlow.indexOf(order.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-lotus-dark">{order.orderNumber}</h1>
            <p className="text-gray-600">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* Status Flow */}
      <div className="bg-white rounded-xl p-6 shadow-sm print:hidden">
        <div className="flex items-center justify-between">
          {statusFlow.map((step, index) => {
            const stepConfig = statusConfig[step];
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            return (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? isCurrent
                        ? 'bg-lotus-gold text-white'
                        : 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <stepConfig.icon className="w-5 h-5" />
                </div>
                {index < statusFlow.length - 1 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          {statusFlow.map((step) => (
            <span key={step} className="w-10 text-center">
              {statusConfig[step].label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-lotus-dark mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="font-bold text-gray-600">{item.quantity}x</span>
                    </div>
                    <div>
                      <p className="font-medium text-lotus-dark">{item.name}</p>
                      {item.specialInstructions && (
                        <p className="text-sm text-gray-500">Note: {item.specialInstructions}</p>
                      )}
                    </div>
                  </div>
                  <p className="font-medium text-lotus-dark">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-6 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>${order.deliveryFee.toFixed(2)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600">-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-lotus-gold">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          {order.specialInstructions && (
            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <h2 className="text-lg font-bold text-yellow-800 mb-2">Special Instructions</h2>
              <p className="text-yellow-700">{order.specialInstructions}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-lotus-dark mb-4">Order Status</h2>
            <div className={`flex items-center gap-3 p-4 rounded-lg ${status.bgColor} ${status.color}`}>
              <StatusIcon className="w-6 h-6" />
              <span className="font-medium">{status.label}</span>
            </div>

            <div className="mt-4 space-y-2 print:hidden">
              <p className="text-sm text-gray-600 mb-2">Update Status:</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(statusConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => handleStatusChange(key as OrderStatus)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      order.status === key
                        ? `${config.bgColor} ${config.color} font-medium`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-lotus-dark mb-4">Customer</h2>
            <div className="space-y-3">
              <p className="font-medium text-lotus-dark">{order.customer.name}</p>
              <a
                href={`tel:${order.customer.phone}`}
                className="flex items-center gap-2 text-gray-600 hover:text-lotus-gold transition-colors"
              >
                <Phone className="w-4 h-4" />
                {order.customer.phone}
              </a>
              <a
                href={`mailto:${order.customer.email}`}
                className="flex items-center gap-2 text-gray-600 hover:text-lotus-gold transition-colors"
              >
                <Mail className="w-4 h-4" />
                {order.customer.email}
              </a>
            </div>
          </div>

          {/* Delivery Info */}
          {order.orderType === 'delivery' && order.customer.address && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-lotus-dark mb-4">Delivery Address</h2>
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p>{order.customer.address}</p>
                  <p>
                    {order.customer.city}, {order.customer.zip}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Order Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-lotus-dark mb-4">Order Info</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Receipt className="w-4 h-4" />
                <span>Type: {orderTypeLabels[order.orderType]}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                {order.paymentMethod === 'cash' ? (
                  <Banknote className="w-4 h-4" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                <span>Payment: {paymentMethodLabels[order.paymentMethod]}</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    order.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                />
                <span
                  className={`text-sm ${
                    order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                  }`}
                >
                  {order.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}
                </span>
              </div>
              {order.couponCode && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="px-2 py-1 bg-lotus-gold/10 text-lotus-gold text-xs rounded">
                    Coupon: {order.couponCode}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Estimated Time */}
          {order.estimatedReadyTime && (
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h2 className="text-lg font-bold text-blue-800 mb-2">Estimated Ready Time</h2>
              <div className="flex items-center gap-2 text-blue-700">
                <Clock className="w-5 h-5" />
                <span className="font-medium">
                  {new Date(order.estimatedReadyTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
