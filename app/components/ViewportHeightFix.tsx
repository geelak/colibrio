'use client';

import { useEffect } from "react";

interface ViewportHeightFixProps {
  children: React.ReactNode;
}

export default function ViewportHeightFix({ children }: ViewportHeightFixProps) {
  // Set viewport height CSS variable
  useEffect(() => {
    const setViewportHeight = () => {
      // Use the most accurate API with fallbacks
      const height = 
        (window.visualViewport?.height) || 
        document.documentElement?.clientHeight || 
        window.innerHeight;
      
      // Set the custom property
      const vh = height * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Set initial value
    setViewportHeight();

    // Listen to the appropriate events
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', setViewportHeight);
      window.visualViewport.addEventListener('scroll', setViewportHeight);
    } else {
      window.addEventListener('resize', setViewportHeight);
      window.addEventListener('orientationchange', setViewportHeight);
    }

    // Update on any orientation change
    window.addEventListener('orientationchange', () => {
      // Slight delay to ensure values are updated
      setTimeout(setViewportHeight, 100);
    });

    return () => {
      // Clean up
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', setViewportHeight);
        window.visualViewport.removeEventListener('scroll', setViewportHeight);
      } else {
        window.removeEventListener('resize', setViewportHeight);
        window.removeEventListener('orientationchange', setViewportHeight);
      }
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, []);

  return (
    <div 
      className="w-full h-full"
      style={{ 
        height: 'calc(var(--vh, 1vh) * 100)'
      }}
    >
      {children}
    </div>
  );
} 