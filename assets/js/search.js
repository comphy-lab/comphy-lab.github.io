// search.js
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    let searchDatabase = null;

    // Load the search database
    fetch('/assets/js/search_db.json')
        .then(response => response.json())
        .then(data => {
            searchDatabase = data;
            console.log(`Loaded search database with ${data.length} entries`);
        })
        .catch(error => {
            console.error('Error loading search database:', error);
        });

    // Simple search function that checks if query appears in content or tags
    function searchContent(query) {
        if (!searchDatabase) return [];
        
        query = query.toLowerCase();
        const words = query.split(/\s+/);
        
        return searchDatabase
            .filter(entry => {
                const content = entry.content.toLowerCase();
                const title = entry.title.toLowerCase();
                const tags = entry.tags ? entry.tags.join(' ').toLowerCase() : '';
                
                // Check if all words appear in either title, content, or tags
                return words.every(word => 
                    content.includes(word) || 
                    title.includes(word) || 
                    tags.includes(word)
                );
            })
            .slice(0, 10); // Limit to top 10 results
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

            return `
                <div class="search-result">
                    <div class="search-result-header">
                        <div class="search-result-title">
                            <a href="${result.url}">${result.title}</a>
                        </div>
                        <div class="search-result-score">
                            ${result.type}
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