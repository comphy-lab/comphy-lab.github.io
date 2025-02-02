// search.js
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    let searchDatabase = null;

    // Get the base URL from meta tag if it exists
    const baseUrl = document.querySelector('meta[name="base-url"]')?.content || '';

    // Load the search database
    fetch(`${baseUrl}/assets/js/search_db.json`)
        .then(response => response.json())
        .then(data => {
            searchDatabase = data;
            console.log(`Loaded search database with ${data.length} entries`);
        })
        .catch(error => {
            console.error('Error loading search database:', error);
        });

    // Calculate match percentage
    function calculateMatchPercentage(text, query) {
        const words = query.toLowerCase().split(/\s+/);
        const textLower = text.toLowerCase();
        
        // Count how many query words appear in the text
        const matchedWords = words.filter(word => textLower.includes(word));
        return Math.round((matchedWords.length / words.length) * 100);
    }

    // Simple search function that checks if query appears in content or tags
    function searchContent(query) {
        if (!searchDatabase) return [];
        
        query = query.toLowerCase();
        const words = query.split(/\s+/);
        
        // Filter and score results
        const results = searchDatabase
            .filter(entry => {
                const content = entry.content.toLowerCase();
                const title = entry.title.toLowerCase();
                const tags = entry.tags ? entry.tags.join(' ').toLowerCase() : '';
                
                return words.every(word => 
                    content.includes(word) || 
                    title.includes(word) || 
                    tags.includes(word)
                );
            })
            .map(entry => {
                // Calculate base score based on type
                let score = 0;
                if (entry.type === 'team_member') score += 100;
                else if (entry.type === 'paper') score += 90;
                else if (entry.type === 'markdown_section') score += 85;
                else if (entry.type === 'markdown_text') score += 75;
                else if (entry.type === 'section') score += 80;
                else if (entry.type === 'text' && entry.links?.length > 0) score += 70;
                else if (entry.type === 'text') score += 60;
                else if (entry.tags) score += 50;
                else if (entry.type === 'h1') score += 40;
                else if (entry.type === 'h2') score += 30;
                else if (entry.type === 'h3') score += 20;
                else if (entry.type.startsWith('h')) score += 10;

                // Calculate match percentage
                const titleMatch = calculateMatchPercentage(entry.title, query);
                const contentMatch = calculateMatchPercentage(entry.content, query);
                const tagsMatch = entry.tags ? calculateMatchPercentage(entry.tags.join(' '), query) : 0;
                const linksMatch = entry.links ? calculateMatchPercentage(entry.links.join(' '), query) : 0;
                
                // Use the highest match percentage
                const matchPercentage = Math.max(titleMatch, contentMatch, tagsMatch, linksMatch);

                // Boost score based on match percentage
                score += matchPercentage;

                // Extra boost if title matches
                if (entry.title.toLowerCase().includes(query)) score += 25;

                return { ...entry, score, matchPercentage };
            })
            .sort((a, b) => b.score - a.score);

        // Deduplicate results by URL and title
        const seen = new Set();
        const deduped = results.filter(entry => {
            const key = `${entry.url}|${entry.title}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        return deduped.slice(0, 10); // Limit to top 10 results
    }

    // Format search results
    function showResults(results, query) {
        if (!searchResults) return;
        
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-no-results">No results found</div>';
            return;
        }

        const html = results.map(result => {
            // Highlight the matching text
            let content = result.content;
            query.split(/\s+/).forEach(word => {
                if (word) {
                    const regex = new RegExp(`(${word})`, 'gi');
                    content = content.replace(regex, '<mark>$1</mark>');
                }
            });

            // Create tags HTML if tags exist
            const tagsHtml = result.tags ? `
                <div class="search-result-tags">
                    ${result.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            ` : '';

            // Add base URL to result URL if it's not absolute
            const url = result.url.startsWith('http') ? result.url : `${baseUrl}${result.url}`;

            return `
                <div class="search-result">
                    <div class="search-result-header">
                        <div class="search-result-title">
                            <a href="${url}">${result.title}</a>
                        </div>
                        <div class="search-result-score">
                            ${result.type} (${result.matchPercentage}% match)
                        </div>
                    </div>
                    <div class="search-result-content">${content}</div>
                    ${tagsHtml}
                </div>
            `;
        }).join('');

        searchResults.innerHTML = html;
    }

    // Search input handler
    if (searchInput) {
        let debounceTimeout;
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            // Clear previous timeout
            if (debounceTimeout) {
                clearTimeout(debounceTimeout);
            }
            
            // Clear results if query is empty
            if (!query) {
                searchResults.innerHTML = '';
                return;
            }
            
            // Debounce search for 300ms
            debounceTimeout = setTimeout(() => {
                const results = searchContent(query);
                showResults(results, query);
            }, 300);
        });
    }
});