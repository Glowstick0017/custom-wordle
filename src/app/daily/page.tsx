'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Share2, BarChart3, RotateCcw, Plus, Info } from 'lucide-react';
import GameBoard from '@/components/GameBoard';
import Keyboard from '@/components/Keyboard';
import Modal from '@/components/Modal';
import StatsModal from '@/components/StatsModal';
import CreateModal from '@/components/CreateModal';
import HowToPlayModal from '@/components/HowToPlayModal';
import AccessibilityToggle from '@/components/AccessibilityToggle';
import { useAlert } from '@/components/Alert';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { getDailyWord, getDailyGameDate } from '@/utils/dailyGame';
import { checkGuess, isValidWord, generateDailyShareText, updateStats, getStoredStats, validateHardModeGuess, validateRealWord, fetchWordDefinition } from '@/utils/gameLogic';
import { saveGameSession, loadGameSession, clearOutdatedDailySessions, clearGameSession } from '@/utils/gameSession';
import { GameState, LetterState, KeyboardKey } from '@/types/game';
import LoadingGame from '@/components/LoadingGame';

function DailyGameContent() {
  const router = useRouter();
  const { showAlert, AlertComponent } = useAlert(true);
  const { isAccessibilityMode } = useAccessibility();
  const stats = getStoredStats();
  const [gameState, setGameState] = useState<GameState>({
    word: '',
    guesses: [],
    currentGuess: '',
    gameStatus: 'playing',
    maxGuesses: 6,
    wordLength: 5,
    hardMode: false,
    realWordsOnly: true,
    hint: undefined
  });

  const [letterStates, setLetterStates] = useState<{ [key: string]: LetterState[] }>({});
  const [keyStates, setKeyStates] = useState<{ [key: string]: KeyboardKey }>({});
  const [showGameOver, setShowGameOver] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [shareText, setShareText] = useState('');
  const [gameLoaded, setGameLoaded] = useState(false);
  const [wordDefinition, setWordDefinition] = useState<{ word: string; definition: string } | null>(null);
  const [isLoadingDefinition, setIsLoadingDefinition] = useState(false);

  // Initialize daily game
  useEffect(() => {
    const loadDailyGame = async () => {
      try {
        // Clear any outdated daily sessions first
        clearOutdatedDailySessions();

        // Try to load saved session first
        const savedSession = loadGameSession('daily');

        if (savedSession) {
          // Restore saved game state
          setGameState(savedSession.gameState);
          setLetterStates(savedSession.letterStates);
          setKeyStates(savedSession.keyStates);
          setGameLoaded(true);

          // If the game was already complete, show the game over modal
          if (savedSession.gameState.gameStatus === 'won' || savedSession.gameState.gameStatus === 'lost') {
            const shareTextContent = generateDailyShareText(
              savedSession.gameState.guesses,
              savedSession.gameState.word,
              savedSession.gameState.gameStatus,
              savedSession.gameState.maxGuesses
            );
            setShareText(shareTextContent);

            // Fetch word definition for completed games
            setIsLoadingDefinition(true);
            fetchWordDefinition(savedSession.gameState.word, showAlert)
              .then(definition => {
                setWordDefinition(definition);
                setIsLoadingDefinition(false);
              })
              .catch(() => {
                setWordDefinition(null);
                setIsLoadingDefinition(false);
              });

            // Show the game over modal after a brief delay
            setTimeout(() => setShowGameOver(true), 500);
          }
          return;
        }

        // No saved session, start fresh daily game
        const dailyWord = await getDailyWord(showAlert);
        setGameState(prev => ({
          ...prev,
          word: dailyWord,
          wordLength: dailyWord.length
        }));
        setGameLoaded(true);
      } catch (error) {
        console.error('Failed to load daily word:', error);
        showAlert('Failed to load daily game. Please try again.', 'error');
        router.push('/');
      }
    };

    loadDailyGame();
  }, [router, showAlert]);

  // Save game state whenever it changes (but only after game is loaded)
  useEffect(() => {
    if (gameLoaded && gameState.word) {
      saveGameSession(gameState, letterStates, keyStates, 'daily');
    }
  }, [gameState, letterStates, keyStates, gameLoaded]);

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

  const handleEnter = useCallback(async () => {
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

    // Check real word validation (always enabled for daily games)
    if (gameState.realWordsOnly) {
      const realWordValidation = await validateRealWord(guess, showAlert);
      if (!realWordValidation.isValid) {
        showAlert(`${realWordValidation.error}. Please use a real dictionary word.`, 'error');
        return;
      }
    }

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
      updateStats(won, newGuesses.length);
      const shareTextContent = generateDailyShareText(newGuesses, gameState.word, won ? 'won' : 'lost', gameState.maxGuesses);
      setShareText(shareTextContent);

      // Fetch word definition
      setIsLoadingDefinition(true);
      fetchWordDefinition(gameState.word, showAlert)
        .then(definition => {
          setWordDefinition(definition);
          setIsLoadingDefinition(false);
        })
        .catch(() => {
          setWordDefinition(null);
          setIsLoadingDefinition(false);
        });

      setTimeout(() => setShowGameOver(true), 1000);
    }
  }, [gameState, keyStates, showAlert]);

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle keyboard events when any modal is open
      if (showGameOver || showStats || showCreate || showHowToPlay) return;

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
  }, [handleKeyPress, handleBackspace, handleEnter, showGameOver, showStats, showCreate, showHowToPlay]);

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
    // Clear the saved session first, then reset game state
    clearGameSession('daily');

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
    setWordDefinition(null);
    setIsLoadingDefinition(false);
  };

  if (!gameLoaded) {
    return <LoadingGame label={"Loading daily game..."} isAccessibilityMode={isAccessibilityMode}/>
  }

  return (
    <div className="min-h-screen h-screen flex flex-col max-w-screen overflow-x-hidden relative">
      {/* Background gradient orbs - REDUCED FOR PERFORMANCE */}
      {!isAccessibilityMode && (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-r from-emerald-500/8 to-transparent rounded-full blur-xl"></div>
          <div className="absolute bottom-40 left-10 w-32 h-32 bg-gradient-to-r from-purple-500/8 to-transparent rounded-full blur-xl"></div>
        </div>
      )}

      {/* Header */}
      <header className="flex-shrink-0 glass-card border-b border-white/10 px-3 py-2 relative z-0">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="p-2 rounded-md text-white/80 hover:text-white bg-transparent hover:bg-white/2"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <button
                onClick={() => setShowHowToPlay(true)}
                className="p-2 rounded-md text-white/80 hover:text-white bg-transparent hover:bg-white/2"
                title="How to Play"
                aria-label="How to Play"
              >
                <Info className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center flex-1 px-4 min-w-0">
              <div className="flex items-center justify-center gap-3">
                <h1 className={`text-2xl md:text-3xl lg:text-4xl font-extrabold truncate ${isAccessibilityMode ? 'text-white' : 'gradient-text'}`}>Daily Glowdle</h1>
              </div>
              <div className="mt-1 text-sm md:text-base text-white/70 flex items-center justify-center gap-3">
                <span className="truncate">{getDailyGameDate()}</span>
                <span className="hidden sm:inline">•</span>
                <span>{gameState.wordLength} letters</span>
                <span>•</span>
                <span>{gameState.maxGuesses === Infinity ? '∞' : gameState.maxGuesses} guesses</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <AccessibilityToggle showText={false} />
              <button
                onClick={() => setShowStats(true)}
                className="p-2 rounded-md text-white/80 hover:text-white bg-transparent hover:bg-white/2"
                aria-label="Stats"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content: responsive two-column layout on desktop */}
      <main className="flex-1 overflow-hidden px-4 sm:px-6">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 items-start">
            {/* Left: board + keyboard (centered and capped width for PC) */}
            <div className="flex flex-col items-center w-full">
              <div className="w-full max-w-[min(560px,80vw)]">
                <GameBoard
                  guesses={gameState.guesses}
                  currentGuess={gameState.currentGuess}
                  word={gameState.gameStatus !== 'playing' ? gameState.word : ''}
                  maxGuesses={gameState.maxGuesses}
                  wordLength={gameState.wordLength}
                  letterStates={letterStates}
                />
              </div>

              <div className="w-full mt-4">
                <div className="w-full max-w-[min(560px,80vw)] mx-auto">
                  <Keyboard
                    onKeyPress={handleKeyPress}
                    onEnter={handleEnter}
                    onBackspace={handleBackspace}
                    keyStates={keyStates}
                    disabled={gameState.gameStatus !== 'playing'}
                  />
                </div>
              </div>
            </div>

            {/* Right: controls / stats / actions */}
            <aside className="block md:block mt-6 md:mt-0">
              <div className="glass-card p-4 rounded-xl border border-white/10 space-y-4 w-full">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">Daily Controls</h3>
                </div>

                <div className="space-y-2">
                  <button onClick={handleShare} className="w-full btn-gradient-primary py-2 rounded-md">Share Results</button>
                  <button onClick={resetGame} className="w-full btn-gradient-secondary py-2 rounded-md">Play Again</button>
                  <button onClick={() => setShowCreate(true)} className="w-full btn-gradient-accent py-2 rounded-md">Create Custom</button>
                  <button onClick={() => setShowStats(true)} className="w-full glass-card py-2 rounded-md">View Stats</button>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <div className="text-sm text-white/70">Statistics</div>
                  <div className="mt-2 text-sm">
                    <div>Played: <strong>{stats.gamesPlayed}</strong></div>
                    <div>Won: <strong>{stats.gamesWon}</strong></div>
                    <div>Current Streak: <strong>{stats.currentStreak}</strong></div>
                    <div>Max Streak: <strong>{stats.maxStreak}</strong></div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-white/70">Definition</div>
                  {isLoadingDefinition ? (
                    <div className="mt-2 text-sm">Loading...</div>
                  ) : wordDefinition ? (
                    <div className="mt-2 text-sm">{wordDefinition.definition}</div>
                  ) : (
                    <div className="mt-2 text-sm text-white/60">Definition will appear after the game ends.</div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

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
                <p className={`text-3xl font-bold font-mono mt-2 ${isAccessibilityMode ? 'text-white' : 'gradient-text'}`}>{gameState.word}</p>
              </div>
            )}
          </div>

          {/* Word Definition Section */}
          {isLoadingDefinition ? (
            <div className="glass-card p-4 rounded-xl border border-white/10">
              <div className="flex items-center justify-center gap-2 text-white/70">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-transparent border-t-white/70"></div>
                <span>Loading definition...</span>
              </div>
            </div>
          ) : wordDefinition ? (
            <div className="glass-card p-4 rounded-xl border border-white/10 text-left">
              <div className="mb-2">
                <span className="text-white/70 text-sm">Definition of </span>
                <span className={`font-bold ${isAccessibilityMode ? 'text-white' : 'gradient-text'}`}>
                  {wordDefinition.word}
                </span>
              </div>
              <p className="text-white/90 leading-relaxed">{wordDefinition.definition}</p>
            </div>
          ) : null}

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
                onClick={() => {
                  setShowGameOver(false);
                  setTimeout(() => setShowCreate(true), 100);
                }}
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

      {/* How to Play Modal */}
      <HowToPlayModal
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />

      {/* Custom Alert */}
      <AlertComponent />
    </div>
  );
}

function LoadingFallback() {
  // Note: This component can't use useAccessibility because it's outside the provider
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
        <p className="text-white/90 text-xl">Loading daily game...</p>
      </div>
    </div>
  );
}

export default function DailyPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DailyGameContent />
    </Suspense>
  );
}
