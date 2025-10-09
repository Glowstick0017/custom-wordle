'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Share2, BarChart3, RotateCcw, Plus, Info } from 'lucide-react';
import GameBoard from '@/components/GameBoard';
import Keyboard from '@/components/Keyboard';
import Modal from '@/components/Modal';
import StatsModal from '@/components/StatsModal';
import CreateModal from '@/components/CreateModal';
import HowToPlayModal from '@/components/HowToPlayModal';
import AccessibilityToggle from '@/components/AccessibilityToggle';
import Timer from '@/components/Timer';
import { useAlert } from '@/components/Alert';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { decryptWordle } from '@/utils/encryption';
import { checkGuess, isValidWord, generateShareText, updateStats, getStoredStats, validateHardModeGuess, validateRealWord, fetchWordDefinition } from '@/utils/gameLogic';
import { saveGameSession, loadGameSession, clearGameSession } from '@/utils/gameSession';
import { GameState, LetterState, KeyboardKey } from '@/types/game';
import LoadingGame from '@/components/LoadingGame';

function PlayGameContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showAlert, AlertComponent } = useAlert(true);
  const { isAccessibilityMode } = useAccessibility();
  const [gameState, setGameState] = useState<GameState>({
    word: '',
    guesses: [],
    currentGuess: '',
    gameStatus: 'playing',
    maxGuesses: 6,
    wordLength: 5,
    hardMode: false,
    hint: undefined,
    timeTrialMode: false,
    timeLimit: 60,
    timeRemaining: 60,
    timeTaken: 0
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
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [timerStarted, setTimerStarted] = useState(false);

  // Initialize game from URL parameter
  useEffect(() => {
    const encryptedData = searchParams.get('w');
    if (encryptedData) {
      setCurrentGameId(encryptedData);

      // Try to load saved session first
      const savedSession = loadGameSession('custom', encryptedData);

      if (savedSession) {
        // Restore saved game state
        setGameState(savedSession.gameState);
        setLetterStates(savedSession.letterStates);
        setKeyStates(savedSession.keyStates);
        setGameLoaded(true);
        
        // Restore timer state if in time trial mode and game is active
        if (savedSession.gameState.timeTrialMode && savedSession.gameState.gameStatus === 'playing') {
          setTimerStarted(savedSession.gameState.guesses.length > 0 || savedSession.gameState.currentGuess.length > 0);
        }

        // If the game was already complete, show the game over modal
        if (savedSession.gameState.gameStatus === 'won' || savedSession.gameState.gameStatus === 'lost') {
          const shareTextContent = generateShareText(
            savedSession.gameState.guesses,
            savedSession.gameState.word,
            savedSession.gameState.gameStatus,
            savedSession.gameState.maxGuesses,
            savedSession.gameState.hardMode,
            savedSession.gameState.realWordsOnly,
            savedSession.gameState.hint,
            savedSession.gameState.timeTrialMode,
            savedSession.gameState.timeTaken
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

      // No saved session, decrypt and start fresh
      const decrypted = decryptWordle(encryptedData);
      if (decrypted) {
        // Set the new game data directly (don't call resetAllGameState)
        setGameState({
          word: decrypted.word,
          guesses: [],
          currentGuess: '',
          gameStatus: 'playing',
          maxGuesses: decrypted.maxGuesses,
          wordLength: decrypted.word.length,
          hardMode: decrypted.hardMode,
          realWordsOnly: decrypted.realWordsOnly,
          hint: decrypted.hint,
          timeTrialMode: decrypted.timeTrialMode || false,
          timeLimit: decrypted.timeLimit || 60,
          timeRemaining: decrypted.timeLimit || 60,
          timeTaken: 0
        });
        setLetterStates({});
        setKeyStates({});
        setShowGameOver(false);
        setTimerStarted(false);
        setShareText('');
        setWordDefinition(null);
        setIsLoadingDefinition(false);
        setGameLoaded(true);
      } else {
        showAlert('Invalid or corrupted game link', 'error');
        router.push('/');
      }
    } else {
      setCurrentGameId(null);
      setGameLoaded(true);
    }
  }, [searchParams, router, showAlert]);

  // Timer countdown effect
  useEffect(() => {
    if (!gameState.timeTrialMode || gameState.gameStatus !== 'playing' || !timerStarted) {
      return;
    }

    // Pause timer when modals are open
    if (showGameOver || showStats || showCreate || showHowToPlay) {
      return;
    }

    const timer = setInterval(() => {
      setGameState(prev => {
        const newTimeRemaining = Math.max(0, (prev.timeRemaining || 0) - 1);
        
        // Check if time is up
        if (newTimeRemaining === 0 && prev.timeRemaining !== 0) {
          // Time's up! Handle game over
          setTimeout(() => {
            updateStats(false, prev.guesses.length);
            const shareTextContent = generateShareText(
              prev.guesses,
              prev.word,
              'lost',
              prev.maxGuesses,
              prev.hardMode,
              prev.realWordsOnly,
              prev.hint,
              prev.timeTrialMode,
              prev.timeTaken
            );
            setShareText(shareTextContent);

            // Fetch word definition
            setIsLoadingDefinition(true);
            fetchWordDefinition(prev.word, showAlert)
              .then(definition => {
                setWordDefinition(definition);
                setIsLoadingDefinition(false);
              })
              .catch(() => {
                setWordDefinition(null);
                setIsLoadingDefinition(false);
              });

            showAlert("⏰ Time's up!", 'error');
            setTimeout(() => setShowGameOver(true), 1000);
          }, 0);
          
          return {
            ...prev,
            gameStatus: 'lost',
            timeRemaining: 0,
            timeTaken: (prev.timeTaken || 0) + 1
          };
        }
        
        return {
          ...prev,
          timeRemaining: newTimeRemaining,
          timeTaken: (prev.timeTaken || 0) + 1
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.timeTrialMode, gameState.gameStatus, timerStarted, showGameOver, showStats, showCreate, showHowToPlay, showAlert]);

  // Save game state whenever it changes (but only after game is loaded and for valid games)
  useEffect(() => {
    if (gameLoaded && gameState.word && currentGameId) {
      saveGameSession(gameState, letterStates, keyStates, 'custom', currentGameId);
    }
  }, [gameState, letterStates, keyStates, gameLoaded, currentGameId]);

  // Handle keyboard input
  const handleKeyPress = useCallback((key: string) => {
    if (gameState.gameStatus !== 'playing') return;

    if (gameState.currentGuess.length < gameState.wordLength) {
      // Start timer on first key press in Time Trial mode
      if (gameState.timeTrialMode && !timerStarted && gameState.guesses.length === 0 && gameState.currentGuess.length === 0) {
        setTimerStarted(true);
      }

      setGameState(prev => ({
        ...prev,
        currentGuess: prev.currentGuess + key
      }));
    }
  }, [gameState.gameStatus, gameState.currentGuess.length, gameState.wordLength, gameState.timeTrialMode, gameState.guesses.length, timerStarted]);

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

    // Check real word validation if enabled
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
      const shareTextContent = generateShareText(
        newGuesses, 
        gameState.word, 
        won ? 'won' : 'lost', 
        gameState.maxGuesses, 
        gameState.hardMode, 
        gameState.realWordsOnly, 
        gameState.hint,
        gameState.timeTrialMode,
        gameState.timeTaken
      );
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
    if (currentGameId) {
      clearGameSession('custom', currentGameId);
    }

    setGameState(prev => ({
      ...prev,
      guesses: [],
      currentGuess: '',
      gameStatus: 'playing',
      timeRemaining: prev.timeLimit,
      timeTaken: 0
    }));
    setLetterStates({});
    setKeyStates({});
    setShowGameOver(false);
    setShareText('');
    setWordDefinition(null);
    setIsLoadingDefinition(false);
    setTimerStarted(false);
  };

  if (!gameLoaded) {
    return <LoadingGame label={"Loading game..."} isAccessibilityMode={isAccessibilityMode}/>
  }

  if (!gameState.word) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Accessibility Toggle */}
        <div className="absolute top-4 right-4 z-20">
          <AccessibilityToggle />
        </div>

        {!isAccessibilityMode && (
          <>
            <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-emerald-500/15 to-transparent rounded-full blur-xl"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-purple-500/15 to-transparent rounded-full blur-xl"></div>
          </>
        )}
        <div className="max-w-md w-full text-center space-y-6 glass-card p-8 rounded-xl relative z-10">
          <h1 className={`text-3xl font-bold ${isAccessibilityMode ? 'text-white' : 'gradient-text'}`}>No Game Found</h1>
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
      {/* Background gradient orbs - REDUCED FOR PERFORMANCE */}
      {!isAccessibilityMode && (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-r from-emerald-500/8 to-transparent rounded-full blur-xl"></div>
          <div className="absolute bottom-40 left-10 w-32 h-32 bg-gradient-to-r from-purple-500/8 to-transparent rounded-full blur-xl"></div>
        </div>
      )}

      {/* Header */}
      <header className="flex-shrink-0 glass-card border-b border-white/10 p-2 sm:p-4 relative z-0">
        <div className="max-w-lg mx-auto">
          <div className="grid grid-cols-[auto_1fr_auto] items-start gap-2 sm:gap-4">
            {/* Left buttons */}
            <div className="flex gap-1 sm:gap-2 shrink-0">
              <Link
                href="/"
                className="p-2 sm:p-3 glass-card glass-card-hover rounded-lg sm:rounded-xl transition-all duration-300 text-white/80 hover:text-white flex items-center justify-center"
              >
                <ArrowLeft className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
              </Link>
              <button
                onClick={() => setShowHowToPlay(true)}
                className="p-2 sm:p-3 glass-card glass-card-hover rounded-lg sm:rounded-xl transition-all duration-300 text-white/80 hover:text-white flex items-center justify-center"
                title="How to Play"
                aria-label="How to Play"
              >
                <Info className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Center content */}
            <div className="text-center min-w-0">
              <div className="flex items-center justify-center gap-1 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                <h1 className={`text-lg sm:text-xl font-bold ${isAccessibilityMode ? 'text-white' : 'gradient-text'}`}>Glowdle</h1>
                {gameState.hardMode && (
                  <div className="px-1.5 py-0.5 sm:px-2 sm:py-1 btn-gradient-accent text-white text-xs font-bold rounded-full shadow-lg">
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      🔥
                      <span className="hidden sm:inline">HARD</span>
                    </div>
                  </div>
                )}
                {gameState.timeTrialMode && (
                  <div className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      ⏱️
                      <span className="hidden sm:inline">TIME TRIAL</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-xs text-white/70 leading-tight sm:leading-relaxed space-y-0.5 sm:space-y-1">
                <div>{gameState.wordLength} letters • {gameState.maxGuesses === Infinity ? '∞' : gameState.maxGuesses} guesses</div>
                {gameState.hardMode && (
                  <div className="text-orange-300 font-medium">Revealed hints must be used</div>
                )}
                {gameState.realWordsOnly && (
                  <div className="text-blue-300 font-medium">Real words only</div>
                )}
                {gameState.timeTrialMode && (
                  <div className="text-purple-300 font-medium">
                    {timerStarted ? 'Timer running' : 'Timer starts on first letter'}
                  </div>
                )}
                {gameState.hint && (
                  <div className="text-cyan-300 font-medium italic break-words">💡 {gameState.hint}</div>
                )}
              </div>
            </div>

            {/* Right buttons */}
            <div className="flex gap-1 sm:gap-2 shrink-0">
              <AccessibilityToggle showText={false} />
              <button
                onClick={() => setShowStats(true)}
                className="p-2 sm:p-3 glass-card glass-card-hover rounded-lg sm:rounded-xl transition-all duration-300 text-white/80 hover:text-white flex items-center justify-center"
              >
                <BarChart3 className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Game Area - takes remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden px-2 sm:px-4 flex flex-col gap-3">
        {/* Timer - only show in Time Trial mode */}
        {gameState.timeTrialMode && (
          <div className="flex-shrink-0 pt-2">
            <Timer 
              timeRemaining={gameState.timeRemaining || 0}
              timeLimit={gameState.timeLimit || 60}
              isPaused={showGameOver || showStats || showCreate || showHowToPlay}
            />
          </div>
        )}
        
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
              <div className="space-y-2">
                <p className="text-white/90 text-lg">You guessed the word in {gameState.guesses.length} tries!</p>
                {gameState.timeTrialMode && gameState.timeTaken !== undefined && (
                  <div className="glass-card p-3 rounded-lg border border-purple-400/30 inline-block">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400">⏱️</span>
                      <span className="text-white/90 font-bold">
                        Time: {Math.floor(gameState.timeTaken / 60)}:{(gameState.timeTaken % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-white/80">The word was:</p>
                <p className={`text-3xl font-bold font-mono mt-2 ${isAccessibilityMode ? 'text-white' : 'gradient-text'}`}>{gameState.word}</p>
                {gameState.timeTrialMode && gameState.timeRemaining === 0 && (
                  <p className="text-red-400 text-sm mt-2">⏰ Time ran out!</p>
                )}
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
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-emerald-500/15 to-transparent rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-purple-500/15 to-transparent rounded-full blur-xl"></div>
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
