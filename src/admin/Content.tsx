import { useState, useEffect } from 'react';
import { Save, Check, UploadCloud, Link as LinkIcon } from 'lucide-react';
import { DataStore } from '@/data/store';
import { uploadImage } from '@/lib/uploadImage';
import type { SiteContent } from '@/types';

type UploadMethod = 'url' | 'file';

interface ImageFieldState {
  method: UploadMethod;
  isUploading: boolean;
  preview: string | null;
}

export default function AdminContent() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [activeTab, setActiveTab] = useState('hero');
  const [saved, setSaved] = useState(false);
  
  // Track upload method and state for each image field
  const [imageStates, setImageStates] = useState<Record<string, ImageFieldState>>({
    'hero.backgroundImage': { method: 'url', isUploading: false, preview: null },
    'about.image': { method: 'url', isUploading: false, preview: null },
    'cuisine.image': { method: 'url', isUploading: false, preview: null },
    'bar.image': { method: 'url', isUploading: false, preview: null },
    'catering.image': { method: 'url', isUploading: false, preview: null },
  });

  useEffect(() => {
    const data = DataStore.getSiteContent();
    setContent(data);
    
    // Initialize previews from existing data
    setImageStates(prev => ({
      'hero.backgroundImage': { ...prev['hero.backgroundImage'], preview: data?.hero?.backgroundImage || null },
      'about.image': { ...prev['about.image'], preview: data?.about?.image || null },
      'cuisine.image': { ...prev['cuisine.image'], preview: data?.cuisine?.image || null },
      'bar.image': { ...prev['bar.image'], preview: data?.bar?.image || null },
      'catering.image': { ...prev['catering.image'], preview: data?.catering?.image || null },
    }));
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
    { id: 'ambience', label: 'Ambience' },
    { id: 'catering', label: 'Catering' },
    { id: 'rewards', label: 'Rewards' },
    { id: 'orderCTA', label: 'Order CTA' },
    { id: 'legal', label: 'Legal Pages' },
    { id: 'footer', label: 'Footer Links' },
    { id: 'settings', label: 'Page Settings' },
  ];

  const setUploadMethod = (fieldKey: string, method: UploadMethod) => {
    setImageStates(prev => ({
      ...prev,
      [fieldKey]: { ...prev[fieldKey], method }
    }));
  };

  const handleImageUpload = async (fieldKey: string, section: keyof SiteContent, field: string, file: File) => {
    if (!file || !content) return;

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setImageStates(prev => ({
      ...prev,
      [fieldKey]: { ...prev[fieldKey], preview: objectUrl, isUploading: true }
    }));

    try {
      const url = await uploadImage(file);
      // Update content with the uploaded image URL
      setContent({
        ...content,
        [section]: {
          ...content[section],
          [field]: url,
        },
      });
      setImageStates(prev => ({
        ...prev,
        [fieldKey]: { ...prev[fieldKey], preview: url, isUploading: false }
      }));
    } catch (error) {
      alert('Failed to upload image. Please try again or use a URL.');
      setImageStates(prev => ({
        ...prev,
        [fieldKey]: { ...prev[fieldKey], preview: null, isUploading: false }
      }));
    }
  };

  const handleImageUrlChange = (fieldKey: string, section: keyof SiteContent, field: string, value: string) => {
    updateField(section, field, value);
    setImageStates(prev => ({
      ...prev,
      [fieldKey]: { ...prev[fieldKey], preview: value }
    }));
  };

  const clearImage = (fieldKey: string, section: keyof SiteContent, field: string) => {
    updateField(section, field, '');
    setImageStates(prev => ({
      ...prev,
      [fieldKey]: { ...prev[fieldKey], preview: null }
    }));
  };

  // Reusable Image Upload Component
  const ImageUploadField = ({ 
    fieldKey, 
    section, 
    field, 
    label 
  }: { 
    fieldKey: string; 
    section: keyof SiteContent; 
    field: string; 
    label: string;
  }) => {
    const state = imageStates[fieldKey] || { method: 'url', isUploading: false, preview: null };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentValue = ((content as unknown as Record<string, Record<string, string>>)?.[section]?.[field]) || '';

    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">{label}</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setUploadMethod(fieldKey, 'url')}
              className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${state.method === 'url' ? 'bg-lotus-gold text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <LinkIcon className="w-3 h-3" /> URL
            </button>
            <button
              type="button"
              onClick={() => setUploadMethod(fieldKey, 'file')}
              className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${state.method === 'file' ? 'bg-lotus-gold text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <UploadCloud className="w-3 h-3" /> Upload
            </button>
          </div>
        </div>

        {state.preview ? (
          <div className="mt-2">
            <img 
              src={state.preview} 
              alt="Preview" 
              className="w-full h-48 object-cover rounded-lg border border-gray-200"
              onError={() => setImageStates(prev => ({ ...prev, [fieldKey]: { ...prev[fieldKey], preview: null } }))}
            />
            {currentValue && state.method === 'file' && !state.isUploading && (
              <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                <Check className="w-3 h-3" /> Image uploaded successfully
              </p>
            )}
            <button 
              type="button"
              onClick={() => clearImage(fieldKey, section, field)}
              className="mt-3 text-sm text-orange-500 border border-orange-500 rounded px-3 py-1.5 hover:bg-orange-50 transition-colors"
            >
              Change Image
            </button>
          </div>
        ) : (
          <>
            {state.method === 'url' ? (
              <input
                type="url"
                value={currentValue}
                onChange={(e) => handleImageUrlChange(fieldKey, section, field, e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold mt-2"
              />
            ) : (
              <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-lotus-gold transition-colors">
                <div className="space-y-1 text-center">
                  {state.isUploading ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lotus-gold mb-2"></div>
                      <p className="text-sm text-gray-500">Uploading...</p>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label
                          htmlFor={`file-upload-${fieldKey}`}
                          className="relative cursor-pointer bg-white rounded-md font-medium text-lotus-gold hover:text-lotus-gold-dark focus-within:outline-none"
                        >
                          <span>Upload a file</span>
                          <input 
                            id={`file-upload-${fieldKey}`} 
                            type="file" 
                            className="sr-only" 
                            accept="image/*" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(fieldKey, section, field, file);
                            }} 
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

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
            <ImageUploadField 
              fieldKey="hero.backgroundImage"
              section="hero"
              field="backgroundImage"
              label="Background Image"
            />
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
            <ImageUploadField 
              fieldKey="about.image"
              section="about"
              field="image"
              label="Image"
            />
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
            <ImageUploadField 
              fieldKey="cuisine.image"
              section="cuisine"
              field="image"
              label="Image"
            />
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
            <ImageUploadField 
              fieldKey="bar.image"
              section="bar"
              field="image"
              label="Image"
            />
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
            <ImageUploadField 
              fieldKey="catering.image"
              section="catering"
              field="image"
              label="Image"
            />
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

        {activeTab === 'ambience' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-lotus-dark">Ambience Section</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={content.ambience.title}
                onChange={(e) => updateField('ambience', 'title', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={content.ambience.description}
                onChange={(e) => updateField('ambience', 'description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold resize-none"
              />
            </div>
          </div>
        )}

        {activeTab === 'orderCTA' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-lotus-dark">Order CTA Section</h3>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
              <input
                type="checkbox"
                id="orderCTAEnabled"
                checked={content.orderCTA?.enabled !== false}
                onChange={(e) => {
                  setContent({
                    ...content,
                    orderCTA: {
                      title: content.orderCTA?.title || 'Order From Our Website!',
                      description: content.orderCTA?.description || '',
                      buttonText: content.orderCTA?.buttonText || 'Order Now',
                      enabled: e.target.checked
                    }
                  });
                }}
                className="w-4 h-4 rounded border-gray-300 text-lotus-gold focus:ring-lotus-gold"
              />
              <label htmlFor="orderCTAEnabled" className="text-sm font-medium text-gray-700">
                Enable Order CTA Section
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={content.orderCTA?.title || ''}
                onChange={(e) => {
                  setContent({
                    ...content,
                    orderCTA: { 
                      title: e.target.value,
                      description: content.orderCTA?.description || '',
                      buttonText: content.orderCTA?.buttonText || 'Order Now',
                      enabled: content.orderCTA?.enabled !== false
                    }
                  });
                }}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={content.orderCTA?.description || ''}
                onChange={(e) => {
                  setContent({
                    ...content,
                    orderCTA: { 
                      title: content.orderCTA?.title || 'Order From Our Website!',
                      description: e.target.value,
                      buttonText: content.orderCTA?.buttonText || 'Order Now',
                      enabled: content.orderCTA?.enabled !== false
                    }
                  });
                }}
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
              <input
                type="text"
                value={content.orderCTA?.buttonText || ''}
                onChange={(e) => {
                  setContent({
                    ...content,
                    orderCTA: { 
                      title: content.orderCTA?.title || 'Order From Our Website!',
                      description: content.orderCTA?.description || '',
                      buttonText: e.target.value,
                      enabled: content.orderCTA?.enabled !== false
                    }
                  });
                }}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
              />
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-lotus-dark">Home Page Section Visibility</h3>
            <p className="text-gray-600 text-sm">Control which sections are visible on the home page. Toggle sections on/off to customize your homepage.</p>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { key: 'showHero', label: 'Hero Section', description: 'Main banner with title and CTA' },
                { key: 'showFeaturedDishes', label: 'Featured Dishes', description: 'Popular menu items carousel' },
                { key: 'showAbout', label: 'About Section', description: 'Welcome/about restaurant text' },
                { key: 'showOrderCTA', label: 'Order CTA', description: 'Order call-to-action banner' },
                { key: 'showGallery', label: 'Gallery Section', description: 'Photo gallery carousel' },
                { key: 'showAmbience', label: 'Ambience Section', description: 'Restaurant atmosphere description' },
                { key: 'showCatering', label: 'Catering Section', description: 'Catering services promo' },
                { key: 'showTestimonials', label: 'Testimonials', description: 'Customer reviews' },
                { key: 'showFeatures', label: 'Features Badges', description: 'Delivery, Takeout badges' },
                { key: 'showRewards', label: 'Rewards Section', description: 'Loyalty program promo' },
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="font-medium text-lotus-dark text-sm">{setting.label}</p>
                    <p className="text-xs text-gray-500">{setting.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={content.settings?.[setting.key as keyof typeof content.settings] !== false}
                      onChange={(e) => {
                        setContent({
                          ...content,
                          settings: {
                            ...content.settings,
                            [setting.key]: e.target.checked
                          }
                        });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-lotus-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lotus-gold"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'legal' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-lotus-dark mb-2">Terms of Service</h3>
              <p className="text-gray-600 text-sm mb-4">Edit the content for your Terms of Service page. HTML is supported.</p>
              <textarea
                value={content.legal?.termsOfService || ''}
                onChange={(e) => {
                  setContent({
                    ...content,
                    legal: {
                      ...content.legal,
                      termsOfService: e.target.value,
                      privacyPolicy: content.legal?.privacyPolicy || ''
                    }
                  });
                }}
                rows={15}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold resize-none font-mono text-sm"
              />
            </div>

            <div className="pt-6 border-t">
              <h3 className="text-lg font-bold text-lotus-dark mb-2">Privacy Policy</h3>
              <p className="text-gray-600 text-sm mb-4">Edit the content for your Privacy Policy page. HTML is supported.</p>
              <textarea
                value={content.legal?.privacyPolicy || ''}
                onChange={(e) => {
                  setContent({
                    ...content,
                    legal: {
                      ...content.legal,
                      termsOfService: content.legal?.termsOfService || '',
                      privacyPolicy: e.target.value
                    }
                  });
                }}
                rows={15}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold resize-none font-mono text-sm"
              />
            </div>
          </div>
        )}

        {activeTab === 'footer' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-lotus-dark">Footer Link Visibility</h3>
            <p className="text-gray-600 text-sm">Control which links appear in the footer "More" section.</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="font-medium text-lotus-dark text-sm">Gift Cards</p>
                  <p className="text-xs text-gray-500">Show/hide Gift Cards link in footer</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={content.footerSettings?.showGiftCards !== false}
                    onChange={(e) => {
                      setContent({
                        ...content,
                        footerSettings: {
                          showGiftCards: e.target.checked,
                          showHiring: content.footerSettings?.showHiring !== false
                        }
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-lotus-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lotus-gold"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="font-medium text-lotus-dark text-sm">We're Hiring</p>
                  <p className="text-xs text-gray-500">Show/hide We're Hiring link in footer</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={content.footerSettings?.showHiring !== false}
                    onChange={(e) => {
                      setContent({
                        ...content,
                        footerSettings: {
                          showGiftCards: content.footerSettings?.showGiftCards !== false,
                          showHiring: e.target.checked
                        }
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-lotus-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lotus-gold"></div>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
