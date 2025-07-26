/**
 * Per Ankh Secure Authentication Utility
 * Modern authentication system following 2025 security best practices
 */

import CryptoJS from 'crypto-js';
import validator from 'validator';

class PerAnkhAuth {
  constructor() {
    this.sessionKey = 'perankh_session';
    this.activeKey = 'perankh_active';
    this.encryptionKey = this._getOrCreateEncryptionKey();
    this.sessionTimeout = 8 * 60 * 60 * 1000; // 8 hours
    this.maxLoginAttempts = 5;
    this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
    
    this.init();
  }

  /**
   * Initialize authentication system
   */
  init() {
    this.checkAuthStatus();
    this.setupPeriodicValidation();
    this.setupSecurityHeaders();
  }

  /**
   * Setup periodic session validation
   * @private
   */
  setupPeriodicValidation() {
    // Check authentication every 5 minutes
    setInterval(() => {
      this.checkAuthStatus();
    }, 5 * 60 * 1000);

    // Clear expired sessions on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkAuthStatus();
      }
    });
  }

  /**
   * Setup security headers and CSP
   * @private
   */
  setupSecurityHeaders() {
    // Add security meta tags if not present
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      const cspMeta = document.createElement('meta');
      cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
      cspMeta.setAttribute('content', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self';"
      );
      document.head.appendChild(cspMeta);
    }
  }

  /**
   * Get or create encryption key for session data
   * @private
   */
  _getOrCreateEncryptionKey() {
    let key = sessionStorage.getItem('perankh_key');
    if (!key) {
      // Generate a new key for this session
      key = CryptoJS.lib.WordArray.random(256/8).toString();
      sessionStorage.setItem('perankh_key', key);
    }
    return key;
  }

  /**
   * Validate user input
   * @param {string} username 
   * @param {string} password 
   * @returns {Object} validation result
   */
  validateInput(username, password) {
    const errors = [];

    // Username validation
    if (!username || typeof username !== 'string') {
      errors.push('Username is required');
    } else {
      if (username.length < 3 || username.length > 50) {
        errors.push('Username must be between 3 and 50 characters');
      }
      if (!validator.isAlphanumeric(username, 'en-US', { ignore: '_-.' })) {
        errors.push('Username contains invalid characters');
      }
    }

    // Password validation
    if (!password || typeof password !== 'string') {
      errors.push('Password is required');
    } else {
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check rate limiting for login attempts
   * @param {string} identifier 
   * @returns {boolean}
   */
  checkRateLimit(identifier) {
    const key = `login_attempts_${identifier}`;
    const attempts = JSON.parse(localStorage.getItem(key) || '{"count": 0, "lastAttempt": 0}');
    const now = Date.now();

    // Reset attempts if lockout period has passed
    if (now - attempts.lastAttempt > this.lockoutDuration) {
      attempts.count = 0;
    }

    // Check if user is locked out
    if (attempts.count >= this.maxLoginAttempts) {
      const timeRemaining = this.lockoutDuration - (now - attempts.lastAttempt);
      if (timeRemaining > 0) {
        throw new Error(`Too many login attempts. Please try again in ${Math.ceil(timeRemaining / 60000)} minutes.`);
      }
    }

    return true;
  }

  /**
   * Record login attempt
   * @param {string} identifier 
   * @param {boolean} success 
   */
  recordLoginAttempt(identifier, success) {
    const key = `login_attempts_${identifier}`;
    const attempts = JSON.parse(localStorage.getItem(key) || '{"count": 0, "lastAttempt": 0}');

    if (success) {
      // Clear attempts on successful login
      localStorage.removeItem(key);
    } else {
      // Increment failed attempts
      attempts.count++;
      attempts.lastAttempt = Date.now();
      localStorage.setItem(key, JSON.stringify(attempts));
    }
  }

  /**
   * Authenticate user with secure API call
   * @param {string} username 
   * @param {string} password 
   * @returns {Promise<Object>}
   */
  async authenticate(username, password) {
    try {
      // Input validation
      const validation = this.validateInput(username, password);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Rate limiting
      this.checkRateLimit(username);

      // TODO: Replace with actual API endpoint
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'X-Requested-With': 'XMLHttpRequest'
      //   },
      //   body: JSON.stringify({ 
      //     username: validator.escape(username), 
      //     password: password // Don't escape password, let server handle it
      //   }),
      //   credentials: 'same-origin'
      // });

      // TEMPORARY: Simulate API response (REMOVE IN PRODUCTION)
      const mockResponse = await this._mockAuthentication(username, password);
      
      if (!mockResponse.success) {
        this.recordLoginAttempt(username, false);
        throw new Error(mockResponse.message || 'Authentication failed');
      }

      // Record successful login
      this.recordLoginAttempt(username, true);

      // Create secure session
      const sessionData = {
        userId: mockResponse.user.id,
        username: mockResponse.user.username,
        role: mockResponse.user.role,
        permissions: mockResponse.user.permissions || [],
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + this.sessionTimeout).toISOString(),
        sessionId: this._generateSecureSessionId(),
        csrfToken: this._generateCSRFToken()
      };

      // Store encrypted session
      await this._storeSecureSession(sessionData);

      // Set up session monitoring
      this._setupSessionMonitoring();

      return {
        success: true,
        user: {
          username: sessionData.username,
          role: sessionData.role,
          permissions: sessionData.permissions
        }
      };

    } catch (error) {
      console.error('Authentication error:', error.message);
      throw error;
    }
  }

  /**
   * TEMPORARY: Mock authentication (REMOVE IN PRODUCTION)
   * @private
   */
  async _mockAuthentication(username, password) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Basic validation for demo
    if (username.length >= 3 && password.length >= 8) {
      return {
        success: true,
        user: {
          id: Math.random().toString(36).substr(2, 9),
          username: username,
          role: username.includes('admin') ? 'admin' : 'member',
          permissions: username.includes('admin') ? ['read', 'write', 'admin'] : ['read']
        }
      };
    }

    return {
      success: false,
      message: 'Invalid credentials'
    };
  }

  /**
   * Generate secure session ID
   * @private
   */
  _generateSecureSessionId() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate CSRF token
   * @private
   */
  _generateCSRFToken() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Store encrypted session data
   * @private
   */
  async _storeSecureSession(sessionData) {
    try {
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(sessionData), 
        this.encryptionKey
      ).toString();
      
      localStorage.setItem(this.sessionKey, encrypted);
      sessionStorage.setItem(this.activeKey, 'true');
      
      // Store CSRF token separately for API requests
      sessionStorage.setItem('csrf_token', sessionData.csrfToken);
      
    } catch (error) {
      console.error('Session storage error:', error);
      throw new Error('Failed to create secure session');
    }
  }

  /**
   * Retrieve and decrypt session data
   * @private
   */
  _getSecureSession() {
    try {
      const encrypted = localStorage.getItem(this.sessionKey);
      if (!encrypted) return null;

      const decrypted = CryptoJS.AES.decrypt(encrypted, this.encryptionKey);
      const sessionData = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
      
      return sessionData;
    } catch (error) {
      console.error('Session decryption error:', error);
      this.logout();
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const active = sessionStorage.getItem(this.activeKey);
    if (!active) return false;

    const sessionData = this._getSecureSession();
    if (!sessionData) return false;

    // Check expiration
    const now = new Date();
    const expiresAt = new Date(sessionData.expiresAt);
    
    if (now >= expiresAt) {
      console.log('Session expired');
      this.logout();
      return false;
    }

    // Validate session integrity
    if (!sessionData.sessionId || !sessionData.userId) {
      console.error('Invalid session data');
      this.logout();
      return false;
    }

    return true;
  }

  /**
   * Get current user session
   */
  getSession() {
    if (!this.isAuthenticated()) return null;

    const sessionData = this._getSecureSession();
    if (!sessionData) return null;

    // Return safe session data (no sensitive info)
    return {
      userId: sessionData.userId,
      username: sessionData.username,
      role: sessionData.role,
      permissions: sessionData.permissions,
      loginTime: sessionData.loginTime,
      expiresAt: sessionData.expiresAt
    };
  }

  /**
   * Get CSRF token for API requests
   */
  getCSRFToken() {
    return sessionStorage.getItem('csrf_token');
  }

  /**
   * Check authentication status and update UI
   */
  checkAuthStatus() {
    const isAuth = this.isAuthenticated();
    const session = this.getSession();

    // Dispatch custom event for UI updates
    document.dispatchEvent(new CustomEvent('authStatusChanged', {
      detail: { isAuthenticated: isAuth, session }
    }));

    return { isAuthenticated: isAuth, session };
  }

  /**
   * Setup session monitoring
   * @private
   */
  _setupSessionMonitoring() {
    // Monitor for suspicious activity
    let lastActivity = Date.now();
    
    const updateActivity = () => {
      lastActivity = Date.now();
    };

    // Track user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Check for inactivity
    setInterval(() => {
      const inactiveTime = Date.now() - lastActivity;
      const maxInactiveTime = 30 * 60 * 1000; // 30 minutes

      if (inactiveTime > maxInactiveTime && this.isAuthenticated()) {
        console.log('Session expired due to inactivity');
        this.logout();
      }
    }, 60000); // Check every minute
  }

  /**
   * Logout user and clear session
   */
  logout() {
    try {
      // Clear all session data
      localStorage.removeItem(this.sessionKey);
      sessionStorage.removeItem(this.activeKey);
      sessionStorage.removeItem('csrf_token');
      sessionStorage.removeItem('perankh_key');

      // Clear any cached data
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            if (name.includes('perankh')) {
              caches.delete(name);
            }
          });
        });
      }

      // Dispatch logout event
      document.dispatchEvent(new CustomEvent('userLoggedOut'));

      console.log('User logged out successfully');
      
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Check if user has specific permission
   * @param {string} permission 
   */
  hasPermission(permission) {
    const session = this.getSession();
    return session?.permissions?.includes(permission) || false;
  }

  /**
   * Check if user has specific role
   * @param {string} role 
   */
  hasRole(role) {
    const session = this.getSession();
    return session?.role === role;
  }

  /**
   * Require authentication for function execution
   * @param {Function} callback 
   */
  requireAuth(callback) {
    if (this.isAuthenticated()) {
      return callback();
    } else {
      throw new Error('Authentication required');
    }
  }
}

// Export singleton instance
export const auth = new PerAnkhAuth();
export default auth;
