'use client';

import React from 'react';

interface SearchButtonProps {
  onClick: (e: React.MouseEvent) => void;
  isActive?: boolean;
}

export const SearchButton: React.FC<SearchButtonProps> = ({
  onClick,
  isActive = false
}) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      aria-label="Search"
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
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    </button>
  );
}; 