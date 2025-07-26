/**
 * Per Ankh Navigation Component
 * Modern, accessible navigation with authentication integration
 */

import { auth } from '../../utils/auth.js';

export class Navigation {
  constructor(options = {}) {
    this.options = {
      sticky: true,
      showAuth: true,
      mobileBreakpoint: 768,
      ...options
    };
    
    this.element = null;
    this.isAuthenticated = false;
    this.userSession = null;
    this.isMobileMenuOpen = false;
    
    this.init();
  }

  /**
   * Initialize navigation component
   */
  init() {
    this.render();
    this.bindEvents();
    this.updateAuthStatus();
    
    // Listen for auth status changes
    document.addEventListener('authStatusChanged', (e) => {
      this.handleAuthStatusChange(e.detail);
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }

  /**
   * Render navigation HTML
   */
  render() {
    const navHTML = `
      <nav class="per-ankh-nav ${this.options.sticky ? 'sticky' : ''}" role="navigation" aria-label="Main navigation">
        <div class="container">
          <div class="nav-content">
            ${this.renderBrand()}
            ${this.renderMainMenu()}
            ${this.renderAuthSection()}
            ${this.renderMobileToggle()}
          </div>
          ${this.renderMobileMenu()}
        </div>
      </nav>
    `;

    // Create navigation element
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = navHTML;
    this.element = tempDiv.firstElementChild;

    return this.element;
  }

  /**
   * Render brand section
   */
  renderBrand() {
    return `
      <div class="nav-brand">
        <a href="/" class="brand-link" aria-label="Per Ankh Home">
          <img 
            src="./PerAnkhLogo.png" 
            alt="Per Ankh Logo" 
            class="brand-logo"
            width="40" 
            height="40"
          />
          <span class="brand-name">Per Ankh</span>
        </a>
      </div>
    `;
  }

  /**
   * Render main navigation menu
   */
  renderMainMenu() {
    const menuItems = this.getMenuItems();
    
    return `
      <div class="nav-menu" id="mainMenu">
        <ul class="nav-list" role="menubar">
          ${menuItems.map(item => `
            <li class="nav-item" role="none">
              <a 
                href="${item.href}" 
                class="nav-link ${item.active ? 'active' : ''}"
                role="menuitem"
                ${item.external ? 'target="_blank" rel="noopener noreferrer"' : ''}
                ${item.requiresAuth ? 'data-requires-auth="true"' : ''}
              >
                ${item.icon ? `<i class="${item.icon}" aria-hidden="true"></i>` : ''}
                <span>${item.label}</span>
                ${item.external ? '<i class="fas fa-external-link-alt external-icon" aria-hidden="true"></i>' : ''}
              </a>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  /**
   * Get menu items based on authentication status
   */
  getMenuItems() {
    const baseItems = [
      { href: '/', label: 'Home', icon: 'fas fa-home' },
      { href: '/community.html', label: 'Community', icon: 'fas fa-users' },
      { href: '/protocols.html', label: 'Protocols', icon: 'fas fa-scroll' },
      { href: '/events.html', label: 'Events', icon: 'fas fa-calendar' },
      { href: '/crystaltech.html', label: 'Crystal Tech', icon: 'fas fa-gem' }
    ];

    const authItems = [
      { href: '/admin-dashboard.html', label: 'Dashboard', icon: 'fas fa-tachometer-alt', requiresAuth: true }
    ];

    // Add authenticated items if user is logged in
    if (this.isAuthenticated) {
      return [...baseItems, ...authItems];
    }

    return baseItems;
  }

  /**
   * Render authentication section
   */
  renderAuthSection() {
    if (!this.options.showAuth) return '';

    if (this.isAuthenticated && this.userSession) {
      return this.renderUserMenu();
    } else {
      return this.renderLoginButton();
    }
  }

  /**
   * Render user menu for authenticated users
   */
  renderUserMenu() {
    return `
      <div class="auth-section authenticated">
        <div class="user-menu">
          <button 
            class="user-toggle" 
            aria-expanded="false" 
            aria-haspopup="true"
            aria-label="User menu"
          >
            <div class="user-avatar">
              <i class="fas fa-user" aria-hidden="true"></i>
            </div>
            <div class="user-info">
              <span class="user-name">${this.userSession.username}</span>
              <span class="user-role">${this.formatRole(this.userSession.role)}</span>
            </div>
            <i class="fas fa-chevron-down dropdown-icon" aria-hidden="true"></i>
          </button>
          <div class="user-dropdown" role="menu">
            <a href="/profile" class="dropdown-item" role="menuitem">
              <i class="fas fa-user-circle" aria-hidden="true"></i>
              Profile
            </a>
            <a href="/settings" class="dropdown-item" role="menuitem">
              <i class="fas fa-cog" aria-hidden="true"></i>
              Settings
            </a>
            ${this.userSession.role === 'admin' ? `
              <a href="/admin-dashboard.html" class="dropdown-item" role="menuitem">
                <i class="fas fa-shield-alt" aria-hidden="true"></i>
                Admin Panel
              </a>
            ` : ''}
            <hr class="dropdown-divider" role="separator">
            <button class="dropdown-item logout-btn" role="menuitem">
              <i class="fas fa-sign-out-alt" aria-hidden="true"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render login button for unauthenticated users
   */
  renderLoginButton() {
    return `
      <div class="auth-section unauthenticated">
        <a href="/member-login.html" class="login-btn">
          <i class="fas fa-sign-in-alt" aria-hidden="true"></i>
          Login
        </a>
      </div>
    `;
  }

  /**
   * Render mobile menu toggle
   */
  renderMobileToggle() {
    return `
      <button 
        class="mobile-toggle" 
        aria-expanded="false" 
        aria-controls="mobileMenu"
        aria-label="Toggle mobile menu"
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
    `;
  }

  /**
   * Render mobile menu
   */
  renderMobileMenu() {
    const menuItems = this.getMenuItems();
    
    return `
      <div class="mobile-menu" id="mobileMenu" role="dialog" aria-hidden="true">
        <div class="mobile-menu-content">
          <div class="mobile-menu-header">
            <span class="mobile-menu-title">Menu</span>
            <button class="mobile-close" aria-label="Close menu">
              <i class="fas fa-times" aria-hidden="true"></i>
            </button>
          </div>
          <ul class="mobile-nav-list">
            ${menuItems.map(item => `
              <li class="mobile-nav-item">
                <a 
                  href="${item.href}" 
                  class="mobile-nav-link ${item.active ? 'active' : ''}"
                  ${item.external ? 'target="_blank" rel="noopener noreferrer"' : ''}
                >
                  ${item.icon ? `<i class="${item.icon}" aria-hidden="true"></i>` : ''}
                  <span>${item.label}</span>
                </a>
              </li>
            `).join('')}
          </ul>
          ${this.renderMobileAuthSection()}
        </div>
        <div class="mobile-menu-overlay"></div>
      </div>
    `;
  }

  /**
   * Render mobile authentication section
   */
  renderMobileAuthSection() {
    if (!this.options.showAuth) return '';

    if (this.isAuthenticated && this.userSession) {
      return `
        <div class="mobile-auth authenticated">
          <div class="mobile-user-info">
            <div class="mobile-user-avatar">
              <i class="fas fa-user" aria-hidden="true"></i>
            </div>
            <div class="mobile-user-details">
              <span class="mobile-user-name">${this.userSession.username}</span>
              <span class="mobile-user-role">${this.formatRole(this.userSession.role)}</span>
            </div>
          </div>
          <div class="mobile-user-actions">
            <a href="/profile" class="mobile-action-btn">Profile</a>
            <a href="/settings" class="mobile-action-btn">Settings</a>
            <button class="mobile-action-btn logout-btn">Logout</button>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="mobile-auth unauthenticated">
          <a href="/member-login.html" class="mobile-login-btn">
            <i class="fas fa-sign-in-alt" aria-hidden="true"></i>
            Login
          </a>
        </div>
      `;
    }
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    if (!this.element) return;

    // Mobile toggle
    const mobileToggle = this.element.querySelector('.mobile-toggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => {
        this.toggleMobileMenu();
      });
    }

    // Mobile close button
    const mobileClose = this.element.querySelector('.mobile-close');
    if (mobileClose) {
      mobileClose.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    }

    // Mobile overlay
    const mobileOverlay = this.element.querySelector('.mobile-menu-overlay');
    if (mobileOverlay) {
      mobileOverlay.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    }

    // User dropdown toggle
    const userToggle = this.element.querySelector('.user-toggle');
    if (userToggle) {
      userToggle.addEventListener('click', () => {
        this.toggleUserDropdown();
      });
    }

    // Logout buttons
    const logoutBtns = this.element.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleLogout();
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.element.contains(e.target)) {
        this.closeAllDropdowns();
      }
    });

    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllDropdowns();
        this.closeMobileMenu();
      }
    });

    // Handle auth-required links
    const authLinks = this.element.querySelectorAll('[data-requires-auth="true"]');
    authLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        if (!this.isAuthenticated) {
          e.preventDefault();
          this.redirectToLogin();
        }
      });
    });
  }

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    const mobileMenu = this.element.querySelector('.mobile-menu');
    const mobileToggle = this.element.querySelector('.mobile-toggle');
    
    if (this.isMobileMenuOpen) {
      mobileMenu.classList.add('open');
      mobileToggle.classList.add('active');
      mobileToggle.setAttribute('aria-expanded', 'true');
      mobileMenu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    } else {
      this.closeMobileMenu();
    }
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    const mobileMenu = this.element.querySelector('.mobile-menu');
    const mobileToggle = this.element.querySelector('.mobile-toggle');
    
    mobileMenu.classList.remove('open');
    mobileToggle.classList.remove('active');
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /**
   * Toggle user dropdown
   */
  toggleUserDropdown() {
    const userToggle = this.element.querySelector('.user-toggle');
    const userDropdown = this.element.querySelector('.user-dropdown');
    
    const isOpen = userToggle.getAttribute('aria-expanded') === 'true';
    
    if (isOpen) {
      userToggle.setAttribute('aria-expanded', 'false');
      userDropdown.classList.remove('open');
    } else {
      userToggle.setAttribute('aria-expanded', 'true');
      userDropdown.classList.add('open');
    }
  }

  /**
   * Close all dropdowns
   */
  closeAllDropdowns() {
    const userToggle = this.element.querySelector('.user-toggle');
    const userDropdown = this.element.querySelector('.user-dropdown');
    
    if (userToggle) {
      userToggle.setAttribute('aria-expanded', 'false');
    }
    if (userDropdown) {
      userDropdown.classList.remove('open');
    }
  }

  /**
   * Handle window resize
   */
  handleResize() {
    if (window.innerWidth > this.options.mobileBreakpoint && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  /**
   * Handle authentication status changes
   */
  handleAuthStatusChange({ isAuthenticated, session }) {
    this.isAuthenticated = isAuthenticated;
    this.userSession = session;
    this.updateAuthStatus();
  }

  /**
   * Update authentication status display
   */
  updateAuthStatus() {
    // Re-render auth section
    const authSection = this.element.querySelector('.auth-section');
    if (authSection) {
      authSection.outerHTML = this.renderAuthSection();
    }

    // Re-render mobile auth section
    const mobileAuth = this.element.querySelector('.mobile-auth');
    if (mobileAuth) {
      mobileAuth.outerHTML = this.renderMobileAuthSection();
    }

    // Update menu items
    const navMenu = this.element.querySelector('.nav-menu');
    if (navMenu) {
      navMenu.innerHTML = this.renderMainMenu().match(/<div class="nav-menu"[^>]*>(.*)<\/div>/s)[1];
    }

    // Re-bind events for new elements
    this.bindEvents();
  }

  /**
   * Format user role for display
   */
  formatRole(role) {
    const roleMap = {
      'admin': 'Administrator',
      'member': 'Member',
      'premium_member': 'Premium Member',
      'community_leader': 'Community Leader'
    };
    
    return roleMap[role] || role;
  }

  /**
   * Handle logout
   */
  async handleLogout() {
    try {
      await auth.logout();
      // Navigation will update automatically via auth status change event
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Redirect to login page
   */
  redirectToLogin() {
    window.location.href = '/member-login.html';
  }

  /**
   * Get navigation element
   */
  getElement() {
    return this.element;
  }

  /**
   * Destroy component and cleanup
   */
  destroy() {
    if (this.element) {
      // Remove event listeners
      window.removeEventListener('resize', this.handleResize);
      document.removeEventListener('click', this.closeAllDropdowns);
      document.removeEventListener('keydown', this.handleEscapeKey);

      // Remove from DOM
      if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    }

    // Remove auth event listener
    document.removeEventListener('authStatusChanged', this.handleAuthStatusChange);
  }
}

export default Navigation;
