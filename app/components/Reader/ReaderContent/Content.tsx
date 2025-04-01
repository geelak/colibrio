'use client';

import { forwardRef, useEffect, useRef, ForwardedRef } from 'react';
import type { IReaderView } from '@colibrio/colibrio-reader-framework/colibrio-readingsystem-base';

export interface ContentProps {
  readerViewRef: React.RefObject<IReaderView | null>;
}

const Content = forwardRef(({ 
  readerViewRef 
}: ContentProps, ref: ForwardedRef<HTMLDivElement>) => {
  
  useEffect(() => {
    // Reader initialization will go here
    // This is just a placeholder for now
  }, []);

  return (
    <div 
      ref={ref}
      className="w-full h-full bg-neutral-100"
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        padding: 0,
        margin: 0,
        overflow: 'hidden'
      }}
    />
  );
});

// Add displayName for better debugging
Content.displayName = 'Content';

export default Content; 