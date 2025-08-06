'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { encryptWordle } from '@/utils/encryption';

export default function CreatePage() {
  const router = useRouter();
  const [word, setWord] = useState('');
  const [maxGuesses, setMaxGuesses] = useState(6);
  const [isInfinite, setIsInfinite] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreateWordle = () => {
    if (!word || word.length < 3 || word.length > 10) {
      alert('Word must be between 3 and 10 letters');
      return;
    }

    if (!/^[A-Za-z]+$/.test(word)) {
      alert('Word must contain only letters');
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold">Create Custom Wordle</h1>
        </div>

        {!generatedLink ? (
          /* Creation Form */
          <div className="bg-white rounded-lg p-6 shadow-sm space-y-6">
            {/* Word Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Word (3-10 letters)
              </label>
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value.replace(/[^A-Za-z]/g, '').slice(0, 10))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono uppercase"
                placeholder="HELLO"
                maxLength={10}
              />
              <p className="text-xs text-gray-500 mt-1">
                {word.length}/10 characters
              </p>
            </div>

            {/* Max Guesses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Guesses
              </label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="limited"
                    name="guessType"
                    checked={!isInfinite}
                    onChange={() => setIsInfinite(false)}
                    className="mr-2"
                  />
                  <label htmlFor="limited" className="flex-1">
                    Limited guesses
                  </label>
                </div>
                
                {!isInfinite && (
                  <input
                    type="range"
                    min="3"
                    max="20"
                    value={maxGuesses}
                    onChange={(e) => setMaxGuesses(parseInt(e.target.value))}
                    className="w-full"
                  />
                )}
                
                {!isInfinite && (
                  <div className="text-center">
                    <span className="text-lg font-bold">{maxGuesses} guesses</span>
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="infinite"
                    name="guessType"
                    checked={isInfinite}
                    onChange={() => setIsInfinite(true)}
                    className="mr-2"
                  />
                  <label htmlFor="infinite" className="flex-1">
                    Unlimited guesses
                  </label>
                </div>
              </div>
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreateWordle}
              disabled={!word || word.length < 3}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors"
            >
              Create Shareable Link
            </button>
          </div>
        ) : (
          /* Generated Link */
          <div className="bg-white rounded-lg p-6 shadow-sm space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-green-600 mb-2">
                ✅ Wordle Created!
              </h2>
              <p className="text-gray-600">
                Share this link with others to play your custom Wordle
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Word:</span>
                <span className="font-mono font-bold">{word.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Guesses:</span>
                <span className="font-bold">
                  {isInfinite ? 'Unlimited' : maxGuesses}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-gray-100 p-3 rounded-lg break-all text-sm font-mono">
                {generatedLink}
              </div>
              
              <button
                onClick={copyToClipboard}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
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
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Create Another
              </button>
              
              <Link
                href={`/play?w=${encryptWordle({ word: word.toUpperCase(), maxGuesses: isInfinite ? Infinity : maxGuesses })}`}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center"
              >
                Play Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 