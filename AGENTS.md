# AGENTS.md

Operating notes for AI coding assistants (Claude Code, Codex, etc.) working
in this repository. Treated as canonical; `CLAUDE.md` defers here.

## Repository overview

Static Jekyll site for the CoMPhy (Computational Multiphase Physics) Lab —
research publications, team profiles, teaching materials, lab news. Hosted
on GitHub Pages at <https://comphy-lab.org>.

## Architecture at a glance

### v2 design system

The site is mid-migration to a "v2" design language:

- **`assets/css/tokens.css`** — design tokens (`--c-*` brand colours,
  `--t-*` typography, `--s-*` spacing, `--r-*` radii). Single source of
  truth.
- **`assets/css/bridge.css`** — loaded **after** `tokens.css` and
  `styles.css` so its `:root` declarations win. Maps legacy
  `--color-*`/`--font-*`/`--shadow-*` names onto v2 tokens, declares
  shared component primitives (panel, eyebrow, lede, chip, btn-ghost,
  paper-card, news-row, team-tile).
- **v2 page stylesheets** — `home.css`, `team-v2.css`, `research-v2.css`,
  `footer-v2.css`, `about-layout.css`, `shared-news-history.css`,
  `join-us.css`. Coexist with legacy `styles.css`, `research.css`,
  `team.css`, `teaching.css`.

When adding a new v2 page, prefer composing from bridge primitives over
duplicating styles. Page-specific files only for genuinely page-specific
rules.

### Data-driven pages

Several pages render from YAML rather than handwritten HTML:

- **`_data/hero.yml`** — homepage hero section (slides, copy, eyebrow).
- **`_data/news.yml`** — news items shown on the homepage and `/news/`
  archive (date, kind, title, meta, action).
- **`_data/team.yml`** — present members, collaborators, alumni for the
  team page (name, role, photo, bio).
- **`_data/research_themes.yml`** — research-themes block.

The Jekyll collections (`_research/`, `_team/`, `_teaching/`, `_join-us/`)
still drive their own pages. Team is the one with both a YAML feed and a
collection, and `_team/index.md` is the rendered surface — the YAML is the
content.

### Layouts and includes

- `_layouts/default.html` — base layout, used by everything except the
  collection-specific layouts below.
- `_layouts/research.html`, `team.html`, `teaching.html`,
  `teaching-course.html`, `join-us.html`, `history.html` — collection /
  page layouts.
- `_includes/footer-v2.html` — site footer (v2 footer is the only footer).
- `_includes/theme-init.html`, `tokens-bridge.html`, `tokens-head.html` —
  early-load fragments for theme persistence and token wiring.

### Command palette and search

- `command-palette.js` must load **before** `command-data.js` (dependency
  order; `scripts/fix-script-order.sh` enforces this).
- Fuse.js powers fuzzy search.
- Search database (`search_db.json`) is generated and updated daily from
  the [comphy-lab/comphy-search](https://github.com/comphy-lab/comphy-search)
  repository via GitHub Actions; not edited by hand here.
- Keyboard shortcut: ⌘K (Mac) / Ctrl+K (Windows).

### Theme system

- CSS variables in `:root` for light, overridden under `[data-theme="dark"]`.
- Theme persisted in `localStorage`, applied early via `theme-init.html`
  to avoid FOUC.

### Research tag filtering

- Client-side JS filtering plus pre-generated tag pages for SEO.
- Tags must use `<div class="tags"><span>TagName</span></div>` in
  `_research/index.md`.

### Redirect pages

- `about.html` — Jekyll permalink `/about/`, redirects to `/`. Plain JS
  redirect with visible fallback link, mirrors the `contact.html` pattern.
- `contact.html` — Jekyll permalink `/contact/`, redirects to `/join`.

## Essential commands

```bash
# Initial setup (installs Ruby/Node.js if needed, runs preflight,
# installs Husky hooks, builds, validates)
./scripts/setup.sh

# Local dev server (auto-finds free port 4001-4999, live reload)
./scripts/deploy.sh

# Full build (Jekyll + search + SEO + filtered research)
./scripts/build.sh

# Or plain Jekyll
bundle exec jekyll serve

# Run before committing
./scripts/lint-check.sh

# Tests
npm test
npm test -- --coverage
npm test -- command-data.test.js

# Targeted fixers
./scripts/fix-script-order.sh    # enforces command-palette.js first
./scripts/fix-js-line-length.sh  # 80-char enforcement
./scripts/fix-quotes.sh          # standardises to double quotes

# Lint teaching markdown locally (mirrors CI gate)
npx markdownlint-cli2 --config .markdownlint-cli2.jsonc \
  "_teaching/**/*.md" "assets/images/teaching/README.md"
npx prettier --check "_teaching/**/*.md" "assets/images/teaching/README.md"
```

## Content management

### Adding research papers

Add to `_research/index.md` in this exact form:

```markdown
<h3 id="NUMBER">[NUMBER] Author1, A., **Author2, B.**, & Author3, C. Title. _Journal_, Volume, Pages (Year).</h3>

<div class="tags"><span>Tag1</span><span>Tag2</span><span>Featured</span></div>

[![Badge](https://img.shields.io/static/v1.svg?style=flat-square&label=LABEL&message=MESSAGE&color=COLOR)](URL)
```

- Use `**Name**` for lab members.
- Add `<span>Featured</span>` to display on the homepage (max 2).
- The `id` attribute enables direct linking: `/research/#NUMBER`.

### Team members

Edit `_data/team.yml`. The team page (`_team/index.md` + `team.html`
layout) renders from this data. Photo files live under
`assets/images/team/` (1:1 crop, used at `--r-md` radius). Bio lines
are line-clamped per section (3 lines for present, 4 for collaborators,
unset for alumni).

### News

- **Slash command**: `/add-news "Your news content here"` — see "Custom
  slash commands" below.
- **Manual**: edit `_data/news.yml` (the source of truth for the homepage
  feed and `/news/` archive), then mirror to `News.md` and `history.md`.
  `News.md` keeps only the 5 most recent legacy items plus the pinned
  Durham announcement; older items live on in `history.md` and
  `_data/news.yml`.
- Format: `- News content` under `### Month Year` headers; pinned items
  have no header. Months are reverse-chronological within each year.

### Teaching

- Main page: `_teaching/index.md` (uses the `teaching` layout, sorts and
  filters courses).
- Course pages: `_teaching/YYYY-CourseName-Location.md` (uses
  `teaching-course` layout).
- Images: `/assets/images/teaching/` — 600x400 for cards, 1200x400 for
  banners.

## Critical implementation details

### Script dependencies

Enforced by `lint-check.sh`, but worth keeping in mind:

- Fuse.js loads before any search code.
- `command-palette.js` loads before `command-data.js`.
- `theme-init.html` runs as early as possible to avoid theme flash.

### Pre-commit hooks

Installed by `setup.sh` via Husky:

- ESLint with auto-fix for JS.
- Prettier for JS/CSS/JSON/YAML formatting.
- markdownlint-cli2 for Markdown.
- Only staged files are checked.
- Bypass with `git commit --no-verify` only in real emergencies.

### Search database updates

Maintained externally in
[comphy-lab/comphy-search](https://github.com/comphy-lab/comphy-search).
Updated daily via GitHub Actions and pulled into `assets/js/search_db.json`.
Includes blog content from blogs.comphy-lab.org. Manual trigger available
in the Actions tab.

### Content-rules CI

The `content-rules` workflow validates `history.md` chronological
ordering and `_research/index.md` tag markup. Trigger paths must match
the validated-file set; `scripts/check-content-rules-trigger-parity.py`
enforces this. If you add a new file to the validator, also add its path
to `.github/workflows/content-rules-checks.yml`.

## Testing

### Coverage areas

- Command palette (navigation, search, keyboard shortcuts).
- Line-breaking utilities (80-char enforcement).
- Platform detection (Mac vs Windows shortcuts).
- Teaching page sorting.
- Featured-papers homepage media handling regression.
- Browser API mocks in `tests/setup.js`.

### Running specific tests

```bash
npm test -- command-data.test.js
npm test -- --watch
node scripts/simple-test.js   # quick validation without Jest
```

## Performance

### Build process

`scripts/build.sh` runs (in order):

1. Jekyll build (production env).
2. Search database fetch (in CI only).
3. SEO tag generation.
4. Filtered research tag pages.

### Asset optimisation

- WebP where possible; optimise before adding.
- Lazy loading on images.
- CSS organised by breakpoint (1700, 1300, 900, 768, 500) for cache hits.

## Conventions

### File management

- ALWAYS prefer editing existing files over creating new ones.
- Developer docs (READMEs, CONTRIBUTING) are not created unless asked.
- Site content follows its specific workflow (research / news / teaching
  / team — see "Content management" above).

### Code style

- 80-char line limit for JavaScript.
- Double quotes for strings.
- ES6+ (arrow functions, const/let, async/await).
- Mobile-first CSS; min-width media queries.
- BEM naming for CSS classes (`.s-header__nav-list`, `.news-item__body`).
- Compose from `bridge.css` primitives where possible.

### Git workflow

- Work on feature branches.
- Run `./scripts/lint-check.sh` and `npm test` before committing.
- Reference issue numbers in commits where relevant.
- Don't bypass hooks (`--no-verify`) unless explicitly authorised.

## Custom slash commands

The canonical definitions for `/add-news` and the other content skills
live outside this repository (in the agent system that invoked them).
The repo previously contained an `.agents/skills/` mirror, which was
removed deliberately to avoid drift. The notes below describe the
expected behaviour so non-agent contributors can follow the same recipe
manually.

### /add-news

Adds a news item to `_data/news.yml`, `News.md`, and `history.md` while
maintaining the 5-item limit on `News.md`. `_data/news.yml` is the
visible source for the homepage and `/news/`.

**Workflow**:

1. Add a structured item to `_data/news.yml` in reverse-chronological
   position with `date`, `kind`, `title`, `meta`, `action_label`,
   `action_href`.
2. Add the item to the matching `### Month Year` section in `history.md`.
3. Add the item to `News.md` in the same section.
4. If the count of non-pinned items in `News.md` exceeds 5, remove the
   oldest from `News.md` only (`history.md` keeps everything).
5. Save all three files.

**Rules**:

- The pinned Durham announcement has no month/year header — preserve it.
- News items use the `- News content` bullet form (dash + space + text).
- Maintain blank lines between sections.
- Years descend in `history.md`; months descend within each year.
