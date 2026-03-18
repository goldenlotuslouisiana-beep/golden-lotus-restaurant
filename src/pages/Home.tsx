import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO, { restaurantSchema, breadcrumbSchema } from '@/components/SEO';

// ─── Types ───────────────────────────────────────────────────────────────────

interface HeroStat { number: string; suffix: string; label: string; }
interface SectionVisibility { visible: boolean; order?: number; }
interface HomepageContent {
  sections?: {
    hero?: SectionVisibility;
    ticker?: SectionVisibility;
    featured?: SectionVisibility;
    whyUs?: SectionVisibility;
    testimonials?: SectionVisibility;
    cta?: SectionVisibility;
  };
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2Italic: string;
    titleLine3Bold: string;
    subtitle: string;
    button1Text: string;
    button2Text: string;
    stats: HeroStat[];
    floatingCard: { label: string; dishName: string; subtitle: string; rating: string; };
    estYear: string;
    speedBadgeTitle: string;
    speedBadgeSubtitle: string;
  };
  ticker: string[];
  featuredSection: { eyebrow: string; titleLine1: string; titleLine2Italic: string; viewAllText?: string; };
  whyUs: {
    eyebrow: string;
    titleLine1: string;
    titleLine2Italic: string;
    description: string;
    features: Array<{ icon: string; title: string; description: string; }>;
  };
  testimonials: {
    eyebrow: string;
    title: string;
    titleItalic: string;
    items: Array<{ name: string; role: string; quote: string; rating: number; featured: boolean; }>;
  };
  cta: {
    eyebrow: string;
    titleLine1: string;
    titleItalic: string;
    titleLine2: string;
    description: string;
    button1Text: string;
    button2Text: string;
  };
  footer: { restaurantName: string; description: string; address: string; phone: string; email: string; copyright: string; };
}

interface FeaturedMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  featured?: boolean;
  featuredOrder?: number;
}

// ─── Default content (always used as fallback) ───────────────────────────────

const DEFAULT: HomepageContent = {
  sections: {
    hero:         { visible: true, order: 1 },
    ticker:       { visible: true, order: 2 },
    featured:     { visible: true, order: 3 },
    whyUs:        { visible: true, order: 4 },
    testimonials: { visible: true, order: 5 },
    cta:          { visible: true, order: 6 },
  },
  hero: {
    eyebrow: 'Alexandria, Louisiana · Est. 2010',
    titleLine1: 'Taste the art of',
    titleLine2Italic: 'authentic Indian',
    titleLine3Bold: 'cuisine.',
    subtitle: 'Generations-old recipes, the finest spices, and a passion for flavors that transport you straight to the heart of India — one dish at a time.',
    button1Text: 'Order Online →',
    button2Text: 'View Our Menu',
    stats: [
      { number: '14', suffix: '+', label: 'Years serving' },
      { number: '80', suffix: '+', label: 'Menu items' },
      { number: '4.9', suffix: '', label: 'Guest rating' },
    ],
    floatingCard: { label: "Chef's Signature", dishName: 'Butter Chicken', subtitle: 'Most ordered dish', rating: '5.0 · 248 reviews' },
    estYear: '2010',
    speedBadgeTitle: 'Ready in 15 min',
    speedBadgeSubtitle: 'Fast pickup available',
  },
  ticker: ['Authentic Indian Cuisine', 'Fresh Ingredients Daily', 'Online Ordering Available', 'Catering Services', 'Family Recipes Since 2010', 'Alexandria Louisiana', 'Pickup in 15 Minutes'],
  featuredSection: { eyebrow: 'Our Specialties', titleLine1: 'Dishes crafted with', titleLine2Italic: 'love & tradition' },
  whyUs: {
    eyebrow: 'Why Golden Lotus',
    titleLine1: 'A dining experience',
    titleLine2Italic: 'no other',
    description: 'From the first bite to the last, we pour our heritage into every dish — sourcing the finest spices, honoring generations-old recipes, and ensuring every visit is extraordinary.',
    features: [
      { icon: '🌿', title: 'Fresh Daily', description: 'Ingredients sourced fresh every morning' },
      { icon: '👨‍🍳', title: 'Master Chefs', description: 'Trained in traditional Indian culinary arts' },
      { icon: '⚡', title: 'Fast Pickup', description: 'Ready in 15-20 minutes, order anytime' },
      { icon: '🎪', title: 'Catering', description: 'Events, parties & corporate catering' },
    ],
  },
  testimonials: {
    eyebrow: 'Guest Reviews',
    title: 'What our guests',
    titleItalic: 'say',
    items: [
      { name: 'Sarah M.', role: 'Regular · Alexandria', quote: 'The butter chicken is absolutely divine. It tastes exactly like my grandmother used to make in Delhi. Truly authentic!', rating: 5, featured: false },
      { name: 'James R.', role: 'Food blogger · 5 visits', quote: 'Best Indian food in Louisiana, hands down. The biryani is incredible and the online ordering makes everything so effortless.', rating: 5, featured: true },
      { name: 'Amanda K.', role: 'Corporate client', quote: 'Hired Golden Lotus for our corporate event — 200 guests and every single person was blown away. Exceptional catering!', rating: 5, featured: false },
    ],
  },
  cta: {
    eyebrow: 'Ready to order?',
    titleLine1: 'Experience',
    titleItalic: 'authentic',
    titleLine2: 'flavors from the comfort of home',
    description: 'Order online and pick up your favorite dishes in just 15–20 minutes. Fresh, hot, and made with love every single time.',
    button1Text: 'Order Online Now →',
    button2Text: 'View Full Menu',
  },
  footer: {
    restaurantName: 'Golden Lotus',
    description: 'Experience the art of authentic Indian cuisine at Golden Lotus Grill.',
    address: '1473 Dorchester Dr, Alexandria, LA 71301',
    phone: '(318) 445-5688',
    email: 'hello@goldenlotusgrill.com',
    copyright: '© 2026 Golden Lotus Indian Cuisine Inc.',
  },
};

// ─── Visual templates for dish cards (assigned by index) ─────────────────────

const DISH_VISUALS = [
  { emoji: '🍛', gradient: 'linear-gradient(145deg,#3D1C00,#8B4513,#D2691E)', badge: 'Most Popular', badgeType: 'pop' as const },
  { emoji: '🥘', gradient: 'linear-gradient(145deg,#1A3A0F,#2D6A18,#4A9B28)', badge: 'New', badgeType: 'nw' as const },
  { emoji: '🍢', gradient: 'linear-gradient(145deg,#5C0A0A,#A01818,#D44020)', badge: 'Spicy', badgeType: 'sp' as const },
  { emoji: '🍚', gradient: 'linear-gradient(145deg,#5C3800,#A06818,#D4A040)', badge: 'Popular', badgeType: 'pop' as const },
];

const STATIC_DISHES: (FeaturedMenuItem & { badgeType: 'pop' | 'nw' | 'sp' })[] = [
  { id: 's1', name: 'Butter Chicken', description: 'Tender chicken in rich velvety tomato cream sauce with aromatic Indian spices and fresh cream', price: 18.99, badgeType: 'pop' },
  { id: 's2', name: 'Palak Paneer', description: 'Fresh cottage cheese in silky spinach gravy', price: 16.99, badgeType: 'nw' },
  { id: 's3', name: 'Chicken Tikka', description: 'Smoky char-grilled marinated chicken', price: 17.99, badgeType: 'sp' },
  { id: 's4', name: 'Lamb Biryani', description: 'Fragrant basmati layered with tender spiced lamb', price: 21.99, badgeType: 'pop' },
];

function badgeBg(type: 'pop' | 'nw' | 'sp'): string {
  if (type === 'nw') return 'rgba(30,92,58,0.85)';
  if (type === 'sp') return 'rgba(120,28,28,0.85)';
  return 'rgba(15,12,8,0.80)';
}
function badgeDot(type: 'pop' | 'nw' | 'sp'): string {
  if (type === 'nw') return '#5AC480';
  if (type === 'sp') return '#FF6B6B';
  return '#C9963F';
}

// ─── Scoped CSS ───────────────────────────────────────────────────────────────

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
  @keyframes float1 { 0%,100% { transform: translate(-50%,-50%) translateY(0px); } 50% { transform: translate(-50%,-50%) translateY(-14px); } }
  @keyframes float2 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
  @keyframes float3 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
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
    .hl-kpi { padding: 0 16px !important; }
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
  const [hc, setHc] = useState<HomepageContent>(DEFAULT);
  const [featuredItems, setFeaturedItems] = useState<FeaturedMenuItem[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin?action=get-homepage').then(r => r.json()).catch(() => null),
      fetch('/api/menu?action=featured').then(r => r.json()).catch(() => null),
    ]).then(([hpRes, featRes]) => {
      if (hpRes?.success && hpRes.data) setHc(hpRes.data as HomepageContent);
      if (featRes?.items?.length) setFeaturedItems(featRes.items);
    });
  }, []);

  // Dishes to display: API featured items (if any), otherwise static fallback
  const dishes = featuredItems.length > 0
    ? featuredItems.map((item, idx) => ({ ...item, ...DISH_VISUALS[idx % DISH_VISUALS.length] }))
    : STATIC_DISHES.map((d, idx) => ({ ...d, ...DISH_VISUALS[idx % DISH_VISUALS.length] }));

  return (
    <>
      <SEO
        title="Golden Lotus Indian Restaurant | Authentic Indian Cuisine in Alexandria, LA"
        description="Golden Lotus offers authentic Indian cuisine, catering services, and unforgettable dining experiences in Alexandria, Louisiana."
        url="https://www.goldenlotusgrill.com"
        schema={[restaurantSchema, breadcrumbSchema([{ name: 'Home', url: 'https://www.goldenlotusgrill.com' }])]}
      />

      <style dangerouslySetInnerHTML={{ __html: HOME_CSS }} />

      <div style={{ fontFamily: "'Jost', sans-serif", background: '#F9F4EC', color: '#0F0C08', overflowX: 'hidden' }}>

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        {hc.sections?.hero?.visible !== false && <section className="hl-hero">
          <div className="hl-hero-l">
            {/* Eyebrow */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: '#F2E4C8', border: '1px solid #DDD0BB', borderRadius: 40, fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#B8853A', marginBottom: 32, width: 'fit-content' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#B8853A', display: 'inline-block', flexShrink: 0 }} />
              {hc.hero.eyebrow}
            </div>

            <h1 className="hl-h1">
              {hc.hero.titleLine1}
              <span style={{ fontStyle: 'italic', color: '#B8853A', fontWeight: 500, display: 'block' }}>{hc.hero.titleLine2Italic}</span>
              <span style={{ fontWeight: 700, display: 'block' }}>{hc.hero.titleLine3Bold}</span>
            </h1>

            <p style={{ fontSize: 16, lineHeight: 1.75, color: '#6B5540', fontWeight: 300, maxWidth: 420, margin: '28px 0 48px' }}>
              {hc.hero.subtitle}
            </p>

            <div className="hl-hero-acts" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 64 }}>
              <button onClick={() => navigate('/menu?order=true')} className="hl-btn-fill" style={{ padding: '15px 32px', background: '#1E1810', border: 'none', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Jost', sans-serif", transition: 'all 0.25s', letterSpacing: '0.03em', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {hc.hero.button1Text}
              </button>
              <button onClick={() => navigate('/menu')} className="hl-btn-ghost" style={{ padding: '14px 28px', background: 'transparent', border: '1.5px solid #DDD0BB', borderRadius: 10, color: '#6B5540', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: "'Jost', sans-serif", transition: 'all 0.25s', letterSpacing: '0.02em' }}>
                {hc.hero.button2Text}
              </button>
            </div>

            <div className="hl-kpis">
              {hc.hero.stats.map((stat, i) => (
                <div key={i} className="hl-kpi" style={{ paddingLeft: i === 0 ? 0 : undefined }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, color: '#0F0C08', lineHeight: 1, letterSpacing: '-0.02em' }}>
                    {stat.number}{stat.suffix && <sup style={{ fontSize: 16, fontWeight: 500 }}>{stat.suffix}</sup>}
                  </div>
                  <div style={{ fontSize: 11, color: '#9E8870', letterSpacing: '0.04em', marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right cream panel */}
          <div className="hl-hero-r" style={{ position: 'relative', background: '#F9F4EC', overflow: 'hidden' }}>
            {/* Decorative gold circles */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 340, height: 340, borderRadius: '50%', border: '1px solid rgba(184,133,58,0.15)', pointerEvents: 'none', zIndex: 1 }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 420, height: 420, borderRadius: '50%', border: '1px dashed rgba(184,133,58,0.08)', pointerEvents: 'none', zIndex: 1 }} />
            {/* Main center image */}
            <img
              src="https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500"
              alt="Butter Chicken"
              style={{ position: 'absolute', top: '50%', left: '50%', width: 280, height: 280, borderRadius: '50%', objectFit: 'cover', border: '4px solid white', boxShadow: '0 20px 60px rgba(15,12,8,0.18)', zIndex: 2, animation: 'float1 4s ease-in-out infinite' }}
              loading="eager"
            />
            {/* Top right image */}
            <img
              src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500"
              alt="Lamb Biryani"
              style={{ position: 'absolute', top: '12%', right: '8%', width: 155, height: 155, borderRadius: '50%', objectFit: 'cover', border: '3px solid white', boxShadow: '0 12px 40px rgba(15,12,8,0.14)', zIndex: 2, animation: 'float2 5s ease-in-out 1s infinite' }}
              loading="eager"
            />
            {/* Bottom left image */}
            <img
              src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500"
              alt="Chicken Karahi"
              style={{ position: 'absolute', bottom: '12%', left: '8%', width: 185, height: 185, borderRadius: '50%', objectFit: 'cover', border: '3px solid white', boxShadow: '0 16px 48px rgba(15,12,8,0.14)', zIndex: 2, animation: 'float3 6s ease-in-out 2s infinite' }}
              loading="eager"
            />
            {/* Est. badge — light */}
            <div style={{ position: 'absolute', top: 36, right: 28, zIndex: 10, background: 'white', border: '1px solid #DDD0BB', borderRadius: '50%', width: 80, height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 28px rgba(15,12,8,0.08)' }}>
              <span style={{ fontSize: '7.5px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9E8870', fontWeight: 500 }}>Est.</span>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: '#0F0C08', lineHeight: 1 }}>{hc.hero.estYear}</span>
            </div>
            {/* Speed badge — light */}
            <div style={{ position: 'absolute', top: '42%', right: 22, zIndex: 10, background: 'white', border: '1px solid #DDD0BB', borderRadius: 12, padding: '11px 15px', display: 'flex', alignItems: 'center', gap: 9, boxShadow: '0 8px 28px rgba(15,12,8,0.08)' }}>
              <div style={{ width: 34, height: 34, background: '#F2E4C8', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>⚡</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#0F0C08' }}>{hc.hero.speedBadgeTitle}</div>
                <div style={{ fontSize: 10, color: '#9E8870', marginTop: 2 }}>{hc.hero.speedBadgeSubtitle}</div>
              </div>
            </div>
          </div>
        </section>}

        {/* ── TICKER ───────────────────────────────────────────────────── */}
        {hc.sections?.ticker?.visible !== false && (
        <div style={{ background: '#1E1810', padding: '14px 0', overflow: 'hidden' }}>
          <div className="hl-ticker-track">
            {[...hc.ticker, ...hc.ticker].map((item, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 14, padding: '0 28px', fontSize: '10.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', fontWeight: 400 }}>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#B8853A', display: 'inline-block', flexShrink: 0 }} />
                {item}
              </span>
            ))}
          </div>
        </div>
        )}

        {/* ── FEATURED DISHES ──────────────────────────────────────────── */}
        {hc.sections?.featured?.visible !== false && <div className="hl-sec">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 52, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="hl-eyebrow">{hc.featuredSection.eyebrow}</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px,3.5vw,48px)', fontWeight: 400, color: '#0F0C08', lineHeight: 1.15, letterSpacing: '-0.02em', margin: 0 }}>
                {hc.featuredSection.titleLine1}<br />
                <em style={{ fontStyle: 'italic', color: '#B8853A' }}>{hc.featuredSection.titleLine2Italic}</em>
              </h2>
            </div>
            <button onClick={() => navigate('/menu')} className="hl-see-all" style={{ fontSize: '12.5px', fontWeight: 600, color: '#B8853A', cursor: 'pointer', background: 'none', border: 'none', padding: 0, display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'gap 0.2s', letterSpacing: '0.04em', fontFamily: "'Jost', sans-serif", textTransform: 'uppercase' }}>
              View full menu →
            </button>
          </div>

          <div className="hl-dish-grid">
            {dishes.map((dish, idx) => (
              <div key={dish.id} className="hl-dc" data-first={idx === 0 ? 'true' : 'false'} onClick={() => navigate('/menu?order=true')} style={{ gridRow: idx === 0 ? 'span 2' : undefined }}>
                <div style={{ overflow: 'hidden', position: 'relative' }}>
                  {dish.image ? (
                    <img src={dish.image} alt={dish.name} className="hl-dish-img hl-dish-ph" style={{ width: '100%', height: idx === 0 ? 255 : 185, objectFit: 'cover', display: 'block' }} loading="lazy" />
                  ) : (
                    <div className="hl-dish-img hl-dish-ph" style={{ width: '100%', height: idx === 0 ? 255 : 185, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, background: dish.gradient }}>
                      {dish.emoji}
                    </div>
                  )}
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
                    <button className="hl-add" onClick={(e) => { e.stopPropagation(); navigate('/menu?order=true'); }} aria-label={`Add ${dish.name} to order`} style={{ width: 36, height: 36, borderRadius: '50%', background: '#1E1810', border: 'none', color: 'white', fontSize: 19, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', lineHeight: 1, flexShrink: 0 }}>+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>}

        {/* ── WHY GOLDEN LOTUS ─────────────────────────────────────────── */}
        {hc.sections?.whyUs?.visible !== false && <div className="hl-dark-block" style={{ background: '#1E1810', padding: '88px 64px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(184,133,58,0.09) 0%,transparent 70%)', pointerEvents: 'none' }} />
          <div className="hl-dark-grid" style={{ maxWidth: 1260, margin: '0 auto' }}>
            <div>
              <div style={{ fontSize: '10.5px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9963F', fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'block', width: 20, height: 1.5, background: '#C9963F', flexShrink: 0 }} />
                {hc.whyUs.eyebrow}
              </div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px,3.5vw,48px)', fontWeight: 400, color: 'white', lineHeight: 1.14, letterSpacing: '-0.02em', marginBottom: 18 }}>
                {hc.whyUs.titleLine1}<br />
                like <em style={{ fontStyle: 'italic', color: '#C9963F' }}>{hc.whyUs.titleLine2Italic}</em>
              </h2>
              <p style={{ fontSize: 15, lineHeight: 1.78, color: 'rgba(255,255,255,0.42)', fontWeight: 300, marginBottom: 36, maxWidth: 440 }}>{hc.whyUs.description}</p>
              <button onClick={() => navigate('/menu?order=true')} className="hl-btn-fill" style={{ padding: '15px 32px', background: '#0F0C08', border: '1px solid rgba(184,133,58,0.3)', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Jost', sans-serif", transition: 'all 0.25s', letterSpacing: '0.03em', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Order Now →
              </button>
            </div>
            <div className="hl-feats">
              {hc.whyUs.features.map((f, i) => (
                <div key={i} className="hl-feat" style={{ padding: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, transition: 'all 0.25s', cursor: 'default' }}>
                  <span style={{ fontSize: 22, marginBottom: 10, display: 'block' }}>{f.icon}</span>
                  <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'white', marginBottom: 4 }}>{f.title}</div>
                  <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{f.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>}

        {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
        {hc.sections?.testimonials?.visible !== false && <div className="hl-sec">
          <div style={{ marginBottom: 52 }}>
            <div className="hl-eyebrow">{hc.testimonials.eyebrow}</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px,3.5vw,48px)', fontWeight: 400, color: '#0F0C08', lineHeight: 1.15, letterSpacing: '-0.02em', margin: 0 }}>
              {hc.testimonials.title} <em style={{ fontStyle: 'italic', color: '#B8853A' }}>{hc.testimonials.titleItalic}</em>
            </h2>
          </div>
          <div className="hl-reviews">
            {hc.testimonials.items.map((t, i) => (
              <div key={i} className="hl-tc" style={{ background: t.featured ? '#1E1810' : 'white', borderRadius: 18, padding: 28, border: t.featured ? 'none' : '1px solid #EDE3D2', transition: 'all 0.28s' }}>
                <div style={{ display: 'flex', gap: 3, marginBottom: 18 }}>
                  {[...Array(Math.min(5, Math.max(1, t.rating || 5)))].map((_, j) => (
                    <span key={j} style={{ width: 10, height: 10, background: t.featured ? 'white' : '#C9963F', flexShrink: 0, display: 'inline-block', clipPath: 'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)' }} />
                  ))}
                </div>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontStyle: 'italic', fontWeight: 400, color: t.featured ? 'rgba(255,255,255,0.80)' : '#3D2A0F', lineHeight: 1.68, marginBottom: 22 }}>&ldquo;{t.quote}&rdquo;</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: t.featured ? 'rgba(255,255,255,0.10)' : '#F2E4C8', border: t.featured ? '2px solid rgba(255,255,255,0.20)' : '2px solid #B8853A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 700, color: t.featured ? 'white' : '#B8853A', flexShrink: 0 }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: t.featured ? 'white' : '#0F0C08' }}>{t.name}</div>
                    <div style={{ fontSize: '11.5px', color: t.featured ? 'rgba(255,255,255,0.38)' : '#9E8870', marginTop: 2 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>}

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        {hc.sections?.cta?.visible !== false && <div className="hl-cta-wrap" style={{ maxWidth: 1260, margin: '0 auto', padding: '0 64px 88px' }}>
          <div className="hl-cta-block" style={{ background: '#F0E8D8', borderRadius: 24, padding: '72px 80px', border: '1px solid #DDD0BB', position: 'relative', overflow: 'hidden' }}>
            <span className="hl-cta-emoji" style={{ position: 'absolute', right: 240, top: '50%', transform: 'translateY(-50%) rotate(-15deg)', fontSize: 200, opacity: 0.06, pointerEvents: 'none', userSelect: 'none' }}>🪷</span>
            <div className="hl-cta-inner">
              <div>
                <div style={{ fontSize: '10.5px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B8853A', fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ display: 'block', width: 20, height: 1.5, background: '#B8853A', flexShrink: 0 }} />
                  {hc.cta.eyebrow}
                </div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px,3vw,44px)', fontWeight: 400, color: '#0F0C08', lineHeight: 1.18, letterSpacing: '-0.02em', marginBottom: 14 }}>
                  {hc.cta.titleLine1} <em style={{ fontStyle: 'italic', color: '#B8853A' }}>{hc.cta.titleItalic}</em> {hc.cta.titleLine2}
                </h2>
                <p style={{ fontSize: 15, color: '#6B5540', lineHeight: 1.7, fontWeight: 300, maxWidth: 460, margin: 0 }}>{hc.cta.description}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 200 }}>
                <button onClick={() => navigate('/menu?order=true')} className="hl-cta-b1" style={{ padding: '15px 28px', background: '#1E1810', border: 'none', borderRadius: 10, color: 'white', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Jost', sans-serif", transition: 'all 0.22s', textAlign: 'center', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
                  {hc.cta.button1Text}
                </button>
                <button onClick={() => navigate('/menu')} className="hl-cta-b2" style={{ padding: '14px 28px', background: 'transparent', border: '1.5px solid #DDD0BB', borderRadius: 10, color: '#6B5540', fontSize: '13.5px', fontWeight: 500, cursor: 'pointer', fontFamily: "'Jost', sans-serif", transition: 'all 0.22s', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  {hc.cta.button2Text}
                </button>
              </div>
            </div>
          </div>
        </div>}

      </div>
    </>
  );
}
