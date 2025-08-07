'use client';

import { KeyboardKey } from '@/types/game';
import { Delete, CornerDownLeft } from 'lucide-react';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  keyStates: { [key: string]: KeyboardKey };
  disabled: boolean;
}

export default function Keyboard({
  onKeyPress,
  onEnter,
  onBackspace,
  keyStates,
  disabled
}: KeyboardProps) {
  const topRow = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  const middleRow = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  const bottomRow = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

  const getKeyStyle = (key: string) => {
    const state = keyStates[key]?.status || 'unused';
    const baseStyle = `
      flex-1 h-10 sm:h-14 rounded-lg font-bold text-xs sm:text-base
      transition-all duration-200 active:scale-95
      flex items-center justify-center min-w-0 shadow-lg
      min-h-[40px] sm:min-h-[48px] touch-manipulation
    `;
    
    if (disabled) {
      return `${baseStyle} glass-card text-white/30 cursor-not-allowed`;
    }
    
    switch (state) {
      case 'correct':
        return `${baseStyle} btn-gradient-primary text-white shadow-emerald-500/40`;
      case 'present':
        return `${baseStyle} bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/40`;
      case 'absent':
        return `${baseStyle} glass-card text-white/60 shadow-black/20`;
      default:
        return `${baseStyle} glass-card glass-card-hover text-white`;
    }
  };

  const specialKeyStyle = `
    h-10 sm:h-14 px-1 sm:px-4 rounded-lg font-bold text-xs sm:text-sm
    transition-all duration-200 active:scale-95
    flex items-center justify-center shadow-lg
    min-h-[40px] sm:min-h-[48px] min-w-[40px] sm:min-w-[50px] touch-manipulation
    ${disabled 
      ? 'glass-card text-white/30 cursor-not-allowed' 
      : 'btn-gradient-secondary text-white'
    }
  `;

  const renderKey = (key: string) => (
    <button
      key={key}
      className={`${getKeyStyle(key)} keyboard-key`}
      onClick={() => !disabled && onKeyPress(key)}
      disabled={disabled}
    >
      {key}
    </button>
  );

  return (
    <div className="w-full max-w-lg mx-auto p-1 sm:p-4 keyboard-container overflow-hidden">
      {      /* Top row */}
      <div className="flex gap-0.5 sm:gap-2 mb-1 sm:mb-2">
        {topRow.map(renderKey)}
      </div>
      
      {      /* Middle row */}
      <div className="flex gap-0.5 sm:gap-2 mb-1 sm:mb-2 px-1 sm:px-4">
        {middleRow.map(renderKey)}
      </div>
      
      {      /* Bottom row */}
      <div className="flex gap-0.5 sm:gap-2">
        <button
          className={`${specialKeyStyle} keyboard-key`}
          onClick={() => !disabled && onEnter()}
          disabled={disabled}
        >
          <CornerDownLeft size={16} className="sm:mr-1" />
          <span className="hidden sm:inline text-xs">ENTER</span>
        </button>
        
        <div className="flex gap-0.5 sm:gap-2 flex-1">
          {bottomRow.map(renderKey)}
        </div>
        
        <button
          className={`${specialKeyStyle} keyboard-key`}
          onClick={() => !disabled && onBackspace()}
          disabled={disabled}
        >
          <Delete size={16} className="sm:mr-1" />
          <span className="hidden sm:inline text-xs">DEL</span>
        </button>
      </div>
    </div>
  );
} 