/**
 * Admin Protection Script
 * Protects admin pages from unauthorized access
 */

// Check if user is authenticated when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if admin auth library is available
    if (typeof perAnkhAuth !== 'undefined') {
        // Check authentication status
        if (!perAnkhAuth.isAuthenticated()) {
            // Redirect to login page
            window.location.href = '../admin-login.html';
            return;
        }
        
        // Show admin content
        perAnkhAuth.showAdminContent();
    } else {
        // If auth library is not available, check localStorage directly
        const session = localStorage.getItem('perankh_admin_session');
        const active = sessionStorage.getItem('perankh_admin_active');
        
        if (!session || !active) {
            // Redirect to login page
            window.location.href = '../admin-login.html';
            return;
        }
        
        // Validate session
        try {
            const sessionData = JSON.parse(session);
            const loginTime = new Date(sessionData.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
            
            // Session expires after 8 hours
            if (hoursDiff >= 8) {
                // Clear expired session and redirect to login
                localStorage.removeItem('perankh_admin_session');
                sessionStorage.removeItem('perankh_admin_active');
                window.location.href = '../admin-login.html';
                return;
            }
        } catch (error) {
            // If there's an error parsing session, redirect to login
            window.location.href = '../admin-login.html';
            return;
        }
    }
});
