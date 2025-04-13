'use strict';

/**
 * Check if the user is on a Mac platform
 * @returns {boolean} True if user is on Mac, false otherwise
 */
function isMacPlatform() {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

/**
 * Update UI elements based on platform (Mac vs non-Mac)
 */
function updatePlatformSpecificElements() {
  const isMac = isMacPlatform();
  
  // Update all platform-specific text elements
  document.querySelectorAll('.default-theme-text').forEach(element => {
    element.style.display = isMac ? 'none' : 'inline';
  });
  
  document.querySelectorAll('.mac-theme-text').forEach(element => {
    element.style.display = isMac ? 'inline' : 'none';
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', updatePlatformSpecificElements);

// Export functions for use in other scripts
window.isMacPlatform = isMacPlatform;
window.updatePlatformSpecificElements = updatePlatformSpecificElements; 