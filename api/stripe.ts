import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import clientPromise from '../src/lib/db.js';

// Stripe configuration
// For testing, set STRIPE_SECRET_KEY in your Vercel environment variables
// Test card numbers:
// - Success: 4242 4242 4242 4242
// - Decline: 4000 0000 0000 0002
// - Any future expiry date, any 3-digit CVC, any ZIP
function getStripe() {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) return null;
    return new Stripe(stripeKey, {
        apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
    });
}

const DB_NAME = 'goldenlotus';

// Disable default body parsing so webhook can verify the raw signature.
export const config = {
    api: {
        bodyParser: false,
    },
};

// Helper: read the raw body from the request
async function getRawBody(req: VercelRequest): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => chunks.push(chunk));
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
    });
}

// Helper: fetch raw body and parse JSON automatically
async function parseJsonBody(req: VercelRequest): Promise<any> {
    try {
        const rawBody = await getRawBody(req);
        if (rawBody.length === 0) return {};
        return JSON.parse(rawBody.toString('utf8'));
    } catch (error) {
        throw new Error('Invalid JSON payload');
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const stripe = getStripe();
    if (!stripe) {
        return res.status(500).json({
            error: 'Payment system not configured'
        });
    }

    const action = req.query.action as string || (await parseJsonBody(req)).action;

    switch (action) {
        case 'create-payment-intent':
            return handleCreatePaymentIntent(req, res, stripe);
        case 'webhook':
            return handleWebhook(req, res, stripe);
        case 'refund':
            return handleRefund(req, res, stripe);
        default:
            return res.status(400).json({ error: 'Invalid action' });
    }
}

async function handleCreatePaymentIntent(req: VercelRequest, res: VercelResponse, stripe: Stripe) {
    try {
        const body = await parseJsonBody(req);
        const { items, deliveryFee = 0, discount = 0 } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Cart items are required' });
        }

        const subtotal = items.reduce(
            (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
            0
        );

        const taxRate = 0.08875;
        const tax = subtotal * taxRate;
        const total = subtotal + deliveryFee + tax - discount;
        const totalAmountCents = Math.round(total * 100);

        if (totalAmountCents < 50) {
            return res.status(400).json({ error: 'Order total must be at least $0.50' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmountCents,
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
            metadata: {
                itemCount: items.length.toString(),
                subtotal: subtotal.toFixed(2),
                tax: tax.toFixed(2),
                deliveryFee: deliveryFee.toFixed(2),
                discount: discount.toFixed(2),
            },
        });

        return res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            totalAmount: total,
            totalAmountCents,
            breakdown: {
                subtotal: parseFloat(subtotal.toFixed(2)),
                tax: parseFloat(tax.toFixed(2)),
                deliveryFee,
                discount,
                total: parseFloat(total.toFixed(2)),
            },
        });
    } catch (error: unknown) {
        console.error('Stripe PaymentIntent error:', error);
        const message = error instanceof Error ? error.message : 'Failed to create payment intent';
        return res.status(500).json({ error: message });
    }
}

async function handleWebhook(req: VercelRequest, res: VercelResponse, stripe: Stripe) {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
        return res.status(400).json({ error: 'Missing stripe signature or webhook secret' });
    }

    let event: Stripe.Event;

    try {
        const rawBody = await getRawBody(req);
        // Stripe requires the raw buffer for constructEvent
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Webhook signature verification failed';
        console.error('Webhook signature verification failed:', message);
        return res.status(400).json({ error: message });
    }

    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const ordersCollection = db.collection('orders');

        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                await ordersCollection.updateOne(
                    { stripePaymentIntentId: paymentIntent.id },
                    {
                        $set: {
                            paymentStatus: 'paid',
                            status: 'confirmed',
                            paidAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        },
                    }
                );
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                await ordersCollection.updateOne(
                    { stripePaymentIntentId: paymentIntent.id },
                    {
                        $set: {
                            paymentStatus: 'failed',
                            status: 'cancelled',
                            updatedAt: new Date().toISOString(),
                        },
                    }
                );
                break;
            }

            case 'charge.refunded': {
                const charge = event.data.object as Stripe.Charge;
                await ordersCollection.updateOne(
                    { stripeChargeId: charge.id },
                    {
                        $set: {
                            paymentStatus: 'refunded',
                            updatedAt: new Date().toISOString(),
                        },
                    }
                );
                break;
            }

            default:
                break;
        }

        return res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook handler error:', error);
        return res.status(500).json({ error: 'Webhook handler failed' });
    }
}

async function handleRefund(req: VercelRequest, res: VercelResponse, stripe: Stripe) {
    try {
        const body = await parseJsonBody(req);
        const { paymentIntentId, amount } = body;
        
        if (!paymentIntentId) {
            return res.status(400).json({ error: 'paymentIntentId is required' });
        }

        const refundParams: Stripe.RefundCreateParams = {
            payment_intent: paymentIntentId,
        };
        
        if (amount) {
            // Partial refund if amount is provided
            refundParams.amount = Math.round(amount * 100);
        }

        const refund = await stripe.refunds.create(refundParams);

        // Update DB accordingly if needed
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        await db.collection('orders').updateOne(
            { stripePaymentIntentId: paymentIntentId },
            {
                $set: {
                    paymentStatus: 'refunded',
                    updatedAt: new Date().toISOString()
                }
            }
        );

        return res.status(200).json({ success: true, refund });
    } catch (error: unknown) {
        console.error('Stripe Refund error:', error);
        const message = error instanceof Error ? error.message : 'Failed to process refund';
        return res.status(500).json({ error: message });
    }
}
