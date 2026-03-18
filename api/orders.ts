import type { VercelRequest, VercelResponse } from '@vercel/node';
import clientPromise from '../src/lib/db.js';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { sendEmail, orderConfirmationHtml } from '../src/lib/email.js';

const DB_NAME = 'goldenlotus';
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const action = req.query.action as string || req.body?.action;

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
            items,
            customerName,
            customerEmail,
            customerPhone,
            pickupTime,
            paymentMethod,
            subtotal,
            tax,
            total,
            promoCode,
            discount,
            specialInstructions,
            stripePaymentIntentId,
            cardLast4
        } = req.body
        
        // Validate required fields
        if (!items || !items.length) {
            return res.status(400).json({ error: 'No items in order' })
        }
        if (!customerName) {
            return res.status(400).json({ error: 'Customer name required' })
        }
        if (!paymentMethod) {
            return res.status(400).json({ error: 'Payment method required' })
        }
        if (!total) {
            return res.status(400).json({ error: 'Total amount required' })
        }
        
        const client = await clientPromise
        const db = client.db(DB_NAME)
        
        // Get next order number
        const lastOrder = await db.collection('orders')
            .findOne({}, { sort: { createdAt: -1 } })
        
        // Generate order number
        let orderNum = 1
        if (lastOrder?.orderNumber) {
            const lastNum = parseInt(
                lastOrder.orderNumber.replace('GL-0', '').replace('GL-', '')
            )
            if (!isNaN(lastNum)) orderNum = lastNum + 1
        }
        
        const orderNumber = `GL-${String(orderNum).padStart(5, '0')}`
        
        // Get userId from token if logged in
        let userId = null
        const authHeader = req.headers.authorization
        if (authHeader?.startsWith('Bearer ')) {
            try {
                const token = authHeader.replace('Bearer ', '')
                const decoded = jwt.verify(token, JWT_SECRET) as any
                userId = decoded.userId || decoded.id || decoded._id
            } catch {
                // guest order
            }
        }
        
        // Build order object
        const newOrder = {
            orderNumber,
            userId: userId ? userId.toString() : null,
            customerName: customerName || 'Guest',
            customerEmail: customerEmail || '',
            customerPhone: customerPhone || '',
            items: items.map((item: any) => ({
                id: item._id || item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity || 1,
                specialInstructions: item.specialInstructions || ''
            })),
            subtotal: parseFloat(subtotal) || 0,
            tax: parseFloat(tax) || 0,
            discount: parseFloat(discount) || 0,
            total: parseFloat(total) || 0,
            promoCode: promoCode || null,
            paymentMethod: paymentMethod || 'cod',
            paymentStatus: paymentMethod === 'cash' || paymentMethod === 'cod' ? 'pending' : 'paid',
            status: 'pending',
            orderType: 'pickup',
            pickupTime: pickupTime || 'asap',
            specialInstructions: specialInstructions || '',
            stripePaymentIntentId: stripePaymentIntentId || null,
            cardLast4: cardLast4 || null,
            statusHistory: {
                pending: new Date().toISOString()
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
        
        const result = await db.collection('orders').insertOne(newOrder)
        
        // Award loyalty points if user logged in
        if (userId) {
            try {
                const points = Math.floor(parseFloat(total))
                await db.collection('users').updateOne(
                    { _id: new ObjectId(userId) },
                    { 
                        $inc: { loyaltyPoints: points },
                        $push: {
                            loyaltyHistory: {
                                date: new Date().toISOString(),
                                orderId: result.insertedId.toString(),
                                orderNumber,
                                action: 'earned',
                                points
                            }
                        }
                    } as any
                )
            } catch (loyaltyError) {
                console.error('Loyalty points error (non-critical):', loyaltyError)
            }
        }
        
        // Send order confirmation email — non-blocking, never fails the order
        if (customerEmail) {
            sendEmail({
                to: customerEmail,
                subject: `✅ Order Confirmed #${orderNumber} — Golden Lotus`,
                html: orderConfirmationHtml({
                    customerName: customerName || 'Guest',
                    orderNumber,
                    orderId: result.insertedId.toString(),
                    items: newOrder.items,
                    subtotal: newOrder.subtotal,
                    tax: newOrder.tax,
                    discount: newOrder.discount || 0,
                    total: newOrder.total,
                    paymentMethod: newOrder.paymentMethod,
                }),
            }).then(r => {
                if (r.success) {
                    console.log(`[ORDER EMAIL] ✅ Sent to ${customerEmail} for order ${orderNumber}`);
                } else {
                    console.error(`[ORDER EMAIL] ❌ Failed for ${customerEmail}: ${(r as any).error}`);
                }
            }).catch(err => console.error('[ORDER EMAIL] ❌ Unexpected error:', err));
        } else {
            console.warn(`[ORDER EMAIL] ⚠️ No customer email for order ${orderNumber} — skipped`);
        }

        return res.status(201).json({
            success: true,
            orderId: result.insertedId.toString(),
            orderNumber,
            status: newOrder.status,
            paymentStatus: newOrder.paymentStatus,
            message: 'Order created successfully'
        })
        
    } catch (error: unknown) {
        console.error('Create order error:', error);
        return res.status(500).json({
            error: 'Failed to create order',
        });
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

    } catch (error: unknown) {
        console.error('Order history error:', error);
        return res.status(500).json({ error: 'Failed to fetch orders' });
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
