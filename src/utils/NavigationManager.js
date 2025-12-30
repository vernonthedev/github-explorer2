/**
 * Navigation Manager - Handles SPA navigation and page changes.
 */

class NavigationManager {
  /**
   * Create navigation manager instance.
   * @param {Function} onNavigationChange - Navigation change handler.
   */
  constructor(onNavigationChange) {
    this.onNavigationChange = onNavigationChange;
    this.currentUrl = window.location.href;
    this.observer = null;
  }

  /**
   * Initialize navigation manager.
   */
  init() {
    this.setupNavigationListener();
  }

  /**
   * Setup navigation listener for SPA changes.
   */
  setupNavigationListener() {
    this.observer = new MutationObserver(() => {
      if (window.location.href !== this.currentUrl) {
        this.currentUrl = window.location.href;
        console.log('[NavigationManager] URL changed to:', this.currentUrl);
        
        setTimeout(() => {
          this.onNavigationChange();
        }, 500);
      }
    });

    this.observer.observe(document.body, { 
      subtree: true, 
      childList: true 
    });
  }

  /**
   * Destroy navigation manager and cleanup listeners.
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  /**
   * Get current URL.
   * @returns {string} Current URL.
   */
  getCurrentUrl() {
    return this.currentUrl;
  }
}

module.exports = NavigationManager;