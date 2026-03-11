# Clerk Authentication - Quick Start

## ⚡ Get Started in 5 Minutes

### Step 1: Sign Up
Go to [clerk.com](https://clerk.com) and create a free account

### Step 2: Get Your Key
1. Create a new application in Clerk Dashboard
2. Go to **API Keys**
3. Copy the **Publishable Key**

### Step 3: Configure
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your key
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

### Step 4: Run
```bash
npm run dev
```

> **Note:** No npm install needed for Clerk! It's loaded automatically from CDN.

### Step 5: Create First Admin
1. Visit `http://localhost:3000/admin`
2. Sign up with your email
3. In Clerk Dashboard → Users → Select your user
4. Add metadata: `{ "role": "admin" }`
5. Refresh the page - you now have admin access!

---

## 📁 Files Changed/Created

### New Files
- `src/auth/clerk-config.js` - Configuration
- `src/auth/clerk-auth.js` - Main authentication module
- `src/auth/clerk-admin-protect.js` - Admin page protection
- `.env.example` - Environment template
- `docs/CLERK_SETUP.md` - Full documentation
- `docs/CLERK_QUICKSTART.md` - This file

### Updated Files
- `pages/admin/login.html` - Now uses Clerk SignIn component
- `pages/member/login.html` - Now uses Clerk SignIn component
- `pages/admin/dashboard.html` - Now uses Clerk protection

---

## 🔐 Setting Up User Roles

### Make a User an Admin
1. Clerk Dashboard → Users
2. Click on user
3. Metadata tab → Public Metadata
4. Add: `{ "role": "admin" }`

### Default Member Role
Regular members don't need special metadata - they just sign up and log in.

---

## 🧪 Testing Authentication

### Admin Login
1. Go to `/admin`
2. Sign up with email/password
3. Set admin role in Clerk Dashboard
4. Refresh - should see admin dashboard

### Member Login
1. Go to `/member/login`
2. Sign up with email/password
3. Should redirect to home page after login

---

## 🚨 Common Issues

### "Authentication Not Configured" banner
**Fix**: Add your Clerk publishable key to `.env` file

### "Access Denied" after login
**Fix**: User needs `"role": "admin"` in their Clerk metadata

### Pages not loading / stuck on spinner
**Fix**: Check browser console for errors; verify Clerk key is valid

---

## 🎨 Customization

Edit `src/auth/clerk-config.js` to change:
- Colors (to match your brand)
- Redirect URLs
- Allowed roles
- Session duration

---

## 📊 Free Tier Limits

- **10,000** monthly active users
- All authentication features included
- More than enough for most community sites

---

## 🆘 Need Help?

- **Clerk Docs**: https://clerk.com/docs
- **Full Guide**: See `CLERK_SETUP.md`
- **Support**: support@clerk.dev
