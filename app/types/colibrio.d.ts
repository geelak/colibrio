import { IPageProgressionTimeline } from '@colibrio/colibrio-reader-framework/colibrio-readingsystem-base';

declare module '@colibrio/colibrio-reader-framework/colibrio-readingsystem-base' {
  interface IPageProgressionTimeline {
    goToPage(page: number): void;
  }
} 