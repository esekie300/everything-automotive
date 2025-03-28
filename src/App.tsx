import React from 'react';
import { Menu, X, Car, PenTool as Tools, ShoppingBag, MessageSquare, Bot } from 'lucide-react';

function App() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/95 backdrop-blur-sm z-50 shadow-sm animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2 hover-lift">
              <Car className="h-8 w-8 text-blue-600 transition-transform hover:rotate-12" />
              <span className="font-bold text-xl text-gray-900">EVERYTHING-AUTOMOTIVE</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-all duration-300 hover-lift">Home</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-all duration-300 hover-lift">Services</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-all duration-300 hover-lift">Parts Store</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-all duration-300 hover-lift">Buy/Sell Cars</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-all duration-300 hover-lift">About</a>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                Login
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600 transition-all duration-300"
              >
                {isMenuOpen ? <X className="h-6 w-6 animate-scale-in" /> : <Menu className="h-6 w-6 animate-scale-in" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Navigation - Now with icons */}
          {isMenuOpen && (
            <div className="md:hidden absolute right-0 w-1/4 bg-white shadow-lg rounded-bl-lg z-50 animate-slide-down">
              <div className="p-4 space-y-4">
                <a href="#" className="flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-300 hover:translate-x-1">
                  <Car className="h-5 w-5 mr-2 transition-transform group-hover:rotate-12" />
                  <span>Home</span>
                </a>
                <a href="#" className="flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-300 hover:translate-x-1">
                  <Tools className="h-5 w-5 mr-2 transition-transform group-hover:rotate-12" />
                  <span>Services</span>
                </a>
                <a href="#" className="flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-300 hover:translate-x-1">
                  <ShoppingBag className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
                  <span>Parts Store</span>
                </a>
                <a href="#" className="flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-300 hover:translate-x-1">
                  <Car className="h-5 w-5 mr-2 transition-transform group-hover:translate-x-1" />
                  <span>Buy/Sell Cars</span>
                </a>
                <a href="#" className="flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-300 hover:translate-x-1">
                  <MessageSquare className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
                  <span>About</span>
                </a>
                <button className="w-full flex items-center justify-center mt-4 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-md">
                  <Bot className="h-5 w-5 mr-2 transition-transform group-hover:rotate-12" />
                  <span>Login</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-16">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80"
            alt="Luxury car background"
            className={`w-full h-full object-cover transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/10 to-black/20"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-40">
          <div className="text-center">
            <h1 className={`text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-md transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              Your Complete Automotive Solution
            </h1>
            <p className={`text-xl text-white mb-24 max-w-3xl mx-auto drop-shadow transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              From buying and selling cars to maintenance and repairs - we've got everything you need under one roof.
            </p>

            {/* CTA Buttons */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <button className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-all duration-300 group shadow-lg hover:scale-105 hover:shadow-xl">
                <Tools className="h-5 w-5 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
                <span>Book a Service</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-white text-gray-900 px-6 py-4 rounded-lg hover:bg-gray-100 transition-all duration-300 group shadow-lg hover:scale-105 hover:shadow-xl">
                <ShoppingBag className="h-5 w-5 transition-all duration-300 group-hover:scale-125" />
                <span>Find Parts</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-white text-gray-900 px-6 py-4 rounded-lg hover:bg-gray-100 transition-all duration-300 group shadow-lg hover:scale-105 hover:shadow-xl">
                <Car className="h-5 w-5 transition-all duration-300 group-hover:translate-x-2" />
                <span>Buy/Sell Cars</span>
              </button>
              <button className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-all duration-300 group shadow-lg hover:scale-105 hover:shadow-xl">
                <Bot className="h-5 w-5 transition-all duration-300 group-hover:rotate-[-15deg] group-hover:scale-125" />
                <span>Ask an AI Mechanic</span>
              </button>
            </div>
          </div>
        </div>

        {/* Floating Add to Cart Button (Bottom Left) */}
        <button className={`fixed bottom-6 left-6 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 z-50 group hover:scale-110 hover:shadow-xl ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <ShoppingBag className="h-6 w-6 transition-all duration-300 group-hover:scale-110" />
        </button>

        {/* Chat Widget Button (Bottom Right) */}
        <button className={`fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 z-50 group hover:scale-110 hover:shadow-xl ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <MessageSquare className="h-6 w-6 transition-all duration-300 group-hover:scale-110" />
        </button>
      </div>
    </div>
  );
}

export default App;
