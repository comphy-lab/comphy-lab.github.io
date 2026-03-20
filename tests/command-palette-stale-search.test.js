/**
 * Regression tests for stale async search results in the command palette.
 *
 * When a second search is issued before the first resolves, the first
 * (now-stale) result must be silently discarded and must NOT overwrite
 * the result of the most-recent search.
 *
 * These tests are behaviour-focused: they interact through the public
 * renderCommandResults function and observe visible DOM output.
 */

// Stub globals that command-palette.js reads at module load time.
global.Utils = {
  updatePlatformSpecificElements: jest.fn(),
  isMacPlatform: jest.fn().mockReturnValue(false),
};

describe("command palette stale-search guard", () => {
  let resultsContainer;
  let resolveFirst;
  let resolveSecond;

  beforeEach(() => {
    jest.resetModules();

    // Build the DOM elements that renderCommandResults expects.
    document.body.innerHTML = `
      <div id="simple-command-palette">
        <input id="command-palette-input" />
        <div id="command-palette-results"></div>
      </div>
    `;
    resultsContainer = document.getElementById("command-palette-results");

    window.commandData = [];

    // Two independent promises let tests control resolution order.
    const firstSearch = new Promise((resolve) => {
      resolveFirst = resolve;
    });
    const secondSearch = new Promise((resolve) => {
      resolveSecond = resolve;
    });

    let callCount = 0;
    window.SearchManager = {
      searchForCommandPalette: jest.fn(() => {
        callCount += 1;
        return callCount === 1 ? firstSearch : secondSearch;
      }),
    };

    // Load the real module so we exercise its actual token guard.
    require("../assets/js/command-palette.js");
  });

  afterEach(() => {
    document.body.innerHTML = "";
    delete window.SearchManager;
    window.commandData = [];
    jest.clearAllMocks();
  });

  it("discards a stale first result when a second search resolves later", async () => {
    // Fire two searches back-to-back while both async calls are in-flight.
    window.renderCommandResults("abc");
    window.renderCommandResults("abcd");

    // Resolve the FIRST (stale) search.
    resolveFirst([
      { title: "Stale Result", icon: "", section: "Search Results" },
    ]);
    await Promise.resolve();
    await Promise.resolve();

    // Stale result must NOT appear because a newer search superseded it.
    expect(resultsContainer.textContent).not.toContain("Stale Result");

    // Now resolve the second (current) search.
    resolveSecond([
      { title: "Fresh Result", icon: "", section: "Search Results" },
    ]);
    await Promise.resolve();
    await Promise.resolve();

    // Only the fresh result should be visible.
    expect(resultsContainer.textContent).toContain("Fresh Result");
    expect(resultsContainer.textContent).not.toContain("Stale Result");
  });

  it("shows results when the only in-flight search resolves normally", async () => {
    window.renderCommandResults("abc");

    resolveFirst([
      { title: "Normal Result", icon: "", section: "Search Results" },
    ]);
    await Promise.resolve();
    await Promise.resolve();

    expect(resultsContainer.textContent).toContain("Normal Result");
  });

  it("does not touch the DOM when a superseded search resolves after the current one", async () => {
    window.renderCommandResults("abc");
    window.renderCommandResults("abcd");

    // Let the current (second) search resolve first.
    resolveSecond([
      { title: "Current Result", icon: "", section: "Search Results" },
    ]);
    await Promise.resolve();
    await Promise.resolve();

    const snapshotAfterCurrent = resultsContainer.innerHTML;

    // Now the stale (first) search resolves — must be a no-op.
    resolveFirst([
      { title: "Late Stale Result", icon: "", section: "Search Results" },
    ]);
    await Promise.resolve();
    await Promise.resolve();

    expect(resultsContainer.innerHTML).toBe(snapshotAfterCurrent);
    expect(resultsContainer.textContent).not.toContain("Late Stale Result");
  });
});
