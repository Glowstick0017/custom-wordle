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

/**
 * Validates if a word is a real word using the dictionary API
 */
export async function validateRealWord(word: string): Promise<{ isValid: boolean; error?: string }> {
  if (!word || word.trim().length === 0) {
    return { isValid: false, error: 'Word is required' };
  }

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
    
    if (response.status === 404) {
      return { isValid: false, error: 'Not a real word' };
    }
    
    if (!response.ok) {
      return { isValid: false, error: 'Could not verify word' };
    }
    
    return { isValid: true };
  } catch (error) {
    console.error('Dictionary API error:', error);
    return { isValid: false, error: 'Could not verify word (network error)' };
  }
}

/**
 * Fetches the definition of a word from the dictionary API
 */
export async function fetchWordDefinition(word: string): Promise<{ word: string; definition: string } | null> {
  if (!word || word.trim().length === 0) {
    return null;
  }

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
    
    if (response.status === 404) {
      return null; // Word not found
    }
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    // Extract the first definition from the response
    if (data && data.length > 0 && data[0].meanings && data[0].meanings.length > 0) {
      const firstMeaning = data[0].meanings[0];
      if (firstMeaning.definitions && firstMeaning.definitions.length > 0) {
        return {
          word: data[0].word,
          definition: firstMeaning.definitions[0].definition
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Dictionary API error:', error);
    return null;
  }
}

/**
 * Validates if a guess follows hard mode rules
 * Hard mode requires all revealed hints (green and yellow letters) to be used in subsequent guesses
 */
export function validateHardModeGuess(
  guess: string, 
  previousGuesses: string[], 
  word: string
): { isValid: boolean; error?: string } {
  if (previousGuesses.length === 0) {
    return { isValid: true }; // First guess is always valid
  }

  // Collect all revealed hints from previous guesses
  const requiredGreenLetters: { [position: number]: string } = {};
  const requiredYellowLetters: Set<string> = new Set();

  previousGuesses.forEach(prevGuess => {
    const result = checkGuess(prevGuess, word);
    result.forEach((letterState, position) => {
      if (letterState.status === 'correct') {
        requiredGreenLetters[position] = letterState.letter;
      } else if (letterState.status === 'present') {
        requiredYellowLetters.add(letterState.letter);
      }
    });
  });

  const guessArray = guess.toUpperCase().split('');
  
  // Check that all green letters are in correct positions
  for (const [position, letter] of Object.entries(requiredGreenLetters)) {
    const pos = parseInt(position);
    if (guessArray[pos] !== letter) {
      return { 
        isValid: false, 
        error: `Must use ${letter} in position ${pos + 1}` 
      };
    }
  }

  // Check that all yellow letters are included somewhere in the guess
  for (const letter of requiredYellowLetters) {
    if (!guessArray.includes(letter)) {
      return { 
        isValid: false, 
        error: `Must include the letter ${letter}` 
      };
    }
  }

  return { isValid: true };
}

export function generateShareText(
  guesses: string[],
  word: string,
  gameStatus: 'won' | 'lost',
  maxGuesses: number,
  hardMode: boolean = false,
  realWordsOnly: boolean = false
): string {
  const hardModeIndicator = hardMode ? ' *' : '';
  const result = gameStatus === 'won' 
    ? `${guesses.length}/${maxGuesses === Infinity ? '∞' : maxGuesses}${hardModeIndicator}`
    : `X/${maxGuesses === Infinity ? '∞' : maxGuesses}${hardModeIndicator}`;
  
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
    maxGuesses: maxGuesses,
    hardMode: hardMode,
    realWordsOnly: realWordsOnly
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