const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const matter = require('gray-matter');

const OUTPUT_FILE = path.join(__dirname, 'blog_content.json');
const REPO_URL = 'https://github.com/comphy-lab/CoMPhy-Lab-Blogs.git';
const TEMP_DIR = path.join(__dirname, 'temp_blog_repo');

async function cloneRepository() {
  console.log(`Cloning repository from ${REPO_URL}...`);
  try {
    // Remove temp directory if it exists
    try {
      await fs.rm(TEMP_DIR, { recursive: true, force: true });
    } catch (error) {
      // Ignore if directory doesn't exist
    }

    // Clone the repository
    execSync(`git clone ${REPO_URL} ${TEMP_DIR}`, { stdio: 'inherit' });
    console.log('Repository cloned successfully');
  } catch (error) {
    console.error('Error cloning repository:', error);
    throw error;
  }
}

async function getMarkdownFiles(dir, fileList = []) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      // Skip .git, .github, and other hidden directories
      if (!file.name.startsWith('.')) {
        await getMarkdownFiles(fullPath, fileList);
      }
    } else if (file.name.endsWith('.md')) {
      fileList.push(fullPath);
    }
  }
  
  return fileList;
}

async function processBlogContent() {
  const allEntries = [];
  
  try {
    // Get all markdown files
    const mdFiles = await getMarkdownFiles(TEMP_DIR);
    console.log(`Found ${mdFiles.length} markdown files`);
    
    for (const filePath of mdFiles) {
      const relativePath = path.relative(TEMP_DIR, filePath);
      
      // Skip files with "todo" in the name (case insensitive)
      if (relativePath.toLowerCase().includes('todo')) {
        console.log(`Skipping todo file: ${relativePath}`);
        continue;
      }
      
      try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const { data, content } = matter(fileContent);
        
        // Skip files where publish is explicitly set to false
        if (data.publish === false) {
          console.log(`Skipping unpublished file: ${relativePath}`);
          continue;
        }
        
        // Get the URL based on the file path, converting to the format that would be used on the Obsidian Publish site
        const urlPath = relativePath.replace(/\.md$/, '').replace(/\\/g, '/');
        const url = `https://blogs.comphy-lab.org/${urlPath}`;
        
        // Get the title from frontmatter or use filename
        const title = data.title || path.basename(filePath, '.md');
        
        // Clean up the content
        const cleanContent = content
          .replace(/^(created|status|modified|author|date published):.*$/gm, '')
          .replace(/\n+/g, '\n')
          .trim();
        
        // Split content by headers
        const sections = cleanContent.split(/(?=^#+\s+)/).map(s => s.trim()).filter(s => s);
        
        // If no headers found, treat the whole content as one section
        const sectionsToProcess = sections.length > 0 ? sections : [cleanContent];
        
        for (const section of sectionsToProcess) {
          // Get section title
          let sectionTitle;
          let sectionContent;
          
          if (section.match(/^#+\s+/)) {
            // If section starts with header, use it as title
            const lines = section.split('\n');
            sectionTitle = lines[0].replace(/^#+\s+/, '');
            sectionContent = lines.slice(1).join('\n').trim();
          } else {
            // Otherwise use main title
            sectionTitle = title;
            sectionContent = section;
          }
          
          // Skip if no content left
          if (!sectionContent) continue;
          
          // Split content into paragraphs
          const paragraphs = sectionContent.split(/\n\n+/).map(p => p.trim()).filter(p => p);
          
          for (const para of paragraphs) {
            // Skip code blocks, HTML and formatting-only content
            if (para.startsWith('```') || para.startsWith('<') || para.match(/^[\s#*\-]+$/)) {
              continue;
            }
            
            // Skip very short paragraphs
            if (para.length < 50) continue;
            
            // Create blog entry
            allEntries.push({
              title: `${title} - ${sectionTitle}`,
              content: para,
              url: url,
              type: 'blog_excerpt',
              priority: 3
            });
          }
        }
        
      } catch (error) {
        console.error(`Error processing file ${filePath}:`, error.message);
      }
    }
    
    console.log(`Generated ${allEntries.length} searchable entries from blog content`);
    return allEntries;
    
  } catch (error) {
    console.error('Error processing blog content:', error);
    return [];
  }
}

async function cleanup() {
  console.log('Cleaning up temporary files...');
  try {
    await fs.rm(TEMP_DIR, { recursive: true, force: true });
    console.log('Cleanup completed');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

(async () => {
  try {
    console.log('Starting GitHub blog content fetch...');
    await cloneRepository();
    const entries = await processBlogContent();
    
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(entries, null, 2));
    console.log(`Written blog content to ${OUTPUT_FILE}`);
    
    await cleanup();
  } catch (error) {
    console.error('Error:', error);
    await cleanup();
    process.exit(1);
  }
})(); 