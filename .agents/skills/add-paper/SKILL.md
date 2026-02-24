---
name: add-paper
description: Parse a BibTeX entry and add a research publication to _research/index.md with correct section placement, numbering, author formatting, tags, and badges. Use when asked to add a paper, preprint, or publication update from BibTeX.
---

# Add Research Paper from BibTeX

Parse user-provided BibTeX and insert a correctly formatted entry in `_research/index.md`.

## Workflow

1. Parse BibTeX fields:
   - Authors, title, venue, year, volume, pages or article number, DOI, arXiv id.
2. Classify the entry:
   - If venue indicates arXiv preprint, place in `Work in Progress`.
   - Otherwise place in the corresponding year section.
3. Format authors:
   - Use `LastName, F.` style with all authors listed.
   - Bold lab members exactly as `<strong>Sanjay, V.</strong>` and `<strong>Dixit, A.</strong>`.
4. For published papers:
   - Use numbered heading format `<h3 id="NUM">[NUM] ...</h3>`.
   - Determine next paper number from highest existing number.
   - Insert into correct year in reverse chronological order.
5. For preprints:
   - Use non-numbered `###` entry in `Work in Progress`.
6. Check for potential preprint-to-published replacement:
   - Search `Work in Progress` for matching preprint by title and authors.
   - Remove old preprint entry when adding published version.
7. Ask user for interactive metadata:
   - Tags (suggest from title keywords).
   - Optional Featured tag (ensure no more than two featured homepage papers).
   - Optional GitHub URL and optional YouTube embed.
8. Generate badges:
   - arXiv badge when arXiv id exists.
   - Journal/DOI badge when DOI exists.
   - Blog badge always.
   - GitHub badge when URL is provided.
9. Insert entry and preserve spacing/structure.
10. Save `_research/index.md`.

## Tag Suggestions

Use title keywords to suggest tags such as:

- Bubbles
- Drops
- Jets
- Sheets
- Non-Newtonian
- Coalescence
- Impact forces
- Superamphiphobic-surfaces
- Dissipative anomaly
- Soft-matter-singularities

## Journal Abbreviation Hints

- Nature Communications -> Nat. Commun.
- Journal of Fluid Mechanics -> JFM
- Physical Review Letters -> PRL
- Physics of Fluids -> Phys. Fluids
- AIChE Journal -> AIChE J.
- Chemical Engineering Science -> Chem. Eng. Sci.
- Science Advances -> Sci. Adv.
- Building Simulations -> Build. Simul.

## Badge Shapes

```markdown
[![arXiv](https://img.shields.io/static/v1.svg?style=flat-square&label=arXiv&message=XXXX.XXXXX&color=green)](https://arxiv.org/abs/XXXX.XXXXX)
[![JOURNAL](https://img.shields.io/static/v1.svg?style=flat-square&label=JOURNAL&message=OA&color=orange)](https://doi.org/DOI)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat-square&logo=github&logoColor=white)](GITHUB_URL)
[![Blog](https://img.shields.io/badge/Blog-Coming%20Soon-yellow?style=flat-square&logo=obsidian&logoColor=white)](https://blogs.comphy-lab.org/0_ToDo-Blog-public)
```

## Formatting Requirements

- Preserve exact section spacing style from existing file.
- Avoid duplicate entries.
- Keep numbering contiguous.
- Keep all metadata updated when moving a preprint to published.
