import { useState, useEffect } from 'react';
import {
  Plus, Trash2, X, ChevronDown, ChevronUp, Upload,
} from 'lucide-react';
import { uploadImage } from '@/lib/uploadImage';
import type { CateringInquiry, CateringPackage } from '@/types';

// ─── Auth Helper ────────────────────────────────────────────────────────────

const getToken = () => localStorage.getItem('admin_jwt') || '';
const adminFetch = (url: string, opts: RequestInit = {}) =>
  fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...(opts.headers || {}) } });

// ─── Status Config ──────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { color: string; label: string }> = {
  new:       { color: 'background:#FEF3C7;color:#92400E;border:1px solid #FDE68A', label: 'New' },
  reviewing: { color: 'background:#DBEAFE;color:#1E40AF;border:1px solid #BFDBFE', label: 'Reviewing' },
  quoted:    { color: 'background:#EDE9FE;color:#5B21B6;border:1px solid #DDD6FE', label: 'Quoted' },
  confirmed: { color: 'background:#D1FAE5;color:#065F46;border:1px solid #A7F3D0', label: 'Confirmed' },
  completed: { color: 'background:#F3F4F6;color:#374151;border:1px solid #E5E7EB', label: 'Completed' },
  cancelled: { color: 'background:#FEE2E2;color:#991B1B;border:1px solid #FECACA', label: 'Cancelled' },
};

// ─── Content Defaults ───────────────────────────────────────────────────────

interface CateringContent {
  sections: Record<string, { visible: boolean }>;
  hero: { eyebrow: string; titleLine1: string; titleLine2: string; subtitle: string; button1Text: string; button2Text: string; heroImage: string; };
  stats: { number: string; suffix: string; label: string }[];
  process: { eyebrow: string; title: string; titleItalic: string; steps: { number: string; title: string; description: string }[] };
  cta: { title: string; titleItalic: string; description: string; buttonText: string; phone: string };
  formSettings: { emailTo: string; confirmMessage: string; serviceTypes: { id: string; label: string; icon: string; description: string }[]; budgetRanges: string[]; eventTypes: string[] };
}

const DEFAULT_CONTENT: CateringContent = {
  sections: { hero: { visible: true }, stats: { visible: true }, packages: { visible: true }, process: { visible: true }, cta: { visible: true } },
  hero: { eyebrow: 'Alexandria, Louisiana', titleLine1: 'Premium Catering', titleLine2: 'for every occasion', subtitle: 'From intimate gatherings to grand celebrations, we bring authentic Indian flavors to your events.', button1Text: 'Explore Packages', button2Text: 'Request Custom Quote', heroImage: '' },
  stats: [
    { number: '500', suffix: '+', label: 'Events catered' },
    { number: '14',  suffix: '+', label: 'Years experience' },
    { number: '50',  suffix: '+', label: 'Menu options' },
    { number: '4.9', suffix: '',  label: 'Client rating' },
  ],
  process: {
    eyebrow: 'How It Works', title: 'Simple process,', titleItalic: 'exceptional results',
    steps: [
      { number: '1', title: 'Choose Package',   description: 'Browse our catering packages and select the one that fits your event.' },
      { number: '2', title: 'Submit Request',   description: 'Fill out our catering request form with your event details.' },
      { number: '3', title: 'We Confirm',       description: 'Our team contacts you within 24 hours to confirm details.' },
      { number: '4', title: 'Enjoy Your Event', description: 'We handle everything. You just enjoy the celebration!' },
    ],
  },
  cta: { title: 'Ready to make your', titleItalic: 'event unforgettable?', description: 'Contact us today to discuss your catering needs.', buttonText: 'Request a Quote →', phone: '(318) 445-5688' },
  formSettings: {
    emailTo: 'hello@goldenlotusgrill.com', confirmMessage: 'Thank you! We will contact you within 24 hours.',
    serviceTypes: [
      { id: 'pickup', label: 'Pickup', icon: '🚗', description: 'Collect from us' },
      { id: 'onsite', label: 'On-Site', icon: '🍽️', description: 'We come to you' },
      { id: 'fullservice', label: 'Full Service', icon: '👨‍🍳', description: 'Staff + setup' },
    ],
    budgetRanges: ['Under $500', '$500 - $1,000', '$1,000 - $2,500', '$2,500 - $5,000', '$5,000+'],
    eventTypes: ['Wedding', 'Corporate Lunch', 'Birthday Party', 'Graduation', 'Religious Celebration', 'Other'],
  },
};

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero Section', stats: 'Stats Bar', packages: 'Packages Grid', process: 'How It Works', cta: 'CTA Section',
};

// ─── CSS ────────────────────────────────────────────────────────────────────

const CSS = `
  .ac-tab-btn { padding:9px 20px; border-radius:8px; font-size:13.5px; font-weight:500; font-family:'Jost',sans-serif; cursor:pointer; border:none; transition:all 0.2s; }
  .ac-tab-btn.active { background:#1E1810; color:white; }
  .ac-tab-btn:not(.active) { background:#F9F4EC; color:#9E8870; }
  .ac-tab-btn:not(.active):hover { background:#F0E8D8; color:#6B5540; }
  .ac-card { background:white; border-radius:16px; border:1px solid #EDE3D2; }
  .ac-input { width:100%; padding:9px 12px; border:1.5px solid #EDE3D2; border-radius:8px; font-size:13.5px; font-family:'Jost',sans-serif; color:#0F0C08; background:#F9F4EC; transition:all 0.2s; box-sizing:border-box; }
  .ac-input:focus { outline:none; border-color:#B8853A; background:white; box-shadow:0 0 0 3px rgba(184,133,58,0.08); }
  .ac-label { display:block; font-size:11px; font-weight:600; color:#6B5540; margin-bottom:4px; letter-spacing:0.05em; text-transform:uppercase; }
  .ac-btn-dark { padding:8px 18px; background:#1E1810; color:white; border:none; border-radius:9px; font-size:13px; font-weight:600; font-family:'Jost',sans-serif; cursor:pointer; transition:all 0.2s; }
  .ac-btn-dark:hover { background:#B8853A; }
  .ac-btn-gold { padding:8px 18px; background:#B8853A; color:white; border:none; border-radius:9px; font-size:13px; font-weight:600; font-family:'Jost',sans-serif; cursor:pointer; transition:all 0.2s; }
  .ac-btn-gold:hover { background:#C9963F; }
  .ac-btn-outline { padding:8px 18px; background:transparent; color:#6B5540; border:1.5px solid #DDD0BB; border-radius:9px; font-size:13px; font-weight:500; font-family:'Jost',sans-serif; cursor:pointer; transition:all 0.2s; }
  .ac-btn-outline:hover { border-color:#B8853A; color:#B8853A; }
  .ac-toggle { position:relative; display:inline-block; width:44px; height:24px; flex-shrink:0; }
  .ac-toggle input { opacity:0; width:0; height:0; }
  .ac-slider { position:absolute; inset:0; border-radius:12px; cursor:pointer; transition:0.3s; }
  .ac-slider:before { content:''; position:absolute; height:18px; width:18px; left:3px; bottom:3px; background:white; border-radius:50%; transition:0.3s; }
  .ac-toggle input:checked + .ac-slider { background:#B8853A; }
  .ac-toggle input:not(:checked) + .ac-slider { background:#DDD0BB; }
  .ac-toggle input:checked + .ac-slider:before { transform:translateX(20px); }
  .ac-accordion { border:1px solid #EDE3D2; border-radius:12px; overflow:hidden; margin-bottom:10px; }
  .ac-accordion-hd { padding:14px 18px; background:#F9F4EC; cursor:pointer; display:flex; align-items:center; justify-content:space-between; font-size:13.5px; font-weight:600; color:#0F0C08; }
  .ac-accordion-hd:hover { background:#F0E8D8; }
  .ac-accordion-body { padding:18px; background:white; border-top:1px solid #EDE3D2; }
  .ac-section-card { background:white; border:1px solid #EDE3D2; border-radius:10px; padding:12px 16px; display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
  .ac-req-row { border-bottom:1px solid #F0E8D8; cursor:pointer; transition:background 0.15s; }
  .ac-req-row:hover { background:#FAFAFA; }
  .ac-req-row:last-child { border-bottom:none; }
  .ac-badge { display:inline-flex; align-items:center; padding:3px 9px; border-radius:20px; font-size:11px; font-weight:600; }
`;

// ─── Toggle Component ────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="ac-toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="ac-slider" />
    </label>
  );
}

// ─── Accordion Component ─────────────────────────────────────────────────────

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ac-accordion">
      <div className="ac-accordion-hd" onClick={() => setOpen(o => !o)}>
        {title}
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </div>
      {open && <div className="ac-accordion-body">{children}</div>}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminCatering() {
  const [activeTab, setActiveTab] = useState<'packages' | 'content' | 'requests'>('packages');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // ── Packages State ──────────────────────────────────────────────────────────
  const [packages, setPackages] = useState<CateringPackage[]>([]);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<CateringPackage | null>(null);
  const [pkgForm, setPkgForm] = useState<Partial<CateringPackage>>({});
  const [pkgMenuItems, setPkgMenuItems] = useState<{ name: string; description: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // ── Content State ───────────────────────────────────────────────────────────
  const [content, setContent] = useState<CateringContent>(DEFAULT_CONTENT);
  const [saving, setSaving] = useState('');

  // ── Requests State ──────────────────────────────────────────────────────────
  const [requests, setRequests] = useState<CateringInquiry[]>([]);
  const [expandedReq, setExpandedReq] = useState<string | null>(null);
  const [reqFilter, setReqFilter] = useState('all');
  const [reqNotes, setReqNotes] = useState<Record<string, string>>({});
  const [reqStatus, setReqStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    loadPackages();
    if (activeTab === 'content') loadContent();
    if (activeTab === 'requests') loadRequests();
  }, [activeTab]);

  // ── Loaders ─────────────────────────────────────────────────────────────────

  const loadPackages = async () => {
    try {
      const res = await fetch('/api/menu?action=catering-packages');
      if (res.ok) setPackages(Array.isArray(await res.clone().json()) ? await res.json() : []);
    } catch { /* ignore */ }
    // Also try admin endpoint for full data
    try {
      const res = await adminFetch('/api/admin?action=get-catering-packages');
      if (res.ok) {
        const d = await res.json();
        if (d.success && d.packages) setPackages(d.packages);
        else {
          const r2 = await fetch('/api/menu?action=catering-packages');
          if (r2.ok) { const raw = await r2.json(); setPackages(Array.isArray(raw) ? raw : []); }
        }
      }
    } catch { /* ignore */ }
  };

  const loadContent = async () => {
    try {
      const res = await fetch('/api/admin?action=get-catering-content');
      const d = await res.json();
      if (d.success && d.data) setContent({ ...DEFAULT_CONTENT, ...d.data });
    } catch { /* ignore */ }
  };

  const loadRequests = async () => {
    try {
      const res = await adminFetch('/api/admin?action=get-catering-requests');
      const d = await res.json();
      if (d.success && d.requests) {
        setRequests(d.requests);
        const notes: Record<string, string> = {};
        const statuses: Record<string, string> = {};
        d.requests.forEach((r: any) => { notes[r.id] = r.notes || ''; statuses[r.id] = r.status || 'new'; });
        setReqNotes(notes);
        setReqStatus(statuses);
      }
    } catch { /* ignore */ }
  };

  // ── Package handlers ─────────────────────────────────────────────────────────

  const openPackageModal = (pkg?: CateringPackage) => {
    if (pkg) {
      setEditingPackage(pkg);
      setPkgForm({ ...pkg });
      setPkgMenuItems((pkg as any).menuItems || []);
    } else {
      setEditingPackage(null);
      setPkgForm({ name: '', description: '', price: 0, minGuests: 10, maxGuests: 200, featured: false, active: true } as any);
      setPkgMenuItems([]);
    }
    setIsPackageModalOpen(true);
  };

  const savePackage = async () => {
    try {
      const body = { ...pkgForm, menuItems: pkgMenuItems };
      if (editingPackage) {
        await adminFetch('/api/admin?action=save-catering-packages', {
          method: 'PATCH', body: JSON.stringify({ id: editingPackage.id || (editingPackage as any)._id, ...body }),
        });
      } else {
        await adminFetch('/api/admin?action=save-catering-packages', {
          method: 'POST', body: JSON.stringify(body),
        });
      }
      setIsPackageModalOpen(false);
      await loadPackages();
      showToast('Package saved! ✓');
    } catch { showToast('Failed to save package'); }
  };

  const deletePackage = async (id: string) => {
    if (!confirm('Delete this package?')) return;
    try {
      await adminFetch(`/api/admin?action=save-catering-packages&id=${id}`, { method: 'DELETE' });
      await loadPackages();
      showToast('Package deleted');
    } catch { showToast('Failed to delete'); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setPkgForm(f => ({ ...f, image: url }));
    } catch { showToast('Upload failed'); }
    setIsUploading(false);
  };

  // ── Content save ─────────────────────────────────────────────────────────────

  const saveContent = async (section: string, data: object) => {
    setSaving(section);
    try {
      const merged = { ...content, ...data };
      await adminFetch('/api/admin?action=save-catering-content', {
        method: 'POST', body: JSON.stringify(merged),
      });
      setContent(merged as CateringContent);
      showToast('Saved! Changes are live ✓');
    } catch { showToast('Save failed. Try again.'); }
    setSaving('');
  };

  const toggleSection = async (key: string, visible: boolean) => {
    try {
      await adminFetch('/api/admin?action=toggle-catering-section', {
        method: 'POST', body: JSON.stringify({ sectionKey: key, visible }),
      });
      setContent(c => ({ ...c, sections: { ...c.sections, [key]: { visible } } }));
      showToast(`Section ${visible ? 'shown' : 'hidden'} ✓`);
    } catch { showToast('Failed to toggle section'); }
  };

  // ── Request update ───────────────────────────────────────────────────────────

  const updateRequest = async (id: string) => {
    try {
      await adminFetch('/api/admin?action=update-catering-request', {
        method: 'POST', body: JSON.stringify({ requestId: id, status: reqStatus[id], notes: reqNotes[id] }),
      });
      showToast('Request updated ✓');
    } catch { showToast('Update failed'); }
  };

  const filteredRequests = reqFilter === 'all' ? requests : requests.filter((r: any) => (r.status || 'new') === reqFilter);

  return (
    <div style={{ fontFamily: "'Jost',sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, background: '#1E1810', color: 'white', borderRadius: 10, padding: '12px 20px', fontSize: 13.5, fontWeight: 500, boxShadow: '0 8px 32px rgba(0,0,0,0.25)', animation: 'ct-up 0.3s ease' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 600, color: '#0F0C08', margin: '0 0 4px' }}>Catering Manager</h1>
        <p style={{ fontSize: 13, color: '#9E8870', margin: 0 }}>Manage catering packages, page content, and incoming requests.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'white', border: '1px solid #EDE3D2', borderRadius: 12, padding: 6, width: 'fit-content' }}>
        {[['packages', 'Packages'], ['content', 'Page Content'], ['requests', 'Requests']].map(([id, label]) => (
          <button key={id} className={`ac-tab-btn${activeTab === id ? ' active' : ''}`} onClick={() => setActiveTab(id as typeof activeTab)}>
            {label}
            {id === 'requests' && requests.filter((r: any) => (r.status || 'new') === 'new').length > 0 && (
              <span style={{ marginLeft: 6, background: '#B8853A', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                {requests.filter((r: any) => (r.status || 'new') === 'new').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ──── TAB: PACKAGES ──── */}
      {activeTab === 'packages' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 600, color: '#0F0C08', margin: 0 }}>Catering Packages</h2>
            <button className="ac-btn-dark" onClick={() => openPackageModal()}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Plus size={15} /> Add Package</span>
            </button>
          </div>

          {packages.length === 0 ? (
            <div className="ac-card" style={{ padding: 48, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🍽️</div>
              <p style={{ fontSize: 15, color: '#9E8870', margin: 0 }}>No packages yet. Add your first catering package!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {packages.map(pkg => {
                const id = pkg.id || (pkg as any)._id || '';
                return (
                  <div key={id} className="ac-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#F0E8D8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {(pkg as any).image ? <img src={(pkg as any).image} alt={pkg.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 28 }}>🍽️</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: '#0F0C08' }}>{pkg.name}</span>
                        {(pkg as any).featured && <span style={{ fontSize: 10, background: '#F2E4C8', color: '#B8853A', borderRadius: 20, padding: '2px 8px', fontWeight: 600 }}>⭐ Featured</span>}
                        <span style={{ fontSize: 10, background: pkg.active !== false ? '#D1FAE5' : '#F3F4F6', color: pkg.active !== false ? '#065F46' : '#6B7280', borderRadius: 20, padding: '2px 8px', fontWeight: 600 }}>
                          {pkg.active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div style={{ fontSize: 12.5, color: '#9E8870' }}>
                        ${(pkg as any).pricePerPerson || (pkg as any).price || 0}/person · {(pkg as any).minGuests || 10}–{(pkg as any).maxGuests || 200} guests
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="ac-btn-outline" style={{ padding: '6px 14px' }} onClick={() => openPackageModal(pkg)}>Edit</button>
                      <button style={{ padding: '6px 10px', background: 'transparent', border: '1.5px solid #FEE2E2', borderRadius: 9, color: '#C53A3A', cursor: 'pointer' }} onClick={() => deletePackage(id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ──── TAB: PAGE CONTENT ──── */}
      {activeTab === 'content' && (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'start' }}>
          {/* Left: Section Visibility */}
          <div className="ac-card" style={{ padding: 20 }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 600, color: '#0F0C08', margin: '0 0 4px' }}>Page Sections</h3>
            <p style={{ fontSize: 12, color: '#9E8870', margin: '0 0 16px' }}>Toggle sections on/off</p>
            {Object.keys(SECTION_LABELS).map(key => (
              <div key={key} className="ac-section-card">
                <span style={{ fontSize: 13.5, color: '#0F0C08', fontWeight: 500 }}>{SECTION_LABELS[key]}</span>
                <Toggle checked={content.sections?.[key]?.visible !== false} onChange={v => toggleSection(key, v)} />
              </div>
            ))}
          </div>

          {/* Right: Content Editors */}
          <div>
            {/* Hero */}
            <Accordion title="Hero Section">
              <div style={{ display: 'grid', gap: 12 }}>
                {[['eyebrow', 'Eyebrow text'], ['titleLine1', 'Title Line 1'], ['titleLine2', 'Title Line 2 (italic/gold)'], ['button1Text', 'Button 1 text'], ['button2Text', 'Button 2 text']].map(([k, lbl]) => (
                  <div key={k}>
                    <label className="ac-label">{lbl}</label>
                    <input className="ac-input" value={(content.hero as any)[k] || ''} onChange={e => setContent(c => ({ ...c, hero: { ...c.hero, [k]: e.target.value } }))} />
                  </div>
                ))}
                <div>
                  <label className="ac-label">Subtitle</label>
                  <textarea className="ac-input" rows={2} value={content.hero.subtitle} onChange={e => setContent(c => ({ ...c, hero: { ...c.hero, subtitle: e.target.value } }))} style={{ resize: 'vertical' }} />
                </div>
                <div>
                  <label className="ac-label">Hero Background Image URL</label>
                  <input className="ac-input" value={content.hero.heroImage} placeholder="https://..." onChange={e => setContent(c => ({ ...c, hero: { ...c.hero, heroImage: e.target.value } }))} />
                </div>
                <button className="ac-btn-gold" disabled={saving === 'hero'} onClick={() => saveContent('hero', { hero: content.hero })}>
                  {saving === 'hero' ? 'Saving…' : 'Save Hero'}
                </button>
              </div>
            </Accordion>

            {/* Stats */}
            <Accordion title="Stats Bar">
              <div style={{ display: 'grid', gap: 10 }}>
                {content.stats.map((s, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 1fr', gap: 8, alignItems: 'end' }}>
                    <div>
                      {i === 0 && <label className="ac-label">Number</label>}
                      <input className="ac-input" value={s.number} onChange={e => setContent(c => { const st = [...c.stats]; st[i] = { ...st[i], number: e.target.value }; return { ...c, stats: st }; })} />
                    </div>
                    <div>
                      {i === 0 && <label className="ac-label">Suffix</label>}
                      <input className="ac-input" value={s.suffix} placeholder="+" onChange={e => setContent(c => { const st = [...c.stats]; st[i] = { ...st[i], suffix: e.target.value }; return { ...c, stats: st }; })} />
                    </div>
                    <div>
                      {i === 0 && <label className="ac-label">Label</label>}
                      <input className="ac-input" value={s.label} onChange={e => setContent(c => { const st = [...c.stats]; st[i] = { ...st[i], label: e.target.value }; return { ...c, stats: st }; })} />
                    </div>
                  </div>
                ))}
                <button className="ac-btn-gold" disabled={saving === 'stats'} onClick={() => saveContent('stats', { stats: content.stats })}>
                  {saving === 'stats' ? 'Saving…' : 'Save Stats'}
                </button>
              </div>
            </Accordion>

            {/* Process */}
            <Accordion title="How It Works">
              <div style={{ display: 'grid', gap: 12 }}>
                {[['eyebrow', 'Eyebrow'], ['title', 'Title'], ['titleItalic', 'Title Italic']].map(([k, lbl]) => (
                  <div key={k}>
                    <label className="ac-label">{lbl}</label>
                    <input className="ac-input" value={(content.process as any)[k] || ''} onChange={e => setContent(c => ({ ...c, process: { ...c.process, [k]: e.target.value } }))} />
                  </div>
                ))}
                <div style={{ marginTop: 8 }}>
                  <label className="ac-label" style={{ marginBottom: 10, display: 'block' }}>Steps</label>
                  {content.process.steps.map((step, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 2fr', gap: 8, marginBottom: 8 }}>
                      <div style={{ paddingTop: 22, textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#B8853A' }}>{step.number}.</div>
                      <div>
                        {i === 0 && <label className="ac-label">Title</label>}
                        <input className="ac-input" value={step.title} onChange={e => setContent(c => { const st = [...c.process.steps]; st[i] = { ...st[i], title: e.target.value }; return { ...c, process: { ...c.process, steps: st } }; })} />
                      </div>
                      <div>
                        {i === 0 && <label className="ac-label">Description</label>}
                        <input className="ac-input" value={step.description} onChange={e => setContent(c => { const st = [...c.process.steps]; st[i] = { ...st[i], description: e.target.value }; return { ...c, process: { ...c.process, steps: st } }; })} />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="ac-btn-gold" disabled={saving === 'process'} onClick={() => saveContent('process', { process: content.process })}>
                  {saving === 'process' ? 'Saving…' : 'Save Process'}
                </button>
              </div>
            </Accordion>

            {/* CTA */}
            <Accordion title="CTA Section">
              <div style={{ display: 'grid', gap: 12 }}>
                {[['title', 'Title'], ['titleItalic', 'Title Italic'], ['buttonText', 'Button Text'], ['phone', 'Phone Number']].map(([k, lbl]) => (
                  <div key={k}>
                    <label className="ac-label">{lbl}</label>
                    <input className="ac-input" value={(content.cta as any)[k] || ''} onChange={e => setContent(c => ({ ...c, cta: { ...c.cta, [k]: e.target.value } }))} />
                  </div>
                ))}
                <div>
                  <label className="ac-label">Description</label>
                  <textarea className="ac-input" rows={2} value={content.cta.description} onChange={e => setContent(c => ({ ...c, cta: { ...c.cta, description: e.target.value } }))} style={{ resize: 'vertical' }} />
                </div>
                <button className="ac-btn-gold" disabled={saving === 'cta'} onClick={() => saveContent('cta', { cta: content.cta })}>
                  {saving === 'cta' ? 'Saving…' : 'Save CTA'}
                </button>
              </div>
            </Accordion>

            {/* Form Settings */}
            <Accordion title="Form Settings">
              <div style={{ display: 'grid', gap: 12 }}>
                <div>
                  <label className="ac-label">Email To (where requests are sent)</label>
                  <input className="ac-input" value={content.formSettings.emailTo} onChange={e => setContent(c => ({ ...c, formSettings: { ...c.formSettings, emailTo: e.target.value } }))} />
                </div>
                <div>
                  <label className="ac-label">Confirmation Message</label>
                  <input className="ac-input" value={content.formSettings.confirmMessage} onChange={e => setContent(c => ({ ...c, formSettings: { ...c.formSettings, confirmMessage: e.target.value } }))} />
                </div>
                <div>
                  <label className="ac-label" style={{ marginBottom: 8, display: 'block' }}>Service Types</label>
                  {content.formSettings.serviceTypes.map((s, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '44px 1fr 2fr', gap: 8, marginBottom: 8 }}>
                      <div>
                        {i === 0 && <label className="ac-label">Icon</label>}
                        <input className="ac-input" value={s.icon} onChange={e => setContent(c => { const st = [...c.formSettings.serviceTypes]; st[i] = { ...st[i], icon: e.target.value }; return { ...c, formSettings: { ...c.formSettings, serviceTypes: st } }; })} style={{ textAlign: 'center' }} />
                      </div>
                      <div>
                        {i === 0 && <label className="ac-label">Label</label>}
                        <input className="ac-input" value={s.label} onChange={e => setContent(c => { const st = [...c.formSettings.serviceTypes]; st[i] = { ...st[i], label: e.target.value }; return { ...c, formSettings: { ...c.formSettings, serviceTypes: st } }; })} />
                      </div>
                      <div>
                        {i === 0 && <label className="ac-label">Description</label>}
                        <input className="ac-input" value={s.description} onChange={e => setContent(c => { const st = [...c.formSettings.serviceTypes]; st[i] = { ...st[i], description: e.target.value }; return { ...c, formSettings: { ...c.formSettings, serviceTypes: st } }; })} />
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="ac-label" style={{ marginBottom: 8, display: 'block' }}>Event Types</label>
                  {content.formSettings.eventTypes.map((t, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                      <input className="ac-input" value={t} onChange={e => setContent(c => { const arr = [...c.formSettings.eventTypes]; arr[i] = e.target.value; return { ...c, formSettings: { ...c.formSettings, eventTypes: arr } }; })} />
                      <button style={{ padding: '6px 10px', background: 'transparent', border: '1px solid #FEE2E2', borderRadius: 8, color: '#C53A3A', cursor: 'pointer', flexShrink: 0 }}
                        onClick={() => setContent(c => { const arr = c.formSettings.eventTypes.filter((_, j) => j !== i); return { ...c, formSettings: { ...c.formSettings, eventTypes: arr } }; })}>
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                  <button className="ac-btn-outline" style={{ marginTop: 4 }} onClick={() => setContent(c => ({ ...c, formSettings: { ...c.formSettings, eventTypes: [...c.formSettings.eventTypes, ''] } }))}>
                    + Add Event Type
                  </button>
                </div>
                <div>
                  <label className="ac-label" style={{ marginBottom: 8, display: 'block' }}>Budget Ranges</label>
                  {content.formSettings.budgetRanges.map((r, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                      <input className="ac-input" value={r} onChange={e => setContent(c => { const arr = [...c.formSettings.budgetRanges]; arr[i] = e.target.value; return { ...c, formSettings: { ...c.formSettings, budgetRanges: arr } }; })} />
                      <button style={{ padding: '6px 10px', background: 'transparent', border: '1px solid #FEE2E2', borderRadius: 8, color: '#C53A3A', cursor: 'pointer', flexShrink: 0 }}
                        onClick={() => setContent(c => { const arr = c.formSettings.budgetRanges.filter((_, j) => j !== i); return { ...c, formSettings: { ...c.formSettings, budgetRanges: arr } }; })}>
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                  <button className="ac-btn-outline" style={{ marginTop: 4 }} onClick={() => setContent(c => ({ ...c, formSettings: { ...c.formSettings, budgetRanges: [...c.formSettings.budgetRanges, ''] } }))}>
                    + Add Budget Range
                  </button>
                </div>
                <button className="ac-btn-gold" disabled={saving === 'formSettings'} onClick={() => saveContent('formSettings', { formSettings: content.formSettings })}>
                  {saving === 'formSettings' ? 'Saving…' : 'Save Form Settings'}
                </button>
              </div>
            </Accordion>
          </div>
        </div>
      )}

      {/* ──── TAB: REQUESTS ──── */}
      {activeTab === 'requests' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 600, color: '#0F0C08', margin: 0 }}>
              Catering Requests
              {requests.length > 0 && <span style={{ fontSize: 14, fontWeight: 400, color: '#9E8870', marginLeft: 8 }}>({requests.length} total)</span>}
            </h2>
            <div style={{ display: 'flex', gap: 6 }}>
              {['all', 'new', 'reviewing', 'confirmed'].map(f => (
                <button key={f} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 500, cursor: 'pointer', border: '1.5px solid', fontFamily: "'Jost',sans-serif", transition: 'all 0.15s', borderColor: reqFilter === f ? '#B8853A' : '#EDE3D2', background: reqFilter === f ? '#B8853A' : 'white', color: reqFilter === f ? 'white' : '#6B5540' }}
                  onClick={() => setReqFilter(f)}>
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="ac-card" style={{ padding: 48, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
              <p style={{ fontSize: 15, color: '#9E8870', margin: 0 }}>No catering requests yet.</p>
            </div>
          ) : (
            <div className="ac-card" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F9F4EC', borderBottom: '1px solid #EDE3D2' }}>
                    {['Date', 'Name', 'Event Type', 'Event Date', 'Guests', 'Package', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#9E8870', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((req: any) => {
                    const id = req.id || req._id || '';
                    const status = reqStatus[id] || req.status || 'new';
                    const cfg = STATUS_CFG[status] || STATUS_CFG.new;
                    const expanded = expandedReq === id;
                    return (
                      <>
                        <tr key={id} className="ac-req-row" onClick={() => setExpandedReq(expanded ? null : id)}>
                          <td style={{ padding: '12px 16px', fontSize: 12.5, color: '#9E8870' }}>{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '—'}</td>
                          <td style={{ padding: '12px 16px', fontSize: 13.5, fontWeight: 600, color: '#0F0C08' }}>{req.name || '—'}</td>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B5540' }}>{req.eventType || '—'}</td>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B5540' }}>{req.eventDate || '—'}</td>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B5540' }}>{req.guestCount || '—'}</td>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B5540' }}>{req.packageName || 'Custom'}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span className="ac-badge" style={{ cssText: cfg.color } as any}>{cfg.label}</span>
                          </td>
                        </tr>
                        {expanded && (
                          <tr key={`${id}-detail`}>
                            <td colSpan={7} style={{ padding: '20px 24px', background: '#FAFAFA', borderBottom: '1px solid #EDE3D2' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12, marginBottom: 20 }}>
                                {[
                                  ['Email', req.email], ['Phone', req.phone], ['Event Time', req.eventTime || '—'],
                                  ['Service Type', req.serviceType || '—'], ['Venue', req.venueAddress || '—'],
                                  ['Budget', req.budgetRange || '—'], ['Dietary', req.dietaryRequirements || '—'],
                                  ['Need Staff', req.needStaff ? 'Yes' : 'No'], ['Need Equipment', req.needEquipment ? 'Yes' : 'No'],
                                ].map(([label, val]) => (
                                  <div key={label}>
                                    <div style={{ fontSize: 10, fontWeight: 600, color: '#9E8870', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{label}</div>
                                    <div style={{ fontSize: 13, color: '#0F0C08' }}>{val}</div>
                                  </div>
                                ))}
                              </div>
                              {req.message && (
                                <div style={{ marginBottom: 20 }}>
                                  <div style={{ fontSize: 10, fontWeight: 600, color: '#9E8870', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Message</div>
                                  <div style={{ fontSize: 13, color: '#0F0C08', background: 'white', border: '1px solid #EDE3D2', borderRadius: 8, padding: '10px 14px', lineHeight: 1.6 }}>{req.message}</div>
                                </div>
                              )}
                              <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: 12, alignItems: 'end' }}>
                                <div>
                                  <label className="ac-label">Update Status</label>
                                  <select className="ac-input" value={reqStatus[id] || status} onChange={e => setReqStatus(s => ({ ...s, [id]: e.target.value }))} style={{ cursor: 'pointer' }}>
                                    {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label className="ac-label">Internal Notes</label>
                                  <input className="ac-input" placeholder="Admin notes…" value={reqNotes[id] || ''} onChange={e => setReqNotes(n => ({ ...n, [id]: e.target.value }))} />
                                </div>
                                <button className="ac-btn-dark" onClick={() => updateRequest(id)}>Update</button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ──── PACKAGE MODAL ──── */}
      {isPackageModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,12,8,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setIsPackageModalOpen(false); }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #EDE3D2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 600, color: '#0F0C08', margin: 0 }}>
                {editingPackage ? 'Edit Package' : 'Add Package'}
              </h3>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9E8870' }} onClick={() => setIsPackageModalOpen(false)}><X size={20} /></button>
            </div>
            <div style={{ padding: 24, display: 'grid', gap: 14 }}>
              <div>
                <label className="ac-label">Package Name *</label>
                <input className="ac-input" value={pkgForm.name || ''} onChange={e => setPkgForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="ac-label">Description</label>
                <textarea className="ac-input" rows={2} value={pkgForm.description || ''} onChange={e => setPkgForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label className="ac-label">Price / Person ($) *</label>
                  <input className="ac-input" type="number" min={0} value={(pkgForm as any).pricePerPerson || ''} onChange={e => setPkgForm(f => ({ ...f, pricePerPerson: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className="ac-label">Min Guests</label>
                  <input className="ac-input" type="number" min={1} value={(pkgForm as any).minGuests || 10} onChange={e => setPkgForm(f => ({ ...f, minGuests: parseInt(e.target.value) || 10 }))} />
                </div>
                <div>
                  <label className="ac-label">Max Guests</label>
                  <input className="ac-input" type="number" min={1} value={(pkgForm as any).maxGuests || 200} onChange={e => setPkgForm(f => ({ ...f, maxGuests: parseInt(e.target.value) || 200 }))} />
                </div>
              </div>
              <div>
                <label className="ac-label">Card Color (when no image)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['gold', 'green', 'dark', 'spice'].map(c => (
                    <button key={c} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1.5px solid', fontFamily: "'Jost',sans-serif", borderColor: (pkgForm as any).color === c ? '#B8853A' : '#EDE3D2', background: (pkgForm as any).color === c ? '#F2E4C8' : 'white', color: '#6B5540' }}
                      onClick={() => setPkgForm(f => ({ ...f, color: c }))}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="ac-label">Package Image</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input className="ac-input" placeholder="Image URL" value={(pkgForm as any).image || ''} onChange={e => setPkgForm(f => ({ ...f, image: e.target.value }))} style={{ flex: 1 }} />
                  <label style={{ padding: '9px 14px', background: '#F0E8D8', border: '1px solid #DDD0BB', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#6B5540', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                    <Upload size={13} /> {isUploading ? 'Uploading…' : 'Upload'}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                  </label>
                </div>
                {(pkgForm as any).image && <img src={(pkgForm as any).image} alt="Preview" style={{ marginTop: 8, height: 80, borderRadius: 8, objectFit: 'cover' }} />}
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label className="ac-label">Menu Highlights</label>
                  <button className="ac-btn-outline" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setPkgMenuItems(m => [...m, { name: '', description: '' }])}>+ Add</button>
                </div>
                {pkgMenuItems.map((item, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, marginBottom: 8 }}>
                    <input className="ac-input" placeholder="Dish name" value={item.name} onChange={e => setPkgMenuItems(m => { const a = [...m]; a[i] = { ...a[i], name: e.target.value }; return a; })} />
                    <input className="ac-input" placeholder="Short description" value={item.description || ''} onChange={e => setPkgMenuItems(m => { const a = [...m]; a[i] = { ...a[i], description: e.target.value }; return a; })} />
                    <button style={{ padding: '6px 10px', background: 'transparent', border: '1px solid #FEE2E2', borderRadius: 8, color: '#C53A3A', cursor: 'pointer' }} onClick={() => setPkgMenuItems(m => m.filter((_, j) => j !== i))}><X size={13} /></button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={(pkgForm as any).featured || false} onChange={e => setPkgForm(f => ({ ...f, featured: e.target.checked }))} />
                  <span style={{ fontSize: 13, color: '#0F0C08' }}>⭐ Featured (Most Popular)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={(pkgForm as any).active !== false} onChange={e => setPkgForm(f => ({ ...f, active: e.target.checked }))} />
                  <span style={{ fontSize: 13, color: '#0F0C08' }}>Active (visible to public)</span>
                </label>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #EDE3D2', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="ac-btn-outline" onClick={() => setIsPackageModalOpen(false)}>Cancel</button>
              <button className="ac-btn-dark" onClick={savePackage}>Save Package</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
