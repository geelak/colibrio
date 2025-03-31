'use client';

import React from 'react';

interface NextButtonProps {
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

export const NextButton: React.FC<NextButtonProps> = ({
  onClick,
  disabled = false
}) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      disabled={disabled}
      aria-label="Next page"
      className="text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0 transition-colors hover:text-text"
      style={{ 
        color: 'var(--color-text)',
        opacity: disabled ? 0.3 : 1,
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
  );
}; 