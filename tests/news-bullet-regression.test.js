const fs = require('fs');
const path = require('path');

const fixturesDir = path.join(__dirname, 'fixtures', 'news-bullets');

function countRegularNewsBullets(markdown) {
  return markdown.split(/\r?\n/).filter((line) => /^- /.test(line)).length;
}

describe('News bullet regression fixtures', () => {
  test.each([
    ['frontmatter-delimiters.md', 2],
    ['nested-indented-bullets.md', 2],
    ['special-announcement-block.md', 2],
  ])('%s counts only top-level dash-space bullets', (fixtureName, expectedCount) => {
    const markdown = fs.readFileSync(path.join(fixturesDir, fixtureName), 'utf8');
    expect(countRegularNewsBullets(markdown)).toBe(expectedCount);
  });

  test('frontmatter delimiters are not misclassified as bullets', () => {
    const markdown = fs.readFileSync(
      path.join(fixturesDir, 'frontmatter-delimiters.md'),
      'utf8'
    );

    expect(markdown.match(/^---$/gm)).toHaveLength(2);
    expect(countRegularNewsBullets(markdown)).toBe(2);
  });
});
