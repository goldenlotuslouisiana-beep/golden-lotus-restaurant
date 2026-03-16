import { useEffect, useState } from 'react';
import SEO from '@/components/SEO';

export default function Privacy() {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/api/menu?action=site-content')
      .then(r => r.json())
      .then(data => setContent(data?.legal?.privacyPolicy || ''))
      .catch(err => console.error('Error loading privacy policy:', err));
  }, []);

  return (
    <>
      <SEO
        title="Privacy Policy | Golden Lotus"
        description="Read the Privacy Policy for Golden Lotus Indian Restaurant."
        url="https://www.goldenlotusgrill.com/privacy"
      />
      <div className="min-h-screen bg-gray-50 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm p-8 lg:p-12">
            <div 
              className="[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mb-2 [&_h3]:mt-6 [&_p]:text-gray-600 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_li]:text-gray-600 [&_li]:mb-1"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
