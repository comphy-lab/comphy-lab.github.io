const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const dependencies = require("../assets/vendor/manifest.json");
const DOMPurify = require("../assets/vendor/dompurify-3.4.15/purify.min.js");
const Fuse = require("../assets/vendor/fuse.js-6.6.2/fuse.min.js");
const marked = require("../assets/vendor/marked-18.0.7/marked.umd.js");

describe("pinned browser dependencies", () => {
  test.each(dependencies)("$name bytes match the recorded integrity", (dep) => {
    const bytes = fs.readFileSync(path.join(__dirname, "..", dep.path));
    const integrity = `sha384-${crypto
      .createHash("sha384")
      .update(bytes)
      .digest("base64")}`;
    expect(integrity).toBe(dep.integrity);
    expect(fs.existsSync(path.join(__dirname, "..", dep.license))).toBe(true);
  });

  test("Markdown retains links and emphasis while sanitizing active content", () => {
    const parsed = marked.parse(
      "**Research** [paper](https://example.org) " +
        '<img src=x onerror="alert(1)"><script>alert(1)</script>' +
        '<a href="javascript:alert(1)">unsafe</a>'
    );
    const node = document.createElement("div");
    node.innerHTML = DOMPurify.sanitize(parsed);
    expect(node.querySelector("strong").textContent).toBe("Research");
    expect(node.querySelector("a").href).toBe("https://example.org/");
    expect(node.querySelector("script")).toBeNull();
    expect(node.querySelector("[onerror]")).toBeNull();
    expect(node.querySelector('a[href^="javascript:"]')).toBeNull();
  });

  test("sanitization preserves scientific MathML and static SVG", () => {
    const clean = DOMPurify.sanitize(
      "<math><mi>We</mi><mo>=</mo><mn>1</mn></math>" +
        '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="5" /></svg>'
    );
    expect(clean).toContain("<math>");
    expect(clean).toContain("<circle");
  });

  test("Fuse returns a useful fuzzy result with the existing search API", () => {
    const engine = new Fuse(
      [{ title: "Viscoelastic Worthington Jets" }, { title: "Drop impact" }],
      { keys: ["title"], includeScore: true, threshold: 0.4 }
    );
    const results = engine.search("Worthinton");
    expect(results[0].item.title).toBe("Viscoelastic Worthington Jets");
    expect(results).toHaveLength(1);
    expect(Number.isFinite(results[0].score)).toBe(true);
  });
});
