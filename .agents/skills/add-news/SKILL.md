---
name: add-news
description: Add a lab news update to _data/news.yml, News.md, and history.md so the homepage, /news archive, and legacy history page stay in sync.
---

# Add News Item

Add the user-provided news item to `_data/news.yml`, `News.md`, and
`history.md`. `_data/news.yml` is the visible source for the homepage
and `/news/`; the Markdown files are legacy/archive surfaces that must
stay in sync.

## Workflow

1. Parse the news content from user input.
2. Determine the target month and year from the content. Ask only if date is ambiguous.
3. Read `_data/news.yml`, `News.md`, and `history.md`.
4. Update `_data/news.yml`:
   - Insert a structured entry under `items:`.
   - Use ISO `date`, one of `kind: paper | talk | people | move | award`,
     and `title`, `meta`, `action_label`, `action_href`.
   - Add `thumb` for paper cards when a relevant image exists.
   - Keep items in reverse chronological order.
5. Update `history.md`:
   - Organize by `## YEAR` sections in descending order.
   - Keep months in reverse chronological order within each year.
   - Create missing year section if needed.
   - Insert as a regular bullet in format `- [news content]`.
6. Update `News.md`:
   - Organize by `## YEAR` with `### Month` subsections.
   - Create missing year or month sections if needed.
   - Insert the same news bullet under the correct month.
   - Preserve special announcements (for example, the Durham announcement) as non-regular blocks.
7. Enforce News.md item limit:
   - Count only regular news bullets that start with a dash followed by a space (prefix: `-`).
   - Keep at most 5 regular items.
   - Remove oldest regular items first.
   - Never count or remove special announcement blocks for this limit.
8. Preserve spacing and structure:
   - Keep one blank line between major sections.
   - Keep heading and bullet style consistent with existing file format.
9. Save all three files.

## Formatting Rules

- Year heading: `## 2026`
- Month heading: `### January`
- Regular item: `- News text`
- Special announcement blocks remain in their existing icon-based heading style.
- `_data/news.yml` entries must remain valid YAML and include the fields
  consumed by `index.html` and `news/index.md`.

## Target Shape

```markdown
## 2026

### January

- [News item]

## 2025

### <Special announcement>

[Announcement content]

### December

- [News item]
```
