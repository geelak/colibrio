'use client';

import React from 'react';

interface BookmarkButtonProps {
  onClick: (e: React.MouseEvent) => void;
  isActive?: boolean;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  onClick,
  isActive = false
}) => {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      aria-label={isActive ? "Remove bookmark" : "Add bookmark"}
      className="p-2 rounded-full flex-shrink-0 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-700"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill={isActive ? "currentColor" : "none"} 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
      </svg>
    </button>
  );
}; 