import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ArrowLeft, ArrowRight, Phone, Mail, User, CreditCard, DollarSign, ShoppingBag, Lock, Check, Loader2, Tag, Clock, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { stripePromise } from '@/lib/stripe';
import { useAuth } from '@/context/AuthContext';
import SEO from '@/components/SEO';

interface CartItem { id: string; name: string; price: number; quantity: number; image?: string; }


const isStripeConfigured = !!(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CHECKOUT_CSS = `
  .co-input { width: 100%; border: 1.5px solid #EDE3D2; border-radius: 10px; padding: 11px 14px; background: #F9F4EC; font-size: 14px; font-family: 'Jost', sans-serif; color: #0F0C08; outline: none; transition: all 0.2s; box-sizing: border-box; }
  .co-input:focus { border-color: #B8853A; background: white; box-shadow: 0 0 0 3px rgba(184,133,58,0.1); }
  .co-input.co-error { border-color: #C53A3A; }
  .co-input.co-error:focus { box-shadow: 0 0 0 3px rgba(197,58,58,0.1); }
  .co-input.co-ok:focus { border-color: #B8853A; }
  .co-input-icon { width: 100%; padding-left: 42px; border: 1.5px solid #EDE3D2; border-radius: 10px; padding-top: 11px; padding-bottom: 11px; padding-right: 14px; background: #F9F4EC; font-size: 14px; font-family: 'Jost', sans-serif; color: #0F0C08; outline: none; transition: all 0.2s; box-sizing: border-box; }
  .co-input-icon:focus { border-color: #B8853A; background: white; box-shadow: 0 0 0 3px rgba(184,133,58,0.1); }
  .co-input-icon.co-error { border-color: #C53A3A; }
  .co-btn-primary { width: 100%; background: #1E1810; color: white; border: none; border-radius: 14px; padding: 16px; font-size: 15px; font-weight: 700; font-family: 'Jost', sans-serif; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
  .co-btn-primary:hover:not(:disabled) { background: #B8853A; box-shadow: 0 6px 24px rgba(184,133,58,0.4); transform: translateY(-1px); }
  .co-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
  .co-schedule-btn { flex: 1; padding: 12px; border-radius: 12px; font-size: 13px; font-weight: 600; border: 1.5px solid #EDE3D2; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: all 0.2s; background: white; color: #6B5540; font-family: 'Jost', sans-serif; }
  .co-schedule-btn.active { border-color: #B8853A; background: rgba(184,133,58,0.05); color: #B8853A; box-shadow: 0 0 0 3px rgba(184,133,58,0.08); }
  .co-pm-option { width: 100%; text-align: left; padding: 15px 18px; border-radius: 14px; border: 1.5px solid #EDE3D2; background: white; cursor: pointer; display: flex; align-items: center; gap: 14px; transition: all 0.2s; font-family: 'Jost', sans-serif; }
  .co-pm-option.selected { border-color: #B8853A; background: rgba(184,133,58,0.03); box-shadow: 0 0 0 3px rgba(184,133,58,0.08); }
  .co-stripe-field { border: 1.5px solid #EDE3D2; border-radius: 10px; padding: 12px 14px; background: white; transition: all 0.2s; }
  .co-stripe-field.focused { border-color: #B8853A; box-shadow: 0 0 0 3px rgba(184,133,58,0.1); }
  .co-stripe-field.errored { border-color: #C53A3A; box-shadow: 0 0 0 3px rgba(197,58,58,0.1); }
`;

// ── Step Indicator ────────────────────────────────────────────────────────────
function StepIndicator({ step }: { step: number }) {
    const steps = ['Details', 'Payment', 'Review'];
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
            {steps.map((label, i) => {
                const n = i + 1;
                const completed = n < step;
                const active = n === step;
                return (
                    <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 14, fontWeight: 700, fontFamily: "'Jost', sans-serif", transition: 'all 0.25s',
                                background: completed ? '#B8853A' : active ? '#1E1810' : 'white',
                                color: (completed || active) ? 'white' : '#9E8870',
                                border: (!completed && !active) ? '1.5px solid #EDE3D2' : 'none',
                                boxShadow: completed ? '0 4px 12px rgba(184,133,58,0.4)' : active ? '0 4px 12px rgba(15,12,8,0.2)' : 'none',
                            }}>
                                {completed ? <Check style={{ width: 18, height: 18 }} /> : n}
                            </div>
                            <span style={{ fontSize: 11, marginTop: 6, fontWeight: active ? 600 : 500, color: completed ? '#B8853A' : active ? '#0F0C08' : '#9E8870', fontFamily: "'Jost', sans-serif" }}>{label}</span>
                        </div>
                        {i < 2 && (
                            <div style={{ width: 72, height: 1.5, margin: '0 8px', marginBottom: 18, background: completed ? '#B8853A' : '#EDE3D2', transition: 'background 0.25s' }} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ── Stripe Card Form ──────────────────────────────────────────────────────────
function CardForm({ name, setName, error, setError }: { name: string; setName: (v: string) => void; error: string; setError: (v: string) => void }) {
    const [nameValid, setNameValid] = useState<boolean | null>(null);
    const [stripeFocused, setStripeFocused] = useState(false);

    const friendlyError = (code: string | undefined, message: string) => {
        const map: Record<string, string> = {
            card_declined: 'Your card was declined. Please try a different card.',
            insufficient_funds: 'Insufficient funds on this card.',
            expired_card: 'Your card has expired.',
            incorrect_cvc: 'Incorrect security code.',
            incomplete_number: 'Please enter your complete card number.',
            incomplete_expiry: 'Please enter a valid expiry date.',
            incomplete_cvc: 'Please enter your CVV code.',
        };
        return map[code || ''] || message || 'Payment failed. Please try again.';
    };

    return (
        <div style={{ marginTop: 14, border: '1px solid #EDE3D2', borderRadius: 14, overflow: 'hidden', background: '#F9F4EC' }}>
            {/* Header bar */}
            <div style={{ background: 'white', borderBottom: '1px solid #EDE3D2', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Lock style={{ width: 13, height: 13, color: '#6B5540' }} />
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#6B5540', fontFamily: "'Jost', sans-serif" }}>Secured by Stripe</span>
                </div>
                <div style={{ display: 'flex', gap: 5 }}>
                    {[{ bg: '#1a1f71', label: 'VISA' }, { bg: '#eb001b', label: 'MC' }, { bg: '#007bc1', label: 'AMEX' }].map((b) => (
                        <div key={b.label} style={{ width: 30, height: 18, borderRadius: 3, background: b.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 7, color: 'white', fontWeight: 800, letterSpacing: '-0.02em' }}>{b.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Form body */}
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Test Mode Notice */}
                <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#1e40af', margin: '0 0 4px', fontFamily: "'Jost', sans-serif" }}>🧪 Test Mode</p>
                    <p style={{ fontSize: 11, color: '#1e40af', margin: 0, lineHeight: 1.5, fontFamily: "'Jost', sans-serif" }}>Use <strong>4242 4242 4242 4242</strong>, any future date, any CVC</p>
                </div>

                {/* Cardholder name */}
                <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B5540', marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>Cardholder Name</label>
                    <div style={{ position: 'relative' }}>
                        <User style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9E8870' }} />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => { setName(e.target.value); if (nameValid !== null) setNameValid(e.target.value.trim().length >= 3); }}
                            onBlur={() => setNameValid(name.trim().length >= 3)}
                            placeholder="Name on card"
                            className={`co-input-icon${nameValid === false ? ' co-error' : ''}`}
                        />
                    </div>
                    {nameValid === false && <p style={{ fontSize: 11, color: '#C53A3A', marginTop: 4, fontFamily: "'Jost', sans-serif" }}>⚠ Min 3 characters required</p>}
                    {nameValid === true && <p style={{ fontSize: 11, color: '#2F9555', marginTop: 4, fontFamily: "'Jost', sans-serif" }}>✓ Name looks good</p>}
                </div>

                {/* Stripe Card Element */}
                <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B5540', marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>Card Details</label>
                    <div className={`co-stripe-field${stripeFocused ? ' focused' : ''}${error ? ' errored' : ''}`}>
                        <CardElement
                            options={{
                                style: {
                                    base: {
                                        fontSize: '15px',
                                        fontFamily: "'Jost', sans-serif",
                                        color: '#0F0C08',
                                        '::placeholder': { color: '#9E8870' },
                                        iconColor: '#B8853A',
                                    },
                                    invalid: { color: '#C53A3A', iconColor: '#C53A3A' },
                                },
                            }}
                            onFocus={() => setStripeFocused(true)}
                            onBlur={() => setStripeFocused(false)}
                            onChange={(e) => {
                                if (e.error) {
                                    setError(friendlyError(e.error.code, e.error.message || ''));
                                } else {
                                    setError('');
                                }
                            }}
                        />
                    </div>
                    {error && (
                        <p style={{ fontSize: 12, color: '#C53A3A', marginTop: 6, display: 'flex', gap: 4, alignItems: 'flex-start', fontFamily: "'Jost', sans-serif" }}>⚠ {error}</p>
                    )}
                </div>

                {/* Trust badges */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, paddingTop: 4 }}>
                    {['🔒 SSL Encrypted', '🛡️ PCI Compliant', '⚡ Powered by Stripe'].map((badge, i) => (
                        <span key={badge} style={{ fontSize: 11, color: '#9E8870', fontFamily: "'Jost', sans-serif", display: 'flex', alignItems: 'center', gap: i > 0 ? 0 : 0, paddingLeft: i > 0 ? 16 : 0, borderLeft: i > 0 ? '1px solid #EDE3D2' : 'none' }}>{badge}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Order Summary Card ────────────────────────────────────────────────────────
function OrderSummary({ cart, subtotal, tax, discountAmount, total, appliedPromo }: {
    cart: CartItem[];
    subtotal: number; tax: number; discountAmount: number; total: number;
    appliedPromo: { code: string; type: string; value: number; label: string } | null;
}) {
    return (
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #EDE3D2', padding: 22, position: 'sticky', top: 24 }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color: '#0F0C08', margin: '0 0 16px', paddingBottom: 14, borderBottom: '1px solid #EDE3D2' }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                {cart.map((item) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {item.image ? (
                            <img src={item.image} alt={item.name} style={{ width: 44, height: 44, borderRadius: 9, objectFit: 'cover', flexShrink: 0 }} loading="lazy" width={44} height={44} />
                        ) : (
                            <div style={{ width: 44, height: 44, borderRadius: 9, background: '#F2E4C8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🍛</div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 500, color: '#0F0C08', margin: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontFamily: "'Jost', sans-serif" }}>{item.name}</p>
                            <p style={{ fontSize: '11.5px', color: '#9E8870', margin: 0, fontFamily: "'Jost', sans-serif" }}>× {item.quantity}</p>
                        </div>
                        <p style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F0C08', margin: 0, flexShrink: 0, fontFamily: "'Jost', sans-serif" }}>${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                ))}
            </div>
            <div style={{ borderTop: '1px solid #EDE3D2', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6B5540', fontFamily: "'Jost', sans-serif" }}>
                    <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6B5540', fontFamily: "'Jost', sans-serif" }}>
                    <span>Tax (8.875%)</span><span>${tax.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#2F9555', fontWeight: 500, fontFamily: "'Jost', sans-serif" }}>
                        <span>Discount ({appliedPromo?.code})</span>
                        <span>−${discountAmount.toFixed(2)}</span>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 10, marginTop: 4, borderTop: '2px solid #1E1810' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#0F0C08', fontFamily: "'Jost', sans-serif" }}>Total</span>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: '#B8853A' }}>${total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}

// ── Main checkout inner ───────────────────────────────────────────────────────
function CheckoutInner() {
    const location = useLocation();
    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();
    const { user, token } = useAuth();

    const state = location.state as { cart: CartItem[]; orderType: 'pickup' } | null;
    const cart: CartItem[] = state?.cart || [];
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
    const [cardName, setCardName] = useState('');
    const [cardError, setCardError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [generalError, setGeneralError] = useState('');
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState<{ code: string; type: string; value: number; label: string } | null>(null);
    const [promoError, setPromoError] = useState('');
    const [promoExpanded, setPromoExpanded] = useState(false);
    const [promoLoading, setPromoLoading] = useState(false);
    const [scheduleType, setScheduleType] = useState<'asap' | 'schedule'>('asap');
    const [scheduleTime, setScheduleTime] = useState('');
    const [isSummaryOpenMobile, setIsSummaryOpenMobile] = useState(false);
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const [cust, setCust] = useState({
        name: user?.name || '', email: user?.email || '', phone: user?.phone || '',
        street: '', apt: '', city: '', stateAddr: '', zip: '', instructions: '',
    });

    // ── Unchanged: redirect if empty cart ─────────────────────────────────────
    useEffect(() => { if (cart.length === 0) navigate('/menu'); }, [cart, navigate]);

    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const discountAmount = appliedPromo
        ? (appliedPromo.type === 'percent' ? subtotal * (appliedPromo.value / 100) : appliedPromo.type === 'fixed' ? appliedPromo.value : 0)
        : 0;
    const tax = (subtotal - discountAmount) * 0.08875;
    const total = subtotal + tax - discountAmount;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setCust((p) => ({ ...p, [e.target.name]: e.target.value }));

    const applyPromo = async () => {
        setPromoError('');
        const code = promoCode.toUpperCase().trim();
        if (!code) { setPromoError('Please enter a promo code'); return; }
        setPromoLoading(true);
        try {
            const res = await fetch('/api/admin?action=validate-promo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, orderTotal: subtotal }),
            });
            const data = await res.json();
            if (data.valid) {
                setAppliedPromo({ code, type: data.type, value: data.value, label: data.label });
            } else {
                setPromoError(data.message || 'Invalid promo code');
            }
        } catch {
            setPromoError('Could not validate code. Please try again.');
        } finally {
            setPromoLoading(false);
        }
    };

    const fieldErrors = useMemo(() => {
        const errors: Record<string, string> = {};
        const name = cust.name.trim();
        const email = cust.email.trim();
        const phone = cust.phone.trim();
        if (!name) errors.name = 'Name is required';
        else if (name.length < 2) errors.name = 'Name must be at least 2 characters';
        if (!email) errors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email is invalid';
        if (!phone) errors.phone = 'Phone is required';
        else if (!/^[\d\s\-\(\)\+]{10,}$/.test(phone)) errors.phone = 'Phone is invalid';
        if (scheduleType === 'schedule' && !scheduleTime) errors.scheduleTime = 'Please choose a pickup time';
        return errors;
    }, [cust.email, cust.name, cust.phone, scheduleTime, scheduleType]);

    const isStep1Valid = Object.keys(fieldErrors).length === 0;

    // ── Unchanged: placeOrder with Stripe + API calls ─────────────────────────
    const placeOrder = async () => {
        setIsProcessing(true);
        setGeneralError('');
        try {
            const localUser: any = user || {};
            const orderData = {
                items: cart.map(item => ({
                    _id: item.id, id: item.id, name: item.name, price: item.price,
                    quantity: item.quantity, specialInstructions: cust.instructions || ''
                })),
                customerName: cust.name || localUser.fullName || localUser.name || '',
                customerEmail: cust.email || localUser.email || '',
                customerPhone: cust.phone || localUser.phone || '',
                orderType: 'pickup',
                pickupTime: scheduleType === 'schedule' ? scheduleTime : 'asap',
                subtotal, tax, discount: discountAmount || 0, total,
                promoCode: appliedPromo?.code || null,
                specialInstructions: cust.instructions || '',
            };

            if (paymentMethod === 'card') {
                if (!stripe || !elements) { setGeneralError('Stripe is loading...'); setIsProcessing(false); return; }
                const piRes = await fetch('/api/stripe?action=create-payment-intent', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items: cart.map((i) => ({ price: i.price, quantity: i.quantity })), discount: discountAmount }),
                });
                if (!piRes.ok) { const e = await piRes.json(); setGeneralError(e.error || 'Payment setup failed'); setIsProcessing(false); return; }
                const { clientSecret, paymentIntentId } = await piRes.json();
                const cardEl = elements.getElement(CardElement);
                if (!cardEl) { setGeneralError('Card element not found'); setIsProcessing(false); return; }
                const result = await stripe.confirmCardPayment(clientSecret, { payment_method: { card: cardEl, billing_details: { name: cardName || cust.name } } });
                if (result.error) { setCardError(result.error.message || 'Payment failed'); setIsProcessing(false); return; }
                if (result.paymentIntent?.status === 'succeeded') {
                    const finalOrderData = { ...orderData, stripePaymentIntentId: paymentIntentId, paymentMethod: 'card', cardLast4: '' };
                    const oRes = await fetch('/api/orders?action=create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(finalOrderData) });
                    if (!oRes.ok) { setGeneralError('Payment OK but order creation failed. Contact support.'); setIsProcessing(false); return; }
                    const od = await oRes.json();
                    if (user && token) { try { await fetch('/api/users?action=loyalty', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ orderId: od.orderId, amount: Math.floor(total), action: 'earned' }) }); } catch { } }
                    navigate(`/order/${od.orderId}/confirmed`, { state: { orderNumber: od.orderNumber, total, paymentMethod: 'card' } });
                }
            } else {
                const finalOrderData = { ...orderData, paymentMethod: 'cod' };
                const oRes = await fetch('/api/orders?action=create', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }, body: JSON.stringify(finalOrderData) });
                if (!oRes.ok) { setGeneralError('Failed to place order'); setIsProcessing(false); return; }
                const od = await oRes.json();
                if (user && token) { try { await fetch('/api/users?action=loyalty', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ orderId: od.orderId, amount: Math.floor(total), action: 'earned' }) }); } catch { } }
                navigate(`/order/${od.orderId}/confirmed`, { state: { orderNumber: od.orderNumber, total, paymentMethod: 'cash' } });
            }
        } catch { setGeneralError('An unexpected error occurred'); setIsProcessing(false); }
    };

    if (cart.length === 0) return null;

    const inputCls = (field: string) => `co-input-icon${touched[field] && fieldErrors[field] ? ' co-error' : ''}`;
    const inputNoCls = (field: string) => `co-input${touched[field] && fieldErrors[field] ? ' co-error' : ''}`;

    return (
        <>
            <SEO
                title="Checkout | Golden Lotus Restaurant"
                description="Complete your order at Golden Lotus. Secure payment options including credit card and cash on pickup."
                url="https://www.goldenlotusgrill.com/checkout"
                noIndex={true}
            />
            <style dangerouslySetInnerHTML={{ __html: CHECKOUT_CSS }} />

            <div style={{ minHeight: '100vh', background: '#F9F4EC', fontFamily: "'Jost', sans-serif", paddingTop: 96, paddingBottom: 64 }}>
                <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 24px' }}>

                    {/* Back button */}
                    <button
                        onClick={() => step > 1 ? setStep(step - 1) : navigate('/menu')}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#6B5540', fontSize: 14, fontWeight: 500, cursor: 'pointer', marginBottom: 24, fontFamily: "'Jost', sans-serif', transition: 'color 0.2s" }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#B8853A'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#6B5540'}
                    >
                        <ArrowLeft style={{ width: 18, height: 18 }} />
                        {step > 1 ? 'Back' : 'Back to Menu'}
                    </button>

                    {/* Title */}
                    <div style={{ marginBottom: 28 }}>
                        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B8853A', margin: '0 0 4px' }}>Checkout</p>
                        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, color: '#0F0C08', margin: 0 }}>Review & place your order</h1>
                        <p style={{ fontSize: 13, color: '#9E8870', margin: '4px 0 0', fontFamily: "'Jost', sans-serif" }}>Pickup only · Alexandria, LA</p>
                    </div>

                    {/* Stripe not configured warning */}
                    {!isStripeConfigured && (
                        <div style={{ background: '#FEF3C7', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 14, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#92400E', fontFamily: "'Jost', sans-serif" }}>
                            <strong>Stripe not configured:</strong> Card payments are disabled. Cash on pickup is still available.
                        </div>
                    )}

                    <StepIndicator step={step} />

                    {/* Mobile summary toggle */}
                    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #EDE3D2', padding: '14px 18px', marginBottom: 20, display: 'block' }} className="lg:hidden">
                        <button
                            type="button"
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Jost', sans-serif" }}
                            onClick={() => setIsSummaryOpenMobile((v) => !v)}
                        >
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 600, color: '#0F0C08', margin: 0 }}>Order summary</p>
                                <p style={{ fontSize: 13, color: '#9E8870', margin: 0 }}>{cart.length} items · <span style={{ fontWeight: 600, color: '#B8853A' }}>${total.toFixed(2)}</span></p>
                            </div>
                            {isSummaryOpenMobile ? <ChevronUp style={{ width: 18, height: 18, color: '#9E8870' }} /> : <ChevronDown style={{ width: 18, height: 18, color: '#9E8870' }} />}
                        </button>
                        {isSummaryOpenMobile && (
                            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #EDE3D2' }}>
                                <OrderSummary cart={cart} subtotal={subtotal} tax={tax} discountAmount={discountAmount} total={total} appliedPromo={appliedPromo} />
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }} className="grid-co">
                        {/* ── MAIN COLUMN ── */}
                        <div>
                            {/* ─ STEP 1: Details ────────────────────────── */}
                            <div style={{ display: step === 1 ? 'block' : 'none' }}>
                                <div style={{ background: 'white', borderRadius: 20, border: '1px solid #EDE3D2', padding: 28, boxShadow: '0 2px 16px rgba(15,12,8,0.05)' }}>
                                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: '#0F0C08', margin: '0 0 4px' }}>Your Details</h2>
                                    <p style={{ fontSize: '12.5px', color: '#9E8870', margin: '0 0 20px', fontFamily: "'Jost', sans-serif" }}>📍 Your order will be ready for pickup</p>

                                    {/* Pickup location card */}
                                    <div style={{ background: '#F2E4C8', border: '1px solid #DDD0BB', borderLeft: '4px solid #B8853A', borderRadius: 14, padding: '16px 18px', marginBottom: 20 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                            <MapPin style={{ width: 16, height: 16, color: '#B8853A' }} />
                                            <span style={{ fontSize: 14, fontWeight: 700, color: '#1E1810', fontFamily: "'Jost', sans-serif" }}>Golden Lotus Restaurant</span>
                                        </div>
                                        <p style={{ fontSize: 13, color: '#6B5540', margin: '0 0 2px', lineHeight: 1.6, fontFamily: "'Jost', sans-serif" }}>1473 Dorchester Dr, Alexandria, LA 71301</p>
                                        <p style={{ fontSize: 13, color: '#6B5540', margin: '0 0 10px', fontFamily: "'Jost', sans-serif" }}>(213) 555-1688</p>
                                        <a
                                            href="https://maps.google.com?q=1473+Dorchester+Dr+Alexandria+LA+71301"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ fontSize: 13, fontWeight: 600, color: '#B8853A', display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                                        >
                                            📌 Get Directions →
                                        </a>
                                    </div>

                                    {/* Pickup time */}
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#6B5540', marginBottom: 10, fontFamily: "'Jost', sans-serif" }}>When do you want to pick up?</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                            <button
                                                type="button"
                                                className={`co-schedule-btn${scheduleType === 'asap' ? ' active' : ''}`}
                                                onClick={() => { setScheduleType('asap'); setTouched((t) => ({ ...t, scheduleTime: false })); }}
                                            >
                                                <Clock style={{ width: 15, height: 15 }} />
                                                <span>ASAP — 15–20 min</span>
                                            </button>
                                            <button
                                                type="button"
                                                className={`co-schedule-btn${scheduleType === 'schedule' ? ' active' : ''}`}
                                                onClick={() => setScheduleType('schedule')}
                                            >
                                                <Clock style={{ width: 15, height: 15 }} />
                                                <span>Schedule Later</span>
                                            </button>
                                        </div>
                                        {scheduleType === 'schedule' && (
                                            <div style={{ marginTop: 12 }}>
                                                <input
                                                    type="datetime-local"
                                                    value={scheduleTime}
                                                    onChange={(e) => { setScheduleTime(e.target.value); }}
                                                    onBlur={() => setTouched((t) => ({ ...t, scheduleTime: true }))}
                                                    className={inputNoCls('scheduleTime')}
                                                    style={{ marginTop: 0 }}
                                                />
                                                {touched.scheduleTime && fieldErrors.scheduleTime && (
                                                    <p style={{ fontSize: 11, color: '#C53A3A', marginTop: 4, fontFamily: "'Jost', sans-serif" }}>⚠ {fieldErrors.scheduleTime}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <hr style={{ border: 'none', borderTop: '1px solid #EDE3D2', margin: '0 0 20px' }} />

                                    {/* Form fields */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                        {/* Full Name */}
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#6B5540', marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>Full Name *</label>
                                            <div style={{ position: 'relative' }}>
                                                <User style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9E8870' }} />
                                                <input
                                                    name="name" value={cust.name}
                                                    onChange={(e) => { handleChange(e); if (touched.name) setTouched((t) => ({ ...t, name: true })); }}
                                                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                                                    placeholder="Your full name"
                                                    className={inputCls('name')}
                                                />
                                            </div>
                                            {touched.name && fieldErrors.name && <p style={{ fontSize: 11, color: '#C53A3A', marginTop: 4, fontFamily: "'Jost', sans-serif" }}>⚠ {fieldErrors.name}</p>}
                                        </div>

                                        {/* Email + Phone */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#6B5540', marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>Email *</label>
                                                <div style={{ position: 'relative' }}>
                                                    <Mail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9E8870' }} />
                                                    <input
                                                        name="email" type="email" value={cust.email}
                                                        onChange={(e) => { handleChange(e); if (touched.email) setTouched((t) => ({ ...t, email: true })); }}
                                                        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                                                        placeholder="your@email.com"
                                                        className={inputCls('email')}
                                                    />
                                                </div>
                                                {touched.email && fieldErrors.email && <p style={{ fontSize: 11, color: '#C53A3A', marginTop: 4, fontFamily: "'Jost', sans-serif" }}>⚠ {fieldErrors.email}</p>}
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#6B5540', marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>Phone *</label>
                                                <div style={{ position: 'relative' }}>
                                                    <Phone style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9E8870' }} />
                                                    <input
                                                        name="phone" value={cust.phone}
                                                        onChange={(e) => { handleChange(e); if (touched.phone) setTouched((t) => ({ ...t, phone: true })); }}
                                                        onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                                                        placeholder="(555) 123-4567"
                                                        className={inputCls('phone')}
                                                    />
                                                </div>
                                                {touched.phone && fieldErrors.phone && <p style={{ fontSize: 11, color: '#C53A3A', marginTop: 4, fontFamily: "'Jost', sans-serif" }}>⚠ {fieldErrors.phone}</p>}
                                            </div>
                                        </div>

                                        {/* Special instructions */}
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#6B5540', marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>Special Instructions <span style={{ fontWeight: 400, color: '#9E8870' }}>(optional)</span></label>
                                            <textarea
                                                name="instructions" value={cust.instructions}
                                                onChange={handleChange}
                                                rows={2}
                                                placeholder="Allergies, preferences, special requests..."
                                                className="co-input"
                                                style={{ resize: 'none', paddingLeft: 14 }}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="co-btn-primary"
                                        style={{ marginTop: 24 }}
                                        onClick={() => {
                                            setTouched((t) => ({ ...t, name: true, email: true, phone: true, scheduleTime: scheduleType === 'schedule' }));
                                            if (!isStep1Valid) return;
                                            setStep(2);
                                        }}
                                        disabled={isProcessing}
                                    >
                                        Continue to Payment <ArrowRight style={{ width: 18, height: 18 }} />
                                    </button>
                                </div>
                            </div>

                            {/* ─ STEP 2: Payment ────────────────────────── */}
                            <div style={{ display: step === 2 ? 'block' : 'none' }}>
                                <div style={{ background: 'white', borderRadius: 20, border: '1px solid #EDE3D2', padding: 28, boxShadow: '0 2px 16px rgba(15,12,8,0.05)' }}>
                                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: '#0F0C08', margin: '0 0 4px' }}>Payment Method</h2>
                                    <p style={{ fontSize: '12.5px', color: '#9E8870', margin: '0 0 20px', fontFamily: "'Jost', sans-serif" }}>🔒 Your payment is 256-bit SSL secured</p>

                                    {/* Payment options */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                                        {/* Cash on Pickup */}
                                        <div>
                                            <button
                                                type="button"
                                                className={`co-pm-option${paymentMethod === 'cash' ? ' selected' : ''}`}
                                                onClick={() => setPaymentMethod('cash')}
                                            >
                                                <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${paymentMethod === 'cash' ? '#B8853A' : '#DDD0BB'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    {paymentMethod === 'cash' && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#B8853A' }} />}
                                                </div>
                                                <DollarSign style={{ width: 22, height: 22, color: '#2F9555', flexShrink: 0 }} />
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0F0C08', margin: 0, fontFamily: "'Jost', sans-serif" }}>Cash on Pickup</p>
                                                    <p style={{ fontSize: 12, color: '#9E8870', margin: 0, fontFamily: "'Jost', sans-serif" }}>Pay when you collect your order</p>
                                                </div>
                                                <span style={{ background: 'rgba(47,149,85,0.1)', color: '#2F9555', borderRadius: 20, fontSize: 10, fontWeight: 700, padding: '3px 8px', flexShrink: 0, fontFamily: "'Jost', sans-serif" }}>No fees</span>
                                            </button>
                                        </div>

                                        {/* Credit/Debit Card */}
                                        <div>
                                            <button
                                                type="button"
                                                className={`co-pm-option${paymentMethod === 'card' ? ' selected' : ''}`}
                                                onClick={() => setPaymentMethod('card')}
                                            >
                                                <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${paymentMethod === 'card' ? '#B8853A' : '#DDD0BB'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    {paymentMethod === 'card' && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#B8853A' }} />}
                                                </div>
                                                <CreditCard style={{ width: 22, height: 22, color: '#3b82f6', flexShrink: 0 }} />
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0F0C08', margin: 0, fontFamily: "'Jost', sans-serif" }}>Credit / Debit Card</p>
                                                    <p style={{ fontSize: 12, color: '#9E8870', margin: 0, fontFamily: "'Jost', sans-serif" }}>Visa, Mastercard, American Express</p>
                                                </div>
                                                <span style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', borderRadius: 20, fontSize: 10, fontWeight: 700, padding: '3px 8px', flexShrink: 0, fontFamily: "'Jost', sans-serif" }}>Secure</span>
                                            </button>
                                            {paymentMethod === 'card' && (
                                                <CardForm name={cardName} setName={setCardName} error={cardError} setError={setCardError} />
                                            )}
                                        </div>
                                    </div>

                                    {/* Promo code */}
                                    <div style={{ borderTop: '1px solid #EDE3D2', paddingTop: 18, marginBottom: 20 }}>
                                        <button
                                            type="button"
                                            onClick={() => setPromoExpanded((v) => !v)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12.5px', fontWeight: 600, color: '#6B5540', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Jost', sans-serif" }}
                                        >
                                            <Tag style={{ width: 14, height: 14 }} />
                                            🏷️ Have a promo code?
                                            {promoExpanded ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}
                                        </button>
                                        {promoExpanded && (
                                            <div style={{ marginTop: 12 }}>
                                                <div style={{ display: 'flex', gap: 10 }}>
                                                    <div style={{ flex: 1, position: 'relative' }}>
                                                        <Tag style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#9E8870' }} />
                                                        <input
                                                            value={promoCode}
                                                            onChange={(e) => setPromoCode(e.target.value)}
                                                            placeholder="Enter code"
                                                            disabled={!!appliedPromo}
                                                            className="co-input-icon"
                                                        />
                                                    </div>
                                                    {appliedPromo ? (
                                                        <button type="button" onClick={() => { setAppliedPromo(null); setPromoCode(''); }} style={{ padding: '11px 16px', border: '1.5px solid #C53A3A', color: '#C53A3A', background: 'white', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Jost', sans-serif", whiteSpace: 'nowrap' }}>Remove</button>
                                                    ) : (
                                                        <button type="button" onClick={applyPromo} disabled={promoLoading} style={{ padding: '11px 20px', background: '#1E1810', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: promoLoading ? 'not-allowed' : 'pointer', fontFamily: "'Jost', sans-serif", whiteSpace: 'nowrap', opacity: promoLoading ? 0.7 : 1 }}>{promoLoading ? '...' : 'Apply'}</button>
                                                    )}
                                                </div>
                                                {promoError && (
                                                    <div style={{ marginTop: 8, background: 'rgba(197,58,58,0.06)', border: '1px solid rgba(197,58,58,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#C53A3A', fontFamily: "'Jost', sans-serif" }}>✗ {promoError}</div>
                                                )}
                                                {appliedPromo && (
                                                    <div style={{ marginTop: 8, background: 'rgba(47,149,85,0.06)', border: '1px solid rgba(47,149,85,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#2F9555', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Jost', sans-serif" }}>
                                                        <Check style={{ width: 14, height: 14 }} /> ✓ Code applied! {appliedPromo.label}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <button type="button" className="co-btn-primary" onClick={() => setStep(3)}>
                                        Review Order <ArrowRight style={{ width: 18, height: 18 }} />
                                    </button>
                                    <p style={{ textAlign: 'center', fontSize: '11.5px', color: '#9E8870', marginTop: 12, fontFamily: "'Jost', sans-serif" }}>🔒 Your order and payment are fully secured</p>
                                </div>
                            </div>

                            {/* ─ STEP 3: Review ─────────────────────────── */}
                            <div style={{ display: step === 3 ? 'block' : 'none' }}>
                                <div style={{ background: 'white', borderRadius: 20, border: '1px solid #EDE3D2', padding: 28, boxShadow: '0 2px 16px rgba(15,12,8,0.05)' }}>
                                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: '#0F0C08', margin: '0 0 20px' }}>Review Your Order</h2>

                                    {/* Customer summary */}
                                    <div style={{ background: '#F9F4EC', borderRadius: 14, padding: '14px 18px', marginBottom: 16, border: '1px solid #EDE3D2' }}>
                                        <p style={{ fontSize: 14, fontWeight: 600, color: '#0F0C08', margin: '0 0 2px', fontFamily: "'Jost', sans-serif" }}>{cust.name}</p>
                                        <p style={{ fontSize: 13, color: '#6B5540', margin: '0 0 2px', fontFamily: "'Jost', sans-serif" }}>{cust.email} · {cust.phone}</p>
                                        <p style={{ fontSize: 13, color: '#B8853A', fontWeight: 600, margin: 0, fontFamily: "'Jost', sans-serif" }}>
                                            Pickup · {scheduleType === 'asap' ? 'ASAP' : scheduleTime}
                                        </p>
                                    </div>

                                    {/* Items */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                                        {cart.map((item) => (
                                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                {item.image && <img src={item.image} alt={item.name} style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} loading="lazy" width={52} height={52} />}
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontSize: 13, fontWeight: 500, color: '#0F0C08', margin: 0, fontFamily: "'Jost', sans-serif" }}>{item.name}</p>
                                                    <p style={{ fontSize: 12, color: '#9E8870', margin: 0, fontFamily: "'Jost', sans-serif" }}>× {item.quantity}</p>
                                                </div>
                                                <p style={{ fontSize: 13, fontWeight: 600, color: '#0F0C08', margin: 0, fontFamily: "'Jost', sans-serif" }}>${(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Price breakdown */}
                                    <div style={{ background: '#F9F4EC', borderRadius: 14, padding: '14px 18px', marginBottom: 14, border: '1px solid #EDE3D2' }}>
                                        {[
                                            { label: 'Subtotal', value: `$${subtotal.toFixed(2)}`, color: '#6B5540' },
                                            { label: 'Tax (8.875%)', value: `$${tax.toFixed(2)}`, color: '#6B5540' },
                                        ].map((row) => (
                                            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: row.color, marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>
                                                <span>{row.label}</span><span>{row.value}</span>
                                            </div>
                                        ))}
                                        {discountAmount > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#2F9555', fontWeight: 500, marginBottom: 6, fontFamily: "'Jost', sans-serif" }}>
                                                <span>Discount ({appliedPromo?.code})</span>
                                                <span>−${discountAmount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 10, marginTop: 4, borderTop: '2px solid #1E1810' }}>
                                            <span style={{ fontSize: 14, fontWeight: 700, color: '#0F0C08', fontFamily: "'Jost', sans-serif" }}>Total</span>
                                            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: '#B8853A' }}>${total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Payment method summary */}
                                    <div style={{ background: '#F9F4EC', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#6B5540', border: '1px solid #EDE3D2', fontFamily: "'Jost', sans-serif" }}>
                                        Payment: {paymentMethod === 'cash' ? '💵 Cash on Pickup' : '💳 Credit Card'}
                                    </div>

                                    {generalError && (
                                        <div style={{ background: 'rgba(197,58,58,0.06)', border: '1px solid rgba(197,58,58,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#C53A3A', fontFamily: "'Jost', sans-serif" }}>
                                            {generalError}
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        className="co-btn-primary"
                                        onClick={placeOrder}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing
                                            ? <><Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> Processing...</>
                                            : <><ShoppingBag style={{ width: 18, height: 18 }} /> Place Order — ${total.toFixed(2)}</>
                                        }
                                    </button>
                                    <p style={{ textAlign: 'center', fontSize: '11.5px', color: '#9E8870', marginTop: 12, fontFamily: "'Jost', sans-serif" }}>🔒 Your order is safe and secure</p>
                                </div>
                            </div>
                        </div>

                        {/* ── SIDEBAR (desktop) ── */}
                        <div className="hidden lg:block">
                            <OrderSummary cart={cart} subtotal={subtotal} tax={tax} discountAmount={discountAmount} total={total} appliedPromo={appliedPromo} />
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @media (max-width: 1023px) { .grid-co { grid-template-columns: 1fr !important; } .hidden.lg\\:block { display: none !important; } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            ` }} />
        </>
    );
}

export default function Checkout() {
    return <Elements stripe={stripePromise}><CheckoutInner /></Elements>;
}
