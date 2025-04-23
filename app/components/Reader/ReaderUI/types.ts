import type { MutableRefObject } from 'react';
import type { IReaderView } from '@colibrio/colibrio-reader-framework/colibrio-readingsystem-base';

export interface UIBarProps {
  currentPage?: number;
  totalPages?: number;
  canGoNext: boolean;
  canGoPrev: boolean;
  readerViewRef: MutableRefObject<IReaderView | null>;
  progressPercent?: number;
  onTOCClick?: () => void;
  onTTSPlay?: () => void;
  onTTSPause?: () => void;
  onTTSStop?: () => void;
  onTTSPrev?: () => void;
  onTTSNext?: () => void;
  ttsVoices?: { label: string; value: string }[];
  ttsVoice?: string;
  onVoiceChange?: (voice: string) => void;
  ttsSpeed?: number;
  onSpeedChange?: (speed: number) => void;
  ttsState?: 'playing' | 'paused' | 'stopped';
  ttsSupportsNextPrev?: boolean;
} 