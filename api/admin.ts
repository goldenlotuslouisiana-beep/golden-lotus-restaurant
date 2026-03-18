import type { VercelRequest, VercelResponse } from '@vercel/node';
import clientPromise from '../src/lib/db.js';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import nodemailer from 'nodemailer';

const DB = 'goldenlotus';
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET = process.env.JWT_SECRET;

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

    // Admin auth gate for protected actions
    const protectedActions = new Set([
        'dashboard-stats', 'orders', 'users', 'user-detail',
        'block-user', 'reviews', 'review-status', 'promos',
        'add-promo', 'edit-promo', 'delete-promo',
        'loyalty-settings', 'loyalty-adjust', 'loyalty-leaderboard',
        'riders', 'zones', 'order-status', 'send-email',
        'save-locations', 'save-testimonials', 'save-gallery',
        'save-features', 'save-faqs', 'save-menu-categories',
        'save-site-content', 'save-events', 'save-event-packages',
        'save-catering-packages', 'save-catering-inquiries',
        'save-homepage', 'save-homepage-content',
        'toggle-homepage-section', 'reorder-homepage-sections',
        'save-page-content', 'toggle-page-section',
        'save-catering-content', 'toggle-catering-section',
        'get-catering-requests', 'update-catering-request',
    ]);

    if (protectedActions.has(action)) {
        const adminId = getAdminId(req);
        if (!adminId) {
            return res.status(401).json({
                error: 'Unauthorized. Admin access required.'
            });
        }
    }

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
        case 'loyalty-leaderboard': return handleLoyaltyLeaderboard(req, res);
        case 'new-orders': return handleNewOrders(req, res);
        case 'send-email': return handleSendEmail(req, res);
        case 'riders': return handleRiders(req, res);
        case 'zones': return handleZones(req, res);
        case 'coupons': return handleCoupons(req, res);
        // ─── New CRUD actions for localStorage→MongoDB migration ───
        case 'save-locations': return handleAdminSaveCollection(req, res, 'locations');
        case 'save-testimonials': return handleAdminSaveCollection(req, res, 'testimonials');
        case 'save-gallery': return handleAdminSaveCollection(req, res, 'gallery');
        case 'save-features': return handleAdminSaveCollection(req, res, 'features');
        case 'save-faqs': return handleAdminSaveCollection(req, res, 'faqs');
        case 'save-menu-categories': return handleAdminSaveCollection(req, res, 'menu_categories');
        case 'save-site-content': return handleAdminSaveSiteContent(req, res);
        case 'save-events': return handleAdminSaveCollection(req, res, 'events');
        case 'save-event-packages': return handleAdminSaveCollection(req, res, 'event_packages');
        case 'save-catering-packages': return handleAdminCrudItem(req, res, 'catering_packages');
        case 'save-catering-inquiries': return handleAdminCrudItem(req, res, 'catering_inquiries');
        case 'get-homepage': return handleGetHomepage(req, res);
        case 'save-homepage': return handleSaveHomepage(req, res);
        case 'get-homepage-content': return handleGetHomepage(req, res);
        case 'save-homepage-content': return handleSaveHomepage(req, res);
        case 'toggle-homepage-section': return handleToggleHomepageSection(req, res);
        case 'reorder-homepage-sections': return handleReorderHomepageSections(req, res);
        case 'get-page-content': return handleGetPageContent(req, res);
        case 'save-page-content': return handleSavePageContent(req, res);
        case 'toggle-page-section': return handleTogglePageSection(req, res);
        case 'send-contact-email': return handleSendContactEmail(req, res);
        case 'get-catering-content': return handleGetCateringContent(req, res);
        case 'save-catering-content': return handleSaveCateringContent(req, res);
        case 'toggle-catering-section': return handleToggleCateringSection(req, res);
        case 'send-catering-request': return handleSendCateringRequest(req, res);
        case 'get-catering-packages': return handleGetCateringPackagesPublic(req, res);
        case 'get-catering-requests': return handleGetCateringRequests(req, res);
        case 'update-catering-request': return handleUpdateCateringRequest(req, res);
        case 'get-promos': return handleGetPromosPublic(req, res);
        case 'validate-promo': return handleValidatePromo(req, res);
        default:
            // Fallback for old route payloads like method based deletions or updates
            if (action === 'user-detail' && req.method === 'DELETE') return handleUserDetail(req, res);
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
        ready: "Your order is ready for pickup!",
        picked_up: "Your order has been picked up. Enjoy!",
        completed: "Your order is complete. Thank you!",
        cancelled: "Unfortunately your order has been cancelled."
    };

    const customerEmail = order?.customerEmail || order?.customer?.email || order?.email;
    if (emailMessages[parsedStatus] && customerEmail && process.env.GMAIL_USER) {
        try {
            const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
            let subjectMap: Record<string, string> = {
                confirmed: "Your order has been confirmed! 🎉", preparing: "Your food is being prepared! 👨‍🍳",
        ready: "Your order is ready! 🎁", picked_up: "Your order was picked up! 🛍️",
        completed: "Order completed! Enjoy your meal! 🍜", cancelled: "Your order was cancelled. We're sorry."
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

// Default coupons for Special Offers
const defaultCoupons = [
    { id: '1', code: 'DIMSUM10', description: 'Grab 10% off on Dim Sum orders over $50!', discountType: 'percentage', discountValue: 10, minOrder: 50, active: true },
    { id: '2', code: 'FREEDELIVERY', description: 'Enjoy FREE delivery on all orders over $40!', discountType: 'free_delivery', discountValue: 0, minOrder: 40, active: true },
    { id: '3', code: 'BOBAMONDAY', description: 'Use code BOBAMONDAY for $5 off your total order on Mondays.', discountType: 'fixed', discountValue: 5, minOrder: 25, active: true },
];

async function handleCoupons(req: VercelRequest, res: VercelResponse) {
    const client = await clientPromise;
    const db = client.db(DB);
    
    if (req.method === 'GET') {
        try {
            const coupons = await db.collection('coupons').find({}).toArray();
            if (coupons.length === 0) {
                // Seed default coupons
                await db.collection('coupons').insertMany(defaultCoupons);
                return res.status(200).json(defaultCoupons);
            }
            return res.status(200).json(coupons.map(c => ({ ...c, id: c._id?.toString() || c.id })));
        } catch (e) {
            return res.status(200).json(defaultCoupons);
        }
    }
    
    if (req.method === 'POST') {
        const coupon = {
            ...req.body,
            createdAt: new Date().toISOString(),
        };
        try {
            const result = await db.collection('coupons').insertOne(coupon);
            return res.status(201).json({ ...coupon, id: result.insertedId.toString() });
        } catch (e) {
            return res.status(500).json({ error: 'Failed to create coupon' });
        }
    }
    
    if (req.method === 'PATCH') {
        const couponId = req.query.id as string;
        const updates = req.body;
        delete updates.id; delete updates._id;
        
        try {
            if (ObjectId.isValid(couponId)) {
                await db.collection('coupons').updateOne(
                    { _id: new ObjectId(couponId) },
                    { $set: updates }
                );
            }
            return res.status(200).json({ success: true });
        } catch (e) {
            return res.status(500).json({ error: 'Failed to update coupon' });
        }
    }
    
    if (req.method === 'DELETE') {
        const couponId = req.query.id as string;
        try {
            if (ObjectId.isValid(couponId)) {
                await db.collection('coupons').deleteOne({ _id: new ObjectId(couponId) });
            }
            return res.status(200).json({ success: true });
        } catch (e) {
            return res.status(500).json({ error: 'Failed to delete coupon' });
        }
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

// ─── Homepage Content ─────────────────────────────────────────────────────

const DEFAULT_HOMEPAGE_CONTENT = {
    section: 'homepage',
    sections: {
        hero:         { visible: true, order: 1 },
        ticker:       { visible: true, order: 2 },
        featured:     { visible: true, order: 3 },
        whyUs:        { visible: true, order: 4 },
        testimonials: { visible: true, order: 5 },
        cta:          { visible: true, order: 6 },
    },
    hero: {
        eyebrow: 'Alexandria, Louisiana · Est. 2010',
        titleLine1: 'Taste the art of',
        titleLine2Italic: 'authentic Indian',
        titleLine3Bold: 'cuisine.',
        subtitle: 'Generations-old recipes, the finest spices, and a passion for flavors that transport you straight to the heart of India — one dish at a time.',
        button1Text: 'Order Online →',
        button2Text: 'View Our Menu',
        stats: [
            { number: '14', suffix: '+', label: 'Years serving' },
            { number: '80', suffix: '+', label: 'Menu items' },
            { number: '4.9', suffix: '', label: 'Guest rating' },
            { number: '3k', suffix: '+', label: 'Happy guests' },
        ],
        floatingCard: { label: "Chef's Signature", dishName: 'Butter Chicken', subtitle: 'Most ordered dish', rating: '5.0 · 248 reviews' },
        estYear: '2010',
        speedBadgeTitle: 'Ready in 15 min',
        speedBadgeSubtitle: 'Fast pickup available',
    },
    ticker: ['Authentic Indian Cuisine', 'Fresh Ingredients Daily', 'Online Ordering Available', 'Catering Services', 'Family Recipes Since 2010', 'Alexandria Louisiana', 'Pickup in 15 Minutes'],
    featuredSection: { eyebrow: 'Our Specialties', titleLine1: 'Dishes crafted with', titleLine2Italic: 'love & tradition' },
    whyUs: {
        eyebrow: 'Why Golden Lotus',
        titleLine1: 'A dining experience',
        titleLine2Italic: 'no other',
        description: 'From the first bite to the last, we pour our heritage into every dish — sourcing the finest spices, honoring generations-old recipes, and ensuring every visit is extraordinary.',
        features: [
            { icon: '🌿', title: 'Fresh Daily', description: 'Ingredients sourced fresh every morning' },
            { icon: '👨‍🍳', title: 'Master Chefs', description: 'Trained in traditional Indian culinary arts' },
            { icon: '⚡', title: 'Fast Pickup', description: 'Ready in 15-20 minutes, order anytime' },
            { icon: '🎪', title: 'Catering', description: 'Events, parties & corporate catering' },
        ],
    },
    testimonials: {
        eyebrow: 'Guest Reviews',
        title: 'What our guests',
        titleItalic: 'say',
        items: [
            { name: 'Sarah M.', role: 'Regular · Alexandria', quote: 'The butter chicken is absolutely divine. It tastes exactly like my grandmother used to make in Delhi. Truly authentic!', rating: 5, featured: false },
            { name: 'James R.', role: 'Food blogger · 5 visits', quote: 'Best Indian food in Louisiana, hands down. The biryani is incredible and the online ordering makes everything so effortless.', rating: 5, featured: true },
            { name: 'Amanda K.', role: 'Corporate client', quote: 'Hired Golden Lotus for our corporate event — 200 guests and every single person was blown away. Exceptional catering!', rating: 5, featured: false },
        ],
    },
    cta: {
        eyebrow: 'Ready to order?',
        titleLine1: 'Experience',
        titleItalic: 'authentic',
        titleLine2: 'flavors from the comfort of home',
        description: 'Order online and pick up your favorite dishes in just 15–20 minutes. Fresh, hot, and made with love every single time.',
        button1Text: 'Order Online Now →',
        button2Text: 'View Full Menu',
    },
    footer: {
        restaurantName: 'Golden Lotus',
        description: 'Experience the art of authentic Indian cuisine at Golden Lotus Grill. Located in Alexandria, Louisiana, serving the finest Indian food since 2010.',
        address: '1473 Dorchester Dr, Alexandria, LA 71301',
        phone: '(318) 445-5688',
        email: 'hello@goldenlotusgrill.com',
        copyright: '© 2026 Golden Lotus Indian Cuisine Inc.',
    },
};

async function handleGetHomepage(_req: VercelRequest, res: VercelResponse) {
    try {
        const client = await clientPromise;
        const doc = await client.db(DB).collection('homepage_content').findOne({ section: 'homepage' });
        if (!doc) {
            await client.db(DB).collection('homepage_content').insertOne({ ...DEFAULT_HOMEPAGE_CONTENT });
            return res.status(200).json({ success: true, data: DEFAULT_HOMEPAGE_CONTENT });
        }
        const { _id, ...rest } = doc;
        return res.status(200).json({ success: true, data: rest });
    } catch {
        return res.status(200).json({ success: true, data: DEFAULT_HOMEPAGE_CONTENT });
    }
}

async function handleSaveHomepage(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const content = req.body;
    if (!content || typeof content !== 'object') return res.status(400).json({ error: 'Body must be an object' });
    try {
        const { _id, id, ...rest } = content as any;
        const client = await clientPromise;
        await client.db(DB).collection('homepage_content').updateOne(
            { section: 'homepage' },
            { $set: { ...rest, section: 'homepage', updatedAt: new Date().toISOString() } },
            { upsert: true }
        );
        const updated = await client.db(DB).collection('homepage_content').findOne({ section: 'homepage' });
        if (!updated) return res.status(500).json({ error: 'Failed to save' });
        const { _id: docId, ...updatedRest } = updated;
        return res.status(200).json({ success: true, data: updatedRest });
    } catch (e) {
        console.error('Error saving homepage:', e);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function handleToggleHomepageSection(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { sectionKey, visible } = req.body as { sectionKey: string; visible: boolean };
    if (!sectionKey) return res.status(400).json({ error: 'Missing sectionKey' });
    try {
        const client = await clientPromise;
        const col = client.db(DB).collection('homepage_content');
        await col.updateOne(
            { section: 'homepage' },
            { $set: { [`sections.${sectionKey}.visible`]: visible, updatedAt: new Date().toISOString() } },
            { upsert: true }
        );
        return res.status(200).json({ success: true });
    } catch (e) {
        console.error('Error toggling section:', e);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function handleReorderHomepageSections(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { sections } = req.body as { sections: Record<string, number> };
    if (!sections || typeof sections !== 'object') return res.status(400).json({ error: 'Missing sections map' });
    try {
        const client = await clientPromise;
        const col = client.db(DB).collection('homepage_content');
        const setFields: Record<string, number> = {};
        for (const [key, order] of Object.entries(sections)) {
            setFields[`sections.${key}.order`] = order;
        }
        await col.updateOne(
            { section: 'homepage' },
            { $set: { ...setFields, updatedAt: new Date().toISOString() } },
            { upsert: true }
        );
        return res.status(200).json({ success: true });
    } catch (e) {
        console.error('Error reordering sections:', e);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// ─── Page Content (Contact, Story, Privacy, Terms) ───────────────────────────

const DEFAULT_PAGE_CONTENT: Record<string, any> = {
    contact: {
        section: 'contact',
        hero: { eyebrow: 'Get In Touch', title: "We'd love to", titleItalic: 'hear from you', subtitle: "Have a question, feedback, or want to book catering? We're here to help." },
        info: { address: '1473 Dorchester Dr, Alexandria, LA 71301', phone: '(318) 445-5688', email: 'hello@goldenlotusgrill.com', mapEmbedUrl: '' },
        hours: [
            { day: 'Monday',    open: '11:00 AM', close: '10:00 PM', closed: false },
            { day: 'Tuesday',   open: '11:00 AM', close: '10:00 PM', closed: false },
            { day: 'Wednesday', open: '11:00 AM', close: '10:00 PM', closed: false },
            { day: 'Thursday',  open: '11:00 AM', close: '10:00 PM', closed: false },
            { day: 'Friday',    open: '11:00 AM', close: '11:00 PM', closed: false },
            { day: 'Saturday',  open: '11:00 AM', close: '11:00 PM', closed: false },
            { day: 'Sunday',    open: '12:00 PM', close: '9:00 PM',  closed: false },
        ],
        social: { instagram: '', facebook: '', twitter: '', tiktok: '' },
        sections: { hero: { visible: true }, map: { visible: true }, hours: { visible: true }, form: { visible: true }, social: { visible: true } },
    },
    story: {
        section: 'story',
        hero: { eyebrow: 'Our Story', title: 'A journey of', titleItalic: 'flavors & passion', subtitle: "From a small dream to Alexandria's favorite Indian restaurant", heroImage: '' },
        founding: { eyebrow: 'How It All Started', title: 'Born from a', titleItalic: 'love of cooking', story: 'Our story began in 2010 when we brought the authentic flavors of India to Alexandria, Louisiana. With generations-old recipes and a passion for spices, we set out to create a dining experience unlike anything the region had seen before.\n\nEvery dish we serve carries the soul of traditional Indian cooking — fresh ingredients sourced daily, spices ground in-house, and techniques perfected over decades.', image: '', imageCaption: '' },
        timeline: {
            eyebrow: 'Our Journey', title: 'Milestones that', titleItalic: 'shaped us',
            items: [
                { year: '2010', title: 'Grand Opening', description: 'Golden Lotus opens its doors in Alexandria, LA' },
                { year: '2013', title: 'First Award',   description: 'Voted Best Indian Restaurant in Central Louisiana' },
                { year: '2016', title: 'Menu Expansion',description: 'Added 30+ new dishes inspired by regional Indian cuisine' },
                { year: '2019', title: 'Online Ordering',description: 'Launched online ordering for convenient pickup' },
                { year: '2024', title: 'New Chapter',   description: 'Renovated and launched our new website' },
            ],
        },
        values: {
            eyebrow: 'What We Stand For', title: 'Our core', titleItalic: 'values',
            items: [
                { icon: '🌿', title: 'Fresh Always',    description: 'Every ingredient sourced fresh daily. No shortcuts, ever.' },
                { icon: '❤️', title: 'Made with Love',  description: 'Every dish prepared with the same care as cooking for family.' },
                { icon: '🌍', title: 'Authentic Roots', description: 'Recipes passed down generations, honoring Indian culinary heritage.' },
                { icon: '🤝', title: 'Community First', description: 'Proud to serve and support the Alexandria community.' },
            ],
        },
        team: {
            eyebrow: 'Meet The Team', title: 'The people behind', titleItalic: 'every dish',
            members: [
                { name: 'Head Chef', role: 'Head Chef & Founder', bio: 'With over 20 years of culinary experience, our head chef brings authentic flavors from India to every dish.', image: '' },
                { name: 'Kitchen Manager', role: 'Kitchen Manager', bio: 'Ensuring every order is prepared with the highest standards of quality and freshness.', image: '' },
                { name: 'Front of House', role: 'Guest Experience', bio: 'Making every guest feel welcome and ensuring an exceptional dining experience.', image: '' },
            ],
        },
        gallery: { eyebrow: 'Our Kitchen', title: 'A glimpse', titleItalic: 'inside', images: [] },
        cta: { title: 'Come taste the', titleItalic: 'difference', description: 'Experience the flavors that have made Golden Lotus a beloved part of Alexandria.', buttonText: 'Order Online →', button2Text: 'View Our Menu' },
        sections: { hero: { visible: true }, founding: { visible: true }, timeline: { visible: true }, values: { visible: true }, team: { visible: true }, gallery: { visible: true }, cta: { visible: true } },
    },
    privacy: {
        section: 'privacy',
        lastUpdated: '2026-03-19',
        title: 'Privacy Policy',
        subtitle: 'Your privacy matters to us',
        content: '',
    },
    terms: {
        section: 'terms',
        lastUpdated: '2026-03-19',
        title: 'Terms of Service',
        subtitle: 'Please read these terms carefully',
        content: '',
    },
};

async function handleGetPageContent(req: VercelRequest, res: VercelResponse) {
    const page = (req.query.page as string) || '';
    if (!page) return res.status(400).json({ error: 'Missing page parameter' });
    try {
        const client = await clientPromise;
        const doc = await client.db(DB).collection('page_content').findOne({ section: page });
        if (!doc) {
            const defaultContent = DEFAULT_PAGE_CONTENT[page];
            if (defaultContent) {
                await client.db(DB).collection('page_content').insertOne({ ...defaultContent });
                return res.status(200).json({ success: true, data: defaultContent });
            }
            return res.status(404).json({ error: 'Page not found' });
        }
        const { _id, ...rest } = doc;
        return res.status(200).json({ success: true, data: rest });
    } catch {
        const defaultContent = DEFAULT_PAGE_CONTENT[page];
        return res.status(200).json({ success: true, data: defaultContent || null });
    }
}

async function handleSavePageContent(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const body = req.body as any;
    const page = body?.page || body?.section;
    if (!page) return res.status(400).json({ error: 'Missing page' });
    try {
        const { _id, id, page: _p, ...rest } = body;
        const client = await clientPromise;
        await client.db(DB).collection('page_content').updateOne(
            { section: page },
            { $set: { ...rest, section: page, updatedAt: new Date().toISOString() } },
            { upsert: true }
        );
        const updated = await client.db(DB).collection('page_content').findOne({ section: page });
        if (!updated) return res.status(500).json({ error: 'Failed to save' });
        const { _id: docId, ...updatedRest } = updated;
        return res.status(200).json({ success: true, data: updatedRest });
    } catch (e) {
        console.error('Error saving page content:', e);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function handleTogglePageSection(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { page, sectionKey, visible } = req.body as { page: string; sectionKey: string; visible: boolean };
    if (!page || !sectionKey) return res.status(400).json({ error: 'Missing page or sectionKey' });
    try {
        const client = await clientPromise;
        await client.db(DB).collection('page_content').updateOne(
            { section: page },
            { $set: { [`sections.${sectionKey}.visible`]: visible, updatedAt: new Date().toISOString() } },
            { upsert: true }
        );
        return res.status(200).json({ success: true });
    } catch (e) {
        console.error('Error toggling page section:', e);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function handleSendContactEmail(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { name, email, phone, subject, message } = req.body as { name: string; email: string; phone?: string; subject: string; message: string };
    if (!name || !email || !subject || !message) return res.status(400).json({ error: 'Missing required fields' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email address' });
    try {
        const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
        await transporter.sendMail({
            from: `"Golden Lotus Website" <${process.env.GMAIL_USER}>`,
            to: process.env.VITE_ADMIN_EMAIL || process.env.GMAIL_USER,
            replyTo: email,
            subject: `New Contact Form: ${subject}`,
            text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nSubject: ${subject}\nMessage: ${message}\nSent at: ${new Date().toLocaleString()}`,
            html: `<h2>New Contact Form Submission</h2><table style="border-collapse:collapse"><tr><td style="padding:6px 12px;font-weight:bold">Name</td><td style="padding:6px 12px">${name}</td></tr><tr><td style="padding:6px 12px;font-weight:bold">Email</td><td style="padding:6px 12px"><a href="mailto:${email}">${email}</a></td></tr><tr><td style="padding:6px 12px;font-weight:bold">Phone</td><td style="padding:6px 12px">${phone || 'Not provided'}</td></tr><tr><td style="padding:6px 12px;font-weight:bold">Subject</td><td style="padding:6px 12px">${subject}</td></tr><tr><td style="padding:6px 12px;font-weight:bold;vertical-align:top">Message</td><td style="padding:6px 12px">${message.replace(/\n/g, '<br>')}</td></tr></table>`,
        });
        return res.status(200).json({ success: true });
    } catch (e) {
        console.error('Contact email error:', e);
        return res.status(500).json({ error: 'Failed to send email' });
    }
}

// In-memory storage for riders and zones (will use MongoDB in production)
let ridersCache: any[] = [];
let zonesCache: any[] = [
    { id: '1', name: 'Alexandria City Center', fee: 3.99, minOrderFree: 40, estimatedTime: '20-30 min' },
    { id: '2', name: 'Pineville', fee: 5.99, minOrderFree: 50, estimatedTime: '30-45 min' },
    { id: '3', name: 'Ball', fee: 6.99, minOrderFree: 60, estimatedTime: '35-50 min' },
];

async function handleRiders(req: VercelRequest, res: VercelResponse) {
    const client = await clientPromise;
    const db = client.db(DB);
    
    if (req.method === 'GET') {
        try {
            const riders = await db.collection('riders').find({}).toArray();
            return res.status(200).json(riders.map(r => ({ ...r, id: r._id.toString() })));
        } catch {
            // Fallback to cache if DB fails
            return res.status(200).json(ridersCache);
        }
    }
    
    if (req.method === 'POST') {
        const rider = {
            ...req.body,
            status: 'available',
            totalDeliveries: 0,
            todayDeliveries: 0,
            createdAt: new Date().toISOString(),
        };
        try {
            const result = await db.collection('riders').insertOne(rider);
            return res.status(201).json({ ...rider, id: result.insertedId.toString() });
        } catch {
            const id = Date.now().toString();
            ridersCache.push({ ...rider, id });
            return res.status(201).json({ ...rider, id });
        }
    }
    
    if (req.method === 'PATCH') {
        const riderId = req.query.id as string;
        const updates = req.body;
        delete updates.id; delete updates._id;
        
        try {
            if (ObjectId.isValid(riderId)) {
                await db.collection('riders').updateOne(
                    { _id: new ObjectId(riderId) },
                    { $set: updates }
                );
            }
            return res.status(200).json({ success: true });
        } catch {
            const idx = ridersCache.findIndex(r => r.id === riderId);
            if (idx !== -1) {
                ridersCache[idx] = { ...ridersCache[idx], ...updates };
            }
            return res.status(200).json({ success: true });
        }
    }
    
    if (req.method === 'DELETE') {
        const riderId = req.query.id as string;
        try {
            if (ObjectId.isValid(riderId)) {
                await db.collection('riders').deleteOne({ _id: new ObjectId(riderId) });
            }
            return res.status(200).json({ success: true });
        } catch {
            ridersCache = ridersCache.filter(r => r.id !== riderId);
            return res.status(200).json({ success: true });
        }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
}

async function handleZones(req: VercelRequest, res: VercelResponse) {
    const client = await clientPromise;
    const db = client.db(DB);
    
    if (req.method === 'GET') {
        try {
            const zones = await db.collection('zones').find({}).toArray();
            if (zones.length === 0) {
                // Seed default zones
                await db.collection('zones').insertMany(zonesCache);
                return res.status(200).json(zonesCache);
            }
            return res.status(200).json(zones.map(z => ({ ...z, id: z._id.toString() })));
        } catch {
            return res.status(200).json(zonesCache);
        }
    }
    
    if (req.method === 'POST') {
        const zone = {
            ...req.body,
            createdAt: new Date().toISOString(),
        };
        try {
            const result = await db.collection('zones').insertOne(zone);
            return res.status(201).json({ ...zone, id: result.insertedId.toString() });
        } catch {
            const id = Date.now().toString();
            zonesCache.push({ ...zone, id });
            return res.status(201).json({ ...zone, id });
        }
    }
    
    if (req.method === 'PATCH') {
        const zoneId = req.query.id as string;
        const updates = req.body;
        delete updates.id; delete updates._id;
        
        try {
            if (ObjectId.isValid(zoneId)) {
                await db.collection('zones').updateOne(
                    { _id: new ObjectId(zoneId) },
                    { $set: updates }
                );
            }
            return res.status(200).json({ success: true });
        } catch {
            const idx = zonesCache.findIndex(z => z.id === zoneId);
            if (idx !== -1) {
                zonesCache[idx] = { ...zonesCache[idx], ...updates };
            }
            return res.status(200).json({ success: true });
        }
    }
    
    if (req.method === 'DELETE') {
        const zoneId = req.query.id as string;
        try {
            if (ObjectId.isValid(zoneId)) {
                await db.collection('zones').deleteOne({ _id: new ObjectId(zoneId) });
            }
            return res.status(200).json({ success: true });
        } catch {
            zonesCache = zonesCache.filter(z => z.id !== zoneId);
            return res.status(200).json({ success: true });
        }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
}

// ─── Generic Admin CRUD Handlers (localStorage→MongoDB migration) ───

/**
 * Replaces an entire collection with the provided array of items.
 * Used for: locations, testimonials, gallery, features, faqs, menu_categories
 */
async function handleAdminSaveCollection(req: VercelRequest, res: VercelResponse, collectionName: string) {
    const adminId = getAdminId(req);
    if (!adminId) return res.status(401).json({ error: 'Unauthorized' });
    if (req.method !== 'POST' && req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const items = req.body;
        if (!Array.isArray(items)) return res.status(400).json({ error: 'Body must be an array' });

        const client = await clientPromise;
        const db = client.db(DB);
        const col = db.collection(collectionName);

        // Replace entire collection
        await col.deleteMany({});
        if (items.length > 0) {
            // Preserve 'id' if exists, strip MongoDB's internal _id to allow new ones
            const docs = items.map(({ _id, ...rest }: any) => ({ ...rest }));
            await col.insertMany(docs);
        }

        // Return the updated list
        const updated = await col.find({}).toArray();
        const formatted = updated.map(doc => ({ 
            ...doc, 
            id: doc.id || doc._id.toString(), 
            _id: undefined 
        }));
        return res.status(200).json(formatted);
    } catch (error) {
        console.error(`Error saving ${collectionName}:`, error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * Upserts the single site_content document.
 */
async function handleAdminSaveSiteContent(req: VercelRequest, res: VercelResponse) {
    const adminId = getAdminId(req);
    if (!adminId) return res.status(401).json({ error: 'Unauthorized' });
    if (req.method !== 'POST' && req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const content = req.body;
        if (!content || typeof content !== 'object') return res.status(400).json({ error: 'Body must be an object' });

        const client = await clientPromise;
        const db = client.db(DB);
        const col = db.collection('site_content');

        // Remove client IDs
        const { id, _id, ...rest } = content;

        // Upsert: replace the single document
        await col.deleteMany({});
        await col.insertOne(rest);

        const doc = await col.findOne({});
        if (!doc) return res.status(500).json({ error: 'Failed to save' });
        return res.status(200).json({ ...doc, id: doc._id.toString(), _id: undefined });
    } catch (error) {
        console.error('Error saving site_content:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * Individual item CRUD: POST=add, PUT/PATCH=update, DELETE=remove.
 * Used for: events, event_packages, catering_packages, catering_inquiries
 */
async function handleAdminCrudItem(req: VercelRequest, res: VercelResponse, collectionName: string) {
    const adminId = getAdminId(req);
    if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const client = await clientPromise;
        const db = client.db(DB);
        const col = db.collection(collectionName);

        if (req.method === 'POST') {
            const { id, _id, ...item } = req.body;
            const result = await col.insertOne({ ...item, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
            return res.status(201).json({ ...item, id: result.insertedId.toString() });
        }

        if (req.method === 'PUT' || req.method === 'PATCH') {
            const { id, _id, ...updates } = req.body;
            const targetId = id || req.query.id as string;
            if (!targetId) return res.status(400).json({ error: 'Missing id' });
            
            if (ObjectId.isValid(targetId)) {
                await col.updateOne({ _id: new ObjectId(targetId) }, { $set: { ...updates, updatedAt: new Date().toISOString() } });
            } else {
                // Fallback: try matching by string id field
                await col.updateOne({ id: targetId } as any, { $set: { ...updates, updatedAt: new Date().toISOString() } });
            }
            return res.status(200).json({ success: true });
        }

        if (req.method === 'DELETE') {
            const targetId = req.query.id as string || req.body?.id;
            if (!targetId) return res.status(400).json({ error: 'Missing id' });

            if (ObjectId.isValid(targetId)) {
                await col.deleteOne({ _id: new ObjectId(targetId) });
            } else {
                await col.deleteOne({ id: targetId } as any);
            }
            return res.status(200).json({ success: true });
        }

        // GET: return all items
        if (req.method === 'GET') {
            const docs = await col.find({}).toArray();
            const formatted = docs.map(doc => ({ ...doc, id: doc._id.toString(), _id: undefined }));
            return res.status(200).json(formatted);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error(`Error in CRUD ${collectionName}:`, error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// ─── Catering Content ─────────────────────────────────────────────────────

const DEFAULT_CATERING_CONTENT = {
    section: 'catering',
    sections: {
        hero:     { visible: true },
        stats:    { visible: true },
        packages: { visible: true },
        process:  { visible: true },
        cta:      { visible: true },
    },
    hero: {
        eyebrow: 'Alexandria, Louisiana',
        titleLine1: 'Premium Catering',
        titleLine2: 'for every occasion',
        subtitle: 'From intimate gatherings to grand celebrations, we bring authentic Indian flavors to your events with elegance and care.',
        button1Text: 'Explore Packages',
        button2Text: 'Request Custom Quote',
        heroImage: '',
    },
    stats: [
        { number: '500', suffix: '+', label: 'Events catered' },
        { number: '14',  suffix: '+', label: 'Years experience' },
        { number: '50',  suffix: '+', label: 'Menu options' },
        { number: '4.9', suffix: '',  label: 'Client rating' },
    ],
    process: {
        eyebrow: 'How It Works',
        title: 'Simple process,',
        titleItalic: 'exceptional results',
        steps: [
            { number: '1', title: 'Choose Package',   description: 'Browse our catering packages and select the one that fits your event.' },
            { number: '2', title: 'Submit Request',   description: 'Fill out our catering request form with your event details.' },
            { number: '3', title: 'We Confirm',       description: 'Our team contacts you within 24 hours to confirm details.' },
            { number: '4', title: 'Enjoy Your Event', description: 'We handle everything. You just enjoy the celebration!' },
        ],
    },
    cta: {
        title: 'Ready to make your',
        titleItalic: 'event unforgettable?',
        description: 'Contact us today to discuss your catering needs.',
        buttonText: 'Request a Quote →',
        phone: '(318) 445-5688',
    },
    formSettings: {
        emailTo: 'hello@goldenlotusgrill.com',
        confirmMessage: 'Thank you! We will contact you within 24 hours.',
        serviceTypes: [
            { id: 'pickup',      label: 'Pickup',      icon: '🚗', description: 'Collect from us' },
            { id: 'onsite',      label: 'On-Site',      icon: '🍽️', description: 'We come to you' },
            { id: 'fullservice', label: 'Full Service', icon: '👨‍🍳', description: 'Staff + setup' },
        ],
        budgetRanges: ['Under $500', '$500 - $1,000', '$1,000 - $2,500', '$2,500 - $5,000', '$5,000+'],
        eventTypes: ['Wedding', 'Corporate Lunch', 'Birthday Party', 'Graduation', 'Religious Celebration', 'Other'],
    },
};

async function handleGetCateringContent(req: VercelRequest, res: VercelResponse) {
    try {
        const client = await clientPromise;
        const doc = await client.db(DB).collection('site_content').findOne({ section: 'catering' });
        if (!doc) {
            await client.db(DB).collection('site_content').insertOne({ ...DEFAULT_CATERING_CONTENT });
            return res.status(200).json({ success: true, data: DEFAULT_CATERING_CONTENT });
        }
        const { _id, ...data } = doc as any;
        return res.status(200).json({ success: true, data });
    } catch {
        return res.status(200).json({ success: true, data: DEFAULT_CATERING_CONTENT });
    }
}

async function handleSaveCateringContent(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const adminId = getAdminId(req);
    if (!adminId) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const body = req.body;
        const client = await clientPromise;
        await client.db(DB).collection('site_content').updateOne(
            { section: 'catering' },
            { $set: { ...body, section: 'catering', updatedAt: new Date().toISOString() } },
            { upsert: true }
        );
        return res.status(200).json({ success: true });
    } catch {
        return res.status(500).json({ error: 'Failed to save catering content' });
    }
}

async function handleToggleCateringSection(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const adminId = getAdminId(req);
    if (!adminId) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const { sectionKey, visible } = req.body;
        const client = await clientPromise;
        await client.db(DB).collection('site_content').updateOne(
            { section: 'catering' },
            { $set: { [`sections.${sectionKey}.visible`]: visible, updatedAt: new Date().toISOString() } },
            { upsert: true }
        );
        return res.status(200).json({ success: true });
    } catch {
        return res.status(500).json({ error: 'Failed to toggle section' });
    }
}

async function handleSendCateringRequest(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    try {
        const {
            name, email, phone, packageName, eventDate, eventTime,
            guestCount, eventType, serviceType, venueAddress,
            needStaff, needEquipment, budgetRange, dietaryRequirements, message,
        } = req.body;

        // Fetch form settings for emailTo and confirmMessage
        const client = await clientPromise;
        const contentDoc = await client.db(DB).collection('site_content').findOne({ section: 'catering' }) as any;
        const emailTo = contentDoc?.formSettings?.emailTo || process.env.VITE_ADMIN_EMAIL || process.env.GMAIL_USER || '';
        const confirmMessage = contentDoc?.formSettings?.confirmMessage || DEFAULT_CATERING_CONTENT.formSettings.confirmMessage;

        // Save request to DB
        await client.db(DB).collection('catering_inquiries').insertOne({
            name, email, phone, packageName, eventDate, eventTime,
            guestCount, eventType, serviceType, venueAddress,
            needStaff: needStaff || false, needEquipment: needEquipment || false,
            budgetRange, dietaryRequirements, message,
            status: 'new',
            createdAt: new Date().toISOString(),
        });

        // Send email
        try {
            const nodemailer = require('nodemailer');
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
            });
            const subject = `New Catering Request: ${eventType || 'Event'} - ${eventDate || 'TBD'}`;
            const html = `
                <h2>New Catering Request</h2>
                <table style="border-collapse:collapse;width:100%">
                    <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Name</td><td style="padding:8px;border:1px solid #ddd">${name}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Email</td><td style="padding:8px;border:1px solid #ddd">${email}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Phone</td><td style="padding:8px;border:1px solid #ddd">${phone}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Package</td><td style="padding:8px;border:1px solid #ddd">${packageName || 'Custom'}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Event Date</td><td style="padding:8px;border:1px solid #ddd">${eventDate} ${eventTime || ''}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Guests</td><td style="padding:8px;border:1px solid #ddd">${guestCount}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Event Type</td><td style="padding:8px;border:1px solid #ddd">${eventType || 'N/A'}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Service Type</td><td style="padding:8px;border:1px solid #ddd">${serviceType || 'N/A'}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Venue</td><td style="padding:8px;border:1px solid #ddd">${venueAddress || 'N/A'}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Budget</td><td style="padding:8px;border:1px solid #ddd">${budgetRange || 'N/A'}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Dietary</td><td style="padding:8px;border:1px solid #ddd">${dietaryRequirements || 'None'}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Message</td><td style="padding:8px;border:1px solid #ddd">${message || 'N/A'}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Sent At</td><td style="padding:8px;border:1px solid #ddd">${new Date().toLocaleString()}</td></tr>
                </table>`;
            await transporter.sendMail({
                from: `"Golden Lotus Catering" <${process.env.GMAIL_USER}>`,
                to: emailTo,
                replyTo: email,
                subject,
                html,
            });
        } catch (emailErr) {
            console.error('Email send failed (non-fatal):', emailErr);
        }

        return res.status(200).json({ success: true, message: confirmMessage });
    } catch (err) {
        console.error('Catering request error:', err);
        return res.status(500).json({ error: 'Failed to submit catering request' });
    }
}

async function handleGetCateringPackagesPublic(req: VercelRequest, res: VercelResponse) {
    try {
        const client = await clientPromise;
        const docs = await client.db(DB).collection('catering_packages').find({}).toArray();
        const packages = docs.map(d => ({ ...d, id: d._id.toString(), _id: undefined }));
        return res.status(200).json({ success: true, packages });
    } catch {
        return res.status(200).json({ success: true, packages: [] });
    }
}

async function handleGetCateringRequests(req: VercelRequest, res: VercelResponse) {
    const adminId = getAdminId(req);
    if (!adminId) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const client = await clientPromise;
        const docs = await client.db(DB).collection('catering_inquiries').find({}).sort({ createdAt: -1 }).toArray();
        const requests = docs.map(d => ({ ...d, id: d._id.toString(), _id: undefined }));
        return res.status(200).json({ success: true, requests });
    } catch {
        return res.status(500).json({ error: 'Failed to fetch requests' });
    }
}

async function handleUpdateCateringRequest(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const adminId = getAdminId(req);
    if (!adminId) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const { requestId, status, notes } = req.body;
        if (!requestId) return res.status(400).json({ error: 'Missing requestId' });
        const client = await clientPromise;
        const updates: any = { updatedAt: new Date().toISOString() };
        if (status) updates.status = status;
        if (notes !== undefined) updates.notes = notes;
        if (ObjectId.isValid(requestId)) {
            await client.db(DB).collection('catering_inquiries').updateOne(
                { _id: new ObjectId(requestId) },
                { $set: updates }
            );
        }
        return res.status(200).json({ success: true });
    } catch {
        return res.status(500).json({ error: 'Failed to update request' });
    }
}

// ─── Public promo endpoints ─────────────────────────────────────────────────

async function handleGetPromosPublic(req: VercelRequest, res: VercelResponse) {
    // Returns display coupons (shown as banners on menu page) — no auth required
    try {
        const client = await clientPromise;
        const db = client.db(DB);
        const docs = await db.collection('coupons').find({ active: { $ne: false } }).sort({ createdAt: -1 }).toArray();
        return res.status(200).json({ promos: docs.map(d => ({ ...d, id: d._id?.toString() })) });
    } catch {
        return res.status(200).json({ promos: [] });
    }
}

async function handleValidatePromo(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    try {
        const { code, orderTotal = 0 } = req.body || {};
        if (!code) return res.status(400).json({ valid: false, message: 'No code provided' });

        const client = await clientPromise;
        const db = client.db(DB);

        // Search checkout promos collection
        const promo = await db.collection('promos').findOne({
            code: code.toUpperCase().trim(),
            status: 'active',
        });

        if (!promo) return res.status(200).json({ valid: false, message: 'Invalid promo code' });

        // Check expiry
        if (promo.expires && new Date() > new Date(promo.expires)) {
            return res.status(200).json({ valid: false, message: 'This promo code has expired' });
        }

        // Check max uses
        if (promo.maxUses && promo.uses >= promo.maxUses) {
            return res.status(200).json({ valid: false, message: 'This promo code has reached its usage limit' });
        }

        // Check min order
        const minOrder = promo.minOrder || 0;
        if (orderTotal < minOrder) {
            return res.status(200).json({ valid: false, message: `Minimum order of $${minOrder.toFixed(2)} required` });
        }

        // Calculate discount
        let discount = 0;
        let label = '';
        const discountType = promo.discountType || 'percentage';
        const value = promo.value || 0;

        if (discountType === 'percentage') {
            discount = Math.min((orderTotal * value) / 100, orderTotal);
            label = `${value}% off`;
        } else if (discountType === 'fixed') {
            discount = Math.min(value, orderTotal);
            label = `$${value.toFixed(2)} off`;
        } else if (discountType === 'free_delivery') {
            discount = 0;
            label = 'Free delivery';
        }

        return res.status(200).json({
            valid: true,
            discount: parseFloat(discount.toFixed(2)),
            type: discountType === 'percentage' ? 'percent' : discountType === 'fixed' ? 'fixed' : 'freeDelivery',
            value,
            label,
            message: `Code applied! ${label}`,
            promoId: promo._id?.toString(),
        });
    } catch {
        return res.status(500).json({ valid: false, message: 'Could not validate promo code' });
    }
}
