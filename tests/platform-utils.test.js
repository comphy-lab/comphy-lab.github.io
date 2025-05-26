/**
 * Tests for platform-utils.js
 */

describe('platform-utils.js', () => {
  let originalPlatform;
  
  beforeEach(() => {
    // Save original platform
    originalPlatform = Object.getOwnPropertyDescriptor(window.navigator, 'platform');
    
    // Clear any previous state
    delete window.isMacPlatform;
    delete window.updatePlatformSpecificElements;
    
    // Reset DOM
    document.body.innerHTML = '';
    
    // Clear module cache
    jest.resetModules();
  });
  
  afterEach(() => {
    // Restore original platform
    if (originalPlatform) {
      Object.defineProperty(window.navigator, 'platform', originalPlatform);
    }
  });

  it('should define isMacPlatform function', () => {
    require('../assets/js/platform-utils.js');
    
    expect(window.isMacPlatform).toBeDefined();
    expect(typeof window.isMacPlatform).toBe('function');
  });

  it('should detect Mac platform correctly', () => {
    // Mock Mac platform
    Object.defineProperty(window.navigator, 'platform', {
      value: 'MacIntel',
      configurable: true
    });
    
    require('../assets/js/platform-utils.js');
    
    expect(window.isMacPlatform()).toBe(true);
  });

  it('should detect non-Mac platform correctly', () => {
    // Mock Windows platform
    Object.defineProperty(window.navigator, 'platform', {
      value: 'Win32',
      configurable: true
    });
    
    require('../assets/js/platform-utils.js');
    
    expect(window.isMacPlatform()).toBe(false);
  });

  it('should handle various Mac platform strings', () => {
    const macPlatforms = ['MacIntel', 'MacPPC', 'Mac68K', 'Macintosh'];
    
    macPlatforms.forEach(platform => {
      jest.resetModules();
      delete window.isMacPlatform;
      
      Object.defineProperty(window.navigator, 'platform', {
        value: platform,
        configurable: true
      });
      
      require('../assets/js/platform-utils.js');
      
      expect(window.isMacPlatform()).toBe(true);
    });
  });

  it('should update platform-specific elements for Mac', () => {
    // Mock Mac platform
    Object.defineProperty(window.navigator, 'platform', {
      value: 'MacIntel',
      configurable: true
    });
    
    // Create test elements with correct class names
    document.body.innerHTML = `
      <span class="mac-theme-text" style="display: none;">Mac only content</span>
      <span class="default-theme-text" style="display: block;">Default content</span>
    `;
    
    require('../assets/js/platform-utils.js');
    
    // Trigger DOMContentLoaded
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
    
    // Check elements were updated
    const macElements = document.querySelectorAll('.mac-theme-text');
    const defaultElements = document.querySelectorAll('.default-theme-text');
    
    expect(macElements[0].style.display).toBe('inline');
    expect(defaultElements[0].style.display).toBe('none');
  });

  it('should update platform-specific elements for Windows', () => {
    // Mock Windows platform
    Object.defineProperty(window.navigator, 'platform', {
      value: 'Win32',
      configurable: true
    });
    
    // Create test elements with correct class names
    document.body.innerHTML = `
      <span class="mac-theme-text" style="display: block;">Mac only content</span>
      <span class="default-theme-text" style="display: none;">Default content</span>
    `;
    
    require('../assets/js/platform-utils.js');
    
    // Trigger DOMContentLoaded
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
    
    // Check elements were updated
    const macElements = document.querySelectorAll('.mac-theme-text');
    const defaultElements = document.querySelectorAll('.default-theme-text');
    
    expect(macElements[0].style.display).toBe('none');
    expect(defaultElements[0].style.display).toBe('inline');
  });

  it('should handle empty DOM gracefully', () => {
    Object.defineProperty(window.navigator, 'platform', {
      value: 'MacIntel',
      configurable: true
    });
    
    // No elements in DOM
    document.body.innerHTML = '';
    
    // Should not throw error
    expect(() => {
      require('../assets/js/platform-utils.js');
    }).not.toThrow();
  });

  it('should define updatePlatformSpecificElements function', () => {
    require('../assets/js/platform-utils.js');
    
    expect(window.updatePlatformSpecificElements).toBeDefined();
    expect(typeof window.updatePlatformSpecificElements).toBe('function');
  });

  it('should be case-insensitive for Mac detection', () => {
    Object.defineProperty(window.navigator, 'platform', {
      value: 'MACINTEL',
      configurable: true
    });
    
    require('../assets/js/platform-utils.js');
    
    expect(window.isMacPlatform()).toBe(true);
  });
});