document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  var mapContainer = document.querySelector(".map-container");
  var teamMap = document.getElementById("team-map");

  function loadMap() {
    if (!teamMap || teamMap.querySelector("iframe")) return;
    var iframe = document.createElement("iframe");
    iframe.src =
      "https://www.google.com/maps/d/u/0/embed" +
      "?mid=1hOfYTnnie_7Bx45e9uA4gLXaaKreTXc" +
      "&ehbc=2E312F&noprof=1&z=3&ll=42,-10";
    iframe.width = "100%";
    iframe.height = "100%";
    iframe.style.border = "0";
    iframe.allowFullscreen = true;
    iframe.loading = "lazy";
    iframe.title = "CoMPhy Lab - Team, Collaborators and Conference Visits";
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    iframe.setAttribute(
      "sandbox",
      "allow-scripts allow-same-origin allow-popups"
    );
    teamMap.replaceChildren(iframe);
  }

  if (mapContainer && teamMap) {
    if ("IntersectionObserver" in window) {
      var mapObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              loadMap();
              mapObserver.disconnect();
            }
          });
        },
        { rootMargin: "200px" }
      );
      mapObserver.observe(mapContainer);
    } else {
      setTimeout(loadMap, 1000);
    }
  }

  document.querySelectorAll("h2").forEach(function (heading) {
    if (!heading.id) {
      heading.id = heading.textContent
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-");
    }
  });

  if (window.location.hash) {
    setTimeout(function () {
      var id = decodeURIComponent(window.location.hash.slice(1));
      var element = document.getElementById(id);
      if (!element) return;
      var header = document.querySelector(".s-header");
      var headerHeight = header ? header.offsetHeight : 0;
      var elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - headerHeight - 20,
        behavior: "smooth",
      });
    }, 100);
  }

  document.querySelectorAll(".team-photo").forEach(function (image) {
    var retries = 0;

    function tryLoadImage() {
      if (retries >= 3 || image.classList.contains("loaded")) return;
      retries += 1;
      var url = new URL(image.src, window.location.href);
      url.searchParams.set("retry", Date.now().toString());
      image.src = url.toString();
    }

    image.addEventListener("error", function () {
      setTimeout(tryLoadImage, 1000 * retries);
    });

    if ("IntersectionObserver" in window) {
      var imageObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !image.classList.contains("loaded")) {
            tryLoadImage();
          }
        });
      });
      imageObserver.observe(image);
    }
  });
});
