import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import clientPromise from '../lib/db';

const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('goldenlotus');

        // In a real scenario, you'd find the user by email
        const user = await db.collection('users').findOne({ email });

        // Fallback for default admin while setting up
        const adminEmail = process.env.VITE_ADMIN_EMAIL || 'admin@goldenlotus.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        const isDefaultAdmin = email === adminEmail && password === adminPassword;

        if (!user && !isDefaultAdmin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (user) {
            // Check hashed password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
        }

        // Generate JWT
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        const token = jwt.sign(
            { email: user ? user.email : adminEmail, role: 'admin' },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        return res.status(200).json({ token });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
