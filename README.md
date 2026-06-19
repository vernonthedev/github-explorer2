```text
 ██████╗ ██╗████████╗██╗  ██╗██╗   ██╗██████╗     ███████╗██╗  ██╗██████╗ ██╗      ██████╗ ██████╗ ███████╗██████╗
██╔════╝ ██║╚══██╔══╝██║  ██║██║   ██║██╔══██╗    ██╔════╝╚██╗██╔╝██╔══██╗██║     ██╔═══██╗██╔══██╗██╔════╝██╔══██╗
██║  ███╗██║   ██║   ███████║██║   ██║██████╔╝    █████╗   ╚███╔╝ ██████╔╝██║     ██║   ██║██████╔╝█████╗  ██████╔╝
██║   ██║██║   ██║   ██╔══██║██║   ██║██╔══██╗    ██╔══╝   ██╔██╗ ██╔═══╝ ██║     ██║   ██║██╔══██╗██╔══╝  ██╔══██╗
╚██████╔╝██║   ██║   ██║  ██║╚██████╔╝██████╔╝    ███████╗██╔╝ ██╗██║     ███████╗╚██████╔╝██║  ██║███████╗██║  ██║
 ╚═════╝ ╚═╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═════╝     ╚══════╝╚═╝  ╚═╝╚═╝     ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
```

# GitHub Explorer

A browser extension that reskins GitHub.com to add groups functionality to organize repositories by naming convention & card based management.

## Features

- **Repository Groups**: Automatically groups repositories based on naming convention (everything before first hyphen)
- **Modern Design**: Clean, distraction-free interface inspired by github's design language
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

The extension implements github's color palette:

- **Primary Navy**: `#292961`
- **Accent Orange**: `#e24329`
- **Clean White**: `#ffffff`
- **Border Gray**: `#dbdbdb`

## Usage

Once installed, the extension automatically:

1. Detects when you visit GitHub pages
2. Groups your repositories automatically
3. Maintains all GitHub functionality

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=vernonthedev/github-explorer2&type=date&legend=top-left)](https://www.star-history.com/#vernonthedev/github-explorer2&type=date&legend=top-left)

![Alt](https://repobeats.axiom.co/api/embed/40dc572aae96065261c75036d2352093e7ffdd14.svg "Repobeats analytics image")

---

Made with ❤️ by [vernonthedev](https://github.com/vernonthedev)
