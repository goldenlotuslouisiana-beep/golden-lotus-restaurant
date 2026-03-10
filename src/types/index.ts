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
}

export interface StorySection {
  id: string;
  title: string;
  content: string;
  image?: string;
}

// Features list
export interface Feature {
  id: string;
  name: string;
  icon: string;
}

// Order Types
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type OrderType = 'pickup' | 'delivery' | 'dine_in';
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
