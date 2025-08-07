'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Share2, BarChart3, RotateCcw, Plus } from 'lucide-react';
import GameBoard from '@/components/GameBoard';
import Keyboard from '@/components/Keyboard';
import Modal from '@/components/Modal';
import StatsModal from '@/components/StatsModal';
import CreateModal from '@/components/CreateModal';
import { useAlert } from '@/components/Alert';
import { decryptWordle } from '@/utils/encryption';
import { checkGuess, isValidWord, generateShareText, updateStats, getStoredStats, validateHardModeGuess } from '@/utils/gameLogic';
import { GameState, LetterState, KeyboardKey } from '@/types/game';

function PlayGameContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showAlert, AlertComponent } = useAlert();
  const [gameState, setGameState] = useState<GameState>({
    word: '',
    guesses: [],
    currentGuess: '',
    gameStatus: 'playing',
    maxGuesses: 6,
    wordLength: 5,
    hardMode: false,
    hint: undefined
  });
  
  const [letterStates, setLetterStates] = useState<{ [key: string]: LetterState[] }>({});
  const [keyStates, setKeyStates] = useState<{ [key: string]: KeyboardKey }>({});
  const [showGameOver, setShowGameOver] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [shareText, setShareText] = useState('');
  const [gameLoaded, setGameLoaded] = useState(false);

  // Initialize game from URL parameter
  useEffect(() => {
    const encryptedData = searchParams.get('w');
    if (encryptedData) {
      const decrypted = decryptWordle(encryptedData);
      if (decrypted) {
        setGameState(prev => ({
          ...prev,
          word: decrypted.word,
          maxGuesses: decrypted.maxGuesses,
          wordLength: decrypted.word.length,
          hardMode: decrypted.hardMode,
          hint: decrypted.hint
        }));
        setGameLoaded(true);
      } else {
        showAlert('Invalid or corrupted game link', 'error');
        router.push('/');
      }
    } else {
      setGameLoaded(true);
    }
  }, [searchParams, router]);

  // Handle keyboard input
  const handleKeyPress = useCallback((key: string) => {
    if (gameState.gameStatus !== 'playing') return;
    
    if (gameState.currentGuess.length < gameState.wordLength) {
      setGameState(prev => ({
        ...prev,
        currentGuess: prev.currentGuess + key
      }));
    }
  }, [gameState.gameStatus, gameState.currentGuess.length, gameState.wordLength]);

  const handleBackspace = useCallback(() => {
    if (gameState.gameStatus !== 'playing') return;
    
    setGameState(prev => ({
      ...prev,
      currentGuess: prev.currentGuess.slice(0, -1)
    }));
  }, [gameState.gameStatus]);

  const handleEnter = useCallback(() => {
    if (gameState.gameStatus !== 'playing') return;
    if (gameState.currentGuess.length !== gameState.wordLength) {
      showAlert(`Word must be ${gameState.wordLength} letters long`, 'error');
      return;
    }
    
    if (!isValidWord(gameState.currentGuess, gameState.wordLength)) {
      showAlert('Please enter a valid word with only letters', 'error');
      return;
    }

    const guess = gameState.currentGuess.toUpperCase();
    
    // Check hard mode validation
    if (gameState.hardMode) {
      const hardModeValidation = validateHardModeGuess(guess, gameState.guesses, gameState.word);
      if (!hardModeValidation.isValid) {
        showAlert(`Hard Mode: ${hardModeValidation.error}`, 'error');
        return;
      }
    }
    
    const newLetterStates = checkGuess(guess, gameState.word);
    const newGuesses = [...gameState.guesses, guess];
    
    // Update letter states
    setLetterStates(prev => ({
      ...prev,
      [guess]: newLetterStates
    }));

         // Update keyboard states
     const newKeyStates = { ...keyStates };
     newLetterStates.forEach(({ letter, status }) => {
       if (status !== 'empty') {
         if (!newKeyStates[letter] || 
             (newKeyStates[letter].status !== 'correct' && status === 'correct') ||
             (newKeyStates[letter].status === 'unused' && status === 'present')) {
           newKeyStates[letter] = { key: letter, status: status as 'correct' | 'present' | 'absent' };
         }
       }
     });
    setKeyStates(newKeyStates);

    // Check game status
    const won = guess === gameState.word;
    const lost = !won && newGuesses.length >= gameState.maxGuesses;
    const newGameStatus = won ? 'won' : lost ? 'lost' : 'playing';

    setGameState(prev => ({
      ...prev,
      guesses: newGuesses,
      currentGuess: '',
      gameStatus: newGameStatus
    }));

    // Handle game end
    if (won || lost) {
      const stats = updateStats(won, newGuesses.length);
      const shareTextContent = generateShareText(newGuesses, gameState.word, won ? 'won' : 'lost', gameState.maxGuesses, gameState.hardMode);
      setShareText(shareTextContent);
      setTimeout(() => setShowGameOver(true), 1000);
    }
  }, [gameState, keyStates]);

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      
      if (event.key === 'Enter') {
        event.preventDefault();
        handleEnter();
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        handleBackspace();
      } else if (/^[a-zA-Z]$/.test(event.key)) {
        event.preventDefault();
        handleKeyPress(event.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, handleBackspace, handleEnter]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      showAlert('Results copied to clipboard!', 'success');
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback: show the text in an alert
      showAlert(`Share your results:\n\n${shareText}`, 'info');
    }
  };

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      guesses: [],
      currentGuess: '',
      gameStatus: 'playing'
    }));
    setLetterStates({});
    setKeyStates({});
    setShowGameOver(false);
    setShareText('');
  };

  if (!gameLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-emerald-500/20 to-transparent rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-purple-500/20 to-transparent rounded-full blur-xl animate-pulse delay-700"></div>
        <div className="absolute top-60 left-1/3 w-28 h-28 bg-gradient-to-r from-cyan-500/15 to-transparent rounded-full blur-xl animate-pulse delay-500"></div>
        <div className="absolute bottom-40 right-1/4 w-24 h-24 bg-gradient-to-r from-pink-500/18 to-transparent rounded-full blur-xl animate-pulse delay-1200"></div>
        <div className="absolute top-10 right-1/3 w-20 h-20 bg-gradient-to-r from-orange-500/22 to-transparent rounded-full blur-xl animate-pulse delay-300"></div>
        <div className="text-center glass-card p-8 rounded-xl relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-emerald-400 border-r-purple-400 border-b-orange-400 mx-auto mb-4"></div>
          <p className="text-white/90 text-lg">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!gameState.word) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-emerald-500/20 to-transparent rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-purple-500/20 to-transparent rounded-full blur-xl animate-pulse delay-700"></div>
        <div className="absolute top-60 right-1/4 w-28 h-28 bg-gradient-to-r from-teal-500/15 to-transparent rounded-full blur-xl animate-pulse delay-500"></div>
        <div className="absolute bottom-40 left-1/3 w-24 h-24 bg-gradient-to-r from-indigo-500/18 to-transparent rounded-full blur-xl animate-pulse delay-1200"></div>
        <div className="absolute top-10 left-1/4 w-36 h-36 bg-gradient-to-r from-cyan-500/12 to-transparent rounded-full blur-xl animate-pulse delay-800"></div>
        <div className="max-w-md w-full text-center space-y-6 glass-card p-8 rounded-xl relative z-10">
          <h1 className="text-3xl font-bold gradient-text">No Game Found</h1>
          <p className="text-white/80 text-lg">
            This page requires a valid game link. Create a new custom Glowdle to get started.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-gradient-primary text-white font-bold py-4 px-8 rounded-xl"
          >
            Create Custom Glowdle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen flex flex-col max-w-screen overflow-x-hidden relative">
      {/* Background gradient orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-r from-emerald-500/10 to-transparent rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-40 left-10 w-32 h-32 bg-gradient-to-r from-purple-500/10 to-transparent rounded-full blur-xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 right-20 w-24 h-24 bg-gradient-to-r from-orange-500/10 to-transparent rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-20 left-1/3 w-36 h-36 bg-gradient-to-r from-cyan-500/8 to-transparent rounded-full blur-xl animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-r from-pink-500/8 to-transparent rounded-full blur-xl animate-pulse delay-1500"></div>
        <div className="absolute top-3/4 left-20 w-20 h-20 bg-gradient-to-r from-indigo-500/12 to-transparent rounded-full blur-xl animate-pulse delay-300"></div>
        <div className="absolute top-60 right-5 w-16 h-16 bg-gradient-to-r from-teal-500/10 to-transparent rounded-full blur-xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-60 left-5 w-22 h-22 bg-gradient-to-r from-violet-500/8 to-transparent rounded-full blur-xl animate-pulse delay-1200"></div>
      </div>

      {/* Header */}
      <header className="flex-shrink-0 glass-card border-b border-white/10 p-4 relative z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="p-3 glass-card glass-card-hover rounded-xl transition-all duration-300 text-white/80 hover:text-white"
          >
            <ArrowLeft size={20} />
          </Link>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-1">
              <h1 className="text-xl font-bold gradient-text">Glowdle</h1>
              {gameState.hardMode && (
                <div className="relative">
                  <div className="px-3 py-1 btn-gradient-accent text-white text-xs font-bold rounded-full shadow-lg">
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      HARD MODE
                    </div>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-white/70">
              {gameState.wordLength} letters • {gameState.maxGuesses === Infinity ? '∞' : gameState.maxGuesses} guesses
              {gameState.hardMode && (
                <span className="block mt-1 text-orange-300 font-medium">
                  Revealed hints must be used
                </span>
              )}
              {gameState.hint && (
                <span className="block mt-1 text-cyan-300 font-medium italic">
                  💡 {gameState.hint}
                </span>
              )}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowStats(true)}
              className="p-3 glass-card glass-card-hover rounded-xl transition-all duration-300 text-white/80 hover:text-white"
            >
              <BarChart3 size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Game Area - takes remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden px-2 sm:px-4">
        <GameBoard
          guesses={gameState.guesses}
          currentGuess={gameState.currentGuess}
          word={gameState.gameStatus !== 'playing' ? gameState.word : ''}
          maxGuesses={gameState.maxGuesses}
          wordLength={gameState.wordLength}
          letterStates={letterStates}
        />
      </div>

      {/* Keyboard - always at bottom */}
      <div className="flex-shrink-0 pb-safe px-2">
        <Keyboard
          onKeyPress={handleKeyPress}
          onEnter={handleEnter}
          onBackspace={handleBackspace}
          keyStates={keyStates}
          disabled={gameState.gameStatus !== 'playing'}
        />
      </div>

      {/* Game Over Modal */}
      <Modal
        isOpen={showGameOver}
        onClose={() => setShowGameOver(false)}
        title={gameState.gameStatus === 'won' ? '🎉 Congratulations!' : '😔 Game Over'}
      >
        <div className="text-center space-y-6">
          <div>
            {gameState.gameStatus === 'won' ? (
              <p className="text-white/90 text-lg">You guessed the word in {gameState.guesses.length} tries!</p>
            ) : (
              <div>
                <p className="text-white/80">The word was:</p>
                <p className="text-3xl font-bold font-mono mt-2 gradient-text">{gameState.word}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <button
              onClick={handleShare}
              className="w-full btn-gradient-primary text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-3"
            >
              <Share2 size={18} />
              Share Results
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={resetGame}
                className="flex-1 btn-gradient-secondary text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} />
                Play Again
              </button>
              
              <button
                onClick={() => setShowCreate(true)}
                className="flex-1 btn-gradient-accent text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Create New
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Stats Modal */}
      <StatsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        stats={getStoredStats()}
      />

      {/* Create Modal */}
      <CreateModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
      />

      {/* Custom Alert */}
      <AlertComponent />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-emerald-500/20 to-transparent rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-purple-500/20 to-transparent rounded-full blur-xl animate-pulse delay-700"></div>
      <div className="absolute top-60 left-1/2 w-28 h-28 bg-gradient-to-r from-cyan-500/15 to-transparent rounded-full blur-xl animate-pulse delay-500"></div>
      <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-gradient-to-r from-pink-500/18 to-transparent rounded-full blur-xl animate-pulse delay-1200"></div>
      <div className="absolute top-10 right-1/4 w-20 h-20 bg-gradient-to-r from-orange-500/22 to-transparent rounded-full blur-xl animate-pulse delay-300"></div>
      <div className="absolute bottom-60 right-1/3 w-36 h-36 bg-gradient-to-r from-indigo-500/12 to-transparent rounded-full blur-xl animate-pulse delay-1800"></div>
      <div className="text-center glass-card p-8 rounded-xl relative z-10">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-emerald-400 border-r-purple-400 border-b-orange-400 mx-auto mb-4"></div>
        <p className="text-white/90 text-xl">Loading game...</p>
      </div>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PlayGameContent />
    </Suspense>
  );
} 