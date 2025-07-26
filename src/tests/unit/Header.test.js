/**
 * Per Ankh Header Component Tests
 * Comprehensive test suite for Header.js
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Header } from '../../components/Header/Header.js';

describe('Header Component', () => {
  let header;
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (header) {
      header.destroy();
    }
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should create header with default options', () => {
      header = new Header();
      
      expect(header.element).toBeTruthy();
      expect(header.element.classList.contains('per-ankh-header')).toBe(true);
      expect(header.options.showAuth).toBe(true);
      expect(header.options.showLogo).toBe(true);
      expect(header.options.animated).toBe(true);
    });

    it('should create header with custom options', () => {
      header = new Header({
        showAuth: false,
        showLogo: false,
        animated: false
      });
      
      expect(header.options.showAuth).toBe(false);
      expect(header.options.showLogo).toBe(false);
      expect(header.options.animated).toBe(false);
    });

    it('should render all required elements', () => {
      header = new Header();
      
      expect(header.element.querySelector('.header-content')).toBeTruthy();
      expect(header.element.querySelector('.header-main')).toBeTruthy();
      expect(header.element.querySelector('.hero-content')).toBeTruthy();
    });
  });

  describe('Logo Section', () => {
    it('should render logo when showLogo is true', () => {
      header = new Header({ showLogo: true });
      
      const logo = header.element.querySelector('.animated-logo');
      const brandText = header.element.querySelector('.brand-text');
      
      expect(logo).toBeTruthy();
      expect(logo.src).toContain('PerAnkhLogo.png');
      expect(logo.alt).toBe('Per Ankh Consciousness Technology Logo');
      expect(brandText).toBeTruthy();
    });

    it('should not render logo when showLogo is false', () => {
      header = new Header({ showLogo: false });
      
      const logo = header.element.querySelector('.animated-logo');
      expect(logo).toBeFalsy();
    });

    it('should handle logo click events', () => {
      header = new Header({ showLogo: true });
      const logo = header.element.querySelector('.animated-logo');
      
      const clickSpy = vi.spyOn(header, 'handleLogoClick');
      testUtils.simulateClick(logo);
      
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should handle logo keyboard events', () => {
      header = new Header({ showLogo: true });
      const logo = header.element.querySelector('.animated-logo');
      
      const clickSpy = vi.spyOn(header, 'handleLogoClick');
      testUtils.simulateKeyPress(logo, 'Enter');
      
      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('Feature Cards', () => {
    it('should render feature cards', () => {
      header = new Header();
      
      const featureGrid = header.element.querySelector('.feature-grid');
      const cards = header.element.querySelectorAll('.consciousness-card');
      
      expect(featureGrid).toBeTruthy();
      expect(cards).toHaveLength(3);
    });

    it('should render card content correctly', () => {
      header = new Header();
      
      const cards = header.element.querySelectorAll('.consciousness-card');
      const firstCard = cards[0];
      
      expect(firstCard.querySelector('.bio-tech-icon')).toBeTruthy();
      expect(firstCard.querySelector('.feature-title')).toBeTruthy();
      expect(firstCard.querySelector('.feature-description')).toBeTruthy();
    });

    it('should handle card hover events', () => {
      header = new Header();
      
      const card = header.element.querySelector('.consciousness-card');
      
      // Simulate mouseenter
      const mouseEnterEvent = new MouseEvent('mouseenter', { bubbles: true });
      card.dispatchEvent(mouseEnterEvent);
      
      expect(card.classList.contains('card-hover')).toBe(true);
      
      // Simulate mouseleave
      const mouseLeaveEvent = new MouseEvent('mouseleave', { bubbles: true });
      card.dispatchEvent(mouseLeaveEvent);
      
      expect(card.classList.contains('card-hover')).toBe(false);
    });
  });

  describe('Animations', () => {
    it('should render spore animations when animated is true', () => {
      header = new Header({ animated: true });
      
      const sporeContainer = header.element.querySelector('.spore-container');
      const spores = header.element.querySelectorAll('.spore');
      
      expect(sporeContainer).toBeTruthy();
      expect(spores).toHaveLength(4);
    });

    it('should not render spore animations when animated is false', () => {
      header = new Header({ animated: false });
      
      const sporeContainer = header.element.querySelector('.spore-container');
      expect(sporeContainer).toBeFalsy();
    });

    it('should setup scroll animations with IntersectionObserver', () => {
      const observeSpy = vi.fn();
      global.IntersectionObserver.mockImplementation(() => ({
        observe: observeSpy,
        unobserve: vi.fn(),
        disconnect: vi.fn()
      }));

      header = new Header({ animated: true });
      
      expect(observeSpy).toHaveBeenCalled();
    });
  });

  describe('Authentication Integration', () => {
    it('should listen for auth status changes', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      
      header = new Header();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('authStatusChanged', expect.any(Function));
    });

    it('should handle auth status change events', () => {
      header = new Header();
      
      const updateSpy = vi.spyOn(header, 'updateAuthStatus');
      
      // Simulate auth status change
      const authEvent = new CustomEvent('authStatusChanged', {
        detail: {
          isAuthenticated: true,
          session: testUtils.createMockSession()
        }
      });
      
      document.dispatchEvent(authEvent);
      
      expect(updateSpy).toHaveBeenCalled();
      expect(header.isAuthenticated).toBe(true);
      expect(header.userSession).toBeTruthy();
    });
  });

  describe('Logo Click Behavior', () => {
    it('should navigate to home when not on home page', () => {
      // Mock current location
      delete window.location;
      window.location = { pathname: '/some-other-page', href: '' };
      
      header = new Header();
      header.handleLogoClick();
      
      expect(window.location.href).toBe('/');
    });

    it('should trigger animation when on home page', () => {
      // Mock current location as home
      delete window.location;
      window.location = { pathname: '/', href: '/' };
      
      header = new Header();
      const logo = header.element.querySelector('.animated-logo');
      
      header.handleLogoClick();
      
      expect(logo.classList.contains('logo-pulse')).toBe(true);
      
      // Should remove class after timeout
      vi.advanceTimersByTime(1000);
      expect(logo.classList.contains('logo-pulse')).toBe(false);
    });
  });

  describe('Component Lifecycle', () => {
    it('should get element reference', () => {
      header = new Header();
      
      const element = header.getElement();
      expect(element).toBe(header.element);
      expect(element.tagName).toBe('HEADER');
    });

    it('should update component options', () => {
      header = new Header({ animated: true });
      container.appendChild(header.element);
      
      header.update({ animated: false });
      
      expect(header.options.animated).toBe(false);
    });

    it('should destroy component cleanly', () => {
      header = new Header();
      container.appendChild(header.element);
      
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      header.destroy();
      
      expect(header.element.parentNode).toBeFalsy();
      expect(removeEventListenerSpy).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      header = new Header();
      
      const headerElement = header.element;
      expect(headerElement.getAttribute('role')).toBe('banner');
    });

    it('should have proper alt text for images', () => {
      header = new Header({ showLogo: true });
      
      const logo = header.element.querySelector('.animated-logo');
      expect(logo.alt).toBe('Per Ankh Consciousness Technology Logo');
    });

    it('should have proper heading hierarchy', () => {
      header = new Header();
      
      const h1 = header.element.querySelector('h1');
      const h2 = header.element.querySelector('h2');
      const h3 = header.element.querySelector('h3');
      
      expect(h1).toBeTruthy();
      expect(h2).toBeTruthy();
      expect(h3).toBeTruthy();
    });
  });

  describe('Responsive Design', () => {
    it('should handle different screen sizes', () => {
      header = new Header();
      
      // Test that responsive classes are present
      const headerContent = header.element.querySelector('.header-content');
      expect(headerContent).toBeTruthy();
      
      const featureGrid = header.element.querySelector('.feature-grid');
      expect(featureGrid).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing logo image gracefully', () => {
      header = new Header({ showLogo: true });
      
      const logo = header.element.querySelector('.animated-logo');
      
      // Simulate image load error
      const errorEvent = new Event('error');
      logo.dispatchEvent(errorEvent);
      
      // Should not throw error
      expect(() => header.handleLogoClick()).not.toThrow();
    });

    it('should handle IntersectionObserver not being available', () => {
      // Mock IntersectionObserver as undefined
      const originalIntersectionObserver = global.IntersectionObserver;
      global.IntersectionObserver = undefined;
      
      expect(() => {
        header = new Header({ animated: true });
      }).not.toThrow();
      
      // Restore
      global.IntersectionObserver = originalIntersectionObserver;
    });
  });
});
