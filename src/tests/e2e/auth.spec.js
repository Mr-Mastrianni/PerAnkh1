/**
 * Per Ankh Authentication E2E Tests
 * End-to-end testing for authentication flows
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should display login button for unauthenticated users', async ({ page }) => {
    await page.goto('/');
    
    // Wait for navigation to load
    await page.waitForSelector('.per-ankh-nav');
    
    // Check for login button
    const loginButton = page.locator('.login-btn');
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toContainText('Login');
  });

  test('should navigate to login page when clicking login button', async ({ page }) => {
    await page.goto('/');
    
    // Click login button
    await page.click('.login-btn');
    
    // Should navigate to login page
    await expect(page).toHaveURL(/.*member-login\.html/);
  });

  test('should show validation errors for invalid login', async ({ page }) => {
    await page.goto('/member-login.html');
    
    // Try to login with invalid credentials
    await page.fill('#username', 'ab'); // Too short
    await page.fill('#password', 'short'); // Too short
    
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await page.goto('/member-login.html');
    
    // Fill in valid credentials
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'Password123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to main page
    await expect(page).toHaveURL(/.*website\.html/);
    
    // Should show user menu instead of login button
    await page.goto('/');
    await page.waitForSelector('.per-ankh-nav');
    
    const userMenu = page.locator('.user-menu');
    await expect(userMenu).toBeVisible();
  });

  test('should maintain session across page reloads', async ({ page }) => {
    // Login first
    await page.goto('/member-login.html');
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'Password123');
    await page.click('button[type="submit"]');
    
    // Navigate to home and verify authenticated state
    await page.goto('/');
    await page.waitForSelector('.per-ankh-nav');
    
    let userMenu = page.locator('.user-menu');
    await expect(userMenu).toBeVisible();
    
    // Reload page
    await page.reload();
    await page.waitForSelector('.per-ankh-nav');
    
    // Should still be authenticated
    userMenu = page.locator('.user-menu');
    await expect(userMenu).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/member-login.html');
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'Password123');
    await page.click('button[type="submit"]');
    
    // Navigate to home
    await page.goto('/');
    await page.waitForSelector('.per-ankh-nav');
    
    // Open user dropdown
    await page.click('.user-toggle');
    
    // Click logout
    await page.click('.logout-btn');
    
    // Should show login button again
    const loginButton = page.locator('.login-btn');
    await expect(loginButton).toBeVisible();
  });

  test('should handle session expiration', async ({ page }) => {
    // Login first
    await page.goto('/member-login.html');
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'Password123');
    await page.click('button[type="submit"]');
    
    // Manually expire session
    await page.evaluate(() => {
      const expiredSession = {
        userId: 'test-123',
        username: 'testuser',
        role: 'member',
        permissions: ['read'],
        loginTime: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 1000).toISOString(), // Expired
        sessionId: 'expired-session',
        csrfToken: 'expired-token'
      };
      
      const encrypted = btoa(JSON.stringify(expiredSession));
      localStorage.setItem('perankh_session', encrypted);
    });
    
    // Reload page
    await page.reload();
    await page.waitForSelector('.per-ankh-nav');
    
    // Should show login button (session expired)
    const loginButton = page.locator('.login-btn');
    await expect(loginButton).toBeVisible();
  });

  test('should enforce rate limiting', async ({ page }) => {
    await page.goto('/member-login.html');
    
    // Try multiple failed login attempts
    for (let i = 0; i < 6; i++) {
      await page.fill('#username', 'testuser');
      await page.fill('#password', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      // Wait for response
      await page.waitForTimeout(500);
    }
    
    // Should show rate limit error
    await expect(page.locator('.error-message')).toContainText(/too many.*attempts/i);
  });
});

test.describe('Protected Routes', () => {
  test('should redirect unauthenticated users from admin pages', async ({ page }) => {
    await page.goto('/admin-dashboard.html');
    
    // Should redirect to login or show access denied
    await expect(page).toHaveURL(/.*login/);
  });

  test('should allow authenticated users to access protected content', async ({ page }) => {
    // Login as admin
    await page.goto('/member-login.html');
    await page.fill('#username', 'adminuser');
    await page.fill('#password', 'AdminPass123');
    await page.click('button[type="submit"]');
    
    // Try to access admin dashboard
    await page.goto('/admin-dashboard.html');
    
    // Should be able to access (assuming admin role)
    await expect(page.locator('.admin-dashboard')).toBeVisible();
  });
});

test.describe('Mobile Authentication', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should work on mobile devices', async ({ page }) => {
    await page.goto('/');
    
    // Open mobile menu
    await page.click('.mobile-toggle');
    
    // Should show mobile menu
    await expect(page.locator('.mobile-menu')).toBeVisible();
    
    // Should show mobile login button
    const mobileLoginBtn = page.locator('.mobile-login-btn');
    await expect(mobileLoginBtn).toBeVisible();
  });

  test('should handle mobile login flow', async ({ page }) => {
    await page.goto('/member-login.html');
    
    // Should be responsive on mobile
    const loginForm = page.locator('form');
    await expect(loginForm).toBeVisible();
    
    // Login should work on mobile
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'Password123');
    await page.click('button[type="submit"]');
    
    // Should redirect successfully
    await expect(page).toHaveURL(/.*website\.html/);
  });
});
