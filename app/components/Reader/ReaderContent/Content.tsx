'use client';

import { forwardRef, useEffect, useRef, ForwardedRef } from 'react';
import type { IReaderView } from '@colibrio/colibrio-reader-framework/colibrio-readingsystem-base';
import { AppHighlighter } from '../ReaderUI/controls/AppHighlighter';

export interface ContentProps {
  readerViewRef: React.RefObject<IReaderView | null>;
}

const Content = forwardRef(function Content(
  { readerViewRef }: ContentProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const highlightsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (readerViewRef.current && highlightsContainerRef.current) {
      // Only instantiate once
      if (!(highlightsContainerRef.current as any)._appHighlighter) {
        (highlightsContainerRef.current as any)._appHighlighter = new AppHighlighter(
          readerViewRef.current,
          highlightsContainerRef.current
        );
      }
    }
  }, [readerViewRef.current]);

  return (
    <div ref={ref} className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {readerViewRef.current && (
        <div id="highlights-container" ref={highlightsContainerRef} style={{ position: 'absolute', top: 16, right: 16, zIndex: 100 }}>
          <button id="create-highlight" disabled style={{ marginBottom: 8 }}>Create highlight</button>
          <h4>Highlights (bold if visible in ReaderView)</h4>
          <ul id="highlight-list" style={{ minWidth: 200, background: '#fff', border: '1px solid #eee', borderRadius: 4, padding: 8, listStyle: 'none' }}></ul>
        </div>
      )}
    </div>
  );
});

// Add displayName for better debugging
Content.displayName = 'Content';

export default Content; 