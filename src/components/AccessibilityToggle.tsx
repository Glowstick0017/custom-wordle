'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface AccessibilityToggleProps {
  className?: string;
  showText?: boolean;
}

export default function AccessibilityToggle({ className = '', showText = true }: AccessibilityToggleProps) {
  const { isAccessibilityMode, toggleAccessibilityMode } = useAccessibility();

  return (
    <button
      onClick={toggleAccessibilityMode}
      className={`rounded-lg sm:rounded-xl flex items-center justify-center font-medium text-sm ${
        showText ? 'px-3 py-2 gap-2' : 'p-2 sm:p-3'
      } ${
        isAccessibilityMode
          ? 'bg-blue-600 text-white border-2 border-blue-500'
          : 'glass-card glass-card-hover border border-white/20 text-white/80 hover:text-white transition-all duration-300'
      } ${className}`}
      title={`${isAccessibilityMode ? 'Disable' : 'Enable'} Accessibility Mode`}
      aria-label={`${isAccessibilityMode ? 'Disable' : 'Enable'} Accessibility Mode`}
    >
      {isAccessibilityMode ? (
        <Eye className={showText ? 'w-4 h-4' : 'w-[18px] h-[18px] sm:w-5 sm:h-5'} />
      ) : (
        <EyeOff className={showText ? 'w-4 h-4' : 'w-[18px] h-[18px] sm:w-5 sm:h-5'} />
      )}
      {showText && <span className="hidden sm:inline">Accessibility</span>}
    </button>
  );
}
