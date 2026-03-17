import { config } from 'dotenv';
config();
import { MongoClient } from 'mongodb';
import { defaultSiteContent } from './src/data/store';

const uri = process.env.MONGODB_URI;

async function seed() {
    if (!uri) {
        console.error('MONGODB_URI environment variable is required');
        process.exit(1);
    }
    const client = new MongoClient(uri, {
        tls: true,
        connectTimeoutMS: 15000,
        serverSelectionTimeoutMS: 15000,
    });
    console.log("Connecting...");
    await client.connect();
    console.log("Connected. Seeding...");
    const db = client.db('goldenlotus');
    const count = await db.collection('site_content').countDocuments();
    if (count === 0) {
        await db.collection('site_content').insertOne(defaultSiteContent);
        console.log('Seeded site_content!');
    } else {
        console.log('Already seeded.');
    }
    await client.close();
    console.log("Done.");
}
seed().catch(console.error);
