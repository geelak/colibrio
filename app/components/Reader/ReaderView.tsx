import { Suspense, useRef, useState, useEffect } from 'react';
import UIBar from '@components/Reader/ReaderUI/UIBar';
import Content from '@components/Reader/ReaderContent/Content';
import type { IReaderView, IReaderPublication } from '@colibrio/colibrio-reader-framework/colibrio-readingsystem-base';

interface ReaderViewProps {
  readerView: IReaderView | null;
  readerPublication: IReaderPublication | null;
  // Optionally, pass ttsPlayer, ttsVoices, etc. as props if you want TTS controls here
}

export default function ReaderView({ readerView, readerPublication }: ReaderViewProps) {
  // State for UIBar props
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [canGoNext, setCanGoNext] = useState<boolean>(false);
  const [canGoPrev, setCanGoPrev] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  // Listen for page/progress changes on the readerView
  useEffect(() => {
    if (!readerView) return;

    const updateProgress = () => {
      const timeline = readerView.getPageProgressionTimeline?.();
      if (!timeline) return;
      let percent = 0;
      if (typeof timeline.getVisibleTimelineRange === 'function' && typeof timeline.getTotalNumberOfPages === 'function') {
        const range = timeline.getVisibleTimelineRange();
        const total = timeline.getTotalNumberOfPages();
        if (total > 0) {
          percent = ((range.start.pageIndex + 1) / total) * 100;
          setCurrentPage(range.start.pageIndex + 1);
          setTotalPages(total);
        }
      }
      setProgressPercent(percent);
    };

    // Listen for visibleRangeChanged or visiblePagesChanged
    readerView.addEngineEventListener('visibleRangeChanged', updateProgress);
    readerView.addEngineEventListener('visiblePagesChanged', updateProgress);

    // Initial update
    updateProgress();

    return () => {
      readerView.removeEngineEventListener('visibleRangeChanged', updateProgress);
      readerView.removeEngineEventListener('visiblePagesChanged', updateProgress);
    };
  }, [readerView]);

  // Navigation state
  useEffect(() => {
    if (!readerView) return;

    const updateNav = () => {
      setCanGoNext(readerView.canPerformNext?.() ?? false);
      setCanGoPrev(readerView.canPerformPrevious?.() ?? false);
    };

    readerView.addEngineEventListener('canPerformNextChanged', updateNav);
    readerView.addEngineEventListener('canPerformPreviousChanged', updateNav);

    updateNav();

    return () => {
      readerView.removeEngineEventListener('canPerformNextChanged', updateNav);
      readerView.removeEngineEventListener('canPerformPreviousChanged', updateNav);
    };
  }, [readerView]);

  return (
    <div className="relative w-full h-full">
      <Suspense fallback={<div className="w-full h-full bg-neutral-100" />}>
        <Content readerViewRef={{ current: readerView }} />
      </Suspense>
      <Suspense fallback={<div className="fixed bottom-6 left-0 right-0 flex justify-center" />}>
        <UIBar 
          currentPage={currentPage}
          totalPages={totalPages}
          canGoNext={canGoNext}
          canGoPrev={canGoPrev}
          readerViewRef={{ current: readerView }}
          progressPercent={progressPercent}
        />
      </Suspense>
    </div>
  );
} 