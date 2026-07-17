describe("contact card interactions", () => {
  const flushAsync = async () => {
    for (let step = 0; step < 6; step += 1) {
      await Promise.resolve();
    }
  };

  const loadCard = () => {
    document.body.innerHTML = `
      <button type="button" data-copy-email>Copy</button>
      <button type="button" data-share-card>Share page</button>
      <p data-card-status></p>
    `;
    jest.resetModules();
    require("../assets/js/contact-card.js");
  };

  beforeEach(() => {
    jest.useFakeTimers();
    document.execCommand = undefined;
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(navigator, "share", {
      value: undefined,
      configurable: true,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("copies the email address with the Clipboard API", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    loadCard();

    document.querySelector("[data-copy-email]").click();
    await flushAsync();

    expect(writeText).toHaveBeenCalledWith("vatsal.sanjay@durham.ac.uk");
    expect(document.querySelector("[data-copy-email]").textContent).toBe(
      "Copied"
    );
    expect(document.querySelector("[data-card-status]").textContent).toBe(
      "Email address copied."
    );
  });

  it("falls back to execCommand without Clipboard API", async () => {
    document.execCommand = jest.fn().mockReturnValue(true);
    loadCard();

    document.querySelector("[data-copy-email]").click();
    await flushAsync();

    expect(document.execCommand).toHaveBeenCalledWith("copy");
    expect(document.querySelector("[data-card-status]").textContent).toBe(
      "Email address copied."
    );
  });

  it("uses native sharing when available", async () => {
    const share = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      value: share,
      configurable: true,
    });
    loadCard();

    document.querySelector("[data-share-card]").click();
    await flushAsync();

    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Vatsal Sanjay · CoMPhy Lab",
        url: "http://localhost/",
      })
    );
    expect(document.querySelector("[data-card-status]").textContent).toBe(
      "Contact card shared."
    );
  });

  it("copies the page URL when native sharing is unavailable", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    loadCard();

    document.querySelector("[data-share-card]").click();
    await flushAsync();

    expect(writeText).toHaveBeenCalledWith("http://localhost/");
    expect(document.querySelector("[data-card-status]").textContent).toBe(
      "Contact-card link copied."
    );
  });
});
