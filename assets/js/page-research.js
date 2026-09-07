document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  var researchContent = document.querySelector(".research-content");
  if (!researchContent) return;

  var tocList = document.querySelector(".toc-list");
  var headings = researchContent.querySelectorAll("h2");
  if (tocList && headings.length) {
    var tocEntries = [];
    headings.forEach(function (heading, index) {
      if (!heading.id) heading.id = "section-" + index;
      var item = document.createElement("li");
      var link = document.createElement("a");
      link.href = "#" + heading.id;
      link.textContent = heading.textContent;
      item.appendChild(link);
      tocList.appendChild(item);
      tocEntries.push({ element: heading, link: link });
    });

    if ("IntersectionObserver" in window) {
      var tocObserver = new IntersectionObserver(
        function (items) {
          items.forEach(function (item) {
            var index = Array.from(headings).indexOf(item.target);
            if (index < 0 || !item.isIntersecting) return;
            tocEntries.forEach(function (entry) {
              entry.link.classList.remove("active");
            });
            tocEntries[index].link.classList.add("active");
          });
        },
        {
          root: null,
          rootMargin: "-100px 0px -66%",
          threshold: [0, 0.5, 1],
        }
      );
      headings.forEach(function (heading) {
        tocObserver.observe(heading);
      });
    }
  }

  researchContent.querySelectorAll("h3").forEach(function (heading) {
    var container = document.createElement("div");
    container.className = "paper-container";
    if (heading.id) {
      container.id = heading.id;
      heading.removeAttribute("id");
    }
    heading.parentNode.insertBefore(container, heading);
    container.appendChild(heading);
    var cursor = container.nextSibling;
    while (cursor && !(cursor.tagName === "H3" || cursor.tagName === "H2")) {
      var next = cursor.nextSibling;
      container.appendChild(cursor);
      cursor = next;
    }
  });

  var contentTags = researchContent.querySelectorAll(".tags span");
  var themeTags = document.querySelectorAll(".r-theme__tag[data-filter-tag]");
  var tagControls = Array.from(contentTags).concat(Array.from(themeTags));
  var papers = researchContent.querySelectorAll(".paper-container");
  var activeTag = null;

  function getTagText(control) {
    return control.getAttribute("data-filter-tag") || control.textContent;
  }

  function setActive(tagText) {
    tagControls.forEach(function (control) {
      control.classList.toggle("active", getTagText(control) === tagText);
    });
  }

  function updateUrl(tagText, replace) {
    if (!history.pushState || !history.replaceState) return;
    var url = window.location.pathname;
    if (tagText) url += "?tag=" + encodeURIComponent(tagText);
    history[replace ? "replaceState" : "pushState"]({}, "", url);
  }

  function clearFilter(options) {
    options = options || {};
    activeTag = null;
    tagControls.forEach(function (control) {
      control.classList.remove("active");
    });
    papers.forEach(function (paper) {
      paper.classList.remove("hidden");
    });
    if (!options.skipUrl) updateUrl(null, options.replace);
  }

  function applyFilter(tagText, options) {
    options = options || {};
    activeTag = tagText;
    setActive(tagText);
    papers.forEach(function (paper) {
      var tags = paper.querySelector(".tags");
      var match =
        tags &&
        Array.from(tags.querySelectorAll("span")).some(function (tag) {
          return tag.textContent === tagText;
        });
      paper.classList.toggle("hidden", !match);
    });
    if (!options.skipUrl) updateUrl(tagText, options.replace);
  }

  function activateTag(control, options) {
    var text = getTagText(control);
    if (activeTag === text) clearFilter(options);
    else applyFilter(text, options);
  }

  function bindTagControl(control) {
    control.addEventListener("click", function () {
      activateTag(control);
    });
    if (control.tagName !== "BUTTON") {
      control.setAttribute("role", "button");
      control.setAttribute("tabindex", "0");
      control.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activateTag(control);
        }
      });
    }
  }

  tagControls.forEach(bindTagControl);

  function syncFilterFromUrl(options) {
    options = options || {};
    var params = new URLSearchParams(window.location.search);
    var tagFromUrl = params.get("tag");
    if (!tagFromUrl) {
      clearFilter({ skipUrl: true });
      return;
    }
    var match = tagControls.find(function (control) {
      return getTagText(control) === tagFromUrl;
    });
    if (match) applyFilter(tagFromUrl, options);
    else clearFilter(options);
  }

  syncFilterFromUrl({ replace: true });
  window.addEventListener("popstate", function () {
    syncFilterFromUrl({ skipUrl: true });
  });
});
