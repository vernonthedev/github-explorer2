/**
 * Repository Finder - Locates and validates repository containers and items
 */

export class RepositoryFinder {
  constructor() {
    this.processedContainers = new Set();
  }

  findRepositoryContainers() {
    const selectors = [
      '#user-repositories-list',
      '#org-repositories-list', 
      '[data-testid="repository-list-container"]',
      '[data-filterable-for="your-repos-filter"]',
      '[data-filterable-for="org-repos-filter"]',
      '.js-repo-list',
      'ul[data-test-selector="profile-repository-list"]',
      'div[aria-label="Repositories"]',
      // Org page specific selectors
      'div[data-test-selector="org-repositories-list"]',
      '[data-test-selector="org-repo-list"]'
    ];

    const containers = [];
    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (el && !this.processedContainers.has(el) && this.isValidRepositoryContainer(el)) {
            containers.push(el);
            this.processedContainers.add(el);
          }
        });
      } catch (e) {
        console.warn(`[RepositoryFinder] Invalid selector: ${selector}`);
      }
    });

    console.log(`[RepositoryFinder] Found ${containers.length} repository containers`);
    return containers;
  }

  isValidRepositoryContainer(container) {
    // Check if container has repository items
    const repoItems = this.findRepositoryItems(container);
    return repoItems.length > 0;
  }

  findRepositoryItems(container) {
    const itemSelectors = [
      '[itemprop="owns"]',
      '[data-testid="repository-list-item"]',
      '.repo-list-item',
      '.public',
      '.private',
      '.source',
      '.fork',
      '.archived',
      'li[itemprop="owns"]',
      'div[data-testid="repository-item"]',
      // Org page specific selectors
      'li[data-test-selector="repository-list-item"]',
      'div[data-test-selector="repository-list-item"]',
      '.Box-row', // GitHub uses Box-row for repo items on org pages
      'li[itemprop="codeRepository"]',
      'div[itemprop="codeRepository"]'
    ];

    let items = [];
    itemSelectors.forEach(selector => {
      try {
        const found = container.querySelectorAll(selector);
        found.forEach(item => {
          const nameElement = item.querySelector('h3 a, a[itemprop="name codeRepository"], .wb-break-all a, [data-testid="repository-name"], [itemprop="name"], .Link--primary');
          if (nameElement && !items.includes(item)) {
            items.push(item);
          }
        });
      } catch (e) {
        console.warn(`[RepositoryFinder] Invalid item selector: ${selector}`);
      }
    });

    return items;
  }

  getRepositoryName(item) {
    const nameSelectors = [
      'h3 a',
      'a[itemprop="name codeRepository"]',
      '.wb-break-all a',
      '[data-testid="repository-name"]',
      '[itemprop="name"]',
      '.Link--primary',
      'a[href*="/"][title]'
    ];

    for (const selector of nameSelectors) {
      const element = item.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }
    return '';
  }

  clearProcessedCache() {
    this.processedContainers.clear();
  }
}