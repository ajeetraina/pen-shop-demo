import React, { useState, useEffect } from 'react';
import { Moon, Sun, ShoppingCart, Star, Heart, Search, Menu, X } from 'lucide-react';

// Proper Docker Logo Component
const DockerLogo = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.83.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m0 2.715h2.119a.185.185 0 00.185-.185v-1.888a.185.185 0 00-.185-.185h-2.119a.185.185 0 00-.185.185v1.888c0 .102.084.185.185.185m-2.98 0h2.12a.185.185 0 00.185-.185v-1.888a.185.185 0 00-.185-.185h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338 0-.676.033-.995.099-.1-3.537-2.101-4.381-2.906-4.381-.202 0-.407.033-.61.099-.486.17-.944.54-1.354 1.122-.728-.79-1.672-1.219-2.669-1.219-.674 0-1.317.244-1.842.68-.525-.435-1.146-.68-1.842-.68-.997 0-1.941.429-2.669 1.219-.41-.582-.868-.952-1.354-1.122-.203-.066-.408-.099-.61-.099-.805 0-2.806.844-2.906 4.381-.319-.066-.657-.099-.995-.099C1.139 9.38.532 9.839.467 9.89L0 10.297l.945.789c.4.33.809.442 1.238.442.486 0 .944-.17 1.354-.505.41.334.868.505 1.354.505.486 0 .944-.17 1.354-.505.41.334.868.505 1.354.505.486 0 .944-.17 1.354-.505.41.334.868.505 1.354.505.486 0 .944-.17 1.354-.505.41.334.868.505 1.354.505.486 0 .944-.17 1.354-.505.41.334.868.505 1.354.505.429 0 .838-.112 1.238-.442l.945-.789z"/>
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
      } catch (err) {
        setError('Unable to load pen catalogue. Please try again later.');
        console.error('Catalogue error:', err);
        
        // Fallback to mock data with real pen images
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
            image: "https://images.unsplash.com/photo-1565106430482-8f6e74349ca1?w=400&h=400&fit=crop&q=80"
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
            image: "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=400&h=400&fit=crop&q=80"
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
            image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&h=400&fit=crop&q=80"
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
            image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop&q=80"
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
            image: "https://images.unsplash.com/photo-1592495981488-073262d6e4cf?w=400&h=400&fit=crop&q=80"
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
            image: "https://images.unsplash.com/photo-1606113504104-2de841b5ba69?w=400&h=400&fit=crop&q=80"
          }
        ];
        setProducts(mockProducts);
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'luxury', 'everyday', 'professional'];

  const openAIAssistant = () => {
    window.open('http://localhost:3000', '_blank');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <DockerLogo style={{ width: '32px', height: '32px', color: '#2563eb' }} />
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
          {/* Logo */}
          <div className="logo">
            <div className="logo-icon">
              <DockerLogo style={{ width: '24px', height: '24px' }} />
            </div>
            <div className="logo-text">
              <h1>Moby Pen Store</h1>
              <p>Premium Writing Instruments</p>
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
          
          {/* Search Bar */}
          <div className="search-container">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search pens, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

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
          {error && (
            <div className="error-message">
              <p>{error}</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>
                Showing demo products below
              </p>
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

                {/* Product Image */}
                <div className="product-image">
                  <img
                    src={product.image || "https://images.unsplash.com/photo-1565106430482-8f6e74349ca1?w=400&h=400&fit=crop&q=80"}
                    alt={product.name}
                    loading="lazy"
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

          {filteredProducts.length === 0 && (
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
              <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>Try adjusting your search or category filter</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          {/* Brand */}
          <div style={{ gridColumn: 'span 2' }}>
            <div className="logo" style={{ marginBottom: '16px' }}>
              <div className="logo-icon" style={{ width: '32px', height: '32px' }}>
                <DockerLogo style={{ width: '20px', height: '20px' }} />
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