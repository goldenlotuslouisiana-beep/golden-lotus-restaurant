import type { VercelRequest, VercelResponse } from '@vercel/node';
import clientPromise from './lib/db.js';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const DB_NAME = 'goldenlotus';
const COLLECTION_NAME = 'menu_items';

// Middleware to check auth
const authenticate = (req: VercelRequest) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Unauthorized');
    }
    const token = authHeader.split(' ')[1];
    if (!JWT_SECRET) throw new Error('JWT_SECRET missing');
    return jwt.verify(token, JWT_SECRET);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // GET: Fetch all menu items (Public)
        if (req.method === 'GET') {
            const items = await collection.find({}).toArray();
            // Map _id to id for frontend compatibility
            const formattedItems = items.map(item => ({
                ...item,
                id: item._id.toString(),
                _id: undefined
            }));
            return res.status(200).json(formattedItems);
        }

        // Protect all other routes (POST, PUT, DELETE)
        try {
            authenticate(req);
        } catch {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // POST: Create a new menu item
        if (req.method === 'POST') {
            const newItem = req.body;
            const result = await collection.insertOne(newItem);
            return res.status(201).json({ ...newItem, id: result.insertedId.toString() });
        }

        // PUT: Update an existing menu item
        if (req.method === 'PUT') {
            const { id, ...updateData } = req.body;
            if (!id) return res.status(400).json({ error: 'Missing item ID' });

            await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            );
            return res.status(200).json({ success: true });
        }

        // DELETE: Remove a menu item
        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing item ID' });

            await collection.deleteOne({ _id: new ObjectId(id) });
            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Menu API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
