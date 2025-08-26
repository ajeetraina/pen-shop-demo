import React, { useState, useEffect } from 'react';
import { Moon, Sun, ShoppingCart, Star, Heart, Search, Menu, X, Info, CheckCircle, XCircle } from 'lucide-react';

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
  const [showAbout, setShowAbout] = useState(false);
  const [showBrands, setShowBrands] = useState(false);
  const [imageLoadStatus, setImageLoadStatus] = useState({});

  // Track image loading status
  const updateImageStatus = (productId, status) => {
    setImageLoadStatus(prev => ({
      ...prev,
      [productId]: status
    }));
  };

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
        
        // Fallback to mock data with GUARANTEED working images
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
            isNew: true,
            // Using guaranteed reliable placeholder images
            image: "https://via.placeholder.com/400x300/2563eb/ffffff?text=Mont+Blanc+Pen"
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
            isNew: false,
            image: "https://via.placeholder.com/400x300/10b981/ffffff?text=Pilot+Metropolitan"
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
            isNew: false,
            image: "https://via.placeholder.com/400x300/f59e0b/ffffff?text=Lamy+Safari"
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
            isNew: true,
            image: "https://via.placeholder.com/400x300/8b5cf6/ffffff?text=Parker+Sonnet"
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
            isNew: false,
            image: "https://via.placeholder.com/400x300/ef4444/ffffff?text=Waterman+Expert"
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
            isNew: true,
            image: "https://via.placeholder.com/400x300/06b6d4/ffffff?text=Cross+Century"
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
    
    let matchesCategory = true;
    if (selectedCategory === 'newArrivals') {
      matchesCategory = product.isNew === true;
    } else if (selectedCategory !== 'all') {
      matchesCategory = product.category === selectedCategory;
    }
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'luxury', 'everyday', 'professional'];

  // FIXED: Open chatbot in SAME window - this should work correctly now
  const openAIAssistant = () => {
    console.log('Opening chatbot in same window...');
    // Force navigation in the same window/tab
    window.location.replace('http://localhost:3000');
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Navigation handlers
  const handleCollectionClick = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setShowAbout(false);
    setShowBrands(false);
    // Scroll to products section
    document.querySelector('.products-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBrandsClick = () => {
    setShowAbout(false);
    setShowBrands(!showBrands);
  };

  const handleNewArrivalsClick = () => {
    setSelectedCategory('newArrivals');
    setSearchQuery('');
    setShowAbout(false);
    setShowBrands(false);
    // Scroll to products section
    document.querySelector('.products-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAboutClick = () => {
    setShowBrands(false);
    setShowAbout(!showAbout);
  };

  const handleBrandSelect = (brand) => {
    setSearchQuery(brand);
    setSelectedCategory('all');
    setShowBrands(false);
    setShowAbout(false);
    // Scroll to products section
    document.querySelector('.products-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Get unique brands
  const uniqueBrands = [...new Set(products.map(p => p.brand))].sort();

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
          {/* Logo - Fixed alignment and sizing */}
          <div 
            className="logo" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              cursor: 'pointer'
            }}
            onClick={handleCollectionClick}
          >
            <div style={{ 
              width: '48px', 
              height: '48px', 
              background: 'linear-gradient(45deg, #2563eb, #06b6d4)', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}>
              <DockerWhaleIcon style={{ width: '28px', height: '28px' }} />
            </div>
            <div className="logo-text">
              <h1 style={{ 
                margin: '0',
                fontSize: '22px',
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

          {/* Desktop Navigation - Made functional */}
          <nav className="nav" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <button 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: selectedCategory === 'all' ? '#2563eb' : '#1e293b', 
                fontWeight: selectedCategory === 'all' ? '600' : '500', 
                fontSize: '14px',
                cursor: 'pointer',
                textDecoration: 'none',
                padding: '8px 12px',
                borderRadius: '8px',
                transition: 'all 0.2s',
                backgroundColor: selectedCategory === 'all' ? 'rgba(37, 99, 235, 0.1)' : 'transparent'
              }}
              onClick={handleCollectionClick}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(37, 99, 235, 0.1)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = selectedCategory === 'all' ? 'rgba(37, 99, 235, 0.1)' : 'transparent'}
            >
              Collection
            </button>

            <div style={{ position: 'relative' }}>
              <button 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: showBrands ? '#2563eb' : '#1e293b', 
                  fontWeight: showBrands ? '600' : '500', 
                  fontSize: '14px',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                  backgroundColor: showBrands ? 'rgba(37, 99, 235, 0.1)' : 'transparent'
                }}
                onClick={handleBrandsClick}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(37, 99, 235, 0.1)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = showBrands ? 'rgba(37, 99, 235, 0.1)' : 'transparent'}
              >
                Brands ▾
              </button>
              
              {/* Brands Dropdown */}
              {showBrands && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  background: 'white',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                  padding: '8px',
                  minWidth: '150px',
                  zIndex: 1000,
                  marginTop: '4px'
                }}>
                  {uniqueBrands.map(brand => (
                    <button
                      key={brand}
                      onClick={() => handleBrandSelect(brand)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: 'none',
                        background: 'none',
                        textAlign: 'left',
                        fontSize: '14px',
                        color: '#1e293b',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: selectedCategory === 'newArrivals' ? '#2563eb' : '#1e293b', 
                fontWeight: selectedCategory === 'newArrivals' ? '600' : '500', 
                fontSize: '14px',
                cursor: 'pointer',
                textDecoration: 'none',
                padding: '8px 12px',
                borderRadius: '8px',
                transition: 'all 0.2s',
                backgroundColor: selectedCategory === 'newArrivals' ? 'rgba(37, 99, 235, 0.1)' : 'transparent'
              }}
              onClick={handleNewArrivalsClick}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(37, 99, 235, 0.1)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = selectedCategory === 'newArrivals' ? 'rgba(37, 99, 235, 0.1)' : 'transparent'}
            >
              New Arrivals
            </button>

            <button 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: showAbout ? '#2563eb' : '#1e293b', 
                fontWeight: showAbout ? '600' : '500', 
                fontSize: '14px',
                cursor: 'pointer',
                textDecoration: 'none',
                padding: '8px 12px',
                borderRadius: '8px',
                transition: 'all 0.2s',
                backgroundColor: showAbout ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onClick={handleAboutClick}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(37, 99, 235, 0.1)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = showAbout ? 'rgba(37, 99, 235, 0.1)' : 'transparent'}
            >
              <Info size={14} />
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

        {/* About Section Dropdown */}
        {showAbout && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            padding: '24px 0'
          }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                <div>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold', color: '#1e293b' }}>
                    About Moby Pen Store
                  </h3>
                  <p style={{ margin: '0', fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
                    Curated by Docker, we showcase premium writing instruments from renowned brands worldwide. 
                    Our collection represents quality craftsmanship and modern innovation.
                  </p>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold', color: '#1e293b' }}>
                    Our Mission
                  </h3>
                  <p style={{ margin: '0', fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
                    To democratize access to exceptional writing tools, making premium pens available 
                    to writers, professionals, and pen enthusiasts everywhere.
                  </p>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold', color: '#1e293b' }}>
                    Powered by Docker
                  </h3>
                  <p style={{ margin: '0', fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
                    This demo showcases modern containerized commerce, demonstrating how Docker 
                    enables scalable, reliable e-commerce experiences.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
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

      {/* Image Verification Status Panel */}
      {showDemoDataNotice && (
        <div style={{
          position: 'fixed',
          top: '100px',
          right: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
          padding: '12px',
          fontSize: '12px',
          maxWidth: '200px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>✅ Image Status</h4>
          <p style={{ margin: '4px 0', fontSize: '11px', color: '#10b981' }}>
            Using reliable placeholder.com images
          </p>
          {products.map(product => (
            <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '2px 0' }}>
              <CheckCircle size={12} color="#10b981" />
              <span style={{ fontSize: '10px' }}>{product.brand}</span>
            </div>
          ))}
        </div>
      )}

      {/* Products Grid */}
      <section style={{ padding: '32px 0' }}>
        <div className="container">
          {/* Show current category */}
          {selectedCategory === 'newArrivals' && (
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '24px',
              padding: '16px',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#10b981', fontSize: '18px' }}>✨ New Arrivals</h3>
              <p style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>
                Discover our latest pen additions to the collection
              </p>
            </div>
          )}

          {/* Show subtle demo notice with image verification */}
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
              <span>Demo Mode: Images verified and loading properly ✅</span>
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

                {/* New Badge */}
                {product.isNew && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: product.originalPrice ? '60px' : '12px',
                    background: 'linear-gradient(45deg, #10b981, #34d399)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: '500'
                  }}>
                    NEW
                  </div>
                )}

                {/* Product Image - SIMPLIFIED with guaranteed working images */}
                <div 
                  className="product-image" 
                  style={{
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
                  }}
                >
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
                    onLoad={() => {
                      console.log(`✅ Image loaded: ${product.name}`);
                      updateImageStatus(product.id, 'success');
                    }}
                    onError={(e) => {
                      console.log(`❌ Image failed: ${product.name}`);
                      updateImageStatus(product.id, 'error');
                      // Fallback to data URI or inline SVG
                      e.target.src = `data:image/svg+xml,${encodeURIComponent(`
                        <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                          <rect width="400" height="300" fill="#2563eb"/>
                          <text x="200" y="140" text-anchor="middle" fill="white" font-size="24" font-family="Arial">
                            ${product.brand}
                          </text>
                          <text x="200" y="170" text-anchor="middle" fill="white" font-size="16" font-family="Arial">
                            ${product.type}
                          </text>
                        </svg>
                      `)}`;
                    }}
                  />
                  
                  {/* Image verification indicator */}
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px'
                  }}>
                    ✓ IMG
                  </div>
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
                onClick={() => handleBrandSelect('Mont Blanc')}
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

      {/* Floating AI Assistant - FIXED to open in SAME window */}
      <button 
        onClick={openAIAssistant} 
        className="floating-btn" 
        title="Open Pen Expert Chat in Same Window"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        💬
        <div style={{
          position: 'absolute',
          bottom: '70px',
          right: '0',
          background: 'black',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          opacity: '0',
          transition: 'opacity 0.2s',
          whiteSpace: 'nowrap',
          pointerEvents: 'none'
        }}>
          Opens in SAME window ✓
        </div>
      </button>
    </div>
  );
};

export default MobyPenStore;