import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Check, Image, UploadCloud, Link as LinkIcon } from 'lucide-react';
import { uploadImage } from '@/lib/uploadImage';
import type { GalleryImage } from '@/types';

const authHeaders = () => {
  const token = localStorage.getItem('admin_jwt');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [formData, setFormData] = useState({ src: '', alt: '', category: 'food' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch('/api/menu?action=gallery');
      if (res.ok) setImages(await res.json());
    } catch (err) { console.error('Error loading gallery:', err); }
  };

  const saveImages = async (data: GalleryImage[]) => {
    try {
      const res = await fetch('/api/admin?action=save-gallery', {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
      });
      if (res.ok) setImages(await res.json());
    } catch (err) { console.error('Error saving gallery:', err); }
  };

  const handleAdd = () => {
    setFormData({ src: '', alt: '', category: 'food' });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      const updated = images.filter((img) => img.id !== id);
      saveImages(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.src) {
      alert("Please provide an image URL or upload an image file.");
      return;
    }

    const newImage: GalleryImage = {
      ...formData,
      id: Date.now().toString(),
    };
    saveImages([...images, newImage]);

    setIsModalOpen(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setFormData(prev => ({ ...prev, src: url }));
    } catch (error) {
      alert('Failed to upload image. Please try again or use a URL.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-lotus-dark">Gallery</h1>
          <p className="text-gray-600">Manage restaurant photos</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Image
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative group">
            <img
              src={image.src}
              alt={image.alt}
              className="w-full aspect-square object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
              <button
                onClick={() => handleDelete(image.id)}
                className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <span className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
              {image.category}
            </span>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No images in gallery</p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-lotus-dark">Add Image</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Image</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setUploadMethod('url')}
                      className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${uploadMethod === 'url' ? 'bg-lotus-gold text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      <LinkIcon className="w-3 h-3" /> URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMethod('file')}
                      className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${uploadMethod === 'file' ? 'bg-lotus-gold text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      <UploadCloud className="w-3 h-3" /> Upload
                    </button>
                  </div>
                </div>

                {uploadMethod === 'url' ? (
                  <input
                    type="url"
                    value={formData.src}
                    onChange={(e) => setFormData({ ...formData, src: e.target.value })}
                    required
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                  />
                ) : (
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-lotus-gold transition-colors">
                    <div className="space-y-1 text-center">
                      {isUploading ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lotus-gold mb-2"></div>
                          <p className="text-sm text-gray-500">Uploading...</p>
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600 justify-center">
                            <label
                              htmlFor="file-upload-gallery"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-lotus-gold hover:text-lotus-gold-dark focus-within:outline-none"
                            >
                              <span>Upload a file</span>
                              <input id="file-upload-gallery" name="file-upload-gallery" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                            </label>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
                {formData.src && uploadMethod === 'file' && !isUploading && (
                  <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Image uploaded successfully
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
                <input
                  type="text"
                  value={formData.alt}
                  onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                >
                  <option value="food">Food</option>
                  <option value="ambience">Ambience</option>
                  <option value="events">Events</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

              {formData.src && (
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img src={formData.src} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isUploading} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                  <Check className="w-4 h-4" />
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
