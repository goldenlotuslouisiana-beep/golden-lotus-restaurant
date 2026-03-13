import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, Star, Eye, EyeOff, Settings } from 'lucide-react';
import { DataStore } from '@/data/store';
import type { Testimonial, SiteContent } from '@/types';

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({ name: '', rating: 5, text: '', published: true });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTestimonials(DataStore.getTestimonials());
    setSiteContent(DataStore.getSiteContent());
  };

  const handleAdd = () => {
    setEditingTestimonial(null);
    setFormData({ name: '', rating: 5, text: '', published: true });
    setIsModalOpen(true);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({ 
      name: testimonial.name, 
      rating: testimonial.rating, 
      text: testimonial.text,
      published: testimonial.published !== false 
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      const updated = testimonials.filter((t) => t.id !== id);
      DataStore.setTestimonials(updated);
      loadData();
    }
  };

  const togglePublished = (testimonial: Testimonial) => {
    const updated = testimonials.map((t) =>
      t.id === testimonial.id ? { ...t, published: !t.published } : t
    );
    DataStore.setTestimonials(updated);
    loadData();
  };

  const toggleSectionVisibility = () => {
    if (!siteContent) return;
    const updatedContent = {
      ...siteContent,
      settings: {
        ...siteContent.settings,
        showTestimonials: !siteContent.settings?.showTestimonials
      }
    };
    DataStore.setSiteContent(updatedContent);
    loadData();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTestimonial) {
      const updated = testimonials.map((t) =>
        t.id === editingTestimonial.id ? { ...t, ...formData } : t
      );
      DataStore.setTestimonials(updated);
    } else {
      const newTestimonial: Testimonial = {
        ...formData,
        id: Date.now().toString(),
        date: new Date().toISOString(),
      };
      DataStore.setTestimonials([...testimonials, newTestimonial]);
    }
    
    setIsModalOpen(false);
    loadData();
  };

  const publishedCount = testimonials.filter(t => t.published !== false).length;
  const isSectionVisible = siteContent?.settings?.showTestimonials !== false;

  return (
    <div className="space-y-6">
      {/* Header with Section Toggle */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-lotus-dark">Testimonials</h1>
            <p className="text-gray-600">Manage customer reviews and section visibility</p>
          </div>
          <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Testimonial
          </button>
        </div>

        {/* Section Visibility Toggle */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-lotus-gold" />
              <div>
                <h3 className="font-medium text-lotus-dark">Testimonials Section Visibility</h3>
                <p className="text-sm text-gray-500">
                  {isSectionVisible 
                    ? 'Section is visible on the home page' 
                    : 'Section is hidden from the home page'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleSectionVisibility}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isSectionVisible
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {isSectionVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {isSectionVisible ? 'Visible' : 'Hidden'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex gap-6 text-sm">
          <div>
            <span className="text-gray-500">Total:</span>{' '}
            <span className="font-medium text-lotus-dark">{testimonials.length}</span>
          </div>
          <div>
            <span className="text-gray-500">Published:</span>{' '}
            <span className="font-medium text-green-600">{publishedCount}</span>
          </div>
          <div>
            <span className="text-gray-500">Hidden:</span>{' '}
            <span className="font-medium text-gray-600">{testimonials.length - publishedCount}</span>
          </div>
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className={`bg-white rounded-xl shadow-sm p-6 transition-opacity ${testimonial.published === false ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < testimonial.rating
                        ? 'fill-lotus-gold text-lotus-gold'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => togglePublished(testimonial)}
                  className={`p-2 rounded-lg transition-colors ${
                    testimonial.published !== false
                      ? 'text-green-600 hover:bg-green-50'
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                  title={testimonial.published !== false ? 'Published - Click to hide' : 'Hidden - Click to publish'}
                >
                  {testimonial.published !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleEdit(testimonial)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(testimonial.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-gray-700 mb-4 line-clamp-4">{testimonial.text}</p>
            <div className="flex items-center justify-between">
              <p className="font-medium text-lotus-dark">{testimonial.name}</p>
              {testimonial.published === false && (
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded">Hidden</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {testimonials.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">No testimonials yet. Add your first one!</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-lotus-dark">
                {editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= formData.rating
                            ? 'fill-lotus-gold text-lotus-gold'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold resize-none"
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-lotus-gold focus:ring-lotus-gold"
                />
                <label htmlFor="published" className="text-sm font-medium text-gray-700">
                  Show on website
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {editingTestimonial ? 'Save' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
