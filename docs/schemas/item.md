# Item Schema

Product information for orders, pickups, and callbacks.

## Structure

```typescript
interface Item {
  title: string;           // Required
  sku: string;             // Required
  unitPrice: number;       // Required
  images: string[];        // Required
  quantity?: number;       // Optional (default: 1)
  inventory?: number;      // Optional
  variantId?: string;      // Optional
  options?: Option[];      // Optional
  tags?: string[];         // Optional
}
```

## Fields

### `title` (required)
**Type:** `string`

Product name displayed to customers.

```json
{
  "title": "Coca-Cola Classic"
}
```

**Requirements:**
- Non-empty string
- Clear, descriptive name
- Max 100 characters recommended

---

### `sku` (required)
**Type:** `string`

Stock Keeping Unit - unique identifier for the product.

```json
{
  "sku": "COLA_COKE01"
}
```

**Requirements:**
- Must be unique across your catalog
- Alphanumeric and underscores/hyphens
- Case-sensitive
- Must match Shopify variant SKU (if applicable)

::: tip SKU Best Practices
Use a consistent naming scheme:
- `CATEGORY_BRAND_SIZE` (e.g., `COLA_COKE_330ML`)
- `BRAND_PRODUCT_VARIANT` (e.g., `NESTLE_KIT KAT_ORIGINAL`)
:::

---

### `unitPrice` (required)
**Type:** `number`

Price per unit in local currency.

```json
{
  "unitPrice": 3.50
}
```

**Requirements:**
- Must be positive (≥ 0 for free items)
- Up to 2 decimal places
- In local currency (MYR, SGD, etc.)
- Excludes tax (tax calculated separately)

---

### `images` (required)
**Type:** `string[]`

Array of product image URLs.

```json
{
  "images": [
    "https://cdn.shopify.com/s/files/1/0726/1008/7230/products/coke.jpg",
    "https://cdn.shopify.com/s/files/1/0726/1008/7230/products/coke-2.jpg"
  ]
}
```

**Requirements:**
- At least one image required
- Publicly accessible URLs
- HTTPS recommended
- Formats: JPG, PNG, WebP
- Recommended size: 800x800px
- Max file size: 2MB per image
- First image is primary/main image

---

### `quantity` (optional)
**Type:** `number` (default: 1)

Quantity of this item.

```json
{
  "quantity": 2
}
```

**Requirements:**
- Positive integer
- Must not exceed `inventory` if specified
- Default is 1 if omitted

---

### `inventory` (optional)
**Type:** `number`

Available stock count.

```json
{
  "inventory": 10
}
```

**Usage:**
- Perkd validates `quantity` ≤ `inventory`
- Helps prevent out-of-stock orders
- Not decremented by Perkd (you manage stock)

---

### `variantId` (optional)
**Type:** `string`

Shopify variant ID.

```json
{
  "variantId": "899678900007"
}
```

**Usage:**
- Links to Shopify product variant
- Used for order sync with Shopify
- Required if using Shopify integration

---

### `options` (optional)
**Type:** `Option[]`

Customization options for the item.

```json
{
  "options": [
    {
      "key": "temperature",
      "title": "Temperature",
      "required": true,
      "min": 1,
      "max": 1,
      "type": "radioboxList",
      "values": [
        { "title": "Heat Up", "price": 0 },
        { "title": "Serve Chilled", "price": 0 }
      ]
    }
  ]
}
```

See [Option Schema](/schemas/option) for complete structure.

**Use Cases:**
- Temperature (hot/cold)
- Size (small/medium/large)
- Add-ons (extra sauce, toppings)
- Preparation method

---

### `tags` (optional)
**Type:** `string[]`

Categorization tags.

```json
{
  "tags": ["beverage", "carbonated", "cold"]
}
```

**Usage:**
- Product categorization
- Search and filtering
- Analytics and reporting

## Complete Examples

### Simple Item

```json
{
  "title": "Coca-Cola Classic",
  "sku": "COLA_COKE01",
  "unitPrice": 3.00,
  "quantity": 1,
  "inventory": 10,
  "images": ["https://cdn.shopify.com/.../coke.jpg"]
}
```

### Item with Options

```json
{
  "title": "Mushroom Max",
  "sku": "MMT890",
  "unitPrice": 5.90,
  "quantity": 1,
  "inventory": 10,
  "images": ["https://cdn.shopify.com/.../mushroom.jpg"],
  "options": [
    {
      "key": "temperature",
      "title": "Temperature",
      "required": true,
      "min": 1,
      "max": 1,
      "type": "radioboxList",
      "values": [
        { "title": "Heat Up", "price": 0 },
        { "title": "Serve Chilled", "price": 0 }
      ]
    },
    {
      "key": "size",
      "title": "Size",
      "required": false,
      "min": 0,
      "max": 1,
      "type": "radioboxList",
      "values": [
        { "title": "Regular", "price": 0 },
        { "title": "Large", "price": 2.00 }
      ]
    }
  ],
  "tags": ["food", "ready-to-eat", "popular"]
}
```

### Free Sample

```json
{
  "title": "Energy Drink Sample",
  "sku": "SAMPLE_ENERGY01",
  "unitPrice": 0,
  "quantity": 1,
  "images": ["https://cdn.shopify.com/.../sample.jpg"],
  "tags": ["sample", "beverage", "promotional"]
}
```

## Callback Structure

In callbacks, items may include selected options:

```json
{
  "title": "Mushroom Max",
  "sku": "MMT890",
  "unitPrice": 5.90,
  "quantity": 1,
  "images": ["https://cdn.shopify.com/.../mushroom.jpg"],
  "options": [
    {
      "key": "temperature",
      "title": "Temperature",
      "values": [
        {
          "title": "Heat Up",
          "price": 0,
          "quantity": 1
        }
      ]
    }
  ]
}
```

::: tip Option Values in Callbacks
In callbacks, `option.values` contains only the selected choices with their quantities.
:::

## Validation

### SKU Uniqueness

```javascript
function validateItems(items) {
  const skus = new Set();

  for (const item of items) {
    if (skus.has(item.sku)) {
      throw new Error(`Duplicate SKU: ${item.sku}`);
    }
    skus.add(item.sku);
  }
}
```

### Price Validation

```javascript
function validatePrice(price) {
  if (price < 0) {
    throw new Error('Price cannot be negative');
  }

  // Check decimal places
  const decimals = (price.toString().split('.')[1] || '').length;
  if (decimals > 2) {
    throw new Error('Price can have max 2 decimal places');
  }

  return true;
}
```

### Inventory Check

```javascript
function validateQuantity(item) {
  if (item.quantity < 1) {
    throw new Error('Quantity must be at least 1');
  }

  if (item.inventory && item.quantity > item.inventory) {
    throw new Error(`Insufficient stock for ${item.title}`);
  }
}
```

## Related Schemas

- [Option Schema](/schemas/option) - Item customization options
- [Order Schema](/schemas/order) - Payment and transaction details
