import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, X, Check, Star, Leaf, UploadCloud, Link as LinkIcon } from 'lucide-react';
import { DataStore } from '@/data/store';
import { uploadImage } from '@/lib/uploadImage';
import type { MenuItem } from '@/types';

export default function AdminMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    category: '',
    image: '',
    popular: false,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const items = await res.json();
        setMenuItems(items);
      }
      // Categories stay in local storage for now
      const cats = DataStore.getMenuCategories();
      setCategories(cats.map((c) => c.name));
    } catch (error) {
      console.error('Failed to load menu items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: categories[0] || '',
      image: '',
      popular: false,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
    });
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setImagePreview(item.image || null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        const token = localStorage.getItem('admin_jwt');
        await fetch(`/api/menu?id=${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        loadData();
      } catch (error) {
        console.error('Failed to delete item:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_jwt');

    try {
      if (editingItem) {
        await fetch('/api/menu', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ...formData, id: editingItem.id })
        });
      } else {
        await fetch('/api/menu', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save menu item:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? (value === '' ? '' : parseFloat(value)) : value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);

    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setFormData(prev => ({ ...prev, image: url }));
      setImagePreview(url); // Update preview with permanent URL
    } catch (error) {
      alert('Failed to upload image. Please try again or use a URL.');
      setImagePreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-lotus-dark">Menu Items</h1>
          <p className="text-gray-600">Manage your restaurant menu</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Item
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Item</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Price</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-lotus-dark">{item.name}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-lotus-gold">${item.price.toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {item.popular && (
                        <span className="px-2 py-0.5 bg-lotus-gold/10 text-lotus-gold text-xs rounded">
                          <Star className="w-3 h-3 inline" /> Popular
                        </span>
                      )}
                      {item.isVegetarian && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                          <Leaf className="w-3 h-3 inline" /> Veg
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading menu items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No menu items found</p>
          </div>
        ) : null}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-lotus-dark">
                {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
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

                  {imagePreview ? (
                    <div className="mt-2">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        onError={() => setImagePreview(null)}
                      />
                      {formData.image && uploadMethod === 'file' && !isUploading && (
                        <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Image uploaded successfully
                        </p>
                      )}
                      <button 
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          if (uploadMethod === 'file') {
                            setFormData(prev => ({ ...prev, image: '' }));
                          }
                        }}
                        className="mt-3 text-sm text-orange-500 border border-orange-500 rounded px-3 py-1.5 hover:bg-orange-50 transition-colors"
                      >
                        Change Image
                      </button>
                    </div>
                  ) : (
                    <>
                      {uploadMethod === 'url' ? (
                        <input
                          type="url"
                          name="image"
                          value={formData.image}
                          onChange={(e) => {
                            handleChange(e);
                            // Debounce could be added here, but direct setting is fine for simple URLs
                            setTimeout(() => setImagePreview(e.target.value), 500);
                          }}
                          required
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold mt-2"
                        />
                      ) : (
                        <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-lotus-gold transition-colors">
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
                                    htmlFor="file-upload"
                                    className="relative cursor-pointer bg-white rounded-md font-medium text-lotus-gold hover:text-lotus-gold-dark focus-within:outline-none"
                                  >
                                    <span>Upload a file</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                                  </label>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="sm:col-span-2 flex flex-wrap gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="popular"
                      checked={formData.popular}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-lotus-gold focus:ring-lotus-gold"
                    />
                    <span className="text-sm">Popular</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isVegetarian"
                      checked={formData.isVegetarian}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-lotus-gold focus:ring-lotus-gold"
                    />
                    <span className="text-sm">Vegetarian</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isVegan"
                      checked={formData.isVegan}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-lotus-gold focus:ring-lotus-gold"
                    />
                    <span className="text-sm">Vegan</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isGlutenFree"
                      checked={formData.isGlutenFree}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-lotus-gold focus:ring-lotus-gold"
                    />
                    <span className="text-sm">Gluten Free</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isUploading} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                  <Check className="w-4 h-4" />
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
