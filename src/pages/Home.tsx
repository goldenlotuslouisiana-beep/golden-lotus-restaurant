import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, Truck, Package, Calendar, Wine, Leaf, UtensilsCrossed, DoorOpen, MapPin, ChevronLeft } from 'lucide-react';
import { DataStore } from '@/data/store';
import type { Testimonial, FeaturedDish } from '@/types';

export default function Home() {

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [featuredDishes, setFeaturedDishes] = useState<FeaturedDish[]>([]);
  const [siteContent, setSiteContent] = useState(DataStore.getSiteContent());
  const [features, setFeatures] = useState(DataStore.getFeatures());
  const galleryRef = useRef<HTMLDivElement>(null);
  const dishesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTestimonials(DataStore.getTestimonials());
    setSiteContent(DataStore.getSiteContent());
    setFeatures(DataStore.getFeatures());

    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/menu?action=items');
        if (res.ok) {
          const items = await res.json();
          const featured = items
            .filter((item: any) => item.popular)
            .slice(0, 6)
            .map((item: any) => ({
              id: item.id || item._id, // Handle both id formats
              name: item.name,
              image: item.image,
              menuItemId: item.id || item._id,
            }));
          setFeaturedDishes(featured);
        } else {
          setFeaturedDishes(DataStore.getFeaturedDishes());
        }
      } catch (e) {
        setFeaturedDishes(DataStore.getFeaturedDishes());
      }
    };
    fetchFeatured();
  }, []);

  const scrollGallery = (direction: 'left' | 'right') => {
    if (galleryRef.current) {
      const scrollAmount = 300;
      galleryRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const scrollDishes = (direction: 'left' | 'right') => {
    if (dishesRef.current) {
      const scrollAmount = 280;
      dishesRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const getFeatureIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      truck: <Truck className="w-5 h-5" />,
      package: <Package className="w-5 h-5" />,
      calendar: <Calendar className="w-5 h-5" />,
      wine: <Wine className="w-5 h-5" />,
      leaf: <Leaf className="w-5 h-5" />,
      utensils: <UtensilsCrossed className="w-5 h-5" />,
      door: <DoorOpen className="w-5 h-5" />,
    };
    return icons[iconName] || <Star className="w-5 h-5" />;
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[500px] sm:h-[600px] lg:h-[700px] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${siteContent.hero.backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 text-center text-white px-4 section-padding max-w-4xl mx-auto mt-10 sm:mt-0">
          <p className="text-base sm:text-lg md:text-xl font-medium mb-3 sm:mb-4 animate-fade-in-up">
            {siteContent.hero.title}
          </p>
          <h1 className="text-4xl sm:text-5xl md:heading-xl mb-6 sm:mb-8 animate-fade-in-up stagger-1 px-2">
            {siteContent.hero.subtitle}
          </h1>
          <Link
            to="/menu?order=true"
            className="btn-primary inline-flex items-center gap-2 animate-fade-in-up stagger-2 text-sm sm:text-base px-6 py-3"
          >
            Order online
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Featured Dishes Section */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="section-padding">
          <div className="flex items-center justify-between mb-8">
            <h2 className="heading-sm text-lotus-dark">Featured</h2>
            <Link
              to="/menu"
              className="flex items-center gap-1 text-lotus-gold hover:text-lotus-gold-dark transition-colors text-sm font-medium"
            >
              View menu
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="relative">
            <button
              onClick={() => scrollDishes('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-lotus-cream transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div
              ref={dishesRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-12"
            >
              {featuredDishes.map((dish) => (
                <Link
                  key={dish.id}
                  to={`/menu?item=${dish.menuItemId}`}
                  className="flex-shrink-0 w-48 lg:w-56 group"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <p className="absolute bottom-3 left-3 right-3 text-white font-medium text-sm">
                      {dish.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <button
              onClick={() => scrollDishes('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-lotus-cream transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-12 lg:py-20 bg-white">
        <div className="section-padding">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl sm:heading-md text-lotus-dark mb-4 sm:mb-6">
                {siteContent.about.title}
              </h2>
              <p className="text-body text-base sm:text-lg leading-relaxed">
                {siteContent.about.content}
              </p>
            </div>
            <div className="relative mt-4 lg:mt-0">
              <img
                src={siteContent.about.image}
                alt="Golden Lotus Restaurant"
                className="rounded-2xl shadow-xl w-full h-[300px] sm:h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Authentic Cuisine Section */}
      <section className="py-12 lg:py-20 bg-lotus-cream">
        <div className="section-padding">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <img
                src={siteContent.cuisine.image}
                alt="Authentic Indian Cuisine"
                className="rounded-2xl shadow-xl w-full h-[300px] sm:h-[400px] object-cover"
              />
            </div>
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <h2 className="text-3xl sm:heading-md text-lotus-dark mb-4 sm:mb-6">
                {siteContent.cuisine.title}
              </h2>
              <p className="text-body text-base sm:text-lg leading-relaxed mb-6">
                {siteContent.cuisine.description}
              </p>
              <Link to="/menu" className="btn-primary inline-flex items-center gap-2">
                Explore Our Menu
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Order CTA Section */}
      <section className="py-16 lg:py-24 bg-lotus-gold">
        <div className="section-padding text-center text-white max-w-3xl mx-auto">
          <h2 className="heading-md mb-4">Order From Our Website!</h2>
          <p className="text-lg opacity-90 mb-8">
            Craving something bold and delicious? Skip the wait and order straight from our website!
            With just a few clicks, you can have our flavorful dishes delivered right to your door.
            Quick, easy, and packed with the authentic taste you love. Why wait? Get your flavor fix now!
          </p>
          <Link
            to="/menu?order=true"
            className="btn-outline inline-flex items-center gap-2"
          >
            Order Now
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Gallery Section - Only show if enabled in settings */}
      {siteContent.settings?.showGallery !== false && (
        <section className="py-12 lg:py-16 bg-white">
          <div className="section-padding">
            <h2 className="heading-sm text-lotus-dark mb-8 text-center">
              A Feast for Your Eyes! 📸
            </h2>
            <p className="text-center text-gray-600 mb-8">
              Explore the vibrant, mouth-watering creations that come from our kitchen!
            </p>

            <div className="relative">
              <button
                onClick={() => scrollGallery('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-lotus-cream transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div
                ref={galleryRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-12"
              >
                {DataStore.getGalleryImages().map((image) => (
                  <div
                    key={image.id}
                    className="flex-shrink-0 w-64 lg:w-80 aspect-square rounded-xl overflow-hidden"
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() => scrollGallery('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-lotus-cream transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Ambience Section */}
      <section className="py-12 lg:py-20 bg-lotus-cream">
        <div className="section-padding">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl sm:heading-md text-lotus-dark mb-4 sm:mb-6">
                {siteContent.ambience.title}
              </h2>
              <p className="text-body text-base sm:text-lg leading-relaxed">
                {siteContent.ambience.description}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-4 lg:mt-0">
              {siteContent.ambience.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Ambience ${index + 1}`}
                  className={`rounded-xl shadow-lg w-full h-32 sm:h-48 object-cover ${index === 0 ? 'col-span-2 h-48 sm:h-64' : ''
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Catering CTA Section */}
      <section className="py-12 lg:py-20 bg-white">
        <div className="section-padding">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <img
                src={siteContent.catering.image}
                alt="Catering"
                className="rounded-2xl shadow-xl w-full h-[300px] sm:h-[400px] object-cover"
              />
            </div>
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <h2 className="text-3xl sm:heading-md text-lotus-dark mb-4 sm:mb-6">
                {siteContent.catering.title}
              </h2>
              <p className="text-body text-base sm:text-lg leading-relaxed mb-6">
                {siteContent.catering.description}
              </p>
              <Link to="/catering" className="btn-primary inline-flex items-center gap-2">
                Cater Now
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Visit Us Section */}
      <section className="py-12 lg:py-24 bg-lotus-gold">
        <div className="section-padding text-center text-white max-w-4xl mx-auto">
          <h2 className="text-3xl sm:heading-md mb-4 sm:mb-6">{siteContent.visitUs.title}</h2>
          <p className="text-base sm:text-lg opacity-90 leading-relaxed px-4">
            {siteContent.visitUs.content}
          </p>
          <div className="mt-6 sm:mt-8">
            <Link
              to="/locations"
              className="btn-outline inline-flex items-center gap-2 bg-white/10 hover:bg-white hover:text-lotus-gold transition-colors text-sm sm:text-base border-white"
            >
              Check Our Locations
              <MapPin className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Only show if enabled in settings */}
      {siteContent.settings?.showTestimonials !== false && (
        <section className="py-12 lg:py-16 bg-white">
          <div className="section-padding">
            <h2 className="heading-sm text-lotus-dark mb-8 text-center">
              What our guests are saying
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials
                .filter((t) => t.published !== false)
                .slice(0, 3)
                .map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="bg-lotus-cream rounded-xl p-6"
                  >
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-lotus-gold text-lotus-gold" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 line-clamp-4">{testimonial.text}</p>
                    <p className="font-medium text-lotus-dark">{testimonial.name}</p>
                  </div>
                ))}
            </div>

            {testimonials.filter((t) => t.published !== false).length > 3 && (
              <div className="text-center mt-8">
                <button className="text-lotus-gold hover:text-lotus-gold-dark transition-colors font-medium">
                  View more
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features Section - Only show if enabled in settings */}
      {siteContent.settings?.showFeatures !== false && (
        <section className="py-12 lg:py-16 bg-lotus-cream">
          <div className="section-padding">
            <h2 className="heading-sm text-lotus-dark mb-8 text-center">Featuring</h2>

            <div className="flex flex-wrap justify-center gap-4">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm"
                >
                  <span className="text-lotus-gold">{getFeatureIcon(feature.icon)}</span>
                  <span className="text-sm font-medium text-lotus-dark">{feature.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Rewards Section */}
      <section className="py-12 lg:py-20 bg-white">
        <div className="section-padding">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="heading-md text-lotus-dark mb-4">
              {siteContent.rewards.title}
            </h2>
            <p className="text-body text-lg mb-8">
              {siteContent.rewards.description}
            </p>
            <button className="btn-primary inline-flex items-center gap-2">
              Start Earning Now
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
