/**
 * Group Display Manager - Handles showing/hiding group repositories
 */

export class GroupDisplayManager {
  constructor() {
    this.currentActiveGroup = null;
  }

  showGroupRepos(groupId, container) {
    console.log(`[GroupDisplayManager] Showing repos for group: ${groupId}`);
    
    // Find the repos section within the grouped container
    const reposSection = container.querySelector('.gitlab-repos-section');
    
    if (!reposSection) {
      console.error(`[GroupDisplayManager] Repos section not found!`);
      return;
    }
    
    this.hideAllRepoContainers(reposSection);
    this.showSelectedContainer(reposSection, groupId);
    this.updateActiveCard(container, groupId);
    
    this.currentActiveGroup = groupId;
    
    // Scroll to the repos section
    reposSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  hideAllRepoContainers(reposSection) {
    const allContainers = reposSection.querySelectorAll('.gitlab-repo-container');
    
    allContainers.forEach((cont, index) => {
      cont.style.display = 'none';
      console.log(`[GroupDisplayManager] Hiding container ${index} (data-group-id: ${cont.dataset.groupId})`);
    });
  }

  showSelectedContainer(reposSection, groupId) {
    const selectedContainer = reposSection.querySelector(`.gitlab-repo-container[data-group-id="${groupId}"]`);
    if (selectedContainer) {
      selectedContainer.style.display = 'block';
      console.log(`[GroupDisplayManager] Found and showing container for ${groupId} with ${selectedContainer.children.length} items`);
      
      // Ensure repository items are visible
      Array.from(selectedContainer.children).forEach((child, index) => {
        child.style.display = '';
      });
    } else {
      console.error(`[GroupDisplayManager] Container not found for group: ${groupId}`);
      console.log(`[GroupDisplayManager] Available group IDs in repos section:`, 
        Array.from(reposSection.querySelectorAll('.gitlab-repo-container')).map(c => c.dataset.groupId));
    }
  }

  updateActiveCard(container, groupId) {
    // Hide all cards
    const allCards = container.querySelectorAll('.gitlab-group-card');
    allCards.forEach(card => {
      card.classList.remove('active');
    });

    // Show active card
    const activeCard = container.querySelector(`.gitlab-group-card[data-group-id="${groupId}"]`);
    if (activeCard) {
      activeCard.classList.add('active');
      console.log(`[GroupDisplayManager] Active card set for ${groupId}`);
    } else {
      console.error(`[GroupDisplayManager] Active card not found for group: ${groupId}`);
    }
  }

  getCurrentActiveGroup() {
    return this.currentActiveGroup;
  }
}