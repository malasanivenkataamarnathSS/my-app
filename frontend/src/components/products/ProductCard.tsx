import React, { useState } from 'react';
import { Plus, Minus, Heart, ShoppingCart, Clock } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { usersAPI } from '../../services/api';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedQuantity, setSelectedQuantity] = useState(product.availableQuantities[0] || '');
  const [milkSchedule, setMilkSchedule] = useState<'morning' | 'evening' | 'both' | ''>('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!selectedQuantity) return;
    
    setIsAdding(true);
    try {
      addToCart(
        product,
        quantity,
        selectedQuantity,
        product.category === 'milk' ? milkSchedule : undefined
      );
      
      // Reset form
      setQuantity(1);
      if (product.category === 'milk') {
        setMilkSchedule('');
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await usersAPI.removeFavorite(product._id);
      } else {
        await usersAPI.addFavorite(product._id);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'milk':
        return '🥛';
      case 'meat':
        return '🥩';
      case 'organic-oils':
        return '🫒';
      case 'organic-powders':
        return '🌾';
      default:
        return '📦';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'milk':
        return 'bg-blue-100 text-blue-800';
      case 'meat':
        return 'bg-red-100 text-red-800';
      case 'organic-oils':
        return 'bg-yellow-100 text-yellow-800';
      case 'organic-powders':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-100 flex items-center justify-center">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-6xl">{getCategoryIcon(product.category)}</span>
        )}
        
        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
        >
          <Heart
            className={`h-5 w-5 ${
              isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'
            }`}
          />
        </button>

        {/* Stock Status */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-2">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(
              product.category
            )}`}
          >
            {product.category.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          </span>
          <span className="text-lg font-bold text-primary-600">
            ₹{product.price.toFixed(2)}/{product.unit}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Product Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Quantity Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity:
          </label>
          <select
            value={selectedQuantity}
            onChange={(e) => setSelectedQuantity(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {product.availableQuantities.map((qty) => (
              <option key={qty} value={qty}>
                {qty}
              </option>
            ))}
          </select>
        </div>

        {/* Milk Schedule (only for milk products) */}
        {product.category === 'milk' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline h-4 w-4 mr-1" />
              Delivery Schedule:
            </label>
            <select
              value={milkSchedule}
              onChange={(e) => setMilkSchedule(e.target.value as any)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="">Select schedule</option>
              <option value="morning">Morning</option>
              <option value="evening">Evening</option>
              <option value="both">Both</option>
            </select>
          </div>
        )}

        {/* Quantity Counter */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="font-medium text-lg">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500">Total:</p>
            <p className="font-bold text-lg">₹{(product.price * quantity).toFixed(2)}</p>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={
            !product.inStock ||
            isAdding ||
            !selectedQuantity ||
            (product.category === 'milk' && !milkSchedule)
          }
          className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
        >
          <ShoppingCart className="h-5 w-5" />
          <span>{isAdding ? 'Adding...' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
};