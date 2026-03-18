import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Plus, Minus, X, Tag, Trash2, ChevronRight } from 'lucide-react';
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

const MENU_CSS = `
  .menu-topbar { padding: 14px 48px; }
  .menu-tabs-bar { padding: 16px 48px; }
  .menu-promos { padding: 20px 48px; }
  .menu-section-hdr { padding: 28px 48px 18px; }
  .menu-grid-wrap { padding: 0 48px 64px; }
  .menu-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  @media (max-width: 640px) {
    .menu-topbar { padding: 12px 16px !important; }
    .menu-tabs-bar { padding: 10px 16px !important; }
    .menu-promos { padding: 12px 16px !important; }
    .menu-section-hdr { padding: 20px 16px 14px !important; }
    .menu-grid-wrap { padding: 0 16px 48px !important; }
    .menu-grid { grid-template-columns: 1fr !important; }
  }
  @media (min-width: 641px) and (max-width: 1024px) {
    .menu-topbar { padding: 14px 24px !important; }
    .menu-tabs-bar { padding: 14px 24px !important; }
    .menu-promos { padding: 16px 24px !important; }
    .menu-section-hdr { padding: 24px 24px 16px !important; }
    .menu-grid-wrap { padding: 0 24px 56px !important; }
    .menu-grid { grid-template-columns: repeat(2, 1fr) !important; }
  }
  .menu-tabs-inner::-webkit-scrollbar { display: none; }
  .menu-tab-btn:hover:not(.menu-tab-active) { border-color: #B8853A !important; color: #B8853A !important; }
  .menu-card { background: white; border-radius: 16px; border: 1px solid #EDE3D2; box-shadow: 0 2px 12px rgba(15,12,8,0.06); overflow: hidden; cursor: pointer; transition: all 0.32s cubic-bezier(.4,0,.2,1); position: relative; }
  .menu-card:hover { transform: translateY(-5px); box-shadow: 0 20px 52px rgba(15,12,8,0.10); border-color: transparent !important; }
  .menu-card:hover .menu-card-img { transform: scale(1.05); }
  .menu-card-img { transition: transform 0.5s ease; }
  .menu-add-btn:hover { background: #B8853A !important; transform: scale(1.12) !important; box-shadow: 0 4px 14px rgba(184,133,58,0.4) !important; }
  .cart-btn:hover { background: #B8853A !important; }
  .checkout-btn:hover { background: #B8853A !important; }
  .modal-add-btn:hover { background: #B8853A !important; box-shadow: 0 6px 20px rgba(184,133,58,0.35) !important; }
`;

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

  // Modal state
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [modalQty, setModalQty] = useState(1);
  const [modalInstructions, setModalInstructions] = useState('');

  // ── API calls (unchanged) ──────────────────────────────────────────────────
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

  // ── Filtering (unchanged) ─────────────────────────────────────────────────
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

  // ── Cart handlers (unchanged) ─────────────────────────────────────────────
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
    if (cart.length === 0) setIsCartOpen(true);
  };

  const addToCartWithQty = (item: MenuItem, qty: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
    setShowAddedToast(item.id);
    setTimeout(() => setShowAddedToast(null), 1500);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQuantity = Math.max(0, item.quantity + delta);
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ── Modal handlers ────────────────────────────────────────────────────────
  const openModal = (item: MenuItem) => {
    setSelectedItem(item);
    setModalQty(1);
    setModalInstructions('');
  };
  const closeModal = () => setSelectedItem(null);
  const handleModalAdd = () => {
    if (!selectedItem) return;
    addToCartWithQty(selectedItem, modalQty);
    closeModal();
  };

  // ── Filtered promo banners ────────────────────────────────────────────────
  const visibleCoupons = coupons.filter((c) =>
    ['DIMSUM10', 'BOBAMONDAY'].includes(c.code.toUpperCase())
  );

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

      <style dangerouslySetInnerHTML={{ __html: MENU_CSS }} />

      <div style={{ minHeight: '100vh', background: '#F9F4EC', fontFamily: "'Jost', sans-serif", paddingTop: 68 }}>

        {/* ── SEARCH + CART TOPBAR ─────────────────────────────── */}
        <div
          className="menu-topbar"
          style={{
            position: 'sticky', top: 68, zIndex: 30,
            background: 'white', borderBottom: '1px solid #EDE3D2',
            boxShadow: '0 1px 8px rgba(15,12,8,0.04)',
            display: 'flex', alignItems: 'center', gap: 16,
          }}
        >
          <div style={{ flex: 1, position: 'relative', maxWidth: 440 }}>
            <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#9E8870', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: 40, paddingRight: 14, paddingTop: 10, paddingBottom: 10, background: '#F9F4EC', border: '1.5px solid #EDE3D2', borderRadius: 10, fontSize: '13.5px', fontFamily: "'Jost', sans-serif", color: '#0F0C08', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
              onFocus={(e) => { e.target.style.borderColor = '#B8853A'; e.target.style.boxShadow = '0 0 0 3px rgba(184,133,58,0.1)'; e.target.style.background = 'white'; }}
              onBlur={(e) => { e.target.style.borderColor = '#EDE3D2'; e.target.style.boxShadow = 'none'; e.target.style.background = '#F9F4EC'; }}
            />
          </div>

          <button
            className="cart-btn"
            onClick={() => setIsCartOpen(true)}
            style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: '#1E1810', color: 'white', border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 600, fontFamily: "'Jost', sans-serif", cursor: 'pointer', transition: 'background 0.2s', position: 'relative', flexShrink: 0 }}
          >
            <ShoppingBag style={{ width: 16, height: 16 }} />
            <span>Cart</span>
            {cartCount > 0 && (
              <>
                <span style={{ width: 4, height: 4, background: 'rgba(255,255,255,0.4)', borderRadius: '50%', display: 'inline-block' }} />
                <span>${cartTotal.toFixed(2)}</span>
                <span style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, background: '#B8853A', borderRadius: '50%', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', color: 'white' }}>{cartCount}</span>
              </>
            )}
          </button>
        </div>

        {/* ── CATEGORY TABS ────────────────────────────────────── */}
        <div
          className="menu-tabs-bar"
          style={{ position: 'sticky', top: 138, zIndex: 29, background: '#F9F4EC', borderBottom: '1px solid #EDE3D2' }}
        >
          <div className="menu-tabs-inner" style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
            <CategoryTab active={activeCategory === 'Popular'} onClick={() => setActiveCategory('Popular')}>Popular</CategoryTab>
            {categories.filter((c) => c.name !== 'Popular').map((cat) => (
              <CategoryTab key={cat.id} active={activeCategory === cat.name} onClick={() => setActiveCategory(cat.name)}>
                {cat.name}
              </CategoryTab>
            ))}
          </div>
        </div>

        {/* ── PROMO BANNERS ────────────────────────────────────── */}
        {visibleCoupons.length > 0 && (
          <div className="menu-promos" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {visibleCoupons.map((coupon) => (
              <div key={coupon.id} style={{ background: 'white', border: '1px solid #EDE3D2', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ background: '#1E1810', color: 'white', borderRadius: 6, fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.1em', padding: '3px 8px', textTransform: 'uppercase' }}>{coupon.code}</span>
                <span style={{ fontSize: '12.5px', color: '#6B5540' }}>{coupon.description}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── SECTION HEADER ───────────────────────────────────── */}
        <div className="menu-section-hdr">
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#B8853A', fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'block', width: 20, height: 1.5, background: '#B8853A', flexShrink: 0 }} />
            Menu
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 500, color: '#0F0C08', margin: 0 }}>{activeCategory}</h2>
            <span style={{ fontSize: 13, color: '#9E8870' }}>{filteredItems.length} items</span>
          </div>
        </div>

        {/* ── MENU GRID ────────────────────────────────────────── */}
        <div className="menu-grid-wrap">
          {isLoading ? (
            <div className="menu-grid">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} style={{ background: 'white', borderRadius: 16, border: '1px solid #EDE3D2', overflow: 'hidden' }}>
                  <Skeleton className="w-full" style={{ height: 200 }} />
                  <div style={{ padding: '16px 18px 18px' }}>
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-5/6 mb-3" />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-9 w-9 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : loadError ? (
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #EDE3D2', padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F9F4EC', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X style={{ width: 24, height: 24, color: '#9E8870' }} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0F0C08', margin: '0 0 6px' }}>Something went wrong</h3>
              <p style={{ fontSize: 13, color: '#9E8870', marginBottom: 20 }}>We couldn't load the menu right now.</p>
              <button
                style={{ padding: '11px 24px', background: '#1E1810', color: 'white', border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: "'Jost', sans-serif" }}
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <div style={{ width: 80, height: 80, background: '#F9F4EC', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Search style={{ width: 32, height: 32, color: '#9E8870' }} />
              </div>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#0F0C08', margin: '0 0 4px' }}>No items found</p>
              <p style={{ fontSize: 13, color: '#9E8870', marginBottom: 20 }}>Try a different search or category.</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('Popular'); }}
                style={{ padding: '11px 24px', background: 'transparent', border: '1.5px solid #B8853A', borderRadius: 10, color: '#B8853A', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: "'Jost', sans-serif" }}
              >
                Browse Popular
              </button>
            </div>
          ) : (
            <div className="menu-grid">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                  >
                    <MenuCard
                      item={item}
                      onAdd={() => addToCart(item)}
                      onCardClick={() => openModal(item)}
                      showToast={showAddedToast === item.id}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ── ITEM DETAIL MODAL ────────────────────────────────── */}
        <AnimatePresence>
          {selectedItem && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 16px' }}>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'absolute', inset: 0, background: 'rgba(15,12,8,0.6)', backdropFilter: 'blur(4px)' }}
                onClick={closeModal}
              />
              <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 240 }}
                style={{ position: 'relative', width: '100%', maxWidth: 540, background: 'white', borderRadius: 24, overflow: 'hidden', marginBottom: 24, zIndex: 1 }}
              >
                {/* Image */}
                <div style={{ position: 'relative', height: 220, overflow: 'hidden', flexShrink: 0 }}>
                  {selectedItem.image ? (
                    <img src={selectedItem.image} alt={selectedItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(145deg,#3D1C00,#8B4513)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>🍛</div>
                  )}
                  <button
                    onClick={closeModal}
                    style={{ position: 'absolute', top: 14, right: 14, width: 36, height: 36, background: 'white', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 16px rgba(15,12,8,0.2)' }}
                  >
                    <X style={{ width: 16, height: 16, color: '#0F0C08' }} />
                  </button>
                </div>

                {/* Body */}
                <div style={{ padding: '20px 24px 24px' }}>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 600, color: '#0F0C08', margin: '0 0 6px' }}>{selectedItem.name}</h2>
                  <p style={{ fontSize: 13, color: '#9E8870', lineHeight: 1.6, margin: '0 0 12px' }}>{selectedItem.description}</p>

                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#F9F4EC', border: '1px solid #EDE3D2', borderRadius: 20, fontSize: 11, color: '#9E8870', padding: '3px 10px', marginBottom: 12 }}>
                    ⏱ Ready in {(selectedItem as any).prepTime || 15} min
                  </span>

                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: '#B8853A', marginBottom: 16 }}>
                    ${selectedItem.price.toFixed(2)}
                  </div>

                  {/* Special instructions */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B5540', marginBottom: 6 }}>Special Instructions</label>
                    <textarea
                      rows={2}
                      value={modalInstructions}
                      onChange={(e) => setModalInstructions(e.target.value)}
                      placeholder="e.g. No onions, extra spicy..."
                      style={{ width: '100%', border: '1.5px solid #EDE3D2', borderRadius: 10, padding: '10px 12px', fontSize: 13, fontFamily: "'Jost', sans-serif", color: '#0F0C08', resize: 'none', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                      onFocus={(e) => { e.target.style.borderColor = '#B8853A'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#EDE3D2'; }}
                    />
                  </div>

                  {/* Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: '#F9F4EC', border: '1.5px solid #EDE3D2', borderRadius: 10, padding: '6px 12px', flexShrink: 0 }}>
                      <button
                        onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                        style={{ width: 28, height: 28, borderRadius: '50%', background: modalQty > 1 ? '#1E1810' : '#DDD0BB', color: 'white', border: 'none', cursor: modalQty > 1 ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Minus style={{ width: 12, height: 12 }} />
                      </button>
                      <span style={{ fontSize: 16, fontWeight: 600, color: '#0F0C08', minWidth: 20, textAlign: 'center' }}>{modalQty}</span>
                      <button
                        onClick={() => setModalQty((q) => q + 1)}
                        style={{ width: 28, height: 28, borderRadius: '50%', background: '#1E1810', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Plus style={{ width: 12, height: 12 }} />
                      </button>
                    </div>
                    <button
                      className="modal-add-btn"
                      onClick={handleModalAdd}
                      style={{ flex: 1, background: '#1E1810', color: 'white', border: 'none', borderRadius: 12, padding: '13px 20px', fontSize: 15, fontWeight: 700, fontFamily: "'Jost', sans-serif", cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      Add to Cart · ${(selectedItem.price * modalQty).toFixed(2)}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── CART SIDEBAR ─────────────────────────────────────── */}
        <AnimatePresence>
          {isCartOpen && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'absolute', inset: 0, background: 'rgba(15,12,8,0.55)', backdropFilter: 'blur(4px)' }}
                onClick={() => setIsCartOpen(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 460, background: 'white', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 40px rgba(15,12,8,0.1)' }}
              >
                {/* Cart Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #EDE3D2', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ShoppingBag style={{ width: 20, height: 20, color: '#B8853A' }} />
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: '#0F0C08', margin: 0 }}>Your Cart</h2>
                    <span style={{ fontSize: 12, color: '#9E8870' }}>({cartCount})</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {cart.length > 0 && (
                      <button onClick={clearCart} style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#9E8870' }} title="Clear">
                        <Trash2 style={{ width: 18, height: 18 }} />
                      </button>
                    )}
                    <button onClick={() => setIsCartOpen(false)} style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#9E8870' }}>
                      <X style={{ width: 20, height: 20 }} />
                    </button>
                  </div>
                </div>

                {/* Cart Items */}
                <div ref={cartScrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
                  {cart.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '56px 0' }}>
                      <div style={{ width: 80, height: 80, background: '#F9F4EC', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <ShoppingBag style={{ width: 36, height: 36, color: '#DDD0BB' }} />
                      </div>
                      <p style={{ color: '#6B5540', fontSize: 15, margin: '0 0 6px' }}>Your cart is empty</p>
                      <p style={{ color: '#9E8870', fontSize: 13, marginBottom: 20 }}>Add some delicious items from our menu</p>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        style={{ background: 'none', border: 'none', color: '#B8853A', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: "'Jost', sans-serif" }}
                      >
                        Continue Browsing
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {cart.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          style={{ display: 'flex', gap: 14, background: '#F9F4EC', borderRadius: 14, padding: 14, border: '1px solid #EDE3D2' }}
                        >
                          {item.image && (
                            <img src={item.image} alt={item.name} style={{ width: 68, height: 68, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} loading="lazy" width={68} height={68} />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 600, color: '#0F0C08', margin: '0 0 2px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{item.name}</h4>
                            <p style={{ fontSize: 14, fontWeight: 700, color: '#B8853A', margin: '0 0 8px' }}>${(item.price * item.quantity).toFixed(2)}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <button onClick={() => updateQuantity(item.id, -1)} style={{ width: 28, height: 28, background: 'white', border: '1px solid #EDE3D2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <Minus style={{ width: 12, height: 12, color: '#6B5540' }} />
                              </button>
                              <span style={{ minWidth: 22, textAlign: 'center', fontWeight: 600, fontSize: 14, color: '#0F0C08' }}>{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} style={{ width: 28, height: 28, background: 'white', border: '1px solid #EDE3D2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <Plus style={{ width: 12, height: 12, color: '#6B5540' }} />
                              </button>
                              <button onClick={() => removeFromCart(item.id)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#9E8870', padding: 4 }}>
                                <X style={{ width: 15, height: 15 }} />
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
                  <div style={{ borderTop: '1px solid #EDE3D2', padding: '16px 24px 28px', background: 'white', flexShrink: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 14, color: '#6B5540', fontWeight: 500 }}>Subtotal</span>
                      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: '#0F0C08' }}>${cartTotal.toFixed(2)}</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#9E8870', marginBottom: 16 }}>Taxes calculated at checkout</p>
                    <button
                      className="checkout-btn"
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate('/checkout', {
                          state: {
                            cart: cart.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
                            orderType: 'pickup',
                          },
                        });
                      }}
                      style={{ width: '100%', padding: '15px', background: '#1E1810', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: "'Jost', sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }}
                    >
                      Proceed to Checkout
                      <ChevronRight style={{ width: 18, height: 18 }} />
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function CategoryTab({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      className={`menu-tab-btn${active ? ' menu-tab-active' : ''}`}
      onClick={onClick}
      style={{
        flexShrink: 0,
        padding: '7px 18px',
        borderRadius: 40,
        fontSize: 13,
        fontWeight: 500,
        fontFamily: "'Jost', sans-serif",
        border: active ? '1.5px solid #1E1810' : '1.5px solid #EDE3D2',
        background: active ? '#1E1810' : 'white',
        color: active ? 'white' : '#6B5540',
        cursor: 'pointer',
        transition: 'all 0.18s',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}

function MenuCard({
  item, onAdd, onCardClick, showToast,
}: {
  item: MenuItem; onAdd: () => void; onCardClick: () => void; showToast: boolean;
}) {
  const getBadge = () => {
    if (item.popular) return { label: 'Popular', bg: 'rgba(15,12,8,0.80)', dot: '#C9963F' };
    if (item.isVegetarian) return { label: 'Veg', bg: 'rgba(30,92,58,0.85)', dot: '#5AC480' };
    return null;
  };
  const badge = getBadge();

  return (
    <div
      className="menu-card"
      onClick={onCardClick}
    >
      {/* Image */}
      <div style={{ position: 'relative', overflow: 'hidden', height: 200 }}>
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="menu-card-img"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            loading="lazy"
            width={400}
            height={200}
          />
        ) : (
          <div
            className="menu-card-img"
            style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, background: 'linear-gradient(145deg,#3D1C00,#8B4513)' }}
          >
            🍛
          </div>
        )}
        {badge && (
          <span style={{ position: 'absolute', top: 10, left: 10, padding: '4px 10px', borderRadius: 20, fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 5, background: badge.bg, color: 'rgba(255,255,255,0.9)' }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: badge.dot, display: 'inline-block', flexShrink: 0 }} />
            {badge.label}
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px 18px' }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 600, color: '#0F0C08', margin: '0 0 5px', letterSpacing: '-0.01em', lineHeight: 1.2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.name}</h3>
        <p style={{ fontSize: '12.5px', color: '#9E8870', lineHeight: 1.55, margin: '0 0 10px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.description}</p>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#F9F4EC', border: '1px solid #EDE3D2', borderRadius: 20, fontSize: 11, color: '#9E8870', padding: '3px 8px', marginBottom: 12 }}>
          ⏱ Ready in {(item as any).prepTime || 15} min
        </span>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: '#1E1810' }}>${item.price.toFixed(2)}</span>
          <button
            className="menu-add-btn"
            onClick={(e) => { e.stopPropagation(); onAdd(); }}
            aria-label={`Add ${item.name}`}
            style={{ width: 36, height: 36, borderRadius: '50%', background: '#1E1810', border: 'none', color: 'white', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
          >
            +
          </button>
        </div>
      </div>

      {/* Added Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ position: 'absolute', bottom: 12, left: 12, right: 12, padding: '10px', background: '#2F9555', color: 'white', textAlign: 'center', borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 10 }}
          >
            Added to cart ✓
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Unused import kept for reference
const _Tag = Tag;
void _Tag;
