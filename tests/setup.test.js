/**
 * Tests for the Jest setup file to ensure it's working correctly
 */

describe('Jest setup file', () => {
  // Clear module cache and re-require to test the setup file
  beforeEach(() => {
    jest.resetModules();
    delete global.window;
    delete global.document;
    delete global.fetch;
    // Store original console
    global.originalConsole = global.console;
  });
  
  afterEach(() => {
    // Restore original console
    if (global.originalConsole) {
      global.console = global.originalConsole;
    }
  });
  
  it('should create all necessary global mocks', () => {
    // Require setup file
    require('./setup');
    
    // Test window mock creation
    expect(global.window).toBeDefined();
    expect(global.window.commandData).toEqual([]);
    expect(global.window.searchData).toEqual([]);
    expect(global.window.location.href).toBe('');
    expect(global.window.location.pathname).toBe('/');
    expect(global.window.history.back).toBeDefined();
    expect(global.window.history.forward).toBeDefined();
    expect(global.window.open).toBeDefined();
    expect(global.window.scrollTo).toBeDefined();
    
    // Test matchMedia mock - line 17
    expect(global.window.matchMedia).toBeDefined();
    const mediaQuery = global.window.matchMedia('(prefers-color-scheme: dark)');
    expect(mediaQuery.matches).toBe(false);
    expect(mediaQuery.addListener).toBeDefined();
    expect(mediaQuery.removeListener).toBeDefined();
    
    // Test document mock creation
    expect(global.document).toBeDefined();
    expect(global.document.body.scrollHeight).toBe(1000);
    expect(global.document.body.appendChild).toBeDefined();
    expect(global.document.body.removeChild).toBeDefined();
    
    // Test createElement mock - lines 31-38
    expect(global.document.createElement).toBeDefined();
    const element = global.document.createElement('button');
    expect(element.tagName).toBe('button');
    expect(element.style).toEqual({});
    expect(element.setAttribute).toBeDefined();
    expect(element.addEventListener).toBeDefined();
    expect(element.appendChild).toBeDefined();
    expect(element.focus).toBeDefined();
    
    // Test document methods - lines 39-43
    expect(global.document.addEventListener).toBeDefined();
    expect(global.document.querySelectorAll).toBeDefined();
    const elements = global.document.querySelectorAll('.test');
    expect(elements).toEqual([]);
    
    expect(global.document.getElementById).toBeDefined();
    const elementById = global.document.getElementById('test');
    expect(elementById.addEventListener).toBeDefined();
    
    // Test console mocks
    expect(global.console.log).toBeDefined();
    expect(global.console.error).toBeDefined();
    expect(global.console.warn).toBeDefined();
    
    // Test fetch mock - lines 55-60
    expect(global.fetch).toBeDefined();
  });
  
  it('should have working fetch mock implementation', async () => {
    require('./setup');
    
    // Test the fetch mock implementation
    const response = await global.fetch('https://example.com/api');
    expect(response.ok).toBe(true);
    
    const data = await response.json();
    expect(data).toEqual([]);
  });
});