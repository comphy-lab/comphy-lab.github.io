document.addEventListener("keydown", function (event) {
  "use strict";

  if ((event.metaKey || event.ctrlKey) && event.key === "k") {
    event.preventDefault();
    window.openCommandPalette();
  }
});
