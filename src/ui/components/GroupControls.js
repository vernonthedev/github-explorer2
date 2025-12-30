/**
 * Group Controls Component - Creates controls for managing groups
 */

export class GroupControls {
  constructor(onToggleGrouping, onManageGroups, groupingEnabled = true) {
    this.onToggleGrouping = onToggleGrouping;
    this.onManageGroups = onManageGroups;
    this.groupingEnabled = groupingEnabled;
  }

  create() {
    const controls = document.createElement('div');
    controls.className = 'gitlab-group-controls';

    const toggleGrouping = this.createToggleButton();
    const manageGroups = this.createManageButton();

    controls.appendChild(toggleGrouping);
    controls.appendChild(manageGroups);

    return controls;
  }

  createToggleButton() {
    const button = document.createElement('button');
    button.className = 'gitlab-control-btn';
    this.updateToggleButton(button);
    
    button.onclick = () => {
      this.groupingEnabled = !this.groupingEnabled;
      this.updateToggleButton(button);
      this.onToggleGrouping(this.groupingEnabled);
    };

    return button;
  }

  updateToggleButton(button) {
    if (this.groupingEnabled) {
      button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> Disable';
    } else {
      button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg> Enable';
    }
  }

  createManageButton() {
    const button = document.createElement('button');
    button.className = 'gitlab-control-btn gitlab-manage-btn';
    button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 9.96l4.24 4.24M1 12h6m6 0h6"></path></svg> Manage';
    
    button.onclick = () => {
      this.onManageGroups();
    };

    return button;
  }

  updateGroupingStatus(enabled) {
    this.groupingEnabled = enabled;
  }
}