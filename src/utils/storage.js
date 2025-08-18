// Storage utility for secure local storage operations
import CryptoJS from 'crypto-js';

const STORAGE_PREFIX = 'per-ankh_';
const ENCRYPTION_KEY = 'per-ankh-2024-secure-key'; // In production, use environment variable

class SecureStorage {
  constructor(prefix = STORAGE_PREFIX) {
    this.prefix = prefix;
    this.isAvailable = this.checkAvailability();
  }

  checkAvailability() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('LocalStorage not available:', e);
      return false;
    }
  }

  encrypt(data) {
    try {
      const jsonString = JSON.stringify(data);
      return CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  }

  decrypt(encryptedData) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  set(key, value, encrypt = false) {
    if (!this.isAvailable) return false;
    
    try {
      const fullKey = this.prefix + key;
      const data = encrypt ? this.encrypt(value) : JSON.stringify(value);
      localStorage.setItem(fullKey, data);
      return true;
    } catch (error) {
      console.error('Storage set failed:', error);
      return false;
    }
  }

  get(key, decrypt = false) {
    if (!this.isAvailable) return null;
    
    try {
      const fullKey = this.prefix + key;
      const data = localStorage.getItem(fullKey);
      
      if (!data) return null;
      
      if (decrypt) {
        return this.decrypt(data);
      }
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Storage get failed:', error);
      return null;
    }
  }

  remove(key) {
    if (!this.isAvailable) return false;
    
    try {
      const fullKey = this.prefix + key;
      localStorage.removeItem(fullKey);
      return true;
    } catch (error) {
      console.error('Storage remove failed:', error);
      return false;
    }
  }

  clear(onlyPrefix = true) {
    if (!this.isAvailable) return false;
    
    try {
      if (onlyPrefix) {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(this.prefix)) {
            localStorage.removeItem(key);
          }
        });
      } else {
        localStorage.clear();
      }
      return true;
    } catch (error) {
      console.error('Storage clear failed:', error);
      return false;
    }
  }

  // Session storage methods
  setSession(key, value) {
    try {
      const fullKey = this.prefix + key;
      sessionStorage.setItem(fullKey, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Session storage set failed:', error);
      return false;
    }
  }

  getSession(key) {
    try {
      const fullKey = this.prefix + key;
      const data = sessionStorage.getItem(fullKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Session storage get failed:', error);
      return null;
    }
  }

  removeSession(key) {
    try {
      const fullKey = this.prefix + key;
      sessionStorage.removeItem(fullKey);
      return true;
    } catch (error) {
      console.error('Session storage remove failed:', error);
      return false;
    }
  }
}

// Export singleton instance
const storage = new SecureStorage();

export default storage;
export { SecureStorage };
