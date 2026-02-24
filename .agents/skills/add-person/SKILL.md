---
name: add-person
description: Add a person entry to _team/index.md in the correct section (Present Team, Active Collaborations, or Alumni) with required profile fields, icon links, image handling, and insertion position rules. Use when asked to add a new team member, collaborator, or alumnus.
---

# Add Person to Team Page

Add one person to `_team/index.md` in the correct category while preserving site formatting.

## Collect Required Inputs

Collect:

- Full name
- Degree or title (for example: `M.Sc.`, `Ph.D.`, `Dr.`, `Prof.`)
- Category: Present Team, Active Collaborations, or Alumni
- Role or position
- Image path if provided (otherwise use `/assets/images/team/anonymous.svg`)

Collect category-specific fields:

- Present Team:
  - Optional co-advisor line
  - Education bullets (institution, year, optional thesis link)
  - Research interests
  - Social or academic URLs (GitHub, Google Scholar, Bluesky, X, LinkedIn, ORCID, Wikipedia)
- Active Collaborations:
  - Position with institution URL
  - Collaboration topics
  - Social or academic URLs (Google Scholar, X, Bluesky, GitHub, ORCID, Wikipedia)
- Alumni:
  - Graduation year and degree
  - Institution
  - Current role
  - Thesis title and link
  - Social URLs (LinkedIn, GitHub)

## Image Handling

- If category is Present Team and user wants a real photo:
  - Check `/assets/images/team/` for highest numbered image file.
  - Assign next number path (`/assets/images/team/<N>.jpg` or `.webp`).
  - Tell user to add the photo at that path.
- If no photo is provided, use `/assets/images/team/anonymous.svg`.

Never use `placeholder.jpg`.

## Entry Templates

### Present Team

```markdown
### [Name] [Degree]

<span style="font-size: 1.1em;">[Position]</span>

[Optional co-advisor line]

[Icon links, one per line]

<img src="/assets/images/team/[FILE]" alt="[Name]" loading="lazy" width="200" height="200">

- [Education line 1]
- [Education line 2, optional thesis link]

**Research Interest:** [Research interests]
```

### Active Collaborations

```markdown
### [Title] [Name]

[Icon links, one per line]

- [Position, Institution with link]

**Collaboration on:** [Topics]
```

### Alumni

```markdown
### [Name] [Degree]

[Icon links, one per line]

- **Now:** [Current position]
- **[Year]:** Graduated with [Degree], [Institution]
- <a href="[URL]" class="pdf-link" style="display: inline-flex; align-items: center;"><i class="fa-solid fa-file-pdf pdf-link-icon"></i>[Thesis Title]</a>
```

## Icon Snippets

- GitHub: `<i class="fa-brands fa-github" style="font-size: 2.5em; color: black;"></i>`
- Google Scholar: `<i class="ai ai-google-scholar-square" style="font-size: 2.5em;"></i>`
- Bluesky: `<i class="fa-brands fa-bluesky" style="font-size: 2em; color: #0085ff;"></i>`
- X: `<i class="fa-brands fa-x-twitter" style="font-size: 2em; color: #000000;"></i>`
- LinkedIn: `<i class="fa-brands fa-linkedin" style="font-size: 1.5em; color: black;"></i>`
- ORCID: `<i class="fa-brands fa-orcid" style="font-size: 2.25em;"></i>`
- Wikipedia: `<i class="fa-brands fa-wikipedia-w" style="font-size: 2em; color: #000000;"></i>`
- Thesis/PDF: `<i class="fa-solid fa-file-pdf pdf-link-icon"></i>`

## Insert Location Rules

- Present Team: insert before `### We need you!`
- Active Collaborations: append to that section before `## Our Alumni`
- Alumni: insert at top of Alumni section (most recent first)

## Final Checks

- Keep existing spacing and formatting patterns.
- Keep icon sizes and colors consistent with nearby entries.
- Use forward-slash absolute paths (starting with `/`).
- Save `_team/index.md`.
- If a new numbered image was assigned, remind user to add the image file.
