import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Navigation, ExternalLink } from 'lucide-react';
import type { Location, OperatingHours } from '@/types';
import SEO, { breadcrumbSchema } from '@/components/SEO';

// ─── Types ─────────────────────────────────────────────────────────────────

interface Hour { day: string; open: string; close: string; closed: boolean; }

// ─── Defaults ──────────────────────────────────────────────────────────────

const DEFAULT_LOCATION: Location = {
  id: 'main',
  name: 'Golden Lotus Indian Restaurant',
  address: '1473 Dorchester Dr',
  city: 'Alexandria',
  state: 'LA',
  zip: '71301',
  phone: '(318) 445-5688',
  email: 'hello@goldenlotusgrill.com',
  googleMapsUrl: 'https://maps.google.com/?q=1473+Dorchester+Dr+Alexandria+LA+71301',
  hours: [],
};

const DEFAULT_HOURS: Hour[] = [
  { day: 'Monday',    open: '11:00 AM', close: '10:00 PM', closed: false },
  { day: 'Tuesday',   open: '11:00 AM', close: '10:00 PM', closed: false },
  { day: 'Wednesday', open: '11:00 AM', close: '10:00 PM', closed: false },
  { day: 'Thursday',  open: '11:00 AM', close: '10:00 PM', closed: false },
  { day: 'Friday',    open: '11:00 AM', close: '11:00 PM', closed: false },
  { day: 'Saturday',  open: '11:00 AM', close: '11:00 PM', closed: false },
  { day: 'Sunday',    open: '12:00 PM', close: '9:00 PM',  closed: false },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function parseTimeMins(t: string): number {
  const [timePart, period] = t.trim().split(' ');
  let [h, m] = timePart.split(':').map(Number);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h * 60 + (m || 0);
}

function getIsOpenNow(hours: Hour[]): boolean {
  const now = new Date();
  const todayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const todayH = hours.find(h => h.day === todayName);
  if (!todayH || todayH.closed) return false;
  const current = now.getHours() * 60 + now.getMinutes();
  return current >= parseTimeMins(todayH.open) && current < parseTimeMins(todayH.close);
}

// ─── CSS ───────────────────────────────────────────────────────────────────

const CSS = `
  @keyframes loc-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.9)} }
  .loc-page { background: #F9F4EC; min-height: 100vh; font-family: 'Jost', sans-serif; }
  .loc-inner { max-width: 900px; margin: 0 auto; padding: 0 24px 80px; }
  .loc-card { background: white; border-radius: 20px; border: 1px solid #EDE3D2; box-shadow: 0 2px 16px rgba(15,12,8,0.05); overflow: hidden; }
  .loc-info-row { display: flex; align-items: flex-start; gap: 14px; padding: 14px 0; }
  .loc-info-row + .loc-info-row { border-top: 1px solid #F0E8D8; }
  .loc-icon { width: 38px; height: 38px; border-radius: 10px; background: #F2E4C8; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .loc-hour-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 12px; border-radius: 10px; margin-bottom: 5px; transition: background 0.2s; }
  .loc-hour-row.today { background: #F2E4C8; border: 1px solid #DDD0BB; }
  .loc-btn { display: flex; align-items: center; justify-content: center; gap: 7px; padding: 13px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; font-family: 'Jost', sans-serif; cursor: pointer; transition: all 0.25s; text-decoration: none; border: none; }
  .loc-btn-primary { background: #1E1810; color: white; }
  .loc-btn-primary:hover { background: #B8853A; box-shadow: 0 6px 20px rgba(184,133,58,0.35); transform: translateY(-1px); }
  .loc-btn-outline { background: transparent; color: #6B5540; border: 1.5px solid #DDD0BB !important; }
  .loc-btn-outline:hover { border-color: #B8853A !important; color: #B8853A; }
  @media(max-width:640px) {
    .loc-inner { padding: 0 16px 60px; }
    .loc-btn-row { flex-direction: column; }
  }
`;

// ─── Component ─────────────────────────────────────────────────────────────

export default function Locations() {
  const [location, setLocation] = useState<Location>(DEFAULT_LOCATION);
  const [hours, setHours] = useState<Hour[]>(DEFAULT_HOURS);

  useEffect(() => {
    // Fetch location (take first only)
    fetch('/api/menu?action=locations')
      .then(r => r.json())
      .then((data: Location[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setLocation(data[0]);
          // If location has its own hours array, use those
          if (data[0].hours && data[0].hours.length > 0) {
            const mapped: Hour[] = (data[0].hours as OperatingHours[]).map(h => ({
              day: h.day,
              open: h.open,
              close: h.close,
              closed: h.isClosed ?? false,
            }));
            setHours(mapped);
          }
        }
      })
      .catch(() => {});

    // Fetch hours from contact page content (authoritative source)
    fetch('/api/admin?action=get-page-content&page=contact')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data?.hours && d.data.hours.length > 0) {
          setHours(d.data.hours);
        }
      })
      .catch(() => {});
  }, []);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const isOpen = getIsOpenNow(hours);
  const mapsUrl = location.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(`${location.address}, ${location.city}, ${location.state} ${location.zip}`)}`;

  return (
    <>
      <SEO
        title="Our Location | Golden Lotus Indian Restaurant | Alexandria, LA 71301"
        description="Visit Golden Lotus at 1473 Dorchester Dr, Alexandria, LA 71301. Authentic Indian cuisine in Central Louisiana. View hours, contact info, and get directions."
        url="https://www.goldenlotusgrill.com/locations"
        schema={breadcrumbSchema([
          { name: 'Home', url: 'https://www.goldenlotusgrill.com' },
          { name: 'Locations', url: 'https://www.goldenlotusgrill.com/locations' },
        ])}
      />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="loc-page">
        {/* Hero */}
        <section style={{ position: 'relative', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,12,8,0.62)' }} />
          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ width: 20, height: 1.5, background: '#B8853A', display: 'block' }} />
              <span style={{ fontSize: 10.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B8853A', fontWeight: 600 }}>Find Us</span>
              <span style={{ width: 20, height: 1.5, background: '#B8853A', display: 'block' }} />
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px,5vw,56px)', fontWeight: 400, color: 'white', margin: '0 0 12px', letterSpacing: '-0.02em' }}>Our Location</h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', fontWeight: 300 }}>
              {location.address}, {location.city}, {location.state} {location.zip}
            </p>
          </div>
        </section>

        {/* Map */}
        <div style={{ height: 320, background: '#EDE3D2', borderBottom: '1px solid #DDD0BB', position: 'relative' }}>
          <iframe
            src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3354.5!2d-92.4626!3d31.2944!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDE3JzQwLjAiTiA5MsKwMjcnNDUuNCJX!5e0!3m2!1sen!2sus!4v1`}
            width="100%" height="100%" style={{ border: 0, display: 'block' }}
            allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            title="Golden Lotus Location"
          />
          <a
            href={mapsUrl} target="_blank" rel="noopener noreferrer"
            style={{ position: 'absolute', bottom: 16, right: 16, background: 'white', borderRadius: 10, padding: '8px 14px', fontSize: 12.5, fontWeight: 600, color: '#0F0C08', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, boxShadow: '0 2px 12px rgba(0,0,0,0.15)', border: '1px solid #EDE3D2' }}
          >
            <ExternalLink size={13} /> Open in Maps
          </a>
        </div>

        {/* Main content */}
        <div className="loc-inner">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 40 }}>

            {/* Contact Card */}
            <div className="loc-card" style={{ padding: 28 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: '#0F0C08', marginBottom: 20 }}>
                {location.name}
              </h2>

              <div className="loc-info-row">
                <div className="loc-icon"><MapPin size={17} color="#B8853A" /></div>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9E8870', marginBottom: 3 }}>Address</div>
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, fontWeight: 600, color: '#0F0C08', textDecoration: 'none', lineHeight: 1.4, display: 'block' }}
                    onMouseOver={e => (e.currentTarget.style.color = '#B8853A')} onMouseOut={e => (e.currentTarget.style.color = '#0F0C08')}>
                    {location.address}<br />{location.city}, {location.state} {location.zip}
                  </a>
                </div>
              </div>

              <div className="loc-info-row">
                <div className="loc-icon"><Phone size={17} color="#B8853A" /></div>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9E8870', marginBottom: 3 }}>Phone</div>
                  <a href={`tel:${location.phone}`} style={{ fontSize: 14, fontWeight: 600, color: '#0F0C08', textDecoration: 'none' }}
                    onMouseOver={e => (e.currentTarget.style.color = '#B8853A')} onMouseOut={e => (e.currentTarget.style.color = '#0F0C08')}>
                    {location.phone}
                  </a>
                </div>
              </div>

              <div className="loc-info-row">
                <div className="loc-icon"><Mail size={17} color="#B8853A" /></div>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9E8870', marginBottom: 3 }}>Email</div>
                  <a href={`mailto:${location.email}`} style={{ fontSize: 14, fontWeight: 600, color: '#0F0C08', textDecoration: 'none' }}
                    onMouseOver={e => (e.currentTarget.style.color = '#B8853A')} onMouseOut={e => (e.currentTarget.style.color = '#0F0C08')}>
                    {location.email}
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 24 }} className="loc-btn-row">
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="loc-btn loc-btn-primary" style={{ flex: 1 }}>
                  <Navigation size={15} /> Get Directions
                </a>
                <a href={`tel:${location.phone}`} className="loc-btn loc-btn-outline" style={{ flex: 1 }}>
                  <Phone size={15} /> Call Now
                </a>
              </div>
            </div>

            {/* Hours Card */}
            <div className="loc-card" style={{ padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: '#0F0C08', margin: 0 }}>
                  Opening Hours
                </h2>
                {isOpen && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(47,149,85,0.1)', color: '#2F9555', border: '1px solid rgba(47,149,85,0.2)', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 600 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2F9555', display: 'inline-block', animation: 'loc-pulse 2s infinite' }} />
                    Open Now
                  </span>
                )}
              </div>

              {hours.map(h => (
                <div key={h.day} className={`loc-hour-row${h.day === today ? ' today' : ''}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {h.day === today && (
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2F9555', display: 'inline-block', flexShrink: 0 }} />
                    )}
                    <span style={{ fontSize: 13.5, fontWeight: h.day === today ? 600 : 400, color: '#0F0C08' }}>
                      {h.day}
                    </span>
                    {h.day === today && (
                      <span style={{ fontSize: 10, background: '#2F9555', color: 'white', padding: '2px 7px', borderRadius: 20, fontWeight: 600 }}>Today</span>
                    )}
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: 500, color: h.closed ? '#C53A3A' : '#6B5540' }}>
                    {h.closed ? 'Closed' : `${h.open} – ${h.close}`}
                  </span>
                </div>
              ))}

              {isOpen && (
                <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(47,149,85,0.08)', border: '1px solid rgba(47,149,85,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#2F9555', fontWeight: 600 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2F9555', animation: 'loc-pulse 2s infinite', display: 'inline-block' }} />
                  We're open right now!
                </div>
              )}
            </div>
          </div>

          {/* Order CTA */}
          <div style={{ marginTop: 32, background: '#1E1810', borderRadius: 20, padding: '40px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(184,133,58,0.1) 0%,transparent 70%)', pointerEvents: 'none' }} />
            <div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 400, color: 'white', margin: '0 0 6px' }}>
                Can't make it in?
              </h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0, fontWeight: 300 }}>
                Order online for pickup — ready in 15–20 minutes.
              </p>
            </div>
            <a href="/menu?order=true" style={{ padding: '14px 28px', background: '#B8853A', border: 'none', borderRadius: 12, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Jost', sans-serif", transition: 'all 0.25s', textDecoration: 'none', whiteSpace: 'nowrap' }}
              onMouseOver={e => { e.currentTarget.style.background = '#C9963F'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(184,133,58,0.4)'; }}
              onMouseOut={e => { e.currentTarget.style.background = '#B8853A'; e.currentTarget.style.boxShadow = 'none'; }}>
              Order Online Now →
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
