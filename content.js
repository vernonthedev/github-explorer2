/**
 * GitHub GitLab Dark Theme & Groups Extension
 * @author vernonthedev
 * @description Transforms GitHub to GitLab's dark theme with intelligent repository grouping and card-based management.
 */

// Import Dexie for IndexedDB storage
const Dexie = window.Dexie;

class GitHubGitLabTheme {
  constructor() {
    this.observer = null;
    this.isProcessing = false;
    this.debounceTimer = null;
    this.groups = new Map();
    this.customGroups = new Set();
    this.groupingEnabled = true;
    this.darkMode = true; // Always dark mode
    this.db = null;
    this.currentActiveGroup = null;
    this.processedContainers = new Set();
    this.init();
  }

  async init() {
    // Apply dark theme immediately to prevent flash
    this.applyDarkTheme();
    
    await this.initStorage();
    await this.loadSettings();
    
    // Process immediately if DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.run());
    } else {
      this.run();
    }
    
    // Process again after a delay for dynamic content
    setTimeout(() => this.run(), 1000);
    
    // Listen for SPA navigation
    this.setupNavigationListener();
  }

  setupNavigationListener() {
    // Listen for URL changes (GitHub is an SPA)
    let currentUrl = window.location.href;
    new MutationObserver(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        console.log('[GitLab Theme] URL changed to:', currentUrl);
        setTimeout(() => {
          this.processedContainers.clear(); // Clear cache
          this.run();
        }, 500);
      }
    }).observe(document, { subtree: true, childList: true });
  }

  applyDarkTheme() {
    // Apply dark theme immediately and ensure it stays applied
    document.body.classList.add('gitlab-dark-theme');
    
    // Also apply to html element
    document.documentElement.classList.add('gitlab-dark-theme');
    
    // Force dark mode with CSS if needed
    if (!document.querySelector('#gitlab-dark-theme-forcer')) {
      const style = document.createElement('style');
      style.id = 'gitlab-dark-theme-forcer';
      style.textContent = `
        body, html { background-color: #0d0e11 !important; }
        .gitlab-dark-theme { background-color: #0d0e11 !important; }
      `;
      document.head.appendChild(style);
    }
  }

  async initStorage() {
    try {
      // Initialize Dexie database
      this.db = new Dexie('GitHubGitLabThemeDB');
      this.db.version(1).stores({
        settings: '++id, key, value',
        groups: '++id, name, created'
      });

      console.log('[GitLab Theme] IndexedDB initialized successfully');
    } catch (error) {
      console.error('[GitLab Theme] Failed to initialize IndexedDB:', error);
      this.initFallbackStorage();
    }
  }

  initFallbackStorage() {
    // Fallback to localStorage and cookies
    console.log('[GitLab Theme] Using fallback storage');
  }

  async saveSetting(key, value) {
    try {
      if (this.db) {
        await this.db.settings.where('key').equals(key).delete();
        await this.db.settings.add({ key, value });
      }
      
      // Fallback to localStorage
      localStorage.setItem(`gitlab_theme_${key}`, JSON.stringify(value));
      
      // Fallback to cookie
      this.setCookie(`gitlab_theme_${key}`, JSON.stringify(value), 365);
      
      console.log(`[GitLab Theme] Saved setting: ${key}`);
    } catch (error) {
      console.error('[GitLab Theme] Failed to save setting:', error);
      this.saveSettingFallback(key, value);
    }
  }

  async loadSetting(key, defaultValue = null) {
    try {
      if (this.db) {
        const setting = await this.db.settings.where('key').equals(key).first();
        if (setting) return setting.value;
      }
      
      // Try localStorage
      const localValue = localStorage.getItem(`gitlab_theme_${key}`);
      if (localValue) return JSON.parse(localValue);
      
      // Try cookie
      const cookieValue = this.getCookie(`gitlab_theme_${key}`);
      if (cookieValue) return JSON.parse(cookieValue);
      
      return defaultValue;
    } catch (error) {
      console.error('[GitLab Theme] Failed to load setting:', error);
      return defaultValue;
    }
  }

  saveSettingFallback(key, value) {
    try {
      localStorage.setItem(`gitlab_theme_${key}`, JSON.stringify(value));
      this.setCookie(`gitlab_theme_${key}`, JSON.stringify(value), 365);
    } catch (error) {
      console.error('[GitLab Theme] Fallback storage failed:', error);
    }
  }

  setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  async loadSettings() {
    this.groupingEnabled = await this.loadSetting('groupingEnabled', true);
    
    const customGroups = await this.loadSetting('customGroups', []);
    this.customGroups = new Set(customGroups);
    
    console.log('[GitLab Theme] Settings loaded:', { groupingEnabled: this.groupingEnabled });
    
    // Ensure dark theme is always applied
    this.applyDarkTheme();
  }

  async saveCustomGroups() {
    await this.saveSetting('customGroups', Array.from(this.customGroups));
  }

  run() {
    // Apply dark theme first
    this.applyDarkTheme();
    
    // Setup observer for dynamic content
    this.setupMutationObserver();
    
    // Add controls and process repositories
    this.addGroupControls();
    this.processRepositories();
  }

  setupMutationObserver() {
    if (this.observer) this.observer.disconnect();

    this.observer = new MutationObserver((mutations) => {
      if (this.isProcessing) return;

      let shouldProcess = false;
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldProcess = true;
          break;
        }
      }

      if (shouldProcess) {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.addGroupControls();
          this.processRepositories();
        }, 300);
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  findRepositoryContainers() {
    const selectors = [
      '#user-repositories-list',
      '#org-repositories-list', 
      '[data-testid="repository-list-container"]',
      '.repo-list',
      '[data-filterable-for="your-repos-filter"]',
      '.js-repo-list',
      'ul[data-test-selector="profile-repository-list"]',
      'div[aria-label="Repositories"]'
    ];

    const containers = [];
    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (el && !this.processedContainers.has(el)) {
            containers.push(el);
            this.processedContainers.add(el);
          }
        });
      } catch (e) {
        console.warn(`[GitLab Theme] Invalid selector: ${selector}`);
      }
    });

    return containers;
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
      'div[data-testid="repository-item"]'
    ];

    let items = [];
    itemSelectors.forEach(selector => {
      try {
        const found = container.querySelectorAll(selector);
        found.forEach(item => {
          const nameElement = item.querySelector('h3 a, a[itemprop="name codeRepository"], .wb-break-all a, [data-testid="repository-name"]');
          if (nameElement && !items.includes(item)) {
            items.push(item);
          }
        });
      } catch (e) {
        console.warn(`[GitLab Theme] Invalid item selector: ${selector}`);
      }
    });

    return items;
  }

  processRepositories() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // Always apply dark theme
      this.applyDarkTheme();
      
      const containers = this.findRepositoryContainers();
      
      containers.forEach(container => {
        const items = this.findRepositoryItems(container);
        
        if (items.length > 0) {
          if (this.groupingEnabled) {
            this.createGroupCards(container, items);
          } else {
            this.displayAllRepos(container, items);
          }
          container.dataset.gitlabProcessed = 'true';
        }
      });

    } catch (e) {
      console.error('[GitLab Theme] Error processing repositories:', e);
    } finally {
      this.isProcessing = false;
    }
  }

  createGroupCards(container, items) {
    const groups = this.extractGroups(items);
    
    if (groups.size <= 1) {
      this.displayAllRepos(container, items);
      return;
    }

    // Clear existing content
    container.innerHTML = '';
    container.classList.add('gitlab-grouped-repositories');

    const fragment = document.createDocumentFragment();
    
    // Create group cards section
    const groupCardsSection = this.createGroupCardsSection(groups, container);
    fragment.appendChild(groupCardsSection);

    // Create hidden repo containers for each group
    const repoContainersSection = this.createRepoContainers(groups, container);
    fragment.appendChild(repoContainersSection);

    container.appendChild(fragment);

    // Show the first group by default
    const firstGroup = Array.from(groups.keys())[0];
    console.log(`[GitLab Theme] Auto-showing first group: ${firstGroup}`);
    
    // Wait a bit for DOM to settle, then simulate first group click
    setTimeout(() => {
      console.log(`[GitLab Theme] Attempting to show first group...`);
      const firstCard = container.querySelector(`.gitlab-group-card[data-group-id="${firstGroup}"]`);
      if (firstCard) {
        console.log(`[GitLab Theme] Found first group card, simulating click`);
        firstCard.click();
      } else {
        console.error(`[GitLab Theme] Could not find first group card: ${firstGroup}`);
        console.log(`[GitLab Theme] Available cards:`, container.querySelectorAll('.gitlab-group-card'));
      }
    }, 200);
  }

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

  createGroupCardsSection(groups, container) {
    const section = document.createElement('div');
    section.className = 'gitlab-cards-section';

    const containerDiv = document.createElement('div');
    containerDiv.className = 'gitlab-group-cards-container';

    // Add "All Repositories" card
    const allReposCard = this.createGroupCard('All Repositories', Array.from(groups.values()).flat(), 'all');
    containerDiv.appendChild(allReposCard);

    // Add group cards
    Array.from(groups.entries()).forEach(([name, items]) => {
      const card = this.createGroupCard(name, items, name);
      containerDiv.appendChild(card);
    });

    section.appendChild(containerDiv);
    return section;
  }

  createGroupCard(name, items, groupId) {
    const card = document.createElement('div');
    card.className = 'gitlab-group-card';
    card.dataset.groupId = groupId;

    const cardHeader = document.createElement('div');
    cardHeader.className = 'gitlab-card-header';

    const icon = document.createElement('div');
    icon.className = 'gitlab-card-icon';
    icon.innerHTML = this.getGroupIcon(name);

    const titleCount = document.createElement('div');
    titleCount.className = 'gitlab-card-title-count';

    const title = document.createElement('h4');
    title.className = 'gitlab-card-title';
    title.textContent = name;

    const count = document.createElement('span');
    count.className = 'gitlab-card-count';
    count.textContent = `${items.length}`;

    titleCount.appendChild(title);
    titleCount.appendChild(count);
    
    cardHeader.appendChild(icon);
    cardHeader.appendChild(titleCount);

    card.appendChild(cardHeader);

    // Make card clickable
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log(`[GitLab Theme] Clicked group: ${groupId}`);
      console.log(`[GitLab Theme] Clicked card:`, card);
      
      // Find the grouped repositories container
      const groupedContainer = card.closest('.gitlab-grouped-repositories') || 
                            card.parentElement.closest('.gitlab-grouped-repositories') ||
                            document.querySelector('.gitlab-grouped-repositories');
      
      console.log(`[GitLab Theme] Found grouped container:`, groupedContainer);
      
      if (groupedContainer) {
        this.showGroupRepos(groupId, groupedContainer);
      } else {
        console.error(`[GitLab Theme] Could not find grouped repositories container`);
        // Try to find any container with gitlab-grouped-repositories class
        const allGroupedContainers = document.querySelectorAll('.gitlab-grouped-repositories');
        console.log(`[GitLab Theme] Available grouped containers:`, allGroupedContainers);
        if (allGroupedContainers.length > 0) {
          this.showGroupRepos(groupId, allGroupedContainers[0]);
        }
      }
    });

    return card;
  }

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

    return iconMap[name] || iconMap['Default'];
  }

  createRepoContainers(groups, container) {
    const section = document.createElement('div');
    section.className = 'gitlab-repos-section';

    // Create container for "All Repositories"
    const allReposContainer = document.createElement(container.tagName);
    allReposContainer.className = container.className;
    allReposContainer.classList.add('gitlab-repo-container');
    allReposContainer.dataset.groupId = 'all';
    allReposContainer.style.display = 'none';

    Array.from(groups.values()).flat().forEach(item => {
      allReposContainer.appendChild(item.cloneNode(true));
    });

    section.appendChild(allReposContainer);

    // Create containers for each group
    Array.from(groups.entries()).forEach(([name, items]) => {
      const groupContainer = document.createElement(container.tagName);
      groupContainer.className = container.className;
      groupContainer.classList.add('gitlab-repo-container');
      groupContainer.dataset.groupId = name;
      groupContainer.style.display = 'none';

      items.forEach(item => {
        groupContainer.appendChild(item);
      });

      section.appendChild(groupContainer);
    });

    return section;
  }

  showGroupRepos(groupId, container) {
    console.log(`[GitLab Theme] Showing repos for group: ${groupId}`);
    console.log(`[GitLab Theme] Container:`, container);
    
    // Find the repos section within the grouped container
    const reposSection = container.querySelector('.gitlab-repos-section');
    console.log(`[GitLab Theme] Repos section:`, reposSection);
    
    if (!reposSection) {
      console.error(`[GitLab Theme] Repos section not found!`);
      return;
    }
    
    // Hide all repo containers
    const allContainers = reposSection.querySelectorAll('.gitlab-repo-container');
    console.log(`[GitLab Theme] Found ${allContainers.length} repo containers:`, allContainers);
    
    allContainers.forEach((cont, index) => {
      cont.style.display = 'none';
      console.log(`[GitLab Theme] Hiding container ${index} (data-group-id: ${cont.dataset.groupId})`);
    });

    // Show selected container
    const selectedContainer = reposSection.querySelector(`.gitlab-repo-container[data-group-id="${groupId}"]`);
    if (selectedContainer) {
      selectedContainer.style.display = 'block';
      console.log(`[GitLab Theme] Found and showing container for ${groupId} with ${selectedContainer.children.length} items`);
      console.log(`[GitLab Theme] Container children:`, selectedContainer.children);
      
      // Ensure repository items are visible
      Array.from(selectedContainer.children).forEach((child, index) => {
        child.style.display = '';
        console.log(`[GitLab Theme] Making repo ${index} visible:`, child);
      });
    } else {
      console.error(`[GitLab Theme] Container not found for group: ${groupId}`);
      console.log(`[GitLab Theme] Available group IDs in repos section:`, 
        Array.from(reposSection.querySelectorAll('.gitlab-repo-container')).map(c => c.dataset.groupId));
    }

    // Update active card styling
    const allCards = container.querySelectorAll('.gitlab-group-card');
    console.log(`[GitLab Theme] Found ${allCards.length} group cards`);
    
    allCards.forEach(card => {
      card.classList.remove('active');
    });

    const activeCard = container.querySelector(`.gitlab-group-card[data-group-id="${groupId}"]`);
    if (activeCard) {
      activeCard.classList.add('active');
      console.log(`[GitLab Theme] Active card set for ${groupId}`);
    } else {
      console.error(`[GitLab Theme] Active card not found for group: ${groupId}`);
    }

    this.currentActiveGroup = groupId;
    
    // Scroll to the repos section
    reposSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  displayAllRepos(container, items) {
    const fragment = document.createDocumentFragment();
    
    items.forEach(item => {
      fragment.appendChild(item);
    });

    // Preserve non-repo items
    const nonRepoItems = Array.from(container.children).filter(child => 
      !items.includes(child) && 
      !child.classList.contains('gitlab-cards-section') &&
      !child.classList.contains('gitlab-repos-section')
    );

    nonRepoItems.forEach(item => fragment.appendChild(item));

    container.innerHTML = '';
    container.appendChild(fragment);
  }

  getRepositoryName(item) {
    const nameSelectors = [
      'h3 a',
      'a[itemprop="name codeRepository"]',
      '.wb-break-all a',
      '[data-testid="repository-name"]'
    ];

    for (const selector of nameSelectors) {
      const element = item.querySelector(selector);
      if (element) {
        return element.textContent.trim();
      }
    }
    return '';
  }

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

  addGroupControls() {
    const existingControls = document.querySelector('.gitlab-group-controls');
    if (existingControls) return;

    const repoSections = [
      '#user-repositories-list',
      '#org-repositories-list',
      '[data-testid="repository-list-container"]'
    ];

    for (const selector of repoSections) {
      const container = document.querySelector(selector);
      if (container && !container.previousElementSibling?.classList.contains('gitlab-group-controls')) {
        const controls = this.createGroupControls();
        container.parentNode.insertBefore(controls, container);
        break;
      }
    }
  }

  createGroupControls() {
    const controls = document.createElement('div');
    controls.className = 'gitlab-group-controls';

    const toggleGrouping = document.createElement('button');
    toggleGrouping.className = 'gitlab-control-btn';
    toggleGrouping.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> Disable';
    toggleGrouping.onclick = async () => {
      this.groupingEnabled = !this.groupingEnabled;
      await this.saveSetting('groupingEnabled', this.groupingEnabled);
      toggleGrouping.innerHTML = this.groupingEnabled ? 
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> Disable' : 
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg> Enable';
      this.processedContainers.clear();
      this.processRepositories();
    };

    const manageGroups = document.createElement('button');
    manageGroups.className = 'gitlab-control-btn gitlab-manage-btn';
    manageGroups.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 9.96l4.24 4.24M1 12h6m6 0h6"></path></svg> Manage';
    manageGroups.onclick = () => this.showGroupManager();

    controls.appendChild(toggleGrouping);
    controls.appendChild(manageGroups);

    return controls;
  }

  showGroupManager() {
    const existing = document.querySelector('.gitlab-group-manager');
    if (existing) {
      existing.remove();
      return;
    }

    const manager = document.createElement('div');
    manager.className = 'gitlab-group-manager';
    manager.innerHTML = `
      <div class="gitlab-manager-content">
        <h3>Manage Repository Groups</h3>
        <div class="gitlab-manager-body">
          <div class="gitlab-group-list">
            <h4>Current Custom Groups</h4>
            <div id="custom-groups-list">
              ${Array.from(this.customGroups).map(group => `
                <div class="gitlab-group-item">
                  <span>${group}</span>
                  <button class="gitlab-remove-group" data-group="${group}"></button>
                </div>
              `).join('')}
              ${this.customGroups.size === 0 ? '<p class="gitlab-no-groups">No custom groups yet</p>' : ''}
            </div>
          </div>
          <div class="gitlab-add-group">
            <h4>Add New Group</h4>
            <input type="text" id="new-group-name" placeholder="Enter group name..." />
            <button id="add-group-btn">Add Group</button>
          </div>
        </div>
        <div class="gitlab-manager-footer">
          <button id="close-manager-btn">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(manager);

    document.getElementById('close-manager-btn').onclick = () => manager.remove();
    
    document.getElementById('add-group-btn').onclick = async () => {
      const input = document.getElementById('new-group-name');
      const groupName = input.value.trim();
      
      if (groupName && !this.customGroups.has(groupName)) {
        this.customGroups.add(groupName);
        await this.saveCustomGroups();
        input.value = '';
        this.showGroupManager();
        this.processedContainers.clear();
        this.processRepositories();
      }
    };

    document.querySelectorAll('.gitlab-remove-group').forEach(btn => {
      btn.onclick = async () => {
        const group = btn.dataset.group;
        this.customGroups.delete(group);
        await this.saveCustomGroups();
        this.showGroupManager();
        this.processedContainers.clear();
        this.processRepositories();
      };
    });

    manager.onclick = (e) => {
      if (e.target === manager) {
        manager.remove();
      }
    };
  }
}

// Initialize the extension
new GitHubGitLabTheme();