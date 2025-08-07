'use client';

import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-80 transition-opacity backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative glass-card rounded-xl shadow-2xl w-full max-w-lg mx-2 sm:mx-4 max-h-[90vh] overflow-hidden border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 glass-card">
          <h2 className="text-xl font-bold gradient-text">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 glass-card glass-card-hover rounded-lg transition-all duration-300 text-white/70 hover:text-white flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)] text-white">
          {children}
        </div>
      </div>
    </div>
  );
} 