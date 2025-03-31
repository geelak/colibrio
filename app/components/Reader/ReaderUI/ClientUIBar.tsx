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

export default function ClientUIBar({ 
  currentPage, 
  totalPages, 
  canGoNext, 
  canGoPrev, 
  readerViewRef 
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
  const [holdProgress, setHoldProgress] = useState(0);
  const [showPageChangeIndicator, setShowPageChangeIndicator] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTool, setActiveTool] = useState<'toc' | 'search' | 'settings' | 'account' | null>(null);
  const [isBarHovered, setIsBarHovered] = useState(false);
  
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
  
  // Function to update hold progress animation
  const updateHoldProgress = () => {
    if (!holdStartTimeRef.current) return;
    
    const elapsed = Date.now() - holdStartTimeRef.current;
    // Adjust the progress calculation to make the visual fill slightly ahead
    // Multiply by 1.1 (110%) to ensure it reaches 100% before activation
    const progress = Math.min(100, (elapsed / longPressDuration) * 110);
    
    setHoldProgress(progress);
    
    if (progress < 100) {
      // Continue animation until complete
      animationFrameRef.current = requestAnimationFrame(updateHoldProgress);
    } else {
      // Small vibration on completion for tactile feedback
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
    // Reset hold animation
    holdStartTimeRef.current = null;
    setHoldProgress(0);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Clear the timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // Reset long press state (but keep expanded state if it was expanded)
    setLongPressActive(false);
  };
  
  // Handle start of press/touch with a check for nav button clicks
  const handlePressStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent default to avoid selection issues on mobile
    e.preventDefault();
    
    // Don't start new interactions if locked
    if (isInteractionLocked) return;
    
    // Don't start long press if this was a navigation button click
    // We'll check this with a small delay to allow the nav button to be pressed
    if (navButtonClickedRef.current) return;
    
    // Set start time for progress animation
    holdStartTimeRef.current = Date.now();
    
    // Start progress animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setHoldProgress(0);
    animationFrameRef.current = requestAnimationFrame(updateHoldProgress);
    
    // Initial "tap" vibration
    vibrate(10);
    
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Set a new timer for long press
    timerRef.current = setTimeout(() => {
      setLongPressActive(true);
      setIsExpanded(true);
      setShowHint(false); // Hide the hint after first successful expand
      
      // Lock interactions during and shortly after animation
      setIsInteractionLocked(true);
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
      lockTimerRef.current = setTimeout(() => {
        setIsInteractionLocked(false);
      }, interactionLockTime);
    }, longPressDuration);
  };
  
  // Handle end of press/touch
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
  const handleMouseEnter = () => {
    if (!isExpanded && !isInteractionLocked) {
      setShowPageInfo(true);
      setIsBarHovered(true);
    }
  };

  const handleMouseLeave = () => {
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
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          onClick={handleClick}
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
            /* Expanded state - full control bar */
            <ContentContainer showContent={showContent}>
              <ButtonGroup 
                onBookmark={handleBookmark}
                onTOC={handleTOC}
                onSearch={handleSearch}
                onSettings={handleSettings}
                onAccount={handleAccount}
                isBookmarked={isBookmarked}
                activeTool={activeTool}
              />
              
              <Divider />
              
              <NavigationControls 
                canGoPrev={canGoPrev}
                canGoNext={canGoNext}
                onPrev={handlePrevPage}
                onNext={handleNextPage}
              />
              
              <PageIndicator 
                currentPage={currentPage}
                totalPages={totalPages}
                showIndicator={true}
              />
              
              <ProgressBar 
                currentPage={currentPage || 1}
                totalPages={totalPages || 100}
                onPageChange={handlePageChange}
              />
              
              <Divider />
              
              <ThemeToggle onToggle={() => vibrate(20)} />
            </ContentContainer>
          )}
        </BarContainer>
      </div>
    </>
  );
} 