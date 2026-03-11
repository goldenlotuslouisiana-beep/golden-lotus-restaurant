import type { VercelRequest, VercelResponse } from '@vercel/node';
import clientPromise from '../lib/db.js';
import { ObjectId } from 'mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const client = await clientPromise;
  const db = client.db('goldenlotus');
  const ordersCollection = db.collection('orders');
  
  if (req.method === 'GET') {
    const allOrders = await ordersCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
      
    return res.status(200).json(allOrders.map((o: any) => ({ ...o, id: o._id.toString() })));
  }

  if (req.method === 'DELETE') {
    const { action, id } = req.query;
    
    if (action === 'clear-test') {
      await ordersCollection.deleteMany({
        $or: [
          { orderNumber: { $regex: /^ORD-/i } },
          { 'customer.phone': { $regex: /555/ } },
          { customerPhone: { $regex: /555/ } }
        ]
      });
      return res.status(200).json({ success: true });
    } else if (id) {
      await ordersCollection.deleteOne({ _id: new ObjectId(id as string) });
      return res.status(200).json({ success: true });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
