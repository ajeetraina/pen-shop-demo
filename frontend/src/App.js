import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Star } from 'lucide-react';
import axios from 'axios';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const catalogueUrl = process.env.REACT_APP_CATALOGUE_URL || 'http://localhost:8081';
        const response = await axios.get(`${catalogueUrl}/catalogue`);
        
        // Transform API data to match our component structure
        const transformedProducts = response.data.map(pen => ({
          id: pen.id,
          name: pen.name,
          brand: pen.brand,
          type: pen.type,
          price: pen.price,
          description: pen.description,
          inStock: pen.in_stock,
          category: pen.type ? pen.type.toLowerCase() : 'general',
          rating: 4.0 + Math.random() * 1.0 // Generate random rating for demo
        }));
        
        setProducts(transformedProducts);
      } catch (err) {
        setError('Unable to load pen catalogue. Using demo data for display.');
        console.error('Catalogue error:', err);
        
        // Fallback demo data matching the original structure
        setProducts([
          {
            id: 1,
            name: "Bailey Light Blue Lacquer",
            brand: "Cross",
            type: "Gel",
            price: 55.00,
            description: "Vibrant gel pen with premium lacquer finish",
            inStock: false,
            category: "gel",
            rating: 4.2
          },
          {
            id: 2,
            name: "Century Classic Lustrous Chrome",
            brand: "Cross",
            type: "Ballpoint",
            price: 75.00,
            description: "Timeless ballpoint pen with lustrous chrome finish",
            inStock: true,
            category: "ballpoint",
            rating: 4.5
          },
          {
            id: 3,
            name: "Meisterstück 149",
            brand: "Montblanc",
            type: "Fountain",
            price: 895.00,
            description: "The ultimate luxury fountain pen with 14K gold nib",
            inStock: true,
            category: "fountain",
            rating: 4.9
          },
          {
            id: 4,
            name: "Pix Blue Edition",
            brand: "Montblanc",
            type: "Ballpoint",
            price: 285.00,
            description: "Innovative ballpoint with magnetic cap and premium blue lacquer",
            inStock: true,
            category: "ballpoint",
            rating: 4.7
          },
          {
            id: 5,
            name: "StarWalker Black Mystery",
            brand: "Montblanc",
            type: "Rollerball",
            price: 520.00,
            description: "Luxury rollerball pen with precious resin barrel and platinum-coated fittings",
            inStock: true,
            category: "rollerball",
            rating: 4.8
          },
          {
            id: 6,
            name: "Jotter Premium Stainless Steel",
            brand: "Parker",
            type: "Ballpoint",
            price: 45.99,
            description: "Classic stainless steel ballpoint pen with premium blue ink refill",
            inStock: true,
            category: "ballpoint",
            rating: 4.3
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const brands = [...new Set(products.map(p => p.brand))];
  const categories = [...new Set(products.map(p => p.category))];

  const getBrandColor = (brand) => {
    const colors = {
      'Cross': 'bg-gradient-to-br from-blue-500 to-blue-600',
      'Montblanc': 'bg-gradient-to-br from-blue-600 to-blue-800',
      'Parker': 'bg-gradient-to-br from-cyan-500 to-blue-500',
      'Pilot': 'bg-gradient-to-br from-blue-400 to-cyan-500',
      'Waterman': 'bg-gradient-to-br from-indigo-500 to-blue-600'
    };
    return colors[brand] || 'bg-gradient-to-br from-blue-500 to-blue-600';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'Fountain': '🖋️',
      'Ballpoint': '🖊️',
      'Rollerball': '✒️',
      'Gel': '🖍️'
    };
    return icons[type] || '✏️';
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesBrand = selectedBrand === 'all' || product.brand === selectedBrand;
    
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const openAIAssistant = () => {
    // Navigate to AI assistant in the same window
    window.location.href = 'http://localhost:3000';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🐳</div>
          <h1 className="text-2xl text-blue-800 font-semibold">Loading Moby Pen Shop...</h1>
          <p className="text-blue-600 mt-2">Fetching our premium collection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-4xl">🐳</div>
              <div>
                <h1 className="text-3xl font-bold text-white">Moby Pen Shop</h1>
                <p className="text-white/80 text-sm">Premium Writing Instruments</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors">
                <ShoppingCart size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Error Notice */}
        {error && (
          <div className="bg-blue-100 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg mb-6">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search pens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Brands</option>
            {brands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
              {/* Brand Color Header */}
              <div className={`h-8 ${getBrandColor(product.brand)} flex items-center justify-center relative`}>
                <div className="text-lg">{getTypeIcon(product.type)}</div>
                <div className="absolute top-1 right-1 text-white text-xs font-medium bg-black/20 px-1.5 py-0.5 rounded text-[10px]">
                  {product.brand}
                </div>
              </div>

              {/* Product Content */}
              <div className="p-3">
                <div className="mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-0.5 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 text-xs">
                    {product.type}
                  </p>
                </div>

                <p className="text-gray-600 text-xs mb-2 leading-relaxed line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mb-2">
                  <div className="text-lg font-bold text-green-600">
                    ${product.price.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Star className="text-yellow-400 fill-current" size={12} />
                    <span className="text-xs text-gray-500">{product.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Stock Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    product.inStock 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      product.inStock ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </div>

                  <button 
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      product.inStock
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!product.inStock}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Results Info */}
        <div className="mt-8 text-center text-gray-600">
          <p>Showing {filteredProducts.length} of {products.length} premium writing instruments</p>
        </div>

        {/* AI Assistant Button - Opens in Same Window */}
        <button 
          onClick={openAIAssistant}
          className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
          title="Chat with AI Pen Expert - Opens in same window"
        >
          💬 AI Pen Expert
        </button>
      </div>
    </div>
  );
};

export default App;