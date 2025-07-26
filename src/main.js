/**
 * Per Ankh Main Application Entry Point
 * Modern ES6+ application initialization following 2025 best practices
 */

// Import styles
import './styles/variables.css';
import './styles/base.css';
import './components/Header/Header.css';
import './components/Navigation/Navigation.css';

// Import components
import { Header } from './components/Header/Header.js';
import { Navigation } from './components/Navigation/Navigation.js';
import { auth } from './utils/auth.js';

/**
 * Per Ankh Application Class
 * Main application controller following modern patterns
 */
class PerAnkhApp {
  constructor() {
    this.components = new Map();
    this.isInitialized = false;
    this.config = {
      version: __APP_VERSION__ || '1.0.0',
      buildTime: __BUILD_TIME__ || new Date().toISOString(),
      environment: import.meta.env.MODE || 'development'
    };
    
    this.init();
  }

  /**
   * Initialize application
   */
  async init() {
    try {
      console.log(`🌟 Per Ankh Consciousness Platform v${this.config.version}`);
      console.log(`🔧 Environment: ${this.config.environment}`);
      
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }

      // Initialize core systems
      await this.initializeAuth();
      await this.initializeComponents();
      await this.initializeEventListeners();
      await this.initializeServiceWorker();
      
      this.isInitialized = true;
      console.log('✅ Per Ankh application initialized successfully');
      
      // Dispatch app ready event
      document.dispatchEvent(new CustomEvent('appReady', {
        detail: { app: this, config: this.config }
      }));
      
    } catch (error) {
      console.error('❌ Application initialization failed:', error);
      this.handleInitializationError(error);
    }
  }

  /**
   * Initialize authentication system
   */
  async initializeAuth() {
    try {
      // Auth is already initialized in its constructor
      const authStatus = auth.checkAuthStatus();
      console.log('🔐 Authentication system initialized:', authStatus.isAuthenticated ? 'Authenticated' : 'Guest');
    } catch (error) {
      console.error('Auth initialization error:', error);
      throw error;
    }
  }

  /**
   * Initialize UI components
   */
  async initializeComponents() {
    try {
      // Initialize Navigation
      const navigation = new Navigation({
        sticky: true,
        showAuth: true
      });
      
      // Insert navigation into DOM
      const navContainer = document.querySelector('#navigation-container') || 
                          this.createNavigationContainer();
      navContainer.appendChild(navigation.getElement());
      this.components.set('navigation', navigation);

      // Initialize Header (if on home page)
      if (this.isHomePage()) {
        const header = new Header({
          showAuth: true,
          showLogo: true,
          animated: true
        });
        
        const headerContainer = document.querySelector('#header-container') || 
                               this.createHeaderContainer();
        headerContainer.appendChild(header.getElement());
        this.components.set('header', header);
      }

      console.log('🎨 UI components initialized');
    } catch (error) {
      console.error('Component initialization error:', error);
      throw error;
    }
  }

  /**
   * Initialize global event listeners
   */
  async initializeEventListeners() {
    // Handle authentication events
    document.addEventListener('authStatusChanged', (e) => {
      this.handleAuthStatusChange(e.detail);
    });

    // Handle user logout
    document.addEventListener('userLoggedOut', () => {
      this.handleUserLogout();
    });

    // Handle app errors
    window.addEventListener('error', (e) => {
      this.handleGlobalError(e);
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      this.handleUnhandledRejection(e);
    });

    // Handle visibility change for security
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });

    // Handle online/offline status
    window.addEventListener('online', () => {
      this.handleConnectionChange(true);
    });

    window.addEventListener('offline', () => {
      this.handleConnectionChange(false);
    });

    console.log('👂 Global event listeners initialized');
  }

  /**
   * Initialize service worker for PWA capabilities
   */
  async initializeServiceWorker() {
    if ('serviceWorker' in navigator && this.config.environment === 'production') {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('📱 Service Worker registered:', registration);
      } catch (error) {
        console.warn('Service Worker registration failed:', error);
      }
    }
  }

  /**
   * Create navigation container if it doesn't exist
   */
  createNavigationContainer() {
    const container = document.createElement('div');
    container.id = 'navigation-container';
    document.body.insertBefore(container, document.body.firstChild);
    return container;
  }

  /**
   * Create header container if it doesn't exist
   */
  createHeaderContainer() {
    const container = document.createElement('div');
    container.id = 'header-container';
    const navContainer = document.querySelector('#navigation-container');
    if (navContainer && navContainer.nextSibling) {
      document.body.insertBefore(container, navContainer.nextSibling);
    } else {
      document.body.insertBefore(container, document.body.children[1]);
    }
    return container;
  }

  /**
   * Check if current page is home page
   */
  isHomePage() {
    const path = window.location.pathname;
    return path === '/' || path === '/index.html' || path.endsWith('PerAnkhTech.html');
  }

  /**
   * Handle authentication status changes
   */
  handleAuthStatusChange({ isAuthenticated, session }) {
    console.log('🔄 Auth status changed:', isAuthenticated ? 'Authenticated' : 'Guest');
    
    // Update components that depend on auth status
    this.components.forEach((component, name) => {
      if (typeof component.handleAuthStatusChange === 'function') {
        component.handleAuthStatusChange({ isAuthenticated, session });
      }
    });

    // Update page-specific elements
    this.updateAuthDependentElements(isAuthenticated, session);
  }

  /**
   * Handle user logout
   */
  handleUserLogout() {
    console.log('👋 User logged out');
    
    // Clear any cached data
    this.clearUserData();
    
    // Redirect to home if on protected page
    if (this.isProtectedPage()) {
      window.location.href = '/';
    }
  }

  /**
   * Handle global errors
   */
  handleGlobalError(event) {
    console.error('🚨 Global error:', event.error);
    
    // Log error for monitoring (in production, send to error tracking service)
    if (this.config.environment === 'production') {
      // TODO: Send to error tracking service
      // this.sendErrorToTracking(event.error);
    }
  }

  /**
   * Handle unhandled promise rejections
   */
  handleUnhandledRejection(event) {
    console.error('🚨 Unhandled promise rejection:', event.reason);
    
    // Prevent default browser behavior
    event.preventDefault();
    
    // Log for monitoring
    if (this.config.environment === 'production') {
      // TODO: Send to error tracking service
    }
  }

  /**
   * Handle visibility change for security
   */
  handleVisibilityChange() {
    if (document.hidden) {
      // Page is hidden - could implement auto-lock for sensitive data
      console.log('📱 Page hidden');
    } else {
      // Page is visible - refresh auth status
      console.log('📱 Page visible');
      auth.checkAuthStatus();
    }
  }

  /**
   * Handle connection status changes
   */
  handleConnectionChange(isOnline) {
    console.log(`🌐 Connection status: ${isOnline ? 'Online' : 'Offline'}`);
    
    // Update UI to reflect connection status
    document.body.classList.toggle('offline', !isOnline);
    
    // Dispatch custom event
    document.dispatchEvent(new CustomEvent('connectionChanged', {
      detail: { isOnline }
    }));
  }

  /**
   * Handle initialization errors
   */
  handleInitializationError(error) {
    // Show user-friendly error message
    const errorContainer = document.createElement('div');
    errorContainer.className = 'app-error';
    errorContainer.innerHTML = `
      <div class="error-content">
        <h2>🌟 Per Ankh Consciousness Platform</h2>
        <p>We're experiencing some technical difficulties. Please refresh the page or try again later.</p>
        <button onclick="window.location.reload()" class="retry-btn">Refresh Page</button>
      </div>
    `;
    
    document.body.appendChild(errorContainer);
  }

  /**
   * Update elements that depend on authentication
   */
  updateAuthDependentElements(isAuthenticated, session) {
    // Show/hide auth-required elements
    const authElements = document.querySelectorAll('[data-auth-required]');
    authElements.forEach(element => {
      if (isAuthenticated) {
        element.style.display = element.dataset.originalDisplay || 'block';
        element.classList.remove('auth-hidden');
      } else {
        element.dataset.originalDisplay = element.style.display;
        element.style.display = 'none';
        element.classList.add('auth-hidden');
      }
    });

    // Show/hide admin-only elements
    const adminElements = document.querySelectorAll('[data-admin-only]');
    adminElements.forEach(element => {
      const isAdmin = session?.role === 'admin';
      if (isAdmin) {
        element.style.display = element.dataset.originalDisplay || 'block';
        element.classList.remove('admin-hidden');
      } else {
        element.dataset.originalDisplay = element.style.display;
        element.style.display = 'none';
        element.classList.add('admin-hidden');
      }
    });
  }

  /**
   * Check if current page requires authentication
   */
  isProtectedPage() {
    const protectedPaths = ['/admin-dashboard.html', '/profile', '/settings'];
    return protectedPaths.some(path => window.location.pathname.includes(path));
  }

  /**
   * Clear user-specific data
   */
  clearUserData() {
    // Clear any cached user data
    // This could include clearing specific localStorage items, resetting UI state, etc.
    console.log('🧹 Clearing user data');
  }

  /**
   * Get component by name
   */
  getComponent(name) {
    return this.components.get(name);
  }

  /**
   * Get application configuration
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Check if application is initialized
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * Destroy application and cleanup
   */
  destroy() {
    // Destroy all components
    this.components.forEach((component, name) => {
      if (typeof component.destroy === 'function') {
        component.destroy();
      }
    });
    this.components.clear();

    // Remove event listeners
    // (Most are handled by component destruction)

    this.isInitialized = false;
    console.log('🔥 Per Ankh application destroyed');
  }
}

// Initialize application
const app = new PerAnkhApp();

// Export for global access
window.PerAnkhApp = app;

// Export for module systems
export default app;
