document.addEventListener('DOMContentLoaded', function() {
  // Platform detection is now handled by platform-utils.js
  /**
   * Dynamically loads a stylesheet into the document's head.
   *
   * Creates a <link> element with the specified URL, sets attributes necessary for secure loading,
   * and appends it to the document's head. If the stylesheet fails to load, an error is logged
   * to the console.
   *
   * @param {string} href - The URL of the stylesheet to be loaded.
   * @returns {HTMLLinkElement} The created and appended link element.
   */
  
  function loadStylesheet(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.crossOrigin = 'anonymous';
    link.onerror = () => console.error(`Failed to load stylesheet: ${href}`);
    document.head.appendChild(link);
    return link;
  }

  const FA_VERSION = '6.7.2';  // Extract version to a constant for easier updates
  
  loadStylesheet(`https://use.fontawesome.com/releases/v${FA_VERSION}/css/solid.css`);
  loadStylesheet(`https://use.fontawesome.com/releases/v${FA_VERSION}/css/brands.css`);
  loadStylesheet(`https://use.fontawesome.com/releases/v${FA_VERSION}/css/fontawesome.css`);
}); 