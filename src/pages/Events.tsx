import { useState, useEffect } from 'react';
import { Calendar, Users, Music, Palette, Sparkles, Camera, UtensilsCrossed, Phone } from 'lucide-react';
import { DataStore } from '@/data/store';

export default function Events() {
  const [hennaContent, setHennaContent] = useState({
    title: '',
    description: '',
    image: '',
  });

  useEffect(() => {
    const content = DataStore.getSiteContent();
    setHennaContent(content.events.hennaParty);
  }, []);

  const features = [
    { icon: <Palette className="w-8 h-8" />, title: 'Henna Art', desc: 'Beautiful, intricate designs by skilled artists' },
    { icon: <Music className="w-8 h-8" />, title: 'Live Music', desc: 'Traditional Indian music and entertainment' },
    { icon: <UtensilsCrossed className="w-8 h-8" />, title: 'Authentic Cuisine', desc: 'Full menu of Indian delicacies' },
    { icon: <Camera className="w-8 h-8" />, title: 'Photo Booth', desc: 'Capture memories with themed props' },
  ];

  const packages = [
    {
      name: 'Basic Package',
      price: '$35',
      per: 'per person',
      features: ['2-hour henna session', 'Welcome drink', 'Appetizer platter', 'Minimum 10 guests'],
    },
    {
      name: 'Premium Package',
      price: '$55',
      per: 'per person',
      features: ['3-hour henna session', 'Unlimited drinks', 'Full dinner buffet', 'Live music', 'Minimum 15 guests'],
      popular: true,
    },
    {
      name: 'Deluxe Package',
      price: '$85',
      per: 'per person',
      features: ['4-hour henna session', 'Premium bar', 'Gourmet dinner', 'Live entertainment', 'Photo booth', 'Private dining room', 'Minimum 20 guests'],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${hennaContent.image})` }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        <div className="relative z-10 text-center text-white px-4 section-padding max-w-3xl mx-auto">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-lotus-gold" />
          <h1 className="heading-lg mb-4">{hennaContent.title}</h1>
          <p className="text-lg opacity-90">
            {hennaContent.description}
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 lg:py-20 bg-white">
        <div className="section-padding">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="heading-md text-lotus-dark mb-4">What to Expect</h2>
            <p className="text-body text-lg">
              Our Henna Party experience combines traditional Indian culture with modern celebration, 
              creating unforgettable memories for you and your guests.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 bg-lotus-cream rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="text-lotus-gold mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="font-semibold text-lotus-dark mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-12 lg:py-20 bg-lotus-cream">
        <div className="section-padding">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="heading-md text-lotus-dark mb-4">Henna Party Packages</h2>
            <p className="text-body text-lg">
              Choose the perfect package for your celebration. All packages can be customized 
              to meet your specific needs.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {packages.map((pkg, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl p-8 shadow-lg relative ${
                  pkg.popular ? 'ring-2 ring-lotus-gold lg:scale-105' : ''
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-lotus-gold text-white text-sm font-bold rounded-full">
                    Most Popular
                  </span>
                )}
                
                <h3 className="text-xl font-bold text-lotus-dark mb-2">{pkg.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-lotus-gold">{pkg.price}</span>
                  <span className="text-gray-500 text-sm"> {pkg.per}</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-2">
                      <Sparkles className="w-5 h-5 text-lotus-gold flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    pkg.popular
                      ? 'bg-lotus-gold text-white hover:bg-lotus-gold-dark'
                      : 'bg-gray-100 text-lotus-dark hover:bg-gray-200'
                  }`}
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-12 lg:py-20 bg-white">
        <div className="section-padding">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="heading-md text-lotus-dark mb-4">Henna Party Gallery</h2>
            <p className="text-body text-lg">
              See photos from our previous Henna Party events and get inspired for your own celebration.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              'https://images.unsplash.com/photo-1597223685420-69a5b49c8ec0?w=400',
              'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
              'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
              'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
            ].map((image, index) => (
              <div key={index} className="aspect-square rounded-xl overflow-hidden">
                <img
                  src={image}
                  alt={`Henna Party ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking CTA */}
      <section className="py-16 bg-lotus-gold">
        <div className="section-padding text-center text-white max-w-3xl mx-auto">
          <Calendar className="w-12 h-12 mx-auto mb-4" />
          <h2 className="heading-md mb-4">Ready to Book Your Henna Party?</h2>
          <p className="text-lg opacity-90 mb-8">
            Contact us today to reserve your date and start planning an unforgettable 
            celebration of Indian culture.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:3057917755"
              className="btn-outline inline-flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Call (305) 791-7755
            </a>
            <a
              href="/catering"
              className="btn-outline inline-flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              Request Catering
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
