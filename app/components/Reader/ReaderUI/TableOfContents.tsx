import React, { useEffect, useState, useRef, useCallback } from 'react';

interface TableOfContentsProps {
  readerPublication: any; // IReaderPublication
  readerView: any; // IReaderView
  onClose?: () => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ readerPublication, readerView, onClose }) => {
  const [tocItems, setTocItems] = useState<any[]>([]);
  const [showContent, setShowContent] = useState(false);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Focus trap logic
  const focusableSelector = 'a[href], button:not([disabled])';
  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (!modalRef.current) return;
    const focusableEls = modalRef.current.querySelectorAll<HTMLElement>(focusableSelector);
    if (!focusableEls.length) return;
    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
  }, []);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 10); // trigger animation
    if (!readerPublication) return;
    (async () => {
      try {
        const publicationNavigation = await readerPublication.fetchPublicationNavigation();
        const tocCollection = publicationNavigation.getNavigationCollections()
          .find((collection: any) => {
            const type = collection.getType();
            return type === 1 || type === 'toc' || type === 'TOC';
          });
        if (tocCollection) {
          setTocItems(tocCollection.getChildren());
        }
      } catch (err) {
        setTocItems([]);
      }
    })();
  }, [readerPublication]);

  // Set initial focus to first link
  useEffect(() => {
    if (showContent) {
      setTimeout(() => {
        firstLinkRef.current?.focus();
      }, 0);
    }
  }, [showContent]);

  // Keyboard accessibility: close on Escape, trap focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      } else if (e.key === 'Tab') {
        trapFocus(e);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, trapFocus]);

  const handleTocClick = async (item: any) => {
    if (!readerView) return;
    try {
      await readerView.goTo(item);
      if (onClose) onClose();
    } catch (err) {}
  };

  // Animation classes for modal content
  const contentAnimationClass = showContent
    ? 'scale-100 opacity-100'
    : 'scale-95 opacity-0 pointer-events-none';

  // Recursive rendering for nested TOC
  const renderTocItems = (items: any[], depth = 0, isFirst = false) => (
    <ol className={depth === 0 ? 'space-y-4' : 'space-y-1'}>
      {items.map((item, idx) => {
        const isTopFirst = depth === 0 && idx === 0 && isFirst;
        return (
          <li
            key={idx}
            className={
              depth === 0
                ? 'ml-2'
                : 'ml-6 border-l border-neutral-200 dark:border-neutral-700 pl-2'
            }
          >
            <a
              href="#"
              ref={isTopFirst ? firstLinkRef : undefined}
              onClick={e => { e.preventDefault(); handleTocClick(item); }}
              className="block w-full px-4 py-2 rounded-full transition-colors duration-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-base text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-neutral-100 dark:focus:bg-neutral-800 truncate"
              tabIndex={0}
              style={{ boxSizing: 'border-box', maxWidth: '100%' }}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTocClick(item);
                }
              }}
            >
              {item.getTextContent()}
            </a>
            {item.getChildren && item.getChildren().length > 0 && renderTocItems(item.getChildren(), depth + 1)}
          </li>
        );
      })}
    </ol>
  );

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/35 backdrop-blur-md transition-all duration-300"
      role="dialog"
      aria-modal="true"
      aria-label="Table of Contents"
    >
      <div
        className={`relative bg-white/70 dark:bg-neutral-900/80 rounded-2xl border border-white/40 dark:border-neutral-700/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.22)] max-w-md w-full p-6 transition-all duration-300 ease-in-out origin-center ${contentAnimationClass}`}
        style={{ visibility: showContent ? 'visible' : 'hidden', backdropFilter: 'blur(20px)' }}
      >
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full transition-colors duration-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Close Table of Contents"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="4" x2="16" y2="16" />
            <line x1="16" y1="4" x2="4" y2="16" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100">Table of Contents</h2>
        <div className="max-h-[60vh] overflow-y-auto pr-3 overflow-x-hidden pt-3 pb-3">
          {tocItems.length > 0 ? renderTocItems(tocItems, 0, true) : <div className="text-neutral-500">No TOC found.</div>}
        </div>
      </div>
    </div>
  );
};

export default TableOfContents;