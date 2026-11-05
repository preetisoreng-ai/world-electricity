# ember-electricity

This folder contains one complete data-product run, grouped by purpose:

- `data/` - unchanged source files and derived datasets
- `workflow/` - context, analysis, reports, and approval records
- `site/` - the pages to open, plus their shared assets

The framework-owned stage prompts and story template are intentionally not duplicated here.
Start with the Original stage and review each page before continuing.
Shared dataset memory: `workflow/context.md`.

## Pages (open these)

- `site/data-story/index.html`: start here (scroll story)
- `site/original/index.html`: original exploratory analysis
- `site/tested/index.html`: pressure test
- `site/dashboard/index.html`: dashboard

Every page has the same top-bar dropdown to switch between them.

## Source and credit

Data: Ember, yearly electricity generation, World, all sources, 2000–2025 (`data/raw/`, unchanged).
Ember publishes its data for reuse with attribution; no licence file came with this download, so check
https://ember-energy.org before reusing the raw file.

The root `index.html` redirects to `site/data-story/index.html` for GitHub Pages.
