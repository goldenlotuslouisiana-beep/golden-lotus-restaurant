import { Link } from 'react-router-dom';
import { Facebook, Instagram, MapPin, Phone, Mail, Clock, Heart, Twitter, Youtube } from 'lucide-react';
import { DataStore } from '@/data/store';
import { useEffect, useState } from 'react';
import type { SiteContent } from '@/types';
import { motion } from 'framer-motion';

export default function Footer() {
  const locations = DataStore.getLocations();
  const [siteContent, setSiteContent] = useState<SiteContent>(DataStore.getSiteContent());

  useEffect(() => {
    setSiteContent(DataStore.getSiteContent());
  }, []);

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    explore: [
      { name: 'Our Menu', href: '/menu' },
      { name: 'Catering', href: '/catering' },
      { name: 'Locations', href: '/locations' },
      { name: 'Our Story', href: '/story' },
      { name: 'Events', href: '/events' },
    ],
    company: [
      { name: 'Contact Us', href: '/contact' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Accessibility', href: '/accessibility' },
    ],
  };

  return (
    <footer className="bg-gradient-to-b from-lotus-dark to-black text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.img 
                whileHover={{ scale: 1.05, rotate: 5 }}
                src="/golden_lotus_logo.png" 
                alt="" 
                className="w-12 h-12 object-contain drop-shadow-lg"
              />
              <div>
                <span className="text-2xl font-bold font-serif block group-hover:text-lotus-gold transition-colors">
                  Golden Lotus
                </span>
                <span className="text-xs text-gray-400 tracking-wider uppercase">Indian Restaurant</span>
              </div>
            </Link>
            
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Experience the art of authentic Indian cuisine at Golden Lotus Grill.
              Located in Alexandria, Louisiana, serving the finest Indian food with 
              dine-in, takeout, and catering services since 2010.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {siteContent.socialLinks?.facebook && (
                <SocialLink href={siteContent.socialLinks.facebook} icon={<Facebook className="w-5 h-5" />} label="Facebook" />
              )}
              {siteContent.socialLinks?.instagram && (
                <SocialLink href={siteContent.socialLinks.instagram} icon={<Instagram className="w-5 h-5" />} label="Instagram" />
              )}
              {siteContent.socialLinks?.twitter && (
                <SocialLink href={siteContent.socialLinks.twitter} icon={<Twitter className="w-5 h-5" />} label="Twitter" />
              )}
              {siteContent.socialLinks?.youtube && (
                <SocialLink href={siteContent.socialLinks.youtube} icon={<Youtube className="w-5 h-5" />} label="YouTube" />
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Explore</h3>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-lotus-gold transition-colors text-sm inline-flex items-center gap-1 group"
                  >
                    {link.name}
                    <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-lotus-gold transition-colors text-sm inline-flex items-center gap-1 group"
                  >
                    {link.name}
                    <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Contact Us</h3>
            <div className="space-y-4">
              {locations.map((location) => (
                <div key={location.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                  <p className="font-medium text-white mb-2">{location.name}</p>
                  <div className="space-y-2 text-sm">
                    <a 
                      href={`https://maps.google.com/?q=${encodeURIComponent(`${location.address}, ${location.city}, ${location.state} ${location.zip}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 text-gray-400 hover:text-lotus-gold transition-colors"
                    >
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{location.address}, {location.city}, {location.state} {location.zip}</span>
                    </a>
                    <a 
                      href={`tel:${location.phone}`} 
                      className="flex items-center gap-2 text-gray-400 hover:text-lotus-gold transition-colors"
                    >
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      {location.phone}
                    </a>
                  </div>
                </div>
              ))}
              
              {siteContent.contactInfo?.email && (
                <a 
                  href={`mailto:${siteContent.contactInfo.email}`}
                  className="flex items-center gap-2 text-gray-400 hover:text-lotus-gold transition-colors text-sm"
                >
                  <Mail className="w-4 h-4" />
                  {siteContent.contactInfo.email}
                </a>
              )}
              {siteContent.contactInfo?.phone && (
                <a 
                  href={`tel:${siteContent.contactInfo.phone}`}
                  className="flex items-center gap-2 text-gray-400 hover:text-lotus-gold transition-colors text-sm"
                >
                  <Phone className="w-4 h-4" />
                  {siteContent.contactInfo.phone}
                </a>
              )}

              {/* Hours */}
              <div className="flex items-start gap-2 text-sm text-gray-400 pt-2 border-t border-white/10">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium mb-1">Opening Hours</p>
                  {locations[0]?.hours.slice(0, 3).map((hour, idx) => (
                    <p key={idx} className="text-xs">
                      {hour.day}: {hour.isClosed ? 'Closed' : `${hour.open} - ${hour.close}`}
                    </p>
                  ))}
                  <Link to="/locations" className="text-lotus-gold text-xs hover:underline mt-1 inline-block">
                    View all hours →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © {currentYear} Golden Lotus Indian Cuisine Inc. All rights reserved.
              <span className="hidden sm:inline"> · </span>
              <br className="sm:hidden" />
              <span className="inline-flex items-center gap-1">
                Made with <Heart className="w-3 h-3 text-red-500 fill-current" /> in Alexandria, LA
              </span>
            </p>
            
            <div className="flex items-center gap-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-gray-500 hover:text-lotus-gold transition-colors text-xs"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Social Link Component
function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-lotus-gold hover:scale-110 transition-all duration-300"
    >
      {icon}
    </a>
  );
}
