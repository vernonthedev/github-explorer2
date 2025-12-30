/**
 * Page Detector - Determines if current page is a repository page.
 */

export class PageDetector {
  /**
   * Check if current page is a repository listing page.
   * @returns {boolean} True if repository page.
   */
  static isRepositoryPage() {
    const pathname = window.location.pathname;
    
    if (pathname.match(/^\/[^\/]+$/)) {
      const pageHeader = document.querySelector('h1');
      if (pageHeader && pageHeader.textContent.includes('Repositories')) {
        return true;
      }
    }
    
    if (pathname.includes('?tab=repositories')) {
      return true;
    }
    
    if (pathname.includes('/orgs/') && 
        (pathname.includes('/repositories') || 
         document.querySelector('[data-test-selector="org-repositories-list"]'))) {
      return true;
    }
    
    const repoContainers = [
      '#user-repositories-list',
      '#org-repositories-list',
      '[data-testid="repository-list-container"]',
      'div[data-test-selector="org-repositories-list"]'
    ];
    
    return repoContainers.some(selector => document.querySelector(selector));
  }

  /**
   * Check if current page is an organization page.
   * @returns {boolean} True if organization page.
   */
  static isOrganizationPage() {
    return window.location.pathname.includes('/orgs/') || 
           window.location.pathname.match(/^\/[^\/]+$/) && 
           document.querySelector('[data-test-selector="org-header"]');
  }

  /**
   * Get the current page type.
   * @returns {string} Page type: 'organization', 'repository', or 'other'.
   */
  static getPageType() {
    if (this.isOrganizationPage()) {
      return 'organization';
    }
    
    if (this.isRepositoryPage()) {
      return 'repository';
    }
    
    return 'other';
  }
}