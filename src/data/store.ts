import type {
  MenuItem,
  MenuCategory,
  Location,
  Testimonial,
  GalleryImage,
  FeaturedDish,
  FAQ,
  Coupon,
  SiteContent,
  AdminUser,
  Feature,
  Order,
  Analytics,
  Event,
  EventPackage,
  CateringPackage,
  CateringInquiry,
} from '@/types';

// Default Admin User
const defaultAdmin: AdminUser = {
  id: '1',
  username: 'admin',
  password: 'admin123',
  email: 'admin@goldenlotus.com',
};

// Default Menu Categories
const defaultMenuCategories: MenuCategory[] = [
  { id: '1', name: 'Popular', order: 1 },
  { id: '2', name: 'Dim Sum', order: 2 },
  { id: '3', name: 'Appetizers', order: 3 },
  { id: '4', name: 'Soups', order: 4 },
  { id: '5', name: 'Noodles', order: 5 },
  { id: '6', name: 'Fried Rice', order: 6 },
  { id: '7', name: 'Beef & Pork', order: 7 },
  { id: '8', name: 'Poultry', order: 8 },
  { id: '9', name: 'Seafood', order: 9 },
  { id: '10', name: 'Vegetables & Tofu', order: 10 },
  { id: '11', name: 'Chef Specials', order: 11 },
  { id: '12', name: 'Desserts', order: 12 },
  { id: '13', name: 'Boba & Tea', order: 13 },
];

// Default Menu Items
const defaultMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Peking Duck',
    description: 'Crispy roasted duck served with steamed pancakes, scallions, cucumber, and sweet bean sauce',
    price: 45.00,
    category: 'Chef Specials',
    image: 'https://images.unsplash.com/photo-1544025162-811c03632906?w=500',
    popular: true,
  },
  {
    id: '2',
    name: 'Xiao Long Bao (Soup Dumplings)',
    description: 'Delicate steamed dumplings filled with savory pork broth',
    price: 12.50,
    category: 'Dim Sum',
    image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=500',
    popular: true,
  },
  {
    id: '3',
    name: 'Mapo Tofu',
    description: 'Soft tofu set in a spicy, numbing sauce with minced pork and Sichuan peppercorns',
    price: 16.00,
    category: 'Vegetables & Tofu',
    image: 'https://images.unsplash.com/photo-1512058454905-6b841e7da1cb?w=500',
    popular: true,
  },
  {
    id: '4',
    name: 'Dan Dan Noodles',
    description: 'Spicy Szechuan noodles with minced pork, scallions, and a rich peanut-sesame sauce',
    price: 15.00,
    category: 'Noodles',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cb438?w=500',
    popular: true,
  },
  {
    id: '5',
    name: 'Crispy Spring Rolls',
    description: 'Hand-rolled with fresh vegetables and glass noodles, served with sweet chili sauce',
    price: 8.50,
    category: 'Appetizers',
    image: 'https://images.unsplash.com/photo-1549488344-c10bfda29e1c?w=500',
    isVegetarian: true,
  },
  {
    id: '6',
    name: 'Kung Pao Chicken',
    description: 'Stir-fried chicken with peanuts, vegetables, and chili peppers',
    price: 18.00,
    category: 'Poultry',
    image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500',
    popular: true,
  },
  {
    id: '7',
    name: 'Mongolian Beef',
    description: 'Sliced flank steak stir-fried with scallions and onions in a savory brown sauce',
    price: 21.00,
    category: 'Beef & Pork',
    image: 'https://images.unsplash.com/photo-1626244199577-fb5fd19391bd?w=500',
    popular: true,
  },
  {
    id: '8',
    name: 'Wonton Soup',
    description: 'Pork and shrimp wontons in a clear, savory chicken broth',
    price: 11.00,
    category: 'Soups',
    image: 'https://images.unsplash.com/photo-1523995460515-564d7dfc89d7?w=500',
  },
  {
    id: '9',
    name: 'Brown Sugar Boba Milk Tea',
    description: 'Classic milk tea with chewy tapioca pearls and brown sugar syrup',
    price: 6.50,
    category: 'Boba & Tea',
    image: 'https://images.unsplash.com/photo-1558855567-1a3af1b54a37?w=500',
    isVegetarian: true,
  },
  {
    id: '10',
    name: 'Egg Tarts',
    description: 'Flaky pastry crust filled with a smooth, sweet egg custard',
    price: 8.00,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1616422323315-7da7a1496a75?w=500',
    isVegetarian: true,
  },
  {
    id: '11',
    name: 'Shrimp Fried Rice',
    description: 'Wok-tossed rice with shrimp, egg, peas, carrots, and scallions',
    price: 17.50,
    category: 'Fried Rice',
    image: 'https://images.unsplash.com/photo-1546250328-7bef2f3b9e42?w=500',
  },
  {
    id: '12',
    name: 'Steamed Edamame',
    description: 'Lightly salted steamed soybeans',
    price: 6.00,
    category: 'Appetizers',
    image: 'https://images.unsplash.com/photo-1563514936382-78d10ed71253?w=500',
    isVegetarian: true,
  },
];

// Default Locations
const defaultLocations: Location[] = [
  {
    id: '1',
    name: 'Golden Lotus Indian Restaurant',
    address: '1473 Dorchester Dr',
    city: 'Alexandria',
    state: 'LA',
    zip: '71301',
    phone: '(318) 555-0123',
    email: 'hello@goldenlotusgrill.com',
    googleMapsUrl: 'https://maps.google.com/?q=1473+Dorchester+Dr+Alexandria+LA+71301',
    hours: [
      { day: 'Monday', open: '11:30 AM', close: '10:00 PM' },
      { day: 'Tuesday', open: '11:30 AM', close: '10:00 PM' },
      { day: 'Wednesday', open: '11:30 AM', close: '10:00 PM' },
      { day: 'Thursday', open: '11:30 AM', close: '10:00 PM' },
      { day: 'Friday', open: '11:30 AM', close: '11:00 PM' },
      { day: 'Saturday', open: '11:00 AM', close: '11:00 PM' },
      { day: 'Sunday', open: '11:00 AM', close: '10:00 PM' },
    ],
  },
];

// Default Testimonials
const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Wei C.',
    rating: 5,
    text: 'Best soup dumplings outside of Shanghai! The broth was rich and the wrappers were perfectly thin. I\'ll definitely be coming back for Dim Sum weekend.',
    published: true,
  },
  {
    id: '2',
    name: 'Sarah M.',
    rating: 5,
    text: 'A friend recommended Golden Lotus for Peking Duck and it did not disappoint. The duck was carved tableside and the skin was incredibly crispy. Fantastic service too.',
    published: true,
  },
  {
    id: '3',
    name: 'David L.',
    rating: 5,
    text: 'I ordered the Mapo Tofu and Dan Dan Noodles. The flavors were completely authentic, bringing that signature mala (numbing and spicy) flavor that you want in Szechuan cuisine. Highly recommend this spot for authentic Chinese food.',
    published: true,
  },
];

// Default Gallery Images
const defaultGalleryImages: GalleryImage[] = [
  { id: '1', src: 'https://images.unsplash.com/photo-1544025162-811c03632906?w=600', alt: 'Peking Duck', category: 'food' },
  { id: '2', src: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600', alt: 'Soup Dumplings', category: 'food' },
  { id: '3', src: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cb438?w=600', alt: 'Dan Dan Noodles', category: 'food' },
  { id: '4', src: 'https://images.unsplash.com/photo-1512058454905-6b841e7da1cb?w=600', alt: 'Mapo Tofu', category: 'food' },
  { id: '5', src: 'https://images.unsplash.com/photo-1558855567-1a3af1b54a37?w=600', alt: 'Boba Tea', category: 'drinks' },
  { id: '6', src: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600', alt: 'Kung Pao Chicken', category: 'food' },
];

// Default Featured Dishes
const defaultFeaturedDishes: FeaturedDish[] = [
  { id: '1', name: 'Peking Duck', image: 'https://images.unsplash.com/photo-1544025162-811c03632906?w=500', menuItemId: '1' },
  { id: '2', name: 'Soup Dumplings', image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=500', menuItemId: '2' },
  { id: '3', name: 'Kung Pao Chicken', image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500', menuItemId: '6' },
  { id: '4', name: 'Mapo Tofu', image: 'https://images.unsplash.com/photo-1512058454905-6b841e7da1cb?w=500', menuItemId: '3' },
  { id: '5', name: 'Dan Dan Noodles', image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cb438?w=500', menuItemId: '4' },
  { id: '6', name: 'Mongolian Beef', image: 'https://images.unsplash.com/photo-1626244199577-fb5fd19391bd?w=500', menuItemId: '7' },
  { id: '7', name: 'Boba Milk Tea', image: 'https://images.unsplash.com/photo-1558855567-1a3af1b54a37?w=500', menuItemId: '9' },
  { id: '8', name: 'Egg Tarts', image: 'https://images.unsplash.com/photo-1616422323315-7da7a1496a75?w=500', menuItemId: '10' },
];

// Default FAQs
const defaultFAQs: FAQ[] = [
  {
    id: '1',
    question: 'What are you known for?',
    answer: 'We are known for our authentic Peking Duck, handmade Dim Sum, hand-pulled Noodles, Mapo Tofu, fresh Boba Tea, and traditional wok-fired dishes.',
  },
  {
    id: '2',
    question: 'Do you offer Dim Sum all day?',
    answer: 'Yes! While Dim Sum is traditionally a breakfast or lunch item, we serve our full Dim Sum menu all day long.',
  },
  {
    id: '3',
    question: 'Do you offer delivery or takeout?',
    answer: 'Yes, we offer both Delivery and Takeout. You can order directly through our website.',
  },
  {
    id: '4',
    question: 'Is your meat Halal?',
    answer: 'Some of our poultry gets sourced from Halal vendors. However, we do handle pork in our kitchen, so we are not a certified Halal establishment.',
  },
];

// Default Coupons
const defaultCoupons: Coupon[] = [
  {
    id: '1',
    code: 'DIMSUM10',
    description: 'Grab 10% off on Dim Sum orders over $50!',
    discountType: 'percentage',
    discountValue: 10,
    minOrder: 50,
    active: true,
  },
  {
    id: '2',
    code: 'FREEDELIVERY',
    description: 'Enjoy FREE delivery on all orders over $40!',
    discountType: 'free_delivery',
    discountValue: 0,
    minOrder: 40,
    active: true,
  },
  {
    id: '3',
    code: 'BOBAMONDAY',
    description: 'Use code BOBAMONDAY for $5 off your total order on Mondays.',
    discountType: 'fixed',
    discountValue: 5,
    minOrder: 25,
    active: true,
  },
];

// Default Site Content
const defaultSiteContent: SiteContent = {
  hero: {
    title: 'Experience Authentic Flavors',
    subtitle: 'Golden Lotus brings you a modern take on traditional Asian cuisine.',
    backgroundImage: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=1920',
  },
  about: {
    title: 'Welcome to Golden Lotus 🪷',
    content: 'Golden Lotus is your destination for authentic Asian cuisine, blending traditional recipes with a modern dining experience. From handmade dim sum to wok-fired specialties, our chefs meticulously craft every dish to bring you bold flavors and comforting classics. Whether you are craving the spice of Szechuan or the delicacy of Canton, we invite you to taste the essence of Asia with us.',
    image: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=800',
  },
  awards: {
    years: ['2023', '2024'],
    title: 'City\'s Best Dim Sum',
    description: 'Voted "Best Dim Sum" and "Top Asian Cuisine" by local culinary reviewers. We pride ourselves on preserving age-old techniques to deliver an unparalleled dining experience.',
    link: '#',
  },
  cuisine: {
    title: 'Masterful Wok & Dim Sum',
    description: 'Our menu is a celebration of Asia\'s diverse culinary map. Experience perfectly roasted Peking Duck, hand-folded Xiao Long Bao, and fiery Szechuan dishes. We use only the freshest ingredients and traditional techniques to honor the rich heritage of our recipes.',
    image: 'https://images.unsplash.com/photo-1546250328-7bef2f3b9e42?w=800',
  },
  bar: {
    title: 'Full Bar',
    description: 'Pair your meal with our carefully curated selection of premium teas sourced directly from Asia, signature Boba milk teas, or Asian-inspired craft cocktails.',
    image: 'https://images.unsplash.com/photo-1558855567-1a3af1b54a37?w=800',
  },
  ambience: {
    title: 'Modern Elegance',
    description: 'Dine in a space that balances modern elegance with traditional Eastern motifs. Golden Lotus provides a vibrant yet intimate atmosphere perfect for date nights, family gatherings, or casual meals with friends.',
    images: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
      'https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?w=600',
    ],
  },
  catering: {
    title: 'Catering for Every Occasion',
    description: 'Elevate your next event with Golden Lotus catering. We provide custom menus ranging from dim sum platters to large wok-tossed dishes, perfect for corporate events, weddings, and parties.',
    image: 'https://images.unsplash.com/photo-1555244162-803279f50793?w=800',
  },
  events: {
    hennaParty: {
      title: 'Henna Party Events',
      description: 'Host a memorable celebration with our exclusive Henna Party experience. Enjoy beautiful henna art, authentic Indian cuisine, live music, and a festive atmosphere perfect for birthdays, bridal showers, or any special occasion.',
      image: 'https://images.unsplash.com/photo-1548142723-aae7678afa53?w=800',
    },
  },
  visitUs: {
    title: 'Dine With Us',
    content: 'Whether you\'re grabbing a quick boba, bringing the family for dim sum, or celebrating a special occasion, Golden Lotus is ready to serve you. Book your table online or stop by our locations today.',
  },
  rewards: {
    title: 'Golden Lotus Rewards',
    description: 'Join the Golden Lotus Rewards program to earn points on every order. Redeem points for free drinks, appetizers, and exclusive member discounts.',
  },
  story: {
    sections: [
      {
        id: '1',
        title: 'A Culinary Tradition',
        content: 'Golden Lotus began with a simple mission: to preserve the authentic flavors of Asian cuisine while presenting them in a modern, welcoming environment. Our founders grew up in kitchens where recipes were passed down through generations.',
        image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=800',
      },
      {
        id: '2',
        title: 'The Art of Dim Sum',
        content: 'Our dim sum chefs begin arriving hours before the sun rises to prepare the day\'s dough, fillings, and wrappers from scratch. It is an art form that requires patience, precision, and a true love for the craft.',
      },
      {
        id: '3',
        title: 'Community First',
        content: 'Beyond the food, Golden Lotus is about community. We strive to be a gathering place where people from all walks of life can share a meal, create memories, and celebrate the rich tapestry of Asian culture.',
      },
    ],
  },
  orderCTA: {
    title: 'Order From Our Website!',
    description: 'Craving something bold and delicious? Skip the wait and order straight from our website! With just a few clicks, you can have our flavorful dishes delivered right to your door. Quick, easy, and packed with the authentic taste you love. Why wait? Get your flavor fix now!',
    buttonText: 'Order Now',
    enabled: true,
  },
  settings: {
    showHero: true,
    showFeaturedDishes: true,
    showAbout: true,
    showOrderCTA: true,
    showGallery: true,
    showAmbience: true,
    showCatering: true,
    showTestimonials: true,
    showFeatures: true,
    showRewards: true,
    showFAQ: false,
  },
};

// Features list
const defaultFeatures: Feature[] = [
  { id: '1', name: 'Delivery', icon: 'truck' },
  { id: '2', name: 'Takeout', icon: 'package' },
  { id: '3', name: 'Reservations recommended', icon: 'calendar' },
  { id: '4', name: 'Premium Tea Selection', icon: 'coffee' },
  { id: '5', name: 'Vegan/Vegetarian Options', icon: 'leaf' },
  { id: '6', name: 'Catering Available', icon: 'utensils' },
  { id: '7', name: 'Private Events', icon: 'door' },
];

// Default Events
const defaultEvents: Event[] = [
  {
    id: '1',
    title: 'Henna Party Events',
    description: 'Host a memorable celebration with our exclusive Henna Party experience. Enjoy beautiful henna art, authentic Indian cuisine, live music, and a festive atmosphere perfect for birthdays, bridal showers, or any special occasion.',
    image: 'https://images.unsplash.com/photo-1548142723-aae7678afa53?w=800',
    features: [
      { icon: 'palette', title: 'Henna Art', desc: 'Beautiful, intricate designs by skilled artists' },
      { icon: 'music', title: 'Live Music', desc: 'Traditional Indian music and entertainment' },
      { icon: 'utensils', title: 'Authentic Cuisine', desc: 'Full menu of Indian delicacies' },
      { icon: 'camera', title: 'Photo Booth', desc: 'Capture memories with themed props' },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1597223685420-69a5b49c8ec0?w=400',
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
    ],
    ctaTitle: 'Ready to Book Your Henna Party?',
    ctaDescription: 'Contact us today to reserve your date and start planning an unforgettable celebration of Indian culture.',
    phone: '(305) 791-7755',
    active: true,
  },
];

// Default Event Packages
const defaultEventPackages: EventPackage[] = [
  {
    id: '1',
    eventId: '1',
    name: 'Basic Package',
    price: '$35',
    per: 'per person',
    features: ['2-hour henna session', 'Welcome drink', 'Appetizer platter', 'Minimum 10 guests'],
  },
  {
    id: '2',
    eventId: '1',
    name: 'Premium Package',
    price: '$55',
    per: 'per person',
    features: ['3-hour henna session', 'Unlimited drinks', 'Full dinner buffet', 'Live music', 'Minimum 15 guests'],
    popular: true,
  },
  {
    id: '3',
    eventId: '1',
    name: 'Deluxe Package',
    price: '$85',
    per: 'per person',
    features: ['4-hour henna session', 'Premium bar', 'Gourmet dinner', 'Live entertainment', 'Photo booth', 'Private dining room', 'Minimum 20 guests'],
  },
];

// Default Orders
const defaultOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    customer: {
      id: 'c1',
      name: 'John Smith',
      email: 'john@example.com',
      phone: '(305) 555-0101',
      address: '123 Main St',
      city: 'Miami',
      zip: '33101',
    },
    items: [
      { id: 'i1', menuItemId: '2', name: 'Soup Dumplings', price: 12.50, quantity: 2 },
      { id: 'i2', menuItemId: '6', name: 'Kung Pao Chicken', price: 18.00, quantity: 1 },
    ],
    subtotal: 43.00,
    tax: 3.44,
    deliveryFee: 3.99,
    discount: 0,
    total: 50.43,
    orderType: 'pickup',
    status: 'picked_up',
    paymentStatus: 'paid',
    paymentMethod: 'online',
    createdAt: '2025-03-09T18:30:00Z',
    updatedAt: '2025-03-09T19:45:00Z',
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    customer: {
      id: 'c2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '(305) 555-0102',
      address: '456 Oak Ave',
      city: 'Pinecrest',
      zip: '33156',
    },
    items: [
      { id: 'i3', menuItemId: '1', name: 'Peking Duck', price: 45.00, quantity: 1 },
      { id: 'i4', menuItemId: '9', name: 'Brown Sugar Boba Milk Tea', price: 6.50, quantity: 2 },
    ],
    subtotal: 58.00,
    tax: 4.64,
    deliveryFee: 0,
    discount: 0,
    total: 62.64,
    orderType: 'pickup',
    status: 'ready',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    createdAt: '2025-03-10T11:15:00Z',
    updatedAt: '2025-03-10T12:00:00Z',
    estimatedReadyTime: '2025-03-10T12:30:00Z',
  },
];

// Professional Catering Packages
const defaultCateringPackages: CateringPackage[] = [
  {
    id: '1',
    name: 'Royal Wedding Feast',
    subtitle: 'Elegant Celebration',
    cateringType: 'wedding',
    description: 'An exquisite dining experience for your special day with premium dishes and elegant presentation.',
    longDescription: 'Our Royal Wedding Feast package offers a comprehensive catering solution for your dream wedding. From the welcome drinks to the final dessert, every detail is crafted to perfection. Includes professional service staff, elegant buffet setup, and customizable menu options.',
    pricePerPerson: 85,
    minGuests: 50,
    maxGuests: 500,
    images: [
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800',
    ],
    featuredImage: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
    menuItems: [
      {
        category: 'Welcome Drinks',
        items: ['Rose Lassi', 'Mango Mojito (Mocktail)', 'Masala Chai']
      },
      {
        category: 'Appetizers',
        items: ['Paneer Tikka', 'Chicken Seekh Kebab', 'Vegetable Samosa', 'Dahi Puri']
      },
      {
        category: 'Main Course',
        items: ['Butter Chicken', 'Paneer Butter Masala', 'Dal Makhani', 'Hydrabadi Biryani', 'Assorted Naan']
      },
      {
        category: 'Desserts',
        items: ['Gulab Jamun', 'Kesar Badam Kheer', 'Rasmalai']
      }
    ],
    inclusions: [
      'Professional Service Staff (1 per 20 guests)',
      'Elegant Buffet Setup with Chafing Dishes',
      'Premium Cutlery & Crockery',
      'Table Linens & Napkins',
      'Setup & Cleanup Service',
      'Tasting Session for Couple',
      'Event Coordinator',
      'Custom Menu Planning Consultation'
    ],
    features: [
      'Authentic Indian Cuisine',
      'Halal Certified Meats',
      'Vegetarian & Vegan Options',
      'Live Tandoor Station',
      'Flexible Customization'
    ],
    suitableFor: ['Weddings', 'Receptions', 'Engagement Parties', 'Anniversary Celebrations'],
    availableAddOns: [
      { name: 'Live Tandoor Station', price: 500, description: 'Fresh naan and kebabs prepared live' },
      { name: 'Additional Service Staff', price: 150, description: 'Per staff member for 5 hours' },
      { name: 'Premium Floral Decor', price: 800, description: 'Elegant centerpieces and buffet decor' },
      { name: 'Welcome Drink Station', price: 300, description: 'Unlimited mocktails for 2 hours' }
    ],
    active: true,
    featured: true,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Corporate Executive Package',
    subtitle: 'Business Dining',
    cateringType: 'corporate',
    description: 'Professional catering solutions for meetings, conferences, and corporate events.',
    longDescription: 'Designed for the modern workplace, our Corporate Executive Package delivers delicious, professional catering that impresses clients and energizes teams. Timely delivery, flexible service options, and dietary accommodations included.',
    pricePerPerson: 45,
    minGuests: 20,
    maxGuests: 300,
    images: [
      'https://images.unsplash.com/photo-1555244162-803794f237d6?w=800',
      'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=800',
    ],
    featuredImage: 'https://images.unsplash.com/photo-1555244162-803794f237d6?w=800',
    menuItems: [
      {
        category: 'Appetizers',
        items: ['Vegetable Spring Rolls', 'Chicken Pakora', 'Mint Chutney']
      },
      {
        category: 'Main Course',
        items: ['Butter Chicken', 'Palak Paneer', 'Chana Masala', 'Jeera Rice', 'Mixed Bread Basket']
      },
      {
        category: 'Accompaniments',
        items: ['Green Salad', 'Papad', 'Pickles']
      },
      {
        category: 'Dessert',
        items: ['Gulab Jamun', 'Masala Chai']
      }
    ],
    inclusions: [
      'Delivery within Alexandria city limits',
      'Buffet Setup with Chafing Dishes',
      'Disposable Cutlery & Plates',
      'Napkins & Serving Utensils',
      'Setup Service',
      'Dietary Labels for Allergens',
      'Corporate Billing Available'
    ],
    features: [
      'On-Time Delivery Guaranteed',
      'Individual Box Lunch Options',
      'Dietary Restrictions Accommodated',
      'Eco-Friendly Packaging Available',
      'Recurring Order Discounts'
    ],
    suitableFor: ['Business Meetings', 'Team Lunches', 'Conferences', 'Training Sessions', 'Office Parties'],
    availableAddOns: [
      { name: 'Premium Cutlery Upgrade', price: 3, description: 'Per person - reusable bamboo cutlery' },
      { name: 'Beverage Station', price: 5, description: 'Soft drinks and water per person' },
      { name: 'Breakfast Add-on', price: 15, description: 'Continental breakfast with coffee' },
      { name: 'Branded Napkins', price: 50, description: 'Custom printed with company logo' }
    ],
    active: true,
    featured: true,
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Birthday Celebration Package',
    subtitle: 'Party Special',
    cateringType: 'private',
    description: 'Make birthdays memorable with our festive catering package.',
    longDescription: 'Celebrate another year with flavor! Our Birthday Celebration Package brings joy to your party with crowd-pleasing dishes, colorful presentation, and hassle-free service. Perfect for all ages.',
    pricePerPerson: 40,
    minGuests: 15,
    maxGuests: 150,
    images: [
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
    ],
    featuredImage: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
    menuItems: [
      {
        category: 'Starters',
        items: ['Samosa Chaat', 'Paneer Tikka', 'Chicken Wings']
      },
      {
        category: 'Main Course',
        items: ['Chicken Curry', 'Dal Tadka', 'Mixed Vegetables', 'Pulao Rice', 'Naan & Roti']
      },
      {
        category: 'Kids Favorites',
        items: ['French Fries', 'Veg Nuggets', 'Fruit Juice']
      },
      {
        category: 'Desserts',
        items: ['Birthday Cake', 'Ice Cream', 'Gulab Jamun']
      }
    ],
    inclusions: [
      '2 Professional Service Staff',
      'Colorful Buffet Setup',
      'Birthday Banner Decoration',
      'Disposable Cutlery & Plates',
      'Cake Cutting Setup',
      '3 Hours Service Time',
      'Cleanup Service'
    ],
    features: [
      'Kid-Friendly Options',
      'Colorful Presentation',
      'Flexible Menu',
      'BYO Cake Welcome',
      'Party Music Setup'
    ],
    suitableFor: ['Birthday Parties', 'Kids Parties', 'Milestone Birthdays', 'Surprise Parties'],
    availableAddOns: [
      { name: 'Balloon Decorations', price: 100, description: 'Table centerpieces and buffet decor' },
      { name: 'Face Painting', price: 200, description: 'Professional artist for 2 hours' },
      { name: 'Extra Hour Service', price: 100, description: 'Extend party time' },
      { name: 'Photo Booth Props', price: 50, description: 'Fun props for memorable photos' }
    ],
    active: true,
    featured: false,
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Premium Non-Veg Platter',
    subtitle: 'Meat Lover\'s Delight',
    cateringType: 'all',
    description: 'A spectacular spread of our finest non-vegetarian specialties.',
    longDescription: 'Specially curated for meat lovers, this package features our signature tandoori items, rich curries, and grilled specialties. Every dish is prepared with premium cuts and authentic spices.',
    pricePerPerson: 65,
    minGuests: 30,
    maxGuests: 400,
    images: [
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800',
      'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800',
    ],
    featuredImage: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800',
    menuItems: [
      {
        category: 'Tandoori Starters',
        items: ['Chicken Tikka', 'Seekh Kebab', 'Fish Amritsari', 'Tandoori Prawns']
      },
      {
        category: 'Main Course',
        items: ['Butter Chicken', 'Rogan Josh', 'Chicken Biryani', 'Naan Assortment', 'Raita']
      },
      {
        category: 'Grilled Specialties',
        items: ['Tandoori Chicken (Full)', 'Malai Boti', 'Grilled Fish']
      },
      {
        category: 'Dessert',
        items: ['Phirni', 'Kulfi']
      }
    ],
    inclusions: [
      'Live Tandoor Station with Chef',
      'Premium Cutlery & Plates',
      'Service Staff',
      ' Buffet Setup',
      'Fresh Preparation',
      'Mint Chutney & Sauces'
    ],
    features: [
      'Live Cooking Station',
      'Premium Quality Meats',
      'Halal Certified',
      'Authentic Tandoor Flavor',
      'Chef Special Recommendations'
    ],
    suitableFor: ['Eid Celebrations', 'Family Gatherings', 'Festive Events', 'Wedding Functions'],
    availableAddOns: [
      { name: 'Additional Tandoor Item', price: 8, description: 'Per person' },
      { name: 'Mutton Biryani Upgrade', price: 5, description: 'Per person upgrade' },
      { name: 'Extra Chef', price: 200, description: 'For faster service' }
    ],
    active: true,
    featured: true,
    order: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Vegetarian Grand Buffet',
    subtitle: 'Pure Veg Delight',
    cateringType: 'all',
    description: 'An elaborate vegetarian feast with authentic flavors.',
    longDescription: 'Perfect for religious gatherings and vegetarian guests, this package showcases the best of Indian vegetarian cuisine. From street food favorites to royal curries, every dish is a celebration of vegetables.',
    pricePerPerson: 40,
    minGuests: 25,
    maxGuests: 500,
    images: [
      'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800',
      'https://images.unsplash.com/photo-1512058454905-6b841e7da1cb?w=800',
    ],
    featuredImage: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800',
    menuItems: [
      {
        category: 'Appetizers',
        items: ['Paneer Tikka', 'Hara Bhara Kebab', 'Veg Spring Rolls', 'Dahi Bhalla']
      },
      {
        category: 'Main Course',
        items: ['Paneer Butter Masala', 'Dal Makhani', 'Mix Vegetable Curry', 'Jeera Rice', 'Assorted Breads']
      },
      {
        category: 'South Indian Corner',
        items: ['Dosa Live Station', 'Idli Sambar', 'Coconut Chutney']
      },
      {
        category: 'Desserts',
        items: ['Jalebi', 'Gulab Jamun', 'Rasmalai', 'Masala Chai']
      }
    ],
    inclusions: [
      'Pure Vegetarian Kitchen Prep',
      'Jain Options Available',
      'Service Staff',
      'Buffet Setup',
      'Live Dosa Station',
      'Separate Serving Utensils'
    ],
    features: [
      '100% Vegetarian',
      'Jain Menu Available',
      'Live Cooking Station',
      'No Onion/Garlic Options',
      'Religious Event Suitable'
    ],
    suitableFor: ['Religious Events', 'Pujas', 'House Warming', 'Vegetarian Families'],
    availableAddOns: [
      { name: 'Jain Preparation', price: 0, description: 'No onion, no garlic - Free' },
      { name: 'Extra Dosa Batter', price: 100, description: 'For larger crowds' },
      { name: 'Gujarati Thali Add-on', price: 10, description: 'Per person' }
    ],
    active: true,
    featured: false,
    order: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Snack & Finger Food Package',
    subtitle: 'Light Bites',
    cateringType: 'all',
    description: 'Perfect for cocktail parties, networking events, or appetizers.',
    longDescription: 'Keep it light and social with our finger food package. Ideal for networking events, open houses, or as appetizers before a main meal. Easy to eat while mingling!',
    pricePerPerson: 25,
    minGuests: 30,
    maxGuests: 600,
    images: [
      'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=800',
      'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800',
    ],
    featuredImage: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=800',
    menuItems: [
      {
        category: 'Savory Snacks',
        items: ['Veg Samosa', 'Paneer Tikka Skewers', 'Chicken Wings', 'Spring Rolls']
      },
      {
        category: 'Chaat Station',
        items: ['Pani Puri', 'Bhel Puri', 'Dahi Puri', 'Papdi Chaat']
      },
      {
        category: 'Kebabs',
        items: ['Seekh Kebab', 'Shami Kebab', 'Hara Bhara Kebab']
      },
      {
        category: 'Beverages',
        items: ['Masala Chai', 'Soft Drinks', 'Jaljeera']
      }
    ],
    inclusions: [
      'Chaat Live Station',
      'Disposable Plates & Napkins',
      'Serving Staff',
      'Setup for 2 Hours',
      'Chutneys & Sauces',
      'Beverage Service'
    ],
    features: [
      'Easy Finger Foods',
      'Live Chaat Station',
      'Budget Friendly',
      'Great for Networking',
      'Quick Setup'
    ],
    suitableFor: ['Networking Events', 'Open Houses', 'Pre-wedding Functions', 'Corporate Mixers'],
    availableAddOns: [
      { name: 'Extra Hour', price: 150, description: 'Extend service time' },
      { name: 'Premium Kebab Upgrade', price: 5, description: 'Per person' },
      { name: 'Mocktail Station', price: 300, description: 'Unlimited mocktails' }
    ],
    active: true,
    featured: false,
    order: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Empty Catering Inquiries (will be populated by customer submissions)
const defaultCateringInquiries: CateringInquiry[] = [
  {
    id: 'demo-1',
    inquiryNumber: 'CAT-2024-001',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.j@email.com',
    customerPhone: '(318) 555-0145',
    eventType: 'Wedding Reception',
    eventDate: '2024-12-15T18:00',
    guestCount: 120,
    venueType: 'delivery',
    venueAddress: '1473 Dorchester Dr, Alexandria, LA 71301',
    packageId: '1',
    packageName: 'Royal Wedding Feast',
    customRequest: false,
    dietaryRequirements: 'Need 20 vegetarian meals and 5 vegan options',
    specialRequests: 'Would like a tasting session before confirming',
    budgetRange: '$8,000 - $12,000',
    serviceStyle: 'buffet',
    needStaffing: true,
    needRentals: false,
    status: 'quoted',
    priority: 'high',
    assignedTo: 'Manager',
    adminNotes: 'Client visited for initial consultation. Very interested in the Royal package.',
    quotedAmount: 10200,
    submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    communicationLog: [
      {
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'email',
        notes: 'Initial inquiry received',
        staffName: 'System'
      },
      {
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'phone',
        notes: 'Discussed menu options and dietary requirements',
        staffName: 'Manager'
      }
    ]
  },
  {
    id: 'demo-2',
    inquiryNumber: 'CAT-2024-002',
    customerName: 'Robert Chen',
    customerEmail: 'robert.chen@techcorp.com',
    customerPhone: '(318) 555-0298',
    companyName: 'TechCorp Solutions',
    eventType: 'Corporate Lunch',
    eventDate: '2024-11-28T12:00',
    guestCount: 45,
    venueType: 'delivery',
    venueAddress: '456 Business Park, Alexandria, LA 71301',
    packageId: '2',
    packageName: 'Corporate Executive Package',
    customRequest: false,
    specialRequests: 'Need invoice for company billing',
    serviceStyle: 'buffet',
    needStaffing: false,
    needRentals: false,
    status: 'confirmed',
    priority: 'medium',
    assignedTo: 'Coordinator',
    adminNotes: 'Repeat corporate client. Payment received.',
    quotedAmount: 2025,
    submittedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-3',
    inquiryNumber: 'CAT-2024-003',
    customerName: 'Maria Garcia',
    customerEmail: 'maria.garcia@email.com',
    customerPhone: '(318) 555-0176',
    eventType: 'Birthday Party',
    eventDate: '2025-01-10T17:00',
    guestCount: 35,
    venueType: 'pickup',
    customRequest: true,
    dietaryRequirements: 'Gluten-free options needed',
    specialRequests: 'Looking for custom package - mix of vegetarian and non-veg items',
    budgetRange: '$1,200 - $1,500',
    serviceStyle: 'family-style',
    needStaffing: false,
    needRentals: false,
    status: 'new',
    priority: 'medium',
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Storage Keys
const STORAGE_KEYS = {
  adminUser: 'golden_lotus_admin_user',
  menuItems: 'golden_lotus_menu_items',
  menuCategories: 'golden_lotus_menu_categories',
  locations: 'golden_lotus_locations',
  testimonials: 'golden_lotus_testimonials',
  galleryImages: 'golden_lotus_gallery_images',
  featuredDishes: 'golden_lotus_featured_dishes',
  faqs: 'golden_lotus_faqs',
  coupons: 'golden_lotus_coupons',
  siteContent: 'golden_lotus_site_content',
  features: 'golden_lotus_features',
  orders: 'golden_lotus_orders',
  isAuthenticated: 'golden_lotus_admin_auth',
  events: 'golden_lotus_events',
  eventPackages: 'golden_lotus_event_packages',
  cateringPackages: 'golden_lotus_catering_packages',
  cateringInquiries: 'golden_lotus_catering_inquiries',
};

// Initialize data in localStorage
export function initializeData() {
  if (!localStorage.getItem(STORAGE_KEYS.adminUser)) {
    localStorage.setItem(STORAGE_KEYS.adminUser, JSON.stringify(defaultAdmin));
  }
  if (!localStorage.getItem(STORAGE_KEYS.menuCategories)) {
    localStorage.setItem(STORAGE_KEYS.menuCategories, JSON.stringify(defaultMenuCategories));
  }
  if (!localStorage.getItem(STORAGE_KEYS.menuItems)) {
    localStorage.setItem(STORAGE_KEYS.menuItems, JSON.stringify(defaultMenuItems));
  }
  if (!localStorage.getItem(STORAGE_KEYS.locations)) {
    localStorage.setItem(STORAGE_KEYS.locations, JSON.stringify(defaultLocations));
  }
  if (!localStorage.getItem(STORAGE_KEYS.testimonials)) {
    localStorage.setItem(STORAGE_KEYS.testimonials, JSON.stringify(defaultTestimonials));
  }
  if (!localStorage.getItem(STORAGE_KEYS.galleryImages)) {
    localStorage.setItem(STORAGE_KEYS.galleryImages, JSON.stringify(defaultGalleryImages));
  }
  if (!localStorage.getItem(STORAGE_KEYS.featuredDishes)) {
    localStorage.setItem(STORAGE_KEYS.featuredDishes, JSON.stringify(defaultFeaturedDishes));
  }
  if (!localStorage.getItem(STORAGE_KEYS.faqs)) {
    localStorage.setItem(STORAGE_KEYS.faqs, JSON.stringify(defaultFAQs));
  }
  if (!localStorage.getItem(STORAGE_KEYS.coupons)) {
    localStorage.setItem(STORAGE_KEYS.coupons, JSON.stringify(defaultCoupons));
  }
  if (!localStorage.getItem(STORAGE_KEYS.siteContent)) {
    localStorage.setItem(STORAGE_KEYS.siteContent, JSON.stringify(defaultSiteContent));
  }
  if (!localStorage.getItem(STORAGE_KEYS.features)) {
    localStorage.setItem(STORAGE_KEYS.features, JSON.stringify(defaultFeatures));
  }
  if (!localStorage.getItem(STORAGE_KEYS.orders)) {
    localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(defaultOrders));
  }
  if (!localStorage.getItem(STORAGE_KEYS.events)) {
    localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(defaultEvents));
  }
  if (!localStorage.getItem(STORAGE_KEYS.eventPackages)) {
    localStorage.setItem(STORAGE_KEYS.eventPackages, JSON.stringify(defaultEventPackages));
  }
  if (!localStorage.getItem(STORAGE_KEYS.cateringPackages)) {
    localStorage.setItem(STORAGE_KEYS.cateringPackages, JSON.stringify(defaultCateringPackages));
  }
  if (!localStorage.getItem(STORAGE_KEYS.cateringInquiries)) {
    localStorage.setItem(STORAGE_KEYS.cateringInquiries, JSON.stringify(defaultCateringInquiries));
  }
}

// Generic get/set functions
export function getData<T>(key: string): T | null {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

export function setData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Specific data getters/setters
export const DataStore = {
  // Admin
  getAdmin: (): AdminUser | null => getData(STORAGE_KEYS.adminUser),
  setAdmin: (admin: AdminUser) => setData(STORAGE_KEYS.adminUser, admin),

  // Auth
  isAuthenticated: (): boolean => localStorage.getItem(STORAGE_KEYS.isAuthenticated) === 'true',
  setAuthenticated: (value: boolean) => localStorage.setItem(STORAGE_KEYS.isAuthenticated, value ? 'true' : 'false'),
  logout: () => localStorage.removeItem(STORAGE_KEYS.isAuthenticated),

  // Menu
  getMenuItems: (): MenuItem[] => getData(STORAGE_KEYS.menuItems) || defaultMenuItems,
  setMenuItems: (items: MenuItem[]) => setData(STORAGE_KEYS.menuItems, items),

  getMenuCategories: (): MenuCategory[] => getData(STORAGE_KEYS.menuCategories) || defaultMenuCategories,
  setMenuCategories: (categories: MenuCategory[]) => setData(STORAGE_KEYS.menuCategories, categories),

  // Locations
  getLocations: (): Location[] => getData(STORAGE_KEYS.locations) || defaultLocations,
  setLocations: (locations: Location[]) => setData(STORAGE_KEYS.locations, locations),

  // Testimonials
  getTestimonials: (): Testimonial[] => getData(STORAGE_KEYS.testimonials) || defaultTestimonials,
  setTestimonials: (testimonials: Testimonial[]) => setData(STORAGE_KEYS.testimonials, testimonials),

  // Gallery
  getGalleryImages: (): GalleryImage[] => getData(STORAGE_KEYS.galleryImages) || defaultGalleryImages,
  setGalleryImages: (images: GalleryImage[]) => setData(STORAGE_KEYS.galleryImages, images),

  // Featured Dishes
  getFeaturedDishes: (): FeaturedDish[] => getData(STORAGE_KEYS.featuredDishes) || defaultFeaturedDishes,
  setFeaturedDishes: (dishes: FeaturedDish[]) => setData(STORAGE_KEYS.featuredDishes, dishes),

  // FAQs
  getFAQs: (): FAQ[] => getData(STORAGE_KEYS.faqs) || defaultFAQs,
  setFAQs: (faqs: FAQ[]) => setData(STORAGE_KEYS.faqs, faqs),

  // Coupons
  getCoupons: (): Coupon[] => getData(STORAGE_KEYS.coupons) || defaultCoupons,
  setCoupons: (coupons: Coupon[]) => setData(STORAGE_KEYS.coupons, coupons),

  // Site Content
  getSiteContent: (): SiteContent => getData(STORAGE_KEYS.siteContent) || defaultSiteContent,
  setSiteContent: (content: SiteContent) => setData(STORAGE_KEYS.siteContent, content),

  // Features
  getFeatures: (): Feature[] => getData(STORAGE_KEYS.features) || defaultFeatures,
  setFeatures: (features: Feature[]) => setData(STORAGE_KEYS.features, features),

  // Orders
  getOrders: (): Order[] => getData(STORAGE_KEYS.orders) || defaultOrders,
  setOrders: (orders: Order[]) => setData(STORAGE_KEYS.orders, orders),
  getOrderById: (id: string): Order | undefined => {
    const orders = getData<Order[]>(STORAGE_KEYS.orders) || defaultOrders;
    return orders.find((o) => o.id === id);
  },
  updateOrderStatus: (id: string, status: Order['status']): boolean => {
    const orders = getData<Order[]>(STORAGE_KEYS.orders) || defaultOrders;
    const index = orders.findIndex((o) => o.id === id);
    if (index !== -1) {
      orders[index].status = status;
      orders[index].updatedAt = new Date().toISOString();
      setData(STORAGE_KEYS.orders, orders);
      return true;
    }
    return false;
  },
  addOrder: (order: Order): void => {
    const orders = getData<Order[]>(STORAGE_KEYS.orders) || defaultOrders;
    setData(STORAGE_KEYS.orders, [...orders, order]);
  },
  deleteOrder: (id: string): boolean => {
    const orders = getData<Order[]>(STORAGE_KEYS.orders) || defaultOrders;
    const filtered = orders.filter((o) => o.id !== id);
    if (filtered.length !== orders.length) {
      setData(STORAGE_KEYS.orders, filtered);
      return true;
    }
    return false;
  },

  // Analytics
  getAnalytics: (): Analytics => {
    const orders = getData<Order[]>(STORAGE_KEYS.orders) || defaultOrders;
    const today = new Date().toISOString().split('T')[0];

    const todayOrders = orders.filter((o) => o.createdAt.startsWith(today));
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    const pendingOrders = orders.filter((o) =>
      ['pending', 'confirmed', 'preparing'].includes(o.status)
    ).length;

    // Generate weekly stats
    const weeklyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOrders = orders.filter((o) => o.createdAt.startsWith(dateStr));
      const dayRevenue = dayOrders.reduce((sum, o) => sum + o.total, 0);
      weeklyStats.push({
        date: dateStr,
        orders: dayOrders.length,
        revenue: dayRevenue,
        averageOrderValue: dayOrders.length > 0 ? dayRevenue / dayOrders.length : 0,
      });
    }

    // Get popular items
    const itemCounts: Record<string, number> = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
      });
    });
    const popularItems = Object.entries(itemCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalOrders: orders.length,
      totalRevenue,
      averageOrderValue,
      pendingOrders,
      todayOrders: todayOrders.length,
      todayRevenue,
      weeklyStats,
      popularItems,
    };
  },

  // Events
  getEvents: (): Event[] => getData(STORAGE_KEYS.events) || defaultEvents,
  setEvents: (events: Event[]) => setData(STORAGE_KEYS.events, events),
  getEventById: (id: string): Event | undefined => {
    const events = getData<Event[]>(STORAGE_KEYS.events) || defaultEvents;
    return events.find((e) => e.id === id);
  },

  // Event Packages
  getEventPackages: (): EventPackage[] => getData(STORAGE_KEYS.eventPackages) || defaultEventPackages,
  setEventPackages: (packages: EventPackage[]) => setData(STORAGE_KEYS.eventPackages, packages),
  getPackagesByEventId: (eventId: string): EventPackage[] => {
    const packages = getData<EventPackage[]>(STORAGE_KEYS.eventPackages) || defaultEventPackages;
    return packages.filter((p) => p.eventId === eventId);
  },

  // Catering Packages
  getCateringPackages: (): CateringPackage[] => getData(STORAGE_KEYS.cateringPackages) || defaultCateringPackages,
  setCateringPackages: (packages: CateringPackage[]) => setData(STORAGE_KEYS.cateringPackages, packages),
  getCateringPackageById: (id: string): CateringPackage | undefined => {
    const packages = getData<CateringPackage[]>(STORAGE_KEYS.cateringPackages) || defaultCateringPackages;
    return packages.find((p) => p.id === id);
  },
  getCateringPackagesByType: (type: CateringPackage['cateringType']): CateringPackage[] => {
    const packages = getData<CateringPackage[]>(STORAGE_KEYS.cateringPackages) || defaultCateringPackages;
    return packages.filter((p) => p.cateringType === type && p.active);
  },

  // Catering Inquiries (Professional CRM System)
  getCateringInquiries: (): CateringInquiry[] => getData(STORAGE_KEYS.cateringInquiries) || defaultCateringInquiries,
  setCateringInquiries: (inquiries: CateringInquiry[]) => setData(STORAGE_KEYS.cateringInquiries, inquiries),
  
  getCateringInquiryById: (id: string): CateringInquiry | undefined => {
    const inquiries = getData<CateringInquiry[]>(STORAGE_KEYS.cateringInquiries) || defaultCateringInquiries;
    return inquiries.find((i) => i.id === id);
  },
  
  addCateringInquiry: (inquiry: CateringInquiry): void => {
    const inquiries = getData<CateringInquiry[]>(STORAGE_KEYS.cateringInquiries) || defaultCateringInquiries;
    setData(STORAGE_KEYS.cateringInquiries, [...inquiries, inquiry]);
  },
  
  updateCateringInquiry: (id: string, updates: Partial<CateringInquiry>): boolean => {
    const inquiries = getData<CateringInquiry[]>(STORAGE_KEYS.cateringInquiries) || defaultCateringInquiries;
    const index = inquiries.findIndex((i) => i.id === id);
    if (index !== -1) {
      inquiries[index] = { ...inquiries[index], ...updates, updatedAt: new Date().toISOString() };
      setData(STORAGE_KEYS.cateringInquiries, inquiries);
      return true;
    }
    return false;
  },
  
  updateCateringInquiryStatus: (id: string, status: CateringInquiry['status']): boolean => {
    const inquiries = getData<CateringInquiry[]>(STORAGE_KEYS.cateringInquiries) || defaultCateringInquiries;
    const index = inquiries.findIndex((i) => i.id === id);
    if (index !== -1) {
      inquiries[index].status = status;
      inquiries[index].updatedAt = new Date().toISOString();
      setData(STORAGE_KEYS.cateringInquiries, inquiries);
      return true;
    }
    return false;
  },
  
  addCateringInquiryCommunication: (id: string, communication: NonNullable<CateringInquiry['communicationLog']>[0]): boolean => {
    const inquiries = getData<CateringInquiry[]>(STORAGE_KEYS.cateringInquiries) || defaultCateringInquiries;
    const index = inquiries.findIndex((i) => i.id === id);
    if (index !== -1) {
      if (!inquiries[index].communicationLog) {
        inquiries[index].communicationLog = [];
      }
      inquiries[index].communicationLog.push(communication);
      inquiries[index].updatedAt = new Date().toISOString();
      setData(STORAGE_KEYS.cateringInquiries, inquiries);
      return true;
    }
    return false;
  },
  
  deleteCateringInquiry: (id: string): boolean => {
    const inquiries = getData<CateringInquiry[]>(STORAGE_KEYS.cateringInquiries) || defaultCateringInquiries;
    const filtered = inquiries.filter((i) => i.id !== id);
    if (filtered.length !== inquiries.length) {
      setData(STORAGE_KEYS.cateringInquiries, filtered);
      return true;
    }
    return false;
  },
  
  // Legacy support for Catering Orders (map to inquiries)
  getCateringOrders: function() { return this.getCateringInquiries(); },
  addCateringOrder: function(order: any) { return this.addCateringInquiry(order as CateringInquiry); },
};

export { STORAGE_KEYS };
export type { Feature };
