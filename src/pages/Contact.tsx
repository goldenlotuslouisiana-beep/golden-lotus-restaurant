import { useState, useEffect } from 'react';
import SEO, { breadcrumbSchema } from '@/components/SEO';

// ─── Types ─────────────────────────────────────────────────────────────────

interface ContactContent {
  hero: { eyebrow: string; title: string; titleItalic: string; subtitle: string; };
  info: { address: string; phone: string; email: string; mapEmbedUrl: string; };
  hours: Array<{ day: string; open: string; close: string; closed: boolean; }>;
  social: { instagram: string; facebook: string; twitter: string; tiktok: string; };
  sections?: Record<string, { visible: boolean }>;
}

// ─── Defaults ──────────────────────────────────────────────────────────────

const DEFAULT: ContactContent = {
  hero: { eyebrow: 'Get In Touch', title: "We'd love to", titleItalic: 'hear from you', subtitle: "Have a question, feedback, or want to book catering? We're here to help." },
  info: { address: '1473 Dorchester Dr, Alexandria, LA 71301', phone: '(318) 445-5688', email: 'hello@goldenlotusgrill.com', mapEmbedUrl: '' },
  hours: [
    { day: 'Monday',    open: '11:00 AM', close: '10:00 PM', closed: false },
    { day: 'Tuesday',   open: '11:00 AM', close: '10:00 PM', closed: false },
    { day: 'Wednesday', open: '11:00 AM', close: '10:00 PM', closed: false },
    { day: 'Thursday',  open: '11:00 AM', close: '10:00 PM', closed: false },
    { day: 'Friday',    open: '11:00 AM', close: '11:00 PM', closed: false },
    { day: 'Saturday',  open: '11:00 AM', close: '11:00 PM', closed: false },
    { day: 'Sunday',    open: '12:00 PM', close: '9:00 PM',  closed: false },
  ],
  social: { instagram: '', facebook: '', twitter: '', tiktok: '' },
  sections: { hero: { visible: true }, map: { visible: true }, hours: { visible: true }, form: { visible: true }, social: { visible: true } },
};

// ─── CSS ───────────────────────────────────────────────────────────────────

const CSS = `
  .ct-page { background: #F9F4EC; min-height: 100vh; font-family: 'Jost', sans-serif; }
  .ct-hero { max-width: 1260px; margin: 0 auto; padding: 88px 64px 56px; }
  .ct-eyebrow { font-size: 10.5px; letter-spacing: 0.2em; text-transform: uppercase; color: #B8853A; font-weight: 600; display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
  .ct-eyebrow::before { content: ''; display: block; width: 20px; height: 1.5px; background: #B8853A; flex-shrink: 0; }
  .ct-h1 { font-family: 'Cormorant Garamond', serif; font-size: clamp(36px, 4.5vw, 58px); font-weight: 400; color: #0F0C08; line-height: 1.1; letter-spacing: -0.02em; margin: 0 0 16px; }
  .ct-subtitle { font-size: 16px; color: #9E8870; line-height: 1.7; max-width: 480px; font-weight: 300; }
  .ct-body { max-width: 1260px; margin: 0 auto; padding: 0 64px 88px; display: grid; grid-template-columns: 1.5fr 1fr; gap: 28px; align-items: start; }
  .ct-card { background: white; border-radius: 20px; border: 1px solid #EDE3D2; box-shadow: 0 2px 16px rgba(15,12,8,0.05); }
  .ct-form-card { padding: 32px; }
  .ct-info-card { padding: 24px; border-radius: 16px; margin-bottom: 14px; }
  .ct-inp { width: 100%; border: 1.5px solid #EDE3D2; border-radius: 10px; padding: 11px 14px; font-size: 14px; font-family: 'Jost', sans-serif; color: #0F0C08; background: #F9F4EC; outline: none; transition: all 0.2s; box-sizing: border-box; }
  .ct-inp:focus { border-color: #B8853A; background: white; box-shadow: 0 0 0 3px rgba(184,133,58,0.1); }
  .ct-inp.error { border-color: #C53A3A; background: white; }
  .ct-label { display: block; font-size: 12px; font-weight: 600; color: #6B5540; margin-bottom: 5px; }
  .ct-err { font-size: 11px; color: #C53A3A; margin-top: 3px; }
  .ct-btn { width: 100%; background: #1E1810; color: white; border: none; border-radius: 12px; padding: 15px; font-size: 14px; font-weight: 600; font-family: 'Jost', sans-serif; cursor: pointer; transition: all 0.25s; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .ct-btn:hover:not(:disabled) { background: #B8853A; box-shadow: 0 6px 24px rgba(184,133,58,0.35); transform: translateY(-1px); }
  .ct-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .ct-info-row { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; }
  .ct-info-row + .ct-info-row { border-top: 1px solid #EDE3D2; }
  .ct-info-icon { width: 36px; height: 36px; border-radius: 10px; background: #F2E4C8; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
  .ct-day-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; }
  .ct-day-row + .ct-day-row { border-top: 1px solid #F0E8D8; }
  .ct-day-row.today { background: #F2E4C8; border-radius: 8px; padding: 8px 10px; margin: 0 -10px; }
  .ct-social-btn { width: 40px; height: 40px; border-radius: 50%; background: #1E1810; color: white; display: flex; align-items: center; justify-content: center; text-decoration: none; font-size: 16px; transition: all 0.2s; }
  .ct-social-btn:hover { background: #B8853A; transform: scale(1.1); }
  .ct-map { border-radius: 16px; overflow: hidden; border: 1px solid #EDE3D2; margin-top: 28px; }
  .ct-success { text-align: center; padding: 32px 0; }
  @keyframes ct-check { from { transform: scale(0); opacity: 0; } 60% { transform: scale(1.15); } to { transform: scale(1); opacity: 1; } }
  .ct-check-anim { animation: ct-check 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
  @media (max-width: 900px) {
    .ct-hero { padding: 72px 24px 40px; }
    .ct-body { grid-template-columns: 1fr; padding: 0 24px 64px; }
  }
`;

// ─── Helpers ───────────────────────────────────────────────────────────────

function isOpenNow(hours: ContactContent['hours']): boolean {
  const now = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[now.getDay()];
  const todayHours = hours.find(h => h.day === todayName);
  if (!todayHours || todayHours.closed) return false;
  const parseTime = (t: string) => {
    const [time, period] = t.split(' ');
    let [h, m] = time.split(':').map(Number);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h * 60 + (m || 0);
  };
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return nowMins >= parseTime(todayHours.open) && nowMins <= parseTime(todayHours.close);
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function Contact() {
  const [content, setContent] = useState<ContactContent>(DEFAULT);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetch('/api/admin?action=get-page-content&page=contact')
      .then(r => r.json())
      .then(d => { if (d.success && d.data) setContent({ ...DEFAULT, ...d.data }); })
      .catch(() => {});
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = '⚠ Min 2 characters required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = '⚠ Valid email required';
    if (!form.message.trim() || form.message.trim().length < 10) e.message = '⚠ Min 10 characters required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/admin?action=send-contact-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setForm({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
      } else {
        setSubmitError(data.error || 'Failed to send.');
      }
    } catch {
      setSubmitError(`Failed to send. Please email us directly at ${content.info.email}`);
    } finally {
      setSubmitting(false);
    }
  };

  const todayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
  const isOpen = isOpenNow(content.hours);
  const sec = content.sections || DEFAULT.sections!;

  return (
    <>
      <SEO
        title="Contact Us | Golden Lotus Indian Restaurant Alexandria, LA"
        description="Get in touch with Golden Lotus Grill. Visit us at 1473 Dorchester Dr, Alexandria, LA 71301, call (318) 445-5688, or send us a message online."
        url="https://www.goldenlotusgrill.com/contact"
        schema={breadcrumbSchema([
          { name: 'Home', url: 'https://www.goldenlotusgrill.com' },
          { name: 'Contact', url: 'https://www.goldenlotusgrill.com/contact' },
        ])}
      />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="ct-page">
        {/* ── HERO ── */}
        {sec.hero?.visible !== false && (
          <div className="ct-hero">
            <div className="ct-eyebrow">{content.hero.eyebrow}</div>
            <h1 className="ct-h1">
              {content.hero.title}{' '}
              <em style={{ fontStyle: 'italic', color: '#B8853A' }}>{content.hero.titleItalic}</em>
            </h1>
            <p className="ct-subtitle">{content.hero.subtitle}</p>
          </div>
        )}

        {/* ── MAIN BODY ── */}
        <div className="ct-body">
          {/* LEFT — Contact Form */}
          {sec.form?.visible !== false && (
            <div className="ct-card ct-form-card">
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: '#0F0C08', marginBottom: 6 }}>
                Send us a message
              </h2>
              <p style={{ fontSize: 13, color: '#9E8870', marginBottom: 24 }}>We'll get back to you within 24 hours.</p>

              {submitted ? (
                <div className="ct-success">
                  <div className="ct-check-anim" style={{ width: 64, height: 64, borderRadius: '50%', background: '#2F9555', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28, color: 'white' }}>✓</div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#0F0C08', marginBottom: 8 }}>Message sent!</h3>
                  <p style={{ fontSize: 14, color: '#9E8870', lineHeight: 1.6 }}>We'll get back to you within 24 hours.</p>
                  <button onClick={() => setSubmitted(false)} style={{ marginTop: 20, background: 'none', border: '1.5px solid #EDE3D2', borderRadius: 10, padding: '9px 20px', color: '#6B5540', fontSize: 13, cursor: 'pointer', fontFamily: "'Jost', sans-serif" }}>
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label className="ct-label">Full Name *</label>
                    <input className={`ct-inp${errors.name ? ' error' : ''}`} value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: '' })); }} placeholder="Your full name" />
                    {errors.name && <div className="ct-err">{errors.name}</div>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label className="ct-label">Email *</label>
                      <input type="email" className={`ct-inp${errors.email ? ' error' : ''}`} value={form.email} onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(er => ({ ...er, email: '' })); }} placeholder="your@email.com" />
                      {errors.email && <div className="ct-err">{errors.email}</div>}
                    </div>
                    <div>
                      <label className="ct-label">Phone (optional)</label>
                      <input type="tel" className="ct-inp" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(318) 555-0000" />
                    </div>
                  </div>
                  <div>
                    <label className="ct-label">Subject</label>
                    <select className="ct-inp" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
                      <option>General Inquiry</option>
                      <option>Catering Request</option>
                      <option>Feedback</option>
                      <option>Order Issue</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="ct-label">Message *</label>
                    <textarea className={`ct-inp${errors.message ? ' error' : ''}`} rows={5} value={form.message} onChange={e => { setForm(f => ({ ...f, message: e.target.value })); setErrors(er => ({ ...er, message: '' })); }} placeholder="How can we help you?" style={{ resize: 'vertical' }} />
                    {errors.message && <div className="ct-err">{errors.message}</div>}
                  </div>
                  {submitError && (
                    <div style={{ background: 'rgba(197,58,58,0.07)', border: '1px solid rgba(197,58,58,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#C53A3A' }}>{submitError}</div>
                  )}
                  <button type="submit" className="ct-btn" disabled={submitting}>
                    {submitting ? (
                      <><span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Sending...</>
                    ) : 'Send Message →'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* RIGHT — Info + Hours + Social */}
          <div>
            {/* Contact Info */}
            <div className="ct-card ct-info-card" style={{ marginBottom: 14 }}>
              <div className="ct-info-row">
                <div className="ct-info-icon">📍</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9E8870', marginBottom: 3 }}>Address</div>
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(content.info.address)}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, fontWeight: 600, color: '#0F0C08', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => (e.currentTarget.style.color = '#B8853A')} onMouseOut={e => (e.currentTarget.style.color = '#0F0C08')}>
                    {content.info.address}
                  </a>
                </div>
              </div>
              <div className="ct-info-row">
                <div className="ct-info-icon">📞</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9E8870', marginBottom: 3 }}>Phone</div>
                  <a href={`tel:${content.info.phone}`} style={{ fontSize: 14, fontWeight: 600, color: '#0F0C08', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => (e.currentTarget.style.color = '#B8853A')} onMouseOut={e => (e.currentTarget.style.color = '#0F0C08')}>
                    {content.info.phone}
                  </a>
                </div>
              </div>
              <div className="ct-info-row">
                <div className="ct-info-icon">✉️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9E8870', marginBottom: 3 }}>Email</div>
                  <a href={`mailto:${content.info.email}`} style={{ fontSize: 14, fontWeight: 600, color: '#0F0C08', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => (e.currentTarget.style.color = '#B8853A')} onMouseOut={e => (e.currentTarget.style.color = '#0F0C08')}>
                    {content.info.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Opening Hours */}
            {sec.hours?.visible !== false && (
              <div className="ct-card ct-info-card" style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color: '#0F0C08', margin: 0 }}>Opening Hours</h3>
                  {isOpen && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(47,149,85,0.1)', color: '#2F9555', border: '1px solid rgba(47,149,85,0.2)', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2F9555', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
                      Open Now
                    </span>
                  )}
                </div>
                {content.hours.map((h) => (
                  <div key={h.day} className={`ct-day-row${h.day === todayName ? ' today' : ''}`}>
                    <span style={{ fontSize: 13, color: h.day === todayName ? '#0F0C08' : '#6B5540', fontWeight: h.day === todayName ? 600 : 400 }}>{h.day}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: h.closed ? '#C53A3A' : (h.day === todayName ? '#B8853A' : '#0F0C08') }}>
                      {h.closed ? 'Closed' : `${h.open} – ${h.close}`}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Social Media */}
            {sec.social?.visible !== false && (content.social.instagram || content.social.facebook || content.social.twitter || content.social.tiktok) && (
              <div style={{ background: '#F2E4C8', border: '1px solid #DDD0BB', borderRadius: 16, padding: 20 }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color: '#0F0C08', marginBottom: 14 }}>Follow Us</h3>
                <div style={{ display: 'flex', gap: 10 }}>
                  {content.social.instagram && <a href={content.social.instagram} target="_blank" rel="noopener noreferrer" className="ct-social-btn" title="Instagram">📸</a>}
                  {content.social.facebook && <a href={content.social.facebook} target="_blank" rel="noopener noreferrer" className="ct-social-btn" title="Facebook">👥</a>}
                  {content.social.twitter && <a href={content.social.twitter} target="_blank" rel="noopener noreferrer" className="ct-social-btn" title="Twitter/X">𝕏</a>}
                  {content.social.tiktok && <a href={content.social.tiktok} target="_blank" rel="noopener noreferrer" className="ct-social-btn" title="TikTok">🎵</a>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── MAP ── */}
        {sec.map?.visible !== false && (
          <div style={{ maxWidth: 1260, margin: '0 auto', padding: '0 64px 88px' }}>
            {content.info.mapEmbedUrl ? (
              <div className="ct-map">
                <iframe src={content.info.mapEmbedUrl} width="100%" height="300" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Location map" />
              </div>
            ) : (
              <div style={{ background: '#F2E4C8', border: '1px solid #DDD0BB', borderRadius: 16, padding: '32px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 32 }}>📍</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1E1810', marginBottom: 4 }}>Golden Lotus Grill</div>
                  <div style={{ fontSize: 13, color: '#6B5540' }}>{content.info.address}</div>
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(content.info.address)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: '#B8853A', textDecoration: 'none', marginTop: 8 }}>
                    Get Directions →
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </>
  );
}
