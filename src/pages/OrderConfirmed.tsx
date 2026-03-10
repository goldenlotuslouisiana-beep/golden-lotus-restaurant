import { useParams, useLocation, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CheckCircle, Clock, MapPin, Phone, Mail, ArrowRight, Loader2 } from 'lucide-react';

interface OrderData {
    id: string;
    orderNumber: string;
    customer: {
        name: string;
        email: string;
        phone: string;
        address?: string;
        city?: string;
        zip?: string;
    };
    items: { name: string; price: number; quantity: number }[];
    subtotal: number;
    tax: number;
    deliveryFee: number;
    total: number;
    orderType: string;
    paymentMethod: string;
    paymentStatus: string;
    cardLast4?: string;
    createdAt: string;
}

export default function OrderConfirmed() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const state = location.state as {
        orderNumber?: string;
        total?: number;
        paymentMethod?: string;
        cardLast4?: string;
    } | null;

    const [order, setOrder] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetch(`/api/orders/${id}`)
                .then((res) => (res.ok ? res.json() : null))
                .then((data) => {
                    if (data) setOrder(data);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [id]);

    const orderNumber = order?.orderNumber || state?.orderNumber || 'N/A';
    const total = order?.total || state?.total || 0;
    const paymentMethod = order?.paymentMethod || state?.paymentMethod || 'cash';
    const cardLast4 = order?.cardLast4 || state?.cardLast4 || '';

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24">
                <Loader2 className="w-8 h-8 animate-spin text-[#F97316]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-16 px-4">
            <div className="max-w-lg mx-auto text-center">
                {/* Success Animation */}
                <div className="mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                <p className="text-gray-600 mb-2">Thank you for your order</p>
                <p className="text-sm text-gray-500 mb-8">
                    Order #{orderNumber}
                </p>

                {/* Payment Status Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 text-left">
                    {paymentMethod === 'card' ? (
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-lg">Payment of ${total.toFixed(2)} confirmed</p>
                                {cardLast4 && (
                                    <p className="text-sm text-gray-500 mt-0.5">Charged to card ending in {cardLast4}</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                                <span className="text-2xl">💵</span>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-lg">Pay ${total.toFixed(2)} cash on delivery</p>
                                <p className="text-sm text-gray-500 mt-0.5">Please have exact change ready</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Order Details */}
                {order && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 text-left space-y-4">
                        <h3 className="font-bold text-gray-900">Order Details</h3>

                        <div className="space-y-2">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <span className="text-gray-600">{item.name} x{item.quantity}</span>
                                    <span className="text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-3 space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Subtotal</span>
                                <span>${order.subtotal.toFixed(2)}</span>
                            </div>
                            {order.deliveryFee > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Delivery</span>
                                    <span>${order.deliveryFee.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-500">Tax</span>
                                <span>${order.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-base pt-1 border-t">
                                <span>Total</span>
                                <span className="text-[#F97316]">${order.total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="border-t pt-3 space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="w-4 h-4 text-[#F97316]" />
                                <span>Estimated: 25-35 minutes</span>
                            </div>
                            {order.customer && (
                                <>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span>{order.customer.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span>{order.customer.phone}</span>
                                    </div>
                                    {order.orderType === 'delivery' && order.customer.address && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <span>{order.customer.address}, {order.customer.city} {order.customer.zip}</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                    <Link
                        to="/menu"
                        className="w-full py-3 bg-[#F97316] text-white font-semibold rounded-lg hover:bg-[#ea6c10] transition-colors flex items-center justify-center gap-2"
                    >
                        Order Again <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                        to="/"
                        className="w-full py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
