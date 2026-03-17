import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SiteContent } from '@/types';
import { defaultSiteContent } from '@/data/store';
import SEO, { restaurantSchema, breadcrumbSchema } from '@/components/SEO';

// ─── Local types ────────────────────────────────────────────────────────────

interface LocalDish {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  gradient: string;
  badge: string;
  badgeType: 'pop' | 'nw' | 'sp';
}

interface LocalTestimonial {
  id: string;
  name: string;
  initial: string;
  role: string;
  text: string;
  featured: boolean;
}

// ─── Static fallback data ────────────────────────────────────────────────────

const DEFAULT_DISHES: LocalDish[] = [
  {
    id: '1',
    name: 'Butter Chicken',
    description: 'Tender chicken in rich velvety tomato cream sauce with aromatic Indian spices and fresh cream',
    price: 18.99,
    emoji: '🍛',
    gradient: 'linear-gradient(145deg,#3D1C00,#8B4513,#D2691E)',
    badge: 'Most Popular',
    badgeType: 'pop',
  },
  {
    id: '2',
    name: 'Palak Paneer',
    description: 'Fresh cottage cheese in silky spinach gravy',
    price: 16.99,
    emoji: '🥘',
    gradient: 'linear-gradient(145deg,#1A3A0F,#2D6A18,#4A9B28)',
    badge: 'New',
    badgeType: 'nw',
  },
  {
    id: '3',
    name: 'Chicken Tikka',
    description: 'Smoky char-grilled marinated chicken',
    price: 17.99,
    emoji: '🍢',
    gradient: 'linear-gradient(145deg,#5C0A0A,#A01818,#D44020)',
    badge: 'Spicy',
    badgeType: 'sp',
  },
  {
    id: '4',
    name: 'Lamb Biryani',
    description: 'Fragrant basmati layered with tender spiced lamb',
    price: 21.99,
    emoji: '🍚',
    gradient: 'linear-gradient(145deg,#5C3800,#A06818,#D4A040)',
    badge: 'Popular',
    badgeType: 'pop',
  },
];

const DEFAULT_TESTIMONIALS: LocalTestimonial[] = [
  {
    id: '1',
    name: 'Sarah M.',
    initial: 'S',
    role: 'Regular · Alexandria',
    text: 'The butter chicken is absolutely divine. It tastes exactly like my grandmother used to make in Delhi. Truly authentic!',
    featured: false,
  },
  {
    id: '2',
    name: 'James R.',
    initial: 'J',
    role: 'Food blogger · 5 visits',
    text: 'Best Indian food in Louisiana, hands down. The biryani is incredible and the online ordering makes everything so effortless.',
    featured: true,
  },
  {
    id: '3',
    name: 'Amanda K.',
    initial: 'A',
    role: 'Corporate client',
    text: 'Hired Golden Lotus for our corporate event — 200 guests and every single person was blown away. Exceptional catering!',
    featured: false,
  },
];

const TICKER_ITEMS = [
  'Authentic Indian Cuisine',
  'Fresh Ingredients Daily',
  'Online Ordering Available',
  'Catering Services',
  'Family Recipes Since 2010',
  'Alexandria Louisiana',
  'Pickup in 15 Minutes',
];

// ─── Badge helpers ───────────────────────────────────────────────────────────

function badgeBg(type: LocalDish['badgeType']): string {
  if (type === 'nw') return 'rgba(30,92,58,0.85)';
  if (type === 'sp') return 'rgba(120,28,28,0.85)';
  return 'rgba(15,12,8,0.80)';
}

function badgeDot(type: LocalDish['badgeType']): string {
  if (type === 'nw') return '#5AC480';
  if (type === 'sp') return '#FF6B6B';
  return '#C9963F';
}

// ─── Styles injected once ────────────────────────────────────────────────────

const HOME_CSS = `
  .hl-hero { display: grid; grid-template-columns: 52% 48%; min-height: calc(100vh - 64px); }
  .hl-hero-l { display: flex; flex-direction: column; justify-content: center; padding: 80px 56px 80px 80px; position: relative; z-index: 2; }
  .hl-hero-l::after { content: ''; position: absolute; top: 15%; right: 0; width: 1px; height: 70%; background: linear-gradient(to bottom, transparent, #DDD0BB, transparent); }
  .hl-h1 { font-family: 'Cormorant Garamond', serif; font-size: clamp(46px,5.2vw,70px); font-weight: 400; line-height: 1.1; color: #0F0C08; letter-spacing: -0.025em; margin: 0; }
  .hl-kpis { display: flex; gap: 0; flex-wrap: wrap; }
  .hl-kpi { padding: 0 32px; }
  .hl-kpi:first-child { padding-left: 0; }
  .hl-kpi + .hl-kpi { border-left: 1px solid #DDD0BB; }
  .hl-dish-grid { display: grid; grid-template-columns: 1.2fr 1fr 1fr 1fr; gap: 20px; }
  .hl-dark-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
  .hl-feats { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .hl-reviews { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
  .hl-cta-inner { display: grid; grid-template-columns: 1fr auto; gap: 64px; align-items: center; }
  .hl-sec { max-width: 1260px; margin: 0 auto; padding: 88px 64px; }
  .hl-eyebrow { font-size: 10.5px; letter-spacing: 0.2em; text-transform: uppercase; color: #B8853A; font-weight: 600; margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
  .hl-eyebrow::before { content: ''; display: block; width: 20px; height: 1.5px; background: #B8853A; flex-shrink: 0; }
  .hl-dc { background: white; border-radius: 18px; overflow: hidden; border: 1px solid #EDE3D2; transition: all 0.32s cubic-bezier(.4,0,.2,1); cursor: pointer; }
  .hl-dc:hover { transform: translateY(-5px); box-shadow: 0 20px 56px rgba(15,12,8,0.10); border-color: transparent; }
  .hl-dc:hover .hl-dish-img { transform: scale(1.06); }
  .hl-dish-img { transition: transform 0.5s ease; }
  .hl-add:hover { background: #B8853A !important; transform: scale(1.12); box-shadow: 0 4px 16px rgba(184,133,58,0.4); }
  .hl-feat:hover { background: rgba(184,133,58,0.08) !important; border-color: rgba(184,133,58,0.25) !important; transform: translateY(-2px); }
  .hl-tc:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(15,12,8,0.08); }
  .hl-btn-fill:hover { background: #B8853A !important; box-shadow: 0 8px 28px rgba(184,133,58,0.4) !important; transform: translateY(-2px); }
  .hl-btn-ghost:hover { border-color: #B8853A !important; color: #B8853A !important; }
  .hl-cta-b1:hover { background: #B8853A !important; box-shadow: 0 8px 24px rgba(184,133,58,0.35) !important; transform: translateY(-2px); }
  .hl-cta-b2:hover { border-color: #B8853A !important; color: #B8853A !important; }
  .hl-see-all:hover { gap: 10px !important; }
  .hl-food-ring { animation: hl-float 4s ease-in-out infinite; }
  @keyframes hl-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
  .hl-ticker-track { display: flex; animation: hl-ticker 26s linear infinite; white-space: nowrap; }
  @keyframes hl-ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  @media (max-width: 1024px) {
    .hl-dish-grid { grid-template-columns: 1fr 1fr !important; }
    .hl-dc[data-first='true'] { grid-row: span 1 !important; }
    .hl-dc[data-first='true'] .hl-dish-ph { height: 185px !important; }
  }
  @media (max-width: 768px) {
    .hl-hero { grid-template-columns: 1fr !important; }
    .hl-hero-l { padding: 48px 24px 40px !important; }
    .hl-hero-l::after { display: none; }
    .hl-hero-r { min-height: 280px; }
    .hl-h1 { font-size: clamp(36px,10vw,52px) !important; }
    .hl-hero-acts { flex-direction: column !important; align-items: flex-start !important; }
    .hl-kpis { gap: 12px; }
    .hl-kpi { padding: 0 16px !important; border-left: none !important; }
    .hl-kpi + .hl-kpi { border-left: 1px solid #DDD0BB !important; }
    .hl-sec { padding: 60px 24px !important; }
    .hl-dish-grid { grid-template-columns: 1fr 1fr !important; }
    .hl-dark-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
    .hl-feats { grid-template-columns: 1fr 1fr !important; }
    .hl-reviews { grid-template-columns: 1fr !important; }
    .hl-cta-inner { grid-template-columns: 1fr !important; gap: 32px !important; }
    .hl-cta-block { padding: 40px 24px !important; }
    .hl-cta-wrap { padding: 0 16px 60px !important; }
    .hl-dark-block { padding: 60px 24px !important; }
    .hl-cta-emoji { display: none !important; }
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate();
  const [siteContent, setSiteContent] = useState<SiteContent>(defaultSiteContent);
  const [dishes, setDishes] = useState<LocalDish[]>(DEFAULT_DISHES);
  const [testimonials, setTestimonials] = useState<LocalTestimonial[]>(DEFAULT_TESTIMONIALS);

  useEffect(() => {
    const load = async () => {
      try {
        const [scRes, testRes, menuRes] = await Promise.all([
          fetch('/api/menu?action=site-content'),
          fetch('/api/menu?action=testimonials'),
          fetch('/api/menu?action=items'),
        ]);

        if (scRes.ok) {
          const sc = await scRes.json();
          if (sc) setSiteContent(sc);
        }

        if (testRes.ok) {
          const data = await testRes.json();
          if (Array.isArray(data) && data.length > 0) {
            setTestimonials(
              data
                .filter((t: { published?: boolean }) => t.published !== false)
                .slice(0, 3)
                .map((t: { id?: string; _id?: string; name: string; role?: string; text: string }, idx: number) => ({
                  id: t.id ?? t._id ?? String(idx),
                  name: t.name,
                  initial: t.name?.charAt(0) ?? 'G',
                  role: t.role ?? 'Valued Guest',
                  text: t.text,
                  featured: idx === 1,
                }))
            );
          }
        }

        if (menuRes.ok) {
          const items = await menuRes.json();
          if (Array.isArray(items)) {
            const popular = items
              .filter((i: { popular?: boolean; active?: boolean }) => i.popular && i.active !== false)
              .slice(0, 4);
            if (popular.length >= 2) {
              setDishes(
                popular.map((item: { id?: string; _id?: string; name: string; description?: string; price: number }, idx: number) => ({
                  id: item.id ?? item._id ?? String(idx),
                  name: item.name,
                  description: item.description ?? '',
                  price: item.price,
                  emoji: DEFAULT_DISHES[idx % DEFAULT_DISHES.length].emoji,
                  gradient: DEFAULT_DISHES[idx % DEFAULT_DISHES.length].gradient,
                  badge: DEFAULT_DISHES[idx % DEFAULT_DISHES.length].badge,
                  badgeType: DEFAULT_DISHES[idx % DEFAULT_DISHES.length].badgeType,
                }))
              );
            }
          }
        }
      } catch (err) {
        console.error('Home: failed to load data', err);
      }
    };
    load();
  }, []);

  return (
    <>
      <SEO
        title="Golden Lotus Indian Restaurant | Authentic Indian Cuisine in Alexandria, LA"
        description="Golden Lotus offers authentic Indian cuisine, catering services, and unforgettable dining experiences in Alexandria, Louisiana. Located at 1473 Dorchester Dr."
        url="https://www.goldenlotusgrill.com"
        schema={[restaurantSchema, breadcrumbSchema([{ name: 'Home', url: 'https://www.goldenlotusgrill.com' }])]}
      />

      {/* Scoped styles for animations & responsive overrides */}
      <style dangerouslySetInnerHTML={{ __html: HOME_CSS }} />

      <div style={{ fontFamily: "'Jost', sans-serif", background: '#F9F4EC', color: '#0F0C08', overflowX: 'hidden' }}>

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="hl-hero">
          {/* Left column */}
          <div className="hl-hero-l">
            {/* Eyebrow pill */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: '#F2E4C8', border: '1px solid #DDD0BB', borderRadius: 40, fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#B8853A', marginBottom: 32, width: 'fit-content' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#B8853A', display: 'inline-block', flexShrink: 0 }} />
              Alexandria, Louisiana · Est. 2010
            </div>

            <h1 className="hl-h1">
              Taste the art of
              <span style={{ fontStyle: 'italic', color: '#B8853A', fontWeight: 500, display: 'block' }}>authentic Indian</span>
              <span style={{ fontWeight: 700, display: 'block' }}>cuisine.</span>
            </h1>

            <p style={{ fontSize: 16, lineHeight: 1.75, color: '#6B5540', fontWeight: 300, maxWidth: 420, margin: '28px 0 48px' }}>
              Generations-old recipes, the finest spices, and a passion for flavors that transport you straight to the heart of India — one dish at a time.
            </p>

            <div className="hl-hero-acts" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 64 }}>
              <button
                onClick={() => navigate('/menu?order=true')}
                className="hl-btn-fill"
                style={{ padding: '15px 32px', background: '#1E1810', border: 'none', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Jost', sans-serif", transition: 'all 0.25s', letterSpacing: '0.03em', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                Order Online <span>→</span>
              </button>
              <button
                onClick={() => navigate('/menu')}
                className="hl-btn-ghost"
                style={{ padding: '14px 28px', background: 'transparent', border: '1.5px solid #DDD0BB', borderRadius: 10, color: '#6B5540', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: "'Jost', sans-serif", transition: 'all 0.25s', letterSpacing: '0.02em' }}
              >
                View Our Menu
              </button>
            </div>

            {/* KPIs */}
            <div className="hl-kpis">
              {[
                { num: '14', sup: '+', label: 'Years serving' },
                { num: '80', sup: '+', label: 'Menu items' },
                { num: '4.9', sup: '', label: 'Guest rating' },
                { num: '3k', sup: '+', label: 'Happy guests' },
              ].map((k, i) => (
                <div key={i} className="hl-kpi" style={{ paddingLeft: i === 0 ? 0 : undefined }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: '#0F0C08', lineHeight: 1, letterSpacing: '-0.02em' }}>
                    {k.num}{k.sup && <sup style={{ fontSize: 16, fontWeight: 500 }}>{k.sup}</sup>}
                  </div>
                  <div style={{ fontSize: 11, color: '#9E8870', letterSpacing: '0.04em', marginTop: 4 }}>{k.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column – dark panel */}
          <div className="hl-hero-r" style={{ position: 'relative', background: '#1E1810', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 60% 35%,rgba(184,133,58,0.20) 0%,transparent 60%),radial-gradient(ellipse at 20% 75%,rgba(184,133,58,0.08) 0%,transparent 50%),linear-gradient(160deg,#0F0C08 0%,#2A1C0A 100%)' }} />

            {/* Floating food ring */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="hl-food-ring" style={{ width: 320, height: 320, borderRadius: '50%', border: '1px solid rgba(184,133,58,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 140, filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.6))' }}>🍛</span>
              </div>
            </div>

            {/* Chef's Signature card */}
            <div style={{ position: 'absolute', bottom: 44, left: -20, zIndex: 10, background: 'white', borderRadius: 14, padding: '14px 18px', boxShadow: '0 16px 48px rgba(0,0,0,0.18)', minWidth: 190 }}>
              <div style={{ fontSize: '9.5px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9E8870', marginBottom: 4, fontWeight: 500 }}>Chef's Signature</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontWeight: 600, color: '#0F0C08' }}>Butter Chicken</div>
              <div style={{ fontSize: 11, color: '#9E8870', marginTop: 1 }}>Most ordered dish</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ width: 10, height: 10, background: '#C9963F', flexShrink: 0, display: 'inline-block', clipPath: 'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)' }} />
                ))}
                <span style={{ fontSize: 11, color: '#9E8870', fontWeight: 500, marginLeft: 2 }}>5.0 · 248 reviews</span>
              </div>
            </div>

            {/* Est. badge */}
            <div style={{ position: 'absolute', top: 36, right: 28, zIndex: 10, background: '#B8853A', borderRadius: '50%', width: 80, height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 28px rgba(184,133,58,0.5)' }}>
              <span style={{ fontSize: '7.5px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>Est.</span>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: 'white', lineHeight: 1 }}>2010</span>
            </div>

            {/* Ready in 15 min */}
            <div style={{ position: 'absolute', top: '42%', right: 22, zIndex: 10, background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '11px 15px', display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 34, height: 34, background: '#F2E4C8', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>⚡</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'white' }}>Ready in 15 min</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Fast pickup available</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TICKER ───────────────────────────────────────────────────── */}
        <div style={{ background: '#1E1810', padding: '14px 0', overflow: 'hidden' }}>
          <div className="hl-ticker-track">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 14, padding: '0 28px', fontSize: '10.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', fontWeight: 400 }}>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#B8853A', display: 'inline-block', flexShrink: 0 }} />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ── FEATURED DISHES ──────────────────────────────────────────── */}
        {siteContent.settings?.showFeaturedDishes !== false && (
          <div className="hl-sec">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 52, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div className="hl-eyebrow">Our Specialties</div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px,3.5vw,48px)', fontWeight: 400, color: '#0F0C08', lineHeight: 1.15, letterSpacing: '-0.02em', margin: 0 }}>
                  Dishes crafted with<br />
                  <em style={{ fontStyle: 'italic', color: '#B8853A' }}>love &amp; tradition</em>
                </h2>
              </div>
              <button
                onClick={() => navigate('/menu')}
                className="hl-see-all"
                style={{ fontSize: '12.5px', fontWeight: 600, color: '#B8853A', cursor: 'pointer', background: 'none', border: 'none', padding: 0, display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'gap 0.2s', letterSpacing: '0.04em', fontFamily: "'Jost', sans-serif", textTransform: 'uppercase' }}
              >
                View full menu →
              </button>
            </div>

            <div className="hl-dish-grid">
              {dishes.map((dish, idx) => (
                <div
                  key={dish.id}
                  className="hl-dc"
                  data-first={idx === 0 ? 'true' : 'false'}
                  onClick={() => navigate('/menu?order=true')}
                  style={{ gridRow: idx === 0 ? 'span 2' : undefined }}
                >
                  <div style={{ overflow: 'hidden', position: 'relative' }}>
                    <div
                      className="hl-dish-img hl-dish-ph"
                      style={{ width: '100%', height: idx === 0 ? 255 : 185, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, background: dish.gradient }}
                    >
                      {dish.emoji}
                    </div>
                    <span style={{ position: 'absolute', top: 10, left: 10, padding: '4px 10px', borderRadius: 20, fontSize: '9.5px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 5, background: badgeBg(dish.badgeType), color: 'rgba(255,255,255,0.9)' }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: badgeDot(dish.badgeType), display: 'inline-block', flexShrink: 0 }} />
                      {dish.badge}
                    </span>
                  </div>
                  <div style={{ padding: '15px 18px 18px' }}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 600, color: '#0F0C08', marginBottom: 5, letterSpacing: '-0.01em', lineHeight: 1.2 }}>{dish.name}</div>
                    <div style={{ fontSize: '12.5px', color: '#9E8870', lineHeight: 1.55, marginBottom: 14, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{dish.description}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: '#1E1810' }}>${dish.price.toFixed(2)}</span>
                      <button
                        className="hl-add"
                        onClick={(e) => { e.stopPropagation(); navigate('/menu?order=true'); }}
                        aria-label={`Add ${dish.name} to order`}
                        style={{ width: 36, height: 36, borderRadius: '50%', background: '#1E1810', border: 'none', color: 'white', fontSize: 19, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', lineHeight: 1, flexShrink: 0 }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── WHY GOLDEN LOTUS (dark) ───────────────────────────────────── */}
        <div className="hl-dark-block" style={{ background: '#1E1810', padding: '88px 64px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(184,133,58,0.09) 0%,transparent 70%)', pointerEvents: 'none' }} />
          <div className="hl-dark-grid" style={{ maxWidth: 1260, margin: '0 auto' }}>
            <div>
              <div style={{ fontSize: '10.5px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9963F', fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'block', width: 20, height: 1.5, background: '#C9963F', flexShrink: 0 }} />
                Why Golden Lotus
              </div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px,3.5vw,48px)', fontWeight: 400, color: 'white', lineHeight: 1.14, letterSpacing: '-0.02em', marginBottom: 18 }}>
                A dining experience<br />
                like <em style={{ fontStyle: 'italic', color: '#C9963F' }}>no other</em>
              </h2>
              <p style={{ fontSize: 15, lineHeight: 1.78, color: 'rgba(255,255,255,0.42)', fontWeight: 300, marginBottom: 36, maxWidth: 440 }}>
                From the first bite to the last, we pour our heritage into every dish — sourcing the finest spices, honoring generations-old recipes, and ensuring every visit is extraordinary.
              </p>
              <button
                onClick={() => navigate('/menu?order=true')}
                className="hl-btn-fill"
                style={{ padding: '15px 32px', background: '#0F0C08', border: '1px solid rgba(184,133,58,0.3)', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Jost', sans-serif", transition: 'all 0.25s', letterSpacing: '0.03em', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                Order Now →
              </button>
            </div>

            <div className="hl-feats">
              {[
                { icon: '🌿', title: 'Fresh Daily', desc: 'Ingredients sourced fresh every morning' },
                { icon: '👨‍🍳', title: 'Master Chefs', desc: 'Trained in traditional Indian culinary arts' },
                { icon: '⚡', title: 'Fast Pickup', desc: 'Ready in 15-20 minutes, order anytime' },
                { icon: '🎪', title: 'Catering', desc: 'Events, parties & corporate catering' },
              ].map((f, i) => (
                <div
                  key={i}
                  className="hl-feat"
                  style={{ padding: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, transition: 'all 0.25s', cursor: 'default' }}
                >
                  <span style={{ fontSize: 22, marginBottom: 10, display: 'block' }}>{f.icon}</span>
                  <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'white', marginBottom: 4 }}>{f.title}</div>
                  <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
        {siteContent.settings?.showTestimonials !== false && (
          <div className="hl-sec">
            <div style={{ marginBottom: 52 }}>
              <div className="hl-eyebrow">Guest Reviews</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px,3.5vw,48px)', fontWeight: 400, color: '#0F0C08', lineHeight: 1.15, letterSpacing: '-0.02em', margin: 0 }}>
                What our guests <em style={{ fontStyle: 'italic', color: '#B8853A' }}>say</em>
              </h2>
            </div>
            <div className="hl-reviews">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="hl-tc"
                  style={{ background: t.featured ? '#1E1810' : 'white', borderRadius: 18, padding: 28, border: t.featured ? 'none' : '1px solid #EDE3D2', transition: 'all 0.28s' }}
                >
                  <div style={{ display: 'flex', gap: 3, marginBottom: 18 }}>
                    {[...Array(5)].map((_, i) => (
                      <span key={i} style={{ width: 10, height: 10, background: t.featured ? 'white' : '#C9963F', flexShrink: 0, display: 'inline-block', clipPath: 'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)' }} />
                    ))}
                  </div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontStyle: 'italic', fontWeight: 400, color: t.featured ? 'rgba(255,255,255,0.80)' : '#3D2A0F', lineHeight: 1.68, marginBottom: 22 }}>
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: t.featured ? 'rgba(255,255,255,0.10)' : '#F2E4C8', border: t.featured ? '2px solid rgba(255,255,255,0.20)' : '2px solid #B8853A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 700, color: t.featured ? 'white' : '#B8853A', flexShrink: 0 }}>
                      {t.initial}
                    </div>
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 600, color: t.featured ? 'white' : '#0F0C08' }}>{t.name}</div>
                      <div style={{ fontSize: '11.5px', color: t.featured ? 'rgba(255,255,255,0.38)' : '#9E8870', marginTop: 2 }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        {siteContent.orderCTA?.enabled !== false && siteContent.settings?.showOrderCTA !== false && (
          <div className="hl-cta-wrap" style={{ maxWidth: 1260, margin: '0 auto', padding: '0 64px 88px' }}>
            <div className="hl-cta-block" style={{ background: '#F0E8D8', borderRadius: 24, padding: '72px 80px', border: '1px solid #DDD0BB', position: 'relative', overflow: 'hidden' }}>
              <span className="hl-cta-emoji" style={{ position: 'absolute', right: 240, top: '50%', transform: 'translateY(-50%) rotate(-15deg)', fontSize: 200, opacity: 0.06, pointerEvents: 'none', userSelect: 'none' }}>🪷</span>
              <div className="hl-cta-inner">
                <div>
                  <div style={{ fontSize: '10.5px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B8853A', fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ display: 'block', width: 20, height: 1.5, background: '#B8853A', flexShrink: 0 }} />
                    Ready to order?
                  </div>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px,3vw,44px)', fontWeight: 400, color: '#0F0C08', lineHeight: 1.18, letterSpacing: '-0.02em', marginBottom: 14 }}>
                    Experience <em style={{ fontStyle: 'italic', color: '#B8853A' }}>authentic</em> flavors<br />
                    from the comfort of home
                  </h2>
                  <p style={{ fontSize: 15, color: '#6B5540', lineHeight: 1.7, fontWeight: 300, maxWidth: 460, margin: 0 }}>
                    Order online and pick up your favorite dishes in just 15–20 minutes. Fresh, hot, and made with love every single time.
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 200 }}>
                  <button
                    onClick={() => navigate('/menu?order=true')}
                    className="hl-cta-b1"
                    style={{ padding: '15px 28px', background: '#1E1810', border: 'none', borderRadius: 10, color: 'white', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Jost', sans-serif", transition: 'all 0.22s', textAlign: 'center', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}
                  >
                    Order Online Now →
                  </button>
                  <button
                    onClick={() => navigate('/menu')}
                    className="hl-cta-b2"
                    style={{ padding: '14px 28px', background: 'transparent', border: '1.5px solid #DDD0BB', borderRadius: 10, color: '#6B5540', fontSize: '13.5px', fontWeight: 500, cursor: 'pointer', fontFamily: "'Jost', sans-serif", transition: 'all 0.22s', textAlign: 'center', whiteSpace: 'nowrap' }}
                  >
                    View Full Menu
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
