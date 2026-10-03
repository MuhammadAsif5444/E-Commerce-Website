export type Role = 'customer' | 'seller' | 'admin';
export type UserRole = Role;

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  storeName?: string; // for seller
  storeDescription?: string;
  status: 'active' | 'pending' | 'suspended';
  phone?: string;
  joinedDate: string;
}

export interface Address {
  id: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Size", "Color"
  options: string[]; // e.g. ["S", "M", "L"] or ["Space Gray", "Silver"]
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  sellerId: string;
  sellerName: string;
  category: string;
  subcategory?: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  images: string[];
  description: string;
  features: string[];
  specifications: Record<string, string>;
  variants?: ProductVariant[];
  tags: string[];
  isDeal?: boolean;
  dealEndsAt?: string; // ISO string
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariants?: Record<string, string>; // e.g. { Color: "Midnight Black", Size: "XL" }
}

export interface SavedItem {
  product: Product;
  savedAt: string;
  selectedVariants?: Record<string, string>;
}

export type OrderStatus = 'placed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  selectedVariants?: Record<string, string>;
  sellerName?: string;
}

export interface TrackingStep {
  status: OrderStatus;
  label: string;
  date?: string;
  description: string;
  completed: boolean;
  current: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: Address;
  deliveryMethod: {
    id: string;
    title: string;
    price: number;
    estimatedDelivery: string;
  };
  paymentMethod: {
    type: 'card' | 'cod';
    last4?: string;
    cardBrand?: string;
  };
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  couponCode?: string;
  status: OrderStatus;
  createdAt: string;
  trackingHistory: {
    status: OrderStatus;
    timestamp: string;
    location: string;
    message: string;
  }[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  image: string;
  itemCount: number;
  description: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend: number;
  expiryDate: string;
  isActive: boolean;
  usageCount: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  accentColor: string;
  badgeText?: string;
}

export interface FilterState {
  category: string;
  searchQuery: string;
  minPrice: number;
  maxPrice: number;
  brands: string[];
  minRating: number;
  inStockOnly: boolean;
  onSaleOnly: boolean;
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'rating' | 'newest';
}
