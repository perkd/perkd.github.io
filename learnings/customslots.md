# VitePress OpenAPI Custom Slots Documentation

This document explains all the customizations made to the vitepress-openapi implementation for the Perkd Partner API documentation.

## Table of Contents

- [Problem Statement](#problem-statement)
- [Architecture Overview](#architecture-overview)
- [Custom Component: CustomOASpec](#custom-component-customoaspec)
- [Hash Navigation Implementation](#hash-navigation-implementation)
- [2-Column Grid Layout](#2-column-grid-layout)
- [Troubleshooting Guide](#troubleshooting-guide)
- [Key Learnings](#key-learnings)

---

## Problem Statement

### Requirements

1. **Single-Page Documentation**: Display all API operations on one page (e.g., `/api-reference/vending`) rather than separate pages per operation
2. **Custom 2-Column Layout**:
   - Top left: Operation description
   - Top right: Endpoint path badge (POST /vending/checkin)
   - Bottom left: Request body/parameters
   - Bottom right: Responses
3. **Clean Interface**: Hide unnecessary sections (security, playground, code samples)
4. **Working Hash Navigation**: Sidebar links should scroll to the correct operation on the page

### Initial Challenges

- **vitepress-openapi** is designed for separate pages per operation
- Default `<OASpec>` component layout didn't match our requirements
- Hash navigation wasn't working due to ID mismatches between sidebar links and heading IDs

---

## Architecture Overview

### File Structure

```
docs/
├── .vitepress/
│   ├── config.ts                          # Sidebar configuration
│   └── theme/
│       ├── index.ts                        # Hash navigation handler
│       └── components/
│           └── CustomOASpec.vue            # Custom component with slots + CSS
│
├── api-reference/
│   ├── vending.md                          # Uses <CustomOASpec>
│   ├── kiosk.md                            # Uses <CustomOASpec>
│   ├── callbacks.md                        # Uses <CustomOASpec>
│   └── payment.md                          # Uses <CustomOASpec>
│
└── specs/
    ├── vending-api.json                    # OpenAPI 3.0 spec
    ├── kiosk-api.json
    ├── callbacks-api.json
    └── payment-api.json
```

### Component Hierarchy

```
CustomOASpec (wrapper component)
  └── OAOperation (for each operation)
      ├── #header slot (custom - uses operationId for heading ID)
      ├── #security slot (hidden)
      ├── #parameters slot (default)
      ├── #request-body (default, repositioned via CSS)
      ├── #responses slot (duplicated for grid layout)
      ├── #playground slot (hidden)
      └── #code-samples slot (hidden)
```

---

## Custom Component: CustomOASpec

### Location
`docs/.vitepress/theme/components/CustomOASpec.vue`

### Purpose
Wraps multiple `<OAOperation>` components to display all operations from a spec on a single page with custom layout and slots.

### Key Features

#### 1. Operation Extraction

```vue
<script setup lang="ts">
const operations = computed(() => {
  const ops: Array<{
    operationId: string
    method: string
    path: string
    operation: any
  }> = []

  if (!props.spec?.paths) return ops

  for (const [path, pathItem] of Object.entries(props.spec.paths)) {
    const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']

    for (const method of methods) {
      const operation = pathItem[method]
      if (operation && operation.operationId) {
        ops.push({
          operationId: operation.operationId,
          method: method.toUpperCase(),
          path,
          operation
        })
      }
    }
  }

  return ops
})
</script>
```

**Why this matters**: Extracts all operations from the OpenAPI spec to render them as individual `<OAOperation>` components on one page.

#### 2. Custom Header Slot (Critical for Hash Navigation)

```vue
<template #header="{ operation, method, path }">
  <div class="flex flex-col">
    <div class="flex flex-row gap-2"></div>
    <h1 :id="op.operationId" tabindex="-1" class="scroll-m-[var(--vp-nav-height)]">
      {{ operation.summary }}
      <a class="header-anchor header-anchor" :href="`#${op.operationId}`" :aria-label="`Permalink to ${operation.summary}`">​</a>
    </h1>
  </div>
</template>
```

**Critical detail**: `<h1 :id="op.operationId">` uses the `operationId` (e.g., `vendingCheckin`) as the heading ID, **not** the slugified summary text (e.g., `check-in-to-vending-machine`). This ensures sidebar links match heading IDs.

#### 3. Hidden Slots

```vue
<!-- Hide security slot -->
<template #security>
  <!-- Empty -->
</template>

<!-- Hide playground slot -->
<template #playground>
  <!-- Empty -->
</template>

<!-- Hide code samples for clean layout -->
<template #code-samples>
  <!-- Empty -->
</template>
```

**Why**: Keeps the UI clean by removing sections not needed for the documentation.

#### 4. Duplicated Responses Slot

```vue
<template #responses="responsesSlot">
  <!-- Hidden in left column -->
  <div class="custom-responses-left" style="display: none;">
    <OAResponses
      :operation-id="responsesSlot.operationId"
      :responses="responsesSlot.responses"
    />
  </div>

  <!-- Visible in right column via CSS -->
  <div class="custom-responses-right">
    <OAResponses
      :operation-id="responsesSlot.operationId"
      :responses="responsesSlot.responses"
    />
  </div>
</template>
```

**Why duplicate**: CSS grid positioning requires the responses to be in a specific DOM position. We hide the default left-column version and show a copy in the right column.

---

## Hash Navigation Implementation

### Location
`docs/.vitepress/theme/index.ts`

### Problem
VitePress doesn't automatically scroll to hash anchors when clicking sidebar links on the same page (e.g., clicking `/api-reference/vending#vendingOrder` when already on `/api-reference/vending`).

### Solution

```typescript
setup() {
  if (typeof window !== 'undefined') {
    nextTick(() => {
      const scrollToHash = (hash: string, smooth = true) => {
        if (!hash) return

        const element = document.getElementById(hash)
        if (element) {
          const offset = 90 // Offset for fixed header
          const elementPosition = element.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.scrollY - offset

          window.scrollTo({
            top: offsetPosition,
            behavior: smooth ? 'smooth' : 'auto'
          })
        }
      }

      // Intercept all clicks on links
      document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        const link = target.closest('a')

        if (link && link.href) {
          const url = new URL(link.href)
          const currentPath = window.location.pathname

          // Check if it's a hash link to the current page
          if (url.pathname === currentPath && url.hash) {
            e.preventDefault()
            e.stopPropagation()
            e.stopImmediatePropagation()

            const hash = url.hash.slice(1) // Remove #

            // Update URL without reload
            history.pushState(null, '', url.href)

            // Scroll to element
            setTimeout(() => scrollToHash(hash), 50)

            return false
          }
        }
      }, true) // Use capture phase

      // Handle initial hash on page load
      if (window.location.hash) {
        setTimeout(() => {
          scrollToHash(window.location.hash.slice(1), false)
        }, 100)
      }

      // Handle browser back/forward
      window.addEventListener('popstate', () => {
        if (window.location.hash) {
          setTimeout(() => {
            scrollToHash(window.location.hash.slice(1))
          }, 50)
        }
      })
    })
  }
}
```

### How It Works

1. **Click Interception**: Captures all link clicks in the capture phase (before VitePress)
2. **Same-Page Detection**: Checks if the link is to the current page with a different hash
3. **Prevent Default**: Stops VitePress from handling the navigation
4. **Manual Scroll**: Calculates position with header offset and scrolls smoothly
5. **URL Update**: Uses `history.pushState` to update the URL without reload
6. **Popstate Handling**: Supports browser back/forward buttons

---

## 2-Column Grid Layout

### Visual Structure

```
┌─────────────────────────┬─────────────────────────┐
│                         │                         │
│  Description            │  POST /vending/checkin  │
│  (row 1, col 1)         │  (row 1, col 2)         │
│                         │                         │
├─────────────────────────┼─────────────────────────┤
│                         │                         │
│  Request Body           │  Responses              │
│  (row 2, col 1)         │  (row 2, col 2)         │
│                         │                         │
└─────────────────────────┴─────────────────────────┘
```

### CSS Implementation

Located in `docs/.vitepress/theme/components/CustomOASpec.vue`

#### Grid Container

```css
@media (min-width: 640px) {
  .custom-oa-spec .OAPath > .grid.sm\:grid-cols-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto; /* Two rows */
    gap: 1rem 1.5rem;
    align-items: start;
    margin-bottom: 3rem;
  }
}
```

**Key**: Overrides the default 2-column layout to be a 2x2 grid.

#### Display Contents Pattern

```css
.custom-oa-spec .OAPathContentStart {
  display: contents;
}
```

**Why**: `display: contents` makes the wrapper "transparent" so its children participate directly in the parent grid.

#### Grid Positioning

```css
/* Description area: column 1, row 1 */
.custom-oa-spec .OAPathContentStart > div:first-child {
  grid-column: 1;
  grid-row: 1;
}

/* Request Body: column 1, row 2 (bottom left) */
.custom-oa-spec .OAPathContentStart > div:has(h2#request-body) {
  grid-column: 1;
  grid-row: 2;
}

/* Parameters (if exists): column 1, row 2 */
.custom-oa-spec .OAPathContentStart > div:has(h2#parameters) {
  grid-column: 1;
  grid-row: 2;
}

/* Right responses: column 2, row 2 (bottom right) */
.custom-oa-spec .custom-responses-right {
  grid-column: 2;
  grid-row: 2;
  padding-left: 1.5rem;
}

/* Path badge: column 2, row 1 (top right) */
.custom-oa-spec .OAPathContentEnd {
  grid-column: 2;
  grid-row: 1;
  position: static !important;
  padding-left: 1.5rem;
}
```

**Key technique**: Uses `:has()` selector to target containers based on their child heading IDs.

---

## Troubleshooting Guide

### Issue: Sidebar Links Don't Scroll

**Symptoms**: Clicking sidebar items doesn't scroll to the operation or scrolls to the wrong place.

**Diagnosis**:
1. Open browser DevTools (F12)
2. Click a sidebar link
3. Check console for link information (if debugging is enabled)
4. Inspect the heading element and check its `id` attribute
5. Compare the sidebar link hash with the heading ID

**Common Causes**:

1. **ID Mismatch**: Sidebar links use `operationId` but headings use slugified summary
   - **Fix**: Ensure `#header` slot in CustomOASpec uses `:id="op.operationId"`

2. **Hash Navigation Not Working**: JavaScript not intercepting clicks
   - **Fix**: Check that `docs/.vitepress/theme/index.ts` has the `setup()` function with click handler

3. **Wrong Selector**: CSS `:has()` selector not matching elements
   - **Fix**: Use browser DevTools to verify the actual DOM structure

### Issue: Layout Not 2-Column

**Symptoms**: Elements stack vertically instead of appearing in a 2x2 grid.

**Diagnosis**:
1. Inspect the `.OAPath` element
2. Check if `grid-template-columns: 1fr 1fr` is applied
3. Verify `display: contents` on `.OAPathContentStart`

**Common Causes**:

1. **CSS Specificity**: Other styles overriding the grid
   - **Fix**: Add `!important` or increase selector specificity

2. **Screen Size**: Grid only applies at `min-width: 640px`
   - **Fix**: Check browser width or adjust breakpoint

### Issue: Responses in Wrong Column

**Symptoms**: Responses appear in left column instead of right.

**Diagnosis**:
1. Check if `.custom-responses-left` is hidden
2. Verify `.custom-responses-right` has correct grid positioning

**Fix**: Ensure both response divs exist in the `#responses` slot template.

---

## Key Learnings

### 1. vitepress-openapi Architecture

**Library Design**:
- `<OASpec>`: Designed for single-page spec rendering (auto-generates operationId-based headings)
- `<OAOperation>`: Designed for individual operation pages
- `useSidebar()`: Generates sidebar items with links based on `operationId`

**Our Approach**:
- Use `<OAOperation>` multiple times (wrapped in CustomOASpec)
- Override `#header` slot to ensure heading IDs match `operationId`
- Manually handle hash navigation since we're on a single page

### 2. Heading ID Generation

**Critical Insight**: The heading ID **must match** the sidebar link hash exactly.

- **Sidebar link**: `/api-reference/vending#vendingOrder` (uses `operationId`)
- **Heading ID**: `<h1 id="vendingOrder">` (must also use `operationId`)

**Wrong Approach** (causes broken navigation):
```vue
<!-- Uses slugified summary - doesn't match sidebar links -->
<h1 id="create-vending-order">Create Vending Order</h1>
```

**Correct Approach**:
```vue
<!-- Uses operationId - matches sidebar links -->
<h1 :id="op.operationId">{{ operation.summary }}</h1>
```

### 3. CSS Grid with Display Contents

**Pattern**: Use `display: contents` to make wrapper elements "transparent" for grid layout.

```css
.parent {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.wrapper {
  display: contents; /* Children become direct grid items */
}

.wrapper > .child {
  grid-column: 2; /* Can be positioned in parent grid */
}
```

This allows reorganizing DOM elements visually without restructuring the HTML.

### 4. Hash Navigation in Single-Page Apps

**Problem**: VitePress doesn't auto-scroll to hash anchors on the same page.

**Solution Components**:
1. **Click Interception**: Capture phase listener (`addEventListener(..., true)`)
2. **Prevent Default**: Stop VitePress from handling the click
3. **Manual Scroll**: Calculate position with header offset
4. **History Management**: Use `pushState` to update URL
5. **Popstate Handling**: Support back/forward navigation

### 5. Vue Slot Naming

**Important**: Slot names in vitepress-openapi:
- `#header` (not `#heading`) - for the operation title
- `#path` - for the endpoint path badge
- `#description` - for the operation description
- `#parameters` - for parameters section
- `#request-body` - for request body section
- `#responses` - for responses section
- `#security` - for security requirements
- `#playground` - for the API playground
- `#code-samples` - for code examples

Check the TypeScript definitions in `node_modules/vitepress-openapi/dist/types/` to verify available slots.

---

## Future Enhancements

### Potential Improvements

1. **Lazy Loading**: Only render operations when they come into view (performance optimization)
2. **Deep Linking**: Auto-scroll to hash on initial page load
3. **Active Sidebar Highlighting**: Highlight the current operation in the sidebar as you scroll
4. **Sticky Headers**: Keep operation title visible while scrolling through its content
5. **Collapse/Expand**: Add ability to collapse operation sections

### Configuration Options

Consider making these customizable via props:

```vue
<CustomOASpec
  :spec="spec"
  :hide-sections="['security', 'playground', 'code-samples']"
  :layout="'two-column'"
  :enable-hash-navigation="true"
/>
```

---

## References

- [VitePress OpenAPI Documentation](https://vitepress-openapi.vercel.app/)
- [VitePress Documentation](https://vitepress.dev/)
- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.3)
- [CSS Grid Layout Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Vue 3 Slots Documentation](https://vuejs.org/guide/components/slots.html)

---

## Changelog

### 2025-01-14
- Initial implementation of CustomOASpec component
- Added 2-column grid layout with CSS
- Implemented hash navigation handler
- Fixed heading ID mismatch issue
- Created comprehensive documentation

---

**Maintained by**: Perkd Documentation Team
**Last Updated**: 2025-01-14
