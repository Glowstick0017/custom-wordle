'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface AccessibilityContextType {
  isAccessibilityMode: boolean;
  toggleAccessibilityMode: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [isAccessibilityMode, setIsAccessibilityMode] = useState(false);

  // Load accessibility mode preference from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('glowdle-accessibility-mode');
    if (stored) {
      setIsAccessibilityMode(JSON.parse(stored));
    }
  }, []);

  // Save accessibility mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('glowdle-accessibility-mode', JSON.stringify(isAccessibilityMode));
    
    // Add/remove accessibility class to body for global styles
    if (isAccessibilityMode) {
      document.body.classList.add('accessibility-mode');
      console.log('✅ Accessibility mode enabled - body class added');
    } else {
      document.body.classList.remove('accessibility-mode');
      console.log('❌ Accessibility mode disabled - body class removed');
    }
  }, [isAccessibilityMode]);

  const toggleAccessibilityMode = () => {
    setIsAccessibilityMode(!isAccessibilityMode);
  };

  return (
    <AccessibilityContext.Provider value={{ isAccessibilityMode, toggleAccessibilityMode }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
