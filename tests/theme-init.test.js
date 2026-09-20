/**
 * Priority 1 theme switching and persistence tests for theme-init.js
 *
 * Complements the CSP smoke coverage in page-scripts-csp.test.js by
 * exercising localStorage preference and toggle persistence.
 * (data-dispatch-theme-change / themeChange requires a real script
 * element as document.currentScript; not covered via require().)
 */

describe("theme-init.js Priority 1 paths", () => {
  let domContentLoadedHandlers;
  let addEventListenerSpy;

  function mountThemeDom() {
    document.documentElement.className = "no-js";
    document.documentElement.removeAttribute("data-theme");
    document.body.innerHTML =
      '<button id="theme-toggle" type="button"></button>';
  }

  function mockMatchMedia(prefersDark) {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: prefersDark && query === "(prefers-color-scheme: dark)",
      media: query,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  }

  function loadThemeInit() {
    jest.isolateModules(() => {
      require("../assets/js/theme-init.js");
    });
    // Invoke only listeners registered by this load. Avoid
    // document.dispatchEvent(DOMContentLoaded), which would also
    // re-run handlers accumulated from earlier requires/tests.
    const handlers = domContentLoadedHandlers.slice();
    domContentLoadedHandlers.length = 0;
    handlers.forEach((handler) => handler());
  }

  beforeEach(() => {
    localStorage.clear();
    mountThemeDom();
    mockMatchMedia(false);
    domContentLoadedHandlers = [];
    const originalAdd = document.addEventListener.bind(document);
    addEventListenerSpy = jest
      .spyOn(document, "addEventListener")
      .mockImplementation((type, handler, options) => {
        if (type === "DOMContentLoaded") {
          domContentLoadedHandlers.push(handler);
          return undefined;
        }
        return originalAdd(type, handler, options);
      });
  });

  afterEach(() => {
    if (addEventListenerSpy) {
      addEventListenerSpy.mockRestore();
    }
    localStorage.clear();
    document.body.innerHTML = "";
    document.documentElement.className = "";
    document.documentElement.removeAttribute("data-theme");
  });

  it("applies a saved light theme over the system preference", () => {
    localStorage.setItem("theme", "light");
    mockMatchMedia(true);

    loadThemeInit();

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    // Applying preferred theme on DOMContentLoaded does not re-persist.
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("applies a saved dark theme over a light system preference", () => {
    localStorage.setItem("theme", "dark");
    mockMatchMedia(false);

    loadThemeInit();

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("falls back to system preference when nothing is saved", () => {
    mockMatchMedia(true);

    loadThemeInit();

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("theme")).toBeNull();
  });

  it("toggles theme and persists the choice to localStorage", () => {
    mockMatchMedia(false);
    loadThemeInit();

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    document.getElementById("theme-toggle").click();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");

    document.getElementById("theme-toggle").click();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("ignores invalid saved theme values", () => {
    localStorage.setItem("theme", "neon");
    mockMatchMedia(true);

    loadThemeInit();

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("marks the document as js-capable", () => {
    loadThemeInit();

    expect(document.documentElement.classList.contains("no-js")).toBe(false);
    expect(document.documentElement.classList.contains("js")).toBe(true);
  });
});
