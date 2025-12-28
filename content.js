/**
 * GitHub GitLab Dark Theme & Groups Extension
 * @author vernonthedev
 * @description Transforms GitHub to GitLab's dark theme with intelligent repository grouping and dropdown management.
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
    this.darkMode = true; // Default to dark mode
    this.db = null;
    this.init();
  }

  async init() {
    await this.initStorage();
    await this.loadSettings();
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.run());
    } else {
      this.run();
    }
    setTimeout(() => this.run(), 1000);
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
    this.darkMode = await this.loadSetting('darkMode', true);
    this.groupingEnabled = await this.loadSetting('groupingEnabled', true);
    
    const customGroups = await this.loadSetting('customGroups', []);
    this.customGroups = new Set(customGroups);
    
    console.log('[GitLab Theme] Settings loaded:', { darkMode: this.darkMode, groupingEnabled: this.groupingEnabled });
    
    // Apply theme immediately
    this.applyTheme();
  }

  async saveCustomGroups() {
    await this.saveSetting('customGroups', Array.from(this.customGroups));
  }

  run() {
    this.setupMutationObserver();
    this.addGroupControls();
    this.processRepositories();
  }

  applyTheme() {
    if (this.darkMode) {
      document.body.classList.add('gitlab-dark-theme');
    } else {
      document.body.classList.remove('gitlab-dark-theme');
    }
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
          this.processRepositories();
          this.addGroupControls();
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
          if (el && !el.dataset.gitlabProcessed) {
            containers.push(el);
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
      const containers = this.findRepositoryContainers();
      
      containers.forEach(container => {
        const items = this.findRepositoryItems(container);
        
        if (items.length > 0) {
          if (this.groupingEnabled) {
            this.createDropdownGroups(container, items);
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

  createDropdownGroups(container, items) {
    const groups = this.extractGroups(items);
    
    if (groups.size <= 1) {
      this.displayAllRepos(container, items);
      return;
    }

    const fragment = document.createDocumentFragment();
    
    // Create dropdown
    const dropdownContainer = this.createGroupDropdown(groups, container);
    fragment.appendChild(dropdownContainer);

    // Create repo container for filtered items
    const repoContainer = document.createElement(container.tagName);
    repoContainer.className = container.className;
    repoContainer.classList.add('gitlab-filtered-repos');
    repoContainer.style.cssText = container.style.cssText;

    items.forEach(item => {
      repoContainer.appendChild(item);
    });

    fragment.appendChild(repoContainer);

    // Preserve non-repo items
    const nonRepoItems = Array.from(container.children).filter(child => 
      !items.includes(child) && 
      !child.classList.contains('gitlab-dropdown-section')
    );

    nonRepoItems.forEach(item => fragment.appendChild(item));

    container.innerHTML = '';
    container.appendChild(fragment);
    container.classList.add('gitlab-grouped-repositories');
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

  createGroupDropdown(groups, container) {
    const dropdownSection = document.createElement('div');
    dropdownSection.className = 'gitlab-dropdown-section';

    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'gitlab-dropdown-container';

    const dropdown = document.createElement('select');
    dropdown.className = 'gitlab-group-dropdown';
    dropdown.innerHTML = `
      <option value="all">All Repositories (${Array.from(groups.values()).flat().length})</option>
      ${Array.from(groups.entries()).map(([name, items]) => 
        `<option value="${name}">${name} (${items.length})</option>`
      ).join('')}
    `;

    dropdown.addEventListener('change', (e) => {
      this.filterRepositories(container, e.target.value, groups);
    });

    dropdownContainer.appendChild(dropdown);

    const manageBtn = document.createElement('button');
    manageBtn.className = 'gitlab-manage-dropdown-btn';
    manageBtn.textContent = '⚙️';
    manageBtn.title = 'Manage Groups';
    manageBtn.onclick = () => this.showGroupManager();

    dropdownContainer.appendChild(manageBtn);
    dropdownSection.appendChild(dropdownContainer);

    return dropdownSection;
  }

  filterRepositories(container, selectedGroup, groups) {
    const repoContainer = container.querySelector('.gitlab-filtered-repos');
    if (!repoContainer) return;

    const allItems = Array.from(groups.values()).flat();
    
    allItems.forEach(item => {
      if (selectedGroup === 'all') {
        item.style.display = '';
      } else {
        const repoName = this.getRepositoryName(item);
        const groupName = this.getGroupName(repoName);
        item.style.display = groupName === selectedGroup ? '' : 'none';
      }
    });
  }

  displayAllRepos(container, items) {
    const fragment = document.createDocumentFragment();
    
    items.forEach(item => {
      fragment.appendChild(item);
    });

    // Preserve non-repo items
    const nonRepoItems = Array.from(container.children).filter(child => 
      !items.includes(child) && 
      !child.classList.contains('gitlab-dropdown-section')
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

    const themeToggle = document.createElement('button');
    themeToggle.className = 'gitlab-control-btn gitlab-theme-btn';
    themeToggle.textContent = this.darkMode ? '🌞' : '🌙';
    themeToggle.title = this.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    themeToggle.onclick = async () => {
      this.darkMode = !this.darkMode;
      await this.saveSetting('darkMode', this.darkMode);
      themeToggle.textContent = this.darkMode ? '🌞' : '🌙';
      themeToggle.title = this.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';
      this.applyTheme();
    };

    const toggleGrouping = document.createElement('button');
    toggleGrouping.className = 'gitlab-control-btn';
    toggleGrouping.textContent = this.groupingEnabled ? '📁 Disable Groups' : '📂 Enable Groups';
    toggleGrouping.onclick = async () => {
      this.groupingEnabled = !this.groupingEnabled;
      await this.saveSetting('groupingEnabled', this.groupingEnabled);
      toggleGrouping.textContent = this.groupingEnabled ? '📁 Disable Groups' : '📂 Enable Groups';
      this.processRepositories();
    };

    const manageGroups = document.createElement('button');
    manageGroups.className = 'gitlab-control-btn gitlab-manage-btn';
    manageGroups.textContent = '⚙️ Manage Groups';
    manageGroups.onclick = () => this.showGroupManager();

    controls.appendChild(themeToggle);
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
        <h3>📁 Manage Repository Groups</h3>
        <div class="gitlab-manager-body">
          <div class="gitlab-group-list">
            <h4>Current Custom Groups</h4>
            <div id="custom-groups-list">
              ${Array.from(this.customGroups).map(group => `
                <div class="gitlab-group-item">
                  <span>${group}</span>
                  <button class="gitlab-remove-group" data-group="${group}">❌</button>
                </div>
              `).join('')}
              ${this.customGroups.size === 0 ? '<p class="gitlab-no-groups">No custom groups yet</p>' : ''}
            </div>
          </div>
          <div class="gitlab-add-group">
            <h4>Add New Group</h4>
            <input type="text" id="new-group-name" placeholder="Enter group name..." />
            <button id="add-group-btn">➕ Add Group</button>
          </div>
        </div>
        <div class="gitlab-manager-footer">
          <button id="close-manager-btn">✅ Close</button>
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
        this.processRepositories();
      }
    };

    document.querySelectorAll('.gitlab-remove-group').forEach(btn => {
      btn.onclick = async () => {
        const group = btn.dataset.group;
        this.customGroups.delete(group);
        await this.saveCustomGroups();
        this.showGroupManager();
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

new GitHubGitLabTheme();