import { config } from 'dotenv';
config();
import { MongoClient } from 'mongodb';
import { defaultSiteContent } from './src/data/store';

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
    if (!MONGODB_URI) {
        console.error('MONGODB_URI environment variable is required');
        process.exit(1);
    }
    console.log('Connecting to MongoDB...');
    const client = new MongoClient(MONGODB_URI, {
        tls: true,
    });
    
    try {
        await client.connect();
        const db = client.db('goldenlotus');
        
        console.log('Seeding site_content...');
        const collection = db.collection('site_content');
        
        const count = await collection.countDocuments();
        if (count === 0) {
            await collection.insertOne(defaultSiteContent);
            console.log('Successfully inserted default site content.');
        } else {
            console.log('site_content already has data. Skipping.');
        }
        
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('Done.');
    }
}

seed();
