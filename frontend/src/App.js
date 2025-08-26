import React, { useState, useEffect } from 'react';
import { Moon, Sun, ShoppingCart, Star, Heart, Search, Menu, X } from 'lucide-react';

// Proper Docker Whale Logo with Containers (like the image provided)
const DockerWhaleIcon = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 48 48" fill="currentColor">
    {/* Container blocks on whale's back */}
    <rect x="8" y="12" width="4" height="4" />
    <rect x="13" y="12" width="4" height="4" />
    <rect x="18" y="12" width="4" height="4" />
    <rect x="23" y="8" width="4" height="4" />
    <rect x="23" y="12" width="4" height="4" />
    <rect x="28" y="12" width="4" height="4" />
    <rect x="33" y="12" width="4" height="4" />
    
    {/* Whale body - smooth rounded shape */}
    <path d="M6 20c0-2 1-4 3-4h26c4 0 8 2 8 6 0 6-2 10-8 10H14c-4 0-8-4-8-12z" />
    
    {/* Whale tail */}
    <path d="M35 18c3-2 6-1 8 1-1 3-3 5-8 3z" />
    <path d="M35 24c3 2 6 1 8-1-1-3-3-5-8-3z" />
    
    {/* Whale eye */}
    <circle cx="12" cy="20" r="2" fill="white" />
    <circle cx="13" cy="19" r="1" fill="currentColor" />
  </svg>
);

const MobyPenStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [error, setError] = useState(null);
  const [showDemoDataNotice, setShowDemoDataNotice] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const catalogueUrl = process.env.REACT_APP_CATALOGUE_URL || 'http://localhost:8081';
        const response = await fetch(`${catalogueUrl}/catalogue`);
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        setProducts(data);
        setError(null);
        setShowDemoDataNotice(false);
      } catch (err) {
        console.error('Catalogue error:', err);
        
        // Fallback to mock data with high-quality pen images
        const mockProducts = [
          {
            id: 1,
            name: "Mont Blanc Meisterstück",
            brand: "Mont Blanc",
            type: "Fountain Pen",
            price: 649.99,
            originalPrice: 749.99,
            description: "The iconic luxury fountain pen with 18K gold nib and precious resin barrel. A symbol of writing excellence.",
            in_stock: true,
            rating: 4.8,
            reviews: 342,
            category: "luxury",
            image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop&q=80&auto=format"
          },
          {
            id: 2,
            name: "Pilot Metropolitan",
            brand: "Pilot",
            type: "Fountain Pen",
            price: 24.99,
            description: "Affordable luxury fountain pen with steel nib. Perfect for everyday writing and beginners.",
            in_stock: true,
            rating: 4.6,
            reviews: 1284,
            category: "everyday",
            image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=600&fit=crop&q=80&auto=format"
          },
          {
            id: 3,
            name: "Lamy Safari",
            brand: "Lamy",
            type: "Fountain Pen",
            price: 34.99,
            description: "Modern design with distinctive grip section. Robust and reliable for daily use.",
            in_stock: false,
            rating: 4.7,
            reviews: 892,
            category: "everyday",
            image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=600&fit=crop&q=80&auto=format"
          },
          {
            id: 4,
            name: "Parker Sonnet",
            brand: "Parker",
            type: "Ballpoint Pen",
            price: 89.99,
            description: "Elegant ballpoint pen with premium finishes. Sophisticated writing instrument for professionals.",
            in_stock: true,
            rating: 4.5,
            reviews: 267,
            category: "professional",
            image: "https://images.unsplash.com/photo-1625916674103-85be0c8e0d2e?w=600&h=600&fit=crop&q=80&auto=format"
          },
          {
            id: 5,
            name: "Waterman Expert",
            brand: "Waterman",
            type: "Fountain Pen",
            price: 156.99,
            description: "French elegance meets modern innovation. Perfectly balanced writing experience.",
            in_stock: true,
            rating: 4.4,
            reviews: 189,
            category: "professional",
            image: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=600&h=600&fit=crop&q=80&auto=format"
          },
          {
            id: 6,
            name: "Cross Century II",
            brand: "Cross",
            type: "Ballpoint Pen",
            price: 78.99,
            description: "Classic American design with lifetime warranty. Timeless writing companion.",
            in_stock: true,
            rating: 4.3,
            reviews: 445,
            category: "professional",
            image: "https://images.unsplash.com/photo-1542013936693-884638332954?w=600&h=600&fit=crop&q=80&auto=format"
          }
        ];
        setProducts(mockProducts);
        setError(null);
        setShowDemoDataNotice(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  
  const toggleFavorite = (id) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  // Enhanced search functionality
  const filteredProducts = products.filter(product => {
    if (!product) return false;
    
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch = searchLower === '' || 
                         (product.name && product.name.toLowerCase().includes(searchLower)) ||
                         (product.brand && product.brand.toLowerCase().includes(searchLower)) ||
                         (product.type && product.type.toLowerCase().includes(searchLower)) ||
                         (product.description && product.description.toLowerCase().includes(searchLower));
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'luxury', 'everyday', 'professional'];

  const openAIAssistant = () => {
    const chatWindow = window.open('http://localhost:3000', '_blank', 'noopener,noreferrer');
    if (chatWindow) {
      chatWindow.focus();
    } else {
      window.open('http://localhost:3000', '_self');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <DockerWhaleIcon style={{ width: '32px', height: '32px', color: '#2563eb' }} />
          <p style={{ fontSize: '20px', fontWeight: '500', color: '#1e293b' }}>Loading Moby's pen collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          {/* Logo - Fixed alignment */}
          <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="logo-icon" style={{ 
              width: '40px', 
              height: '40px', 
              background: 'linear-gradient(45deg, #2563eb, #06b6d4)', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white'
            }}>
              <DockerWhaleIcon style={{ width: '24px', height: '24px' }} />
            </div>
            <div className="logo-text">
              <h1 style={{ 
                margin: '0',
                fontSize: '20px',
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #2563eb, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: '1.2'
              }}>
                Moby Pen Store
              </h1>
              <p style={{ 
                margin: '0',
                fontSize: '12px',
                color: '#64748b',
                lineHeight: '1'
              }}>
                Premium Writing Instruments
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="nav">
            <button 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#1e293b', 
                fontWeight: '500', 
                fontSize: '14px',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
              onClick={() => setSelectedCategory('all')}
            >
              Collection
            </button>
            <button 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#1e293b', 
                fontWeight: '500', 
                fontSize: '14px',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
              onClick={() => console.log('Brands clicked')}
            >
              Brands
            </button>
            <button 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#1e293b', 
                fontWeight: '500', 
                fontSize: '14px',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
              onClick={() => setSelectedCategory('luxury')}
            >
              New Arrivals
            </button>
            <button 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#1e293b', 
                fontWeight: '500', 
                fontSize: '14px',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
              onClick={() => console.log('About clicked')}
            >
              About
            </button>
          </nav>

          {/* Controls */}
          <div className="controls">
            <button className="btn" onClick={toggleDarkMode}>
              {darkMode ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} color="#2563eb" />}
            </button>
            
            <button className="btn" style={{ position: 'relative' }}>
              <ShoppingCart size={16} />
              {favorites.size > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '16px',
                  height: '16px',
                  background: '#2563eb',
                  color: 'white',
                  fontSize: '10px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {favorites.size}
                </span>
              )}
            </button>

            <button className="btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ display: 'none' }}>
              {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div style={{ marginBottom: '32px' }}>
            <h2>Welcome to Moby Pen Store</h2>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '8px 0' }}>Curated by Docker</p>
            
            <p style={{ fontSize: '18px', color: '#64748b', margin: '16px auto', maxWidth: '600px' }}>
              Discover premium writing instruments crafted for excellence
            </p>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '32px 0', opacity: '0.8' }}>
              ✒️ Luxury Pens • Professional Tools • Everyday Essentials
            </p>
          </div>
          
          {/* Enhanced Search Bar */}
          <div className="search-container">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search pens, brands, types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button 
                onClick={clearSearch}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Show current search results count */}
          {searchQuery && (
            <div style={{ 
              textAlign: 'center', 
              fontSize: '14px', 
              color: '#64748b', 
              margin: '8px 0' 
            }}>
              Found {filteredProducts.length} pen{filteredProducts.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </div>
          )}

          {/* Category Filter */}
          <div className="categories">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section style={{ padding: '32px 0' }}>
        <div className="container">
          {/* Show subtle demo notice instead of error when fallback data is loaded */}
          {showDemoDataNotice && (
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              color: '#2563eb',
              padding: '12px 16px',
              borderRadius: '12px',
              textAlign: 'center',
              margin: '0 0 24px 0',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <DockerWhaleIcon style={{ width: '16px', height: '16px', color: '#2563eb' }} />
              <span>Demo Mode: Backend services unavailable, showing curated collection</span>
            </div>
          )}
          
          {/* Only show error if we actually have an error AND no products */}
          {error && products.length === 0 && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
          
          <div className="products-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className="favorite-btn"
                >
                  <Heart
                    size={16}
                    color={favorites.has(product.id) ? '#ef4444' : '#9ca3af'}
                    fill={favorites.has(product.id) ? '#ef4444' : 'none'}
                  />
                </button>

                {/* Sale Badge */}
                {product.originalPrice && (
                  <div className="sale-badge">
                    Sale
                  </div>
                )}

                {/* Product Image - High quality pen images */}
                <div className="product-image" style={{
                  width: '100%',
                  height: '200px',
                  background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                    onError={(e) => {
                      // Fallback to pen icon if image fails
                      e.target.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.style.cssText = `
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        color: #64748b;
                        font-size: 14px;
                        text-align: center;
                        padding: 20px;
                        width: 100%;
                        height: 100%;
                      `;
                      fallback.innerHTML = `
                        <div style="font-size: 48px; margin-bottom: 8px;">🖋️</div>
                        <div style="font-weight: 500;">${product.brand}</div>
                        <div>${product.name}</div>
                      `;
                      e.target.parentElement.appendChild(fallback);
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="product-info">
                  <div className="product-header">
                    <span className="brand-tag">{product.brand}</span>
                    {product.rating && (
                      <div className="rating">
                        <span className="star">★</span>
                        <span>{product.rating}</span>
                        <span>({product.reviews || 0})</span>
                      </div>
                    )}
                  </div>

                  <h3 className="product-title">{product.name}</h3>
                  <p className="product-type">{product.type}</p>
                  
                  <p className="product-description">{product.description}</p>

                  <div className="price-container">
                    <span className="price">${product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                      <span className="original-price">${product.originalPrice.toFixed(2)}</span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="stock-status">
                    <div className={`stock-dot ${product.in_stock ? 'in-stock' : 'out-of-stock'}`}></div>
                    <span className={product.in_stock ? 'in-stock' : 'out-of-stock'}>
                      {product.in_stock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    disabled={!product.in_stock}
                    className="add-to-cart"
                  >
                    <ShoppingCart size={16} />
                    <span>{product.in_stock ? 'Add to Cart' : 'Out of Stock'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && products.length > 0 && (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                margin: '0 auto 16px', 
                background: '#e5e7eb', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Search size={32} color="#9ca3af" />
              </div>
              <p style={{ fontSize: '18px', color: '#64748b' }}>No pens found matching your criteria</p>
              <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
                {searchQuery ? `No results for "${searchQuery}"` : 'Try adjusting your category filter'}
              </p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                style={{
                  marginTop: '16px',
                  padding: '8px 16px',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          {/* Brand */}
          <div style={{ gridColumn: 'span 2' }}>
            <div className="logo" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="logo-icon" style={{ 
                width: '32px', 
                height: '32px',
                background: 'linear-gradient(45deg, #2563eb, #06b6d4)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <DockerWhaleIcon style={{ width: '20px', height: '20px' }} />
              </div>
              <div className="logo-text">
                <h3 style={{ fontSize: '18px', margin: '0' }}>Moby Pen Store</h3>
                <p style={{ fontSize: '12px', margin: '0' }}>Premium Writing Instruments</p>
              </div>
            </div>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 16px 0', maxWidth: '400px' }}>
              Discover the finest collection of writing instruments from renowned brands worldwide. 
              Quality craftsmanship meets modern technology.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>Quick Links</h4>
            <div>
              <button 
                style={{ 
                  display: 'block', 
                  background: 'none', 
                  border: 'none', 
                  color: '#64748b', 
                  fontSize: '12px',
                  margin: '8px 0',
                  padding: '0',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onClick={() => setSelectedCategory('all')}
              >
                Our Collection
              </button>
              <button 
                style={{ 
                  display: 'block', 
                  background: 'none', 
                  border: 'none', 
                  color: '#64748b', 
                  fontSize: '12px',
                  margin: '8px 0',
                  padding: '0',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onClick={() => console.log('Brand Partners')}
              >
                Brand Partners
              </button>
              <button 
                style={{ 
                  display: 'block', 
                  background: 'none', 
                  border: 'none', 
                  color: '#64748b', 
                  fontSize: '12px',
                  margin: '8px 0',
                  padding: '0',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onClick={() => console.log('Gift Cards')}
              >
                Gift Cards
              </button>
              <button 
                style={{ 
                  display: 'block', 
                  background: 'none', 
                  border: 'none', 
                  color: '#64748b', 
                  fontSize: '12px',
                  margin: '8px 0',
                  padding: '0',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onClick={() => console.log('Care Guide')}
              >
                Care Guide
              </button>
            </div>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h4>Support</h4>
            <div>
              <button 
                style={{ 
                  display: 'block', 
                  background: 'none', 
                  border: 'none', 
                  color: '#64748b', 
                  fontSize: '12px',
                  margin: '8px 0',
                  padding: '0',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onClick={() => console.log('Contact Us')}
              >
                Contact Us
              </button>
              <button 
                style={{ 
                  display: 'block', 
                  background: 'none', 
                  border: 'none', 
                  color: '#64748b', 
                  fontSize: '12px',
                  margin: '8px 0',
                  padding: '0',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onClick={() => console.log('Shipping Info')}
              >
                Shipping Info
              </button>
              <button 
                style={{ 
                  display: 'block', 
                  background: 'none', 
                  border: 'none', 
                  color: '#64748b', 
                  fontSize: '12px',
                  margin: '8px 0',
                  padding: '0',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onClick={() => console.log('Returns')}
              >
                Returns
              </button>
              <button 
                style={{ 
                  display: 'block', 
                  background: 'none', 
                  border: 'none', 
                  color: '#64748b', 
                  fontSize: '12px',
                  margin: '8px 0',
                  padding: '0',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                onClick={() => console.log('FAQ')}
              >
                FAQ
              </button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 Moby Pen Store • Powered by Docker • All rights reserved.</p>
        </div>
      </footer>

      {/* Floating AI Assistant */}
      <button onClick={openAIAssistant} className="floating-btn">
        💬
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '0',
          background: 'black',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '8px',
          fontSize: '12px',
          opacity: '0',
          transition: 'opacity 0.2s',
          whiteSpace: 'nowrap',
          pointerEvents: 'none'
        }}>
          Pen Expert Chat
        </div>
      </button>
    </div>
  );
};

export default MobyPenStore;