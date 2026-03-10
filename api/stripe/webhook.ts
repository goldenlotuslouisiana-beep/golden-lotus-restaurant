import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import clientPromise from '../lib/db.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
});

const DB_NAME = 'goldenlotus';

// Disable body parsing — Stripe needs the raw body to verify the signature
export const config = {
    api: {
        bodyParser: false,
    },
};

async function getRawBody(req: VercelRequest): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => chunks.push(chunk));
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
    });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
        return res.status(400).json({ error: 'Missing stripe signature or webhook secret' });
    }

    let event: Stripe.Event;

    try {
        const rawBody = await getRawBody(req);
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
                console.log(`Payment succeeded for PI: ${paymentIntent.id}`);
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
                console.log(`Payment failed for PI: ${paymentIntent.id}`);
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
                console.log(`Charge refunded: ${charge.id}`);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook handler error:', error);
        return res.status(500).json({ error: 'Webhook handler failed' });
    }
}
