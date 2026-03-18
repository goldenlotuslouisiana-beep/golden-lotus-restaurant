import { useParams, useLocation, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Mail, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import SEO from '@/components/SEO';
import { Skeleton } from '@/components/ui/skeleton';

interface OrderData {
    id: string; orderNumber: string;
    customer: { name: string; email: string; phone: string; address?: string; city?: string; zip?: string };
    items: { name: string; price: number; quantity: number }[];
    subtotal: number; tax: number; discount: number; total: number;
    orderType: string; paymentMethod: string; paymentStatus: string; cardLast4?: string; createdAt: string;
}

const OC_CSS = `
  @keyframes oc-pop {
    0% { transform: scale(0); opacity: 0; }
    60% { transform: scale(1.15); }
    80% { transform: scale(0.95); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes oc-confetti-fall {
    0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
    100% { transform: translateY(80vh) rotate(360deg); opacity: 0; }
  }
  .oc-check-circle { animation: oc-pop 0.55s cubic-bezier(.4,0,.2,1) both; }
  .oc-confetti-dot { position: absolute; pointer-events: none; border-radius: 50%; animation: oc-confetti-fall linear both; }
  .oc-btn-primary { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px; background: #1E1810; color: white; border: none; border-radius: 14px; font-size: 14.5px; font-weight: 700; font-family: 'Jost', sans-serif; cursor: pointer; text-decoration: none; transition: background 0.2s; }
  .oc-btn-primary:hover { background: #B8853A; }
  .oc-btn-secondary { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px; background: transparent; color: #6B5540; border: 1.5px solid #EDE3D2; border-radius: 14px; font-size: 14.5px; font-weight: 600; font-family: 'Jost', sans-serif; cursor: pointer; text-decoration: none; transition: all 0.2s; }
  .oc-btn-secondary:hover { border-color: #B8853A; color: #B8853A; }
`;

const CONFETTI_COLORS = ['#B8853A', '#2F9555', '#3b82f6', '#f59e0b', '#C53A3A', '#9333ea', '#F2E4C8'];

export default function OrderConfirmed() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const st = location.state as { orderNumber?: string; total?: number; paymentMethod?: string; cardLast4?: string } | null;
    const [order, setOrder] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showConfetti, setShowConfetti] = useState(true);
    const [detailsOpen, setDetailsOpen] = useState(false);

    // ── API call (unchanged) ──────────────────────────────────────────────────
    useEffect(() => {
        if (id) {
            fetch(`/api/orders?action=single&id=${id}`)
                .then((r) => (r.ok ? r.json() : null))
                .then((d) => { if (d) setOrder(d); setLoading(false); })
                .catch(() => setLoading(false));
        } else {
            setLoading(false);
        }
        setTimeout(() => setShowConfetti(false), 3500);
    }, [id]);

    const orderNumber = order?.orderNumber || st?.orderNumber || 'N/A';
    const total = order?.total || st?.total || 0;
    const pm = order?.paymentMethod || st?.paymentMethod || 'cash';
    const last4 = order?.cardLast4 || st?.cardLast4 || '';
    const estimatedTime = 18;

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#F9F4EC', paddingTop: 96, paddingBottom: 64, padding: '96px 24px 64px' }}>
                <div style={{ maxWidth: 680, margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                        <Skeleton className="w-[72px] h-[72px] rounded-full" />
                    </div>
                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                        <Skeleton className="h-8 w-64 rounded-xl" />
                        <Skeleton className="h-4 w-40 rounded-xl" />
                        <Skeleton className="h-7 w-44 rounded-full" />
                    </div>
                    <Skeleton className="h-32 w-full rounded-2xl mb-4" />
                    <Skeleton className="h-24 w-full rounded-2xl mb-4" />
                    <Skeleton className="h-32 w-full rounded-2xl mb-4" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
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
            <style dangerouslySetInnerHTML={{ __html: OC_CSS }} />

            <div style={{ minHeight: '100vh', background: '#F9F4EC', fontFamily: "'Jost', sans-serif", paddingTop: 96, paddingBottom: 64, position: 'relative', overflow: 'hidden' }}>

                {/* Confetti */}
                {showConfetti && (
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                        {Array.from({ length: 28 }).map((_, i) => (
                            <div
                                key={i}
                                className="oc-confetti-dot"
                                style={{
                                    left: `${(i * 37 + 5) % 100}%`,
                                    top: 0,
                                    width: 7 + (i % 4),
                                    height: 7 + (i % 4),
                                    background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                                    animationDuration: `${2.2 + (i % 5) * 0.4}s`,
                                    animationDelay: `${(i % 6) * 0.15}s`,
                                    opacity: 0.8,
                                }}
                            />
                        ))}
                    </div>
                )}

                <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1, textAlign: 'center' }}>

                    {/* Animated checkmark */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                        <div
                            className="oc-check-circle"
                            style={{
                                width: 72, height: 72, borderRadius: '50%',
                                background: '#2F9555', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 8px 32px rgba(47,149,85,0.30)',
                            }}
                        >
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12l5 5L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, color: '#0F0C08', margin: '0 0 8px' }}>Order Confirmed! 🎉</h1>
                    <p style={{ fontSize: 15, color: '#9E8870', margin: '0 0 14px' }}>Thank you for your order</p>

                    {/* Order number pill */}
                    <div style={{ display: 'inline-block', background: '#F2E4C8', border: '1px solid #DDD0BB', borderRadius: 20, padding: '6px 18px', marginBottom: 28 }}>
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: '#B8853A' }}>#{orderNumber}</span>
                    </div>

                    {/* Pickup info card */}
                    <div style={{ background: '#F2E4C8', border: '1px solid #DDD0BB', borderLeft: '4px solid #B8853A', borderRadius: 16, padding: '20px 24px', marginBottom: 16, textAlign: 'center' }}>
                        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: '#1E1810', margin: '0 0 8px' }}>🎉 Ready in {estimatedTime} minutes!</h3>
                        <p style={{ fontSize: 13, color: '#6B5540', margin: '0 0 12px' }}>Please pick up your order at:</p>
                        <p style={{ fontSize: 15, fontWeight: 700, color: '#1E1810', margin: '0 0 4px', fontFamily: "'Cormorant Garamond', serif" }}>Golden Lotus Restaurant</p>
                        <p style={{ fontSize: 13, color: '#6B5540', margin: '0 0 2px' }}>1473 Dorchester Dr, Alexandria, LA 71301</p>
                        <p style={{ fontSize: 13, color: '#6B5540', margin: '0 0 14px' }}>(213) 555-1688</p>
                        <a
                            href="https://maps.google.com?q=1473+Dorchester+Dr+Alexandria+LA+71301"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'inline-block', background: '#B8853A', color: 'white', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 700, textDecoration: 'none', transition: 'background 0.2s' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#1E1810')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = '#B8853A')}
                        >
                            📌 Get Directions
                        </a>
                    </div>

                    {/* Payment confirmation */}
                    <div style={{ background: 'white', borderRadius: 14, border: '1px solid #EDE3D2', padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left' }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F2E4C8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                            {pm === 'card' ? '💳' : '💵'}
                        </div>
                        <div>
                            {pm === 'card' ? (
                                <>
                                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0F0C08', margin: '0 0 2px' }}>Payment of ${total.toFixed(2)} confirmed</p>
                                    {last4 && <p style={{ fontSize: 12, color: '#9E8870', margin: 0 }}>Charged to card ending in {last4}</p>}
                                </>
                            ) : (
                                <>
                                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0F0C08', margin: '0 0 2px' }}>Pay ${total.toFixed(2)} cash on pickup</p>
                                    <p style={{ fontSize: 12, color: '#9E8870', margin: 0 }}>Please have exact change ready</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Third-party delivery */}
                    <div style={{ background: 'white', borderRadius: 14, border: '1px solid #EDE3D2', padding: '20px 24px', marginBottom: 16, textAlign: 'center' }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#1E1810', margin: '0 0 4px', fontFamily: "'Cormorant Garamond', serif" }}>Need someone to pick it up for you? 🛵</p>
                        <p style={{ fontSize: 12, color: '#9E8870', margin: '0 0 16px' }}>Use a delivery platform:</p>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                            {[
                                { label: '🚗 Uber Eats', url: 'https://www.ubereats.com', bg: '#000000' },
                                { label: '🍕 DoorDash', url: 'https://www.doordash.com', bg: '#FF3008' },
                                { label: '🛵 Grubhub', url: 'https://www.grubhub.com', bg: '#F63440' },
                            ].map((btn) => (
                                <a
                                    key={btn.label}
                                    href={btn.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ background: btn.bg, color: 'white', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 700, textDecoration: 'none', transition: 'opacity 0.2s' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                                >
                                    {btn.label}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Order details (collapsible) */}
                    {order && (
                        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #EDE3D2', marginBottom: 24, overflow: 'hidden', textAlign: 'left' }}>
                            <button
                                onClick={() => setDetailsOpen((v) => !v)}
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Jost', sans-serif" }}
                            >
                                <span style={{ fontSize: 14, fontWeight: 600, color: '#0F0C08', display: 'flex', alignItems: 'center', gap: 8 }}>📦 Order Details</span>
                                {detailsOpen ? <ChevronUp style={{ width: 18, height: 18, color: '#9E8870' }} /> : <ChevronDown style={{ width: 18, height: 18, color: '#9E8870' }} />}
                            </button>
                            {detailsOpen && (
                                <div style={{ padding: '0 20px 20px', borderTop: '1px solid #EDE3D2', paddingTop: 16 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                                        {order.items.map((item, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontFamily: "'Jost', sans-serif" }}>
                                                <span style={{ color: '#6B5540' }}>{item.name} × {item.quantity}</span>
                                                <span style={{ fontWeight: 500, color: '#0F0C08' }}>${(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ borderTop: '1px solid #EDE3D2', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#9E8870', fontFamily: "'Jost', sans-serif" }}>
                                            <span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#9E8870', fontFamily: "'Jost', sans-serif" }}>
                                            <span>Tax</span><span>${order.tax.toFixed(2)}</span>
                                        </div>
                                        {order.discount > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#2F9555', fontFamily: "'Jost', sans-serif" }}>
                                                <span>Discount</span><span>−${order.discount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, paddingTop: 8, borderTop: '1px solid #EDE3D2', fontFamily: "'Jost', sans-serif" }}>
                                            <span style={{ color: '#0F0C08' }}>Total</span>
                                            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: '#B8853A' }}>${order.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    {order.customer && (
                                        <div style={{ borderTop: '1px solid #EDE3D2', marginTop: 12, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B5540', fontFamily: "'Jost', sans-serif" }}>
                                                <Mail style={{ width: 14, height: 14, color: '#9E8870' }} /> {order.customer.email}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B5540', fontFamily: "'Jost', sans-serif" }}>
                                                <Phone style={{ width: 14, height: 14, color: '#9E8870' }} /> {order.customer.phone}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* CTA buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <Link to={`/order/${id}/track`} className="oc-btn-primary">
                            Track My Order →
                        </Link>
                        <Link to="/menu" className="oc-btn-secondary">
                            Order More
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
