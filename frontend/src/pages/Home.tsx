import React, { useState, useEffect, useCallback } from 'react';
import { ProductCard } from '../components/products/ProductCard';
import { CategoryFilter } from '../components/products/CategoryFilter';
import { SearchBar } from '../components/products/SearchBar';
import { Product } from '../types';
import { productsAPI } from '../services/api';
import { Loader } from 'lucide-react';

export const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await productsAPI.getAll();
      setProducts(response.data);
      setError(null);
    } catch (error: any) {
      setError('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = useCallback(() => {
    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery]);

  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  useEffect(() => {
    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="h-8 w-8 animate-spin text-primary-500" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl p-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Fresh Organic Products Delivered
        </h1>
        <p className="text-lg text-primary-100 mb-6">
          From farm to your table - Pure, organic, and healthy
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <span>🥛</span>
            <span>Fresh Milk</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🥩</span>
            <span>Premium Meat</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🫒</span>
            <span>Organic Oils</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🌾</span>
            <span>Healthy Powders</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search for products..."
          />
        </div>
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg mb-4">No products found</p>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory('')}
              className="text-primary-500 hover:text-primary-600"
            >
              Show all products
            </button>
          )}
        </div>
      )}
    </div>
  );
};