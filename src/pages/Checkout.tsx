import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ArrowLeft, ArrowRight, Phone, Mail, User, CreditCard, DollarSign, ShoppingBag, Lock, Check, Loader2, Tag, Clock, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { stripePromise } from '@/lib/stripe';
import { useAuth } from '@/context/AuthContext';
import SEO from '@/components/SEO';

interface CartItem { id: string; name: string; price: number; quantity: number; image?: string; }

const PROMOS: Record<string, { type: string; value: number; minOrder: number; label: string; dayOnly?: number }> = {
    DIMSUM10: { type: 'percent', value: 10, minOrder: 50, label: '10% off orders over $50' },
    FREEDELIVERY: { type: 'freeDelivery', value: 0, minOrder: 40, label: 'Free delivery on orders over $40' },
    BOBAMONDAY: { type: 'fixed', value: 5, minOrder: 0, label: '$5 off on Mondays', dayOnly: 1 },
};

// Check if Stripe is configured
const isStripeConfigured = !!(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function StepIndicator({ step }: { step: number }) {
                const steps = ['Details', 'Payment', 'Review'];
    return (
        <div className="flex items-center justify-center mb-8">
            {steps.map((label, i) => {
                const n = i + 1;
                const completed = n < step;
                const active = n === step;
                return (
                    <div key={label} className="flex items-center">
                        <div className="flex flex-col items-center">
                            <div
                                className={[
                                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200",
                                    completed ? "bg-[#2F9555] text-white" : active ? "bg-[#D9772A] text-white" : "bg-[#E0D5E4] text-[#8C8297]"
                                ].join(" ")}
                                style={active ? { boxShadow: '0 18px 40px rgba(15,10,20,0.18)' } : undefined}
                            >
                                {completed ? <Check className="w-5 h-5" /> : n}
                            </div>
                            <span className={`text-xs mt-2 font-medium ${n <= step ? 'text-[#D9772A]' : 'text-[#9CA3AF]'}`}>{label}</span>
                        </div>
                        {i < 2 && (
                            <div className={`w-12 sm:w-20 h-0.5 mx-3 transition-all ${completed ? 'bg-[#D9772A]' : 'bg-[#E0D5E4]'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function CardForm({ name, setName, error, setError }: { name: string; setName: (v: string) => void; error: string; setError: (v: string) => void }) {
    return (
        <div className="space-y-4 mt-4">
            {/* Test Mode Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">🧪 Test Mode Active</p>
                <p className="text-xs text-blue-700 mb-2">Use these test card numbers:</p>
                <div className="space-y-1 text-xs text-blue-800">
                    <p>✅ <strong>Success:</strong> 4242 4242 4242 4242</p>
                    <p>❌ <strong>Decline:</strong> 4000 0000 0000 0002</p>
                    <p>📅 <strong>Any future expiry date</strong> (e.g., 12/30)</p>
                    <p>🔒 <strong>Any 3-digit CVC</strong> (e.g., 123)</p>
                    <p>📮 <strong>Any ZIP code</strong> (e.g., 12345)</p>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Cardholder Name</label>
                <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name on card" className="w-full pl-11 pr-4 py-3 border border-[#E0D5E4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D9772A]/45 focus:border-[#D9772A] bg-white transition-all text-[16px]" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Card Details</label>
                <div className="border border-[#E0D5E4] rounded-xl p-4 bg-white focus-within:ring-2 focus-within:ring-[#D9772A]/45 focus-within:border-[#D9772A] transition-all">
                    <CardElement options={{ style: { base: { fontSize: '16px', color: '#1a1a1a', fontFamily: 'system-ui, sans-serif', '::placeholder': { color: '#9ca3af' } }, invalid: { color: '#ef4444' } } }} onChange={(e) => setError(e.error?.message || '')} />
                </div>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-xs"><Lock className="w-3.5 h-3.5" /><span>Secured by Stripe (Test Mode)</span></div>
        </div>
    );
}

function CheckoutInner() {
    const location = useLocation();
    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();
    const { user, token } = useAuth();

    const state = location.state as { cart: CartItem[]; orderType: 'pickup' } | null;
    const cart: CartItem[] = state?.cart || [];
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'paypal'>('cash');
    const [cardName, setCardName] = useState('');
    const [cardError, setCardError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [generalError, setGeneralError] = useState('');
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState<{ code: string; type: string; value: number; label: string } | null>(null);
    const [promoError, setPromoError] = useState('');
    const [scheduleType, setScheduleType] = useState<'asap' | 'schedule'>('asap');
    const [scheduleTime, setScheduleTime] = useState('');
    const [isSummaryOpenMobile, setIsSummaryOpenMobile] = useState(false);
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const [cust, setCust] = useState({
        name: user?.name || '', email: user?.email || '', phone: user?.phone || '',
        street: '', apt: '', city: '', stateAddr: '', zip: '', instructions: '',
    });

    useEffect(() => { if (cart.length === 0) navigate('/menu'); }, [cart, navigate]);

    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const discountAmount = appliedPromo ? (appliedPromo.type === 'percent' ? subtotal * (appliedPromo.value / 100) : appliedPromo.type === 'fixed' ? appliedPromo.value : 0) : 0;
    const tax = (subtotal - discountAmount) * 0.08875;
    const total = subtotal + tax - discountAmount;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCust((p) => ({ ...p, [e.target.name]: e.target.value }));

    const applyPromo = () => {
        setPromoError('');
        const code = promoCode.toUpperCase().trim();
        const promo = PROMOS[code];
        if (!promo) { setPromoError('Invalid promo code'); return; }
        if (subtotal < promo.minOrder) { setPromoError(`Minimum order of $${promo.minOrder} required`); return; }
        if (promo.dayOnly !== undefined && new Date().getDay() !== promo.dayOnly) { setPromoError('This promo is only valid on Mondays'); return; }
        setAppliedPromo({ code, ...promo });
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

    const placeOrder = async () => {
        setIsProcessing(true);
        setGeneralError('');
        try {
            const localUser: any = user || {};
            const orderData = {
                // Items from cart
                items: cart.map(item => ({
                    _id: item.id,
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    specialInstructions: cust.instructions || ''
                })),
                
                // Customer info
                customerName: cust.name || localUser.fullName || localUser.name || '',
                customerEmail: cust.email || localUser.email || '',
                customerPhone: cust.phone || localUser.phone || '',
                
                // Order details
                orderType: 'pickup',
                pickupTime: scheduleType === 'schedule' ? scheduleTime : 'asap',
                
                // Pricing
                subtotal: subtotal,
                tax: tax,
                discount: discountAmount || 0,
                total: total,
                promoCode: appliedPromo?.code || null,
                specialInstructions: cust.instructions || ''
            };

            if (paymentMethod === 'card') {
                if (!stripe || !elements) { setGeneralError('Stripe is loading...'); setIsProcessing(false); return; }
                const piRes = await fetch('/api/stripe?action=create-payment-intent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: cart.map((i) => ({ price: i.price, quantity: i.quantity })), discount: discountAmount }) });
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
                const finalOrderData = { ...orderData, paymentMethod: paymentMethod === 'cash' ? 'cod' : paymentMethod };
                const oRes = await fetch('/api/orders?action=create', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }, body: JSON.stringify(finalOrderData) });
                if (!oRes.ok) { setGeneralError('Failed to place order'); setIsProcessing(false); return; }
                const od = await oRes.json();
                if (user && token) { try { await fetch('/api/users?action=loyalty', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ orderId: od.orderId, amount: Math.floor(total), action: 'earned' }) }); } catch { } }
                navigate(`/order/${od.orderId}/confirmed`, { state: { orderNumber: od.orderNumber, total, paymentMethod: 'cash' } });
            }
        } catch { setGeneralError('An unexpected error occurred'); setIsProcessing(false); }
    };

    if (cart.length === 0) return null;

    const inputClsBase = "w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-white transition-all text-[16px]";
    const inputNoClsBase = "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 bg-white transition-all text-[16px]";
    const inputErrorCls = "border-[#C53A3A] focus:ring-[#C53A3A]/25 focus:border-[#C53A3A]";
    const inputOkCls = "border-[#E0D5E4] focus:ring-[#D9772A]/45 focus:border-[#D9772A]";

    return (
        <>
            <SEO 
                title="Checkout | Golden Lotus Restaurant"
                description="Complete your order at Golden Lotus. Secure payment options including credit card and cash on delivery."
                url="https://www.goldenlotusgrill.com/checkout"
                noIndex={true}
            />
        <div className="min-h-screen bg-[#FBF7F1] pt-28 pb-16 px-4">
            <div className="max-w-[1024px] mx-auto">
                <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/menu')} className="flex items-center gap-2 text-[#4B4655] hover:text-[#D9772A] mb-6 transition-colors">
                    <ArrowLeft className="w-5 h-5" />{step > 1 ? 'Back' : 'Back to Menu'}
                </button>
                <div className="mb-6">
                    <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[#D9772A]">Checkout</p>
                    <h1 className="text-3xl sm:text-4xl font-bold text-[#111827]">Review & place your order</h1>
                    <p className="text-[#6B7280] mt-1">Pickup only • Alexandria, LA</p>
                </div>
                
                {/* Stripe Configuration Warning */}
                {!isStripeConfigured && (
                    <div className="bg-[#FEF3C7] border border-[#F59E0B]/30 rounded-2xl p-4 mb-6">
                        <p className="text-sm text-[#92400E]">
                            <strong>Stripe not configured:</strong> Card payments are disabled. Cash on delivery is still available.
                        </p>
                    </div>
                )}
                
                <StepIndicator step={step} />

                <div className="grid lg:grid-cols-5 gap-8">
                    {/* MAIN */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Mobile Summary Toggle */}
                        <div className="lg:hidden bg-white rounded-2xl border border-[#F3F4F6] shadow-sm p-4">
                            <button
                                type="button"
                                className="w-full flex items-center justify-between"
                                onClick={() => setIsSummaryOpenMobile(v => !v)}
                                aria-label="Toggle order summary"
                            >
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-[#111827]">Order summary</p>
                                    <p className="text-sm text-[#6B7280]">{cart.length} items • <span className="font-semibold text-[#F97316]">${total.toFixed(2)}</span></p>
                                </div>
                                {isSummaryOpenMobile ? <ChevronUp className="w-5 h-5 text-[#6B7280]" /> : <ChevronDown className="w-5 h-5 text-[#6B7280]" />}
                            </button>
                            {isSummaryOpenMobile && (
                                <div className="mt-4 pt-4 border-t border-[#E0D5E4] space-y-3">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover" loading="lazy" width={48} height={48} />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-[#FFF7ED] flex items-center justify-center">
                                                    <ShoppingBag className="w-5 h-5 text-[#F97316]" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-[#111827] line-clamp-1">{item.name}</p>
                                                <p className="text-xs text-[#6B7280]">x{item.quantity}</p>
                                            </div>
                                            <p className="text-sm font-semibold text-[#111827]">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* STEP 1 */}
                        <div className={step === 1 ? 'block' : 'hidden'}>
                            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5 border border-[#F3F4F6]">
                                <div className="bg-[#FFF7ED] rounded-2xl p-4 border border-[#FED7AA]">
                                    <h3 className="font-semibold text-[#111827] flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-[#F97316]" />
                                        Pickup Location
                                    </h3>
                                    <p className="text-[#374151] mt-1">Golden Lotus Restaurant</p>
                                    <p className="text-[#374151]">1473 Dorchester Dr, Alexandria, LA 71301</p>
                                    <p className="text-[#374151]">(213) 555-1688</p>
                                    <a 
                                      href="https://maps.google.com?q=1473+Dorchester+Dr+Alexandria+LA+71301"
                                      target="_blank"
                                      className="text-[#F97316] text-sm mt-2 inline-block font-semibold"
                                    >
                                      📌 Get Directions →
                                    </a>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-[#374151] mb-1.5">Full Name *</label>
                                        <div className="relative">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                                            <input
                                                name="name"
                                                value={cust.name}
                                                onChange={(e) => { handleChange(e); if (touched.name) setTouched(t => ({ ...t, name: true })); }}
                                                onBlur={() => setTouched(t => ({ ...t, name: true }))}
                                                placeholder="John Doe"
                                                className={`${inputClsBase} ${touched.name && fieldErrors.name ? inputErrorCls : inputOkCls}`}
                                            />
                                        </div>
                                        {touched.name && fieldErrors.name && <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#374151] mb-1.5">Email *</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                                            <input
                                                name="email"
                                                type="email"
                                                value={cust.email}
                                                onChange={(e) => { handleChange(e); if (touched.email) setTouched(t => ({ ...t, email: true })); }}
                                                onBlur={() => setTouched(t => ({ ...t, email: true }))}
                                                placeholder="john@email.com"
                                                className={`${inputClsBase} ${touched.email && fieldErrors.email ? inputErrorCls : inputOkCls}`}
                                            />
                                        </div>
                                        {touched.email && fieldErrors.email && <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#374151] mb-1.5">Phone *</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                                            <input
                                                name="phone"
                                                value={cust.phone}
                                                onChange={(e) => { handleChange(e); if (touched.phone) setTouched(t => ({ ...t, phone: true })); }}
                                                onBlur={() => setTouched(t => ({ ...t, phone: true }))}
                                                placeholder="(555) 123-4567"
                                                className={`${inputClsBase} ${touched.phone && fieldErrors.phone ? inputErrorCls : inputOkCls}`}
                                            />
                                        </div>
                                        {touched.phone && fieldErrors.phone && <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.phone}</p>}
                                    </div>
                                </div>

                                {/* Schedule */}
                                <div className="pt-2 border-t space-y-3">
                                    <label className="block text-sm font-medium text-[#374151]">When do you want it?</label>
                                    <div className="flex gap-3">
                                        <button type="button" onClick={() => { setScheduleType('asap'); setTouched(t => ({ ...t, scheduleTime: false })); }} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 flex items-center justify-center gap-2 transition-all ${scheduleType === 'asap' ? 'border-[#F97316] bg-[#FFF7ED] text-[#F97316]' : 'border-[#E5E7EB] text-[#6B7280]'}`}><Clock className="w-4 h-4" /> ASAP — Ready in 15–20 min</button>
                                        <button type="button" onClick={() => setScheduleType('schedule')} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 flex items-center justify-center gap-2 transition-all ${scheduleType === 'schedule' ? 'border-[#F97316] bg-[#FFF7ED] text-[#F97316]' : 'border-[#E5E7EB] text-[#6B7280]'}`}><Clock className="w-4 h-4" /> Schedule</button>
                                    </div>
                                    {scheduleType === 'schedule' && (
                                        <div>
                                            <input
                                                type="datetime-local"
                                                value={scheduleTime}
                                                onChange={(e) => { setScheduleTime(e.target.value); if (touched.scheduleTime) setTouched(t => ({ ...t, scheduleTime: true })); }}
                                                onBlur={() => setTouched(t => ({ ...t, scheduleTime: true }))}
                                                className={`${inputNoClsBase} ${touched.scheduleTime && fieldErrors.scheduleTime ? inputErrorCls : inputOkCls}`}
                                            />
                                            {touched.scheduleTime && fieldErrors.scheduleTime && <p className="text-xs text-[#DC2626] mt-1">{fieldErrors.scheduleTime}</p>}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setTouched(t => ({ ...t, name: true, email: true, phone: true, scheduleTime: scheduleType === 'schedule' }));
                                        if (!isStep1Valid) return;
                                        setStep(2);
                                    }}
                                    disabled={isProcessing}
                                    className="w-full py-3.5 bg-[#F97316] hover:bg-[#EA6C0A] text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    style={{ boxShadow: '0 4px 14px rgba(249,115,22,0.4)' }}
                                >
                                    Continue to Payment <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* STEP 2 */}
                        <div className={step === 2 ? 'block' : 'hidden'}>
                            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5 border border-[#F3F4F6]">
                                <h2 className="text-xl font-bold text-[#111827]">Payment Method</h2>
                                {[
                                    { key: 'cash' as const, icon: <DollarSign className="w-5 h-5 text-green-600" />, label: '💵 Cash on Delivery', sub: 'Pay with cash when your order arrives' },
                                    { key: 'card' as const, icon: <CreditCard className="w-5 h-5 text-blue-600" />, label: '💳 Credit / Debit Card', sub: '' },
                                    { key: 'paypal' as const, icon: <span className="text-lg">🅿️</span>, label: 'PayPal', sub: "You'll be redirected to PayPal to complete payment" },
                                ].map((pm) => (
                                    <div key={pm.key}>
                                        <button type="button" onClick={() => setPaymentMethod(pm.key)} className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${paymentMethod === pm.key ? 'border-[#F97316] bg-[#FFF7ED]' : 'border-[#E5E7EB] hover:border-[#9CA3AF]'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === pm.key ? 'border-[#F97316]' : 'border-gray-300'}`}>
                                                    {paymentMethod === pm.key && <div className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />}
                                                </div>
                                                {pm.icon}<span className="font-medium text-[#111827]">{pm.label}</span>
                                            </div>
                                            {paymentMethod === pm.key && pm.sub && <p className="text-sm text-gray-500 mt-2 ml-8">{pm.sub}</p>}
                                        </button>
                                        {pm.key === 'card' && (
                                            <div className={`ml-4 mr-2 ${paymentMethod === 'card' ? 'block' : 'hidden'}`}>
                                                <CardForm name={cardName} setName={setCardName} error={cardError} setError={setCardError} />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Promo Code */}
                                <div className="pt-4 border-t">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Promo Code</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="Enter code" className={`${inputClsBase} ${inputOkCls}`} disabled={!!appliedPromo} />
                                        </div>
                                        {appliedPromo ? (
                                            <button type="button" onClick={() => { setAppliedPromo(null); setPromoCode(''); }} className="px-4 py-3 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-all font-medium text-sm">Remove</button>
                                        ) : (
                                            <button type="button" onClick={applyPromo} className="px-6 py-3 bg-[#F97316] text-white rounded-xl hover:bg-[#EA6C0A] transition-all font-semibold text-sm" style={{ boxShadow: '0 4px 14px rgba(249,115,22,0.25)' }}>Apply</button>
                                        )}
                                    </div>
                                    {promoError && <p className="text-red-500 text-sm mt-1">{promoError}</p>}
                                    {appliedPromo && <p className="text-green-600 text-sm mt-1 flex items-center gap-1"><Check className="w-4 h-4" /> {appliedPromo.label}</p>}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setStep(3)}
                                    className="w-full py-3.5 bg-[#F97316] hover:bg-[#EA6C0A] text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                                    style={{ boxShadow: '0 4px 14px rgba(249,115,22,0.4)' }}
                                >
                                    Review Order <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* STEP 3 */}
                        <div className={step === 3 ? 'block' : 'hidden'}>
                            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5 border border-[#F3F4F6]">
                                <h2 className="text-xl font-bold text-[#111827]">Review Your Order</h2>
                                <div className="bg-[#F9FAFB] rounded-2xl p-4 border border-[#F3F4F6] space-y-1">
                                    <p className="font-medium text-[#111827]">{cust.name}</p>
                                    <p className="text-sm text-[#374151]">{cust.email} · {cust.phone}</p>
                                    <p className="text-sm text-[#F97316] font-semibold mt-1">Pickup • {scheduleType === 'asap' ? 'ASAP' : scheduleTime}</p>
                                </div>
                                <div className="space-y-3">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3">
                                            {item.image && <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover" loading="lazy" width={56} height={56} />}
                                            <div className="flex-1"><p className="font-medium text-gray-900">{item.name}</p><p className="text-sm text-gray-500">x{item.quantity}</p></div>
                                            <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-[#F9FAFB] rounded-2xl p-4 space-y-2 text-sm border border-[#F3F4F6]">
                                    <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Tax (8.875%)</span><span>${tax.toFixed(2)}</span></div>
                                    {discountAmount > 0 && <div className="flex justify-between text-[#F97316] font-medium"><span>Discount ({appliedPromo?.code})</span><span>-${discountAmount.toFixed(2)}</span></div>}
                                    <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total</span><span className="text-[#F97316]">${total.toFixed(2)}</span></div>
                                </div>
                                <div className="bg-[#F9FAFB] rounded-2xl p-3 text-sm text-[#374151] border border-[#F3F4F6]">
                                    Payment: {paymentMethod === 'cash' ? '💵 Cash on Delivery' : paymentMethod === 'card' ? '💳 Credit Card' : '🅿️ PayPal'}
                                </div>
                                {generalError && <div className="bg-red-50 border border-red-200 rounded-xl p-3"><p className="text-red-600 text-sm">{generalError}</p></div>}
                                <button type="button" onClick={placeOrder} disabled={isProcessing} className="w-full py-4 bg-[#F97316] hover:bg-[#EA6C0A] text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg" style={{ boxShadow: '0 4px 14px rgba(249,115,22,0.4)' }}>
                                    {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : <><ShoppingBag className="w-5 h-5" /> Place Order — ${total.toFixed(2)}</>}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* SIDEBAR */}
                    <div className="hidden lg:block lg:col-span-2">
                        <div className="bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] p-6 sticky top-28">
                            <h3 className="text-lg font-bold text-[#111827] mb-4">Order Summary</h3>
                            <div className="space-y-3 mb-4">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="text-[#374151]">{item.name} x{item.quantity}</span>
                                        <span className="font-medium text-[#111827]">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-[#E5E7EB] pt-3 space-y-2">
                                <div className="flex justify-between text-sm"><span className="text-[#6B7280]">Subtotal</span><span className="text-[#111827]">${subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-[#6B7280]">Tax</span><span className="text-[#111827]">${tax.toFixed(2)}</span></div>
                                {discountAmount > 0 && <div className="flex justify-between text-sm text-[#F97316] font-medium"><span>Discount</span><span>-${discountAmount.toFixed(2)}</span></div>}
                                <div className="flex justify-between font-bold text-lg pt-2 border-t border-[#E5E7EB]"><span>Total</span><span className="text-[#F97316]">${total.toFixed(2)}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

export default function Checkout() {
    return <Elements stripe={stripePromise}><CheckoutInner /></Elements>;
}
