'use client';

import React from 'react';

interface AccountButtonProps {
  onClick: (e: React.MouseEvent) => void;
  isActive?: boolean;
}

export const AccountButton: React.FC<AccountButtonProps> = ({
  onClick,
  isActive = false
}) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      aria-label="Account"
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
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    </button>
  );
}; 