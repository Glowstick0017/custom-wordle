'use client';

import Modal from './Modal';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
  const { isAccessibilityMode } = useAccessibility();

  const ExampleTile = ({ 
    letter, 
    status, 
    className = "" 
  }: { 
    letter: string; 
    status: 'correct' | 'present' | 'absent' | 'empty'; 
    className?: string;
  }) => {
    const getTileStyle = () => {
      if (isAccessibilityMode) {
        switch (status) {
          case 'correct':
            return 'bg-orange-600 border-orange-400 text-white';
          case 'present':
            return 'bg-blue-600 border-blue-400 text-white';
          case 'absent':
            return 'bg-gray-600 border-gray-400 text-white';
          default:
            return 'bg-gray-700 border-white/40 text-white';
        }
      } else {
        switch (status) {
          case 'correct':
            return 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/40';
          case 'present':
            return 'bg-gradient-to-br from-yellow-500 to-yellow-600 border-yellow-400 text-white shadow-lg shadow-yellow-500/40';
          case 'absent':
            return 'bg-gray-700/50 border-white/30 text-white/70 shadow-lg shadow-black/20';
          default:
            return 'glass-card border-white/20 text-white/50';
        }
      }
    };

    return (
      <div 
        className={`w-12 h-12 rounded-md border-2 flex items-center justify-center font-bold text-lg ${getTileStyle()} ${className}`}
      >
        {letter}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="How to Play Glowdle">
      <div className="space-y-6">
        {/* Basic Rules */}
        <div>
          <h3 className={`text-lg font-bold mb-3 ${isAccessibilityMode ? 'text-white' : 'gradient-text'}`}>
            Objective
          </h3>
          <p className="text-white/90 text-sm leading-relaxed">
            Guess the word in the given number of tries. Each guess must be a valid word. 
            After each guess, the color of the tiles will change to show how close your guess was to the word.
          </p>
        </div>

        {/* Color Examples */}
        <div>
          <h3 className={`text-lg font-bold mb-4 ${isAccessibilityMode ? 'text-white' : 'gradient-text'}`}>
            Color Guide
          </h3>
          
          <div className="space-y-4">
            {/* Correct Example */}
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                <ExampleTile letter="W" status="empty" />
                <ExampleTile letter="E" status="correct" />
                <ExampleTile letter="A" status="empty" />
                <ExampleTile letter="R" status="empty" />
                <ExampleTile letter="Y" status="empty" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white/90">
                  <span className={`font-bold ${isAccessibilityMode ? 'text-orange-400' : 'text-emerald-400'}`}>
                    {isAccessibilityMode ? 'Orange' : 'Green'}
                  </span> means the letter <strong>E</strong> is in the word and in the correct position.
                </p>
              </div>
            </div>

            {/* Present Example */}
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                <ExampleTile letter="P" status="present" />
                <ExampleTile letter="I" status="empty" />
                <ExampleTile letter="L" status="empty" />
                <ExampleTile letter="L" status="empty" />
                <ExampleTile letter="S" status="empty" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white/90">
                  <span className={`font-bold ${isAccessibilityMode ? 'text-blue-400' : 'text-yellow-400'}`}>
                    {isAccessibilityMode ? 'Blue' : 'Yellow'}
                  </span> means the letter <strong>P</strong> is in the word but in the wrong position.
                </p>
              </div>
            </div>

            {/* Absent Example */}
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                <ExampleTile letter="V" status="empty" />
                <ExampleTile letter="A" status="empty" />
                <ExampleTile letter="G" status="empty" />
                <ExampleTile letter="U" status="absent" />
                <ExampleTile letter="E" status="empty" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white/90">
                  <span className="font-bold text-gray-400">Gray</span> means the letter <strong>U</strong> is not in the word anywhere.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Hard Mode */}
        <div>
          <h3 className={`text-lg font-bold mb-3 ${isAccessibilityMode ? 'text-white' : 'gradient-text'}`}>
            Hard Mode 🔥
          </h3>
          <div className="space-y-3">
            <p className="text-white/90 text-sm leading-relaxed">
              When Hard Mode is enabled, you must use all revealed clues in subsequent guesses:
            </p>
            <ul className="space-y-2 text-sm text-white/80 ml-4">
              <li className="flex items-start gap-2">
                <span className={`font-bold ${isAccessibilityMode ? 'text-orange-400' : 'text-emerald-400'}`}>•</span>
                <span>Letters marked as correct (in the right position) must be used in the same position</span>
              </li>
              <li className="flex items-start gap-2">
                <span className={`font-bold ${isAccessibilityMode ? 'text-blue-400' : 'text-yellow-400'}`}>•</span>
                <span>Letters marked as present (wrong position) must be included somewhere in your next guess</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Tips */}
        <div>
          <h3 className={`text-lg font-bold mb-3 ${isAccessibilityMode ? 'text-white' : 'gradient-text'}`}>
            Tips
          </h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">•</span>
              <span>Start with words containing common vowels (A, E, I, O, U)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">•</span>
              <span>Use common consonants like R, S, T, L, N in your first guesses</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">•</span>
              <span>Pay attention to letter frequency and word patterns</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">•</span>
              <span>Remember that letters can appear multiple times in a word</span>
            </li>
          </ul>
        </div>

        {/* Accessibility Note */}
        {isAccessibilityMode && (
          <div className="bg-blue-900/30 border border-blue-400/30 rounded-lg p-4">
            <h4 className="text-sm font-bold text-blue-300 mb-2">🌟 Accessibility Mode Active</h4>
            <p className="text-xs text-white/80 leading-relaxed">
              You&apos;re currently using high-contrast colors designed for better visibility. 
              Orange indicates correct letters, blue indicates letters in the wrong position, 
              and gray indicates letters not in the word.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
