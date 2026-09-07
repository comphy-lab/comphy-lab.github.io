(function () {
  "use strict";

  var frame = document.getElementById("team-map");
  if (!frame) return;
  var loaded = false;

  function load() {
    if (loaded) return;
    loaded = true;

    var iframe = document.createElement("iframe");
    iframe.src =
      "https://www.google.com/maps/d/u/0/embed" +
      "?mid=1hOfYTnnie_7Bx45e9uA4gLXaaKreTXc" +
      "&ehbc=2E312F&noprof=1&z=3&ll=42,-10";
    iframe.title = "CoMPhy Lab — team, collaborators, and conference visits";
    iframe.loading = "lazy";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.setAttribute(
      "sandbox",
      "allow-scripts allow-same-origin allow-popups"
    );
    frame.replaceChildren(iframe);
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            load();
            observer.disconnect();
          }
        });
      },
      { rootMargin: "300px" }
    );
    observer.observe(frame);
  } else {
    load();
  }
})();
