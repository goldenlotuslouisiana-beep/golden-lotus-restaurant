import { useParams, useLocation, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CheckCircle, Phone, Mail, ArrowRight, Package } from 'lucide-react';
import SEO from '@/components/SEO';
import { Skeleton } from '@/components/ui/skeleton';

interface OrderData {
    id: string; orderNumber: string;
    customer: { name: string; email: string; phone: string; address?: string; city?: string; zip?: string };
    items: { name: string; price: number; quantity: number }[];
    subtotal: number; tax: number; discount: number; total: number;
    orderType: string; paymentMethod: string; paymentStatus: string; cardLast4?: string; createdAt: string;
}

export default function OrderConfirmed() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const st = location.state as { orderNumber?: string; total?: number; paymentMethod?: string; cardLast4?: string } | null;
    const [order, setOrder] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        if (id) fetch(`/api/orders?action=single&id=${id}`).then(r => r.ok ? r.json() : null).then(d => { if (d) setOrder(d); setLoading(false); }).catch(() => setLoading(false));
        else setLoading(false);
        setTimeout(() => setShowConfetti(false), 3000);
    }, [id]);

    const orderNumber = order?.orderNumber || st?.orderNumber || 'N/A';
    const total = order?.total || st?.total || 0;
    const pm = order?.paymentMethod || st?.paymentMethod || 'cash';
    const last4 = order?.cardLast4 || st?.cardLast4 || '';

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-50 pt-28 pb-16 px-4">
                <div className="max-w-lg mx-auto space-y-6">
                    <div className="flex justify-center">
                        <Skeleton className="w-24 h-24 rounded-full" />
                    </div>
                    <div className="space-y-3 text-center">
                        <Skeleton className="h-8 w-64 mx-auto rounded-xl" />
                        <Skeleton className="h-4 w-40 mx-auto rounded-xl" />
                        <Skeleton className="h-7 w-44 mx-auto rounded-full" />
                    </div>
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-28 w-full rounded-2xl" />
                    <Skeleton className="h-40 w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <>
            <SEO 
                title="Order Confirmed | Golden Lotus Restaurant"
                description="Your order has been confirmed! Thank you for choosing Golden Lotus. We'll have your delicious Indian food ready soon."
                url="https://www.goldenlotusgrill.com/order-confirmed"
                noIndex={true}
            />
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-50 pt-28 pb-16 px-4 relative overflow-hidden">
            {/* Confetti particles */}
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="absolute animate-bounce" style={{
                            left: `${Math.random() * 100}%`, top: `${Math.random() * 60}%`,
                            animationDuration: `${1 + Math.random() * 2}s`, animationDelay: `${Math.random() * 0.5}s`,
                            width: 8, height: 8, borderRadius: '50%',
                            backgroundColor: ['#F97316', '#10b981', '#3b82f6', '#f59e0b', '#ef4444'][i % 5],
                            opacity: 0.7,
                        }} />
                    ))}
                </div>
            )}

            <div className="max-w-lg mx-auto text-center relative z-10">
                <div className="mb-6">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-200/50" style={{ animation: 'pulse 2s ease-in-out infinite' }}>
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed! 🎉</h1>
                <p className="text-gray-600 mb-1">Thank you for your order</p>
                <p className="text-sm font-mono bg-gray-100 inline-block px-4 py-1.5 rounded-full text-gray-700 mb-8">#{orderNumber}</p>

                {/* Payment Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 text-left border border-gray-100">
                    {pm === 'card' ? (
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0"><CheckCircle className="w-6 h-6 text-green-600" /></div>
                            <div><p className="font-bold text-gray-900 text-lg">Payment of ${total.toFixed(2)} confirmed</p>{last4 && <p className="text-sm text-gray-500 mt-0.5">Charged to card ending in {last4}</p>}</div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0"><span className="text-2xl">💵</span></div>
                            <div><p className="font-bold text-gray-900 text-lg">Pay ${total.toFixed(2)} cash on delivery</p><p className="text-sm text-gray-500 mt-0.5">Please have exact change ready</p></div>
                        </div>
                    )}
                </div>

                {/* ETA */}
                <div className="bg-orange-50 rounded-xl p-5 text-center shadow-sm border border-orange-100 mb-4">
                    <p className="text-2xl mb-1">🎉</p>
                    <h3 className="font-bold text-lg text-gray-900">Ready in 15-20 minutes!</h3>
                    <p className="text-gray-600 mt-1">Please pick up your order at:</p>
                    <p className="font-semibold text-gray-900 mt-2">Golden Lotus Restaurant</p>
                    <p className="text-gray-600 text-sm">1473 Dorchester Dr, Alexandria, LA 71301</p>
                    <a href="https://maps.google.com?q=1473+Dorchester+Dr+Alexandria+LA+71301"
                       target="_blank"
                       className="mt-3 inline-block bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
                      📌 Get Directions
                    </a>
                </div>

                {/* Third-party Delivery */}
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 mb-6">
                    <h3 className="font-semibold text-gray-700 text-center mb-4 text-sm">
                      Need someone to pick it up for you? 🛵
                    </h3>
                    <div className="flex gap-3 justify-center flex-wrap">
                      <a href="https://www.ubereats.com" target="_blank"
                         className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                        🚗 Uber Eats
                      </a>
                      <a href="https://www.doordash.com" target="_blank"
                         className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
                        🍕 DoorDash
                      </a>
                      <a href="https://www.grubhub.com" target="_blank"
                         className="flex items-center gap-2 bg-orange-400 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-500 transition-colors">
                        🛵 Grubhub
                      </a>
                    </div>
                </div>

                {/* Order Items */}
                {order && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 text-left border border-gray-100 space-y-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2"><Package className="w-5 h-5 text-[#F97316]" /> Order Details</h3>
                        <div className="space-y-2">{order.items.map((item, i) => (<div key={i} className="flex justify-between text-sm"><span className="text-gray-600">{item.name} x{item.quantity}</span><span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span></div>))}</div>
                        <div className="border-t pt-3 space-y-1 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>${order.tax.toFixed(2)}</span></div>
                            {order.discount > 0 && <div className="flex justify-between text-[#F97316]"><span>Discount</span><span>-${order.discount.toFixed(2)}</span></div>}
                            <div className="flex justify-between font-bold text-base pt-1 border-t"><span>Total</span><span className="text-[#F97316]">${order.total.toFixed(2)}</span></div>
                        </div>
                        {order.customer && (
                            <div className="border-t pt-3 space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4 text-gray-400" />{order.customer.email}</div>
                                <div className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4 text-gray-400" />{order.customer.phone}</div>
                            </div>
                        )}
                    </div>
                )}

                <div className="space-y-3">
                    <Link to={`/order/${id}/track`} className="w-full py-3.5 bg-gradient-to-r from-[#F97316] to-[#ea6c10] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-200 transition-all flex items-center justify-center gap-2">
                        Track Order <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link to="/" className="w-full py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2">Back to Home</Link>
                </div>
            </div>
        </div>
        </>
    );
}
