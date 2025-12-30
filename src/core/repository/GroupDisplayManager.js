/**
 * Group Display Manager - Handles showing/hiding group repositories.
 */

class GroupDisplayManager {
  constructor() {
    this.currentActiveGroup = null;
  }

  /**
   * Show repositories for a specific group.
   * @param {string} groupId - Group identifier.
   * @param {Element} container - Container element.
   */
  showGroupRepos(groupId, container) {
    console.log(`[GroupDisplayManager] Showing repos for group: ${groupId}`);
    
    const reposSection = container.querySelector('.gitlab-repos-section');
    
    if (!reposSection) {
      console.error(`[GroupDisplayManager] Repos section not found!`);
      return;
    }
    
    this.hideAllRepoContainers(reposSection);
    this.showSelectedContainer(reposSection, groupId);
    this.updateActiveCard(container, groupId);
    
    this.currentActiveGroup = groupId;
    
    reposSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Hide all repository containers.
   * @param {Element} reposSection - Repositories section element.
   */
  hideAllRepoContainers(reposSection) {
    const allContainers = reposSection.querySelectorAll('.gitlab-repo-container');
    
    allContainers.forEach((cont, index) => {
      cont.style.display = 'none';
      console.log(`[GroupDisplayManager] Hiding container ${index} (data-group-id: ${cont.dataset.groupId})`);
    });
  }

  /**
   * Show selected repository container.
   * @param {Element} reposSection - Repositories section element.
   * @param {string} groupId - Group identifier.
   */
  showSelectedContainer(reposSection, groupId) {
    const selectedContainer = reposSection.querySelector(`.gitlab-repo-container[data-group-id="${groupId}"]`);
    if (selectedContainer) {
      selectedContainer.style.display = 'block';
      console.log(`[GroupDisplayManager] Found and showing container for ${groupId} with ${selectedContainer.children.length} items`);
      
      Array.from(selectedContainer.children).forEach((child, index) => {
        child.style.display = '';
      });
    } else {
      console.error(`[GroupDisplayManager] Container not found for group: ${groupId}`);
      console.log(`[GroupDisplayManager] Available group IDs in repos section:`, 
        Array.from(reposSection.querySelectorAll('.gitlab-repo-container')).map(c => c.dataset.groupId));
    }
  }

  /**
   * Update active card styling.
   * @param {Element} container - Container element.
   * @param {string} groupId - Group identifier.
   */
  updateActiveCard(container, groupId) {
    const allCards = container.querySelectorAll('.gitlab-group-card');
    allCards.forEach(card => {
      card.classList.remove('active');
    });

    const activeCard = container.querySelector(`.gitlab-group-card[data-group-id="${groupId}"]`);
    if (activeCard) {
      activeCard.classList.add('active');
      console.log(`[GroupDisplayManager] Active card set for ${groupId}`);
    } else {
      console.error(`[GroupDisplayManager] Active card not found for group: ${groupId}`);
    }
  }

  /**
   * Get current active group.
   * @returns {string|null} Current active group ID.
   */
  getCurrentActiveGroup() {
    return this.currentActiveGroup;
  }
}

module.exports = GroupDisplayManager;