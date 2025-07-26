/**
 * Per Ankh Authentication Utility Tests
 * Comprehensive test suite for auth.js
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { auth } from '../../utils/auth.js';

describe('PerAnkhAuth', () => {
  beforeEach(() => {
    // Reset auth state
    auth.logout();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Input Validation', () => {
    it('should validate username correctly', () => {
      const validCases = [
        { username: 'testuser', password: 'Password123' },
        { username: 'user_123', password: 'Password123' },
        { username: 'user.name', password: 'Password123' }
      ];

      const invalidCases = [
        { username: '', password: 'Password123', error: 'Username is required' },
        { username: 'ab', password: 'Password123', error: 'Username must be between 3 and 50 characters' },
        { username: 'user@name', password: 'Password123', error: 'Username contains invalid characters' }
      ];

      validCases.forEach(({ username, password }) => {
        const result = auth.validateInput(username, password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      invalidCases.forEach(({ username, password, error }) => {
        const result = auth.validateInput(username, password);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(error);
      });
    });

    it('should validate password correctly', () => {
      const validCases = [
        { username: 'testuser', password: 'Password123' },
        { username: 'testuser', password: 'MySecure1' },
        { username: 'testuser', password: 'Complex9Pass' }
      ];

      const invalidCases = [
        { username: 'testuser', password: '', error: 'Password is required' },
        { username: 'testuser', password: 'short1', error: 'Password must be at least 8 characters long' },
        { username: 'testuser', password: 'nouppercase1', error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' },
        { username: 'testuser', password: 'NOLOWERCASE1', error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' },
        { username: 'testuser', password: 'NoNumbers', error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' }
      ];

      validCases.forEach(({ username, password }) => {
        const result = auth.validateInput(username, password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      invalidCases.forEach(({ username, password, error }) => {
        const result = auth.validateInput(username, password);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(error);
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should allow login attempts within limit', () => {
      expect(() => auth.checkRateLimit('testuser')).not.toThrow();
    });

    it('should block login attempts after max attempts', () => {
      const username = 'testuser';
      
      // Simulate max failed attempts
      for (let i = 0; i < 5; i++) {
        auth.recordLoginAttempt(username, false);
      }

      expect(() => auth.checkRateLimit(username)).toThrow(/Too many login attempts/);
    });

    it('should reset attempts after successful login', () => {
      const username = 'testuser';
      
      // Simulate some failed attempts
      for (let i = 0; i < 3; i++) {
        auth.recordLoginAttempt(username, false);
      }

      // Successful login should reset
      auth.recordLoginAttempt(username, true);

      expect(() => auth.checkRateLimit(username)).not.toThrow();
    });
  });

  describe('Authentication', () => {
    it('should authenticate valid credentials', async () => {
      const result = await auth.authenticate('testuser', 'Password123');
      
      expect(result.success).toBe(true);
      expect(result.user).toHaveProperty('username', 'testuser');
      expect(result.user).toHaveProperty('role');
      expect(result.user).toHaveProperty('permissions');
    });

    it('should reject invalid credentials', async () => {
      await expect(auth.authenticate('invalid', 'short')).rejects.toThrow();
    });

    it('should create secure session after authentication', async () => {
      await auth.authenticate('testuser', 'Password123');
      
      expect(auth.isAuthenticated()).toBe(true);
      
      const session = auth.getSession();
      expect(session).toHaveProperty('username', 'testuser');
      expect(session).toHaveProperty('loginTime');
      expect(session).toHaveProperty('expiresAt');
    });
  });

  describe('Session Management', () => {
    it('should return false for unauthenticated user', () => {
      expect(auth.isAuthenticated()).toBe(false);
      expect(auth.getSession()).toBeNull();
    });

    it('should handle expired sessions', async () => {
      // Mock expired session
      const expiredSession = {
        userId: 'test-123',
        username: 'testuser',
        role: 'member',
        permissions: ['read'],
        loginTime: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago
        expiresAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        sessionId: 'expired-session',
        csrfToken: 'expired-token'
      };

      // Mock encrypted session storage
      const mockEncrypted = btoa(JSON.stringify(expiredSession));
      localStorage.setItem.mockReturnValue(undefined);
      localStorage.getItem.mockReturnValue(mockEncrypted);
      sessionStorage.getItem.mockReturnValue('true');

      expect(auth.isAuthenticated()).toBe(false);
    });

    it('should validate session integrity', async () => {
      // Mock corrupted session
      localStorage.getItem.mockReturnValue('invalid-encrypted-data');
      sessionStorage.getItem.mockReturnValue('true');

      expect(auth.isAuthenticated()).toBe(false);
    });

    it('should generate CSRF token', async () => {
      await auth.authenticate('testuser', 'Password123');
      
      const token = auth.getCSRFToken();
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });
  });

  describe('Authorization', () => {
    beforeEach(async () => {
      // Setup authenticated user
      await auth.authenticate('testuser', 'Password123');
    });

    it('should check user permissions', () => {
      expect(auth.hasPermission('read')).toBe(true);
      expect(auth.hasPermission('admin')).toBe(false);
    });

    it('should check user roles', () => {
      expect(auth.hasRole('member')).toBe(true);
      expect(auth.hasRole('admin')).toBe(false);
    });

    it('should require authentication for protected functions', () => {
      const protectedFunction = vi.fn(() => 'success');
      
      const result = auth.requireAuth(protectedFunction);
      expect(result).toBe('success');
      expect(protectedFunction).toHaveBeenCalled();
    });

    it('should throw error for unauthenticated access', () => {
      auth.logout();
      
      const protectedFunction = vi.fn();
      
      expect(() => auth.requireAuth(protectedFunction)).toThrow('Authentication required');
      expect(protectedFunction).not.toHaveBeenCalled();
    });
  });

  describe('Logout', () => {
    beforeEach(async () => {
      await auth.authenticate('testuser', 'Password123');
    });

    it('should clear session data on logout', () => {
      expect(auth.isAuthenticated()).toBe(true);
      
      auth.logout();
      
      expect(auth.isAuthenticated()).toBe(false);
      expect(auth.getSession()).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalled();
      expect(sessionStorage.removeItem).toHaveBeenCalled();
    });

    it('should dispatch logout event', () => {
      const eventSpy = vi.spyOn(document, 'dispatchEvent');
      
      auth.logout();
      
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'userLoggedOut'
        })
      );
    });
  });

  describe('Security Features', () => {
    it('should setup security headers', () => {
      // Check if CSP meta tag is added
      const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      expect(cspMeta).toBeTruthy();
    });

    it('should generate secure session IDs', async () => {
      await auth.authenticate('testuser1', 'Password123');
      const session1 = auth.getSession();
      
      auth.logout();
      
      await auth.authenticate('testuser2', 'Password123');
      const session2 = auth.getSession();
      
      // Session IDs should be different
      expect(session1).not.toEqual(session2);
    });

    it('should handle session monitoring', () => {
      vi.useFakeTimers();
      
      // Mock session monitoring setup
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      
      // Initialize auth (which sets up monitoring)
      auth.init();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
      
      vi.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network failure
      vi.spyOn(auth, '_mockAuthentication').mockRejectedValue(new Error('Network error'));
      
      await expect(auth.authenticate('testuser', 'Password123')).rejects.toThrow('Network error');
    });

    it('should handle storage errors', () => {
      // Mock storage failure
      localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      
      expect(async () => {
        await auth.authenticate('testuser', 'Password123');
      }).rejects.toThrow();
    });

    it('should handle malformed session data', () => {
      localStorage.getItem.mockReturnValue('malformed-data');
      sessionStorage.getItem.mockReturnValue('true');
      
      expect(auth.isAuthenticated()).toBe(false);
      expect(auth.getSession()).toBeNull();
    });
  });
});
