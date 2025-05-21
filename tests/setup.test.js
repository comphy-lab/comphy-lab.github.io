/**
 * Tests for the Jest setup file to ensure it's working correctly
 */

describe('Jest setup environment', () => {
  // Load the setup file
  require('./setup');
  
  it('should have properly mocked window object', () => {
    expect(window).toBeDefined();
    expect(window.location).toBeDefined();
  });
  
  it('should have mocked document object', () => {
    expect(document).toBeDefined();
    expect(document.createElement).toBeDefined();
    expect(typeof document.createElement).toBe('function');
  });
  
  it('should have mocked console with spy functions', () => {
    expect(console.log).toBeDefined();
    expect(console.error).toBeDefined();
    expect(console.warn).toBeDefined();
  });
  
  it('should have mocked fetch function', () => {
    expect(fetch).toBeDefined();
    expect(typeof fetch).toBe('function');
  });
});