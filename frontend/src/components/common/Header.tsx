import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Header.css';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo">
            <div className="logo-icon">🌱</div>
            <span>Organic Products</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <Link to="/">Home</Link>
            <Link to="/products">Products</Link>
            <Link to="/products/milk">Milk</Link>
            <Link to="/products/meat">Meat & Eggs</Link>
            <Link to="/products/oils">Organic Oils</Link>
            <Link to="/products/powders">Organic Powders</Link>
          </nav>

          {/* Desktop Actions */}
          <div className="desktop-actions">
            {/* Cart */}
            <Link to="/cart" className="cart-link">
              🛒
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="user-menu">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="user-button"
                >
                  👤 {user.name}
                </button>
                
                {isUserMenuOpen && (
                  <div className="user-dropdown">
                    <Link to="/profile" onClick={() => setIsUserMenuOpen(false)}>
                      Profile
                    </Link>
                    <Link to="/orders" onClick={() => setIsUserMenuOpen(false)}>
                      Order History
                    </Link>
                    <Link to="/favorites" onClick={() => setIsUserMenuOpen(false)}>
                      Favorites
                    </Link>
                    {user.isAdmin && (
                      <Link to="/admin" onClick={() => setIsUserMenuOpen(false)}>
                        Admin Dashboard
                      </Link>
                    )}
                    <hr />
                    <button onClick={handleLogout} className="logout-btn">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="login-btn">
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="mobile-actions">
            <Link to="/cart" className="cart-link">
              🛒
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="menu-button"
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="mobile-nav">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/products" onClick={() => setIsMenuOpen(false)}>Products</Link>
            <Link to="/products/milk" onClick={() => setIsMenuOpen(false)}>Milk</Link>
            <Link to="/products/meat" onClick={() => setIsMenuOpen(false)}>Meat & Eggs</Link>
            <Link to="/products/oils" onClick={() => setIsMenuOpen(false)}>Organic Oils</Link>
            <Link to="/products/powders" onClick={() => setIsMenuOpen(false)}>Organic Powders</Link>
            
            {user ? (
              <div className="mobile-user-section">
                <div className="mobile-user-name">{user.name}</div>
                <Link to="/profile" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                <Link to="/orders" onClick={() => setIsMenuOpen(false)}>Order History</Link>
                {user.isAdmin && (
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="mobile-logout-btn"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="mobile-login-btn"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;