import type { VercelRequest, VercelResponse } from '@vercel/node';
import clientPromise from '../src/lib/db.js';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import nodemailer from 'nodemailer';

const DB = 'goldenlotus';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

function getAdminId(req: VercelRequest): string | null {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
        const token = req.headers['x-admin-token'] as string;
        if (!token) return null;
        try { const d = jwt.verify(token, JWT_SECRET) as any; return d.email || d.userId || 'admin'; } catch { return null; }
    }
    try {
        const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET) as any;
        return decoded.email || decoded.userId || 'admin';
    } catch { return null; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const action = req.query.action as string || req.body?.action;
    if (!action) return res.status(400).json({ error: 'Missing action parameter' });

    // Global db catch here but handled per isolated function as user requested
    switch (action) {
        case 'dashboard-stats': return handleDashboardStats(req, res);
        case 'orders': return handleGetAdminOrders(req, res);
        case 'clear-test': return handleClearTestOrders(req, res);
        case 'order-status': return handleOrderStatus(req, res);
        case 'users': return handleUsers(req, res);
        case 'user-detail': return handleUserDetail(req, res);
        case 'block-user': return handleBlockUser(req, res);
        case 'reviews': return handleReviews(req, res);
        case 'review-status': return handleReviewStatus(req, res);
        case 'promos': return handlePromos(req, res);
        case 'add-promo': return handleAddPromo(req, res);
        case 'edit-promo': return handleEditPromo(req, res);
        case 'delete-promo': return handleDeletePromo(req, res);
        case 'loyalty-settings': return handleLoyaltySettings(req, res);
        case 'loyalty-adjust': return handleLoyaltyAdjust(req, res);
        case 'riders': return handleRiders(req, res);
        case 'add-rider': return handleAddRider(req, res);
        case 'edit-rider': return handleEditRider(req, res);
        case 'zones': return handleZones(req, res);
        case 'loyalty-leaderboard': return handleLoyaltyLeaderboard(req, res);
        case 'new-orders': return handleNewOrders(req, res);
        case 'send-email': return handleSendEmail(req, res);
        default:
            // Fallback for old route payloads like method based deletions or updates
            if (action === 'user-detail' && req.method === 'DELETE') return handleUserDetail(req, res);
            if (action === 'riders' && req.method === 'POST') return handleAddRider(req, res);
            if (action === 'riders' && req.method === 'PATCH') return handleEditRider(req, res);
            if (action === 'promos' && req.method === 'POST') return handleAddPromo(req, res);
            if (action === 'promos' && req.method === 'PATCH') return handleEditPromo(req, res);
            if (action === 'promos' && req.method === 'DELETE') return handleDeletePromo(req, res);
            if (action === 'reviews' && req.method === 'PATCH') return handleReviewStatus(req, res);
            return res.status(400).json({ error: 'Invalid action' });
    }
}

async function handleDashboardStats(req: VercelRequest, res: VercelResponse) {
    try {
        const client = await clientPromise;
        const db = client.db(DB);
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [totalUsers, totalOrders, todayOrders, menuItems, allOrders, blockedUsers, newUsersToday, activeUsersWeek] = await Promise.all([
            db.collection('users').countDocuments({}),
            db.collection('orders').countDocuments({}),
            db.collection('orders').countDocuments({ createdAt: { $gte: yesterday.toISOString() } }),
            db.collection('menu').countDocuments({}),
            db.collection('orders').find({}).project({ total: 1, status: 1, paymentStatus: 1, createdAt: 1 }).toArray(),
            db.collection('users').countDocuments({ status: 'blocked' }),
            db.collection('users').countDocuments({ createdAt: { $gte: todayStart.toISOString() } }),
            db.collection('orders').distinct('customer.email', { createdAt: { $gte: weekAgo.toISOString() } }).then((emails: any[]) => emails.length),
        ]);

        const todayRevenue = allOrders.filter(o => o.createdAt >= todayStart.toISOString() && o.paymentStatus === 'paid').reduce((s, o) => s + (o.total || 0), 0);
        const totalRevenue = allOrders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + (o.total || 0), 0);
        const pendingOrders = allOrders.filter(o => ['pending', 'confirmed'].includes(o.status)).length;
        const preparingOrders = allOrders.filter(o => o.status === 'preparing').length;
        const readyOrders = allOrders.filter(o => o.status === 'ready').length;

        const unavailableItems = await db.collection('menu').find({ available: false }).project({ name: 1 }).toArray();
        const recentOrders = await db.collection('orders').find({}).sort({ createdAt: -1 }).limit(5).toArray();

        return res.status(200).json({
            totalUsers, totalOrders, todayOrders, menuItems, todayRevenue, totalRevenue,
            pendingOrders, preparingOrders, readyOrders, blockedUsers, newUsersToday, activeUsersWeek,
            unavailableItems: unavailableItems.map(i => ({ id: i._id.toString(), name: i.name })),
            recentOrders: recentOrders.map(o => ({ id: o._id.toString(), orderNumber: o.orderNumber, customer: o.customer, total: o.total, status: o.status, createdAt: o.createdAt, paymentMethod: o.paymentMethod, paymentStatus: o.paymentStatus })),
        });
    } catch (e) { return res.status(500).json({ error: 'Internal server error' }); }
}

async function handleGetAdminOrders(req: VercelRequest, res: VercelResponse) {
    const client = await clientPromise;
    const db = client.db(DB);
    if (req.method === 'DELETE') {
        const id = req.query.id as string;
        if (id) {
            await db.collection('orders').deleteOne({ _id: new ObjectId(id) });
            return res.status(200).json({ success: true });
        }
    }
    const allOrders = await db.collection('orders').find({}).sort({ createdAt: -1 }).toArray();
    return res.status(200).json(allOrders.map((o: any) => ({ ...o, id: o._id.toString() })));
}

async function handleClearTestOrders(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });
    const client = await clientPromise;
    await client.db(DB).collection('orders').deleteMany({
        $or: [
            { orderNumber: { $regex: /^ORD-/i } },
            { 'customer.phone': { $regex: /555/ } },
            { customerPhone: { $regex: /555/ } }
        ]
    });
    return res.status(200).json({ success: true });
}

async function handleOrderStatus(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });
    
    const client = await clientPromise;
    const db = client.db(DB);
    const orderId = req.query.id as string || req.body?.id?.toString();
    const { status, cancelReason } = req.body;
    const parsedStatus = status || req.query?.status;
    if (!orderId || !parsedStatus) return res.status(400).json({ error: 'Missing id or status' });

    const validStatuses = ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled', 'pending'];
    if (!validStatuses.includes(parsedStatus)) return res.status(400).json({ error: 'Invalid status' });

    const update: any = { 
        $set: { 
            status: parsedStatus, 
            updatedAt: new Date().toISOString(),
            [`statusHistory.${parsedStatus}`]: new Date().toISOString()
        } 
    };
    if (cancelReason) update.$set.cancelReason = cancelReason;

    const timelineEntry = { status: parsedStatus, timestamp: new Date().toISOString(), ...(cancelReason ? { reason: cancelReason } : {}) };
    update.$push = { statusHistoryLog: timelineEntry };

    const orQuery: any[] = [
        { id: parseInt(orderId) },
        { id: orderId?.toString() },
        { orderNumber: orderId?.toString() },
    ];
    if (ObjectId.isValid(orderId)) orQuery.push({ _id: new ObjectId(orderId) });

    const result = await db.collection('orders').updateOne({ $or: orQuery }, update);
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Order not found', searchedId: orderId });

    const order = await db.collection('orders').findOne({ $or: orQuery });
    const emailMessages: Record<string, string> = {
        confirmed: "Your Golden Lotus order has been confirmed!",
        preparing: "Good news! We're preparing your order right now.",
        ready: "Your order is ready for pickup/delivery!",
        out_for_delivery: "Your order is on its way to you!",
        delivered: "Your order has been delivered. Enjoy!",
        cancelled: "Unfortunately your order has been cancelled."
    };

    const customerEmail = order?.customerEmail || order?.customer?.email || order?.email;
    if (emailMessages[parsedStatus] && customerEmail && process.env.GMAIL_USER) {
        try {
            const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
            let subjectMap: Record<string, string> = {
                confirmed: "Your order has been confirmed! 🎉", preparing: "Your food is being prepared! 👨‍🍳",
                ready: "Your order is ready! 🎁", out_for_delivery: "Your order is on the way! 🛵",
                delivered: "Order delivered! Enjoy your meal! 🍜", cancelled: "Your order was cancelled. We're sorry."
            };
            await transporter.sendMail({
                from: `"Golden Lotus Delivery" <${process.env.GMAIL_USER}>`,
                to: customerEmail,
                subject: subjectMap[parsedStatus] || `Order ${order?.orderNumber || ''} — Status Update`,
                text: emailMessages[parsedStatus]
            });
        } catch (e) {
            console.error("Failed to send order status email:", e);
        }
    }
    return res.status(200).json({ success: true, updatedStatus: parsedStatus });
}

async function handleUsers(req: VercelRequest, res: VercelResponse) {
    const client = await clientPromise;
    const db = client.db(DB);
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || 'all';

    const filter: any = {};
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
        ];
    }
    if (status === 'blocked') filter.status = 'blocked';
    if (status === 'active') filter.status = { $ne: 'blocked' };

    const [users, total] = await Promise.all([
        db.collection('users').find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).project({ password: 0 }).toArray(),
        db.collection('users').countDocuments(filter),
    ]);

    const userIds = users.map(u => u._id.toString());
    const orderStats = await db.collection('orders').aggregate([
        { $match: { 'customer.id': { $in: userIds } } },
        { $group: { _id: '$customer.id', totalOrders: { $sum: 1 }, totalSpent: { $sum: '$total' } } },
    ]).toArray();
    const statsMap = Object.fromEntries(orderStats.map(s => [s._id, { totalOrders: s.totalOrders, totalSpent: s.totalSpent }]));

    return res.status(200).json({
        users: users.map(u => ({
            id: u._id.toString(), name: u.name, email: u.email, phone: u.phone || '',
            avatar: u.avatar || '', createdAt: u.createdAt, status: u.status || 'active',
            loyaltyPoints: u.loyaltyPoints || 0,
            totalOrders: statsMap[u._id.toString()]?.totalOrders || 0,
            totalSpent: statsMap[u._id.toString()]?.totalSpent || 0,
        })),
        total, page, totalPages: Math.ceil(total / limit),
    });
}

async function handleUserDetail(req: VercelRequest, res: VercelResponse) {
    const client = await clientPromise;
    const db = client.db(DB);
    const userId = req.query.id as string;
    if (!userId) return res.status(400).json({ error: 'Missing user id' });

    if (req.method === 'GET') {
        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        const orders = await db.collection('orders').find({ 'customer.id': userId }).sort({ createdAt: -1 }).toArray();
        return res.status(200).json({
            user: { ...user, id: user._id.toString() },
            orders: orders.map(o => ({ id: o._id.toString(), orderNumber: o.orderNumber, items: o.items, total: o.total, status: o.status, createdAt: o.createdAt, paymentMethod: o.paymentMethod })),
        });
    }
    if (req.method === 'PATCH') {
        const { status: userStatus } = req.body;
        if (userStatus) await db.collection('users').updateOne({ _id: new ObjectId(userId) }, { $set: { status: userStatus } });
        return res.status(200).json({ success: true });
    }
    if (req.method === 'DELETE') {
        await db.collection('users').deleteOne({ _id: new ObjectId(userId) });
        return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
}

async function handleBlockUser(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });
    const userId = req.query.id as string;
    if (!userId) return res.status(400).json({ error: 'User id required' });
    const client = await clientPromise;
    await client.db(DB).collection('users').updateOne({ _id: new ObjectId(userId) }, { $set: { status: 'blocked' } });
    return res.status(200).json({ success: true });
}

async function handleReviews(req: VercelRequest, res: VercelResponse) {
    const client = await clientPromise;
    const db = client.db(DB);
    if (req.method === 'GET') {
        const filter = (req.query.filter as string) || 'all';
        const query: any = {};
        if (filter !== 'all') query.status = filter;
        const reviews = await db.collection('reviews').find(query).sort({ createdAt: -1 }).toArray();
        const total = await db.collection('reviews').countDocuments({});
        const pending = await db.collection('reviews').countDocuments({ status: 'pending' });
        const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length : 0;
        return res.status(200).json({
            reviews: reviews.map(r => ({ ...r, id: r._id.toString() })),
            stats: { total, pending, avgRating: Math.round(avgRating * 10) / 10 },
        });
    }
    if (req.method === 'DELETE') {
        const reviewId = req.query.id as string;
        await db.collection('reviews').deleteOne({ _id: new ObjectId(reviewId) });
        return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
}

async function handleReviewStatus(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });
    const client = await clientPromise;
    const db = client.db(DB);
    const reviewId = req.query.id as string;
    const { status: reviewStatus } = req.body;
    await db.collection('reviews').updateOne({ _id: new ObjectId(reviewId) }, { $set: { status: reviewStatus } });
    return res.status(200).json({ success: true });
}

async function handlePromos(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const client = await clientPromise;
    const promos = await client.db(DB).collection('promos').find({}).sort({ createdAt: -1 }).toArray();
    return res.status(200).json(promos.map(p => ({ ...p, id: p._id.toString() })));
}

async function handleAddPromo(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const client = await clientPromise;
    const promo = { ...req.body, uses: 0, status: 'active', createdAt: new Date().toISOString() };
    const result = await client.db(DB).collection('promos').insertOne(promo);
    return res.status(201).json({ ...promo, id: result.insertedId.toString() });
}

async function handleEditPromo(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });
    const promoId = req.query.id as string;
    const updates = req.body; delete updates.id; delete updates._id;
    const client = await clientPromise;
    await client.db(DB).collection('promos').updateOne({ _id: new ObjectId(promoId) }, { $set: updates });
    return res.status(200).json({ success: true });
}

async function handleDeletePromo(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });
    const promoId = req.query.id as string;
    const client = await clientPromise;
    await client.db(DB).collection('promos').deleteOne({ _id: new ObjectId(promoId) });
    return res.status(200).json({ success: true });
}

async function handleRiders(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const client = await clientPromise;
    const riders = await client.db(DB).collection('riders').find({}).toArray();
    return res.status(200).json(riders.map(r => ({ ...r, id: r._id.toString() })));
}

async function handleAddRider(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const client = await clientPromise;
    const { name, phone, photo, status: riderStatus } = req.body;
    const result = await client.db(DB).collection('riders').insertOne({ name, phone, photo: photo || '', status: riderStatus || 'available', totalDeliveries: 0, todayDeliveries: 0, createdAt: new Date().toISOString() });
    return res.status(201).json({ id: result.insertedId.toString(), name, phone });
}

async function handleEditRider(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });
    const client = await clientPromise;
    const riderId = req.query.id as string;
    const updates = req.body; delete updates.id; delete updates._id;
    await client.db(DB).collection('riders').updateOne({ _id: new ObjectId(riderId) }, { $set: updates });
    return res.status(200).json({ success: true });
}

async function handleZones(req: VercelRequest, res: VercelResponse) {
    const client = await clientPromise;
    const db = client.db(DB);
    if (req.method === 'GET') {
        const zones = await db.collection('deliveryZones').find({}).toArray();
        return res.status(200).json(zones.map(z => ({ ...z, id: z._id.toString() })));
    }
    if (req.method === 'POST') {
        const result = await db.collection('deliveryZones').insertOne({ ...req.body, createdAt: new Date().toISOString() });
        return res.status(201).json({ id: result.insertedId.toString(), ...req.body });
    }
    if (req.method === 'PATCH') {
        const zoneId = req.query.id as string;
        const updates = req.body; delete updates.id; delete updates._id;
        await db.collection('deliveryZones').updateOne({ _id: new ObjectId(zoneId) }, { $set: updates });
        return res.status(200).json({ success: true });
    }
    if (req.method === 'DELETE') {
        await db.collection('deliveryZones').deleteOne({ _id: new ObjectId(req.query.id as string) });
        return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
}

async function handleLoyaltySettings(req: VercelRequest, res: VercelResponse) {
    const client = await clientPromise;
    const db = client.db(DB);
    if (req.method === 'GET') {
        const settings = await db.collection('settings').findOne({ key: 'loyalty' });
        return res.status(200).json(settings?.value || { earnRate: 1, earnPer: 1, redeemRate: 100, redeemValue: 1 });
    }
    if (req.method === 'PATCH') {
        await db.collection('settings').updateOne({ key: 'loyalty' }, { $set: { key: 'loyalty', value: req.body } }, { upsert: true });
        return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
}

async function handleLoyaltyAdjust(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { userId, points, reason } = req.body;
    if (!userId || points === undefined) return res.status(400).json({ error: 'Missing userId or points' });
    const entry = { date: new Date().toISOString(), action: points > 0 ? 'bonus' : 'adjustment', points, reason: reason || '', orderId: '' };
    const client = await clientPromise;
    await client.db(DB).collection('users').updateOne({ _id: new ObjectId(userId) }, { $inc: { loyaltyPoints: points }, $push: { loyaltyHistory: entry } } as any);
    return res.status(200).json({ success: true });
}

async function handleLoyaltyLeaderboard(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const client = await clientPromise;
    const top = await client.db(DB).collection('users').find({}).sort({ loyaltyPoints: -1 }).limit(20).project({ password: 0, savedAddresses: 0 }).toArray();
    return res.status(200).json(top.map(u => ({ id: u._id.toString(), name: u.name, email: u.email, loyaltyPoints: u.loyaltyPoints || 0 })));
}

async function handleNewOrders(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const client = await clientPromise;
    const since = req.query.since as string;
    const query: any = {};
    if (since) query.createdAt = { $gt: since };
    const count = await client.db(DB).collection('orders').countDocuments(query);
    const orders = since ? await client.db(DB).collection('orders').find(query).sort({ createdAt: -1 }).limit(5).toArray() : [];
    return res.status(200).json({ count, orders: orders.map(o => ({ id: o._id.toString(), orderNumber: o.orderNumber, total: o.total, createdAt: o.createdAt })) });
}

async function handleSendEmail(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { name, email, phone, date, guests, serviceType, address, message } = req.body;
    try {
        const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
        await transporter.sendMail({
            from: `"Golden Lotus Delivery" <${process.env.GMAIL_USER}>`,
            to: process.env.VITE_ADMIN_EMAIL || process.env.GMAIL_USER,
            replyTo: email,
            subject: `New Catering Request from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nDate: ${date}\nGuests: ${guests}\nService: ${serviceType}\nAddress: ${address}\nMessage: ${message}`
        });
        await transporter.sendMail({
            from: `"Golden Lotus Delivery" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: `Catering Request Received - Golden Lotus`,
            text: `Hi ${name},\n\nWe have received your catering request for ${date}. Our team will contact you shortly at ${phone}.\n\nThank you,\nGolden Lotus Team`
        });
        return res.status(200).json({ success: true });
    } catch(e) { return res.status(500).json({ error: 'Failed' }); }
}
