/**
 * GitHub Explorer2
 * @author vernonthedev
 * @version 1.0
 * 
 * This script reskins GitHub's interface to look like GitLab while preserving
 * all native functionality through careful DOM manipulation.

 * 
 * Key Design Principles:
 * 1. Never destroy and recreate DOM elements - always move existing nodes
 * 2. Use MutationObserver for SPA navigation detection
 * 3. Preserve React event listeners by maintaining original DOM structure
 * 4. Implement proper cleanup to prevent memory leaks
 */

class GitLabifier {
  constructor() {
    this.observer = null;
    this.repoContainer = null;
    this.isProcessing = false;
    this.init();
  }

  /**
   * Initialize the GitLabifier
   */
  init() {
    console.log('GitHub Explorer - GitLab Theme initialized');

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  /**
   * Set up observers and initial processing
   */
  setup() {
    this.setupMutationObserver();
    this.processRepositories();
  }

  /**
   * Set up MutationObserver to detect SPA navigation changes
   * This is crucial for GitHub's React-based navigation
   */
  setupMutationObserver() {
    // Observe the entire body for DOM changes
    this.observer = new MutationObserver((mutations) => {
      // Debounce rapid mutations to prevent performance issues
      if (this.isProcessing) return;

      let shouldProcess = false;

      mutations.forEach((mutation) => {
        // Check if repository-related elements were added
        const addedNodes = Array.from(mutation.addedNodes);

        if (addedNodes.some(node => {
          // Check if the node or its children contain repository lists
          return node.nodeType === Node.ELEMENT_NODE && (
            node.matches?.('[data-testid="repository-list-item"]') ||
            node.matches?.('#user-repositories-list') ||
            node.querySelector?.('[data-testid="repository-list-item"]') ||
            node.querySelector?.('#user-repositories-list')
          );
        })) {
          shouldProcess = true;
        }
      });

      if (shouldProcess) {
        // Debounce the processing to handle rapid mutations
        setTimeout(() => this.processRepositories(), 100);
      }
    });

    // Start observing with configuration for performance
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false, // Don't observe attributes for better performance
      characterData: false // Don't observe text changes
    });
  }

  /**
   * Find and process repository containers
   */
  processRepositories() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // Multiple selectors to catch GitHub's various container patterns
      const possibleSelectors = [
        '#user-repositories-list',
        '[data-filterable-for="your-repos-filter"]',
        '.repo-list',
        '[data-testid="repository-list"]'
      ];

      for (const selector of possibleSelectors) {
        const container = document.querySelector(selector);
        if (container && !container.dataset.processed) {
          this.repoContainer = container;
          this.groupRepositories(container);
          break; // Process only the first found container
        }
      }
    } catch (error) {
      console.error('Error processing repositories:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Group repositories by naming convention
   * Logic: Everything before the first hyphen (-) is the group name
   * If no hyphen exists, group as "General"
   * 
   * @param {HTMLElement} container - The repository list container
   */
  groupRepositories(container) {
    const repoItems = this.findRepositoryItems(container);

    if (repoItems.length === 0) {
      container.dataset.processed = 'true';
      return;
    }

    // Group repositories by naming convention
    const groups = this.extractGroups(repoItems);

    // Clear container but preserve original structure
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // Rebuild container with grouped structure
    Object.entries(groups).sort().forEach(([groupName, repos]) => {
      const groupElement = this.createGroupElement(groupName, repos);
      container.appendChild(groupElement);
    });

    // Mark as processed to prevent infinite loops
    container.dataset.processed = 'true';
  }

  /**
   * Find all repository items within a container
   * Uses multiple selectors to handle GitHub's varying DOM structure
   * 
   * @param {HTMLElement} container - The container to search within
   * @returns {HTMLElement[]} Array of repository elements
   */
  findRepositoryItems(container) {
    const selectors = [
      '[data-testid="repository-list-item"]',
      '.public',
      '.Private',
      '.repo-list-item'
    ];

    const items = [];

    selectors.forEach(selector => {
      const elements = Array.from(container.querySelectorAll(selector));
      items.push(...elements);
    });

    // Remove duplicates and filter valid items
    return [...new Set(items)].filter(item => {
      // Ensure the item has a repository name
      const nameLink = item.querySelector('a[href*="/"]');
      return nameLink && nameLink.textContent.trim();
    });
  }

  /**
   * Extract groups from repository items based on naming convention
   * 
   * @param {HTMLElement[]} repoItems - Array of repository elements
   * @returns {Object} Groups object with group names as keys
   */
  extractGroups(repoItems) {
    const groups = {};

    repoItems.forEach(item => {
      const nameLink = item.querySelector('a[href*="/"]');
      if (!nameLink) return;

      const repoName = nameLink.textContent.trim();
      const groupName = this.extractGroupName(repoName);

      if (!groups[groupName]) {
        groups[groupName] = [];
      }

      // CRITICAL: Move the existing DOM node, don't recreate it
      // This preserves all React event listeners and functionality
      groups[groupName].push(item);
    });

    return groups;
  }

  /**
   * Extract group name from repository name
   * Logic: Everything before the first hyphen (-) is the group name
   * If no hyphen exists, use "General"
   * 
   * @param {string} repoName - The repository name
   * @returns {string} The group name
   */
  extractGroupName(repoName) {
    const hyphenIndex = repoName.indexOf('-');

    if (hyphenIndex > 0) {
      // Return text before first hyphen, trim whitespace
      return repoName.substring(0, hyphenIndex).trim();
    }

    return 'General';
  }

  /**
   * Create a group element with header and container
   * 
   * @param {string} groupName - The name of the group
   * @param {HTMLElement[]} repositories - Array of repository elements
   * @returns {HTMLElement} Complete group element
   */
  createGroupElement(groupName, repositories) {
    // Create group fragment for efficient DOM manipulation
    const fragment = document.createDocumentFragment();

    // Create group header
    const header = document.createElement('div');
    header.className = 'repo-group-header';
    header.textContent = groupName;
    fragment.appendChild(header);

    // Create group container for repositories
    const container = document.createElement('div');
    container.className = 'repo-group-container';

    // CRITICAL: Move existing DOM nodes, don't clone or recreate
    // This preserves GitHub's React functionality and event listeners
    repositories.forEach(repo => {
      // Remove from current position before appending
      if (repo.parentNode) {
        repo.parentNode.removeChild(repo);
      }
      container.appendChild(repo);
    });

    fragment.appendChild(container);
    return fragment;
  }

  /**
   * Clean up resources when the extension is disabled
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Remove processed markers to allow reprocessing
    document.querySelectorAll('[data-processed]').forEach(el => {
      delete el.dataset.processed;
    });
  }
}

// Initialize the extension when the script loads
// Use a self-executing function to avoid global namespace pollution
(() => {
  let gitLabifier = null;

  // Initialize on first load
  const initExtension = () => {
    if (!gitLabifier) {
      gitLabifier = new GitLabifier();
    }
  };

  // Clean up when page unloads
  const cleanup = () => {
    if (gitLabifier) {
      gitLabifier.destroy();
      gitLabifier = null;
    }
  };

  // Initialize immediately if DOM is ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExtension);
  } else {
    initExtension();
  }

  // Clean up on page unload
  window.addEventListener('beforeunload', cleanup);

  // Also handle GitHub's SPA navigation by observing URL changes
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      // Debounce URL change processing
      setTimeout(() => {
        if (gitLabifier) {
          gitLabifier.processRepositories();
        }
      }, 500);
    }
  }).observe(document, { subtree: true, childList: true });
})();