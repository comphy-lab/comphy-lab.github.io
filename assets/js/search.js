// Initialize search functionality
console.log('Search script loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    let fuse;

    // Configure Fuse.js options for better search
    const fuseOptions = {
        includeScore: true,
        threshold: 0.3, // More strict matching
        minMatchCharLength: 2,
        keys: [
            {
                name: 'title',
                weight: 0.7
            },
            {
                name: 'content',
                weight: 0.5
            },
            {
                name: 'metadata',
                weight: 0.3
            }
        ]
    };

    // Function to get all indexable pages
    async function getIndexablePages() {
        const pages = [
            '/',              // Main page
            '/team/',         // Team page
            '/research/',     // Research page
            '/team/index.html',  // Team index
            '/research/index.html' // Research index
        ];
        
        return pages.map(page => {
            // Convert relative paths to absolute
            const url = new URL(page, window.location.origin).href;
            return url;
        });
    }

    // Function to extract metadata from team members
    function extractTeamMemberMetadata(memberElement) {
        const metadata = [];
        
        // Extract all text content from paragraphs
        const paragraphs = memberElement.querySelectorAll('p');
        paragraphs.forEach(p => {
            const text = p.textContent.trim();
            metadata.push(text);
        });

        // Extract links and their text
        const links = memberElement.querySelectorAll('a');
        links.forEach(link => {
            metadata.push(link.textContent.trim());
            metadata.push(link.getAttribute('href') || '');
        });

        return metadata.join(' ');
    }

    // Function to extract content based on page type
    function extractPageSpecificContent(doc, url) {
        let content = '';
        let metadata = '';
        let type = 'page';
        let title = doc.title || '';

        if (url.includes('/team/')) {
            type = 'team';
            // Extract all team sections
            const teamSections = doc.querySelectorAll('.team-section');
            content = Array.from(teamSections).map(section => {
                const sectionTitle = section.querySelector('h1')?.textContent || '';
                const members = Array.from(section.querySelectorAll('.team-member'));
                const memberContent = members.map(member => {
                    const name = member.querySelector('h2')?.textContent || '';
                    const details = member.querySelector('.member-content')?.textContent || '';
                    const memberMetadata = extractTeamMemberMetadata(member);
                    metadata += ' ' + memberMetadata;
                    return `${name} ${details}`;
                }).join(' ');
                return `${sectionTitle} ${memberContent}`;
            }).join(' ');

            // Also extract content from the main content area
            const mainContent = doc.querySelector('.s-team__desc');
            if (mainContent) {
                content += ' ' + mainContent.textContent;
            }
        } else if (url.includes('/research/')) {
            type = 'research';
            const researchContent = doc.querySelector('.research-content');
            if (researchContent) {
                // Extract all text content
                content = researchContent.textContent;
                
                // Extract paper titles and content
                const papers = researchContent.querySelectorAll('.paper-container');
                papers.forEach(paper => {
                    const title = paper.querySelector('h3')?.textContent || '';
                    const details = paper.textContent;
                    // Extract tags if present
                    const tags = Array.from(paper.querySelectorAll('tags span'))
                        .map(tag => tag.textContent)
                        .join(' ');
                    metadata += ' ' + tags;
                    content += ' ' + title + ' ' + details;
                });

                title = doc.querySelector('h1')?.textContent || title;
            }
        } else {
            // For main page, extract all content sections
            const aboutSection = doc.querySelector('.s-about__desc');
            const introSection = doc.querySelector('.s-intro__content');
            
            if (aboutSection) content += aboutSection.textContent + ' ';
            if (introSection) content += introSection.textContent + ' ';
            
            // Extract all headings for better context
            const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
            headings.forEach(heading => {
                metadata += ' ' + heading.textContent;
            });
        }

        return { 
            type, 
            title, 
            content: content.trim(), 
            metadata: metadata.trim(),
            url 
        };
    }

    // Function to build search index
    async function buildSearchIndex() {
        try {
            const pages = await getIndexablePages();
            const indexItems = [];
            
            for (const url of pages) {
                try {
                    const response = await fetch(url);
                    if (!response.ok) continue;
                    
                    const html = await response.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    
                    const pageData = extractPageSpecificContent(doc, url);
                    indexItems.push(pageData);
                    console.log('Indexed:', url, pageData); // Debug log
                } catch (error) {
                    console.warn(`Failed to index page ${url}:`, error);
                }
            }
            
            fuse = new Fuse(indexItems, fuseOptions);
            console.log('Search index built with', indexItems.length, 'pages');
        } catch (error) {
            console.error('Error building search index:', error);
        }
    }

    // Function to highlight matched text
    function highlightText(text, query) {
        if (!query) return text;
        
        const words = query.trim().toLowerCase().split(/\s+/);
        let highlightedText = text;
        
        words.forEach(word => {
            if (word.length < 2) return;
            const regex = new RegExp(`(${word})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<span class="highlight">$1</span>');
        });
        
        return highlightedText;
    }

    // Function to get context around matched text
    function getContext(text, query, contextLength = 150) {
        if (!query || !text) return text;
        
        const words = query.toLowerCase().split(/\s+/);
        const textLower = text.toLowerCase();
        let bestIndex = -1;
        let bestMatchCount = 0;
        
        words.forEach(word => {
            if (word.length < 2) return;
            const index = textLower.indexOf(word);
            if (index > -1) {
                const surroundingText = textLower.slice(
                    Math.max(0, index - 30),
                    Math.min(text.length, index + 30)
                );
                const matchCount = words.filter(w => surroundingText.includes(w)).length;
                if (matchCount > bestMatchCount) {
                    bestMatchCount = matchCount;
                    bestIndex = index;
                }
            }
        });
        
        if (bestIndex === -1) {
            return text.slice(0, contextLength);
        }
        
        const start = Math.max(0, bestIndex - contextLength / 2);
        const end = Math.min(text.length, bestIndex + contextLength / 2);
        let context = text.slice(start, end);
        
        if (start > 0) context = '...' + context;
        if (end < text.length) context += '...';
        
        return context;
    }

    // Function to display search results
    function displayResults(results, query) {
        if (!searchResults) return;
        
        searchResults.innerHTML = '';
        
        if (!results.length) {
            searchResults.innerHTML = '<div class="search-no-results">No results found</div>';
            searchResults.style.display = 'block';
            return;
        }

        const fragment = document.createDocumentFragment();

        results.forEach(result => {
            const item = result.item;
            const context = getContext(item.content + ' ' + item.metadata, query);
            const highlightedContext = highlightText(context, query);
            
            const link = document.createElement('a');
            link.href = item.url;
            link.className = 'search-result';
            
            link.innerHTML = `
                <div class="search-result-type">${item.type}</div>
                <div class="search-result-title">${highlightText(item.title, query)}</div>
                <div class="search-result-content">${highlightedContext}</div>
            `;
            
            fragment.appendChild(link);
        });
        
        searchResults.appendChild(fragment);
        searchResults.style.display = 'block';
    }

    // Initialize search functionality
    if (searchInput && searchResults) {
        buildSearchIndex();

        let searchTimeout;
        searchInput.addEventListener('input', function() {
            const query = this.value.trim();
            
            clearTimeout(searchTimeout);
            
            if (!query) {
                searchResults.style.display = 'none';
                return;
            }
            
            searchTimeout = setTimeout(() => {
                if (fuse) {
                    const results = fuse.search(query);
                    displayResults(results, query);
                }
            }, 150);
        });

        // Close search results when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });

        // Focus input when clicking the search container
        document.querySelector('.search-container')?.addEventListener('click', function(e) {
            searchInput.focus();
        });

        // Handle keyboard navigation
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                searchResults.style.display = 'none';
                searchInput.blur();
            }
        });
    }
});
