import { useState, useEffect } from 'react';
import { Save, Check } from 'lucide-react';
import { DataStore } from '@/data/store';
import type { SiteContent } from '@/types';

export default function AdminContent() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [activeTab, setActiveTab] = useState('hero');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setContent(DataStore.getSiteContent());
  }, []);

  const handleSave = () => {
    if (content) {
      DataStore.setSiteContent(content);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const updateField = (section: keyof SiteContent, field: string, value: string) => {
    if (!content) return;
    setContent({
      ...content,
      [section]: {
        ...content[section],
        [field]: value,
      },
    });
  };

  const tabs = [
    { id: 'hero', label: 'Hero Section' },
    { id: 'about', label: 'About' },
    { id: 'awards', label: 'Awards' },
    { id: 'cuisine', label: 'Cuisine' },
    { id: 'bar', label: 'Bar' },
    { id: 'catering', label: 'Catering' },
    { id: 'visitUs', label: 'Visit Us' },
    { id: 'rewards', label: 'Rewards' },
  ];

  if (!content) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-lotus-dark">Site Content</h1>
          <p className="text-gray-600">Manage website content and text</p>
        </div>
        <button
          onClick={handleSave}
          className={`btn-primary flex items-center gap-2 ${saved ? 'bg-green-600' : ''}`}
        >
          {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-lotus-gold text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {activeTab === 'hero' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-lotus-dark">Hero Section</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={content.hero.title}
                onChange={(e) => updateField('hero', 'title', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <textarea
                value={content.hero.subtitle}
                onChange={(e) => updateField('hero', 'subtitle', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Background Image URL</label>
              <input
                type="url"
                value={content.hero.backgroundImage}
                onChange={(e) => updateField('hero', 'backgroundImage', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
              />
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-lotus-dark">About Section</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={content.about.title}
                onChange={(e) => updateField('about', 'title', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={content.about.content}
                onChange={(e) => updateField('about', 'content', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                value={content.about.image}
                onChange={(e) => updateField('about', 'image', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
              />
            </div>
          </div>
        )}

        {activeTab === 'awards' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-lotus-dark">Awards Section</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={content.awards.title}
                onChange={(e) => updateField('awards', 'title', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={content.awards.description}
                onChange={(e) => updateField('awards', 'description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Read More Link</label>
              <input
                type="url"
                value={content.awards.link}
                onChange={(e) => updateField('awards', 'link', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
              />
            </div>
          </div>
        )}

        {activeTab === 'cuisine' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-lotus-dark">Cuisine Section</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={content.cuisine.title}
                onChange={(e) => updateField('cuisine', 'title', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={content.cuisine.description}
                onChange={(e) => updateField('cuisine', 'description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                value={content.cuisine.image}
                onChange={(e) => updateField('cuisine', 'image', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
              />
            </div>
          </div>
        )}

        {activeTab === 'bar' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-lotus-dark">Bar Section</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={content.bar.title}
                onChange={(e) => updateField('bar', 'title', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={content.bar.description}
                onChange={(e) => updateField('bar', 'description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                value={content.bar.image}
                onChange={(e) => updateField('bar', 'image', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
              />
            </div>
          </div>
        )}

        {activeTab === 'catering' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-lotus-dark">Catering Section</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={content.catering.title}
                onChange={(e) => updateField('catering', 'title', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={content.catering.description}
                onChange={(e) => updateField('catering', 'description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                value={content.catering.image}
                onChange={(e) => updateField('catering', 'image', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
              />
            </div>
          </div>
        )}

        {activeTab === 'visitUs' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-lotus-dark">Visit Us Section</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={content.visitUs.title}
                onChange={(e) => updateField('visitUs', 'title', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={content.visitUs.content}
                onChange={(e) => updateField('visitUs', 'content', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold resize-none"
              />
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-lotus-dark">Rewards Section</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={content.rewards.title}
                onChange={(e) => updateField('rewards', 'title', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={content.rewards.description}
                onChange={(e) => updateField('rewards', 'description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold resize-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
