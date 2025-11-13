# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VitePress-based documentation site for Perkd Partner API integrations. The site documents REST APIs for vending machines, kiosks, payment processing, and callback handling. It uses **vitepress-openapi** to auto-generate API reference documentation from OpenAPI 3.0 JSON specifications, and **vitepress-plugin-mermaid** for diagram support.

## Development Commands

### Local Development
```bash
# Install dependencies (uses Yarn)
yarn install

# Start dev server (http://localhost:5173)
yarn dev
# OR
vitepress dev docs

*Note:* Do not re-run `yarn dev` after each edit as user is always running it on the side with hot reload already

# Build for production
yarn build
# OR
vitepress build docs

# Preview production build
yarn preview
# OR
vitepress preview docs
```

### Deployment
```bash
# Deploy to GitHub Pages (builds + pushes to gh-pages branch)
yarn deploy
```

This runs `vitepress build docs && gh-pages -d docs/.vitepress/dist`

Note: The `.github/workflows/` directory exists but is currently empty. Deployment is manual via `yarn deploy`.

## Architecture

### Documentation Structure

```
docs/
├── .vitepress/
│   ├── config.ts              # Main VitePress config (nav, sidebar, plugins)
│   └── dist/                  # Build output (gitignored)
│
├── specs/                     # OpenAPI 3.0 specifications (JSON)
│   ├── vending-api.json
│   ├── kiosk-api.json
│   ├── callbacks-api.json
│   └── payment-api.json
│
├── getting-started/           # Setup and authentication guides
├── machines/                  # Conceptual API guides (vending, kiosk, callbacks, payment)
├── schemas/                   # Data model documentation (Order, Item, Person, etc.)
├── guides/                    # Best practices (workflows, error handling, webhooks, testing)
└── api-reference/             # Auto-generated API docs from OpenAPI specs
    ├── vending.md
    ├── kiosk.md
    ├── callbacks.md
    └── payment.md
```

### Key Configuration Patterns

**docs/.vitepress/config.ts** is the central configuration file:

1. **OpenAPI Integration**: Uses `vitepress-openapi` to generate sidebars from OpenAPI specs:
   ```typescript
   import vendingSpec from '../specs/vending-api.json'
   const vendingSidebar = useSidebar({
     spec: vendingSpec,
     linkPrefix: '/api-reference/vending#'
   })
   ```

2. **API Reference Pages**: Use the `<OASpec>` component to render OpenAPI specs:
   ```vue
   <script setup>
   import spec from '../specs/vending-api.json'
   </script>
   <OASpec :spec="spec" />
   ```

3. **Mermaid Support**: Configured via `withMermaid()` wrapper:
   ```typescript
   export default withMermaid(defineConfig({
     mermaid: {},
     mermaidPlugin: { class: 'mermaid' }
   }))
   ```

4. **Navigation**: Sidebar is route-based (different sidebar per `/getting-started/`, `/machines/`, `/api-reference/`, etc.)

### Adding New API Endpoints

When adding a new API endpoint:

1. Update the relevant OpenAPI spec in `docs/specs/*.json`
2. The API reference page will auto-update (no manual changes needed)
3. Consider adding conceptual documentation in `docs/machines/` if the endpoint requires explanation
4. Update `docs/.vitepress/config.ts` only if adding a new API category (rare)

### Package Manager

This project uses **Yarn** (not npm). All scripts in package.json should be run with `yarn`, not `npm`.

### VitePress Specifics

- **Markdown Extensions**: Supports `:::tip`, `:::warning`, `:::danger` containers
- **Frontmatter**: Pages use YAML frontmatter (e.g., `aside: false`, `outline: deep`)
- **Search**: Local search enabled via Pagefind
- **Base URL**: Set to `/` (root deployment on perkd.github.io)
- **Dead Links**: `ignoreDeadLinks: true` in config (allows linking to planned pages)

## Important Notes

- OpenAPI specs are the source of truth for API documentation
- When editing API docs, modify the JSON specs, not the generated markdown
- The site deploys to GitHub Pages via the `gh-pages` branch
- Mermaid diagrams are supported in markdown files
- All API specs follow OpenAPI 3.0.3 standard
