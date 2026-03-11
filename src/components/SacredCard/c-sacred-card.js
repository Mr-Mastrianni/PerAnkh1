/**
 * Sacred Card Component - Per Ankh
 * Handles interactivity for .c-sacred-card elements following BEM methodology.
 * Auto-initializes on DOMContentLoaded; works alongside c-sacred-card.css.
 */

class SacredCard {
    constructor(element) {
        this.element = element;
        this.isInteractive = element.classList.contains('c-sacred-card--interactive');
        this.init();
    }

    init() {
        if (this.isInteractive) {
            this.setupInteractivity();
        }
        this.animateStats();
    }

    setupInteractivity() {
        this.element.setAttribute('tabindex', '0');
        this.element.setAttribute('role', 'button');

        this.element.addEventListener('click', (e) => {
            // Only fire card click if the target wasn't a button/link inside the card
            if (!e.target.closest('a, button')) {
                this.element.dispatchEvent(new CustomEvent('sacredCardClick', {
                    bubbles: true,
                    detail: { card: this.element }
                }));
            }
        });

        this.element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.element.click();
            }
        });
    }

    /**
     * Animate stat values from 0 up to their displayed value on first viewport entry.
     */
    animateStats() {
        const statEls = this.element.querySelectorAll('[data-stat], [data-metric]');
        if (!statEls.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    statEls.forEach(el => this.countUp(el));
                    observer.disconnect();
                }
            });
        }, { threshold: 0.3 });

        observer.observe(this.element);
    }

    countUp(element) {
        const rawText = element.textContent.trim();
        // Extract numeric portion, preserving prefix/suffix (e.g. "$12,847", "1,247")
        const match = rawText.match(/^([^0-9]*)([0-9,]+)([^0-9]*)$/);
        if (!match) return;

        const prefix = match[1];
        const target = parseInt(match[2].replace(/,/g, ''), 10);
        const suffix = match[3];

        if (isNaN(target)) return;

        const duration = 1200;
        const step = 16;
        const increment = target / (duration / step);
        let current = 0;

        const timer = setInterval(() => {
            current = Math.min(current + increment, target);
            element.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
            if (current >= target) clearInterval(timer);
        }, step);
    }
}

// Auto-initialize all sacred cards on the page
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.c-sacred-card').forEach(el => new SacredCard(el));
});

export { SacredCard };
