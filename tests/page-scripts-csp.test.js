const fs = require("fs");
const path = require("path");

const repositoryRoot = path.resolve(__dirname, "..");
const templates = [
  "_includes/theme-init.html",
  "_includes/tokens-head.html",
  "_join-us/index.md",
  "_layouts/default.html",
  "_layouts/history.html",
  "_layouts/join-us.html",
  "_layouts/research.html",
  "_layouts/team.html",
  "_layouts/teaching.html",
  "_layouts/teaching-course.html",
  "_teaching/2025-Basilisk101-Madrid.md",
  "_teaching/2025-Basilisk101nano-ECS.md",
  "_team/index.md",
  "about-legacy.html",
  "about.html",
  "contact.html",
  "index.html",
  "news/index.md",
  "scripts/generate_filtered_research.rb"
];

describe("CSP-compatible page scripts", () => {
  test.each(templates)("%s has no executable inline JavaScript", (template) => {
    const source = fs.readFileSync(path.join(repositoryRoot, template), "utf8");
    const withoutJsonLd = source.replace(
      /<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,
      ""
    );
    const inlineScripts = withoutJsonLd.match(
      /<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/gi
    );

    expect(inlineScripts).toBeNull();
  });

  test.each(templates)("%s has no inline event handlers", (template) => {
    const source = fs.readFileSync(path.join(repositoryRoot, template), "utf8");
    expect(source).not.toMatch(/\son[a-z]+\s*=/i);
  });

  test("theme and cached images initialize without inline handlers", () => {
    document.documentElement.className = "no-js";
    document.body.innerHTML = [
      '<button id="theme-toggle"></button>',
      '<img id="portrait" data-image-state="team-photo">'
    ].join("");
    localStorage.setItem("theme", "dark");

    Object.defineProperty(document.getElementById("portrait"), "complete", {
      configurable: true,
      value: true
    });
    Object.defineProperty(document.getElementById("portrait"), "naturalWidth", {
      configurable: true,
      value: 100
    });

    jest.isolateModules(() => {
      require("../assets/js/theme-init.js");
    });
    document.dispatchEvent(new Event("DOMContentLoaded"));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.classList.contains("js")).toBe(true);
    expect(document.getElementById("portrait").classList).toContain("loaded");

    document.getElementById("theme-toggle").click();
    expect(document.documentElement.dataset.theme).toBe("light");
  });
});
