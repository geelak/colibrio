'use client';

import React from 'react';

interface PreviousButtonProps {
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

export const PreviousButton: React.FC<PreviousButtonProps> = ({
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
      aria-label="Previous page"
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
        <path d="M15 18l-6-6 6-6" />
      </svg>
      <span className="sr-only">Previous</span>
    </button>
  );
}; 