// search.js
console.log('Search script loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');

    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    let fuse;

    // Define Fuse.js options
    const fuseOptions = {
        includeScore: true,
        shouldSort: true,
        threshold: 0.3, // More strict matching
        minMatchCharLength: 2,
        keys: [
            { name: 'title', weight: 2.0 },
            { name: 'content', weight: 1.0 },
            { name: 'keywords', weight: 2.0 }  // For links and important terms
        ]
    };

    // Function to extract text and keywords from an element
    function extractContent(element) {
        const keywords = new Set();
        
        // Extract all link text as keywords
        element.querySelectorAll('a').forEach(link => {
            keywords.add(link.textContent.trim());
        });

        // Extract text from spans (often used for important terms)
        element.querySelectorAll('span').forEach(span => {
            keywords.add(span.textContent.trim());
        });

        // Get all text content
        const content = element.textContent.trim();

        return { content, keywords: Array.from(keywords) };
    }

    // Build search index
    function buildSearchIndex() {
        const searchIndex = [];

        // Index all paragraphs and their content
        document.querySelectorAll('p').forEach(para => {
            const { content, keywords } = extractContent(para);
            if (content) {
                // Find the nearest heading as title
                let title = '';
                let current = para;
                while (current && !title) {
                    current = current.previousElementSibling;
                    if (current && /^H[1-6]$/.test(current.tagName)) {
                        title = current.textContent;
                    }
                }

                searchIndex.push({
                    title: title || content.slice(0, 50),
                    content: content,
                    keywords: keywords,
                    url: window.location.pathname + (para.id ? '#' + para.id : '')
                });
            }
        });

        // Index all headings and their following content
        document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
            const { content, keywords } = extractContent(heading);
            
            // Get content from next sibling until next heading
            let nextContent = '';
            let current = heading.nextElementSibling;
            while (current && !/^H[1-6]$/.test(current.tagName)) {
                nextContent += ' ' + current.textContent;
                current = current.nextElementSibling;
            }

            if (content) {
                searchIndex.push({
                    title: content,
                    content: content + ' ' + nextContent,
                    keywords: keywords,
                    url: window.location.pathname + (heading.id ? '#' + heading.id : '')
                });
            }
        });

        // Index special elements like code blocks, blockquotes, etc.
        document.querySelectorAll('pre, blockquote, .highlight').forEach(element => {
            const { content, keywords } = extractContent(element);
            if (content) {
                searchIndex.push({
                    title: content.slice(0, 50),
                    content: content,
                    keywords: keywords,
                    url: window.location.pathname + (element.id ? '#' + element.id : '')
                });
            }
        });

        console.log('Search index built with', searchIndex.length, 'items');
        return searchIndex;
    }

    function showResults(results, query) {
        searchResults.innerHTML = '';
        
        if (!query.trim()) {
            searchResults.style.display = 'none';
            return;
        }

        if (!results.length) {
            searchResults.innerHTML = '<div class="search-no-results">No results found</div>';
            searchResults.style.display = 'block';
            return;
        }

        const fragment = document.createDocumentFragment();

        results.forEach(result => {
            const item = result.item;
            const score = result.score;
            const matchPercentage = Math.round((1 - score) * 100);

            const resultDiv = document.createElement('a');
            resultDiv.href = item.url;
            resultDiv.className = 'search-result';

            // Find the position of the query in the content
            const queryPos = item.content.toLowerCase().indexOf(query.toLowerCase());
            let excerpt = item.content;
            if (queryPos !== -1) {
                const start = Math.max(0, queryPos - 60);
                const end = Math.min(item.content.length, queryPos + 60);
                excerpt = (start > 0 ? '...' : '') + 
                         item.content.slice(start, end).trim() + 
                         (end < item.content.length ? '...' : '');
            } else {
                excerpt = item.content.slice(0, 120) + '...';
            }

            resultDiv.innerHTML = `
                <div class="search-result-header">
                    <div class="search-result-title">${item.title || 'Untitled'}</div>
                    <div class="search-result-score">${matchPercentage}%</div>
                </div>
                <div class="search-result-content">${excerpt}</div>
                ${item.keywords.length ? `
                    <div class="search-result-tags">
                        ${item.keywords.map(kw => `<span class="tag">${kw}</span>`).join('')}
                    </div>
                ` : ''}
            `;

            fragment.appendChild(resultDiv);
        });

        searchResults.appendChild(fragment);
        searchResults.style.display = 'block';
    }

    // Initialize search
    if (searchInput && searchResults) {
        const searchIndex = buildSearchIndex();
        fuse = new Fuse(searchIndex, fuseOptions);

        // Handle input
        let typingTimeout;
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            clearTimeout(typingTimeout);

            typingTimeout = setTimeout(() => {
                if (fuse) {
                    const results = fuse.search(query);
                    showResults(results, query);
                }
            }, 100);
        });

        // Hide results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });

        // Handle Escape key
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchResults.style.display = 'none';
                searchInput.blur();
            }
        });
    }
});