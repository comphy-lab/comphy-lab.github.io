describe("shared modal, clipboard and keyboard affordances", () => {
  let clipboardDescriptor;
  let execCommandDescriptor;
  beforeEach(() => {
    clipboardDescriptor = Object.getOwnPropertyDescriptor(
      navigator,
      "clipboard"
    );
    execCommandDescriptor = Object.getOwnPropertyDescriptor(
      document,
      "execCommand"
    );
    jest.resetModules();
    jest.useFakeTimers();
    document.body.innerHTML = '<button id="opener">Open</button>';
    document.getElementById("opener").focus();
    jest
      .spyOn(HTMLElement.prototype, "offsetParent", "get")
      .mockImplementation(function () {
        return this.style.display === "none" ? null : document.body;
      });
    require("../assets/js/utils.js");
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
    if (clipboardDescriptor) {
      Object.defineProperty(navigator, "clipboard", clipboardDescriptor);
    } else {
      delete navigator.clipboard;
    }
    if (execCommandDescriptor) {
      Object.defineProperty(document, "execCommand", execCommandDescriptor);
    } else {
      delete document.execCommand;
    }
    document.body.innerHTML = "";
    delete window.Utils;
    delete window.isMacPlatform;
    delete window.updatePlatformSpecificElements;
    delete window.copyEmail;
  });

  function key(target, name, shiftKey = false) {
    const event = new KeyboardEvent("keydown", {
      key: name,
      shiftKey,
      bubbles: true,
      cancelable: true,
    });
    target.dispatchEvent(event);
    return event;
  }

  test("a dialog announces its title, contains focus, and restores its opener", () => {
    const onClose = jest.fn();
    const modal = window.Utils.createModal({
      content:
        "<h2>Research tags</h2><p>Choose one</p>" +
        '<button id="tag-a">A</button><button id="tag-b">B</button>' +
        "<button disabled>Unavailable</button>",
      onClose,
    });
    document.body.appendChild(modal);
    jest.advanceTimersByTime(16);
    const dialog = modal.querySelector('[role="dialog"]');
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(
      document.getElementById(dialog.getAttribute("aria-labelledby"))
        .textContent
    ).toBe("Research tags");
    expect(
      document.getElementById(dialog.getAttribute("aria-describedby"))
        .textContent
    ).toBe("Choose one");
    expect(document.activeElement).toBe(dialog);
    key(dialog, "Tab");
    expect(document.activeElement.id).toBe("tag-a");
    key(document.activeElement, "Tab");
    expect(document.activeElement.id).toBe("tag-b");
    key(document.activeElement, "Tab");
    expect(document.activeElement).toBe(dialog);
    key(dialog, "Tab", true);
    expect(document.activeElement.id).toBe("tag-b");
    key(document.activeElement, "Escape");
    expect(modal.isConnected).toBe(false);
    expect(document.activeElement.id).toBe("opener");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("DOM content remains intact and only backdrop clicks close a dialog", () => {
    const content = document.createElement("button");
    content.textContent = "Keep this content";
    const modal = window.Utils.createModal({ content, darkMode: true });
    document.body.appendChild(modal);
    jest.advanceTimersByTime(16);
    const dialog = modal.querySelector('[role="dialog"]');
    expect(dialog.getAttribute("aria-label")).toBe("Dialog");
    expect(dialog.contains(content)).toBe(true);
    content.click();
    expect(modal.isConnected).toBe(true);
    modal.click();
    expect(modal.isConnected).toBe(false);
    expect(document.activeElement.id).toBe("opener");
  });

  test("closing before the first frame leaves no recurring focus job", () => {
    const modal = window.Utils.createModal({ content: "<p>Research tags</p>" });
    document.body.appendChild(modal);
    modal.closeModal();
    jest.advanceTimersByTime(64);
    expect(modal.isConnected).toBe(false);
    expect(document.activeElement.id).toBe("opener");
    expect(jest.getTimerCount()).toBe(0);
  });

  test("clipboard success gives temporary visual feedback without losing text", async () => {
    const button = document.createElement("button");
    button.dataset.text = "vatsal.sanjay@durham.ac.uk";
    button.innerHTML = '<i class="fa-copy"></i>';
    document.body.appendChild(button);
    const writeText = jest.fn().mockResolvedValue();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    expect(await window.Utils.copyToClipboard(button)).toBe(true);
    expect(writeText).toHaveBeenCalledWith(button.dataset.text);
    expect(button.classList).toContain("copied");
    expect(button.querySelector("i").classList).toContain("fa-check");
    jest.advanceTimersByTime(2000);
    expect(button.classList).not.toContain("copied");
    expect(button.querySelector("i").classList).toContain("fa-copy");
    expect(button.dataset.text).toBe("vatsal.sanjay@durham.ac.uk");
  });

  test("a denied clipboard fallback reports failure and removes its textarea", async () => {
    const button = document.createElement("button");
    button.dataset.text = "Copy me";
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
    document.execCommand = jest.fn(() => {
      throw new Error("denied");
    });
    expect(await window.Utils.copyToClipboard(button)).toBe(false);
    expect(document.querySelector("textarea")).toBeNull();
    expect(button.classList).not.toContain("copied");
  });

  test("accessible non-buttons gain keyboard access and preserve custom labels", () => {
    const span = document.createElement("span");
    window.Utils.initAccessibleButton(span, "Copy email");
    expect(span.getAttribute("role")).toBe("button");
    expect(span.tabIndex).toBe(0);
    expect(span.getAttribute("aria-label")).toBe("Copy email");
    window.Utils.initAccessibleButton(span, "Different label");
    expect(span.getAttribute("aria-label")).toBe("Copy email");
    const button = document.createElement("button");
    button.setAttribute("aria-label", "Already named");
    window.Utils.initAccessibleButton(button);
    expect(button.getAttribute("role")).toBeNull();
    expect(button.getAttribute("aria-label")).toBe("Already named");
  });
});
