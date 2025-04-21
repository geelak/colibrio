'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/theme/ThemeContext';
import type { UIBarProps } from './types';

// Import our new components
import { PageIndicator } from './controls/PageIndicator';
import { ProgressBar } from './controls/ProgressBar';
import { ThemeToggle } from './controls/ThemeToggle';
import { NavigationControls } from './controls/NavigationControls';
import { BarContainer } from './controls/BarContainer';
import { PulseEffect } from './controls/PulseEffect';
import { ContentContainer } from './controls/ContentContainer';
import { Overlay } from './controls/Overlay';
import { Divider } from './controls/Divider';
import { ButtonGroup } from './controls/ButtonGroup';
import { PreviousButton } from './controls/PreviousButton';
import { TOCButton } from './controls/TOCButton';
import { NextButton } from './controls/NextButton';

// Vibration utility
const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (err) {
      console.log('Vibration API error or not supported');
    }
  }
};

// Utility to detect touch device
const isTouchDevice = () => {
  return typeof window !== 'undefined' && (
    'ontouchstart' in window ||
    (navigator && navigator.maxTouchPoints > 0)
  );
};

export default function ClientUIBar({ 
  currentPage, 
  totalPages, 
  canGoNext, 
  canGoPrev, 
  readerViewRef, 
  onTOCClick
}: UIBarProps) {
  // Theme context
  const { isLoaded } = useTheme();
  
  // State
  const [isExpanded, setIsExpanded] = useState(false);
  const [longPressActive, setLongPressActive] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [showPageInfo, setShowPageInfo] = useState(false);
  const [isInteractionLocked, setIsInteractionLocked] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showPageChangeIndicator, setShowPageChangeIndicator] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTool, setActiveTool] = useState<'toc' | 'search' | 'settings' | 'account' | null>(null);
  const [isBarHovered, setIsBarHovered] = useState(false);
  // Use ref for holdProgress to avoid excessive re-renders
  const holdProgressRef = useRef(0);
  const [holdProgress, setHoldProgress] = useState(0);
  
  // Refs
  const barRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lockTimerRef = useRef<NodeJS.Timeout | null>(null);
  const contentTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pageChangeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const holdStartTimeRef = useRef<number | null>(null);
  const lastPageRef = useRef(currentPage);
  
  // Add a ref to track if navigation was recently triggered
  const navButtonClickedRef = useRef(false);

  // Constants - using exact original values
  const longPressDuration = 500;
  const interactionLockTime = 550;
  const contentDelay = 150;
  const pageChangeDisplayTime = 1000;

  // Handle page changes to show temporary page indicator
  useEffect(() => {
    // Only trigger if we have a valid current page and it actually changed
    if (currentPage && currentPage !== lastPageRef.current) {
      // Clear any existing timer
      if (pageChangeTimerRef.current) {
        clearTimeout(pageChangeTimerRef.current);
      }
      
      // Show the page indicator
      setShowPageChangeIndicator(true);
      
      // Hide it after the specified time
      pageChangeTimerRef.current = setTimeout(() => {
        setShowPageChangeIndicator(false);
      }, pageChangeDisplayTime);
      
      // Small vibration feedback for page change
      vibrate(15);
    }
    
    // Update the ref for future comparisons
    lastPageRef.current = currentPage;
  }, [currentPage]);
  
  // Handle expansion state change
  useEffect(() => {
    // Clear any existing content timer
    if (contentTimerRef.current) {
      clearTimeout(contentTimerRef.current);
    }
    
    if (isExpanded) {
      // Vibrate when menu expands
      vibrate(50);
      
      // Delay showing content until animation is partially complete
      contentTimerRef.current = setTimeout(() => {
        setShowContent(true);
      }, contentDelay);
    } else {
      // Hide content immediately when collapsing
      setShowContent(false);
    }
    
    return () => {
      if (contentTimerRef.current) {
        clearTimeout(contentTimerRef.current);
      }
    };
  }, [isExpanded]);

  // Hide hint after 10 seconds even if not interacted with
  useEffect(() => {
    const hintTimer = setTimeout(() => setShowHint(false), 10000);
    return () => clearTimeout(hintTimer);
  }, []);
  
  // Function to update hold progress animation (optimized)
  const updateHoldProgress = () => {
    if (!holdStartTimeRef.current) return;
    const elapsed = Date.now() - holdStartTimeRef.current;
    const progress = Math.min(100, (elapsed / longPressDuration) * 110);
    // Only update state if changed by at least 1%
    if (Math.abs(progress - holdProgressRef.current) >= 1) {
      holdProgressRef.current = progress;
      setHoldProgress(progress);
    }
    if (progress < 100) {
      animationFrameRef.current = requestAnimationFrame(updateHoldProgress);
    } else {
      vibrate(25);
    }
  };
  
  // Button handlers
  const handleBookmark = (e: React.MouseEvent) => {
    setIsBookmarked(!isBookmarked);
    vibrate(20);
  };

  const handleTOC = (e: React.MouseEvent) => {
    setActiveTool(activeTool === 'toc' ? null : 'toc');
    vibrate(20);
    if (onTOCClick) onTOCClick();
  };

  const handleSearch = (e: React.MouseEvent) => {
    setActiveTool(activeTool === 'search' ? null : 'search');
    vibrate(20);
  };

  const handleSettings = (e: React.MouseEvent) => {
    setActiveTool(activeTool === 'settings' ? null : 'settings');
    vibrate(20);
  };

  const handleAccount = (e: React.MouseEvent) => {
    setActiveTool(activeTool === 'account' ? null : 'account');
    vibrate(20);
  };

  // Clean up function
  const cleanup = () => {
    holdStartTimeRef.current = null;
    holdProgressRef.current = 0;
    setHoldProgress(0);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setLongPressActive(false);
  };
  
  // Unified pointer/touch event handlers
  const handlePressStart = (e: React.PointerEvent | React.TouchEvent) => {
    // Only preventDefault for mouse, not for touch (to avoid blocking scroll)
    if (!('touches' in e)) e.preventDefault();
    if (isInteractionLocked) return;
    if (navButtonClickedRef.current) return;
    holdStartTimeRef.current = Date.now();
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    holdProgressRef.current = 0;
    setHoldProgress(0);
    animationFrameRef.current = requestAnimationFrame(updateHoldProgress);
    vibrate(10);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setLongPressActive(true);
      setIsExpanded(true);
      setShowHint(false);
      setIsInteractionLocked(true);
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
      lockTimerRef.current = setTimeout(() => {
        setIsInteractionLocked(false);
      }, interactionLockTime);
    }, longPressDuration);
  };

  const handlePressEnd = () => {
    cleanup();
  };
  
  // Handle click (for normal toggle behavior)
  const handleClick = () => {
    // Skip if interaction is locked
    if (isInteractionLocked) return;
    
    // Only toggle if it wasn't a long press
    if (!longPressActive) {
      if (isExpanded) {
        setIsExpanded(false);
        
        // Lock interactions during collapse animation
        setIsInteractionLocked(true);
        if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
        lockTimerRef.current = setTimeout(() => {
          setIsInteractionLocked(false);
        }, interactionLockTime);
      } else {
        // Toggle page info on single click when collapsed
        setShowPageInfo(!showPageInfo);
        
        // Small vibration for feedback on click
        vibrate(15);
      }
      setShowHint(false); // Hide the hint after interaction
    }
  };
  
  // Enhanced hover handlers
  const handlePointerEnter = () => {
    if (!isExpanded && !isInteractionLocked) {
      setShowPageInfo(true);
      setIsBarHovered(true);
    }
  };

  const handlePointerLeave = () => {
    if (!isExpanded) {
      setShowPageInfo(false);
      setIsBarHovered(false);
    }
    handlePressEnd();
  };

  // Navigation handlers
  const handlePrevPage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!readerViewRef.current?.canPerformPrevious()) return;
    
    readerViewRef.current.previous();
    
    // Set page change indicator
    setShowPageChangeIndicator(true);
    if (pageChangeTimerRef.current) {
      clearTimeout(pageChangeTimerRef.current);
    }
    pageChangeTimerRef.current = setTimeout(() => {
      setShowPageChangeIndicator(false);
    }, pageChangeDisplayTime);
    
    vibrate(20);
  };

  const handleNextPage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!readerViewRef.current?.canPerformNext()) return;
    
    readerViewRef.current.next();
    
    // Set page change indicator
    setShowPageChangeIndicator(true);
    if (pageChangeTimerRef.current) {
      clearTimeout(pageChangeTimerRef.current);
    }
    pageChangeTimerRef.current = setTimeout(() => {
      setShowPageChangeIndicator(false);
    }, pageChangeDisplayTime);
    
    vibrate(20);
  };

  // Handle page change from progress bar
  const handlePageChange = (page: number) => {
    if (readerViewRef.current) {
      const timeline = readerViewRef.current.getPageProgressionTimeline();
      timeline?.goToPage(page - 1); // Adjust for 0-based index
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(event.target as Node)) {
        if (isExpanded && !isInteractionLocked) {
          setIsExpanded(false);
          
          // Lock interactions during collapse animation
          setIsInteractionLocked(true);
          if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
          lockTimerRef.current = setTimeout(() => {
            setIsInteractionLocked(false);
          }, interactionLockTime);
        }
        setShowPageInfo(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, showPageInfo, isInteractionLocked]);

  // Clean up timers and animation frames on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
      if (contentTimerRef.current) clearTimeout(contentTimerRef.current);
      if (pageChangeTimerRef.current) clearTimeout(pageChangeTimerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);
  
  // Update the condition for showing page numbers in collapsed state
  const showPageNumbersInPill = showPageInfo || showPageChangeIndicator || (holdProgress > 0 && !isExpanded);

  return (
    <>
      <Overlay 
        isVisible={isExpanded} 
        onClick={() => {
          setIsExpanded(false);
          setShowPageInfo(false);
        }}
      />
      
      <div className="fixed bottom-6 left-0 right-0 flex justify-center items-end z-50">
        {/* External pulse effect for hold gesture */}
        <PulseEffect 
          holdProgress={holdProgress} 
          isExpanded={isExpanded} 
        />

        <BarContainer
          ref={barRef}
          isExpanded={isExpanded}
          longPressActive={longPressActive}
          showHint={showHint}
          holdProgress={holdProgress}
          onPointerDown={!isTouchDevice() ? handlePressStart : undefined}
          onPointerUp={!isTouchDevice() ? handlePressEnd : undefined}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onClick={handleClick}
          // Add touch handlers for mobile
          {...(isTouchDevice() ? {
            onTouchStart: handlePressStart,
            onTouchEnd: handlePressEnd
          } : {})}
        >
          {!isExpanded ? (
            /* Collapsed state - pill with page indicator and now nav buttons on hover */
            <PageIndicator 
              currentPage={currentPage}
              totalPages={totalPages}
              showIndicator={showPageNumbersInPill}
              isChangeIndicator={showPageChangeIndicator}
              isHovered={isBarHovered}
              canGoPrev={canGoPrev}
              canGoNext={canGoNext}
              onPrev={handlePrevPage}
              onNext={handleNextPage}
            />
          ) : (
            /* Expanded state - custom minimal control bar */
            <ContentContainer showContent={showContent}>
              {/* Theme toggle on the far left */}
              <ThemeToggle onToggle={() => vibrate(20)} />

              {/* Left arrow */}
              <PreviousButton onClick={handlePrevPage} disabled={!canGoPrev} />

              {/* Menu bar (TOC) in the center */}
              <TOCButton onClick={handleTOC} isActive={activeTool === 'toc'} />

              {/* Right arrow */}
              <NextButton onClick={handleNextPage} disabled={!canGoNext} />

              {/* Progress bar on the far right */}
              <ProgressBar 
                currentPage={currentPage || 1}
                totalPages={totalPages || 100}
                onPageChange={handlePageChange}
              />
            </ContentContainer>
          )}
        </BarContainer>
      </div>
    </>
  );
} 