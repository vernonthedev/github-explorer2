/**
 * Extension Entry Points.
 */

export { default as GitHubGitLabTheme } from './main.js';

export { StorageManager } from './storage/StorageManager.js';
export { ThemeManager } from './core/theme/ThemeManager.js';

export { RepositoryFinder } from './core/repository/RepositoryFinder.js';
export { GroupManager } from './core/repository/GroupManager.js';
export { RepositoryProcessor } from './core/repository/RepositoryProcessor.js';
export { GroupDisplayManager } from './core/repository/GroupDisplayManager.js';

export { GroupCard } from './ui/components/GroupCard.js';
export { GroupControls } from './ui/components/GroupControls.js';
export { GroupManagerModal } from './ui/managers/GroupManagerModal.js';

export { PageDetector } from './utils/PageDetector.js';
export { NavigationManager } from './utils/NavigationManager.js';