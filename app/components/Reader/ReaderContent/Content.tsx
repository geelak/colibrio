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
    // Check container ref first
    if (!(typeof ref === 'object' && ref?.current)) {
      console.log('⚠️ Container ref not yet set');
      return;
    }
    
    // Log container ref success
    console.log('✅ Container ref is set:', ref.current);

    // Set up watcher for readerViewRef
    const checkReaderView = () => {
      if (readerViewRef?.current) {
        console.log('✅ ReaderView ref is now set:', readerViewRef.current);
        return true;
      }
      return false;
    };

    // Initial check
    if (!checkReaderView()) {
      console.log('ℹ️ Waiting for ReaderView to be initialized...');
    }

    // Watch for changes to readerViewRef
    const interval = setInterval(() => {
      if (checkReaderView()) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [ref, readerViewRef]);

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