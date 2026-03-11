import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ArrowLeft, ArrowRight, Phone, Mail, User, CreditCard, DollarSign, ShoppingBag, Lock, Check, Loader2, Tag, Clock} from 'lucide-react';
import { stripePromise } from '@/lib/stripe';
import { useAuth } from '@/context/AuthContext';

interface CartItem { id: string; name: string; price: number; quantity: number; image?: string; }

const PROMOS: Record<string, { type: string; value: number; minOrder: number; label: string; dayOnly?: number }> = {
    DIMSUM10: { type: 'percent', value: 10, minOrder: 50, label: '10% off orders over $50' },
    FREEDELIVERY: { type: 'freeDelivery', value: 0, minOrder: 40, label: 'Free delivery on orders over $40' },
    BOBAMONDAY: { type: 'fixed', value: 5, minOrder: 0, label: '$5 off on Mondays', dayOnly: 1 },
};

function StepIndicator({ step }: { step: number }) {
    const steps = ['Delivery', 'Payment', 'Review'];
    return (
        <div className="flex items-center justify-center mb-8">
            {steps.map((label, i) => (
                <div key={label} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${i + 1 < step ? 'bg-green-500 text-white' : i + 1 === step ? 'bg-[#F97316] text-white shadow-lg shadow-orange-200' : 'bg-gray-200 text-gray-500'}`}>
                            {i + 1 < step ? <Check className="w-5 h-5" /> : i + 1}
                        </div>
                        <span className={`text-xs mt-1 font-medium ${i + 1 <= step ? 'text-[#F97316]' : 'text-gray-400'}`}>{label}</span>
                    </div>
                    {i < 2 && <div className={`w-12 sm:w-20 h-0.5 mx-2 transition-all ${i + 1 < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
                </div>
            ))}
        </div>
    );
}

function CardForm({ name, setName, error, setError }: { name: string; setName: (v: string) => void; error: string; setError: (v: string) => void }) {
    return (
        <div className="space-y-4 mt-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Cardholder Name</label>
                <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name on card" className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent bg-gray-50 focus:bg-white transition-all" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Card Details</label>
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 focus-within:ring-2 focus-within:ring-[#F97316] focus-within:bg-white transition-all">
                    <CardElement options={{ style: { base: { fontSize: '16px', color: '#1a1a1a', fontFamily: 'system-ui, sans-serif', '::placeholder': { color: '#9ca3af' } }, invalid: { color: '#ef4444' } } }} onChange={(e) => setError(e.error?.message || '')} />
                </div>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-xs"><Lock className="w-3.5 h-3.5" /><span>Secured by Stripe</span></div>
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
    const orderType = 'pickup';
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

    const isStep1Valid = cust.name && cust.email && cust.phone;

    const placeOrder = async () => {
        setIsProcessing(true);
        setGeneralError('');
        try {
            const orderPayload = {
                customer: { id: user?.id || `guest_${Date.now()}`, name: cust.name, email: cust.email, phone: cust.phone, address: cust.street, city: cust.city, zip: cust.zip },
                items: cart.map((i) => ({ id: i.id, menuItemId: i.id, name: i.name, price: i.price, quantity: i.quantity })),
                subtotal, tax, discount: discountAmount, total, orderType,
                specialInstructions: cust.instructions, couponCode: appliedPromo?.code || '',
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
                    const oRes = await fetch('/api/orders?action=create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...orderPayload, paymentMethod: 'card', stripePaymentIntentId: paymentIntentId, cardLast4: '' }) });
                    if (!oRes.ok) { setGeneralError('Payment OK but order creation failed. Contact support.'); setIsProcessing(false); return; }
                    const od = await oRes.json();
                    if (user && token) { try { await fetch('/api/users?action=loyalty', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ orderId: od.orderId, amount: Math.floor(total), action: 'earned' }) }); } catch { } }
                    navigate(`/order/${od.orderId}/confirmed`, { state: { orderNumber: od.orderNumber, total, paymentMethod: 'card' } });
                }
            } else {
                const oRes = await fetch('/api/orders?action=create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...orderPayload, paymentMethod: 'cash' }) });
                if (!oRes.ok) { setGeneralError('Failed to place order'); setIsProcessing(false); return; }
                const od = await oRes.json();
                if (user && token) { try { await fetch('/api/users?action=loyalty', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ orderId: od.orderId, amount: Math.floor(total), action: 'earned' }) }); } catch { } }
                navigate(`/order/${od.orderId}/confirmed`, { state: { orderNumber: od.orderNumber, total, paymentMethod: 'cash' } });
            }
        } catch { setGeneralError('An unexpected error occurred'); setIsProcessing(false); }
    };

    if (cart.length === 0) return null;

    const inputCls = "w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent bg-gray-50 focus:bg-white transition-all";
    const inputNoCls = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent bg-gray-50 focus:bg-white transition-all";

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-16 px-4">
            <div className="max-w-5xl mx-auto">
                <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/menu')} className="flex items-center gap-2 text-gray-600 hover:text-[#F97316] mb-6 transition-colors">
                    <ArrowLeft className="w-5 h-5" />{step > 1 ? 'Back' : 'Back to Menu'}
                </button>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
                <StepIndicator step={step} />

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* STEP 1 */}
                        {step === 1 && (
                            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5 border border-gray-100">
                                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        📍 Pickup Location
                                    </h3>
                                    <p className="text-gray-600 mt-1">Golden Lotus Restaurant</p>
                                    <p className="text-gray-600">168 Dragon Blvd, Los Angeles, CA 90012</p>
                                    <p className="text-gray-600">(213) 555-1688</p>
                                    <a 
                                      href="https://maps.google.com?q=168+Dragon+Blvd+Los+Angeles+CA"
                                      target="_blank"
                                      className="text-orange-500 text-sm mt-2 inline-block font-medium"
                                    >
                                      📌 Get Directions →
                                    </a>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label><div className="relative"><User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input name="name" value={cust.name} onChange={handleChange} placeholder="John Doe" className={inputCls} /></div></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label><div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input name="email" type="email" value={cust.email} onChange={handleChange} placeholder="john@email.com" className={inputCls} /></div></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label><div className="relative"><Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input name="phone" value={cust.phone} onChange={handleChange} placeholder="(555) 123-4567" className={inputCls} /></div></div>
                                </div>

                                {/* Schedule */}
                                <div className="pt-2 border-t space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">When do you want it?</label>
                                    <div className="flex gap-3">
                                        <button onClick={() => setScheduleType('asap')} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 flex items-center justify-center gap-2 transition-all ${scheduleType === 'asap' ? 'border-[#F97316] bg-[#F97316]/5 text-[#F97316]' : 'border-gray-200 text-gray-500'}`}><Clock className="w-4 h-4" /> ASAP — Ready in 15-20 min</button>
                                        <button onClick={() => setScheduleType('schedule')} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 flex items-center justify-center gap-2 transition-all ${scheduleType === 'schedule' ? 'border-[#F97316] bg-[#F97316]/5 text-[#F97316]' : 'border-gray-200 text-gray-500'}`}><Clock className="w-4 h-4" /> Schedule</button>
                                    </div>
                                    {scheduleType === 'schedule' && <input type="datetime-local" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className={inputNoCls} />}
                                </div>

                                <button onClick={() => setStep(2)} disabled={!isStep1Valid} className="w-full py-3.5 bg-gradient-to-r from-[#F97316] to-[#ea6c10] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    Continue to Payment <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5 border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                                {[
                                    { key: 'cash' as const, icon: <DollarSign className="w-5 h-5 text-green-600" />, label: '💵 Cash on Delivery', sub: 'Pay with cash when your order arrives' },
                                    { key: 'card' as const, icon: <CreditCard className="w-5 h-5 text-blue-600" />, label: '💳 Credit / Debit Card', sub: '' },
                                    { key: 'paypal' as const, icon: <span className="text-lg">🅿️</span>, label: 'PayPal', sub: "You'll be redirected to PayPal to complete payment" },
                                ].map((pm) => (
                                    <div key={pm.key}>
                                        <button onClick={() => setPaymentMethod(pm.key)} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${paymentMethod === pm.key ? 'border-[#F97316] bg-[#F97316]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === pm.key ? 'border-[#F97316]' : 'border-gray-300'}`}>
                                                    {paymentMethod === pm.key && <div className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />}
                                                </div>
                                                {pm.icon}<span className="font-medium text-gray-900">{pm.label}</span>
                                            </div>
                                            {paymentMethod === pm.key && pm.sub && <p className="text-sm text-gray-500 mt-2 ml-8">{pm.sub}</p>}
                                        </button>
                                        {pm.key === 'card' && paymentMethod === 'card' && (
                                            <div className="ml-4 mr-2"><CardForm name={cardName} setName={setCardName} error={cardError} setError={setCardError} /></div>
                                        )}
                                    </div>
                                ))}

                                {/* Promo Code */}
                                <div className="pt-4 border-t">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Promo Code</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="Enter code" className={inputCls} disabled={!!appliedPromo} />
                                        </div>
                                        {appliedPromo ? (
                                            <button onClick={() => { setAppliedPromo(null); setPromoCode(''); }} className="px-4 py-3 border border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-all font-medium text-sm">Remove</button>
                                        ) : (
                                            <button onClick={applyPromo} className="px-6 py-3 bg-[#F97316] text-white rounded-xl hover:bg-[#ea6c10] transition-all font-medium text-sm">Apply</button>
                                        )}
                                    </div>
                                    {promoError && <p className="text-red-500 text-sm mt-1">{promoError}</p>}
                                    {appliedPromo && <p className="text-green-600 text-sm mt-1 flex items-center gap-1"><Check className="w-4 h-4" /> {appliedPromo.label}</p>}
                                </div>

                                <button onClick={() => setStep(3)} className="w-full py-3.5 bg-gradient-to-r from-[#F97316] to-[#ea6c10] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-200 transition-all flex items-center justify-center gap-2">
                                    Review Order <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {/* STEP 3 */}
                        {step === 3 && (
                            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5 border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">Review Your Order</h2>
                                <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                                    <p className="font-medium text-gray-900">{cust.name}</p>
                                    <p className="text-sm text-gray-600">{cust.email} · {cust.phone}</p>
                                    <p className="text-sm text-[#F97316] font-medium mt-1">🏪 Pickup · {scheduleType === 'asap' ? 'ASAP' : scheduleTime}</p>
                                </div>
                                <div className="space-y-3">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3">
                                            {item.image && <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover" />}
                                            <div className="flex-1"><p className="font-medium text-gray-900">{item.name}</p><p className="text-sm text-gray-500">x{item.quantity}</p></div>
                                            <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Tax (8.875%)</span><span>${tax.toFixed(2)}</span></div>
                                    {discountAmount > 0 && <div className="flex justify-between text-[#F97316] font-medium"><span>Discount ({appliedPromo?.code})</span><span>-${discountAmount.toFixed(2)}</span></div>}
                                    <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total</span><span className="text-[#F97316]">${total.toFixed(2)}</span></div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                                    Payment: {paymentMethod === 'cash' ? '💵 Cash on Delivery' : paymentMethod === 'card' ? '💳 Credit Card' : '🅿️ PayPal'}
                                </div>
                                {generalError && <div className="bg-red-50 border border-red-200 rounded-xl p-3"><p className="text-red-600 text-sm">{generalError}</p></div>}
                                <button onClick={placeOrder} disabled={isProcessing} className="w-full py-4 bg-gradient-to-r from-[#F97316] to-[#ea6c10] text-white font-bold rounded-xl hover:shadow-xl hover:shadow-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg">
                                    {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : <><ShoppingBag className="w-5 h-5" /> Place Order — ${total.toFixed(2)}</>}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* SIDEBAR */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-28 border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
                            <div className="space-y-3 mb-4">
                                {cart.map((item) => (<div key={item.id} className="flex justify-between text-sm"><span className="text-gray-600">{item.name} x{item.quantity}</span><span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span></div>))}
                            </div>
                            <div className="border-t pt-3 space-y-2">
                                <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-gray-500">Tax</span><span>${tax.toFixed(2)}</span></div>
                                {discountAmount > 0 && <div className="flex justify-between text-sm text-[#F97316]"><span>Discount</span><span>-${discountAmount.toFixed(2)}</span></div>}
                                <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total</span><span className="text-[#F97316]">${total.toFixed(2)}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Checkout() {
    return <Elements stripe={stripePromise}><CheckoutInner /></Elements>;
}
