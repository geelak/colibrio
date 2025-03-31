'use client';

import React from 'react';

interface BorderProgressProps {
  holdProgress: number;
  isExpanded: boolean;
}

export const BorderProgress: React.FC<BorderProgressProps> = ({
  holdProgress,
  isExpanded
}) => {
  if (holdProgress <= 0 || holdProgress >= 100 || isExpanded) {
    return null;
  }

  return (
    <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-10">
      {/* Border progress indicator */}
      <div 
        className="absolute inset-0 border-2 rounded-full"
        style={{ 
          borderColor: 'var(--color-primary)',
          clipPath: `polygon(0% 0%, ${holdProgress}% 0%, ${holdProgress}% 100%, 0% 100%)` 
        }}
      ></div>
      
      {/* Radial color fill */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{ 
          backgroundColor: 'var(--color-primary-light)',
          opacity: 0.2,
          transform: `scale(${holdProgress / 100})` 
        }}
      ></div>
    </div>
  );
}; 