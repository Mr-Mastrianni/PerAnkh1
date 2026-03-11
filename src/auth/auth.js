/**
 * Per Ankh Unified Authentication Library
 * Handles both admin and member authentication
 */

class PerAnkhAuth {
    constructor() {
        this.adminSessionKey = 'perankh_admin_session';
        this.adminActiveKey = 'perankh_admin_active';
        this.memberSessionKey = 'perankh_member_session';
        this.memberActiveKey = 'perankh_member_active';
        this.protectedElements = [];
        this.firebaseUser = null;
        this.init();
    }

    async init() {
        try {
            const { auth } = await import('/src/services/firebase-config.js');
            const { onAuthStateChanged } = await import('firebase/auth');

            onAuthStateChanged(auth, (user) => {
                this.firebaseUser = user;
                this.checkAuthStatus();
            });
        } catch (error) {
            console.warn("Could not load Firebase Auth in PerAnkhAuth", error);
        }

        this.checkAuthStatus();
        this.protectContent();
        this.addAuthUI();

        setInterval(() => this.checkAuthStatus(), 5 * 60 * 1000);
    }

    // --- Authentication checks ---

    isAuthenticated() {
        return this.isAdminAuthenticated() || this.isMemberAuthenticated();
    }

    isAdminAuthenticated() {
        if (this.firebaseUser) return true;

        const session = localStorage.getItem(this.adminSessionKey);
        const active = sessionStorage.getItem(this.adminActiveKey);
        if (!session || !active) return false;

        try {
            const sessionData = JSON.parse(session);
            const hoursDiff = (Date.now() - new Date(sessionData.loginTime)) / (1000 * 60 * 60);
            if (hoursDiff >= 8) {
                this.logout();
                return false;
            }
            return true;
        } catch {
            return false;
        }
    }

    isMemberAuthenticated() {
        const encrypted = localStorage.getItem(this.memberSessionKey);
        const active = sessionStorage.getItem(this.memberActiveKey);
        if (!encrypted || !active) return false;

        try {
            const sessionData = this._decryptSessionData(encrypted);
            if (!sessionData || !sessionData.sessionId || !sessionData.username) return false;

            if (sessionData.expiresAt && Date.now() >= new Date(sessionData.expiresAt).getTime()) {
                this.memberLogout();
                return false;
            }

            const hoursDiff = (Date.now() - new Date(sessionData.loginTime)) / (1000 * 60 * 60);
            if (hoursDiff >= 8) {
                this.memberLogout();
                return false;
            }

            return true;
        } catch {
            return false;
        }
    }

    getUserType() {
        if (this.isAdminAuthenticated()) return 'admin';
        if (this.isMemberAuthenticated()) return 'member';
        return 'guest';
    }

    getSession() {
        try {
            if (this.firebaseUser) {
                return { username: this.firebaseUser.email, role: 'admin' };
            }

            let session = localStorage.getItem(this.adminSessionKey);
            if (session) return JSON.parse(session);

            const encrypted = localStorage.getItem(this.memberSessionKey);
            if (encrypted) {
                const data = this._decryptSessionData(encrypted);
                return data ? { username: data.username, role: data.role, loginTime: data.loginTime, expiresAt: data.expiresAt } : null;
            }

            return null;
        } catch {
            return null;
        }
    }

    // --- Member login/logout ---

    async memberLogin(username, password) {
        if (!username || !password) throw new Error('Username and password are required');
        if (username.length < 3 || password.length < 6) throw new Error('Invalid username or password format');

        const isValid = await this._simulateServerAuth(username, password);
        if (!isValid) throw new Error('Invalid username or password');

        const sessionData = {
            username,
            role: 'member',
            loginTime: new Date().toISOString(),
            sessionId: this._generateSecureSessionId(),
            expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
        };

        localStorage.setItem(this.memberSessionKey, this._encryptSessionData(sessionData));
        sessionStorage.setItem(this.memberActiveKey, 'true');
        this.checkAuthStatus();
        window.location.href = '/';
        return true;
    }

    memberLogout() {
        localStorage.removeItem(this.memberSessionKey);
        sessionStorage.removeItem(this.memberActiveKey);
        this.checkAuthStatus();
    }

    // --- Admin logout (includes Firebase sign-out) ---

    async logout() {
        try {
            const { auth } = await import('/src/services/firebase-config.js');
            const { signOut } = await import('firebase/auth');
            await signOut(auth);
        } catch { /* Firebase may not be loaded */ }

        localStorage.removeItem(this.adminSessionKey);
        sessionStorage.removeItem(this.adminActiveKey);
        localStorage.removeItem(this.memberSessionKey);
        sessionStorage.removeItem(this.memberActiveKey);
        window.location.href = '/admin';
    }

    // --- Page protection ---

    protectPage(requiredRole = 'admin') {
        if (requiredRole === 'admin' && !this.isAdminAuthenticated()) {
            window.location.href = '/admin';
            return false;
        }
        if (requiredRole === 'member' && !this.isAuthenticated()) {
            window.location.href = '/member/login';
            return false;
        }
        this.showAdminContent();
        return true;
    }

    requireAuth(callback) {
        if (this.isAuthenticated()) return callback();
        alert('Access required. Please login first.');
        this.redirectToLogin();
        return false;
    }

    redirectToLogin() {
        window.location.href = '/admin';
    }

    // --- UI updates ---

    checkAuthStatus() {
        const isAuth = this.isAuthenticated();
        const userType = this.getUserType();

        document.querySelectorAll('[data-auth-required]').forEach(el => {
            if (isAuth) {
                el.style.display = el.dataset.originalDisplay || 'block';
                el.classList.remove('auth-hidden');
            } else {
                el.dataset.originalDisplay = el.style.display;
                el.style.display = 'none';
                el.classList.add('auth-hidden');
            }
        });

        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = isAuth ? 'block' : 'none';
        });

        this.updateNavigationForUserType(userType);
    }

    updateNavigationForUserType(userType) {
        if (typeof window.updateNavigationForUserType === 'function') {
            window.updateNavigationForUserType(userType);
        }
    }

    showAdminContent() {
        const adminInfo = document.getElementById('adminInfo');
        const loginBtn = document.getElementById('adminLoginBtn');
        const logoutBtn = document.getElementById('adminLogoutBtn');

        if (adminInfo) {
            const sessionData = this.getSession();
            if (sessionData) {
                const welcomeSpan = adminInfo.querySelector('.admin-welcome');
                const roleSpan = adminInfo.querySelector('.admin-role');
                if (welcomeSpan) welcomeSpan.textContent = `Welcome, ${sessionData.username}`;
                if (roleSpan) roleSpan.textContent = `(${this.formatRole(sessionData.role)})`;
                adminInfo.style.display = 'flex';
                if (loginBtn) loginBtn.style.display = 'none';
                if (logoutBtn) logoutBtn.style.display = 'inline-block';
            }
        }
    }

    showAdminOnlyContent() {
        if (!this.isAdminAuthenticated()) {
            alert('Admin access required. Please login first.');
            this.redirectToLogin();
            return false;
        }
        return true;
    }

    formatRole(role) {
        const roleMap = {
            'super_admin': 'Super Admin',
            'admin': 'Admin',
            'moderator': 'Moderator',
            'content_manager': 'Content Manager',
            'member': 'Member',
            'premium_member': 'Premium Member',
            'community_leader': 'Community Leader'
        };
        return roleMap[role] || role || 'Admin';
    }

    protectContent() {
        const protectedElements = document.querySelectorAll('[data-admin-only], [data-auth-required]');
        protectedElements.forEach(element => {
            if (!this.isAuthenticated()) {
                const overlay = this.createProtectionOverlay();
                element.style.position = 'relative';
                element.appendChild(overlay);
                this.protectedElements.push({ element, overlay });
            }
        });
    }

    createProtectionOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'admin-protection-overlay';
        overlay.innerHTML = `
            <div class="protection-content">
                <div class="protection-icon">🔒</div>
                <div class="protection-title">Admin Access Required</div>
                <div class="protection-message">This content is restricted to authenticated administrators.</div>
                <button class="protection-login-btn" onclick="perAnkhAuth.redirectToLogin()">Admin Login</button>
            </div>
        `;
        overlay.style.cssText = `
            position: absolute; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(10, 10, 10, 0.95); backdrop-filter: blur(10px);
            display: flex; align-items: center; justify-content: center;
            z-index: 1000; border-radius: inherit;
        `;
        return overlay;
    }

    addAuthUI() {
        const nav = document.querySelector('.nav-links');
        if (!nav || document.getElementById('adminLoginBtn')) return;

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
                <a href="/admin/dashboard" class="nav-link">
                    <i class="fas fa-tachometer-alt mr-2"></i>Dashboard
                </a>
                <button class="nav-link admin-logout-btn" onclick="perAnkhAuth.logout()">
                    <i class="fas fa-sign-out-alt mr-2"></i>Logout
                </button>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            .admin-ui { display: flex; align-items: center; gap: 1rem; }
            .admin-info { display: flex; flex-direction: column; align-items: flex-end; padding: 0.5rem 1rem; background: rgba(45, 27, 105, 0.3); border-radius: 20px; border: 1px solid rgba(212, 175, 55, 0.2); }
            .admin-welcome { color: var(--primary-gold, #D4AF37); font-weight: 600; font-size: 0.9rem; }
            .admin-role { color: rgba(248, 248, 255, 0.7); font-size: 0.8rem; }
            .admin-login-btn, .admin-logout-btn { background: linear-gradient(135deg, var(--primary-gold, #D4AF37) 0%, var(--deep-gold, #B8860B) 100%); color: var(--matte-black, #1a1a1a) !important; border: none; padding: 0.6rem 1.2rem; border-radius: 20px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; text-decoration: none; display: inline-flex; align-items: center; }
            .admin-login-btn:hover, .admin-logout-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3); color: var(--matte-black, #1a1a1a) !important; }
            .admin-logout-section { display: flex; gap: 1rem; align-items: center; }
            .admin-protection-overlay { border: 1px solid rgba(212, 175, 55, 0.3); }
            .protection-content { text-align: center; padding: 2rem; max-width: 300px; }
            .protection-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.7; }
            .protection-title { font-family: 'Cinzel', serif; font-size: 1.2rem; font-weight: 600; color: var(--primary-gold, #D4AF37); margin-bottom: 0.5rem; }
            .protection-message { color: rgba(248, 248, 255, 0.8); margin-bottom: 1.5rem; line-height: 1.4; }
            .protection-login-btn { background: linear-gradient(135deg, var(--primary-gold, #D4AF37) 0%, var(--deep-gold, #B8860B) 100%); color: var(--matte-black, #1a1a1a); border: none; padding: 0.8rem 1.5rem; border-radius: 20px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
            .protection-login-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3); }
            @media (max-width: 1024px) {
                .admin-ui { flex-direction: column; gap: 0.5rem; width: 100%; }
                .admin-logout-section { flex-direction: column; gap: 0.5rem; width: 100%; }
                .admin-info { align-items: center; width: 100%; }
            }
        `;
        document.head.appendChild(style);
        nav.appendChild(adminUI);
    }

    protectElement(selector, options = {}) {
        document.querySelectorAll(selector).forEach(el => {
            el.setAttribute('data-auth-required', 'true');
            if (options.adminOnly) el.setAttribute('data-admin-only', 'true');
        });
        this.checkAuthStatus();
    }

    unprotectElement(selector) {
        document.querySelectorAll(selector).forEach(el => {
            el.removeAttribute('data-auth-required');
            el.removeAttribute('data-admin-only');
            const overlay = el.querySelector('.admin-protection-overlay');
            if (overlay) overlay.remove();
        });
        this.checkAuthStatus();
    }

    // --- Private helpers ---

    async _simulateServerAuth(username, password) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return username.length >= 3 && password.length >= 6;
    }

    _generateSecureSessionId() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    _encryptSessionData(data) {
        return btoa(JSON.stringify(data));
    }

    _decryptSessionData(encryptedData) {
        try {
            return JSON.parse(atob(encryptedData));
        } catch {
            return null;
        }
    }
}

// Initialize global instances
const perAnkhAuth = new PerAnkhAuth();
// Backwards-compatible alias for member pages
const perAnkhMemberAuth = perAnkhAuth;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => perAnkhAuth.checkAuthStatus());
} else {
    perAnkhAuth.checkAuthStatus();
}
