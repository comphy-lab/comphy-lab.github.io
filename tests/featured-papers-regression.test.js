describe("featured papers homepage media handling", () => {
  const researchHtml = `
    <h3 id="1">[1] Iframe-only featured paper</h3>
    <div class="tags"><span>Featured</span></div>
    <iframe
      src="https://www.youtube-nocookie.com/embed/abc123"
      srcdoc="<script>alert('xss')</script>"
      title="YouTube video player"
      allowfullscreen
    ></iframe>

    <h3 id="2">[2] Featured paper with static image</h3>
    <div class="tags"><span>Featured</span></div>
    <iframe src="https://www.youtube-nocookie.com/embed/def456"></iframe>
    <div><img src="/assets/images/covers/example.webp" alt="cover" /></div>
  `;

  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = `
      <div id="preloader"></div>
      <div class="featured-item__image"></div>
      <div id="about-content"></div>
      <div id="news-content"></div>
    `;
    window.history.pushState({}, "", "/");

    global.marked = {
      parse: jest.fn((value) => value),
    };
    global.DOMPurify = {
      sanitize: jest.fn((value) => value),
    };

    fetch.mockReset();
    fetch.mockImplementation((url) => {
      if (url === "/research/") {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(researchHtml),
        });
      }

      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(""),
      });
    });
  });

  afterEach(() => {
    document.body.innerHTML = "";
    delete global.marked;
    delete global.DOMPurify;
    jest.clearAllMocks();
  });

  it(
    "keeps iframe-only featured cards from losing their only media",
    async () => {
      require("../assets/js/main.js");

      window.dispatchEvent(new Event("load"));
      await Promise.resolve();
      await Promise.resolve();

      const cards = document.querySelectorAll(".featured-paper");
      const firstIframe = cards[0].querySelector("iframe");

      expect(cards).toHaveLength(2);
      expect(firstIframe).not.toBeNull();
      expect(firstIframe.getAttribute("loading")).toBe("lazy");
      expect(firstIframe.getAttribute("allow")).toBe(
        [
          "accelerometer",
          "autoplay",
          "clipboard-write",
          "encrypted-media",
          "gyroscope",
          "picture-in-picture",
          "web-share",
        ].join("; ")
      );
      expect(firstIframe.getAttribute("sandbox")).toBe(
        "allow-scripts allow-presentation"
      );
      expect(firstIframe.getAttribute("referrerpolicy")).toBe(
        "strict-origin-when-cross-origin"
      );
      expect(firstIframe.getAttribute("srcdoc")).toBeNull();
      expect(cards[1].querySelector("iframe")).toBeNull();
      expect(cards[1].querySelector("img")).not.toBeNull();
    }
  );

  it("drops untrusted iframe sources from featured cards", async () => {
    fetch.mockImplementation((url) => {
      if (url === "/research/") {
        return Promise.resolve({
          ok: true,
          text: () =>
            Promise.resolve(`
              <h3 id="1">[1] Untrusted featured paper</h3>
              <div class="tags"><span>Featured</span></div>
              <iframe src="data:text/html,<script>alert(1)</script>"></iframe>
            `),
        });
      }

      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(""),
      });
    });

    require("../assets/js/main.js");

    window.dispatchEvent(new Event("load"));
    await Promise.resolve();
    await Promise.resolve();

    const firstCard = document.querySelector(".featured-paper");
    expect(firstCard.querySelector("iframe")).toBeNull();
  });

  it("replaces inherited iframe permissions", async () => {
    fetch.mockImplementation((url) => {
      if (url === "/research/") {
        return Promise.resolve({
          ok: true,
          text: () =>
            Promise.resolve(`
              <h3 id="1">[1] Featured paper with permissive iframe</h3>
              <div class="tags"><span>Featured</span></div>
              <iframe
                src="https://www.youtube-nocookie.com/embed/xyz789"
                allow="camera; microphone; geolocation"
              ></iframe>
            `),
        });
      }

      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(""),
      });
    });

    require("../assets/js/main.js");

    window.dispatchEvent(new Event("load"));
    await Promise.resolve();
    await Promise.resolve();

    const firstIframe = document.querySelector(".featured-paper iframe");
    expect(firstIframe.getAttribute("allow")).toBe(
      [
        "accelerometer",
        "autoplay",
        "clipboard-write",
        "encrypted-media",
        "gyroscope",
        "picture-in-picture",
        "web-share",
      ].join("; ")
    );
  });
});
