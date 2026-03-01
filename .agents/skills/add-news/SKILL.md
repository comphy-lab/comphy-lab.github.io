---
name: add-news
description: Add a lab news update to News.md and history.md with correct year and month placement, site formatting, and the rolling News.md limit of five regular news bullets while preserving special announcements. Use when asked to add or update a news item on the website.
---

# Add News Item

Add the user-provided news item to both `News.md` and `history.md`.

## Workflow

1. Parse the news content from user input.
2. Determine the target month and year from the content. Ask only if date is ambiguous.
3. Read both `News.md` and `history.md`.
4. Update `history.md`:
   - Organize by `## YEAR` sections in descending order.
   - Keep months in reverse chronological order within each year.
   - Create missing year section if needed.
   - Insert as a regular bullet in format `- [news content]`.
5. Update `News.md`:
   - Organize by `## YEAR` with `### Month` subsections.
   - Create missing year or month sections if needed.
   - Insert the same news bullet under the correct month.
   - Preserve special announcements (for example, the Durham announcement) as non-regular blocks.
6. Enforce News.md item limit:
   - Count only regular news bullets that start with a dash followed by a space (prefix: `-`).
   - Keep at most 5 regular items.
   - Remove oldest regular items first.
   - Never count or remove special announcement blocks for this limit.
7. Preserve spacing and structure:
   - Keep one blank line between major sections.
   - Keep heading and bullet style consistent with existing file format.
8. Save both files.

## Formatting Rules

- Year heading: `## 2026`
- Month heading: `### January`
- Regular item: `- News text`
- Special announcement blocks remain in their existing icon-based heading style.

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
