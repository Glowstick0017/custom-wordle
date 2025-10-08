'use client';

import { LetterState } from '@/types/game';
import { memo, useRef } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface GameBoardProps {
  guesses: string[];
  currentGuess: string;
  word: string;
  maxGuesses: number;
  wordLength: number;
  letterStates: { [key: string]: LetterState[] };
}

function GameBoard({
  guesses,
  currentGuess,
  word,
  maxGuesses,
  wordLength,
  letterStates
}: GameBoardProps) {
  const { isAccessibilityMode } = useAccessibility();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Calculate scroll needs early - add safety check
  const safeMaxGuesses = Math.max(1, Math.min(maxGuesses || 6, 999));
  
  const getTileSize = (length: number) => {
    if (length === 1) return 'w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24';
    if (length <= 3) return 'w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20';
    if (length <= 5) return 'w-11 h-11 sm:w-14 sm:h-14 md:w-18 md:h-18';
    if (length <= 7) return 'w-9 h-9 sm:w-12 sm:h-12 md:w-16 md:h-16';
    if (length <= 10) return 'w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14';
    if (length <= 15) return 'w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12';
    if (length <= 20) return 'w-5 h-5 sm:w-6 sm:h-6 md:w-10 md:h-10';
    return 'w-4 h-4 sm:w-5 sm:h-5 md:w-8 md:h-8';
  };
  
  const getFontSize = (length: number) => {
    if (length === 1) return 'text-xl sm:text-3xl md:text-4xl';
    if (length <= 3) return 'text-lg sm:text-2xl md:text-3xl';
    if (length <= 5) return 'text-base sm:text-xl md:text-2xl';
    if (length <= 7) return 'text-sm sm:text-lg md:text-xl';
    if (length <= 10) return 'text-xs sm:text-base md:text-lg';
    if (length <= 15) return 'text-xs sm:text-sm md:text-base';
    if (length <= 20) return 'text-xs sm:text-xs md:text-sm';
    return 'text-xs sm:text-xs md:text-xs';
  };
  const renderRow = (guess: string, isCurrentRow: boolean, rowIndex: number) => {
    const letters = guess.split('');
    const states = letterStates[guess] || [];
    
    const getGapSize = (length: number) => {
      if (length <= 3) return 'gap-2 sm:gap-4';
      if (length <= 5) return 'gap-1.5 sm:gap-3';
      if (length <= 10) return 'gap-1 sm:gap-2';
      if (length <= 15) return 'gap-0.5 sm:gap-1.5';
      return 'gap-0.5 sm:gap-1';
    };
    
    return (
      <div 
        key={rowIndex}
        className={`flex ${getGapSize(wordLength)} justify-center mb-2 sm:mb-3`}
      >
        {Array.from({ length: wordLength }, (_, i) => {
          const letter = letters[i] || '';
          const state = states[i]?.status || 'empty';
          
          return (
            <div
              key={i}
              className={`
                    ${getTileSize(wordLength)}
                    border-2 flex items-center justify-center
                    ${getFontSize(wordLength)} font-extrabold
                    transition-all duration-200 ease-in-out
                    rounded-lg
                    ${getLetterStyle(state, letter, isCurrentRow)}
                  `}
            >
              {letter.toUpperCase()}
            </div>
          );
        })}
      </div>
    );
  };

  const getLetterStyle = (state: string, letter: string, isCurrentRow: boolean) => {
    if (!letter) {
      // Empty tiles (not yet played) - subtle neutral background
      return isAccessibilityMode
        ? 'border-white/20 bg-gray-900 text-white/50'
        : 'border-white/12 bg-gray-900/30 text-white/60';
    }

    if (isCurrentRow) {
      // Current guess tiles - subtle highlight
      return isAccessibilityMode
        ? 'border-white/80 bg-gray-600 text-white scale-102'
        : 'border-white/40 bg-gray-800 text-white scale-102';
    }

    if (isAccessibilityMode) {
      switch (state) {
        case 'correct':
          return 'border-orange-400 bg-orange-600 text-white';
        case 'present':
          return 'border-blue-400 bg-blue-600 text-white';
        case 'absent':
          return 'border-gray-400 bg-gray-600 text-white';
        default:
          return 'border-white/20 bg-gray-900 text-white/50';
      }
    }

    // Desktop-friendly, lower-contrast fills (avoid heavy gradients)
    switch (state) {
      case 'correct':
        return 'border-emerald-400 bg-emerald-600 text-white';
      case 'present':
        return 'border-yellow-400 bg-yellow-600 text-white';
      case 'absent':
        return 'border-gray-700 bg-gray-800 text-white/80';
      default:
        return 'border-white/12 bg-gray-900/30 text-white/60';
    }
  };

  const rows = [];
  
  // Add completed guesses
  guesses.forEach((guess, index) => {
    rows.push(renderRow(guess, false, index));
  });
  
  // Add current guess row if game is still active  
  const isGameActive = guesses.length < safeMaxGuesses && (!word || word === '');
  if (isGameActive) {
    rows.push(renderRow(currentGuess, true, guesses.length));
  }
  
  // Calculate if we need scrolling and progressive row display
  const currentRowOffset = isGameActive ? 1 : 0;
  const needsHorizontalScroll = wordLength > 15;
  const currentProgress = guesses.length + currentRowOffset;
  
  // Progressive row display logic
  let maxVisibleRows;
  if (safeMaxGuesses <= 6) {
    // For 6 or fewer guesses, show all rows
    maxVisibleRows = safeMaxGuesses;
  } else {
    // For more than 6 guesses, show progressively
    if (currentProgress <= 5) {
      maxVisibleRows = 6; // Start with 6 rows
    } else if (currentProgress <= safeMaxGuesses - 1) {
      maxVisibleRows = currentProgress + 1; // Show current + 1 ahead
    } else {
      maxVisibleRows = safeMaxGuesses; // Show all when at the end
    }
  }
  
  // Add empty rows up to the visible limit
  const remainingRows = Math.max(0, maxVisibleRows - guesses.length - currentRowOffset);
  
  for (let i = 0; i < remainingRows && guesses.length + i + currentRowOffset < maxVisibleRows; i++) {
    rows.push(renderRow('', false, guesses.length + i + currentRowOffset));
  }
  
  // Show indicator if there are more rows available
  const isInfiniteGuesses = maxGuesses === Infinity;
  const hasMoreRows = isInfiniteGuesses || safeMaxGuesses > maxVisibleRows;
  const remainingGuesses = isInfiniteGuesses ? Infinity : safeMaxGuesses - maxVisibleRows;

  const getContainerSize = (length: number) => {
    if (length <= 3) return 'max-w-xs sm:max-w-sm md:max-w-md';
    if (length <= 5) return 'max-w-sm sm:max-w-md md:max-w-lg';
    if (length <= 10) return 'max-w-md sm:max-w-lg md:max-w-xl';
    if (length <= 15) return 'max-w-lg sm:max-w-xl md:max-w-2xl';
    return 'max-w-full';
  };

  // Update vertical scroll detection based on visible rows
  const needsVerticalScrollNow = maxVisibleRows > 8;

  return (
    <div className="w-full h-full flex items-center justify-center p-1 sm:p-2 overflow-hidden">
      <div className={`w-full ${getContainerSize(wordLength)} h-full max-h-full overflow-hidden`}>
        {needsVerticalScrollNow ? (
          // Scrollable container for many visible rows
          <div 
            ref={scrollContainerRef}
            className={`
              h-full overflow-y-auto
              ${needsHorizontalScroll ? 'overflow-x-auto' : ''}
              game-board-scroll
            `}
          >
            <div className={`
              py-4 px-2
              ${needsHorizontalScroll ? 'min-w-max' : ''}
            `}>
              {rows}
              {hasMoreRows && (
                <div className="flex justify-center mt-4 mb-2">
                  <div className="glass-card px-4 py-2 rounded-full border border-white/20">
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse delay-100"></div>
                        <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse delay-200"></div>
                      </div>
                      <span>
                        {isInfiniteGuesses 
                          ? 'infinite more guesses available' 
                          : `${remainingGuesses} more guess${remainingGuesses !== 1 ? 'es' : ''} available`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Centered container for few rows
          <div className={`
            h-full flex flex-col items-center justify-center
            ${needsHorizontalScroll ? 'overflow-x-auto game-board-scroll' : ''}
          `}>
            <div className={needsHorizontalScroll ? 'min-w-max px-2' : ''}>
              {rows}
            </div>
            {hasMoreRows && (
              <div className="mt-6">
                <div className="glass-card px-4 py-2 rounded-full border border-white/20">
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse"></div>
                      <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse delay-100"></div>
                      <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse delay-200"></div>
                    </div>
                    <span>
                      {isInfiniteGuesses 
                        ? 'infinite more guesses available' 
                        : `${remainingGuesses} more guess${remainingGuesses !== 1 ? 'es' : ''} available`
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(GameBoard); 