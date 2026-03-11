/**
 * CMS Content Loader
 * Loads page content from Firestore pageContent collection and injects it into
 * DOM elements marked with data-cms attributes.
 *
 * Usage: Add <script type="module" src="/src/services/cms-loader.js"></script> to any page
 *        and mark editable elements with data-cms="sectionKey"
 *
 * For list sections, use data-cms-list="sectionKey" on a container element.
 * The container's innerHTML will be replaced with rendered list items.
 * Define a <template data-cms-template="sectionKey"> to control list item markup.
 */

import { db } from '/src/services/firebase-config.js';
import { collection, getDocs } from 'firebase/firestore';

(async function loadCmsContent() {
    // Determine current page path
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    try {
        // Find the matching pageContent document
        const snapshot = await getDocs(collection(db, 'pageContent'));
        let pageData = null;

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.path === currentPath) {
                pageData = data;
            }
        });

        if (!pageData || !pageData.sections) {
            console.log('[CMS] No content found for:', currentPath);
            return;
        }

        const sections = pageData.sections;

        // Apply each section to matching DOM elements
        sections.forEach(section => {
            const { key, type, value } = section;

            if (type === 'text' || type === 'richtext') {
                // Find all elements with data-cms="key"
                const elements = document.querySelectorAll(`[data-cms="${key}"]`);
                elements.forEach(el => {
                    if (type === 'text') {
                        el.textContent = value;
                    } else {
                        // For richtext, preserve line breaks as <br>
                        el.innerHTML = value.replace(/\n/g, '<br>');
                    }
                });
            }

            if (type === 'list') {
                // Find list container
                const container = document.querySelector(`[data-cms-list="${key}"]`);
                if (!container || !Array.isArray(value)) return;

                // Check for a template
                const template = document.querySelector(`template[data-cms-template="${key}"]`);

                if (template) {
                    // Use template-based rendering
                    container.innerHTML = '';
                    value.forEach(item => {
                        const clone = template.content.cloneNode(true);
                        // Replace placeholders like {{title}}, {{description}}, etc.
                        const html = clone.firstElementChild.outerHTML.replace(
                            /\{\{(\w+)\}\}/g,
                            (_, field) => item[field] || ''
                        );
                        container.insertAdjacentHTML('beforeend', html);
                    });
                } else {
                    // Simple list rendering (just titles as bullet points)
                    container.innerHTML = value.map(item => {
                        if (item.title && item.description) {
                            return `<li><strong>${item.title}</strong>: ${item.description}</li>`;
                        }
                        return `<li>${item.title || JSON.stringify(item)}</li>`;
                    }).join('');
                }
            }
        });

        console.log(`[CMS] Content loaded for: ${pageData.name} (${sections.length} sections)`);
    } catch (error) {
        console.warn('[CMS] Failed to load content:', error.message);
        // Silently fail — page will show its static HTML content
    }
})();
