const fs = require("fs");
const path = require("path");

describe("self-hosted hero media lifecycle", () => {
  let play;
  let pause;
  let listeners;
  let hidden;
  let motion;

  function mount(reduced = false) {
    motion.matches = reduced;
    document.body.innerHTML = `
      <div class="hero__media">
        <figure data-active="true" data-duration="100"><video muted loop></video></figure>
        <figure data-active="false" data-duration="200" aria-hidden="true" inert>
          <video muted loop></video></figure>
      </div>`;
    require("../assets/js/page-home.js");
    return [...document.querySelectorAll("video")];
  }

  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetModules();
    hidden = false;
    jest.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
    play = jest.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    pause = jest
      .spyOn(HTMLMediaElement.prototype, "pause")
      .mockImplementation(() => {});
    motion = { matches: false, addEventListener: jest.fn() };
    jest.spyOn(window, "matchMedia").mockReturnValue(motion);
    listeners = [];
    [document, window].forEach((target) => {
      const add = target.addEventListener.bind(target);
      jest
        .spyOn(target, "addEventListener")
        .mockImplementation((type, listener, options) => {
          listeners.push({ target, type, listener, options });
          add(type, listener, options);
        });
    });
  });

  afterEach(() => {
    listeners.forEach(({ target, type, listener, options }) => {
      target.removeEventListener(type, listener, options);
    });
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
    document.body.innerHTML = "";
  });

  test("only the visible video plays, and rotations update focus visibility", () => {
    const [first, second] = mount();
    expect(play.mock.instances).toEqual([first]);
    expect(pause.mock.instances).toEqual([second]);
    jest.advanceTimersByTime(100);
    expect(first.parentNode.getAttribute("aria-hidden")).toBe("true");
    expect(first.parentNode.hasAttribute("inert")).toBe(true);
    expect(second.parentNode.getAttribute("data-active")).toBe("true");
    expect(second.parentNode.hasAttribute("inert")).toBe(false);
    expect(play.mock.instances.at(-1)).toBe(second);
    jest.advanceTimersByTime(200);
    expect(first.parentNode.getAttribute("data-active")).toBe("true");
  });

  test("reduced motion shows still media without playback or rotation", () => {
    const videos = mount(true);
    expect(play).not.toHaveBeenCalled();
    expect(pause).toHaveBeenCalledTimes(2);
    expect(videos.every((video) => !video.loop && !video.autoplay)).toBe(true);
    jest.advanceTimersByTime(5000);
    expect(videos[0].parentNode.getAttribute("data-active")).toBe("true");
  });

  test("background tabs and pagehide stop playback and timers", () => {
    const [first] = mount();
    hidden = true;
    document.dispatchEvent(new Event("visibilitychange"));
    const played = play.mock.calls.length;
    jest.advanceTimersByTime(1000);
    expect(play).toHaveBeenCalledTimes(played);
    expect(first.parentNode.getAttribute("data-active")).toBe("true");
    hidden = false;
    document.dispatchEvent(new Event("visibilitychange"));
    expect(play).toHaveBeenCalledTimes(played + 1);
    window.dispatchEvent(new Event("pagehide"));
    expect(jest.getTimerCount()).toBe(0);
    window.dispatchEvent(new Event("pageshow"));
    expect(jest.getTimerCount()).toBe(1);
  });

  test("turning on reduced motion cancels an in-progress rotation", () => {
    mount();
    motion.matches = true;
    motion.addEventListener.mock.calls[0][1]();
    expect(jest.getTimerCount()).toBe(0);
    expect(
      [...document.querySelectorAll("video")].every((video) => !video.loop)
    ).toBe(true);
  });

  test("homepage has owned video and a deliberate YouTube link, no iframe", () => {
    const root = path.join(__dirname, "..");
    const template = fs.readFileSync(path.join(root, "index.html"), "utf8");
    const hero = fs.readFileSync(path.join(root, "_data/hero.yml"), "utf8");
    expect(template).not.toContain("youtube-nocookie.com/embed");
    expect(template).toContain("Watch on YouTube");
    expect(template).not.toContain("<video autoplay");
    expect(hero).toContain("/assets/videos/hero-worthington-jets.mp4");
    expect(
      fs.existsSync(path.join(root, "assets/videos/hero-worthington-jets.mp4"))
    ).toBe(true);
    expect(
      fs.existsSync(
        path.join(root, "assets/images/research/hero-worthington-jets.jpg")
      )
    ).toBe(true);
  });
});
