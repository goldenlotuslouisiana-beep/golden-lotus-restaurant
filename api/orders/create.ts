import type { VercelRequest, VercelResponse } from '@vercel/node';
import clientPromise from '../lib/db.js';

const DB_NAME = 'goldenlotus';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            customer,
            items,
            subtotal,
            tax,
            deliveryFee,
            discount,
            total,
            orderType,
            paymentMethod,
            specialInstructions,
            couponCode,
            stripePaymentIntentId,
            cardLast4,
        } = req.body;

        if (!customer || !items || items.length === 0) {
            return res.status(400).json({ error: 'Customer info and items are required' });
        }

        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const ordersCollection = db.collection('orders');

        // Generate order number
        const count = await ordersCollection.countDocuments();
        const orderNumber = `GL-${String(count + 1001).padStart(5, '0')}`;

        const now = new Date().toISOString();

        const order = {
            orderNumber,
            customer: {
                id: customer.id || `cust_${Date.now()}`,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: customer.address || '',
                city: customer.city || '',
                zip: customer.zip || '',
            },
            items,
            subtotal: parseFloat(subtotal.toFixed(2)),
            tax: parseFloat(tax.toFixed(2)),
            deliveryFee: parseFloat(deliveryFee.toFixed(2)),
            discount: parseFloat(discount.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
            totalAmountCents: Math.round(total * 100),
            orderType: orderType || 'pickup',
            status: paymentMethod === 'cash' ? 'pending' : 'confirmed',
            paymentStatus: paymentMethod === 'cash' ? 'pending' : paymentMethod === 'card' ? 'paid' : 'pending',
            paymentMethod: paymentMethod || 'cash',
            stripePaymentIntentId: stripePaymentIntentId || null,
            stripeChargeId: null,
            cardLast4: cardLast4 || null,
            paidAt: paymentMethod === 'card' ? now : null,
            couponCode: couponCode || null,
            specialInstructions: specialInstructions || '',
            createdAt: now,
            updatedAt: now,
            estimatedReadyTime: null,
            assignedDriver: null,
        };

        const result = await ordersCollection.insertOne(order);

        return res.status(201).json({
            orderId: result.insertedId.toString(),
            orderNumber,
            status: order.status,
            paymentStatus: order.paymentStatus,
        });
    } catch (error) {
        console.error('Create order error:', error);
        return res.status(500).json({ error: 'Failed to create order' });
    }
}
