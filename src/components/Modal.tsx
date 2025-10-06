'use client';

import { X } from 'lucide-react';
import { ReactNode } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const { isAccessibilityMode } = useAccessibility();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" role="dialog" aria-modal="true">
      {/* Backdrop - increased opacity for readability without blur */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-90"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={`relative rounded-xl w-full max-w-lg mx-2 sm:mx-4 max-h-[90vh] overflow-hidden ${
          isAccessibilityMode 
            ? 'bg-gray-800 border-2 border-white/40' 
            : 'bg-slate-900/95 shadow-2xl border border-white/30'
        }`} 
        data-preserve-transitions
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 sm:p-6 border-b ${
          isAccessibilityMode 
            ? 'border-white/30 bg-gray-700' 
            : 'border-white/20 bg-slate-800/90'
        }`}>
          <h2 className={`text-xl font-bold ${
            isAccessibilityMode ? 'text-white' : 'gradient-text'
          }`}>{title}</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg flex items-center justify-center ${
              isAccessibilityMode
                ? 'bg-gray-600 text-white hover:bg-gray-500 border-2 border-white/40'
                : 'bg-slate-700/90 hover:bg-slate-600/90 transition-colors text-white/90 hover:text-white border border-white/20'
            }`}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="relative">
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)] text-white">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 