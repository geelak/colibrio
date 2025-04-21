'use client';

import React from 'react';

interface ContentContainerProps {
  showContent: boolean;
  children: React.ReactNode;
}

export const ContentContainer: React.FC<ContentContainerProps> = ({
  showContent,
  children
}) => {
  const contentAnimationClass = showContent ? 'scale-100 opacity-100' : 'scale-0 opacity-0';

  return (
    <div 
      className={`flex items-center justify-center gap-4 w-full transition-all duration-300 ease-in-out origin-center ${contentAnimationClass}`}
      style={{ 
        visibility: showContent ? 'visible' : 'hidden',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}; 