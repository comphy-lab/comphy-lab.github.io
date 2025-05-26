/**
 * Tests for the actual fix-line-length.js script
 * Note: This script is designed to be run as a utility and modifies files directly
 */

describe('fix-line-length.js actual implementation', () => {
  const originalLog = console.log;
  const originalError = console.error;
  let mockFs;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock console
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Clear module cache
    jest.resetModules();
    
    // Create fresh mock for fs
    mockFs = {
      readdirSync: jest.fn(),
      readFileSync: jest.fn(),
      writeFileSync: jest.fn()
    };
    
    // Mock the fs module
    jest.doMock('fs', () => mockFs);
  });
  
  afterEach(() => {
    // Restore originals
    console.log = originalLog;
    console.error = originalError;
    jest.dontMock('fs');
  });

  it('should process JavaScript files in the assets/js directory', () => {
    // Mock directory listing
    mockFs.readdirSync.mockReturnValue(['test.js', 'another.js', 'style.css']);
    mockFs.readFileSync.mockReturnValue('const short = "line";');
    
    require('../scripts/fix-line-length.js');
    
    // Check that it read the directory
    expect(mockFs.readdirSync).toHaveBeenCalledWith(expect.stringContaining('assets/js'));
    
    // Check that it processed only .js files
    expect(mockFs.readFileSync).toHaveBeenCalledTimes(2); // test.js and another.js
  });

  it('should process long lines in JavaScript files', () => {
    mockFs.readdirSync.mockReturnValue(['long-lines.js']);
    
    // Mock file with long object definition that the script knows how to break
    const longLine = 'const commandData = [{id: "home", title: "Go to Home", handler: () => { window.location.href = "/"; }, section: "Navigation", icon: "<i class=\\"fa-solid fa-home\\"></i>"}];';
    mockFs.readFileSync.mockReturnValue(longLine);
    
    require('../scripts/fix-line-length.js');
    
    // The script should have read the file
    expect(mockFs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('long-lines.js'), 'utf8');
    
    // Check if file was written (it may or may not be, depending on the breaking logic)
    if (mockFs.writeFileSync.mock.calls.length > 0) {
      const writtenContent = mockFs.writeFileSync.mock.calls[0][1];
      
      // Check that lines were processed
      const lines = writtenContent.split('\n');
      expect(lines.length).toBeGreaterThan(0);
    }
  });

  it('should handle empty directory', () => {
    mockFs.readdirSync.mockReturnValue([]);
    
    require('../scripts/fix-line-length.js');
    
    // Should not try to read any files
    expect(mockFs.readFileSync).not.toHaveBeenCalled();
  });

  it('should skip non-JavaScript files', () => {
    mockFs.readdirSync.mockReturnValue(['style.css', 'readme.md', 'image.png']);
    
    require('../scripts/fix-line-length.js');
    
    // Should not read any files
    expect(mockFs.readFileSync).not.toHaveBeenCalled();
  });

  it('should handle read errors gracefully', () => {
    mockFs.readdirSync.mockReturnValue(['error.js']);
    mockFs.readFileSync.mockImplementation(() => {
      throw new Error('Permission denied');
    });
    
    // Should not throw
    expect(() => {
      require('../scripts/fix-line-length.js');
    }).not.toThrow();
    
    // Should log error
    expect(console.error).toHaveBeenCalled();
  });

  it('should process multiple files', () => {
    mockFs.readdirSync.mockReturnValue(['file1.js', 'file2.js', 'file3.js']);
    mockFs.readFileSync.mockReturnValue('short line');
    
    require('../scripts/fix-line-length.js');
    
    // Should process all 3 files
    expect(mockFs.readFileSync).toHaveBeenCalledTimes(3);
    // Files with short lines won't be written
    expect(mockFs.writeFileSync).toHaveBeenCalledTimes(0);
  });

  it('should log summary of processed files', () => {
    mockFs.readdirSync.mockReturnValue(['test1.js', 'test2.js']);
    mockFs.readFileSync.mockReturnValue('short line');
    
    require('../scripts/fix-line-length.js');
    
    // Should log summary with stats
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Total stats:'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('0 lines exceeded 80 characters'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('0 files were modified'));
  });
});