/**
 * Tests for the actual command-data.js module
 */

// Mock dependencies
global.Fuse = jest.fn().mockImplementation(() => ({
  search: jest.fn().mockReturnValue([])
}));
global.sortCoursesByDate = jest.fn();

describe("command-data.js actual implementation", () => {
  beforeEach(() => {
    // Clear any previous command data
    window.commandData = [];
    window.searchData = [];
    window.matchMedia = jest.fn().mockReturnValue({ matches: false });
    window.open = jest.fn();

    // Reset DOM
    document.body.innerHTML = "";
    Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: jest.fn(),
    });

    window.Utils = {
      isMacPlatform: jest.fn().mockReturnValue(false),
      createModal: jest.fn(({ content }) => {
        const modal = document.createElement("div");
        const contentEl = document.createElement("div");
        contentEl.setAttribute("tabindex", "-1");
        if (typeof content === "string") {
          contentEl.innerHTML = content;
        } else {
          contentEl.appendChild(content);
        }
        modal.appendChild(contentEl);
        modal.closeModal = jest.fn(() => modal.remove());
        return modal;
      }),
    };

    // Reset mocks
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("should load and define window.commandData", () => {
    // Load the actual module
    require("../assets/js/command-data.js");

    // Check that commandData is defined
    expect(window.commandData).toBeDefined();
    expect(Array.isArray(window.commandData)).toBe(true);
    expect(window.commandData.length).toBeGreaterThan(0);
  });

  it("should have navigation commands", () => {
    require("../assets/js/command-data.js");

    const navigationCommands = window.commandData.filter(
      (cmd) => cmd.section === "Navigation"
    );
    expect(navigationCommands.length).toBeGreaterThan(0);

    // Check for specific navigation commands
    const homeCommand = window.commandData.find((cmd) => cmd.id === "home");
    expect(homeCommand).toBeDefined();
    expect(homeCommand.title).toBe("Go to Home");
  });

  it("should add event listener on DOMContentLoaded", () => {
    const addEventListenerSpy = jest.spyOn(document, "addEventListener");

    require("../assets/js/command-data.js");

    // Check that DOMContentLoaded listener was added
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "DOMContentLoaded",
      expect.any(Function)
    );
  });

  it("should handle page-specific initialization", () => {
    // Update the current URL without replacing the jsdom location object.
    window.history.replaceState({}, "", "/team/");

    require("../assets/js/command-data.js");

    // Trigger DOMContentLoaded
    const event = new Event("DOMContentLoaded");
    document.dispatchEvent(event);

    // Should not throw errors
    expect(window.commandData).toBeDefined();
  });

  it("opens external links with noopener protection", () => {
    const externalWindow = { opener: { location: "about:blank" } };
    window.open = jest.fn().mockReturnValue(externalWindow);

    require("../assets/js/command-data.js");

    const githubCommand = window.commandData.find((cmd) => cmd.id === "github");
    githubCommand.handler();

    expect(window.open).toHaveBeenCalledWith(
      "https://github.com/comphy-lab",
      "_blank",
      "noopener,noreferrer"
    );
    expect(externalWindow.opener).toBeNull();
  });

  it("renders research tag buttons as text", () => {
    window.history.replaceState({}, "", "/research");
    document.body.innerHTML = `
      <div class="tags">
        <span></span>
      </div>
    `;
    document.querySelector(".tags span").textContent = "<img src=x>";

    require("../assets/js/command-data.js");

    document.dispatchEvent(new Event("DOMContentLoaded"));

    const filterCommand = window.commandData.find(
      (cmd) => cmd.id === "filter-research"
    );
    filterCommand.handler();

    const modal = document.body.lastElementChild;
    const tagButton = modal.querySelector(".tag-filter-btn");

    expect(tagButton).not.toBeNull();
    expect(tagButton.textContent).toBe("<img src=x>");
    expect(tagButton.querySelector("img")).toBeNull();
  });
});
