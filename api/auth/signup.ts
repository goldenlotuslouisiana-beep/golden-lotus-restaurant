import type { VercelRequest, VercelResponse } from '@vercel/node';
import clientPromise from '../lib/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const DB_NAME = 'goldenlotus';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const users = db.collection('users');

        // Check existing user
        const existing = await users.findOne({ email: email.toLowerCase() });
        if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = {
            name,
            email: email.toLowerCase(),
            phone: phone || '',
            password: hashedPassword,
            avatar: '',
            dateOfBirth: '',
            savedAddresses: [],
            favoriteItems: [],
            loyaltyPoints: 0,
            loyaltyHistory: [],
            createdAt: new Date().toISOString(),
        };

        const result = await users.insertOne(newUser);
        const userId = result.insertedId.toString();

        // Generate JWT
        const token = jwt.sign({ userId, email: newUser.email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });

        return res.status(201).json({
            token,
            user: { id: userId, name: newUser.name, email: newUser.email, phone: newUser.phone, loyaltyPoints: 0 },
        });
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
