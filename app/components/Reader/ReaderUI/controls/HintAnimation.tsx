'use client';

import React from 'react';

interface HintAnimationProps {
  showHint: boolean;
  isExpanded: boolean;
  holdProgress: number;
}

export const HintAnimation: React.FC<HintAnimationProps> = ({
  showHint,
  isExpanded,
  holdProgress
}) => {
  if (!showHint || isExpanded || holdProgress > 0) {
    return null;
  }

  return (
    <div 
      className="absolute inset-0 rounded-full animate-pulse pointer-events-none"
      style={{ backgroundColor: 'var(--color-primary-light)', opacity: 0.2 }}
    />
  );
}; 