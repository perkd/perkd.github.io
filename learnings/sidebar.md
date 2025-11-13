# VitePress OpenAPI Sidebar Configuration Guide

This document explains how the sidebar navigation works for the Perkd Partner API documentation, including automatic generation from OpenAPI specs and the relationship with hash navigation.

## Table of Contents

- [Overview](#overview)
- [Sidebar Generation](#sidebar-generation)
- [Configuration Structure](#configuration-structure)
- [How Links Are Generated](#how-links-are-generated)
- [Sidebar-Content Relationship](#sidebar-content-relationship)
- [Troubleshooting](#troubleshooting)
- [Key Insights](#key-insights)

---

## Overview

### What We're Building

A sidebar that:
1. **Auto-generates** from OpenAPI specifications
2. **Groups operations** by API category (Vending, Kiosk, Callbacks, Payment)
3. **Links to hash anchors** on single-page documentation (not separate pages)
4. **Maintains sync** with the actual content headings

### Example Structure

```
API Reference
├── Overview
├── Vending API (/api-reference/vending)
│   ├── Check In to Vending Machine (#vendingCheckin)
│   ├── Create Vending Order (#vendingOrder)
│   ├── Confirm Item Pickup (#vendingPickup)
│   └── Process Payment (#vendingPay)
├── Kiosk API (/api-reference/kiosk)
│   └── Create Kiosk Order (#kioskOrder)
├── Callbacks API (/api-reference/callbacks)
│   ├── Check In Callback (#callbackCheckin)
│   ├── Order Callback (#callbackOrder)
│   └── ...
└── Payment API (/api-reference/payment)
    ├── Commit Payment (#paymentCommit)
    └── Cancel Payment (#paymentCancel)
```

---

## Sidebar Generation

### Location
`docs/.vitepress/config.ts`

### The `useSidebar()` Function

The `useSidebar()` composable from vitepress-openapi automatically generates sidebar items from OpenAPI specs.

```typescript
import { useSidebar } from 'vitepress-openapi'
import vendingSpec from '../specs/vending-api.json'
import kioskSpec from '../specs/kiosk-api.json'
import callbacksSpec from '../specs/callbacks-api.json'
import paymentSpec from '../specs/payment-api.json'

// Generate sidebar items for each API with hash-anchor links
const vendingSidebar = useSidebar({
  spec: vendingSpec,
  linkPrefix: '/api-reference/vending#'
})

const kioskSidebar = useSidebar({
  spec: kioskSpec,
  linkPrefix: '/api-reference/kiosk#'
})

const callbacksSidebar = useSidebar({
  spec: callbacksSpec,
  linkPrefix: '/api-reference/callbacks#'
})

const paymentSidebar = useSidebar({
  spec: paymentSpec,
  linkPrefix: '/api-reference/payment#'
})
```

### Key Parameters

#### `spec` (required)
The OpenAPI 3.0 specification object.

**Example**:
```json
{
  "openapi": "3.0.3",
  "info": { "title": "Vending API", "version": "1.0.0" },
  "paths": {
    "/vending/checkin": {
      "post": {
        "operationId": "vendingCheckin",
        "summary": "Check In to Vending Machine",
        "tags": ["Vending"]
      }
    }
  }
}
```

#### `linkPrefix` (required)
The URL prefix for all generated links. This determines the page path and enables hash navigation.

**Format**: `/path/to/page#` (note the `#` at the end)

**Examples**:
- `/api-reference/vending#` → generates links like `/api-reference/vending#vendingCheckin`
- `/operations/` → generates links like `/operations/vendingCheckin` (separate pages)

**Critical**: The `#` suffix tells the library to generate hash anchors instead of separate page routes.

---

## Configuration Structure

### Complete Sidebar Config

```typescript
export default withMermaid(defineConfig({
  // ... other config

  themeConfig: {
    sidebar: {
      '/api-reference/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api-reference/' }
          ]
        },
        {
          text: 'Vending API',
          link: '/api-reference/vending',
          collapsed: false,
          items: vendingSidebar.generateSidebarGroup({
            tag: 'Vending'
          }).items || []
        },
        {
          text: 'Kiosk API',
          link: '/api-reference/kiosk',
          collapsed: false,
          items: kioskSidebar.generateSidebarGroup({
            tag: 'Kiosk'
          }).items || []
        },
        {
          text: 'Callbacks API',
          link: '/api-reference/callbacks',
          collapsed: false,
          items: callbacksSidebar.generateSidebarGroup({
            tag: 'Callbacks'
          }).items || []
        },
        {
          text: 'Payment API',
          link: '/api-reference/payment',
          collapsed: false,
          items: paymentSidebar.generateSidebarGroup({
            tag: 'Payment'
          }).items || []
        }
      ]
    }
  }
}))
```

### Breakdown

#### Sidebar Group Structure

```typescript
{
  text: 'Vending API',           // Group heading
  link: '/api-reference/vending', // Click goes to this page
  collapsed: false,               // Expanded by default
  items: [...]                    // Auto-generated operation links
}
```

#### `generateSidebarGroup()` Method

```typescript
vendingSidebar.generateSidebarGroup({
  tag: 'Vending'  // Filter operations by this tag
})
```

**What it returns**:
```javascript
{
  text: 'Vending',
  items: [
    {
      text: 'Check In to Vending Machine',
      link: '/api-reference/vending#vendingCheckin'
    },
    {
      text: 'Create Vending Order',
      link: '/api-reference/vending#vendingOrder'
    },
    // ...
  ]
}
```

**Key**: The `items` array is extracted with `.items || []` fallback.

---

## How Links Are Generated

### Link Generation Flow

```
OpenAPI Spec
    ↓
operationId: "vendingCheckin"
    ↓
linkPrefix: "/api-reference/vending#"
    ↓
Generated Link: "/api-reference/vending#vendingCheckin"
```

### OpenAPI Operation → Sidebar Item Mapping

**OpenAPI Spec**:
```json
{
  "/vending/checkin": {
    "post": {
      "operationId": "vendingCheckin",
      "summary": "Check In to Vending Machine",
      "tags": ["Vending"]
    }
  }
}
```

**Generated Sidebar Item**:
```javascript
{
  text: "Check In to Vending Machine",  // From 'summary'
  link: "/api-reference/vending#vendingCheckin"  // From linkPrefix + operationId
}
```

### Why `operationId` Matters

The `operationId` is used for:
1. **Link hash generation**: `/api-reference/vending#vendingCheckin`
2. **Heading ID in content**: `<h1 id="vendingCheckin">`
3. **Hash navigation target**: Links scroll to element with matching ID

**If `operationId` is missing** from the OpenAPI spec, the operation won't be included in the sidebar.

---

## Sidebar-Content Relationship

### The Critical Link

For hash navigation to work, **sidebar link hashes must match content heading IDs**.

```
Sidebar Link                Content Heading
    ↓                            ↓
#vendingCheckin  ←─ MUST MATCH ─→  <h1 id="vendingCheckin">
```

### Example Flow

1. **User clicks** "Create Vending Order" in sidebar
2. **Browser navigates** to `/api-reference/vending#vendingOrder`
3. **Hash navigation handler** intercepts the click
4. **JavaScript finds** element with `id="vendingOrder"`
5. **Page scrolls** to that element

### Common Mismatch Problem

❌ **Wrong** (causes broken navigation):

```vue
<!-- Sidebar link -->
/api-reference/vending#vendingOrder

<!-- Content heading uses slugified summary -->
<h1 id="create-vending-order">Create Vending Order</h1>

<!-- Hash 'vendingOrder' doesn't match ID 'create-vending-order' -->
<!-- Navigation fails! -->
```

✅ **Correct**:

```vue
<!-- Sidebar link -->
/api-reference/vending#vendingOrder

<!-- Content heading uses operationId -->
<h1 id="vendingOrder">Create Vending Order</h1>

<!-- Hash matches ID exactly -->
<!-- Navigation works! -->
```

### How We Ensure Match

In `CustomOASpec.vue`:

```vue
<template #header="{ operation, method, path }">
  <h1 :id="op.operationId" tabindex="-1">
    {{ operation.summary }}
    <a class="header-anchor" :href="`#${op.operationId}`">​</a>
  </h1>
</template>
```

**Key**: `:id="op.operationId"` ensures the heading ID matches what the sidebar expects.

---

## Troubleshooting

### Issue: Sidebar Items Not Showing

**Symptoms**: Some or all operations missing from sidebar.

**Diagnosis**:
```bash
# Check the OpenAPI spec
cat docs/specs/vending-api.json | jq '.paths'

# Look for operationId in each operation
cat docs/specs/vending-api.json | jq '.paths[].post.operationId'
```

**Common Causes**:

1. **Missing `operationId`**
   ```json
   // ❌ Wrong - no operationId
   {
     "/vending/checkin": {
       "post": {
         "summary": "Check In",
         "tags": ["Vending"]
       }
     }
   }
   ```

   ```json
   // ✅ Correct - has operationId
   {
     "/vending/checkin": {
       "post": {
         "operationId": "vendingCheckin",
         "summary": "Check In",
         "tags": ["Vending"]
       }
     }
   }
   ```

2. **Wrong tag filter**
   ```typescript
   // If operation has tag "Vending" but you filter by "VendingAPI"
   vendingSidebar.generateSidebarGroup({
     tag: 'VendingAPI'  // ❌ Doesn't match "Vending" in spec
   })
   ```

3. **Spec not imported**
   ```typescript
   // ❌ Forgot to import
   const vendingSidebar = useSidebar({
     spec: undefined,  // No spec!
     linkPrefix: '/api-reference/vending#'
   })
   ```

### Issue: Wrong Sidebar Link Format

**Symptoms**: Clicking sidebar goes to separate page or 404 instead of scrolling.

**Diagnosis**: Inspect the link in browser DevTools.

**Common Causes**:

1. **Missing `#` in linkPrefix**
   ```typescript
   // ❌ Wrong - links to separate pages
   linkPrefix: '/api-reference/vending/'
   // Generates: /api-reference/vending/vendingCheckin

   // ✅ Correct - links to hash anchors
   linkPrefix: '/api-reference/vending#'
   // Generates: /api-reference/vending#vendingCheckin
   ```

2. **Wrong path in linkPrefix**
   ```typescript
   // ❌ Wrong - page doesn't exist
   linkPrefix: '/api/vending#'

   // ✅ Correct - matches actual page
   linkPrefix: '/api-reference/vending#'
   ```

### Issue: Sidebar Shows But Navigation Doesn't Work

**Symptoms**: Sidebar displays correctly, clicking items updates URL but doesn't scroll.

**Diagnosis**:
1. Click a sidebar item
2. Check URL changes to `#operationId`
3. Open DevTools console
4. Look for the element: `document.getElementById('vendingOrder')`
5. If it returns `null`, heading ID doesn't match

**Solutions**:

1. **Check heading IDs** in CustomOASpec:
   ```vue
   <!-- Must use op.operationId -->
   <h1 :id="op.operationId">...</h1>
   ```

2. **Verify hash navigation handler** is registered in `theme/index.ts`

3. **Check for JavaScript errors** in console

---

## Key Insights

### 1. Single-Page vs Multi-Page Architecture

**Multi-Page** (vitepress-openapi default):
```typescript
// Each operation gets its own page
linkPrefix: '/operations/'
// Generates: /operations/vendingCheckin, /operations/vendingOrder, etc.
```

**Single-Page** (our approach):
```typescript
// All operations on one page with hash anchors
linkPrefix: '/api-reference/vending#'
// Generates: /api-reference/vending#vendingCheckin, #vendingOrder, etc.
```

### 2. The `#` Suffix Magic

The `#` at the end of `linkPrefix` is what tells vitepress-openapi to generate hash anchors instead of page paths.

```typescript
linkPrefix: '/api-reference/vending#'  // Hash mode
linkPrefix: '/api-reference/vending/'  // Page mode
```

### 3. Tag-Based Filtering

Operations are grouped by tags in the OpenAPI spec:

```json
{
  "paths": {
    "/vending/checkin": {
      "post": {
        "tags": ["Vending"],  // ← This tag
        "operationId": "vendingCheckin"
      }
    }
  }
}
```

```typescript
// Only shows operations with tag "Vending"
generateSidebarGroup({ tag: 'Vending' })
```

**Best Practice**: Use consistent, singular tag names (e.g., `"Vending"` not `"Vending APIs"`).

### 4. Sidebar State Management

```typescript
collapsed: false  // Expand by default
collapsed: true   // Collapse by default
```

For API documentation, we use `false` to show all operations immediately.

### 5. Fallback Pattern

Always use the `|| []` fallback:

```typescript
items: vendingSidebar.generateSidebarGroup({
  tag: 'Vending'
}).items || []  // ← Prevents errors if no operations found
```

Without this, VitePress may crash if `items` is `undefined`.

---

## Advanced Patterns

### Multiple Tags in One Group

```typescript
// Show operations from multiple tags
const combinedItems = [
  ...vendingSidebar.generateSidebarGroup({ tag: 'Vending' }).items,
  ...vendingSidebar.generateSidebarGroup({ tag: 'Payment' }).items
]

{
  text: 'Vending & Payment',
  items: combinedItems
}
```

### Collapsible Groups

```typescript
{
  text: 'Vending API',
  collapsed: true,  // Collapsed by default
  items: vendingSidebar.generateSidebarGroup({
    tag: 'Vending'
  }).items || []
}
```

Users can click to expand/collapse the group.

### Custom Sidebar Items

Mix auto-generated and manual items:

```typescript
{
  text: 'API Reference',
  items: [
    { text: 'Overview', link: '/api-reference/' },  // Manual
    { text: 'Getting Started', link: '/api-reference/getting-started' },  // Manual
    ...vendingSidebar.generateSidebarGroup({ tag: 'Vending' }).items  // Auto-generated
  ]
}
```

### Nested Groups

```typescript
{
  text: 'APIs',
  items: [
    {
      text: 'Machine APIs',
      items: [
        { text: 'Vending', link: '/api-reference/vending' },
        { text: 'Kiosk', link: '/api-reference/kiosk' }
      ]
    },
    {
      text: 'Integration APIs',
      items: [
        { text: 'Callbacks', link: '/api-reference/callbacks' },
        { text: 'Payment', link: '/api-reference/payment' }
      ]
    }
  ]
}
```

---

## Maintenance Guide

### Adding a New API

1. **Create OpenAPI spec**:
   ```bash
   # Create new spec file
   touch docs/specs/new-api.json
   ```

2. **Import in config**:
   ```typescript
   import newSpec from '../specs/new-api.json'

   const newSidebar = useSidebar({
     spec: newSpec,
     linkPrefix: '/api-reference/new#'
   })
   ```

3. **Add to sidebar config**:
   ```typescript
   {
     text: 'New API',
     link: '/api-reference/new',
     collapsed: false,
     items: newSidebar.generateSidebarGroup({
       tag: 'NewAPI'
     }).items || []
   }
   ```

4. **Create documentation page**:
   ```bash
   # Create new markdown file
   touch docs/api-reference/new.md
   ```

   ```markdown
   # New API Reference

   <CustomOASpec :spec="spec" />

   <script setup>
   import spec from '../specs/new-api.json'
   </script>
   ```

### Updating Operation Titles

To change how an operation appears in the sidebar, update the `summary` in the OpenAPI spec:

```json
{
  "operationId": "vendingCheckin",
  "summary": "Check In to Vending Machine",  // ← This becomes sidebar text
  "description": "Initiates a session..."
}
```

**Don't change `operationId`** unless you also update:
- The heading ID in CustomOASpec
- Any internal references to that operation

### Reordering Operations

Operations appear in the order they're defined in the OpenAPI spec's `paths` object.

To reorder, restructure the spec:

```json
{
  "paths": {
    "/vending/checkin": { ... },   // First in sidebar
    "/vending/order": { ... },     // Second
    "/vending/pickup": { ... }     // Third
  }
}
```

---

## Performance Considerations

### Build Time

Sidebar generation happens at build time, not runtime. Each `useSidebar()` call parses the entire spec.

**Impact**: Negligible for typical API specs (< 100 operations).

**Optimization**: Not needed for most projects.

### Runtime

Sidebar rendering is handled by VitePress. No special optimizations needed.

### Large Specs

For very large specs (> 500 operations):

1. **Split by tags**: Create separate sidebar instances for different tag groups
2. **Use collapsed groups**: Reduce initial DOM size
3. **Consider multi-page**: Use separate pages per operation instead of hash anchors

---

## Testing Checklist

When updating sidebar configuration:

- [ ] All operations appear in sidebar
- [ ] Sidebar text matches operation summaries
- [ ] Links use hash anchors (contain `#`)
- [ ] Clicking sidebar items scrolls to correct content
- [ ] URL updates when clicking sidebar items
- [ ] Browser back/forward works correctly
- [ ] Deep linking works (sharing URL with hash)
- [ ] Sidebar groups expand/collapse properly (if using `collapsed`)
- [ ] No console errors
- [ ] Build succeeds without warnings

---

## References

- [vitepress-openapi useSidebar API](https://vitepress-openapi.vercel.app/sidebar/sidebar-items.html)
- [VitePress Sidebar Configuration](https://vitepress.dev/reference/default-theme-sidebar)
- [OpenAPI 3.0 Tags](https://spec.openapis.org/oas/v3.0.3#tag-object)
- [OpenAPI 3.0 Operation Object](https://spec.openapis.org/oas/v3.0.3#operation-object)

---

## Related Documentation

- [Custom Slots Implementation](./customslots.md) - Companion guide for CustomOASpec component
- [Hash Navigation](./customslots.md#hash-navigation-implementation) - How click handling works

---

**Maintained by**: Perkd Documentation Team
**Last Updated**: 2025-01-14
