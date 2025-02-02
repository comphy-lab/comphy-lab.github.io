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

        // Split into words and remove empty strings
        const queryWords = query.split(/\s+/).filter(w => w.length > 0);
        const textWords = text.split(/\s+/).filter(w => w.length > 0);

        // Exact phrase match gets highest score
        if (text.includes(query)) {
            return 100;
        }

        // Calculate word matches with strict word boundaries
        let matchedWords = 0;
        let titleBonus = 0;
        let positionPenalty = 0;
        
        queryWords.forEach((qWord, index) => {
            // Check for word boundaries to avoid partial matches
            const wordBoundaryRegex = new RegExp(`\\b${qWord}\\b`, 'i');
            const matchFound = textWords.some((tWord, tIndex) => {
                if (wordBoundaryRegex.test(tWord)) {
                    // Give bonus for matches near the start
                    if (tIndex < 3) {
                        titleBonus += 15;
                    }
                    // Add position-based penalty
                    positionPenalty += tIndex;
                    return true;
                }
                return false;
            });
            
            if (matchFound) {
                matchedWords++;
            }
        });

        // Calculate base score
        const wordMatch = (matchedWords / queryWords.length) * 100;
        
        // Apply position penalty (reduces score for matches that appear later in text)
        const positionFactor = Math.max(0, 1 - (positionPenalty / (textWords.length * 2)));
        
        // Combine scores with weights
        let finalScore = (wordMatch * 0.6) + (titleBonus * 0.4);
        finalScore *= positionFactor;

        // Require at least half of query words to match for any score
        if (matchedWords < queryWords.length / 2) {
            return 0;
        }

        return Math.min(100, Math.round(finalScore));
    }

    // Search function with improved relevance scoring
    function searchContent(query) {
        if (!searchDatabase || !query.trim()) return [];
        
        // Minimum query length check
        if (query.trim().length < 2) return [];
        
        const results = searchDatabase
            .map(item => {
                // Calculate matches in different fields
                const titleMatch = calculateMatchPercentage(item.title, query);
                const contentMatch = calculateMatchPercentage(item.content, query);
                const tagsMatch = item.tags ? calculateMatchPercentage(item.tags.join(' '), query) : 0;
                
                // Weight different match types
                let matchScore = Math.max(
                    titleMatch * 1.5,  // Title matches are more important
                    contentMatch * 0.8, // Content matches less important
                    tagsMatch * 1.2    // Tag matches somewhat important
                );
                
                // Apply type-specific bonuses
                if (item.type === 'team_member') {
                    matchScore *= 1.5;  // Boost team member matches
                }
                
                // Apply priority multiplier (1.0 to 1.5)
                const priorityMultiplier = item.priority ? (1.5 - (item.priority - 1) * 0.25) : 1.0;
                matchScore *= priorityMultiplier;
                
                return {
                    ...item,
                    matchScore: Math.min(100, Math.round(matchScore))
                };
            })
            .filter(item => item.matchScore > 40)  // Only show items with good matches
            .sort((a, b) => {
                // First sort by priority if available
                const priorityDiff = (a.priority || 3) - (b.priority || 3);
                if (priorityDiff !== 0) return priorityDiff;
                
                // Then sort by match score
                return b.matchScore - a.matchScore;
            })
            .slice(0, 5);  // Limit to top 5 results

        return results;
    }

    // Format search results
    function showResults(results, query) {
        if (!searchResults) return;
        
        if (!query.trim()) {
            searchResults.innerHTML = '';
            return;
        }

        // Helper function to safely render HTML content
        function renderContent(content, type) {
            // Create a temporary div to safely parse HTML
            const div = document.createElement('div');
            
            // Handle markdown-style links [text](url)
            content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
                return `<a href="${url}" target="_blank">${text}</a>`;
            });
            
            // Handle markdown-style bold **text**
            content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            
            // Handle markdown-style italic *text*
            content = content.replace(/\*([^*]+)\*/g, '<em>$1</em>');
            
            // Handle HTML tags for icons (common in team member entries)
            if (type === 'team_member') {
                div.innerHTML = content;
                // Keep only allowed tags and attributes
                const allowedTags = ['i', 'a', 'strong', 'em', 'img'];
                const allowedAttributes = {
                    'i': ['class', 'style'],
                    'a': ['href', 'target'],
                    'img': ['src', 'alt', 'width', 'height', 'loading', 'class']
                };
                
                const clean = (node) => {
                    if (node.nodeType === 3) return; // Text node
                    if (!allowedTags.includes(node.tagName.toLowerCase())) {
                        node.replaceWith(document.createTextNode(node.textContent));
                        return;
                    }
                    const attrs = Array.from(node.attributes);
                    attrs.forEach(attr => {
                        if (!allowedAttributes[node.tagName.toLowerCase()]?.includes(attr.name)) {
                            node.removeAttribute(attr.name);
                        }
                    });
                    Array.from(node.children).forEach(clean);
                };
                
                Array.from(div.children).forEach(clean);
                return div.innerHTML;
            }
            
            // For other types, escape HTML but render markdown
            div.textContent = content;
            return div.innerHTML;
        }

        const resultsList = results.map(result => {
            const title = renderContent(result.title, result.type);
            const content = renderContent(result.content, result.type);
            
            return `
                <div class="search-result ${result.type}" data-score="${result.matchScore}">
                    <h3><a href="${result.url}">${title}</a></h3>
                    <div class="result-content">${content}</div>
                    ${result.type === 'team_member' ? '<span class="result-type">Team Member</span>' : ''}
                    ${result.tags ? `<div class="result-tags">${result.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
                    <div class="match-score">Match: ${result.matchScore}%</div>
                </div>
            `;
        }).join('');

        searchResults.innerHTML = resultsList || '<p>No results found</p>';
    }

    // Search input handler
    if (searchInput) {
        let debounceTimeout;
        
        // Function to perform search
        function performSearch() {
            const query = searchInput.value;
            const results = searchContent(query);
            showResults(results, query);
        }

        // Input event handler with debounce
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(performSearch, 300);
        });

        // Handle clicks outside search area
        document.addEventListener('click', (e) => {
            // Check if click is outside both search input and results
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.innerHTML = ''; // Hide results but keep input value
            }
        });

        // Handle result selection
        searchResults.addEventListener('click', (e) => {
            const resultLink = e.target.closest('a');
            if (resultLink) {
                // If a result link was clicked, hide the results but keep the input value
                setTimeout(() => {
                    searchResults.innerHTML = '';
                }, 100); // Small delay to ensure the link is followed
            }
        });

        // Prevent clicks within search results from closing the dropdown
        searchResults.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Show results when focusing back on search input
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim()) {
                performSearch();
            }
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