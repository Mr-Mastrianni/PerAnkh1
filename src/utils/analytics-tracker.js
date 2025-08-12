// Lightweight client-side analytics tracker
// Sends pageview events to the Media/Analytics API

(() => {
  const API_BASE = 'http://localhost:4000';
  const SESSION_KEY = 'perankh_analytics_session_id';

  function getSessionId() {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `sess_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }

  function isAdminPage() {
    const p = location.pathname.toLowerCase();
    return p.startsWith('/admin') || p.includes('admin-');
  }

  async function track(type = 'pageview', data = {}) {
    if (isAdminPage()) return; // do not track admin pages
    try {
      await fetch(`${API_BASE}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          path: location.pathname + location.search + location.hash,
          referrer: document.referrer || '',
          device: navigator.userAgent,
          sessionId: getSessionId(),
          ...data,
        }),
      });
    } catch (e) {
      // Fail silently if server is unavailable
      // console.warn('Analytics track failed');
    }
  }

  function onRouteChange() {
    track('pageview');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onRouteChange);
  } else {
    onRouteChange();
  }

  window.addEventListener('hashchange', onRouteChange);
  window.addEventListener('popstate', onRouteChange);
})();


