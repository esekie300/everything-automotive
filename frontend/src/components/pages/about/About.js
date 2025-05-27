// frontend/src/components/pages/about/About.js
import React from 'react';
import { FaCar, FaShoppingCart, FaTools, FaBrain, FaMapMarkerAlt, FaBullseye, FaUsers, FaLightbulb } from 'react-icons/fa'; // Import relevant icons

function About() {
  return (
    <div className="bg-white py-12 md:py-20 px-4">
      <div className="container mx-auto max-w-5xl">

        {/* Section 1: Introduction & Mission */}
        <section className="text-center mb-16 md:mb-24">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            About Everything Automotive
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-6">
            Your trusted, technology-driven partner for all automotive needs in Nigeria. We're revolutionizing how you buy parts, sell vehicles, and access expert car care.
          </p>
          <p className="text-md text-gray-600 max-w-2xl mx-auto">
            Founded on a vision to simplify the automotive landscape in Nigeria, Everything Automotive brings together decades of expertise from <span className="font-semibold">QSystems Automations Nigeria</span> and <span className="font-semibold">Global Automotive Concept Nigeria</span>. Led by Mr. Gabriel Osereime Esekie and Engr. Thomas Osebha Esekie, our mission is to provide a seamless, reliable, and comprehensive platform for vehicle owners, buyers, sellers, and service providers.
          </p>
        </section>

        {/* Section 2: What We Offer */}
        <section className="mb-16 md:mb-24">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Our Comprehensive Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Service Card 1: Parts */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow duration-300">
              <FaShoppingCart className="text-4xl text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Vast Parts E-commerce</h3>
              <p className="text-gray-600 text-sm">
                Browse and purchase genuine and high-quality aftermarket parts from trusted stores across Nigeria. Find exactly what you need for your vehicle.
              </p>
            </div>
            {/* Service Card 2: Vehicles */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow duration-300">
              <FaCar className="text-4xl text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Vehicle Marketplace</h3>
              <p className="text-gray-600 text-sm">
                A secure platform to buy and sell new, Nigerian-used, and foreign-used vehicles with detailed listings and reliable seller information.
              </p>
            </div>
            {/* Service Card 3: Services */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow duration-300">
              <FaTools className="text-4xl text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Workshop & Home Service</h3>
              <p className="text-gray-600 text-sm">
                Book appointments at certified workshops or request convenient vehicle maintenance and repairs right at your doorstep.
              </p>
            </div>
            {/* Service Card 4: AI */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow duration-300">
              <FaBrain className="text-4xl text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">AI Mechanic Assistant</h3>
              <p className="text-gray-600 text-sm">
                Get instant diagnostic guidance, part recommendations, and service booking assistance powered by cutting-edge AI technology.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Why Choose Us */}
        <section className="bg-primary text-white p-10 md:p-16 rounded-lg shadow-lg mb-16 md:mb-24">
          <h2 className="text-3xl font-bold text-center mb-10">Why Everything Automotive?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <FaMapMarkerAlt className="text-4xl mx-auto mb-3 opacity-90" />
              <h4 className="text-xl font-semibold mb-2">Nigeria-Focused</h4>
              <p className="text-sm opacity-90">Built specifically for the Nigerian market, understanding local needs, logistics, and vehicles.</p>
            </div>
            <div>
              <FaLightbulb className="text-4xl mx-auto mb-3 opacity-90" />
              <h4 className="text-xl font-semibold mb-2">Innovative Technology</h4>
              <p className="text-sm opacity-90">Leveraging AI and a modern platform for diagnostics, recommendations, and a seamless user experience.</p>
            </div>
            <div>
              <FaUsers className="text-4xl mx-auto mb-3 opacity-90" />
              <h4 className="text-xl font-semibold mb-2">Expertise & Trust</h4>
              <p className="text-sm opacity-90">Backed by experienced automotive and technology professionals committed to quality and reliability.</p>
            </div>
          </div>
        </section>

        {/* Section 4: Our Vision */}
        <section className="text-center mb-16 md:mb-24">
           <FaBullseye className="text-5xl text-primary mx-auto mb-5" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Vision</h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            To be the undisputed leader in Nigeria's online automotive space, providing unparalleled convenience, value, and trust for every vehicle owner and enthusiast. We are committed to continuous innovation and enhancing the automotive experience through technology.
          </p>
        </section>

        {/* Section 5: Meet the Leadership (Optional - Add photos later if desired) */}
        <section className="mb-16 md:mb-24">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Meet Our Leadership</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm text-center">
                    {/* Placeholder for Photo */}
                    <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center text-white text-4xl">
                        <FaUsers /> {/* Placeholder Icon */}
                    </div>
                    <h4 className="text-xl font-semibold text-gray-800">Mr. Gabriel Osereime Esekie</h4>
                    <p className="text-primary text-sm mb-2">QSystems Automations Nigeria</p>
                    <p className="text-gray-600 text-sm">Driving the technological innovation and platform strategy for a seamless digital experience.</p>
                </div>
                 <div className="bg-gray-50 p-6 rounded-lg shadow-sm text-center">
                    {/* Placeholder for Photo */}
                    <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center text-white text-4xl">
                        <FaUsers /> {/* Placeholder Icon */}
                    </div>
                    <h4 className="text-xl font-semibold text-gray-800">Engr. Thomas Osebha Esekie</h4>
                    <p className="text-primary text-sm mb-2">Global Automotive Concept Nigeria</p>
                    <p className="text-gray-600 text-sm">Bringing deep automotive expertise, ensuring quality service standards and industry knowledge.</p>
                </div>
            </div>
        </section>

        {/* Section 6: Call to Action */}
        <section className="text-center bg-gray-100 p-10 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Experience the Difference?</h2>
          <p className="text-gray-700 mb-6">Explore our platform today or get in touch with our team.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/parts/categories" className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-md transition duration-300">
              Browse Parts
            </a>
            <a href="/services/schedule" className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-md transition duration-300">
              Book a Service
            </a>
            <a href="/contact" className="border border-primary text-primary hover:bg-primary hover:text-white font-semibold py-3 px-6 rounded-md transition duration-300">
              Contact Us
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}

export default About;