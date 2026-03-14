import { useState, useEffect } from 'react';
import { Calendar, Users, Music, Palette, Sparkles, Camera, UtensilsCrossed, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { DataStore } from '@/data/store';
import type { Event, EventPackage } from '@/types';
import SEO, { breadcrumbSchema } from '@/components/SEO';

// Icon mapping for features
const iconComponents: Record<string, React.ReactNode> = {
  palette: <Palette className="w-8 h-8" />,
  music: <Music className="w-8 h-8" />,
  utensils: <UtensilsCrossed className="w-8 h-8" />,
  camera: <Camera className="w-8 h-8" />,
  calendar: <Calendar className="w-8 h-8" />,
  users: <Users className="w-8 h-8" />,
  star: <Sparkles className="w-8 h-8" />,
  heart: <Sparkles className="w-8 h-8" />,
  sparkles: <Sparkles className="w-8 h-8" />,
  gift: <Sparkles className="w-8 h-8" />,
  cake: <Sparkles className="w-8 h-8" />,
  wine: <Sparkles className="w-8 h-8" />,
};

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [packages, setPackages] = useState<EventPackage[]>([]);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [galleryRef, setGalleryRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadedEvents = DataStore.getEvents().filter(e => e.active !== false);
    const loadedPackages = DataStore.getEventPackages();
    setEvents(loadedEvents);
    setPackages(loadedPackages);
    
    if (loadedEvents.length > 0) {
      setActiveEvent(loadedEvents[0]);
    }
  }, []);

  const activeEventPackages = activeEvent 
    ? packages.filter(p => p.eventId === activeEvent.id)
    : [];

  const scrollGallery = (direction: 'left' | 'right') => {
    if (galleryRef) {
      const scrollAmount = 300;
      galleryRef.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (events.length === 0) {
    return (
      <>
        <SEO 
          title="Special Events | Golden Lotus Indian Restaurant"
          description="Discover special events and celebrations at Golden Lotus. Henna parties, themed nights, and more. Book your spot today!"
          url="https://www.goldenlotusgrill.com/events"
        />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-lotus-dark mb-2">No Events Available</h2>
          <p className="text-gray-500">Check back soon for upcoming events!</p>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Special Events & Celebrations | Golden Lotus Alexandria, LA"
        description="Join us for special events at Golden Lotus in Alexandria, Louisiana. Henna parties, themed nights, cultural celebrations, and exclusive dining experiences. Located at 1473 Dorchester Dr. Reserve your spot!"
        keywords="events Alexandria LA, henna party Louisiana, themed nights, cultural events, Indian restaurant events Alexandria, 71301 events, celebration Alexandria"
        url="https://www.goldenlotusgrill.com/events"
        schema={breadcrumbSchema([
          { name: 'Home', url: 'https://www.goldenlotusgrill.com' },
          { name: 'Events', url: 'https://www.goldenlotusgrill.com/events' },
        ])}
      />
    <div className="min-h-screen bg-gray-50">
      {/* Event Selector - Show if multiple events */}
      {events.length > 1 && (
        <div className="bg-white border-b">
          <div className="section-padding py-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {events.map(event => (
                <button
                  key={event.id}
                  onClick={() => setActiveEvent(event)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeEvent?.id === event.id
                      ? 'bg-lotus-gold text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {event.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeEvent && (
        <>
          {/* Hero Section */}
          <section className="relative h-[400px] sm:h-[500px] flex items-center justify-center">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${activeEvent.image})` }}
            >
              <div className="absolute inset-0 bg-black/60" />
            </div>
            
            <div className="relative z-10 text-center text-white px-4 section-padding max-w-3xl mx-auto">
              <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-lotus-gold" />
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                {activeEvent.title}
              </h1>
              <p className="text-base sm:text-lg opacity-90">
                {activeEvent.description}
              </p>
            </div>
          </section>

          {/* Features Section */}
          {activeEvent.features && activeEvent.features.length > 0 && (
            <section className="py-12 lg:py-20 bg-white">
              <div className="section-padding">
                <div className="text-center max-w-3xl mx-auto mb-12">
                  <h2 className="text-2xl sm:text-3xl font-bold text-lotus-dark mb-4">What to Expect</h2>
                  <p className="text-gray-600 text-base sm:text-lg">
                    Our {activeEvent.title} experience combines traditional Indian culture with modern celebration, 
                    creating unforgettable memories for you and your guests.
                  </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {activeEvent.features.map((feature, index) => (
                    <div
                      key={index}
                      className="text-center p-4 sm:p-6 bg-lotus-cream rounded-xl hover:shadow-lg transition-shadow"
                    >
                      <div className="text-lotus-gold mb-3 sm:mb-4 flex justify-center">
                        {iconComponents[feature.icon] || <Sparkles className="w-8 h-8" />}
                      </div>
                      <h3 className="font-semibold text-lotus-dark mb-1 sm:mb-2 text-sm sm:text-base">{feature.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Packages Section */}
          {activeEventPackages.length > 0 && (
            <section className="py-12 lg:py-20 bg-lotus-cream">
              <div className="section-padding">
                <div className="text-center max-w-3xl mx-auto mb-12">
                  <h2 className="text-2xl sm:text-3xl font-bold text-lotus-dark mb-4">Packages</h2>
                  <p className="text-gray-600 text-base sm:text-lg">
                    Choose the perfect package for your celebration. All packages can be customized 
                    to meet your specific needs.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
                  {activeEventPackages.map((pkg, index) => (
                    <div
                      key={index}
                      className={`bg-white rounded-2xl p-6 sm:p-8 shadow-lg relative ${
                        pkg.popular ? 'ring-2 ring-lotus-gold lg:scale-105' : ''
                      }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1 bg-lotus-gold text-white text-xs sm:text-sm font-bold rounded-full">
                          Most Popular
                        </span>
                      )}
                      
                      <h3 className="text-lg sm:text-xl font-bold text-lotus-dark mb-2">{pkg.name}</h3>
                      <div className="mb-4 sm:mb-6">
                        <span className="text-3xl sm:text-4xl font-bold text-lotus-gold">{pkg.price}</span>
                        <span className="text-gray-500 text-sm"> {pkg.per}</span>
                      </div>
                      
                      <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                        {pkg.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-lotus-gold flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <button
                        className={`w-full py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
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
          )}

          {/* Gallery Section */}
          {activeEvent.gallery && activeEvent.gallery.length > 0 && (
            <section className="py-12 lg:py-20 bg-white">
              <div className="section-padding">
                <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
                  <h2 className="text-2xl sm:text-3xl font-bold text-lotus-dark mb-4">Gallery</h2>
                  <p className="text-gray-600 text-base sm:text-lg">
                    See photos from our previous events and get inspired for your own celebration.
                  </p>
                </div>

                <div className="relative">
                  <button
                    onClick={() => scrollGallery('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-lotus-cream transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  <div
                    ref={setGalleryRef}
                    className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-8 sm:px-12"
                  >
                    {activeEvent.gallery.map((image, index) => (
                      <div
                        key={index}
                        className="flex-shrink-0 w-48 sm:w-64 lg:w-80 aspect-square rounded-xl overflow-hidden"
                      >
                        <img
                          src={image}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => scrollGallery('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-lotus-cream transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Booking CTA */}
          <section className="py-12 sm:py-16 bg-lotus-gold">
            <div className="section-padding text-center text-white max-w-3xl mx-auto">
              <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                {activeEvent.ctaTitle || `Ready to Book Your ${activeEvent.title}?`}
              </h2>
              <p className="text-base sm:text-lg opacity-90 mb-6 sm:mb-8">
                {activeEvent.ctaDescription || 'Contact us today to reserve your date and start planning an unforgettable celebration.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <a
                  href={`tel:${activeEvent.phone || '3057917755'}`}
                  className="btn-outline inline-flex items-center justify-center gap-2 text-sm sm:text-base py-3"
                >
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                  Call {activeEvent.phone || '(305) 791-7755'}
                </a>
                <a
                  href="/catering"
                  className="btn-outline inline-flex items-center justify-center gap-2 text-sm sm:text-base py-3"
                >
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  Request Catering
                </a>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
    </>
  );
}
