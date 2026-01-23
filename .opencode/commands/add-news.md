Add the following news item to both News.md and history.md:

$ARGUMENTS

Follow these steps:

1. Parse the news content from $ARGUMENTS
2. Determine the appropriate month and year (ask if unclear)
3. Read both News.md and history.md files
4. Add the news item to history.md in the correct chronological position:
   - Years are organized with `## Year` headings (e.g., `## 2026`, `## 2025`)
   - Years are sorted descending (newest first)
   - Create year section if it doesn't exist
   - Months within a year are in chronological order (January at top)
   - Format: `- [news content]`
5. Add the same item to News.md:
   - Years are organized with `## Year` headings
   - Find or create the correct year section
   - Find or create the month subsection (### Month)
   - Insert after the month heading
   - The Durham announcement is a special item under the `## 2025` heading
6. Count regular news items in News.md (items that start with "- ")
7. If more than 5 regular news items exist, remove the oldest ones
   - Special announcements (like Durham) don't count toward the 5-item limit
   - Only remove items from the oldest months, preserving year structure
8. Ensure proper spacing between sections
9. Save both files

Important formatting:

- Year headings: `## 2026`, `## 2025`, etc.
- Month headings: `### January`, `### December`, etc.
- News items start with "- "
- Leave blank lines between different sections
- Special announcements (like Durham) use `### <i class="fa-solid...">` format
- Special announcements don't count toward the 5-item limit

Structure example:

```markdown
## 2026

### January

- [News item]

## 2025

### <Special announcement with icon>

[Announcement content]

### December

- [News item]
```
