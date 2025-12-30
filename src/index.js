/**
 * Extension Entry Points
 */

// Main extension entry point
export { default as GitHubGitLabTheme } from './main.js';

// Core modules
export { StorageManager } from './storage/StorageManager.js';
export { ThemeManager } from './core/theme/ThemeManager.js';

// Repository modules
export { RepositoryFinder } from './core/repository/RepositoryFinder.js';
export { GroupManager } from './core/repository/GroupManager.js';
export { RepositoryProcessor } from './core/repository/RepositoryProcessor.js';
export { GroupDisplayManager } from './core/repository/GroupDisplayManager.js';

// UI modules
export { GroupCard } from './ui/components/GroupCard.js';
export { GroupControls } from './ui/components/GroupControls.js';
export { GroupManagerModal } from './ui/managers/GroupManagerModal.js';

// Utility modules
export { PageDetector } from './utils/PageDetector.js';
export { NavigationManager } from './utils/NavigationManager.js';