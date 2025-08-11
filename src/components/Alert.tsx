'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';

export interface AlertProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isOpen: boolean;
  onClose: () => void;
  duration?: number; // Auto close after duration (ms), default 4000ms
  inModal?: boolean; // Whether the alert is displayed within a modal
}

export default function Alert({ message, type, isOpen, onClose, duration = 4000, inModal = false }: AlertProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      
      // Auto close after duration
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  if (!isOpen) return null;

  const getAlertStyles = () => {
    const baseStyles = inModal ? 'backdrop-blur-xl bg-gray-900/95' : 'glass-card';
    switch (type) {
      case 'success':
        return `border-emerald-400/80 ${baseStyles} text-emerald-100 ${inModal ? 'bg-emerald-900/90' : ''}`;
      case 'error':
        return `border-red-400/80 ${baseStyles} text-red-100 ${inModal ? 'bg-red-900/90' : ''}`;
      case 'info':
        return `border-blue-400/80 ${baseStyles} text-blue-100 ${inModal ? 'bg-blue-900/90' : ''}`;
      default:
        return `border-white/50 ${baseStyles} text-white/95`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${inModal ? 'fixed top-16 left-1/2 transform -translate-x-1/2 z-[110]' : 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50'} w-full max-w-md px-4`}>
      <div
        className={`
          ${getAlertStyles()}
          ${inModal ? 'border-3' : 'border-2'} rounded-xl p-4 shadow-2xl
          transform transition-all duration-300 ease-in-out
          ${isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'}
          ${inModal ? 'ring-2 ring-white/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] border-opacity-100' : ''}
        `}
      >
        <div className="flex items-center gap-3">
          {getIcon()}
          
          <div className="flex-1">
            <p className="font-medium text-sm sm:text-base whitespace-pre-line">
              {message}
            </p>
          </div>
          
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors duration-200 flex items-center justify-center"
            aria-label="Close alert"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for managing alerts
export function useAlert(inModal: boolean = false) {
  const [alert, setAlert] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isOpen: boolean;
  }>({
    message: '',
    type: 'info',
    isOpen: false
  });

  const showAlert = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setAlert({ message, type, isOpen: true });
  }, []);

  const closeAlert = useCallback(() => {
    setAlert(prev => ({ ...prev, isOpen: false }));
  }, []);

  const AlertComponent = useMemo(() => {
    return () => (
      <Alert
        message={alert.message}
        type={alert.type}
        isOpen={alert.isOpen}
        onClose={closeAlert}
        inModal={inModal}
      />
    );
  }, [alert.message, alert.type, alert.isOpen, closeAlert, inModal]);

  return {
    showAlert,
    closeAlert,
    AlertComponent
  };
} 