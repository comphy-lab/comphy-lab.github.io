const generatedIndex = require("../assets/js/search_db.json");

describe("project discovery with the shipped index and Fuse build", () => {
  beforeEach(() => {
    jest.resetModules();
    delete window.SearchManager;
    global.Fuse = require("../assets/vendor/fuse.js-6.6.2/fuse.min.js");
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => generatedIndex,
    });
  });

  afterEach(() => {
    window.SearchManager?.reset();
    delete window.SearchManager;
    delete global.Fuse;
  });

  test("Viscoelastic3D finds its documentation hub before blog sections", async () => {
    require("../assets/js/search-manager.js");
    const hits = await window.SearchManager.search("Viscoelastic3D");
    expect(hits[0].item.url).toBe(
      "https://comphy-lab.org/Viscoelastic3D/index.html"
    );
    expect(hits[0].item.type).toBe("docs_content");
    expect(hits[0].item.priority).toBe(3);
    expect(hits[0].item.projectSlug).toBe("Viscoelastic3D");
    expect(new Set(hits.map((hit) => hit.item.url)).size).toBe(hits.length);
    const palette =
      await window.SearchManager.searchForCommandPalette("Viscoelastic3D");
    expect(palette[0].title).toContain("ElastoFlow");
    expect(palette[0].section).toBe("Search Results");
  });

  test("generated data retains the upstream project priority", () => {
    const docs = generatedIndex.filter((entry) =>
      ["docs_content", "docs_code"].includes(entry.type)
    );
    expect(docs.length).toBeGreaterThan(0);
    expect(docs.every((entry) => entry.priority === 3)).toBe(true);
    expect(docs.every((entry) => !Object.hasOwn(entry, "projectSlug"))).toBe(
      true
    );
  });
});
