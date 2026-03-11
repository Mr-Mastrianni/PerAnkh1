/**
 * Per Ankh Shared Footer Component
 * Auto-injects into <pa-footer></pa-footer> placeholder
 */
(function () {
  const footerHTML = `
    <footer class="bg-gray-800 py-12 text-white">
      <div class="container mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 class="text-xl font-bold mb-4 ankh-symbol" style="color: var(--primary-gold, #D4AF37);">PER ANKH ENTHEOGENIC CHURCH</h4>
            <p class="text-gray-300 mb-4">15705 Woodrow Wilson<br>Detroit, Michigan</p>
          </div>
          <div>
            <h4 class="text-lg font-semibold mb-4">Quick Links</h4>
            <ul class="space-y-2">
              <li><a href="/become-a-member" class="text-gray-300 hover:text-yellow-400 transition-colors">Become A Member</a></li>
              <li><a href="/donate" class="text-gray-300 hover:text-yellow-400 transition-colors">Donate</a></li>
              <li><a href="/ceremony-and-safety" class="text-gray-300 hover:text-yellow-400 transition-colors">Useful Resources</a></li>
              <li><a href="/vendor-registration" class="text-gray-300 hover:text-yellow-400 transition-colors">Vendor Registration</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-lg font-semibold mb-4">Social Media</h4>
            <div class="flex space-x-4">
              <a href="https://www.instagram.com/perankh_church" class="w-10 h-10 bg-yellow-500 text-gray-900 rounded-full flex items-center justify-center hover:bg-yellow-400 transition-all transform hover:scale-110" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 1 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://www.facebook.com/profile.php?id=61565651284992" class="w-10 h-10 bg-yellow-500 text-gray-900 rounded-full flex items-center justify-center hover:bg-yellow-400 transition-all transform hover:scale-110" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" class="w-10 h-10 bg-yellow-500 text-gray-900 rounded-full flex items-center justify-center hover:bg-yellow-400 transition-all transform hover:scale-110" aria-label="YouTube">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.12 1 12 1 12s0 3.88.42 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.88 23 12 23 12s0-3.88-.42-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
              </a>
              <a href="#" class="w-10 h-10 bg-yellow-500 text-gray-900 rounded-full flex items-center justify-center hover:bg-yellow-400 transition-all transform hover:scale-110" aria-label="X (Twitter)">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644z"/></svg>
              </a>
            </div>
          </div>
        </div>
        <div class="border-t border-gray-700 mt-8 pt-8 text-center">
          <p class="text-gray-400 mb-2">&copy; ${new Date().getFullYear()} Per Ankh Entheogenic Church. All rights reserved.</p>
          <p class="text-gray-400">
            <a href="/terms" class="hover:text-yellow-400 transition-colors">Terms of Use</a> |
            <a href="/privacy" class="hover:text-yellow-400 transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </footer>
  `;

  function inject() {
    const placeholder = document.querySelector('pa-footer');
    if (placeholder) {
      placeholder.outerHTML = footerHTML;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
