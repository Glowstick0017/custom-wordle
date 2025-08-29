// URL to the official Wordle answers list
const WORDLE_ANSWERS_URL = 'https://gist.githubusercontent.com/cfreshman/a03ef2cba789d8cf00c08f767e0fad7b/raw/c46f451920d5cf6326d550fb2d6abb1642717852/wordle-answers-alphabetical.txt';

// Cache for the word list to avoid repeated fetches
let cachedWordList: string[] | null = null;
let fetchPromise: Promise<string[]> | null = null;

// Cache for validated words to avoid repeated dictionary API calls
const validatedWordsCache: Map<string, boolean> = new Map();

/**
 * Shuffles an array using the Fisher-Yates algorithm with a seeded random number generator
 * This ensures the same seed always produces the same shuffle order
 */
function seededShuffle<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let currentIndex = shuffled.length;
  
  // Simple seeded random number generator (Linear Congruential Generator)
  let randomSeed = seed;
  const seededRandom = () => {
    randomSeed = (randomSeed * 1664525 + 1013904223) % 4294967296;
    return randomSeed / 4294967296;
  };

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(seededRandom() * currentIndex);
    currentIndex--;
    [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
  }

  return shuffled;
}

/**
 * Creates a better hash from a string using multiple hash functions
 * This implementation ensures good distribution even for similar strings
 */
function createStrongHash(str: string): number {
  let hash = 0;
  
  // Use a more sensitive hash function that amplifies small differences
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    // Use position-dependent multiplier to make character position matter more
    const positionMultiplier = (i + 1) * 31;
    hash = ((hash * 33) ^ (char * positionMultiplier)) >>> 0;
  }
  
  // Apply additional mixing to ensure good distribution
  hash ^= hash >>> 16;
  hash *= 0x85ebca6b;
  hash ^= hash >>> 13;
  hash *= 0xc2b2ae35;
  hash ^= hash >>> 16;
  
  return Math.abs(hash);
}

// Fallback words in case the fetch fails (from the original Wordle answers)
const FALLBACK_WORDS = [
  'ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER', 'AGAIN',
  'AGENT', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT', 'ALIEN', 'ALIGN', 'ALIKE', 'ALIVE',
  'ALLOW', 'ALONE', 'ALONG', 'ALTER', 'AMONG', 'ANGER', 'ANGLE', 'ANGRY', 'APART', 'APPLE',
  'APPLY', 'ARENA', 'ARGUE', 'ARISE', 'ARRAY', 'ASIDE', 'ASSET', 'AUDIO', 'AUDIT', 'AVOID',
  'AWAKE', 'AWARE', 'BADLY', 'BAKER', 'BASES', 'BASIC', 'BEACH', 'BEGAN', 'BEGIN', 'BEING',
  'BELOW', 'BENCH', 'BILLY', 'BIRTH', 'BLACK', 'BLAME', 'BLANK', 'BLIND', 'BLOCK', 'BLOOD',
  'BOARD', 'BOOST', 'BOOTH', 'BOUND', 'BRAIN', 'BRAND', 'BRAVE', 'BREAD', 'BREAK', 'BREED',
  'BRIEF', 'BRING', 'BROAD', 'BROKE', 'BROWN', 'BUILD', 'BUILT', 'BUYER', 'CABLE', 'CARRY',
  'CATCH', 'CAUSE', 'CHAIN', 'CHAIR', 'CHAOS', 'CHARM', 'CHART', 'CHASE', 'CHEAP', 'CHECK',
  'CHEST', 'CHIEF', 'CHILD', 'CHINA', 'CHOSE', 'CIVIL', 'CLAIM', 'CLASS', 'CLEAN', 'CLEAR',
  'CLICK', 'CLIMB', 'CLOCK', 'CLOSE', 'CLOUD', 'COACH', 'COAST', 'COULD', 'COUNT', 'COURT',
  'COVER', 'CRAFT', 'CRASH', 'CRAZY', 'CREAM', 'CRIME', 'CROSS', 'CROWD', 'CROWN', 'CRUDE',
  'CURVE', 'CYCLE', 'DAILY', 'DANCE', 'DATED', 'DEALT', 'DEATH', 'DEBUT', 'DELAY', 'DEPTH',
  'DOING', 'DOUBT', 'DOZEN', 'DRAFT', 'DRAMA', 'DRANK', 'DRAWN', 'DREAM', 'DRESS', 'DRILL',
  'DRINK', 'DRIVE', 'DROVE', 'DYING', 'EAGER', 'EARLY', 'EARTH', 'EIGHT', 'ELITE', 'EMPTY',
  'ENEMY', 'ENJOY', 'ENTER', 'ENTRY', 'EQUAL', 'ERROR', 'EVENT', 'EVERY', 'EXACT', 'EXIST',
  'EXTRA', 'FAITH', 'FALSE', 'FAULT', 'FIBER', 'FIELD', 'FIFTH', 'FIFTY', 'FIGHT', 'FINAL',
  'FIRST', 'FIXED', 'FLASH', 'FLEET', 'FLOOR', 'FLUID', 'FOCUS', 'FORCE', 'FORTH', 'FORTY',
  'FORUM', 'FOUND', 'FRAME', 'FRANK', 'FRAUD', 'FRESH', 'FRONT', 'FRUIT', 'FULLY', 'FUNNY'
];

/**
 * Fetches the official Wordle answers list from GitHub
 */
async function fetchWordList(showAlert?: (message: string, type: 'success' | 'error' | 'info') => void): Promise<string[]> {
  // Return cached result if available
  if (cachedWordList) {
    return cachedWordList;
  }

  // Return existing promise if already fetching
  if (fetchPromise) {
    return fetchPromise;
  }

  // Create new fetch promise
  fetchPromise = (async () => {
    try {
      const response = await fetch(WORDLE_ANSWERS_URL);
      if (!response.ok) {
        const errorMsg = `Failed to fetch word list: HTTP ${response.status}`;
        if (showAlert) {
          showAlert(errorMsg, 'error');
        }
        throw new Error(errorMsg);
      }
      
      const text = await response.text();
      const words = text
        .trim()
        .split(/\s+/)
        .map(word => word.toUpperCase())
        .filter(word => word.length === 5 && /^[A-Z]+$/.test(word));
      
      if (words.length === 0) {
        const errorMsg = 'No valid words found in the word list';
        if (showAlert) {
          showAlert(errorMsg, 'error');
        }
        throw new Error(errorMsg);
      }
      
      // Shuffle the words with a fixed seed to ensure consistent but non-alphabetical order
      const shuffledWords = seededShuffle(words, 789456); // Fixed seed for consistency
      cachedWordList = shuffledWords;
      console.log(`Loaded and shuffled ${shuffledWords.length} words from official Wordle list`);
      return shuffledWords;
    } catch (error) {
      console.error('Failed to fetch Wordle words, using fallback list:', error);
      if (showAlert && error instanceof Error && !error.message.includes('HTTP')) {
        showAlert('Network error loading word list. Using offline words.', 'error');
      }
      // Also shuffle the fallback words
      const shuffledFallback = seededShuffle(FALLBACK_WORDS, 789456);
      cachedWordList = shuffledFallback;
      return shuffledFallback;
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

/**
 * Generates a deterministic daily word based on the current date
 * Uses a strong hash function and pre-shuffled word list to ensure unpredictable but consistent selection
 * Validates the selected word against the dictionary API and falls back to other words if needed
 */
export async function getDailyWord(showAlert?: (message: string, type: 'success' | 'error' | 'info') => void): Promise<string> {
  const wordList = await fetchWordList(showAlert);
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const dateString = today.getFullYear() + '-' + 
    String(today.getMonth() + 1).padStart(2, '0') + '-' + 
    String(today.getDate()).padStart(2, '0');
  
  // Create a strong hash from the date string
  const hash = createStrongHash(dateString);
  
  // Try up to 10 words to find a valid one
  const maxAttempts = 10;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Use the hash + attempt to select a word from our shuffled list
    const index = (hash + attempt) % wordList.length;
    const candidate = wordList[index];
    
    // Validate the word against the dictionary API
    const isValid = await validateDailyWord(candidate, showAlert);
    if (isValid) {
      console.log(`Daily word selected: "${candidate}" (attempt ${attempt + 1})`);
      return candidate;
    }
    
    console.log(`Word "${candidate}" failed dictionary validation, trying next word...`);
  }
  
  // If we couldn't find a valid word after maxAttempts, fall back to the first word
  // This should be extremely rare given that the word list comes from official Wordle answers
  const fallbackWord = wordList[hash % wordList.length];
  console.warn(`Could not validate any daily word after ${maxAttempts} attempts, using fallback: "${fallbackWord}"`);
  return fallbackWord;
}

/**
 * Get the formatted date string for display
 */
export function getDailyGameDate(): string {
  const today = new Date();
  return today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * Check if a word is in our daily words list
 */
export async function isValidDailyWord(word: string): Promise<boolean> {
  const wordList = await fetchWordList();
  return wordList.includes(word.toUpperCase());
}

/**
 * Validates a word against the dictionary API with caching
 * This is used to ensure our daily words are real dictionary words
 */
export async function validateDailyWord(word: string, showAlert?: (message: string, type: 'success' | 'error' | 'info') => void): Promise<boolean> {
  // Check cache first
  const upperWord = word.toUpperCase();
  if (validatedWordsCache.has(upperWord)) {
    return validatedWordsCache.get(upperWord)!;
  }

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
    
    if (response.status === 404) {
      // 404 is expected for invalid words, don't show alert
      validatedWordsCache.set(upperWord, false);
      return false;
    }
    
    if (!response.ok) {
      const errorMsg = `Dictionary API error: HTTP ${response.status}`;
      console.error(errorMsg);
      if (showAlert) {
        showAlert('Unable to verify word. Please try again later.', 'error');
      }
      // Don't cache API errors, allow retry
      return false;
    }
    
    const isValid = response.status === 200;
    // Cache the result
    validatedWordsCache.set(upperWord, isValid);
    return isValid;
  } catch (error) {
    console.error(`Error validating word "${word}":`, error);
    if (showAlert) {
      showAlert('Network error verifying word. Please check your connection.', 'error');
    }
    // Don't cache network errors, allow retry
    return false;
  }
}

/**
 * Validates multiple words against the dictionary API
 * Useful for batch validation of the word list
 */
export async function validateWordList(words: string[], showAlert?: (message: string, type: 'success' | 'error' | 'info') => void): Promise<{ word: string; isValid: boolean }[]> {
  const results = await Promise.allSettled(
    words.map(async (word) => ({
      word,
      isValid: await validateDailyWord(word, showAlert)
    }))
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error(`Failed to validate word "${words[index]}":`, result.reason);
      return { word: words[index], isValid: false };
    }
  });
}

/**
 * Preloads the word list for better performance
 * Call this early in the application lifecycle
 */
export async function preloadWordList(): Promise<void> {
  try {
    await fetchWordList();
  } catch (error) {
    console.error('Failed to preload word list:', error);
  }
}