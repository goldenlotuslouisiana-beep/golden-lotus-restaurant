import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, Star, Truck, Package, Calendar, Wine, Leaf, 
  UtensilsCrossed, ChevronLeft, ArrowRight, MapPin, Phone
} from 'lucide-react';
import { DataStore } from '@/data/store';
import type { Testimonial, FeaturedDish } from '@/types';
import SEO, { restaurantSchema, breadcrumbSchema } from '@/components/SEO';
import { motion, useScroll, useTransform } from 'framer-motion';



export default function Home() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [featuredDishes, setFeaturedDishes] = useState<FeaturedDish[]>([]);
  const [siteContent, setSiteContent] = useState(DataStore.getSiteContent());
  const [features, setFeatures] = useState(DataStore.getFeatures());
  const galleryRef = useRef<HTMLDivElement>(null);
  const dishesRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);

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
              id: item.id || item._id,
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
      const scrollAmount = 320;
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
    };
    return icons[iconName] || <Star className="w-5 h-5" />;
  };

  return (
    <>
      <SEO 
        title="Golden Lotus Indian Restaurant | Authentic Indian Cuisine in Alexandria, LA"
        description="Golden Lotus offers authentic Indian cuisine, catering services, and unforgettable dining experiences in Alexandria, Louisiana. Located at 1473 Dorchester Dr."
        url="https://www.goldenlotusgrill.com"
        schema={[restaurantSchema, breadcrumbSchema([{ name: 'Home', url: 'https://www.goldenlotusgrill.com' }])]}
      />
      
      <div className="overflow-hidden">
        {/* Hero Section */}
        {siteContent.settings?.showHero !== false && (
          <section ref={heroRef} className="relative h-[600px] sm:h-[700px] lg:h-[800px] flex items-center justify-center overflow-hidden">
            <motion.div
              style={{ scale: heroScale }}
              className="absolute inset-0"
            >
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${siteContent.hero.backgroundImage})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
            </motion.div>

            <motion.div 
              style={{ opacity: heroOpacity, y: heroY }}
              className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto"
            >
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-sm sm:text-base md:text-lg font-medium mb-4 tracking-widest uppercase text-lotus-gold"
              >
                {siteContent.hero.title}
              </motion.p>
              
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-tight font-serif"
              >
                {siteContent.hero.subtitle}
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto"
              >
                Experience authentic Indian flavors in the heart of Alexandria, Louisiana
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link
                  to="/menu?order=true"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-lotus-gold to-orange-500 text-white font-semibold rounded-full shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105"
                >
                  Order Online
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/menu"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  View Menu
                </Link>
              </motion.div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
              <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-2">
                <motion.div 
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-1.5 h-1.5 bg-white rounded-full"
                />
              </div>
            </motion.div>
          </section>
        )}

        {/* Features Bar */}
        <section className="bg-lotus-dark py-8 -mt-1 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: <UtensilsCrossed className="w-6 h-6" />, title: 'Authentic Cuisine', desc: 'Traditional Indian recipes' },
                { icon: <Leaf className="w-6 h-6" />, title: 'Fresh Ingredients', desc: 'Daily sourced produce' },
                { icon: <Truck className="w-6 h-6" />, title: 'Fast Delivery', desc: 'Hot & fresh to your door' },
                { icon: <Star className="w-6 h-6" />, title: '4.8 Rating', desc: 'From 1000+ reviews' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3 text-white"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-lotus-gold">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Dishes Section */}
        {siteContent.settings?.showFeaturedDishes !== false && (
          <section className="py-20 lg:py-28 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-12">
                <div>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-lotus-gold font-semibold uppercase tracking-wider text-sm mb-2"
                  >
                    Customer Favorites
                  </motion.p>
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl sm:text-4xl font-bold text-lotus-dark font-serif"
                  >
                    Featured Dishes
                  </motion.h2>
                </div>
                <Link
                  to="/menu"
                  className="hidden sm:flex items-center gap-2 text-lotus-gold hover:text-lotus-gold-dark transition-colors font-medium"
                >
                  View Full Menu
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="relative">
                <button
                  onClick={() => scrollDishes('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-lotus-cream transition-colors border border-gray-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div
                  ref={dishesRef}
                  className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-14"
                >
                  {featuredDishes.map((dish, idx) => (
                    <motion.div
                      key={dish.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Link
                        to={`/menu?item=${dish.menuItemId}`}
                        className="flex-shrink-0 w-64 group block"
                      >
                        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-4 shadow-lg">
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-5">
                            <p className="text-white font-semibold text-lg mb-1">{dish.name}</p>
                            <p className="text-white/80 text-sm flex items-center gap-1">
                              View details <ChevronRight className="w-4 h-4" />
                            </p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <button
                  onClick={() => scrollDishes('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-lotus-cream transition-colors border border-gray-100"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Welcome/About Section */}
        {siteContent.settings?.showAbout !== false && (
          <section className="py-20 lg:py-28 bg-lotus-cream">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <p className="text-lotus-gold font-semibold uppercase tracking-wider text-sm mb-3">About Us</p>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-lotus-dark mb-6 font-serif leading-tight">
                    {siteContent.about.title}
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed mb-8">
                    {siteContent.about.content}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      to="/story"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-lotus-dark text-white font-medium rounded-full hover:bg-lotus-gold transition-colors"
                    >
                      Our Story
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/locations"
                      className="inline-flex items-center gap-2 px-6 py-3 border-2 border-lotus-dark text-lotus-dark font-medium rounded-full hover:bg-lotus-dark hover:text-white transition-colors"
                    >
                      <MapPin className="w-4 h-4" />
                      Find Us
                    </Link>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="relative"
                >
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                    <img
                      src={siteContent.about.image}
                      alt="Golden Lotus Restaurant"
                      className="w-full h-[500px] object-cover"
                    />
                  </div>
                  {/* Decorative element */}
                  <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-lotus-gold/20 rounded-full blur-3xl" />
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-500/20 rounded-full blur-2xl" />
                </motion.div>
              </div>
            </div>
          </section>
        )}

        {/* Order CTA Section */}
        {siteContent.orderCTA?.enabled !== false && siteContent.settings?.showOrderCTA !== false && (
          <section className="py-24 lg:py-32 bg-gradient-to-br from-lotus-gold to-orange-600 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            </div>
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 font-serif">
                  {siteContent.orderCTA?.title || 'Order From Our Website!'}
                </h2>
                <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                  {siteContent.orderCTA?.description || 'Craving something bold and delicious? Skip the wait and order straight from our website!'}
                </p>
                <Link
                  to="/menu?order=true"
                  className="inline-flex items-center gap-3 px-10 py-5 bg-white text-lotus-gold font-bold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  {siteContent.orderCTA?.buttonText || 'Order Now'}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </div>
          </section>
        )}

        {/* Catering CTA Section */}
        {siteContent.settings?.showCatering !== false && (
          <section className="py-20 lg:py-28 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="order-2 lg:order-1"
                >
                  <p className="text-lotus-gold font-semibold uppercase tracking-wider text-sm mb-3">Catering Services</p>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-lotus-dark mb-6 font-serif leading-tight">
                    {siteContent.catering.title}
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed mb-8">
                    {siteContent.catering.description}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      to="/catering"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-lotus-gold to-orange-500 text-white font-semibold rounded-full shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300"
                    >
                      Cater Now
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                    <a
                      href="tel:318-555-0123"
                      className="inline-flex items-center gap-2 px-6 py-4 border-2 border-gray-200 text-gray-700 font-medium rounded-full hover:border-lotus-gold hover:text-lotus-gold transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      Call Us
                    </a>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="order-1 lg:order-2"
                >
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                    <img
                      src={siteContent.catering.image}
                      alt="Catering"
                      className="w-full h-[450px] object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4">
                        <p className="font-semibold text-lotus-dark">Perfect for any occasion</p>
                        <p className="text-sm text-gray-600">Weddings • Corporate Events • Private Parties</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        )}

        {/* Gallery Section */}
        {siteContent.settings?.showGallery !== false && (
          <section className="py-20 lg:py-28 bg-lotus-cream">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <p className="text-lotus-gold font-semibold uppercase tracking-wider text-sm mb-3">Gallery</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-lotus-dark font-serif">
                  A Feast for Your Eyes
                </h2>
              </div>

              <div className="relative">
                <button
                  onClick={() => scrollGallery('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-lotus-cream transition-colors border border-gray-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div
                  ref={galleryRef}
                  className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-14"
                >
                  {DataStore.getGalleryImages().map((image, idx) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex-shrink-0 w-72 lg:w-80"
                    >
                      <div className="aspect-square rounded-2xl overflow-hidden shadow-lg group">
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <button
                  onClick={() => scrollGallery('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-lotus-cream transition-colors border border-gray-100"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Testimonials Section */}
        {siteContent.settings?.showTestimonials !== false && (
          <section className="py-20 lg:py-28 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <p className="text-lotus-gold font-semibold uppercase tracking-wider text-sm mb-3">Testimonials</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-lotus-dark font-serif">
                  What Our Guests Say
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {testimonials
                  .filter((t) => t.published !== false)
                  .slice(0, 3)
                  .map((testimonial, idx) => (
                    <motion.div
                      key={testimonial.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                    >
                      <div className="flex gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-gray-600 mb-6 leading-relaxed">&ldquo;{testimonial.text}&rdquo;</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lotus-gold to-orange-500 flex items-center justify-center text-white font-bold">
                          {testimonial.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-lotus-dark">{testimonial.name}</p>
                          {testimonial.date && (
                            <p className="text-sm text-gray-400">{new Date(testimonial.date).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        {siteContent.settings?.showFeatures !== false && (
          <section className="py-16 bg-lotus-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap justify-center gap-4">
                {features.map((feature, idx) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors cursor-default"
                  >
                    <span className="text-lotus-gold">{getFeatureIcon(feature.icon)}</span>
                    <span className="text-sm font-medium">{feature.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Rewards Section */}
        {siteContent.settings?.showRewards !== false && (
          <section className="py-20 lg:py-28 bg-gradient-to-b from-white to-lotus-cream">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/30">
                  <Star className="w-10 h-10 text-white fill-white" />
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-lotus-dark mb-6 font-serif">
                  {siteContent.rewards.title}
                </h2>
                <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto">
                  {siteContent.rewards.description}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-lotus-gold to-orange-500 text-white font-semibold rounded-full shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300"
                  >
                    Join Rewards Program
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/profile"
                    className="inline-flex items-center gap-2 px-8 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-full hover:border-lotus-gold hover:text-lotus-gold transition-colors"
                  >
                    Check My Points
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
