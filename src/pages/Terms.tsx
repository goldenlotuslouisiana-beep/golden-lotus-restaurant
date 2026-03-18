import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO, { breadcrumbSchema } from '@/components/SEO';

interface LegalContent {
  title: string;
  subtitle: string;
  lastUpdated: string;
  content: string;
}

const DEFAULT: LegalContent = {
  title: 'Terms of Service',
  subtitle: 'Please read these terms carefully',
  lastUpdated: '2026-03-19',
  content: '',
};

const CSS = `
  .legal-page { background: #F9F4EC; min-height: 100vh; font-family: 'Jost', sans-serif; }
  .legal-inner { max-width: 800px; margin: 0 auto; padding: 80px 24px 96px; }
  .legal-eyebrow { font-size: 10.5px; letter-spacing: 0.2em; text-transform: uppercase; color: #B8853A; font-weight: 600; margin-bottom: 12px; }
  .legal-h1 { font-family: 'Cormorant Garamond', serif; font-size: clamp(36px, 5vw, 52px); font-weight: 400; color: #0F0C08; line-height: 1.1; letter-spacing: -0.02em; margin: 0 0 10px; }
  .legal-updated { font-size: 13px; color: #9E8870; margin-bottom: 24px; }
  .legal-divider { height: 1px; background: linear-gradient(to right, #B8853A, #DDD0BB); margin-bottom: 40px; }
  .legal-content { font-size: 15px; color: #6B5540; line-height: 1.85; }
  .legal-content p { margin-bottom: 18px; }
  .legal-content h2 { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 600; color: #0F0C08; margin: 32px 0 12px; }
  .legal-content strong, .legal-content b { color: #0F0C08; font-weight: 600; }
  .legal-content em, .legal-content i { color: #B8853A; font-style: italic; }
  .legal-placeholder { background: #F2E4C8; border: 2px dashed #DDD0BB; border-radius: 16px; padding: 48px 32px; text-align: center; }
  .legal-footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #EDE3D2; }
`;

function renderContent(text: string) {
  if (!text) return null;
  return text.split('\n').filter(l => l.trim()).map((line, i) => {
    if (line.startsWith('## ')) return <h2 key={i}>{line.slice(3)}</h2>;
    const formatted = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/_(.+?)_/g, '<em>$1</em>');
    return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
  });
}

export default function Terms() {
  const [content, setContent] = useState<LegalContent>(DEFAULT);

  useEffect(() => {
    fetch('/api/admin?action=get-page-content&page=terms')
      .then(r => r.json())
      .then(d => { if (d.success && d.data) setContent({ ...DEFAULT, ...d.data }); })
      .catch(() => {});
  }, []);

  const formattedDate = (() => {
    try {
      return new Date(content.lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return content.lastUpdated; }
  })();

  return (
    <>
      <SEO
        title="Terms of Service | Golden Lotus Indian Restaurant"
        description="Terms of Service for Golden Lotus Grill. Learn about our ordering, cancellation, and service policies."
        url="https://www.goldenlotusgrill.com/terms"
        schema={breadcrumbSchema([
          { name: 'Home', url: 'https://www.goldenlotusgrill.com' },
          { name: 'Terms of Service', url: 'https://www.goldenlotusgrill.com/terms' },
        ])}
      />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="legal-page">
        <div className="legal-inner">
          <div className="legal-eyebrow">Legal</div>
          <h1 className="legal-h1">{content.title}</h1>
          <p className="legal-updated">Last updated: {formattedDate}</p>
          <div className="legal-divider" />

          {content.content ? (
            <div className="legal-content">{renderContent(content.content)}</div>
          ) : (
            <div className="legal-placeholder">
              <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#0F0C08', marginBottom: 8 }}>Terms of Service coming soon</h3>
              <p style={{ fontSize: 14, color: '#9E8870', maxWidth: 360, margin: '0 auto' }}>Our terms of service are being updated. Please check back later or contact us with any questions.</p>
            </div>
          )}

          <div className="legal-footer">
            <p style={{ fontSize: 14, color: '#6B5540' }}>
              Questions about our terms?{' '}
              <a href="mailto:hello@goldenlotusgrill.com" style={{ color: '#B8853A', fontWeight: 600, textDecoration: 'none' }}>hello@goldenlotusgrill.com</a>
            </p>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#9E8870', textDecoration: 'none', marginTop: 12 }}>
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
