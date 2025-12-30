/**
 * Extension Entry Points.
 */

const GitHubGitLabTheme = require('./main.js');

const StorageManager = require('./storage/StorageManager.js');
const ThemeManager = require('./core/theme/ThemeManager.js');

const RepositoryFinder = require('./core/repository/RepositoryFinder.js');
const GroupManager = require('./core/repository/GroupManager.js');
const RepositoryProcessor = require('./core/repository/RepositoryProcessor.js');
const GroupDisplayManager = require('./core/repository/GroupDisplayManager.js');

const GroupCard = require('./ui/components/GroupCard.js');
const GroupControls = require('./ui/components/GroupControls.js');
const GroupManagerModal = require('./ui/managers/GroupManagerModal.js');

const PageDetector = require('./utils/PageDetector.js');
const NavigationManager = require('./utils/NavigationManager.js');

module.exports = {
  GitHubGitLabTheme,
  StorageManager,
  ThemeManager,
  RepositoryFinder,
  GroupManager,
  RepositoryProcessor,
  GroupDisplayManager,
  GroupCard,
  GroupControls,
  GroupManagerModal,
  PageDetector,
  NavigationManager
};