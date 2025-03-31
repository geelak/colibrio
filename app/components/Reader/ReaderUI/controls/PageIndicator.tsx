'use client';

import React, { useState } from 'react';

interface PageIndicatorProps {
  currentPage?: number;
  totalPages?: number;
  showIndicator: boolean;
  isChangeIndicator?: boolean;
  isHovered?: boolean;
  canGoPrev?: boolean;
  canGoNext?: boolean;
  onPrev?: (e: React.MouseEvent) => void;
  onNext?: (e: React.MouseEvent) => void;
}

export const PageIndicator: React.FC<PageIndicatorProps> = ({
  currentPage = 1,
  totalPages = 1,
  showIndicator,
  isChangeIndicator = false,
  isHovered = false,
  canGoPrev = false,
  canGoNext = false,
  onPrev,
  onNext
}) => {
  // Track nav button interaction state
  const [navButtonClicked, setNavButtonClicked] = useState(false);
  
  if (!showIndicator) {
    return null;
  }

  // Function to handle nav button clicks with delay
  const handleNavButtonClick = (
    e: React.MouseEvent, 
    navigationAction: ((e: React.MouseEvent) => void) | undefined
  ) => {
    e.stopPropagation(); // Still stop propagation to prevent immediate click handling
    
    // Flag that we're handling a nav button click
    setNavButtonClicked(true);
    
    // Execute the navigation after a short delay
    setTimeout(() => {
      if (navigationAction) {
        navigationAction(e);
      }
      // Reset the flag after navigation
      setTimeout(() => {
        setNavButtonClicked(false);
      }, 50);
    }, 75); // 75ms delay before navigation - short enough to feel responsive
  };

  return (
    <div className="flex items-center justify-center h-full relative z-20 overflow-hidden">
      <div 
        className="flex items-center justify-center transition-all duration-300 ease-in-out origin-center"
        style={{
          transform: showIndicator ? 'scale(1)' : 'scale(0)',
          opacity: showIndicator ? 1 : 0,
          maxWidth: showIndicator ? '300px' : '0',
          maxHeight: showIndicator ? '26px' : '0',
          overflow: 'hidden'
        }}
      >
        {/* Show prev button when hovered */}
        {isHovered && onPrev && (
          <button
            onClick={(e) => handleNavButtonClick(e, onPrev)}
            // We don't prevent default or stop propagation here to allow long press to work
            // We just need to identify it was a nav button click
            onMouseDown={(e) => setNavButtonClicked(true)}
            disabled={!canGoPrev}
            className="mr-2 p-1 rounded-full transition-opacity hover:bg-black/5"
            style={{ 
              opacity: canGoPrev ? 1 : 0.3,
            }}
            aria-label="Previous page"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        
        <span 
          className={`text-xs font-medium leading-none whitespace-nowrap px-1
                    ${isChangeIndicator ? 'font-bold animate-pulse-once' : ''}`}
          style={{ 
            color: isChangeIndicator ? 'var(--color-primary)' : 'var(--color-text-secondary)'
          }}
        >
          {currentPage} / {totalPages || '--'}
        </span>
        
        {/* Show next button when hovered */}
        {isHovered && onNext && (
          <button
            onClick={(e) => handleNavButtonClick(e, onNext)}
            // We don't prevent default or stop propagation here to allow long press to work
            // We just need to identify it was a nav button click
            onMouseDown={(e) => setNavButtonClicked(true)}
            disabled={!canGoNext}
            className="ml-2 p-1 rounded-full transition-opacity hover:bg-black/5"
            style={{ 
              opacity: canGoNext ? 1 : 0.3,
            }}
            aria-label="Next page"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}; 