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

export function encryptWordle(wordle: { word: string; maxGuesses: number; hardMode?: boolean; realWordsOnly?: boolean; hint?: string }): string {
  const encryptedWord = vigenereCipher(wordle.word, CIPHER_KEY, true);
  
  // Build suffix: guess count, then hard mode indicator, then hint
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
  
  // Add real words only indicator if enabled
  if (wordle.realWordsOnly) {
    suffix += '_r';
  }
  
  // Add hint if provided (base64 encoded to handle special characters)
  if (wordle.hint) {
    try {
      const encodedHint = btoa(wordle.hint).replace(/[+/=]/g, (char) => {
        switch (char) {
          case '+': return '-';
          case '/': return '_';
          case '=': return '';
          default: return char;
        }
      });
      suffix += `_hint${encodedHint}`;
    } catch (error) {
      // Find the problematic characters (outside Latin1 range)
      const problematicChars = Array.from(wordle.hint)
        .filter(char => char.charCodeAt(0) > 255)
        .filter((char, index, self) => self.indexOf(char) === index); // unique characters only
      
      if (problematicChars.length > 0) {
        const charList = problematicChars.map(char => `"${char}"`).join(', ');
        throw new Error(`Hint contains unsupported character(s): ${charList}. Please remove these characters or use standard text only.`);
      }
      
      throw new Error('Hint contains unsupported characters. Please use only standard text characters.');
    }
  }
  
  return `${encryptedWord}${suffix}`;
}

export function decryptWordle(encryptedData: string): { word: string; maxGuesses: number; hardMode: boolean; realWordsOnly?: boolean; hint?: string } | null {
  try {
    let encryptedWord: string;
    let maxGuesses: number = 6; // default
    let hardMode: boolean = false; // default
    let realWordsOnly: boolean = false; // default
    let hint: string | undefined = undefined; // default
    
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
        } else if (part === 'r') {
          realWordsOnly = true;
        } else if (part.startsWith('hint')) {
          // Decode hint
          try {
            const encodedHint = part.substring(4); // Remove 'hint' prefix
            // Restore base64 padding and characters
            const base64Hint = encodedHint.replace(/[-_]/g, (char) => {
              switch (char) {
                case '-': return '+';
                case '_': return '/';
                default: return char;
              }
            });
            // Add padding if needed
            const paddedHint = base64Hint + '=='.substring(0, (4 - base64Hint.length % 4) % 4);
            hint = atob(paddedHint);
          } catch (e) {
            console.warn('Failed to decode hint:', e);
          }
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
    
    const result: { word: string; maxGuesses: number; hardMode: boolean; realWordsOnly?: boolean; hint?: string } = {
      word: word.toUpperCase(),
      maxGuesses,
      hardMode,
      realWordsOnly
    };
    
    if (hint) {
      result.hint = hint;
    }
    
    return result;
  } catch (error) {
    console.error('Failed to decrypt wordle:', error);
    return null;
  }
}

 