import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'ai-platform-secure-key-2024';
const IV_LENGTH = 16;

/**
 * Encrypts text using AES encryption
 */
export function encrypt(text: string): string {
  try {
    const iv = CryptoJS.lib.WordArray.random(IV_LENGTH);
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    // Combine IV and encrypted data
    const combined = iv.concat(encrypted.ciphertext);
    return combined.toString(CryptoJS.enc.Base64);
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts text using AES decryption
 */
export function decrypt(encryptedText: string): string {
  try {
    const combined = CryptoJS.enc.Base64.parse(encryptedText);
    
    // Extract IV (first 16 bytes) and ciphertext
    const iv = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4));
    const ciphertext = CryptoJS.lib.WordArray.create(combined.words.slice(4));
    
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertext } as any,
      ENCRYPTION_KEY,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Secure local storage wrapper with encryption
 */
export const secureStorage = {
  setItem: (key: string, value: string): void => {
    try {
      const encryptedValue = encrypt(value);
      localStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error('Failed to store encrypted data:', error);
      throw error;
    }
  },

  getItem: (key: string): string | null => {
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) return null;
      
      return decrypt(encryptedValue);
    } catch (error) {
      console.error('Failed to retrieve encrypted data:', error);
      // Remove corrupted data
      localStorage.removeItem(key);
      return null;
    }
  },

  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },

  clear: (): void => {
    localStorage.clear();
  }
};

/**
 * Hash a string using SHA-256
 */
export function hashString(text: string): string {
  return CryptoJS.SHA256(text).toString(CryptoJS.enc.Hex);
}

/**
 * Generate a random token
 */
export function generateToken(length: number = 32): string {
  return CryptoJS.lib.WordArray.random(length).toString();
}

/**
 * Validate if a string is likely encrypted by our system
 */
export function isEncrypted(text: string): boolean {
  try {
    // Check if it's valid base64 and has reasonable length
    const decoded = CryptoJS.enc.Base64.parse(text);
    return decoded.words.length > 4; // Should have at least IV + some data
  } catch {
    return false;
  }
}
