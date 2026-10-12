/**
 * Site header: the layouts share one include, and the stylesheets keep
 * the bar from wrapping and the Menu drawer usable.
 *
 * Layout itself cannot be measured in jsdom; these checks pin the rules that
 * a browser sweep (bar widths 769-1440 px, phone drawer at 390x844 and
 * 375x667) showed to matter.
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const LAYOUTS = [
  "_layouts/default.html",
  "_layouts/history.html",
  "_layouts/join-us.html",
  "_layouts/team.html",
];

/* Hrefs and accessible names in the header nav list, in order. */
function navItems(html) {
  const list = html.match(/<ul class="s-header__nav-list">([\s\S]*?)<\/ul>/);
  expect(list).not.toBeNull();
  const items = [];
  const anchor = /<a\s([^>]*)>([\s\S]*?)<\/a>/g;
  let match;
  while ((match = anchor.exec(list[1])) !== null) {
    const href = match[1].match(/href="([^"]*)"/);
    const label = match[1].match(/aria-label="([^"]*)"/);
    const text = match[2].replace(/<[^>]*>/g, "").trim();
    items.push([href ? href[1] : null, label ? label[1] : text]);
  }
  return items;
}

/* Bodies of the `@media screen and (max-width: Npx)` blocks, keyed by N. */
function mediaBlocks(css) {
  const blocks = {};
  const opener = /@media screen and \(max-width: (\d+)px\) \{/g;
  let match;
  while ((match = opener.exec(css)) !== null) {
    let depth = 1;
    let i = opener.lastIndex;
    while (depth > 0 && i < css.length) {
      if (css[i] === "{") depth += 1;
      if (css[i] === "}") depth -= 1;
      i += 1;
    }
    const width = Number(match[1]);
    blocks[width] = (blocks[width] || "") + css.slice(opener.lastIndex, i);
  }
  return blocks;
}

/* Declarations of the first rule with exactly this selector. */
function rule(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`(?:^|\\n)\\s*${escaped} \\{([^}]*)\\}`));
  return match ? match[1] : null;
}

/* The breakpoint whose block styles the given selector with `needle`. */
function breakpointOf(css, selector, needle) {
  const found = Object.entries(mediaBlocks(css)).filter(([, body]) => {
    const declarations = rule(body, selector);
    return declarations !== null && declarations.includes(needle);
  });
  expect(found).toHaveLength(1);
  return Number(found[0][0]);
}

describe("site header", () => {
  const styles = read("assets/css/styles.css");
  const palette = read("assets/css/command-palette.css");

  test("layouts that load command-palette.css also load design tokens", () => {
    const layoutDir = path.join(root, "_layouts");
    const layouts = fs
      .readdirSync(layoutDir)
      .filter((name) => name.endsWith(".html"))
      .map((name) => `_layouts/${name}`);
    const loaders = layouts.filter((file) =>
      read(file).includes("command-palette.css")
    );
    expect(loaders.length).toBeGreaterThan(0);
    for (const file of loaders) {
      const html = read(file);
      const hasTokens =
        html.includes("tokens.css") ||
        html.includes("tokens-head.html") ||
        /layout:\s*default/.test(html);
      expect(hasTokens).toBe(true);
    }
  });

  test("every layout uses the canonical header, Talks after Project docs", () => {
    const reference = navItems(read("_includes/header.html"));
    const hrefs = reference.map(([href]) => href);
    expect(hrefs.indexOf("/talks/")).toBe(hrefs.indexOf("/projects/") + 1);
    for (const layout of LAYOUTS) {
      expect(read(layout)).toContain("{% include header.html %}");
      expect(read(layout)).not.toContain('<header class="s-header">');
    }
  });

  test("header actions are native named buttons and links avoid prose rules", () => {
    const header = document.createElement("div");
    header.innerHTML = read("_includes/header.html");
    [
      "#theme-toggle",
      ".s-header__menu-toggle",
      ".s-header__nav-close-btn",
    ].forEach((selector) => {
      const button = header.querySelector(selector);
      expect(button.tagName).toBe("BUTTON");
      expect(button.type).toBe("button");
    });
    expect(
      header.querySelector("#theme-toggle").getAttribute("aria-label")
    ).toBe("Dark theme");
    expect(
      header
        .querySelector(".s-header__menu-toggle")
        .getAttribute("aria-controls")
    ).toBe("site-nav");
    expect(header.querySelector("#site-nav")).not.toBeNull();
    expect(
      header.querySelectorAll(".s-header__nav-list a:not([class])")
    ).toHaveLength(0);
  });

  test("nav labels never wrap inside their pills", () => {
    expect(rule(styles, ".s-header__nav-list a")).toMatch(
      /white-space:\s*nowrap/
    );
  });

  test("the command-palette header button uses theme tokens, not #000", () => {
    const btn = rule(palette, ".command-k-style-btn");
    expect(btn).toMatch(/color:\s*var\(--fg-1\)/);
    expect(btn).toMatch(/border-radius:\s*var\(--r-xs\)/);
    expect(btn).toMatch(/background:\s*color-mix\(in srgb, var\(--fg-strong\)/);
    expect(btn).toMatch(/border:\s*1px solid var\(--c-border\)/);
    expect(btn).not.toMatch(/#000/);
    const hover = rule(palette, ".command-k-style-btn:hover");
    expect(hover).toMatch(/var\(--c-accent-teal\)/);
    expect(palette).toMatch(
      new RegExp(
        "\\.s-header \\.command-k-style-btn:focus-visible," +
          "[\\s\\S]*?var\\(--c-accent-teal\\)"
      )
    );
    expect(rule(palette, ".command-k-style-btn .search-icon")).toMatch(
      /color:\s*inherit/
    );
  });

  test("the drawer and its command-palette button share one breakpoint", () => {
    const drawer = breakpointOf(
      styles,
      ".s-header__menu-toggle",
      "display: flex"
    );
    const button = breakpointOf(palette, ".command-k-style-btn", "width: 100%");
    expect(button).toBe(drawer);
    // The full bar needs about 1099 px (measured in Chromium and WebKit).
    expect(drawer).toBeGreaterThanOrEqual(1099);
  });

  test("the open drawer scrolls and the closed one leaves the tab order", () => {
    const blocks = mediaBlocks(styles);
    const drawer = breakpointOf(
      styles,
      ".s-header__menu-toggle",
      "display: flex"
    );
    const nav = rule(blocks[drawer], ".s-header__nav");
    expect(nav).toMatch(/overflow-y:\s*auto/);
    expect(nav).toMatch(/overscroll-behavior:\s*contain/);
    expect(nav).toMatch(/visibility:\s*hidden/);
    expect(rule(blocks[drawer], ".s-header__nav.is-active")).toMatch(
      /visibility:\s*visible/
    );
  });
});
