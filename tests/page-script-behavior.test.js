describe("page script behavior", () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    delete window.IntersectionObserver;
    document.body.innerHTML = "";
  });

  test("homepage pauses the outgoing video before hiding its figure", () => {
    jest.useFakeTimers();
    document.body.innerHTML = [
      '<div class="hero__media">',
      '<figure data-active="true" data-duration="10"><video></video></figure>',
      '<figure data-active="false" data-duration="10"></figure>',
      "</div>",
    ].join("");
    var outgoing = document.querySelector("figure");
    var stateWhenPaused = null;
    jest.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {
      stateWhenPaused = outgoing.getAttribute("data-active");
    });

    jest.isolateModules(() => {
      require("../assets/js/page-home.js");
    });
    jest.advanceTimersByTime(10);

    expect(stateWhenPaused).toBe("true");
    expect(outgoing.getAttribute("data-active")).toBe("false");
  });

  test("team map uses a strict cross-origin referrer policy", () => {
    document.body.innerHTML = '<div id="team-map"></div>';

    jest.isolateModules(() => {
      require("../assets/js/page-team-map.js");
    });

    expect(document.querySelector("iframe").referrerPolicy).toBe(
      "strict-origin-when-cross-origin"
    );
  });

  test("legacy photos retry after an error rather than visibility", () => {
    jest.useFakeTimers();
    document.body.innerHTML = [
      '<div class="map-container"><div id="team-map"></div></div>',
      '<img class="team-photo" src="/portrait.jpg">',
    ].join("");
    window.IntersectionObserver = class {
      constructor(callback) {
        this.callback = callback;
      }

      observe(target) {
        this.callback([{ isIntersecting: true, target: target }]);
      }

      disconnect() {}
    };
    var photo = document.querySelector(".team-photo");
    var originalSource = photo.src;

    jest.isolateModules(() => {
      require("../assets/js/page-team-legacy.js");
    });
    document.dispatchEvent(new Event("DOMContentLoaded"));

    expect(photo.src).toBe(originalSource);
    photo.dispatchEvent(new Event("error"));
    jest.advanceTimersByTime(0);
    expect(photo.src).toContain("retry=");
    expect(document.querySelector("iframe").referrerPolicy).toBe(
      "strict-origin-when-cross-origin"
    );
  });
});
