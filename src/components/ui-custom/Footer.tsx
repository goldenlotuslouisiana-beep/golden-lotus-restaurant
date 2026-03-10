import { Link } from 'react-router-dom';
import { Facebook, Instagram, MapPin, Phone, Mail } from 'lucide-react';
import { DataStore } from '@/data/store';

export default function Footer() {
  const locations = DataStore.getLocations();

  return (
    <footer className="bg-lotus-dark text-white">
      {/* Main Footer */}
      <div className="section-padding py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 text-center sm:text-left">
          {/* Brand */}
          <div className="lg:col-span-1 flex flex-col items-center sm:items-start">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-12 h-12 bg-lotus-gold rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="text-2xl font-bold font-['Playfair_Display']">
                Golden Lotus
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Experience the art of authentic Indian cuisine at Golden Lotus Indian Restaurant.
              Two locations in Florida serving the finest Indian food.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-lotus-gold transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-lotus-gold transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 font-['Playfair_Display']">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { name: 'Home', href: '/' },
                { name: 'Menu', href: '/menu' },
                { name: 'Catering', href: '/catering' },
                { name: 'Locations', href: '/locations' },
                { name: 'Our Story', href: '/story' },
                { name: 'Events', href: '/events' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-lotus-gold transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 font-['Playfair_Display']">More</h3>
            <ul className="space-y-3">
              {[
                { name: "We're Hiring", href: '/careers' },
                { name: 'Gift Cards', href: '/gift-cards' },
                { name: 'Contact Us', href: '/contact' },
                { name: 'Terms of Service', href: '/terms' },
                { name: 'Accessibility', href: '/accessibility' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-lotus-gold transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 font-['Playfair_Display']">Contact Us</h3>
            <div className="space-y-6 sm:space-y-4">
              {locations.map((location) => (
                <div key={location.id} className="text-sm flex flex-col items-center sm:items-start group">
                  <p className="font-medium text-white mb-1 group-hover:text-lotus-gold transition-colors">{location.name}</p>
                  <p className="text-gray-400 flex items-start gap-2 text-center sm:text-left">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      {location.address}, {location.city}, {location.state} {location.zip}
                    </span>
                  </p>
                  <p className="text-gray-400 flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <a href={`tel:${location.phone}`} className="hover:text-lotus-gold transition-colors">
                      {location.phone}
                    </a>
                  </p>
                </div>
              ))}
              <p className="text-gray-400 flex items-center justify-center sm:justify-start gap-2 text-sm mt-4 sm:mt-0">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:golden_lotusmiami@gmail.com" className="hover:text-lotus-gold transition-colors">
                  golden_lotusmiami@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="section-padding py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm text-center sm:text-left">
              &copy; {new Date().getFullYear()} Golden Lotus Indian Cuisine Inc. All rights reserved.
            </p>
            <Link
              to="/menu?order=true"
              className="px-6 py-2 bg-lotus-gold text-white text-sm font-medium rounded-lg hover:bg-lotus-gold-dark transition-colors"
            >
              Order online
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
