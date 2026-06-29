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
            title: "Private internal backlog - Elasticity and viscoelasticity",
            url: "https://blogs.comphy-lab.org/Private/Internal-Backlog/",
            content: "internal planning item",
            priority: 3,
          },
          {
            title: "0_todo blog backlog",
            url: "https://blogs.comphy-lab.org/0_ToDo/Internal-Backlog/",
            content: "internal backlog page",
            priority: 3,
          },
          {
            title: "Admin internal note",
            url: "https://blogs.comphy-lab.org/Admin/Internal-Note/",
            content: "internal admin page",
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

  it("keeps public pages whose content references internal backlog URLs", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            title: "Skill - Badge Shapes",
            url: "https://comphy-lab.org/.agents/skills/add-paper/SKILL/#badge-shapes",
            content:
              "Example badge config referencing https://blogs.comphy-lab.org/0_ToDo/Internal-Backlog/ for documentation only.",
            priority: 3,
          },
          {
            title: "Private internal backlog - Elasticity and viscoelasticity",
            url: "https://blogs.comphy-lab.org/Private/Internal-Backlog/",
            content: "internal planning item",
            priority: 3,
          },
        ]),
    });

    require("../assets/js/search-manager.js");

    const data = await window.SearchManager.loadSearchDatabase();

    expect(data).toHaveLength(1);
    expect(data[0].title).toBe("Skill - Badge Shapes");
    expect(data[0].url).toBe(
      "https://comphy-lab.org/.agents/skills/add-paper/SKILL/#badge-shapes"
    );
  });
});
