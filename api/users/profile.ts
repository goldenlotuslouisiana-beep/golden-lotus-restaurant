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
