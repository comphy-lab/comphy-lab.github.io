/**
 * Creates a styled feedback message element for course sorting UI
 * @param {string} message - The text message to display
 * @param {number} autoRemoveDelay - Time in milliseconds before auto-removal (default: 5000)
 * @returns {HTMLDivElement} The styled feedback element
 */
function createFeedbackMessage(message, autoRemoveDelay = 5000) {
  const feedbackElement = document.createElement("div");
  feedbackElement.className = "sort-indicator";
  feedbackElement.textContent = message;

  // Apply consistent styling
  feedbackElement.style.padding = "10px";
  feedbackElement.style.margin = "10px 0";
  feedbackElement.style.backgroundColor = "#F0E6F5";
  feedbackElement.style.color = "#68236D"; // Brand purple color
  feedbackElement.style.borderRadius = "4px";
  feedbackElement.style.textAlign = "center";
  feedbackElement.style.border = "1px solid #E6D0F0";

  // Auto-remove after specified delay
  setTimeout(() => {
    if (feedbackElement.parentNode) {
      feedbackElement.remove();
    }
  }, autoRemoveDelay);

  return feedbackElement;
}

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
    ".s-teaching .course-item, .teaching-content .course-item, .course, .course-container, article.course, .teaching-course, .teaching-content > div[class*=\"course\"], .teaching-content > div > a[href*=\"Course\"], .teaching-content a[href*=\"Course\"]"
  );

  // If no direct matches found, try to find the specific course structure on the page
  let coursesArray = [];
  if (courseContainers.length === 0) {
    console.log(
      "No direct course elements found, trying to locate specific course structure"
    );

    // Look for the course card structure on the teaching page
    const possibleCourses = document.querySelectorAll(
      ".teaching-content > div > a"
    );
    if (possibleCourses.length > 0) {
      console.log("Found possible course links:", possibleCourses.length);
      coursesArray = Array.from(possibleCourses);
    } else {
      // Try the specific course element visible in the screenshot (with "High-Fidelity Simulations")
      const specificCourseElement = document.querySelector(
        ".teaching-content > p + div"
      );
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
      const feedbackMsg = createFeedbackMessage(
        "No courses found to sort. Add course items with class \"course-item\" or \"course\" for automatic sorting."
      );

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
    }

    return;
  }

  // If only one course, show a message but don"t do sorting
  if (coursesArray.length === 1) {
    const courseContainer = coursesArray[0];
    const parentContainer = courseContainer.parentNode;

    // Create a message using helper function
    const singleCourseIndicator = createFeedbackMessage(
      "Only one course available - no sorting needed"
    );

    // Remove any existing indicators
    const existingIndicator = document.querySelector(".sort-indicator");
    if (existingIndicator) {
      existingIndicator.remove();
    }

    // Find the container where we should insert the message (teaching content or parent of course)
    const messageContainer =
      document.querySelector(".teaching-content") || parentContainer;

    // Add indicator at the beginning of teaching content
    if (messageContainer) {
      if (messageContainer.firstChild) {
        messageContainer.insertBefore(
          singleCourseIndicator,
          messageContainer.firstChild
        );
      } else {
        messageContainer.appendChild(singleCourseIndicator);
      }
    }

    return;
  }

  // Helper function to extract date from course element
  const extractDateFromElement = (element) => {
    return (
      element.getAttribute("data-date") ||
      element.getAttribute("date") ||
      element.querySelector(".course-date, .date, time, [class*=\"date\"]")
        ?.textContent ||
      element.querySelector("[datetime]")?.getAttribute("datetime") ||
      // Regex matches: YYYY-MM-DD, MM-DD-YYYY, or "Month DD, YYYY" formats
      // with flexible separators (-, /, .) and optional comma after day
      element.textContent.match(
        /\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}/i
      )?.[0] ||
      ""
    );
  };

  // For multiple courses, proceed with sorting
  // Get parent container
  const parentContainer = coursesArray[0].parentNode;

  // Sort courses by date attribute or content
  coursesArray.sort((a, b) => {
    // Extract dates using helper function
    const dateA = extractDateFromElement(a);
    const dateB = extractDateFromElement(b);

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
    const titleA =
      a.querySelector("h2, h3, h4, .title")?.textContent || a.textContent;
    const titleB =
      b.querySelector("h2, h3, h4, .title")?.textContent || b.textContent;

    // Fall back to alphabetical sorting by title
    return titleA.localeCompare(titleB);
  });

  // Re-append in the new order
  coursesArray.forEach((course) => {
    parentContainer.appendChild(course);
  });

  // Add a visual indicator that sorting has occurred
  const sortIndicator = createFeedbackMessage(
    `${coursesArray.length} courses sorted by date (most recent first)`,
    8000 // Auto-remove after 8 seconds
  );

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

  console.log(`${coursesArray.length} courses sorted by date`);
}

// Make sortCoursesByDate available globally
window.sortCoursesByDate = sortCoursesByDate;
