// frontend/src/components/pages/home/Hero.js
import React from 'react';
import heroImage from '../../../assets/hero-image.jpg';
// Removed Link import

// Added onOpenAIChat prop
function Hero({ onOpenAIChat }) { // <<< ACCEPT PROP
  // Ripple effect for buttons
  const createRippleEffect = (e) => {
    const button = e.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = `${diameter}px`;
    circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${e.clientY - button.getBoundingClientRect().top - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) ripple.remove();

    button.appendChild(circle);
  };

  // Function to handle AI Chat button click
  const handleAIChatClick = (e) => {
      createRippleEffect(e); // Keep the ripple effect
      if (onOpenAIChat) {
          onOpenAIChat(); // <<< CALL THE PROP FUNCTION
      }
  };


  return (
    <section className="relative h-screen w-full overflow-hidden pt-[60px] pb-[60px] flex flex-col justify-center items-center text-center text-white">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.175), rgba(0, 0, 0, 0.075)), url(${heroImage})`
        }}
      />

      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.175)_100%)] z-0" />

      {/* Floating Cars */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <img
          src="https://cdn-icons-png.flaticon.com/512/3079/3079165.png"
          alt="White Sedan"
          className="absolute top-[20%] left-[-100px] w-[70px] filter drop-shadow-[0_0_8px_rgba(255,255,255,0.9)] opacity-90 animate-[floating_15s_linear_0s_infinite]"
        />
        <img
          src="https://cdn-icons-png.flaticon.com/512/3079/3079132.png"
          alt="Red Sports Car"
          className="absolute top-[50%] left-[-100px] w-[90px] filter drop-shadow-[0_0_8px_rgba(255,255,255,0.9)] opacity-90 animate-[floating_15s_linear_5s_infinite]"
        />
        <img
          src="https://cdn-icons-png.flaticon.com/512/3079/3079158.png"
          alt="Blue Pickup"
          className="absolute top-[80%] left-[-100px] w-[60px] filter drop-shadow-[0_0_8px_rgba(255,255,255,0.9)] opacity-90 animate-[floating_15s_linear_10s_infinite]"
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-[800px] w-full px-5 flex flex-col items-center justify-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight text-shadow-lg animate-[fadeInUp_1s_forwards_0.3s] opacity-0 translate-y-[30px]">
          Your Complete Automotive Solution
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl mb-8 max-w-[600px] w-full animate-[fadeInUp_1s_forwards_0.6s] opacity-0 translate-y-[30px]">
          From buying and selling cars and vehicle parts to maintenance and repairs, we've got everything you need under one roof.
        </p>
        <div className="flex flex-wrap md:flex-row flex-col gap-4 md:gap-4 justify-center animate-[fadeInUp_1s_forwards_0.9s] opacity-0 translate-y-[30px] max-w-[600px] w-full">
          {/* Primary CTA Button */}
          <button
            onClick={createRippleEffect}
            className="relative overflow-hidden bg-primary text-white font-semibold py-3 px-6 rounded-full hover:-translate-y-1 shadow-lg hover:shadow-xl transition-all duration-300 w-full md:w-auto"
          >
            <span className="relative z-10">Book a Service</span>
            <span className="absolute inset-0 bg-primary-dark w-0 h-full transition-all duration-300 group-hover:w-full -z-0 hover:w-full" />
          </button>

          {/* Find Parts Button with blue sliding animation effect */}
          <button
  onClick={createRippleEffect}
  className="find-parts-btn group relative overflow-hidden bg-transparent border-2 border-white text-white font-semibold py-3 px-6 rounded-full hover:-translate-y-1 transition-all duration-300 w-full md:w-auto"
>
  <span className="relative z-10">Find Parts</span>
  <div className="absolute inset-0 bg-[#6495ED] opacity-80 transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out"></div>
</button>

          {/* Buy/Sell Cars Button */}
          <button
            onClick={createRippleEffect}
            className="relative overflow-hidden bg-primary text-white font-semibold py-3 px-6 rounded-full hover:-translate-y-1 shadow-lg hover:shadow-xl transition-all duration-300 w-full md:w-auto"
          >
            <span className="relative z-10">Buy/Sell Cars</span>
            <span className="absolute inset-0 bg-primary-dark w-0 h-full transition-all duration-300 group-hover:w-full -z-0 hover:w-full" />
          </button>

          {/* AI Mechanic Button - Use onClick prop */}
            <button
              onClick={handleAIChatClick} // <<< Use the new handler
              className="relative overflow-hidden bg-primary text-white font-semibold py-3 px-6 rounded-full hover:-translate-y-1 shadow-lg hover:shadow-xl transition-all duration-300 w-full md:w-auto"
            >
              <span className="relative z-10">Ask an AI Mechanic</span>
              <span className="absolute inset-0 bg-primary-dark w-0 h-full transition-all duration-300 group-hover:w-full -z-0 hover:w-full" />
            </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;