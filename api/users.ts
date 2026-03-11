import type { VercelRequest, VercelResponse } from '@vercel/node';
import clientPromise from '../src/lib/db.js';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

const DB_NAME = 'goldenlotus';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

function getUserId(req: VercelRequest): string | null {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return null;
    try {
        const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET) as { userId: string };
        return decoded.userId;
    } catch { return null; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const action = req.query.action as string;

    switch (action) {
        case 'profile': return handleProfile(req, res, userId);
        
        case 'addresses': return handleGetAddresses(req, res, userId);
        case 'add-address': return handleAddAddress(req, res, userId);
        case 'edit-address': return handleEditAddress(req, res, userId);
        case 'delete-address': return handleDeleteAddress(req, res, userId);
        
        case 'favorites': return handleGetFavorites(req, res, userId);
        case 'add-favorite': return handleAddFavorite(req, res, userId);
        case 'remove-favorite': return handleRemoveFavorite(req, res, userId);
        
        case 'loyalty': return handleLoyalty(req, res, userId);
        case 'redeem-points': return handleRedeemPoints(req, res, userId);
        
        default:
            // Fallback to older nested method routing based on previous functionality
            if (action === 'addresses' && req.method === 'POST') return handleAddAddress(req, res, userId);
            if (action === 'favorites' && req.method === 'POST') return handleAddFavorite(req, res, userId);
            if (action === 'favorites' && req.method === 'DELETE') return handleRemoveFavorite(req, res, userId);
            if (action === 'loyalty' && req.method === 'POST') return handleLoyalty(req, res, userId);
            return res.status(400).json({ error: 'Invalid action' });
    }
}

async function handleProfile(req: VercelRequest, res: VercelResponse, userId: string) {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection('users');

    if (req.method === 'GET') {
        const user = await users.findOne({ _id: new ObjectId(userId) });
        if (!user) return res.status(404).json({ error: 'User not found' });
        return res.status(200).json({
            id: user._id.toString(), name: user.name, email: user.email,
            phone: user.phone || '', avatar: user.avatar || '', dateOfBirth: user.dateOfBirth || '',
            loyaltyPoints: user.loyaltyPoints || 0,
        });
    }

    if (req.method === 'PATCH') {
        const { name, phone, avatar, dateOfBirth } = req.body;
        const update: Record<string, string> = {};
        if (name !== undefined) update.name = name;
        if (phone !== undefined) update.phone = phone;
        if (avatar !== undefined) update.avatar = avatar;
        if (dateOfBirth !== undefined) update.dateOfBirth = dateOfBirth;
        
        await users.updateOne({ _id: new ObjectId(userId) }, { $set: update });
        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

async function handleGetAddresses(req: VercelRequest, res: VercelResponse, userId: string) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    return res.status(200).json(user?.savedAddresses || []);
}

async function handleAddAddress(req: VercelRequest, res: VercelResponse, userId: string) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { label, street, apt, city, state, zip, isDefault } = req.body;
    const address = { id: new ObjectId().toString(), label: label || 'Home', street, apt: apt || '', city, state, zip, isDefault: isDefault || false };
    
    const client = await clientPromise;
    const users = client.db(DB_NAME).collection('users');

    if (address.isDefault) {
        await users.updateOne({ _id: new ObjectId(userId) }, { $set: { 'savedAddresses.$[].isDefault': false } });
    }
    await users.updateOne({ _id: new ObjectId(userId) }, { $push: { savedAddresses: address } } as any);
    return res.status(201).json(address);
}

async function handleEditAddress(req: VercelRequest, res: VercelResponse, userId: string) {
    if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });
    const { id } = req.query;
    if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Address ID is required' });

    const updates = req.body;
    const client = await clientPromise;
    const users = client.db(DB_NAME).collection('users');

    const user = await users.findOne({ _id: new ObjectId(userId) });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const addresses = user.savedAddresses || [];
    const index = addresses.findIndex((a: any) => a.id === id);
    if (index === -1) return res.status(404).json({ error: 'Address not found' });

    if (updates.isDefault) {
        addresses.forEach((a: any) => a.isDefault = false);
    }
    addresses[index] = { ...addresses[index], ...updates };

    await users.updateOne({ _id: new ObjectId(userId) }, { $set: { savedAddresses: addresses } });
    return res.status(200).json({ success: true, address: addresses[index] });
}

async function handleDeleteAddress(req: VercelRequest, res: VercelResponse, userId: string) {
    if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });
    const { id } = req.query;
    if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Address ID is required' });

    const client = await clientPromise;
    const users = client.db(DB_NAME).collection('users');

    await users.updateOne({ _id: new ObjectId(userId) }, { $pull: { savedAddresses: { id } } } as any);
    return res.status(200).json({ success: true });
}

async function handleGetFavorites(req: VercelRequest, res: VercelResponse, userId: string) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const client = await clientPromise;
    const user = await client.db(DB_NAME).collection('users').findOne({ _id: new ObjectId(userId) });
    return res.status(200).json(user?.favoriteItems || []);
}

async function handleAddFavorite(req: VercelRequest, res: VercelResponse, userId: string) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { menuItemId } = req.body;
    const client = await clientPromise;
    await client.db(DB_NAME).collection('users').updateOne({ _id: new ObjectId(userId) }, { $addToSet: { favoriteItems: menuItemId } } as any);
    return res.status(200).json({ success: true });
}

async function handleRemoveFavorite(req: VercelRequest, res: VercelResponse, userId: string) {
    if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });
    const id = req.query.id as string || req.body.menuItemId;
    if (!id) return res.status(400).json({ error: 'menuItemId is required' });

    const client = await clientPromise;
    await client.db(DB_NAME).collection('users').updateOne({ _id: new ObjectId(userId) }, { $pull: { favoriteItems: id } } as any);
    return res.status(200).json({ success: true });
}

async function handleLoyalty(req: VercelRequest, res: VercelResponse, userId: string) {
    const client = await clientPromise;
    const users = client.db(DB_NAME).collection('users');

    if (req.method === 'GET') {
        const user = await users.findOne({ _id: new ObjectId(userId) });
        return res.status(200).json({
            points: user?.loyaltyPoints || 0,
            history: user?.loyaltyHistory || [],
        });
    }

    if (req.method === 'POST') {
        const { orderId, amount, action: loyaltyAction } = req.body;
        const points = loyaltyAction === 'redeem' ? -Math.abs(amount) : Math.floor(amount);
        const entry = { date: new Date().toISOString(), orderId: orderId || '', action: loyaltyAction || 'earned', points };
        
        await users.updateOne({ _id: new ObjectId(userId) }, {
            $inc: { loyaltyPoints: points },
            $push: { loyaltyHistory: entry },
        } as any);
        
        const updated = await users.findOne({ _id: new ObjectId(userId) });
        return res.status(200).json({ points: updated?.loyaltyPoints || 0 });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

async function handleRedeemPoints(req: VercelRequest, res: VercelResponse, userId: string) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    const { pointsToRedeem } = req.body;
    if (!pointsToRedeem) return res.status(400).json({ error: 'Points amount required' });

    const client = await clientPromise;
    const users = client.db(DB_NAME).collection('users');
    
    const user = await users.findOne({ _id: new ObjectId(userId) });
    if (!user || user.loyaltyPoints < pointsToRedeem) {
        return res.status(400).json({ error: 'Insufficient points' });
    }

    const entry = { date: new Date().toISOString(), orderId: 'Redemption', action: 'redeem', points: -Math.abs(pointsToRedeem) };
    await users.updateOne({ _id: new ObjectId(userId) }, {
        $inc: { loyaltyPoints: -Math.abs(pointsToRedeem) },
        $push: { loyaltyHistory: entry },
    } as any);

    return res.status(200).json({ success: true, redeemed: pointsToRedeem });
}
