import { Link } from 'react-router-dom';
import SEO, { breadcrumbSchema } from '@/components/SEO';
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';

/**
 * HTML Sitemap Page
 * 
 * This page serves multiple SEO purposes:
 * 1. Helps search engines discover all pages on the site
 * 2. Provides users with a comprehensive navigation overview
 * 3. Internal linking hub that distributes link equity
 * 4. Demonstrates site structure to Google for Sitelinks consideration
 */

const siteStructure = {
  main: [
    { name: 'Home', href: '/', description: 'Welcome to Golden Lotus - Authentic Indian Restaurant in Alexandria, LA' },
    { name: 'Menu', href: '/menu', description: 'Explore our authentic Indian cuisine menu with tandoori, curries, biryani, and more' },
    { name: 'Catering', href: '/catering', description: 'Professional catering services for weddings, corporate events, and private parties' },
    { name: 'About Us', href: '/story', description: 'Our story, mission, and commitment to authentic Indian cuisine' },
    { name: 'Locations', href: '/locations', description: 'Find our restaurant location in Alexandria, LA with hours and directions' },
    { name: 'Events', href: '/events', description: 'Upcoming events, special occasions, and celebrations at Golden Lotus' },
  ],
  info: [
    { name: 'Contact Us', href: '/contact', description: 'Get in touch with us for reservations, catering inquiries, and general questions' },
    { name: 'Careers', href: '/careers', description: 'Join our team - View current job openings and apply online' },
    { name: 'Gift Cards', href: '/gift-cards', description: 'Purchase gift cards for friends and family' },
  ],
  legal: [
    { name: 'Terms of Service', href: '/terms', description: 'Terms and conditions for using our website and services' },
    { name: 'Privacy Policy', href: '/privacy', description: 'How we collect, use, and protect your personal information' },
    { name: 'Accessibility', href: '/accessibility', description: 'Our commitment to web accessibility for all users' },
  ],
  account: [
    { name: 'Sign In', href: '/login', description: 'Access your account to view orders and manage preferences' },
    { name: 'Create Account', href: '/signup', description: 'Create a new account for faster checkout and order tracking' },
    { name: 'My Profile', href: '/profile', description: 'Manage your account settings, addresses, and preferences' },
    { name: 'My Orders', href: '/profile?tab=orders', description: 'View your order history and track current orders' },
  ],
};

export default function Sitemap() {
  const breadcrumbs = breadcrumbSchema([
    { name: 'Home', item: 'https://www.goldenlotusgrill.com/' },
    { name: 'Sitemap', item: 'https://www.goldenlotusgrill.com/sitemap' },
  ]);

  return (
    <>
      <SEO
        title="Sitemap | Golden Lotus Grill"
        description="Complete sitemap of Golden Lotus Grill website. Find all pages including menu, catering services, locations, contact information, and more."
        keywords="sitemap, golden lotus sitemap, restaurant website map, golden lotus grill pages"
        url="https://www.goldenlotusgrill.com/sitemap"
        schema={[breadcrumbs]}
      />

      <div className="min-h-screen bg-lotus-cream/30">
        {/* Hero Section */}
        <section className="bg-lotus-dark py-16 md:py-24">
          <div className="section-padding">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-['Playfair_Display']">
                Website Sitemap
              </h1>
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                Find your way around Golden Lotus Grill. Browse all our pages including 
                menu, catering services, locations, and more.
              </p>
            </div>
          </div>
        </section>

        {/* Sitemap Content */}
        <section className="section-padding py-12 md:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Main Pages */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-lotus-dark mb-4 pb-3 border-b-2 border-lotus-gold font-['Playfair_Display']">
                  Main Pages
                </h2>
                <ul className="space-y-3">
                  {siteStructure.main.map((page) => (
                    <li key={page.href}>
                      <Link
                        to={page.href}
                        className="group block"
                      >
                        <span className="text-lotus-dark font-medium group-hover:text-lotus-gold transition-colors">
                          {page.name}
                        </span>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {page.description}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Information Pages */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-lotus-dark mb-4 pb-3 border-b-2 border-lotus-gold font-['Playfair_Display']">
                  Information
                </h2>
                <ul className="space-y-3">
                  {siteStructure.info.map((page) => (
                    <li key={page.href}>
                      <Link
                        to={page.href}
                        className="group block"
                      >
                        <span className="text-lotus-dark font-medium group-hover:text-lotus-gold transition-colors">
                          {page.name}
                        </span>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {page.description}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Account Pages */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-lotus-dark mb-4 pb-3 border-b-2 border-lotus-gold font-['Playfair_Display']">
                  Your Account
                </h2>
                <ul className="space-y-3">
                  {siteStructure.account.map((page) => (
                    <li key={page.href}>
                      <Link
                        to={page.href}
                        className="group block"
                      >
                        <span className="text-lotus-dark font-medium group-hover:text-lotus-gold transition-colors">
                          {page.name}
                        </span>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {page.description}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal Pages */}
              <div className="bg-white rounded-xl p-6 shadow-sm md:col-span-2 lg:col-span-3">
                <h2 className="text-xl font-bold text-lotus-dark mb-4 pb-3 border-b-2 border-lotus-gold font-['Playfair_Display']">
                  Legal & Policies
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {siteStructure.legal.map((page) => (
                    <Link
                      key={page.href}
                      to={page.href}
                      className="group block p-4 bg-gray-50 rounded-lg hover:bg-lotus-gold/5 transition-colors"
                    >
                      <span className="text-lotus-dark font-medium group-hover:text-lotus-gold transition-colors">
                        {page.name}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        {page.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Contact */}
            <div className="mt-12 bg-gradient-to-r from-lotus-gold/10 to-lotus-gold/5 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-lotus-dark mb-6 font-['Playfair_Display']">
                Quick Contact Information
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-lotus-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-lotus-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lotus-dark mb-1">Address</h3>
                    <p className="text-sm text-gray-600">
                      1473 Dorchester Dr<br />
                      Alexandria, LA 71301
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-lotus-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-lotus-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lotus-dark mb-1">Phone</h3>
                    <a 
                      href="tel:+13185551234" 
                      className="text-sm text-lotus-gold hover:underline"
                    >
                      (318) 555-1234
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-lotus-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-lotus-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lotus-dark mb-1">Email</h3>
                    <a 
                      href="mailto:info@goldenlotusgrill.com" 
                      className="text-sm text-lotus-gold hover:underline"
                    >
                      info@goldenlotusgrill.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-lotus-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-lotus-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lotus-dark mb-1">Hours</h3>
                    <p className="text-sm text-gray-600">
                      Mon-Sun: 11AM-10PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* XML Sitemap Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-3">
                Looking for our XML sitemap for search engines?
              </p>
              <a 
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-lotus-gold hover:text-lotus-gold-dark font-medium"
              >
                View XML Sitemap
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
