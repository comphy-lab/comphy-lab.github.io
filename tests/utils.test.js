/**
 * Tests for assets/js/utils.js shared utilities
 *
 * Covers: initScrollReveal, copyToClipboard (+ fallback), safeQuery,
 * safeQueryAll, and the window.Utils export shape.
 */

describe("utils.js", () => {
  beforeEach(() => {
    // Reset DOM and window state
    document.body.innerHTML = "";
    delete window.Utils;
    delete window.isMacPlatform;
    delete window.updatePlatformSpecificElements;
    delete window.copyEmail;
    jest.resetModules();
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Module load / export shape
  // ---------------------------------------------------------------------------
  describe("window.Utils export", () => {
    it("exports all expected utility functions", () => {
      require("../assets/js/utils.js");
      const expected = [
        "isMacPlatform",
        "updatePlatformSpecificElements",
        "createModal",
        "copyToClipboard",
        "debounce",
        "throttle",
        "safeQuery",
        "safeQueryAll",
        "initAccessibleButton",
      ];
      expected.forEach((fn) => {
        expect(typeof window.Utils[fn]).toBe("function");
      });
    });

    it("maintains backwards-compat aliases on window", () => {
      require("../assets/js/utils.js");
      expect(typeof window.isMacPlatform).toBe("function");
      expect(typeof window.updatePlatformSpecificElements).toBe("function");
      expect(typeof window.copyEmail).toBe("function");
    });
  });

  // ---------------------------------------------------------------------------
  // initScrollReveal
  // ---------------------------------------------------------------------------
  describe("initScrollReveal()", () => {
    it("reveals blocks immediately when IntersectionObserver is unavailable", () => {
      // Remove IO from jsdom (it may be defined by the environment)
      const original = global.IntersectionObserver;
      delete global.IntersectionObserver;

      document.body.innerHTML = `
        <div data-animate-block>one</div>
        <div data-animate-block>two</div>
      `;

      // Load the module — DOMContentLoaded fires synchronously in jsdom after
      // require() in this context, but we can also invoke it via the event.
      require("../assets/js/utils.js");
      document.dispatchEvent(new Event("DOMContentLoaded"));

      const blocks = document.querySelectorAll("[data-animate-block]");
      blocks.forEach((block) => {
        expect(block.classList.contains("is-inview")).toBe(true);
      });

      if (original) global.IntersectionObserver = original;
    });

    it("sets up an observer when IntersectionObserver is available", () => {
      const observeMock = jest.fn();
      const disconnectMock = jest.fn();
      const observerInstances = [];

      const unobserveMock = jest.fn();
      global.IntersectionObserver = jest.fn().mockImplementation((cb) => {
        const instance = {
          observe: observeMock,
          unobserve: unobserveMock,
          disconnect: disconnectMock,
          _cb: cb,
        };
        observerInstances.push(instance);
        return instance;
      });

      // Set DOM before requiring so the DOMContentLoaded handler sees exactly 1 block
      document.body.innerHTML = `<div data-animate-block>content</div>`;

      require("../assets/js/utils.js");
      document.dispatchEvent(new Event("DOMContentLoaded"));

      expect(global.IntersectionObserver).toHaveBeenCalled();

      // The block we set up must have been passed to observe
      const block = document.querySelector("[data-animate-block]");
      expect(observeMock).toHaveBeenCalledWith(block);

      // Simulate intersection — block should get .is-inview
      observerInstances[observerInstances.length - 1]._cb([
        { isIntersecting: true, target: block },
      ]);
      expect(block.classList.contains("is-inview")).toBe(true);
    });

    it("is a no-op when there are no [data-animate-block] elements", () => {
      const observeMock = jest.fn();
      global.IntersectionObserver = jest
        .fn()
        .mockImplementation(() => ({ observe: observeMock }));

      document.body.innerHTML = "<p>no blocks</p>";
      require("../assets/js/utils.js");
      document.dispatchEvent(new Event("DOMContentLoaded"));

      expect(global.IntersectionObserver).not.toHaveBeenCalled();
      expect(observeMock).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // copyToClipboard / fallback
  // ---------------------------------------------------------------------------
  describe("copyToClipboard()", () => {
    let button;

    beforeEach(() => {
      button = document.createElement("button");
      button.setAttribute("data-text", "hello world");
      const icon = document.createElement("i");
      icon.classList.add("fa-copy");
      button.appendChild(icon);
      document.body.appendChild(button);
      require("../assets/js/utils.js");
    });

    it("uses navigator.clipboard when available", async () => {
      const writeText = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText },
        configurable: true,
        writable: true,
      });

      window.Utils.copyToClipboard(button);
      await Promise.resolve(); // flush microtasks

      expect(writeText).toHaveBeenCalledWith("hello world");
    });

    it("falls back to execCommand when navigator.clipboard is unavailable", () => {
      Object.defineProperty(navigator, "clipboard", {
        value: undefined,
        configurable: true,
        writable: true,
      });

      // jsdom may not define execCommand; define it so we can spy on it
      if (!document.execCommand) {
        document.execCommand = () => false;
      }
      const execCommand = jest
        .spyOn(document, "execCommand")
        .mockReturnValue(true);

      window.Utils.copyToClipboard(button);

      expect(execCommand).toHaveBeenCalledWith("copy");
      execCommand.mockRestore();
    });

    it("falls back to execCommand when clipboard.writeText rejects", async () => {
      const writeText = jest.fn().mockRejectedValue(new Error("denied"));
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText },
        configurable: true,
        writable: true,
      });

      if (!document.execCommand) {
        document.execCommand = () => false;
      }
      const execCommand = jest
        .spyOn(document, "execCommand")
        .mockReturnValue(true);

      window.Utils.copyToClipboard(button);
      await Promise.resolve(); // let writeText reject
      await Promise.resolve(); // let catch handler run

      expect(execCommand).toHaveBeenCalledWith("copy");
      execCommand.mockRestore();
    });

    it("does nothing if no text is available", () => {
      const noTextBtn = document.createElement("button");
      document.body.appendChild(noTextBtn);
      // Should not throw
      expect(() => window.Utils.copyToClipboard(noTextBtn)).not.toThrow();
    });

    it("reads text from data-clipboard-text attribute", () => {
      const altBtn = document.createElement("button");
      altBtn.setAttribute("data-clipboard-text", "alt text");
      document.body.appendChild(altBtn);

      const writeText = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText },
        configurable: true,
        writable: true,
      });

      window.Utils.copyToClipboard(altBtn);
      expect(writeText).toHaveBeenCalledWith("alt text");
    });

    it("uses the explicit text argument when provided", () => {
      const writeText = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText },
        configurable: true,
        writable: true,
      });

      window.Utils.copyToClipboard(button, "explicit text");
      expect(writeText).toHaveBeenCalledWith("explicit text");
    });
  });

  // ---------------------------------------------------------------------------
  // safeQuery / safeQueryAll
  // ---------------------------------------------------------------------------
  describe("safeQuery()", () => {
    beforeEach(() => {
      require("../assets/js/utils.js");
    });

    it("returns the matching element for a valid selector", () => {
      document.body.innerHTML = `<div class="target">hi</div>`;
      const el = window.Utils.safeQuery(".target");
      expect(el).not.toBeNull();
      expect(el.textContent).toBe("hi");
    });

    it("returns null for a valid selector with no match", () => {
      document.body.innerHTML = "";
      expect(window.Utils.safeQuery(".no-such-element")).toBeNull();
    });

    it("returns null and emits a warning for an invalid selector", () => {
      const result = window.Utils.safeQuery(":::invalid:::");
      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalled();
    });

    it("searches within a provided context element", () => {
      document.body.innerHTML = `
        <div id="ctx"><span class="inner">yes</span></div>
        <span class="inner">no</span>
      `;
      const ctx = document.getElementById("ctx");
      const el = window.Utils.safeQuery(".inner", ctx);
      expect(el.textContent).toBe("yes");
    });
  });

  describe("safeQueryAll()", () => {
    beforeEach(() => {
      require("../assets/js/utils.js");
    });

    it("returns all matching elements for a valid selector", () => {
      document.body.innerHTML = `
        <li class="item">a</li>
        <li class="item">b</li>
        <li class="item">c</li>
      `;
      const results = window.Utils.safeQueryAll(".item");
      expect(results.length).toBe(3);
    });

    it("returns an empty NodeList for a valid selector with no matches", () => {
      document.body.innerHTML = "";
      const results = window.Utils.safeQueryAll(".nothing");
      expect(results.length).toBe(0);
    });

    it("returns an empty array and emits a warning for an invalid selector", () => {
      const results = window.Utils.safeQueryAll(":::bad:::");
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
      expect(console.warn).toHaveBeenCalled();
    });
  });
});
