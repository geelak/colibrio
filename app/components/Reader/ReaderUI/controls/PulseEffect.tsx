'use client';

import React from 'react';

interface PulseEffectProps {
  holdProgress: number;
  isExpanded: boolean;
}

export const PulseEffect: React.FC<PulseEffectProps> = ({
  holdProgress,
  isExpanded
}) => {
  if (holdProgress <= 0 || holdProgress >= 100 || isExpanded) {
    return null;
  }

  return (
    <>
      {/* External pulse effect for hold gesture */}
      <div 
        className="absolute bottom-0 w-16 h-16 rounded-full animate-ping" 
        style={{ 
          backgroundColor: 'var(--color-primary-light)',
          opacity: holdProgress / 150 + 0.15,
          transform: `scale(${1 + (holdProgress / 100)})` 
        }}
      />
    </>
  );
}; 