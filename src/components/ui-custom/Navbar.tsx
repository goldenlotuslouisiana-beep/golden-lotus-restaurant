import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, ShoppingBag, User } from 'lucide-react';

const navLinks = [
  { name: 'Menu', href: '/menu' },
  { name: 'Catering', href: '/catering' },
  { name: 'Locations', href: '/locations' },
  { name: 'Our Story', href: '/story' },
  { name: 'Events', href: '/events' },
];

const moreLinks = [
  { name: "We're Hiring", href: '/careers' },
  { name: 'Gift Cards', href: '/gift-cards' },
  { name: 'Contact Us', href: '/contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const location = useLocation();

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
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-lotus-gold rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="hidden sm:block text-xl font-bold text-lotus-dark font-['Playfair_Display']">
              Golden Lotus
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-lotus-gold ${isActive(link.href)
                    ? 'text-lotus-gold'
                    : 'text-lotus-dark'
                  }`}
              >
                {link.name}
              </Link>
            ))}

            {/* More Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className="flex items-center gap-1 text-sm font-medium text-lotus-dark hover:text-lotus-gold transition-colors"
              >
                More
                <ChevronDown className={`w-4 h-4 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMoreOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 animate-fade-in">
                  {moreLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="block px-4 py-2 text-sm text-lotus-dark hover:bg-lotus-cream hover:text-lotus-gold transition-colors"
                      onClick={() => setIsMoreOpen(false)}
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
            <Link
              to="/login"
              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-lotus-dark hover:text-lotus-gold transition-colors"
            >
              <User className="w-4 h-4" />
              Sign in
            </Link>

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
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-100 pt-4 animate-fade-in">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive(link.href)
                      ? 'bg-lotus-gold/10 text-lotus-gold'
                      : 'text-lotus-dark hover:bg-gray-50'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="border-t border-gray-100 my-2" />
              {moreLinks.map((link) => (
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
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-lotus-dark hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                Sign in
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
