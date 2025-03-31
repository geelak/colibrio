'use client';
import { useState, useRef, useEffect } from 'react';
import { useTheme, ThemeOptions } from '@contexts/ThemeContext';

export default function CollapsibleUIBar({ 
  currentPage, 
  totalPages, 
  canGoNext, 
  canGoPrev, 
  readerViewRef 
}) {
  // Get theme context
  const { activeTheme, toggleTheme, isDark } = useTheme();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [longPressActive, setLongPressActive] = useState(false);
  const [showHint, setShowHint] = useState(true); // For first-time hint animation
  const [showPageInfo, setShowPageInfo] = useState(false); // For toggling page info visibility
  const [isInteractionLocked, setIsInteractionLocked] = useState(false); // Prevent rapid interactions
  const [showContent, setShowContent] = useState(false); // Control content visibility during animation
  const [holdProgress, setHoldProgress] = useState(0); // Track progress of hold gesture (0-100)
  const [showPageChangeIndicator, setShowPageChangeIndicator] = useState(false); // Show page number after page change
  
  const timerRef = useRef(null);
  const lockTimerRef = useRef(null);
  const contentTimerRef = useRef(null);
  const pageChangeTimerRef = useRef(null);
  const barRef = useRef(null);
  const animationFrameRef = useRef(null);
  const holdStartTimeRef = useRef(null);
  const lastPageRef = useRef(currentPage);
  
  // Timeout duration for long press (in milliseconds)
  const longPressDuration = 500;
  const interactionLockTime = 550; // Lock interactions for animation time + buffer
  const contentDelay = 150; // Delay before showing content during expansion
  const pageChangeDisplayTime = 1000; // Time to show page numbers after page change (ms)
  
  // Function to handle vibration
  const vibrate = (pattern) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (err) {
        console.log('Vibration API error or not supported');
      }
    }
  };
  
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
      
      // Store the current page as the last page
      lastPageRef.current = currentPage;
      
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
  
  // Handle start of press/touch
  const handlePressStart = (e) => {
    // Prevent default to avoid selection issues on mobile
    e.preventDefault();
    
    // Don't start new interactions if locked
    if (isInteractionLocked) return;
    
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
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (barRef.current && !barRef.current.contains(event.target)) {
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

  // Hide hint after 10 seconds even if not interacted with
  useEffect(() => {
    const hintTimer = setTimeout(() => setShowHint(false), 10000);
    return () => clearTimeout(hintTimer);
  }, []);

  // Handle hover for showing page info
  const handleMouseEnter = () => {
    if (!isExpanded && !isInteractionLocked) {
      setShowPageInfo(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isExpanded) {
      setShowPageInfo(false);
    }
    handlePressEnd();
  };

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
  
  // Add a class for the animated content
  const contentAnimationClass = showContent ? 'scale-100 opacity-100' : 'scale-0 opacity-0';
  
  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center items-end z-50">
      {/* External pulse effect for hold gesture */}
      {holdProgress > 0 && holdProgress < 100 && !isExpanded && (
        <div className="absolute bottom-0 w-16 h-16 rounded-full animate-ping" 
             style={{ 
               backgroundColor: 'var(--color-primary-light)',
               opacity: holdProgress / 150 + 0.15,
               transform: `scale(${1 + (holdProgress / 100)})` 
             }} />
      )}

      <div 
        ref={barRef}
        className={`backdrop-blur-md rounded-full cursor-pointer
                  transition-all duration-300 ease-in-out relative
                  ${isExpanded ? 'px-6 py-2.5' : 'px-3 py-1'}`}
        style={{
          backgroundColor: 'rgba(var(--color-background-rgb), 0.75)',
          width: isExpanded ? '90%' : 'auto',
          maxWidth: isExpanded ? '90%' : 'max-content',
          minWidth: isExpanded ? 'auto' : '60px', 
          transform: `scale(${longPressActive ? '1.05' : '1'})`,
          transformOrigin: 'bottom center',
          boxShadow: longPressActive ? 'var(--shadow-large)' : 'var(--shadow-small)',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onClick={handleClick}
      >
        {/* Border progress ring */}
        {holdProgress > 0 && holdProgress < 100 && !isExpanded && (
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-10">
            {/* Border progress indicator */}
            <div 
              className="absolute inset-0 border-2 rounded-full"
              style={{ 
                borderColor: 'var(--color-primary)',
                clipPath: `polygon(0% 0%, ${holdProgress}% 0%, ${holdProgress}% 100%, 0% 100%)` 
              }}
            ></div>
            
            {/* Radial color fill */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{ 
                backgroundColor: 'var(--color-primary-light)',
                opacity: 0.2,
                transform: `scale(${holdProgress / 100})` 
              }}
            ></div>
          </div>
        )}

        {/* Hint animation for press-and-hold */}
        {showHint && !isExpanded && holdProgress === 0 && (
          <div className="absolute inset-0 rounded-full animate-pulse pointer-events-none"
               style={{ backgroundColor: 'var(--color-primary-light)', opacity: 0.2 }}></div>
        )}

        {/* Collapsed state - simple pill with page indicator */}
        {!isExpanded ? (
          <div className="flex items-center justify-center h-full relative z-20 overflow-hidden">
            <div 
              className={`flex items-center justify-center transition-all duration-300 ease-in-out origin-center`}
              style={{
                transform: showPageNumbersInPill ? 'scale(1)' : 'scale(0)',
                opacity: showPageNumbersInPill ? 1 : 0,
                maxWidth: showPageNumbersInPill ? '200px' : '0',
                maxHeight: showPageNumbersInPill ? '26px' : '0',
                overflow: 'hidden'
              }}
            >
              <span 
                className={`text-xs font-medium leading-none whitespace-nowrap px-1
                          ${showPageChangeIndicator ? 'font-bold animate-pulse-once' : ''}`}
                style={{ 
                  color: showPageChangeIndicator ? 'var(--color-primary)' : 'var(--color-text-secondary)'
                }}
              >
                {currentPage} / {totalPages || '--'}
              </span>
            </div>
          </div>
        ) : (
          /* Expanded state - full control bar */
          <div 
            className={`flex items-center gap-4 w-full transition-all duration-300 ease-in-out origin-center ${contentAnimationClass}`}
            style={{ 
              visibility: showContent ? 'visible' : 'hidden',
            }}
          >
            {/* Account button */}
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                console.log('Account settings clicked');
                vibrate(20);
              }}
              className="p-2 rounded-full flex-shrink-0 transition-colors hover:text-text"
              style={{ color: 'var(--color-text-secondary)' }}
              aria-label="Account settings"
              title="Account settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
            
            {/* Reading options button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('Reading options clicked');
                vibrate(20);
              }}
              className="p-2 rounded-full flex-shrink-0 transition-colors hover:text-text"
              style={{ color: 'var(--color-text-secondary)' }}
              aria-label="Reading options"
              title="Reading options"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
            
            {/* Table of contents button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('Table of contents clicked');
                vibrate(20);
              }}
              className="p-2 rounded-full flex-shrink-0 transition-colors hover:text-text"
              style={{ color: 'var(--color-text-secondary)' }}
              aria-label="Table of contents"
              title="Table of contents"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            
            {/* Search button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('Search clicked');
                vibrate(20);
              }}
              className="p-2 rounded-full flex-shrink-0 transition-colors hover:text-text"
              style={{ color: 'var(--color-text-secondary)' }}
              aria-label="Search in book"
              title="Search in book"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            <div className="h-8 w-px mx-1 flex-shrink-0" style={{ backgroundColor: 'var(--color-border)' }}></div>

            {/* Navigation controls */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                readerViewRef.current?.previous();
                vibrate(20);
              }}
              disabled={!canGoPrev}
              className="text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0 transition-colors hover:text-text"
              style={{ 
                color: 'var(--color-text)',
                opacity: canGoPrev ? 1 : 0.3,
                whiteSpace: 'nowrap'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block flex-shrink-0">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              <span>Prev</span>
            </button>
            
            <span className="text-xs tabular-nums flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
              {currentPage} / {totalPages || '--'}
            </span>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                readerViewRef.current?.next();
                vibrate(20);
              }}
              disabled={!canGoNext}
              className="text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0 transition-colors hover:text-text"
              style={{ 
                color: 'var(--color-text)',
                opacity: canGoNext ? 1 : 0.3,
                whiteSpace: 'nowrap'
              }}
            >
              <span>Next</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block flex-shrink-0">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            {/* Progress slider */}
            <div className="w-48 flex items-center flex-shrink-0">
              <input 
                type="range" 
                min="1" 
                max={totalPages || 100} 
                value={currentPage || 1}
                onChange={(e) => {
                  const newPage = parseInt(e.target.value, 10);
                  console.log(`Jumping to page ${newPage}`);
                  
                  if (readerViewRef.current) {
                    const timeline = readerViewRef.current.getPageProgressionTimeline();
                    if (timeline) {
                      // Use goToPage instead of goToPageIndex to fix linter error
                      timeline.goToPage(newPage);
                    }
                  }
                }}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  backgroundColor: 'var(--color-background-alt)',
                  accentColor: 'var(--color-primary)'
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="h-8 w-px mx-1 flex-shrink-0" style={{ backgroundColor: 'var(--color-border)' }}></div>

            {/* Theme toggle button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleTheme();
                vibrate(20);
              }}
              className="p-2 rounded-full flex-shrink-0 transition-colors hover:text-text"
              style={{ color: 'var(--color-text-secondary)' }}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                // Sun icon for dark mode (to switch to light)
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                // Moon icon for light mode (to switch to dark)
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>
            
            {/* Bookmark button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('Bookmark page clicked');
                vibrate(20);
              }}
              className="p-2 rounded-full flex-shrink-0 transition-colors hover:text-text"
              style={{ color: 'var(--color-text-secondary)' }}
              aria-label="Bookmark this page"
              title="Bookmark this page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 