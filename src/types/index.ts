export type Availability = 'in_stock' | 'low_stock' | 'out_of_stock';
export type ProductStatus = 'Draft' | 'Published' | 'Archived';

export interface WaterParameters {
  ph: string;
  temp: string;
  temperament: string;
  careLevel?: 'Beginner' | 'Intermediate' | 'Expert';
  tankMinGallons?: number;
}

export interface Catalog {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  displayOrder: number;
  status: 'Active' | 'Archived';
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  variety: string;
  gender?: 'Male' | 'Female' | 'Pair' | 'Trio' | 'Unsexed';
  images: string[];
  primaryImage: string;
  price: number;
  originalPrice?: number;
  currency: string;
  sizes: string[];
  stock: number;
  availability: Availability;
  description: string;
  waterParams?: WaterParameters;
  isLiveFish: boolean;
  featured?: boolean;
  specs?: Record<string, string>;
  // CMS fields
  status?: ProductStatus;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  variety: string;
  selectedSize: string;
  primaryImage: string;
  price: number;
  quantity: number;
  isLiveFish: boolean;
}

export interface CustomerDetails {
  name: string;
  house: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  phoneNumber: string; // verified normalized number (+91XXXXXXXXXX)
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  variety: string;
  size: string;
  quantity: number;
  unitPrice: number;
  price?: number;
  subtotal: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. AQ-20260925-0001
  customerId?: string;
  customerName: string;
  house: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  phoneNumber: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  grandTotal?: number;
  status: OrderStatus;
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  notes?: string;
  emailSent?: boolean;
  whatsappSent?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PriceHistory {
  id: string;
  productId: string;
  oldPrice: number;
  newPrice: number;
  changedAt: string;
  adminId: string;
}

export interface AdminSession {
  phoneNumber: string;
  role: 'ADMIN';
  token: string;
  expiresAt: number;
}
