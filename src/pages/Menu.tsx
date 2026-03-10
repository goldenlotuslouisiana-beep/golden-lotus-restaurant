import { useState, useEffect } from 'react';
import { Search, ShoppingBag, Plus, Minus, X, Tag } from 'lucide-react';
import { DataStore } from '@/data/store';
import type { MenuItem, MenuCategory, Coupon } from '@/types';

interface CartItem extends MenuItem {
  quantity: number;
}

export default function Menu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [activeCategory, setActiveCategory] = useState('Popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch('/api/menu');
        if (res.ok) {
          const items = await res.json();
          setMenuItems(items);
        } else {
          setMenuItems(DataStore.getMenuItems()); // Fallback
        }
      } catch (e) {
        setMenuItems(DataStore.getMenuItems()); // Fallback
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenu();
    setCategories(DataStore.getMenuCategories());
    setCoupons(DataStore.getCoupons().filter(c => c.active));
  }, []);

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === 'Popular'
      ? item.popular
      : item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newQuantity = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter((item) => item.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="section-padding py-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lotus-gold"
              />
            </div>

            {/* Order Type */}
            <div className="flex gap-2">
              <button
                onClick={() => setOrderType('pickup')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${orderType === 'pickup'
                  ? 'bg-lotus-gold text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Pickup
              </button>
              <button
                onClick={() => setOrderType('delivery')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${orderType === 'delivery'
                  ? 'bg-lotus-gold text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Delivery
              </button>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-lotus-gold text-white rounded-lg hover:bg-lotus-gold-dark transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Cart ({cartCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white border-b sticky top-[129px] z-20">
        <div className="section-padding">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-3">
            <button
              onClick={() => setActiveCategory('Popular')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === 'Popular'
                ? 'bg-lotus-gold text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Popular
            </button>
            {categories.filter(c => c.name !== 'Popular').map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.name)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeCategory === category.name
                  ? 'bg-lotus-gold text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Coupons */}
      {coupons.length > 0 && (
        <div className="section-padding py-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-lotus-gold" />
            Discounts
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="bg-lotus-gold/10 border border-lotus-gold/20 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-lotus-gold text-white text-xs font-bold rounded">
                    {coupon.code}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{coupon.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="section-padding py-8">
        <h2 className="heading-sm text-lotus-dark mb-6">{activeCategory}</h2>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lotus-gold"></div>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    {item.popular && (
                      <span className="absolute top-3 left-3 px-2 py-1 bg-lotus-gold text-white text-xs font-bold rounded">
                        Popular
                      </span>
                    )}
                    {item.isVegetarian && (
                      <span className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
                        Veg
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-lotus-dark mb-1 line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-lotus-gold">
                        ${item.price.toFixed(2)}
                      </span>
                      <button
                        onClick={() => addToCart(item)}
                        className="w-10 h-10 bg-lotus-gold text-white rounded-full flex items-center justify-center hover:bg-lotus-gold-dark transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {
              filteredItems.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No items found in this category.</p>
                </div>
              )
            }
          </>
        )}
      </div>

      {/* Cart Sidebar */}
      {
        isCartOpen && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsCartOpen(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl animate-slide-in-right">
              <div className="flex flex-col h-full">
                {/* Cart Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <ShoppingBag className="w-6 h-6" />
                    Your Cart ({cartCount})
                  </h2>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Your cart is empty</p>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="mt-4 text-lotus-gold hover:underline"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-4 bg-gray-50 rounded-lg p-3"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-lotus-dark line-clamp-1">
                              {item.name}
                            </h4>
                            <p className="text-lotus-gold font-bold">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-7 h-7 bg-white border rounded-full flex items-center justify-center hover:bg-gray-100"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-7 h-7 bg-white border rounded-full flex items-center justify-center hover:bg-gray-100"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="ml-auto text-gray-400 hover:text-red-500"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cart Footer */}
                {cart.length > 0 && (
                  <div className="border-t p-4 space-y-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <button className="w-full btn-primary py-3">
                      Checkout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
