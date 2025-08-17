// Per Ankh Enhanced Side Navigation
// Dynamic, animated navigation with modern features

(function () {
  const links = [
    { href: 'index.html', label: 'Home', icon: '🏛️', description: 'Welcome to Per Ankh' },
    { href: 'become-a-member.html', label: 'Become a Member', icon: '🤝', description: 'Join our community' },
    { href: 'events.html', label: 'Events', icon: '📅', description: 'Upcoming ceremonies & workshops' },
    { href: 'per-ankh.html', label: 'Ethos & Structure', icon: '📜', description: 'Our philosophy & organization' },
    { href: 'ceremony-and-safety.html', label: 'Ceremony & Safety', icon: '🛡️', description: 'Sacred practices & guidelines' },
    { href: 'donate.html', label: 'Donate', icon: '💛', description: 'Support our mission' },
    { href: 'contact.html', label: 'Contact', icon: '✉️', description: 'Get in touch' },
    { href: 'calculator.html', label: 'Calculator', icon: '🔢', description: 'Dosage & timing tools' },
    { href: 'admin-login.html', label: 'Admin', icon: '🛂', description: 'Administrative access' },
  ];

  let isAnimating = false;

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
    // Enhanced toggle button with animation
    const toggle = createEl('button', 'pa-nav-toggle', '<span class="hamburger"></span>');
    toggle.setAttribute('aria-label', 'Open navigation');
    
    // Add magnetic hover effect (limited movement to prevent positioning issues)
    toggle.addEventListener('mousemove', (e) => {
      if (!toggle.classList.contains('active')) {
        const rect = toggle.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distanceX = Math.max(-5, Math.min(5, (e.clientX - centerX) * 0.1));
        const distanceY = Math.max(-5, Math.min(5, (e.clientY - centerY) * 0.1));
        
        toggle.style.transform = `translate(${distanceX}px, ${distanceY}px) scale(1.05)`;
      }
    });
    
    toggle.addEventListener('mouseleave', () => {
      if (!toggle.classList.contains('active')) {
        toggle.style.transform = '';
      }
    });

    // Overlay and panel
    const overlay = createEl('div', 'pa-side-overlay');
    overlay.setAttribute('aria-hidden', 'true');

    const panel = createEl('aside', 'pa-side-nav');
    panel.setAttribute('role', 'navigation');
    panel.setAttribute('aria-label', 'Side navigation');

    // Animated header with logo
    const header = createEl('div', 'pa-side-header');
    const logoContainer = createEl('div', 'pa-logo-container');
    const logo = createEl('img', 'pa-logo');
    logo.src = 'PerAnkhLogo.png';
    logo.alt = 'Per Ankh Entheogenic Church Logo';
    logo.style.height = '60px';
    logo.style.width = 'auto';
    
    logoContainer.appendChild(logo);
    header.appendChild(logoContainer);

    // Enhanced links with descriptions and animations
    const list = createEl('div', 'pa-side-links');
    links.forEach((l, index) => {
      const linkWrapper = createEl('div', 'pa-link-wrapper');
      const a = createEl('a', 'pa-side-link' + (isActive(l.href) ? ' active' : ''));
      a.href = l.href;
      a.style.animationDelay = `${index * 0.1}s`;
      
      // Create a div container for the content
      const contentDiv = createEl('div', 'pa-link-content');
      contentDiv.style.display = 'flex';
      contentDiv.style.alignItems = 'flex-start';
      contentDiv.style.gap = '16px';
      contentDiv.style.width = '100%';
      
      const iconSpan = createEl('span', 'pa-link-icon', l.icon);
      const textDiv = createEl('div', 'pa-link-text');
      textDiv.style.display = 'flex';
      textDiv.style.flexDirection = 'column';
      textDiv.style.flex = '1';
      
      const labelSpan = createEl('span', 'pa-link-label', l.label);
      const descSpan = createEl('span', 'pa-link-desc', l.description);
      
      textDiv.appendChild(labelSpan);
      textDiv.appendChild(descSpan);
      
      contentDiv.appendChild(iconSpan);
      contentDiv.appendChild(textDiv);
      a.appendChild(contentDiv);
      
      // Ensure link is properly clickable
      a.style.pointerEvents = 'auto';
      a.style.cursor = 'pointer';
      a.style.display = 'block';
      a.style.textDecoration = 'none';
      
      // Add click handler to ensure navigation works
      a.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = l.href;
      });
      
      // Add hover effects
      a.addEventListener('mouseenter', () => {
        if (!isAnimating) {
          a.classList.add('hover');
        }
      });
      a.addEventListener('mouseleave', () => {
        a.classList.remove('hover');
      });
      
      linkWrapper.appendChild(a);
      list.appendChild(linkWrapper);
    });

    // Enhanced footer with additional info
    const footer = createEl('div', 'pa-side-footer');
    const footerText = createEl('div', 'pa-footer-text', `© ${new Date().getFullYear()} Per Ankh`);
    const footerSub = createEl('div', 'pa-footer-sub', 'Entheogenic Church');
    footer.appendChild(footerText);
    footer.appendChild(footerSub);

    panel.appendChild(header);
    panel.appendChild(list);
    panel.appendChild(footer);

    function open() {
      if (isAnimating) return;
      isAnimating = true;
      
      panel.classList.add('open');
      overlay.classList.add('open');
      toggle.classList.add('active');
      toggle.setAttribute('aria-label', 'Close navigation');
      
      // Animate links in sequence
      const links = panel.querySelectorAll('.pa-side-link');
      links.forEach((link, index) => {
        link.classList.add('animate-in');
      });
      
      setTimeout(() => {
        isAnimating = false;
      }, 300);
    }
    
    function close() {
      if (isAnimating) return;
      isAnimating = true;
      
      panel.classList.remove('open');
      overlay.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-label', 'Open navigation');
      
      // Animate links out
      const links = panel.querySelectorAll('.pa-side-link');
      links.forEach(link => {
        link.classList.remove('animate-in');
      });
      
      setTimeout(() => {
        isAnimating = false;
      }, 300);
    }

    // Enhanced event listeners with ripple effect
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Create ripple effect
      const ripple = document.createElement('span');
      const rect = toggle.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.classList.add('ripple');
      
      toggle.appendChild(ripple);
      
      // Remove ripple after animation
      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }, 600);
      
      // Add bounce effect
      toggle.classList.add('bounce');
      setTimeout(() => {
        toggle.classList.remove('bounce');
      }, 200);
      
      // Haptic feedback for mobile devices
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      
      // Audio feedback - drum sound effect
      try {
        if (window.AudioContext || window.webkitAudioContext) {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          
          // Create a more complex drum sound using multiple oscillators
          const createDrumSound = () => {
            // Bass drum component (low frequency)
            const bassOsc = audioContext.createOscillator();
            const bassGain = audioContext.createGain();
            const bassFilter = audioContext.createBiquadFilter();
            
            bassOsc.type = 'sine';
            bassOsc.frequency.setValueAtTime(60, audioContext.currentTime);
            bassOsc.frequency.exponentialRampToValueAtTime(20, audioContext.currentTime + 0.1);
            
            bassFilter.type = 'lowpass';
            bassFilter.frequency.setValueAtTime(100, audioContext.currentTime);
            
            bassGain.gain.setValueAtTime(0.3, audioContext.currentTime);
            bassGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
            
            bassOsc.connect(bassFilter);
            bassFilter.connect(bassGain);
            bassGain.connect(audioContext.destination);
            
            // Snap/click component (high frequency)
            const snapOsc = audioContext.createOscillator();
            const snapGain = audioContext.createGain();
            const snapFilter = audioContext.createBiquadFilter();
            
            snapOsc.type = 'triangle';
            snapOsc.frequency.setValueAtTime(1500, audioContext.currentTime);
            snapOsc.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.05);
            
            snapFilter.type = 'highpass';
            snapFilter.frequency.setValueAtTime(800, audioContext.currentTime);
            
            snapGain.gain.setValueAtTime(0.15, audioContext.currentTime);
            snapGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);
            
            snapOsc.connect(snapFilter);
            snapFilter.connect(snapGain);
            snapGain.connect(audioContext.destination);
            
            // Add some noise for texture
            const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
            const noiseData = noiseBuffer.getChannelData(0);
            for (let i = 0; i < noiseData.length; i++) {
              noiseData[i] = Math.random() * 2 - 1;
            }
            
            const noiseSource = audioContext.createBufferSource();
            const noiseGain = audioContext.createGain();
            const noiseFilter = audioContext.createBiquadFilter();
            
            noiseSource.buffer = noiseBuffer;
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.setValueAtTime(300, audioContext.currentTime);
            
            noiseGain.gain.setValueAtTime(0.05, audioContext.currentTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.06);
            
            noiseSource.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(audioContext.destination);
            
            // Start all components
            bassOsc.start(audioContext.currentTime);
            bassOsc.stop(audioContext.currentTime + 0.2);
            
            snapOsc.start(audioContext.currentTime);
            snapOsc.stop(audioContext.currentTime + 0.08);
            
            noiseSource.start(audioContext.currentTime);
            noiseSource.stop(audioContext.currentTime + 0.06);
          };
          
          createDrumSound();
        }
      } catch (e) {
        // Audio context not available or failed - continue without audio
        console.log('Drum sound feedback not available');
      }
      
      if (panel.classList.contains('open')) close(); else open();
    });
    
    overlay.addEventListener('click', close);
    
    document.addEventListener('keydown', (e) => { 
      if (e.key === 'Escape') close(); 
    });

    // Add swipe gestures for mobile
    let startX = 0;
    let currentX = 0;
    
    panel.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    });
    
    panel.addEventListener('touchmove', (e) => {
      currentX = e.touches[0].clientX;
    });
    
    panel.addEventListener('touchend', () => {
      if (startX - currentX > 50) { // Swipe left to close
        close();
      }
    });

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


