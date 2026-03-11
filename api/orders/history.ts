import { VercelRequest, VercelResponse } from '@vercel/node'
import clientPromise from '../lib/db.js'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.replace('Bearer ', '')
    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string)
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    const userId = decoded.userId || decoded.id || decoded._id || decoded.sub
    if (!userId) return res.status(401).json({ error: 'Invalid token' })

    const client = await clientPromise
    const db = client.db()

    // Check what collection create.ts uses and use SAME name here
    // Try all possible userId field formats
    const query = {
      $or: [
        { userId: userId },
        { userId: userId.toString() },
        { customerId: userId },
        { customerId: userId.toString() },
        { user: userId },
        ...(ObjectId.isValid(userId) ? [
          { userId: new ObjectId(userId) },
          { customerId: new ObjectId(userId) },
        ] : [])
      ]
    }

    const orders = await db.collection('orders')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    const serialized = orders.map(order => ({
      ...order,
      _id: order._id.toString(),
      userId: order.userId?.toString(),
      customerId: order.customerId?.toString(),
    }))

    return res.status(200).json({ orders: serialized, count: serialized.length })

  } catch (error: any) {
    console.error('Order history error:', error)
    return res.status(500).json({ error: 'Failed to fetch orders', details: error.message })
  }
}
