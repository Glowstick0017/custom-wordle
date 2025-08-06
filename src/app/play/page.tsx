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
import { checkGuess, isValidWord, generateShareText, updateStats, getStoredStats } from '@/utils/gameLogic';
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
    wordLength: 5
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
          wordLength: decrypted.word.length
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
      const shareTextContent = generateShareText(newGuesses, gameState.word, won ? 'won' : 'lost', gameState.maxGuesses);
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
              <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!gameState.word) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-2xl font-bold text-white">No Game Found</h1>
          <p className="text-slate-300">
            This page requires a valid game link. Create a new custom Wordle to get started.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-block bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg"
          >
            Create Custom Wordle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 bg-slate-800/70 backdrop-blur-sm border-b border-slate-600/30 p-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </Link>
          
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">Custom Wordle</h1>
            <p className="text-xs text-slate-400">
              {gameState.wordLength} letters • {gameState.maxGuesses === Infinity ? '∞' : gameState.maxGuesses} guesses
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowStats(true)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
            >
              <BarChart3 size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Game Area - takes remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden">
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
      <div className="flex-shrink-0 pb-safe">
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
        <div className="text-center space-y-4">
          <div>
            {gameState.gameStatus === 'won' ? (
              <p>You guessed the word in {gameState.guesses.length} tries!</p>
            ) : (
              <div>
                <p className="text-slate-300">The word was:</p>
                <p className="text-2xl font-bold font-mono mt-2 text-emerald-400">{gameState.word}</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleShare}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-lg"
            >
              <Share2 size={16} />
              Share Results
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={resetGame}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-lg"
              >
                <RotateCcw size={16} />
                Play Again
              </button>
              
              <button
                onClick={() => setShowCreate(true)}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-lg"
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
        <p className="text-slate-400">Loading game...</p>
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