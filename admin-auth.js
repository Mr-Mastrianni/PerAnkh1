/**
 * Per Ankh Admin Authentication Library
 * Provides content protection and authentication utilities
 */

class PerAnkhAuth {
    constructor() {
        this.sessionKey = 'perankh_admin_session';
        this.activeKey = 'perankh_admin_active';
        this.protectedElements = [];
        this.init();
    }

    init() {
        // Initialize authentication system
        this.checkAuthStatus();
        this.protectContent();
        this.addAuthUI();
        
        // Auto-check authentication every 5 minutes
        setInterval(() => this.checkAuthStatus(), 5 * 60 * 1000);
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const session = localStorage.getItem(this.sessionKey);
        const active = sessionStorage.getItem(this.activeKey);
        
        if (!session || !active) return false;

        try {
            const sessionData = JSON.parse(session);
            const loginTime = new Date(sessionData.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);

            // Session expires after 8 hours
            if (hoursDiff >= 8) {
                this.logout();
                return false;
            }

            return true;
        } catch (error) {
            console.error('Auth check error:', error);
            return false;
        }
    }

    /**
     * Get current user session data
     */
    getSession() {
        try {
            const session = localStorage.getItem(this.sessionKey);
            return session ? JSON.parse(session) : null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Check authentication status and update UI
     */
    checkAuthStatus() {
        const isAuth = this.isAuthenticated();
        const authElements = document.querySelectorAll('[data-auth-required]');
        const adminElements = document.querySelectorAll('.admin-only');
        const loginBtn = document.getElementById('adminLoginBtn');
        const logoutBtn = document.getElementById('adminLogoutBtn');
        const adminInfo = document.getElementById('adminInfo');

        // Show/hide protected content
        authElements.forEach(element => {
            if (isAuth) {
                element.style.display = element.dataset.originalDisplay || 'block';
                element.classList.remove('auth-hidden');
            } else {
                element.dataset.originalDisplay = element.style.display;
                element.style.display = 'none';
                element.classList.add('auth-hidden');
            }
        });

        adminElements.forEach(element => {
            element.style.display = isAuth ? 'block' : 'none';
        });

        // Update navigation buttons
        if (loginBtn) loginBtn.style.display = isAuth ? 'none' : 'inline-block';
        if (logoutBtn) logoutBtn.style.display = isAuth ? 'inline-block' : 'none';
        
        // Update admin info
        if (adminInfo && isAuth) {
            const session = this.getSession();
            adminInfo.innerHTML = `
                <span class="admin-welcome">Welcome, ${session.username}</span>
                <span class="admin-role">(${this.formatRole(session.role)})</span>
            `;
            adminInfo.style.display = 'inline-block';
        } else if (adminInfo) {
            adminInfo.style.display = 'none';
        }
    }

    /**
     * Format user role for display
     */
    formatRole(role) {
        const roleMap = {
            'super_admin': 'Super Admin',
            'admin': 'Admin',
            'moderator': 'Moderator',
            'content_manager': 'Content Manager'
        };
        return roleMap[role] || 'Admin';
    }

    /**
     * Protect content elements
     */
    protectContent() {
        // Find all elements with protection attributes
        const protectedElements = document.querySelectorAll('[data-admin-only], [data-auth-required]');
        
        protectedElements.forEach(element => {
            if (!this.isAuthenticated()) {
                // Create protection overlay
                const overlay = this.createProtectionOverlay(element);
                element.style.position = 'relative';
                element.appendChild(overlay);
                
                // Store reference
                this.protectedElements.push({
                    element: element,
                    overlay: overlay
                });
            }
        });
    }

    /**
     * Create protection overlay for restricted content
     */
    createProtectionOverlay(element) {
        const overlay = document.createElement('div');
        overlay.className = 'admin-protection-overlay';
        overlay.innerHTML = `
            <div class="protection-content">
                <div class="protection-icon">🔒</div>
                <div class="protection-title">Admin Access Required</div>
                <div class="protection-message">This content is restricted to authenticated administrators.</div>
                <button class="protection-login-btn" onclick="perAnkhAuth.redirectToLogin()">
                    Admin Login
                </button>
            </div>
        `;
        
        // Add styles
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(10, 10, 10, 0.95);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            border-radius: inherit;
        `;

        return overlay;
    }

    /**
     * Add authentication UI elements to navigation
     */
    addAuthUI() {
        const nav = document.querySelector('.nav-links');
        if (!nav) return;

        // Check if auth UI already exists
        if (document.getElementById('adminLoginBtn')) return;

        // Create admin UI elements
        const adminUI = document.createElement('div');
        adminUI.className = 'admin-ui';
        adminUI.innerHTML = `
            <div id="adminInfo" class="admin-info" style="display: none;">
                <span class="admin-welcome"></span>
                <span class="admin-role"></span>
            </div>
            <button id="adminLoginBtn" class="nav-link admin-login-btn" onclick="perAnkhAuth.redirectToLogin()">
                <i class="fas fa-user-shield mr-2"></i>Admin Login
            </button>
            <div id="adminLogoutBtn" class="admin-logout-section" style="display: none;">
                <a href="admin-dashboard.html" class="nav-link">
                    <i class="fas fa-tachometer-alt mr-2"></i>Dashboard
                </a>
                <button class="nav-link admin-logout-btn" onclick="perAnkhAuth.logout()">
                    <i class="fas fa-sign-out-alt mr-2"></i>Logout
                </button>
            </div>
        `;

        // Add styles for admin UI
        const style = document.createElement('style');
        style.textContent = `
            .admin-ui {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .admin-info {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                padding: 0.5rem 1rem;
                background: rgba(45, 27, 105, 0.3);
                border-radius: 20px;
                border: 1px solid rgba(212, 175, 55, 0.2);
            }
            
            .admin-welcome {
                color: var(--primary-gold);
                font-weight: 600;
                font-size: 0.9rem;
            }
            
            .admin-role {
                color: rgba(248, 248, 255, 0.7);
                font-size: 0.8rem;
            }
            
            .admin-login-btn, .admin-logout-btn {
                background: linear-gradient(135deg, var(--primary-gold) 0%, var(--deep-gold) 100%);
                color: var(--matte-black) !important;
                border: none;
                padding: 0.6rem 1.2rem;
                border-radius: 20px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
            }
            
            .admin-login-btn:hover, .admin-logout-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
                color: var(--matte-black) !important;
            }
            
            .admin-logout-section {
                display: flex;
                gap: 1rem;
                align-items: center;
            }
            
            .admin-protection-overlay {
                border: 1px solid rgba(212, 175, 55, 0.3);
            }
            
            .protection-content {
                text-align: center;
                padding: 2rem;
                max-width: 300px;
            }
            
            .protection-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
                opacity: 0.7;
            }
            
            .protection-title {
                font-family: 'Cinzel', serif;
                font-size: 1.2rem;
                font-weight: 600;
                color: var(--primary-gold);
                margin-bottom: 0.5rem;
            }
            
            .protection-message {
                color: rgba(248, 248, 255, 0.8);
                margin-bottom: 1.5rem;
                line-height: 1.4;
            }
            
            .protection-login-btn {
                background: linear-gradient(135deg, var(--primary-gold) 0%, var(--deep-gold) 100%);
                color: var(--matte-black);
                border: none;
                padding: 0.8rem 1.5rem;
                border-radius: 20px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .protection-login-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
            }
            
            @media (max-width: 1024px) {
                .admin-ui {
                    flex-direction: column;
                    gap: 0.5rem;
                    width: 100%;
                }
                
                .admin-logout-section {
                    flex-direction: column;
                    gap: 0.5rem;
                    width: 100%;
                }
                
                .admin-info {
                    align-items: center;
                    width: 100%;
                }
            }
        `;
        
        document.head.appendChild(style);
        nav.appendChild(adminUI);
    }

    /**
     * Redirect to admin login page
     */
    redirectToLogin() {
        window.location.href = 'admin-login.html';
    }

    /**
     * Show admin content (used in admin pages)
     */
    showAdminContent() {
        // Update admin info in navigation if present
        const adminInfo = document.getElementById('adminInfo');
        const loginBtn = document.getElementById('adminLoginBtn');
        const logoutBtn = document.getElementById('adminLogoutBtn');
        
        if (adminInfo) {
            const sessionData = JSON.parse(localStorage.getItem(this.sessionKey));
            if (sessionData) {
                const welcomeSpan = adminInfo.querySelector('.admin-welcome');
                const roleSpan = adminInfo.querySelector('.admin-role');
                
                if (welcomeSpan) {
                    welcomeSpan.textContent = `Welcome, ${sessionData.username}`;
                }
                
                if (roleSpan) {
                    roleSpan.textContent = `(${this.formatRole(sessionData.role)})`;
                }
                
                adminInfo.style.display = 'flex';
                if (loginBtn) loginBtn.style.display = 'none';
                if (logoutBtn) logoutBtn.style.display = 'inline-block';
            }
        }
    }

    /**
     * Show admin-only content
     */
    showAdminContent() {
        if (!this.isAuthenticated()) {
            alert('Admin access required. Please login first.');
            this.redirectToLogin();
            return false;
        }
        return true;
    }

    /**
     * Protect a function call with authentication
     */
    requireAuth(callback) {
        if (this.isAuthenticated()) {
            return callback();
        } else {
            alert('Admin access required. Please login first.');
            this.redirectToLogin();
            return false;
        }
    }

    /**
     * Add protection to specific elements
     */
    protectElement(selector, options = {}) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.setAttribute('data-auth-required', 'true');
            if (options.adminOnly) {
                element.setAttribute('data-admin-only', 'true');
            }
        });
        
        // Re-run protection check
        this.checkAuthStatus();
    }

    /**
     * Remove protection from elements
     */
    unprotectElement(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.removeAttribute('data-auth-required');
            element.removeAttribute('data-admin-only');
            
            // Remove any existing overlays
            const overlay = element.querySelector('.admin-protection-overlay');
            if (overlay) {
                overlay.remove();
            }
        });
        
        this.checkAuthStatus();
    }
}

// Initialize global authentication instance
const perAnkhAuth = new PerAnkhAuth();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerAnkhAuth;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        perAnkhAuth.checkAuthStatus();
    });
} else {
    perAnkhAuth.checkAuthStatus();
}