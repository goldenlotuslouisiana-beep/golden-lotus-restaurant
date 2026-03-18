import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO, { breadcrumbSchema } from '@/components/SEO';

// ─── Types ─────────────────────────────────────────────────────────────────

interface StoryContent {
  hero: { eyebrow: string; title: string; titleItalic: string; subtitle: string; heroImage: string; };
  founding: { eyebrow: string; title: string; titleItalic: string; story: string; image: string; imageCaption: string; };
  timeline: { eyebrow: string; title: string; titleItalic: string; items: Array<{ year: string; title: string; description: string; }>; };
  values: { eyebrow: string; title: string; titleItalic: string; items: Array<{ icon: string; title: string; description: string; }>; };
  team: { eyebrow: string; title: string; titleItalic: string; members: Array<{ name: string; role: string; bio: string; image: string; }>; };
  gallery: { eyebrow: string; title: string; titleItalic: string; images: string[]; };
  cta: { title: string; titleItalic: string; description: string; buttonText: string; button2Text: string; };
  sections?: Record<string, { visible: boolean }>;
}

// ─── Defaults ──────────────────────────────────────────────────────────────

const DEFAULT: StoryContent = {
  hero: { eyebrow: 'Our Story', title: 'A journey of', titleItalic: 'flavors & passion', subtitle: "From a small dream to Alexandria's favorite Indian restaurant", heroImage: '' },
  founding: { eyebrow: 'How It All Started', title: 'Born from a', titleItalic: 'love of cooking', story: 'Our story began in 2010 when we brought the authentic flavors of India to Alexandria, Louisiana. With generations-old recipes and a passion for spices, we set out to create a dining experience unlike anything the region had seen before.\n\nEvery dish we serve carries the soul of traditional Indian cooking — fresh ingredients sourced daily, spices ground in-house, and techniques perfected over decades.', image: '', imageCaption: '' },
  timeline: {
    eyebrow: 'Our Journey', title: 'Milestones that', titleItalic: 'shaped us',
    items: [
      { year: '2010', title: 'Grand Opening', description: 'Golden Lotus opens its doors in Alexandria, LA' },
      { year: '2013', title: 'First Award', description: 'Voted Best Indian Restaurant in Central Louisiana' },
      { year: '2016', title: 'Menu Expansion', description: 'Added 30+ new dishes inspired by regional Indian cuisine' },
      { year: '2019', title: 'Online Ordering', description: 'Launched online ordering for convenient pickup' },
      { year: '2024', title: 'New Chapter', description: 'Renovated and launched our new website' },
    ],
  },
  values: {
    eyebrow: 'What We Stand For', title: 'Our core', titleItalic: 'values',
    items: [
      { icon: '🌿', title: 'Fresh Always', description: 'Every ingredient sourced fresh daily. No shortcuts, ever.' },
      { icon: '❤️', title: 'Made with Love', description: 'Every dish prepared with the same care as cooking for family.' },
      { icon: '🌍', title: 'Authentic Roots', description: 'Recipes passed down generations, honoring Indian culinary heritage.' },
      { icon: '🤝', title: 'Community First', description: 'Proud to serve and support the Alexandria community.' },
    ],
  },
  team: {
    eyebrow: 'Meet The Team', title: 'The people behind', titleItalic: 'every dish',
    members: [
      { name: 'Head Chef', role: 'Head Chef & Founder', bio: 'With over 20 years of culinary experience, our head chef brings authentic flavors from India to every dish.', image: '' },
      { name: 'Kitchen Manager', role: 'Kitchen Manager', bio: 'Ensuring every order is prepared with the highest standards of quality and freshness.', image: '' },
      { name: 'Front of House', role: 'Guest Experience', bio: 'Making every guest feel welcome and ensuring an exceptional dining experience.', image: '' },
    ],
  },
  gallery: { eyebrow: 'Our Kitchen', title: 'A glimpse', titleItalic: 'inside', images: [] },
  cta: { title: 'Come taste the', titleItalic: 'difference', description: 'Experience the flavors that have made Golden Lotus a beloved part of Alexandria.', buttonText: 'Order Online →', button2Text: 'View Our Menu' },
  sections: { hero: { visible: true }, founding: { visible: true }, timeline: { visible: true }, values: { visible: true }, team: { visible: true }, gallery: { visible: true }, cta: { visible: true } },
};

// ─── CSS ───────────────────────────────────────────────────────────────────

const CSS = `
  .st-page { font-family: 'Jost', sans-serif; background: #F9F4EC; }
  .st-eyebrow { font-size: 10.5px; letter-spacing: 0.2em; text-transform: uppercase; color: #B8853A; font-weight: 600; display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
  .st-eyebrow::before { content: ''; display: block; width: 20px; height: 1.5px; background: #B8853A; flex-shrink: 0; }
  .st-eyebrow-white { color: rgba(255,255,255,0.7); }
  .st-eyebrow-white::before { background: rgba(255,255,255,0.5); }
  .st-sec { max-width: 1260px; margin: 0 auto; padding: 88px 64px; }
  .st-val-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
  .st-val-card { background: white; border-radius: 16px; border: 1px solid #EDE3D2; padding: 28px; transition: all 0.3s; cursor: default; }
  .st-val-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(15,12,8,0.09); }
  .st-team-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .st-team-card { text-align: center; }
  .st-gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .st-gallery-img { border-radius: 14px; overflow: hidden; cursor: pointer; }
  .st-gallery-img img { width: 100%; height: 200px; object-fit: cover; transition: transform 0.4s ease; display: block; }
  .st-gallery-img:hover img { transform: scale(1.05); }
  .st-timeline-line { position: absolute; left: 50%; top: 0; bottom: 0; width: 2px; background: linear-gradient(to bottom, transparent, #B8853A 10%, #B8853A 90%, transparent); transform: translateX(-50%); }
  .st-tl-item { display: grid; grid-template-columns: 1fr 56px 1fr; gap: 24px; align-items: center; margin-bottom: 40px; }
  .st-tl-dot { width: 48px; height: 48px; border-radius: 50%; background: #B8853A; display: flex; align-items: center; justify-content: center; font-family: 'Cormorant Garamond', serif; font-size: 14px; font-weight: 700; color: white; z-index: 1; position: relative; flex-shrink: 0; box-shadow: 0 0 0 6px rgba(184,133,58,0.15); }
  .st-tl-card { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 20px 24px; }
  .st-found-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
  @media (max-width: 900px) {
    .st-sec { padding: 60px 24px; }
    .st-val-grid { grid-template-columns: repeat(2, 1fr); }
    .st-team-grid { grid-template-columns: repeat(2, 1fr); }
    .st-gallery-grid { grid-template-columns: repeat(2, 1fr); }
    .st-found-grid { grid-template-columns: 1fr; gap: 32px; }
    .st-tl-item { grid-template-columns: 1fr 40px 1fr; gap: 12px; }
    .st-tl-dot { width: 36px; height: 36px; font-size: 11px; }
  }
  @media (max-width: 600px) {
    .st-val-grid { grid-template-columns: 1fr; }
    .st-team-grid { grid-template-columns: 1fr; }
    .st-gallery-grid { grid-template-columns: 1fr 1fr; }
  }
`;

// ─── Component ─────────────────────────────────────────────────────────────

export default function Story() {
  const [content, setContent] = useState<StoryContent>(DEFAULT);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/admin?action=get-page-content&page=story')
      .then(r => r.json())
      .then(d => { if (d.success && d.data) setContent({ ...DEFAULT, ...d.data }); })
      .catch(() => {});
  }, []);

  const sec = content.sections || DEFAULT.sections!;

  return (
    <>
      <SEO
        title="Our Story | Golden Lotus Indian Restaurant Alexandria, LA"
        description="Discover the story behind Golden Lotus Grill in Alexandria, Louisiana. Authentic Indian cuisine, generations-old recipes, and a passion for flavors since 2010."
        url="https://www.goldenlotusgrill.com/story"
        schema={breadcrumbSchema([
          { name: 'Home', url: 'https://www.goldenlotusgrill.com' },
          { name: 'Our Story', url: 'https://www.goldenlotusgrill.com/story' },
        ])}
      />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="st-page">

        {/* ── HERO ── */}
        {sec.hero?.visible !== false && (
          <section style={{ position: 'relative', height: '60vh', minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: content.hero.heroImage ? 'none' : '#1E1810' }}>
            {content.hero.heroImage && <img src={content.hero.heroImage} alt="Our Story" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,12,8,0.55), rgba(15,12,8,0.7))' }} />
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ display: 'block', width: 20, height: 1.5, background: '#B8853A' }} />
                <span style={{ fontSize: 10.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#B8853A', fontWeight: 600 }}>{content.hero.eyebrow}</span>
                <span style={{ display: 'block', width: 20, height: 1.5, background: '#B8853A' }} />
              </div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(40px, 6vw, 68px)', fontWeight: 400, color: 'white', lineHeight: 1.1, margin: '0 0 18px', letterSpacing: '-0.02em' }}>
                {content.hero.title}{' '}
                <em style={{ fontStyle: 'italic', color: '#C9963F' }}>{content.hero.titleItalic}</em>
              </h1>
              <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.72)', fontWeight: 300, maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>{content.hero.subtitle}</p>
            </div>
          </section>
        )}

        {/* ── FOUNDING STORY ── */}
        {sec.founding?.visible !== false && (
          <div className="st-sec">
            <div className="st-found-grid">
              <div>
                <div className="st-eyebrow">{content.founding.eyebrow}</div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 3.5vw, 48px)', fontWeight: 400, color: '#0F0C08', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 24 }}>
                  {content.founding.title}{' '}
                  <em style={{ fontStyle: 'italic', color: '#B8853A' }}>{content.founding.titleItalic}</em>
                </h2>
                <div>
                  {content.founding.story.split('\n').filter(Boolean).map((para, i) => (
                    <p key={i} style={{ fontSize: 16, lineHeight: 1.8, color: '#6B5540', fontWeight: 300, marginBottom: 16 }}>{para}</p>
                  ))}
                </div>
              </div>
              <div>
                {content.founding.image ? (
                  <div>
                    <img src={content.founding.image} alt="Our founding story" style={{ width: '100%', borderRadius: 20, boxShadow: '0 20px 60px rgba(15,12,8,0.15)', display: 'block' }} />
                    {content.founding.imageCaption && (
                      <p style={{ fontSize: 12, color: '#9E8870', fontStyle: 'italic', textAlign: 'center', marginTop: 10 }}>{content.founding.imageCaption}</p>
                    )}
                  </div>
                ) : (
                  <div style={{ aspectRatio: '4/3', background: '#F0E8D8', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #DDD0BB', flexDirection: 'column', gap: 12 }}>
                    <span style={{ fontSize: 64 }}>🍛</span>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: 80, height: 80, borderRadius: '50%', border: '1px solid rgba(184,133,58,0.3)', margin: '0 auto 8px' }} />
                      <div style={{ width: 120, height: 120, borderRadius: '50%', border: '1px dashed rgba(184,133,58,0.15)', margin: '-60px auto 0' }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TIMELINE ── */}
        {sec.timeline?.visible !== false && (
          <div style={{ background: '#1E1810', padding: '88px 64px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(184,133,58,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 64 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ width: 20, height: 1.5, background: 'rgba(255,255,255,0.4)', display: 'block' }} />
                  <span style={{ fontSize: 10.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(184,133,58,0.9)', fontWeight: 600 }}>{content.timeline.eyebrow}</span>
                  <span style={{ width: 20, height: 1.5, background: 'rgba(255,255,255,0.4)', display: 'block' }} />
                </div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 3.5vw, 48px)', fontWeight: 400, color: 'white', lineHeight: 1.15, letterSpacing: '-0.02em', margin: 0 }}>
                  {content.timeline.title}{' '}
                  <em style={{ fontStyle: 'italic', color: '#C9963F' }}>{content.timeline.titleItalic}</em>
                </h2>
              </div>
              <div style={{ position: 'relative' }}>
                <div className="st-timeline-line" />
                {content.timeline.items.map((item, i) => (
                  <div key={i} className="st-tl-item">
                    {i % 2 === 0 ? (
                      <>
                        <div className="st-tl-card" style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: '#C9963F', marginBottom: 4 }}>{item.year}</div>
                          <div style={{ fontSize: 18, fontWeight: 600, color: 'white', marginBottom: 4 }}>{item.title}</div>
                          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{item.description}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <div className="st-tl-dot">{item.year.slice(2)}</div>
                        </div>
                        <div />
                      </>
                    ) : (
                      <>
                        <div />
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <div className="st-tl-dot">{item.year.slice(2)}</div>
                        </div>
                        <div className="st-tl-card">
                          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: '#C9963F', marginBottom: 4 }}>{item.year}</div>
                          <div style={{ fontSize: 18, fontWeight: 600, color: 'white', marginBottom: 4 }}>{item.title}</div>
                          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{item.description}</div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── VALUES ── */}
        {sec.values?.visible !== false && (
          <div className="st-sec">
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ width: 20, height: 1.5, background: '#B8853A', display: 'block' }} />
                <span className="st-eyebrow" style={{ display: 'inline', margin: 0 }}>{content.values.eyebrow}</span>
                <span style={{ width: 20, height: 1.5, background: '#B8853A', display: 'block' }} />
              </div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 3.5vw, 48px)', fontWeight: 400, color: '#0F0C08', lineHeight: 1.15, letterSpacing: '-0.02em', margin: 0 }}>
                {content.values.title}{' '}
                <em style={{ fontStyle: 'italic', color: '#B8853A' }}>{content.values.titleItalic}</em>
              </h2>
            </div>
            <div className="st-val-grid">
              {content.values.items.map((v, i) => (
                <div key={i} className="st-val-card">
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F2E4C8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14 }}>{v.icon}</div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: '#0F0C08', marginBottom: 8 }}>{v.title}</h3>
                  <p style={{ fontSize: 14, color: '#9E8870', lineHeight: 1.7, margin: 0 }}>{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TEAM ── */}
        {sec.team?.visible !== false && (
          <div style={{ background: 'white', padding: '88px 64px' }}>
            <div style={{ maxWidth: 1260, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 52 }}>
                <div className="st-eyebrow" style={{ justifyContent: 'center' }}>{content.team.eyebrow}</div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 3.5vw, 48px)', fontWeight: 400, color: '#0F0C08', lineHeight: 1.15, letterSpacing: '-0.02em', margin: 0 }}>
                  {content.team.title}{' '}
                  <em style={{ fontStyle: 'italic', color: '#B8853A' }}>{content.team.titleItalic}</em>
                </h2>
              </div>
              <div className="st-team-grid">
                {content.team.members.map((m, i) => (
                  <div key={i} className="st-team-card">
                    {m.image ? (
                      <img src={m.image} alt={m.name} style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 16px', display: 'block', border: '3px solid #F2E4C8' }} />
                    ) : (
                      <div style={{ width: 120, height: 120, borderRadius: '50%', background: '#F2E4C8', border: '3px solid #DDD0BB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontFamily: "'Cormorant Garamond', serif", fontSize: 36, color: '#B8853A', fontWeight: 700 }}>
                        {m.name.charAt(0)}
                      </div>
                    )}
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: '#0F0C08', marginBottom: 4 }}>{m.name}</h3>
                    <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#B8853A', fontWeight: 600, marginBottom: 10 }}>{m.role}</div>
                    <p style={{ fontSize: 13, color: '#9E8870', lineHeight: 1.6, margin: 0 }}>{m.bio}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── GALLERY ── */}
        {sec.gallery?.visible !== false && (
          <div style={{ background: '#F0E8D8', padding: '88px 64px' }}>
            <div style={{ maxWidth: 1260, margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <div className="st-eyebrow" style={{ justifyContent: 'center' }}>{content.gallery.eyebrow}</div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 3.5vw, 48px)', fontWeight: 400, color: '#0F0C08', lineHeight: 1.15, letterSpacing: '-0.02em', margin: 0 }}>
                  {content.gallery.title}{' '}
                  <em style={{ fontStyle: 'italic', color: '#B8853A' }}>{content.gallery.titleItalic}</em>
                </h2>
              </div>
              {content.gallery.images.length > 0 ? (
                <div className="st-gallery-grid">
                  {content.gallery.images.map((img, i) => (
                    <div key={i} className="st-gallery-img">
                      <img src={img} alt={`Gallery ${i + 1}`} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ border: '2px dashed #DDD0BB', borderRadius: 16, padding: '48px 32px', textAlign: 'center' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#9E8870' }}>Gallery coming soon</div>
                  <div style={{ fontSize: 13, color: '#9E8870', marginTop: 4 }}>Photos will appear here once added from the admin panel.</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CTA ── */}
        {sec.cta?.visible !== false && (
          <div style={{ background: '#1E1810', padding: '80px 64px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(184,133,58,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto' }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 400, color: 'white', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 16 }}>
                {content.cta.title}{' '}
                <em style={{ fontStyle: 'italic', color: '#C9963F' }}>{content.cta.titleItalic}</em>
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', fontWeight: 300, lineHeight: 1.7, marginBottom: 36 }}>{content.cta.description}</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/menu?order=true')} style={{ padding: '14px 28px', background: '#B8853A', border: 'none', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'Jost', sans-serif", transition: 'all 0.25s' }} onMouseOver={e => { e.currentTarget.style.background = '#C9963F'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(184,133,58,0.4)'; }} onMouseOut={e => { e.currentTarget.style.background = '#B8853A'; e.currentTarget.style.boxShadow = 'none'; }}>
                  {content.cta.buttonText}
                </button>
                <button onClick={() => navigate('/menu')} style={{ padding: '14px 28px', background: 'transparent', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 10, color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: "'Jost', sans-serif", transition: 'all 0.25s' }} onMouseOver={e => { e.currentTarget.style.borderColor = '#B8853A'; e.currentTarget.style.color = '#C9963F'; }} onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}>
                  {content.cta.button2Text}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
