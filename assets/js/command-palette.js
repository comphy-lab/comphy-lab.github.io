/**
 * Command Palette functionality for CoMPhy Lab website
 * This file contains all the functionality for the command palette
 */
/* global Fuse */

// Make the command palette opening function globally available
window.openCommandPalette = function () {
  const palette = document.getElementById("simple-command-palette");
  if (palette) {
    palette.style.display = "block";
    const input = document.getElementById("command-palette-input");
    if (input) {
      input.value = "";
      input.focus();
      if (typeof renderCommandResults === "function") {
        renderCommandResults("");
      }
    }
  }
};

/**
 * Renders the command palette results based on the provided search query.
 *
 * Filters available commands by title or section, groups them by section, and displays them in the command palette UI. If the query is at least 3 characters and a search database is available, performs an asynchronous search to include additional results under a "Search Results" section. Displays a message if no commands are found.
 *
 * @param {string} query - The search string used to filter and search commands.
 */
function renderCommandResults(query) {
  const resultsContainer = document.getElementById("command-palette-results");
  if (!resultsContainer) return;

  // Clear results
  resultsContainer.innerHTML = "";

  // Get commands
  const commands = window.commandData || [];

  // Filter commands based on query
  const filteredCommands = query
    ? commands.filter(
        (cmd) =>
          cmd.title.toLowerCase().includes(query.toLowerCase()) ||
          (cmd.section &&
            cmd.section.toLowerCase().includes(query.toLowerCase()))
      )
    : commands;

  // Group by section
  const sections = {};
  filteredCommands.forEach((cmd) => {
    if (!sections[cmd.section]) {
      sections[cmd.section] = [];
    }
    sections[cmd.section].push(cmd);
  });

  // If query is at least 3 characters, search the database as well
  if (query && query.length >= 3 && window.SearchManager) {
    // Use the centralized search manager
    window.SearchManager.searchForCommandPalette(query)
      .then((searchResults) => {
        if (searchResults && searchResults.length > 0) {
          // Add search results to sections
          sections["Search Results"] = searchResults;

          // Re-render the UI with search results
          renderSections(sections, resultsContainer);
        }
      })
      .catch((err) => {
        console.error("Error searching database:", err);
      });
  }

  // Render the sections we have now (this will be called immediately, and again if search results come in)
  renderSections(sections, resultsContainer);

  // Show message if no results
  if (Object.keys(sections).length === 0) {
    const noResults = document.createElement("div");
    noResults.className = "command-palette-no-results";
    noResults.textContent = "No commands found";
    resultsContainer.appendChild(noResults);
  }
}

/**
 * Renders grouped command sections into a container element for the command palette UI.
 *
 * Each section is displayed with its title and a list of commands. Commands show their icon, title, and an optional excerpt. Clicking a command hides the palette and invokes its handler if defined.
 *
 * @param {Object} sections - An object mapping section names to arrays of command objects.
 * @param {HTMLElement} container - The DOM element where sections will be rendered.
 */
function renderSections(sections, container) {
  // Clear container first
  container.innerHTML = "";

  // Create DOM elements for results
  Object.keys(sections).forEach((section) => {
    const sectionEl = document.createElement("div");
    sectionEl.className = "command-palette-section";

    const sectionTitle = document.createElement("div");
    sectionTitle.className = "command-palette-section-title";
    sectionTitle.textContent = section;
    sectionEl.appendChild(sectionTitle);

    const commandsList = document.createElement("div");
    commandsList.className = "command-palette-commands";

    sections[section].forEach((cmd) => {
      const cmdEl = document.createElement("div");
      cmdEl.className = "command-palette-command";

      let cmdContent = `
        <div class="command-palette-icon">${cmd.icon || ""}</div>
        <div class="command-palette-title">${cmd.title}</div>
      `;

      // Add excerpt for search results if available
      if (cmd.excerpt) {
        cmdContent += `<div class="command-palette-excerpt">${cmd.excerpt.substring(
          0,
          120
        )}${cmd.excerpt.length > 120 ? "..." : ""}</div>`;
      }

      cmdEl.innerHTML = cmdContent;

      cmdEl.addEventListener("click", function () {
        if (typeof cmd.handler === "function") {
          document.getElementById("simple-command-palette").style.display =
            "none";
          cmd.handler();
        }
      });

      commandsList.appendChild(cmdEl);
    });

    sectionEl.appendChild(commandsList);
    container.appendChild(sectionEl);
  });
}

/**
 * Initializes the command palette UI, search integration, and keyboard shortcuts on DOM load.
 *
 * Sets up event listeners for opening and closing the palette, handling user input, keyboard navigation, and command execution. Prefetches and configures the search database for fuzzy searching if available.
 *
 * @remark If the search database cannot be loaded, search functionality will be unavailable, but the command palette UI will still function.
 */
function initCommandPalette() {
  // Search database initialization is now handled by SearchManager
  // which auto-prefetches on document load

  // Set up backdrop click to close
  const backdrop = document.querySelector(".simple-command-palette-backdrop");
  if (backdrop) {
    backdrop.addEventListener("click", function () {
      document.getElementById("simple-command-palette").style.display = "none";
    });
  }

  // Set up input handler
  const input = document.getElementById("command-palette-input");
  if (input) {
    input.addEventListener("input", function () {
      renderCommandResults(this.value);
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        document.getElementById("simple-command-palette").style.display =
          "none";
      } else if (e.key === "Enter") {
        const selectedCommand = document.querySelector(
          ".command-palette-command.selected"
        );
        if (selectedCommand) {
          selectedCommand.click();
        } else {
          const firstCommand = document.querySelector(
            ".command-palette-command"
          );
          if (firstCommand) {
            firstCommand.click();
          }
        }
      } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();

        const commands = Array.from(
          document.querySelectorAll(".command-palette-command")
        );
        if (commands.length === 0) return;

        const currentSelected = document.querySelector(
          ".command-palette-command.selected"
        );
        let nextIndex = 0;

        if (currentSelected) {
          const currentIndex = commands.indexOf(currentSelected);
          currentSelected.classList.remove("selected");

          if (e.key === "ArrowDown") {
            nextIndex = (currentIndex + 1) % commands.length;
          } else {
            nextIndex = (currentIndex - 1 + commands.length) % commands.length;
          }
        } else {
          nextIndex = e.key === "ArrowDown" ? 0 : commands.length - 1;
        }

        commands[nextIndex].classList.add("selected");

        // Ensure the selected element is visible in the scroll view
        commands[nextIndex].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    });
  }

  // Register command palette keyboard shortcut
  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      window.openCommandPalette();
    }
  });

  // Make command palette button work
  const commandPaletteBtn = document.getElementById("command-palette-btn");
  if (commandPaletteBtn) {
    commandPaletteBtn.addEventListener("click", function (e) {
      e.preventDefault();
      window.openCommandPalette();
    });
  }
}

// Run initialization when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Initialize the command palette
  initCommandPalette();

  // Show appropriate shortcut text based on platform using shared utility
  Utils.updatePlatformSpecificElements();

  // Set the appropriate shortcut hint based on platform
  const shortcutHint = document.getElementById("command-palette-shortcut");
  if (shortcutHint) {
    shortcutHint.textContent = Utils.isMacPlatform() ? "⌘K" : "Ctrl+K";
  }

  // Ensure command palette button works correctly
  const commandPaletteBtn = document.getElementById("command-palette-btn");
  if (commandPaletteBtn) {
    // Command palette button initialized with styling

    // Make sure the button retains focus styles
    commandPaletteBtn.addEventListener("focus", function () {
      this.classList.add("focused");
    });

    commandPaletteBtn.addEventListener("blur", function () {
      this.classList.remove("focused");
    });
  }
});

// Make functions available globally
window.renderCommandResults = renderCommandResults;
window.renderSections = renderSections;

// Search functionality is now handled by SearchManager
// Backwards compatibility maintained through SearchManager exports
