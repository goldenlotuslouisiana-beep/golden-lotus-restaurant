import { useEffect, useState, useCallback, useRef } from 'react';
import { Save, ChevronUp, ChevronDown, Star, Search, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { adminFetch } from '@/lib/adminFetch';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeroStat { number: string; suffix: string; label: string; }
interface WhyFeature { icon: string; title: string; description: string; }
interface TestimonialItem { name: string; role: string; quote: string; rating: number; featured: boolean; }
interface SectionMeta { visible: boolean; order: number; }

interface HomepageContent {
  sections: Record<string, SectionMeta>;
  hero: {
    eyebrow: string; titleLine1: string; titleLine2Italic: string; titleLine3Bold: string;
    subtitle: string; button1Text: string; button2Text: string; stats: HeroStat[];
    estYear: string; speedBadgeTitle: string; speedBadgeSubtitle: string;
  };
  ticker: string[];
  featuredSection: { eyebrow: string; titleLine1: string; titleLine2Italic: string; viewAllText: string; };
  whyUs: { eyebrow: string; titleLine1: string; titleLine2Italic: string; description: string; features: WhyFeature[]; };
  testimonials: { eyebrow: string; title: string; titleItalic: string; items: TestimonialItem[]; };
  cta: { eyebrow: string; titleLine1: string; titleItalic: string; titleLine2: string; description: string; button1Text: string; button2Text: string; };
}

interface MenuItem { id?: string; _id?: string; name: string; price: number; category: string; image?: string; featured?: boolean; featuredOrder?: number; active?: boolean; }
interface ToastMsg { id: number; type: 'success' | 'error'; message: string; }

// ─── Default ─────────────────────────────────────────────────────────────────

const DEFAULT_CONTENT: HomepageContent = {
  sections: {
    hero:         { visible: true, order: 1 },
    ticker:       { visible: true, order: 2 },
    featured:     { visible: true, order: 3 },
    whyUs:        { visible: true, order: 4 },
    testimonials: { visible: true, order: 5 },
    cta:          { visible: true, order: 6 },
  },
  hero: {
    eyebrow: 'Alexandria, Louisiana · Est. 2010', titleLine1: 'Taste the art of',
    titleLine2Italic: 'authentic Indian', titleLine3Bold: 'cuisine.',
    subtitle: 'Generations-old recipes, the finest spices, and a passion for flavors that transport you straight to the heart of India — one dish at a time.',
    button1Text: 'Order Online →', button2Text: 'View Our Menu',
    stats: [
      { number: '14', suffix: '+', label: 'Years serving' },
      { number: '80', suffix: '+', label: 'Menu items' },
      { number: '4.9', suffix: '', label: 'Guest rating' },
    ],
    estYear: '2010', speedBadgeTitle: 'Ready in 15 min', speedBadgeSubtitle: 'Fast pickup available',
  },
  ticker: ['Authentic Indian Cuisine', 'Fresh Ingredients Daily', 'Online Ordering Available', 'Catering Services', 'Family Recipes Since 2010', 'Alexandria Louisiana', 'Pickup in 15 Minutes'],
  featuredSection: { eyebrow: 'Our Specialties', titleLine1: 'Dishes crafted with', titleLine2Italic: 'love & tradition', viewAllText: 'View full menu →' },
  whyUs: {
    eyebrow: 'Why Golden Lotus', titleLine1: 'A dining experience', titleLine2Italic: 'no other',
    description: 'From the first bite to the last, we pour our heritage into every dish.',
    features: [
      { icon: '🌿', title: 'Fresh Daily', description: 'Ingredients sourced fresh every morning' },
      { icon: '👨‍🍳', title: 'Master Chefs', description: 'Trained in traditional Indian culinary arts' },
      { icon: '⚡', title: 'Fast Pickup', description: 'Ready in 15-20 minutes, order anytime' },
      { icon: '🎪', title: 'Catering', description: 'Events, parties & corporate catering' },
    ],
  },
  testimonials: {
    eyebrow: 'Guest Reviews', title: 'What our guests', titleItalic: 'say',
    items: [
      { name: 'Sarah M.', role: 'Regular · Alexandria', quote: 'The butter chicken is absolutely divine.', rating: 5, featured: false },
      { name: 'James R.', role: 'Food blogger · 5 visits', quote: 'Best Indian food in Louisiana, hands down.', rating: 5, featured: true },
      { name: 'Amanda K.', role: 'Corporate client', quote: 'Hired Golden Lotus for our corporate event.', rating: 5, featured: false },
    ],
  },
  cta: {
    eyebrow: 'Ready to order?', titleLine1: 'Experience', titleItalic: 'authentic',
    titleLine2: 'flavors from the comfort of home',
    description: 'Order online and pick up your favorite dishes in just 15–20 minutes.',
    button1Text: 'Order Online Now →', button2Text: 'View Full Menu',
  },
};

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero Banner', ticker: 'Ticker Bar', featured: 'Featured Dishes',
  whyUs: 'Why Golden Lotus', testimonials: 'Testimonials', cta: 'Call to Action',
};
const SECTION_KEYS = ['hero', 'ticker', 'featured', 'whyUs', 'testimonials', 'cta'];
const TABS = ['Hero', 'Ticker', 'Featured', 'Why Us', 'Testimonials', 'CTA'];

// ─── CSS ─────────────────────────────────────────────────────────────────────

const CSS = `
  .hp-toggle { position:relative; display:inline-block; width:44px; height:24px; flex-shrink:0; }
  .hp-toggle input { opacity:0; width:0; height:0; }
  .hp-slider { position:absolute; inset:0; border-radius:12px; background:#DDD0BB; cursor:pointer; transition:0.3s; }
  .hp-slider::before { content:''; position:absolute; height:18px; width:18px; left:3px; bottom:3px; border-radius:50%; background:white; transition:0.3s; box-shadow:0 1px 3px rgba(0,0,0,0.2); }
  input:checked + .hp-slider { background:#B8853A; }
  input:checked + .hp-slider::before { transform:translateX(20px); }
  .hp-tab { padding:7px 16px; border-radius:20px; font-size:12.5px; font-weight:500; cursor:pointer; transition:all 0.2s; border:none; font-family:'Jost',sans-serif; white-space:nowrap; }
  .hp-tab.active { background:#1E1810; color:white; }
  .hp-tab:not(.active) { background:#F0E8D8; color:#6B5540; }
  .hp-tab:not(.active):hover { background:#EDE3D2; color:#0F0C08; }
  .hp-inp { width:100%; border:1.5px solid #EDE3D2; border-radius:8px; padding:9px 12px; font-size:13.5px; font-family:'Jost',sans-serif; color:#0F0C08; background:#F9F4EC; outline:none; transition:all 0.2s; box-sizing:border-box; }
  .hp-inp:focus { border-color:#B8853A; background:white; box-shadow:0 0 0 3px rgba(184,133,58,0.1); }
  .hp-label { display:block; font-size:11.5px; font-weight:600; color:#6B5540; margin-bottom:4px; }
  .hp-save { background:#B8853A; color:white; border:none; border-radius:10px; padding:10px 20px; font-size:13.5px; font-weight:600; cursor:pointer; font-family:'Jost',sans-serif; display:inline-flex; align-items:center; gap:7px; transition:all 0.2s; }
  .hp-save:hover { background:#1E1810; }
  .hp-save:disabled { opacity:0.6; cursor:not-allowed; }
  .hp-sec-card { background:white; border:1px solid #EDE3D2; border-radius:12px; padding:14px 16px; display:flex; align-items:center; gap:12px; transition:all 0.2s; }
  .hp-sec-card:hover { box-shadow:0 4px 16px rgba(15,12,8,0.07); }
  .hp-menu-card { background:white; border:1.5px solid #EDE3D2; border-radius:12px; overflow:hidden; cursor:pointer; transition:all 0.2s; }
  .hp-menu-card.selected { border-color:#B8853A; box-shadow:0 0 0 3px rgba(184,133,58,0.12); }
  .hp-menu-card:hover:not(.selected) { border-color:#DDD0BB; box-shadow:0 2px 8px rgba(15,12,8,0.06); }
  .hp-star { cursor:pointer; font-size:20px; transition:transform 0.1s; }
  .hp-star:hover { transform:scale(1.2); }
  .hp-del { background:none; border:1px solid #EDE3D2; border-radius:8px; padding:6px 10px; color:#9E8870; cursor:pointer; font-size:12px; font-family:'Jost',sans-serif; transition:all 0.2s; }
  .hp-del:hover { border-color:#C53A3A; color:#C53A3A; background:rgba(197,58,58,0.05); }
  .hp-add-btn { background:white; border:1.5px dashed #DDD0BB; border-radius:8px; padding:9px; color:#9E8870; cursor:pointer; font-size:13px; font-family:'Jost',sans-serif; width:100%; transition:all 0.2s; }
  .hp-add-btn:hover { border-color:#B8853A; color:#B8853A; background:rgba(184,133,58,0.03); }
  .hp-toast { position:fixed; bottom:24px; right:24px; z-index:9999; display:flex; flex-direction:column; gap:8px; }
  .hp-toast-item { display:flex; align-items:center; gap:8px; padding:12px 16px; border-radius:10px; font-size:13.5px; font-weight:500; font-family:'Jost',sans-serif; box-shadow:0 8px 24px rgba(0,0,0,0.12); animation:hp-toast-in 0.3s ease; }
  @keyframes hp-toast-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  .hp-toast-success { background:#1E1810; color:white; }
  .hp-toast-error { background:#C53A3A; color:white; }
`;

// ─── Toggle Component ─────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="hp-toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="hp-slider" />
    </label>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminHomePage() {
  const [content, setContent] = useState<HomepageContent>(DEFAULT_CONTENT);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [menuSearch, setMenuSearch] = useState('');
  const toastId = useRef(0);

  const addToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = ++toastId.current;
    setToasts(t => [...t, { id, type, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  // Load content + menu items
  useEffect(() => {
    Promise.all([
      adminFetch('/api/admin?action=get-homepage-content').then(r => r.json()).catch(() => null),
      fetch('/api/menu?action=items').then(r => r.json()).catch(() => []),
    ]).then(([hpRes, menuRes]) => {
      if (hpRes?.success && hpRes.data) {
        setContent(c => ({ ...c, ...hpRes.data, sections: { ...DEFAULT_CONTENT.sections, ...(hpRes.data.sections || {}) } }));
      }
      if (Array.isArray(menuRes)) setMenuItems(menuRes);
      setLoading(false);
    });
  }, []);

  // Save entire section
  const saveSection = async (sectionData: Partial<HomepageContent>) => {
    setSaving(true);
    try {
      const merged = { ...content, ...sectionData };
      const res = await adminFetch('/api/admin?action=save-homepage-content', {
        method: 'POST',
        body: JSON.stringify(merged),
      });
      const data = await res.json();
      if (data.success) {
        setContent(merged);
        addToast('success', 'Section saved! Changes are live ✓');
      } else {
        addToast('error', data.error || 'Failed to save.');
      }
    } catch {
      addToast('error', 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Toggle section visibility
  const toggleSection = async (key: string, visible: boolean) => {
    const newSections = { ...content.sections, [key]: { ...(content.sections[key] || { order: 1 }), visible } };
    setContent(c => ({ ...c, sections: newSections }));
    try {
      await adminFetch('/api/admin?action=toggle-homepage-section', {
        method: 'POST',
        body: JSON.stringify({ sectionKey: key, visible }),
      });
      addToast('success', `${SECTION_LABELS[key]} ${visible ? 'shown' : 'hidden'} on homepage`);
    } catch {
      addToast('error', 'Failed to toggle section.');
      setContent(c => ({ ...c, sections: { ...c.sections, [key]: { ...(c.sections[key] || { order: 1 }), visible: !visible } } }));
    }
  };

  // Reorder sections
  const moveSection = async (key: string, direction: 'up' | 'down') => {
    const sorted = [...SECTION_KEYS].sort((a, b) => (content.sections[a]?.order ?? 99) - (content.sections[b]?.order ?? 99));
    const idx = sorted.indexOf(key);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === sorted.length - 1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const newSorted = [...sorted];
    [newSorted[idx], newSorted[swapIdx]] = [newSorted[swapIdx], newSorted[idx]];
    const newSections = { ...content.sections };
    newSorted.forEach((k, i) => { newSections[k] = { ...(newSections[k] || { visible: true }), order: i + 1 }; });
    setContent(c => ({ ...c, sections: newSections }));
    const orderMap: Record<string, number> = {};
    newSorted.forEach((k, i) => { orderMap[k] = i + 1; });
    try {
      await adminFetch('/api/admin?action=reorder-homepage-sections', {
        method: 'POST',
        body: JSON.stringify({ sections: orderMap }),
      });
    } catch {
      addToast('error', 'Failed to reorder sections.');
    }
  };

  // Featured dishes helpers
  const featuredIds = menuItems.filter(m => m.featured).map(m => m.id || m._id?.toString() || '');
  const toggleFeatured = async (item: MenuItem) => {
    const itemId = item.id || item._id?.toString() || '';
    const isFeatured = item.featured;
    if (!isFeatured && featuredIds.length >= 4) {
      addToast('error', 'Maximum 4 featured items allowed. Remove one before adding another.');
      return;
    }
    setMenuItems(prev => prev.map(m => {
      const mId = m.id || m._id?.toString() || '';
      return mId === itemId ? { ...m, featured: !isFeatured } : m;
    }));
    try {
      const token = localStorage.getItem('admin_jwt') || '';
      const res = await fetch('/api/menu?action=set-featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ itemId, featured: !isFeatured }),
      });
      const data = await res.json();
      if (!data.success && data.error) {
        addToast('error', data.error);
        setMenuItems(prev => prev.map(m => { const mId = m.id || m._id?.toString() || ''; return mId === itemId ? { ...m, featured: isFeatured } : m; }));
      } else {
        addToast('success', isFeatured ? 'Removed from featured' : 'Added to featured! ✓');
      }
    } catch {
      addToast('error', 'Failed to update featured status.');
      setMenuItems(prev => prev.map(m => { const mId = m.id || m._id?.toString() || ''; return mId === itemId ? { ...m, featured: isFeatured } : m; }));
    }
  };

  const sortedSections = [...SECTION_KEYS].sort((a, b) => (content.sections[a]?.order ?? 99) - (content.sections[b]?.order ?? 99));
  const filteredMenu = menuItems.filter(m => m.name?.toLowerCase().includes(menuSearch.toLowerCase()));
  const currentFeatured = menuItems.filter(m => m.featured);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
        <span className="ml-3 text-gray-500">Loading homepage content...</span>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Toast notifications */}
      <div className="hp-toast">
        {toasts.map(t => (
          <div key={t.id} className={`hp-toast-item hp-toast-${t.type}`}>
            {t.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {t.message}
          </div>
        ))}
      </div>

      <div style={{ fontFamily: "'Jost', sans-serif" }}>
        {/* Header */}
        <div className="mb-6">
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: '#0F0C08', margin: 0 }}>
            Home Page Manager
          </h1>
          <p style={{ fontSize: 13.5, color: '#9E8870', marginTop: 4 }}>
            Manage homepage content and section visibility — changes go live immediately after saving.
          </p>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }}>

          {/* ── LEFT: Section Manager ── */}
          <div style={{ background: 'white', border: '1px solid #EDE3D2', borderRadius: 16, padding: 20 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F0C08', marginBottom: 2 }}>Page Sections</div>
              <div style={{ fontSize: 12, color: '#9E8870' }}>Toggle on/off · drag to reorder</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sortedSections.map((key, idx) => (
                <div key={key} className="hp-sec-card">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginRight: 4 }}>
                    <button onClick={() => moveSection(key, 'up')} disabled={idx === 0} style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer', padding: '1px 4px', color: idx === 0 ? '#EDE3D2' : '#9E8870', lineHeight: 1 }}>
                      <ChevronUp size={13} />
                    </button>
                    <button onClick={() => moveSection(key, 'down')} disabled={idx === sortedSections.length - 1} style={{ background: 'none', border: 'none', cursor: idx === sortedSections.length - 1 ? 'default' : 'pointer', padding: '1px 4px', color: idx === sortedSections.length - 1 ? '#EDE3D2' : '#9E8870', lineHeight: 1 }}>
                      <ChevronDown size={13} />
                    </button>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: content.sections[key]?.visible !== false ? '#0F0C08' : '#9E8870' }}>
                      {SECTION_LABELS[key]}
                    </div>
                    <div style={{ fontSize: 11, color: '#9E8870', marginTop: 1 }}>
                      {content.sections[key]?.visible !== false ? 'Visible' : 'Hidden'}
                    </div>
                  </div>
                  <Toggle
                    checked={content.sections[key]?.visible !== false}
                    onChange={v => toggleSection(key, v)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Content Editor ── */}
          <div style={{ background: 'white', border: '1px solid #EDE3D2', borderRadius: 16, overflow: 'hidden' }}>
            {/* Tab bar */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #EDE3D2', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {TABS.map((tab, i) => (
                <button key={tab} className={`hp-tab ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>
                  {tab}
                </button>
              ))}
            </div>

            <div style={{ padding: 24 }}>
              {/* ── HERO TAB ── */}
              {activeTab === 0 && (
                <HeroEditor content={content} setContent={setContent} saving={saving} onSave={() => saveSection({ hero: content.hero })} />
              )}

              {/* ── TICKER TAB ── */}
              {activeTab === 1 && (
                <TickerEditor content={content} setContent={setContent} saving={saving} onSave={() => saveSection({ ticker: content.ticker })} />
              )}

              {/* ── FEATURED TAB ── */}
              {activeTab === 2 && (
                <FeaturedEditor
                  content={content} setContent={setContent} saving={saving}
                  menuItems={menuItems} filteredMenu={filteredMenu}
                  currentFeatured={currentFeatured} featuredIds={featuredIds}
                  menuSearch={menuSearch} setMenuSearch={setMenuSearch}
                  onToggleFeatured={toggleFeatured}
                  onSave={() => saveSection({ featuredSection: content.featuredSection })}
                />
              )}

              {/* ── WHY US TAB ── */}
              {activeTab === 3 && (
                <WhyUsEditor content={content} setContent={setContent} saving={saving} onSave={() => saveSection({ whyUs: content.whyUs })} />
              )}

              {/* ── TESTIMONIALS TAB ── */}
              {activeTab === 4 && (
                <TestimonialsEditor content={content} setContent={setContent} saving={saving} onSave={() => saveSection({ testimonials: content.testimonials })} />
              )}

              {/* ── CTA TAB ── */}
              {activeTab === 5 && (
                <CtaEditor content={content} setContent={setContent} saving={saving} onSave={() => saveSection({ cta: content.cta })} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Section Editors ──────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="hp-label">{label}</label>
      {children}
    </div>
  );
}

function HeroEditor({ content, setContent, saving, onSave }: { content: HomepageContent; setContent: React.Dispatch<React.SetStateAction<HomepageContent>>; saving: boolean; onSave: () => void }) {
  const h = content.hero;
  const set = (patch: Partial<typeof h>) => setContent(c => ({ ...c, hero: { ...c.hero, ...patch } }));
  const setStat = (i: number, patch: Partial<HeroStat>) => {
    const stats = [...h.stats];
    stats[i] = { ...stats[i], ...patch };
    set({ stats });
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#0F0C08', marginBottom: 4 }}>Hero Section</div>
      <Field label="Eyebrow text">
        <input className="hp-inp" value={h.eyebrow} onChange={e => set({ eyebrow: e.target.value })} />
      </Field>
      <Field label="Title Line 1">
        <input className="hp-inp" value={h.titleLine1} onChange={e => set({ titleLine1: e.target.value })} />
      </Field>
      <Field label="Title Line 2 (italic / gold)">
        <input className="hp-inp" value={h.titleLine2Italic} onChange={e => set({ titleLine2Italic: e.target.value })} />
      </Field>
      <Field label="Title Line 3 (bold)">
        <input className="hp-inp" value={h.titleLine3Bold} onChange={e => set({ titleLine3Bold: e.target.value })} />
      </Field>
      <Field label="Subtitle">
        <textarea className="hp-inp" rows={3} value={h.subtitle} onChange={e => set({ subtitle: e.target.value })} style={{ resize: 'vertical' }} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Button 1 text">
          <input className="hp-inp" value={h.button1Text} onChange={e => set({ button1Text: e.target.value })} />
        </Field>
        <Field label="Button 2 text">
          <input className="hp-inp" value={h.button2Text} onChange={e => set({ button2Text: e.target.value })} />
        </Field>
      </div>
      <div style={{ background: '#F9F4EC', borderRadius: 10, padding: 14 }}>
        <div className="hp-label" style={{ marginBottom: 10 }}>Stats (3 rows)</div>
        {h.stats.map((stat, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 1fr', gap: 8, marginBottom: 8 }}>
            <div>
              {i === 0 && <div className="hp-label" style={{ marginBottom: 3 }}>Number</div>}
              <input className="hp-inp" value={stat.number} onChange={e => setStat(i, { number: e.target.value })} placeholder="14" />
            </div>
            <div>
              {i === 0 && <div className="hp-label" style={{ marginBottom: 3 }}>Suffix</div>}
              <input className="hp-inp" value={stat.suffix} onChange={e => setStat(i, { suffix: e.target.value })} placeholder="+" />
            </div>
            <div>
              {i === 0 && <div className="hp-label" style={{ marginBottom: 3 }}>Label</div>}
              <input className="hp-inp" value={stat.label} onChange={e => setStat(i, { label: e.target.value })} placeholder="Years serving" />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Field label="Est. Year">
          <input className="hp-inp" value={h.estYear} onChange={e => set({ estYear: e.target.value })} placeholder="2010" />
        </Field>
        <Field label="Speed badge title">
          <input className="hp-inp" value={h.speedBadgeTitle} onChange={e => set({ speedBadgeTitle: e.target.value })} />
        </Field>
        <Field label="Speed badge subtitle">
          <input className="hp-inp" value={h.speedBadgeSubtitle} onChange={e => set({ speedBadgeSubtitle: e.target.value })} />
        </Field>
      </div>
      <div style={{ paddingTop: 8, borderTop: '1px solid #EDE3D2' }}>
        <button className="hp-save" disabled={saving} onClick={onSave}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save Hero
        </button>
      </div>
    </div>
  );
}

function TickerEditor({ content, setContent, saving, onSave }: { content: HomepageContent; setContent: React.Dispatch<React.SetStateAction<HomepageContent>>; saving: boolean; onSave: () => void }) {
  const items = content.ticker;
  const setItems = (next: string[]) => setContent(c => ({ ...c, ticker: next }));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#0F0C08', marginBottom: 4 }}>Ticker Items</div>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            className="hp-inp" value={item} style={{ flex: 1 }}
            onChange={e => { const n = [...items]; n[i] = e.target.value; setItems(n); }}
            placeholder="e.g. Fresh Ingredients Daily"
          />
          <button className="hp-del" onClick={() => setItems(items.filter((_, j) => j !== i))}>
            <X size={13} />
          </button>
        </div>
      ))}
      <button className="hp-add-btn" onClick={() => setItems([...items, ''])}>
        + Add Ticker Item
      </button>
      <div style={{ paddingTop: 8, borderTop: '1px solid #EDE3D2' }}>
        <button className="hp-save" disabled={saving} onClick={onSave}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save Ticker
        </button>
      </div>
    </div>
  );
}

function FeaturedEditor({ content, setContent, saving, menuItems, filteredMenu, currentFeatured, featuredIds, menuSearch, setMenuSearch, onToggleFeatured, onSave }: {
  content: HomepageContent; setContent: React.Dispatch<React.SetStateAction<HomepageContent>>;
  saving: boolean; menuItems: MenuItem[]; filteredMenu: MenuItem[]; currentFeatured: MenuItem[];
  featuredIds: string[]; menuSearch: string; setMenuSearch: (s: string) => void;
  onToggleFeatured: (item: MenuItem) => void; onSave: () => void;
}) {
  const fs = content.featuredSection;
  const set = (patch: Partial<typeof fs>) => setContent(c => ({ ...c, featuredSection: { ...c.featuredSection, ...patch } }));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#0F0C08' }}>Featured Dishes Section</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Eyebrow text">
          <input className="hp-inp" value={fs.eyebrow} onChange={e => set({ eyebrow: e.target.value })} />
        </Field>
        <Field label="'View all' button text">
          <input className="hp-inp" value={fs.viewAllText || 'View full menu →'} onChange={e => set({ viewAllText: e.target.value })} />
        </Field>
      </div>
      <Field label="Title Line 1">
        <input className="hp-inp" value={fs.titleLine1} onChange={e => set({ titleLine1: e.target.value })} />
      </Field>
      <Field label="Title Line 2 (italic)">
        <input className="hp-inp" value={fs.titleLine2Italic} onChange={e => set({ titleLine2Italic: e.target.value })} />
      </Field>

      <div style={{ paddingTop: 8, borderTop: '1px solid #EDE3D2' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0F0C08' }}>Select Featured Dishes</div>
            <div style={{ fontSize: 12, color: '#9E8870', marginTop: 2 }}>
              {featuredIds.length}/4 selected · Click star to toggle
            </div>
          </div>
          {featuredIds.length >= 4 && (
            <span style={{ background: 'rgba(184,133,58,0.1)', color: '#B8853A', border: '1px solid #DDD0BB', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
              Max 4 reached
            </span>
          )}
        </div>

        {/* Currently selected */}
        {currentFeatured.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div className="hp-label" style={{ marginBottom: 8 }}>Currently Featured</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {currentFeatured.map(item => {
                const itemId = item.id || item._id?.toString() || '';
                return (
                  <div key={itemId} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F9F4EC', border: '1px solid #EDE3D2', borderRadius: 10, padding: '8px 12px' }}>
                    {item.image && <img src={item.image} alt={item.name} style={{ width: 36, height: 36, borderRadius: 7, objectFit: 'cover', flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0F0C08' }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: '#9E8870' }}>${item.price?.toFixed(2)} · {item.category}</div>
                    </div>
                    <button onClick={() => onToggleFeatured(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B8853A', padding: 4 }}>
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Search + list */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9E8870' }} />
          <input
            className="hp-inp" value={menuSearch} onChange={e => setMenuSearch(e.target.value)}
            placeholder="Search menu items..." style={{ paddingLeft: 32 }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 300, overflowY: 'auto', paddingRight: 4 }}>
          {filteredMenu.length === 0 && (
            <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '24px 0', color: '#9E8870', fontSize: 13 }}>
              {menuItems.length === 0 ? 'No menu items found. Add items in Menu Items section.' : 'No results found.'}
            </div>
          )}
          {filteredMenu.map(item => {
            const itemId = item.id || item._id?.toString() || '';
            const isFeatured = item.featured;
            return (
              <div key={itemId} className={`hp-menu-card ${isFeatured ? 'selected' : ''}`} onClick={() => onToggleFeatured(item)}>
                {item.image ? (
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: 80, objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: 80, background: 'linear-gradient(145deg,#3D1C00,#8B4513)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🍛</div>
                )}
                <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0F0C08', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: '#9E8870' }}>${item.price?.toFixed(2)}</div>
                  </div>
                  <Star size={16} fill={isFeatured ? '#B8853A' : 'none'} stroke={isFeatured ? '#B8853A' : '#DDD0BB'} />
                </div>
              </div>
            );
          })}
        </div>
        <p style={{ fontSize: 11.5, color: '#9E8870', marginTop: 10 }}>
          💡 Featured items will display on the homepage with their uploaded photos.
        </p>
      </div>

      <div style={{ paddingTop: 8, borderTop: '1px solid #EDE3D2' }}>
        <button className="hp-save" disabled={saving} onClick={onSave}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save Featured
        </button>
      </div>
    </div>
  );
}

function WhyUsEditor({ content, setContent, saving, onSave }: { content: HomepageContent; setContent: React.Dispatch<React.SetStateAction<HomepageContent>>; saving: boolean; onSave: () => void }) {
  const w = content.whyUs;
  const set = (patch: Partial<typeof w>) => setContent(c => ({ ...c, whyUs: { ...c.whyUs, ...patch } }));
  const setFeature = (i: number, patch: Partial<WhyFeature>) => {
    const features = [...w.features];
    features[i] = { ...features[i], ...patch };
    set({ features });
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#0F0C08' }}>Why Golden Lotus Section</div>
      <Field label="Eyebrow text">
        <input className="hp-inp" value={w.eyebrow} onChange={e => set({ eyebrow: e.target.value })} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Title Line 1">
          <input className="hp-inp" value={w.titleLine1} onChange={e => set({ titleLine1: e.target.value })} />
        </Field>
        <Field label="Title Line 2 (italic)">
          <input className="hp-inp" value={w.titleLine2Italic} onChange={e => set({ titleLine2Italic: e.target.value })} />
        </Field>
      </div>
      <Field label="Description">
        <textarea className="hp-inp" rows={3} value={w.description} onChange={e => set({ description: e.target.value })} style={{ resize: 'vertical' }} />
      </Field>
      <div style={{ background: '#F9F4EC', borderRadius: 10, padding: 14 }}>
        <div className="hp-label" style={{ marginBottom: 10 }}>Feature Cards (4 fixed)</div>
        {w.features.map((f, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '56px 1fr 2fr', gap: 8, marginBottom: 12 }}>
            <div>
              {i === 0 && <div className="hp-label" style={{ marginBottom: 3 }}>Icon</div>}
              <input className="hp-inp" value={f.icon} onChange={e => setFeature(i, { icon: e.target.value })} placeholder="🌿" style={{ textAlign: 'center' }} />
            </div>
            <div>
              {i === 0 && <div className="hp-label" style={{ marginBottom: 3 }}>Title</div>}
              <input className="hp-inp" value={f.title} onChange={e => setFeature(i, { title: e.target.value })} />
            </div>
            <div>
              {i === 0 && <div className="hp-label" style={{ marginBottom: 3 }}>Description</div>}
              <input className="hp-inp" value={f.description} onChange={e => setFeature(i, { description: e.target.value })} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ paddingTop: 8, borderTop: '1px solid #EDE3D2' }}>
        <button className="hp-save" disabled={saving} onClick={onSave}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save Why Us
        </button>
      </div>
    </div>
  );
}

function TestimonialsEditor({ content, setContent, saving, onSave }: { content: HomepageContent; setContent: React.Dispatch<React.SetStateAction<HomepageContent>>; saving: boolean; onSave: () => void }) {
  const t = content.testimonials;
  const set = (patch: Partial<typeof t>) => setContent(c => ({ ...c, testimonials: { ...c.testimonials, ...patch } }));
  const setItem = (i: number, patch: Partial<TestimonialItem>) => {
    const items = [...t.items];
    items[i] = { ...items[i], ...patch };
    set({ items });
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#0F0C08' }}>Testimonials Section</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Field label="Eyebrow text">
          <input className="hp-inp" value={t.eyebrow} onChange={e => set({ eyebrow: e.target.value })} />
        </Field>
        <Field label="Title">
          <input className="hp-inp" value={t.title} onChange={e => set({ title: e.target.value })} />
        </Field>
        <Field label="Title italic part">
          <input className="hp-inp" value={t.titleItalic} onChange={e => set({ titleItalic: e.target.value })} />
        </Field>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {t.items.map((item, i) => (
          <div key={i} style={{ background: '#F9F4EC', border: '1px solid #EDE3D2', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0F0C08' }}>Testimonial {i + 1}</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6B5540', cursor: 'pointer' }}>
                  <input type="checkbox" checked={item.featured} onChange={e => setItem(i, { featured: e.target.checked })} style={{ accentColor: '#B8853A' }} />
                  Dark featured card
                </label>
                {t.items.length > 1 && (
                  <button className="hp-del" onClick={() => set({ items: t.items.filter((_, j) => j !== i) })}>
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <div>
                <label className="hp-label">Name</label>
                <input className="hp-inp" value={item.name} onChange={e => setItem(i, { name: e.target.value })} />
              </div>
              <div>
                <label className="hp-label">Role</label>
                <input className="hp-inp" value={item.role} onChange={e => setItem(i, { role: e.target.value })} />
              </div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label className="hp-label">Quote</label>
              <textarea className="hp-inp" rows={2} value={item.quote} onChange={e => setItem(i, { quote: e.target.value })} style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label className="hp-label">Rating</label>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <span key={star} className="hp-star" onClick={() => setItem(i, { rating: star })}>
                    {star <= item.rating ? '⭐' : '☆'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      {t.items.length < 6 && (
        <button className="hp-add-btn" onClick={() => set({ items: [...t.items, { name: '', role: '', quote: '', rating: 5, featured: false }] })}>
          + Add Testimonial
        </button>
      )}
      <div style={{ paddingTop: 8, borderTop: '1px solid #EDE3D2' }}>
        <button className="hp-save" disabled={saving} onClick={onSave}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save Testimonials
        </button>
      </div>
    </div>
  );
}

function CtaEditor({ content, setContent, saving, onSave }: { content: HomepageContent; setContent: React.Dispatch<React.SetStateAction<HomepageContent>>; saving: boolean; onSave: () => void }) {
  const c = content.cta;
  const set = (patch: Partial<typeof c>) => setContent(ct => ({ ...ct, cta: { ...ct.cta, ...patch } }));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#0F0C08' }}>Call to Action Section</div>
      <Field label="Eyebrow text">
        <input className="hp-inp" value={c.eyebrow} onChange={e => set({ eyebrow: e.target.value })} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Field label="Title before italic">
          <input className="hp-inp" value={c.titleLine1} onChange={e => set({ titleLine1: e.target.value })} placeholder="Experience" />
        </Field>
        <Field label="Title italic">
          <input className="hp-inp" value={c.titleItalic} onChange={e => set({ titleItalic: e.target.value })} placeholder="authentic" />
        </Field>
        <Field label="Title after italic">
          <input className="hp-inp" value={c.titleLine2} onChange={e => set({ titleLine2: e.target.value })} />
        </Field>
      </div>
      <Field label="Description">
        <textarea className="hp-inp" rows={3} value={c.description} onChange={e => set({ description: e.target.value })} style={{ resize: 'vertical' }} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Button 1 text">
          <input className="hp-inp" value={c.button1Text} onChange={e => set({ button1Text: e.target.value })} />
        </Field>
        <Field label="Button 2 text">
          <input className="hp-inp" value={c.button2Text} onChange={e => set({ button2Text: e.target.value })} />
        </Field>
      </div>
      <div style={{ paddingTop: 8, borderTop: '1px solid #EDE3D2' }}>
        <button className="hp-save" disabled={saving} onClick={onSave}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save CTA
        </button>
      </div>
    </div>
  );
}
