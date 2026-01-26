// Setup file for Jest tests

if (typeof window === "undefined" || typeof document === "undefined") {
  throw new Error("Jest setup requires the jsdom test environment.");
}

// Ensure globals used by site scripts are present.
window.commandData = [];
window.searchData = [];

if (!window.history) {
  window.history = {};
}
window.history.back = window.history.back || jest.fn();
window.history.forward = window.history.forward || jest.fn();

window.open = window.open || jest.fn();
window.scrollTo = window.scrollTo || jest.fn();

if (!window.matchMedia) {
  window.matchMedia = jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }));
}

if (document.body) {
  Object.defineProperty(document.body, "scrollHeight", {
    configurable: true,
    get: () => 1000
  });
}

// Console mocks
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};

// Mock fetch API
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([])
  })
);
