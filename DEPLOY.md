# Deploy to Vercel

This guide explains how to deploy the Per Ankh Consciousness Platform to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free tier works fine)
2. [Vercel CLI](https://vercel.com/docs/cli) installed (optional, for CLI deployment)
3. Node.js 18+ installed locally

## Deployment Options

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push
   ```

2. **Import Project in Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect Vite settings

3. **Configure Build Settings**
   The following settings are already configured in `vercel.json`:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables** (if needed)
   Add any required environment variables in the Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add variables like `NODE_ENV=production`

5. **Deploy**
   Click "Deploy" and wait for the build to complete.

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Configuration Details

### vercel.json

The `vercel.json` file contains:
- **Routes**: Clean URLs for all pages (e.g., `/admin` → `/admin-login.html`)
- **Headers**: Security headers for all routes
- **Caching**: Optimized caching for static assets

### vite.config.js

Build configuration:
- **base**: `/` (root domain)
- **outDir**: `dist`
- **Multi-page**: All HTML files are configured as entry points

## Clean URLs Available

| URL | Maps to |
|-----|---------|
| `/` | `index.html` |
| `/admin` | `admin-login.html` |
| `/admin/dashboard` | `admin-dashboard.html` |
| `/admin/users` | `admin-user-manager.html` |
| `/admin/content` | `admin-content-manager.html` |
| `/admin/analytics` | `admin-analytics.html` |
| `/admin/settings` | `admin-settings.html` |
| `/admin/notifications` | `admin-notifications.html` |
| `/per-ankh` | `per-ankh.html` |
| `/community` | `community.html` |
| `/events` | `events.html` |
| `/contact` | `contact.html` |
| `/donate` | `donate.html` |
| `/member/login` | `member-login.html` |
| `/protocols` | `protocols.html` |
| `/calculator` | `calculator.html` |
| `/crystaltech` | `crystaltech.html` |
| `/mamayana` | `mamayana.html` |
| `/moudoubaqui` | `moudoubaqui.html` |
| `/jon` | `jon.html` |
| `/shanna` | `Shanna1.html` |
| `/become-a-member` | `become-a-member.html` |
| `/vendor-registration` | `vendor-registration.html` |
| `/ceremony-and-safety` | `ceremony-and-safety.html` |
| `/community-partnership` | `communitypartnership.html` |
| `/sacred-community` | `sacredcommunityrelationships.html` |
| `/women-empowerment` | `women'sempowerment.html` |

## Post-Deployment

### 1. Custom Domain (Optional)

1. In Vercel Dashboard, go to **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

### 2. Environment Variables (Required for Firebase)

Your app uses Firebase which requires environment variables. Add these in the Vercel dashboard:

1. Go to **Project Settings** → **Environment Variables**
2. Add the following variables (get values from your Firebase Console):

| Variable | Value | Required |
|----------|-------|----------|
| `VITE_FIREBASE_API_KEY` | Your Firebase API key | ✅ |
| `VITE_FIREBASE_AUTH_DOMAIN` | your-project.firebaseapp.com | ✅ |
| `VITE_FIREBASE_PROJECT_ID` | your-project-id | ✅ |
| `VITE_FIREBASE_STORAGE_BUCKET` | your-project.appspot.com | ✅ |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID | ✅ |
| `VITE_FIREBASE_APP_ID` | App ID | ✅ |
| `VITE_FIREBASE_MEASUREMENT_ID` | G-XXXXXXXXXX | Optional |

**To get these values:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the gear icon → **Project Settings**
4. Under "Your apps", find your web app
5. Copy the config values

**Note:** These variables must be prefixed with `VITE_` to be accessible in client-side code.

### 3. Verify Deployment

- Check all pages load correctly
- Test navigation between pages
- Verify assets (images, CSS, JS) load properly

## Troubleshooting

### Build Failures

1. Check Node.js version (must be 18+)
2. Ensure all dependencies are installed: `npm install`
3. Check build locally: `npm run build`

### 404 Errors

- Routes are configured in `vercel.json`
- Ensure all HTML files are listed in `vite.config.js` rollupOptions input

### Asset Loading Issues

- Check browser console for 404 errors
- Verify `base: '/'` in `vite.config.js`

## Reverting Deployment

If needed, you can rollback to a previous deployment in the Vercel Dashboard:
1. Go to **Deployments**
2. Find the previous working version
3. Click the three dots → **Promote to Production**

---

For more help, visit [Vercel Documentation](https://vercel.com/docs)
