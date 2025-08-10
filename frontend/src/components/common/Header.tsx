import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, Settings, Package, Heart, Bell, BarChart3, CreditCard, MapPin, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { NotificationCenter } from '../notifications/NotificationCenter';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const totalItems = getTotalItems();

  if (!user) {
    return null;
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary-500 text-white p-2 rounded-lg">
              <Package className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-gray-800">MyApp</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-primary-500 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/orders"
              className="text-gray-600 hover:text-primary-500 transition-colors"
            >
              Orders
            </Link>
            <Link
              to="/subscriptions"
              className="text-gray-600 hover:text-primary-500 transition-colors flex items-center"
            >
              <Crown className="h-4 w-4 mr-1" />
              Plans
            </Link>
            <Link
              to="/maps"
              className="text-gray-600 hover:text-primary-500 transition-colors flex items-center"
            >
              <MapPin className="h-4 w-4 mr-1" />
              Maps
            </Link>
            {user.role === 'admin' && (
              <>
                <Link
                  to="/admin"
                  className="text-gray-600 hover:text-primary-500 transition-colors"
                >
                  Admin
                </Link>
                <Link
                  to="/analytics"
                  className="text-gray-600 hover:text-primary-500 transition-colors flex items-center"
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Analytics
                </Link>
              </>
            )}
          </nav>

          {/* Cart and User Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button
              onClick={() => setIsNotificationOpen(true)}
              className="relative p-2 text-gray-600 hover:text-primary-500 transition-colors"
            >
              <Bell className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </button>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-600 hover:text-primary-500 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="bg-primary-500 text-white rounded-full p-1">
                  <User className="h-4 w-4" />
                </div>
                <span className="hidden md:block text-sm text-gray-700">
                  {user.name}
                </span>
                <Menu className="h-4 w-4 text-gray-500 md:hidden" />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/payments"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Payments</span>
                  </Link>
                  <Link
                    to="/subscriptions"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Crown className="h-4 w-4" />
                    <span>Subscriptions</span>
                  </Link>
                  <Link
                    to="/favorites"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="h-4 w-4" />
                    <span>Favorites</span>
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-2">
              <Link
                to="/"
                className="text-gray-600 hover:text-primary-500 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/orders"
                className="text-gray-600 hover:text-primary-500 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Orders
              </Link>
              <Link
                to="/subscriptions"
                className="text-gray-600 hover:text-primary-500 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Subscriptions
              </Link>
              <Link
                to="/payments"
                className="text-gray-600 hover:text-primary-500 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Payments
              </Link>
              <Link
                to="/maps"
                className="text-gray-600 hover:text-primary-500 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Maps
              </Link>
              {user.role === 'admin' && (
                <>
                  <Link
                    to="/admin"
                    className="text-gray-600 hover:text-primary-500 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                  <Link
                    to="/analytics"
                    className="text-gray-600 hover:text-primary-500 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Analytics
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
      />
    </header>
  );
};