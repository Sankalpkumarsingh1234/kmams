// src/components/MobileResponsiveWrapper.jsx
// Mobile-first responsive container with adaptive layouts

import { useEffect, useState } from 'react';
import { isMobile, isTablet, isDesktop, getViewportWidth } from '../utils/responsive';

export default function MobileResponsiveWrapper({ children, maxWidth = 440 }) {
  const [viewportClass, setViewportClass] = useState('mobile');
  const [viewportWidth, setViewportWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(getViewportWidth());
      
      if (isMobile()) {
        setViewportClass('mobile');
      } else if (isTablet()) {
        setViewportClass('tablet');
      } else if (isDesktop()) {
        setViewportClass('desktop');
      }
    };

    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const containerStyle = {
    width: viewportClass === 'mobile' ? '100%' : 'auto',
    maxWidth: viewportClass === 'mobile' ? '100%' : `${maxWidth}px`,
    margin: viewportClass === 'mobile' ? 0 : 'auto',
    padding: viewportClass === 'mobile' ? '16px' : '0',
    minHeight: '100vh',
    background: '#F5F0EB',
    display: 'flex',
    alignItems: viewportClass === 'mobile' ? 'flex-start' : 'center',
    justifyContent: 'center',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  };

  return (
    <div style={containerStyle} data-viewport={viewportClass}>
      {children}
    </div>
  );
}
