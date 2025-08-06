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

export function encryptWordle(wordle: { word: string; maxGuesses: number }): string {
  const encryptedWord = vigenereCipher(wordle.word, CIPHER_KEY, true);
  
  // Only include guess count if it's different from default (6)
  if (wordle.maxGuesses === 6) {
    return encryptedWord;
  } else if (wordle.maxGuesses === Infinity) {
    return `${encryptedWord}_inf`;
  } else {
    return `${encryptedWord}_${wordle.maxGuesses}`;
  }
}

export function decryptWordle(encryptedData: string): { word: string; maxGuesses: number } | null {
  try {
    let encryptedWord: string;
    let maxGuesses: number = 6; // default
    
    // Check if there's a guess count suffix
    if (encryptedData.includes('_')) {
      const parts = encryptedData.split('_');
      encryptedWord = parts[0];
      const guessStr = parts[1];
      
      if (guessStr === 'inf') {
        maxGuesses = Infinity;
      } else {
        const parsed = parseInt(guessStr, 10);
        if (!isNaN(parsed) && parsed >= 1) {
          maxGuesses = parsed;
        }
      }
    } else {
      encryptedWord = encryptedData;
    }
    
    const word = vigenereCipher(encryptedWord, CIPHER_KEY, false);
    
    return { word: word.toUpperCase(), maxGuesses };
  } catch (error) {
    console.error('Failed to decrypt wordle:', error);
    return null;
  }
} 