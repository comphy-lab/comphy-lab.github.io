(function () {
  "use strict";

  const email = "vatsal.sanjay@durham.ac.uk";
  const copyButton = document.querySelector("[data-copy-email]");
  const shareButton = document.querySelector("[data-share-card]");
  const status = document.querySelector("[data-card-status]");

  const setStatus = (message) => {
    if (!status) return;
    status.textContent = message;
    window.setTimeout(() => {
      status.textContent = "";
    }, 3000);
  };

  const copyWithExecCommand = (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);

    try {
      textarea.select();
      return document.execCommand?.("copy") === true;
    } finally {
      textarea.remove();
    }
  };

  const copyText = async (text) => {
    if (copyWithExecCommand(text)) return;

    if (navigator.clipboard?.writeText) {
      await new Promise((resolve, reject) => {
        const timer = window.setTimeout(
          () => reject(new Error("Clipboard request timed out")),
          800
        );

        navigator.clipboard.writeText(text).then(
          () => {
            window.clearTimeout(timer);
            resolve();
          },
          (error) => {
            window.clearTimeout(timer);
            reject(error);
          }
        );
      });
      return;
    }

    throw new Error("Copy command unavailable");
  };

  copyButton?.addEventListener("click", async () => {
    try {
      await copyText(email);
      copyButton.textContent = "Copied";
      setStatus("Email address copied.");
      window.setTimeout(() => {
        copyButton.textContent = "Copy";
      }, 2000);
    } catch {
      setStatus("Copy failed. Select the email address above.");
    }
  });

  shareButton?.addEventListener("click", async () => {
    const shareData = {
      title: "Vatsal Sanjay · CoMPhy Lab",
      text: "Contact details for Dr Vatsal Sanjay at Durham University.",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setStatus("Contact card shared.");
        return;
      }

      await copyText(shareData.url);
      setStatus("Contact-card link copied.");
    } catch (error) {
      if (error?.name !== "AbortError") {
        setStatus("Use your browser menu to share this page.");
      }
    }
  });
})();
