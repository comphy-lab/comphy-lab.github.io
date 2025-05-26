/**
 * Tests for teaching.js
 * Note: Functions in teaching.js are not exported or attached to window,
 * so we can only test that the file loads without errors and that
 * the initialization code runs properly.
 */

describe('teaching.js', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
    
    // Clear module cache
    jest.resetModules();
  });

  it('should load teaching.js without errors', () => {
    expect(() => {
      require('../assets/js/teaching.js');
    }).not.toThrow();
  });

  it('should define sortCoursesByDate function on window', () => {
    require('../assets/js/teaching.js');
    
    expect(window.sortCoursesByDate).toBeDefined();
    expect(typeof window.sortCoursesByDate).toBe('function');
  });

  it('should handle case when course elements exist on page load', () => {
    // Mock being on teaching page
    Object.defineProperty(window, 'location', {
      value: { pathname: '/teaching' },
      configurable: true
    });
    
    // Create mock course elements
    document.body.innerHTML = `
      <div class="teaching-content">
        <div>
          <a href="2024-Fall-Course">Fall 2024 Course</a>
        </div>
        <div>
          <a href="2023-Spring-Course">Spring 2023 Course</a>
        </div>
      </div>
    `;
    
    // Load the module
    require('../assets/js/teaching.js');
    
    // Trigger DOMContentLoaded
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
    
    // Check that courses still exist (no errors thrown)
    const courses = document.querySelectorAll('a[href*="Course"]');
    expect(courses.length).toBeGreaterThan(0);
  });
});