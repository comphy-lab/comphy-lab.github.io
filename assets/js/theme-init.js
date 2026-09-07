(function () {
  "use strict";

  var script = document.currentScript;
  var dispatchThemeChange =
    script && script.hasAttribute("data-dispatch-theme-change");

  function readSavedTheme() {
    try {
      var saved = localStorage.getItem("theme");
      return saved === "light" || saved === "dark" ? saved : null;
    } catch (error) {
      console.warn("Theme init: cannot access localStorage", error);
      return null;
    }
  }

  function preferredTheme() {
    var saved = readSavedTheme();
    if (saved) return saved;
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function setTheme(theme, persist) {
    document.documentElement.setAttribute("data-theme", theme);
    if (persist) {
      try {
        localStorage.setItem("theme", theme);
      } catch (error) {
        console.warn("Theme init: cannot persist theme", error);
      }
    }

    if (dispatchThemeChange) {
      document.dispatchEvent(
        new CustomEvent("themeChange", { detail: { theme: theme } })
      );
    }
  }

  function applyImageState(image, loaded) {
    var state = image.getAttribute("data-image-state");
    if (loaded) {
      if (state === "self-loaded" || state === "team-photo") {
        image.classList.add("loaded");
      }
      if (state === "team-photo" && image.parentElement) {
        image.parentElement.classList.add("loaded");
      }
      return;
    }

    if (state === "hide-on-error") {
      image.style.display = "none";
    } else if (state === "team-photo" && image.parentElement) {
      image.parentElement.classList.add("error");
    }
  }

  function handleImageEvent(event) {
    var image = event.target;
    if (!(image instanceof HTMLImageElement) || !image.dataset.imageState) {
      return;
    }
    applyImageState(image, event.type === "load");
  }

  document.documentElement.classList.remove("no-js");
  document.documentElement.classList.add("js");
  document.documentElement.setAttribute("data-theme", preferredTheme());
  document.addEventListener("load", handleImageEvent, true);
  document.addEventListener("error", handleImageEvent, true);

  document.addEventListener("DOMContentLoaded", function () {
    setTheme(preferredTheme(), false);

    var themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", function () {
        var current =
          document.documentElement.getAttribute("data-theme") || "light";
        setTheme(current === "light" ? "dark" : "light", true);
      });
    }

    document
      .querySelectorAll("img[data-image-state]")
      .forEach(function (image) {
        if (image.complete) applyImageState(image, image.naturalWidth > 0);
      });
  });
})();
