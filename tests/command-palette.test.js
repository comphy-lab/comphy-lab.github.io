/**
 * Priority 1 behavioural tests for command-palette.js
 *
 * Covers open/close, command filtering, and keyboard navigation
 * through the public DOM API (openCommandPalette + init listeners).
 */

describe("command-palette.js Priority 1 paths", () => {
  let palette;
  let input;
  let resultsContainer;
  let handlerSpy;

  function mountPaletteDom() {
    document.body.innerHTML = `
      <button id="command-palette-btn" type="button">Search</button>
      <span id="command-palette-shortcut"></span>
      <div id="simple-command-palette" style="display: none;">
        <div class="simple-command-palette-backdrop"></div>
        <input id="command-palette-input" />
        <div id="command-palette-results"></div>
      </div>
    `;
    palette = document.getElementById("simple-command-palette");
    input = document.getElementById("command-palette-input");
    resultsContainer = document.getElementById("command-palette-results");
  }

  function loadPalette() {
    mountPaletteDom();
    handlerSpy = jest.fn();
    window.commandData = [
      {
        id: "home",
        title: "Go to Home",
        section: "Navigation",
        icon: "",
        handler: handlerSpy,
      },
      {
        id: "research",
        title: "Go to Research",
        section: "Navigation",
        icon: "",
        handler: jest.fn(),
      },
      {
        id: "github",
        title: "Open GitHub",
        section: "External Links",
        icon: "",
        handler: jest.fn(),
      },
    ];
    window.Utils = {
      updatePlatformSpecificElements: jest.fn(),
      isMacPlatform: jest.fn().mockReturnValue(false),
    };
    window.SearchManager = {
      searchForCommandPalette: jest.fn().mockResolvedValue([]),
    };
    Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: jest.fn(),
    });

    delete window.__commandPaletteInitialized;
    delete window.__commandPaletteDomReadyHandled;
    window.__commandPaletteSearchToken = 0;

    require("../assets/js/command-palette.js");
    document.dispatchEvent(new Event("DOMContentLoaded"));
  }

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    loadPalette();
  });

  afterEach(() => {
    document.body.innerHTML = "";
    delete window.SearchManager;
    delete window.Utils;
    delete window.renderCommandResults;
    delete window.renderSections;
    delete window.openCommandPalette;
    delete window._getSearchToken;
    delete window.__commandPaletteInitialized;
    delete window.__commandPaletteDomReadyHandled;
    window.commandData = [];
  });

  describe("open and close", () => {
    it("opens the palette, clears input, and renders commands", () => {
      window.openCommandPalette();

      expect(palette.style.display).toBe("block");
      expect(input.value).toBe("");
      expect(document.activeElement).toBe(input);
      expect(resultsContainer.textContent).toContain("Go to Home");
      expect(resultsContainer.textContent).toContain("Open GitHub");
    });

    it("opens via Ctrl+K keyboard shortcut", () => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "k",
          ctrlKey: true,
          bubbles: true,
        })
      );

      expect(palette.style.display).toBe("block");
      expect(document.activeElement).toBe(input);
    });

    it("opens via the command palette button", () => {
      document.getElementById("command-palette-btn").click();

      expect(palette.style.display).toBe("block");
    });

    it("closes on Escape", () => {
      window.openCommandPalette();
      expect(palette.style.display).toBe("block");

      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
      );

      expect(palette.style.display).toBe("none");
    });

    it("closes when the backdrop is clicked", () => {
      window.openCommandPalette();

      document.querySelector(".simple-command-palette-backdrop").click();

      expect(palette.style.display).toBe("none");
    });

    it("closes when a command is clicked and runs its handler", () => {
      window.openCommandPalette();

      const homeCommand = Array.from(
        resultsContainer.querySelectorAll(".command-palette-command")
      ).find((el) => el.textContent.includes("Go to Home"));

      homeCommand.click();

      expect(palette.style.display).toBe("none");
      expect(handlerSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("search filtering", () => {
    it("filters commands by title as the user types", () => {
      window.openCommandPalette();

      input.value = "github";
      input.dispatchEvent(new Event("input", { bubbles: true }));

      expect(resultsContainer.textContent).toContain("Open GitHub");
      expect(resultsContainer.textContent).not.toContain("Go to Home");
    });

    it("shows a no-results message for unmatched queries", () => {
      window.openCommandPalette();

      input.value = "zzzz-no-match";
      input.dispatchEvent(new Event("input", { bubbles: true }));

      expect(
        resultsContainer.querySelector(".command-palette-no-results")
      ).not.toBeNull();
      expect(resultsContainer.textContent).toContain("No commands found");
    });

    it("asks SearchManager for queries of three or more characters", async () => {
      window.SearchManager.searchForCommandPalette.mockResolvedValue([
        {
          title: "Blog Post",
          icon: "",
          section: "Search Results",
          excerpt: "About multiphase flow",
        },
      ]);

      window.openCommandPalette();
      input.value = "mul";
      input.dispatchEvent(new Event("input", { bubbles: true }));

      expect(window.SearchManager.searchForCommandPalette).toHaveBeenCalledWith(
        "mul"
      );

      await Promise.resolve();
      await Promise.resolve();

      expect(resultsContainer.textContent).toContain("Blog Post");
      expect(resultsContainer.textContent).toContain("About multiphase flow");
    });
  });

  describe("keyboard navigation", () => {
    function commandEls() {
      return Array.from(
        resultsContainer.querySelectorAll(".command-palette-command")
      );
    }

    it("selects the first command on ArrowDown", () => {
      window.openCommandPalette();

      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })
      );

      const commands = commandEls();
      expect(commands[0].classList.contains("selected")).toBe(true);
      expect(commands[1].classList.contains("selected")).toBe(false);
    });

    it("moves selection with ArrowDown and wraps with ArrowUp", () => {
      window.openCommandPalette();
      const commands = commandEls();

      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })
      );
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })
      );
      expect(commands[1].classList.contains("selected")).toBe(true);

      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true })
      );
      expect(commands[0].classList.contains("selected")).toBe(true);
      expect(commands[1].classList.contains("selected")).toBe(false);
    });

    it("runs the selected command on Enter", () => {
      window.openCommandPalette();

      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })
      );
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
      );

      expect(handlerSpy).toHaveBeenCalledTimes(1);
      expect(palette.style.display).toBe("none");
    });

    it("runs the first command on Enter when none is selected", () => {
      window.openCommandPalette();

      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
      );

      expect(handlerSpy).toHaveBeenCalledTimes(1);
    });
  });
});
