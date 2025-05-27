// frontend/src/components/pages/services/Services.js
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import { FaTools, FaHome, FaBrain, FaShoppingCart, FaCar, FaBuilding, FaTruckMoving, FaWrench, FaSearchPlus, FaCalendarCheck } from 'react-icons/fa'; // Import relevant icons

function Services() {
  const servicesList = [
    {
      icon: FaTools,
      title: "Workshop Service & Repairs",
      description: "Book appointments at our certified partner workshops for routine maintenance, complex repairs, diagnostics, and more. Our skilled technicians ensure quality service.",
      link: "/services/schedule", // Link to future booking page
      linkText: "Book Workshop Service",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      icon: FaHome,
      title: "Convenient Home Service",
      description: "Need maintenance or minor repairs but can't make it to the workshop? Our qualified technicians can come to your home or office. (Coming Soon!)",
      link: "#", // Placeholder link
      linkText: "Learn More (Coming Soon)",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      disabled: true, // Mark as disabled for styling/interaction
    },
    {
      icon: FaBrain,
      title: "AI Mechanic Assistant",
      description: "Get instant diagnostic help, part recommendations based on your vehicle, and answers to your automotive questions using our intelligent AI assistant.",
      link: "#", // Link could potentially open the chat directly if implemented
      linkText: "Ask the AI (Use Chat Bubble)",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      action: 'openChat', // Special action identifier
    },
    {
      icon: FaShoppingCart,
      title: "Extensive Parts Store",
      description: "Find and purchase a wide variety of genuine and aftermarket vehicle parts and accessories from trusted sellers across Nigeria.",
      link: "/parts/categories", // Link to parts browsing
      linkText: "Browse Parts",
      bgColor: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      icon: FaCar,
      title: "Vehicle Marketplace",
      description: "Buy or sell new, Nigerian-used, or foreign-used cars securely and efficiently on our dedicated marketplace platform.",
      link: "/vehicles/browse", // Link to vehicle browsing (adjust path as needed)
      linkText: "Explore Vehicles",
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      icon: FaBuilding,
      title: "Fleet Management Solutions",
      description: "Tailored services for businesses to manage their vehicle fleets efficiently, including maintenance scheduling and tracking. (B2B - Coming Soon!)",
      link: "#", // Placeholder
      linkText: "Inquire Now (Coming Soon)",
      bgColor: "bg-indigo-100",
      iconColor: "text-indigo-600",
      disabled: true,
    },
     {
      icon: FaTruckMoving,
      title: "Bulk Part Purchasing",
      description: "Specialized support and potential discounts for businesses needing to purchase automotive parts in large quantities. (B2B - Coming Soon!)",
      link: "#", // Placeholder
      linkText: "Request Bulk Quote (Coming Soon)",
      bgColor: "bg-pink-100",
      iconColor: "text-pink-600",
      disabled: true,
    },
     {
      icon: FaWrench,
      title: "General Repairs",
      description: "From engine and transmission issues to brakes and suspension, our partner workshops handle a wide range of vehicle repairs.",
      link: "/services/schedule",
      linkText: "Get Repair Quote",
      bgColor: "bg-gray-100",
      iconColor: "text-gray-600",
    },
    {
      icon: FaSearchPlus,
      title: "Advanced Diagnostics",
      description: "Utilize modern diagnostic tools at our partner workshops to accurately identify and troubleshoot complex vehicle problems.",
      link: "/services/schedule",
      linkText: "Book Diagnostics",
      bgColor: "bg-teal-100",
      iconColor: "text-teal-600",
    },
     {
      icon: FaCalendarCheck,
      title: "Routine Maintenance",
      description: "Keep your vehicle in top condition with scheduled maintenance services like oil changes, tire rotations, fluid checks, and more.",
      link: "/services/schedule",
      linkText: "Schedule Maintenance",
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  // Placeholder function for opening chat - replace if you have a global context/method
  const handleOpenChat = () => {
      // This assumes you have a way to trigger the chat opening,
      // potentially via a function passed down through props or context.
      // For now, it just logs a message.
      console.log("Attempting to open AI Chat...");
      // Example: window.openAIChat(); // If you expose a global function
      alert("Please use the chat bubble at the bottom right to talk to the AI Mechanic.");
  };

  return (
    <div className="bg-white py-12 md:py-20 px-4">
      <div className="container mx-auto max-w-6xl">

        {/* Header */}
        <section className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-3">
            Our Services
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Everything Automotive offers a comprehensive suite of services designed to meet all your vehicle needs in Nigeria. Explore how we can help you maintain, repair, buy, or sell.
          </p>
        </section>

        {/* Services Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesList.map((service, index) => (
            <div
              key={index}
              className={`flex flex-col ${service.bgColor} p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300`}
            >
              <div className="flex-shrink-0 mb-4">
                <service.icon className={`text-5xl ${service.iconColor} mx-auto md:mx-0`} />
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center md:text-left">{service.title}</h3>
                <p className="text-gray-700 text-sm mb-4 text-center md:text-left">{service.description}</p>
              </div>
              <div className="mt-auto text-center md:text-left pt-4">
                {service.action === 'openChat' ? (
                   <button
                     onClick={handleOpenChat}
                     className={`inline-block ${service.iconColor.replace('text-', 'bg-').replace('-600', '-500')} hover:${service.iconColor.replace('text-', 'bg-').replace('-600', '-600')} text-white text-sm font-medium py-2 px-4 rounded transition duration-300`}
                   >
                     {service.linkText}
                   </button>
                ) : (
                  <Link
                    to={service.disabled ? "#" : service.link}
                    className={`inline-block ${
                      service.disabled
                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                        : `${service.iconColor.replace('text-', 'bg-').replace('-600', '-500')} hover:${service.iconColor.replace('text-', 'bg-').replace('-600', '-600')} text-white`
                    } text-sm font-medium py-2 px-4 rounded transition duration-300`}
                    onClick={(e) => service.disabled && e.preventDefault()} // Prevent navigation if disabled
                    aria-disabled={service.disabled}
                  >
                    {service.linkText}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </section>

      </div>
    </div>
  );
}

export default Services;