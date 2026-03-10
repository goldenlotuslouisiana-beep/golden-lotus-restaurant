import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { items, deliveryFee = 0, discount = 0 } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Cart items are required' });
        }

        // Calculate subtotal from items
        const subtotal = items.reduce(
            (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
            0
        );

        // Calculate tax (8.875%)
        const taxRate = 0.08875;
        const tax = subtotal * taxRate;

        // Calculate total
        const total = subtotal + deliveryFee + tax - discount;
        const totalAmountCents = Math.round(total * 100);

        if (totalAmountCents < 50) {
            return res.status(400).json({ error: 'Order total must be at least $0.50' });
        }

        // Create Stripe PaymentIntent
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
