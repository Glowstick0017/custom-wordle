import { GameState, LetterState, KeyboardKey } from '@/types/game';

// Extended interface for saving complete game session
interface SavedGameSession {
  gameState: GameState;
  letterStates: { [key: string]: LetterState[] };
  keyStates: { [key: string]: KeyboardKey };
  url: string; // Store the current URL or game identifier
  savedAt: string; // ISO timestamp when saved
  gameType: 'daily' | 'custom';
  dailyDate?: string; // For daily games, store the date
}

/**
 * Generate a unique key for storing game sessions
 */
function getGameSessionKey(gameType: 'daily' | 'custom', identifier?: string): string {
  if (gameType === 'daily') {
    const today = new Date().toDateString(); // e.g., "Mon Sep 20 2025"
    return `glowdle_daily_${today}`;
  } else {
    // For custom games, use the encrypted parameter as identifier
    return `glowdle_custom_${identifier || 'default'}`;
  }
}

/**
 * Get today's date string for daily game comparison
 */
function getTodayDateString(): string {
  return new Date().toDateString();
}

/**
 * Save the current game session to localStorage
 */
export function saveGameSession(
  gameState: GameState,
  letterStates: { [key: string]: LetterState[] },
  keyStates: { [key: string]: KeyboardKey },
  gameType: 'daily' | 'custom',
  customGameId?: string
): void {
  try {
    const session: SavedGameSession = {
      gameState,
      letterStates,
      keyStates,
      url: window.location.href,
      savedAt: new Date().toISOString(),
      gameType,
      dailyDate: gameType === 'daily' ? getTodayDateString() : undefined
    };

    const key = getGameSessionKey(gameType, customGameId);
    localStorage.setItem(key, JSON.stringify(session));
    console.log(`Saved ${gameType} game session:`, { key, gameState: gameState.guesses.length + ' guesses' });
  } catch (error) {
    console.error('Failed to save game session:', error);
  }
}

/**
 * Load a saved game session from localStorage
 */
export function loadGameSession(
  gameType: 'daily' | 'custom',
  customGameId?: string
): SavedGameSession | null {
  try {
    const key = getGameSessionKey(gameType, customGameId);
    const saved = localStorage.getItem(key);
    
    console.log(`Attempting to load ${gameType} game session:`, { key, found: !!saved });
    
    if (!saved) {
      return null;
    }

    const session: SavedGameSession = JSON.parse(saved);

    // For daily games, check if the saved session is from today
    if (gameType === 'daily') {
      const today = getTodayDateString();
      if (session.dailyDate !== today) {
        console.log('Daily session expired, removing:', { sessionDate: session.dailyDate, today });
        // Remove outdated daily game session
        localStorage.removeItem(key);
        return null;
      }
    }

    console.log(`Loaded ${gameType} game session:`, { guesses: session.gameState.guesses.length });
    return session;
  } catch (error) {
    console.error('Failed to load game session:', error);
    return null;
  }
}

/**
 * Clear a saved game session
 */
export function clearGameSession(
  gameType: 'daily' | 'custom',
  customGameId?: string
): void {
  try {
    const key = getGameSessionKey(gameType, customGameId);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear game session:', error);
  }
}

/**
 * Clear all outdated daily game sessions
 * This can be called on app startup to clean up old sessions
 */
export function clearOutdatedDailySessions(): void {
  try {
    const today = getTodayDateString();
    const keysToRemove: string[] = [];

    // Find all daily game keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('glowdle_daily_')) {
        const saved = localStorage.getItem(key);
        if (saved) {
          try {
            const session: SavedGameSession = JSON.parse(saved);
            if (session.dailyDate !== today) {
              keysToRemove.push(key);
            }
          } catch {
            // If we can't parse it, remove it
            keysToRemove.push(key);
          }
        }
      }
    }

    // Remove outdated sessions
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    if (keysToRemove.length > 0) {
      console.log(`Cleaned up ${keysToRemove.length} outdated daily game sessions`);
    }
  } catch (error) {
    console.error('Failed to clear outdated daily sessions:', error);
  }
}

/**
 * Check if there's a saved session for the current game
 */
export function hasSavedSession(
  gameType: 'daily' | 'custom',
  customGameId?: string
): boolean {
  return loadGameSession(gameType, customGameId) !== null;
}