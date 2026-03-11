import type { VercelRequest, VercelResponse } from '@vercel/node';
import clientPromise from '../src/lib/db.js';
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
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') return res.status(200).end();

    // Parse body for POST/PATCH requests
    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch {}
    }
    req.body = body; // Attach parsed body back to req so existing functions work

    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Read action from query OR body
    const action = (req.query.action as string) || body?.action;

    if (!action) {
        return res.status(400).json({ 
            error: 'action required',
            received: { query: req.query, body }
        });
    }

    switch (action) {
        case 'profile': return handleProfile(req, res, userId);
        case 'update-profile': return handleProfile(req, res, userId);
        
        case 'addresses': return handleGetAddresses(req, res, userId);
        case 'add-address': return handleAddAddress(req, res, userId);
        case 'edit-address': return handleEditAddress(req, res, userId);
        case 'delete-address': return handleDeleteAddress(req, res, userId);
        case 'set-default-address': return handleSetDefaultAddress(req, res, userId);
        
        case 'favorites': return handleGetFavorites(req, res, userId);
        case 'add-favorite': return handleAddFavorite(req, res, userId);
        case 'remove-favorite': return handleRemoveFavorite(req, res, userId);
        
        case 'loyalty': return handleLoyalty(req, res, userId);
        case 'redeem-points': return handleRedeemPoints(req, res, userId);
        
        default:
            return res.status(400).json({ 
                error: `Unknown action: ${action}`,
                validActions: [
                    'profile', 'addresses', 'favorites', 'loyalty',
                    'add-favorite', 'remove-favorite', 'add-address',
                    'update-profile', 'edit-address', 'delete-address', 'set-default-address', 'redeem-points'
                ]
            });
    }
}

async function handleProfile(req: VercelRequest, res: VercelResponse, userId: string) {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection('users');

    if (req.method === 'GET') {
        const user = await users.findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        return res.status(200).json({
            user: {
                ...user,
                _id: user._id.toString(),
                fullName: user.fullName || user.name || '',
                phone: user.phone || user.phoneNumber || '',
                dateOfBirth: user.dateOfBirth || user.dob || '',
                avatar: user.avatar || '',
            }
        });
    }

    if (req.method === 'PATCH') {
        const { fullName, phone, dateOfBirth, avatar } = req.body;
        const update: Record<string, string | Date> = {};
        
        if (fullName !== undefined) {
             update.fullName = fullName;
             update.name = fullName;
        }
        if (phone !== undefined) {
             update.phone = phone;
             update.phoneNumber = phone;
        }
        if (dateOfBirth !== undefined) update.dateOfBirth = dateOfBirth;
        if (avatar !== undefined) update.avatar = avatar;
        
        update.updatedAt = new Date();
        
        await users.updateOne({ _id: new ObjectId(userId) }, { $set: update });
        return res.status(200).json({ success: true, message: 'Profile updated successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

async function handleGetAddresses(req: VercelRequest, res: VercelResponse, userId: string) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    return res.status(200).json(user?.savedAddresses || []);
}

async function handleAddAddress(req: VercelRequest, res: VercelResponse, userId: string) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { label, fullName, phone, street, apt, city, state, zip, landmark } = req.body;
    
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    const newAddress = {
        _id: new ObjectId(),
        label: label || 'Home',
        fullName,
        phone,
        street,
        apt: apt || '',
        city,
        state,
        zip,
        landmark: landmark || '',
        isDefault: false,
        createdAt: new Date()
    };
    
    // Check if this is first address — make it default
    const user = await db.collection('users').findOne(
        { _id: new ObjectId(userId) },
        { projection: { savedAddresses: 1 } }
    );
    
    if (!user?.savedAddresses?.length) {
        newAddress.isDefault = true;
    }
    
    await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $push: { savedAddresses: newAddress } } as any
    );
    
    return res.status(200).json({ 
        success: true, 
        address: { ...newAddress, _id: newAddress._id.toString() }
    });
}

async function handleEditAddress(req: VercelRequest, res: VercelResponse, userId: string) {
    if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });
    const addressId = req.query.id as string;
    const updates = req.body;
    
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    await db.collection('users').updateOne(
        { 
            _id: new ObjectId(userId),
            'savedAddresses._id': new ObjectId(addressId)
        },
        { 
            $set: {
                'savedAddresses.$.label': updates.label,
                'savedAddresses.$.fullName': updates.fullName,
                'savedAddresses.$.phone': updates.phone,
                'savedAddresses.$.street': updates.street,
                'savedAddresses.$.apt': updates.apt,
                'savedAddresses.$.city': updates.city,
                'savedAddresses.$.state': updates.state,
                'savedAddresses.$.zip': updates.zip,
                'savedAddresses.$.landmark': updates.landmark,
            }
        } as any
    );
    
    return res.status(200).json({ success: true });
}

async function handleDeleteAddress(req: VercelRequest, res: VercelResponse, userId: string) {
    if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });
    const addressId = req.query.id as string;
    
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { 
            $pull: { 
                savedAddresses: { _id: new ObjectId(addressId) } 
            } 
        } as any
    );
    
    return res.status(200).json({ success: true });
}

async function handleSetDefaultAddress(req: VercelRequest, res: VercelResponse, userId: string) {
    if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });
    const addressId = req.query.id as string;
    
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    // First set all to false
    await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $set: { 'savedAddresses.$[].isDefault': false } }
    );
    
    // Then set selected one to true
    await db.collection('users').updateOne(
        { 
            _id: new ObjectId(userId),
            'savedAddresses._id': new ObjectId(addressId)
        },
        { $set: { 'savedAddresses.$.isDefault': true } } as any
    );
    
    return res.status(200).json({ success: true });
}

async function handleGetFavorites(req: VercelRequest, res: VercelResponse, userId: string) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    // Get user's favorite item IDs
    const user = await db.collection('users').findOne(
        { _id: new ObjectId(userId) },
        { projection: { favoriteItems: 1 } }
    );
    
    if (!user?.favoriteItems?.length) {
        return res.status(200).json({ favorites: [] });
    }
    
    // Fetch full item details for each favorite
    const favorites = await db.collection('menuItems').find({
        _id: { 
            $in: user.favoriteItems.map((id: string) => {
                try { return new ObjectId(id); } 
                catch { return id; }
            })
        }
    }).toArray();
    
    return res.status(200).json(
        favorites.map(f => ({ ...f, _id: f._id.toString(), id: f.id || f._id.toString() }))
    );
}

async function handleAddFavorite(req: VercelRequest, res: VercelResponse, userId: string) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { itemId } = req.body;
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $addToSet: { favoriteItems: itemId } } as any
    );
    return res.status(200).json({ success: true });
}

async function handleRemoveFavorite(req: VercelRequest, res: VercelResponse, userId: string) {
    if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });
    const itemId = req.body?.itemId || req.query?.itemId;
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $pull: { favoriteItems: itemId } } as any
    );
    return res.status(200).json({ success: true });
}

async function handleLoyalty(req: VercelRequest, res: VercelResponse, userId: string) {
    const client = await clientPromise;
    const users = client.db(DB_NAME).collection('users');

    if (req.method === 'GET') {
        const user = await users.findOne({ _id: new ObjectId(userId) });
        return res.status(200).json({
            points: user?.loyaltyPoints || 0,
            history: user?.loyaltyHistory || [],
        });
    }

    if (req.method === 'POST') {
        const { orderId, amount, action: loyaltyAction } = req.body;
        const points = loyaltyAction === 'redeem' ? -Math.abs(amount) : Math.floor(amount);
        const entry = { date: new Date().toISOString(), orderId: orderId || '', action: loyaltyAction || 'earned', points };
        
        await users.updateOne({ _id: new ObjectId(userId) }, {
            $inc: { loyaltyPoints: points },
            $push: { loyaltyHistory: entry },
        } as any);
        
        const updated = await users.findOne({ _id: new ObjectId(userId) });
        return res.status(200).json({ points: updated?.loyaltyPoints || 0 });
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

async function handleRedeemPoints(req: VercelRequest, res: VercelResponse, userId: string) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    const { pointsToRedeem } = req.body;
    if (!pointsToRedeem) return res.status(400).json({ error: 'Points amount required' });

    const client = await clientPromise;
    const users = client.db(DB_NAME).collection('users');
    
    const user = await users.findOne({ _id: new ObjectId(userId) });
    if (!user || user.loyaltyPoints < pointsToRedeem) {
        return res.status(400).json({ error: 'Insufficient points' });
    }

    const entry = { date: new Date().toISOString(), orderId: 'Redemption', action: 'redeem', points: -Math.abs(pointsToRedeem) };
    await users.updateOne({ _id: new ObjectId(userId) }, {
        $inc: { loyaltyPoints: -Math.abs(pointsToRedeem) },
        $push: { loyaltyHistory: entry },
    } as any);

    return res.status(200).json({ success: true, redeemed: pointsToRedeem });
}
