import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>Fresh <span className="text-primary">Organic</span> Products</h1>
          <p>Delivered straight to your doorstep. Premium quality organic products from trusted farms to your family.</p>
          <div className="hero-buttons">
            <Link to="/products" className="btn btn-primary">Shop Now</Link>
            <Link to="/about" className="btn btn-secondary">Learn More</Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories">
        <div className="container">
          <h2>Shop by Category</h2>
          <p>Explore our wide range of organic products carefully sourced from local farms</p>
          <div className="category-grid">
            <Link to="/products/milk" className="category-card">
              <div className="category-icon">🥛</div>
              <h3>Milk Products</h3>
              <p>Fresh daily delivery</p>
            </Link>
            <Link to="/products/meat" className="category-card">
              <div className="category-icon">🥩</div>
              <h3>Meat & Eggs</h3>
              <p>Premium quality</p>
            </Link>
            <Link to="/products/oils" className="category-card">
              <div className="category-icon">🫒</div>
              <h3>Organic Oils</h3>
              <p>Pure & natural</p>
            </Link>
            <Link to="/products/powders" className="category-card">
              <div className="category-icon">🌾</div>
              <h3>Organic Powders</h3>
              <p>Sorghum & more</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Why Choose Us?</h2>
          <p>We're committed to bringing you the best organic products with unmatched service</p>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">🌱</div>
              <h3>100% Organic</h3>
              <p>All our products are certified organic and naturally grown.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Fast Delivery</h3>
              <p>Quick and reliable delivery to your doorstep.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Quality Assured</h3>
              <p>Rigorous quality checks ensure fresh products every time.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⏰</div>
              <h3>Flexible Timing</h3>
              <p>Morning, evening, or both - choose your delivery time.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;