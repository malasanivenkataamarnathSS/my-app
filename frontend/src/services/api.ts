import axios from 'axios';
import { User, Product, Address, Order } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  sendOTP: (email: string, name?: string) =>
    api.post('/auth/send-otp', { email, name }),
  
  verifyOTP: (email: string, otp: string) =>
    api.post('/auth/verify-otp', { email, otp }),
  
  getMe: () =>
    api.get<User>('/auth/me'),
  
  logout: () =>
    api.post('/auth/logout'),
};

// Products API
export const productsAPI = {
  getAll: (params?: { category?: string; search?: string; inStock?: boolean }) =>
    api.get<Product[]>('/products', { params }),
  
  getById: (id: string) =>
    api.get<Product>(`/products/${id}`),
  
  create: (productData: Partial<Product>) =>
    api.post<Product>('/products', productData),
  
  update: (id: string, productData: Partial<Product>) =>
    api.put<Product>(`/products/${id}`, productData),
  
  delete: (id: string) =>
    api.delete(`/products/${id}`),
};

// Orders API
export const ordersAPI = {
  getAll: () =>
    api.get<Order[]>('/orders'),
  
  getById: (id: string) =>
    api.get<Order>(`/orders/${id}`),
  
  create: (orderData: {
    items: Array<{
      product: string;
      quantity: number;
      selectedQuantity: string;
      milkSchedule?: string;
    }>;
    shippingAddress: string;
    totalAmount: number;
    notes?: string;
  }) =>
    api.post<Order>('/orders', orderData),
  
  updateStatus: (id: string, status: Order['status']) =>
    api.patch<Order>(`/orders/${id}/status`, { status }),
  
  getAllAdmin: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/orders/admin/all', { params }),
};

// Addresses API
export const addressesAPI = {
  getAll: () =>
    api.get<Address[]>('/addresses'),
  
  getById: (id: string) =>
    api.get<Address>(`/addresses/${id}`),
  
  create: (addressData: Omit<Address, '_id' | 'user' | 'createdAt' | 'updatedAt'>) =>
    api.post<Address>('/addresses', addressData),
  
  update: (id: string, addressData: Partial<Address>) =>
    api.put<Address>(`/addresses/${id}`, addressData),
  
  delete: (id: string) =>
    api.delete(`/addresses/${id}`),
  
  setDefault: (id: string) =>
    api.patch<Address>(`/addresses/${id}/default`),
};

// Users API
export const usersAPI = {
  updateProfile: (profileData: { name?: string; gender?: string; dateOfBirth?: string }) =>
    api.put<User>('/users/profile', profileData),
  
  getFavorites: () =>
    api.get<Product[]>('/users/favorites'),
  
  addFavorite: (productId: string) =>
    api.post(`/users/favorites/${productId}`),
  
  removeFavorite: (productId: string) =>
    api.delete(`/users/favorites/${productId}`),
  
  getAllAdmin: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/users/admin/all', { params }),
  
  updateRole: (id: string, role: 'user' | 'admin') =>
    api.patch<User>(`/users/admin/${id}/role`, { role }),
};

export default api;