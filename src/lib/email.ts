import nodemailer from 'nodemailer';

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  // Resolve credentials at call-time so serverless cold-starts always pick
  // up the correct env vars — never cache at module level
  const user = process.env.SMTP_USER || process.env.GMAIL_USER || '';
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';

  if (!user || !pass) {
    console.error('Email not sent — SMTP_USER / SMTP_PASS env vars are missing');
    return { success: false, error: 'SMTP credentials not configured' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from: `"Golden Lotus Restaurant" <${user}>`,
      to,
      subject,
      html,
    });

    console.log(`Email sent → ${to} | messageId: ${info.messageId}`);
    return { success: true };
  } catch (err: any) {
    console.error(`Email send error → ${to} | ${err?.message || err}`);
    return { success: false, error: err?.message };
  }
};

// ─── Template 1: Food Order Confirmation (customer) ───────────────────────

export const orderConfirmationHtml = (order: {
  customerName: string;
  orderNumber: string;
  orderId: string;
  items: { name: string; price: number; quantity: number }[];
  subtotal?: number;
  tax?: number;
  discount?: number;
  total: number;
  paymentMethod: string;
  prepTime?: string;
}) => `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; background: #F9F4EC; }
  .wrap { max-width: 580px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
  .header { background: #1E1810; padding: 32px; text-align: center; }
  .logo-name { color: #B8853A; font-size: 26px; font-weight: bold; letter-spacing: 2px; }
  .logo-sub { color: rgba(255,255,255,0.4); font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin-top: 4px; }
  .body { padding: 32px; }
  .greeting { font-size: 16px; color: #0F0C08; margin-bottom: 6px; }
  .subtext { font-size: 14px; color: #9E8870; margin-bottom: 24px; }
  .order-badge { background: #F2E4C8; border-radius: 12px; padding: 16px 20px; text-align: center; margin-bottom: 24px; border-left: 4px solid #B8853A; }
  .order-badge-label { font-size: 10px; color: #9E8870; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; }
  .order-badge-num { font-size: 24px; font-weight: bold; color: #B8853A; }
  .section-title { font-size: 13px; font-weight: bold; color: #6B5540; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
  .item-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #EDE3D2; font-size: 14px; }
  .item-name { color: #0F0C08; }
  .item-qty { color: #9E8870; font-size: 12px; margin-top: 2px; }
  .item-price { color: #6B5540; font-weight: 600; }
  .totals { margin-top: 4px; }
  .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #9E8870; }
  .grand-total { display: flex; justify-content: space-between; padding: 14px 0 0; border-top: 2px solid #1E1810; font-size: 17px; font-weight: bold; color: #0F0C08; }
  .grand-total span:last-child { color: #B8853A; }
  .pickup-box { background: #F2E4C8; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #B8853A; }
  .pickup-title { font-size: 16px; font-weight: bold; color: #1E1810; margin-bottom: 8px; }
  .pickup-info { font-size: 13px; color: #6B5540; line-height: 1.7; }
  .payment-row { background: #F9F4EC; border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #6B5540; margin-bottom: 24px; }
  .track-btn { display: block; text-align: center; background: #1E1810; color: white; padding: 14px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; margin-bottom: 8px; }
  .footer { background: #1E1810; padding: 20px 32px; text-align: center; }
  .footer p { color: rgba(255,255,255,0.35); font-size: 12px; line-height: 1.6; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="logo-name">Golden Lotus</div>
    <div class="logo-sub">Indian Restaurant · Alexandria, LA</div>
  </div>
  <div class="body">
    <p class="greeting">Hi ${order.customerName}! 🎉</p>
    <p class="subtext">Your order has been confirmed and is being prepared.</p>
    <div class="order-badge">
      <div class="order-badge-label">Your Order Number</div>
      <div class="order-badge-num">#${order.orderNumber}</div>
    </div>
    <div class="section-title">Order Items</div>
    ${order.items.map((item) => `
      <div class="item-row">
        <div>
          <div class="item-name">${item.name}</div>
          <div class="item-qty">Quantity: ${item.quantity}</div>
        </div>
        <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
      </div>
    `).join('')}
    <div class="totals">
      <div class="total-row">
        <span>Subtotal</span>
        <span>$${(order.subtotal ?? order.total).toFixed(2)}</span>
      </div>
      <div class="total-row">
        <span>Tax</span>
        <span>$${(order.tax ?? 0).toFixed(2)}</span>
      </div>
      ${order.discount ? `
      <div class="total-row" style="color:#2F9555">
        <span>Discount</span>
        <span>-$${order.discount.toFixed(2)}</span>
      </div>` : ''}
      <div class="grand-total">
        <span>Total</span>
        <span>$${order.total.toFixed(2)}</span>
      </div>
    </div>
    <div class="pickup-box">
      <div class="pickup-title">⚡ Ready in ${order.prepTime || '15-20'} minutes!</div>
      <div class="pickup-info">
        📍 Golden Lotus Restaurant<br>
        1473 Dorchester Dr, Alexandria, LA 71301<br>
        📞 (318) 448-7888<br>
        🕐 Please pick up within 30 minutes
      </div>
    </div>
    <div class="payment-row">
      💳 Payment: ${order.paymentMethod === 'cash' || order.paymentMethod === 'cod'
        ? 'Cash on Pickup — Please bring exact change'
        : 'Paid by Card — No payment needed at pickup'}
    </div>
    <a href="https://goldenlotusgrill.com/order/${order.orderId}/track" class="track-btn">
      Track My Order →
    </a>
    <p style="font-size:12px;color:#9E8870;text-align:center">
      Questions? Call us at (318) 448-7888 or reply to this email.
    </p>
  </div>
  <div class="footer">
    <p>
      © 2026 Golden Lotus Indian Restaurant<br>
      1473 Dorchester Dr, Alexandria, LA 71301<br>
      golden_lotusmiami@gmail.com
    </p>
  </div>
</div>
</body>
</html>`;

// ─── Template 2: Catering Request Confirmation (customer) ─────────────────

export const cateringConfirmationHtml = (req: {
  name: string;
  phone: string;
  email: string;
  packageName?: string;
  eventDate: string;
  eventTime?: string;
  eventType?: string;
  guestCount: string | number;
  serviceType: string;
  venueAddress?: string;
  dietaryRequirements?: string;
  budgetRange?: string;
}) => `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; background: #F9F4EC; }
  .wrap { max-width: 580px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
  .header { background: #1E1810; padding: 32px; text-align: center; }
  .logo-name { color: #B8853A; font-size: 26px; font-weight: bold; letter-spacing: 2px; }
  .logo-sub { color: rgba(255,255,255,0.4); font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin-top: 4px; }
  .hero-msg { background: #B8853A; padding: 20px 32px; text-align: center; color: white; font-size: 18px; font-weight: bold; }
  .body { padding: 32px; }
  .greeting { font-size: 16px; color: #0F0C08; margin-bottom: 6px; }
  .subtext { font-size: 14px; color: #9E8870; margin-bottom: 24px; line-height: 1.6; }
  .detail-box { background: #F9F4EC; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #EDE3D2; }
  .detail-title { font-size: 11px; font-weight: bold; color: #9E8870; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 14px; }
  .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #EDE3D2; font-size: 13px; }
  .detail-row:last-child { border-bottom: none; }
  .detail-label { color: #9E8870; }
  .detail-value { color: #0F0C08; font-weight: 500; text-align: right; max-width: 60%; }
  .next-steps { background: #F2E4C8; border-radius: 12px; padding: 20px; border-left: 4px solid #B8853A; margin-bottom: 20px; }
  .next-steps-title { font-size: 15px; font-weight: bold; color: #1E1810; margin-bottom: 12px; }
  .step { display: flex; gap: 10px; margin-bottom: 10px; font-size: 13px; color: #6B5540; align-items: flex-start; }
  .step-num { width: 22px; height: 22px; border-radius: 50%; background: #B8853A; color: white; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; flex-shrink: 0; }
  .contact-box { text-align: center; padding: 20px; background: #F9F4EC; border-radius: 12px; }
  .footer { background: #1E1810; padding: 20px 32px; text-align: center; }
  .footer p { color: rgba(255,255,255,0.35); font-size: 12px; line-height: 1.6; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="logo-name">Golden Lotus</div>
    <div class="logo-sub">Indian Restaurant · Alexandria, LA</div>
  </div>
  <div class="hero-msg">🎊 Catering Request Received!</div>
  <div class="body">
    <p class="greeting">Hi ${req.name}!</p>
    <p class="subtext">
      Thank you for choosing Golden Lotus for your event!
      We've received your catering request and our team
      will contact you within 24 hours to confirm details.
    </p>
    <div class="detail-box">
      <div class="detail-title">Your Request Summary</div>
      <div class="detail-row">
        <span class="detail-label">Package</span>
        <span class="detail-value">${req.packageName || 'Custom Package'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Event Date</span>
        <span class="detail-value">${req.eventDate}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Event Time</span>
        <span class="detail-value">${req.eventTime || 'TBD'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Event Type</span>
        <span class="detail-value">${req.eventType || 'Not specified'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Number of Guests</span>
        <span class="detail-value">${req.guestCount} guests</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Service Type</span>
        <span class="detail-value">${req.serviceType}</span>
      </div>
      ${req.venueAddress ? `
      <div class="detail-row">
        <span class="detail-label">Venue</span>
        <span class="detail-value">${req.venueAddress}</span>
      </div>` : ''}
      ${req.dietaryRequirements ? `
      <div class="detail-row">
        <span class="detail-label">Dietary Needs</span>
        <span class="detail-value">${req.dietaryRequirements}</span>
      </div>` : ''}
      ${req.budgetRange ? `
      <div class="detail-row">
        <span class="detail-label">Budget Range</span>
        <span class="detail-value">${req.budgetRange}</span>
      </div>` : ''}
    </div>
    <div class="next-steps">
      <div class="next-steps-title">📋 What Happens Next?</div>
      <div class="step">
        <div class="step-num">1</div>
        <div>Our team reviews your request within 24 hours</div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div>We call you at ${req.phone} to confirm details and pricing</div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div>We finalize the menu and send a formal quote</div>
      </div>
      <div class="step">
        <div class="step-num">4</div>
        <div>Your event is confirmed and we handle everything! 🎉</div>
      </div>
    </div>
    <div class="contact-box">
      <p style="font-size:13px;color:#6B5540;margin-bottom:8px">
        <strong>Need to make changes or have questions?</strong>
      </p>
      <p style="font-size:13px;color:#9E8870">
        📞 (318) 448-7888<br>
        ✉️ golden_lotusmiami@gmail.com
      </p>
    </div>
  </div>
  <div class="footer">
    <p>
      © 2026 Golden Lotus Indian Restaurant<br>
      1473 Dorchester Dr, Alexandria, LA 71301<br>
      golden_lotusmiami@gmail.com
    </p>
  </div>
</div>
</body>
</html>`;

// ─── Template 3: Admin notification for new catering request ──────────────

export const cateringAdminNotificationHtml = (req: {
  name: string;
  phone: string;
  email: string;
  packageName?: string;
  eventDate: string;
  eventType?: string;
  guestCount: string | number;
  serviceType: string;
  message?: string;
}) => `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:20px">
  <div style="max-width:520px;margin:0 auto;background:white;border-radius:12px;overflow:hidden">
    <div style="background:#B8853A;padding:20px 24px">
      <h2 style="color:white;margin:0">🆕 New Catering Request</h2>
    </div>
    <div style="padding:24px">
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr style="border-bottom:1px solid #EDE3D2">
          <td style="padding:10px 0;color:#9E8870;width:40%">Customer</td>
          <td style="padding:10px 0;font-weight:600;color:#0F0C08">${req.name}</td>
        </tr>
        <tr style="border-bottom:1px solid #EDE3D2">
          <td style="padding:10px 0;color:#9E8870">Phone</td>
          <td style="padding:10px 0;color:#0F0C08">${req.phone}</td>
        </tr>
        <tr style="border-bottom:1px solid #EDE3D2">
          <td style="padding:10px 0;color:#9E8870">Email</td>
          <td style="padding:10px 0;color:#0F0C08">${req.email}</td>
        </tr>
        <tr style="border-bottom:1px solid #EDE3D2">
          <td style="padding:10px 0;color:#9E8870">Package</td>
          <td style="padding:10px 0;color:#0F0C08">${req.packageName || 'Custom'}</td>
        </tr>
        <tr style="border-bottom:1px solid #EDE3D2">
          <td style="padding:10px 0;color:#9E8870">Event Date</td>
          <td style="padding:10px 0;color:#0F0C08">${req.eventDate}</td>
        </tr>
        <tr style="border-bottom:1px solid #EDE3D2">
          <td style="padding:10px 0;color:#9E8870">Event Type</td>
          <td style="padding:10px 0;color:#0F0C08">${req.eventType || 'N/A'}</td>
        </tr>
        <tr style="border-bottom:1px solid #EDE3D2">
          <td style="padding:10px 0;color:#9E8870">Guests</td>
          <td style="padding:10px 0;color:#0F0C08">${req.guestCount}</td>
        </tr>
        <tr style="border-bottom:1px solid #EDE3D2">
          <td style="padding:10px 0;color:#9E8870">Service Type</td>
          <td style="padding:10px 0;color:#0F0C08">${req.serviceType}</td>
        </tr>
        ${req.message ? `
        <tr>
          <td style="padding:10px 0;color:#9E8870;vertical-align:top">Message</td>
          <td style="padding:10px 0;color:#0F0C08">${req.message}</td>
        </tr>` : ''}
      </table>
      <a href="https://goldenlotusgrill.com/admin/catering"
         style="display:block;text-align:center;background:#1E1810;color:white;padding:14px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:14px;margin-top:20px">
        View in Admin Panel →
      </a>
    </div>
  </div>
</body>
</html>`;
