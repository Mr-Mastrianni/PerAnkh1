/**
 * Per Ankh Header Component
 * Modern, accessible header with responsive design
 */

import { auth } from '../../utils/auth.js';

export class Header {
  constructor(options = {}) {
    this.options = {
      showAuth: true,
      showLogo: true,
      animated: true,
      ...options
    };
    
    this.element = null;
    this.isAuthenticated = false;
    this.userSession = null;
    
    this.init();
  }

  /**
   * Initialize header component
   */
  init() {
    this.render();
    this.bindEvents();
    this.updateAuthStatus();
    
    // Listen for auth status changes
    document.addEventListener('authStatusChanged', (e) => {
      this.handleAuthStatusChange(e.detail);
    });
  }

  /**
   * Render header HTML
   */
  render() {
    const headerHTML = `
      <header class="per-ankh-header earth-gradient" role="banner">
        <div class="header-background"></div>
        <div class="container">
          <div class="header-content">
            ${this.renderLogo()}
            ${this.renderFoundedInfo()}
          </div>
          ${this.renderMainContent()}
          ${this.renderSporeAnimations()}
        </div>
      </header>
    `;

    // Create header element
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = headerHTML;
    this.element = tempDiv.firstElementChild;

    return this.element;
  }

  /**
   * Render logo section
   */
  renderLogo() {
    if (!this.options.showLogo) return '';

    return `
      <div class="header-brand">
        <div class="logo-container ${this.options.animated ? 'animated' : ''}">
          <img 
            src="./PerAnkhLogo.png" 
            alt="Per Ankh Consciousness Technology Logo" 
            class="animated-logo"
            width="80" 
            height="80"
            loading="eager"
          />
        </div>
        <div class="brand-text">
          <h1 class="brand-title">Per Ankh</h1>
          <p class="brand-subtitle">Consciousness Technology</p>
        </div>
      </div>
    `;
  }

  /**
   * Render founded information
   */
  renderFoundedInfo() {
    return `
      <div class="header-info">
        <p class="founded-year">Founded 2020</p>
        <p class="specialization">Specializing in Bio-Technology Solutions</p>
      </div>
    `;
  }

  /**
   * Render main header content
   */
  renderMainContent() {
    return `
      <div class="header-main">
        <div class="hero-content">
          <h2 class="hero-title ankh-symbol">
            Per Ankh Consciousness Mastery
          </h2>
          <h3 class="hero-subtitle">
            Ancient African Wisdom Meets Cutting-Edge Bio-Technology
          </h3>
          <p class="hero-description">
            Bridging traditional entheogenic practices with revolutionary mycelium consciousness networks, 
            creating sacred spaces for healing, growth, and planetary restoration through the power of living systems.
          </p>
          ${this.renderFeatureCards()}
        </div>
      </div>
    `;
  }

  /**
   * Render feature cards
   */
  renderFeatureCards() {
    const features = [
      {
        icon: 'fas fa-network-wired',
        title: 'Mycelium Networks',
        description: 'Living consciousness processing systems'
      },
      {
        icon: 'fas fa-dna',
        title: 'Bio-Computing',
        description: 'Organic intelligence and neural pathway enhancement'
      },
      {
        icon: 'fas fa-seedling',
        title: 'Living Architecture',
        description: 'Structures that grow, breathe, and respond to consciousness'
      }
    ];

    return `
      <div class="feature-grid">
        ${features.map(feature => `
          <div class="consciousness-card">
            <i class="${feature.icon} bio-tech-icon" aria-hidden="true"></i>
            <h4 class="feature-title">${feature.title}</h4>
            <p class="feature-description">${feature.description}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Render animated spore elements
   */
  renderSporeAnimations() {
    if (!this.options.animated) return '';

    return `
      <div class="spore-container" aria-hidden="true">
        <div class="spore spore-1"></div>
        <div class="spore spore-2"></div>
        <div class="spore spore-3"></div>
        <div class="spore spore-4"></div>
      </div>
    `;
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    if (!this.element) return;

    // Logo click handler
    const logo = this.element.querySelector('.animated-logo');
    if (logo) {
      logo.addEventListener('click', () => {
        this.handleLogoClick();
      });

      // Add keyboard support
      logo.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleLogoClick();
        }
      });
    }

    // Feature card interactions
    const cards = this.element.querySelectorAll('.consciousness-card');
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.classList.add('card-hover');
      });

      card.addEventListener('mouseleave', () => {
        card.classList.remove('card-hover');
      });
    });

    // Intersection Observer for animations
    if (this.options.animated && 'IntersectionObserver' in window) {
      this.setupScrollAnimations();
    }
  }

  /**
   * Setup scroll-based animations
   */
  setupScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const animatedElements = this.element.querySelectorAll('.consciousness-card, .hero-content');
    animatedElements.forEach(el => observer.observe(el));
  }

  /**
   * Handle logo click
   */
  handleLogoClick() {
    // Navigate to home or trigger logo animation
    if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
      window.location.href = '/';
    } else {
      // Trigger special animation
      const logo = this.element.querySelector('.animated-logo');
      if (logo) {
        logo.classList.add('logo-pulse');
        setTimeout(() => {
          logo.classList.remove('logo-pulse');
        }, 1000);
      }
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
    if (!this.options.showAuth) return;

    // This would typically update user info display
    // For now, we'll just log the status
    if (this.isAuthenticated && this.userSession) {
      console.log(`Header: User ${this.userSession.username} is authenticated`);
    }
  }

  /**
   * Get header element
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
      const logo = this.element.querySelector('.animated-logo');
      if (logo) {
        logo.removeEventListener('click', this.handleLogoClick);
      }

      // Remove from DOM
      if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    }

    // Remove auth event listener
    document.removeEventListener('authStatusChanged', this.handleAuthStatusChange);
  }

  /**
   * Update header content
   */
  update(options = {}) {
    this.options = { ...this.options, ...options };
    
    // Re-render if needed
    const parent = this.element?.parentNode;
    if (parent) {
      this.destroy();
      this.init();
      parent.appendChild(this.element);
    }
  }
}

export default Header;
