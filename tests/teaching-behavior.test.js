describe("teaching course sorting user paths", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetModules();
    document.body.innerHTML = `
      <div id="simple-command-palette" style="display:block"></div>
      <main><div class="teaching-content"><div class="teaching-grid"></div>
      </div></main>`;
    require("../assets/js/teaching.js");
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    document.body.innerHTML = "";
    delete window.sortCoursesByDate;
  });

  function cards() {
    return [...document.querySelectorAll(".teaching-grid > .course-card")].map(
      (card) => card.querySelector("h3").textContent
    );
  }

  function grid(html) {
    document.querySelector(".teaching-grid").innerHTML = html;
  }

  test("current cards sort newest first and keep their links inside cards", () => {
    grid(`
        <div class="course-card"><h3>Self-paced</h3><a href="/Course/">Go</a></div>
        <div class="course-card" data-date="2025-03-10"><h3>March</h3>
          <a href="/2025-Course/">View</a></div>
        <div class="course-card" data-date="2025-09-15"><h3>September</h3>
          <a href="/2025-OtherCourse/">View</a></div>`);
    window.sortCoursesByDate();
    expect(cards()).toEqual(["September", "March", "Self-paced"]);
    expect(document.querySelectorAll(".course-card > a")).toHaveLength(3);
    expect(document.querySelectorAll(".teaching-grid > a")).toHaveLength(0);
    expect(document.querySelector(".sort-indicator").textContent).toContain(
      "3 courses sorted"
    );
    expect(
      document.querySelector("#simple-command-palette").style.display
    ).toBe("none");
    jest.advanceTimersByTime(8000);
    expect(document.querySelector(".sort-indicator")).toBeNull();
  });

  test("extracts legacy dates from attributes, time and printed date", () => {
    grid(`
      <article class="course" date="2023-02-01"><h3>Old</h3></article>
      <article class="course"><h3>Middle</h3><time datetime="2024-02-01"></time></article>
      <article class="course"><h3>New</h3><p>March 10, 2025</p></article>`);
    window.sortCoursesByDate();
    expect(
      [...document.querySelectorAll(".teaching-grid > .course h3")].map(
        (title) => title.textContent
      )
    ).toEqual(["New", "Middle", "Old"]);
  });

  test("sorts undated titles alphabetically and replaces old feedback", () => {
    grid(`
      <div class="course-card"><h3>Zebra</h3></div>
      <div class="course-card"><h3>Alpha</h3></div>`);
    window.sortCoursesByDate();
    window.sortCoursesByDate();
    expect(cards()).toEqual(["Alpha", "Zebra"]);
    expect(document.querySelectorAll(".sort-indicator")).toHaveLength(1);
  });

  test("reports one course without moving it out of the grid", () => {
    grid('<div class="course-card"><h3>One</h3></div>');
    window.sortCoursesByDate();
    window.sortCoursesByDate();
    expect(cards()).toEqual(["One"]);
    expect(document.querySelectorAll(".sort-indicator")).toHaveLength(1);
    expect(document.querySelector(".sort-indicator").textContent).toContain(
      "Only one course"
    );
    jest.advanceTimersByTime(5000);
    expect(document.querySelector(".sort-indicator")).toBeNull();
  });

  test("empty teaching content gives one temporary visible message", () => {
    window.sortCoursesByDate();
    window.sortCoursesByDate();
    expect(document.querySelectorAll(".sort-indicator")).toHaveLength(1);
    expect(document.querySelector(".sort-indicator").textContent).toContain(
      "No courses found"
    );
    jest.advanceTimersByTime(5000);
    expect(document.querySelector(".sort-indicator")).toBeNull();
  });
});
