import type { VercelRequest, VercelResponse } from '@vercel/node';
import clientPromise from '../lib/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const DB_NAME = 'goldenlotus';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const users = db.collection('users');

        const user = await users.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(401).json({ error: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

        const token = jwt.sign({ userId: user._id.toString(), email: user.email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });

        return res.status(200).json({
            token,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                avatar: user.avatar || '',
                loyaltyPoints: user.loyaltyPoints || 0,
            },
        });
    } catch (error) {
        console.error('User login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
