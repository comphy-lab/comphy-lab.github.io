describe("search-manager sanitization", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    document.body.innerHTML = "";
    delete window.SearchManager;
    delete window.searchDatabaseForCommandPalette;
  });

  it("filters internal backlog pages from search results", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            title: "Private todo blog public - Elasticity and viscoelasticity",
            url:
              "https://blogs.comphy-lab.org/Private-ToDo-Blog-public/" +
              "#elasticity-and-viscoelasticity",
            content: "internal planning item",
            priority: 3,
          },
          {
            title: "0_todo blog public",
            url: "https://blogs.comphy-lab.org/0_ToDo-Blog-public/",
            content: "internal backlog page",
            priority: 3,
          },
          {
            title: "Teaching - Teaching: Methods",
            url: "https://comphy-lab.org/teaching/#teaching",
            content: "public teaching overview",
            priority: 3,
          },
        ]),
    });

    require("../assets/js/search-manager.js");

    const data = await window.SearchManager.loadSearchDatabase();

    expect(data).toHaveLength(1);
    expect(data[0].title).toBe("Teaching - Teaching: Methods");
    expect(data[0].url).toBe("https://comphy-lab.org/teaching/#teaching");
  });
});
