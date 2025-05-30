/* ===================================================================
 * Main JS
 * ------------------------------------------------------------------- */

(function () {
  "use strict";

  /* Preloader
   * -------------------------------------------------- */
  const preloader = document.querySelector("#preloader");
  if (preloader) {
    window.addEventListener("load", function () {
      document.querySelector("body").classList.remove("ss-preload");
      document.querySelector("body").classList.add("ss-loaded");
      preloader.style.display = "none";
    });
  }

  /* Load About Content - Only on main page
   * -------------------------------------------------- */
  const loadAboutContent = async () => {
    // Only load aboutCoMPhy.md if we"re on the main page
    if (
      window.location.pathname === "/" ||
      window.location.pathname === "/index.html"
    ) {
      try {
        const response = await fetch("/aboutCoMPhy.md");
        const text = await response.text();
        const aboutContent = document.getElementById("about-content");
        if (aboutContent) {
          // Sanitize HTML output from marked.parse() with DOMPurify before inserting into DOM
          const parsedHtml = marked.parse(text);
          const sanitizedHtml = DOMPurify.sanitize(parsedHtml);
          aboutContent.innerHTML = sanitizedHtml;
        }
      } catch (error) {
        console.error("Error loading about content:", error);
      }
    }
  };

  /* Load News Content - Only on main page
   * -------------------------------------------------- */
  const loadNewsContent = async () => {
    // Only load News.md if we"re on the main page
    if (
      window.location.pathname === "/" ||
      window.location.pathname === "/index.html"
    ) {
      try {
        const response = await fetch("/News.md");
        const text = await response.text();
        const newsContent = document.getElementById("news-content");
        if (newsContent) {
          // Parse the markdown content and sanitize before inserting into DOM
          const parsedHtml = marked.parse(text);
          const sanitizedHtml = DOMPurify.sanitize(parsedHtml);
          newsContent.innerHTML = sanitizedHtml;

          // Fix line breaks in list items after parsing
          const listItemParagraphs = newsContent.querySelectorAll("li p");
          listItemParagraphs.forEach((paragraph) => {
            paragraph.style.display = "inline";
            paragraph.style.margin = "0";
          });
        }
        // Add History button after all news items if newsContent exists
        const historyBtn = document.createElement("a");
        historyBtn.href = "/history";
        historyBtn.className = "s-news__history-btn";
        historyBtn.innerHTML =
          "<i class=\"fa-solid fa-arrow-right\" style=\"margin-right: 8px; font-size: 1.2em;\"></i>Archive";
        historyBtn.setAttribute("role", "button");
        historyBtn.setAttribute("tabindex", "0");
        historyBtn.setAttribute("aria-label", "View archive of all news items");

        // Add keyboard event handler for accessibility
        historyBtn.addEventListener("keydown", function (event) {
          // Check for Enter (13) or Space (32) key
          if (
            event.key === "Enter" ||
            event.key === " " ||
            event.keyCode === 13 ||
            event.keyCode === 32
          ) {
            event.preventDefault();
            window.location.href = this.href;
          }
        });

        if (newsContent) {
          newsContent.appendChild(historyBtn);
        }
      } catch (error) {
        console.error("Error loading news content:", error);
      }
    }
  };

  // No need for a resize event handler as the CSS will handle everything

  // Load about content when page loads
  window.addEventListener("load", loadAboutContent);
  // Load news content when page loads
  window.addEventListener("load", loadNewsContent);

  /* Load Featured Papers - Only on main page
   * -------------------------------------------------- */
  const loadFeaturedPapers = async () => {
    // Only load featured papers if we"re on the main page
    if (
      window.location.pathname === "/" ||
      window.location.pathname === "/index.html"
    ) {
      try {
        const response = await fetch("/research/");
        if (!response.ok) {
          throw new Error(
            `Failed to fetch research content: ${response.status} ${response.statusText}`
          );
        }

        const text = await response.text();

        // Create a temporary div to parse the HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = text;

        // Find all paper sections
        const paperSections = tempDiv.querySelectorAll("h3");
        let featuredSections = Array.from(paperSections).filter((section) => {
          // Find the next tags element
          let nextEl = section.nextElementSibling;
          while (nextEl && !nextEl.matches("tags")) {
            nextEl = nextEl.nextElementSibling;
          }
          return nextEl && nextEl.textContent.includes("Featured");
        });

        /** Only show up to two featured papers */
        featuredSections = featuredSections.slice(0, 2);

        // Get the featured container
        const featuredContainer = document.querySelector(
          ".featured-item__image"
        );
        if (featuredContainer) {
          // Clear existing content
          featuredContainer.innerHTML = "";

          // Create a wrapper for featured papers
          const wrapper = document.createElement("div");
          wrapper.className = "featured-papers";

          // Add each featured paper
          featuredSections.forEach((section) => {
            const paperDiv = document.createElement("div");
            paperDiv.className = "featured-paper";
            paperDiv.style.cursor = "pointer";

            // Get all content until the next h3 or end
            let content = [section.cloneNode(true)];
            let nextEl = section.nextElementSibling;

            while (nextEl && !nextEl.matches("h3")) {
              // Skip the Highlights section and its list
              if (
                nextEl.textContent.trim() === "Highlights" ||
                (nextEl.matches("ul") &&
                  nextEl.previousElementSibling &&
                  nextEl.previousElementSibling.textContent.trim() ===
                    "Highlights")
              ) {
                nextEl = nextEl.nextElementSibling;
                continue;
              }

              // Include everything else (tags, images, iframes)
              const clone = nextEl.cloneNode(true);

              // If it"s a tags element, make spans clickable
              if (clone.matches("tags")) {
                Array.from(clone.children).forEach((span) => {
                  span.style.cursor = "pointer";
                  span.addEventListener("click", (e) => {
                    e.stopPropagation(); // Prevent container click
                    window.location.href = `/research/?tag=${span.textContent.trim()}`;
                  });
                });
              }

              content.push(clone);
              nextEl = nextEl.nextElementSibling;
            }

            // Get the paper title for creating the anchor
            const title = content[0];
            const originalTitle = title.textContent;
            title.textContent = title.textContent.replace(/^\[\d+\]\s*/, "");

            content.forEach((el) => paperDiv.appendChild(el));

            // Make the entire container clickable
            paperDiv.addEventListener("click", (e) => {
              // Don"t navigate if clicking on a link, tag, or iframe
              if (
                e.target.closest("a") ||
                e.target.closest("tags") ||
                e.target.closest("iframe")
              ) {
                return;
              }

              // Extract paper number and navigate
              const paperNumber = originalTitle.match(/^\[(\d+)\]/)?.[1];
              if (paperNumber) {
                // Navigate to research page with the paper ID
                window.location.href = `/research/#${paperNumber}`;
              } else {
                window.location.href = "/research/";
              }
            });

            // Prevent iframe clicks from triggering container click
            const iframes = paperDiv.querySelectorAll("iframe");
            iframes.forEach((iframe) => {
              iframe.addEventListener("click", (e) => {
                e.stopPropagation();
              });
            });

            // Prevent link clicks from triggering container click
            const links = paperDiv.querySelectorAll("a");
            links.forEach((link) => {
              link.addEventListener("click", (e) => {
                e.stopPropagation();
              });
            });

            wrapper.appendChild(paperDiv);
          });

          featuredContainer.appendChild(wrapper);
        }
      } catch (error) {
        console.error("Error loading featured papers:", error);
        // Add visible error message in the featured section
        const featuredContainer = document.querySelector(
          ".featured-item__image"
        );
        if (featuredContainer) {
          featuredContainer.innerHTML = `
                        <div class="featured-error">
                            <p>We"re having trouble loading the featured papers. Please try refreshing the page or check back later.</p>
                        </div>
                    `;
        }
      }
    }
  };

  // Load featured papers when page loads
  window.addEventListener("load", loadFeaturedPapers);

  /* Mobile Menu
   * -------------------------------------------------- */
  const menuToggle = document.querySelector(".s-header__menu-toggle");
  const nav = document.querySelector(".s-header__nav");
  const closeBtn = document.querySelector(".s-header__nav-close-btn");
  const menuLinks = document.querySelectorAll(".s-header__nav-list a");

  // Handle click outside
  document.addEventListener("click", function (e) {
    if (nav && nav.classList.contains("is-active")) {
      // Check if click is outside nav and not on menu toggle
      if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
        nav.classList.remove("is-active");
      }
    }
  });

  if (menuToggle) {
    menuToggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation(); // Prevent document click from immediately closing
      nav.classList.add("is-active");
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", function (e) {
      e.preventDefault();
      nav.classList.remove("is-active");
    });
  }

  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-active");
    });
  });

  /* Smooth Scrolling
   * -------------------------------------------------- */
  document.querySelectorAll("a[href^=\"#\"], a[href^=\"/#\"]").forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      
      // Handle both "#section" and "/#section" formats
      if (href.startsWith("/#")) {
        // Check if we're on the home page
        if (window.location.pathname === "/" || 
            window.location.pathname === "/index.html") {
          e.preventDefault();
          const targetId = href.substring(2); // Remove "/#"
          const target = document.getElementById(targetId);
          if (target) {
            target.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });
          }
        }
        // If not on home page, let the browser handle the navigation
      } else if (href.startsWith("#")) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      }
    });
  });

  /* Back to Top
   * -------------------------------------------------- */
  const goTop = document.querySelector(".ss-go-top");

  if (goTop) {
    window.addEventListener("scroll", function () {
      if (window.pageYOffset > 800) {
        goTop.classList.add("link-is-visible");
      } else {
        goTop.classList.remove("link-is-visible");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    const images = document.querySelectorAll(
      ".member-image img[loading=\"lazy\"]"
    );

    images.forEach((img) => {
      if (img.complete) {
        img.parentElement.classList.add("loaded");
      } else {
        img.addEventListener("load", function () {
          img.parentElement.classList.add("loaded");
        });
      }
    });

    // Email copy functionality
    const copyButtons = document.querySelectorAll(".copy-btn");
    copyButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const textToCopy = this.getAttribute("data-clipboard-text");
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);

        try {
          textarea.select();
          document.execCommand("copy");
          this.classList.add("copied");
          const icon = this.querySelector("i");
          icon.classList.remove("fa-copy");
          icon.classList.add("fa-check");

          setTimeout(() => {
            this.classList.remove("copied");
            icon.classList.remove("fa-check");
            icon.classList.add("fa-copy");
          }, 2000);
        } catch (err) {
          console.error("Copy failed:", err);
        } finally {
          document.body.removeChild(textarea);
        }
      });
    });

    // Add accessible names to all copy buttons on document load
    copyButtons.forEach((button) => {
      // Get the email text from data-text or data-clipboard-text attribute
      const emailText =
        button.getAttribute("data-text") ||
        button.getAttribute("data-clipboard-text");
      // Add aria-label if it doesn"t exist
      if (!button.hasAttribute("aria-label") && emailText) {
        button.setAttribute("aria-label", `Copy email address ${emailText}`);
      }
    });
  });

  /* Copy Email Functionality
   * -------------------------------------------------- */
  window.copyEmail = function (button) {
    const text =
      button.getAttribute("data-text") ||
      button.getAttribute("data-clipboard-text");
    navigator.clipboard
      .writeText(text)
      .then(() => {
        const icon = button.querySelector("i");
        button.classList.add("copied");
        icon.classList.remove("fa-copy");
        icon.classList.add("fa-check");

        setTimeout(() => {
          button.classList.remove("copied");
          icon.classList.remove("fa-check");
          icon.classList.add("fa-copy");
        }, 2000);
      })
      .catch((err) => {
        console.error("Copy failed:", err);
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy");
          button.classList.add("copied");
          const icon = button.querySelector("i");
          icon.classList.remove("fa-copy");
          icon.classList.add("fa-check");

          setTimeout(() => {
            button.classList.remove("copied");
            icon.classList.remove("fa-check");
            icon.classList.add("fa-copy");
          }, 2000);
        } catch (err) {
          console.error("Fallback failed:", err);
        }
        document.body.removeChild(textarea);
      });
  };
})(document.documentElement);
