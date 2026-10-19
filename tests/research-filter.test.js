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
        <h3 id="24">Paper A</h3><div class="tags"><button type="button" aria-pressed="false">Viscoelastic</button></div>
        <p>Elastic material</p>
        <h3 id="23">Paper B</h3><div class="tags"><button type="button" aria-pressed="false">Newtonian</button></div>
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
    const tag = document.querySelector(".tags button");
    expect(tag.tagName).toBe("BUTTON");
    expect(visiblePapers()).toEqual(["24", "23"]);
    tag.click();
    expect(visiblePapers()).toEqual(["24"]);
    expect(window.location.search).toBe("?tag=Viscoelastic");
    expect(tag.getAttribute("aria-pressed")).toBe("true");
    expect(
      document.querySelector(".r-theme__tag").getAttribute("aria-pressed")
    ).toBe("true");
    expect(document.querySelector(".r-theme__tag").classList).toContain(
      "active"
    );
    tag.click();
    expect(tag.getAttribute("aria-pressed")).toBe("false");
    expect(visiblePapers()).toEqual(["24", "23"]);
    expect(window.location.search).toBe("");
  });

  test("keyboard Enter and Space operate tags with stable deep links", () => {
    load("?tag=Newtonian");
    expect(visiblePapers()).toEqual(["23"]);
    const tag = document.querySelector(".tags button");
    expect(tag.getAttribute("type")).toBe("button");
    expect(tag.tabIndex).toBe(0);
    // Enter and Space activate a real button through click.
    tag.click();
    expect(tag.getAttribute("aria-pressed")).toBe("true");
    expect(visiblePapers()).toEqual(["24"]);
    tag.click();
    expect(tag.getAttribute("aria-pressed")).toBe("false");
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
