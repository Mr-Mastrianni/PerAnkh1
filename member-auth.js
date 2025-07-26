/**
 * Per Ankh Member Authentication Library
 * Provides member authentication utilities
 */

class PerAnkhMemberAuth {
    constructor() {
        this.sessionKey = 'perankh_member_session';
        this.activeKey = 'perankh_member_active';
        this.init();
    }

    init() {
        // Initialize authentication system
        this.checkAuthStatus();
        
        // Auto-check authentication every 5 minutes
        setInterval(() => this.checkAuthStatus(), 5 * 60 * 1000);
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const encryptedSession = localStorage.getItem(this.sessionKey);
        const active = sessionStorage.getItem(this.activeKey);
        
        if (!encryptedSession || !active) return false;

        try {
            const sessionData = this._decryptSessionData(encryptedSession);
            if (!sessionData) {
                this.logout();
                return false;
            }

            const now = new Date();
            const expiresAt = new Date(sessionData.expiresAt);

            // Check if session has expired
            if (now >= expiresAt) {
                console.log('Session expired, logging out');
                this.logout();
                return false;
            }

            // Validate session integrity
            if (!sessionData.sessionId || !sessionData.username) {
                console.error('Invalid session data');
                this.logout();
                return false;
            }

            return true;
        } catch (error) {
            console.error('Auth check error:', error);
            this.logout();
            return false;
        }
    }

    /**
     * Get current user session data
     */
    getSession() {
        try {
            const encryptedSession = localStorage.getItem(this.sessionKey);
            if (!encryptedSession) return null;
            
            const sessionData = this._decryptSessionData(encryptedSession);
            if (!sessionData) return null;

            // Return session data without sensitive information
            return {
                username: sessionData.username,
                role: sessionData.role,
                loginTime: sessionData.loginTime,
                expiresAt: sessionData.expiresAt
            };
        } catch (error) {
            console.error('Session retrieval error:', error);
            return null;
        }
    }

    /**
     * Check authentication status and update UI
     */
    checkAuthStatus() {
        const isAuth = this.isAuthenticated();
        const userType = 'member'; // Members are always members

        // Update navigation based on user type
        if (typeof window.updateNavigationForUserType === 'function') {
            window.updateNavigationForUserType(userType);
        }
    }

    /**
     * Format user role for display
     */
    formatRole(role) {
        const roleMap = {
            'member': 'Member',
            'premium_member': 'Premium Member',
            'community_leader': 'Community Leader'
        };
        
        return roleMap[role] || role;
    }

    /**
     * Login user
     * @param {string} username - User's username
     * @param {string} password - User's password
     * @returns {Promise<boolean>} - Login success status
     */
    async login(username, password) {
        try {
            // Input validation
            if (!username || !password) {
                throw new Error('Username and password are required');
            }

            if (username.length < 3 || password.length < 6) {
                throw new Error('Invalid username or password format');
            }

            // TODO: Replace with actual API call to your authentication server
            // const response = await fetch('/api/auth/login', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({ username, password })
            // });
            // 
            // if (!response.ok) {
            //     throw new Error('Authentication failed');
            // }
            // 
            // const userData = await response.json();

            // TEMPORARY: Demo authentication (REMOVE IN PRODUCTION)
            // This simulates a server response - replace with actual API
            const isValidDemo = await this._simulateServerAuth(username, password);
            
            if (!isValidDemo) {
                throw new Error('Invalid username or password');
            }

            // Create secure session data
            const sessionData = {
                username: username,
                role: 'member',
                loginTime: new Date().toISOString(),
                sessionId: this._generateSecureSessionId(),
                expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // 8 hours
            };

            // Store encrypted session
            const encryptedSession = this._encryptSessionData(sessionData);
            localStorage.setItem(this.sessionKey, encryptedSession);
            sessionStorage.setItem(this.activeKey, 'true');

            // Log successful login (without sensitive data)
            console.log(`User ${username} logged in successfully at ${sessionData.loginTime}`);

            // Refresh auth status
            this.checkAuthStatus();

            // Redirect to home
            window.location.href = 'website.html';
            
            return true;
        } catch (error) {
            console.error('Login error:', error.message);
            throw error;
        }
    }

    /**
     * TEMPORARY: Simulate server authentication (REMOVE IN PRODUCTION)
     * @private
     */
    async _simulateServerAuth(username, password) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Basic validation - replace with actual server validation
        return username.length >= 3 && password.length >= 6;
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
     * Encrypt session data (basic implementation)
     * @private
     */
    _encryptSessionData(data) {
        // TODO: Implement proper encryption in production
        // For now, just base64 encode (NOT SECURE - replace with real encryption)
        return btoa(JSON.stringify(data));
    }

    /**
     * Decrypt session data (basic implementation)
     * @private
     */
    _decryptSessionData(encryptedData) {
        try {
            // TODO: Implement proper decryption in production
            return JSON.parse(atob(encryptedData));
        } catch (error) {
            console.error('Session decryption failed:', error);
            return null;
        }
    }

    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem(this.sessionKey);
        sessionStorage.removeItem(this.activeKey);
        
        // Refresh auth status
        this.checkAuthStatus();
        
        // Redirect to home
        window.location.href = 'website.html';
    }

    /**
     * Redirect to member login page
     */
    redirectToLogin() {
        window.location.href = 'member-login.html';
    }

    /**
     * Protect a function call with authentication
     */
    requireAuth(callback) {
        if (this.isAuthenticated()) {
            return callback();
        } else {
            alert('Member access required. Please login first.');
            this.redirectToLogin();
            return false;
        }
    }
}

// Initialize global authentication instance
const perAnkhMemberAuth = new PerAnkhMemberAuth();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerAnkhMemberAuth;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        perAnkhMemberAuth.checkAuthStatus();
    });
} else {
    perAnkhMemberAuth.checkAuthStatus();
}
