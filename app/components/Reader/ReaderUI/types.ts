import type { MutableRefObject } from 'react';
import type { IReaderView } from '@colibrio/colibrio-reader-framework/colibrio-readingsystem-base';

export interface UIBarProps {
  currentPage?: number;
  totalPages?: number;
  canGoNext: boolean;
  canGoPrev: boolean;
  readerViewRef: MutableRefObject<IReaderView | null>;
} 