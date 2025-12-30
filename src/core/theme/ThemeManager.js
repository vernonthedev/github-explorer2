/**
 * Theme Manager - Handles dark theme application and management
 */

export class ThemeManager {
  constructor() {
    this.isDarkMode = true;
  }

  init() {
    this.applyDarkTheme();
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

  removeDarkTheme() {
    document.body.classList.remove('gitlab-dark-theme');
    document.documentElement.classList.remove('gitlab-dark-theme');
    
    const forcer = document.querySelector('#gitlab-dark-theme-forcer');
    if (forcer) {
      forcer.remove();
    }
  }

  toggleTheme() {
    if (this.isDarkMode) {
      this.removeDarkTheme();
    } else {
      this.applyDarkTheme();
    }
    this.isDarkMode = !this.isDarkMode;
  }
}