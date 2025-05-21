// Setup file for Jest tests

// Mock browser global objects
global.window = {
  commandData: [],
  searchData: [],
  location: {
    href: '',
    pathname: '/'
  },
  history: {
    back: jest.fn(),
    forward: jest.fn()
  },
  open: jest.fn(),
  scrollTo: jest.fn(),
  matchMedia: jest.fn().mockImplementation(query => ({
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn()
  }))
};

// Mock document
global.document = {
  body: {
    scrollHeight: 1000,
    appendChild: jest.fn(),
    removeChild: jest.fn()
  },
  createElement: jest.fn().mockImplementation(tagName => ({
    tagName,
    style: {},
    setAttribute: jest.fn(),
    addEventListener: jest.fn(),
    appendChild: jest.fn(),
    focus: jest.fn(),
  })),
  addEventListener: jest.fn(),
  querySelectorAll: jest.fn().mockImplementation(() => []),
  getElementById: jest.fn().mockImplementation(() => ({
    addEventListener: jest.fn()
  }))
};

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