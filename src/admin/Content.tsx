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
    { id: 'awards', label: 'Awards' },
    { id: 'cuisine', label: 'Cuisine' },
    { id: 'bar', label: 'Bar' },
    { id: 'catering', label: 'Catering' },
    { id: 'visitUs', label: 'Visit Us' },
    { id: 'rewards', label: 'Rewards' },
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
      </div>
    </div>
  );
}
