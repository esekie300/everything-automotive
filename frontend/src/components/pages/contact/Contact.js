// frontend/src/components/pages/contact/Contact.js
import React, { useState } from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane } from 'react-icons/fa';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitError('');

    // Simulate submission delay and show placeholder message
    console.log("Form submitted (simulation):", formData);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

    // --- TEMPORARY: Show success message without actual submission ---
    setSubmitMessage("Thank you for your message! We'll be in touch soon. (Note: Form is currently for display only).");
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' }); // Clear form
    // --- END TEMPORARY ---

    // --- LATER: Replace above with actual API call ---
    /*
    try {
      // const response = await contactApi.submitForm(formData); // Replace with your actual API call
      // setSubmitMessage("Thank you for your message! We'll be in touch soon.");
      // setFormData({ name: '', email: '', phone: '', subject: '', message: '' }); // Clear form
    } catch (error) {
      console.error("Contact form submission error:", error);
      setSubmitError(error.message || "Sorry, something went wrong. Please try again later or use another contact method.");
    } finally {
      setIsSubmitting(false);
    }
    */
    // --- END LATER ---

    setIsSubmitting(false); // Keep this line after the temporary block for now
  };


  return (
    <div className="bg-gray-50 py-12 md:py-20 px-4">
      <div className="container mx-auto max-w-6xl">

        {/* Header */}
        <section className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-3">
            Get In Touch
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're here to help! Whether you have questions about parts, services, vehicles, or just want to say hello, reach out to us through any of the methods below.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-12">

          {/* Column 1: Contact Details & Hours */}
          <div className="lg:col-span-1 space-y-8">
            {/* General Inquiries */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">General Inquiries</h3>
              <div className="space-y-3 text-gray-700">
                <p className="flex items-start">
                  <FaPhoneAlt className="text-primary mt-1 mr-3 flex-shrink-0" />
                  <span>
                    <a href="tel:+2348138900104" className="hover:text-primary transition duration-300">+234 813 890 0104</a> (Main)
                  </span>
                </p>
                <p className="flex items-start">
                  <FaEnvelope className="text-primary mt-1 mr-3 flex-shrink-0" />
                  <a href="mailto:esekiegabriel@gmail.com" className="hover:text-primary transition duration-300 break-all">esekiegabriel@gmail.com</a>
                </p>
              </div>
            </div>

            {/* Customer Support */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Customer Support</h3>
              <div className="space-y-3 text-gray-700">
                <p className="flex items-start">
                  <FaPhoneAlt className="text-primary mt-1 mr-3 flex-shrink-0" />
                   <span>
                    <a href="tel:+2347025631853" className="hover:text-primary transition duration-300">+234 702 563 1853</a> (Support Line)
                  </span>
                </p>
                <p className="flex items-start">
                  <FaEnvelope className="text-primary mt-1 mr-3 flex-shrink-0" />
                  <a href="mailto:helpassist121@gmail.com" className="hover:text-primary transition duration-300 break-all">helpassist121@gmail.com</a>
                </p>
              </div>
            </div>

            {/* Operating Hours */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Operating Hours</h3>
              <div className="space-y-2 text-gray-700">
                <p className="flex items-center">
                  <FaClock className="text-primary mr-3 flex-shrink-0" />
                  <span>Monday - Friday: 8:00 AM - 6:00 PM</span>
                </p>
                <p className="flex items-center">
                  <FaClock className="text-primary mr-3 flex-shrink-0" />
                  <span>Saturday: 9:00 AM - 4:00 PM</span>
                </p>
                 <p className="flex items-center">
                  <FaClock className="text-gray-400 mr-3 flex-shrink-0" />
                  <span>Sunday: Closed</span>
                </p>
              </div>
            </div>

             {/* Physical Locations */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Our Locations</h3>
              <div className="space-y-4 text-gray-700">
                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-primary mt-1 mr-3 flex-shrink-0 text-lg" />
                  <div>
                    <span className="font-semibold block">Lagos Head Office</span>
                    <span>5 Adejuwon Street, Ikotun, Lagos State Nigeria</span>
                  </div>
                </div>
                 <div className="flex items-start">
                  <FaMapMarkerAlt className="text-primary mt-1 mr-3 flex-shrink-0 text-lg" />
                  <div>
                    <span className="font-semibold block">Edo State Branch</span>
                    <span>4 Harrison Street, Idokpa Quarters, Edo State, Nigeria</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Contact Form */}
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Us a Message</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Submission Messages */}
              {submitMessage && (
                <div className="p-3 bg-green-100 border border-green-200 text-green-700 rounded text-sm">
                  {submitMessage}
                </div>
              )}
              {submitError && (
                <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded text-sm">
                  {submitError}
                </div>
              )}

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Your Name"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="you@example.com"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+234..."
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="subject"
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Reason for contacting us"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message <span className="text-red-500">*</span></label>
                <textarea
                  name="message"
                  id="message"
                  rows="5"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Your detailed message..."
                  disabled={isSubmitting}
                ></textarea>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-300 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="mr-2" /> Send Message
                    </>
                  )}
                </button>
                <p className="text-xs text-center text-gray-500 mt-3">
                  (Note: Form submission is currently disabled.)
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Map Section (Placeholders) */}
        <section className="mt-16 md:mt-24">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Find Us On The Map</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Lagos Map Placeholder */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h4 className="text-lg font-semibold text-gray-700 mb-3 text-center">Lagos Head Office</h4>
              <div className="bg-gray-200 h-64 rounded flex items-center justify-center text-gray-500">
                [ Google Map Embed Placeholder - Lagos ]
              </div>
              <p className="text-sm text-center mt-2 text-gray-600">5 Adejuwon Street, Ikotun, Lagos State Nigeria</p>
            </div>
            {/* Edo Map Placeholder */}
            <div className="bg-white p-4 rounded-lg shadow-md">
               <h4 className="text-lg font-semibold text-gray-700 mb-3 text-center">Edo State Branch</h4>
              <div className="bg-gray-200 h-64 rounded flex items-center justify-center text-gray-500">
                [ Google Map Embed Placeholder - Edo ]
              </div>
               <p className="text-sm text-center mt-2 text-gray-600">4 Harrison Street, Idokpa Quarters, Edo State Nigeria</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default Contact;