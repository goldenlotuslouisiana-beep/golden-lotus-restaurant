import { useState, useEffect } from 'react';
import type { StorySection } from '@/types';
import SEO, { breadcrumbSchema } from '@/components/SEO';

export default function Story() {
  const [storySections, setStorySections] = useState<StorySection[]>([]);

  useEffect(() => {
    fetch('/api/menu?action=site-content')
      .then(r => r.json())
      .then(data => {
        if (data?.story?.sections) setStorySections(data.story.sections);
      })
      .catch(err => console.error('Error loading story:', err));
  }, []);

  return (
    <>
      <SEO 
        title="Our Story | Golden Lotus Indian Restaurant Alexandria, LA"
        description="Discover the story behind Golden Lotus in Alexandria, Louisiana. Our journey from a family kitchen to Central Louisiana's favorite Indian restaurant. Authentic recipes, passionate chefs, and a commitment to excellence."
        keywords="our story, about Golden Lotus, Indian restaurant Alexandria history, family restaurant Louisiana, authentic recipes, 71301 restaurant story"
        url="https://www.goldenlotusgrill.com/story"
        schema={breadcrumbSchema([
          { name: 'Home', url: 'https://www.goldenlotusgrill.com' },
          { name: 'Our Story', url: 'https://www.goldenlotusgrill.com/story' },
        ])}
      />
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1920)' }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        <div className="relative z-10 text-center text-white px-4 section-padding max-w-3xl mx-auto">
          <h1 className="heading-lg mb-4">A Flavorful Journey Begins at Golden Lotus</h1>
          <p className="text-lg opacity-90">
            Discover the story behind Miami's favorite Indian restaurant
          </p>
        </div>
      </section>

      {/* Story Sections */}
      <section className="py-12 lg:py-20">
        <div className="section-padding">
          <div className="max-w-4xl mx-auto space-y-16 lg:space-y-24">
            {storySections.map((section, index) => (
              <div
                key={section.id}
                className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <h2 className="heading-md text-lotus-dark mb-6">
                    {section.title}
                  </h2>
                  <p className="text-body text-lg leading-relaxed">
                    {section.content}
                  </p>
                </div>
                {section.image && (
                  <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                    <img
                      src={section.image}
                      alt={section.title}
                      className="rounded-2xl shadow-xl w-full h-[350px] object-cover"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 lg:py-20 bg-lotus-cream">
        <div className="section-padding">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="heading-md text-lotus-dark mb-4">Our Values</h2>
            <p className="text-body text-lg">
              At Golden Lotus, we believe in serving more than just food. We serve experiences, 
              memories, and a piece of our heritage in every dish.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Authenticity', desc: 'Traditional recipes passed down through generations' },
              { title: 'Quality', desc: 'Only the freshest ingredients in every dish' },
              { title: 'Hospitality', desc: 'Treating every guest like family' },
              { title: 'Community', desc: 'Bringing people together through food' },
            ].map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-bold text-lotus-dark mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 lg:py-20 bg-white">
        <div className="section-padding">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="heading-md text-lotus-dark mb-4">Meet Our Team</h2>
            <p className="text-body text-lg">
              The passionate people behind Golden Lotus who work tirelessly to bring you 
              the best Indian dining experience in Florida.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { name: 'Head Chef', role: 'Master of Flavors', image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400' },
              { name: 'Restaurant Manager', role: 'Hospitality Expert', image: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?w=400' },
              { name: 'Sous Chef', role: 'Culinary Artist', image: 'https://images.unsplash.com/photo-1583394293214-28ez9e9c8f75?w=400' },
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-lotus-dark">{member.name}</h3>
                <p className="text-lotus-gold text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-lotus-gold">
        <div className="section-padding text-center text-white max-w-3xl mx-auto">
          <h2 className="heading-md mb-4">Be Part of Our Story</h2>
          <p className="text-lg opacity-90 mb-8">
            Come experience the flavors and hospitality that have made Golden Lotus 
            a Miami favorite for years.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/menu" className="btn-outline inline-flex items-center justify-center gap-2">
              View Our Menu
            </a>
            <a href="/locations" className="btn-outline inline-flex items-center justify-center gap-2">
              Find Our Locations
            </a>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
