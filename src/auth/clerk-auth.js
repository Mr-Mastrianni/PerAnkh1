/**
 * Per Ankh Clerk Authentication Module
 *
 * Uses @clerk/clerk-js v5 (npm import, not CDN).
 * Replaces the previous CDN-based v4 approach that caused
 * "Script loaded but window.Clerk not available" errors.
 */

import { Clerk } from '@clerk/clerk-js';
import {
  CLERK_PUBLISHABLE_KEY,
  ORGANIZATION_SETTINGS,
  ROUTE_CONFIG,
  CLERK_APPEARANCE
} from './clerk-config.js';

// Global Clerk instance
let clerk = null;
let isInitialized = false;
let initializationPromise = null;

/**
 * Initialize Clerk authentication
 * @param {Object} options - Initialization options
 * @param {string} options.publishableKey - Clerk publishable key (overrides config)
 * @returns {Promise<Object>} - The Clerk instance
 */
async function initClerk(options = {}) {
  if (isInitialized && clerk) {
    return clerk;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  const publishableKey = options.publishableKey || CLERK_PUBLISHABLE_KEY;

  initializationPromise = (async () => {
    try {
      if (!publishableKey) {
        console.warn('[Clerk] No publishable key found. Set VITE_CLERK_PUBLISHABLE_KEY in your .env file.');
        return null;
      }

      console.log('[Clerk] Starting initialization...');

      // Create Clerk instance with publishable key
      clerk = new Clerk(publishableKey);

      // Load Clerk — this fetches the UI components and authenticates
      await clerk.load({
        appearance: CLERK_APPEARANCE,
      });

      isInitialized = true;
      console.log('[Clerk] Authentication initialized successfully');

      setupAuthListeners();

      return clerk;
    } catch (error) {
      console.error('[Clerk] Initialization failed:', error);
      isInitialized = false;
      clerk = null;
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
}

/**
 * Set up authentication state listeners
 */
function setupAuthListeners() {
  if (!clerk) return;

  clerk.addListener(({ user, session }) => {
    if (user && session) {
      console.log('[Clerk] User authenticated:', user.id);
      document.dispatchEvent(new CustomEvent('clerk:auth', {
        detail: { user, session }
      }));
    } else {
      console.log('[Clerk] User signed out');
      document.dispatchEvent(new CustomEvent('clerk:signout'));
    }
  });
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
function isAuthenticated() {
  return clerk?.user !== null && clerk?.user !== undefined && clerk?.session !== null && clerk?.session !== undefined;
}

/**
 * Check if user is an admin
 * @returns {boolean}
 */
function isAdmin() {
  if (!isAuthenticated()) return false;

  const user = clerk.user;
  const role = user.publicMetadata?.role || user.unsafeMetadata?.role;

  if (role && ORGANIZATION_SETTINGS.ADMIN_ROLES.includes(role)) {
    return true;
  }

  if (user.organizationMemberships?.length > 0) {
    return user.organizationMemberships.some(
      membership => ORGANIZATION_SETTINGS.ADMIN_ROLES.includes(membership.role)
    );
  }

  return false;
}

/**
 * Check if user is a member (but not admin)
 * @returns {boolean}
 */
function isMember() {
  if (!isAuthenticated()) return false;
  return !isAdmin();
}

/**
 * Get current user
 * @returns {Object|null}
 */
function getCurrentUser() {
  if (!clerk?.user) return null;

  return {
    id: clerk.user.id,
    email: clerk.user.primaryEmailAddress?.emailAddress,
    firstName: clerk.user.firstName,
    lastName: clerk.user.lastName,
    fullName: clerk.user.fullName,
    imageUrl: clerk.user.imageUrl,
    role: clerk.user.publicMetadata?.role || 'member',
    createdAt: clerk.user.createdAt,
    lastSignInAt: clerk.user.lastSignInAt,
  };
}

/**
 * Get user role
 * @returns {string|null}
 */
function getUserRole() {
  if (!isAuthenticated()) return null;

  if (isAdmin()) return 'admin';
  if (isMember()) return 'member';
  return 'guest';
}

/**
 * Require authentication - redirects to login if not authenticated
 * @param {Object} options
 * @param {string} options.redirectTo - Where to redirect after login
 * @param {boolean} options.adminOnly - Require admin role
 * @returns {boolean}
 */
function requireAuth(options = {}) {
  const { redirectTo = window.location.pathname, adminOnly = false } = options;

  if (!isAuthenticated()) {
    sessionStorage.setItem('clerk:redirectAfterSignIn', redirectTo);
    const loginUrl = adminOnly ? ROUTE_CONFIG.authPages.admin : ROUTE_CONFIG.authPages.member;
    window.location.href = loginUrl;
    return false;
  }

  if (adminOnly && !isAdmin()) {
    console.warn('[Clerk] Admin access required');
    window.location.href = '/admin';
    return false;
  }

  return true;
}

/**
 * Sign out the current user
 * @param {Object} options
 * @param {string} options.redirectTo - Where to redirect after sign out
 */
async function signOut(options = {}) {
  const { redirectTo = '/' } = options;

  if (!clerk) {
    console.warn('[Clerk] Not initialized');
    return;
  }

  try {
    await clerk.signOut();
    console.log('[Clerk] Signed out successfully');

    if (redirectTo) {
      window.location.href = redirectTo;
    }
  } catch (error) {
    console.error('[Clerk] Sign out failed:', error);
    throw error;
  }
}

/**
 * Mount the sign-in component to a DOM element
 * @param {string|HTMLElement} target - Element or selector
 * @param {Object} options - Sign-in options
 */
function mountSignIn(target, options = {}) {
  if (!clerk) {
    console.error('[Clerk] Not initialized. Call initClerk() first.');
    return;
  }

  const element = typeof target === 'string'
    ? document.querySelector(target)
    : target;

  if (!element) {
    console.error('[Clerk] Target element not found:', target);
    return;
  }

  const defaultOptions = {
    fallbackRedirectUrl: sessionStorage.getItem('clerk:redirectAfterSignIn') || ROUTE_CONFIG.afterLogin.member,
    signUpFallbackRedirectUrl: ROUTE_CONFIG.afterLogin.member,
    routing: 'path',
    path: '/member/login',
  };

  clerk.mountSignIn(element, { ...defaultOptions, ...options });
}

/**
 * Mount the sign-up component to a DOM element
 * @param {string|HTMLElement} target - Element or selector
 * @param {Object} options - Sign-up options
 */
function mountSignUp(target, options = {}) {
  if (!clerk) {
    console.error('[Clerk] Not initialized. Call initClerk() first.');
    return;
  }

  const element = typeof target === 'string'
    ? document.querySelector(target)
    : target;

  if (!element) {
    console.error('[Clerk] Target element not found:', target);
    return;
  }

  const defaultOptions = {
    fallbackRedirectUrl: ROUTE_CONFIG.afterLogin.member,
    signUpFallbackRedirectUrl: ROUTE_CONFIG.afterLogin.member,
    routing: 'path',
    path: '/become-a-member',
  };

  clerk.mountSignUp(element, { ...defaultOptions, ...options });
}

/**
 * Mount the user button component
 * @param {string|HTMLElement} target - Element or selector
 * @param {Object} options - User button options
 */
function mountUserButton(target, options = {}) {
  if (!clerk) {
    console.error('[Clerk] Not initialized. Call initClerk() first.');
    return;
  }

  const element = typeof target === 'string'
    ? document.querySelector(target)
    : target;

  if (!element) {
    console.error('[Clerk] Target element not found:', target);
    return;
  }

  const defaultOptions = {
    afterSignOutUrl: '/',
    appearance: {
      elements: {
        userButtonAvatarBox: {
          border: '2px solid rgba(212, 175, 55, 0.5)',
        },
      },
    },
  };

  clerk.mountUserButton(element, { ...defaultOptions, ...options });
}

/**
 * Update UI based on authentication state
 */
function updateUI() {
  const isAuth = isAuthenticated();
  const user = getCurrentUser();
  const role = getUserRole();

  document.querySelectorAll('[data-auth-required]').forEach(el => {
    el.style.display = isAuth ? (el.dataset.originalDisplay || 'block') : 'none';
  });

  document.querySelectorAll('[data-auth-hidden]').forEach(el => {
    el.style.display = isAuth ? 'none' : (el.dataset.originalDisplay || 'block');
  });

  document.querySelectorAll('[data-admin-only]').forEach(el => {
    const show = isAuth && role === 'admin';
    el.style.display = show ? (el.dataset.originalDisplay || 'block') : 'none';
  });

  document.querySelectorAll('[data-user-name]').forEach(el => {
    el.textContent = user?.fullName || user?.email || '';
  });

  document.querySelectorAll('[data-user-role]').forEach(el => {
    el.textContent = role || 'Guest';
  });

  document.dispatchEvent(new CustomEvent('clerk:uiUpdated', {
    detail: { isAuthenticated: isAuth, user, role }
  }));
}

/**
 * Open the Clerk user profile modal
 */
function openUserProfile() {
  if (!clerk) {
    console.error('[Clerk] Not initialized');
    return;
  }
  clerk.openUserProfile();
}

// Export the public API
export {
  initClerk,
  isAuthenticated,
  isAdmin,
  isMember,
  getCurrentUser,
  getUserRole,
  requireAuth,
  signOut,
  mountSignIn,
  mountSignUp,
  mountUserButton,
  updateUI,
  openUserProfile,
  clerk,
};
