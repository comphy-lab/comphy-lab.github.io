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

        // Check for exact matches first (case-insensitive)
        if (text.includes(query)) {
            return 100;
        }

        // Calculate word matches with position bias
        let matchedWords = 0;
        let titleBonus = 0;
        
        queryWords.forEach(qWord => {
            // Check for word boundaries to avoid partial matches
            const wordBoundaryRegex = new RegExp(`\\b${qWord}\\b`, 'i');
            if (textWords.some(tWord => wordBoundaryRegex.test(tWord))) {
                matchedWords++;
                // Give bonus points for matches in the beginning of text
                if (textWords.indexOf(qWord) < 3) {
                    titleBonus += 20;
                }
            }
        });

        // Calculate word-level match percentage
        const wordMatch = (matchedWords / queryWords.length) * 100;
        
        return Math.min(100, wordMatch + titleBonus);
    }

    // Search function with improved relevance scoring
    function searchContent(query) {
        if (!searchDatabase || !query.trim()) return [];
        
        const results = searchDatabase
            .map(item => {
                // Calculate matches in different fields
                const titleMatch = calculateMatchPercentage(item.title, query);
                const contentMatch = calculateMatchPercentage(item.content, query);
                const tagsMatch = item.tags ? calculateMatchPercentage(item.tags.join(' '), query) : 0;
                
                // Weight different match types
                let matchScore = Math.max(
                    titleMatch * 1.2,  // Title matches are slightly more important
                    contentMatch,
                    tagsMatch * 1.1
                );
                
                // Apply bonuses
                if (query.toLowerCase() === item.title.toLowerCase()) {
                    matchScore = Math.min(100, matchScore * 1.2); // Cap at 100% even with exact match bonus
                }
                
                // Only include results with meaningful matches
                return {
                    ...item,
                    matchScore: Math.min(100, Math.round(matchScore)) // Ensure score never exceeds 100%
                };
            })
            .filter(item => item.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore);

        return results;
    }

    // Format search results
    function showResults(results, query) {
        if (!searchResults) return;
        
        if (!query.trim()) {
            searchResults.innerHTML = '';
            return;
        }

        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-no-results">No results found</div>';
            return;
        }

        const resultsHtml = results.map(result => {
            const url = result.url || '#';
            const content = result.content ? `<div class="search-result-content">${result.content}</div>` : '';
            const matchText = result.matchScore === 100 ? 'Exact match' : `${result.matchScore}% match`;
            
            return `
                <div class="search-result">
                    <div class="search-result-header">
                        <div class="search-result-title">
                            <a href="${url}">${result.title}</a>
                        </div>
                        <div class="search-result-score">
                            ${result.type} (${matchText})
                        </div>
                    </div>
                    ${content}
                </div>`;
        }).join('');

        searchResults.innerHTML = resultsHtml;
    }

    // Search input handler
    if (searchInput) {
        let debounceTimeout;
        
        // Function to perform search
        const performSearch = () => {
            const query = searchInput.value.trim();
            const results = searchContent(query);
            showResults(results, query);
        };

        // Input event handler with debounce
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(performSearch, 300);
        });

        // Add click handler for search button
        const searchButton = document.getElementById('searchButton');
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                searchInput.focus();
                performSearch();
            });
        }

        // Add keyboard handler for search input
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                clearTimeout(debounceTimeout);
                performSearch();
            }
        });
    }
});