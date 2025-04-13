document.addEventListener('DOMContentLoaded', function() {
  // Platform detection is now handled by platform-utils.js
  // Update the displayed shortcut text is now handled by platform-utils.js
  
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