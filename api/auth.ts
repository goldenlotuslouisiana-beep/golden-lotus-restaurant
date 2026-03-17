import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import clientPromise from '../src/lib/db.js';

const DB_NAME = 'goldenlotus';
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '';

const oauthClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse body if it's a string
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  } else if (!body) {
    body = {};
  }

  const action = req.query.action as string || body?.action || body?.type;

  if (!action) {
    return res.status(400).json({ error: 'No action provided' });
  }

  // Set the parsed body onto req so handles can read it
  req.body = body;

  switch (action) {
    case 'login':
      return handleLogin(req, res);
    case 'admin-login':
      return handleAdminLogin(req, res);
    case 'signup':
      return handleSignup(req, res);
    case 'google':
      return handleGoogle(req, res);
    case 'forgot-password':
      return handleForgotPassword(req, res);
    case 'reset-password':
      return handleResetPassword(req, res);
    default:
      // Fallback for older frontend routes if any
      if (action === 'user-login') return handleLogin(req, res);
      return res.status(400).json({ error: 'Invalid action' });
  }
}

async function handleLogin(req: VercelRequest, res: VercelResponse) {
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

async function handleAdminLogin(req: VercelRequest, res: VercelResponse) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection('users');

    const user = await users.findOne({ email });

    if (!process.env.VITE_ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      return res.status(500).json({ error: 'Admin credentials not configured' });
    }
    const adminEmail = process.env.VITE_ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
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

async function handleSignup(req: VercelRequest, res: VercelResponse) {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection('users');

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

async function handleGoogle(req: VercelRequest, res: VercelResponse) {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    if (!GOOGLE_CLIENT_ID) {
      console.error('GOOGLE_CLIENT_ID not configured');
      return res.status(500).json({ error: 'Google OAuth not configured' });
    }

    // Verify the Google ID token
    const ticket = await oauthClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (!payload) {
      return res.status(400).json({ error: 'Invalid Google token' });
    }

    const { email, name, picture, sub: googleId } = payload;

    if (!email) {
      return res.status(400).json({ error: 'Email not provided by Google' });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection('users');

    // Check if user already exists
    let user = await users.findOne({ email: email.toLowerCase() });

    if (user) {
      // Existing user - update Google info if not set
      if (!user.googleId) {
        await users.updateOne(
          { _id: user._id },
          { 
            $set: { 
              googleId,
              avatar: user.avatar || picture || null,
            } 
          }
        );
      }
    } else {
      // Create new user from Google data
      const newUser = {
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        googleId,
        avatar: picture || null,
        phone: '',
        password: null, // No password for Google users
        dateOfBirth: null,
        savedAddresses: [],
        favoriteItems: [],
        loyaltyPoints: 0,
        loyaltyHistory: [],
        createdAt: new Date(),
      };

      const result = await users.insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

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
    console.error('Google auth error:', error);
    return res.status(500).json({ error: 'Google authentication failed' });
  }
}

async function handleForgotPassword(req: VercelRequest, res: VercelResponse) {
  try {
    const { email } = req.body as { email?: string };
    const normalizedEmail = (email || '').trim().toLowerCase();

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Valid email required', field: 'email' });
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection('users');

    const user = await users.findOne({ email: normalizedEmail });

    // Always return success to avoid leaking which emails exist
    if (!user) {
      return res.status(200).json({ success: true, message: 'Check your email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

    await users.updateOne(
      { _id: user._id },
      { $set: { resetToken: hashedToken, resetTokenExpiry } }
    );

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;
    if (!gmailUser || !gmailPass) {
      // Still return success; password reset email can't be sent without SMTP configured
      return res.status(200).json({ success: true, message: 'Check your email' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    });

    const resetLink = `/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: `"Golden Lotus" <${gmailUser}>`,
      to: normalizedEmail,
      subject: 'Reset your Golden Lotus password',
      text: `You requested a password reset.\n\nReset your password here:\n${resetLink}\n\nThis link expires in 1 hour.\nIf you didn't request this, you can ignore this email.`,
    });

    return res.status(200).json({ success: true, message: 'Check your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    // Always return success for security
    return res.status(200).json({ success: true, message: 'Check your email' });
  }
}

async function handleResetPassword(req: VercelRequest, res: VercelResponse) {
  try {
    const { token, newPassword } = req.body as { token?: string; newPassword?: string };

    if (!token || typeof token !== 'string' || token.trim().length < 10) {
      return res.status(400).json({ error: 'Reset token is required', field: 'token' });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters', field: 'newPassword' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection('users');

    const user = await users.findOne({ resetToken: hashedToken });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const expiry = typeof (user as any).resetTokenExpiry === 'number' ? (user as any).resetTokenExpiry : 0;
    if (!expiry || Date.now() > expiry) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await users.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword }, $unset: { resetToken: '', resetTokenExpiry: '' } }
    );

    return res.status(200).json({ success: true, message: 'Password updated' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
