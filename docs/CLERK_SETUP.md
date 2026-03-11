# Clerk Authentication Setup Guide

This guide will help you set up Clerk authentication for the Per Ankh website, replacing the previous demo/hardcoded authentication system.

## What is Clerk?

[Clerk](https://clerk.com) is a modern authentication and user management service that provides:
- Secure email/password authentication
- Social login (Google, Facebook, GitHub, etc.)
- Passwordless/magic link authentication
- Multi-factor authentication (MFA)
- Built-in user management dashboard
- Role-based access control

## Quick Start

### 1. Sign Up for Clerk

1. Go to [https://clerk.com](https://clerk.com)
2. Click "Sign Up" and create an account
3. Create a new application named "Per Ankh" (or your preferred name)
4. Select "Web application" as the platform

### 2. Get Your API Keys

After creating your application:

1. Go to the Clerk Dashboard
2. Navigate to **API Keys** in the left sidebar
3. Copy the **Publishable Key** (starts with `pk_test_` or `pk_live_`)
4. (Optional) Copy the **Secret Key** for server-side operations

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Clerk publishable key:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
   ```

### 4. Run the Application

> **Note:** Clerk is loaded automatically from CDN, so no additional npm packages are needed!

```bash
npm run dev
```

## Setting Up User Roles

### Creating Admin Users

1. In the Clerk Dashboard, go to **Users**
2. Click "Create User" to add administrators
3. After creating a user, click on their name to edit
4. In the **Metadata** section, add:
   ```json
   {
     "role": "admin"
   }
   ```

### Creating Member Users

Members can sign up through the member login page (`/member/login`) or the become a member page (`/become-a-member`).

By default, new users will have the "member" role automatically.

## Configuring Social Login Providers

To enable social login (Google, Facebook, etc.):

1. In the Clerk Dashboard, go to **User & Authentication** → **Social Connections**
2. Toggle on the providers you want to enable (e.g., Google)
3. For each provider, you'll need to:
   - Create OAuth credentials in the provider's developer console
   - Add the callback URLs provided by Clerk
   - Enter the Client ID and Secret in Clerk

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the Google+ API
4. Go to Credentials → Create Credentials → OAuth client ID
5. Configure the consent screen
6. Add authorized redirect URIs from Clerk
7. Copy Client ID and Secret to Clerk

## Role-Based Access Control

The system recognizes these roles:

| Role | Access |
|------|--------|
| `admin` | Full admin dashboard access |
| `super_admin` | Full access + user management |
| `member` | Member portal access only |

### Assigning Roles

Roles are stored in user metadata. To assign a role:

1. Clerk Dashboard → Users → Select User
2. Go to **Metadata** tab
3. Add to Public Metadata:
   ```json
   {
     "role": "admin"
   }
   ```

## Protected Pages

The following pages are now protected by Clerk:

### Admin Pages (require `admin` role)
- `/admin/dashboard`
- `/admin/users`
- `/admin/content`
- `/admin/analytics`
- `/admin/settings`
- `/admin/notifications`

### Member Pages (require authentication)
- `/member/dashboard` (if exists)
- `/member/profile` (if exists)

## Customization

### Styling

Clerk components are styled to match the Per Ankh theme (gold/dark). 

To customize further, edit `src/auth/clerk-config.js`:

```javascript
const CLERK_APPEARANCE = {
  variables: {
    colorPrimary: '#D4AF37',      // Primary gold
    colorBackground: '#0A0A0A',   // Matte black
    colorText: '#F8F8FF',         // Ethereal white
    // ... more options
  }
};
```

### Redirect After Login

Edit `src/auth/clerk-config.js`:

```javascript
const ROUTE_CONFIG = {
  afterLogin: {
    admin: '/admin/dashboard',
    member: '/',
  }
};
```

## Troubleshooting

### "Authentication Not Configured" Message

This means `VITE_CLERK_PUBLISHABLE_KEY` is not set. Check:
1. `.env` file exists
2. Key is correctly copied from Clerk Dashboard
3. Server was restarted after adding the key

### Users Can't Access Admin Pages

1. Check the user's metadata has `"role": "admin"`
2. Verify the user has signed out and back in after role assignment
3. Check browser console for errors

### Social Login Not Working

1. Verify OAuth credentials are correct in Clerk Dashboard
2. Check redirect URIs match exactly
3. Ensure the social provider is enabled in Clerk

## Security Considerations

1. **Never commit `.env` file** - It contains sensitive keys
2. **Use HTTPS in production** - Clerk requires secure contexts
3. **Rotate keys periodically** - Generate new keys if compromised
4. **Review user access regularly** - Remove inactive admin users

## Migrating from Old Authentication

The old authentication used hardcoded credentials and localStorage sessions. To migrate:

1. **Create users in Clerk** - Add all existing admins/members to Clerk
2. **Set their roles** - Assign appropriate roles in user metadata
3. **Notify users** - Send password reset emails so they can set new passwords
4. **Remove old code** - Once verified, old auth files can be removed:
   - `admin-auth.js` (root)
   - `member-auth.js` (root)
   - `src/admin/admin-auth.js`
   - `src/member/member-auth.js`

## Support

- **Clerk Documentation**: https://clerk.com/docs
- **Clerk Dashboard**: https://dashboard.clerk.com
- **Clerk Support**: support@clerk.dev

## Free Tier Limits

Clerk's free tier includes:
- 10,000 monthly active users
- All authentication features
- Social login providers
- Basic user management

For most church/community sites, this will be more than sufficient.
