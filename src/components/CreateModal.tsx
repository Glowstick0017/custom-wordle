'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, Play } from 'lucide-react';
import Modal from './Modal';
import { encryptWordle } from '@/utils/encryption';
import { useAlert } from './Alert';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateModal({ isOpen, onClose }: CreateModalProps) {
  const router = useRouter();
  const { showAlert, AlertComponent } = useAlert();
  const [word, setWord] = useState('');
  const [maxGuesses, setMaxGuesses] = useState(6);
  const [isInfinite, setIsInfinite] = useState(false);
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
      maxGuesses: isInfinite ? Infinity : maxGuesses
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
    setGeneratedLink('');
    setCopied(false);
    onClose();
  };

  const playNow = () => {
    const encrypted = encryptWordle({
      word: word.toUpperCase(),
      maxGuesses: isInfinite ? Infinity : maxGuesses
    });
    router.push(`/play?w=${encrypted}`);
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Custom Wordle">
      {!generatedLink ? (
        /* Creation Form */
        <div className="space-y-6">
          {/* Word Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Your Word (1-30 letters)
            </label>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value.replace(/[^A-Za-z]/g, '').slice(0, 30))}
              className="w-full px-4 py-3 border border-slate-600 bg-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg font-mono uppercase text-white placeholder-slate-400"
              placeholder="HELLO"
              maxLength={30}
            />
            <p className="text-xs text-slate-400 mt-1">
              {word.length}/30 characters
            </p>
          </div>

          {/* Max Guesses */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Maximum Guesses
            </label>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="limited"
                    name="guessType"
                    checked={!isInfinite}
                    onChange={() => setIsInfinite(false)}
                    className="mr-2"
                  />
                  <label htmlFor="limited" className="text-slate-300">
                    Limited guesses
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="infinite"
                    name="guessType"
                    checked={isInfinite}
                    onChange={() => setIsInfinite(true)}
                    className="mr-2"
                  />
                  <label htmlFor="infinite" className="text-slate-300">
                    Unlimited guesses
                  </label>
                </div>
              </div>
              
              {!isInfinite && (
                <div className="space-y-4">
                  <div className="text-center">
                    <label className="block text-sm text-slate-300 mb-3">
                      Number of guesses:
                    </label>
                    
                    <div className="flex items-center justify-center gap-4">
                      {/* Down Arrow Button */}
                      <button
                        type="button"
                        onClick={() => setMaxGuesses(Math.max(1, maxGuesses - 1))}
                        disabled={maxGuesses <= 1}
                        className="w-12 h-12 flex items-center justify-center bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed border border-slate-600 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                        title="Decrease guesses"
                      >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      
                      {/* Number Display */}
                      <div className="bg-slate-800 border border-slate-600 rounded-lg px-6 py-3 min-w-[80px]">
                        <span className="text-3xl font-bold text-emerald-400">{maxGuesses}</span>
                      </div>
                      
                      {/* Up Arrow Button */}
                      <button
                        type="button"
                        onClick={() => setMaxGuesses(Math.min(999, maxGuesses + 1))}
                        disabled={maxGuesses >= 999}
                        className="w-12 h-12 flex items-center justify-center bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed border border-slate-600 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                        title="Increase guesses"
                      >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <span className="text-sm text-slate-400">
                      {maxGuesses === 1 ? '1 guess' : `${maxGuesses} guesses`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Create Button */}
                      <button
              onClick={handleCreateWordle}
              disabled={!word || word.length < 1}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg"
            >
              Create Shareable Link
            </button>
        </div>
      ) : (
        /* Generated Link */
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-emerald-400 mb-2">
              ✅ Wordle Created!
            </h3>
            <p className="text-slate-300">
              Share this link with others to play your custom Wordle
            </p>
          </div>

          <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-slate-300">Word:</span>
              <span className="font-mono font-bold text-emerald-400">{word.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-300">Guesses:</span>
              <span className="font-bold text-emerald-400">
                {isInfinite ? 'Unlimited' : maxGuesses}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-700/70 p-3 rounded-lg break-all text-sm font-mono text-slate-300 border border-slate-600/30">
              {generatedLink}
            </div>
            
            <button
              onClick={copyToClipboard}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-lg"
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
                  setGeneratedLink('');
                  setCopied(false);
                }}
                className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg"
              >
                Create Another
              </button>
              
              <button
                onClick={playNow}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
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