'use client';

import React, { forwardRef, ForwardedRef } from 'react';
import { BorderProgress } from './BorderProgress';
import { HintAnimation } from './HintAnimation';

interface BarContainerProps {
  isExpanded: boolean;
  longPressActive: boolean;
  showHint: boolean;
  holdProgress: number;
  children: React.ReactNode;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseUp?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
}

export const BarContainer = forwardRef(({
  isExpanded,
  longPressActive,
  showHint,
  holdProgress,
  children,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onMouseEnter,
  onTouchStart,
  onTouchEnd,
  onClick
}: BarContainerProps, ref: ForwardedRef<HTMLDivElement>) => {
  return (
    <div 
      ref={ref}
      className={`backdrop-blur-md rounded-full cursor-pointer
                transition-all duration-300 ease-in-out relative
                ${isExpanded ? 'px-6 py-2.5' : 'px-3 py-1'}`}
      style={{
        backgroundColor: 'rgba(var(--color-background-rgb), 0.75)',
        width: isExpanded ? '90%' : 'auto',
        maxWidth: isExpanded ? '90%' : 'max-content',
        minWidth: isExpanded ? 'auto' : '60px', 
        transform: `scale(${longPressActive ? '1.05' : '1'})`,
        transformOrigin: 'bottom center',
        boxShadow: longPressActive ? 'var(--shadow-large)' : 'var(--shadow-small)',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onClick={onClick}
    >
      {/* Border progress animation */}
      <BorderProgress holdProgress={holdProgress} isExpanded={isExpanded} />
      
      {/* Hint animation */}
      <HintAnimation showHint={showHint} isExpanded={isExpanded} holdProgress={holdProgress} />
      
      {children}
    </div>
  );
});

BarContainer.displayName = 'BarContainer'; 