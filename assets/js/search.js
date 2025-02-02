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
        if (!text) return 0;
        text = text.toLowerCase();
        query = query.toLowerCase();

        // Split into words
        const queryWords = query.split(/\s+/);
        const textWords = text.split(/\s+/);

        // Calculate word matches
        let matchedWords = 0;
        queryWords.forEach(qWord => {
            if (textWords.some(tWord => tWord.includes(qWord) || qWord.includes(tWord))) {
                matchedWords++;
            }
        });

        // Calculate character-level match for exact matches
        const exactMatch = text.includes(query) ? 100 : 0;
        
        // Calculate word-level match percentage
        const wordMatch = (matchedWords / queryWords.length) * 100;
        
        // Return the higher of the two scores
        return Math.max(exactMatch, wordMatch);
    }

    // Simple search function that checks if query appears in content or tags
    function searchContent(query) {
        if (!searchDatabase) return [];
        
        query = query.toLowerCase();
        const words = query.split(/\s+/);
        
        // Filter and score results
        const results = searchDatabase
            .map(entry => {
                // Calculate base score based on type
                let score = 0;
                if (entry.type === 'team_member') score += 100;
                else if (entry.type === 'paper') score += 90;
                else if (entry.type === 'blog_post') score += 85;
                else if (entry.type === 'markdown_section') score += 80;
                else if (entry.type === 'markdown_text') score += 75;
                else if (entry.type === 'section') score += 70;
                else if (entry.type === 'text' && entry.links?.length > 0) score += 65;
                else if (entry.type === 'text') score += 60;
                else if (entry.tags) score += 50;
                else if (entry.type === 'h1') score += 40;
                else if (entry.type === 'h2') score += 30;
                else if (entry.type === 'h3') score += 20;
                else if (entry.type.startsWith('h')) score += 10;

                // Calculate match percentages for different fields
                const titleMatch = calculateMatchPercentage(entry.title, query);
                const contentMatch = calculateMatchPercentage(entry.content, query);
                const tagsMatch = entry.tags ? calculateMatchPercentage(entry.tags.join(' '), query) : 0;
                const linksMatch = entry.links ? calculateMatchPercentage(entry.links.join(' '), query) : 0;
                
                // Use the highest match percentage
                const matchPercentage = Math.max(titleMatch, contentMatch, tagsMatch, linksMatch);

                // Only include results with match percentage > 50%
                if (matchPercentage <= 50) return null;

                // Boost score based on match percentage
                score += matchPercentage;

                // Extra boost for title matches
                if (titleMatch > 70) score += 25;

                return { ...entry, score, matchPercentage };
            })
            .filter(entry => entry !== null) // Remove null entries (below 50% match)
            .sort((a, b) => b.score - a.score) // Sort by score
            .slice(0, 10); // Limit to top 10 results

        return results;
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