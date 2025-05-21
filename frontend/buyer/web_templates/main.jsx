import React, { useState, useEffect } from 'react';

const App = () => {
  // State for the shopping cart
  const [cartCount, setCartCount] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState('standard');
  const [quantity, setQuantity] = useState(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('features');
  
  // Handle scroll for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Mock product data
  const product = {
    name: "Premium Wooden Pallets",
    description: "High-quality wooden pallets crafted for durability and reliability in logistics and storage solutions.",
    price: 49.99,
    variants: {
      standard: {
        name: "Standard Pallet",
        price: 49.99,
        dimensions: "1200x800mm",
        weight: "25kg",
        capacity: "1500kg",
        features: [
          "FSC-certified wood",
          "Heat-treated for durability",
          "Standard ISO dimensions",
          "Reinforced corner blocks"
        ]
      },
      heavy: {
        name: "Heavy-Duty Pallet",
        price: 79.99,
        dimensions: "1200x1000mm",
        weight: "35kg",
        capacity: "3000kg",
        features: [
          "FSC-certified hardwood",
          "Double-deck construction",
          "IPPC treated for export",
          "Triple stringer design",
          "Non-slip surface"
        ]
      }
    },
    images: {
      standard: "https://picsum.photos/id/1082/800/600 ",
      heavy: "https://picsum.photos/id/1083/800/600 "
    }
  };

  // Cart functionality
  const addToCart = () => {
    setCartCount(prevCount => prevCount + quantity);
    setIsCartOpen(true);
    
    // Auto-close cart after 3 seconds
    setTimeout(() => {
      setIsCartOpen(false);
    }, 3000);
  };

  // Handle variant selection
  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
  };

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  // Handle menu toggle
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className={`bg-white shadow-md sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'py-2 shadow-lg' : 'py-4'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-amber-800">WoodPac</h1>
            <span className="ml-2 text-xs bg-amber-600 text-white px-2 py-1 rounded-full text-xs">PRO</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-600 hover:text-amber-800 transition duration-300 relative group">
              <span className="relative">Home</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-800 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#" className="text-gray-600 hover:text-amber-800 transition duration-300 relative group">
              <span className="relative">Products</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-800 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#" className="text-gray-600 hover:text-amber-800 transition duration-300 relative group">
              <span className="relative">Industries</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-800 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#" className="text-gray-600 hover:text-amber-800 transition duration-300 relative group">
              <span className="relative">About Us</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-800 group-hover:w-full transition-all duration-300"></span>
            </a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <button className="relative">
              <svg className="w-6 h-6 text-gray-600 hover:text-amber-800 transition duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.6 8h15.2l-2.6-8M7 13h10" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden text-gray-600 hover:text-amber-800 transition duration-300"
              onClick={toggleMenu}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4 px-4 animate-fadeIn">
            <nav className="flex flex-col space-y-4">
              <a href="#" className="text-gray-600 hover:text-amber-800 transition duration-300">Home</a>
              <a href="#" className="text-gray-600 hover:text-amber-800 transition duration-300">Products</a>
              <a href="#" className="text-gray-600 hover:text-amber-800 transition duration-300">Industries</a>
              <a href="#" className="text-gray-600 hover:text-amber-800 transition duration-300">About Us</a>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-yellow-100">
          <div className="absolute inset-0 opacity-20">
            <img src="https://picsum.photos/id/1084/1920/1080 " alt="Wood Texture" className="w-full h-full object-cover" />
          </div>
          <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="transform transition-all duration-1000 hover:scale-105">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                  Premium <span className="text-amber-800">Wooden</span> Pallets
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  High-quality wooden pallets crafted for durability and reliability in logistics and storage solutions. Perfect for shipping, warehouse storage, and industrial applications.
                </p>
                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-1 hover:bg-amber-50">
                    <div className="font-bold text-xl text-amber-800">FSC</div>
                    <div className="text-sm text-gray-600">Certified Wood</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-1 hover:bg-amber-50">
                    <div className="font-bold text-xl text-amber-800">3000kg</div>
                    <div className="text-sm text-gray-600">Max Load</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-1 hover:bg-amber-50">
                    <div className="font-bold text-xl text-amber-800">IPPC</div>
                    <div className="text-sm text-gray-600">Export Ready</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <button className="px-6 py-3 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1">
                    Shop Now
                  </button>
                  <button className="px-6 py-3 border border-amber-800 text-amber-800 rounded-lg hover:bg-amber-50 transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1">
                    View Features
                  </button>
                </div>
              </div>
              <div className="relative">
                <div className="relative transform transition-all duration-1000 hover:rotate-2">
                  <img 
                    src={product.images[selectedVariant]} 
                    alt={product.name} 
                    className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                  />
                  <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-110">
                    <div className="text-xl font-bold text-amber-800">${product.variants[selectedVariant].price}</div>
                    <div className="text-xs text-gray-500">per unit</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 hidden md:block">
            <div className="w-64 h-64 bg-amber-200 rounded-full opacity-30 blur-2xl"></div>
          </div>
          <div className="absolute bottom-0 left-0 hidden md:block">
            <div className="w-64 h-64 bg-yellow-200 rounded-full opacity-30 blur-2xl"></div>
          </div>
        </section>

        {/* Industries Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Industry Leaders</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">Our pallets serve a wide range of industries with reliable and efficient logistics solutions.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition duration-300 transform hover:-translate-y-1 hover:bg-amber-50">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-amber-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3.27 6.96L12 12.01l8.73-5.05M12 12.01v8.02" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-2">Logistics</h4>
                <p className="text-gray-600">
                  Reliable transport solutions for global shipping networks.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition duration-300 transform hover:-translate-y-1 hover:bg-amber-50">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-amber-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.879c0 .754-.612 1.365-1.365 1.365H3.365C2.612 18.244 2 17.632 2 16.879V7.12c0-.754.612-1.365 1.365-1.365h17.27c.753 0 1.365.611 1.365 1.365v9.759z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 12h20M14 16V8M10 16V8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-2">Manufacturing</h4>
                <p className="text-gray-600">
                  Efficient storage and transportation for production facilities.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition duration-300 transform hover:-translate-y-1 hover:bg-amber-50">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-amber-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2.5 12a9.5 9.5 0 1119 0 9.5 9.5 0 01-19 0z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-2">Retail</h4>
                <p className="text-gray-600">
                  Perfect for product distribution and store replenishment.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition duration-300 transform hover:-translate-y-1 hover:bg-amber-50">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-amber-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-2">E-commerce</h4>
                <p className="text-gray-600">
                  Scalable solutions for fast-growing online businesses.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-amber-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Pallets?</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">Engineered for strength, efficiency, and sustainability.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-amber-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-3">Durability</h4>
                <p className="text-gray-600">
                  Constructed from premium hardwood with reinforced joints for maximum strength.
                </p>
                <div className="mt-4 flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-amber-600 h-2 rounded-full w-5/6"></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">95%</span>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-amber-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-3">Sustainability</h4>
                <p className="text-gray-600">
                  Made from FSC-certified wood and fully recyclable materials.
                </p>
                <div className="mt-4 flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-amber-600 h-2 rounded-full w-11/12"></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">98%</span>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-amber-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-3">Reliability</h4>
                <p className="text-gray-600">
                  Rigorous quality control ensures consistent performance in all conditions.
                </p>
                <div className="mt-4 flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-amber-600 h-2 rounded-full w-full"></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">100%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Configurator */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Customize Your Pallets</h3>
                
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="md:w-1/2">
                    <div className="mb-6">
                      <label className="block text-gray-700 font-medium mb-2">Select Type</label>
                      <div className="space-y-3">
                        <div 
                          className={`p-4 border rounded-lg cursor-pointer transition duration-300 ${selectedVariant === 'standard' ? 'border-amber-600 bg-amber-50' : 'border-gray-200 hover:border-amber-300'}`}
                          onClick={() => handleVariantChange('standard')}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Standard Pallet</span>
                            <span className="text-amber-600 font-semibold">${product.variants.standard.price}</span>
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            {product.variants.standard.dimensions} | {product.variants.standard.capacity}
                          </div>
                        </div>
                        <div 
                          className={`p-4 border rounded-lg cursor-pointer transition duration-300 ${selectedVariant === 'heavy' ? 'border-amber-600 bg-amber-50' : 'border-gray-200 hover:border-amber-300'}`}
                          onClick={() => handleVariantChange('heavy')}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Heavy-Duty Pallet</span>
                            <span className="text-amber-600 font-semibold">${product.variants.heavy.price}</span>
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            {product.variants.heavy.dimensions} | {product.variants.heavy.capacity}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-gray-700 font-medium mb-2">Quantity</label>
                      <div className="flex items-center">
                        <button 
                          className="w-10 h-10 border border-gray-300 rounded-l-lg flex items-center justify-center hover:bg-gray-100 transition duration-300"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 12H4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <input 
                          type="number" 
                          className="w-16 h-10 border-t border-b border-gray-300 text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
                          value={quantity}
                          onChange={handleQuantityChange}
                        />
                        <button 
                          className="w-10 h-10 border border-gray-300 rounded-r-lg flex items-center justify-center hover:bg-gray-100 transition duration-300"
                          onClick={() => setQuantity(quantity + 1)}
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:w-1/2">
                    <div className="mb-6">
                      <label className="block text-gray-700 font-medium mb-2">Features</label>
                      <ul className="space-y-2">
                        {product.variants[selectedVariant].features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <svg className="w-5 h-5 text-green-500 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-8">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-700 font-medium">Total:</span>
                        <span className="text-2xl font-bold text-amber-600">
                          ${(product.variants[selectedVariant].price * quantity).toFixed(2)}
                        </span>
                      </div>
                      <button 
                        className="w-full py-3 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                        onClick={addToCart}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-amber-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">What Our Clients Say</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">Join thousands of satisfied customers who trust our pallets for their logistics needs.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl hover:shadow-lg transition duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-800 font-medium">JD</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold">John Doe</h4>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">"</p>
                <p className="text-gray-600">
                  "These pallets have revolutionized our logistics operations. The durability and consistency are unmatched. We've reduced damages and improved efficiency significantly."
                </p>
                <p className="text-gray-600 mt-2">Operations Manager at Logistics Co.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl hover:shadow-lg transition duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-800 font-medium">JS</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold">Jane Smith</h4>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">"</p>
                <p className="text-gray-600">
                  "As an e-commerce business owner, I was struggling with damaged goods during transit. WoodPac's pallets solved all our issues. The quality is exceptional and the pricing is competitive."
                </p>
                <p className="text-gray-600 mt-2">CEO at Online Retail Solutions</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl hover:shadow-lg transition duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-800 font-medium">AM</span>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-semibold">Alex Morgan</h4>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">"</p>
                <p className="text-gray-600">
                  "The customer service team at WoodPac was fantastic in helping us find the perfect pallet solution for our warehouse. The delivery was prompt and the quality exceeded our expectations."
                </p>
                <p className="text-gray-600 mt-2">Warehouse Supervisor at Manufacturing Inc.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h3>
            
            <div className="max-w-3xl mx-auto space-y-4">
              {[
                {
                  question: "Are your pallets suitable for international shipping?",
                  answer: "Yes, our heavy-duty pallets are IPPC ISPM-15 certified for international shipping and meet all phytosanitary requirements."
                },
                {
                  question: "What types of wood do you use?",
                  answer: "We use FSC-certified hardwoods like oak and maple for durability, and softwoods like pine for lighter applications."
                },
                {
                  question: "Can I get custom-sized pallets?",
                  answer: "Yes, we offer custom manufacturing to meet specific size and load requirements for our clients."
                },
                {
                  question: "Do you provide bulk discounts?",
                  answer: "Yes, we offer competitive pricing for bulk orders with volume discounts starting at 50 units."
                },
                {
                  question: "What is your delivery time?",
                  answer: "Standard orders ship within 2-3 business days. Custom orders typically take 5-7 business days to produce and deliver."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-gray-50 rounded-lg shadow-md overflow-hidden">
                  <details className="group">
                    <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                      <h4 className="font-semibold text-lg">{faq.question}</h4>
                      <svg className="w-5 h-5 transition-transform duration-300 group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </summary>
                    <div className="p-6 pt-0 text-gray-600">
                      {faq.answer}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-amber-800">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">Ready to Optimize Your Logistics?</h3>
            <p className="text-amber-100 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses that trust WoodPac for reliable, sustainable pallet solutions. Get a free consultation today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="px-8 py-3 bg-white text-amber-800 rounded-lg font-medium hover:bg-amber-50 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Get a Quote
              </button>
              <button className="px-8 py-3 border border-white text-white rounded-lg font-medium hover:bg-amber-700 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Contact Sales
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold text-white mb-4">WoodPac</h4>
              <p className="mb-4">
                Delivering premium wooden pallet solutions with sustainability and reliability at the core of everything we do.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-white transition duration-300">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="hover:text-white transition duration-300">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.645.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.06 2.051.291.292 2.057.061 7.053.014 8.333 0 8.741 0 12c0 3.259.014 3.668.061 4.948.23.999.992 2.616 2.339 3.962C3.982 22.011 5.587 22.774 7.05 23c1.281.047 1.69.061 4.951.061 3.259 0 3.669-.014 4.949-.061 4.985-.231 6.73-1.99 6.962-6.963.047-1.28.061-1.689.061-4.948 0-3.259-.014-3.668-.061-4.948-.231-4.985-1.992-6.73-6.963-6.962C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm7.846-10.405a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
                <a href="#" className="hover:text-white transition duration-300">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-white mb-4">Products</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition duration-300">Standard Pallets</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Heavy-Duty Pallets</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Custom Solutions</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Accessories</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition duration-300">About Us</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Careers</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Press</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition duration-300">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Shipping</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Returns</a></li>
                <li><a href="#" className="hover:text-white transition duration-300">Warranty</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-gray-400">
            <p>&copy; 2023 WoodPac. All rights reserved.</p>
            <div className="mt-2 flex space-x-4">
              <a href="#" className="hover:text-white transition duration-300">Privacy Policy</a>
              <a href="#" className="hover:text-white transition duration-300">Terms of Service</a>
              <a href="#" className="hover:text-white transition duration-300">Cookie Settings</a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md h-full shadow-xl transform transition-transform duration-300 ease-in-out animate-slideInRight">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Shopping Cart</h3>
                <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              
              {cartCount > 0 ? (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <img src={product.images[selectedVariant]} alt={product.name} className="w-16 h-16 object-cover rounded" />
                      <div className="ml-4 flex-grow">
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-gray-600">Qty: {quantity}</p>
                      </div>
                      <div className="text-gray-900 font-medium">
                        ${(product.variants[selectedVariant].price * quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-700">Subtotal</span>
                      <span className="text-gray-900 font-medium">
                        ${(product.variants[selectedVariant].price * quantity).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-gray-700">Shipping</span>
                      <span className="text-gray-900 font-medium">Free</span>
                    </div>
                    <div className="flex justify-between items-center mb-8">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-xl font-bold text-amber-600">
                        ${(product.variants[selectedVariant].price * quantity).toFixed(2)}
                      </span>
                    </div>
                    <button className="w-full py-3 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition duration-300 shadow-md">
                      Checkout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.6 8h15.2l-2.6-8M7 13h10" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-gray-600 mb-6">Your cart is empty</p>
                  <button 
                    className="px-6 py-2 bg-amber-800 text-white rounded-lg hover:bg-amber-900 transition duration-300"
                    onClick={() => setIsCartOpen(false)}
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Global Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-in-out;
        }
        
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default App;