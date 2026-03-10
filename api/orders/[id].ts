import type { VercelRequest, VercelResponse } from '@vercel/node';
import clientPromise from '../lib/db.js';
import { ObjectId } from 'mongodb';

const DB_NAME = 'goldenlotus';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id } = req.query;

        if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const ordersCollection = db.collection('orders');

        let order;

        // Try finding by MongoDB ObjectId first
        try {
            order = await ordersCollection.findOne({ _id: new ObjectId(id) });
        } catch {
            // If not a valid ObjectId, try by orderNumber
            order = await ordersCollection.findOne({ orderNumber: id });
        }

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Map _id to id for frontend
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
