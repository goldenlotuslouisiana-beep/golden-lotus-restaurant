import type { VercelRequest, VercelResponse } from '@vercel/node';
import clientPromise from '../../lib/db.js';

const DB_NAME = 'goldenlotus';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { userId } = req.query;
        if (!userId || typeof userId !== 'string') return res.status(400).json({ error: 'User ID required' });

        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const orders = await db.collection('orders').find({ 'customer.id': userId }).sort({ createdAt: -1 }).toArray();

        const formatted = orders.map((o) => ({ ...o, id: o._id.toString(), _id: undefined }));
        return res.status(200).json(formatted);
    } catch (error) {
        console.error('User orders error:', error);
        return res.status(500).json({ error: 'Failed to fetch orders' });
    }
}
