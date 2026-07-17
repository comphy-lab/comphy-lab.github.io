(function () {
  "use strict";

  const copyButton = document.querySelector("[data-copy-email]");
  const shareButton = document.querySelector("[data-share-card]");
  const status = document.querySelector("[data-card-status]");
  let copyResetTimeout;
  let statusTimeout;

  const setStatus = (message) => {
    if (!status) return;
    window.clearTimeout(statusTimeout);
    status.textContent = message;
    statusTimeout = window.setTimeout(() => {
      status.textContent = "";
      statusTimeout = undefined;
    }, 3000);
  };

  const copyText = async (button, text) => {
    const copied = await window.Utils?.copyToClipboard?.(button, text);
    if (!copied) throw new Error("Copy command unavailable");
  };

  copyButton?.addEventListener("click", async () => {
    try {
      await copyText(copyButton);
      window.clearTimeout(copyResetTimeout);
      copyButton.textContent = "Copied";
      setStatus("Email address copied.");
      copyResetTimeout = window.setTimeout(() => {
        copyButton.textContent = "Copy";
        copyResetTimeout = undefined;
      }, 2000);
    } catch {
      setStatus("Copy failed. Select the email address above.");
    }
  });

  shareButton?.addEventListener("click", async () => {
    const shareData = {
      title: shareButton.dataset.shareTitle,
      text: shareButton.dataset.shareText,
      url: shareButton.dataset.shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setStatus("Contact card shared.");
        return;
      }

      await copyText(shareButton, shareData.url);
      setStatus("Contact-card link copied.");
    } catch (error) {
      if (error?.name !== "AbortError") {
        setStatus("Use your browser menu to share this page.");
      }
    }
  });
})();
