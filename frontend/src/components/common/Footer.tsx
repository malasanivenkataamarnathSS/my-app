import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-section">
            <div className="footer-logo">
              <div className="footer-logo-icon">🌱</div>
              <span>Organic Products</span>
            </div>
            <p>
              Delivering fresh, organic products straight to your doorstep. 
              Quality you can trust, convenience you'll love.
            </p>
            <div className="contact-info">
              <div>📧 support@organicproducts.com</div>
              <div>📞 +91 12345 67890</div>
              <div>📍 India</div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3>Quick Links</h3>
            <div className="footer-links">
              <Link to="/">Home</Link>
              <Link to="/products">All Products</Link>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>

          {/* Categories */}
          <div className="footer-section">
            <h3>Categories</h3>
            <div className="footer-links">
              <Link to="/products/milk">Milk Products</Link>
              <Link to="/products/meat">Meat & Eggs</Link>
              <Link to="/products/oils">Organic Oils</Link>
              <Link to="/products/powders">Organic Powders</Link>
            </div>
          </div>

          {/* Account & Support */}
          <div className="footer-section">
            <h3>Account & Support</h3>
            <div className="footer-links">
              <Link to="/profile">My Profile</Link>
              <Link to="/orders">Order History</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 Organic Products. All rights reserved.</p>
          <div className="footer-features">
            <span>🌱 100% Organic</span>
            <span>🚚 Free Delivery on ₹1000+</span>
            <span>⭐ Farm Fresh Quality</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;