/**
 * Script to fix line length issues in JavaScript files
 * To be used with ESLint's max-line-length rule
 */

const fs = require('fs');
const path = require('path');

// Configure files to process
const jsDir = path.join(__dirname, '../assets/js');
const maxLength = 80;

/**
 * Reads the entire contents of a file as a UTF-8 encoded string.
 *
 * @param {string} filePath - Path to the file to be read.
 * @returns {string} The file contents as a string.
 */
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

/**
 * Processes JavaScript file content to split lines exceeding the maximum allowed length.
 *
 * Applies specialized line-breaking strategies for object definitions, URL assignments, style definitions, and string concatenations, while skipping comment lines. Returns the modified content as a single string.
 *
 * @param {string} content - The full content of a JavaScript file.
 * @returns {string} The content with long lines split according to formatting rules.
 */
function fixLongLines(content) {
  const lines = content.split('\n');
  const fixedLines = [];
  
  for (let line of lines) {
    // Skip comments, they're harder to split
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || 
        line.trim().startsWith('*')) {
      fixedLines.push(line);
      continue;
    }
    
    // If line is too long, try to break it
    if (line.length > maxLength) {
      // Handle different cases for long lines
      if (line.includes('{') && line.includes('}')) {
        // Object definitions - break after commas and colons
        let fixedLine = breakObjectDefinition(line);
        fixedLines.push(...fixedLine);
      } else if (line.includes('window.location.href =') || 
                line.includes('window.open(')) {
        // URL lines - break before the URL
        let fixedLine = breakUrlLine(line);
        fixedLines.push(...fixedLine);
      } else if (line.includes('style.')) {
        // Style definitions - break after semicolons
        let fixedLine = breakStyleLine(line);
        fixedLines.push(...fixedLine);
      } else if (line.includes('+=')) {
        // String concatenation - break at += 
        let fixedLine = breakStringConcatenation(line);
        fixedLines.push(...fixedLine);
      } else {
        // Generic long line
        fixedLines.push(line); // Just keep it for now
      }
    } else {
      fixedLines.push(line);
    }
  }
  
  return fixedLines.join('\n');
}

/**
 * Splits a single-line JavaScript object definition into multiple lines at commas, preserving and increasing indentation for readability.
 *
 * @param {string} line - The object definition line to split.
 * @returns {string[]} An array of lines representing the broken-up object definition.
 *
 * @remark
 * If the line does not contain commas, it is returned unchanged in a single-element array.
 */
function breakObjectDefinition(line) {
  // This is simplified - a real implementation would be more robust
  const indentation = line.match(/^\s*/)[0];
  const extraIndent = indentation + '  '; // Extra indentation for properties
  
  // Split at commas followed by a space
  const parts = line.split(/,\s*/);
  
  if (parts.length === 1) {
    return [line]; // Can't split by commas
  }
  
  // First line keeps the opening bracket
  const result = [parts[0] + ','];
  
  // Middle parts
  for (let i = 1; i < parts.length - 1; i++) {
    result.push(extraIndent + parts[i] + ',');
  }
  
  // Last part
  result.push(extraIndent + parts[parts.length - 1]);
  
  return result;
}

/**
 * Splits a line assigning a URL to `window.location.href` or calling `window.open` into separate lines for improved readability.
 *
 * If the line matches the expected pattern, returns an array with the assignment part and the URL part on separate, properly indented lines. Otherwise, returns the original line in an array.
 *
 * @param {string} line - The line of code to process.
 * @returns {string[]} An array of lines with the assignment and URL separated, or the original line if no match is found.
 */
function breakUrlLine(line) {
  const indentation = line.match(/^\s*/)[0];
  const extraIndent = indentation + '  ';
  
  // Find the URL part
  const match = line.match(/(window\.(location\.href|open)\s*=\s*)(.+)/);
  if (!match) return [line];
  
  return [
    indentation + match[1],
    extraIndent + match[3]
  ];
}

/**
 * Splits a style assignment line into multiple lines at semicolons, adding indentation for each property.
 *
 * @param {string} line - The style assignment line to split.
 * @returns {string[]} An array of lines, each containing a single style property with appropriate indentation.
 */
function breakStyleLine(line) {
  const indentation = line.match(/^\s*/)[0];
  const extraIndent = indentation + '  ';
  
  // Split at semicolons
  const parts = line.split(/;\s*/);
  
  if (parts.length === 1) {
    return [line]; // Can't split by semicolons
  }
  
  const result = [];
  for (let i = 0; i < parts.length - 1; i++) {
    result.push(extraIndent + parts[i] + ';');
  }
  
  // Last part might not have a semicolon
  if (parts[parts.length - 1].trim()) {
    result.push(extraIndent + parts[parts.length - 1]);
  }
  
  return result;
}

/**
 * Splits a line containing string concatenation with `+=` into two lines for readability.
 *
 * The left-hand side and operator remain on the first line, while the right-hand side is moved to a new line with increased indentation.
 *
 * @param {string} line - The line of code to process.
 * @returns {string[]} An array of lines with the concatenation split, or the original line if no `+=` is found.
 */
function breakStringConcatenation(line) {
  const indentation = line.match(/^\s*/)[0];
  const extraIndent = indentation + '  ';
  
  // Find the += part
  const match = line.match(/(.*)\s*\+=\s*(.+)/);
  if (!match) return [line];
  
  return [
    indentation + match[1] + ' +=',
    extraIndent + match[2]
  ];
}

/**
 * Processes all JavaScript files in the target directory, fixing lines that exceed the maximum allowed length.
 *
 * Scans each `.js` file, counts lines longer than the configured maximum, applies line-breaking strategies to fix them, and overwrites files if changes are made. Logs statistics on long lines and modified files.
 */
function processJsFiles() {
  const jsFiles = fs.readdirSync(jsDir)
    .filter(file => file.endsWith('.js'))
    .map(file => path.join(jsDir, file));
  
  let fixedFiles = 0;
  let totalLongLines = 0;
  
  jsFiles.forEach(file => {
    const content = readFile(file);
    const lines = content.split('\n');
    
    // Count long lines
    const longLines = lines.filter(line => line.length > maxLength).length;
    totalLongLines += longLines;
    
    if (longLines > 0) {
      console.log(`${path.basename(file)}: ${longLines} lines exceed ${maxLength} characters`);
      
      const fixedContent = fixLongLines(content);
      
      if (fixedContent !== content) {
        fs.writeFileSync(file, fixedContent);
        fixedFiles++;
      }
    }
  });
  
  console.log(`\nTotal stats:`);
  console.log(`- ${totalLongLines} lines exceeded ${maxLength} characters`);
  console.log(`- ${fixedFiles} files were modified`);
}

// Run the script
processJsFiles();