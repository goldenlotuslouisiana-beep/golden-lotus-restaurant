import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, ExternalLink, Navigation } from 'lucide-react';
import { DataStore } from '@/data/store';
import type { Location } from '@/types';
import SEO, { breadcrumbSchema } from '@/components/SEO';

export default function Locations() {
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    setLocations(DataStore.getLocations());
  }, []);

  return (
    <>
      <SEO 
        title="Our Location | Golden Lotus Indian Restaurant | Alexandria, LA 71301"
        description="Visit Golden Lotus at 1473 Dorchester Dr, Alexandria, LA 71301. Authentic Indian cuisine in Central Louisiana. View hours, contact info, and directions. Order online for pickup!"
        keywords="Golden Lotus location, Indian restaurant Alexandria LA, 1473 Dorchester Dr, Alexandria LA restaurant, restaurant hours 71301, directions Alexandria Louisiana, Indian food near me"
        url="https://www.goldenlotusgrill.com/locations"
        schema={breadcrumbSchema([
          { name: 'Home', url: 'https://www.goldenlotusgrill.com' },
          { name: 'Locations', url: 'https://www.goldenlotusgrill.com/locations' },
        ])}
      />
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[350px] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920)' }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        <div className="relative z-10 text-center text-white px-4 section-padding">
          <h1 className="heading-lg mb-4">Our Location</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Visit us at 1473 Dorchester Dr, Alexandria, LA 71301 in Central Louisiana. 
            Experience authentic Indian cuisine in a warm, welcoming atmosphere.
          </p>
        </div>
      </section>

      {/* Locations Grid */}
      <section className="py-12 lg:py-20">
        <div className="section-padding">
          <div className="grid lg:grid-cols-2 gap-8">
            {locations.map((location) => (
              <div
                key={location.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                {/* Location Image */}
                <div className="h-48 bg-gradient-to-r from-lotus-gold to-lotus-gold-light flex items-center justify-center">
                  <div className="text-center text-white">
                    <MapPin className="w-16 h-16 mx-auto mb-2" />
                    <h2 className="text-2xl font-bold">{location.city}</h2>
                  </div>
                </div>

                {/* Location Details */}
                <div className="p-8">
                  <h3 className="text-xl font-bold text-lotus-dark mb-1">
                    {location.name}
                  </h3>
                  <p className="text-lotus-gold font-medium mb-6">
                    {location.city}, {location.state}
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-lotus-cream rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-lotus-gold" />
                      </div>
                      <div>
                        <p className="font-medium text-lotus-dark">Address</p>
                        <p className="text-gray-600">{location.address}</p>
                        <p className="text-gray-600">
                          {location.city}, {location.state} {location.zip}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-lotus-cream rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-lotus-gold" />
                      </div>
                      <div>
                        <p className="font-medium text-lotus-dark">Phone</p>
                        <a
                          href={`tel:${location.phone}`}
                          className="text-gray-600 hover:text-lotus-gold transition-colors"
                        >
                          {location.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-lotus-cream rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-lotus-gold" />
                      </div>
                      <div>
                        <p className="font-medium text-lotus-dark">Email</p>
                        <a
                          href={`mailto:${location.email}`}
                          className="text-gray-600 hover:text-lotus-gold transition-colors"
                        >
                          {location.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-lotus-cream rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-lotus-gold" />
                      </div>
                      <div>
                        <p className="font-medium text-lotus-dark">Hours</p>
                        <div className="text-gray-600 text-sm">
                          {location.hours.map((hour) => (
                            <div key={hour.day} className="flex justify-between gap-8">
                              <span>{hour.day}</span>
                              <span>
                                {hour.isClosed
                                  ? 'Closed'
                                  : `${hour.open} - ${hour.close}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <a
                      href={location.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 btn-secondary flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-4 h-4" />
                      Directions
                    </a>
                    <a
                      href={`tel:${location.phone}`}
                      className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Call Now
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section Placeholder */}
      <section className="py-12 lg:py-20 bg-white">
        <div className="section-padding">
          <div className="text-center mb-8">
            <h2 className="heading-sm text-lotus-dark mb-4">Find Us on the Map</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our location is easily accessible with ample parking. 
              Visit us today at 1473 Dorchester Dr and experience the best Indian food in Alexandria, Louisiana!
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {locations.map((location) => (
              <div
                key={location.id}
                className="aspect-video bg-gray-200 rounded-xl overflow-hidden relative"
              >
                <iframe
                  src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3354.5!2d-92.4626!3d31.2944!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDE3JzQwLjAiTiA5MsKwMjcnNDUuNCJX!5e0!3m2!1sen!2sus!4v1`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${location.city} Location`}
                />
                <a
                  href={location.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-4 right-4 px-4 py-2 bg-white rounded-lg shadow-lg text-sm font-medium text-lotus-dark hover:text-lotus-gold transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in Maps
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-lotus-gold">
        <div className="section-padding text-center text-white max-w-3xl mx-auto">
          <h2 className="heading-md mb-4">Can't Make It In?</h2>
          <p className="text-lg opacity-90 mb-8">
            Order online for pickup or delivery and enjoy our authentic Indian cuisine from the comfort of your home.
          </p>
          <a
            href="/menu?order=true"
            className="btn-outline inline-flex items-center gap-2"
          >
            Order Online Now
          </a>
        </div>
      </section>
    </div>
    </>
  );
}
