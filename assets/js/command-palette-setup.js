// Initialize the command palette
function initCommandPalette() {
  const ninjaKeys = document.querySelector('ninja-keys#command-palette');
  if (!ninjaKeys) {
    console.error('Command palette element not found!');
    return;
  }
  
  console.log('Command palette initialized');
  
  // Set initial data
  if (window.commandData) {
    try {
      ninjaKeys.data = window.commandData;
      console.log('Command data loaded');
    } catch (e) {
      console.error('Error setting command data:', e);
    }
  } else {
    console.error('Command data not available');
  }
  
  // Add theme change listener if you support dark/light modes
  const htmlEl = document.querySelector('html');
  if (htmlEl) {
    const observer = new MutationObserver(() => {
      const darkMode = htmlEl.dataset.theme === 'dark';
      ninjaKeys.setAttribute('theme', darkMode ? 'dark' : 'light');
    });
    observer.observe(htmlEl, { attributes: true });
    
    // Set initial theme
    const darkMode = htmlEl.dataset.theme === 'dark' || 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    ninjaKeys.setAttribute('theme', darkMode ? 'dark' : 'light');
  }
  
  // Add context-aware commands based on current page
  addContextCommands();
  
  // Mark as initialized in case it's not already
  if (!window.ninjaKeysInitialized) {
    window.ninjaKeysInitialized = true;
    ninjaKeys.classList.add('ninja-initialized');
  }
}

// Function to open the command palette
function openCommandPalette() {
  console.log('Opening command palette');
  
  // If on mobile and navbar is expanded, collapse it
  const navbarToggler = document.querySelector('.s-header__menu-toggle');
  const navbarCollapse = document.querySelector('.s-header__nav');
  if (navbarToggler && navbarCollapse && navbarCollapse.classList.contains('s-header__nav--is-visible')) {
    navbarToggler.click();
  }
  
  // Use the global function if available
  if (typeof window.openNinjaKeys === 'function') {
    window.openNinjaKeys();
    return;
  }
  
  // Fallback to direct method
  const ninjaKeys = document.querySelector('ninja-keys#command-palette');
  if (ninjaKeys) {
    if (typeof ninjaKeys.open === 'function') {
      console.log('Opening ninja-keys modal');
      try {
        ninjaKeys.open();
      } catch (e) {
        console.error('Error opening ninja-keys:', e);
      }
    } else {
      console.error('ninja-keys open method is not available');
      // Try to make it work anyway by dispatching a custom event
      try {
        ninjaKeys.dispatchEvent(new CustomEvent('hotkeys', { detail: { key: '/' } }));
      } catch (e) {
        console.error('Failed to dispatch hotkeys event:', e);
      }
    }
  } else {
    console.error('Command palette element not found when trying to open');
  }
}

// Add page-specific commands based on the current URL
function addContextCommands() {
  // Get the current path
  const currentPath = window.location.pathname;
  let contextCommands = [];
  
  // Research page specific commands
  if (currentPath.includes('/research')) {
    contextCommands = [
      {
        id: "filter-research",
        title: "Filter Research by Tag",
        handler: () => { 
          // Focus on the filter input if it exists
          const filterInput = document.querySelector('.research-filter-input');
          if (filterInput) filterInput.focus();
        },
        section: "Page Actions",
        shortcuts: ["f t"],
        icon: '<i class="fa-solid fa-filter"></i>'
      }
    ];
  } 
  // Team page specific commands
  else if (currentPath.includes('/team')) {
    contextCommands = [
      {
        id: "email-team",
        title: "Contact Team",
        handler: () => { window.location.href = '/join'; },
        section: "Page Actions",
        shortcuts: ["c t"],
        icon: '<i class="fa-solid fa-envelope"></i>'
      }
    ];
  }
  // Teaching page specific commands
  else if (currentPath.includes('/teaching')) {
    contextCommands = [
      {
        id: "sort-courses",
        title: "Sort Courses by Date",
        handler: () => {
          // Trigger sorting function if it exists
          if (typeof sortCoursesByDate === 'function') {
            sortCoursesByDate();
          }
        },
        section: "Page Actions",
        shortcuts: ["s d"],
        icon: '<i class="fa-solid fa-sort"></i>'
      }
    ];
  }
  
  // Add context commands to ninja-keys if there are any
  if (contextCommands.length > 0) {
    const ninjaKeys = document.querySelector('ninja-keys#command-palette');
    if (ninjaKeys && window.commandData) {
      // Combine context commands with global commands
      ninjaKeys.data = [...contextCommands, ...window.commandData];
    }
  }
}

// Recent commands tracking
let recentCommands = [];

function trackCommandUsage(commandId) {
  // Add to recent commands
  recentCommands.unshift(commandId);
  // Keep only the last 5 commands
  recentCommands = recentCommands.slice(0, 5);
  // Save to localStorage
  localStorage.setItem('recentCommands', JSON.stringify(recentCommands));
  
  // Update the command palette data to show recent commands
  updateCommandPaletteWithRecent();
}

function updateCommandPaletteWithRecent() {
  const savedRecent = localStorage.getItem('recentCommands');
  if (savedRecent && window.commandData) {
    recentCommands = JSON.parse(savedRecent);
    
    // Find the existing commands
    const recentCommandObjects = recentCommands.map(id => {
      return window.commandData.find(cmd => cmd.id === id);
    }).filter(Boolean);
    
    // Only add the section if we have recent commands
    if (recentCommandObjects.length > 0) {
      // Create a "Recent" section
      const recentSection = {
        id: "recent-section",
        title: "Recent Commands",
        section: "Recent",
        children: recentCommandObjects.map(cmd => cmd.id)
      };
      
      // Add to ninja-keys
      const ninjaKeys = document.querySelector('ninja-keys#command-palette');
      if (ninjaKeys) {
        // Add recent commands at the top
        const updatedData = [
          ...recentCommandObjects.map(cmd => ({...cmd, section: "Recent"})), 
          ...window.commandData
        ];
        ninjaKeys.data = updatedData;
      }
    }
  }
}

// Add direct event listeners for the keyboard shortcut and button
function setupCommandPaletteEvents() {
  console.log('Setting up command palette events');
  
  // Use a try-catch block to prevent errors from breaking the page
  try {
    // Register keyboard shortcut without relying on hotkeys library
    document.addEventListener('keydown', function(event) {
      // For Mac: Command + /
      // For Windows/Linux: Ctrl + /
      if ((event.metaKey || event.ctrlKey) && event.key === '/') {
        event.preventDefault();
        openCommandPalette();
      }
    });
    
    // Add click event to the command palette button
    const commandPaletteBtn = document.getElementById('command-palette-btn');
    if (commandPaletteBtn) {
      console.log('Command palette button found');
      commandPaletteBtn.addEventListener('click', function(e) {
        e.preventDefault();
        openCommandPalette();
      });
    } else {
      console.error('Command palette button not found');
    }
  } catch (e) {
    console.error('Error setting up command palette events:', e);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM content loaded - initializing command palette');
  
  // Wait a bit to ensure custom elements are defined
  setTimeout(function() {
    // Initialize the command palette
    initCommandPalette();
    
    // Load recent commands if available
    updateCommandPaletteWithRecent();
    
    // Setup events
    setupCommandPaletteEvents();
    
    // Also use the hotkeys library if available
    if (typeof hotkeys !== 'undefined') {
      console.log('Hotkeys library found, setting up shortcuts');
      hotkeys('ctrl+/,command+/', function(event, handler) {
        event.preventDefault();
        openCommandPalette();
      });
    } else {
      console.warn('Hotkeys library not found, using fallback keyboard event listener');
    }
    
    // Define the open method on the ninja-keys element if it doesn't exist
    const ninjaKeys = document.querySelector('ninja-keys#command-palette');
    if (ninjaKeys && typeof ninjaKeys.open !== 'function') {
      console.warn('Defining open method on ninja-keys element');
      // This is a fallback solution in case the component doesn't load properly
      ninjaKeys.open = function() {
        this.setAttribute('open', '');
        this.style.display = 'block';
        this.classList.add('ninja-visible');
      };
    }
  }, 500);
}); 