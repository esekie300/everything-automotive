// frontend/src/components/layout/Navbar.js
import React, { useState, useEffect } from 'react';
import {
  FaBars,
  FaTimes,
  FaHome,
  FaShoppingCart,
  FaUser,
  FaInfoCircle,
  FaPhone,
  FaCar,
  FaTools,
  FaSearch,
  FaChevronDown,
  FaChevronRight,
  FaTags,
  FaWrench,
  FaList, // Keep FaList
  FaPlusCircle,
  FaHistory,
  FaDollarSign,
  FaBalanceScale,
  FaStar,
  FaCalendarCheck,
  FaSearchPlus,
  FaSprayCan,
  FaCalendarAlt,
  FaThList // Added icon for Overview
} from 'react-icons/fa';
import logo from '../../assets/logo.png';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Accept onCloseChat prop
function Navbar({ cartItemCount = 0, onCloseChat }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // Used for desktop dropdowns
  const [mobileAccountMenuOpen, setMobileAccountMenuOpen] = useState(false); // State for mobile account menu

  // Add state for search term (assuming search input exists)
  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setSearchVisible(false);
        setActiveDropdown(null);
        setMobileAccountMenuOpen(false); // Close mobile account menu on Escape
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close desktop dropdowns if click is outside dropdown and not on mobile menu
      if (!e.target.closest('.dropdown-container') && !e.target.closest('.mobile-menu')) {
        setActiveDropdown(null);
      }
      // Close mobile account menu if click is outside mobile menu
      if (!e.target.closest('.mobile-menu')) {
         setMobileAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSearch = (e) => {
    e.preventDefault();
    setSearchVisible(!searchVisible);
    if (!searchVisible) {
      setTimeout(() => document.getElementById('search-input')?.focus(), 100);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Also close mobile account menu when main mobile menu is toggled
    if (mobileMenuOpen) { // If closing the main menu
        setMobileAccountMenuOpen(false);
    }
    document.body.style.overflow = !mobileMenuOpen ? 'hidden' : 'auto';
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchTerm);
    setSearchVisible(false);
    setSearchTerm('');
  };

  const toggleDesktopDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const toggleMobileAccountMenu = () => {
      setMobileAccountMenuOpen(!mobileAccountMenuOpen);
  };

  const handleMobileLinkClick = () => {
      toggleMobileMenu(); // Close main mobile menu
      setMobileAccountMenuOpen(false); // Close account menu
      setActiveDropdown(null); // Close any desktop dropdowns (just in case)
      if (onCloseChat) { // Call the prop function if it exists
          onCloseChat();
      }
  };


  const mainMenu = [
    { id: 'home', label: 'Home', icon: FaHome, path: '/' },
    {
      id: 'vehicles', label: 'Vehicles', icon: FaCar, path: '#',
      submenu: [
        { label: 'New Cars', path: '/vehicles/new', icon: FaPlusCircle },
        { label: 'Used Cars', path: '/vehicles/used', icon: FaHistory },
        { label: 'Sell Your Car', path: '/vehicles/sell', icon: FaDollarSign },
        { label: 'Car Comparison', path: '/vehicles/compare', icon: FaBalanceScale },
        { label: 'Car Reviews', path: '/vehicles/reviews', icon: FaStar },
      ]
    },
    {
      id: 'services', label: 'Services', icon: FaTools, path: '#', // Main path remains '#' for dropdown trigger
      submenu: [
        // <<< --- ADDED THIS LINE --- >>>
        { label: 'Services Overview', path: '/services', icon: FaThList },
        // <<< --- END ADDED LINE --- >>>
        { label: 'Maintenance', path: '/services/maintenance', icon: FaCalendarCheck },
        { label: 'Repairs', path: '/services/repairs', icon: FaWrench },
        { label: 'Diagnostics', path: '/services/diagnostics', icon: FaSearchPlus },
        { label: 'Detailing', path: '/services/detailing', icon: FaSprayCan },
        { label: 'Schedule Service', path: '/services/schedule', icon: FaCalendarAlt },
      ]
    },
    {
      id: 'parts', label: 'Parts & Accessories', icon: FaShoppingCart, path: '#',
      submenu: [
        { label: 'Browse by Category', path: '/parts/categories', icon: FaList },
        { label: 'Browse by Vehicle', path: '/parts/vehicles', icon: FaCar },
        { label: 'Deals & Offers', path: '/parts/deals', icon: FaTags },
        { label: 'Find a Part', path: '/parts/finder', icon: FaSearch },
        { label: 'Sell Your Vehicle Parts', path: '/parts/sell', icon: FaWrench },
      ]
    },
    { id: 'deals', label: 'Special Offers', icon: FaTags, path: '/deals' },
    { id: 'about', label: 'About Us', icon: FaInfoCircle, path: '/about' },
    { id: 'contact', label: 'Contact', icon: FaPhone, path: '/contact' }
  ];

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-[#e0e0e0] shadow-md'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3 md:py-4">
          <Link to="/" className="flex items-center flex-shrink-0">
            <img src={logo} alt="Everything Automotive Logo" className="h-10" />
            <div className="ml-2 flex flex-col">
              <span className="text-[#121212] font-bold text-base leading-tight">EVERYTHING</span>
              <span className="text-[#5c95e6] font-bold text-base leading-tight">AUTOMOTIVE</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center">
            <ul className="flex space-x-6">
              {mainMenu.map(item => (
                <li key={item.id} className={`relative dropdown-container ${item.submenu ? 'group' : ''}`}>
                  {item.submenu ? (
                    <button
                      className="text-gray-800 hover:text-primary transition duration-300 flex items-center"
                      onClick={() => toggleDesktopDropdown(item.id)} // Use desktop toggle
                    >
                      <item.icon className="mr-2 text-sm" />
                      {item.label}
                      <FaChevronDown className={`ml-1 text-xs transition-transform ${activeDropdown === item.id ? 'transform rotate-180' : ''}`} />
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      className="text-gray-800 hover:text-primary transition duration-300 flex items-center"
                    >
                      <item.icon className="mr-2 text-sm" />
                      {item.label}
                    </Link>
                  )}

                  {item.submenu && activeDropdown === item.id && (
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50">
                      {item.submenu.map((subItem, index) => (
                        <Link
                          key={index}
                          to={subItem.path}
                          className="flex items-center px-4 py-2 text-gray-800 hover:bg-primary hover:text-white"
                          onClick={() => setActiveDropdown(null)} // Close desktop dropdown on click
                        >
                          {subItem.icon && <subItem.icon className="mr-2 text-sm opacity-75" />}
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop Icons & Auth */}
          <div className="flex items-center space-x-4">
            <button
              className="text-gray-800 hover:text-primary transition duration-300 hidden md:block"
              onClick={toggleSearch}
              aria-label="Search"
            >
              <FaSearch />
            </button>

            <Link to="/cart" className="text-gray-800 hover:text-primary transition duration-300 relative hidden md:block">
              <FaShoppingCart />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative dropdown-container hidden md:block">
                <button
                  className="text-gray-800 hover:text-primary transition duration-300 flex items-center"
                  onClick={() => toggleDesktopDropdown('account')} // Use desktop toggle
                  aria-label="Account menu"
                  aria-haspopup="true"
                  aria-expanded={activeDropdown === 'account'}
                >
                  <div className="relative">
                    <FaUser />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white"></span>
                  </div>
                  <span className="ml-2 hidden lg:inline">{user?.fullName || 'Account'}</span>
                </button>
                {activeDropdown === 'account' && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link to="/account" className="block px-4 py-2 text-gray-800 hover:bg-primary hover:text-white" onClick={() => setActiveDropdown(null)}>My Account</Link>
                    <Link to="/account/orders" className="block px-4 py-2 text-gray-800 hover:bg-primary hover:text-white" onClick={() => setActiveDropdown(null)}>My Orders</Link>
                    <Link to="/account/settings" className="block px-4 py-2 text-gray-800 hover:bg-primary hover:text-white" onClick={() => setActiveDropdown(null)}>Settings</Link>
                    <button
                      onClick={() => {
                        logout();
                        setActiveDropdown(null);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-primary hover:text-white"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-800 hover:text-primary transition duration-300 font-medium text-sm py-2 px-3"
                  onClick={onCloseChat}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded text-sm transition duration-300"
                  onClick={onCloseChat}
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Cart Icon (visible on mobile) */}
             <Link to="/cart" className="text-black hover:text-primary transition duration-300 relative md:hidden">
              <FaShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>


            {/* Mobile Menu Toggle Button */}
            <button
              className="md:hidden text-gray-800 focus:outline-none"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      {searchVisible && (
         <div className="fixed inset-0 bg-black bg-opacity-75 z-50 pt-20" onClick={() => setSearchVisible(false)}>
           <div className="container mx-auto px-4" onClick={(e) => e.stopPropagation()}>
             <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
               <input
                 id="search-input"
                 type="text"
                 placeholder="Search for vehicles, parts, services..."
                 className="w-full px-4 py-3 rounded-lg focus:outline-none"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
               <button
                 type="submit"
                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary"
                 aria-label="Submit search"
               >
                 <FaSearch />
               </button>
               <button
                 type="button"
                 className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary"
                 onClick={() => setSearchVisible(false)}
                 aria-label="Close search"
               >
                 <FaTimes />
               </button>
             </form>
           </div>
         </div>
       )}

      {/* Mobile Menu Overlay */}
      <div className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={toggleMobileMenu} // Close menu when clicking outside
        />

        <div
          className={`mobile-menu fixed top-0 left-0 h-full w-4/5 max-w-xs bg-white shadow-xl transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto`}
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <Link to="/" className="flex items-center" onClick={handleMobileLinkClick}>
                <img src={logo} alt="Everything Automotive Logo" className="h-8" />
                <div className="ml-2 flex flex-col">
                  <span className="text-[#121212] font-bold text-sm leading-tight">EVERYTHING</span>
                  <span className="text-[#5c95e6] font-bold text-sm leading-tight">AUTOMOTIVE</span>
                </div>
              </Link>
              <button onClick={toggleMobileMenu} className="text-gray-500" aria-label="Close mobile menu">
                <FaTimes />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto">
              {/* Mobile Auth Section */}
              <div className="p-4 bg-gray-100">
                {isAuthenticated ? (
                  // Authenticated User Mobile Menu Item
                  <div className="relative">
                    <button
                      className="flex items-center justify-between w-full p-3 text-left bg-white rounded-md shadow-sm"
                      onClick={toggleMobileAccountMenu} // Toggle mobile account menu
                    >
                      <div className="flex items-center">
                        <div className="relative mr-3">
                          <div className="bg-primary text-white p-2 rounded-full">
                            <FaUser />
                            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white"></span>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{user?.fullName || 'Account'}</p>
                          <span className="text-xs text-gray-600">Manage your account</span>
                        </div>
                      </div>
                      <FaChevronRight className={`transition-transform ${mobileAccountMenuOpen ? 'transform rotate-90' : ''}`} />
                    </button>

                    {/* Mobile Account Sub-Menu */}
                    {mobileAccountMenuOpen && (
                      <ul className="mt-2 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                        <li>
                          <Link to="/account" className="block px-4 py-2 text-gray-800 hover:bg-primary hover:text-white" onClick={handleMobileLinkClick}>My Account</Link>
                        </li>
                        <li>
                          <Link to="/account/orders" className="block px-4 py-2 text-gray-800 hover:bg-primary hover:text-white" onClick={handleMobileLinkClick}>My Orders</Link>
                        </li>
                         <li>
                          <Link to="/account/settings" className="block px-4 py-2 text-gray-800 hover:bg-primary hover:text-white" onClick={handleMobileLinkClick}>Settings</Link>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              logout();
                              handleMobileLinkClick(); // Close menu after logout
                            }}
                            className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-primary hover:text-white"
                          >
                            Logout
                          </button>
                        </li>
                      </ul>
                    )}
                  </div>
                ) : (
                  // Not Authenticated Mobile Menu Items
                  <div className="flex space-x-2">
                    <Link
                      to="/login"
                      className="flex-1 bg-primary text-white py-2 px-3 rounded text-sm font-medium text-center"
                      onClick={handleMobileLinkClick}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="flex-1 border border-primary text-primary py-2 px-3 rounded text-sm font-medium text-center"
                      onClick={handleMobileLinkClick}
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>

              {/* Main Mobile Navigation Links */}
              <nav className="p-2">
                <ul>
                  {mainMenu.map((item) => (
                    <li key={item.id} className="mb-1">
                      {item.submenu ? (
                        <>
                          <button
                            className={`flex items-center justify-between w-full p-3 text-left ${activeDropdown === item.id ? 'bg-gray-100' : ''}`}
                            onClick={() => toggleDesktopDropdown(item.id)} // Re-using activeDropdown for mobile submenus
                          >
                            <div className="flex items-center">
                              <item.icon className="mr-3 text-gray-600" />
                              <span>{item.label}</span>
                            </div>
                            <FaChevronRight className={`transition-transform ${activeDropdown === item.id ? 'transform rotate-90' : ''}`} />
                          </button>

                          {activeDropdown === item.id && (
                            <ul className="ml-8 bg-gray-50">
                              {item.submenu.map((subItem, index) => (
                                <li key={index}>
                                  <Link
                                    to={subItem.path}
                                    className="flex items-center py-2 px-3 text-gray-700 hover:bg-gray-100"
                                    onClick={handleMobileLinkClick} // Close menu on click
                                  >
                                    {subItem.icon && <subItem.icon className="mr-2 text-sm opacity-75" />}
                                    {subItem.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </>
                      ) : (
                        <Link
                          to={item.path}
                          className="flex items-center p-3 text-gray-700 hover:bg-gray-100"
                          onClick={handleMobileLinkClick} // Close menu on click
                        >
                          <item.icon className="mr-3 text-gray-600" />
                          {item.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Mobile Footer Links (Optional, can be removed if redundant) */}
            <div className="p-3 border-t">
              <div className="flex justify-between">
                <Link
                  to="/cart"
                  className="flex items-center text-gray-700 p-2"
                  onClick={handleMobileLinkClick}
                >
                  <FaShoppingCart className="mr-2 text-black" />
                  Cart
                  {cartItemCount > 0 && (
                    <span className="ml-2 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center text-gray-700 p-2"
                  onClick={handleMobileLinkClick}
                >
                  <FaPhone className="mr-2" />
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;