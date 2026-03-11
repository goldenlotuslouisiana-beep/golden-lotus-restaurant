import type { VercelRequest, VercelResponse } from '@vercel/node';
import clientPromise from '../src/lib/db.js';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const DB_NAME = 'goldenlotus';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const action = req.query.action as string;

    switch (action) {
        case 'create':
            return handleCreateOrder(req, res);
        case 'history':
            return handleGetHistory(req, res);
        case 'single':
        case 'track':
            return handleGetSingleOrder(req, res);
        case 'cancel':
            return handleCancelOrder(req, res);
        default:
            return res.status(400).json({ error: 'Invalid action' });
    }
}

async function handleCreateOrder(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    try {
        const {
            customer, items, subtotal, tax, deliveryFee, discount, total,
            orderType, paymentMethod, specialInstructions, couponCode,
            stripePaymentIntentId, cardLast4,
        } = req.body;

        if (!customer || !items || items.length === 0) {
            return res.status(400).json({ error: 'Customer info and items are required' });
        }

        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const ordersCollection = db.collection('orders');

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

async function handleGetHistory(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.replace('Bearer ', '');
        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        const userId = decoded.userId || decoded.id || decoded._id || decoded.sub;
        if (!userId) return res.status(401).json({ error: 'Invalid token' });

        const client = await clientPromise;
        const db = client.db(DB_NAME);

        const query = {
            $or: [
                { userId: userId },
                { userId: userId.toString() },
                { customerId: userId },
                { customerId: userId.toString() },
                { user: userId },
                { 'customer.id': userId },
                { 'customer.id': userId.toString() },
                ...(ObjectId.isValid(userId) ? [
                    { userId: new ObjectId(userId) },
                    { customerId: new ObjectId(userId) },
                ] : [])
            ]
        };

        const orders = await db.collection('orders')
            .find(query)
            .sort({ createdAt: -1 })
            .toArray();

        const serialized = orders.map(order => ({
            ...order,
            _id: order._id.toString(),
            userId: order.userId?.toString(),
            customerId: order.customerId?.toString(),
            id: order._id.toString(),
        }));

        return res.status(200).json({ orders: serialized, count: serialized.length });

    } catch (error: any) {
        console.error('Order history error:', error);
        return res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
    }
}

async function handleGetSingleOrder(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { id } = req.query;

        if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const ordersCollection = db.collection('orders');

        let order;

        try {
            order = await ordersCollection.findOne({ _id: new ObjectId(id) });
        } catch {
            order = await ordersCollection.findOne({ orderNumber: id });
        }

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const formattedOrder = {
            ...order,
            id: order._id.toString(),
            _id: undefined,
        };

        return res.status(200).json(formattedOrder);
    } catch (error) {
        console.error('Get order error:', error);
        return res.status(500).json({ error: 'Failed to fetch order' });
    }
}

async function handleCancelOrder(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { id } = req.query;
        if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Order ID is required' });

        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const ordersCollection = db.collection('orders');

        const update: any = {
            $set: {
                status: 'cancelled',
                updatedAt: new Date().toISOString(),
                [`statusHistory.cancelled`]: new Date().toISOString()
            },
            $push: {
                statusHistoryLog: { status: 'cancelled', timestamp: new Date().toISOString(), reason: 'Customer requested cancellation' }
            }
        };

        let result;
        if (ObjectId.isValid(id)) {
            result = await ordersCollection.updateOne({ _id: new ObjectId(id) }, update);
        } else {
            result = await ordersCollection.updateOne({ orderNumber: id }, update);
        }

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        return res.status(200).json({ success: true, message: 'Order cancelled' });
    } catch (error) {
        console.error('Cancel order error:', error);
        return res.status(500).json({ error: 'Failed to cancel order' });
    }
}
