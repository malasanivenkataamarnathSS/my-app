import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { User, AuthContextType, Address } from '../types';
import api from '../utils/api';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is authenticated on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          dispatch({ type: 'SET_LOADING', payload: true });
          const response = await api.get('/auth/me');
          if (response.data.success) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user: response.data.data, token },
            });
          } else {
            localStorage.removeItem('token');
            dispatch({ type: 'LOGOUT' });
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          dispatch({ type: 'LOGOUT' });
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    checkAuth();
  }, []);

  // Update API token when it changes
  useEffect(() => {
    if (state.token) {
      localStorage.setItem('token', state.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  const sendOTP = async (email: string, name?: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await api.post('/auth/send-otp', { email, name });
      
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send OTP';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email: string, otp: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await api.post('/auth/verify-otp', { email, otp });
      
      if (response.data.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: response.data.data.user,
            token: response.data.data.token,
          },
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = (): void => {
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await api.put('/auth/profile', data);
      
      if (response.data.success) {
        dispatch({ type: 'UPDATE_USER', payload: response.data.data });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Profile update failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addAddress = async (address: Omit<Address, '_id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await api.post('/addresses', address);
      
      if (response.data.success) {
        // Refresh user data to get updated addresses
        const userResponse = await api.get('/auth/me');
        if (userResponse.data.success) {
          dispatch({ type: 'UPDATE_USER', payload: userResponse.data.data });
        }
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add address';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateAddress = async (addressId: string, address: Partial<Address>): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await api.put(`/addresses/${addressId}`, address);
      
      if (response.data.success) {
        // Refresh user data to get updated addresses
        const userResponse = await api.get('/auth/me');
        if (userResponse.data.success) {
          dispatch({ type: 'UPDATE_USER', payload: userResponse.data.data });
        }
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update address';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteAddress = async (addressId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await api.delete(`/addresses/${addressId}`);
      
      if (response.data.success) {
        // Refresh user data to get updated addresses
        const userResponse = await api.get('/auth/me');
        if (userResponse.data.success) {
          dispatch({ type: 'UPDATE_USER', payload: userResponse.data.data });
        }
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete address';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const contextValue: AuthContextType = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    login,
    sendOTP,
    logout,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}