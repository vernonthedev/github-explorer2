/**
 * Group Manager - Handles repository grouping logic.
 */

export class GroupManager {
  constructor(customGroups = new Set()) {
    this.customGroups = customGroups;
  }

  /**
   * Extract groups from repository items.
   * @param {Element[]} items - Repository item elements.
   * @returns {Map<string, Element[]>} Map of group names to repository items.
   */
  extractGroups(items) {
    const groups = new Map();

    items.forEach(item => {
      const repoName = this.getRepositoryName(item);
      const groupName = this.getGroupName(repoName);

      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }
      groups.get(groupName).push(item);
    });

    return groups;
  }

  /**
   * Get group name for a repository.
   * @param {string} repoName - Repository name.
   * @returns {string} Group name.
   */
  getGroupName(repoName) {
    if (!repoName) return 'General';
    
    for (const customGroup of this.customGroups) {
      if (repoName.toLowerCase().startsWith(customGroup.toLowerCase())) {
        return customGroup;
      }
    }

    const separators = ['-', '_', '/', '.', ' '];
    for (const sep of separators) {
      const index = repoName.indexOf(sep);
      if (index > 0) {
        const prefix = repoName.substring(0, index).toLowerCase();
        if (prefix.length >= 2) {
          return prefix.charAt(0).toUpperCase() + prefix.slice(1);
        }
      }
    }

    return 'General';
  }

  /**
   * Extract repository name from item element.
   * @param {Element} item - Repository item element.
   * @returns {string} Repository name.
   */
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

  /**
   * Get icon for a group name.
   * @param {string} groupName - Group name.
   * @returns {string} SVG icon HTML.
   */
  getGroupIcon(groupName) {
    const iconMap = {
      'All Repositories': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
      'General': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>',
      'Web': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>',
      'Api': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
      'Mobile': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>',
      'Backend': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>',
      'Frontend': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>',
      'Default': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>'
    };

    return iconMap[groupName] || iconMap['Default'];
  }

  /**
   * Update custom groups set.
   * @param {Set<string>} newGroups - New custom groups.
   */
  updateCustomGroups(newGroups) {
    this.customGroups = new Set(newGroups);
  }
}