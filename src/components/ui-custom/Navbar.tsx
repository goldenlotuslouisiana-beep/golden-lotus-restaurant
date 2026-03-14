import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/**
 * SEO-Optimized Navigation Structure
 * 
 * These links are carefully organized to help Google generate Sitelinks.
 * Primary navigation includes the most important pages that should appear
 * in Google search results under the main website link.
 */

// Primary navigation - These are the main pages that Google should index
// and potentially show as Sitelinks
const mainNavLinks = [
  { 
    name: 'Home', 
    href: '/',
    // Home is the root page - always important for Sitelinks
  },
  { 
    name: 'Menu', 
    href: '/menu',
    // Menu is a critical page for restaurants - high priority for Sitelinks
  },
  { 
    name: 'Catering', 
    href: '/catering',
    // Catering is a major revenue stream - important for Sitelinks
  },
  { 
    name: 'About Us', 
    href: '/story',
    // About page helps establish business credibility
  },
  { 
    name: 'Locations', 
    href: '/locations',
    // Location page with address and hours - important for local SEO
  },
  { 
    name: 'Events', 
    href: '/events',
    // Events page shows ongoing activities
  },
];

// Secondary navigation - Important but less prominent pages
const secondaryNavLinks = [
  { 
    name: 'Contact', 
    href: '/contact',
    // Contact page with form and information
  },
  { 
    name: "We're Hiring", 
    href: '/careers',
  },
  { 
    name: 'Gift Cards', 
    href: '/gift-cards',
  },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-white shadow-md py-2'
          : 'bg-white/95 backdrop-blur-sm py-3'
        }`}
    >
      <div className="section-padding">
        <div className="flex items-center justify-between">
          {/* Logo - Links to homepage with descriptive text */}
          <Link 
            to="/" 
            className="flex items-center gap-2"
            aria-label="Golden Lotus Grill - Authentic Indian Restaurant in Alexandria, LA"
          >
            <img 
              src="/golden_lotus_logo.png" 
              alt="Golden Lotus Grill Logo" 
              className="w-10 h-10 object-contain"
              width="40"
              height="40"
            />
            <span className="hidden sm:block text-xl font-bold text-lotus-dark font-['Playfair_Display']">
              Golden Lotus
            </span>
          </Link>

          {/* Desktop Navigation - SEO-optimized with semantic HTML */}
          <nav 
            className="hidden lg:flex items-center gap-6"
            role="navigation"
            aria-label="Main Navigation"
          >
            {/* 
              Primary navigation links
              These are the most important pages for Sitelinks generation
            */}
            {mainNavLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-lotus-gold ${isActive(link.href)
                    ? 'text-lotus-gold'
                    : 'text-lotus-dark'
                  }`}
                aria-current={isActive(link.href) ? 'page' : undefined}
              >
                {link.name}
              </Link>
            ))}

            {/* Secondary Dropdown - Contains additional important pages */}
            <div className="relative">
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className="flex items-center gap-1 text-sm font-medium text-lotus-dark hover:text-lotus-gold transition-colors"
                aria-expanded={isMoreOpen}
                aria-haspopup="true"
              >
                More
                <ChevronDown className={`w-4 h-4 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMoreOpen && (
                <div 
                  className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 animate-fade-in"
                  role="menu"
                >
                  {secondaryNavLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="block px-4 py-2 text-sm text-lotus-dark hover:bg-lotus-cream hover:text-lotus-gold transition-colors"
                      onClick={() => setIsMoreOpen(false)}
                      role="menuitem"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isLoggedIn && user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="w-9 h-9 rounded-full bg-lotus-gold flex items-center justify-center text-white font-bold text-sm">
                    {user?.fullName?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-lotus-dark">
                    {user?.fullName || user?.name || user?.full_name || user?.email?.split('@')[0] || 'Account'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-lotus-dark" />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-2">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-medium text-sm text-gray-900">{user?.fullName || user?.name || user?.full_name || user?.email?.split('@')[0] || 'Account'}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <button onClick={() => { navigate('/profile'); setDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-lotus-cream hover:text-lotus-gold flex items-center gap-2">
                        👤 My Profile
                      </button>
                      <button onClick={() => { navigate('/profile?tab=orders'); setDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-lotus-cream hover:text-lotus-gold flex items-center gap-2">
                        📦 My Orders
                      </button>
                      <button onClick={() => { navigate('/profile?tab=loyalty'); setDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-lotus-cream hover:text-lotus-gold flex items-center gap-2">
                        ⭐ Loyalty Points
                      </button>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={() => { logout(); setDropdownOpen(false); navigate('/'); }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2">
                          🚪 Sign Out
                        </button>
                      </div>
                    </div>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-lotus-dark hover:text-lotus-gold transition-colors"
              >
                <User className="w-4 h-4" />
                Sign in
              </Link>
            )}

            {/* Order Online Button - Prominent CTA */}
            <Link
              to="/menu?order=true"
              className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-lotus-gold text-white text-sm font-medium rounded-lg hover:bg-lotus-gold-dark transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden lg:inline">Order online</span>
              <span className="hidden sm:inline lg:hidden">Order</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-lotus-dark hover:text-lotus-gold transition-colors"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - All navigation links for mobile users */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-100 pt-4 animate-fade-in">
            <nav 
              className="flex flex-col gap-2"
              role="navigation"
              aria-label="Mobile Navigation"
            >
              {/* Primary links first */}
              {mainNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive(link.href)
                      ? 'bg-lotus-gold/10 text-lotus-gold'
                      : 'text-lotus-dark hover:bg-gray-50'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {link.name}
                </Link>
              ))}
              <div className="border-t border-gray-100 my-2" />
              {/* Secondary links */}
              {secondaryNavLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="px-4 py-2 text-sm font-medium text-lotus-dark hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="border-t border-gray-100 my-2" />
              {isLoggedIn && user ? (
                <div className="mt-2 bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 rounded-full bg-lotus-gold flex items-center justify-center text-white font-bold text-lg">
                      {user?.fullName?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{user?.fullName || user?.name || user?.full_name || user?.email?.split('@')[0] || 'Account'}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-2 text-sm text-gray-700 hover:text-lotus-gold flex items-center gap-2">
                      👤 My Profile
                    </Link>
                    <Link to="/profile?tab=orders" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-2 text-sm text-gray-700 hover:text-lotus-gold flex items-center gap-2">
                      📦 My Orders
                    </Link>
                    <Link to="/profile?tab=addresses" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-2 text-sm text-gray-700 hover:text-lotus-gold flex items-center gap-2">
                      📍 My Addresses
                    </Link>
                    <Link to="/profile?tab=loyalty" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-2 text-sm text-gray-700 hover:text-lotus-gold flex items-center gap-2">
                      ⭐ Loyalty Points
                    </Link>
                    <button onClick={() => { logout(); setIsMobileMenuOpen(false); navigate('/'); }} className="w-full text-left px-2 py-2 mt-2 text-sm text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-2">
                      🚪 Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-lotus-dark hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Sign in
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
