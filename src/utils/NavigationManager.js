/**
 * Navigation Manager - Handles SPA navigation and page changes
 */

export class NavigationManager {
  constructor(onNavigationChange) {
    this.onNavigationChange = onNavigationChange;
    this.currentUrl = window.location.href;
    this.observer = null;
  }

  init() {
    this.setupNavigationListener();
  }

  setupNavigationListener() {
    // Listen for URL changes (GitHub is an SPA)
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

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  getCurrentUrl() {
    return this.currentUrl;
  }
}