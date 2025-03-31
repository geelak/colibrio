'use client';

import React from 'react';

interface OverlayProps {
  isVisible: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export const Overlay: React.FC<OverlayProps> = ({
  isVisible,
  onClick
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-40"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.001)', // Nearly invisible but still clickable
        cursor: 'default'
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick(e);
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    />
  );
}; 