# Add Person to Team Page

Add a new person to the team page in the appropriate category (Present Team, Active Collaborations, or Alumni).

## Task Instructions

1. **Gather Information**: Ask the user for the following details:
   - Full name (required)
   - Degree/title (e.g., "M.Sc.", "Ph.D.", "Dr.", "Prof.", "B.Sc.")
   - Category: Present Team, Active Collaborations, or Alumni
   - Position/role (e.g., "Ph.D. Student, University of Twente")
   - Image path (optional - if not provided, use `/assets/images/team/anonymous.svg`)

   **For Present Team members:**
   - Co-advisor information (if applicable)
   - Education history (bullet points with institutions, years, thesis links)
   - Research interests
   - Social/academic links: GitHub, Google Scholar, Bluesky, Twitter/X, LinkedIn, ORCID, Wikipedia

   **For Active Collaborations:**
   - Affiliation with institution URL
   - Collaboration topics
   - Social/academic links: Google Scholar, Twitter/X, Bluesky, GitHub, ORCID, Wikipedia

   **For Alumni:**
   - Graduation year and degree
   - Current position
   - Institution where graduated
   - Thesis title and link
   - Social links: LinkedIn, GitHub

2. **Determine Image Path**:
   - If adding a Present Team member WITH a photo:
     - Find the highest numbered image in `/assets/images/team/` (currently goes up to 6.jpg)
     - Use next number (e.g., if highest is 6.jpg, use 7.jpg)
     - Tell user: "Please add the team member's photo as `/assets/images/team/[NUMBER].jpg` or `.webp`"
   - If NO photo provided: Use `/assets/images/team/anonymous.svg`

3. **Read the current team page**:

   ```bash
   Read _team/index.md
   ```

4. **Format the entry** based on category:

### Present Team Format

```markdown
### [Name] [Degree]

<span style="font-size: 1.1em;">[Position]</span>

[If co-advised: Co-advised with [Advisor Name and link]]

[Social links with Font Awesome icons - each on separate line]
[<i class="fa-brands fa-github" style="font-size: 2.5em; color: black;"></i>](URL)
[<i class="ai ai-google-scholar-square" style="font-size: 2.5em;"></i>](URL)
[<i class="fa-brands fa-bluesky" style="font-size: 2em; color: #0085ff;"></i>](URL)

<img src="/assets/images/team/[NUMBER].jpg" alt="[Name]" loading="lazy" width="200" height="200">

- [Education line 1]
- [Education line 2, with thesis link if applicable: <a href="URL" class="pdf-link" style="display: inline-flex; align-items: center; margin-left: 5px;"><i class="fa-solid fa-file-pdf pdf-link-icon"></i>Thesis Title</a>]

**Research Interest:** [Research interests]
```

### Active Collaborations Format

```markdown
### [Title] [Name]

[Social links with Font Awesome icons]
[<i class="ai ai-google-scholar-square" style="font-size: 2.5em;"></i>](URL)
[<i class="fa-brands fa-x-twitter" style="font-size: 2em; color: #000000;"></i>](URL)

- [Position, Institution with link]

**Collaboration on:** [Topics]
```

### Alumni Format

```markdown
### [Name] [Degree]

[Social links - typically LinkedIn and/or GitHub]
[<i class="fa-brands fa-linkedin" style="font-size: 1.5em; color: black;"></i>](URL)
[<i class="fa-brands fa-github" style="font-size: 2em; color: black;"></i>](URL)

- **Now:** [Current position]
- **[Year]:** Graduated with [Degree], [Institution]
- <a href="[URL]" class="pdf-link" style="display: inline-flex; align-items: center;"><i class="fa-solid fa-file-pdf pdf-link-icon"></i>[Thesis Title]</a>
```

## Icon Reference

Use appropriate icons based on available links:

- GitHub: `<i class="fa-brands fa-github" style="font-size: 2.5em; color: black;"></i>`
- Google Scholar: `<i class="ai ai-google-scholar-square" style="font-size: 2.5em;"></i>`
- Bluesky: `<i class="fa-brands fa-bluesky" style="font-size: 2em; color: #0085ff;"></i>`
- Twitter/X: `<i class="fa-brands fa-x-twitter" style="font-size: 2em; color: #000000;"></i>`
- LinkedIn: `<i class="fa-brands fa-linkedin" style="font-size: 1.5em; color: black;"></i>`
- ORCID: `<i class="fa-brands fa-orcid" style="font-size: 2.25em;"></i>`
- Wikipedia: `<i class="fa-brands fa-wikipedia-w" style="font-size: 2em; color: #000000;"></i>`
- PDF/Thesis: `<i class="fa-solid fa-file-pdf pdf-link-icon"></i>`

## Insert Location

- For **Present Team**: Add before "### We need you!" section
- For **Active Collaborations**: Add at the end of that section (before "## Our Alumni")
- For **Alumni**: Add at the beginning of that section (most recent first)

## Final Steps

1. Save the file and confirm the addition
2. If a new image number was assigned, remind user to add the actual photo file to the specified path

## Important Notes

- Always maintain the exact formatting and indentation of existing entries
- Use proper HTML entities where needed (e.g., `&#8209;` for non-breaking hyphens in year ranges)
- Keep consistent spacing between sections (single blank line between entries)
- Font Awesome icon sizes and colors must match existing entries in each section
- Image dimensions are always `width="200" height="200"` for team members
- The placeholder.jpg should never be used - use anonymous.svg instead
- Links should use markdown format with icons in square brackets
- All paths should use forward slashes and start with `/` for absolute paths
