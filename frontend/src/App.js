import React, { useState, useEffect } from 'react';
import { Moon, Sun, ShoppingCart, Star, Heart, Search, Filter, Menu, X } from 'lucide-react';

// Docker Whale Logo Component
const DockerWhale = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.5 10.5h2v1.5h-2v-1.5zm-3 0h2v1.5h-2v-1.5zm-3 0h2v1.5h-2v-1.5zm9 0h2v1.5h-2v-1.5zm-12 0h2v1.5h-2v-1.5zm3-3h2v1.5h-2V7.5zm3 0h2v1.5h-2V7.5zm3 0h2v1.5h-2V7.5zm-3-3h2v1.5h-2V4.5zm15 7.5c0-5.185-4.03-9.441-9.153-9.931a2.25 2.25 0 0 0-4.694 0C6.03 2.559 2 6.815 2 12a10 10 0 0 0 20 0z"/>
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
        
        // Fallback to mock data for demo purposes
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
            category: "luxury"
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
            category: "everyday"
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
            category: "everyday"
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
            category: "professional"
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
            category: "professional"
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
            category: "professional"
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

  const theme = {
    bg: darkMode ? 'from-gray-900 via-blue-900 to-slate-900' : 'from-slate-50 via-blue-50 to-cyan-50',
    cardBg: darkMode ? 'bg-gray-800/50 backdrop-blur-lg border-gray-700' : 'bg-white/70 backdrop-blur-lg border-white/20',
    text: darkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: darkMode ? 'text-gray-300' : 'text-gray-600',
    accent: 'from-blue-600 to-cyan-600',
    button: darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-500',
    dockerBlue: '#2496ED'
  };

  const openAIAssistant = () => {
    window.open('http://localhost:3000', '_blank');
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.bg} flex items-center justify-center`}>
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin animation-delay-150 mx-auto"></div>
          </div>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <DockerWhale className="w-6 h-6 text-blue-600" />
            <p className={`text-xl font-medium ${theme.text}`}>Loading Moby's pen collection...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} transition-all duration-500`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${theme.cardBg} border-b shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <DockerWhale className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold bg-gradient-to-r ${theme.accent} bg-clip-text text-transparent`}>
                  Moby Pen Store
                </h1>
                <p className={`text-xs ${theme.textSecondary}`}>Powered by Docker</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className={`${theme.text} hover:text-blue-600 transition-colors font-medium`}>Collection</a>
              <a href="#" className={`${theme.text} hover:text-blue-600 transition-colors font-medium`}>Brands</a>
              <a href="#" className={`${theme.text} hover:text-blue-600 transition-colors font-medium`}>Docker Demo</a>
              <a href="#" className={`${theme.text} hover:text-blue-600 transition-colors font-medium`}>About</a>
            </nav>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-xl ${theme.cardBg} border hover:scale-105 transition-all duration-200`}
              >
                {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-blue-600" />}
              </button>
              
              <button className={`p-2 rounded-xl ${theme.cardBg} border hover:scale-105 transition-all duration-200 relative`}>
                <ShoppingCart className={`w-5 h-5 ${theme.text}`} />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                  {favorites.size}
                </span>
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 rounded-xl ${theme.cardBg} border`}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden ${theme.cardBg} border-b shadow-lg`}>
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            <a href="#" className={`block py-2 ${theme.text} hover:text-blue-600`}>Collection</a>
            <a href="#" className={`block py-2 ${theme.text} hover:text-blue-600`}>Brands</a>
            <a href="#" className={`block py-2 ${theme.text} hover:text-blue-600`}>Docker Demo</a>
            <a href="#" className={`block py-2 ${theme.text} hover:text-blue-600`}>About</a>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <DockerWhale className={`w-16 h-16 text-blue-600 mr-4`} />
            <div>
              <h2 className={`text-5xl md:text-7xl font-bold ${theme.text} leading-tight`}>
                Moby's
                <span className={`block bg-gradient-to-r ${theme.accent} bg-clip-text text-transparent`}>
                  Pen Store
                </span>
              </h2>
            </div>
          </div>
          <p className={`text-xl md:text-2xl ${theme.textSecondary} mb-4 max-w-2xl mx-auto`}>
            Premium writing instruments in a containerized shopping experience
          </p>
          <p className={`text-lg ${theme.textSecondary} mb-8 max-w-xl mx-auto opacity-80`}>
            🐳 Powered by Docker • Scalable • Reliable • Modern
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search pens, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-4 rounded-2xl ${theme.cardBg} border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-lg`}
            />
          </div>

          {/* Category Filter */}
          <div className="flex justify-center space-x-2 mb-8 flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full transition-all capitalize font-medium ${
                  selectedCategory === category
                    ? `bg-gradient-to-r ${theme.accent} text-white shadow-lg`
                    : `${theme.cardBg} border ${theme.text} hover:scale-105`
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className={`text-center py-8 mb-8 ${theme.cardBg} border rounded-2xl`}>
              <p className={`text-lg ${theme.textSecondary}`}>
                {error}
              </p>
              <p className={`text-sm ${theme.textSecondary} mt-2`}>
                Showing demo products below
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className={`group ${theme.cardBg} border rounded-3xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-2xl relative overflow-hidden`}
              >
                {/* Docker-themed decoration */}
                <div className="absolute top-2 left-2 opacity-10">
                  <DockerWhale className="w-8 h-8 text-blue-500" />
                </div>

                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all"
                >
                  <Heart
                    className={`w-5 h-5 ${favorites.has(product.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                  />
                </button>

                {/* Sale Badge */}
                {product.originalPrice && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Docker Sale
                  </div>
                )}

                {/* Product Image Placeholder */}
                <div className="relative h-48 mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                  <div className="text-6xl opacity-50">🖊️</div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Product Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${theme.cardBg} ${theme.textSecondary}`}>
                      {product.brand}
                    </span>
                    {product.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className={`text-sm ${theme.textSecondary}`}>{product.rating}</span>
                        <span className={`text-xs ${theme.textSecondary}`}>({product.reviews || 0})</span>
                      </div>
                    )}
                  </div>

                  <h3 className={`text-xl font-bold ${theme.text} line-clamp-2`}>{product.name}</h3>
                  
                  <p className={`text-sm ${theme.textSecondary} line-clamp-2`}>{product.description}</p>

                  <div className="flex items-center space-x-2">
                    <span className={`text-2xl font-bold ${theme.text}`}>${product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                      <span className="text-lg text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className={`flex items-center space-x-2 text-sm ${product.in_stock ? 'text-green-600' : 'text-red-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${product.in_stock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>{product.in_stock ? 'In Stock' : 'Out of Stock'}</span>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    disabled={!product.in_stock}
                    className={`w-full py-3 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                      product.in_stock
                        ? `${theme.button} text-white hover:scale-105 active:scale-95 shadow-lg`
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>{product.in_stock ? 'Add to Cart' : 'Out of Stock'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <p className={`text-xl ${theme.textSecondary}`}>No pens found matching your criteria</p>
              <p className={`text-sm ${theme.textSecondary} mt-2`}>Try adjusting your search or category filter</p>
            </div>
          )}
        </div>
      </section>

      {/* Docker Info Section */}
      <section className={`py-16 ${theme.cardBg} border-t`}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <DockerWhale className="w-12 h-12 text-blue-600 mr-4" />
            <h3 className={`text-3xl font-bold ${theme.text}`}>Containerized Commerce</h3>
          </div>
          <p className={`text-lg ${theme.textSecondary} mb-8 max-w-2xl mx-auto`}>
            This Moby Pen Store is a demonstration of modern containerized e-commerce built with Docker. 
            Experience seamless scaling, reliable deployment, and consistent performance across all environments.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className={`w-16 h-16 ${theme.cardBg} rounded-2xl flex items-center justify-center mx-auto mb-4 border`}>
                <span className="text-2xl">🚀</span>
              </div>
              <h4 className={`font-bold ${theme.text} mb-2`}>Scalable</h4>
              <p className={`text-sm ${theme.textSecondary}`}>Horizontally scalable architecture</p>
            </div>
            <div className="text-center">
              <div className={`w-16 h-16 ${theme.cardBg} rounded-2xl flex items-center justify-center mx-auto mb-4 border`}>
                <span className="text-2xl">🛡️</span>
              </div>
              <h4 className={`font-bold ${theme.text} mb-2`}>Reliable</h4>
              <p className={`text-sm ${theme.textSecondary}`}>Container isolation and security</p>
            </div>
            <div className="text-center">
              <div className={`w-16 h-16 ${theme.cardBg} rounded-2xl flex items-center justify-center mx-auto mb-4 border`}>
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className={`font-bold ${theme.text} mb-2`}>Fast</h4>
              <p className={`text-sm ${theme.textSecondary}`}>Optimized container performance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`mt-20 ${theme.cardBg} border-t`}>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <DockerWhale className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className={`text-2xl font-bold bg-gradient-to-r ${theme.accent} bg-clip-text text-transparent`}>
                  Moby Pen Store
                </h3>
                <p className={`text-xs ${theme.textSecondary}`}>Powered by Docker</p>
              </div>
            </div>
            <p className={`${theme.textSecondary} mb-6`}>
              A Docker demonstration project showcasing modern e-commerce architecture
            </p>
            <div className="flex justify-center space-x-6 text-sm mb-4">
              <a href="#" className={`${theme.textSecondary} hover:text-blue-600 transition-colors`}>Docker Hub</a>
              <a href="#" className={`${theme.textSecondary} hover:text-blue-600 transition-colors`}>GitHub</a>
              <a href="#" className={`${theme.textSecondary} hover:text-blue-600 transition-colors`}>Documentation</a>
            </div>
            <p className={`text-xs ${theme.textSecondary}`}>
              © 2024 Moby Pen Store • Docker Demo Project • All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating AI Assistant with Docker theme */}
      <button
        onClick={openAIAssistant}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
      >
        <span className="text-2xl">🤖</span>
        <div className="absolute -top-12 right-0 bg-black text-white px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Docker AI Assistant
        </div>
      </button>
    </div>
  );
};

export default MobyPenStore;