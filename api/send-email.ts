import nodemailer from 'nodemailer';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, phone, date, guests, serviceType, address, message } = req.body;

    if (!name || !email || !date) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const adminEmail = process.env.VITE_ADMIN_EMAIL || 'admin@goldenlotus.com';

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formattedDate = formatDate(date);

    try {
        // 1. Send confirmation to customer
        await transporter.sendMail({
            from: `"Golden Lotus Catering" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: 'Your Golden Lotus Catering Request',
            text: `Hi ${name},\n\nThanks for your catering request! We've received your details and will get back to you shortly.\n\nSummary:\n- Date: ${formattedDate}\n- Guests: ${guests}\n- Service Type: ${serviceType}\n- Address: ${address || 'N/A'}\n\nAdditional Message: ${message || 'No additional notes.'}\n\nBest regards,\nThe Golden Lotus Team`,
            html: `
        <h3>Hi ${name},</h3>
        <p>Thanks for your catering request! We've received your details and will get back to you shortly.</p>
        <hr />
        <p><strong>Summary:</strong></p>
        <ul>
          <li><strong>Date:</strong> ${formattedDate}</li>
          <li><strong>Guests:</strong> ${guests}</li>
          <li><strong>Service Type:</strong> ${serviceType}</li>
          <li><strong>Address:</strong> ${address || 'N/A'}</li>
        </ul>
        <p><strong>Additional Message:</strong><br />${message || 'No additional notes.'}</p>
        <hr />
        <p>Best regards,<br /><strong>The Golden Lotus Team</strong></p>
      `,
        });

        // 2. Send notification to admin
        await transporter.sendMail({
            from: `"Golden Lotus Website" <${process.env.GMAIL_USER}>`,
            to: adminEmail,
            subject: `New Catering Request from ${name}`,
            text: `New Catering Request Details:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nDate: ${formattedDate}\nGuests: ${guests}\nService Type: ${serviceType}\nAddress: ${address || 'N/A'}\nMessage: ${message || 'No additional notes.'}`,
            html: `
        <h3>New Catering Request Received</h3>
        <p><strong>Customer Details:</strong></p>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Phone:</strong> ${phone}</li>
        </ul>
        <hr />
        <p><strong>Event Details:</strong></p>
        <ul>
          <li><strong>Date:</strong> ${formattedDate}</li>
          <li><strong>Guests:</strong> ${guests}</li>
          <li><strong>Service Type:</strong> ${serviceType}</li>
          <li><strong>Address:</strong> ${address || 'N/A'}</li>
        </ul>
        <p><strong>Message:</strong><br />${message || 'No additional notes.'}</p>
      `,
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Email error:', error);
        return res.status(500).json({ error: 'Failed to send email' });
    }
}
