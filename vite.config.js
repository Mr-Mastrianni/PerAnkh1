import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => ({
  root: '.',
  // Use the repository name for GitHub Pages
  base: mode === 'production' ? '/Per-Ankh/' : '/',
  publicDir: 'public',
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        adminDashboard: resolve(__dirname, 'admin-dashboard.html'),
        adminAnalytics: resolve(__dirname, 'admin-analytics.html'),
        adminContent: resolve(__dirname, 'admin-content-manager.html'),
        adminLogin: resolve(__dirname, 'admin-login.html'),
        adminNotifications: resolve(__dirname, 'admin-notifications.html'),
        adminSettings: resolve(__dirname, 'admin-settings.html'),
        adminUser: resolve(__dirname, 'admin-user-manager.html'),
        member: resolve(__dirname, 'member-login.html'),
        becomeMember: resolve(__dirname, 'become-a-member.html'),
        calculator: resolve(__dirname, 'calculator.html'),
        ceremony: resolve(__dirname, 'ceremony-and-safety.html'),
        community: resolve(__dirname, 'community.html'),
        partnership: resolve(__dirname, 'communitypartnership.html'),
        contact: resolve(__dirname, 'contact.html'),
        crystal: resolve(__dirname, 'crystaltech.html'),
        donate: resolve(__dirname, 'donate.html'),
        events: resolve(__dirname, 'events.html'),
        perAnkh: resolve(__dirname, 'per-ankh.html'),
        protocols: resolve(__dirname, 'protocols.html'),
        sacredRelationships: resolve(__dirname, 'sacredcommunityrelationships.html'),
        jon: resolve(__dirname, 'jon.html'),
        mamayana: resolve(__dirname, 'mamayana.html'),
        moudoubaqui: resolve(__dirname, 'moudoubaqui.html'),
        shanna: resolve(__dirname, 'Shanna1.html'),
        womensEmpowerment: resolve(__dirname, 'women\'sempowerment.html'),
        modernizedDemo: resolve(__dirname, 'modernized-demo.html'),
        testGithub: resolve(__dirname, 'test-github-pages.html')
      },
      output: {
        manualChunks: {
          vendor: ['crypto-js', 'jwt-simple', 'validator']
        }
      }
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
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self';"
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
      '@assets': resolve(__dirname, 'src/assets')
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
  
  // Performance optimizations
  optimizeDeps: {
    include: ['crypto-js', 'jwt-simple', 'validator']
  },
  
  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
}));
