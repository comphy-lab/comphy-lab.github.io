(function () {
  "use strict";

  var media = document.querySelector(".hero__media");
  if (!media) return;
  var figures = media.querySelectorAll("figure");
  if (figures.length < 1) return;

  var motion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduced = motion && motion.matches;
  var index = 0;
  var timer;

  function pauseVideo(video, reset) {
    try {
      video.pause();
      if (reset) video.currentTime = 0;
    } catch {
      // Media control can fail before metadata is available.
    }
  }

  function syncMedia(reset) {
    figures.forEach(function (figure, figureIndex) {
      var video = figure.querySelector("video");
      if (!video) return;
      video.removeAttribute("autoplay");
      video.loop = !reduced;
      if (reduced || document.hidden || figureIndex !== index) {
        pauseVideo(video, reduced);
        return;
      }
      try {
        if (reset) video.currentTime = 0;
        video.muted = true;
        var playing = video.play();
        if (playing) playing.catch(function () {});
      } catch {
        // A poster remains visible if autoplay is unavailable.
      }
    });
  }

  function schedule() {
    clearTimeout(timer);
    if (reduced || document.hidden || figures.length < 2) return;
    var duration = parseInt(figures[index].getAttribute("data-duration"), 10);
    timer = setTimeout(advance, duration > 0 ? duration : 6500);
  }

  function advance() {
    var outgoing = figures[index];
    var video = outgoing.querySelector("video");
    if (video) pauseVideo(video, false);
    outgoing.setAttribute("data-active", "false");
    outgoing.setAttribute("aria-hidden", "true");
    outgoing.setAttribute("inert", "");
    index = (index + 1) % figures.length;
    figures[index].setAttribute("data-active", "true");
    figures[index].setAttribute("aria-hidden", "false");
    figures[index].removeAttribute("inert");
    syncMedia(true);
    schedule();
  }

  document.addEventListener("visibilitychange", function () {
    syncMedia(false);
    schedule();
  });
  window.addEventListener("pagehide", function () {
    clearTimeout(timer);
    media.querySelectorAll("video").forEach(function (video) {
      pauseVideo(video, false);
    });
  });
  window.addEventListener("pageshow", function () {
    syncMedia(false);
    schedule();
  });
  if (motion && motion.addEventListener) {
    motion.addEventListener("change", function () {
      reduced = motion.matches;
      syncMedia(false);
      schedule();
    });
  }

  syncMedia(false);
  schedule();
})();
