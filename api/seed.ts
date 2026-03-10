import type { VercelRequest, VercelResponse } from '@vercel/node';
import clientPromise from '../src/lib/db';
import bcrypt from 'bcryptjs';

// Default Admin User
const defaultAdmin = {
    username: process.env.VITE_ADMIN_EMAIL?.split('@')[0] || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123', // Will be hashed below
    email: process.env.VITE_ADMIN_EMAIL || 'admin@goldenlotus.com',
};

// Default Menu Categories
const defaultMenuCategories = [
    { id: '1', name: 'Popular', order: 1 },
    { id: '2', name: 'Dim Sum', order: 2 },
    { id: '3', name: 'Appetizers', order: 3 },
    { id: '4', name: 'Soups', order: 4 },
    { id: '5', name: 'Noodles', order: 5 },
    { id: '6', name: 'Fried Rice', order: 6 },
    { id: '7', name: 'Beef & Pork', order: 7 },
    { id: '8', name: 'Poultry', order: 8 },
    { id: '9', name: 'Seafood', order: 9 },
    { id: '10', name: 'Vegetables & Tofu', order: 10 },
    { id: '11', name: 'Chef Specials', order: 11 },
    { id: '12', name: 'Desserts', order: 12 },
    { id: '13', name: 'Boba & Tea', order: 13 },
];

// Default Menu Items
const defaultMenuItems = [
    {
        name: 'Peking Duck',
        description: 'Crispy roasted duck served with steamed pancakes, scallions, cucumber, and sweet bean sauce',
        price: 45.00,
        category: 'Chef Specials',
        image: 'https://images.unsplash.com/photo-1544025162-811c03632906?w=500',
        popular: true,
    },
    {
        name: 'Xiao Long Bao (Soup Dumplings)',
        description: 'Delicate steamed dumplings filled with savory pork broth',
        price: 12.50,
        category: 'Dim Sum',
        image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=500',
        popular: true,
    },
    {
        name: 'Mapo Tofu',
        description: 'Soft tofu set in a spicy, numbing sauce with minced pork and Sichuan peppercorns',
        price: 16.00,
        category: 'Vegetables & Tofu',
        image: 'https://images.unsplash.com/photo-1512058454905-6b841e7da1cb?w=500',
        popular: true,
    },
    {
        name: 'Dan Dan Noodles',
        description: 'Spicy Szechuan noodles with minced pork, scallions, and a rich peanut-sesame sauce',
        price: 15.00,
        category: 'Noodles',
        image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cb438?w=500',
        popular: true,
    },
    {
        name: 'Crispy Spring Rolls',
        description: 'Hand-rolled with fresh vegetables and glass noodles, served with sweet chili sauce',
        price: 8.50,
        category: 'Appetizers',
        image: 'https://images.unsplash.com/photo-1549488344-c10bfda29e1c?w=500',
        isVegetarian: true,
    },
    {
        name: 'Kung Pao Chicken',
        description: 'Stir-fried chicken with peanuts, vegetables, and chili peppers',
        price: 18.00,
        category: 'Poultry',
        image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500',
        popular: true,
    },
    {
        name: 'Mongolian Beef',
        description: 'Sliced flank steak stir-fried with scallions and onions in a savory brown sauce',
        price: 21.00,
        category: 'Beef & Pork',
        image: 'https://images.unsplash.com/photo-1626244199577-fb5fd19391bd?w=500',
        popular: true,
    },
    {
        name: 'Wonton Soup',
        description: 'Pork and shrimp wontons in a clear, savory chicken broth',
        price: 11.00,
        category: 'Soups',
        image: 'https://images.unsplash.com/photo-1523995460515-564d7dfc89d7?w=500',
    },
    {
        name: 'Brown Sugar Boba Milk Tea',
        description: 'Classic milk tea with chewy tapioca pearls and brown sugar syrup',
        price: 6.50,
        category: 'Boba & Tea',
        image: 'https://images.unsplash.com/photo-1558855567-1a3af1b54a37?w=500',
        isVegetarian: true,
    },
    {
        name: 'Egg Tarts',
        description: 'Flaky pastry crust filled with a smooth, sweet egg custard',
        price: 8.00,
        category: 'Desserts',
        image: 'https://images.unsplash.com/photo-1616422323315-7da7a1496a75?w=500',
        isVegetarian: true,
    },
    {
        name: 'Shrimp Fried Rice',
        description: 'Wok-tossed rice with shrimp, egg, peas, carrots, and scallions',
        price: 17.50,
        category: 'Fried Rice',
        image: 'https://images.unsplash.com/photo-1546250328-7bef2f3b9e42?w=500',
    },
    {
        name: 'Steamed Edamame',
        description: 'Lightly salted steamed soybeans',
        price: 6.00,
        category: 'Appetizers',
        image: 'https://images.unsplash.com/photo-1563514936382-78d10ed71253?w=500',
        isVegetarian: true,
    },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('goldenlotus');

        // 1. Seed Admin User
        const usersCollection = db.collection('users');
        const existingUser = await usersCollection.findOne({ email: defaultAdmin.email });

        if (!existingUser) {
            const hashedPassword = await bcrypt.hash(defaultAdmin.password, 10);
            await usersCollection.insertOne({
                ...defaultAdmin,
                password: hashedPassword,
                createdAt: new Date(),
            });
        }

        // 2. Seed Menu Items
        const menuCollection = db.collection('menu_items');
        const existingMenuItemsCount = await menuCollection.countDocuments();

        if (existingMenuItemsCount === 0) {
            await menuCollection.insertMany(defaultMenuItems);
        }

        // 3. Seed Menu Categories
        const categoriesCollection = db.collection('menu_categories');
        const existingCategoriesCount = await categoriesCollection.countDocuments();

        if (existingCategoriesCount === 0) {
            await categoriesCollection.insertMany(defaultMenuCategories);
        }

        return res.status(200).json({
            success: true,
            message: 'Database seeded successfully! Admin user, categories, and menu items have been created. Make sure to delete this endpoint in production.'
        });
    } catch (error) {
        console.error('Seeding error:', error);
        return res.status(500).json({ error: 'Failed to seed database' });
    }
}
