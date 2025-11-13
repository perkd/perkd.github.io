# Perkd Partner Documentation

Official API documentation for Perkd Partner integrations.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Yarn (install with `npm install -g yarn`)

### Installation

```bash
# Install dependencies
yarn install

# Start local dev server
yarn docs:dev
```

Visit `http://localhost:5173` to view the docs locally.

### Build

```bash
# Build static site
yarn docs:build

# Preview production build
yarn docs:preview
```

## 📁 Project Structure

```
perkd.github.io/
├── docs/
│   ├── .vitepress/
│   │   └── config.ts          # VitePress configuration
│   │
│   ├── getting-started/        # Getting started guides
│   │   ├── index.md
│   │   ├── setup.md
│   │   ├── environments.md
│   │   └── authentication.md
│   │
│   ├── machines/               # Machine APIs
│   │   ├── vending/
│   │   ├── kiosk/
│   │   ├── callbacks/
│   │   └── payment/
│   │
│   ├── schemas/                # Data schemas
│   │   ├── order.md
│   │   ├── item.md
│   │   └── ...
│   │
│   ├── guides/                 # Conceptual guides
│   │   └── ...
│   │
│   └── index.md                # Landing page
│
├── .github/
│   └── workflows/
│       └── deploy.yml          # Auto-deploy to GitHub Pages
│
└── package.json
```

## 🛠️ Development

### Running Locally

```bash
yarn docs:dev
```

The site will be available at `http://localhost:5173` with hot module replacement.

### Writing Documentation

All documentation is written in Markdown with [VitePress](https://vitepress.dev) extensions:

```markdown
# Page Title

Regular markdown content...

::: tip
Helpful tips appear in blue boxes
:::

::: warning
Warnings appear in yellow boxes
:::

::: danger
Critical warnings appear in red boxes
:::

\`\`\`javascript
// Code blocks support syntax highlighting
const api = 'https://api.perkd.io/prod';
\`\`\`
```

### Navigation Structure

Edit navigation in `docs/.vitepress/config.ts`:

```typescript
export default defineConfig({
  themeConfig: {
    nav: [...],
    sidebar: {...}
  }
})
```

## 🚢 Deployment

### Deploy to GitHub Pages

Simple one-command deployment:

```bash
yarn docs:deploy
```

This will:
1. Build the documentation
2. Deploy to `gh-pages` branch
3. Update the live site at `https://perkd.github.io`

### First-Time Setup

After your first deployment:

1. Go to repository **Settings** → **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `gh-pages`
4. **Folder**: `/` (root)
5. Click **Save**

Your site will be live at: `https://perkd.github.io`

### Deployment Time

Deployment typically completes in ~30 seconds.

## 📝 Content Guidelines

### Adding a New Page

1. Create markdown file in appropriate directory
2. Add to navigation in `docs/.vitepress/config.ts`
3. Use clear, scannable formatting
4. Include code examples
5. Link to related pages

### Code Examples

- Provide working examples
- Use realistic data
- Show both request and response
- Include error handling
- Support multiple languages when relevant

### API Reference Format

```markdown
## Endpoint Name

### Endpoint
\`\`\`
POST /Actions/vending
\`\`\`

### Request
**Headers:**
\`\`\`http
x-api-key: YOUR_API_KEY
\`\`\`

**Body:**
\`\`\`json
{...}
\`\`\`

### Response
\`\`\`json
{...}
\`\`\`
```

## 🔧 Configuration

### Base URL

Update in `docs/.vitepress/config.ts`:

```typescript
export default defineConfig({
  base: '/', // Change if deploying to subdirectory
  // ...
})
```

### Theme Customization

VitePress uses the default theme. Customize colors, fonts, and layout in:
- `docs/.vitepress/config.ts` - Theme config
- `docs/.vitepress/theme/` - Custom theme overrides (create as needed)

### Search

Local search is enabled by default:

```typescript
export default defineConfig({
  themeConfig: {
    search: {
      provider: 'local'
    }
  }
})
```

## 📚 Resources

- [VitePress Documentation](https://vitepress.dev)
- [Markdown Guide](https://www.markdownguide.org)
- [Vue.js](https://vuejs.org) (powers VitePress)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test locally with `npm run docs:dev`
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

For questions or issues with the documentation:
- Open an issue on GitHub
- Contact the Perkd team

For API support:
- partners@perkd.io
