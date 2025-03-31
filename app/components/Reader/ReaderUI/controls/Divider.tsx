'use client';

import React from 'react';

export const Divider: React.FC = () => {
  return (
    <div 
      className="h-8 w-px mx-1 flex-shrink-0" 
      style={{ backgroundColor: 'var(--color-border)' }} 
    />
  );
}; 