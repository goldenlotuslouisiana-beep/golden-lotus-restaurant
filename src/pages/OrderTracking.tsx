import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle, ChefHat, Package, Clock, ChevronDown, ChevronUp, HelpCircle, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import SEO from '@/components/SEO';

const STAGES = [
    { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle, color: 'text-green-600 bg-green-100' },
    { key: 'preparing', label: 'Being Prepared', icon: ChefHat, color: 'text-purple-600 bg-purple-100' },
    { key: 'ready', label: 'Ready for Pickup', icon: Package, color: 'text-indigo-600 bg-indigo-100' },
    { key: 'picked_up', label: 'Picked Up / Completed', icon: CheckCircle, color: 'text-[#F97316] bg-orange-100' },
];

interface OrderData {
    id: string; orderNumber: string; status: string; orderType: string; createdAt: string; total: number;
    customer: { name: string; email: string; phone: string; address?: string; city?: string; zip?: string };
    items: { name: string; price: number; quantity: number }[];
    paymentMethod: string;
}

export default function OrderTracking() {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDetails, setShowDetails] = useState(false);
    const [countdown, setCountdown] = useState('');
    const [canCancel, setCanCancel] = useState(false);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        const fetchStatus = async () => {
            try {
                const res = await fetch(`/api/orders?action=single&id=${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setOrder(prev => {
                        if (prev && prev.status !== data.status) {
                            toast.success('Your order status has been updated!');
                        }
                        return data;
                    });
                }
            } catch (e) {
                console.error('Failed to fetch order', e);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 15000);
        return () => clearInterval(interval);
    }, [id]);

    // Countdown timer
    useEffect(() => {
        if (!order) return;
        const created = new Date(order.createdAt).getTime();
        const eta = created + 18 * 60 * 1000;
        const cancelDeadline = created + 2 * 60 * 1000;

        const interval = setInterval(() => {
            const now = Date.now();
            setCanCancel(now < cancelDeadline);
            const diff = eta - now;
            if (diff <= 0) { setCountdown('Arriving now!'); return; }
            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            setCountdown(`${mins}m ${secs}s`);
        }, 1000);
        return () => clearInterval(interval);
    }, [order]);

    const getStageIndex = () => {
        if (!order) return 0;
        const map: Record<string, number> = { 
            pending: 0, 
            confirmed: 0, 
            preparing: 1, 
            ready: 2, 
            picked_up: 3,
            completed: 3 
        };
        return map[order.status] ?? 0;
    };

    const getActiveStages = () => STAGES;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-28 pb-16 px-4">
                <div className="max-w-lg mx-auto space-y-6">
                    <div className="text-center space-y-3">
                        <Skeleton className="h-7 w-40 mx-auto rounded-xl" />
                        <Skeleton className="h-8 w-52 mx-auto rounded-full" />
                        <Skeleton className="h-4 w-32 mx-auto rounded-full" />
                    </div>
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-64 w-full rounded-2xl" />
                    <Skeleton className="h-40 w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 pt-28 pb-16 px-4">
                <div className="max-w-lg mx-auto text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-7 h-7 text-red-500" />
                    </div>
                    <h1 className="text-xl font-semibold text-gray-900 mb-1">Order not found</h1>
                    <p className="text-gray-500 mb-4">
                        We couldn&apos;t find this order. Please check your link or order number and try again.
                    </p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#F97316] text-white text-sm font-semibold hover:bg-[#EA6C0A] transition-colors"
                    >
                        Try again
                    </button>
                    <Link
                        to="/"
                        className="mt-3 block text-sm text-[#F97316] hover:text-[#EA6C0A] font-medium"
                    >
                        Back to home
                    </Link>
                </div>
            </div>
        );
    }

    const stageIdx = getStageIndex();

    return (
        <>
            <SEO 
                title="Track Order | Golden Lotus Restaurant"
                description="Track your Golden Lotus order in real-time. See when your food is being prepared and when it's ready for pickup."
                url="https://www.goldenlotusgrill.com/order-tracking"
                noIndex={true}
            />
        <div className="min-h-screen bg-gray-50 pt-28 pb-16 px-4">
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Track Your Order</h1>
                    <p className="text-sm font-mono bg-gray-100 inline-block px-4 py-1.5 rounded-full text-gray-700">#{order.orderNumber}</p>
                    <p className="text-sm text-gray-500 mt-2">Placed {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>

                {/* ETA Card */}
                <div className="bg-gradient-to-r from-[#F97316] to-[#ea6c10] rounded-2xl p-6 text-white mb-6 shadow-lg shadow-orange-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">Estimated Arrival</p>
                            <p className="text-3xl font-bold mt-1">{countdown}</p>
                        </div>
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                            <Clock className="w-7 h-7" />
                        </div>
                    </div>
                </div>

                {/* Progress Tracker */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
                    <div className="space-y-0">
                        {getActiveStages().map((stage, i) => {
                            const isActive = i <= stageIdx;
                            const isCurrent = i === stageIdx;
                            const Icon = stage.icon;
                            // Need to know total stages to draw the line correctly
                            const totalStages = getActiveStages().length;
                            return (
                                <div key={stage.key} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isActive ? stage.color : 'bg-gray-100 text-gray-400'} ${isCurrent ? 'ring-4 ring-offset-2 ring-[#F97316]/20' : ''}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        {i < totalStages - 1 && <div className={`w-0.5 h-12 ${isActive ? 'bg-green-300' : 'bg-gray-200'}`} />}
                                    </div>
                                    <div className="pt-2 pb-6">
                                        <p className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>{stage.label}</p>
                                        {isCurrent && <p className="text-sm text-[#F97316] mt-0.5 font-medium">Current status</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Pickup Instructions */}
                {order.status === 'ready' && (
                  <div className="mt-8 bg-orange-500 text-white rounded-xl p-5 text-center shadow-lg">
                    <p className="text-3xl mb-2">🎁</p>
                    <h3 className="text-xl font-bold">Your order is ready!</h3>
                    <p className="mt-1 text-white/90">
                      Please come pick it up at Golden Lotus
                    </p>
                    <p className="mt-1 text-white/80 text-sm">
                      168 Dragon Blvd, Los Angeles, CA 90012
                    </p>
                    <a href="https://maps.google.com?q=168+Dragon+Blvd+Los+Angeles+CA"
                       target="_blank"
                       rel="noopener noreferrer"
                       className="mt-3 inline-block bg-white text-orange-500 px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-orange-50 transition-colors">
                      📌 Get Directions
                    </a>
                  </div>
                )}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
                    <button onClick={() => setShowDetails(!showDetails)} className="w-full p-4 flex items-center justify-between">
                        <span className="font-medium text-gray-900">Order Details ({order.items.length} items)</span>
                        {showDetails ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </button>
                    {showDetails && (
                        <div className="px-4 pb-4 space-y-3 border-t pt-3">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <span className="text-gray-600">{item.name} x{item.quantity}</span>
                                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="flex justify-between font-bold pt-2 border-t"><span>Total</span><span className="text-[#F97316]">${order.total.toFixed(2)}</span></div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    {canCancel ? (
                        <button className="w-full py-3 border-2 border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2">
                            <XCircle className="w-5 h-5" /> Cancel Order
                        </button>
                    ) : (
                        <div className="relative group">
                            <button disabled className="w-full py-3 border-2 border-gray-200 text-gray-400 font-semibold rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
                                <XCircle className="w-5 h-5" /> Cancel Order
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                                Orders can only be cancelled within 2 minutes of placing
                            </div>
                        </div>
                    )}
                    <Link to="/contact" className="w-full py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                        <HelpCircle className="w-5 h-5" /> Need Help?
                    </Link>
                </div>
            </div>
        </div>
        </>
    );
}
