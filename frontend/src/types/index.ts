export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  isAdmin: boolean;
  addresses: Address[];
  favorites: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: {
    url: string;
    alt: string;
  };
  icon: string;
  slug: string;
  subcategories: Subcategory[];
  displayOrder: number;
  color: string;
  isActive: boolean;
  isFeatured: boolean;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  name: string;
  description?: string;
  image?: {
    url: string;
    alt: string;
  };
}

export interface QuantityOption {
  size: string;
  price: number;
  unit: string;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  category: string | Category;
  subcategory?: string;
  quantityOptions: QuantityOption[];
  basePrice: number;
  images: {
    url: string;
    alt: string;
  }[];
  availability: boolean;
  stockQuantity: number;
  minOrderQuantity: number;
  maxOrderQuantity: number;
  milkDelivery?: {
    morning: boolean;
    evening: boolean;
    both: boolean;
  };
  nutrition?: {
    calories?: number;
    protein?: number;
    fat?: number;
    carbohydrates?: number;
    fiber?: number;
  };
  tags: string[];
  rating: {
    average: number;
    count: number;
  };
  organic: boolean;
  certifications: string[];
  origin?: {
    farm?: string;
    location?: string;
  };
  slug: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  price: number;
  deliveryPreference?: 'morning' | 'evening' | 'both';
  notes?: string;
}

export interface OrderItem {
  product: string | Product;
  quantity: number;
  selectedSize: string;
  price: number;
  deliveryPreference?: 'morning' | 'evening' | 'both';
  notes?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string | User;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready_for_delivery' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded';
  deliveryAddress: Address;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cod' | 'online' | 'wallet';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  deliveryInstructions?: string;
  statusHistory: {
    status: string;
    timestamp: string;
    note?: string;
    updatedBy?: string;
  }[];
  deliveryAgent?: string | User;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  rating?: number;
  review?: string;
  reviewDate?: string;
  adminNotes?: string;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    endDate?: string;
    pausedUntil?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, otp: string) => Promise<void>;
  sendOTP: (email: string, name?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  addAddress: (address: Omit<Address, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAddress: (addressId: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
}

export interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (product: Product, quantity: number, selectedSize: string, deliveryPreference?: string, notes?: string) => void;
  removeItem: (productId: string, selectedSize: string) => void;
  updateQuantity: (productId: string, selectedSize: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string, selectedSize: string) => boolean;
  getItemQuantity: (productId: string, selectedSize: string) => number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
}