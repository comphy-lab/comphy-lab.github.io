const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const BLOG_URL = 'https://blogs.comphy-lab.org';
const OUTPUT_FILE = path.join(__dirname, 'blog_content.json');

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function extractContent(page) {
  return await page.evaluate(() => {
    const entries = [];
    
    // Wait for Obsidian's content to load
    const content = document.querySelector('.markdown-preview-view, .markdown-preview-sizer, .markdown-rendered');
    if (!content) return entries;

    // Get page title and check if it's README
    const title = document.title;
    const isReadme = title.toLowerCase().includes('readme');
    
    // Get all headings
    const headings = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    headings.forEach(heading => {
      let contentNodes = [];
      let node = heading.nextElementSibling;
      
      // Collect content until next heading
      while (node && !node.matches('h1, h2, h3, h4, h5, h6')) {
        if (node.textContent.trim()) {
          contentNodes.push(node.textContent.trim());
        }
        node = node.nextElementSibling;
      }
      
      if (contentNodes.length > 0) {
        // Skip small sections that are likely navigation or metadata
        const combinedContent = contentNodes.join(' ');
        if (combinedContent.length < 50) return;
        
        entries.push({
          title: heading.textContent.trim(),
          content: combinedContent,
          url: window.location.href + '#' + heading.id,
          type: 'blog_section',
          priority: isReadme ? 4 : 3  // Lower priority for README sections
        });
      }
    });
    
    // Only add full page entry if it's not a README and has substantial content
    const fullContent = content.textContent.trim();
    if (!isReadme && fullContent.length > 200) {
      entries.push({
        title: title,
        content: fullContent,
        url: window.location.href,
        type: 'blog_page',
        priority: 2
      });
    }
    
    return entries;
  });
}

async function getInternalLinks(page) {
  return await page.evaluate((blogUrl) => {
    const links = new Set();
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.href;
      if (href.startsWith(blogUrl)) {
        links.add(href);
      }
    });
    return Array.from(links);
  }, BLOG_URL);
}

async function crawlBlog() {
  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });
  const page = await browser.newPage();
  
  const visitedUrls = new Set();
  const urlsToVisit = [BLOG_URL];
  const allEntries = [];
  
  try {
    while (urlsToVisit.length > 0) {
      const url = urlsToVisit.shift();
      if (visitedUrls.has(url)) continue;
      
      console.log(`Fetching ${url}...`);
      
      try {
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
        await wait(2000); // Wait for dynamic content to load
        
        const entries = await extractContent(page);
        allEntries.push(...entries);
        
        const links = await getInternalLinks(page);
        links.forEach(link => {
          if (!visitedUrls.has(link)) {
            urlsToVisit.push(link);
          }
        });
        
        visitedUrls.add(url);
      } catch (error) {
        console.error(`Error processing ${url}:`, error.message);
      }
      
      // Be nice to the server
      await wait(1000);
    }
  } finally {
    await browser.close();
  }
  
  return allEntries;
}

(async () => {
  try {
    console.log('Starting blog crawl...');
    const entries = await crawlBlog();
    console.log(`Found ${entries.length} entries`);
    
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(entries, null, 2));
    console.log(`Written blog content to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})(); 