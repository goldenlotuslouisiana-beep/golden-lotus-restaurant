import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle, ChefHat, Package, ChevronDown, ChevronUp, HelpCircle, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import SEO from '@/components/SEO';

const STAGES = [
    { key: 'confirmed', label: 'Order Confirmed', Icon: CheckCircle },
    { key: 'preparing', label: 'Being Prepared', Icon: ChefHat },
    { key: 'ready', label: 'Ready for Pickup', Icon: Package },
    { key: 'picked_up', label: 'Picked Up / Completed', Icon: CheckCircle },
];

interface OrderData {
    id: string; orderNumber: string; status: string; orderType: string; createdAt: string; total: number;
    customer: { name: string; email: string; phone: string; address?: string; city?: string; zip?: string };
    items: { name: string; price: number; quantity: number }[];
    paymentMethod: string;
}

const OT_CSS = `
  @keyframes ot-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(184,133,58,0.5); }
    50% { box-shadow: 0 0 0 10px rgba(184,133,58,0); }
  }
  .ot-current-ring { animation: ot-pulse 1.8s ease-in-out infinite; }
  .ot-help-btn:hover { border-color: #B8853A !important; color: #B8853A !important; }
`;

export default function OrderTracking() {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDetails, setShowDetails] = useState(false);
    const [countdown, setCountdown] = useState('');
    const [canCancel, setCanCancel] = useState(false);

    // ── API fetch (unchanged) ─────────────────────────────────────────────────
    useEffect(() => {
        if (!id) { setLoading(false); return; }

        const fetchStatus = async () => {
            try {
                const res = await fetch(`/api/orders?action=single&id=${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setOrder((prev) => {
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

    // ── Countdown timer (unchanged) ───────────────────────────────────────────
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

    // ── Stage index (unchanged) ───────────────────────────────────────────────
    const getStageIndex = () => {
        if (!order) return 0;
        const map: Record<string, number> = {
            pending: 0, confirmed: 0, preparing: 1, ready: 2, picked_up: 3, completed: 3,
        };
        return map[order.status] ?? 0;
    };

    // ── Loading skeleton ──────────────────────────────────────────────────────
    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#F9F4EC', paddingTop: 96, paddingBottom: 64, padding: '96px 24px 64px', fontFamily: "'Jost', sans-serif" }}>
                <div style={{ maxWidth: 640, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <Skeleton className="h-7 w-40 mx-auto rounded-xl mb-3" />
                        <Skeleton className="h-8 w-52 mx-auto rounded-full mb-2" />
                        <Skeleton className="h-4 w-32 mx-auto rounded-full" />
                    </div>
                    <Skeleton className="h-28 w-full rounded-2xl mb-4" />
                    <Skeleton className="h-64 w-full rounded-2xl mb-4" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    // ── Not found ─────────────────────────────────────────────────────────────
    if (!order) {
        return (
            <div style={{ minHeight: '100vh', background: '#F9F4EC', paddingTop: 96, paddingBottom: 64, padding: '96px 24px 64px', fontFamily: "'Jost', sans-serif" }}>
                <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', background: 'white', borderRadius: 20, border: '1px solid #EDE3D2', padding: 40 }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(197,58,58,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <XCircle style={{ width: 28, height: 28, color: '#C53A3A' }} />
                    </div>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 600, color: '#0F0C08', margin: '0 0 8px' }}>Order not found</h1>
                    <p style={{ fontSize: 13, color: '#9E8870', marginBottom: 20 }}>We couldn't find this order. Please check your link or order number and try again.</p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        style={{ padding: '11px 24px', background: '#1E1810', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Jost', sans-serif", marginBottom: 12 }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#B8853A')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '#1E1810')}
                    >
                        Try Again
                    </button>
                    <br />
                    <Link to="/" style={{ fontSize: 13, color: '#B8853A', fontWeight: 500, textDecoration: 'none' }}>Back to home</Link>
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
            <style dangerouslySetInnerHTML={{ __html: OT_CSS }} />

            <div style={{ minHeight: '100vh', background: '#F9F4EC', fontFamily: "'Jost', sans-serif", paddingTop: 96, paddingBottom: 64 }}>
                <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px' }}>

                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 28 }}>
                        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: '#0F0C08', margin: '0 0 8px' }}>Track Your Order</h1>
                        <div style={{ display: 'inline-block', background: '#F2E4C8', border: '1px solid #DDD0BB', borderRadius: 20, padding: '5px 16px', marginBottom: 8 }}>
                            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 700, color: '#B8853A' }}>#{order.orderNumber}</span>
                        </div>
                        <p style={{ fontSize: 13, color: '#9E8870', margin: 0 }}>
                            Placed at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>

                    {/* ETA Card — dark ink bg */}
                    <div style={{ background: '#1E1810', borderRadius: 16, padding: '20px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#B8853A', fontWeight: 600, margin: '0 0 6px' }}>Estimated Pickup</p>
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 700, color: '#B8853A', margin: 0, lineHeight: 1 }}>{countdown || '18m 00s'}</p>
                        </div>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(184,133,58,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B8853A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                    </div>

                    {/* Status stepper */}
                    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #EDE3D2', padding: 24, marginBottom: 20 }}>
                        {STAGES.map((stage, i) => {
                            const completed = i < stageIdx;
                            const current = i === stageIdx;
                            const upcoming = i > stageIdx;
                            const { Icon } = stage;
                            return (
                                <div key={stage.key} style={{ display: 'flex', gap: 16 }}>
                                    {/* Left: circle + line */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div
                                            className={current ? 'ot-current-ring' : ''}
                                            style={{
                                                width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.3s',
                                                background: completed ? '#B8853A' : current ? '#1E1810' : 'white',
                                                border: upcoming ? '1.5px solid #EDE3D2' : 'none',
                                            }}
                                        >
                                            {completed ? (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M5 12l5 5L19 7" />
                                                </svg>
                                            ) : (
                                                <Icon style={{ width: 18, height: 18, color: current ? 'white' : '#9E8870' }} />
                                            )}
                                        </div>
                                        {i < STAGES.length - 1 && (
                                            <div style={{ width: 2, height: 32, background: completed ? '#B8853A' : '#EDE3D2', transition: 'background 0.3s', margin: '4px 0' }} />
                                        )}
                                    </div>

                                    {/* Right: label */}
                                    <div style={{ paddingTop: 8, paddingBottom: i < STAGES.length - 1 ? 0 : 0, flex: 1 }}>
                                        <p style={{ fontSize: 14, fontWeight: 500, color: upcoming ? '#9E8870' : '#0F0C08', margin: '0 0 4px', transition: 'color 0.3s' }}>{stage.label}</p>
                                        {current && (
                                            <span style={{ display: 'inline-block', background: 'rgba(184,133,58,0.10)', color: '#B8853A', borderRadius: 20, fontSize: 11, fontWeight: 700, padding: '2px 10px', marginBottom: 4 }}>
                                                Current status
                                            </span>
                                        )}
                                        {i < STAGES.length - 1 && <div style={{ height: 24 }} />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Ready card */}
                    {order.status === 'ready' && (
                        <div style={{ background: '#B8853A', borderRadius: 14, padding: '20px 24px', marginBottom: 20, textAlign: 'center' }}>
                            <p style={{ fontSize: 28, margin: '0 0 8px' }}>🎁</p>
                            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: 'white', margin: '0 0 6px' }}>Your order is ready!</h3>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '0 0 4px' }}>Please come pick it up at:</p>
                            <p style={{ fontSize: 14, fontWeight: 600, color: 'white', margin: '0 0 14px' }}>1473 Dorchester Dr, Alexandria, LA 71301</p>
                            <a
                                href="https://maps.google.com?q=1473+Dorchester+Dr+Alexandria+LA+71301"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'inline-block', background: 'white', color: '#B8853A', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 700, textDecoration: 'none', transition: 'opacity 0.2s' }}
                                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                            >
                                📌 Get Directions
                            </a>
                        </div>
                    )}

                    {/* Order details collapsible */}
                    <div style={{ background: 'white', borderRadius: 14, border: '1px solid #EDE3D2', marginBottom: 20, overflow: 'hidden' }}>
                        <button
                            onClick={() => setShowDetails((v) => !v)}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Jost', sans-serif" }}
                        >
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#0F0C08' }}>📦 Order Details ({order.items.length} items)</span>
                            {showDetails ? <ChevronUp style={{ width: 18, height: 18, color: '#9E8870' }} /> : <ChevronDown style={{ width: 18, height: 18, color: '#9E8870' }} />}
                        </button>
                        {showDetails && (
                            <div style={{ padding: '0 20px 20px', borderTop: '1px solid #EDE3D2', paddingTop: 14 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                                    {order.items.map((item, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontFamily: "'Jost', sans-serif" }}>
                                            <span style={{ color: '#6B5540' }}>{item.name} × {item.quantity}</span>
                                            <span style={{ fontWeight: 500, color: '#0F0C08' }}>${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, paddingTop: 10, borderTop: '1px solid #EDE3D2', fontFamily: "'Jost', sans-serif" }}>
                                    <span style={{ color: '#0F0C08' }}>Total</span>
                                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: '#B8853A' }}>${order.total.toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {canCancel ? (
                            <button
                                style={{ width: '100%', padding: '13px', border: '2px solid rgba(197,58,58,0.3)', color: '#C53A3A', background: 'white', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: "'Jost', sans-serif", transition: 'all 0.2s' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(197,58,58,0.05)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
                            >
                                <XCircle style={{ width: 18, height: 18 }} /> Cancel Order
                            </button>
                        ) : (
                            <div style={{ position: 'relative' }} className="group">
                                <button
                                    disabled
                                    style={{ width: '100%', padding: '13px', border: '1.5px solid #EDE3D2', color: '#9E8870', background: 'white', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: "'Jost', sans-serif" }}
                                    title="Cannot cancel after 2 minutes"
                                >
                                    <XCircle style={{ width: 18, height: 18 }} /> Cancel Order
                                </button>
                                <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8, background: '#1E1810', color: 'white', fontSize: 11.5, borderRadius: 8, padding: '6px 12px', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 10 }}>
                                    Cannot cancel after 2 minutes
                                </div>
                            </div>
                        )}
                        <Link
                            to="/contact"
                            className="ot-help-btn"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', border: '1px solid #EDE3D2', color: '#6B5540', background: 'white', borderRadius: 12, fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'all 0.2s', fontFamily: "'Jost', sans-serif" }}
                        >
                            <HelpCircle style={{ width: 18, height: 18 }} /> Need Help?
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
