import type { VercelRequest, VercelResponse } from '@vercel/node';
import clientPromise from '../lib/db.js';
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

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection('users');

    const action = req.query.action as string;

    // ─── PROFILE ───
    if (action === 'profile') {
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

    // ─── ADDRESSES ───
    if (action === 'addresses') {
        if (req.method === 'GET') {
            const user = await users.findOne({ _id: new ObjectId(userId) });
            return res.status(200).json(user?.savedAddresses || []);
        }
        if (req.method === 'POST') {
            const { label, street, apt, city, state, zip, isDefault } = req.body;
            const address = { id: new ObjectId().toString(), label: label || 'Home', street, apt: apt || '', city, state, zip, isDefault: isDefault || false };
            if (address.isDefault) {
                await users.updateOne({ _id: new ObjectId(userId) }, { $set: { 'savedAddresses.$[].isDefault': false } });
            }
            await users.updateOne({ _id: new ObjectId(userId) }, { $push: { savedAddresses: address } } as any);
            return res.status(201).json(address);
        }
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // ─── FAVORITES ───
    if (action === 'favorites') {
        if (req.method === 'GET') {
            const user = await users.findOne({ _id: new ObjectId(userId) });
            return res.status(200).json(user?.favoriteItems || []);
        }
        if (req.method === 'POST') {
            const { menuItemId } = req.body;
            await users.updateOne({ _id: new ObjectId(userId) }, { $addToSet: { favoriteItems: menuItemId } } as any);
            return res.status(200).json({ success: true });
        }
        if (req.method === 'DELETE') {
            const { menuItemId } = req.body;
            await users.updateOne({ _id: new ObjectId(userId) }, { $pull: { favoriteItems: menuItemId } } as any);
            return res.status(200).json({ success: true });
        }
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // ─── LOYALTY ───
    if (action === 'loyalty') {
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

    return res.status(400).json({ error: 'Invalid action. Use ?action=profile|addresses|favorites|loyalty' });
}
