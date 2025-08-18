// Polyfill for Node.js crypto module in browser
// This provides a browser-compatible alternative to Node's crypto module

export const randomBytes = (size) => {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes);
};

export const createHash = (algorithm) => {
  return {
    update: (data) => {
      // Store data for digest
      this._data = data;
      return this;
    },
    digest: async (encoding) => {
      const encoder = new TextEncoder();
      const data = encoder.encode(this._data);
      const hash = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hash));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return encoding === 'hex' ? hashHex : hash;
    }
  };
};

export default {
  randomBytes,
  createHash
};
