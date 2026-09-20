/**
 * Priority 1 Fuse.js search path tests for search-manager.js
 *
 * Uses a lightweight Fuse stub that mirrors the score/refIndex shape
 * SearchManager expects, so we exercise real formatting and ranking
 * without depending on the CDN Fuse build.
 */

describe("search-manager Fuse.js search paths", () => {
  const publicEntries = [
    {
      title: "Multiphase Flows Overview",
      url: "https://comphy-lab.org/research/#multiphase",
      content: "Computational multiphase physics research themes",
      excerpt: "Lab research on multiphase flows",
      tags: ["multiphase"],
      priority: 2,
    },
    {
      title: "Teaching Basilisk",
      url: "https://comphy-lab.org/teaching/",
      content: "Course materials for Basilisk",
      excerpt: "Teaching materials",
      tags: ["teaching"],
      priority: 5,
    },
    {
      title: "Multiphase Blog Post",
      url: "https://blogs.comphy-lab.org/multiphase-post/",
      content: "Detailed multiphase case study",
      excerpt: "Case study excerpt",
      tags: ["blog", "multiphase"],
      priority: 1,
    },
  ];

  function installFuseStub() {
    global.Fuse = jest.fn().mockImplementation((data) => ({
      search: (query) => {
        const needle = String(query).toLowerCase();
        return data
          .map((item, refIndex) => ({ item, refIndex }))
          .filter(({ item }) => {
            const haystack = [item.title, item.content, ...(item.tags || [])]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();
            return haystack.includes(needle);
          })
          .map(({ item, refIndex }, rank) => ({
            item,
            refIndex,
            score: 0.1 + rank * 0.05,
          }));
      },
    }));
  }

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    document.body.innerHTML = "";
    delete window.SearchManager;
    delete window.searchDatabaseForCommandPalette;
    installFuseStub();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(publicEntries),
    });
  });

  afterEach(() => {
    if (window.SearchManager) {
      window.SearchManager.reset();
    }
    delete window.SearchManager;
    delete window.searchDatabaseForCommandPalette;
    delete global.Fuse;
  });

  it("returns empty results for queries shorter than two characters", async () => {
    require("../assets/js/search-manager.js");

    await expect(window.SearchManager.search("")).resolves.toEqual([]);
    await expect(window.SearchManager.search("a")).resolves.toEqual([]);
    expect(global.Fuse).not.toHaveBeenCalled();
  });

  it("initializes Fuse and returns matching entries", async () => {
    require("../assets/js/search-manager.js");

    const results = await window.SearchManager.search("multiphase");

    expect(global.Fuse).toHaveBeenCalled();
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.item.title && r.item.url)).toBe(true);
  });

  it("sorts results by priority before Fuse score", async () => {
    require("../assets/js/search-manager.js");

    const results = await window.SearchManager.search("multiphase", {
      maxResults: 5,
    });

    expect(results[0].item.title).toBe("Multiphase Blog Post");
    expect(results[0].item.priority).toBe(1);
    expect(results[1].item.priority).toBe(2);
  });

  it("formats command-palette results for queries of 3+ characters", async () => {
    require("../assets/js/search-manager.js");

    const results = await window.SearchManager.searchForCommandPalette("mul");

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toMatchObject({
      section: "Search Results",
      icon: expect.stringContaining("fa-file-lines"),
    });
    expect(results[0].id).toMatch(/^search-result-/);
    expect(typeof results[0].handler).toBe("function");
    expect(results[0].excerpt.length).toBeGreaterThan(0);
  });

  it("rejects command-palette searches shorter than three characters", async () => {
    require("../assets/js/search-manager.js");

    await expect(
      window.SearchManager.searchForCommandPalette("ab")
    ).resolves.toEqual([]);
  });

  it("builds palette handlers only for safe public result URLs", async () => {
    require("../assets/js/search-manager.js");

    const results =
      await window.SearchManager.searchForCommandPalette("teaching");
    const teaching = results.find((r) =>
      r.title.toLowerCase().includes("teaching")
    );

    expect(teaching).toBeDefined();
    expect(teaching.title).toBe("Teaching Basilisk");
    expect(typeof teaching.handler).toBe("function");
    // Sanitization tests cover rejecting unsafe URLs before Fuse runs;
    // here we only assert the palette transform wired a callable handler.
  });

  it("exposes search stats after a successful load", async () => {
    require("../assets/js/search-manager.js");

    await window.SearchManager.search("basilisk");
    const stats = window.SearchManager.getSearchStats();

    expect(stats.isLoaded).toBe(true);
    expect(stats.itemCount).toBe(publicEntries.length);
    expect(stats.isFuseInitialized).toBe(true);
  });
});
