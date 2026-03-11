import { defineConfig } from 'vite';
import { resolve } from 'path';

// Mirror of vercel.json rewrites — keeps dev server routes in sync with production
const DEV_REWRITES = {
  '/':                      '/pages/index.html',
  '/admin':                 '/pages/admin/login.html',
  '/admin/dashboard':       '/pages/admin/dashboard.html',
  '/admin/users':           '/pages/admin/user-manager.html',
  '/admin/content':         '/pages/admin/content-manager.html',
  '/admin/analytics':       '/pages/admin/analytics.html',
  '/admin/settings':        '/pages/admin/settings.html',
  '/admin/notifications':   '/pages/admin/notifications.html',
  '/admin/per-ankh-tech':   '/pages/admin/internal/per-ankh-tech.html',
  '/per-ankh':              '/pages/programs/per-ankh.html',
  '/community':             '/pages/community/community.html',
  '/community-partnership': '/pages/community/partnership.html',
  '/sacred-community':      '/pages/community/sacred-relationships.html',
  '/women-empowerment':     '/pages/community/womens-empowerment.html',
  '/events':                '/pages/events/events.html',
  '/contact':               '/pages/support/contact.html',
  '/donate':                '/pages/support/donate.html',
  '/vendor-registration':   '/pages/support/vendor-registration.html',
  '/member/login':          '/pages/member/login.html',
  '/become-a-member':       '/pages/member/become-a-member.html',
  '/test-clerk':            '/pages/test-clerk.html',
  '/protocols':             '/pages/programs/protocols.html',
  '/calculator':            '/pages/programs/calculator.html',
  '/crystaltech':           '/pages/programs/crystaltech.html',
  '/ceremony-and-safety':   '/pages/programs/ceremony-and-safety.html',
  '/moudoubaqui':           '/pages/people/moudoubaqui.html',
  '/jon':                   '/pages/people/jon.html',
  '/shanna':                '/pages/people/shanna.html',
};

// Clerk auth sub-routes that should serve the parent login page.
// When Clerk uses routing: 'path', it navigates to sub-paths like
// /admin/factor-two, /admin/sso-callback, /member/login/factor-two, etc.
const CLERK_AUTH_BASES = {
  '/admin':        '/pages/admin/login.html',
  '/member/login': '/pages/member/login.html',
};

// Vite plugin: rewrites clean URLs to their HTML file paths during dev
function devRewrites() {
  return {
    name: 'dev-rewrites',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const path = req.url.split('?')[0].split('#')[0];

        // Exact match first
        if (DEV_REWRITES[path]) {
          req.url = DEV_REWRITES[path] + (req.url.slice(path.length) || '');
          return next();
        }

        // Clerk auth sub-routes: /admin/factor-two, /member/login/verify, etc.
        for (const [base, html] of Object.entries(CLERK_AUTH_BASES)) {
          if (path.startsWith(base + '/') && !DEV_REWRITES[path]) {
            req.url = html + (req.url.slice(path.length) || '');
            return next();
          }
        }

        next();
      });
    }
  };
}

export default defineConfig(({ mode }) => ({
  root: '.',
  // Base path for deployment
  base: '/',
  publicDir: 'public',
  appType: 'mpa',
  plugins: [devRewrites()],

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'pages/index.html'),
        adminDashboard: resolve(__dirname, 'pages/admin/dashboard.html'),
        adminAnalytics: resolve(__dirname, 'pages/admin/analytics.html'),
        adminContent: resolve(__dirname, 'pages/admin/content-manager.html'),
        adminLogin: resolve(__dirname, 'pages/admin/login.html'),
        adminNotifications: resolve(__dirname, 'pages/admin/notifications.html'),
        adminSettings: resolve(__dirname, 'pages/admin/settings.html'),
        adminUser: resolve(__dirname, 'pages/admin/user-manager.html'),
        member: resolve(__dirname, 'pages/member/login.html'),
        becomeMember: resolve(__dirname, 'pages/member/become-a-member.html'),
        calculator: resolve(__dirname, 'pages/programs/calculator.html'),
        ceremony: resolve(__dirname, 'pages/programs/ceremony-and-safety.html'),
        community: resolve(__dirname, 'pages/community/community.html'),
        partnership: resolve(__dirname, 'pages/community/partnership.html'),
        contact: resolve(__dirname, 'pages/support/contact.html'),
        crystal: resolve(__dirname, 'pages/programs/crystaltech.html'),
        donate: resolve(__dirname, 'pages/support/donate.html'),
        events: resolve(__dirname, 'pages/events/events.html'),
        perAnkh: resolve(__dirname, 'pages/programs/per-ankh.html'),
        protocols: resolve(__dirname, 'pages/programs/protocols.html'),
        sacredRelationships: resolve(__dirname, 'pages/community/sacred-relationships.html'),
        jon: resolve(__dirname, 'pages/people/jon.html'),
        moudoubaqui: resolve(__dirname, 'pages/people/moudoubaqui.html'),
        shanna: resolve(__dirname, 'pages/people/shanna.html'),
        womensEmpowerment: resolve(__dirname, 'pages/community/womens-empowerment.html'),
        modernizedDemo: resolve(__dirname, 'pages/misc/modernized-demo.html'),
        testGithub: resolve(__dirname, 'pages/misc/test-github-pages.html'),
        vendorRegistration: resolve(__dirname, 'pages/support/vendor-registration.html'),
        seedDatabase: resolve(__dirname, 'pages/misc/seed-database.html'),
        testClerk: resolve(__dirname, 'pages/test-clerk.html')
      },
      output: {}
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000
  },

  server: {
    port: 3000,
    host: true,
    open: true,
    cors: true,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  },

  preview: {
    port: 4173,
    host: true,
    cors: true
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@assets': resolve(__dirname, 'public/assets'),
      '@services': resolve(__dirname, 'src/services'),
      '@auth': resolve(__dirname, 'src/auth')
    }
  },

  css: {
    devSourcemap: true,
    preprocessorOptions: {
      css: {
        charset: false
      }
    }
  },


  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
}));
