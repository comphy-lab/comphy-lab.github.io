// Command data for website command palette
/* global Fuse, sortCoursesByDate */
(function () {
  // Initialize command data

  // Define the command data
  window.commandData = [
    // Navigation commands
    {
      id: "home",
      title: "Go to Home",
      handler: () => {
        window.location.href = "/";
      },
      section: "Navigation",
      icon: '<i class="fa-solid fa-home"></i>',
    },
    {
      id: "team",
      title: "Go to Team Page",
      handler: () => {
        window.location.href = "/team/";
      },
      section: "Navigation",
      icon: '<i class="fa-solid fa-users"></i>',
    },
    {
      id: "research",
      title: "Go to Research Page",
      handler: () => {
        window.location.href = "/research";
      },
      section: "Navigation",
      icon: '<i class="fa-solid fa-flask"></i>',
    },
    {
      id: "teaching",
      title: "Go to Teaching Page",
      handler: () => {
        window.location.href = "/teaching";
      },
      section: "Navigation",
      icon: '<i class="fa-solid fa-chalkboard-teacher"></i>',
    },
    {
      id: "join",
      title: "Go to Join Us Page",
      handler: () => {
        window.location.href = "/join";
      },
      section: "Navigation",
      icon: '<i class="fa-solid fa-handshake"></i>',
    },
    {
      id: "blog",
      title: "Go to Blog",
      handler: () => {
        window.location.href = "https://blogs.comphy-lab.org/";
      },

      section: "Navigation",
      icon: '<i class="fa-solid fa-rss"></i>',
    },
    {
      id: "back",
      title: "Go Back",
      handler: () => {
        window.history.back();
      },
      section: "Navigation",
      icon: '<i class="fa-solid fa-arrow-left"></i>',
    },
    {
      id: "forward",
      title: "Go Forward",
      handler: () => {
        window.history.forward();
      },
      section: "Navigation",
      icon: '<i class="fa-solid fa-arrow-right"></i>',
    },

    // External links
    {
      id: "github",
      title: "Visit GitHub",
      handler: () => {
        window.open("https://github.com/comphy-lab", "_blank");
      },

      section: "External Links",
      icon: '<i class="fa-brands fa-github"></i>',
    },
    {
      id: "scholar",
      title: "Visit Google Scholar",
      handler: () => {
        window.open(
          "https://scholar.google.com/citations?user=tHb_qZoAAAAJ&hl=en",
          "_blank"
        );
      },

      section: "External Links",
      icon: '<i class="ai ai-google-scholar"></i>',
    },
    {
      id: "youtube",
      title: "Visit YouTube Channel",
      handler: () => {
        window.open("https://www.youtube.com/@CoMPhyLab", "_blank");
      },

      section: "External Links",
      icon: '<i class="fa-brands fa-youtube"></i>',
    },
    {
      id: "bluesky",
      title: "Visit Bluesky",
      handler: () => {
        window.open("https://bsky.app/profile/comphy-lab.org", "_blank");
      },

      section: "External Links",
      icon: '<i class="fa-brands fa-bluesky"></i>',
    },

    // Tools
    {
      id: "top",
      title: "Scroll to Top",
      handler: () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      section: "Tools",
      icon: '<i class="fa-solid fa-arrow-up"></i>',
    },
    {
      id: "bottom",
      title: "Scroll to Bottom",
      handler: () => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      },

      section: "Tools",
      icon: '<i class="fa-solid fa-arrow-down"></i>',
    },

    // Help commands
    {
      id: "repository",
      title: "View Website Repository",
      handler: () => {
        window.open(
          "https://github.com/comphy-lab/comphy-lab.github.io",
          "_blank"
        );
      },

      section: "Help",
      icon: '<i class="fa-brands fa-github"></i>',
    },
  ];

  // Command data loaded successfully

  // Define the displayShortcutsHelp function globally
  window.displayShortcutsHelp = function () {
    // Create and display shortcut help modal using shared utility
    const darkMode =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    // Group commands by section
    const sections = {};
    window.commandData.forEach((command) => {
      if (!sections[command.section]) {
        sections[command.section] = [];
      }
      sections[command.section].push(command);
    });

    let html = '<h2 style="margin-top: 0;">Commands</h2>';
    const shortcutKey = Utils.isMacPlatform() ? "⌘K" : "Ctrl+K";
    html += `<p>Press ${shortcutKey} to open the command palette</p>`;

    // Add each section and its commands
    Object.keys(sections).forEach((section) => {
      html += `<h3>${section}</h3>`;
      html += '<table style="width: 100%; border-collapse: collapse;">';
      html +=
        '<tr><th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Command</th></tr>';

      sections[section].forEach((command) => {
        html += `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${command.icon} ${command.title}</td>
        </tr>`;
      });

      html += "</table>";
    });

    // Add close button
    html +=
      '<div style="text-align: center; margin-top: 20px;"><button id="close-shortcuts-help" style="padding: 8px 16px; background-color: #5b79a8; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button></div>';

    // Create modal using shared utility
    const modal = Utils.createModal({
      content: html,
      darkMode: darkMode,
    });

    document.body.appendChild(modal);

    // Add event listener to close
    document
      .getElementById("close-shortcuts-help")
      .addEventListener("click", () => {
        modal.closeModal();
      });
  };

  // Search database integration is now handled by SearchManager
  // Backwards compatibility maintained through SearchManager exports

  // Add page-specific command function
  window.addContextCommands = function () {
    // Get the current path
    const currentPath = window.location.pathname;
    let contextCommands = [];

    // Research page specific commands
    if (currentPath.includes("/research")) {
      contextCommands = [
        {
          id: "filter-research",
          title: "Filter Research by Tag",
          handler: () => {
            // Check for dark mode
            const darkMode =
              window.matchMedia &&
              window.matchMedia("(prefers-color-scheme: dark)").matches;

            // Collect all unique tags from the page
            const tagElements = document.querySelectorAll("tags span");
            const tags = new Set();
            tagElements.forEach((tag) => {
              tags.add(tag.textContent);
            });

            let html = '<h2 style="margin-top: 0;">Filter Research by Tag</h2>';
            html +=
              '<div class="tag-filter-container" style="display: flex; flex-wrap: wrap; gap: 10px; margin: 20px 0;">';

            // Add clickable tag buttons
            tags.forEach((tag) => {
              html += `<button class="tag-filter-btn" style="padding: 8px 12px; background-color: #5b79a8; color: white; border: none; border-radius: 4px; cursor: pointer; margin: 5px;">${tag}</button>`;
            });

            html += "</div>";

            // Add keyboard navigation info
            html += `<div style="margin-top: 15px; font-size: 0.9em; text-align: center; color: #888;">
              <span style="margin-right: 15px;"><kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
              <span style="margin-right: 15px;"><kbd>enter</kbd> to select</span>
              <span><kbd>esc</kbd> to close</span>
            </div>`;

            // Add close button
            html +=
              '<div style="text-align: center; margin-top: 20px;"><button id="close-tag-filter" style="padding: 8px 16px; background-color: #333; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button></div>';

            // Create modal using shared utility
            const modal = Utils.createModal({
              content: html,
              darkMode: darkMode,
            });

            document.body.appendChild(modal);

            // Get content element for focus and event handling
            const content = modal.querySelector('div[tabindex="-1"]');

            // Get all tag buttons
            const tagButtons = content.querySelectorAll(".tag-filter-btn");
            let selectedButtonIndex = 0;

            // Function to update the visual selection
            const updateSelectedButton = (newIndex) => {
              // Remove selection from all buttons
              tagButtons.forEach((btn) => {
                btn.style.outline = "none";
                btn.style.boxShadow = "none";
              });

              // Add selection to the current button
              if (tagButtons[newIndex]) {
                tagButtons[newIndex].style.outline = "2px solid white";
                tagButtons[newIndex].style.boxShadow =
                  "0 0 5px rgba(255, 255, 255, 0.5)";

                // Make sure the selected button is visible
                tagButtons[newIndex].scrollIntoView({
                  behavior: "smooth",
                  block: "nearest",
                });
              }
            };

            // Select the first button initially
            if (tagButtons.length > 0) {
              updateSelectedButton(selectedButtonIndex);
            }

            // Add event listeners to tag buttons
            tagButtons.forEach((btn, index) => {
              // Mouse hover should update selection
              btn.addEventListener("mouseenter", () => {
                selectedButtonIndex = index;
                updateSelectedButton(selectedButtonIndex);
              });

              btn.addEventListener("click", () => {
                // Find the actual tag in the document and simulate a click on it
                const tagText = btn.textContent;
                const matchingTag = Array.from(
                  document.querySelectorAll("tags span")
                ).find((tag) => tag.textContent === tagText);

                if (matchingTag) {
                  // Close the modal first
                  modal.closeModal();
                  // Then trigger the click
                  matchingTag.click();
                }
              });
            });

            // Add keyboard navigation
            content.addEventListener("keydown", (e) => {
              const buttonRows = 4; // Approximate number of buttons per row
              const numButtons = tagButtons.length;

              if (e.key === "Escape") {
                // Close the modal
                modal.closeModal();
              } else if (e.key === "Enter") {
                // Click the selected button
                if (tagButtons[selectedButtonIndex]) {
                  tagButtons[selectedButtonIndex].click();
                }
              } else if (e.key === "ArrowRight") {
                e.preventDefault();
                selectedButtonIndex = (selectedButtonIndex + 1) % numButtons;
                updateSelectedButton(selectedButtonIndex);
              } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                selectedButtonIndex =
                  (selectedButtonIndex - 1 + numButtons) % numButtons;
                updateSelectedButton(selectedButtonIndex);
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                // Move down by approximate number of buttons per row
                selectedButtonIndex = Math.min(
                  selectedButtonIndex + buttonRows,
                  numButtons - 1
                );
                updateSelectedButton(selectedButtonIndex);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                // Move up by approximate number of buttons per row
                selectedButtonIndex = Math.max(
                  selectedButtonIndex - buttonRows,
                  0
                );
                updateSelectedButton(selectedButtonIndex);
              }
            });

            // Add event listener to close button
            document
              .getElementById("close-tag-filter")
              .addEventListener("click", () => {
                modal.closeModal();
              });

            // Focus the content element to capture keyboard events
            content.focus();
          },
          section: "Page Actions",
          icon: '<i class="fa-solid fa-filter"></i>',
        },
      ];
    }
    // Team page specific commands
    else if (currentPath.includes("/team")) {
      contextCommands = [
        {
          id: "contact-team",
          title: "Contact Team",
          handler: () => {
            window.location.href = "/join";
          },
          section: "Page Actions",
          icon: '<i class="fa-solid fa-envelope"></i>',
        },
      ];
    }
    // Teaching page specific commands
    else if (currentPath.includes("/teaching")) {
      contextCommands = [
        {
          id: "sort-courses",
          title: "Sort Courses by Date",
          handler: () => {
            // Trigger sorting function if it exists
            if (typeof sortCoursesByDate === "function") {
              sortCoursesByDate();
            }
          },
          section: "Page Actions",
          icon: '<i class="fa-solid fa-sort"></i>',
        },
      ];
    }

    // Add context commands if there are any
    if (contextCommands.length > 0) {
      // Combine context commands with global commands
      window.commandData = [...contextCommands, ...window.commandData];
    }
  };

  // Call addContextCommands automatically
  document.addEventListener("DOMContentLoaded", function () {
    window.addContextCommands();
  });
})();
