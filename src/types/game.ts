export interface GameState {
  word: string;
  guesses: string[];
  currentGuess: string;
  gameStatus: 'playing' | 'won' | 'lost';
  maxGuesses: number;
  wordLength: number;
  hardMode: boolean;
}

export interface CustomWordle {
  word: string;
  maxGuesses: number;
  hardMode: boolean;
  createdAt: string;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: { [key: number]: number };
}

export interface LetterState {
  letter: string;
  status: 'correct' | 'present' | 'absent' | 'empty';
}

export interface KeyboardKey {
  key: string;
  status: 'correct' | 'present' | 'absent' | 'unused';
} 