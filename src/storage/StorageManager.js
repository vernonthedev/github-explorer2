/**
 * Storage Manager - Handles all data persistence operations.
 */

export class StorageManager {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  /**
   * Initialize storage with IndexedDB and fallback mechanisms.
   */
  async init() {
    if (this.isInitialized) return;
    
    try {
      await this.initIndexedDB();
      console.log('[Storage] IndexedDB initialized successfully');
    } catch (error) {
      console.error('[Storage] Failed to initialize IndexedDB:', error);
      this.initFallbackStorage();
    }
    
    this.isInitialized = true;
  }

  /**
   * Initialize IndexedDB database.
   * @throws {Error} When Dexie is not available.
   */
  async initIndexedDB() {
    const Dexie = window.Dexie;
    if (!Dexie) {
      throw new Error('Dexie not available');
    }

    this.db = new Dexie('GitHubGitLabThemeDB');
    this.db.version(1).stores({
      settings: '++id, key, value',
      groups: '++id, name, created'
    });
  }

  /**
   * Initialize fallback storage mechanism.
   */
  initFallbackStorage() {
    console.log('[Storage] Using fallback storage');
  }

  /**
   * Save a setting to storage with multiple fallback mechanisms.
   * @param {string} key - Setting key.
   * @param {*} value - Setting value.
   */
  async saveSetting(key, value) {
    try {
      if (this.db) {
        await this.db.settings.where('key').equals(key).delete();
        await this.db.settings.add({ key, value });
      }
      
      localStorage.setItem(`gitlab_theme_${key}`, JSON.stringify(value));
      this.setCookie(`gitlab_theme_${key}`, JSON.stringify(value), 365);
      
      console.log(`[Storage] Saved setting: ${key}`);
    } catch (error) {
      console.error('[Storage] Failed to save setting:', error);
      this.saveSettingFallback(key, value);
    }
  }

  /**
   * Load a setting from storage with fallback mechanisms.
   * @param {string} key - Setting key.
   * @param {*} defaultValue - Default value if not found.
   * @returns {*} Setting value or default.
   */
  async loadSetting(key, defaultValue = null) {
    try {
      if (this.db) {
        const setting = await this.db.settings.where('key').equals(key).first();
        if (setting) return setting.value;
      }
      
      const localValue = localStorage.getItem(`gitlab_theme_${key}`);
      if (localValue) return JSON.parse(localValue);
      
      const cookieValue = this.getCookie(`gitlab_theme_${key}`);
      if (cookieValue) return JSON.parse(cookieValue);
      
      return defaultValue;
    } catch (error) {
      console.error('[Storage] Failed to load setting:', error);
      return defaultValue;
    }
  }

  /**
   * Save setting using fallback mechanisms only.
   * @param {string} key - Setting key.
   * @param {*} value - Setting value.
   */
  saveSettingFallback(key, value) {
    try {
      localStorage.setItem(`gitlab_theme_${key}`, JSON.stringify(value));
      this.setCookie(`gitlab_theme_${key}`, JSON.stringify(value), 365);
    } catch (error) {
      console.error('[Storage] Fallback storage failed:', error);
    }
  }

  /**
   * Set a cookie with expiration.
   * @param {string} name - Cookie name.
   * @param {string} value - Cookie value.
   * @param {number} days - Days until expiration.
   */
  setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  /**
   * Get a cookie value by name.
   * @param {string} name - Cookie name.
   * @returns {string|null} Cookie value or null if not found.
   */
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
}