/**
 * Clerk Authentication Configuration for Per Ankh
 * 
 * To set up Clerk:
 * 1. Go to https://clerk.com and create an account
 * 2. Create a new application
 * 3. Copy your Publishable Key from the Clerk Dashboard
 * 4. Set VITE_CLERK_PUBLISHABLE_KEY in your .env file
 * 5. The key will be injected by the login pages
 */

// Clerk Publishable Key - read from Vite environment (build time) or window global (runtime)
const CLERK_PUBLISHABLE_KEY = import.meta.env?.VITE_CLERK_PUBLISHABLE_KEY || window.CLERK_PUBLISHABLE_KEY || '';

// Organization settings
const ORGANIZATION_SETTINGS = {
  // Define admin roles
  ADMIN_ROLES: ['admin', 'super_admin', 'owner'],
  // Define member roles
  MEMBER_ROLES: ['member', 'premium_member', 'community_leader'],
};

// Route configuration
const ROUTE_CONFIG = {
  // Public routes (no authentication required)
  publicRoutes: ['/', '/contact', '/donate', '/events', '/per-ankh', '/become-a-member'],
  
  // Admin-only routes
  adminRoutes: [
    '/admin/dashboard',
    '/admin/users',
    '/admin/content',
    '/admin/analytics',
    '/admin/settings',
    '/admin/notifications'
  ],
  
  // Member-only routes
  memberRoutes: ['/member/dashboard', '/member/profile'],
  
  // Login/signup pages
  authPages: {
    admin: '/admin',
    member: '/member/login',
  },
  
  // Redirect after login
  afterLogin: {
    admin: '/admin/dashboard',
    member: '/',
  },
};

// Clerk appearance customization - matches Per Ankh's sacred theme
const CLERK_APPEARANCE = {
  variables: {
    colorPrimary: '#D4AF37', // Primary gold
    colorBackground: '#0A0A0A', // Matte black
    colorText: '#F8F8FF', // Ethereal white
    colorTextSecondary: 'rgba(248, 248, 255, 0.7)',
    colorInputBackground: 'rgba(10, 10, 10, 0.5)',
    colorInputBorder: 'rgba(212, 175, 55, 0.3)',
    colorInputBorderFocus: '#D4AF37',
    colorDanger: '#dc2626',
    colorSuccess: '#22c55e',
    borderRadius: '10px',
    fontFamily: 'Inter, sans-serif',
    fontFamilyButtons: 'Inter, sans-serif',
    spacingUnit: '16px',
  },
  elements: {
    card: {
      backgroundColor: 'rgba(28, 28, 28, 0.95)',
      border: '1px solid rgba(212, 175, 55, 0.3)',
      borderRadius: '20px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(20px)',
    },
    headerTitle: {
      fontFamily: 'Cinzel, serif',
      color: '#D4AF37',
      fontSize: '1.5rem',
    },
    headerSubtitle: {
      color: 'rgba(248, 248, 255, 0.7)',
    },
    socialButtonsBlockButton: {
      backgroundColor: 'rgba(212, 175, 55, 0.1)',
      border: '1px solid rgba(212, 175, 55, 0.3)',
      color: '#F8F8FF',
    },
    socialButtonsBlockButtonHover: {
      backgroundColor: 'rgba(212, 175, 55, 0.2)',
    },
    formButtonPrimary: {
      background: 'linear-gradient(45deg, var(--primary-gold), var(--deep-gold))',
      color: 'var(--matte-black)',
      fontWeight: '600',
      borderRadius: '10px',
      padding: '1rem',
    },
    formButtonPrimaryHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 25px rgba(212, 175, 55, 0.4)',
    },
    formFieldInput: {
      backgroundColor: 'rgba(10, 10, 10, 0.5)',
      border: '1px solid rgba(212, 175, 55, 0.2)',
      borderRadius: '10px',
      color: '#F8F8FF',
      padding: '1rem',
    },
    formFieldInputFocus: {
      borderColor: '#D4AF37',
      boxShadow: '0 0 15px rgba(212, 175, 55, 0.3)',
    },
    footerActionLink: {
      color: '#D4AF37',
    },
    footerActionLinkHover: {
      color: '#F8F8FF',
    },
    identityPreviewEditButton: {
      color: '#D4AF37',
    },
    activeDeviceListItem: {
      backgroundColor: 'rgba(212, 175, 55, 0.1)',
    },
  },
};

// Export configuration
export {
  CLERK_PUBLISHABLE_KEY,
  ORGANIZATION_SETTINGS,
  ROUTE_CONFIG,
  CLERK_APPEARANCE,
};

export default {
  publishableKey: CLERK_PUBLISHABLE_KEY,
  appearance: CLERK_APPEARANCE,
};
