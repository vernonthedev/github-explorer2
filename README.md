#   ____ _ _   _   _       _        _____            _                     
#  / ___(_) |_| | | |_   _| |__    | ____|_  ___ __ | | ___  _ __ ___ _ __ 
# | |  _| | __| |_| | | | | '_ \   |  _| \ \/ / '_ \| |/ _ \| '__/ _ \ '__|
# | |_| | | |_|  _  | |_| | |_) |  | |___ >  <| |_) | | (_) | | |  __/ |   
#  \____|_|\__|_| |_|\__,_|_.__/   |_____/_/\_\ .__/|_|\___/|_|  \___|_|
#
# GitHub Explorer

A browser extension that reskins GitHub.com to look like GitLab, adding groups functionality to organize repositories by naming convention.

## Features

- **GitLab Theme**: Complete visual transformation of GitHub's interface
- **Repository Groups**: Automatically groups repositories based on naming convention (everything before first hyphen)
- **Modern Design**: Clean, distraction-free interface inspired by GitLab's design language
- **Preserved Functionality**: All native GitHub features remain intact

## Installation

1. Clone/download this repository
2. Open Chrome/Edge and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select this folder
5. Navigate to GitHub to see the transformation

## How It Works

### Repository Grouping
- Repositories are grouped by naming convention
- Everything before the first hyphen (`-`) becomes the group name
- Example: `project-alpha`, `project-beta` → Group: **project**
- Repositories without hyphens are grouped as **General**

### Technical Implementation
- Uses `MutationObserver` to detect GitHub's SPA navigation
- Preserves React event listeners by moving DOM nodes instead of recreating
- Implements proper cleanup to prevent memory leaks
- Debounces rapid DOM changes for optimal performance

## Design System

The extension implements GitLab's color palette:

- **Primary Navy**: `#292961`
- **Accent Orange**: `#e24329`
- **Clean White**: `#ffffff`
- **Border Gray**: `#dbdbdb`

## File Structure

```
├── manifest.json    # Extension configuration
├── content.js       # Core functionality and DOM manipulation
├── styles.css       # GitLab theme styling
└── README.md        # Simple Docs
```

## Customization

### Modify Grouping Logic
Edit the `extractGroupName()` method in `content.js:221` to change how repositories are grouped.

### Update Styling
Modify the CSS variables in `styles.css:4` to adjust colors and spacing.

## Usage

Once installed, the extension automatically:

1. Detects when you visit GitHub pages
2. Applies GitLab theming to the interface
3. Groups your repositories automatically
4. Maintains all GitHub functionality

## Troubleshooting

- **Groups not appearing?**: Check that repository names follow the `group-name` convention
- **Styling issues?**: Refresh the page after installation
- **Performance problems?**: The extension includes debouncing and cleanup mechanisms

---

 Made with love by [vernonthedev](https://github.com/vernonthedev)