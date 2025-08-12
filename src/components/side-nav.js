// Per Ankh Side Navigation (toggleable)
// Lightweight vanilla JS component to embed on any public page

(function () {
  const links = [
    { href: 'index.html', label: 'Home', icon: '🏛️' },
    { href: 'become-a-member.html', label: 'Become a Member', icon: '🤝' },
    { href: 'events.html', label: 'Events', icon: '📅' },
    { href: 'per-ankh.html', label: 'Ethos & Structure', icon: '📜' },
    { href: 'ceremony-and-safety.html', label: 'Ceremony & Safety', icon: '🛡️' },
    { href: 'donate.html', label: 'Donate', icon: '💛' },
    { href: 'contact.html', label: 'Contact', icon: '✉️' },
    { href: 'calculator.html', label: 'Calculator', icon: '🔢' },
    { href: 'admin-login.html', label: 'Admin', icon: '🛂' },
  ];

  function createEl(tag, className, html) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (html) el.innerHTML = html;
    return el;
  }

  function isActive(href) {
    try {
      const current = window.location.pathname.split('/').pop() || 'index.html';
      return current === href;
    } catch { return false; }
  }

  function buildNav() {
    // Toggle button
    const toggle = createEl('button', 'pa-nav-toggle', '<span aria-hidden="true">☰</span>');
    toggle.setAttribute('aria-label', 'Open navigation');

    // Overlay and panel
    const overlay = createEl('div', 'pa-side-overlay');
    overlay.setAttribute('aria-hidden', 'true');

    const panel = createEl('aside', 'pa-side-nav');
    panel.setAttribute('role', 'navigation');
    panel.setAttribute('aria-label', 'Side navigation');

    // Header
    const header = createEl('div', 'pa-side-header');
    const logo = createEl('img');
    logo.src = 'PerAnkhLogo.png';
    logo.alt = 'Per Ankh Logo';
    logo.style.height = '42px';
    logo.style.width = 'auto';
    logo.style.marginRight = '8px';

    const titleWrap = createEl('div');
    const title = createEl('div', 'pa-side-title', 'PER ANKH');
    const sub = createEl('div', 'pa-side-sub', 'ENTHEOGENIC CHURCH');
    titleWrap.appendChild(title);
    titleWrap.appendChild(sub);
    header.appendChild(logo);
    header.appendChild(titleWrap);

    // Links
    const list = createEl('div', 'pa-side-links');
    links.forEach(l => {
      const a = createEl('a', 'pa-side-link' + (isActive(l.href) ? ' active' : ''));
      a.href = l.href;
      a.innerHTML = `<span class="icon">${l.icon}</span><span>${l.label}</span>`;
      list.appendChild(a);
    });

    // Footer
    const footer = createEl('div', 'pa-side-footer', `© ${new Date().getFullYear()} Per Ankh`);

    panel.appendChild(header);
    panel.appendChild(list);
    panel.appendChild(footer);

    function open() {
      panel.classList.add('open');
      overlay.classList.add('open');
      toggle.setAttribute('aria-label', 'Close navigation');
    }
    function close() {
      panel.classList.remove('open');
      overlay.classList.remove('open');
      toggle.setAttribute('aria-label', 'Open navigation');
    }

    toggle.addEventListener('click', () => {
      if (panel.classList.contains('open')) close(); else open();
    });
    overlay.addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

    document.body.appendChild(toggle);
    document.body.appendChild(overlay);
    document.body.appendChild(panel);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildNav);
  } else {
    buildNav();
  }
})();


