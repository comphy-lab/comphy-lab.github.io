(function () {
  "use strict";

  var media = document.querySelector(".hero__media");
  if (!media) return;
  var figures = media.querySelectorAll("figure");
  if (figures.length < 1) return;

  var reduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) {
    media.querySelectorAll("video").forEach(function (video) {
      video.removeAttribute("autoplay");
      video.removeAttribute("loop");
      try {
        video.pause();
        video.currentTime = 0;
      } catch {
        // Some browsers reject media control before metadata is available.
      }
    });
    media.querySelectorAll("iframe").forEach(function (frame) {
      var src = frame.getAttribute("src") || "";
      frame.setAttribute(
        "src",
        src.replace("autoplay=1", "autoplay=0").replace("&loop=1", "&loop=0")
      );
    });
    return;
  }

  if (figures.length < 2) return;

  function resetMedia(figure) {
    var video = figure.querySelector("video");
    if (video) {
      try {
        video.currentTime = 0;
        var playPromise = video.play();
        if (playPromise) playPromise.catch(function () {});
      } catch {
        // Some browsers reject media control before metadata is available.
      }
    }

    var frame = figure.querySelector("iframe");
    if (frame) {
      var src = frame.getAttribute("src");
      frame.setAttribute("src", src);
    }
  }

  function slideDuration(figure) {
    var duration = parseInt(figure.getAttribute("data-duration"), 10);
    return duration > 0 ? duration : 6500;
  }

  var index = 0;
  function advance() {
    figures[index].setAttribute("data-active", "false");
    figures[index].setAttribute("aria-hidden", "true");
    figures[index].setAttribute("inert", "");
    index = (index + 1) % figures.length;
    figures[index].setAttribute("data-active", "true");
    figures[index].setAttribute("aria-hidden", "false");
    figures[index].removeAttribute("inert");
    resetMedia(figures[index]);
    setTimeout(advance, slideDuration(figures[index]));
  }

  setTimeout(advance, slideDuration(figures[index]));
})();
