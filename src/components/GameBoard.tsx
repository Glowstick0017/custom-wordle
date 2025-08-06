'use client';

import { LetterState } from '@/types/game';
import { useEffect, useRef } from 'react';

interface GameBoardProps {
  guesses: string[];
  currentGuess: string;
  word: string;
  maxGuesses: number;
  wordLength: number;
  letterStates: { [key: string]: LetterState[] };
}

export default function GameBoard({
  guesses,
  currentGuess,
  word,
  maxGuesses,
  wordLength,
  letterStates
}: GameBoardProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentRowRef = useRef<HTMLDivElement>(null);
  
  // Calculate scroll needs early - add safety check
  const safeMaxGuesses = Math.max(1, Math.min(maxGuesses || 6, 999));
  const needsVerticalScroll = safeMaxGuesses > 8;
  
  // Auto-scroll to current row when guesses change
  useEffect(() => {
    if (currentRowRef.current && scrollContainerRef.current && needsVerticalScroll) {
      const currentRow = currentRowRef.current;
      
      // Only scroll if we have many rows and are actively playing
      if (guesses.length >= 6) {
        // Small delay to ensure the DOM has updated
        setTimeout(() => {
          currentRow.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest'
          });
        }, 50);
      }
    }
  }, [guesses.length, currentGuess, needsVerticalScroll]);
  
  const getTileSize = (length: number) => {
    if (length === 1) return 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24';
    if (length <= 3) return 'w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18';
    if (length <= 5) return 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16';
    if (length <= 7) return 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14';
    if (length <= 10) return 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12';
    if (length <= 15) return 'w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10';
    if (length <= 20) return 'w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8';
    return 'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6';
  };
  
  const getFontSize = (length: number) => {
    if (length === 1) return 'text-2xl sm:text-3xl md:text-4xl';
    if (length <= 3) return 'text-xl sm:text-2xl md:text-3xl';
    if (length <= 5) return 'text-lg sm:text-xl md:text-2xl';
    if (length <= 7) return 'text-base sm:text-lg md:text-xl';
    if (length <= 10) return 'text-sm sm:text-base md:text-lg';
    if (length <= 15) return 'text-xs sm:text-sm md:text-base';
    if (length <= 20) return 'text-xs sm:text-xs md:text-sm';
    return 'text-xs sm:text-xs md:text-xs';
  };
  const renderRow = (guess: string, isCurrentRow: boolean, rowIndex: number) => {
    const letters = guess.split('');
    const states = letterStates[guess] || [];
    
    const getGapSize = (length: number) => {
      if (length <= 3) return 'gap-3 sm:gap-4';
      if (length <= 5) return 'gap-2 sm:gap-3';
      if (length <= 10) return 'gap-1.5 sm:gap-2';
      if (length <= 15) return 'gap-1 sm:gap-1.5';
      return 'gap-0.5 sm:gap-1';
    };
    
    return (
      <div 
        key={rowIndex} 
        ref={isCurrentRow ? currentRowRef : null}
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
      return 'border-slate-600 bg-slate-800/50 text-slate-400';
    }
    
    if (isCurrentRow) {
      return 'border-slate-600 bg-slate-700/70 text-white';
    }
    
    switch (state) {
      case 'correct':
        return 'border-emerald-500 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30';
      case 'present':
        return 'border-amber-500 bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30';
      case 'absent':
        return 'border-slate-500 bg-gradient-to-br from-slate-600 to-slate-700 text-white shadow-lg shadow-slate-500/20';
      default:
        return 'border-slate-600 bg-slate-800/50 text-slate-400';
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
  
  // Calculate if we need scrolling
  const currentRowOffset = isGameActive ? 1 : 0;
  const needsHorizontalScroll = wordLength > 15;
  
  // Add empty rows - limit to prevent infinite rows
  const remainingRows = Math.max(0, safeMaxGuesses - guesses.length - currentRowOffset);
  const maxDisplayRows = needsVerticalScroll ? Math.min(remainingRows, 20) : Math.min(remainingRows, 8);
  
  for (let i = 0; i < maxDisplayRows && i < remainingRows && rows.length < 100; i++) {
    rows.push(renderRow('', false, guesses.length + i + currentRowOffset));
  }

  const getContainerSize = (length: number) => {
    if (length <= 3) return 'max-w-xs sm:max-w-sm md:max-w-md';
    if (length <= 5) return 'max-w-sm sm:max-w-md md:max-w-lg';
    if (length <= 10) return 'max-w-md sm:max-w-lg md:max-w-xl';
    if (length <= 15) return 'max-w-lg sm:max-w-xl md:max-w-2xl';
    return 'max-w-full';
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <div className={`w-full ${getContainerSize(wordLength)} h-full max-h-full`}>
        {needsVerticalScroll ? (
          // Scrollable container for many rows
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
            </div>
          </div>
        ) : (
          // Centered container for few rows
          <div className={`
            h-full flex items-center justify-center
            ${needsHorizontalScroll ? 'overflow-x-auto game-board-scroll' : ''}
          `}>
            <div className={needsHorizontalScroll ? 'min-w-max px-2' : ''}>
              {rows}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 