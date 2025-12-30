/**
 * Group Manager Modal - Creates and manages group management modal.
 */

export class GroupManagerModal {
  /**
   * Create group manager modal instance.
   * @param {Set<string>} customGroups - Current custom groups.
   * @param {Function} onAddGroup - Add group handler.
   * @param {Function} onRemoveGroup - Remove group handler.
   */
  constructor(customGroups, onAddGroup, onRemoveGroup) {
    this.customGroups = customGroups;
    this.onAddGroup = onAddGroup;
    this.onRemoveGroup = onRemoveGroup;
  }

  /**
   * Show the modal.
   */
  show() {
    this.close();

    const manager = this.createModal();
    document.body.appendChild(manager);
    this.setupEventListeners(manager);
  }

  /**
   * Close the modal.
   */
  close() {
    const existing = document.querySelector('.gitlab-group-manager');
    if (existing) {
      existing.remove();
    }
  }

  /**
   * Create modal DOM element.
   * @returns {Element} Modal element.
   */
  createModal() {
    const manager = document.createElement('div');
    manager.className = 'gitlab-group-manager';
    manager.innerHTML = this.getModalHTML();
    return manager;
  }

  /**
   * Get modal HTML content.
   * @returns {string} Modal HTML.
   */
  getModalHTML() {
    return `
      <div class="gitlab-manager-content">
        <h3>Manage Repository Groups</h3>
        <div class="gitlab-manager-body">
          <div class="gitlab-group-list">
            <h4>Current Custom Groups</h4>
            <div id="custom-groups-list">
              ${this.getGroupsListHTML()}
            </div>
          </div>
          <div class="gitlab-add-group">
            <h4>Add New Group</h4>
            <input type="text" id="new-group-name" placeholder="Enter group name..." />
            <button id="add-group-btn">Add Group</button>
          </div>
        </div>
        <div class="gitlab-manager-footer">
          <button id="close-manager-btn">Close</button>
        </div>
      </div>
    `;
  }

  /**
   * Get groups list HTML.
   * @returns {string} Groups list HTML.
   */
  getGroupsListHTML() {
    if (this.customGroups.size === 0) {
      return '<p class="gitlab-no-groups">No custom groups yet</p>';
    }

    return Array.from(this.customGroups).map(group => `
      <div class="gitlab-group-item">
        <span>${group}</span>
        <button class="gitlab-remove-group" data-group="${group}"></button>
      </div>
    `).join('');
  }

  /**
   * Setup event listeners for modal.
   * @param {Element} manager - Modal element.
   */
  setupEventListeners(manager) {
    document.getElementById('close-manager-btn').onclick = () => this.close();
    
    document.getElementById('add-group-btn').onclick = () => this.handleAddGroup();
    
    document.querySelectorAll('.gitlab-remove-group').forEach(btn => {
      btn.onclick = (e) => {
        const group = e.target.dataset.group;
        this.onRemoveGroup(group);
        this.refresh();
      };
    });

    manager.onclick = (e) => {
      if (e.target === manager) {
        this.close();
      }
    };

    document.getElementById('new-group-name').onkeypress = (e) => {
      if (e.key === 'Enter') {
        this.handleAddGroup();
      }
    };
  }

  /**
   * Handle add group action.
   */
  handleAddGroup() {
    const input = document.getElementById('new-group-name');
    const groupName = input.value.trim();
    
    if (groupName && !this.customGroups.has(groupName)) {
      this.onAddGroup(groupName);
      input.value = '';
      this.refresh();
    }
  }

  /**
   * Refresh modal content.
   */
  refresh() {
    const groupsList = document.getElementById('custom-groups-list');
    if (groupsList) {
      groupsList.innerHTML = this.getGroupsListHTML();
      this.setupRemoveGroupListeners();
    }
  }

  /**
   * Setup remove group listeners.
   */
  setupRemoveGroupListeners() {
    document.querySelectorAll('.gitlab-remove-group').forEach(btn => {
      btn.onclick = (e) => {
        const group = e.target.dataset.group;
        this.onRemoveGroup(group);
        this.refresh();
      };
    });
  }

  /**
   * Update custom groups.
   * @param {Set<string>} newGroups - New custom groups.
   */
  updateCustomGroups(newGroups) {
    this.customGroups = newGroups;
  }
}

  show() {
    // Close existing modal if present.
    this.close();

    const manager = this.createModal();
    document.body.appendChild(manager);

    this.setupEventListeners(manager);
  }

  close() {
    const existing = document.querySelector('.gitlab-group-manager');
    if (existing) {
      existing.remove();
    }
  }

  createModal() {
    const manager = document.createElement('div');
    manager.className = 'gitlab-group-manager';
    manager.innerHTML = this.getModalHTML();
    return manager;
  }

  getModalHTML() {
    return `
      <div class="gitlab-manager-content">
        <h3>Manage Repository Groups</h3>
        <div class="gitlab-manager-body">
          <div class="gitlab-group-list">
            <h4>Current Custom Groups</h4>
            <div id="custom-groups-list">
              ${this.getGroupsListHTML()}
            </div>
          </div>
          <div class="gitlab-add-group">
            <h4>Add New Group</h4>
            <input type="text" id="new-group-name" placeholder="Enter group name..." />
            <button id="add-group-btn">Add Group</button>
          </div>
        </div>
        <div class="gitlab-manager-footer">
          <button id="close-manager-btn">Close</button>
        </div>
      </div>
    `;
  }

  getGroupsListHTML() {
    if (this.customGroups.size === 0) {
      return '<p class="gitlab-no-groups">No custom groups yet</p>';
    }

    return Array.from(this.customGroups).map(group => `
      <div class="gitlab-group-item">
        <span>${group}</span>
        <button class="gitlab-remove-group" data-group="${group}"></button>
      </div>
    `).join('');
  }

  setupEventListeners(manager) {
    // Close button.
    document.getElementById('close-manager-btn').onclick = () => this.close();
    
    // Add group button.
    document.getElementById('add-group-btn').onclick = () => this.handleAddGroup();
    
    // Remove group buttons.
    document.querySelectorAll('.gitlab-remove-group').forEach(btn => {
      btn.onclick = (e) => {
        const group = e.target.dataset.group;
        this.onRemoveGroup(group);
        this.refresh();
      };
    });

    // Click outside to close.
    manager.onclick = (e) => {
      if (e.target === manager) {
        this.close();
      }
    };

    // Enter key to add group.
    document.getElementById('new-group-name').onkeypress = (e) => {
      if (e.key === 'Enter') {
        this.handleAddGroup();
      }
    };
  }

  handleAddGroup() {
    const input = document.getElementById('new-group-name');
    const groupName = input.value.trim();
    
    if (groupName && !this.customGroups.has(groupName)) {
      this.onAddGroup(groupName);
      input.value = '';
      this.refresh();
    }
  }

  refresh() {
    const groupsList = document.getElementById('custom-groups-list');
    if (groupsList) {
      groupsList.innerHTML = this.getGroupsListHTML();
      this.setupRemoveGroupListeners();
    }
  }

  setupRemoveGroupListeners() {
    document.querySelectorAll('.gitlab-remove-group').forEach(btn => {
      btn.onclick = (e) => {
        const group = e.target.dataset.group;
        this.onRemoveGroup(group);
        this.refresh();
      };
    });
  }

  updateCustomGroups(newGroups) {
    this.customGroups = newGroups;
  }
}