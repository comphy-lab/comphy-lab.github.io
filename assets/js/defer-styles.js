// Apply print-media stylesheets after they download so they do not
// block first paint. An inline onload handler is rejected by
// scripts/browser-security.py.
document.querySelectorAll("link[data-defer-style]").forEach((link) => {
  const apply = () => {
    link.media = "all";
  };
  if (link.sheet) {
    apply();
    return;
  }
  link.addEventListener("load", apply);
});
