'use client';

import React from 'react';

interface TOCButtonProps {
  onClick: (e: React.MouseEvent) => void;
  isActive?: boolean;
}

export const TOCButton: React.FC<TOCButtonProps> = ({
  onClick,
  isActive = false
}) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      aria-label="Table of Contents"
      className={`p-2 rounded-full flex-shrink-0 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700 ${isActive ? 'bg-neutral-200 dark:bg-neutral-700' : ''}`}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>
  );
}; 