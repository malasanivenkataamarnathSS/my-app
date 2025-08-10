import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { CartItem, Product, CartContextType } from '../types';

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { productId: string; selectedSize: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; selectedSize: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

const initialState: CartState = {
  items: [],
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'LOAD_CART':
      return { ...state, items: action.payload };

    case 'ADD_ITEM': {
      const { productId, selectedSize } = getItemKey(action.payload.product._id, action.payload.selectedSize);
      const existingItemIndex = state.items.findIndex(
        item => getItemKey(item.product._id, item.selectedSize).productId === productId &&
                getItemKey(item.product._id, item.selectedSize).selectedSize === selectedSize
      );

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.payload.quantity,
        };
        return { ...state, items: updatedItems };
      } else {
        // Add new item
        return { ...state, items: [...state.items, action.payload] };
      }
    }

    case 'REMOVE_ITEM': {
      const filteredItems = state.items.filter(
        item => !(getItemKey(item.product._id, item.selectedSize).productId === action.payload.productId &&
                 getItemKey(item.product._id, item.selectedSize).selectedSize === action.payload.selectedSize)
      );
      return { ...state, items: filteredItems };
    }

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        // Remove item if quantity is 0 or negative
        const filteredItems = state.items.filter(
          item => !(getItemKey(item.product._id, item.selectedSize).productId === action.payload.productId &&
                   getItemKey(item.product._id, item.selectedSize).selectedSize === action.payload.selectedSize)
        );
        return { ...state, items: filteredItems };
      } else {
        // Update quantity
        const updatedItems = state.items.map(item =>
          getItemKey(item.product._id, item.selectedSize).productId === action.payload.productId &&
          getItemKey(item.product._id, item.selectedSize).selectedSize === action.payload.selectedSize
            ? { ...item, quantity: action.payload.quantity }
            : item
        );
        return { ...state, items: updatedItems };
      }
    }

    case 'CLEAR_CART':
      return { ...state, items: [] };

    default:
      return state;
  }
}

function getItemKey(productId: string, selectedSize: string) {
  return { productId, selectedSize };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartData });
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (
    product: Product,
    quantity: number,
    selectedSize: string,
    deliveryPreference?: string,
    notes?: string
  ): void => {
    const sizeOption = product.quantityOptions.find(option => option.size === selectedSize);
    const price = sizeOption ? sizeOption.price : product.basePrice;

    const cartItem: CartItem = {
      product,
      quantity,
      selectedSize,
      price,
      deliveryPreference: deliveryPreference as 'morning' | 'evening' | 'both' | undefined,
      notes,
    };

    dispatch({ type: 'ADD_ITEM', payload: cartItem });
  };

  const removeItem = (productId: string, selectedSize: string): void => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId, selectedSize } });
  };

  const updateQuantity = (productId: string, selectedSize: string, quantity: number): void => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, selectedSize, quantity } });
  };

  const clearCart = (): void => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const isInCart = (productId: string, selectedSize: string): boolean => {
    return state.items.some(
      item => getItemKey(item.product._id, item.selectedSize).productId === productId &&
              getItemKey(item.product._id, item.selectedSize).selectedSize === selectedSize
    );
  };

  const getItemQuantity = (productId: string, selectedSize: string): number => {
    const item = state.items.find(
      item => getItemKey(item.product._id, item.selectedSize).productId === productId &&
              getItemKey(item.product._id, item.selectedSize).selectedSize === selectedSize
    );
    return item ? item.quantity : 0;
  };

  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
  const total = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);

  const contextValue: CartContextType = {
    items: state.items,
    itemCount,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}