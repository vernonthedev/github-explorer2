/**
 * Theme Manager - Handles dark theme application and management.
 */

class ThemeManager {
  constructor() {
    this.isDarkMode = true;
  }

  /**
   * Initialize theme manager and apply dark theme.
   */
  init() {
    this.applyDarkTheme();
  }

  /**
   * Apply dark theme to the document.
   */
  applyDarkTheme() {
    document.body.classList.add('gitlab-dark-theme');
    document.documentElement.classList.add('gitlab-dark-theme');
    
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

  /**
   * Remove dark theme from the document.
   */
  removeDarkTheme() {
    document.body.classList.remove('gitlab-dark-theme');
    document.documentElement.classList.remove('gitlab-dark-theme');
    
    const forcer = document.querySelector('#gitlab-dark-theme-forcer');
    if (forcer) {
      forcer.remove();
    }
  }

  /**
   * Toggle between dark and light themes.
   */
  toggleTheme() {
    if (this.isDarkMode) {
      this.removeDarkTheme();
    } else {
      this.applyDarkTheme();
    }
    this.isDarkMode = !this.isDarkMode;
  }
}

module.exports = ThemeManager;