import { GameState, LetterState, GameStats } from '@/types/game';
import { encryptWordle } from './encryption';

export function checkGuess(guess: string, word: string): LetterState[] {
  const result: LetterState[] = [];
  const wordArray = word.toUpperCase().split('');
  const guessArray = guess.toUpperCase().split('');
  
  // First pass: mark correct letters
  const wordLetterCount: { [key: string]: number } = {};
  wordArray.forEach(letter => {
    wordLetterCount[letter] = (wordLetterCount[letter] || 0) + 1;
  });

  // Mark correct positions
  guessArray.forEach((letter, i) => {
    if (letter === wordArray[i]) {
      result[i] = { letter, status: 'correct' };
      wordLetterCount[letter]--;
    } else {
      result[i] = { letter, status: 'absent' };
    }
  });

  // Second pass: mark present letters
  guessArray.forEach((letter, i) => {
    if (result[i].status !== 'correct' && wordLetterCount[letter] > 0) {
      result[i] = { letter, status: 'present' };
      wordLetterCount[letter]--;
    }
  });

  return result;
}

export function isValidWord(word: string, length: number): boolean {
  return word.length === length && /^[A-Za-z]+$/.test(word) && length >= 1 && length <= 30;
}

export function generateShareText(
  guesses: string[],
  word: string,
  gameStatus: 'won' | 'lost',
  maxGuesses: number
): string {
  const result = gameStatus === 'won' 
    ? `${guesses.length}/${maxGuesses === Infinity ? '∞' : maxGuesses}`
    : `X/${maxGuesses === Infinity ? '∞' : maxGuesses}`;
  
  let grid = '';
  guesses.forEach(guess => {
    const letterStates = checkGuess(guess, word);
    letterStates.forEach(({ status }) => {
      switch (status) {
        case 'correct':
          grid += '🟩';
          break;
        case 'present':
          grid += '🟨';
          break;
        case 'absent':
          grid += '⬜';
          break;
      }
    });
    grid += '\n';
  });

  // Generate encrypted game code and full URL
  const encryptedGame = encryptWordle({
    word: word.toUpperCase(),
    maxGuesses: maxGuesses
  });
  
  // Get the current domain or use a placeholder for the full URL
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.host}`
    : 'https://your-domain.com';
  
  const gameUrl = `${baseUrl}/play?w=${encryptedGame}`;

  return `Glowdle ${result}\n\n${grid}\n${gameUrl}`;
}

export function getStoredStats(): GameStats {
  if (typeof window === 'undefined') {
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      guessDistribution: {}
    };
  }

  const stored = localStorage.getItem('wordle-stats');
  if (stored) {
    return JSON.parse(stored);
  }

  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: {}
  };
}

export function updateStats(won: boolean, guessCount: number): GameStats {
  const stats = getStoredStats();
  
  stats.gamesPlayed++;
  
  if (won) {
    stats.gamesWon++;
    stats.currentStreak++;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    stats.guessDistribution[guessCount] = (stats.guessDistribution[guessCount] || 0) + 1;
  } else {
    stats.currentStreak = 0;
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem('wordle-stats', JSON.stringify(stats));
  }
  
  return stats;
} 