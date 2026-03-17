import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Save, CheckCircle, XCircle, GripVertical } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface HeroStat { number: string; suffix: string; label: string; }
interface WhyFeature { icon: string; title: string; description: string; }
interface TestimonialItem { name: string; role: string; quote: string; rating: number; featured: boolean; }
interface HomepageContent {
  hero: {
    eyebrow: string; titleLine1: string; titleLine2Italic: string; titleLine3Bold: string;
    subtitle: string; button1Text: string; button2Text: string; stats: HeroStat[];
    floatingCard: { label: string; dishName: string; subtitle: string; rating: string; };
    estYear: string; speedBadgeTitle: string; speedBadgeSubtitle: string;
  };
  ticker: string[];
  featuredSection: { eyebrow: string; titleLine1: string; titleLine2Italic: string; };
  whyUs: { eyebrow: string; titleLine1: string; titleLine2Italic: string; description: string; features: WhyFeature[]; };
  testimonials: { eyebrow: string; title: string; titleItalic: string; items: TestimonialItem[]; };
  cta: { eyebrow: string; titleLine1: string; titleItalic: string; titleLine2: string; description: string; button1Text: string; button2Text: string; };
  footer: { restaurantName: string; description: string; address: string; phone: string; email: string; copyright: string; };
}

interface MenuItem { id: string; name: string; price: number; category: string; image?: string; featured?: boolean; featuredOrder?: number; }
interface Toast { type: 'success' | 'error'; message: string; }

// ─── Default ─────────────────────────────────────────────────────────────────

const DEFAULT: HomepageContent = {
  hero: {
    eyebrow: 'Alexandria, Louisiana · Est. 2010', titleLine1: 'Taste the art of',
    titleLine2Italic: 'authentic Indian', titleLine3Bold: 'cuisine.',
    subtitle: 'Generations-old recipes, the finest spices, and a passion for flavors that transport you straight to the heart of India — one dish at a time.',
    button1Text: 'Order Online →', button2Text: 'View Our Menu',
    stats: [
      { number: '14', suffix: '+', label: 'Years serving' }, { number: '80', suffix: '+', label: 'Menu items' },
      { number: '4.9', suffix: '', label: 'Guest rating' }, { number: '3k', suffix: '+', label: 'Happy guests' },
    ],
    floatingCard: { label: "Chef's Signature", dishName: 'Butter Chicken', subtitle: 'Most ordered dish', rating: '5.0 · 248 reviews' },
    estYear: '2010', speedBadgeTitle: 'Ready in 15 min', speedBadgeSubtitle: 'Fast pickup available',
  },
  ticker: ['Authentic Indian Cuisine', 'Fresh Ingredients Daily', 'Online Ordering Available', 'Catering Services', 'Family Recipes Since 2010', 'Alexandria Louisiana', 'Pickup in 15 Minutes'],
  featuredSection: { eyebrow: 'Our Specialties', titleLine1: 'Dishes crafted with', titleLine2Italic: 'love & tradition' },
  whyUs: {
    eyebrow: 'Why Golden Lotus', titleLine1: 'A dining experience', titleLine2Italic: 'no other',
    description: 'From the first bite to the last, we pour our heritage into every dish — sourcing the finest spices, honoring generations-old recipes, and ensuring every visit is extraordinary.',
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
      { name: 'Sarah M.', role: 'Regular · Alexandria', quote: 'The butter chicken is absolutely divine. It tastes exactly like my grandmother used to make in Delhi. Truly authentic!', rating: 5, featured: false },
      { name: 'James R.', role: 'Food blogger · 5 visits', quote: 'Best Indian food in Louisiana, hands down. The biryani is incredible and the online ordering makes everything so effortless.', rating: 5, featured: true },
      { name: 'Amanda K.', role: 'Corporate client', quote: 'Hired Golden Lotus for our corporate event — 200 guests and every single person was blown away. Exceptional catering!', rating: 5, featured: false },
    ],
  },
  cta: {
    eyebrow: 'Ready to order?', titleLine1: 'Experience', titleItalic: 'authentic',
    titleLine2: 'flavors from the comfort of home',
    description: 'Order online and pick up your favorite dishes in just 15–20 minutes. Fresh, hot, and made with love every single time.',
    button1Text: 'Order Online Now →', button2Text: 'View Full Menu',
  },
  footer: {
    restaurantName: 'Golden Lotus',
    description: 'Experience the art of authentic Indian cuisine at Golden Lotus Grill. Located in Alexandria, Louisiana, serving the finest Indian food since 2010.',
    address: '1473 Dorchester Dr, Alexandria, LA 71301', phone: '(318) 445-5688',
    email: 'hello@goldenlotusgrill.com', copyright: '© 2026 Golden Lotus Indian Cuisine Inc.',
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const adminToken = () => localStorage.getItem('admin_jwt') || '';
const adminHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken()}` });

// ─── Shared UI Primitives ─────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#B8853A]/30 focus:border-[#B8853A] transition-colors';
const textareaCls = `${inputCls} resize-none`;

function SaveBar({ onSave, saving }: { onSave: () => void; saving: boolean }) {
  return (
    <div className="pt-6 border-t border-gray-100 mt-6">
      <button onClick={onSave} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#B8853A] text-white text-sm font-semibold rounded-lg hover:bg-[#C9963F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        <Save className="w-4 h-4" />
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

const TABS = ['Hero', 'Ticker', 'Featured Dishes', 'Why Us', 'Testimonials', 'CTA Section', 'Footer'];

export default function AdminHomePage() {
  const [tab, setTab] = useState(0);
  const [content, setContent] = useState<HomepageContent>(DEFAULT);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [newTestimonial, setNewTestimonial] = useState({ name: '', role: '', quote: '', rating: 5, featured: false });
  const [addingTestimonial, setAddingTestimonial] = useState(false);

  const showToast = useCallback((type: Toast['type'], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin?action=get-homepage').then(r => r.json()).catch(() => null),
      fetch('/api/menu?action=items').then(r => r.json()).catch(() => []),
    ]).then(([hpRes, menuRes]) => {
      if (hpRes?.success && hpRes.data) setContent(hpRes.data as HomepageContent);
      if (Array.isArray(menuRes)) setMenuItems(menuRes as MenuItem[]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin?action=save-homepage', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify(content),
      });
      const data = await res.json();
      if (data.success) showToast('success', 'Changes saved! Live on website immediately.');
      else showToast('error', data.error || 'Failed to save.');
    } catch {
      showToast('error', 'Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const setHero = (key: keyof HomepageContent['hero'], val: string) =>
    setContent(p => ({ ...p, hero: { ...p.hero, [key]: val } }));

  const setHeroStat = (i: number, key: keyof HeroStat, val: string) =>
    setContent(p => { const stats = [...p.hero.stats]; stats[i] = { ...stats[i], [key]: val }; return { ...p, hero: { ...p.hero, stats } }; });

  const setFloating = (key: keyof HomepageContent['hero']['floatingCard'], val: string) =>
    setContent(p => ({ ...p, hero: { ...p.hero, floatingCard: { ...p.hero.floatingCard, [key]: val } } }));

  const setTicker = (i: number, val: string) =>
    setContent(p => { const ticker = [...p.ticker]; ticker[i] = val; return { ...p, ticker }; });

  const addTicker = () => setContent(p => ({ ...p, ticker: [...p.ticker, 'New item'] }));
  const removeTicker = (i: number) => setContent(p => ({ ...p, ticker: p.ticker.filter((_, j) => j !== i) }));

  const setFeaturedSection = (key: keyof HomepageContent['featuredSection'], val: string) =>
    setContent(p => ({ ...p, featuredSection: { ...p.featuredSection, [key]: val } }));

  const setWhyUs = (key: keyof Omit<HomepageContent['whyUs'], 'features'>, val: string) =>
    setContent(p => ({ ...p, whyUs: { ...p.whyUs, [key]: val } }));

  const setFeature = (i: number, key: keyof WhyFeature, val: string) =>
    setContent(p => { const features = [...p.whyUs.features]; features[i] = { ...features[i], [key]: val }; return { ...p, whyUs: { ...p.whyUs, features } }; });

  const setTestimonialsHeader = (key: 'eyebrow' | 'title' | 'titleItalic', val: string) =>
    setContent(p => ({ ...p, testimonials: { ...p.testimonials, [key]: val } }));

  const updateTestimonial = (i: number, key: keyof TestimonialItem, val: string | number | boolean) =>
    setContent(p => { const items = [...p.testimonials.items]; items[i] = { ...items[i], [key]: val }; return { ...p, testimonials: { ...p.testimonials, items } }; });

  const removeTestimonial = (i: number) =>
    setContent(p => ({ ...p, testimonials: { ...p.testimonials, items: p.testimonials.items.filter((_, j) => j !== i) } }));

  const addTestimonial = () => {
    if (!newTestimonial.name.trim() || !newTestimonial.quote.trim()) return;
    setContent(p => ({ ...p, testimonials: { ...p.testimonials, items: [...p.testimonials.items, { ...newTestimonial }] } }));
    setNewTestimonial({ name: '', role: '', quote: '', rating: 5, featured: false });
    setAddingTestimonial(false);
  };

  const setCta = (key: keyof HomepageContent['cta'], val: string) =>
    setContent(p => ({ ...p, cta: { ...p.cta, [key]: val } }));

  const setFooter = (key: keyof HomepageContent['footer'], val: string) =>
    setContent(p => ({ ...p, footer: { ...p.footer, [key]: val } }));

  // Featured dishes — each toggle saves immediately to the menu item
  const toggleFeatured = async (item: MenuItem) => {
    const newFeatured = !item.featured;
    const featuredCount = menuItems.filter(m => m.featured).length;
    if (newFeatured && featuredCount >= 4) {
      showToast('error', 'Max 4 featured items allowed. Remove one first.');
      return;
    }
    setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, featured: newFeatured } : m));
    try {
      await fetch('/api/menu?action=edit', {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify({ id: item.id, featured: newFeatured }),
      });
    } catch {
      setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, featured: !newFeatured } : m));
      showToast('error', 'Failed to update. Please try again.');
    }
  };

  const setFeaturedOrder = async (item: MenuItem, order: number) => {
    setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, featuredOrder: order } : m));
    try {
      await fetch('/api/menu?action=edit', {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify({ id: item.id, featuredOrder: order }),
      });
    } catch {
      showToast('error', 'Failed to update order.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse p-2">
        {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-200 rounded-lg" />)}
      </div>
    );
  }

  const featuredItems = menuItems.filter(m => m.featured);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-white border-l-4 border-green-500 text-gray-800' : 'bg-white border-l-4 border-red-500 text-gray-800'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Home Page Editor</h1>
        <p className="text-sm text-gray-500 mt-1">Changes go live on the website immediately after saving.</p>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 flex-wrap mb-6 bg-gray-100 p-1 rounded-xl">
        {TABS.map((name, i) => (
          <button key={i} onClick={() => setTab(i)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === i ? 'bg-white text-[#B8853A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {name}
          </button>
        ))}
      </div>

      {/* ── TAB 0: HERO ───────────────────────────────────────────────── */}
      {tab === 0 && (
        <div className="bg-white rounded-2xl p-6 space-y-6">
          <h2 className="text-base font-semibold text-gray-800">Hero Section</h2>
          <Field label="Eyebrow text">
            <input className={inputCls} value={content.hero.eyebrow} onChange={e => setHero('eyebrow', e.target.value)} />
          </Field>
          <div className="grid grid-cols-1 gap-4">
            <Field label="Title Line 1 (plain)">
              <input className={inputCls} value={content.hero.titleLine1} onChange={e => setHero('titleLine1', e.target.value)} />
            </Field>
            <Field label="Title Line 2 (italic gold)">
              <input className={inputCls} value={content.hero.titleLine2Italic} onChange={e => setHero('titleLine2Italic', e.target.value)} />
            </Field>
            <Field label="Title Line 3 (bold)">
              <input className={inputCls} value={content.hero.titleLine3Bold} onChange={e => setHero('titleLine3Bold', e.target.value)} />
            </Field>
          </div>
          <Field label="Subtitle paragraph">
            <textarea className={textareaCls} rows={3} value={content.hero.subtitle} onChange={e => setHero('subtitle', e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Button 1 text">
              <input className={inputCls} value={content.hero.button1Text} onChange={e => setHero('button1Text', e.target.value)} />
            </Field>
            <Field label="Button 2 text">
              <input className={inputCls} value={content.hero.button2Text} onChange={e => setHero('button2Text', e.target.value)} />
            </Field>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Stats (4 items)</label>
            <div className="space-y-3">
              {content.hero.stats.map((stat, i) => (
                <div key={i} className="grid grid-cols-3 gap-3 items-center">
                  <Field label={`Stat ${i + 1} Number`}>
                    <input className={inputCls} value={stat.number} onChange={e => setHeroStat(i, 'number', e.target.value)} />
                  </Field>
                  <Field label="Suffix (e.g. +)">
                    <input className={inputCls} value={stat.suffix} onChange={e => setHeroStat(i, 'suffix', e.target.value)} />
                  </Field>
                  <Field label="Label">
                    <input className={inputCls} value={stat.label} onChange={e => setHeroStat(i, 'label', e.target.value)} />
                  </Field>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <label className="block text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Floating Dish Card</label>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Label (e.g. Chef's Signature)">
                <input className={inputCls} value={content.hero.floatingCard.label} onChange={e => setFloating('label', e.target.value)} />
              </Field>
              <Field label="Dish Name">
                <input className={inputCls} value={content.hero.floatingCard.dishName} onChange={e => setFloating('dishName', e.target.value)} />
              </Field>
              <Field label="Subtitle">
                <input className={inputCls} value={content.hero.floatingCard.subtitle} onChange={e => setFloating('subtitle', e.target.value)} />
              </Field>
              <Field label="Rating text (e.g. 5.0 · 248 reviews)">
                <input className={inputCls} value={content.hero.floatingCard.rating} onChange={e => setFloating('rating', e.target.value)} />
              </Field>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Est. Year">
              <input className={inputCls} value={content.hero.estYear} onChange={e => setHero('estYear', e.target.value)} />
            </Field>
            <Field label="Speed Badge Title">
              <input className={inputCls} value={content.hero.speedBadgeTitle} onChange={e => setHero('speedBadgeTitle', e.target.value)} />
            </Field>
            <Field label="Speed Badge Subtitle">
              <input className={inputCls} value={content.hero.speedBadgeSubtitle} onChange={e => setHero('speedBadgeSubtitle', e.target.value)} />
            </Field>
          </div>

          <SaveBar onSave={save} saving={saving} />
        </div>
      )}

      {/* ── TAB 1: TICKER ─────────────────────────────────────────────── */}
      {tab === 1 && (
        <div className="bg-white rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">Ticker / Marquee Items</h2>
            <button onClick={addTicker} className="inline-flex items-center gap-1.5 text-sm text-[#B8853A] font-medium hover:underline">
              <Plus className="w-4 h-4" /> Add item
            </button>
          </div>
          <p className="text-xs text-gray-400">Items scroll across the dark bar below the hero. Duplicated automatically for seamless loop.</p>
          <div className="space-y-2">
            {content.ticker.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
                <input className={`${inputCls} flex-1`} value={item} onChange={e => setTicker(i, e.target.value)} />
                <button onClick={() => removeTicker(i)} aria-label="Remove ticker item" className="p-1.5 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <SaveBar onSave={save} saving={saving} />
        </div>
      )}

      {/* ── TAB 2: FEATURED DISHES ────────────────────────────────────── */}
      {tab === 2 && (
        <div className="bg-white rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Featured Dishes</h2>
            <p className="text-xs text-gray-400 mt-1">Toggle which menu items appear in the homepage "Specialties" grid. Max 4 items. Changes save instantly.</p>
          </div>
          {featuredItems.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <span className="font-semibold">{featuredItems.length}/4 featured.</span>
              {featuredItems.length >= 4 && ' Remove one before adding more.'}
            </div>
          )}
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {menuItems.length === 0 && <p className="text-sm text-gray-400 py-8 text-center">No menu items found.</p>}
            {menuItems.map(item => (
              <div key={item.id} className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${item.featured ? 'border-[#B8853A]/40 bg-[#F2E4C8]/40' : 'border-gray-100 bg-gray-50'}`}>
                {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" loading="lazy" />}
                {!item.image && <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">🍽</div>}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{item.name}</div>
                  <div className="text-xs text-gray-400">{item.category} · ${Number(item.price).toFixed(2)}</div>
                </div>
                {item.featured && (
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs text-gray-500">Order</label>
                    <input
                      type="number" min={1} max={4}
                      value={item.featuredOrder ?? 1}
                      onChange={e => setFeaturedOrder(item, parseInt(e.target.value) || 1)}
                      className="w-14 px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#B8853A]"
                    />
                  </div>
                )}
                <button
                  onClick={() => toggleFeatured(item)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${item.featured ? 'bg-[#B8853A] text-white hover:bg-[#C9963F]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {item.featured ? '★ Featured' : '☆ Feature'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: WHY US ─────────────────────────────────────────────── */}
      {tab === 3 && (
        <div className="bg-white rounded-2xl p-6 space-y-6">
          <h2 className="text-base font-semibold text-gray-800">Why Us Section</h2>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Eyebrow">
              <input className={inputCls} value={content.whyUs.eyebrow} onChange={e => setWhyUs('eyebrow', e.target.value)} />
            </Field>
            <Field label="Title Line 1">
              <input className={inputCls} value={content.whyUs.titleLine1} onChange={e => setWhyUs('titleLine1', e.target.value)} />
            </Field>
            <Field label="Title italic part (after 'like')">
              <input className={inputCls} value={content.whyUs.titleLine2Italic} onChange={e => setWhyUs('titleLine2Italic', e.target.value)} />
            </Field>
          </div>
          <Field label="Description paragraph">
            <textarea className={textareaCls} rows={3} value={content.whyUs.description} onChange={e => setWhyUs('description', e.target.value)} />
          </Field>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Feature Cards (4)</label>
            <div className="grid grid-cols-2 gap-4">
              {content.whyUs.features.map((f, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
                  <div className="flex gap-3">
                    <Field label="Icon (emoji)">
                      <input className={`${inputCls} w-20 text-center text-lg`} value={f.icon} onChange={e => setFeature(i, 'icon', e.target.value)} maxLength={4} />
                    </Field>
                    <div className="flex-1">
                      <Field label="Title">
                        <input className={inputCls} value={f.title} onChange={e => setFeature(i, 'title', e.target.value)} />
                      </Field>
                    </div>
                  </div>
                  <Field label="Description">
                    <input className={inputCls} value={f.description} onChange={e => setFeature(i, 'description', e.target.value)} />
                  </Field>
                </div>
              ))}
            </div>
          </div>

          {/* Also edit the featured section header here */}
          <div className="border-t pt-6">
            <label className="block text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Featured Dishes Section Header</label>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Eyebrow">
                <input className={inputCls} value={content.featuredSection.eyebrow} onChange={e => setFeaturedSection('eyebrow', e.target.value)} />
              </Field>
              <Field label="Title Line 1">
                <input className={inputCls} value={content.featuredSection.titleLine1} onChange={e => setFeaturedSection('titleLine1', e.target.value)} />
              </Field>
              <Field label="Title Line 2 (italic)">
                <input className={inputCls} value={content.featuredSection.titleLine2Italic} onChange={e => setFeaturedSection('titleLine2Italic', e.target.value)} />
              </Field>
            </div>
          </div>

          <SaveBar onSave={save} saving={saving} />
        </div>
      )}

      {/* ── TAB 4: TESTIMONIALS ───────────────────────────────────────── */}
      {tab === 4 && (
        <div className="bg-white rounded-2xl p-6 space-y-6">
          <h2 className="text-base font-semibold text-gray-800">Testimonials</h2>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Eyebrow">
              <input className={inputCls} value={content.testimonials.eyebrow} onChange={e => setTestimonialsHeader('eyebrow', e.target.value)} />
            </Field>
            <Field label="Title">
              <input className={inputCls} value={content.testimonials.title} onChange={e => setTestimonialsHeader('title', e.target.value)} />
            </Field>
            <Field label="Title italic part">
              <input className={inputCls} value={content.testimonials.titleItalic} onChange={e => setTestimonialsHeader('titleItalic', e.target.value)} />
            </Field>
          </div>

          <div className="space-y-4">
            {content.testimonials.items.map((t, i) => (
              <div key={i} className={`border rounded-xl p-4 space-y-3 ${t.featured ? 'border-[#B8853A]/40 bg-[#F2E4C8]/20' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">Testimonial {i + 1}</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                      <input type="checkbox" checked={t.featured} onChange={e => updateTestimonial(i, 'featured', e.target.checked)} className="accent-[#B8853A]" />
                      Dark card (featured)
                    </label>
                    <button onClick={() => removeTestimonial(i)} aria-label="Remove testimonial" className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Name">
                    <input className={inputCls} value={t.name} onChange={e => updateTestimonial(i, 'name', e.target.value)} />
                  </Field>
                  <Field label="Role / Location">
                    <input className={inputCls} value={t.role} onChange={e => updateTestimonial(i, 'role', e.target.value)} />
                  </Field>
                </div>
                <Field label="Quote">
                  <textarea className={textareaCls} rows={3} value={t.quote} onChange={e => updateTestimonial(i, 'quote', e.target.value)} />
                </Field>
                <Field label="Rating (1–5)">
                  <input type="number" min={1} max={5} className={`${inputCls} w-24`} value={t.rating} onChange={e => updateTestimonial(i, 'rating', parseInt(e.target.value) || 5)} />
                </Field>
              </div>
            ))}
          </div>

          {/* Add testimonial */}
          {!addingTestimonial ? (
            <button onClick={() => setAddingTestimonial(true)} className="inline-flex items-center gap-2 text-sm text-[#B8853A] font-medium hover:underline">
              <Plus className="w-4 h-4" /> Add testimonial
            </button>
          ) : (
            <div className="border border-[#B8853A]/30 rounded-xl p-4 space-y-3 bg-[#F9F4EC]">
              <span className="text-xs font-semibold text-gray-600">New Testimonial</span>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name *">
                  <input className={inputCls} value={newTestimonial.name} onChange={e => setNewTestimonial(p => ({ ...p, name: e.target.value }))} placeholder="Sarah M." />
                </Field>
                <Field label="Role">
                  <input className={inputCls} value={newTestimonial.role} onChange={e => setNewTestimonial(p => ({ ...p, role: e.target.value }))} placeholder="Regular · Alexandria" />
                </Field>
              </div>
              <Field label="Quote *">
                <textarea className={textareaCls} rows={3} value={newTestimonial.quote} onChange={e => setNewTestimonial(p => ({ ...p, quote: e.target.value }))} placeholder="Write their review…" />
              </Field>
              <div className="flex items-center gap-4">
                <Field label="Rating">
                  <input type="number" min={1} max={5} className={`${inputCls} w-20`} value={newTestimonial.rating} onChange={e => setNewTestimonial(p => ({ ...p, rating: parseInt(e.target.value) || 5 }))} />
                </Field>
                <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer mt-4">
                  <input type="checkbox" checked={newTestimonial.featured} onChange={e => setNewTestimonial(p => ({ ...p, featured: e.target.checked }))} className="accent-[#B8853A]" />
                  Dark card
                </label>
              </div>
              <div className="flex gap-3">
                <button onClick={addTestimonial} className="px-4 py-2 bg-[#B8853A] text-white text-sm font-semibold rounded-lg hover:bg-[#C9963F] transition-colors">Add</button>
                <button onClick={() => setAddingTestimonial(false)} className="px-4 py-2 text-gray-500 text-sm hover:text-gray-700">Cancel</button>
              </div>
            </div>
          )}

          <SaveBar onSave={save} saving={saving} />
        </div>
      )}

      {/* ── TAB 5: CTA ────────────────────────────────────────────────── */}
      {tab === 5 && (
        <div className="bg-white rounded-2xl p-6 space-y-6">
          <h2 className="text-base font-semibold text-gray-800">Call-to-Action Section</h2>
          <Field label="Eyebrow">
            <input className={inputCls} value={content.cta.eyebrow} onChange={e => setCta('eyebrow', e.target.value)} />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label='Title part 1 (e.g. "Experience")'>
              <input className={inputCls} value={content.cta.titleLine1} onChange={e => setCta('titleLine1', e.target.value)} />
            </Field>
            <Field label='Italic word (e.g. "authentic")'>
              <input className={inputCls} value={content.cta.titleItalic} onChange={e => setCta('titleItalic', e.target.value)} />
            </Field>
            <Field label='Title part 3 (after italic)'>
              <input className={inputCls} value={content.cta.titleLine2} onChange={e => setCta('titleLine2', e.target.value)} />
            </Field>
          </div>
          <Field label="Description">
            <textarea className={textareaCls} rows={3} value={content.cta.description} onChange={e => setCta('description', e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Button 1 text (dark)">
              <input className={inputCls} value={content.cta.button1Text} onChange={e => setCta('button1Text', e.target.value)} />
            </Field>
            <Field label="Button 2 text (ghost)">
              <input className={inputCls} value={content.cta.button2Text} onChange={e => setCta('button2Text', e.target.value)} />
            </Field>
          </div>
          <SaveBar onSave={save} saving={saving} />
        </div>
      )}

      {/* ── TAB 6: FOOTER ─────────────────────────────────────────────── */}
      {tab === 6 && (
        <div className="bg-white rounded-2xl p-6 space-y-6">
          <h2 className="text-base font-semibold text-gray-800">Footer Info</h2>
          <p className="text-xs text-gray-400">This stores the footer contact info and description shown on the website footer.</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Restaurant Name">
              <input className={inputCls} value={content.footer.restaurantName} onChange={e => setFooter('restaurantName', e.target.value)} />
            </Field>
            <Field label="Copyright text">
              <input className={inputCls} value={content.footer.copyright} onChange={e => setFooter('copyright', e.target.value)} />
            </Field>
          </div>
          <Field label="Description">
            <textarea className={textareaCls} rows={3} value={content.footer.description} onChange={e => setFooter('description', e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Address">
              <input className={inputCls} value={content.footer.address} onChange={e => setFooter('address', e.target.value)} />
            </Field>
            <Field label="Phone">
              <input className={inputCls} value={content.footer.phone} onChange={e => setFooter('phone', e.target.value)} />
            </Field>
          </div>
          <Field label="Email">
            <input className={`${inputCls} max-w-sm`} type="email" value={content.footer.email} onChange={e => setFooter('email', e.target.value)} />
          </Field>
          <SaveBar onSave={save} saving={saving} />
        </div>
      )}
    </div>
  );
}
