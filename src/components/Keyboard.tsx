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
      flex-1 h-12 sm:h-14 rounded-md font-bold text-sm sm:text-base
      transition-all duration-150 active:scale-95 active:brightness-110
      flex items-center justify-center min-w-0 shadow-lg
      min-h-[48px] sm:min-h-[56px] touch-manipulation
      border border-white/10 user-select-none
      min-w-[32px] sm:min-w-[40px]
    `;
    
    if (disabled) {
      return `${baseStyle} glass-card text-white/30 cursor-not-allowed`;
    }
    
    switch (state) {
      case 'correct':
        return `${baseStyle} btn-gradient-primary text-white shadow-emerald-500/40 border-emerald-400/30`;
      case 'present':
        return `${baseStyle} bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/40 border-yellow-400/30`;
      case 'absent':
        return `${baseStyle} bg-gray-900/80 text-gray-500/60 shadow-black/50 border-gray-700/30 brightness-50 opacity-60`;
      default:
        return `${baseStyle} bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm text-white border-blue-400/30 hover:border-blue-300/50 hover:shadow-blue-400/30 hover:shadow-lg hover:from-blue-400/30 hover:to-purple-400/30 hover:brightness-110`;
    }
  };

  const specialKeyStyle = `
    h-12 sm:h-14 px-2 sm:px-4 rounded-md font-bold text-xs sm:text-sm
    transition-all duration-150 active:scale-95 active:brightness-110
    flex items-center justify-center shadow-lg
    min-h-[48px] sm:min-h-[56px] min-w-[52px] sm:min-w-[65px] touch-manipulation
    border border-white/10 user-select-none
    ${disabled 
      ? 'glass-card text-white/30 cursor-not-allowed border-white/5' 
      : 'btn-gradient-secondary text-white border-orange-400/30 hover:border-orange-400/40'
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
    <div className="w-full max-w-lg mx-auto p-2 sm:p-4 keyboard-container">
      {/* Top row - Q W E R T Y U I O P */}
      <div className="flex gap-1 sm:gap-2 mb-2 sm:mb-3 justify-center">
        {topRow.map(renderKey)}
      </div>
      
      {/* Middle row - A S D F G H J K L (offset for natural keyboard feel) */}
      <div className="flex gap-1 sm:gap-2 mb-2 sm:mb-3 justify-center px-3 sm:px-4">
        {middleRow.map(renderKey)}
      </div>
      
      {/* Bottom row - ENTER Z X C V B N M DELETE */}
      <div className="flex gap-1 sm:gap-2 justify-center">
        <button
          className={`${specialKeyStyle} keyboard-key`}
          onClick={() => !disabled && onEnter()}
          disabled={disabled}
          aria-label="Enter"
        >
          <CornerDownLeft size={14} className="sm:mr-1" />
          <span className="hidden sm:inline text-xs font-bold">ENTER</span>
          <span className="sm:hidden text-xs font-bold">⏎</span>
        </button>
        
        <div className="flex gap-1 sm:gap-2 flex-1 justify-center">
          {bottomRow.map(renderKey)}
        </div>
        
        <button
          className={`${specialKeyStyle} keyboard-key`}
          onClick={() => !disabled && onBackspace()}
          disabled={disabled}
          aria-label="Delete"
        >
          <Delete size={14} className="sm:mr-1" />
          <span className="hidden sm:inline text-xs font-bold">DEL</span>
          <span className="sm:hidden text-xs font-bold">⌫</span>
        </button>
      </div>
    </div>
  );
} 