const fs = require("fs");
const path = require("path");

describe("site drawer keyboard and focus paths", () => {
  let listeners;
  let toggle;
  let nav;
  let close;
  let first;

  function key(name, shiftKey = false) {
    const event = new KeyboardEvent("keydown", {
      key: name,
      shiftKey,
      bubbles: true,
      cancelable: true,
    });
    document.activeElement.dispatchEvent(event);
    return event;
  }

  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML =
      fs.readFileSync(
        path.join(__dirname, "../_includes/header.html"),
        "utf8"
      ) + '<button id="outside">Outside</button>';
    listeners = [];
    [document, window].forEach((target) => {
      const add = target.addEventListener.bind(target);
      jest
        .spyOn(target, "addEventListener")
        .mockImplementation((type, listener, options) => {
          listeners.push({ target, type, listener, options });
          add(type, listener, options);
        });
    });
    toggle = document.querySelector(".s-header__menu-toggle");
    nav = document.querySelector("#site-nav");
    close = document.querySelector(".s-header__nav-close-btn");
    first = nav.querySelector("a[href]");
    toggle.style.display = "flex";
    jest
      .spyOn(HTMLElement.prototype, "getClientRects")
      .mockImplementation(function () {
        return this.style.display === "none" ? [] : [{}];
      });
    require("../assets/js/main.js");
  });

  afterEach(() => {
    listeners.forEach(({ target, type, listener, options }) => {
      target.removeEventListener(type, listener, options);
    });
    jest.restoreAllMocks();
    document.body.innerHTML = "";
    delete window.copyEmail;
  });

  test("opens into the first link, wraps Tab, Escape restores Menu", () => {
    toggle.focus();
    toggle.click();
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(first);
    const last = document.querySelector("#command-palette-btn");
    last.focus();
    expect(key("Tab").defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(close);
    key("Tab", true);
    expect(document.activeElement).toBe(last);
    key("Escape");
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(nav.classList.contains("is-active")).toBe(false);
    expect(document.activeElement).toBe(toggle);
  });

  test("Close and outside clicks restore focus from the drawer", () => {
    toggle.click();
    close.click();
    expect(document.activeElement).toBe(toggle);
    toggle.click();
    document.querySelector("#outside").click();
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(toggle);
  });

  test("following a link closes the drawer without changing its target", () => {
    first.addEventListener("click", (event) => event.preventDefault());
    toggle.click();
    const href = first.href;
    first.click();
    expect(first.href).toBe(href);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(toggle);
  });

  test("desktop handover releases trapping and preserves visible focus", () => {
    toggle.click();
    close.focus();
    toggle.style.display = "none";
    close.style.display = "none";
    window.dispatchEvent(new Event("resize"));
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(first);
    expect(key("Tab").defaultPrevented).toBe(false);
  });

  test.each(["Close", "Menu"])(
    "desktop handover restores %s after the browser blurs it first",
    (control) => {
      toggle.click();
      if (control === "Menu") key("Escape");
      const focused = control === "Close" ? close : toggle;
      focused.focus();
      toggle.style.display = "none";
      close.style.display = "none";
      focused.blur();
      expect(document.activeElement).toBe(document.body);
      window.dispatchEvent(new Event("resize"));
      expect(document.activeElement).toBe(first);
      expect(toggle.getAttribute("aria-expanded")).toBe("false");
    }
  );

  test.each([".s-header__nav-link[href='/team/']", "#theme-toggle"])(
    "desktop handover preserves a visible %s control",
    (selector) => {
      toggle.click();
      const focused = nav.querySelector(selector);
      focused.focus();
      toggle.style.display = "none";
      close.style.display = "none";
      window.dispatchEvent(new Event("resize"));
      expect(document.activeElement).toBe(focused);
      expect(toggle.getAttribute("aria-expanded")).toBe("false");
    }
  );

  test("opening the palette releases the drawer before focus moves", () => {
    toggle.click();
    document.dispatchEvent(new Event("commandPaletteOpen"));
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(key("Tab").defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(input);
  });
});
