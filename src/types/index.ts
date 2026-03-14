// Menu Item Types
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  popular?: boolean;
  spiceLevel?: number;
  isVegan?: boolean;
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  order: number;
}

// Location Types
export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  hours: OperatingHours[];
  googleMapsUrl: string;
  image?: string;
}

export interface OperatingHours {
  day: string;
  open: string;
  close: string;
  isClosed?: boolean;
}

// Testimonial Types
export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  text: string;
  date?: string;
  published?: boolean;
}

// Gallery Image Types
export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: string;
}

// Featured Dish Types
export interface FeaturedDish {
  id: string;
  name: string;
  image: string;
  menuItemId?: string;
}

// FAQ Types
export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

// Coupon/Discount Types
export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_delivery';
  discountValue: number;
  minOrder?: number;
  active: boolean;
}

// Admin User Types
export interface AdminUser {
  id: string;
  username: string;
  password: string;
  email: string;
}

// Site Content Types
export interface SiteContent {
  hero: {
    title: string;
    subtitle: string;
    backgroundImage: string;
  };
  about: {
    title: string;
    content: string;
    image: string;
  };
  awards: {
    years: string[];
    title: string;
    description: string;
    link: string;
  };
  cuisine: {
    title: string;
    description: string;
    image: string;
  };
  bar: {
    title: string;
    description: string;
    image: string;
  };
  ambience: {
    title: string;
    description: string;
    images: string[];
  };
  catering: {
    title: string;
    description: string;
    image: string;
  };
  events: {
    hennaParty: {
      title: string;
      description: string;
      image: string;
    };
  };
  visitUs: {
    title: string;
    content: string;
  };
  rewards: {
    title: string;
    description: string;
  };
  story: {
    sections: StorySection[];
  };
  orderCTA?: {
    title: string;
    description: string;
    buttonText: string;
    enabled: boolean;
  };
  settings?: {
    showHero?: boolean;
    showFeaturedDishes?: boolean;
    showAbout?: boolean;
    showOrderCTA?: boolean;
    showGallery?: boolean;
    showAmbience?: boolean;
    showCatering?: boolean;
    showTestimonials?: boolean;
    showFeatures?: boolean;
    showRewards?: boolean;
    showFAQ?: boolean;
  };
}

export interface StorySection {
  id: string;
  title: string;
  content: string;
  image?: string;
}

// Event Package Types
export interface EventPackage {
  id: string;
  name: string;
  price: string;
  per: string;
  features: string[];
  popular?: boolean;
  eventId: string;
}

// Event Types
export interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  features: {
    icon: string;
    title: string;
    desc: string;
  }[];
  gallery: string[];
  ctaTitle: string;
  ctaDescription: string;
  phone: string;
  active: boolean;
}

// Features list
export interface Feature {
  id: string;
  name: string;
  icon: string;
}

// Order Types
export type OrderStatus = 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'completed' | 'cancelled';
export type OrderType = 'pickup' | 'dine_in';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'online';

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  zip?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
  orderType: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
  estimatedReadyTime?: string;
  assignedDriver?: string;
  // Stripe payment fields
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  paidAt?: string;
  totalAmountCents?: number;
  cardLast4?: string;
}

// Analytics Types
export interface DailyStats {
  date: string;
  orders: number;
  revenue: number;
  averageOrderValue: number;
}

export interface Analytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  pendingOrders: number;
  todayOrders: number;
  todayRevenue: number;
  weeklyStats: DailyStats[];
  popularItems: { name: string; count: number }[];
}

// Catering Types
export type CateringType = 'wedding' | 'corporate' | 'private' | 'all';
export type CateringStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type BudgetTier = 'silver' | 'gold' | 'platinum' | 'budget' | 'standard' | 'premium';

// Professional Catering Menu Item
export interface CateringMenuItem {
  id: string;
  name: string;
  description: string;
  image?: string;
  category: 'appetizer' | 'main' | 'dessert' | 'beverage' | 'sides';
  dietary: ('halal' | 'vegetarian' | 'gluten-free' | 'vegan' | 'spicy')[];
  isPopular?: boolean;
}

// Catering Package - Professional Structure
export interface CateringPackage {
  id: string;
  name: string;
  subtitle?: string;
  cateringType: CateringType;
  description: string;
  longDescription?: string;
  pricePerPerson: number;
  minGuests: number;
  maxGuests: number;
  images: string[];
  featuredImage: string;
  // Menu Items with categories
  menuItems: {
    category: string;
    items: string[];
  }[];
  // What's included list
  inclusions: string[];
  // Features/Benefits
  features: string[];
  // Suitable for
  suitableFor: string[];
  // Add-ons available
  availableAddOns?: {
    name: string;
    price: number;
    description?: string;
  }[];
  // Display settings
  active: boolean;
  featured: boolean;
  order: number;
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Catering Inquiry/Order - Professional Structure
export interface CateringInquiry {
  id: string;
  inquiryNumber: string;
  // Contact Info
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName?: string;
  // Event Details
  eventType: string;
  eventDate: string;
  eventTime?: string;
  guestCount: number;
  // Location
  venueType: 'delivery' | 'pickup' | 'on-site';
  venueAddress?: string;
  // Package Selection
  packageId?: string;
  packageName?: string;
  customRequest: boolean;
  // Requirements
  dietaryRequirements?: string;
  specialRequests?: string;
  budgetRange?: string;
  // Service preferences
  serviceStyle?: 'buffet' | 'plated' | 'family-style' | 'stations';
  needStaffing?: boolean;
  needRentals?: boolean;
  // Status & Admin
  status: 'new' | 'contacted' | 'quoted' | 'confirmed' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  adminNotes?: string;
  quotedAmount?: number;
  followUpDate?: string;
  // Timestamps
  submittedAt: string;
  updatedAt: string;
  // Communication
  communicationLog?: {
    date: string;
    type: 'email' | 'phone' | 'meeting' | 'note';
    notes: string;
    staffName?: string;
  }[];
}
