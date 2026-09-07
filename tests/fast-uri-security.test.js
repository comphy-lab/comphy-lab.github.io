const URI = require("fast-uri");

// These inputs exercise the four advisories reported by Dependabot.
// They are parsed locally; no network request is made.
describe("fast-uri security regressions", () => {
  test("encoded schemes are rejected (GHSA-jqff-g426-hqxp)", () => {
    const value = "%2f%2fevil.example:/pwn";
    expect(URI.parse(value).error).toBeDefined();
    expect(() => URI.resolve("https://base.example/", value)).toThrow();
    expect(URI.normalize(value)).not.toMatch(/^\/\/evil\.example/);
  });

  test("malformed IPv6 is rejected (GHSA-f65p-4m7j-42xc)", () => {
    const value = "http://[::not-valid]/private";
    expect(URI.parse(value).error).toBeDefined();
    expect(() => URI.resolve("https://base.example/", value)).toThrow();
    expect(URI.normalize(value)).toBe(value);
  });

  test("hostnames are not decoded twice (GHSA-fph4-wmhf-6fwf)", () => {
    const value = "http://%256c%256f%2563%2561%256c%2568%256f%2573%2574/";
    expect(URI.normalize(value)).not.toBe("http://localhost/");
    expect(URI.resolve("https://base.example/", value)).not.toBe(
      "http://localhost/"
    );
  });

  test("scheme-relative IDNs are canonicalized (GHSA-5jgf-p345-68v8)", () => {
    expect(URI.resolve("https://base.example/", "//éxample.com/")).toBe(
      "https://xn--xample-9ua.com/"
    );
  });
  test("brackets cannot hide a destination (GHSA-58mr-gqgx-xq4g)", () => {
    const value = "http://user@[@127.0.0.1:8123/admin";
    const parsed = URI.parse(value);
    expect(new URL(value).hostname).toBe("127.0.0.1");
    expect(parsed.host).toBe("[@127.0.0.1");
    expect(parsed.error).toBe("URI host is malformed.");
    expect(() => URI.resolve("https://base.example/", value)).toThrow(
      "URI host is malformed."
    );
  });
});
