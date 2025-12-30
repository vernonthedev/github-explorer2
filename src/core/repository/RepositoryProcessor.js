/**
 * Repository Processor - Handles the main repository processing logic
 */

import { GroupCard } from '../../ui/components/GroupCard.js';
import { GroupManager } from './GroupManager.js';

export class RepositoryProcessor {
  constructor(groupManager, onShowGroupRepos) {
    this.groupManager = groupManager;
    this.onShowGroupRepos = onShowGroupRepos;
  }

  createGroupCards(container, items) {
    const groups = this.groupManager.extractGroups(items);
    
    if (groups.size <= 1) {
      this.displayAllRepos(container, items);
      return;
    }

    // Store original content and clear container safely
    const originalContent = container.innerHTML;
    const originalClasses = container.className;
    
    try {
      container.innerHTML = '';
      container.classList.add('gitlab-grouped-repositories');

      const fragment = document.createDocumentFragment();
      
      // Create group cards section
      const groupCardsSection = this.createGroupCardsSection(groups, container);
      fragment.appendChild(groupCardsSection);

      // Create hidden repo containers for each group
      const repoContainersSection = this.createRepoContainers(groups, container);
      fragment.appendChild(repoContainersSection);

      container.appendChild(fragment);

      // Show the first group by default
      this.autoShowFirstGroup(container);

    } catch (error) {
      console.error('[RepositoryProcessor] Error creating group cards, reverting to original content:', error);
      container.innerHTML = originalContent;
      container.className = originalClasses;
      this.displayAllRepos(container, items);
    }
  }

  displayAllRepos(container, items) {
    // Only modify if we haven't already processed this container
    if (container.dataset.gitlabProcessed === 'true') {
      return;
    }

    const fragment = document.createDocumentFragment();
    
    items.forEach(item => {
      fragment.appendChild(item);
    });

    // Preserve non-repo items
    const nonRepoItems = Array.from(container.children).filter(child => 
      !items.includes(child) && 
      !child.classList.contains('gitlab-cards-section') &&
      !child.classList.contains('gitlab-repos-section')
    );

    nonRepoItems.forEach(item => fragment.appendChild(item));

    container.innerHTML = '';
    container.appendChild(fragment);
  }

  createGroupCardsSection(groups, container) {
    const section = document.createElement('div');
    section.className = 'gitlab-cards-section';

    const containerDiv = document.createElement('div');
    containerDiv.className = 'gitlab-group-cards-container';

    // Add "All Repositories" card
    const allReposCard = new GroupCard('All Repositories', Array.from(groups.values()).flat(), 'all', this.onShowGroupRepos);
    containerDiv.appendChild(allReposCard.create());

    // Add group cards
    Array.from(groups.entries()).forEach(([name, items]) => {
      const card = new GroupCard(name, items, name, this.onShowGroupRepos);
      containerDiv.appendChild(card.create());
    });

    section.appendChild(containerDiv);
    return section;
  }

  createRepoContainers(groups, container) {
    const section = document.createElement('div');
    section.className = 'gitlab-repos-section';

    // Create container for "All Repositories"
    const allReposContainer = document.createElement(container.tagName);
    allReposContainer.className = container.className;
    allReposContainer.classList.add('gitlab-repo-container');
    allReposContainer.dataset.groupId = 'all';
    allReposContainer.style.display = 'none';

    Array.from(groups.values()).flat().forEach(item => {
      allReposContainer.appendChild(item.cloneNode(true));
    });

    section.appendChild(allReposContainer);

    // Create containers for each group
    Array.from(groups.entries()).forEach(([name, items]) => {
      const groupContainer = document.createElement(container.tagName);
      groupContainer.className = container.className;
      groupContainer.classList.add('gitlab-repo-container');
      groupContainer.dataset.groupId = name;
      groupContainer.style.display = 'none';

      items.forEach(item => {
        groupContainer.appendChild(item);
      });

      section.appendChild(groupContainer);
    });

    return section;
  }

  autoShowFirstGroup(container) {
    const firstGroup = Array.from(this.groupManager.extractGroups([]).keys())[0] || 'all';
    console.log(`[RepositoryProcessor] Auto-showing first group: ${firstGroup}`);
    
    // Wait a bit for DOM to settle, then simulate first group click
    setTimeout(() => {
      console.log(`[RepositoryProcessor] Attempting to show first group...`);
      const firstCard = container.querySelector(`.gitlab-group-card[data-group-id="${firstGroup}"]`);
      if (firstCard) {
        console.log(`[RepositoryProcessor] Found first group card, simulating click`);
        firstCard.click();
      } else {
        console.error(`[RepositoryProcessor] Could not find first group card: ${firstGroup}`);
        console.log(`[RepositoryProcessor] Available cards:`, container.querySelectorAll('.gitlab-group-card'));
      }
    }, 200);
  }
}