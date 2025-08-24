"use strict";

/**
 * Shared utilities for the CoMPhy Lab website
 * This module consolidates all common utility functions to eliminate redundancy
 */

/**
 * Determines whether the user's platform is macOS.
 *
 * @returns {boolean} True if the current platform is macOS; otherwise, false.
 */
function isMacPlatform() {
  return navigator.platform.toUpperCase().indexOf("MAC") >= 0;
}

/**
 * Updates UI elements to reflect the user's platform.
 *
 * Elements with the class `.mac-theme-text` are shown and `.default-theme-text` are hidden on Mac platforms; the reverse occurs on non-Mac platforms.
 */
function updatePlatformSpecificElements() {
  const isMac = isMacPlatform();

  // Update all platform-specific text elements
  document.querySelectorAll(".default-theme-text").forEach((element) => {
    element.style.display = isMac ? "none" : "inline";
  });

  document.querySelectorAll(".mac-theme-text").forEach((element) => {
    element.style.display = isMac ? "inline" : "none";
  });
}

/**
 * Creates a styled modal overlay with content
 *
 * @param {Object} options - Configuration options for the modal
 * @param {string} options.content - HTML content for the modal
 * @param {string} [options.maxWidth='600px'] - Maximum width of the modal
 * @param {string} [options.maxHeight='80vh'] - Maximum height of the modal
 * @param {boolean} [options.darkMode=false] - Whether to apply dark mode styling
 * @param {function} [options.onClose] - Callback function when modal closes
 * @returns {HTMLElement} The modal element
 */
function createModal(options) {
  const {
    content,
    maxWidth = "600px",
    maxHeight = "80vh",
    darkMode = false,
    onClose,
  } = options;

  const modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  modal.style.zIndex = "2000";
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";

  const contentEl = document.createElement("div");
  contentEl.style.backgroundColor = darkMode ? "#333" : "white";
  contentEl.style.color = darkMode ? "#fff" : "inherit";
  contentEl.style.borderRadius = "8px";
  contentEl.style.padding = "20px";
  contentEl.style.maxWidth = maxWidth;
  contentEl.style.maxHeight = maxHeight;
  contentEl.style.overflow = "auto";
  contentEl.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.3)";
  contentEl.setAttribute("tabindex", "-1");

  // Set content
  if (typeof content === "string") {
    contentEl.innerHTML = content;
  } else {
    contentEl.appendChild(content);
  }

  modal.appendChild(contentEl);

  // Close when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close function
  const closeModal = () => {
    if (modal.parentNode) {
      document.body.removeChild(modal);
      if (onClose) onClose();
    }
  };

  // Expose close function
  modal.closeModal = closeModal;

  return modal;
}

/**
 * Copy text to clipboard with visual feedback
 *
 * @param {HTMLElement} button - The button element that triggered the copy
 * @param {string} [text] - Text to copy (if not provided, uses button's data attributes)
 */
function copyToClipboard(button, text) {
  const textToCopy =
    text ||
    button.getAttribute("data-text") ||
    button.getAttribute("data-clipboard-text");

  if (!textToCopy) {
    console.warn("No text to copy");
    return;
  }

  // Modern clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        showCopyFeedback(button);
      })
      .catch((err) => {
        console.error("Copy failed:", err);
        // Fallback to older method
        fallbackCopy(textToCopy, button);
      });
  } else {
    // Fallback for older browsers
    fallbackCopy(textToCopy, button);
  }
}

/**
 * Fallback copy method for older browsers
 *
 * @private
 * @param {string} text - Text to copy
 * @param {HTMLElement} button - Button element for feedback
 */
function fallbackCopy(text, button) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);

  try {
    textarea.select();
    document.execCommand("copy");
    showCopyFeedback(button);
  } catch (err) {
    console.error("Fallback copy failed:", err);
  } finally {
    document.body.removeChild(textarea);
  }
}

/**
 * Shows visual feedback for successful copy operation
 *
 * @private
 * @param {HTMLElement} button - Button to show feedback on
 */
function showCopyFeedback(button) {
  const icon = button.querySelector("i");
  if (icon) {
    button.classList.add("copied");
    icon.classList.remove("fa-copy");
    icon.classList.add("fa-check");

    setTimeout(() => {
      button.classList.remove("copied");
      icon.classList.remove("fa-check");
      icon.classList.add("fa-copy");
    }, 2000);
  }
}

/**
 * Debounce function to limit how often a function can be called
 *
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Whether to trigger on leading edge
 * @returns {Function} Debounced function
 */
function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
}

/**
 * Throttle function to limit how often a function can be called
 *
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Safe DOM query with error handling
 *
 * @param {string} selector - CSS selector
 * @param {HTMLElement} [context=document] - Context element to search within
 * @returns {HTMLElement|null} Found element or null
 */
function safeQuery(selector, context = document) {
  try {
    return context.querySelector(selector);
  } catch (e) {
    console.warn(`Invalid selector: ${selector}`, e);
    return null;
  }
}

/**
 * Safe DOM query all with error handling
 *
 * @param {string} selector - CSS selector
 * @param {HTMLElement} [context=document] - Context element to search within
 * @returns {NodeList} Found elements (empty if error)
 */
function safeQueryAll(selector, context = document) {
  try {
    return context.querySelectorAll(selector);
  } catch (e) {
    console.warn(`Invalid selector: ${selector}`, e);
    return [];
  }
}

/**
 * Initialize accessible button attributes
 *
 * @param {HTMLElement} button - Button element
 * @param {string} label - Aria label text
 */
function initAccessibleButton(button, label) {
  if (!button.hasAttribute("aria-label") && label) {
    button.setAttribute("aria-label", label);
  }

  if (
    !button.hasAttribute("role") &&
    button.tagName.toLowerCase() !== "button"
  ) {
    button.setAttribute("role", "button");
  }

  if (!button.hasAttribute("tabindex")) {
    button.setAttribute("tabindex", "0");
  }
}

// Export all functions
window.Utils = {
  isMacPlatform,
  updatePlatformSpecificElements,
  createModal,
  copyToClipboard,
  debounce,
  throttle,
  safeQuery,
  safeQueryAll,
  initAccessibleButton,
};

// Also export individual functions for backwards compatibility
window.isMacPlatform = isMacPlatform;
window.updatePlatformSpecificElements = updatePlatformSpecificElements;
window.copyEmail = copyToClipboard; // Maintain existing API
