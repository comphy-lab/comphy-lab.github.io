"use strict";

/**
 * Platform utilities - now delegates to shared Utils module
 * This file maintains backwards compatibility while using the centralized utilities
 */

// Auto-initialize when DOM is loaded (maintains existing behavior)
document.addEventListener("DOMContentLoaded", function () {
  // Use shared utility if available, otherwise fallback to local implementation
  if (window.Utils && window.Utils.updatePlatformSpecificElements) {
    window.Utils.updatePlatformSpecificElements();
  } else {
    // Fallback implementation (should not be needed if utils.js loads first)
    updatePlatformSpecificElementsFallback();
  }
});

/**
 * Fallback implementation for platform-specific element updates
 * Only used if Utils module is not available
 */
function updatePlatformSpecificElementsFallback() {
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  // Update all platform-specific text elements
  document.querySelectorAll(".default-theme-text").forEach((element) => {
    element.style.display = isMac ? "none" : "inline";
  });

  document.querySelectorAll(".mac-theme-text").forEach((element) => {
    element.style.display = isMac ? "inline" : "none";
  });
}

// Export functions for backwards compatibility - delegate to Utils if available
window.isMacPlatform = function () {
  if (window.Utils && window.Utils.isMacPlatform) {
    return window.Utils.isMacPlatform();
  }
  // Fallback
  return navigator.platform.toUpperCase().indexOf("MAC") >= 0;
};

window.updatePlatformSpecificElements = function () {
  if (window.Utils && window.Utils.updatePlatformSpecificElements) {
    return window.Utils.updatePlatformSpecificElements();
  }
  // Fallback
  updatePlatformSpecificElementsFallback();
};
