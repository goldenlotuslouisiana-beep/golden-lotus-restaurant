import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ArrowLeft, ArrowRight, MapPin, Phone, Mail, User, CreditCard, DollarSign, ShoppingBag, Lock, Check, Loader2 } from 'lucide-react';
import { stripePromise } from '@/lib/stripe';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

// ─── STEP INDICATOR ───
function StepIndicator({ currentStep }: { currentStep: number }) {
    const steps = ['Delivery Info', 'Payment', 'Review Order'];
    return (
        <div className="flex items-center justify-center mb-8">
            {steps.map((label, i) => (
                <div key={label} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i + 1 <= currentStep
                                ? 'bg-[#F97316] text-white shadow-lg'
                                : 'bg-gray-200 text-gray-500'
                                }`}
                        >
                            {i + 1 <= currentStep - 1 ? <Check className="w-5 h-5" /> : i + 1}
                        </div>
                        <span className={`text-xs mt-1 ${i + 1 <= currentStep ? 'text-[#F97316] font-medium' : 'text-gray-400'}`}>
                            {label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div className={`w-16 sm:w-24 h-0.5 mx-2 ${i + 1 < currentStep ? 'bg-[#F97316]' : 'bg-gray-200'}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

// ─── CARD FORM (STRIPE ELEMENTS) ───
function CardForm({
    cardholderName,
    setCardholderName,
    cardError,
    setCardError,
}: {
    cardholderName: string;
    setCardholderName: (v: string) => void;
    cardError: string;
    setCardError: (v: string) => void;
}) {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] transition-all"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Details</label>
                <div className="border border-gray-300 rounded-lg p-4 bg-white focus-within:ring-2 focus-within:ring-[#F97316] focus-within:border-[#F97316] transition-all shadow-sm">
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#1a1a1a',
                                    fontFamily: 'system-ui, -apple-system, sans-serif',
                                    '::placeholder': { color: '#9ca3af' },
                                },
                                invalid: { color: '#ef4444' },
                            },
                        }}
                        onChange={(e) => {
                            setCardError(e.error ? e.error.message : '');
                        }}
                    />
                </div>
                {cardError && <p className="text-red-500 text-sm mt-1">{cardError}</p>}
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-xs">
                <Lock className="w-3.5 h-3.5" />
                <span>Secured by Stripe — your card data never touches our server</span>
            </div>
        </div>
    );
}

// ─── INNER CHECKOUT (wrapped inside Elements) ───
function CheckoutInner() {
    const location = useLocation();
    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();

    const state = location.state as { cart: CartItem[]; orderType: 'pickup' | 'delivery' } | null;
    const cart: CartItem[] = state?.cart || [];
    const initialOrderType = state?.orderType || 'pickup';

    const [step, setStep] = useState(1);
    const [orderType, setOrderType] = useState<'pickup' | 'delivery'>(initialOrderType);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'paypal'>('cash');
    const [cardholderName, setCardholderName] = useState('');
    const [cardError, setCardError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [generalError, setGeneralError] = useState('');

    const [customer, setCustomer] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zip: '',
    });

    // Redirect if no cart
    useEffect(() => {
        if (cart.length === 0) {
            navigate('/menu');
        }
    }, [cart, navigate]);

    // ─── CALCULATIONS ───
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = orderType === 'delivery' ? 4.99 : 0;
    const taxRate = 0.08875;
    const tax = subtotal * taxRate;
    const total = subtotal + deliveryFee + tax;

    const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomer((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const isStep1Valid = () => {
        const { name, email, phone } = customer;
        if (!name || !email || !phone) return false;
        if (orderType === 'delivery' && (!customer.address || !customer.city || !customer.zip)) return false;
        return true;
    };

    // ─── PLACE ORDER ───
    const handlePlaceOrder = async () => {
        setIsProcessing(true);
        setGeneralError('');

        try {
            if (paymentMethod === 'card') {
                if (!stripe || !elements) {
                    setGeneralError('Stripe is still loading. Please wait a moment.');
                    setIsProcessing(false);
                    return;
                }

                // 1) Create PaymentIntent
                const piRes = await fetch('/api/stripe/create-payment-intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: cart.map((i) => ({ price: i.price, quantity: i.quantity })),
                        deliveryFee,
                        discount: 0,
                    }),
                });

                if (!piRes.ok) {
                    const errData = await piRes.json();
                    setGeneralError(errData.error || 'Failed to initialize payment.');
                    setIsProcessing(false);
                    return;
                }

                const { clientSecret, paymentIntentId } = await piRes.json();

                // 2) Confirm card payment
                const cardElement = elements.getElement(CardElement);
                if (!cardElement) {
                    setGeneralError('Card element not found. Please refresh.');
                    setIsProcessing(false);
                    return;
                }

                const result = await stripe.confirmCardPayment(clientSecret, {
                    payment_method: {
                        card: cardElement,
                        billing_details: { name: cardholderName || customer.name },
                    },
                });

                if (result.error) {
                    // Show user-friendly error
                    const msg = result.error.message || 'An unexpected error occurred. Please try again.';
                    setCardError(msg);
                    setIsProcessing(false);
                    return;
                }

                if (result.paymentIntent?.status === 'succeeded') {
                    // Create order in database
                    const orderRes = await fetch('/api/orders/create', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            customer: { ...customer, id: `cust_${Date.now()}` },
                            items: cart.map((i) => ({
                                id: i.id,
                                menuItemId: i.id,
                                name: i.name,
                                price: i.price,
                                quantity: i.quantity,
                            })),
                            subtotal,
                            tax,
                            deliveryFee,
                            discount: 0,
                            total,
                            orderType,
                            paymentMethod: 'card',
                            stripePaymentIntentId: paymentIntentId,
                            cardLast4: '',
                        }),
                    });

                    if (!orderRes.ok) {
                        setGeneralError('Payment succeeded but failed to create order. Please contact support.');
                        setIsProcessing(false);
                        return;
                    }

                    const orderData = await orderRes.json();
                    navigate(`/order/${orderData.orderId}/confirmed`, {
                        state: {
                            orderNumber: orderData.orderNumber,
                            total,
                            paymentMethod: 'card',
                            cardLast4: '',
                        },
                    });
                }
            } else {
                // ─── Cash on Delivery ───
                const orderRes = await fetch('/api/orders/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customer: { ...customer, id: `cust_${Date.now()}` },
                        items: cart.map((i) => ({
                            id: i.id,
                            menuItemId: i.id,
                            name: i.name,
                            price: i.price,
                            quantity: i.quantity,
                        })),
                        subtotal,
                        tax,
                        deliveryFee,
                        discount: 0,
                        total,
                        orderType,
                        paymentMethod: 'cash',
                    }),
                });

                if (!orderRes.ok) {
                    setGeneralError('Failed to place order. Please try again.');
                    setIsProcessing(false);
                    return;
                }

                const orderData = await orderRes.json();
                navigate(`/order/${orderData.orderId}/confirmed`, {
                    state: {
                        orderNumber: orderData.orderNumber,
                        total,
                        paymentMethod: 'cash',
                    },
                });
            }
        } catch (err) {
            console.error('Place order error:', err);
            setGeneralError('An unexpected error occurred. Please try again.');
            setIsProcessing(false);
        }
    };

    if (cart.length === 0) return null;

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-16 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back */}
                <button onClick={() => (step > 1 ? setStep(step - 1) : navigate('/menu'))} className="flex items-center gap-2 text-gray-600 hover:text-[#F97316] mb-6 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    {step > 1 ? 'Back' : 'Back to Menu'}
                </button>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
                <StepIndicator currentStep={step} />

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* ─── LEFT COLUMN ─── */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* STEP 1 — Delivery Info */}
                        {step === 1 && (
                            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                                <h2 className="text-xl font-bold text-gray-900">Delivery Information</h2>

                                {/* Order Type Toggle */}
                                <div className="flex gap-3">
                                    {(['pickup', 'delivery'] as const).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setOrderType(type)}
                                            className={`flex-1 py-3 rounded-lg font-medium transition-all border-2 ${orderType === type
                                                ? 'border-[#F97316] bg-[#F97316]/5 text-[#F97316]'
                                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                                }`}
                                        >
                                            {type === 'pickup' ? '🏪 Pickup' : '🚗 Delivery'}
                                        </button>
                                    ))}
                                </div>

                                {/* Customer Fields */}
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input name="name" value={customer.name} onChange={handleCustomerChange} required placeholder="John Doe" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316]" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input name="email" type="email" value={customer.email} onChange={handleCustomerChange} required placeholder="john@email.com" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316]" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input name="phone" value={customer.phone} onChange={handleCustomerChange} required placeholder="(555) 123-4567" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316]" />
                                        </div>
                                    </div>
                                </div>

                                {orderType === 'delivery' && (
                                    <div className="grid sm:grid-cols-2 gap-4 pt-2">
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input name="address" value={customer.address} onChange={handleCustomerChange} required placeholder="123 Main St" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316]" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                            <input name="city" value={customer.city} onChange={handleCustomerChange} required placeholder="New York" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316]" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                                            <input name="zip" value={customer.zip} onChange={handleCustomerChange} required placeholder="10001" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316]" />
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!isStep1Valid()}
                                    className="w-full py-3 bg-[#F97316] text-white font-semibold rounded-lg hover:bg-[#ea6c10] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    Continue to Payment <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {/* STEP 2 — Payment */}
                        {step === 2 && (
                            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                                <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>

                                {/* Cash on Delivery */}
                                <button
                                    onClick={() => setPaymentMethod('cash')}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${paymentMethod === 'cash'
                                        ? 'border-[#F97316] bg-[#F97316]/5'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cash' ? 'border-[#F97316]' : 'border-gray-300'}`}>
                                            {paymentMethod === 'cash' && <div className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />}
                                        </div>
                                        <DollarSign className="w-5 h-5 text-green-600" />
                                        <span className="font-medium text-gray-900">💵 Cash on Delivery</span>
                                    </div>
                                    {paymentMethod === 'cash' && (
                                        <p className="text-sm text-gray-500 mt-2 ml-8">Pay with cash when your order arrives</p>
                                    )}
                                </button>

                                {/* Credit/Debit Card */}
                                <button
                                    onClick={() => setPaymentMethod('card')}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${paymentMethod === 'card'
                                        ? 'border-[#F97316] bg-[#F97316]/5'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-[#F97316]' : 'border-gray-300'}`}>
                                            {paymentMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />}
                                        </div>
                                        <CreditCard className="w-5 h-5 text-blue-600" />
                                        <span className="font-medium text-gray-900">💳 Credit / Debit Card</span>
                                    </div>
                                </button>

                                {paymentMethod === 'card' && (
                                    <div className="pl-4 pr-2">
                                        <CardForm
                                            cardholderName={cardholderName}
                                            setCardholderName={setCardholderName}
                                            cardError={cardError}
                                            setCardError={setCardError}
                                        />
                                    </div>
                                )}

                                {/* PayPal (placeholder) */}
                                <button
                                    onClick={() => setPaymentMethod('paypal')}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${paymentMethod === 'paypal'
                                        ? 'border-[#F97316] bg-[#F97316]/5'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'paypal' ? 'border-[#F97316]' : 'border-gray-300'}`}>
                                            {paymentMethod === 'paypal' && <div className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />}
                                        </div>
                                        <span className="text-lg">🅿️</span>
                                        <span className="font-medium text-gray-900">PayPal</span>
                                    </div>
                                    {paymentMethod === 'paypal' && (
                                        <p className="text-sm text-gray-500 mt-2 ml-8">You'll be redirected to PayPal to complete payment</p>
                                    )}
                                </button>

                                <button
                                    onClick={() => setStep(3)}
                                    className="w-full py-3 bg-[#F97316] text-white font-semibold rounded-lg hover:bg-[#ea6c10] transition-colors flex items-center justify-center gap-2"
                                >
                                    Review Order <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {/* STEP 3 — Review & Place Order */}
                        {step === 3 && (
                            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                                <h2 className="text-xl font-bold text-gray-900">Review Your Order</h2>

                                {/* Customer Info Summary */}
                                <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                                    <p className="font-medium text-gray-900">{customer.name}</p>
                                    <p className="text-sm text-gray-600">{customer.email} · {customer.phone}</p>
                                    {orderType === 'delivery' && (
                                        <p className="text-sm text-gray-600">{customer.address}, {customer.city} {customer.zip}</p>
                                    )}
                                    <p className="text-sm text-[#F97316] font-medium mt-1">
                                        {orderType === 'pickup' ? '🏪 Pickup' : '🚗 Delivery'}
                                    </p>
                                </div>

                                {/* Items */}
                                <div className="space-y-3">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-gray-900">{item.name}</p>
                                                <p className="text-sm text-gray-500">x{item.quantity}</p>
                                            </div>
                                            <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Payment Summary */}
                                <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
                                    <p className="text-gray-600">
                                        Payment: {paymentMethod === 'cash' ? '💵 Cash on Delivery' : paymentMethod === 'card' ? '💳 Credit/Debit Card' : '🅿️ PayPal'}
                                    </p>
                                </div>

                                {generalError && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <p className="text-red-600 text-sm">{generalError}</p>
                                    </div>
                                )}

                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={isProcessing}
                                    className="w-full py-4 bg-[#F97316] text-white font-bold rounded-lg hover:bg-[#ea6c10] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shadow-lg"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingBag className="w-5 h-5" />
                                            Place Order — ${total.toFixed(2)}
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ─── RIGHT COLUMN — Order Summary ─── */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-28">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
                            <div className="space-y-3 mb-4">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="text-gray-600">{item.name} x{item.quantity}</span>
                                        <span className="text-gray-900 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t pt-3 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="text-gray-900">${subtotal.toFixed(2)}</span>
                                </div>
                                {orderType === 'delivery' && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Delivery Fee</span>
                                        <span className="text-gray-900">${deliveryFee.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Tax (8.875%)</span>
                                    <span className="text-gray-900">${tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                    <span className="text-gray-900">Total</span>
                                    <span className="text-[#F97316]">${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── MAIN EXPORT (wraps in Stripe Elements provider) ───
export default function Checkout() {
    return stripePromise ? (
        <Elements stripe={stripePromise}>
            <CheckoutInner />
        </Elements>
    ) : (
        <CheckoutInner />
    );
}
