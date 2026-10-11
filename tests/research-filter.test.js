describe("research tag filtering user paths", () => {
  let listeners;
  let ready;
  let observed;
  let observerCallback;

  function load(query = "") {
    window.history.replaceState({}, "", "/research/" + query);
    document.body.innerHTML = `
      <ul class="toc-list"></ul>
      <button class="r-theme__tag" data-filter-tag="Viscoelastic">Elasticity</button>
      <div class="research-content">
        <h2>Published work</h2>
        <h3 id="24">Paper A</h3><div class="tags"><span>Viscoelastic</span></div>
        <p>Elastic material</p>
        <h3 id="23">Paper B</h3><div class="tags"><span>Newtonian</span></div>
        <h2 id="methods">Methods</h2><p>Methods text</p>
      </div>`;
    require("../assets/js/page-research.js");
    ready();
  }

  function visiblePapers() {
    return [...document.querySelectorAll(".paper-container:not(.hidden)")].map(
      (paper) => paper.id
    );
  }

  beforeEach(() => {
    jest.resetModules();
    listeners = [];
    [document, window].forEach((target) => {
      const add = target.addEventListener.bind(target);
      jest
        .spyOn(target, "addEventListener")
        .mockImplementation((type, listener, options) => {
          if (type === "DOMContentLoaded") ready = listener;
          else {
            listeners.push({ target, type, listener, options });
            add(type, listener, options);
          }
        });
    });
    observed = [];
    window.IntersectionObserver = class {
      constructor(callback) {
        observerCallback = callback;
      }
      observe(target) {
        observed.push(target);
      }
    };
  });

  afterEach(() => {
    listeners.forEach(({ target, type, listener, options }) => {
      target.removeEventListener(type, listener, options);
    });
    jest.restoreAllMocks();
    delete window.IntersectionObserver;
    document.body.innerHTML = "";
    window.history.replaceState({}, "", "/");
  });

  test("published paper tags filter and a second activation clears", () => {
    load();
    const tag = document.querySelector(".tags span");
    expect(visiblePapers()).toEqual(["24", "23"]);
    tag.click();
    expect(visiblePapers()).toEqual(["24"]);
    expect(window.location.search).toBe("?tag=Viscoelastic");
    expect(document.querySelector(".r-theme__tag").classList).toContain(
      "active"
    );
    tag.click();
    expect(visiblePapers()).toEqual(["24", "23"]);
    expect(window.location.search).toBe("");
  });

  test("keyboard Enter and Space operate tags with stable deep links", () => {
    load("?tag=Newtonian");
    expect(visiblePapers()).toEqual(["23"]);
    const tag = document.querySelector(".tags span");
    expect(tag.getAttribute("role")).toBe("button");
    expect(tag.tabIndex).toBe(0);
    const enter = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });
    tag.dispatchEvent(enter);
    expect(enter.defaultPrevented).toBe(true);
    expect(visiblePapers()).toEqual(["24"]);
    tag.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    expect(visiblePapers()).toEqual(["24", "23"]);
  });

  test("theme controls and back/forward state use the same filter", () => {
    load();
    document.querySelector(".r-theme__tag").click();
    expect(visiblePapers()).toEqual(["24"]);
    window.history.replaceState({}, "", "/research/?tag=Newtonian");
    window.dispatchEvent(new PopStateEvent("popstate"));
    expect(visiblePapers()).toEqual(["23"]);
    expect(document.querySelector(".r-theme__tag").classList).not.toContain(
      "active"
    );
    window.history.replaceState({}, "", "/research/");
    window.dispatchEvent(new PopStateEvent("popstate"));
    expect(visiblePapers()).toEqual(["24", "23"]);
  });

  test("unknown URL tags recover to all papers and clear the bad query", () => {
    load("?tag=missing");
    expect(visiblePapers()).toEqual(["24", "23"]);
    expect(window.location.search).toBe("");
  });

  test("table of contents follows visible research headings", () => {
    load();
    const links = [...document.querySelectorAll(".toc-list a")];
    expect(links.map((link) => link.textContent)).toEqual([
      "Published work",
      "Methods",
    ]);
    expect(links[0].getAttribute("href")).toBe("#section-0");
    expect(observed).toHaveLength(2);
    observerCallback([{ target: observed[1], isIntersecting: true }]);
    expect(links[1].classList).toContain("active");
    expect(links[0].classList).not.toContain("active");
  });
});
