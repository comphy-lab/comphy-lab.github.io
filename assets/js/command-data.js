// Command data for website command palette
/* global sortCoursesByDate */
(function () {
  // Initialize command data

  const openExternalUrl = (url) => {
    const externalWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (externalWindow) {
      externalWindow.opener = null;
    }
  };

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
        openExternalUrl("https://github.com/comphy-lab");
      },

      section: "External Links",
      icon: '<i class="fa-brands fa-github"></i>',
    },
    {
      id: "scholar",
      title: "Visit Google Scholar",
      handler: () => {
        openExternalUrl(
          "https://scholar.google.com/citations?user=tHb_qZoAAAAJ&hl=en"
        );
      },

      section: "External Links",
      icon: '<i class="ai ai-google-scholar"></i>',
    },
    {
      id: "youtube",
      title: "Visit YouTube Channel",
      handler: () => {
        openExternalUrl("https://www.youtube.com/@CoMPhyLab");
      },

      section: "External Links",
      icon: '<i class="fa-brands fa-youtube"></i>',
    },
    {
      id: "bluesky",
      title: "Visit Bluesky",
      handler: () => {
        openExternalUrl("https://bsky.app/profile/comphy-lab.org");
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
        openExternalUrl(
          "https://github.com/comphy-lab/comphy-lab.github.io"
        );
      },

      section: "Help",
      icon: '<i class="fa-brands fa-github"></i>',
    },

    // ==========================================================
    // Quick actions — paired with v2 palette behaviour
    // ==========================================================
    {
      id: "action-email-pi",
      title: "Email the PI (vatsal.sanjay@durham.ac.uk)",
      handler: () => {
        window.location.href = "mailto:vatsal.sanjay@durham.ac.uk";
      },
      section: "Actions",
      icon: '<i class="fa-solid fa-envelope"></i>',
    },
    {
      id: "action-toggle-theme",
      title: "Toggle light / dark theme",
      handler: () => {
        const toggle = document.getElementById("theme-toggle");
        if (toggle) toggle.click();
      },
      section: "Actions",
      icon: '<i class="fa-solid fa-circle-half-stroke"></i>',
    },
    {
      id: "action-open-scholar",
      title: "Open Google Scholar · Sanjay",
      handler: () => {
        openExternalUrl(
          "https://scholar.google.com/citations?user=tHb_qZoAAAAJ&hl=en"
        );
      },
      section: "Actions",
      icon: '<i class="ai ai-google-scholar"></i>',
    },
    {
      id: "action-open-github",
      title: "Open GitHub · CoMPhy Lab",
      handler: () => {
        openExternalUrl("https://github.com/comphy-lab");
      },
      section: "Actions",
      icon: '<i class="fa-brands fa-github"></i>',
    },
    {
      id: "action-durham-staff",
      title: "Open Durham staff page · Vatsal Sanjay",
      handler: () => {
        openExternalUrl("https://www.durham.ac.uk/staff/vatsal-sanjay/");
      },
      section: "Actions",
      icon: '<i class="fa-solid fa-university"></i>',
    },

    // ==========================================================
    // Papers — deep-links into /research#N anchors, curated from
    // the real paper list. Ordered by recency + impact.
    // ==========================================================
    {
      id: "paper-impacting-spheres",
      title: "Impacting spheres: from liquid drops to elastic beads (Soft Matter 2026, cover)",
      handler: () => {
        window.location.href = "/research#23";
      },
      section: "Papers",
      icon: '<i class="fa-solid fa-file-lines"></i>',
    },
    {
      id: "paper-holes-sheets",
      title: "Holes in Sheets: double-threshold rupture of draining films (PRL 2026)",
      handler: () => {
        window.location.href = "/research#22";
      },
      section: "Papers",
      icon: '<i class="fa-solid fa-file-lines"></i>',
    },
    {
      id: "paper-stood-up-drop",
      title: "Stood-up Drop to Determine Receding Contact Angles (Soft Matter 2026)",
      handler: () => {
        window.location.href = "/research#21";
      },
      section: "Papers",
      icon: '<i class="fa-solid fa-file-lines"></i>',
    },
    {
      id: "paper-viscoelastic-worthington",
      title: "Viscoelastic Worthington Jets and Droplets (JFM 2025)",
      handler: () => {
        window.location.href = "/research#16";
      },
      section: "Papers",
      icon: '<i class="fa-solid fa-file-lines"></i>',
    },
    {
      id: "paper-unifying-scaling",
      title: "Unifying theory of scaling in drop impact (PRL 2025)",
      handler: () => {
        window.location.href = "/research#15";
      },
      section: "Papers",
      icon: '<i class="fa-solid fa-file-lines"></i>',
    },
    {
      id: "paper-viscosity-impact",
      title: "Role of viscosity on drop impact forces on non-wetting surfaces (JFM 2025)",
      handler: () => {
        window.location.href = "/research#14";
      },
      section: "Papers",
      icon: '<i class="fa-solid fa-file-lines"></i>',
    },
    {
      id: "paper-evp-bubble",
      title: "Bursting bubble in an elastoviscoplastic medium (JFM 2024)",
      handler: () => {
        window.location.href = "/research#12";
      },
      section: "Papers",
      icon: '<i class="fa-solid fa-file-lines"></i>',
    },
    {
      id: "paper-bouncing-drop",
      title: "When does an impacting drop stop bouncing? (JFM 2023)",
      handler: () => {
        window.location.href = "/research#11";
      },
      section: "Papers",
      icon: '<i class="fa-solid fa-file-lines"></i>',
    },
    {
      id: "paper-taylor-culick",
      title: "Taylor–Culick retractions and the influence of the surroundings (JFM 2022)",
      handler: () => {
        window.location.href = "/research#9";
      },
      section: "Papers",
      icon: '<i class="fa-solid fa-file-lines"></i>',
    },
    {
      id: "paper-viscoplastic-bubble",
      title: "Bursting bubble in a viscoplastic medium (JFM 2021)",
      handler: () => {
        window.location.href = "/research#7";
      },
      section: "Papers",
      icon: '<i class="fa-solid fa-file-lines"></i>',
    },

    // ==========================================================
    // People — deep-links into /team#slug anchors.
    // ==========================================================
    {
      id: "person-vatsal-sanjay",
      title: "Vatsal Sanjay — PI · Assistant Professor, Durham",
      handler: () => {
        window.location.href = "/team/#vatsal-sanjay";
      },
      section: "People",
      icon: '<i class="fa-solid fa-user"></i>',
    },
    {
      id: "person-ayush-dixit",
      title: "Ayush Dixit — PhD student · Univ. Twente",
      handler: () => {
        window.location.href = "/team/#ayush-dixit";
      },
      section: "People",
      icon: '<i class="fa-solid fa-user"></i>',
    },
    {
      id: "person-aman-bhargava",
      title: "Aman Bhargava — PhD student · Univ. Twente",
      handler: () => {
        window.location.href = "/team/#aman-bhargava";
      },
      section: "People",
      icon: '<i class="fa-solid fa-user"></i>',
    },
    {
      id: "person-jnandeep-talukdar",
      title: "Jnandeep Talukdar — PhD student · Univ. Twente",
      handler: () => {
        window.location.href = "/team/#jnandeep-talukdar";
      },
      section: "People",
      icon: '<i class="fa-solid fa-user"></i>',
    },
    {
      id: "person-saumili-jana",
      title: "Saumili Jana — PhD student · Univ. Twente",
      handler: () => {
        window.location.href = "/team/#saumili-jana";
      },
      section: "People",
      icon: '<i class="fa-solid fa-user"></i>',
    },
    {
      id: "person-peter-croxford",
      title: "Peter Croxford — Student · Durham",
      handler: () => {
        window.location.href = "/team/#peter-croxford";
      },
      section: "People",
      icon: '<i class="fa-solid fa-user"></i>',
    },
    {
      id: "person-detlef-lohse",
      title: "Detlef Lohse — Collaborator · Univ. Twente",
      handler: () => {
        window.location.href = "/team/#prof-detlef-lohse";
      },
      section: "People",
      icon: '<i class="fa-solid fa-user-group"></i>',
    },
    {
      id: "person-jacco-snoeijer",
      title: "Jacco Snoeijer — Collaborator · Univ. Twente",
      handler: () => {
        window.location.href = "/team/#prof-jacco-snoeijer";
      },
      section: "People",
      icon: '<i class="fa-solid fa-user-group"></i>',
    },
    {
      id: "person-john-kolinski",
      title: "John Kolinski — Collaborator · EPFL",
      handler: () => {
        window.location.href = "/team/#dr-john-kolinski";
      },
      section: "People",
      icon: '<i class="fa-solid fa-user-group"></i>',
    },

    // ==========================================================
    // Recent news
    // ==========================================================
    {
      id: "news-durham-move",
      title: "Lab moved to Durham University (July 2025)",
      handler: () => {
        window.location.href = "/news/";
      },
      section: "News",
      icon: '<i class="fa-solid fa-graduation-cap"></i>',
    },
    {
      id: "news-khmw-award",
      title: "Jnandeep Talukdar wins KHMW Young Talent Award (Nov 2025)",
      handler: () => {
        window.location.href = "/news/";
      },
      section: "News",
      icon: '<i class="fa-solid fa-award"></i>',
    },
    {
      id: "news-aps-talk",
      title: "APS talk — Respiratory droplets (Feb 2026)",
      handler: () => {
        openExternalUrl("https://www.youtube.com/watch?v=uFP5K9i8ah8");
      },
      section: "News",
      icon: '<i class="fa-solid fa-microphone"></i>',
    },
    {
      id: "news-archive",
      title: "Browse the full news archive",
      handler: () => {
        window.location.href = "/news/";
      },
      section: "News",
      icon: '<i class="fa-solid fa-rss"></i>',
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
            const tagElements = document.querySelectorAll(".tags span");
            const tags = new Set();
            tagElements.forEach((tag) => {
              tags.add(tag.textContent);
            });

            const modalContent = document.createElement("div");

            const heading = document.createElement("h2");
            heading.style.marginTop = "0";
            heading.textContent = "Filter Research by Tag";
            modalContent.appendChild(heading);

            const tagContainer = document.createElement("div");
            tagContainer.className = "tag-filter-container";
            tagContainer.style.display = "flex";
            tagContainer.style.flexWrap = "wrap";
            tagContainer.style.gap = "10px";
            tagContainer.style.margin = "20px 0";
            modalContent.appendChild(tagContainer);

            tags.forEach((tag) => {
              const button = document.createElement("button");
              button.className = "tag-filter-btn";
              button.type = "button";
              button.style.padding = "8px 12px";
              button.style.backgroundColor = "#5b79a8";
              button.style.color = "white";
              button.style.border = "none";
              button.style.borderRadius = "4px";
              button.style.cursor = "pointer";
              button.style.margin = "5px";
              button.textContent = tag;
              tagContainer.appendChild(button);
            });

            const instructions = document.createElement("p");
            instructions.style.marginTop = "15px";
            instructions.style.fontSize = "0.9em";
            instructions.style.textAlign = "center";
            instructions.style.color = "#888";
            instructions.textContent =
              "Use arrow keys to navigate, Enter to select, and Esc to close.";
            modalContent.appendChild(instructions);

            const closeWrapper = document.createElement("div");
            closeWrapper.style.textAlign = "center";
            closeWrapper.style.marginTop = "20px";

            const closeButton = document.createElement("button");
            closeButton.id = "close-tag-filter";
            closeButton.type = "button";
            closeButton.style.padding = "8px 16px";
            closeButton.style.backgroundColor = "#333";
            closeButton.style.color = "white";
            closeButton.style.border = "none";
            closeButton.style.borderRadius = "4px";
            closeButton.style.cursor = "pointer";
            closeButton.textContent = "Close";
            closeWrapper.appendChild(closeButton);
            modalContent.appendChild(closeWrapper);

            // Create modal using shared utility
            const modal = Utils.createModal({
              content: modalContent,
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
                  document.querySelectorAll(".tags span")
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
