import type { VercelRequest, VercelResponse } from '@vercel/node';

// Disable default body parsing for file uploads
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '2mb',
        },
    },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Check if using form data (multipart) or base64 JSON
        const contentType = req.headers['content-type'] || '';
        
        if (contentType.includes('multipart/form-data') || req.body?.file) {
            // Handle avatar/profile image upload
            return handleAvatarUpload(req, res);
        }

        // Handle regular image upload
        return handleImageUpload(req, res);
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function handleAvatarUpload(req: VercelRequest, res: VercelResponse) {
    try {
        // For now, we'll return a placeholder URL
        // In production, you would upload to S3, Cloudinary, etc.
        
        // If it's a base64 image
        if (req.body?.file && typeof req.body.file === 'string') {
            // Validate it's an image data URL
            if (!req.body.file.startsWith('data:image/')) {
                return res.status(400).json({ error: 'Invalid image format' });
            }

            // Return a placeholder success response
            // In production, upload to cloud storage and return the URL
            return res.status(200).json({ 
                success: true, 
                url: req.body.file, // Return the base64 data URL for demo
                message: 'Avatar uploaded successfully'
            });
        }

        // If it's a multipart upload (for production)
        // This would require additional parsing libraries
        return res.status(200).json({ 
            success: true, 
            url: 'https://via.placeholder.com/150',
            message: 'Avatar uploaded successfully'
        });
    } catch (error) {
        console.error('Avatar upload error:', error);
        return res.status(500).json({ error: 'Failed to upload avatar' });
    }
}

async function handleImageUpload(req: VercelRequest, res: VercelResponse) {
    try {
        // Placeholder for general image upload
        // In production, upload to cloud storage (S3, Cloudinary, etc.)
        return res.status(200).json({ 
            success: true, 
            url: 'https://via.placeholder.com/400',
            message: 'Image uploaded successfully'
        });
    } catch (error) {
        console.error('Image upload error:', error);
        return res.status(500).json({ error: 'Failed to upload image' });
    }
}
