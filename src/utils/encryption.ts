const CIPHER_KEY = 'WORDLE';

function vigenereCipher(text: string, key: string, encrypt: boolean = true): string {
  const result: string[] = [];
  const keyUpper = key.toUpperCase();
  let keyIndex = 0;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    if (/[A-Za-z]/.test(char)) {
      const isUpperCase = char === char.toUpperCase();
      const charCode = char.toUpperCase().charCodeAt(0) - 65; // A=0, B=1, etc.
      const keyChar = keyUpper.charCodeAt(keyIndex % keyUpper.length) - 65;
      
      let newCharCode;
      if (encrypt) {
        newCharCode = (charCode + keyChar) % 26;
      } else {
        newCharCode = (charCode - keyChar + 26) % 26;
      }
      
      const newChar = String.fromCharCode(newCharCode + 65);
      result.push(isUpperCase ? newChar : newChar.toLowerCase());
      keyIndex++;
    } else {
      result.push(char);
    }
  }
  
  return result.join('');
}

export function encryptWordle(wordle: { word: string; maxGuesses: number; hardMode?: boolean }): string {
  const encryptedWord = vigenereCipher(wordle.word, CIPHER_KEY, true);
  
  // Build suffix: guess count, then hard mode indicator
  let suffix = '';
  
  // Add guess count if different from default (6)
  if (wordle.maxGuesses !== 6) {
    if (wordle.maxGuesses === Infinity) {
      suffix += '_inf';
    } else {
      suffix += `_${wordle.maxGuesses}`;
    }
  }
  
  // Add hard mode indicator if enabled
  if (wordle.hardMode) {
    suffix += '_h';
  }
  
  return `${encryptedWord}${suffix}`;
}

export function decryptWordle(encryptedData: string): { word: string; maxGuesses: number; hardMode: boolean } | null {
  try {
    let encryptedWord: string;
    let maxGuesses: number = 6; // default
    let hardMode: boolean = false; // default
    
    // Parse suffixes if they exist
    if (encryptedData.includes('_')) {
      const parts = encryptedData.split('_');
      encryptedWord = parts[0];
      
      // Process each suffix part
      for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        
        if (part === 'inf') {
          maxGuesses = Infinity;
        } else if (part === 'h') {
          hardMode = true;
        } else {
          // Try to parse as number
          const parsed = parseInt(part, 10);
          if (!isNaN(parsed) && parsed >= 1) {
            maxGuesses = parsed;
          }
        }
      }
    } else {
      encryptedWord = encryptedData;
    }
    
    const word = vigenereCipher(encryptedWord, CIPHER_KEY, false);
    
    return { word: word.toUpperCase(), maxGuesses, hardMode };
  } catch (error) {
    console.error('Failed to decrypt wordle:', error);
    return null;
  }
} 