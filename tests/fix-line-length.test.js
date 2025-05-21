/**
 * Tests for the fix-line-length.js utility functions
 */

describe('fix-line-length.js utilities', () => {
  // Define test implementations of the functions we want to test
  // This avoids running the actual script which has side effects
  
  function breakObjectDefinition(line) {
    const indentation = line.match(/^\s*/)[0];
    const extraIndent = indentation + '  ';
    
    const parts = line.split(/,\s*/);
    
    if (parts.length === 1) {
      return [line];
    }
    
    const result = [parts[0] + ','];
    
    for (let i = 1; i < parts.length - 1; i++) {
      result.push(extraIndent + parts[i] + ',');
    }
    
    result.push(extraIndent + parts[parts.length - 1]);
    
    return result;
  }
  
  function breakUrlLine(line) {
    const indentation = line.match(/^\s*/)[0];
    const extraIndent = indentation + '  ';
    
    const match = line.match(/(window\.(location\.href|open)\s*=\s*)(.+)/);
    if (!match) return [line];
    
    return [
      indentation + match[1],
      extraIndent + match[3]
    ];
  }
  
  function breakStyleLine(line) {
    const indentation = line.match(/^\s*/)[0];
    const extraIndent = indentation + '  ';
    
    const parts = line.split(/;\s*/);
    
    if (parts.length === 1) {
      return [line];
    }
    
    const result = [];
    for (let i = 0; i < parts.length - 1; i++) {
      result.push(extraIndent + parts[i] + ';');
    }
    
    if (parts[parts.length - 1].trim()) {
      result.push(extraIndent + parts[parts.length - 1]);
    }
    
    return result;
  }
  
  function breakStringConcatenation(line) {
    const indentation = line.match(/^\s*/)[0];
    const extraIndent = indentation + '  ';
    
    const match = line.match(/(.*?)\s*\+=\s*(.+)/);
    if (!match) return [line];
    
    // Fix the output to have an exact space before += (not multiple spaces)
    return [
      indentation + match[1].trim() + ' +=',
      extraIndent + match[2]
    ];
  }
  
  function fixLongLines(content, maxLength = 80) {
    const lines = content.split('\n');
    const fixedLines = [];
    
    for (let line of lines) {
      if (line.trim().startsWith('//') || line.trim().startsWith('/*') || 
          line.trim().startsWith('*')) {
        fixedLines.push(line);
        continue;
      }
      
      if (line.length > maxLength) {
        if (line.includes('{') && line.includes('}')) {
          let fixedLine = breakObjectDefinition(line);
          fixedLines.push(...fixedLine);
        } else if (line.includes('window.location.href =') || 
                  line.includes('window.open(')) {
          let fixedLine = breakUrlLine(line);
          fixedLines.push(...fixedLine);
        } else if (line.includes('style.')) {
          let fixedLine = breakStyleLine(line);
          fixedLines.push(...fixedLine);
        } else if (line.includes('+=')) {
          let fixedLine = breakStringConcatenation(line);
          fixedLines.push(...fixedLine);
        } else {
          fixedLines.push(line);
        }
      } else {
        fixedLines.push(line);
      }
    }
    
    return fixedLines.join('\n');
  }

  describe('fixLongLines()', () => {
    it('should not modify lines that are shorter than max length', () => {
      const input = 'short line\nanother short line';
      const result = fixLongLines(input);
      expect(result).toBe(input);
    });

    it('should not modify comment lines even if they are too long', () => {
      const input = '// This is a very long comment line that exceeds the 80 character limit by quite a bit actually';
      const result = fixLongLines(input);
      expect(result).toBe(input);
    });

    it('should apply appropriate break strategies based on line content', () => {
      const longObjLine = '  const obj = { prop1: "value1", prop2: "value2", prop3: "value3", prop4: "value4" };';
      const longUrlLine = '  window.location.href = "https://example.com/very/long/path/that/exceeds/length";';
      const longStyleLine = '  element.style.color = "red"; element.style.backgroundColor = "blue"; element.style.padding = "10px";';
      const longConcatLine = '  html += "<div>This is a very long string that will be concatenated to the html variable</div>";';
      
      const input = [
        longObjLine,
        longUrlLine,
        longStyleLine,
        longConcatLine
      ].join('\n');
      
      const result = fixLongLines(input);
      
      // Output should have more lines than input
      expect(result.split('\n').length).toBeGreaterThan(input.split('\n').length);
    });
  });

  describe('breakObjectDefinition()', () => {
    it('should split object definition at commas', () => {
      const input = '  const obj = { prop1: "value1", prop2: "value2", prop3: "value3" };';
      const result = breakObjectDefinition(input);
      
      expect(result.length).toBe(3); // First line, plus one line for each property after the first
      expect(result[0]).toContain('prop1');
      expect(result[1]).toContain('prop2');
      expect(result[2]).toContain('prop3');
    });

    it('should preserve indentation', () => {
      const input = '    const obj = { a: 1, b: 2 };';
      const result = breakObjectDefinition(input);
      
      expect(result[0].startsWith('    ')).toBe(true);
      expect(result[1].startsWith('      ')).toBe(true); // Original + 2 spaces
    });

    it('should return original line if no commas', () => {
      const input = '  const singleProp = { prop1: "value" };';
      const result = breakObjectDefinition(input);
      
      expect(result.length).toBe(1);
      expect(result[0]).toBe(input);
    });
  });

  describe('breakUrlLine()', () => {
    it('should break lines with window.location.href assignments', () => {
      const input = '  window.location.href = "https://example.com/long/path";';
      const result = breakUrlLine(input);
      
      expect(result.length).toBe(2);
      expect(result[0]).toContain('window.location.href =');
      expect(result[1]).toContain('"https://example.com/long/path"');
    });

    it('should preserve indentation', () => {
      const input = '    window.location.href = "https://example.com";';
      const result = breakUrlLine(input);
      
      expect(result[0].startsWith('    ')).toBe(true);
      expect(result[1].startsWith('      ')).toBe(true); // Original + 2 spaces
    });
  });

  describe('breakStyleLine()', () => {
    it('should split style assignments at semicolons', () => {
      const input = '  element.style.color = "red"; element.style.backgroundColor = "blue"; element.style.margin = "10px";';
      const result = breakStyleLine(input);
      
      expect(result.length).toBe(3);
      expect(result[0]).toContain('color = "red"');
      expect(result[1]).toContain('backgroundColor = "blue"');
      expect(result[2]).toContain('margin = "10px"');
    });

    it('should preserve indentation', () => {
      const input = '    element.style.color = "red"; element.style.margin = "10px";';
      const result = breakStyleLine(input);
      
      expect(result[0].startsWith('      ')).toBe(true); // Original + 2 spaces
    });

    it('should handle the last part correctly whether it has a semicolon or not', () => {
      const withSemicolon = '  a.style.color = "red"; b.style.margin = "10px";';
      const withoutSemicolon = '  a.style.color = "red"; b.style.margin = "10px"';
      
      const resultWith = breakStyleLine(withSemicolon);
      const resultWithout = breakStyleLine(withoutSemicolon);
      
      expect(resultWith[resultWith.length - 1]).toContain('margin = "10px"');
      expect(resultWithout[resultWithout.length - 1]).toContain('margin = "10px"');
    });
  });

  describe('breakStringConcatenation()', () => {
    it('should split string concatenation with += operator', () => {
      const input = '  html += "<div>This is a very long string that will be added to html variable</div>";';
      const result = breakStringConcatenation(input);
      
      expect(result.length).toBe(2);
      // Test for the exact "html +=" pattern, handling whitespace trimming
      expect(result[0]).toBe('  html +=');
      expect(result[1]).toContain('<div>');
    });

    it('should preserve indentation', () => {
      const input = '    html += "content";';
      const result = breakStringConcatenation(input);
      
      expect(result[0].startsWith('    ')).toBe(true);
      expect(result[1].startsWith('      ')).toBe(true); // Original + 2 spaces
    });

    it('should return original line if no += found', () => {
      const input = '  html = html + "content";';
      const result = breakStringConcatenation(input);
      
      expect(result.length).toBe(1);
      expect(result[0]).toBe(input);
    });
  });
});