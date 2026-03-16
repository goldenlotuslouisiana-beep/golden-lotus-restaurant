import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Plus, Minus, X, Tag, Flame, Leaf, Sparkles, ChevronRight, Trash2 } from 'lucide-react';
import type { MenuItem, MenuCategory, Coupon } from '@/types';
import SEO, { breadcrumbSchema } from '@/components/SEO';
import { motion, AnimatePresence } from 'framer-motion';

interface CartItem extends MenuItem {
  quantity: number;
}

export default function Menu() {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [activeCategory, setActiveCategory] = useState('Popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddedToast, setShowAddedToast] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, catRes, couponRes] = await Promise.all([
          fetch('/api/menu?action=items'),
          fetch('/api/menu?action=menu-categories'),
          fetch('/api/admin?action=coupons'),
        ]);
        if (menuRes.ok) setMenuItems(await menuRes.json());
        if (catRes.ok) setCategories(await catRes.json());
        if (couponRes.ok) {
          const allCoupons = await couponRes.json();
          setCoupons(Array.isArray(allCoupons) ? allCoupons.filter((c: Coupon) => c.active) : []);
        }
      } catch (err) {
        console.error('Error loading menu data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = activeCategory === 'Popular'
        ? item.popular
        : item.category === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, activeCategory, searchQuery]);

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
    setShowAddedToast(item.id);
    setTimeout(() => setShowAddedToast(null), 1500);
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

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <SEO 
        title="Our Menu | Authentic Indian Dishes | Golden Lotus Alexandria, LA"
        description="Explore our menu of authentic Indian cuisine in Alexandria, Louisiana. From flavorful curries to fresh tandoori dishes, vegetarian options, and more."
        url="https://www.goldenlotusgrill.com/menu"
        schema={breadcrumbSchema([
          { name: 'Home', url: 'https://www.goldenlotusgrill.com' },
          { name: 'Menu', url: 'https://www.goldenlotusgrill.com/menu' },
        ])}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Page Title - Mobile */}
              <div className="lg:hidden">
                <h1 className="text-xl font-bold text-lotus-dark font-serif">Our Menu</h1>
              </div>
              
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-lotus-gold/50 transition-all"
                />
              </div>

              {/* Cart Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsCartOpen(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-lotus-gold to-orange-500 text-white rounded-xl font-medium shadow-lg shadow-orange-500/25"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Cart ({cartCount})</span>
                {cartTotal > 0 && (
                  <span className="ml-1 text-white/80">${cartTotal.toFixed(2)}</span>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="bg-white border-b sticky top-[73px] z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-3 -mx-4 px-4 sm:mx-0 sm:px-0">
              <CategoryPill
                active={activeCategory === 'Popular'}
                onClick={() => setActiveCategory('Popular')}
                icon={<Sparkles className="w-4 h-4" />}
              >
                Popular
              </CategoryPill>
              {categories.filter(c => c.name !== 'Popular').map((category) => (
                <CategoryPill
                  key={category.id}
                  active={activeCategory === category.name}
                  onClick={() => setActiveCategory(category.name)}
                >
                  {category.name}
                </CategoryPill>
              ))}
            </div>
          </div>
        </div>

        {/* Coupons */}
        <AnimatePresence>
          {coupons.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-lotus-dark">
                <Tag className="w-5 h-5 text-lotus-gold" />
                Special Offers
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map((coupon) => (
                  <motion.div
                    key={coupon.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-gradient-to-r from-lotus-gold to-orange-500 text-white text-xs font-bold rounded-full">
                        {coupon.code}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{coupon.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menu Items */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-lotus-dark font-serif">{activeCategory}</h2>
            <span className="text-sm text-gray-500">{filteredItems.length} items</span>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lotus-gold"></div>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MenuCard 
                        item={item} 
                        onAdd={() => addToCart(item)}
                        showToast={showAddedToast === item.id}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filteredItems.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">No items found</p>
                  <p className="text-gray-400 text-sm mt-1">Try adjusting your search or category</p>
                </motion.div>
              )}
            </>
          )}
        </div>

        {/* Cart Sidebar */}
        <AnimatePresence>
          {isCartOpen && (
            <div className="fixed inset-0 z-50">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setIsCartOpen(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl"
              >
                <div className="flex flex-col h-full">
                  {/* Cart Header */}
                  <div className="flex items-center justify-between p-5 border-b">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-lotus-dark">
                      <ShoppingBag className="w-6 h-6 text-lotus-gold" />
                      Your Cart
                      <span className="text-sm font-normal text-gray-500">({cartCount} items)</span>
                    </h2>
                    <div className="flex items-center gap-2">
                      {cart.length > 0 && (
                        <button
                          onClick={clearCart}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Clear cart"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  {/* Cart Items */}
                  <div className="flex-1 overflow-y-auto p-5">
                    {cart.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <ShoppingBag className="w-12 h-12 text-gray-300" />
                        </div>
                        <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
                        <p className="text-gray-400 text-sm mb-6">Add some delicious items from our menu</p>
                        <button
                          onClick={() => setIsCartOpen(false)}
                          className="text-lotus-gold font-medium hover:underline"
                        >
                          Continue Shopping
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex gap-4 bg-gray-50 rounded-xl p-4"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-lotus-dark line-clamp-1">{item.name}</h4>
                              <p className="text-lotus-gold font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="w-8 h-8 bg-white border rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="w-8 h-8 bg-white border rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="ml-auto text-gray-400 hover:text-red-500 p-1"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Cart Footer */}
                  {cart.length > 0 && (
                    <div className="border-t p-5 space-y-4 bg-white">
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-lotus-dark">${cartTotal.toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-gray-500">Taxes and fees calculated at checkout</p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setIsCartOpen(false);
                          navigate('/checkout', {
                            state: {
                              cart: cart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
                              orderType: 'pickup',
                            },
                          });
                        }}
                        className="w-full py-4 bg-gradient-to-r from-lotus-gold to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
                      >
                        Proceed to Checkout
                        <ChevronRight className="w-5 h-5 inline ml-2" />
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// Category Pill Component
function CategoryPill({ 
  children, 
  active, 
  onClick,
  icon
}: { 
  children: React.ReactNode; 
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
        active
          ? 'bg-gradient-to-r from-lotus-gold to-orange-500 text-white shadow-lg shadow-orange-500/25'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

// Menu Card Component
function MenuCard({ 
  item, 
  onAdd,
  showToast
}: { 
  item: MenuItem;
  onAdd: () => void;
  showToast: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100">
      <div className="aspect-square relative overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {item.popular && (
            <span className="px-3 py-1 bg-gradient-to-r from-lotus-gold to-orange-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
              <Flame className="w-3 h-3" /> Popular
            </span>
          )}
        </div>
        
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {item.isVegetarian && (
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
              <Leaf className="w-3 h-3" /> Veg
            </span>
          )}
        </div>

        {/* Quick Add Button - Shows on Hover */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileHover={{ scale: 1.05 }}
          className="absolute bottom-4 left-4 right-4 py-3 bg-white text-lotus-dark font-semibold rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-lotus-gold hover:text-white flex items-center justify-center gap-2"
          onClick={(e) => {
            e.preventDefault();
            onAdd();
          }}
        >
          <Plus className="w-5 h-5" /> Add to Cart
        </motion.button>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-lotus-dark line-clamp-1 text-lg">{item.name}</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">{item.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-lotus-gold">
            ${item.price.toFixed(2)}
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onAdd}
            className="w-10 h-10 bg-gray-100 text-lotus-dark rounded-full flex items-center justify-center hover:bg-lotus-gold hover:text-white transition-colors"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Added Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute bottom-4 left-4 right-4 py-3 bg-green-500 text-white text-center rounded-xl font-medium shadow-lg z-10"
          >
            Added to cart! ✓
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
