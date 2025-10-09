'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface TimerProps {
  timeRemaining: number;
  timeLimit: number;
  isPaused?: boolean;
}

export default function Timer({ timeRemaining, timeLimit, isPaused = false }: TimerProps) {
  const { isAccessibilityMode } = useAccessibility();
  const [isWarning, setIsWarning] = useState(false);
  
  useEffect(() => {
    setIsWarning(timeRemaining <= 10 && timeRemaining > 0);
  }, [timeRemaining]);

  const percentage = (timeRemaining / timeLimit) * 100;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const getProgressColor = () => {
    if (isAccessibilityMode) {
      if (percentage > 50) return 'bg-green-500';
      if (percentage > 20) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    if (percentage > 50) return 'bg-gradient-to-r from-emerald-400 to-emerald-500';
    if (percentage > 20) return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    return 'bg-gradient-to-r from-red-500 to-red-600';
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className={`glass-card p-3 sm:p-4 rounded-xl border ${
        isAccessibilityMode 
          ? (isWarning ? 'border-red-400' : 'border-white/40')
          : (isWarning ? 'border-red-400 shadow-lg shadow-red-500/30' : 'border-white/20')
      } ${isWarning && !isPaused ? 'animate-pulse' : ''}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${
              isAccessibilityMode 
                ? (isWarning ? 'text-red-400' : 'text-white')
                : (isWarning ? 'text-red-400' : 'text-white/80')
            }`} />
            <span className="text-xs sm:text-sm text-white/70">Time Remaining</span>
          </div>
          <div className={`text-lg sm:text-2xl font-bold font-mono ${
            isAccessibilityMode 
              ? (isWarning ? 'text-red-400' : 'text-white')
              : (isWarning ? 'text-red-400' : 'gradient-text')
          }`}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className={`w-full h-2 sm:h-3 rounded-full overflow-hidden ${
          isAccessibilityMode ? 'bg-gray-700' : 'bg-white/10'
        }`}>
          <div 
            className={`h-full transition-all duration-1000 ease-linear ${getProgressColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {isPaused && (
          <div className="mt-2 text-center text-xs text-white/60">
            ⏸️ Timer paused
          </div>
        )}
      </div>
    </div>
  );
}
