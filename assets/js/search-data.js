// search-data.js - Convert existing search_db.json to NinjaKeys format
document.addEventListener('DOMContentLoaded', function() {
  // Initialize empty search data array
  window.searchData = [];
  
  // Add navigation items
  window.searchData.push(
    {
      id: "home",
      title: "Home",
      handler: () => { window.location.href = '/'; },
      section: "Navigation",
      shortcuts: ["h"],
      icon: '<i class="fas fa-home"></i>'
    },
    {
      id: "team",
      title: "Team",
      handler: () => { window.location.href = '/team/'; },
      section: "Navigation",
      shortcuts: ["t"],
      icon: '<i class="fas fa-users"></i>'
    },
    {
      id: "research",
      title: "Research",
      handler: () => { window.location.href = '/research/'; },
      section: "Navigation",
      shortcuts: ["r"],
      icon: '<i class="fas fa-flask"></i>'
    },
    {
      id: "teaching",
      title: "Teaching",
      handler: () => { window.location.href = '/teaching/'; },
      section: "Navigation",
      shortcuts: ["e"],
      icon: '<i class="fas fa-chalkboard-teacher"></i>'
    },
    {
      id: "join",
      title: "Join Us",
      handler: () => { window.location.href = '/join/'; },
      section: "Navigation",
      icon: '<i class="fas fa-handshake"></i>'
    },
    {
      id: "contact",
      title: "Contact",
      handler: () => { window.location.href = '/contact/'; },
      section: "Navigation",
      icon: '<i class="fas fa-envelope"></i>'
    }
  );
  
  // Get the base URL from meta tag if it exists
  const baseUrl = document.querySelector('meta[name="base-url"]')?.content || '';
  
  // Load existing search database to add content items
  fetch(`${baseUrl}/assets/js/search_db.json`)
    .then(response => response.json())
    .then(data => {
      // Process each search item and convert to NinjaKeys format
      data.forEach(item => {
        // Create appropriate section based on item type
        let section = "Content";
        let icon = '<i class="fas fa-file-alt"></i>';
        
        if (item.type === 'team_member') {
          section = "Team Members";
          icon = '<i class="fas fa-user"></i>';
        } else if (item.type === 'paper') {
          section = "Research Papers";
          icon = '<i class="fas fa-scroll"></i>';
        } else if (item.type === 'markdown_section' || item.type === 'markdown_text') {
          section = "Pages";
          icon = '<i class="fas fa-file-alt"></i>';
        }
        
        // Create a subtitle from content (truncate if needed)
        let subtitle = '';
        if (item.content) {
          // Strip markdown and HTML
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = item.content.replace(/\*\*|__|\*|_|`|\[.*?\]\(.*?\)/g, '');
          subtitle = tempDiv.textContent.substring(0, 60).trim();
          if (item.content.length > 60) subtitle += '...';
        }
        
        // Add to search data
        window.searchData.push({
          id: item.url.replace(/[^\w-]/g, '-'),
          title: item.title,
          subtitle: subtitle,
          handler: () => { window.location.href = item.url; },
          section: section,
          keywords: item.tags ? item.tags.join(', ') : '',
          icon: icon
        });
      });
      
      // Update the ninja-keys component with the data
      const ninjaKeys = document.querySelector('ninja-keys');
      if (ninjaKeys) {
        ninjaKeys.data = window.searchData;
      }
    })
    .catch(error => {
      console.error('Error loading search database:', error);
    });
}); 