// search-ninja.js - Integration of NinjaKeys with search functionality
document.addEventListener('DOMContentLoaded', () => {
    // Create and append the ninja-keys element to the body
    const ninjaKeys = document.getElementById('search-modal') || document.createElement('ninja-keys');
    ninjaKeys.id = 'search-modal';
    ninjaKeys.setAttribute('placeholder', '⌘K (search)');
    ninjaKeys.setAttribute('data-info', 'Press ctrl+k to search (⌘+k on Mac)');
    
    if (!document.getElementById('search-modal')) {
        document.body.appendChild(ninjaKeys);
    }

    // Get the base URL from meta tag if it exists
    const baseUrl = document.querySelector('meta[name="base-url"]')?.content || '';
    let searchDatabase = null;

    // Load the search database
    fetch(`${baseUrl}/assets/js/search_db.json`)
        .then(response => response.json())
        .then(data => {
            searchDatabase = data;
            console.log(`Loaded search database with ${data.length} entries for ninja search`);
            
            // Once we have the data, update the ninja-keys data
            updateNinjaKeysData(searchDatabase);
        })
        .catch(error => {
            console.error('Error loading search database for ninja search:', error);
        });

    // Function to update ninja-keys data based on search database
    function updateNinjaKeysData(database) {
        if (!database) return;
        
        // Create actions for ninja-keys
        const actions = database.map(item => {
            return {
                id: item.url,
                title: item.title,
                section: item.section || 'Pages',
                keywords: item.content,
                handler: () => {
                    window.location.href = item.url;
                    return { keepOpen: false };
                }
            };
        });
        
        ninjaKeys.data = actions;
    }

    // Add keyboard shortcut listener for cmd+k/ctrl+k
    document.addEventListener('keydown', (e) => {
        // Check if cmd+k or ctrl+k is pressed
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault(); // Prevent default browser behavior
            
            // Focus the search input if it exists
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
                
                // If ninja-keys is available, open it
                if (ninjaKeys) {
                    ninjaKeys.open();
                }
            }
        }
    });
    
    // Add click event listener to the search button
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Focus the search input if it exists
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
                
                // If ninja-keys is available, open it
                if (ninjaKeys) {
                    ninjaKeys.open();
                }
            }
        });
    }
}); 