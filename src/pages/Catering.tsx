import { useState, useEffect, useRef } from 'react';
import SEO from '@/components/SEO';

// ─── Types ──────────────────────────────────────────────────────────────────

interface CateringPkg {
  id?: string;
  _id?: string;
  name: string;
  description: string;
  pricePerPerson: number;
  minGuests?: number;
  maxGuests?: number;
  menuItems?: { name: string; description?: string }[];
  image?: string;
  featured?: boolean;
  active?: boolean;
  color?: string;
  order?: number;
}

interface CateringContent {
  sections: Record<string, { visible: boolean }>;
  hero: { eyebrow: string; titleLine1: string; titleLine2: string; subtitle: string; button1Text: string; button2Text: string; heroImage: string; };
  stats: { number: string; suffix: string; label: string }[];
  process: { eyebrow: string; title: string; titleItalic: string; steps: { number: string; title: string; description: string }[] };
  cta: { title: string; titleItalic: string; description: string; buttonText: string; phone: string };
  formSettings: {
    emailTo: string;
    confirmMessage: string;
    serviceTypes: { id: string; label: string; icon: string; description: string }[];
    budgetRanges: string[];
    eventTypes: string[];
  };
}

// ─── Defaults ───────────────────────────────────────────────────────────────

const DEFAULT: CateringContent = {
  sections: {
    hero:     { visible: true },
    stats:    { visible: true },
    packages: { visible: true },
    process:  { visible: true },
    cta:      { visible: true },
  },
  hero: {
    eyebrow: 'Alexandria, Louisiana',
    titleLine1: 'Premium Catering',
    titleLine2: 'for every occasion',
    subtitle: 'From intimate gatherings to grand celebrations, we bring authentic Indian flavors to your events with elegance and care.',
    button1Text: 'Explore Packages',
    button2Text: 'Request Custom Quote',
    heroImage: '',
  },
  stats: [
    { number: '500', suffix: '+', label: 'Events catered' },
    { number: '14',  suffix: '+', label: 'Years experience' },
    { number: '50',  suffix: '+', label: 'Menu options' },
    { number: '4.9', suffix: '',  label: 'Client rating' },
  ],
  process: {
    eyebrow: 'How It Works',
    title: 'Simple process,',
    titleItalic: 'exceptional results',
    steps: [
      { number: '1', title: 'Choose Package',   description: 'Browse our catering packages and select the one that fits your event.' },
      { number: '2', title: 'Submit Request',   description: 'Fill out our catering request form with your event details.' },
      { number: '3', title: 'We Confirm',       description: 'Our team contacts you within 24 hours to confirm details.' },
      { number: '4', title: 'Enjoy Your Event', description: 'We handle everything. You just enjoy the celebration!' },
    ],
  },
  cta: {
    title: 'Ready to make your',
    titleItalic: 'event unforgettable?',
    description: 'Contact us today to discuss your catering needs.',
    buttonText: 'Request a Quote →',
    phone: '(318) 445-5688',
  },
  formSettings: {
    emailTo: 'hello@goldenlotusgrill.com',
    confirmMessage: 'Thank you! We will contact you within 24 hours.',
    serviceTypes: [
      { id: 'pickup',      label: 'Pickup',      icon: '🚗', description: 'Collect from us' },
      { id: 'onsite',      label: 'On-Site',      icon: '🍽️', description: 'We come to you' },
      { id: 'fullservice', label: 'Full Service', icon: '👨‍🍳', description: 'Staff + setup' },
    ],
    budgetRanges: ['Under $500', '$500 - $1,000', '$1,000 - $2,500', '$2,500 - $5,000', '$5,000+'],
    eventTypes: ['Wedding', 'Corporate Lunch', 'Birthday Party', 'Graduation', 'Religious Celebration', 'Other'],
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const GRADS: Record<string, string> = {
  gold:  'linear-gradient(145deg,#3D2400,#8B5E1A,#C9963F)',
  green: 'linear-gradient(145deg,#1A3A0F,#2D6A18,#4A9B28)',
  dark:  'linear-gradient(145deg,#0F0C08,#1E1810,#3D2D1A)',
  spice: 'linear-gradient(145deg,#5C1A00,#8B3A1A,#C9501A)',
};
const grad = (c?: string) => GRADS[c || 'gold'] || GRADS.gold;

// ─── CSS ────────────────────────────────────────────────────────────────────

const CSS = `
  @keyframes ct-up { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:none } }
  @keyframes ct-check { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
  @keyframes ct-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(47,149,85,0.4)} 50%{box-shadow:0 0 0 8px rgba(47,149,85,0)} }
  .ct-page { background:#F9F4EC; min-height:100vh; font-family:'Jost',sans-serif; }
  .ct-inner { max-width:1200px; margin:0 auto; padding:0 48px; }
  .ct-eyebrow { display:flex; align-items:center; gap:10px; justify-content:center; }
  .ct-eyebrow span { font-size:10.5px; letter-spacing:0.2em; text-transform:uppercase; font-weight:600; }
  .ct-eyebrow-line { height:1.5px; width:28px; background:#B8853A; flex-shrink:0; }
  .ct-section-hd { text-align:center; margin-bottom:48px; }
  .ct-title { font-family:'Cormorant Garamond',serif; font-weight:400; letter-spacing:-0.02em; line-height:1.1; }
  .ct-pkg-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:24px; }
  .ct-pkg-card { background:white; border-radius:20px; border:1.5px solid #EDE3D2; overflow:hidden; cursor:pointer; transition:all 0.32s; }
  .ct-pkg-card:hover { transform:translateY(-6px); box-shadow:0 24px 60px rgba(15,12,8,0.1); border-color:transparent; }
  .ct-pkg-card.featured { border-color:#B8853A; box-shadow:0 8px 32px rgba(184,133,58,0.2); }
  .ct-input { width:100%; padding:11px 14px; border:1.5px solid #EDE3D2; border-radius:10px; background:#F9F4EC; font-family:'Jost',sans-serif; font-size:14px; color:#0F0C08; transition:all 0.2s; box-sizing:border-box; }
  .ct-input:focus { outline:none; border-color:#B8853A; background:white; box-shadow:0 0 0 3px rgba(184,133,58,0.1); }
  .ct-input.error { border-color:#C53A3A; }
  .ct-label { display:block; font-size:11.5px; font-weight:600; color:#6B5540; margin-bottom:5px; letter-spacing:0.04em; text-transform:uppercase; }
  .ct-btn-primary { padding:14px 28px; background:#1E1810; color:white; border:none; border-radius:12px; font-family:'Jost',sans-serif; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.25s; }
  .ct-btn-primary:hover { background:#B8853A; box-shadow:0 6px 24px rgba(184,133,58,0.4); transform:translateY(-1px); }
  .ct-btn-gold { padding:14px 28px; background:#B8853A; color:white; border:none; border-radius:12px; font-family:'Jost',sans-serif; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.25s; }
  .ct-btn-gold:hover { background:#C9963F; box-shadow:0 6px 24px rgba(184,133,58,0.45); }
  .ct-btn-ghost { padding:14px 28px; background:transparent; color:white; border:1.5px solid rgba(255,255,255,0.4); border-radius:12px; font-family:'Jost',sans-serif; font-size:14px; font-weight:500; cursor:pointer; transition:all 0.25s; }
  .ct-btn-ghost:hover { background:rgba(255,255,255,0.1); border-color:rgba(255,255,255,0.7); }
  .ct-svc-card { border:1.5px solid #EDE3D2; border-radius:14px; padding:16px; cursor:pointer; transition:all 0.2s; flex:1; background:white; }
  .ct-svc-card:hover { border-color:#B8853A; }
  .ct-svc-card.active { border-color:#B8853A; background:rgba(184,133,58,0.04); box-shadow:0 0 0 3px rgba(184,133,58,0.1); }
  .ct-check { width:18px; height:18px; border-radius:4px; border:1.5px solid #DDD0BB; cursor:pointer; transition:all 0.15s; display:flex; align-items:center; justify-content:center; flex-shrink:0; background:white; }
  .ct-check.checked { background:#B8853A; border-color:#B8853A; }
  @media(max-width:768px) {
    .ct-inner { padding:0 16px; }
    .ct-pkg-grid { grid-template-columns:1fr; }
    .ct-form-row { grid-template-columns:1fr !important; }
    .ct-svc-row { flex-direction:column; }
    .ct-process-grid { grid-template-columns:1fr 1fr !important; }
    .ct-hero-btns { flex-direction:column; align-items:stretch; }
  }
`;

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Catering() {
  const [content, setContent] = useState<CateringContent>(DEFAULT);
  const [packages, setPackages] = useState<CateringPkg[]>([]);
  const [view, setView] = useState<'packages' | 'form'>('packages');
  const [selectedPkg, setSelectedPkg] = useState<CateringPkg | null>(null);
  const packagesRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', eventDate: '', eventTime: '',
    guestCount: '', eventType: '', serviceType: 'onsite',
    venueAddress: '', needStaff: false, needEquipment: false,
    budgetRange: '', dietaryRequirements: '', message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin?action=get-catering-content').then(r => r.json()).catch(() => ({})),
      fetch('/api/menu?action=catering-packages').then(r => r.json()).catch(() => []),
    ]).then(([cData, pkgData]) => {
      if (cData?.success && cData.data) setContent({ ...DEFAULT, ...cData.data });
      if (Array.isArray(pkgData)) {
        setPackages(pkgData.filter((p: CateringPkg) => p.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0)));
      }
    });
  }, []);

  const openForm = (pkg: CateringPkg | null) => {
    setSelectedPkg(pkg);
    setView('form');
    setSuccess(false);
    setSubmitError('');
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Full name required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone.trim()) e.phone = 'Phone number required';
    if (!form.eventDate) e.eventDate = 'Event date required';
    if (!form.guestCount) e.guestCount = 'Guest count required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/admin?action=send-catering-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, packageName: selectedPkg?.name || 'Custom Package', packagePrice: selectedPkg?.pricePerPerson }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setSubmitError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setSubmitError('Network error. Please call us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const inp = (id: keyof typeof form, placeholder: string, type = 'text', extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      id={id}
      type={type}
      value={form[id] as string}
      placeholder={placeholder}
      className={`ct-input${errors[id] ? ' error' : ''}`}
      onChange={e => { setForm(f => ({ ...f, [id]: e.target.value })); if (errors[id]) setErrors(er => { const n = { ...er }; delete n[id]; return n; }); }}
      {...extra}
    />
  );

  const field = (label: string, id: string, children: React.ReactNode) => (
    <div>
      <label className="ct-label" htmlFor={id}>{label}</label>
      {children}
      {errors[id] && <div style={{ fontSize: 11, color: '#C53A3A', marginTop: 4 }}>⚠ {errors[id]}</div>}
    </div>
  );

  return (
    <>
      <SEO
        title="Catering Services | Golden Lotus Indian Restaurant | Alexandria, LA"
        description="Premium Indian catering for weddings, corporate events, parties and more. Authentic flavors, fresh ingredients, exceptional service."
        url="https://www.goldenlotusgrill.com/catering"
      />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ct-page">

        {/* ── VIEW: PACKAGES ── */}
        {view === 'packages' && <>

          {/* Hero */}
          {content.sections?.hero?.visible !== false && (
            <section style={{ position: 'relative', minHeight: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {content.hero.heroImage && (
                <img src={content.hero.heroImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.18 }} />
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%,rgba(184,133,58,0.25),transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(184,133,58,0.12),transparent 50%),linear-gradient(160deg,#0F0C08,#2A1C0A)' }} />
              <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 700, padding: '80px 24px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(184,133,58,0.15)', border: '1px solid rgba(184,133,58,0.3)', borderRadius: 30, padding: '6px 16px', marginBottom: 24 }}>
                  <span style={{ fontSize: 10.5, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9963F', fontWeight: 600 }}>{content.hero.eyebrow}</span>
                </div>
                <h1 className="ct-title" style={{ fontSize: 'clamp(40px,5.5vw,64px)', color: 'white', margin: '0 0 8px' }}>
                  {content.hero.titleLine1}<br />
                  <em style={{ color: '#C9963F' }}>{content.hero.titleLine2}</em>
                </h1>
                <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', margin: '16px 0 36px', lineHeight: 1.7, fontWeight: 300, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
                  {content.hero.subtitle}
                </p>
                <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }} className="ct-hero-btns">
                  <button className="ct-btn-gold" onClick={() => packagesRef.current?.scrollIntoView({ behavior: 'smooth' })}>
                    {content.hero.button1Text}
                  </button>
                  <button className="ct-btn-ghost" onClick={() => openForm(null)}>
                    {content.hero.button2Text}
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Stats Bar */}
          {content.sections?.stats?.visible !== false && (
            <div style={{ background: 'white', borderBottom: '1px solid #EDE3D2', padding: '20px 48px' }}>
              <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 0 }}>
                {content.stats.map((s, i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center', padding: '8px 24px', borderRight: i < content.stats.length - 1 ? '1px solid #EDE3D2' : 'none' }}>
                    <div className="ct-title" style={{ fontSize: 32, fontWeight: 600, color: '#1E1810', lineHeight: 1 }}>
                      {s.number}<span style={{ color: '#B8853A' }}>{s.suffix}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#9E8870', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Packages */}
          {content.sections?.packages?.visible !== false && (
            <section ref={packagesRef} style={{ padding: '80px 0' }}>
              <div className="ct-inner">
                <div className="ct-section-hd" style={{ marginBottom: 48 }}>
                  <div className="ct-eyebrow" style={{ marginBottom: 14 }}>
                    <span className="ct-eyebrow-line" />
                    <span className="ct-eyebrow" style={{ color: '#B8853A' }}>Our Packages</span>
                    <span className="ct-eyebrow-line" />
                  </div>
                  <h2 className="ct-title" style={{ fontSize: 'clamp(32px,3.5vw,46px)', color: '#0F0C08', margin: 0 }}>
                    Catering packages crafted for<br />
                    <em style={{ color: '#B8853A' }}>every occasion</em>
                  </h2>
                </div>

                <div className="ct-pkg-grid">
                  {packages.map(pkg => {
                    const pkgId = pkg.id || pkg._id || '';
                    return (
                      <div key={pkgId} className={`ct-pkg-card${pkg.featured ? ' featured' : ''}`} onClick={() => openForm(pkg)}>
                        {/* Image */}
                        <div style={{ height: 200, position: 'relative', overflow: 'hidden' }}>
                          {pkg.image ? (
                            <img src={pkg.image} alt={pkg.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                              onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.06)')}
                              onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', background: grad(pkg.color), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>🍽️</div>
                          )}
                          {pkg.featured && (
                            <div style={{ position: 'absolute', top: 12, left: 12, background: '#B8853A', color: 'white', borderRadius: 20, padding: '4px 10px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em' }}>
                              ⭐ Most Popular
                            </div>
                          )}
                          <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(15,12,8,0.85)', backdropFilter: 'blur(8px)', borderRadius: 10, padding: '6px 12px', textAlign: 'center' }}>
                            <div className="ct-title" style={{ fontSize: 22, fontWeight: 600, color: 'white', lineHeight: 1 }}>
                              ${(pkg.pricePerPerson || 0).toFixed(0)}
                            </div>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>/person</div>
                          </div>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '20px 22px 22px' }}>
                          <h3 className="ct-title" style={{ fontSize: 22, fontWeight: 600, color: '#0F0C08', margin: '0 0 6px' }}>{pkg.name}</h3>
                          <p style={{ fontSize: 13, color: '#9E8870', margin: '0 0 12px', lineHeight: 1.55, WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', display: '-webkit-box' }}>{pkg.description}</p>

                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#F9F4EC', border: '1px solid #EDE3D2', borderRadius: 20, padding: '4px 10px', fontSize: 11.5, color: '#9E8870', marginBottom: 14 }}>
                            👥 Min {pkg.minGuests || 10} · Max {pkg.maxGuests || 200} guests
                          </div>

                          {(pkg.menuItems || []).slice(0, 3).length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                              <div style={{ fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9E8870', fontWeight: 600, marginBottom: 6 }}>Menu Highlights</div>
                              {(pkg.menuItems || []).slice(0, 3).map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 4 }}>
                                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#B8853A', marginTop: 6, flexShrink: 0 }} />
                                  <div>
                                    <span style={{ fontSize: 12.5, fontWeight: 600, color: '#1E1810' }}>{item.name}</span>
                                    {item.description && <span style={{ fontSize: 11.5, color: '#9E8870' }}> — {item.description}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <button className="ct-btn-primary" style={{ width: '100%' }} onClick={e => { e.stopPropagation(); openForm(pkg); }}>
                            Select Package →
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Custom Package Card */}
                  <div style={{ background: '#1E1810', borderRadius: 20, overflow: 'hidden', border: '1.5px solid #3D2D1A', cursor: 'pointer', transition: 'all 0.32s' }}
                    onClick={() => openForm(null)}
                    onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 24px 60px rgba(15,12,8,0.3)'; }}
                    onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
                    <div style={{ padding: '32px 24px 24px', textAlign: 'center' }}>
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(184,133,58,0.2)', border: '1px solid rgba(184,133,58,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>🍴</div>
                      <h3 className="ct-title" style={{ fontSize: 22, fontWeight: 600, color: 'white', margin: '0 0 6px' }}>Custom Package</h3>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Built just for you</p>
                    </div>
                    <div style={{ padding: '0 24px 28px' }}>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20, lineHeight: 1.6 }}>
                        Don't see what you need? Tell us your vision and we'll create a custom catering experience.
                      </p>
                      {['Fully customizable menu', 'Any dietary requirements', 'Flexible guest count', 'Personal consultation'].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(184,133,58,0.2)', border: '1px solid rgba(184,133,58,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#B8853A', flexShrink: 0 }}>✓</span>
                          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{item}</span>
                        </div>
                      ))}
                      <button className="ct-btn-gold" style={{ width: '100%', marginTop: 8 }} onClick={e => { e.stopPropagation(); openForm(null); }}>
                        Request Custom Quote →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* How It Works */}
          {content.sections?.process?.visible !== false && (
            <section style={{ background: 'white', padding: '80px 0' }}>
              <div className="ct-inner">
                <div className="ct-section-hd">
                  <div className="ct-eyebrow" style={{ marginBottom: 14 }}>
                    <span className="ct-eyebrow-line" />
                    <span style={{ fontSize: 10.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B8853A', fontWeight: 600 }}>{content.process.eyebrow}</span>
                    <span className="ct-eyebrow-line" />
                  </div>
                  <h2 className="ct-title" style={{ fontSize: 'clamp(30px,3.5vw,44px)', color: '#0F0C08', margin: 0 }}>
                    {content.process.title}<br />
                    <em style={{ color: '#B8853A' }}>{content.process.titleItalic}</em>
                  </h2>
                </div>

                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 28, left: '10%', right: '10%', height: 1.5, background: 'linear-gradient(to right,#EDE3D2,#B8853A,#EDE3D2)', zIndex: 0 }} />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, position: 'relative', zIndex: 1 }} className="ct-process-grid">
                    {content.process.steps.map((step, i) => (
                      <div key={i} style={{ textAlign: 'center', padding: '0 12px' }}>
                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#1E1810', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '3px solid white', boxShadow: '0 4px 16px rgba(15,12,8,0.15)' }}>
                          <span className="ct-title" style={{ fontSize: 22, fontWeight: 600 }}>{step.number}</span>
                        </div>
                        <h4 className="ct-title" style={{ fontSize: 18, fontWeight: 600, color: '#0F0C08', margin: '0 0 8px' }}>{step.title}</h4>
                        <p style={{ fontSize: 12.5, color: '#9E8870', lineHeight: 1.55, margin: 0 }}>{step.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* CTA */}
          {content.sections?.cta?.visible !== false && (
            <section style={{ background: '#1E1810', padding: '80px 0', textAlign: 'center' }}>
              <div className="ct-inner">
                <h2 className="ct-title" style={{ fontSize: 'clamp(32px,4vw,52px)', color: 'white', margin: '0 0 12px' }}>
                  {content.cta.title}<br />
                  <em style={{ color: '#B8853A' }}>{content.cta.titleItalic}</em>
                </h2>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', margin: '0 0 24px', fontWeight: 300 }}>{content.cta.description}</p>
                <a href={`tel:${content.cta.phone}`} style={{ fontSize: 28, fontWeight: 600, color: '#B8853A', textDecoration: 'none', display: 'block', marginBottom: 28, fontFamily: "'Cormorant Garamond',serif" }}>
                  {content.cta.phone}
                </a>
                <button className="ct-btn-gold" style={{ fontSize: 15, padding: '16px 36px' }} onClick={() => openForm(null)}>
                  {content.cta.buttonText}
                </button>
              </div>
            </section>
          )}
        </>}

        {/* ── VIEW: FORM ── */}
        {view === 'form' && (
          <div style={{ background: '#F9F4EC', minHeight: '100vh', padding: '32px 0 80px' }}>
            <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
              <button onClick={() => { setView('packages'); window.scrollTo({ top: 0 }); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#6B5540', fontFamily: "'Jost',sans-serif", fontWeight: 500, marginBottom: 24, padding: 0 }}
                onMouseOver={e => (e.currentTarget.style.color = '#0F0C08')} onMouseOut={e => (e.currentTarget.style.color = '#6B5540')}>
                ← Back to Packages
              </button>

              {success ? (
                <div style={{ background: 'white', borderRadius: 24, border: '1px solid #EDE3D2', padding: 48, textAlign: 'center', animation: 'ct-up 0.5s ease' }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#2F9555', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 32, animation: 'ct-check 0.5s ease, ct-pulse 2s 0.5s infinite', color: 'white', fontWeight: 700 }}>✓</div>
                  <h2 className="ct-title" style={{ fontSize: 32, color: '#0F0C08', margin: '0 0 10px' }}>Request Sent! 🎉</h2>
                  <p style={{ fontSize: 15, color: '#9E8870', margin: '0 0 8px' }}>{content.formSettings.confirmMessage}</p>
                  <p style={{ fontSize: 13, color: '#9E8870', margin: '0 0 28px' }}>We'll contact you at <strong style={{ color: '#0F0C08' }}>{form.email}</strong> within 24 hours.</p>
                  <button className="ct-btn-primary" onClick={() => { setView('packages'); window.scrollTo({ top: 0 }); }}>Back to Packages</button>
                </div>
              ) : (
                <div style={{ background: 'white', borderRadius: 24, border: '1px solid #EDE3D2', padding: 36, boxShadow: '0 4px 24px rgba(15,12,8,0.06)' }}>

                  {/* Selected Package */}
                  {selectedPkg && (
                    <div style={{ background: '#F2E4C8', border: '1px solid #DDD0BB', borderLeft: '4px solid #B8853A', borderRadius: 14, padding: '14px 18px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
                      {selectedPkg.image && <img src={selectedPkg.image} alt={selectedPkg.name} style={{ width: 44, height: 44, borderRadius: 9, objectFit: 'cover', flexShrink: 0 }} />}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1E1810' }}>{selectedPkg.name}</div>
                        <div style={{ fontSize: 12, color: '#9E8870' }}>${selectedPkg.pricePerPerson}/person · Min {selectedPkg.minGuests || 10} guests</div>
                      </div>
                      <button onClick={() => setSelectedPkg(null)} style={{ background: 'none', border: 'none', fontSize: 12, color: '#B8853A', fontWeight: 600, cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>Change</button>
                    </div>
                  )}

                  <h2 className="ct-title" style={{ fontSize: 28, color: '#0F0C08', margin: '0 0 6px', fontWeight: 600 }}>Catering Request</h2>
                  <p style={{ fontSize: 13, color: '#9E8870', margin: '0 0 28px' }}>Fill in your details and we'll get back to you within 24 hours.</p>

                  <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }} className="ct-form-row">
                      {field('Full Name *', 'name', inp('name', 'Your full name'))}
                      {field('Phone Number *', 'phone', inp('phone', '(318) 555-0000', 'tel'))}
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      {field('Email Address *', 'email', inp('email', 'you@email.com', 'email'))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }} className="ct-form-row">
                      {field('Event Date *', 'eventDate', inp('eventDate', '', 'date'))}
                      {field('Event Time', 'eventTime', inp('eventTime', '', 'time'))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }} className="ct-form-row">
                      {field('Number of Guests *', 'guestCount', inp('guestCount', 'e.g. 50', 'number', { min: 1 }))}
                      {field('Event Type', 'eventType', (
                        <select id="eventType" value={form.eventType} onChange={e => setForm(f => ({ ...f, eventType: e.target.value }))} className="ct-input" style={{ cursor: 'pointer' }}>
                          <option value="">Select event type…</option>
                          {content.formSettings.eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      ))}
                    </div>

                    <div style={{ borderTop: '1px solid #EDE3D2', margin: '20px 0' }} />

                    <div style={{ marginBottom: 20 }}>
                      <label className="ct-label">Service Type</label>
                      <div style={{ display: 'flex', gap: 12 }} className="ct-svc-row">
                        {content.formSettings.serviceTypes.map(s => (
                          <div key={s.id} className={`ct-svc-card${form.serviceType === s.id ? ' active' : ''}`} onClick={() => setForm(f => ({ ...f, serviceType: s.id }))}>
                            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: form.serviceType === s.id ? '#B8853A' : '#0F0C08' }}>{s.label}</div>
                            <div style={{ fontSize: 11, color: '#9E8870', marginTop: 2 }}>{s.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      {field('Venue / Event Address', 'venueAddress', inp('venueAddress', 'Event or venue address'))}
                    </div>

                    <div style={{ borderTop: '1px solid #EDE3D2', margin: '20px 0' }} />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }} className="ct-form-row">
                      <div>
                        <label className="ct-label">Additional Options</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                          {[{ key: 'needStaff', label: 'Need Service Staff' }, { key: 'needEquipment', label: 'Need Equipment Rental' }].map(opt => (
                            <div key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                              onClick={() => setForm(f => ({ ...f, [opt.key]: !f[opt.key as 'needStaff' | 'needEquipment'] }))}>
                              <div className={`ct-check${form[opt.key as 'needStaff' | 'needEquipment'] ? ' checked' : ''}`}>
                                {form[opt.key as 'needStaff' | 'needEquipment'] && <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>✓</span>}
                              </div>
                              <span style={{ fontSize: 13, color: '#0F0C08' }}>{opt.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {field('Budget Range', 'budgetRange', (
                        <select id="budgetRange" value={form.budgetRange} onChange={e => setForm(f => ({ ...f, budgetRange: e.target.value }))} className="ct-input" style={{ cursor: 'pointer' }}>
                          <option value="">Select budget…</option>
                          {content.formSettings.budgetRanges.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      ))}
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      {field('Dietary Requirements', 'dietaryRequirements', inp('dietaryRequirements', 'e.g. Halal, Vegan, Nut-free…'))}
                    </div>

                    <div style={{ marginBottom: 24 }}>
                      <label className="ct-label" htmlFor="message">Additional Message</label>
                      <textarea id="message" rows={4} value={form.message} placeholder="Tell us more about your event…"
                        className="ct-input" style={{ resize: 'vertical', minHeight: 100 }}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                    </div>

                    {submitError && (
                      <div style={{ background: 'rgba(197,58,58,0.08)', border: '1px solid rgba(197,58,58,0.2)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#C53A3A', marginBottom: 16 }}>
                        ⚠ {submitError}
                      </div>
                    )}

                    <button type="submit" disabled={submitting} className="ct-btn-primary" style={{ width: '100%', fontSize: 15, padding: '16px', opacity: submitting ? 0.75 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                      {submitting ? '⏳ Sending…' : 'Submit Catering Request →'}
                    </button>

                    <p style={{ textAlign: 'center', fontSize: 12.5, color: '#9E8870', marginTop: 12 }}>
                      📞 Or call us directly: <a href={`tel:${content.cta.phone}`} style={{ color: '#B8853A', fontWeight: 600, textDecoration: 'none' }}>{content.cta.phone}</a>
                    </p>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
