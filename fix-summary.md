# Fix Summary — Issues #63, #64, #66, #67, #68

## Issue #63 — deploy.sh strict-mode and CLI validation

**Changed:** `tests/deploy-script-regression.sh`

The `deploy.sh` already had all required guards (livereload guarded branch,
IPv6 URL bracketing, port/host validation). Added the missing smoke-test cases
to `tests/deploy-script-regression.sh`:

- `test_missing_port_argument_is_rejected` — `--port` with no following value
- `test_port_flag_as_value_is_rejected` — `--port --drafts` (flag as value)
- `test_missing_host_argument_is_rejected` — `--host` with no following value
- `test_nonnumeric_port_is_rejected` — `--port abc`

**Test result:** `deploy-script regression tests passed` (9 scenarios, all pass)

---

## Issue #64 — validate-content-rules fail-fast for missing files / bad headings

**Changed:** `scripts/validate-content-rules.sh`

- Updated `require_file` error message to the specified format:
  `"file not found: <path>"`.
- Fixed check ordering in `validate_history_order`: year-context presence is
  now asserted **before** the month-name validity check, so a heading that
  appears before any `## YYYY` heading always gets the "appears before any year
  heading" diagnostic rather than being swallowed by an "invalid month name"
  error.
- Improved all three history-parsing error messages to include the full
  offending heading text and surrounding context.

**Test result:** `✓ Content ordering and research tag rules passed.`

---

## Issue #66 — Non-standard CSS selectors and design-token correctness

**Changed:** `assets/css/command-palette.css`, `assets/css/teaching.css`,
`assets/js/command-palette.js`

- **command-palette.css:** Replaced the non-standard
  `:has(.command-palette-section-title:contains("Search Results"))` selector
  with the class `.command-palette-section--search-results`.
- **command-palette.js:** `renderSections` now sets the
  `command-palette-section--search-results` class on the section element when
  the section name is `"Search Results"`.
- **teaching.css:** Replaced four `:contains("Course Schedule")` rules with:
  - `.course-schedule-heading` (for the preceding `h2`), and
  - explicit `.schedule-container h3 / h4 / ul` rules (the `.schedule-container`
    wrapper already existed in templates).
- **teaching.css:** Corrected two wrong CSS custom-property fallback values:
  - `var(--color-heading-h2, #ff6b6b)` → `var(--color-heading-h2, #0156b3)`
    (`#ff6b6b` was a red fallback for a blue token)
  - `var(--color-heading-h3, #000)` → `var(--color-heading-h3, #333)` (matches
    the light-mode definition in `styles.css`)

---

## Issue #67 — Teaching markdown CI gate scope

**Changed:** `.github/workflows/teaching-content-checks.yml`, `CLAUDE.md`

- Added `assets/images/teaching/README.md` to the `paths` triggers for both
  `pull_request` and `push` events so changes to that file fire the workflow.
- Extended both `markdownlint-cli2` and `prettier --check` invocations to
  include `assets/images/teaching/README.md` alongside `_teaching/**/*.md`.
- Documented the equivalent local one-liner in the **Essential Commands**
  section of `CLAUDE.md`.

---

## Issue #68 — Stale async search results in command palette

**Changed:** `assets/js/command-palette.js`,
`tests/command-palette-stale-search.test.js` *(new)*

- Added a `_searchToken` monotonic counter at module scope. Each call to
  `renderCommandResults` captures the current token value. The async
  `SearchManager.searchForCommandPalette` callback checks `token !== _searchToken`
  before updating the DOM; if a newer search has been issued it returns without
  rendering, eliminating stale-result overwrites.
- Exposed `window._getSearchToken()` for test introspection.
- Added `tests/command-palette-stale-search.test.js` with three behaviour-
  focused regression scenarios:
  1. Stale first result is discarded when a second search is still in-flight.
  2. Single in-flight search resolves and renders normally.
  3. Stale result resolves after the current result — DOM is unchanged.

---

## Test Results

| Suite | Result |
|---|---|
| `jest` (all 9 suites, 51 tests) | **PASS** |
| `tests/deploy-script-regression.sh` (9 scenarios) | **PASS** |
| `scripts/validate-content-rules.sh` | **PASS** |
