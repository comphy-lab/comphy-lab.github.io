/**
 * Tests for the actual command-data.js module
 */

// Mock dependencies
global.Fuse = jest.fn().mockImplementation(() => ({
  search: jest.fn().mockReturnValue([])
}));
global.sortCoursesByDate = jest.fn();

describe('command-data.js actual implementation', () => {
  beforeEach(() => {
    // Clear any previous command data
    window.commandData = [];
    window.searchData = [];
    
    // Reset DOM
    document.body.innerHTML = '';
    
    // Reset mocks
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should load and define window.commandData', () => {
    // Load the actual module
    require('../assets/js/command-data.js');
    
    // Check that commandData is defined
    expect(window.commandData).toBeDefined();
    expect(Array.isArray(window.commandData)).toBe(true);
    expect(window.commandData.length).toBeGreaterThan(0);
  });

  it('should have navigation commands', () => {
    require('../assets/js/command-data.js');
    
    const navigationCommands = window.commandData.filter(cmd => cmd.section === 'Navigation');
    expect(navigationCommands.length).toBeGreaterThan(0);
    
    // Check for specific navigation commands
    const homeCommand = window.commandData.find(cmd => cmd.id === 'home');
    expect(homeCommand).toBeDefined();
    expect(homeCommand.title).toBe('Go to Home');
  });

  it('should add event listener on DOMContentLoaded', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    
    require('../assets/js/command-data.js');
    
    // Check that DOMContentLoaded listener was added
    expect(addEventListenerSpy).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));
  });

  it('should handle page-specific initialization', () => {
    // Mock being on team page
    Object.defineProperty(window, 'location', {
      value: { pathname: '/team/' },
      configurable: true
    });
    
    require('../assets/js/command-data.js');
    
    // Trigger DOMContentLoaded
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
    
    // Should not throw errors
    expect(window.commandData).toBeDefined();
  });
});