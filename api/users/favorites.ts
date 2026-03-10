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
        return res.status(200).json(user?.favoriteItems || []);
    }

    if (req.method === 'POST') {
        const { menuItemId } = req.body;
        await users.updateOne({ _id: new ObjectId(userId) }, { $addToSet: { favoriteItems: menuItemId } as Record<string, unknown> });
        return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
        const { menuItemId } = req.body;
        await users.updateOne({ _id: new ObjectId(userId) }, { $pull: { favoriteItems: menuItemId } as Record<string, unknown> });
        return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
