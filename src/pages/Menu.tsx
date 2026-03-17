import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Plus, Minus, X, Tag, Flame, Leaf, Sparkles, ChevronRight, Trash2 } from 'lucide-react';
import type { MenuItem, MenuCategory, Coupon } from '@/types';
import SEO, { breadcrumbSchema } from '@/components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

interface CartItem extends MenuItem {
  quantity: number;
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export default function Menu() {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [activeCategory, setActiveCategory] = useState('Popular');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 500);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showAddedToast, setShowAddedToast] = useState<string | null>(null);
  const cartScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoadError(false);
      setIsLoading(true);
      try {
        const [menuRes, catRes, couponRes] = await Promise.all([
          fetch('/api/menu?action=items'),
          fetch('/api/menu?action=menu-categories'),
          fetch('/api/admin?action=coupons'),
        ]);
        if (menuRes.ok) {
          const raw = await menuRes.json();
          setMenuItems(Array.isArray(raw) ? raw : []);
        }
        if (catRes.ok) {
          const raw = await catRes.json();
          setCategories(Array.isArray(raw) ? raw : []);
        }
        if (couponRes.ok) {
          const allCoupons = await couponRes.json();
          setCoupons(Array.isArray(allCoupons) ? allCoupons.filter((c: Coupon) => c.active) : []);
        }
      } catch (err) {
        console.error('Error loading menu data:', err);
        setLoadError(true);
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
      const q = debouncedSearch.trim().toLowerCase();
      const matchesSearch = !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, activeCategory, debouncedSearch]);

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
    // On mobile, auto-open cart after first add
    if (cart.length === 0) setIsCartOpen(true);
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
      
      <div className="min-h-screen bg-[#F9FAFB]">
        {/* Navbar */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#F3F4F6]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#F97316] to-[#EA6C0A] flex items-center justify-center shadow-md shadow-orange-200/60">
                <span className="text-white text-lg font-bold">GL</span>
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="font-['Playfair_Display'] text-base font-semibold text-[#111827]">
                  Golden Lotus
                </span>
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#6B7280]">
                  Alexandria, LA
                </span>
              </div>
            </button>

            {/* Center search on desktop */}
            <div className="flex-1 hidden md:block max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 bg-[#F3F4F6] border border-transparent rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316] focus:bg-white transition-all text-[16px]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Compact cart pill */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsCartOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F97316] text-white text-sm font-semibold shadow-md shadow-orange-200/70 hover:bg-[#EA6C0A] transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Cart ({cartCount})</span>
                {cartCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-white/15 text-[11px] font-medium">
                    ${cartTotal.toFixed(2)}
                  </span>
                )}
              </motion.button>

              {/* Simple circular avatar placeholder */}
              <div className="hidden sm:flex w-9 h-9 rounded-full border border-[#E5E7EB] bg-white items-center justify-center text-[13px] font-semibold text-[#111827]">
                GL
              </div>
            </div>
          </div>

          {/* Mobile search under navbar */}
          <div className="md:hidden border-t border-[#F3F4F6] bg-white/95">
            <div className="max-w-6xl mx-auto px-4 py-2.5">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 bg-[#F3F4F6] border border-transparent rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316] focus:bg-white transition-all text-[16px]"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Category Tabs */}
        <div className="bg-white border-b sticky top-[96px] md:top-16 z-30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#111827]">
                <Tag className="w-5 h-5 text-[#F97316]" />
                Special Offers
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons
                  .filter((coupon) =>
                    ['DIMSUM10', 'BOBAMONDAY'].includes(coupon.code.toUpperCase())
                  )
                  .map((coupon) => (
                  <motion.div
                    key={coupon.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-[#FFF7ED] border border-[#FED7AA] rounded-2xl p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-[#F97316] text-white text-xs font-bold rounded-full">
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[#F97316]">Menu</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#111827]">{activeCategory}</h2>
            </div>
            <span className="text-sm text-gray-500">{filteredItems.length} items</span>
          </div>

          {isLoading ? (
            <MenuGridSkeleton />
          ) : loadError ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#F3F4F6] mx-auto flex items-center justify-center mb-4">
                <X className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-[#111827]">Something went wrong. Please try again.</h3>
              <p className="text-sm text-gray-500 mt-1">We couldn’t load the menu right now.</p>
              <button
                className="mt-6 px-6 py-3 rounded-xl bg-[#F97316] hover:bg-[#EA6C0A] text-white font-semibold transition-all"
                style={{ boxShadow: '0 4px 14px rgba(249,115,22,0.4)' }}
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  <p className="text-gray-900 text-lg font-semibold">No items found</p>
                  <p className="text-gray-500 text-sm mt-1">Try a different search or category.</p>
                  <button
                    onClick={() => { setSearchQuery(''); setActiveCategory('Popular'); }}
                    className="mt-6 px-6 py-3 rounded-xl border-2 border-[#F97316] text-[#F97316] font-semibold hover:bg-[#FFF7ED] transition-colors"
                  >
                    Browse Popular
                  </button>
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
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute bottom-0 left-0 right-0 sm:right-0 sm:top-0 sm:bottom-0 sm:left-auto w-full sm:max-w-md bg-white shadow-2xl rounded-t-3xl sm:rounded-none overflow-hidden"
              >
                <div className="flex flex-col h-full">
                  {/* Cart Header */}
                  <div className="flex items-center justify-between p-5 border-b">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-[#111827]">
                      <ShoppingBag className="w-6 h-6 text-[#F97316]" />
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
                        aria-label="Close cart"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  {/* Cart Items */}
                  <div ref={cartScrollRef} className="flex-1 overflow-y-auto p-5">
                    {cart.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <ShoppingBag className="w-12 h-12 text-gray-300" />
                        </div>
                        <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
                        <p className="text-gray-400 text-sm mb-6">Add some delicious items from our menu</p>
                        <button
                          onClick={() => setIsCartOpen(false)}
                          className="text-[#F97316] font-semibold hover:underline"
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
                            className="flex gap-4 bg-[#F9FAFB] rounded-2xl p-4 border border-[#F3F4F6]"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-xl"
                              loading="lazy"
                              width={80}
                              height={80}
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-[#111827] line-clamp-1">{item.name}</h4>
                              <p className="text-[#F97316] font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="w-9 h-9 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-center hover:bg-[#F3F4F6] transition-colors"
                                  aria-label={`Decrease ${item.name}`}
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="w-9 h-9 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-center hover:bg-[#F3F4F6] transition-colors"
                                  aria-label={`Increase ${item.name}`}
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="ml-auto text-gray-400 hover:text-red-500 p-1"
                                  aria-label={`Remove ${item.name}`}
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
                        <span className="text-[#111827]">${cartTotal.toFixed(2)}</span>
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
                        className="w-full py-4 bg-[#F97316] hover:bg-[#EA6C0A] text-white font-bold rounded-xl transition-all"
                        style={{ boxShadow: '0 4px 14px rgba(249,115,22,0.4)' }}
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
          ? 'bg-[#F97316] text-white'
          : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]'
      }`}
      style={active ? { boxShadow: '0 4px 14px rgba(249,115,22,0.4)' } : undefined}
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
    <div className="relative bg-white rounded-2xl overflow-hidden border border-[#F3F4F6] shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-all duration-300 group">
      <div className="relative overflow-hidden" style={{ height: 200 }}>
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
          loading="lazy"
          width={400}
          height={200}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {item.popular && (
            <span className="px-3 py-1 bg-[#F97316] text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
              <Flame className="w-3 h-3" /> Popular
            </span>
          )}
        </div>
        
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {item.isVegetarian && (
            <span className="px-3 py-1 bg-[#16A34A] text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
              <Leaf className="w-3 h-3" /> Veg
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="line-clamp-1 text-[18px] font-semibold text-[#111827]">{item.name}</h3>
        </div>
        <p className="text-[14px] text-[#6B7280] mb-4 line-clamp-2 leading-relaxed">{item.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-[20px] font-bold text-[#F97316]">
            ${item.price.toFixed(2)}
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onAdd}
            className="w-10 h-10 bg-[#F97316] text-white rounded-full flex items-center justify-center hover:bg-[#EA6C0A] transition-colors"
            aria-label={`Add ${item.name}`}
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
            className="absolute bottom-4 left-4 right-4 py-3 bg-[#16A34A] text-white text-center rounded-xl font-medium shadow-lg z-10"
          >
            Added to cart! ✓
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div key={idx} className="bg-white rounded-2xl border border-[#F3F4F6] overflow-hidden">
          <Skeleton className="w-full" style={{ height: 200 }} />
          <div className="p-5 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
