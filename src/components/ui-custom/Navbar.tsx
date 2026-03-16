import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Menu, X, ChevronDown, ShoppingBag, User, Home, UtensilsCrossed, Users, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface NavLinkType {
  name: string;
  href: string;
  icon?: LucideIcon;
}

// Primary navigation - Main pages
const mainNavLinks: NavLinkType[] = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Menu', href: '/menu', icon: UtensilsCrossed },
  { name: 'Catering', href: '/catering', icon: Users },
  { name: 'Our Story', href: '/story', icon: MapPin },
  { name: 'Locations', href: '/locations', icon: MapPin },
  { name: 'Events', href: '/events', icon: Calendar },
];

// Secondary navigation - Additional pages
const secondaryNavLinks: NavLinkType[] = [
  { name: 'Contact', href: '/contact' },
  { name: "Careers", href: '/careers' },
  { name: 'Gift Cards', href: '/gift-cards' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-black/5 py-2'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-3 group"
              aria-label="Golden Lotus Grill - Authentic Indian Restaurant"
            >
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="relative"
              >
                <img 
                  src="/golden_lotus_logo.png" 
                  alt="" 
                  className="w-10 h-10 object-contain drop-shadow-md"
                  width="40"
                  height="40"
                />
              </motion.div>
              <div className="hidden sm:block">
                <span className={`text-xl font-bold font-serif transition-colors duration-300 ${
                  isScrolled ? 'text-lotus-dark' : 'text-white'
                } group-hover:text-lotus-gold`}>
                  Golden Lotus
                </span>
                <span className={`block text-[10px] tracking-[0.2em] uppercase transition-colors duration-300 ${
                  isScrolled ? 'text-lotus-gold' : 'text-white/80'
                }`}>
                  Indian Restaurant
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {mainNavLinks.slice(0, 5).map((link) => (
                <NavLink 
                  key={link.name}
                  to={link.href}
                  isActive={isActive(link.href)}
                  isScrolled={isScrolled}
                >
                  {link.name}
                </NavLink>
              ))}

              {/* More Dropdown */}
              <div ref={moreDropdownRef} className="relative">
                <button
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                    isScrolled 
                      ? 'text-lotus-dark hover:text-lotus-gold hover:bg-lotus-gold/5' 
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  More
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isMoreOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isMoreOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-black/10 border border-gray-100 py-2 overflow-hidden"
                    >
                      {[...mainNavLinks.slice(5), ...secondaryNavLinks].map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.name}
                            to={link.href}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-lotus-gold/5 hover:text-lotus-gold transition-colors"
                            onClick={() => setIsMoreOpen(false)}
                          >
                            {Icon && <Icon className="w-4 h-4" />}
                            {link.name}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* User Menu */}
              {isLoggedIn && user ? (
                <div ref={userDropdownRef} className="relative hidden md:block">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 ${
                      isScrolled 
                        ? 'hover:bg-gray-100' 
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lotus-gold to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-colors duration-300 ${isScrolled ? 'text-gray-600' : 'text-white'}`} />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-black/10 border border-gray-100 py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-semibold text-gray-900">{user?.name || user?.email?.split('@')[0]}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <DropdownItem onClick={() => { navigate('/profile'); setDropdownOpen(false); }}>
                            <User className="w-4 h-4" /> My Profile
                          </DropdownItem>
                          <DropdownItem onClick={() => { navigate('/profile?tab=orders'); setDropdownOpen(false); }}>
                            <ShoppingBag className="w-4 h-4" /> My Orders
                          </DropdownItem>
                          <DropdownItem onClick={() => { navigate('/profile?tab=loyalty'); setDropdownOpen(false); }}>
                            <span className="text-amber-500">★</span> Loyalty Points
                          </DropdownItem>
                        </div>
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <DropdownItem onClick={() => { logout(); setDropdownOpen(false); navigate('/'); }} className="text-red-600 hover:bg-red-50">
                            <span className="text-lg">→</span> Sign Out
                          </DropdownItem>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className={`hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                    isScrolled 
                      ? 'text-lotus-dark hover:text-lotus-gold hover:bg-lotus-gold/5' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Sign in
                </Link>
              )}

              {/* Order Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/menu?order=true"
                  className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-lotus-gold to-orange-500 text-white text-sm font-semibold rounded-full shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="hidden sm:inline">Order Online</span>
                  <span className="sm:hidden">Order</span>
                </Link>
              </motion.div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-2 rounded-full transition-all duration-300 ${
                  isScrolled 
                    ? 'text-lotus-dark hover:bg-gray-100' 
                    : 'text-white hover:bg-white/10'
                }`}
                aria-label="Toggle menu"
              >
                <motion.div
                  animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </motion.div>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl lg:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <span className="text-lg font-bold font-serif text-lotus-dark">Menu</span>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 overflow-y-auto py-4">
                  <div className="px-4 space-y-1">
                    {mainNavLinks.map((link, index) => {
                      const Icon = link.icon;
                      return (
                        <motion.div
                          key={link.name}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link
                            to={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                              isActive(link.href)
                                ? 'bg-gradient-to-r from-lotus-gold to-orange-500 text-white shadow-lg shadow-orange-500/20'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {Icon && <Icon className="w-5 h-5" />}
                            {link.name}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100 px-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">More</p>
                    <div className="space-y-1">
                      {secondaryNavLinks.map((link, index) => (
                        <motion.div
                          key={link.name}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (mainNavLinks.length + index) * 0.05 }}
                        >
                          <Link
                            to={link.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
                          >
                            {link.name}
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </nav>

                {/* Mobile User Section */}
                <div className="border-t border-gray-100 p-4">
                  {isLoggedIn && user ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lotus-gold to-orange-500 flex items-center justify-center text-white font-bold">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{user?.name || user?.email}</p>
                          <p className="text-xs text-gray-500">{user.loyaltyPoints || 0} points</p>
                        </div>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-lotus-gold text-white rounded-xl font-medium"
                      >
                        <User className="w-4 h-4" /> View Profile
                      </Link>
                      <button
                        onClick={() => { logout(); setIsMobileMenuOpen(false); navigate('/'); }}
                        className="w-full py-3 text-red-600 font-medium hover:bg-red-50 rounded-xl transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-lotus-gold text-white rounded-xl font-medium"
                      >
                        <User className="w-4 h-4" /> Sign In
                      </Link>
                      <p className="text-center text-sm text-gray-500">
                        Don&apos;t have an account?{' '}
                        <Link to="/signup" className="text-lotus-gold font-medium">Sign up</Link>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Nav Link Component
function NavLink({ 
  to, 
  children, 
  isActive, 
  isScrolled 
}: { 
  to: string; 
  children: React.ReactNode; 
  isActive: boolean;
  isScrolled: boolean;
}) {
  return (
    <Link
      to={to}
      className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 group ${
        isActive
          ? isScrolled 
            ? 'text-lotus-gold bg-lotus-gold/5' 
            : 'text-white bg-white/10'
          : isScrolled 
            ? 'text-gray-700 hover:text-lotus-gold hover:bg-lotus-gold/5' 
            : 'text-white/90 hover:text-white hover:bg-white/10'
      }`}
    >
      {children}
      {/* Animated underline */}
      <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-current rounded-full transition-all duration-300 ${
        isActive ? 'w-4 opacity-100' : 'w-0 opacity-0 group-hover:w-4 group-hover:opacity-100'
      }`} />
    </Link>
  );
}

// Dropdown Item Component
function DropdownItem({ 
  children, 
  onClick,
  className = ''
}: { 
  children: React.ReactNode; 
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-gray-50 ${className}`}
    >
      {children}
    </button>
  );
}
