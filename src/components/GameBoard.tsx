'use client';

import { LetterState } from '@/types/game';
import { CSSProperties, memo, useRef } from 'react';
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
    if (length === 1) return 'w-14 h-14 sm:w-[clamp(4rem,8.5svh,5rem)] sm:h-[clamp(4rem,8.5svh,5rem)] md:w-[clamp(4rem,8.5svh,6rem)] md:h-[clamp(4rem,8.5svh,6rem)]';
    if (length <= 3) return 'w-12 h-12 sm:w-[clamp(3.5rem,8svh,4rem)] sm:h-[clamp(3.5rem,8svh,4rem)] md:w-[clamp(3.5rem,8svh,4.5rem)] md:h-[clamp(3.5rem,8svh,4.5rem)]';
    if (length <= 5) return 'w-10 h-10 sm:w-[clamp(3rem,7.2svh,3.5rem)] sm:h-[clamp(3rem,7.2svh,3.5rem)] md:w-[clamp(3rem,7.2svh,4rem)] md:h-[clamp(3rem,7.2svh,4rem)]';
    if (length <= 7) return 'w-8 h-8 sm:w-[clamp(2.75rem,7svh,3rem)] sm:h-[clamp(2.75rem,7svh,3rem)] md:w-[clamp(2.75rem,7svh,3.5rem)] md:h-[clamp(2.75rem,7svh,3.5rem)]';
    if (length <= 10) return 'w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12';
    if (length <= 15) return 'w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10';
    if (length <= 20) return 'w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8';
    return 'w-3 h-3 sm:w-5 sm:h-5 md:w-6 md:h-6';
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
        className={`game-board-row flex ${getGapSize(wordLength)} justify-center mb-2 sm:mb-3`}
      >
        {Array.from({ length: wordLength }, (_, i) => {
          const letter = letters[i] || '';
          const state = states[i]?.status || 'empty';
          
          return (
            <div
              key={i}
              className={`
                game-board-tile
                ${getTileSize(wordLength)}
                border-2 flex items-center justify-center
                ${getFontSize(wordLength)} font-bold
                transition-all duration-300
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
      // Empty tiles (not yet played) - make them more subtle
      return isAccessibilityMode 
        ? 'border-white/20 bg-gray-900 text-white/50'
        : 'border-white/10 bg-white/5 text-white/30';
    }
    
    if (isCurrentRow) {
      // Current guess tiles - make them stand out more
      return isAccessibilityMode
        ? 'border-white/80 bg-gray-600 text-white scale-105'
        : 'border-white/60 bg-white/10 text-white scale-105 shadow-lg shadow-white/10';
    }
    
    if (isAccessibilityMode) {
      switch (state) {
        case 'correct':
          return 'border-orange-400 bg-orange-600 text-white'; // High contrast orange
        case 'present':
          return 'border-blue-400 bg-blue-600 text-white'; // High contrast blue
        case 'absent':
          return 'border-gray-400 bg-gray-600 text-white'; // High contrast gray
        default:
          return 'border-white/20 bg-gray-900 text-white/50';
      }
    }
    
    switch (state) {
      case 'correct':
        return 'border-emerald-400 btn-gradient-primary text-white shadow-lg shadow-emerald-500/40';
      case 'present':
        return 'border-yellow-400 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/40';
      case 'absent':
        return 'border-gray-700 bg-gray-800 text-white/70 shadow-lg shadow-black/30';
      default:
        return 'border-white/10 bg-white/5 text-white/30';
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

  const getContainerMaxWidth = (length: number) => {
    if (length <= 3) return '28rem';
    if (length <= 5) return '32rem';
    if (length <= 10) return '36rem';
    if (length <= 15) return '42rem';
    return '100cqw';
  };

  const getCompactTileMax = (length: number) => {
    if (length === 1) return '6rem';
    if (length <= 3) return '4.5rem';
    if (length <= 5) return '4rem';
    if (length <= 7) return '3.5rem';
    if (length <= 10) return '3rem';
    if (length <= 15) return '2.5rem';
    if (length <= 20) return '2rem';
    return '1.5rem';
  };

  const visibleRowCount = Math.max(rows.length, 1);
  const compactBoardStyle = {
    '--compact-tile-max': getCompactTileMax(wordLength),
    '--fit-height-tile-size': `calc((100cqh - ${Math.max(visibleRowCount - 1, 0) * 8}px - 1.5rem) / ${visibleRowCount})`,
    '--fit-width-tile-size': `calc((min(100cqw, ${getContainerMaxWidth(wordLength)}) - ${Math.max(wordLength - 1, 0) * 8}px - 1rem) / ${Math.max(wordLength, 1)})`,
  } as CSSProperties;

  // Update vertical scroll detection based on visible rows
  const needsVerticalScrollNow = maxVisibleRows > 8;

  return (
    <div
      className="game-board-frame w-full h-full flex items-center justify-center p-1 sm:p-2 overflow-hidden"
      style={compactBoardStyle}
    >
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
            game-board-centered h-full flex flex-col items-center
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
