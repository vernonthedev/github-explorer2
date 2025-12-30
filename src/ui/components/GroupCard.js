/**
 * Group Card Component - Creates and manages group card UI elements.
 */

class GroupCard {
  /**
   * Create group card instance.
   * @param {string} name - Group name.
   * @param {Element[]} items - Repository items in this group.
   * @param {string} groupId - Unique group identifier.
   * @param {Function} onCardClick - Click handler function.
   */
  constructor(name, items, groupId, onCardClick) {
    this.name = name;
    this.items = items;
    this.groupId = groupId;
    this.onCardClick = onCardClick;
  }

  /**
   * Create group card DOM element.
   * @returns {Element} Group card element.
   */
  create() {
    const card = document.createElement('div');
    card.className = 'gitlab-group-card';
    card.dataset.groupId = this.groupId;

    const cardHeader = this.createCardHeader();
    card.appendChild(cardHeader);

    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log(`[GroupCard] Clicked group: ${this.groupId}`);
      this.onCardClick(this.groupId, card);
    });

    return card;
  }

  /**
   * Create card header element.
   * @returns {Element} Card header element.
   */
  createCardHeader() {
    const cardHeader = document.createElement('div');
    cardHeader.className = 'gitlab-card-header';

    const icon = this.createIcon();
    const titleCount = this.createTitleCount();

    cardHeader.appendChild(icon);
    cardHeader.appendChild(titleCount);

    return cardHeader;
  }

  /**
   * Create icon element.
   * @returns {Element} Icon element.
   */
  createIcon() {
    const icon = document.createElement('div');
    icon.className = 'gitlab-card-icon';
    icon.innerHTML = this.getGroupIcon(this.name);
    return icon;
  }

  /**
   * Create title and count element.
   * @returns {Element} Title count element.
   */
  createTitleCount() {
    const titleCount = document.createElement('div');
    titleCount.className = 'gitlab-card-title-count';

    const title = document.createElement('h4');
    title.className = 'gitlab-card-title';
    title.textContent = this.name;

    const count = document.createElement('span');
    count.className = 'gitlab-card-count';
    count.textContent = `${this.items.length}`;

    titleCount.appendChild(title);
    titleCount.appendChild(count);

    return titleCount;
  }

  /**
   * Get icon SVG for group name.
   * @param {string} groupName - Group name.
   * @returns {string} SVG icon HTML.
   */
  getGroupIcon(groupName) {
    const iconMap = {
      'All Repositories': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
      'General': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>',
      'Web': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>',
      'Api': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
      'Mobile': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>',
      'Backend': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>',
      'Frontend': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>',
      'Default': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>'
    };

    return iconMap[groupName] || iconMap['Default'];
  }
}

module.exports = GroupCard;