
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function RouteScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // This component doesn't render anything visible
}

export default RouteScrollToTop;