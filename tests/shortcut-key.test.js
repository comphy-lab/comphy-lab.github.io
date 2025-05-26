/**
 * Tests for shortcut-key.js
 */

describe('shortcut-key.js', () => {
  beforeEach(() => {
    // Mock isMacPlatform function
    window.isMacPlatform = jest.fn();
    
    // Reset DOM
    document.body.innerHTML = '';
    
    // Clear module cache
    jest.resetModules();
  });

  it('should load without errors', () => {
    expect(() => {
      require('../assets/js/shortcut-key.js');
    }).not.toThrow();
  });

  it('should update theme elements for Mac platform', () => {
    // Mock Mac platform
    window.isMacPlatform.mockReturnValue(true);
    
    // Create test elements
    document.body.innerHTML = `
      <span class="default-theme-text" style="display: block;">Default theme</span>
      <span class="mac-theme-text" style="display: none;">Mac theme</span>
    `;
    
    // Load the module
    require('../assets/js/shortcut-key.js');
    
    // Trigger DOMContentLoaded
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
    
    // Check that elements were updated
    const defaultElements = document.querySelectorAll('.default-theme-text');
    const macElements = document.querySelectorAll('.mac-theme-text');
    
    expect(defaultElements[0].style.display).toBe('none');
    expect(macElements[0].style.display).toBe('inline');
  });

  it('should update theme elements for non-Mac platform', () => {
    // Mock Windows platform
    window.isMacPlatform.mockReturnValue(false);
    
    // Create test elements
    document.body.innerHTML = `
      <span class="default-theme-text" style="display: none;">Default theme</span>
      <span class="mac-theme-text" style="display: block;">Mac theme</span>
    `;
    
    // Load the module
    require('../assets/js/shortcut-key.js');
    
    // Trigger DOMContentLoaded
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
    
    // Check that elements were updated
    const defaultElements = document.querySelectorAll('.default-theme-text');
    const macElements = document.querySelectorAll('.mac-theme-text');
    
    expect(defaultElements[0].style.display).toBe('inline');
    expect(macElements[0].style.display).toBe('none');
  });

  it('should handle empty DOM', () => {
    window.isMacPlatform.mockReturnValue(true);
    
    // No elements in DOM
    document.body.innerHTML = '';
    
    // Should not throw error
    expect(() => {
      require('../assets/js/shortcut-key.js');
      const event = new Event('DOMContentLoaded');
      document.dispatchEvent(event);
    }).not.toThrow();
  });

  it('should handle multiple elements', () => {
    window.isMacPlatform.mockReturnValue(false);
    
    document.body.innerHTML = `
      <span class="default-theme-text">Default 1</span>
      <span class="default-theme-text">Default 2</span>
      <span class="mac-theme-text">Mac 1</span>
      <span class="mac-theme-text">Mac 2</span>
    `;
    
    require('../assets/js/shortcut-key.js');
    
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
    
    const defaultElements = document.querySelectorAll('.default-theme-text');
    const macElements = document.querySelectorAll('.mac-theme-text');
    
    // All default elements should be visible
    defaultElements.forEach(el => {
      expect(el.style.display).toBe('inline');
    });
    
    // All mac elements should be hidden
    macElements.forEach(el => {
      expect(el.style.display).toBe('none');
    });
  });
});