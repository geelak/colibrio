'use client';

import { forwardRef, ForwardedRef } from 'react';
import type { IReaderView } from '@colibrio/colibrio-reader-framework/colibrio-readingsystem-base';

interface ContentProps {
  readerViewRef: React.RefObject<IReaderView | null>;
}

const Content = forwardRef((
  { readerViewRef }: ContentProps,
  ref: ForwardedRef<HTMLDivElement>
) => {
  return (
    <div 
      ref={ref}
      className="fixed inset-0 w-screen h-screen bg-neutral-100"
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

Content.displayName = 'Content';

export default Content; 