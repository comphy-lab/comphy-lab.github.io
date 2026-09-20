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

  it("lifts docs_* priority so project docs compete with blog", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            title: "Blog viscoelastic note",
            url: "https://blogs.comphy-lab.org/Lecture-Notes/ve/",
            content: "viscoelastic lecture",
            type: "blog_section",
            priority: 3,
          },
          {
            title: "Viscoelastic3D docs hub",
            url: "https://comphy-lab.org/Viscoelastic3D/index.html",
            content: "viscoelastic fluid simulation framework",
            type: "docs_content",
            priority: 4,
          },
          {
            title: "Research paper viscoelastic",
            url: "https://comphy-lab.org/research/#16",
            content: "Viscoelastic Worthington Jets",
            type: "paper",
            priority: 2,
          },
          {
            title: "Viscoelastic3D code chunk",
            url:
              "https://comphy-lab.org/Viscoelastic3D/" +
              "reset_install_requirements.sh.html",
            content: "viscoelastic setup script",
            type: "docs_code",
            priority: 4,
          },
        ]),
    });

    global.Fuse = jest.fn().mockImplementation((data) => ({
      search: () =>
        data.map((item, refIndex) => ({
          item,
          score: 0.1,
          refIndex,
        })),
    }));

    require("../assets/js/search-manager.js");

    const results = await window.SearchManager.search("viscoelastic", {
      maxResults: 5,
    });

    expect(results.map((r) => r.item.type)).toEqual([
      "paper",
      "docs_content",
      "docs_code",
      "blog_section",
    ]);
    expect(results[1].item.url).toContain("/Viscoelastic3D/index.html");
  });

  it("ranks docs hubs ahead of deeper docs_content peers", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            title: "Viscoelastic3D nested page",
            url:
              "https://comphy-lab.org/Viscoelastic3D/" +
              "guides/setup.html",
            content: "viscoelastic nested documentation",
            type: "docs_content",
            priority: 4,
          },
          {
            title: "Viscoelastic3D docs hub",
            url: "https://comphy-lab.org/Viscoelastic3D/index.html",
            content: "viscoelastic fluid simulation framework",
            type: "docs_content",
            priority: 4,
          },
        ]),
    });

    global.Fuse = jest.fn().mockImplementation((data) => ({
      search: () =>
        data.map((item, refIndex) => ({
          item,
          score: 0.1,
          refIndex,
        })),
    }));

    require("../assets/js/search-manager.js");

    const results = await window.SearchManager.search("viscoelastic", {
      maxResults: 5,
    });

    expect(results.map((r) => r.item.url)).toEqual([
      "https://comphy-lab.org/Viscoelastic3D/index.html",
      "https://comphy-lab.org/Viscoelastic3D/guides/setup.html",
    ]);
  });

  it("rejects unsafe and unapproved search result URLs", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            title: "Script URL",
            url: "javascript:alert(document.domain)",
            content: "malicious search entry",
          },
          {
            title: "Credentialed URL",
            url: "https://attacker@comphy-lab.org/",
            content: "misleading search entry",
          },
          {
            title: "External redirect",
            url: "https://example.net/phishing",
            content: "unapproved search entry",
          },
          {
            title: "Public blog post",
            url: "https://blogs.comphy-lab.org/public-post/",
            content: "approved search entry",
          },
        ]),
    });

    require("../assets/js/search-manager.js");

    const data = await window.SearchManager.loadSearchDatabase();

    expect(data).toHaveLength(1);
    expect(data[0].title).toBe("Public blog post");
  });
});
