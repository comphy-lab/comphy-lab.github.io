describe("command palette action workflows", () => {
  let ready;
  let listeners;
  let matchMedia;

  beforeEach(() => {
    jest.resetModules();
    matchMedia = window.matchMedia;
    jest.useFakeTimers();
    document.body.innerHTML = '<button id="open-palette">Open palette</button>';
    document.getElementById("open-palette").focus();
    ready = [];
    listeners = [];
    const add = document.addEventListener.bind(document);
    jest
      .spyOn(document, "addEventListener")
      .mockImplementation((type, listener, options) => {
        if (type === "DOMContentLoaded") ready.push(listener);
        else {
          listeners.push({ type, listener, options });
          add(type, listener, options);
        }
      });
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: jest.fn(),
    });
    jest
      .spyOn(HTMLElement.prototype, "offsetParent", "get")
      .mockImplementation(function () {
        return this.style.display === "none" ? null : document.body;
      });
    window.matchMedia = jest.fn(() => ({ matches: false }));
    require("../assets/js/utils.js");
    require("../assets/js/command-data.js");
  });

  afterEach(() => {
    listeners.forEach(({ type, listener, options }) => {
      document.removeEventListener(type, listener, options);
    });
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
    delete HTMLElement.prototype.scrollIntoView;
    document.body.innerHTML = "";
    window.history.replaceState({}, "", "/");
    delete window.Utils;
    delete window.isMacPlatform;
    delete window.updatePlatformSpecificElements;
    delete window.copyEmail;
    window.matchMedia = matchMedia;
    delete window.displayShortcutsHelp;
    delete window.addContextCommands;
    delete window.sortCoursesByDate;
    window.commandData = [];
  });

  function initPage(path) {
    window.history.replaceState({}, "", path);
    ready.forEach((listener) => listener());
  }

  function command(id) {
    const action = window.commandData.find((entry) => entry.id === id);
    expect(action).toBeDefined();
    return action;
  }

  function key(target, name) {
    target.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: name,
        bubbles: true,
        cancelable: true,
      })
    );
  }

  test("command help shows the real grouped actions and closes to its opener", () => {
    window.displayShortcutsHelp();
    jest.advanceTimersByTime(16);
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog.textContent).toContain("Press Ctrl+K");
    [
      "Navigation",
      "External Links",
      "Tools",
      "Actions",
      "Papers",
      "People",
    ].forEach((section) => expect(dialog.textContent).toContain(section));
    expect(dialog.textContent).toContain(command("talks").title);
    expect(document.activeElement).toBe(dialog);
    document.getElementById("close-shortcuts-help").click();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement.id).toBe("open-palette");
  });

  test("research action deduplicates tags and arrows select the real page filter", () => {
    document.body.insertAdjacentHTML(
      "beforeend",
      `
        <div class="research-content">
          <h3 id="24">Paper A</h3><div class="tags"><span>Elastic</span></div>
          <h3 id="23">Paper B</h3><div class="tags"><span>Newtonian</span><span>Elastic</span></div>
          <h3 id="22">Paper C</h3><div class="tags"><span>Capillary</span></div>
          <h3 id="21">Paper D</h3><div class="tags"><span>Inertial</span></div>
          <h3 id="20">Paper E</h3><div class="tags"><span>Viscous</span></div>
        </div>`
    );
    require("../assets/js/page-research.js");
    initPage("/research/");
    command("filter-research").handler();
    const dialog = document.querySelector('[role="dialog"]');
    const buttons = [...dialog.querySelectorAll(".tag-filter-btn")];
    expect(buttons.map((button) => button.textContent)).toEqual([
      "Elastic",
      "Newtonian",
      "Capillary",
      "Inertial",
      "Viscous",
    ]);
    key(dialog, "ArrowRight");
    key(dialog, "Enter");
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(window.location.search).toBe("?tag=Newtonian");
    expect(
      [...document.querySelectorAll(".paper-container:not(.hidden)")].map(
        (paper) => paper.id
      )
    ).toEqual(["23"]);
  });

  test("research arrow rows, hover and escape leave selection usable", () => {
    document.body.insertAdjacentHTML(
      "beforeend",
      `
      <div class="tags">${["A", "B", "C", "D", "E"]
        .map((tag) => `<span>${tag}</span>`)
        .join("")}</div>`
    );
    initPage("/research/");
    command("filter-research").handler();
    const dialog = document.querySelector('[role="dialog"]');
    const buttons = [...dialog.querySelectorAll(".tag-filter-btn")];
    key(dialog, "ArrowLeft");
    expect(buttons[4].style.outline).toBe("2px solid white");
    key(dialog, "ArrowUp");
    expect(buttons[0].style.outline).toBe("2px solid white");
    key(dialog, "ArrowDown");
    expect(buttons[4].style.outline).toBe("2px solid white");
    buttons[2].dispatchEvent(new MouseEvent("mouseenter"));
    expect(buttons[2].style.outline).toBe("2px solid white");
    key(dialog, "Escape");
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement.id).toBe("open-palette");
    expect(jest.getTimerCount()).toBe(0);
  });

  test("the research close button and an empty tag list both remain usable", () => {
    initPage("/research/");
    command("filter-research").handler();
    expect(document.querySelectorAll(".tag-filter-btn")).toHaveLength(0);
    document.getElementById("close-tag-filter").click();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  test("teaching's palette action sorts the current course cards", () => {
    document.body.insertAdjacentHTML(
      "beforeend",
      `
      <div class="teaching-content"><div class="teaching-grid">
        <div class="course-card" data-date="2024-03-10"><h3>Earlier</h3></div>
        <div class="course-card" data-date="2025-09-15"><h3>Later</h3></div>
      </div></div>`
    );
    require("../assets/js/teaching.js");
    initPage("/teaching/");
    command("sort-courses").handler();
    expect(
      [...document.querySelectorAll(".teaching-grid h3")].map(
        (title) => title.textContent
      )
    ).toEqual(["Later", "Earlier"]);
    expect(document.querySelector(".sort-indicator").textContent).toContain(
      "2 courses sorted"
    );
  });

  test("theme and scroll commands activate their browser controls", () => {
    document.body.insertAdjacentHTML(
      "beforeend",
      '<button id="theme-toggle">Theme</button>'
    );
    const changed = jest.fn();
    document.getElementById("theme-toggle").addEventListener("click", changed);
    const scroll = jest.spyOn(window, "scrollTo").mockImplementation(() => {});
    command("action-toggle-theme").handler();
    expect(changed).toHaveBeenCalledTimes(1);
    command("top").handler();
    expect(scroll).toHaveBeenLastCalledWith({ top: 0, behavior: "smooth" });
    command("bottom").handler();
    expect(scroll).toHaveBeenLastCalledWith({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  });

  test("external commands protect the originating page even when blocked", () => {
    const open = jest.spyOn(window, "open").mockReturnValue(null);
    command("action-durham-staff").handler();
    expect(open).toHaveBeenLastCalledWith(
      "https://www.durham.ac.uk/staff/vatsal-sanjay/",
      "_blank",
      "noopener,noreferrer"
    );
    const child = { opener: {} };
    open.mockReturnValue(child);
    command("action-open-scholar").handler();
    expect(child.opener).toBeNull();
  });
});
