import React, { useEffect, useState } from 'react';

function Preloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`fixed top-0 left-0 w-full h-full bg-dark flex justify-center items-center z-50 transition-opacity duration-500 ${!isLoading ? 'opacity-0 pointer-events-none' : ''}`}>
      <div className="w-12 h-12 border-3 border-white/20 rounded-full border-t-primary animate-spin"></div>
    </div>
  );
}

export default Preloader;
