---
description: Parse BibTeX and add research paper to _research/index.md
argument-hint: [bibtex-entry]
allowed-tools: Read, Edit, AskUserQuestion, Write
---

# Add Research Paper from BibTeX

Parse a BibTeX entry and add it to `_research/index.md` following the exact format used by the CoMPhy Lab website.

## Workflow

1. **Parse BibTeX Entry**
   - Extract authors, title, journal/venue, year, volume, pages, DOI, arXiv ID
   - Handle special characters and formatting

2. **Determine Publication Type**
   - If journal contains "arXiv preprint" → Add to "Work in Progress" section
   - Otherwise → Add to appropriate year section

3. **Format Entry**
   - For published papers: Use numbered format with `<h3 id="NUM">[NUM]`
   - For preprints: Use ### without numbering
   - Bold lab members: **Sanjay, V.** and **Dixit, A.**
   - Always list all authors, never use "et al."

4. **Interactive Elements**
   - Ask user for tags based on title keywords
   - Suggest: Bubbles, Drops, Jets, Sheets, Non-Newtonian, Coalescence, Impact forces, etc.
   - Ask if Featured tag should be added (max 2 featured papers on homepage)
   - Ask for optional GitHub URL or YouTube embed

5. **Generate Badges**
   - arXiv badge if arXiv ID present
   - Journal badge with DOI if available
   - Blog badge (standard for all papers)
   - GitHub badge if URL provided

## Implementation Steps

### Step 1: Parse BibTeX

Read the user-provided BibTeX entry and extract:

- Citation key (e.g., jana2025impacting)
- Authors list - format as "LastName, F." (use first initial only)
- Title (remove curly braces, preserve capitalization)
- Journal/venue name
- Year, volume, pages, article number
- DOI from `doi` field
- arXiv ID from `eprint` field or journal field if contains "arXiv:"
- Any note fields

### Step 2: Check for Existing Preprint

For published papers, search "Work in Progress" section for matching preprint by:

- Similar title (fuzzy match)
- Same authors and year

If found, note it for removal after adding published version

### Step 3: Format Authors

- Format: "Author1, A., Author2, B., & Author3, C."
- Bold lab members: `<strong>Sanjay, V.</strong>` and `<strong>Dixit, A.</strong>`
- Always list all authors regardless of number (do not use "et al.")

### Step 4: Determine Section and Number

For published papers:

- Find the highest existing paper number (currently [17])
- New paper gets next number
- Create year section if doesn't exist
- Insert in reverse chronological order within year

For preprints (Work in Progress):

- No numbering
- Add to "Work in Progress" section
- Format: `### Authors. Title. Journal (Year).`

### Step 5: Ask for Tags

Suggest tags based on keywords in title/abstract:

- Bubbles, Drops, Jets, Sheets
- Non-Newtonian, Coalescence
- Superamphiphobic-surfaces, Impact forces
- Dissipative anomaly, Soft-matter-singularities
- Featured (only if user confirms, max 2 on homepage)

### Step 6: Generate Badges

Standard badges format:

```markdown
[![arXiv](https://img.shields.io/static/v1.svg?style=flat-square&label=arXiv&message=XXXX.XXXXX&color=green)](https://arxiv.org/abs/XXXX.XXXXX)
[![JOURNAL](https://img.shields.io/static/v1.svg?style=flat-square&label=JOURNAL&message=OA&color=orange)](https://doi.org/DOI)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat-square&logo=github&logoColor=white)](GITHUB_URL)
[![Blog](https://img.shields.io/badge/Blog-Coming%20Soon-yellow?style=flat-square&logo=obsidian&logoColor=white)](https://blogs.comphy-lab.org/0_ToDo-Blog-public)
```

Common journal abbreviations:

- Nature Communications → Nat. Commun.
- Journal of Fluid Mechanics → JFM
- Physical Review Letters → PRL
- Physics of Fluids → Phys. Fluids
- AIChE Journal → AIChE J.
- Chemical Engineering Science → Chem. Eng. Sci.
- Science Advances → Sci. Adv.
- Building Simulations → Build. Simul.

### Step 7: Optional Extras

Ask if user wants to add:

- GitHub repository URL
- YouTube video embed (use youtube-nocookie.com domain)
- Images or highlights section

### Step 8: Insert into File

- Read current `_research/index.md`
- Find appropriate section
- Insert formatted entry maintaining proper spacing
- If replacing preprint, remove from Work in Progress
- Preserve blank lines between entries

## Example Input/Output

Input BibTeX:

```bibtex
@article{bashkatov2025electrolyte,
  title={Electrolyte droplet spraying in H2 bubbles during water electrolysis},
  author={Bashkatov, A. and Bürkle, F. and Demirkır, Ç. and Ding, W. and Sanjay, V. and Babich, A. and Yang, X. and Mutschke, G. and Czarske, J. and Lohse, D. and Krug, D. and Büttner, L. and Eckert, K.},
  journal={Nature Communications},
  volume={16},
  pages={4580},
  year={2025},
  doi={10.1038/s41467-025-59762-7}
}
```

Output (for paper [18]):

```markdown
<h3 id="18">[18] Bashkatov, A., Bürkle, F., Demirkır, Ç., Ding, W., <strong>Sanjay, V.</strong>, Babich, A., Yang, X., Mutschke, G., Czarske, J., Lohse, D., Krug, D., Büttner, L., & Eckert, K. Electrolyte droplet spraying in H2 bubbles during water electrolysis. Nat. Commun., 16, 4580 (2025).</h3>

<div class="tags"><span>Bubbles</span><span>Jets</span></div>

[![Nat. Commun.](https://img.shields.io/static/v1.svg?style=flat-square&label=Nat.%20Commun.&message=OA&color=orange)](https://doi.org/10.1038/s41467-025-59762-7)
[![Blog](https://img.shields.io/badge/Blog-Coming%20Soon-yellow?style=flat-square&logo=obsidian&logoColor=white)](https://blogs.comphy-lab.org/0_ToDo-Blog-public)
```

## Important Notes

- Maintain exact formatting with proper spacing
- Lab members always in bold
- Numbered papers go in year sections, preprints in Work in Progress
- Always include Blog badge
- Check for duplicate entries before adding
- When moving preprint to published, ensure all metadata is updated
