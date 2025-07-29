/**
 * Navigation Component JavaScript Module - Per Ankh
 * Handles dropdown interactions, user menu, and navigation state
 * Following modern ES6+ patterns with proper event handling
 */

class NavigationComponent {
    constructor(element) {
        this.element = element;
        this.dropdowns = [];
        this.userMenu = null;
        this.isInitialized = false;
        
        this.init();
    }
    
    init() {
        if (this.isInitialized) return;
        
        this.setupDropdowns();
        this.setupUserMenu();
        this.setupKeyboardNavigation();
        this.setupClickOutside();
        
        this.isInitialized = true;
        console.log('Navigation component initialized');
    }
    
    setupDropdowns() {
        const dropdownItems = this.element.querySelectorAll('.c-navigation__item');
        
        dropdownItems.forEach(item => {
            const toggle = item.querySelector('.c-navigation__dropdown-toggle');
            const menu = item.querySelector('.c-navigation__dropdown-menu');
            
            if (toggle && menu) {
                const dropdown = new NavigationDropdown(toggle, menu);
                this.dropdowns.push(dropdown);
            }
        });
    }
    
    setupUserMenu() {
        const userToggle = this.element.querySelector('.c-navigation__user-toggle');
        const userMenu = this.element.querySelector('.c-navigation__user-menu');
        
        if (userToggle && userMenu) {
            this.userMenu = new UserMenu(userToggle, userMenu);
        }
    }
    
    setupKeyboardNavigation() {
        this.element.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
                this.closeUserMenu();
            }
        });
    }
    
    setupClickOutside() {
        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.closeAllDropdowns();
                this.closeUserMenu();
            }
        });
    }
    
    closeAllDropdowns() {
        this.dropdowns.forEach(dropdown => dropdown.close());
    }
    
    closeUserMenu() {
        if (this.userMenu) {
            this.userMenu.close();
        }
    }
    
    updateUserName(name) {
        const userNameElement = this.element.querySelector('[data-user-name]');
        if (userNameElement) {
            userNameElement.textContent = name;
            userNameElement.setAttribute('data-user-name', name);
        }
    }
    
    updateBrandTitle(title) {
        const brandElement = this.element.querySelector('[data-nav-title]');
        if (brandElement) {
            brandElement.textContent = title;
            brandElement.setAttribute('data-nav-title', title);
        }
    }
    
    setActiveSection(sectionId) {
        // Remove active state from all dropdowns
        this.dropdowns.forEach(dropdown => dropdown.setActive(false));
        
        // Find and activate the relevant dropdown
        const activeDropdown = this.dropdowns.find(dropdown => 
            dropdown.containsLink(sectionId)
        );
        
        if (activeDropdown) {
            activeDropdown.setActive(true);
        }
    }
}

class NavigationDropdown {
    constructor(toggle, menu) {
        this.toggle = toggle;
        this.menu = menu;
        this.isOpen = false;
        
        this.setupEvents();
    }
    
    setupEvents() {
        this.toggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggle();
        });
        
        this.toggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle();
            }
        });
        
        // Handle menu item clicks
        const menuItems = this.menu.querySelectorAll('.c-navigation__dropdown-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                this.close();
            });
        });
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        this.menu.classList.add('is-active');
        this.toggle.classList.add('is-active');
        this.toggle.setAttribute('aria-expanded', 'true');
        this.isOpen = true;
        
        // Focus first menu item
        const firstItem = this.menu.querySelector('.c-navigation__dropdown-item');
        if (firstItem) {
            firstItem.focus();
        }
    }
    
    close() {
        this.menu.classList.remove('is-active');
        this.toggle.classList.remove('is-active');
        this.toggle.setAttribute('aria-expanded', 'false');
        this.isOpen = false;
    }
    
    setActive(active) {
        if (active) {
            this.toggle.classList.add('is-active');
        } else {
            this.toggle.classList.remove('is-active');
        }
    }
    
    containsLink(sectionId) {
        const links = this.menu.querySelectorAll('a[href*="' + sectionId + '"]');
        return links.length > 0;
    }
}

class UserMenu {
    constructor(toggle, menu) {
        this.toggle = toggle;
        this.menu = menu;
        this.isOpen = false;
        
        this.setupEvents();
    }
    
    setupEvents() {
        this.toggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggle();
        });
        
        // Handle logout button
        const logoutBtn = this.menu.querySelector('[data-action="logout"]');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
        
        // Handle other menu items
        const menuItems = this.menu.querySelectorAll('.c-navigation__user-menu-item:not([data-action="logout"])');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                this.close();
            });
        });
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        this.menu.classList.add('is-active');
        this.toggle.setAttribute('aria-expanded', 'true');
        this.isOpen = true;
    }
    
    close() {
        this.menu.classList.remove('is-active');
        this.toggle.setAttribute('aria-expanded', 'false');
        this.isOpen = false;
    }
    
    handleLogout() {
        // Check if we're in admin or member context
        if (typeof adminLogout === 'function') {
            adminLogout();
        } else if (typeof memberLogout === 'function') {
            memberLogout();
        } else {
            // Fallback logout
            this.performLogout();
        }
        this.close();
    }
    
    performLogout() {
        // Clear session storage
        sessionStorage.clear();
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('memberLoggedIn');
        
        // Redirect to appropriate login page
        const currentPath = window.location.pathname;
        if (currentPath.includes('admin')) {
            window.location.href = '/admin-login.html';
        } else {
            window.location.href = '/member-login.html';
        }
    }
}

// Auto-initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const navigationElement = document.querySelector('.c-navigation');
    if (navigationElement) {
        window.perAnkhNavigation = new NavigationComponent(navigationElement);
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NavigationComponent, NavigationDropdown, UserMenu };
}
