/**
 * GitHub GitLab Dark Theme & Groups Extension - Main Entry Point.
 * @author vernonthedev
 * @description Transforms GitHub to GitLab's dark theme with intelligent repository grouping and card-based management.
 */

import { StorageManager } from './storage/StorageManager.js';
import { ThemeManager } from './core/theme/ThemeManager.js';
import { PageDetector } from './utils/PageDetector.js';
import { NavigationManager } from './utils/NavigationManager.js';
import { RepositoryFinder } from './core/repository/RepositoryFinder.js';
import { GroupManager } from './core/repository/GroupManager.js';
import { RepositoryProcessor } from './core/repository/RepositoryProcessor.js';
import { GroupDisplayManager } from './core/repository/GroupDisplayManager.js';
import { GroupControls } from './ui/components/GroupControls.js';
import { GroupManagerModal } from './ui/managers/GroupManagerModal.js';

/**
 * Main extension class that orchestrates all functionality.
 */
class GitHubGitLabTheme {
  constructor() {
    this.storage = new StorageManager();
    this.themeManager = new ThemeManager();
    this.repositoryFinder = new RepositoryFinder();
    this.groupManager = null;
    this.repositoryProcessor = null;
    this.groupDisplayManager = new GroupDisplayManager();
    this.navigationManager = null;
    
    this.isProcessing = false;
    this.debounceTimer = null;
    this.groupingEnabled = true;
    this.customGroups = new Set();
    this.observer = null;
  }

  /**
   * Initialize the extension.
   */
  async init() {
    console.log('[GitHubGitLabTheme] Initializing extension...');
    
    await this.storage.init();
    this.themeManager.init();
    
    await this.loadSettings();
    
    this.groupManager = new GroupManager(this.customGroups);
    this.repositoryProcessor = new RepositoryProcessor(this.groupManager, this.showGroupRepos.bind(this));
    
    this.navigationManager = new NavigationManager(this.handleNavigationChange.bind(this));
    this.navigationManager.init();
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.run());
    } else {
      this.run();
    }
    
    setTimeout(() => this.run(), 1000);
  }

  /**
   * Load user settings from storage.
   */
  async loadSettings() {
    this.groupingEnabled = await this.storage.loadSetting('groupingEnabled', true);
    
    const customGroups = await this.storage.loadSetting('customGroups', []);
    this.customGroups = new Set(customGroups);
    
    console.log('[GitHubGitLabTheme] Settings loaded:', { 
      groupingEnabled: this.groupingEnabled,
      customGroups: Array.from(this.customGroups)
    });
  }

  /**
   * Main run method to process the current page.
   */
  run() {
    if (!PageDetector.isRepositoryPage()) {
      console.log('[GitHubGitLabTheme] Not a repository page, skipping processing');
      return;
    }
    
    this.themeManager.applyDarkTheme();
    
    const pageType = PageDetector.getPageType();
    if (pageType === 'organization') {
      console.log('[GitHubGitLabTheme] Organization page detected');
    }
    
    this.setupMutationObserver();
    this.addGroupControls();
    this.processRepositories();
  }

  /**
   * Setup mutation observer for dynamic content.
   */
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
          if (PageDetector.isRepositoryPage()) {
            this.addGroupControls();
            this.processRepositories();
          }
        }, 300);
      }
    });

    const targetSelectors = [
      '#user-repositories-list',
      '#org-repositories-list',
      '[data-testid="repository-list-container"]',
      'div[data-test-selector="org-repositories-list"]',
      'main[role="main"]'
    ];

    targetSelectors.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        this.observer.observe(element, {
          childList: true,
          subtree: true
        });
      }
    });
  }

  /**
   * Process repository containers and apply grouping.
   */
  processRepositories() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      this.themeManager.applyDarkTheme();
      
      const containers = this.repositoryFinder.findRepositoryContainers();
      
      containers.forEach(container => {
        const items = this.repositoryFinder.findRepositoryItems(container);
        
        if (items.length > 0) {
          if (!container.dataset.gitlabProcessed) {
            if (this.groupingEnabled && this.groupManager) {
              this.repositoryProcessor.createGroupCards(container, items);
            } else {
              this.repositoryProcessor.displayAllRepos(container, items);
            }
            container.dataset.gitlabProcessed = 'true';
          }
        }
      });

    } catch (e) {
      console.error('[GitHubGitLabTheme] Error processing repositories:', e);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Add group controls to the page.
   */
  addGroupControls() {
    const existingControls = document.querySelector('.gitlab-group-controls');
    if (existingControls) return;

    const repoSections = [
      '#user-repositories-list',
      '#org-repositories-list',
      '[data-testid="repository-list-container"]',
      'div[data-test-selector="org-repositories-list"]',
      '.org-repos',
      '#org-repositories'
    ];

    for (const selector of repoSections) {
      const container = document.querySelector(selector);
      if (container && !container.previousElementSibling?.classList.contains('gitlab-group-controls')) {
        const controls = new GroupControls(
          this.handleToggleGrouping.bind(this),
          this.showGroupManager.bind(this),
          this.groupingEnabled
        );
        container.parentNode.insertBefore(controls.create(), container);
        break;
      }
    }
  }

  /**
   * Handle grouping toggle.
   * @param {boolean} enabled - New grouping state.
   */
  handleToggleGrouping(enabled) {
    this.groupingEnabled = enabled;
    this.saveSetting('groupingEnabled', enabled);
    this.repositoryFinder.clearProcessedCache();
    this.processRepositories();
  }

  /**
   * Show group management modal.
   */
  showGroupManager() {
    const modal = new GroupManagerModal(
      this.customGroups,
      this.handleAddGroup.bind(this),
      this.handleRemoveGroup.bind(this)
    );
    modal.show();
  }

  /**
   * Handle adding a custom group.
   * @param {string} groupName - Group name to add.
   */
  async handleAddGroup(groupName) {
    this.customGroups.add(groupName);
    await this.saveCustomGroups();
    
    if (this.groupManager) {
      this.groupManager.updateCustomGroups(this.customGroups);
    }
    
    this.repositoryFinder.clearProcessedCache();
    this.processRepositories();
  }

  /**
   * Handle removing a custom group.
   * @param {string} groupName - Group name to remove.
   */
  async handleRemoveGroup(groupName) {
    this.customGroups.delete(groupName);
    await this.saveCustomGroups();
    
    if (this.groupManager) {
      this.groupManager.updateCustomGroups(this.customGroups);
    }
    
    this.repositoryFinder.clearProcessedCache();
    this.processRepositories();
  }

  /**
   * Save custom groups to storage.
   */
  async saveCustomGroups() {
    await this.storage.saveSetting('customGroups', Array.from(this.customGroups));
  }

  /**
   * Save setting to storage.
   * @param {string} key - Setting key.
   * @param {*} value - Setting value.
   */
  async saveSetting(key, value) {
    await this.storage.saveSetting(key, value);
  }

  /**
   * Show repositories for a specific group.
   * @param {string} groupId - Group identifier.
   * @param {Element} card - Group card element.
   */
  showGroupRepos(groupId, card) {
    const groupedContainer = card.closest('.gitlab-grouped-repositories') || 
                          card.parentElement.closest('.gitlab-grouped-repositories') ||
                          document.querySelector('.gitlab-grouped-repositories');
    
    console.log(`[GitHubGitLabTheme] Showing repos for group: ${groupId}`);
    
    if (groupedContainer) {
      this.groupDisplayManager.showGroupRepos(groupId, groupedContainer);
    } else {
      console.error(`[GitHubGitLabTheme] Could not find grouped repositories container`);
      const allGroupedContainers = document.querySelectorAll('.gitlab-grouped-repositories');
      if (allGroupedContainers.length > 0) {
        this.groupDisplayManager.showGroupRepos(groupId, allGroupedContainers[0]);
      }
    }
  }

  /**
   * Handle navigation changes.
   */
  handleNavigationChange() {
    console.log('[GitHubGitLabTheme] Handling navigation change');
    this.repositoryFinder.clearProcessedCache();
    this.run();
  }

  /**
   * Destroy the extension and cleanup.
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.navigationManager) {
      this.navigationManager.destroy();
    }
  }
}

new GitHubGitLabTheme();