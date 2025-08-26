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
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin mx-auto" style={{animationDelay: '150ms'}}></div>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <DockerLogo className="w-8 h-8 text-blue-600" />
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
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <DockerLogo className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold bg-gradient-to-r ${theme.accent} bg-clip-text text-transparent`}>
                  Moby Pen Store
                </h1>
                <p className={`text-xs ${theme.textSecondary}`}>Premium Writing Instruments</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className={`${theme.text} hover:text-blue-600 transition-colors font-medium text-sm`}>Collection</a>
              <a href="#" className={`${theme.text} hover:text-blue-600 transition-colors font-medium text-sm`}>Brands</a>
              <a href="#" className={`${theme.text} hover:text-blue-600 transition-colors font-medium text-sm`}>New Arrivals</a>
              <a href="#" className={`${theme.text} hover:text-blue-600 transition-colors font-medium text-sm`}>About</a>
            </nav>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-xl ${theme.cardBg} border hover:scale-105 transition-all duration-200`}
              >
                {darkMode ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-blue-600" />}
              </button>
              
              <button className={`p-2 rounded-xl ${theme.cardBg} border hover:scale-105 transition-all duration-200 relative`}>
                <ShoppingCart className={`w-4 h-4 ${theme.text}`} />
                {favorites.size > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center text-[10px]">
                    {favorites.size}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 rounded-xl ${theme.cardBg} border`}
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden ${theme.cardBg} border-b shadow-lg`}>
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            <a href="#" className={`block py-2 ${theme.text} hover:text-blue-600 text-sm`}>Collection</a>
            <a href="#" className={`block py-2 ${theme.text} hover:text-blue-600 text-sm`}>Brands</a>
            <a href="#" className={`block py-2 ${theme.text} hover:text-blue-600 text-sm`}>New Arrivals</a>
            <a href="#" className={`block py-2 ${theme.text} hover:text-blue-600 text-sm`}>About</a>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="mb-6">
              <h2 className={`text-4xl md:text-5xl font-bold ${theme.text} leading-tight mb-2`}>
                Welcome to Moby Pen Store
              </h2>
              <p className={`text-sm ${theme.textSecondary}`}>Curated by Docker</p>
            </div>
            
            <p className={`text-lg md:text-xl ${theme.textSecondary} mb-4 max-w-2xl mx-auto`}>
              Discover premium writing instruments crafted for excellence
            </p>
            <p className={`text-sm ${theme.textSecondary} mb-8 opacity-80`}>
              ✒️ Luxury Pens • Professional Tools • Everyday Essentials
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search pens, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-2xl ${theme.cardBg} border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
            />
          </div>

          {/* Category Filter */}
          <div className="flex justify-center flex-wrap gap-2 mb-8">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full transition-all capitalize font-medium text-sm ${
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
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className={`text-center py-6 mb-6 ${theme.cardBg} border rounded-2xl`}>
              <p className={`text-sm ${theme.textSecondary}`}>
                {error}
              </p>
              <p className={`text-xs ${theme.textSecondary} mt-1`}>
                Showing demo products below
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className={`group ${theme.cardBg} border rounded-2xl p-5 hover:scale-105 transition-all duration-300 hover:shadow-2xl relative overflow-hidden`}
              >
                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all"
                >
                  <Heart
                    className={`w-4 h-4 ${favorites.has(product.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                  />
                </button>

                {/* Sale Badge */}
                {product.originalPrice && (
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Sale
                  </div>
                )}

                {/* Product Image */}
                <div className="relative h-48 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  <img
                    src={product.image || "https://images.unsplash.com/photo-1565106430482-8f6e74349ca1?w=400&h=400&fit=crop&q=80"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Product Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${theme.cardBg} ${theme.textSecondary}`}>
                      {product.brand}
                    </span>
                    {product.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className={`text-xs ${theme.textSecondary}`}>{product.rating}</span>
                        <span className={`text-xs ${theme.textSecondary}`}>({product.reviews || 0})</span>
                      </div>
                    )}
                  </div>

                  <h3 className={`text-lg font-bold ${theme.text} line-clamp-2`}>{product.name}</h3>
                  <p className={`text-xs ${theme.textSecondary}`}>{product.type}</p>
                  
                  <p className={`text-xs ${theme.textSecondary} line-clamp-2`}>{product.description}</p>

                  <div className="flex items-center space-x-2">
                    <span className={`text-xl font-bold ${theme.text}`}>${product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className={`flex items-center space-x-1 text-xs ${product.in_stock ? 'text-green-600' : 'text-red-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${product.in_stock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>{product.in_stock ? 'In Stock' : 'Out of Stock'}</span>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    disabled={!product.in_stock}
                    className={`w-full py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 text-sm ${
                      product.in_stock
                        ? `${theme.button} text-white hover:scale-105 active:scale-95 shadow-lg`
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{product.in_stock ? 'Add to Cart' : 'Out of Stock'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className={`text-lg ${theme.textSecondary}`}>No pens found matching your criteria</p>
              <p className={`text-sm ${theme.textSecondary} mt-2`}>Try adjusting your search or category filter</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className={`mt-16 ${theme.cardBg} border-t`}>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
                  <DockerLogo className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg font-bold bg-gradient-to-r ${theme.accent} bg-clip-text text-transparent`}>
                    Moby Pen Store
                  </h3>
                  <p className={`text-xs ${theme.textSecondary}`}>Premium Writing Instruments</p>
                </div>
              </div>
              <p className={`text-sm ${theme.textSecondary} mb-4 max-w-md`}>
                Discover the finest collection of writing instruments from renowned brands worldwide. 
                Quality craftsmanship meets modern technology.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className={`font-bold ${theme.text} mb-3 text-sm`}>Quick Links</h4>
              <div className="space-y-2">
                <a href="#" className={`block text-xs ${theme.textSecondary} hover:text-blue-600 transition-colors`}>Our Collection</a>
                <a href="#" className={`block text-xs ${theme.textSecondary} hover:text-blue-600 transition-colors`}>Brand Partners</a>
                <a href="#" className={`block text-xs ${theme.textSecondary} hover:text-blue-600 transition-colors`}>Gift Cards</a>
                <a href="#" className={`block text-xs ${theme.textSecondary} hover:text-blue-600 transition-colors`}>Care Guide</a>
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className={`font-bold ${theme.text} mb-3 text-sm`}>Support</h4>
              <div className="space-y-2">
                <a href="#" className={`block text-xs ${theme.textSecondary} hover:text-blue-600 transition-colors`}>Contact Us</a>
                <a href="#" className={`block text-xs ${theme.textSecondary} hover:text-blue-600 transition-colors`}>Shipping Info</a>
                <a href="#" className={`block text-xs ${theme.textSecondary} hover:text-blue-600 transition-colors`}>Returns</a>
                <a href="#" className={`block text-xs ${theme.textSecondary} hover:text-blue-600 transition-colors`}>FAQ</a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8 text-center">
            <p className={`text-xs ${theme.textSecondary}`}>
              © 2024 Moby Pen Store • Powered by Docker • All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating AI Assistant */}
      <button
        onClick={openAIAssistant}
        className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
      >
        <span className="text-lg">💬</span>
        <div className="absolute -top-10 right-0 bg-black text-white px-2 py-1 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Pen Expert Chat
        </div>
      </button>
    </div>
  );
};

export default MobyPenStore;