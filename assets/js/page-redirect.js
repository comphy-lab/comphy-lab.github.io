(function () {
  "use strict";

  var script = document.currentScript;
  var target = script && script.getAttribute("data-redirect-target");
  if (target === "/" || target === "/join") {
    window.location.replace(target);
  }
})();
