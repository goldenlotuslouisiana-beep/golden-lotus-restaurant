import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const action = req.query.action as string;

    switch (action) {
        case 'image':
            return handleImageUpload(req, res);
        default:
            return res.status(400).json({ error: 'Invalid action' });
    }
}

async function handleImageUpload(req: VercelRequest, res: VercelResponse) {
    try {
        // Since frontend is handling base64 conversion locally via FileReader right now, 
        // this can remain a placeholder or handle raw file stream parsing if migrated.
        // It provides a 200 OK placeholder for the required API struct.
        return res.status(200).json({ success: true, message: 'Upload endpoint available' });
    } catch (error) {
        console.error('Image upload error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
