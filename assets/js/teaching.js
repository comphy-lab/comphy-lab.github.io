/**
 * Course sorting functionality for teaching pages
 * Sorts course elements by date (most recent first)
 */
function sortCoursesByDate() {
  // Close the command palette first
  const palette = document.getElementById("simple-command-palette");
  if (palette) {
    palette.style.display = "none";
  }
  
  // Target various potential course container structures, including the current structure
  const courseContainers = document.querySelectorAll(
    ".s-teaching .course-item, .teaching-content .course-item, .course, .course-container, article.course, .teaching-course, .teaching-content > div[class*="course"], .teaching-content > div > a[href*="Course"], .teaching-content a[href*="Course"]"
  );
  
  // If no direct matches found, try to find the specific course structure on the page
  let coursesArray = [];
  if (courseContainers.length === 0) {
    console.log("No direct course elements found, trying to locate specific course structure");
    
    // Look for the course card structure on the teaching page
    const possibleCourses = document.querySelectorAll(".teaching-content > div > a");
    if (possibleCourses.length > 0) {
      console.log("Found possible course links:", possibleCourses.length);
      coursesArray = Array.from(possibleCourses);
    } else {
      // Try the specific course element visible in the screenshot (with "High-Fidelity Simulations")
      const specificCourseElement = document.querySelector(".teaching-content > p + div");
      if (specificCourseElement) {
        console.log("Found specific course element");
        coursesArray = [specificCourseElement];
      }
    }
  } else {
    coursesArray = Array.from(courseContainers);
  }
  
  if (coursesArray.length === 0) {
    console.log("No course items found to sort");
    
    // Show feedback even when no sortable items are found
    const contentContainer = document.querySelector(".teaching-content");
    if (contentContainer) {
      const feedbackMsg = document.createElement("div");
      feedbackMsg.className = "sort-indicator";
      feedbackMsg.textContent = "No courses found to sort. Add course items with class "course-item" or "course" for automatic sorting.";
      feedbackMsg.style.padding = "10px";
      feedbackMsg.style.margin = "10px 0";
      feedbackMsg.style.backgroundColor = "#F0E6F5"; // Lighter purple to match site theme
      feedbackMsg.style.color = "#68236D"; // Brand purple color
      feedbackMsg.style.borderRadius = "4px";
      feedbackMsg.style.textAlign = "center";
      feedbackMsg.style.border = "1px solid #E6D0F0";
      
      // Remove any existing messages
      const existingMsg = contentContainer.querySelector(".sort-indicator");
      if (existingMsg) {
        existingMsg.remove();
      }
      
      // Insert at the beginning
      if (contentContainer.firstChild) {
        contentContainer.insertBefore(feedbackMsg, contentContainer.firstChild);
      } else {
        contentContainer.appendChild(feedbackMsg);
      }
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (feedbackMsg.parentNode) {
          feedbackMsg.remove();
        }
      }, 5000);
    }
    
    return;
  }
  
  // If only one course, show a message but don"t do sorting
  if (coursesArray.length === 1) {
    const courseContainer = coursesArray[0];
    const parentContainer = courseContainer.parentNode;
    
    // Create a message
    const singleCourseIndicator = document.createElement("div");
    singleCourseIndicator.className = "sort-indicator";
    singleCourseIndicator.textContent = "Only one course available - no sorting needed";
    singleCourseIndicator.style.padding = "10px";
    singleCourseIndicator.style.margin = "10px 0";
    singleCourseIndicator.style.backgroundColor = "#F0E6F5"; // Lighter purple to match site theme
    singleCourseIndicator.style.color = "#68236D"; // Brand purple color
    singleCourseIndicator.style.borderRadius = "4px";
    singleCourseIndicator.style.textAlign = "center";
    singleCourseIndicator.style.border = "1px solid #E6D0F0";
    
    // Remove any existing indicators
    const existingIndicator = document.querySelector(".sort-indicator");
    if (existingIndicator) {
      existingIndicator.remove();
    }
    
    // Find the container where we should insert the message (teaching content or parent of course)
    const messageContainer = document.querySelector(".teaching-content") || parentContainer;
    
    // Add indicator at the beginning of teaching content
    if (messageContainer) {
      if (messageContainer.firstChild) {
        messageContainer.insertBefore(singleCourseIndicator, messageContainer.firstChild);
      } else {
        messageContainer.appendChild(singleCourseIndicator);
      }
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (singleCourseIndicator.parentNode) {
          singleCourseIndicator.remove();
        }
      }, 5000);
    }
    
    return;
  }
  
  // For multiple courses, proceed with sorting
  // Get parent container
  const parentContainer = coursesArray[0].parentNode;
  
  // Sort courses by date attribute or content
  coursesArray.sort((a, b) => {
    // Look for dates in multiple locations with fallbacks
    const dateA = a.getAttribute("data-date") || 
                  a.getAttribute("date") || 
                  a.querySelector(".course-date, .date, time, [class*="date"]")?.textContent || 
                  a.querySelector("[datetime]")?.getAttribute("datetime") || 
                  a.textContent.match(/\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}/i)?.[0] || 
                  "";
    
    const dateB = b.getAttribute("data-date") || 
                  b.getAttribute("date") || 
                  b.querySelector(".course-date, .date, time, [class*="date"]")?.textContent || 
                  b.querySelector("[datetime]")?.getAttribute("datetime") || 
                  b.textContent.match(/\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}/i)?.[0] || 
                  "";
    
    console.log(`Date found for course A: ${dateA}`);
    console.log(`Date found for course B: ${dateB}`);
    
    // Try to convert to Date objects if possible
    const timeA = new Date(dateA).getTime();
    const timeB = new Date(dateB).getTime();
    
    // If both are valid dates, compare them
    if (!isNaN(timeA) && !isNaN(timeB)) {
      return timeB - timeA; // Most recent first
    }
    
    // If dates are invalid, try to get titles for alphabetical sorting
    const titleA = a.querySelector("h2, h3, h4, .title")?.textContent || a.textContent;
    const titleB = b.querySelector("h2, h3, h4, .title")?.textContent || b.textContent;
    
    // Fall back to alphabetical sorting by title
    return titleA.localeCompare(titleB);
  });
  
  // Re-append in the new order
  coursesArray.forEach(course => {
    parentContainer.appendChild(course);
  });
  
  // Add a visual indicator that sorting has occurred
  const sortIndicator = document.createElement("div");
  sortIndicator.className = "sort-indicator";
  sortIndicator.textContent = `${coursesArray.length} courses sorted by date (most recent first)`;
  sortIndicator.style.padding = "10px";
  sortIndicator.style.margin = "10px 0";
  sortIndicator.style.backgroundColor = "#F0E6F5"; // Lighter purple to match site theme
  sortIndicator.style.color = "#68236D"; // Brand purple color
  sortIndicator.style.borderRadius = "4px";
  sortIndicator.style.textAlign = "center";
  sortIndicator.style.border = "1px solid #E6D0F0";
  
  // Remove any existing sort indicators
  const existingIndicator = document.querySelector(".sort-indicator");
  if (existingIndicator) {
    existingIndicator.remove();
  }
  
  // Find the container where we should insert the message
  const messageContainer = document.querySelector(".teaching-content");
  
  // Add indicator at the beginning of teaching content
  if (messageContainer && messageContainer.firstChild) {
    messageContainer.insertBefore(sortIndicator, messageContainer.firstChild);
  } else if (parentContainer && parentContainer.firstChild) {
    parentContainer.insertBefore(sortIndicator, parentContainer.firstChild);
  }
  
  // Auto-remove after 8 seconds
  setTimeout(() => {
    if (sortIndicator.parentNode) {
      sortIndicator.remove();
    }
  }, 8000);
  
  console.log(`${coursesArray.length} courses sorted by date`);
}

// Make sortCoursesByDate available globally
window.sortCoursesByDate = sortCoursesByDate;