import { useEffect, useState, useCallback, useRef } from 'react';
import { Save, Plus, Trash2, X, CheckCircle, AlertCircle, Loader2, Eye } from 'lucide-react';
import { adminFetch } from '@/lib/adminFetch';

// ─── Types ─────────────────────────────────────────────────────────────────

interface ContactContent {
  hero: { eyebrow: string; title: string; titleItalic: string; subtitle: string; };
  info: { address: string; phone: string; email: string; mapEmbedUrl: string; };
  hours: Array<{ day: string; open: string; close: string; closed: boolean; }>;
  social: { instagram: string; facebook: string; twitter: string; tiktok: string; };
  sections: Record<string, { visible: boolean }>;
}

interface StoryContent {
  hero: { eyebrow: string; title: string; titleItalic: string; subtitle: string; heroImage: string; };
  founding: { eyebrow: string; title: string; titleItalic: string; story: string; image: string; imageCaption: string; };
  timeline: { eyebrow: string; title: string; titleItalic: string; items: Array<{ year: string; title: string; description: string; }>; };
  values: { eyebrow: string; title: string; titleItalic: string; items: Array<{ icon: string; title: string; description: string; }>; };
  team: { eyebrow: string; title: string; titleItalic: string; members: Array<{ name: string; role: string; bio: string; image: string; }>; };
  gallery: { eyebrow: string; title: string; titleItalic: string; images: string[]; };
  cta: { title: string; titleItalic: string; description: string; buttonText: string; button2Text: string; };
  sections: Record<string, { visible: boolean }>;
}

interface LegalContent { title: string; subtitle: string; lastUpdated: string; content: string; }
interface ToastMsg { id: number; type: 'success' | 'error'; message: string; }

// ─── Defaults ──────────────────────────────────────────────────────────────

const DEFAULT_CONTACT: ContactContent = {
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

const DEFAULT_STORY: StoryContent = {
  hero: { eyebrow: 'Our Story', title: 'A journey of', titleItalic: 'flavors & passion', subtitle: "From a small dream to Alexandria's favorite Indian restaurant", heroImage: '' },
  founding: { eyebrow: 'How It All Started', title: 'Born from a', titleItalic: 'love of cooking', story: 'Our story began in 2010...', image: '', imageCaption: '' },
  timeline: { eyebrow: 'Our Journey', title: 'Milestones that', titleItalic: 'shaped us', items: [{ year: '2010', title: 'Grand Opening', description: 'Golden Lotus opens its doors' }] },
  values: { eyebrow: 'What We Stand For', title: 'Our core', titleItalic: 'values', items: [{ icon: '🌿', title: 'Fresh Always', description: 'Every ingredient sourced fresh daily.' }, { icon: '❤️', title: 'Made with Love', description: 'Every dish prepared with care.' }, { icon: '🌍', title: 'Authentic Roots', description: 'Recipes passed down generations.' }, { icon: '🤝', title: 'Community First', description: 'Proud to serve Alexandria.' }] },
  team: { eyebrow: 'Meet The Team', title: 'The people behind', titleItalic: 'every dish', members: [{ name: 'Head Chef', role: 'Head Chef & Founder', bio: 'Bio here...', image: '' }] },
  gallery: { eyebrow: 'Our Kitchen', title: 'A glimpse', titleItalic: 'inside', images: [] },
  cta: { title: 'Come taste the', titleItalic: 'difference', description: 'Experience the flavors.', buttonText: 'Order Online →', button2Text: 'View Our Menu' },
  sections: { hero: { visible: true }, founding: { visible: true }, timeline: { visible: true }, values: { visible: true }, team: { visible: true }, gallery: { visible: true }, cta: { visible: true } },
};

const DEFAULT_PRIVACY: LegalContent = { title: 'Privacy Policy', subtitle: 'Your privacy matters to us', lastUpdated: '2026-03-19', content: '' };
const DEFAULT_TERMS: LegalContent = { title: 'Terms of Service', subtitle: 'Please read these terms carefully', lastUpdated: '2026-03-19', content: '' };

// ─── CSS ───────────────────────────────────────────────────────────────────

const CSS = `
  .pm-tab { padding: 9px 20px; border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; border: none; font-family: 'Jost', sans-serif; white-space: nowrap; }
  .pm-tab.active { background: #1E1810; color: white; }
  .pm-tab:not(.active) { background: #F0E8D8; color: #6B5540; }
  .pm-tab:not(.active):hover { background: #EDE3D2; color: #0F0C08; }
  .pm-inp { width: 100%; border: 1.5px solid #EDE3D2; border-radius: 8px; padding: 9px 12px; font-size: 13.5px; font-family: 'Jost', sans-serif; color: #0F0C08; background: #F9F4EC; outline: none; transition: all 0.2s; box-sizing: border-box; }
  .pm-inp:focus { border-color: #B8853A; background: white; box-shadow: 0 0 0 3px rgba(184,133,58,0.1); }
  .pm-label { display: block; font-size: 11.5px; font-weight: 600; color: #6B5540; margin-bottom: 4px; }
  .pm-save { background: #B8853A; color: white; border: none; border-radius: 10px; padding: 10px 20px; font-size: 13.5px; font-weight: 600; cursor: pointer; font-family: 'Jost', sans-serif; display: inline-flex; align-items: center; gap: 7px; transition: all 0.2s; }
  .pm-save:hover { background: #1E1810; }
  .pm-save:disabled { opacity: 0.6; cursor: not-allowed; }
  .pm-del { background: none; border: 1px solid #EDE3D2; border-radius: 8px; padding: 6px 10px; color: #9E8870; cursor: pointer; font-size: 12px; transition: all 0.2s; }
  .pm-del:hover { border-color: #C53A3A; color: #C53A3A; background: rgba(197,58,58,0.05); }
  .pm-add-btn { background: white; border: 1.5px dashed #DDD0BB; border-radius: 8px; padding: 9px; color: #9E8870; cursor: pointer; font-size: 13px; font-family: 'Jost', sans-serif; width: 100%; transition: all 0.2s; }
  .pm-add-btn:hover { border-color: #B8853A; color: #B8853A; }
  .pm-toggle { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
  .pm-toggle input { opacity: 0; width: 0; height: 0; }
  .pm-slider { position: absolute; inset: 0; border-radius: 12px; background: #DDD0BB; cursor: pointer; transition: 0.3s; }
  .pm-slider::before { content: ''; position: absolute; height: 18px; width: 18px; left: 3px; bottom: 3px; border-radius: 50%; background: white; transition: 0.3s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
  input:checked + .pm-slider { background: #B8853A; }
  input:checked + .pm-slider::before { transform: translateX(20px); }
  .pm-sec-card { background: white; border: 1px solid #EDE3D2; border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
  .pm-sub-tab { padding: 7px 14px; border-radius: 8px; font-size: 12px; font-weight: 500; cursor: pointer; border: none; font-family: 'Jost', sans-serif; transition: all 0.2s; white-space: nowrap; }
  .pm-sub-tab.active { background: #F2E4C8; color: #B8853A; border: 1px solid #DDD0BB; }
  .pm-sub-tab:not(.active) { background: none; color: #9E8870; border: 1px solid transparent; }
  .pm-sub-tab:not(.active):hover { background: #F9F4EC; color: #6B5540; }
  .pm-toast { position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; }
  .pm-toast-item { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-radius: 10px; font-size: 13.5px; font-weight: 500; font-family: 'Jost', sans-serif; box-shadow: 0 8px 24px rgba(0,0,0,0.12); animation: pm-toast-in 0.3s ease; }
  @keyframes pm-toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .pm-toast-success { background: #1E1810; color: white; }
  .pm-toast-error { background: #C53A3A; color: white; }
`;

// ─── Toggle ─────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="pm-toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="pm-slider" />
    </label>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="pm-label">{label}</label>{children}</div>;
}

// ─── Main ───────────────────────────────────────────────────────────────────

const PAGE_TABS = ['Contact', 'Our Story', 'Privacy', 'Terms'];

export default function AdminPagesManager() {
  const [pageTab, setPageTab] = useState(0);
  const [contactContent, setContactContent] = useState<ContactContent>(DEFAULT_CONTACT);
  const [storyContent, setStoryContent] = useState<StoryContent>(DEFAULT_STORY);
  const [privacyContent, setPrivacyContent] = useState<LegalContent>(DEFAULT_PRIVACY);
  const [termsContent, setTermsContent] = useState<LegalContent>(DEFAULT_TERMS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const toastId = useRef(0);

  const addToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = ++toastId.current;
    setToasts(t => [...t, { id, type, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  useEffect(() => {
    Promise.all([
      adminFetch('/api/admin?action=get-page-content&page=contact').then(r => r.json()).catch(() => null),
      adminFetch('/api/admin?action=get-page-content&page=story').then(r => r.json()).catch(() => null),
      adminFetch('/api/admin?action=get-page-content&page=privacy').then(r => r.json()).catch(() => null),
      adminFetch('/api/admin?action=get-page-content&page=terms').then(r => r.json()).catch(() => null),
    ]).then(([c, s, p, t]) => {
      if (c?.success && c.data) setContactContent(ct => ({ ...ct, ...c.data }));
      if (s?.success && s.data) setStoryContent(sc => ({ ...sc, ...s.data }));
      if (p?.success && p.data) setPrivacyContent(pc => ({ ...pc, ...p.data }));
      if (t?.success && t.data) setTermsContent(tc => ({ ...tc, ...t.data }));
      setLoading(false);
    });
  }, []);

  const savePage = async (page: string, data: object) => {
    setSaving(true);
    try {
      const res = await adminFetch('/api/admin?action=save-page-content', {
        method: 'POST',
        body: JSON.stringify({ page, ...data }),
      });
      const json = await res.json();
      if (json.success) addToast('success', 'Saved! Changes are live ✓');
      else addToast('error', json.error || 'Failed to save.');
    } catch {
      addToast('error', 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = async (page: string, sectionKey: string, visible: boolean) => {
    try {
      await adminFetch('/api/admin?action=toggle-page-section', {
        method: 'POST',
        body: JSON.stringify({ page, sectionKey, visible }),
      });
      addToast('success', `Section ${visible ? 'shown' : 'hidden'}`);
    } catch {
      addToast('error', 'Failed to toggle section.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
        <span className="ml-3 text-gray-500">Loading pages content...</span>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Toasts */}
      <div className="pm-toast">
        {toasts.map(t => (
          <div key={t.id} className={`pm-toast-item pm-toast-${t.type}`}>
            {t.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {t.message}
          </div>
        ))}
      </div>

      <div style={{ fontFamily: "'Jost', sans-serif" }}>
        {/* Header */}
        <div className="mb-6">
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, color: '#0F0C08', margin: 0 }}>Pages Manager</h1>
          <p style={{ fontSize: 13.5, color: '#9E8870', marginTop: 4 }}>Edit content for all public pages — changes go live immediately after saving.</p>
        </div>

        {/* Page selector tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, padding: '16px 0', borderBottom: '1px solid #EDE3D2', flexWrap: 'wrap' }}>
          {PAGE_TABS.map((tab, i) => (
            <button key={tab} className={`pm-tab ${pageTab === i ? 'active' : ''}`} onClick={() => setPageTab(i)}>
              {tab}
            </button>
          ))}
          <a href={['contact', 'story', 'privacy', 'terms'][pageTab] === 'contact' ? '/contact' : `/${['contact', 'story', 'privacy', 'terms'][pageTab]}`} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#B8853A', fontWeight: 600, textDecoration: 'none', padding: '8px 14px', border: '1.5px solid #DDD0BB', borderRadius: 20 }}>
            <Eye size={13} /> Preview page
          </a>
        </div>

        {/* Contact */}
        {pageTab === 0 && (
          <ContactEditor content={contactContent} setContent={setContactContent} saving={saving} onSave={(_section, data) => { const merged = { ...contactContent, ...data }; setContactContent(merged); savePage('contact', merged); }} onToggle={(key, v) => { setContactContent(c => ({ ...c, sections: { ...c.sections, [key]: { visible: v } } })); toggleSection('contact', key, v); }} />
        )}

        {/* Story */}
        {pageTab === 1 && (
          <StoryEditor content={storyContent} setContent={setStoryContent} saving={saving} onSave={(_section, data) => { const merged = { ...storyContent, ...data }; setStoryContent(merged); savePage('story', merged); }} onToggle={(key, v) => { setStoryContent(c => ({ ...c, sections: { ...c.sections, [key]: { visible: v } } })); toggleSection('story', key, v); }} />
        )}

        {/* Privacy */}
        {pageTab === 2 && (
          <LegalEditor content={privacyContent} setContent={setPrivacyContent} saving={saving} pageKey="privacy" onSave={data => { setPrivacyContent(data); savePage('privacy', data); }} />
        )}

        {/* Terms */}
        {pageTab === 3 && (
          <LegalEditor content={termsContent} setContent={setTermsContent} saving={saving} pageKey="terms" onSave={data => { setTermsContent(data); savePage('terms', data); }} />
        )}
      </div>
    </>
  );
}

// ─── Contact Editor ─────────────────────────────────────────────────────────

const CONTACT_SECTIONS = [
  { key: 'hero', label: 'Hero Section' },
  { key: 'form', label: 'Contact Form' },
  { key: 'map', label: 'Location Map' },
  { key: 'hours', label: 'Opening Hours' },
  { key: 'social', label: 'Social Media' },
];

const CONTACT_SUBTABS = ['Hero', 'Contact Info', 'Hours', 'Social'];

function ContactEditor({ content, setContent, saving, onSave, onToggle }: {
  content: ContactContent; setContent: React.Dispatch<React.SetStateAction<ContactContent>>;
  saving: boolean; onSave: (_section: string, data: object) => void; onToggle: (key: string, v: boolean) => void;
}) {
  const [subTab, setSubTab] = useState(0);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24, alignItems: 'start' }}>
      {/* Section Visibility */}
      <div style={{ background: 'white', border: '1px solid #EDE3D2', borderRadius: 16, padding: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0F0C08', marginBottom: 12 }}>Section Visibility</div>
        {CONTACT_SECTIONS.map(s => (
          <div key={s.key} className="pm-sec-card">
            <div style={{ flex: 1, fontSize: 13, color: '#0F0C08', fontWeight: 500 }}>{s.label}</div>
            <Toggle checked={content.sections[s.key]?.visible !== false} onChange={v => onToggle(s.key, v)} />
          </div>
        ))}
      </div>

      {/* Content Editor */}
      <div style={{ background: 'white', border: '1px solid #EDE3D2', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #EDE3D2', display: 'flex', gap: 6 }}>
          {CONTACT_SUBTABS.map((t, i) => (
            <button key={t} className={`pm-sub-tab ${subTab === i ? 'active' : ''}`} onClick={() => setSubTab(i)}>{t}</button>
          ))}
        </div>
        <div style={{ padding: 24 }}>
          {subTab === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F0C08' }}>Hero Section</div>
              <Field label="Eyebrow"><input className="pm-inp" value={content.hero.eyebrow} onChange={e => setContent(c => ({ ...c, hero: { ...c.hero, eyebrow: e.target.value } }))} /></Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Title"><input className="pm-inp" value={content.hero.title} onChange={e => setContent(c => ({ ...c, hero: { ...c.hero, title: e.target.value } }))} /></Field>
                <Field label="Title italic (gold)"><input className="pm-inp" value={content.hero.titleItalic} onChange={e => setContent(c => ({ ...c, hero: { ...c.hero, titleItalic: e.target.value } }))} /></Field>
              </div>
              <Field label="Subtitle"><textarea className="pm-inp" rows={2} value={content.hero.subtitle} onChange={e => setContent(c => ({ ...c, hero: { ...c.hero, subtitle: e.target.value } }))} style={{ resize: 'vertical' }} /></Field>
              <button className="pm-save" disabled={saving} onClick={() => onSave('hero', { hero: content.hero })}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Hero
              </button>
            </div>
          )}
          {subTab === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F0C08' }}>Contact Info</div>
              <Field label="Address"><input className="pm-inp" value={content.info.address} onChange={e => setContent(c => ({ ...c, info: { ...c.info, address: e.target.value } }))} /></Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Phone"><input className="pm-inp" value={content.info.phone} onChange={e => setContent(c => ({ ...c, info: { ...c.info, phone: e.target.value } }))} /></Field>
                <Field label="Email"><input className="pm-inp" value={content.info.email} onChange={e => setContent(c => ({ ...c, info: { ...c.info, email: e.target.value } }))} /></Field>
              </div>
              <Field label="Google Maps Embed URL">
                <input className="pm-inp" value={content.info.mapEmbedUrl} onChange={e => setContent(c => ({ ...c, info: { ...c.info, mapEmbedUrl: e.target.value } }))} placeholder="https://maps.google.com/maps?..." />
                <div style={{ fontSize: 11, color: '#9E8870', marginTop: 4 }}>Paste the src URL from a Google Maps embed iframe.</div>
              </Field>
              {content.info.mapEmbedUrl && (
                <iframe src={content.info.mapEmbedUrl} width="100%" height="180" style={{ border: 0, borderRadius: 10, display: 'block' }} title="Map preview" />
              )}
              <button className="pm-save" disabled={saving} onClick={() => onSave('info', { info: content.info })}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Contact Info
              </button>
            </div>
          )}
          {subTab === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F0C08', marginBottom: 4 }}>Opening Hours</div>
              {content.hours.map((h, i) => (
                <div key={h.day} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr 80px', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#0F0C08' }}>{h.day}</span>
                  <input className="pm-inp" value={h.open} disabled={h.closed} onChange={e => { const hs = [...content.hours]; hs[i] = { ...hs[i], open: e.target.value }; setContent(c => ({ ...c, hours: hs })); }} placeholder="11:00 AM" />
                  <input className="pm-inp" value={h.close} disabled={h.closed} onChange={e => { const hs = [...content.hours]; hs[i] = { ...hs[i], close: e.target.value }; setContent(c => ({ ...c, hours: hs })); }} placeholder="10:00 PM" />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6B5540', cursor: 'pointer' }}>
                    <input type="checkbox" checked={h.closed} onChange={e => { const hs = [...content.hours]; hs[i] = { ...hs[i], closed: e.target.checked }; setContent(c => ({ ...c, hours: hs })); }} style={{ accentColor: '#C53A3A' }} />
                    Closed
                  </label>
                </div>
              ))}
              <button className="pm-save" disabled={saving} style={{ marginTop: 8 }} onClick={() => onSave('hours', { hours: content.hours })}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Hours
              </button>
            </div>
          )}
          {subTab === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F0C08' }}>Social Media URLs</div>
              <Field label="Instagram URL"><input className="pm-inp" value={content.social.instagram} onChange={e => setContent(c => ({ ...c, social: { ...c.social, instagram: e.target.value } }))} placeholder="https://instagram.com/..." /></Field>
              <Field label="Facebook URL"><input className="pm-inp" value={content.social.facebook} onChange={e => setContent(c => ({ ...c, social: { ...c.social, facebook: e.target.value } }))} placeholder="https://facebook.com/..." /></Field>
              <Field label="Twitter / X URL"><input className="pm-inp" value={content.social.twitter} onChange={e => setContent(c => ({ ...c, social: { ...c.social, twitter: e.target.value } }))} placeholder="https://x.com/..." /></Field>
              <Field label="TikTok URL"><input className="pm-inp" value={content.social.tiktok} onChange={e => setContent(c => ({ ...c, social: { ...c.social, tiktok: e.target.value } }))} placeholder="https://tiktok.com/@..." /></Field>
              <div style={{ fontSize: 11.5, color: '#9E8870' }}>Leave blank to hide that social icon on the contact page.</div>
              <button className="pm-save" disabled={saving} onClick={() => onSave('social', { social: content.social })}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Social
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Story Editor ───────────────────────────────────────────────────────────

const STORY_SECTIONS = [
  { key: 'hero', label: 'Hero Banner' },
  { key: 'founding', label: 'Founding Story' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'values', label: 'Values' },
  { key: 'team', label: 'Team' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'cta', label: 'CTA' },
];

const STORY_SUBTABS = ['Hero', 'Founding', 'Timeline', 'Values', 'Team', 'CTA'];

function StoryEditor({ content, setContent, saving, onSave, onToggle }: {
  content: StoryContent; setContent: React.Dispatch<React.SetStateAction<StoryContent>>;
  saving: boolean; onSave: (_section: string, data: object) => void; onToggle: (key: string, v: boolean) => void;
}) {
  const [subTab, setSubTab] = useState(0);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24, alignItems: 'start' }}>
      {/* Section Visibility */}
      <div style={{ background: 'white', border: '1px solid #EDE3D2', borderRadius: 16, padding: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0F0C08', marginBottom: 12 }}>Section Visibility</div>
        {STORY_SECTIONS.map(s => (
          <div key={s.key} className="pm-sec-card">
            <div style={{ flex: 1, fontSize: 13, color: '#0F0C08', fontWeight: 500 }}>{s.label}</div>
            <Toggle checked={content.sections[s.key]?.visible !== false} onChange={v => onToggle(s.key, v)} />
          </div>
        ))}
      </div>

      {/* Editor */}
      <div style={{ background: 'white', border: '1px solid #EDE3D2', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #EDE3D2', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STORY_SUBTABS.map((t, i) => (
            <button key={t} className={`pm-sub-tab ${subTab === i ? 'active' : ''}`} onClick={() => setSubTab(i)}>{t}</button>
          ))}
        </div>
        <div style={{ padding: 24 }}>
          {subTab === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F0C08' }}>Hero Section</div>
              <Field label="Eyebrow"><input className="pm-inp" value={content.hero.eyebrow} onChange={e => setContent(c => ({ ...c, hero: { ...c.hero, eyebrow: e.target.value } }))} /></Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Title"><input className="pm-inp" value={content.hero.title} onChange={e => setContent(c => ({ ...c, hero: { ...c.hero, title: e.target.value } }))} /></Field>
                <Field label="Title italic"><input className="pm-inp" value={content.hero.titleItalic} onChange={e => setContent(c => ({ ...c, hero: { ...c.hero, titleItalic: e.target.value } }))} /></Field>
              </div>
              <Field label="Subtitle"><textarea className="pm-inp" rows={2} value={content.hero.subtitle} onChange={e => setContent(c => ({ ...c, hero: { ...c.hero, subtitle: e.target.value } }))} style={{ resize: 'vertical' }} /></Field>
              <Field label="Hero Image URL (optional)"><input className="pm-inp" value={content.hero.heroImage} onChange={e => setContent(c => ({ ...c, hero: { ...c.hero, heroImage: e.target.value } }))} placeholder="https://..." /></Field>
              {content.hero.heroImage && <img src={content.hero.heroImage} alt="Hero preview" style={{ borderRadius: 10, height: 120, objectFit: 'cover', width: '100%' }} onError={e => { e.currentTarget.style.display = 'none'; }} />}
              <button className="pm-save" disabled={saving} onClick={() => onSave('hero', { hero: content.hero })}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Hero
              </button>
            </div>
          )}
          {subTab === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F0C08' }}>Founding Story</div>
              <Field label="Eyebrow"><input className="pm-inp" value={content.founding.eyebrow} onChange={e => setContent(c => ({ ...c, founding: { ...c.founding, eyebrow: e.target.value } }))} /></Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Title"><input className="pm-inp" value={content.founding.title} onChange={e => setContent(c => ({ ...c, founding: { ...c.founding, title: e.target.value } }))} /></Field>
                <Field label="Title italic"><input className="pm-inp" value={content.founding.titleItalic} onChange={e => setContent(c => ({ ...c, founding: { ...c.founding, titleItalic: e.target.value } }))} /></Field>
              </div>
              <Field label="Story text (use blank lines to separate paragraphs)"><textarea className="pm-inp" rows={8} value={content.founding.story} onChange={e => setContent(c => ({ ...c, founding: { ...c.founding, story: e.target.value } }))} style={{ resize: 'vertical' }} /></Field>
              <Field label="Side image URL (optional)"><input className="pm-inp" value={content.founding.image} onChange={e => setContent(c => ({ ...c, founding: { ...c.founding, image: e.target.value } }))} placeholder="https://..." /></Field>
              {content.founding.image && <img src={content.founding.image} alt="Founding story" style={{ borderRadius: 10, height: 120, objectFit: 'cover', width: '100%' }} onError={e => { e.currentTarget.style.display = 'none'; }} />}
              <Field label="Image caption (optional)"><input className="pm-inp" value={content.founding.imageCaption} onChange={e => setContent(c => ({ ...c, founding: { ...c.founding, imageCaption: e.target.value } }))} placeholder="Caption shown below image..." /></Field>
              <button className="pm-save" disabled={saving} onClick={() => onSave('founding', { founding: content.founding })}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Founding Story
              </button>
            </div>
          )}
          {subTab === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F0C08' }}>Timeline Milestones</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Eyebrow"><input className="pm-inp" value={content.timeline.eyebrow} onChange={e => setContent(c => ({ ...c, timeline: { ...c.timeline, eyebrow: e.target.value } }))} /></Field>
                <Field label="Title italic"><input className="pm-inp" value={content.timeline.titleItalic} onChange={e => setContent(c => ({ ...c, timeline: { ...c.timeline, titleItalic: e.target.value } }))} /></Field>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {content.timeline.items.map((item, i) => (
                  <div key={i} style={{ background: '#F9F4EC', border: '1px solid #EDE3D2', borderRadius: 10, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#B8853A' }}>Milestone {i + 1}</span>
                      <button className="pm-del" onClick={() => setContent(c => ({ ...c, timeline: { ...c.timeline, items: c.timeline.items.filter((_, j) => j !== i) } }))}>
                        <X size={12} />
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8, marginBottom: 8 }}>
                      <div><label className="pm-label">Year</label><input className="pm-inp" value={item.year} onChange={e => { const its = [...content.timeline.items]; its[i] = { ...its[i], year: e.target.value }; setContent(c => ({ ...c, timeline: { ...c.timeline, items: its } })); }} placeholder="2010" /></div>
                      <div><label className="pm-label">Title</label><input className="pm-inp" value={item.title} onChange={e => { const its = [...content.timeline.items]; its[i] = { ...its[i], title: e.target.value }; setContent(c => ({ ...c, timeline: { ...c.timeline, items: its } })); }} /></div>
                    </div>
                    <label className="pm-label">Description</label>
                    <input className="pm-inp" value={item.description} onChange={e => { const its = [...content.timeline.items]; its[i] = { ...its[i], description: e.target.value }; setContent(c => ({ ...c, timeline: { ...c.timeline, items: its } })); }} />
                  </div>
                ))}
              </div>
              <button className="pm-add-btn" onClick={() => setContent(c => ({ ...c, timeline: { ...c.timeline, items: [...c.timeline.items, { year: '', title: '', description: '' }] } }))}>
                <Plus size={13} style={{ display: 'inline', marginRight: 4 }} />Add Milestone
              </button>
              <button className="pm-save" disabled={saving} onClick={() => onSave('timeline', { timeline: content.timeline })}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Timeline
              </button>
            </div>
          )}
          {subTab === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F0C08' }}>Values (4 fixed cards)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Eyebrow"><input className="pm-inp" value={content.values.eyebrow} onChange={e => setContent(c => ({ ...c, values: { ...c.values, eyebrow: e.target.value } }))} /></Field>
                <Field label="Title italic"><input className="pm-inp" value={content.values.titleItalic} onChange={e => setContent(c => ({ ...c, values: { ...c.values, titleItalic: e.target.value } }))} /></Field>
              </div>
              {content.values.items.map((v, i) => (
                <div key={i} style={{ background: '#F9F4EC', border: '1px solid #EDE3D2', borderRadius: 10, padding: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr 2fr', gap: 8 }}>
                    <div><label className="pm-label">Icon</label><input className="pm-inp" value={v.icon} onChange={e => { const its = [...content.values.items]; its[i] = { ...its[i], icon: e.target.value }; setContent(c => ({ ...c, values: { ...c.values, items: its } })); }} style={{ textAlign: 'center' }} /></div>
                    <div><label className="pm-label">Title</label><input className="pm-inp" value={v.title} onChange={e => { const its = [...content.values.items]; its[i] = { ...its[i], title: e.target.value }; setContent(c => ({ ...c, values: { ...c.values, items: its } })); }} /></div>
                    <div><label className="pm-label">Description</label><input className="pm-inp" value={v.description} onChange={e => { const its = [...content.values.items]; its[i] = { ...its[i], description: e.target.value }; setContent(c => ({ ...c, values: { ...c.values, items: its } })); }} /></div>
                  </div>
                </div>
              ))}
              <button className="pm-save" disabled={saving} onClick={() => onSave('values', { values: content.values })}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Values
              </button>
            </div>
          )}
          {subTab === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F0C08' }}>Team Members</div>
              {content.team.members.map((m, i) => (
                <div key={i} style={{ background: '#F9F4EC', border: '1px solid #EDE3D2', borderRadius: 10, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#B8853A' }}>Member {i + 1}</span>
                    {content.team.members.length > 1 && (
                      <button className="pm-del" onClick={() => setContent(c => ({ ...c, team: { ...c.team, members: c.team.members.filter((_, j) => j !== i) } }))}>
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                    <div><label className="pm-label">Name</label><input className="pm-inp" value={m.name} onChange={e => { const ms = [...content.team.members]; ms[i] = { ...ms[i], name: e.target.value }; setContent(c => ({ ...c, team: { ...c.team, members: ms } })); }} /></div>
                    <div><label className="pm-label">Role</label><input className="pm-inp" value={m.role} onChange={e => { const ms = [...content.team.members]; ms[i] = { ...ms[i], role: e.target.value }; setContent(c => ({ ...c, team: { ...c.team, members: ms } })); }} /></div>
                  </div>
                  <div style={{ marginBottom: 8 }}><label className="pm-label">Bio</label><textarea className="pm-inp" rows={2} value={m.bio} onChange={e => { const ms = [...content.team.members]; ms[i] = { ...ms[i], bio: e.target.value }; setContent(c => ({ ...c, team: { ...c.team, members: ms } })); }} style={{ resize: 'vertical' }} /></div>
                  <div><label className="pm-label">Photo URL (optional)</label><input className="pm-inp" value={m.image} onChange={e => { const ms = [...content.team.members]; ms[i] = { ...ms[i], image: e.target.value }; setContent(c => ({ ...c, team: { ...c.team, members: ms } })); }} placeholder="https://..." /></div>
                </div>
              ))}
              {content.team.members.length < 6 && (
                <button className="pm-add-btn" onClick={() => setContent(c => ({ ...c, team: { ...c.team, members: [...c.team.members, { name: '', role: '', bio: '', image: '' }] } }))}>
                  <Plus size={13} style={{ display: 'inline', marginRight: 4 }} />Add Team Member
                </button>
              )}
              <button className="pm-save" disabled={saving} onClick={() => onSave('team', { team: content.team })}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Team
              </button>
            </div>
          )}
          {subTab === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F0C08' }}>Call to Action</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Title"><input className="pm-inp" value={content.cta.title} onChange={e => setContent(c => ({ ...c, cta: { ...c.cta, title: e.target.value } }))} /></Field>
                <Field label="Title italic"><input className="pm-inp" value={content.cta.titleItalic} onChange={e => setContent(c => ({ ...c, cta: { ...c.cta, titleItalic: e.target.value } }))} /></Field>
              </div>
              <Field label="Description"><textarea className="pm-inp" rows={3} value={content.cta.description} onChange={e => setContent(c => ({ ...c, cta: { ...c.cta, description: e.target.value } }))} style={{ resize: 'vertical' }} /></Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Button 1 text"><input className="pm-inp" value={content.cta.buttonText} onChange={e => setContent(c => ({ ...c, cta: { ...c.cta, buttonText: e.target.value } }))} /></Field>
                <Field label="Button 2 text"><input className="pm-inp" value={content.cta.button2Text} onChange={e => setContent(c => ({ ...c, cta: { ...c.cta, button2Text: e.target.value } }))} /></Field>
              </div>
              <button className="pm-save" disabled={saving} onClick={() => onSave('cta', { cta: content.cta })}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save CTA
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Legal Editor (Privacy + Terms) ─────────────────────────────────────────

function LegalEditor({ content, setContent, saving, pageKey, onSave }: {
  content: LegalContent; setContent: React.Dispatch<React.SetStateAction<LegalContent>>;
  saving: boolean; pageKey: string; onSave: (data: LegalContent) => void;
}) {
  const label = pageKey === 'privacy' ? 'Privacy Policy' : 'Terms of Service';
  return (
    <div style={{ background: 'white', border: '1px solid #EDE3D2', borderRadius: 16, padding: 28, maxWidth: 860 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#0F0C08', marginBottom: 20 }}>{label} Editor</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 160px', gap: 12 }}>
          <Field label="Page Title"><input className="pm-inp" value={content.title} onChange={e => setContent(c => ({ ...c, title: e.target.value }))} /></Field>
          <Field label="Subtitle"><input className="pm-inp" value={content.subtitle} onChange={e => setContent(c => ({ ...c, subtitle: e.target.value }))} /></Field>
          <Field label="Last Updated"><input type="date" className="pm-inp" value={content.lastUpdated} onChange={e => setContent(c => ({ ...c, lastUpdated: e.target.value }))} /></Field>
        </div>
        <div>
          <label className="pm-label">Content</label>
          <textarea
            className="pm-inp"
            rows={20}
            value={content.content}
            onChange={e => setContent(c => ({ ...c, content: e.target.value }))}
            style={{ resize: 'vertical', lineHeight: 1.6, fontFamily: 'monospace', fontSize: 13 }}
            placeholder={`Enter your ${label.toLowerCase()} here.\n\nUse blank lines to separate paragraphs.\n## Section Heading\n**Bold text** _Italic text_`}
          />
          <div style={{ fontSize: 11.5, color: '#9E8870', marginTop: 4 }}>
            Use ## for headings · **bold** · _italic_ · blank lines between paragraphs
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingTop: 8, borderTop: '1px solid #EDE3D2' }}>
          <button className="pm-save" disabled={saving} onClick={() => onSave(content)}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save {label}
          </button>
          <a href={`/${pageKey}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#B8853A', fontWeight: 600, textDecoration: 'none' }}>
            <Eye size={14} /> Preview
          </a>
        </div>
      </div>
    </div>
  );
}
