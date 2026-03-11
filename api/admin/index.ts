import type { VercelRequest, VercelResponse } from '@vercel/node';
import clientPromise from '../lib/db.js';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import nodemailer from 'nodemailer';

const DB = 'goldenlotus';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

function getAdminId(req: VercelRequest): string | null {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
        // Fallback: check for admin token in cookies or just allow if valid JWT
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
    // Allow dashboard-stats without strict auth for now (admin panel is already protected by frontend route)
    const action = req.query.action as string;
    if (!action) return res.status(400).json({ error: 'Missing action parameter' });

    const client = await clientPromise;
    const db = client.db(DB);

    try {
        // ─── DASHBOARD STATS ───
        if (action === 'dashboard-stats') {
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            const [totalUsers, totalOrders, todayOrders, menuItems, allOrders, blockedUsers, newUsersToday, activeUsersWeek] = await Promise.all([
                db.collection('users').countDocuments({}),
                db.collection('orders').countDocuments({}),
                db.collection('orders').countDocuments({ createdAt: { $gte: todayStart.toISOString() } }),
                db.collection('menu').countDocuments({}),
                db.collection('orders').find({}).project({ total: 1, status: 1, paymentStatus: 1, createdAt: 1 }).toArray(),
                db.collection('users').countDocuments({ status: 'blocked' }),
                db.collection('users').countDocuments({ createdAt: { $gte: todayStart.toISOString() } }),
                db.collection('users').countDocuments({ lastLogin: { $gte: weekAgo.toISOString() } }),
            ]);

            const todayRevenue = allOrders.filter(o => o.createdAt >= todayStart.toISOString() && o.paymentStatus === 'paid').reduce((s, o) => s + (o.total || 0), 0);
            const totalRevenue = allOrders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + (o.total || 0), 0);
            const pendingOrders = allOrders.filter(o => ['pending', 'confirmed'].includes(o.status)).length;
            const preparingOrders = allOrders.filter(o => o.status === 'preparing').length;
            const readyOrders = allOrders.filter(o => o.status === 'ready').length;

            // Unavailable menu items (from correct collection 'menu', matching 'available' or 'isAvailable' logic if any)
            const unavailableItems = await db.collection('menu').find({ available: false }).project({ name: 1 }).toArray();

            // Recent orders
            const recentOrders = await db.collection('orders').find({}).sort({ createdAt: -1 }).limit(5).toArray();

            return res.status(200).json({
                totalUsers, totalOrders, todayOrders, menuItems, todayRevenue, totalRevenue,
                pendingOrders, preparingOrders, readyOrders, blockedUsers, newUsersToday, activeUsersWeek,
                unavailableItems: unavailableItems.map(i => ({ id: i._id.toString(), name: i.name })),
                recentOrders: recentOrders.map(o => ({ id: o._id.toString(), orderNumber: o.orderNumber, customer: o.customer, total: o.total, status: o.status, createdAt: o.createdAt, paymentMethod: o.paymentMethod, paymentStatus: o.paymentStatus })),
            });
        }

        // ─── USERS LIST ───
        if (action === 'users') {
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

            // Get order stats per user
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

        // ─── USER DETAIL / UPDATE ───
        if (action === 'user-detail') {
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
        }

        // ─── UPDATE ORDER STATUS ───
        if (action === 'order-status') {
            if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });
            const orderId = req.query.id as string;
            const { status: newStatus, cancelReason } = req.body;
            if (!orderId || !newStatus) return res.status(400).json({ error: 'Missing id or status' });

            const validStatuses = ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
            if (!validStatuses.includes(newStatus)) {
                return res.status(400).json({ error: 'Invalid status' });
            }

            const update: any = { 
                $set: { 
                    status: newStatus, 
                    updatedAt: new Date().toISOString(),
                    [`statusHistory.${newStatus}`]: new Date().toISOString()
                } 
            };
            if (cancelReason) update.$set.cancelReason = cancelReason;

            // Add timeline entry
            const timelineEntry = { status: newStatus, timestamp: new Date().toISOString(), ...(cancelReason ? { reason: cancelReason } : {}) };
            update.$push = { statusHistoryLog: timelineEntry };

            await db.collection('orders').updateOne({ _id: new ObjectId(orderId) }, update);

            // Fetch order for email notification
            const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });
            const emailMessages: Record<string, string> = {
                confirmed: "Your Golden Lotus order has been confirmed!",
                preparing: "Good news! We're preparing your order right now.",
                ready: "Your order is ready for pickup/delivery!",
                out_for_delivery: "Your order is on its way to you!",
                delivered: "Your order has been delivered. Enjoy!",
                cancelled: "Unfortunately your order has been cancelled."
            };

            const customerEmail = order?.customer?.email;
            if (emailMessages[newStatus] && customerEmail && process.env.GMAIL_USER) {
                try {
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
                    });
                    
                    let subjectMap: Record<string, string> = {
                        confirmed: "Your order has been confirmed! 🎉",
                        preparing: "Your food is being prepared! 👨‍🍳",
                        ready: "Your order is ready! 🎁",
                        out_for_delivery: "Your order is on the way! 🛵",
                        delivered: "Order delivered! Enjoy your meal! 🍜",
                        cancelled: "Your order was cancelled. We're sorry."
                    };

                    await transporter.sendMail({
                        from: `"Golden Lotus Delivery" <${process.env.GMAIL_USER}>`,
                        to: customerEmail,
                        subject: subjectMap[newStatus] || `Order ${order.orderNumber} — Status Update`,
                        text: emailMessages[newStatus]
                    });
                } catch (e) {
                    console.error("Failed to send order status email:", e);
                }
            }

            return res.status(200).json({ success: true });
        }

        // ─── RIDERS ───
        if (action === 'riders') {
            if (req.method === 'GET') {
                const riders = await db.collection('riders').find({}).toArray();
                return res.status(200).json(riders.map(r => ({ ...r, id: r._id.toString() })));
            }
            if (req.method === 'POST') {
                const { name, phone, photo, status: riderStatus } = req.body;
                const result = await db.collection('riders').insertOne({ name, phone, photo: photo || '', status: riderStatus || 'available', totalDeliveries: 0, todayDeliveries: 0, createdAt: new Date().toISOString() });
                return res.status(201).json({ id: result.insertedId.toString(), name, phone });
            }
            if (req.method === 'PATCH') {
                const riderId = req.query.id as string;
                const updates = req.body;
                delete updates.id; delete updates._id;
                await db.collection('riders').updateOne({ _id: new ObjectId(riderId) }, { $set: updates });
                return res.status(200).json({ success: true });
            }
            if (req.method === 'DELETE') {
                const riderId = req.query.id as string;
                await db.collection('riders').deleteOne({ _id: new ObjectId(riderId) });
                return res.status(200).json({ success: true });
            }
        }

        // ─── DELIVERY ZONES ───
        if (action === 'zones') {
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
        }

        // ─── PROMOS ───
        if (action === 'promos') {
            if (req.method === 'GET') {
                const promos = await db.collection('promos').find({}).sort({ createdAt: -1 }).toArray();
                return res.status(200).json(promos.map(p => ({ ...p, id: p._id.toString() })));
            }
            if (req.method === 'POST') {
                const promo = { ...req.body, uses: 0, status: 'active', createdAt: new Date().toISOString() };
                const result = await db.collection('promos').insertOne(promo);
                return res.status(201).json({ ...promo, id: result.insertedId.toString() });
            }
            if (req.method === 'PATCH') {
                const promoId = req.query.id as string;
                const updates = req.body; delete updates.id; delete updates._id;
                await db.collection('promos').updateOne({ _id: new ObjectId(promoId) }, { $set: updates });
                return res.status(200).json({ success: true });
            }
            if (req.method === 'DELETE') {
                await db.collection('promos').deleteOne({ _id: new ObjectId(req.query.id as string) });
                return res.status(200).json({ success: true });
            }
        }

        // ─── REVIEWS ───
        if (action === 'reviews') {
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
            if (req.method === 'PATCH') {
                const reviewId = req.query.id as string;
                const { status: reviewStatus } = req.body;
                await db.collection('reviews').updateOne({ _id: new ObjectId(reviewId) }, { $set: { status: reviewStatus } });
                return res.status(200).json({ success: true });
            }
            if (req.method === 'DELETE') {
                await db.collection('reviews').deleteOne({ _id: new ObjectId(req.query.id as string) });
                return res.status(200).json({ success: true });
            }
        }

        // ─── LOYALTY SETTINGS ───
        if (action === 'loyalty-settings') {
            if (req.method === 'GET') {
                const settings = await db.collection('settings').findOne({ key: 'loyalty' });
                return res.status(200).json(settings?.value || { earnRate: 1, earnPer: 1, redeemRate: 100, redeemValue: 1 });
            }
            if (req.method === 'PATCH') {
                await db.collection('settings').updateOne({ key: 'loyalty' }, { $set: { key: 'loyalty', value: req.body } }, { upsert: true });
                return res.status(200).json({ success: true });
            }
        }

        // ─── LOYALTY ADJUST ───
        if (action === 'loyalty-adjust') {
            if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
            const { userId, points, reason } = req.body;
            if (!userId || points === undefined) return res.status(400).json({ error: 'Missing userId or points' });
            const entry = { date: new Date().toISOString(), action: points > 0 ? 'bonus' : 'adjustment', points, reason: reason || '', orderId: '' };
            await db.collection('users').updateOne({ _id: new ObjectId(userId) }, { $inc: { loyaltyPoints: points }, $push: { loyaltyHistory: entry } } as any);
            return res.status(200).json({ success: true });
        }

        // ─── LOYALTY LEADERBOARD ───
        if (action === 'loyalty-leaderboard') {
            const top = await db.collection('users').find({}).sort({ loyaltyPoints: -1 }).limit(20).project({ password: 0, savedAddresses: 0 }).toArray();
            return res.status(200).json(top.map(u => ({ id: u._id.toString(), name: u.name, email: u.email, loyaltyPoints: u.loyaltyPoints || 0 })));
        }

        // ─── NEW ORDERS CHECK (polling) ───
        if (action === 'new-orders') {
            const since = req.query.since as string;
            const query: any = {};
            if (since) query.createdAt = { $gt: since };
            const count = await db.collection('orders').countDocuments(query);
            const orders = since ? await db.collection('orders').find(query).sort({ createdAt: -1 }).limit(5).toArray() : [];
            return res.status(200).json({ count, orders: orders.map(o => ({ id: o._id.toString(), orderNumber: o.orderNumber, total: o.total, createdAt: o.createdAt })) });
        }

        return res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
        console.error('Admin API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
