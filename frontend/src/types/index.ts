export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  addresses: string[];
  favoriteItems: string[];
}

export interface Product {
  _id: string;
  name: string;
  category: 'milk' | 'meat' | 'organic-oils' | 'organic-powders';
  subcategory?: string;
  description: string;
  price: number;
  unit: string;
  availableQuantities: string[];
  inStock: boolean;
  image?: string;
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    fat?: number;
    carbohydrates?: number;
    fiber?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id: string;
  user: string;
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedQuantity: string;
  milkSchedule?: 'morning' | 'evening' | 'both';
}

export interface Order {
  _id: string;
  user: string;
  items: {
    product: Product;
    quantity: number;
    selectedQuantity: string;
    milkSchedule?: 'morning' | 'evening' | 'both';
  }[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod?: string;
  deliveryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, otp: string) => Promise<void>;
  sendOTP: (email: string, name?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

export interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, selectedQuantity: string, milkSchedule?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;
}