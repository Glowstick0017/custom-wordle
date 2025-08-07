'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, Play } from 'lucide-react';
import Modal from './Modal';
import { encryptWordle } from '@/utils/encryption';
import { useAlert } from './Alert';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateModal({ isOpen, onClose }: CreateModalProps) {
  const router = useRouter();
  const { showAlert, AlertComponent } = useAlert();
  const { isAccessibilityMode } = useAccessibility();
  const [word, setWord] = useState('');
  const [maxGuesses, setMaxGuesses] = useState(6);
  const [isInfinite, setIsInfinite] = useState(false);
  const [hardMode, setHardMode] = useState(false);
  const [hint, setHint] = useState('');
  const [isLoadingRandomWord, setIsLoadingRandomWord] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreateWordle = () => {
    if (!word || word.length < 1 || word.length > 30) {
      showAlert('Word must be between 1 and 30 letters', 'error');
      return;
    }

    if (!/^[A-Za-z]+$/.test(word)) {
      showAlert('Word must contain only letters', 'error');
      return;
    }

    const wordleData = {
      word: word.toUpperCase(),
      maxGuesses: isInfinite ? Infinity : maxGuesses,
      hardMode: hardMode,
      hint: hint.trim() || undefined
    };

    const encrypted = encryptWordle(wordleData);
    const link = `${window.location.origin}/play?w=${encrypted}`;
    setGeneratedLink(link);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClose = () => {
    setWord('');
    setMaxGuesses(6);
    setIsInfinite(false);
    setHardMode(false);
    setHint('');
    setIsLoadingRandomWord(false);
    setShowAdvanced(false);
    setGeneratedLink('');
    setCopied(false);
    onClose();
  };

  const getRandomWord = async () => {
    setIsLoadingRandomWord(true);
    try {
      const response = await fetch('https://raw.githubusercontent.com/tabatkins/wordle-list/refs/heads/main/words');
      if (!response.ok) {
        throw new Error('Failed to fetch word list');
      }
      const wordList = await response.text();
      const words = wordList.trim().split(/\s+/);
      const randomWord = words[Math.floor(Math.random() * words.length)];
      setWord(randomWord.toUpperCase());
    } catch (error) {
      console.error('Error fetching random word:', error);
      showAlert('Failed to fetch random word. Please try again.', 'error');
    } finally {
      setIsLoadingRandomWord(false);
    }
  };

  const playNow = () => {
    const encrypted = encryptWordle({
      word: word.toUpperCase(),
      maxGuesses: isInfinite ? Infinity : maxGuesses,
      hardMode: hardMode,
      hint: hint.trim() || undefined
    });
    router.push(`/play?w=${encrypted}`);
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Custom Glowdle">
      {!generatedLink ? (
        /* Creation Form */
        <div className="space-y-6">
          {/* Word Input */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-3">
              Your Word (1-30 letters)
            </label>
            <div className="flex gap-2 sm:gap-3">
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value.replace(/[^A-Za-z]/g, '').slice(0, 30))}
                className="flex-1 px-4 py-4 glass-card border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400 text-lg font-mono uppercase text-white placeholder-white/50 transition-all duration-300"
                placeholder="HELLO"
                maxLength={30}
              />
              <button
                type="button"
                onClick={getRandomWord}
                disabled={isLoadingRandomWord}
                className="px-3 sm:px-4 py-4 glass-card glass-card-hover border border-white/20 rounded-xl transition-all duration-300 text-white/80 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-1 sm:gap-2 min-w-[44px] sm:min-w-auto"
                title="Generate random word"
              >
                {isLoadingRandomWord ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="text-sm font-medium hidden sm:inline">Loading...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-sm font-medium hidden sm:inline">Random</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-white/60 mt-2">
              {word.length}/30 characters
            </p>
          </div>

          {/* Advanced Settings Dropdown */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between p-4 glass-card glass-card-hover rounded-xl border border-white/20 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚙️</span>
                <div className="text-left">
                  <div className="text-sm font-medium text-white/90">Advanced Settings</div>
                  <div className="text-xs text-white/60">
                    {isInfinite ? 'Unlimited' : `${maxGuesses}`} guesses
                    {hardMode && ', Hard Mode'}
                    {hint && ', Custom hint'}
                  </div>
                </div>
              </div>
              <svg 
                className={`w-5 h-5 text-white/60 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-6 glass-card p-4 rounded-xl border border-white/20">
                {/* Max Guesses */}
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-3">
                    Maximum Guesses
                  </label>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setIsInfinite(false)}
                        className={`relative p-4 rounded-xl border-2 ${
                          isAccessibilityMode
                            ? (!isInfinite 
                              ? 'border-green-400 bg-green-600 text-white' 
                              : 'border-gray-400 bg-gray-700 text-white hover:bg-gray-600')
                            : `overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                              !isInfinite 
                                ? 'border-emerald-400 bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 shadow-xl shadow-emerald-500/40 ring-2 ring-emerald-400/50' 
                                : 'border-white/20 glass-card hover:border-white/40'
                            }`
                        }`}
                      >
                        {!isAccessibilityMode && !isInfinite && (
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-emerald-600/10 animate-pulse"></div>
                        )}
                        <div className="relative text-center">
                          <div className={`text-2xl mb-2 ${
                            isAccessibilityMode 
                              ? 'text-white' 
                              : `transition-all duration-300 ${!isInfinite ? 'text-emerald-300 animate-pulse' : 'text-white/60'}`
                          }`}>
                            🎯
                          </div>
                          <div className={`text-sm font-bold ${
                            isAccessibilityMode 
                              ? 'text-white' 
                              : `transition-all duration-300 ${!isInfinite ? 'text-white gradient-text' : 'text-white/70'}`
                          }`}>
                            Limited
                          </div>
                          {!isInfinite && (
                            <div className={`mt-1 text-xs font-medium ${
                              isAccessibilityMode ? 'text-white' : 'text-emerald-300'
                            }`}>
                              ✓ Selected
                            </div>
                          )}
                        </div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setIsInfinite(true)}
                        className={`relative p-4 rounded-xl border-2 ${
                          isAccessibilityMode
                            ? (isInfinite 
                              ? 'border-purple-400 bg-purple-600 text-white' 
                              : 'border-gray-400 bg-gray-700 text-white hover:bg-gray-600')
                            : `overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                              isInfinite 
                                ? 'border-purple-400 bg-gradient-to-br from-purple-500/30 to-purple-600/20 shadow-xl shadow-purple-500/40 ring-2 ring-purple-400/50' 
                                : 'border-white/20 glass-card hover:border-white/40'
                            }`
                        }`}
                      >
                        {!isAccessibilityMode && isInfinite && (
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-purple-600/10 animate-pulse"></div>
                        )}
                        <div className="relative text-center">
                          <div className={`text-2xl mb-2 ${
                            isAccessibilityMode 
                              ? 'text-white' 
                              : `transition-all duration-300 ${isInfinite ? 'text-purple-300 animate-pulse' : 'text-white/60'}`
                          }`}>
                            ∞
                          </div>
                          <div className={`text-sm font-bold ${
                            isAccessibilityMode 
                              ? 'text-white' 
                              : `transition-all duration-300 ${isInfinite ? 'text-white gradient-text' : 'text-white/70'}`
                          }`}>
                            Unlimited
                          </div>
                          {isInfinite && (
                            <div className={`mt-1 text-xs font-medium ${
                              isAccessibilityMode ? 'text-white' : 'text-purple-300'
                            }`}>
                              ✓ Selected
                            </div>
                          )}
                        </div>
                      </button>
                    </div>
                    
                    {!isInfinite && (
                      <div className="glass-card p-3 rounded-lg space-y-3">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => setMaxGuesses(Math.max(1, maxGuesses - 1))}
                            disabled={maxGuesses <= 1}
                            className="w-8 h-8 flex items-center justify-center glass-card glass-card-hover border border-white/20 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          
                          <div className={`border rounded-lg px-4 py-2 min-w-[60px] text-center ${
                            isAccessibilityMode 
                              ? 'border-white/40 bg-gray-700' 
                              : 'glass-card border-white/20'
                          }`}>
                            <span className={`text-2xl font-bold ${
                              isAccessibilityMode ? 'text-white' : 'gradient-text'
                            }`}>{maxGuesses}</span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => setMaxGuesses(Math.min(999, maxGuesses + 1))}
                            disabled={maxGuesses >= 999}
                            className="w-8 h-8 flex items-center justify-center glass-card glass-card-hover border border-white/20 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hint */}
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-3">
                    Hint (Optional)
                  </label>
                  <input
                    type="text"
                    value={hint}
                    onChange={(e) => setHint(e.target.value.slice(0, 100))}
                    className="w-full px-4 py-3 glass-card border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 text-white placeholder-white/50 transition-all duration-300"
                    placeholder="Give players a helpful hint..."
                    maxLength={100}
                  />
                  <p className="text-xs text-white/60 mt-2">
                    {hint.length}/100 characters
                  </p>
                </div>

                {/* Hard Mode Toggle */}
                <div className={`flex items-center justify-between p-3 rounded-lg border ${
                  isAccessibilityMode 
                    ? 'bg-gray-700 border-white/40' 
                    : 'glass-card border-white/20'
                }`}>
                  <div className="flex-1">
                    <label htmlFor="hardMode" className="block text-sm font-medium text-white/90 cursor-pointer">
                      Hard Mode
                    </label>
                    <p className="text-xs text-white/60 mt-1">
                      Revealed hints must be used in subsequent guesses
                    </p>
                  </div>
                  
                  <label htmlFor="hardMode" className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="hardMode"
                      checked={hardMode}
                      onChange={(e) => setHardMode(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className={`relative rounded-full peer peer-focus:outline-none ${
                      isAccessibilityMode 
                        ? `w-11 h-6 border-2 ${hardMode ? 'bg-orange-600 border-orange-400' : 'bg-gray-600 border-gray-400'} peer-checked:after:translate-x-4 rtl:peer-checked:after:-translate-x-4 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:shadow-sm`
                        : 'w-11 h-6 bg-gray-200/20 peer-focus:ring-4 peer-focus:ring-orange-400/20 dark:bg-gray-700/50 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all duration-300 ease-in-out peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-orange-600 shadow-lg'
                    }`}>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreateWordle}
            disabled={!word || word.length < 1}
            className="w-full btn-gradient-primary text-white font-bold py-4 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Create Shareable Link
          </button>
        </div>
      ) : (
        /* Generated Link */
        <div className="space-y-6">
          <div className="text-center">
            <h3 className={`text-2xl font-bold mb-3 ${
              isAccessibilityMode ? 'text-white' : 'gradient-text'
            }`}>
              ✨ Glowdle Created!
            </h3>
            <p className="text-white/80">
              Share this link with others to play your custom Glowdle
            </p>
          </div>

          <div className="glass-card p-5 rounded-xl border border-white/20 border-gradient">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-white/70">Word:</span>
                <span className={`font-mono font-bold text-xl ${
                  isAccessibilityMode ? 'text-white' : 'gradient-text'
                }`}>{word.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-white/70">Guesses:</span>
                <span className="font-bold text-emerald-400">
                  {isInfinite ? 'Unlimited ∞' : `${maxGuesses} attempts`}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-white/70">Mode:</span>
                <span className={`font-bold ${hardMode ? 'text-orange-400' : 'text-purple-400'}`}>
                  {hardMode ? 'Hard Mode 🔥' : 'Normal Mode'}
                </span>
              </div>
              {hint && (
                <div className="flex items-start gap-3">
                  <span className="text-sm font-medium text-white/70">Hint:</span>
                  <span className="font-medium text-cyan-400 text-sm italic">
                    &ldquo;{hint}&rdquo;
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-card p-4 rounded-xl break-all text-sm font-mono text-white/90 border border-white/20">
              {generatedLink}
            </div>
            
            <button
              onClick={copyToClipboard}
              className="w-full btn-gradient-secondary text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-3"
            >
              {copied ? (
                <>
                  <Check size={20} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={20} />
                  Copy Link
                </>
              )}
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setWord('');
                setMaxGuesses(6);
                setIsInfinite(false);
                setHardMode(false);
                setHint('');
                setIsLoadingRandomWord(false);
                setShowAdvanced(false);
                setGeneratedLink('');
                setCopied(false);
              }}
              className="flex-1 glass-card glass-card-hover text-white font-bold py-4 px-4 rounded-xl transition-all duration-300"
            >
              Create Another
            </button>
            
            <button
              onClick={playNow}
              className="flex-1 btn-gradient-primary text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2"
            >
              <Play size={16} />
              Play Now
            </button>
          </div>
        </div>
      )}
      <AlertComponent />
    </Modal>
  );
} 