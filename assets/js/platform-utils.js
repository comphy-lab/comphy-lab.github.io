"use strict";

/**
 * Check if the user is on a Mac platform
 * @returns {boolean} True if user is on Mac, false otherwise
 */
function isMacPlatform() {
  return navigator.platform.toUpperCase().indexOf("MAC") >= 0;
}

/**
 * Updates UI elements to reflect the user"s platform.
 *
 * This function determines whether the current platform is a Mac by calling `isMacPlatform()`
 * and adjusts the visibility of UI elements accordingly:
 * - Elements with the class `.default-theme-text` are hidden on Mac platforms.
 * - Elements with the class `.mac-theme-text` are shown on Mac platforms.
 * On non-Mac platforms, the visibility settings are reversed.
 */
function updatePlatformSpecificElements() {
  const isMac = isMacPlatform();
  
  // Update all platform-specific text elements
  document.querySelectorAll(".default-theme-text").forEach(element => {
    element.style.display = isMac ? "none" : "inline";
  });
  
  document.querySelectorAll(".mac-theme-text").forEach(element => {
    element.style.display = isMac ? "inline" : "none";
  });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", updatePlatformSpecificElements);

// Export functions for use in other scripts
window.isMacPlatform = isMacPlatform;
window.updatePlatformSpecificElements = updatePlatformSpecificElements; 