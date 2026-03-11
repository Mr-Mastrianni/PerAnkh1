/**
 * Clerk Admin Protection Script
 * Protects admin pages from unauthorized access using Clerk authentication
 * 
 * Usage: Include this script in any admin page that requires authentication:
 *   <script type="module" src="/src/auth/clerk-admin-protect.js"></script>
 */

import { 
  initClerk, 
  isAuthenticated, 
  isAdmin, 
  requireAuth,
  clerk 
} from './clerk-auth.js';
import { CLERK_PUBLISHABLE_KEY } from './clerk-config.js';

async function protectAdminPage() {
    // Check if Clerk is configured
    if (!CLERK_PUBLISHABLE_KEY) {
        console.warn('[Admin Protect] Clerk not configured. Page is unprotected.');
        showConfigurationWarning();
        return;
    }

    try {
        // Show loading state
        showLoading();

        // Initialize Clerk
        await initClerk();

        // Check authentication
        if (!isAuthenticated()) {
            // Not authenticated - redirect to login
            console.log('[Admin Protect] Not authenticated, redirecting to login');
            const currentPath = window.location.pathname;
            sessionStorage.setItem('clerk:redirectAfterSignIn', currentPath);
            window.location.href = '/admin';
            return;
        }

        // Check admin role
        // NOTE: If no role is set in Clerk user metadata yet, allow access
        // so the site owner can complete initial setup. Once roles are configured
        // in the Clerk Dashboard (user publicMetadata.role = "admin"), this will
        // enforce proper role-based access.
        if (!isAdmin()) {
            const user = clerk;
            const hasAnyRole = user?.user?.publicMetadata?.role || user?.user?.unsafeMetadata?.role;
            if (hasAnyRole) {
                // Role exists but isn't admin — deny access
                console.warn('[Admin Protect] Access denied: User is not an admin');
                showAccessDenied();
                return;
            }
            // No role configured yet — allow access for initial setup
            console.warn('[Admin Protect] No role configured in Clerk metadata. Allowing access for initial setup.');
        }

        // User is authenticated and is admin - show content
        hideLoading();
        showAdminContent();
        
        // Update UI with user info
        updateAdminUI();

        console.log('[Admin Protect] Admin access granted');

    } catch (error) {
        console.error('[Admin Protect] Error:', error);
        showError(error.message);
    }
}

function showLoading() {
    // Create loading overlay if it doesn't exist
    let loadingOverlay = document.getElementById('admin-loading-overlay');
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'admin-loading-overlay';
        loadingOverlay.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(10, 10, 10, 0.95);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            ">
                <div style="
                    width: 50px;
                    height: 50px;
                    border: 3px solid rgba(212, 175, 55, 0.3);
                    border-top: 3px solid #D4AF37;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 1rem;
                "></div>
                <p style="color: #D4AF37; font-family: 'Cinzel', serif;">Verifying sacred access...</p>
            </div>
            <style>
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        `;
        document.body.appendChild(loadingOverlay);
    }
    loadingOverlay.style.display = 'flex';
    
    // Hide main content while loading
    document.body.style.overflow = 'hidden';
}

function hideLoading() {
    const loadingOverlay = document.getElementById('admin-loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
    document.body.style.overflow = '';
}

function showAdminContent() {
    // Remove any existing blur from main content
    const mainContent = document.querySelector('main') || document.body;
    mainContent.style.filter = '';
    mainContent.style.pointerEvents = '';
}

function showAccessDenied() {
    hideLoading();
    document.body.innerHTML = `
        <div style="
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0A0A0A 0%, #0F0F23 50%, #2D1B69 100%);
            color: #F8F8FF;
            font-family: 'Inter', sans-serif;
            padding: 2rem;
            text-align: center;
        ">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🔒</div>
            <h1 style="font-family: 'Cinzel', serif; color: #D4AF37; margin-bottom: 1rem;">Access Denied</h1>
            <p style="color: rgba(248, 248, 255, 0.7); margin-bottom: 2rem; max-width: 400px;">
                You do not have administrator privileges. This area is restricted to authorized administrators only.
            </p>
            <div style="display: flex; gap: 1rem;">
                <a href="/" style="
                    background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
                    color: #0A0A0A;
                    padding: 0.75rem 1.5rem;
                    border-radius: 10px;
                    text-decoration: none;
                    font-weight: 600;
                ">Return Home</a>
                <a href="/admin" style="
                    background: transparent;
                    color: #D4AF37;
                    padding: 0.75rem 1.5rem;
                    border-radius: 10px;
                    text-decoration: none;
                    font-weight: 600;
                    border: 1px solid #D4AF37;
                ">Admin Login</a>
            </div>
        </div>
    `;
}

function showConfigurationWarning() {
    // Only show in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.warn('[Admin Protect] Running in development mode without Clerk configuration');
        // Still hide loading to allow development
        hideLoading();
    }
}

function showError(message) {
    hideLoading();
    document.body.innerHTML = `
        <div style="
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0A0A0A 0%, #0F0F23 50%, #2D1B69 100%);
            color: #F8F8FF;
            font-family: 'Inter', sans-serif;
            padding: 2rem;
            text-align: center;
        ">
            <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
            <h1 style="font-family: 'Cinzel', serif; color: #D4AF37; margin-bottom: 1rem;">Authentication Error</h1>
            <p style="color: rgba(248, 248, 255, 0.7); margin-bottom: 2rem; max-width: 400px;">
                ${message}
            </p>
            <button onclick="window.location.reload()" style="
                background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
                color: #0A0A0A;
                padding: 0.75rem 1.5rem;
                border-radius: 10px;
                border: none;
                font-weight: 600;
                cursor: pointer;
            ">Retry</button>
        </div>
    `;
}

function updateAdminUI() {
    // Import dynamically to avoid circular dependencies
    import('./clerk-auth.js').then(({ getCurrentUser }) => {
        const user = getCurrentUser();
        if (!user) return;

        // Update user name displays
        document.querySelectorAll('[data-admin-name]').forEach(el => {
            el.textContent = user.fullName || user.email || 'Admin';
        });

        // Update user avatar displays
        document.querySelectorAll('[data-admin-avatar]').forEach(el => {
            if (user.imageUrl) {
                el.src = user.imageUrl;
            } else {
                // Use initials
                const initials = (user.fullName || user.email || 'A')
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
                el.textContent = initials;
            }
        });

        // Dispatch event for other scripts
        document.dispatchEvent(new CustomEvent('adminAuthenticated', {
            detail: { user }
        }));
    });
}

// Initialize protection when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', protectAdminPage);
} else {
    protectAdminPage();
}

// Export for manual use if needed
export { protectAdminPage };
