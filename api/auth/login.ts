import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import clientPromise from '../lib/db.js';

const DB_NAME = 'goldenlotus';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const action = (req.query.action as string) || 'admin-login';

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection('users');

    // ─── ADMIN LOGIN ───
    if (action === 'admin-login') {
        try {
            const { email, password } = req.body;
            if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

            const user = await users.findOne({ email });

            // Fallback for default admin
            const adminEmail = process.env.VITE_ADMIN_EMAIL || 'admin@goldenlotus.com';
            const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
            const isDefaultAdmin = email === adminEmail && password === adminPassword;

            if (!user && !isDefaultAdmin) return res.status(401).json({ error: 'Invalid credentials' });

            if (user) {
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { email: user ? user.email : adminEmail, role: 'admin' },
                JWT_SECRET,
                { expiresIn: '1d' }
            );

            return res.status(200).json({ token });
        } catch (error) {
            console.error('Admin login error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // ─── USER LOGIN ───
    if (action === 'user-login') {
        try {
            const { email, password } = req.body;
            if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

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

    // ─── USER SIGNUP ───
    if (action === 'signup') {
        try {
            const { name, email, phone, password } = req.body;
            if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });

            const existing = await users.findOne({ email: email.toLowerCase() });
            if (existing) return res.status(400).json({ error: 'Email already registered' });

            const hashedPassword = await bcrypt.hash(password, 12);

            const newUser = {
                name,
                email: email.toLowerCase(),
                phone: phone || '',
                password: hashedPassword,
                avatar: null,
                dateOfBirth: null,
                savedAddresses: [],
                favoriteItems: [],
                loyaltyPoints: 0,
                loyaltyHistory: [],
                createdAt: new Date(),
            };

            const result = await users.insertOne(newUser);
            const userId = result.insertedId.toString();

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

    return res.status(400).json({ error: 'Invalid action' });
}
