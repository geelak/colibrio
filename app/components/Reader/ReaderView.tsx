import { Suspense, useRef, useState, useEffect } from 'react';
import UIBar from '@components/Reader/ReaderUI/UIBar';
import Content from '@components/Reader/ReaderContent/Content';
import type { IReaderView } from '@colibrio/colibrio-reader-framework/colibrio-readingsystem-base';

export default function ReaderView() {
  // State for UIBar props
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [canGoNext, setCanGoNext] = useState<boolean>(false);
  const [canGoPrev, setCanGoPrev] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const readerViewRef = useRef<IReaderView | null>(null);

  useEffect(() => {
    const updateProgress = () => {
      console.log('[updateProgress] called');
      const readerView = readerViewRef.current;
      if (!readerView) {
        console.log('[updateProgress] readerViewRef.current is null');
        return;
      }
      const timeline = readerView.getPageProgressionTimeline?.();
      if (!timeline) {
        console.log('[updateProgress] timeline is null');
        return;
      }
      // Only use page-based calculation
      let percent = 0;
      if (typeof timeline.getVisibleTimelineRange === 'function' && typeof timeline.getTotalNumberOfPages === 'function') {
        const range = timeline.getVisibleTimelineRange();
        const totalPages = timeline.getTotalNumberOfPages();
        if (totalPages > 0) {
          percent = ((range.start.pageIndex + 1) / totalPages) * 100;
        }
      }
      console.log('[updateProgress] Calculated percent:', percent);
      setProgressPercent(percent);
    };

    // Listen for visibleRangeChanged or visiblePagesChanged
    const readerView = readerViewRef.current;
    if (readerView && typeof readerView.addEngineEventListener === 'function') {
      readerView.addEngineEventListener('visibleRangeChanged', updateProgress);
      readerView.addEngineEventListener('visiblePagesChanged', updateProgress);
      // Initial update
      updateProgress();
      return () => {
        readerView.removeEngineEventListener('visibleRangeChanged', updateProgress);
        readerView.removeEngineEventListener('visiblePagesChanged', updateProgress);
      };
    }
  }, [readerViewRef]);

  // Move debug log here so it doesn't cause a JSX error
  console.log('[ReaderView] Passing progressPercent to UIBar:', progressPercent);

  return (
    <div className="relative w-full h-full">
      <Suspense fallback={<div className="w-full h-full bg-neutral-100" />}>
        <Content readerViewRef={readerViewRef} />
      </Suspense>
      
      <Suspense fallback={<div className="fixed bottom-6 left-0 right-0 flex justify-center" />}>
        <UIBar 
          currentPage={currentPage}
          totalPages={totalPages}
          canGoNext={canGoNext}
          canGoPrev={canGoPrev}
          readerViewRef={readerViewRef}
          progressPercent={progressPercent}
        />
      </Suspense>
    </div>
  );
} 