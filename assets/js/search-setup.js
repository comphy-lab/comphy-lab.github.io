// Initialize the search modal
function initSearch() {
  const ninjaKeys = document.querySelector('ninja-keys');
  if (!ninjaKeys) return;
  
  // Data is loaded in search-data.js
  
  // Add theme change listener if you support dark/light modes
  const htmlEl = document.querySelector('html');
  if (htmlEl) {
    const observer = new MutationObserver(() => {
      const darkMode = htmlEl.dataset.theme === 'dark';
      ninjaKeys.setAttribute('theme', darkMode ? 'dark' : 'light');
    });
    observer.observe(htmlEl, { attributes: true });
    
    // Set initial theme based on current site theme or time of day
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    ninjaKeys.setAttribute('theme', prefersDark ? 'dark' : 'light');
  }
}

// Function to open the search modal
function openSearchModal() {
  // Open the ninja-keys modal
  const ninjaKeys = document.querySelector('ninja-keys');
  if (ninjaKeys) {
    ninjaKeys.open();
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initSearch); 