'use client';

import React from 'react';

interface NavigationControlsProps {
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: (e: React.MouseEvent) => void;
  onNext: (e: React.MouseEvent) => void;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  canGoPrev,
  canGoNext,
  onPrev,
  onNext
}) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev(e);
        }}
        disabled={!canGoPrev}
        aria-label="Previous page"
        className="text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0 transition-colors hover:text-text"
        style={{ 
          color: 'var(--color-text)',
          opacity: canGoPrev ? 1 : 0.3,
          whiteSpace: 'nowrap'
        }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        <span className="sr-only">Previous</span>
      </button>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext(e);
        }}
        disabled={!canGoNext}
        aria-label="Next page"
        className="text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0 transition-colors hover:text-text"
        style={{ 
          color: 'var(--color-text)',
          opacity: canGoNext ? 1 : 0.3,
          whiteSpace: 'nowrap'
        }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
        <span className="sr-only">Next</span>
      </button>
    </div>
  );
}; 