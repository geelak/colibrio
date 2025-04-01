import { Suspense, useRef, useState } from 'react';
import UIBar from '@components/Reader/ReaderUI/UIBar';
import Content from '@components/Reader/ReaderContent/Content';
import type { IReaderView } from '@colibrio/colibrio-reader-framework/colibrio-readingsystem-base';

export default function ReaderView() {
  // State for UIBar props
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [canGoNext, setCanGoNext] = useState<boolean>(false);
  const [canGoPrev, setCanGoPrev] = useState<boolean>(false);
  const readerViewRef = useRef<IReaderView | null>(null);

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
        />
      </Suspense>
    </div>
  );
} 