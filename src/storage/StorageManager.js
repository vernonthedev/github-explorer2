/**
 * Storage Manager - Handles all data persistence operations
 */

export class StorageManager {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

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

  initFallbackStorage() {
    console.log('[Storage] Using fallback storage');
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
      
      console.log(`[Storage] Saved setting: ${key}`);
    } catch (error) {
      console.error('[Storage] Failed to save setting:', error);
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
      console.error('[Storage] Failed to load setting:', error);
      return defaultValue;
    }
  }

  saveSettingFallback(key, value) {
    try {
      localStorage.setItem(`gitlab_theme_${key}`, JSON.stringify(value));
      this.setCookie(`gitlab_theme_${key}`, JSON.stringify(value), 365);
    } catch (error) {
      console.error('[Storage] Fallback storage failed:', error);
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
}