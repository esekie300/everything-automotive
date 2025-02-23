import React from 'react';
import { Menu, X, Phone, Car, PenTool as Tools, ShoppingBag, MessageSquare, ChevronLeft, ChevronRight, X as Close, Search, Star, TrendingUp, Tag, Award } from 'lucide-react';

// Cart type definitions
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface VehiclePart {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  certification: string;
  images: string[];
  awards: string[];
  specifications: {
    material: string;
    compatibility: string[];
    warranty: string;
  };
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [currentImageIndexes, setCurrentImageIndexes] = React.useState<{ [key: string]: number }>({});
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [showNotification, setShowNotification] = React.useState(false);
  const [lastAddedItem, setLastAddedItem] = React.useState<CartItem | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  // Categories data
  const categories = [
    { id: 1, name: "Engine Parts", icon: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80", count: 1250 },
    { id: 2, name: "Brake System", icon: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80", count: 840 },
    { id: 3, name: "Suspension", icon: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&q=80", count: 635 },
    { id: 4, name: "Electrical", icon: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80", count: 920 }
  ];

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: "John Doe",
      role: "Car Enthusiast",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80",
      content: "Found exactly what I needed for my Toyota Camry. The quality of parts and service is exceptional!",
      rating: 5
    },
    {
      id: 2,
      name: "Sarah Johnson",
      role: "Professional Mechanic",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80",
      content: "As a mechanic, I rely on quality parts. This store never disappoints with their authentic products.",
      rating: 5
    },
    {
      id: 3,
      name: "Michael Smith",
      role: "Car Collector",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80",
      content: "The range of premium parts available here is impressive. Great for both vintage and modern cars.",
      rating: 4
    }
  ];

  // Special offers data
  const specialOffers = [
    {
      id: 1,
      title: "Summer Sale",
      discount: "25% OFF",
      description: "On all brake systems",
      endDate: "Limited time offer",
      image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80"
    },
    {
      id: 2,
      title: "Bundle Deal",
      discount: "Save ₦50,000",
      description: "Engine maintenance kit",
      endDate: "While stocks last",
      image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80"
    }
  ];

  // Vehicle parts data
  const vehicleParts: VehiclePart[] = [
    {
      id: "1",
      name: "Toyota Camry 2.4L Engine Control Module",
      price: 185000,
      description: "Premium Engine Control Module (ECM) specifically designed for Toyota Camry 2.4L engines. This OEM-grade module ensures optimal engine performance, fuel efficiency, and reliability.",
      features: [
        "Direct OEM replacement",
        "Pre-programmed for plug-and-play installation",
        "Advanced diagnostic capabilities",
        "Enhanced fuel management system",
        "Improved throttle response"
      ],
      certification: "ISO 9001:2015 Certified",
      images: [
        "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&q=80"
      ],
      awards: [
        "2023 Best Aftermarket Part - AutoParts Nigeria",
        "Quality Excellence Award - Lagos Auto Show"
      ],
      specifications: {
        material: "High-grade automotive plastic with aluminum housing",
        compatibility: ["Toyota Camry 2002-2006", "Toyota Solara 2004-2008"],
        warranty: "2 Years Limited Warranty"
      }
    },
    {
      id: "2",
      name: "Honda Accord Brake Pad Set",
      price: 45000,
      description: "High-performance ceramic brake pad set engineered specifically for Honda Accord models. Delivers superior stopping power with minimal noise and dust.",
      features: [
        "Advanced ceramic compound",
        "Low dust formulation",
        "Noise reduction shims included",
        "Extended pad life",
        "Superior heat dissipation"
      ],
      certification: "TÜV Certified",
      images: [
        "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80"
      ],
      awards: [
        "Best Safety Product 2023 - Nigeria Auto Parts Association",
        "Consumer Choice Award - Auto Care Excellence"
      ],
      specifications: {
        material: "Advanced Ceramic Compound",
        compatibility: ["Honda Accord 2018-2023", "Honda CR-V 2017-2023"],
        warranty: "3 Years Limited Warranty"
      }
    },
    {
      id: "3",
      name: "Lexus RX350 Air Filter System",
      price: 28000,
      description: "Premium air filtration system designed for Lexus RX350, providing superior engine protection and optimal airflow performance.",
      features: [
        "Advanced filtration media",
        "Increased airflow efficiency",
        "Enhanced engine protection",
        "Easy installation design",
        "Washable and reusable"
      ],
      certification: "SAE J726 Certified",
      images: [
        "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80"
      ],
      awards: [
        "Environmental Choice Award 2023",
        "Innovation in Filtration - Auto Parts Expo Lagos"
      ],
      specifications: {
        material: "Multi-layer synthetic filter media",
        compatibility: ["Lexus RX350 2016-2023", "Toyota Highlander 2017-2023"],
        warranty: "Lifetime Limited Warranty"
      }
    }
  ];

  const nextImage = (partId: string) => {
    setCurrentImageIndexes(prev => ({
      ...prev,
      [partId]: ((prev[partId] || 0) + 1) % vehicleParts.find(p => p.id === partId)!.images.length
    }));
  };

  const prevImage = (partId: string) => {
    setCurrentImageIndexes(prev => ({
      ...prev,
      [partId]: ((prev[partId] || 0) - 1 + vehicleParts.find(p => p.id === partId)!.images.length) % vehicleParts.find(p => p.id === partId)!.images.length
    }));
  };

  const addToCart = (part: VehiclePart) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === part.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === part.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { id: part.id, name: part.name, price: part.price, quantity: 1, image: part.images[0] }];
    });
    
    setLastAddedItem({
      id: part.id,
      name: part.name,
      price: part.price,
      quantity: 1,
      image: part.images[0]
    });
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/95 backdrop-blur-sm z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl text-gray-900">EVERYTHING-AUTOMOTIVE</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-blue-600 transition">Home</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition">Services</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition">Parts Store</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition">Buy/Sell Cars</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition">About</a>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                Login
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600 transition"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-4 pt-3 pb-6 space-y-3 bg-white shadow-lg">
              <a href="#" className="block px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition">Home</a>
              <a href="#" className="block px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition">Services</a>
              <a href="#" className="block px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition">Parts Store</a>
              <a href="#" className="block px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition">Buy/Sell Cars</a>
              <a href="#" className="block px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition">About</a>
              <button className="w-full mt-4 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition shadow-md">
                Login
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative pt-16">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80"
            alt="Luxury car background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/10 to-black/20"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-40">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-md">
              Your Complete Automotive Solution
            </h1>
            <p className="text-xl text-white mb-24 max-w-3xl mx-auto drop-shadow">
              From buying and selling cars to maintenance and repairs - we've got everything you need under one roof.
            </p>

            {/* CTA Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <button className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition group shadow-lg">
                <Tools className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                <span>Book a Service</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-white text-gray-900 px-6 py-4 rounded-lg hover:bg-gray-100 transition group shadow-lg">
                <ShoppingBag className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Find Parts</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-white text-gray-900 px-6 py-4 rounded-lg hover:bg-gray-100 transition group shadow-lg">
                <Car className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                <span>Buy/Sell Cars</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition group shadow-lg">
                <Phone className="h-5 w-5 group-hover:-rotate-12 transition-transform" />
                <span>Free Manager Call</span>
              </button>
            </div>
          </div>
        </div>

        {/* Chat Widget Button */}
        <button className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50 group">
          <MessageSquare className="h-6 w-6 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Quick Search Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <div className="bg-white px-4">
                <h2 className="text-3xl font-bold text-gray-900">Quick Search</h2>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="w-full max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-3 pl-12 pr-10 text-sm bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Search for parts by name, category, or vehicle model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories and Parts Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Browse by Category</h2>
          
          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`relative group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                  selectedCategory === category.name ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="absolute inset-0">
                  <img
                    src={category.icon}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
                </div>
                <div className="relative p-6 flex flex-col h-full justify-end">
                  <h3 className="text-xl font-semibold text-white mb-2">{category.name}</h3>
                  <p className="text-white/80">{category.count} products</p>
                </div>
                <div className="absolute top-0 right-0 m-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
              </button>
            ))}
          </div>

          {/* Featured Parts */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {selectedCategory ? `Popular ${selectedCategory}` : 'Featured Parts'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {vehicleParts.map(part => (
                <div key={part.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
                  {/* Image Carousel */}
                  <div className="relative h-64">
                    <img
                      src={part.images[currentImageIndexes[part.id] || 0]}
                      alt={part.name}
                      className="w-full h-full object-cover"
                    />
                    {part.images.length > 1 && (
                      <>
                        <button
                          onClick={() => prevImage(part.id)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => nextImage(part.id)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{part.name}</h3>
                    <p className="text-2xl font-bold text-blue-600 mb-4">₦{part.price.toLocaleString()}</p>
                    
                    <p className="text-gray-600 mb-4">{part.description}</p>
                    
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Key Features:</h4>
                      <ul className="list-disc list-inside text-gray-600">
                        {part.features.slice(0, 3).map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Specifications:</h4>
                      <p className="text-gray-600">
                        <strong>Compatibility:</strong> {part.specifications.compatibility[0]}
                      </p>
                      <p className="text-gray-600">
                        <strong>Warranty:</strong> {part.specifications.warranty}
                      </p>
                    </div>

                    {/* This div will push the certification and button to the bottom */}
                    <div className="mt-auto">
                      <div className="flex items-center justify-between space-x-4">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm whitespace-nowrap">
                          {part.certification}
                        </span>
                        <button
                          onClick={() => addToCart(part)}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2 whitespace-nowrap"
                        >
                          <ShoppingBag className="h-5 w-5" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Special Offers Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Special Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {specialOffers.map((offer) => (
              <div
                key={offer.id}
                className="relative overflow-hidden rounded-xl shadow-lg group"
              >
                <div className="absolute inset-0">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-blue-900/90" />
                </div>
                <div className="relative p-8">
                  <div className="flex items-center space-x-2 mb-4">
                    <Tag className="h-6 w-6 text-white" />
                    <span className="text-white font-medium">{offer.title}</span>
                  </div>
                  <h3 className="text-4xl font-bold text-white mb-2">{offer.discount}</h3>
                  <p className="text-white/90 text-lg mb-4">{offer.description}</p>
                  <p className="text-white/70">{offer.endDate}</p>
                  <button className="mt-6 bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition">
                    Shop Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers about their experience with our automotive parts and service.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill={i < testimonial.rating ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <p className="text-gray-600">{testimonial.content}</p>
                <div className="mt-6 flex items-center space-x-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">Verified Purchase</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cart Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <Close className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center">Your cart is empty</p>
            ) : (
              <div className="space-y-6">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                      <p className="text- sm text-gray-500">₦{item.price.toLocaleString()}</p>
                      <div className="flex items-center mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          -
                        </button>
                        <span className="mx-2 text-gray-700">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Close className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 border-t">
            <div className="flex justify-between text-lg font-semibold mb-4">
              <span>Total:</span>
              <span>₦{totalAmount.toLocaleString()}</span>
            </div>
            <button
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
              onClick={() => alert('Proceeding to checkout...')}
            >
              Proceed to Checkout
            </button>
            <button
              className="w-full mt-2 text-gray-600 py-3 rounded-lg hover:bg-gray-100 transition"
              onClick={() => setIsCartOpen(false)}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>

      {/* Add to Cart Notification */}
      <div
        className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-xl p-4 transform transition-transform duration-300 ${
          showNotification ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ width: '400px', zIndex: 1000 }}
      >
        {lastAddedItem && (
          <div className="flex items-center space-x-4">
            <img
              src={lastAddedItem.image}
              alt={lastAddedItem.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Added to cart!</p>
              <p className="text-sm text-gray-500">{lastAddedItem.name}</p>
              <p className="text-sm font-semibold text-blue-600">₦{lastAddedItem.price.toLocaleString()}</p>
            </div>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => {
                  setIsCartOpen(true);
                  setShowNotification(false);
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View Cart
              </button>
              <button
                onClick={() => setShowNotification(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cart Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 left-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50 group"
      >
        <ShoppingBag className="h-6 w-6 group-hover:scale-110 transition-transform" />
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
            {cart.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        )}
      </button>
    </div>
  );
}

export default App;