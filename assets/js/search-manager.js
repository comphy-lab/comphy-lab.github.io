/**
 * Search Manager for CoMPhy Lab website
 * Centralizes all search functionality and Fuse.js integration
 * Eliminates duplication across command-palette.js and command-data.js
 */
/* global Fuse */

(function () {
  "use strict";

  // Private variables
  let searchData = null;
  let searchFuse = null;
  let isLoading = false;
  let loadPromise = null;

  // Default Fuse.js configuration
  const DEFAULT_FUSE_CONFIG = {
    keys: [
      { name: "title", weight: 0.7 },
      { name: "content", weight: 0.2 },
      { name: "tags", weight: 0.1 },
      { name: "categories", weight: 0.1 },
    ],
    includeScore: true,
    threshold: 0.4,
  };

  /**
   * Loads the search database from the server
   * @returns {Promise<Object[]>} Promise that resolves to search data array
   */
  async function loadSearchDatabase() {
    // Return existing promise if already loading
    if (loadPromise) {
      return loadPromise;
    }

    // Return cached data if available
    if (searchData) {
      return Promise.resolve(searchData);
    }

    // Create new load promise
    loadPromise = (async () => {
      try {
        console.log("Loading search database...");
        const response = await fetch("/assets/js/search_db.json");

        if (!response.ok) {
          throw new Error(
            `Failed to fetch search database: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error(
            "Search database has invalid format - expected array"
          );
        }

        searchData = data;
        console.log(`Search database loaded: ${data.length} items`);
        return data;
      } catch (error) {
        console.warn("Could not load search database:", error.message);
        searchData = []; // Set empty array to prevent further attempts
        return [];
      } finally {
        isLoading = false;
      }
    })();

    return loadPromise;
  }

  /**
   * Initializes Fuse.js with the search data
   * @param {Object} config - Optional Fuse.js configuration to override defaults
   * @returns {Promise<Fuse>} Promise that resolves to Fuse instance
   */
  async function initializeFuse(config = DEFAULT_FUSE_CONFIG) {
    // Return existing Fuse instance if available
    if (searchFuse) {
      return searchFuse;
    }

    // Load search data first
    const data = await loadSearchDatabase();

    if (data.length === 0) {
      console.warn("No search data available for Fuse initialization");
      return null;
    }

    try {
      searchFuse = new Fuse(data, config);
      console.log("Fuse.js initialized successfully");
      return searchFuse;
    } catch (error) {
      console.error("Error creating Fuse instance:", error);
      return null;
    }
  }

  /**
   * Performs a search using the initialized Fuse instance
   * @param {string} query - Search query string
   * @param {Object} options - Search options
   * @param {number} options.maxResults - Maximum number of results to return (default: 5)
   * @param {function} options.transform - Function to transform each result
   * @returns {Promise<Object[]>} Promise that resolves to search results
   */
  async function search(query, options = {}) {
    const { maxResults = 5, transform } = options;

    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const fuse = await initializeFuse();

      if (!fuse) {
        console.warn("Fuse.js not available for search");
        return [];
      }

      const results = fuse.search(query.trim());

      // Sort results by priority first, then by Fuse.js score
      const sortedResults = results.sort((a, b) => {
        // First compare by priority (lower number = higher priority)
        const priorityA = a.item.priority || 5;
        const priorityB = b.item.priority || 5;

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        // If priorities are equal, use Fuse.js score (lower score = better match)
        return a.score - b.score;
      });

      // Limit results and apply transformation if provided
      const limitedResults = sortedResults.slice(0, maxResults);

      if (transform && typeof transform === "function") {
        return limitedResults.map(transform);
      }

      return limitedResults;
    } catch (error) {
      console.error("Error performing search:", error);
      return [];
    }
  }

  /**
   * Searches and formats results for the command palette
   * @param {string} query - Search query string
   * @returns {Promise<Object[]>} Promise that resolves to formatted command palette results
   */
  async function searchForCommandPalette(query) {
    if (!query || query.length < 3) {
      return [];
    }

    const results = await search(query, {
      maxResults: 5,
      transform: (result) => ({
        id: `search-result-${result.refIndex}`,
        title: result.item.title || "Untitled",
        handler: () => {
          if (result.item.url) {
            window.location.href = result.item.url;
          }
        },
        section: "Search Results",
        icon: '<i class="fa-solid fa-file-lines"></i>',
        excerpt:
          result.item.excerpt ||
          (result.item.content &&
            result.item.content.substring(0, 100) + "...") ||
          "",
      }),
    });

    return results;
  }

  /**
   * Prefetches the search database to improve performance
   * This should be called early in page load
   */
  async function prefetchSearchData() {
    try {
      await loadSearchDatabase();
      console.log("Search database prefetched successfully");
    } catch (error) {
      console.warn("Search database prefetch failed:", error.message);
    }
  }

  /**
   * Gets search statistics
   * @returns {Object} Object containing search statistics
   */
  function getSearchStats() {
    return {
      isLoaded: !!searchData,
      itemCount: searchData ? searchData.length : 0,
      isFuseInitialized: !!searchFuse,
      isLoading,
    };
  }

  /**
   * Resets the search manager (useful for testing or reinitialization)
   */
  function reset() {
    searchData = null;
    searchFuse = null;
    isLoading = false;
    loadPromise = null;
    console.log("Search manager reset");
  }

  // Public API
  const SearchManager = {
    // Core functions
    search,
    searchForCommandPalette,

    // Initialization
    loadSearchDatabase,
    initializeFuse,
    prefetchSearchData,

    // Utilities
    getSearchStats,
    reset,

    // Constants
    DEFAULT_FUSE_CONFIG,
  };

  // Make SearchManager available globally
  window.SearchManager = SearchManager;

  // Backwards compatibility - maintain existing API
  window.searchDatabaseForCommandPalette = searchForCommandPalette;

  // Auto-prefetch on DOM load for better performance
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", prefetchSearchData);
  } else {
    // Document already loaded, prefetch immediately
    prefetchSearchData();
  }
})();
