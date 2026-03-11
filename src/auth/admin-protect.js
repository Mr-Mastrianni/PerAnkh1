/**
 * Admin Page Protection
 * Include after auth.js to protect admin-only pages
 */
document.addEventListener('DOMContentLoaded', () => {
    if (typeof perAnkhAuth !== 'undefined') {
        perAnkhAuth.protectPage('admin');
    } else {
        // Fallback: check session directly
        const session = localStorage.getItem('perankh_admin_session');
        const active = sessionStorage.getItem('perankh_admin_active');
        if (!session || !active) {
            window.location.href = '/admin';
            return;
        }
        try {
            const data = JSON.parse(session);
            const hoursDiff = (Date.now() - new Date(data.loginTime)) / (1000 * 60 * 60);
            if (hoursDiff >= 8) {
                localStorage.removeItem('perankh_admin_session');
                sessionStorage.removeItem('perankh_admin_active');
                window.location.href = '/admin';
            }
        } catch {
            window.location.href = '/admin';
        }
    }
});
