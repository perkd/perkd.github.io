# Data Schemas

Reference for all data structures used in the Perkd Partner API.

## Overview

All schemas use JSON format with consistent field naming and types.

## Core Schemas

### [Order](/schemas/order)
Payment and transaction details

```json
{
  "currency": "MYR",
  "amount": 20,
  "taxAmount": 1.20
}
```

### [Item](/schemas/item)
Product information for orders and pickups

```json
{
  "title": "Coke",
  "sku": "COLA_COKE01",
  "unitPrice": 3.00,
  "quantity": 1,
  "inventory": 10,
  "images": ["https://cdn.../coke.jpg"]
}
```

### [Option](/schemas/option)
Item customization (temperature, size, etc.)

```json
{
  "key": "temperature",
  "title": "Temperature",
  "required": true,
  "values": [
    { "title": "Heat Up", "price": 0 },
    { "title": "Serve Chilled", "price": 0 }
  ]
}
```

### [Person](/schemas/person)
Customer profile information

```json
{
  "familyName": "Lee",
  "givenName": "Michelle",
  "fullName": "Michelle Lee",
  "gender": "f",
  "birthDate": "1988-11-11",
  "profileImageUrl": "https://..."
}
```

### [Membership](/schemas/membership)
Loyalty card and tier information

```json
{
  "cardNumber": "IGTEST000194",
  "tier": 1,
  "startTime": "2023-05-05T01:07:58.846Z",
  "endTime": "2024-06-08T15:59:59.999Z",
  "cardImageUrl": "https://..."
}
```

## Field Types

| Type | Description | Example |
|------|-------------|---------|
| `string` | Text value | `"Coke"` |
| `number` | Numeric value (integer or decimal) | `3.00`, `10` |
| `boolean` | True or false | `true`, `false` |
| `array` | List of values | `["url1", "url2"]` |
| `object` | Nested structure | `{ "key": "value" }` |
| `datetime` | ISO 8601 timestamp | `"2023-05-05T01:07:58.846Z"` |

## Required vs Optional

- **Required** fields must be included in requests
- **Optional** fields can be omitted

## Validation Rules

### String Fields
- Empty strings are treated as missing
- Whitespace is trimmed
- Maximum length varies by field

### Numeric Fields
- Must be positive for prices and amounts
- Support up to 2 decimal places for currency
- Integers for quantities and counts

### Arrays
- Cannot be empty if required
- Items must match specified type
- Order may be significant (e.g., images)

### URLs
- Must be publicly accessible
- HTTPS strongly recommended
- Must return appropriate content type

## Common Patterns

### Currency Amounts

Always specify currency with amount:

```json
{
  "currency": "MYR",
  "amount": 20
}
```

Supported currencies: MYR, SGD, USD

### Images

Provide as array of URLs:

```json
{
  "images": [
    "https://cdn.example.com/product-main.jpg",
    "https://cdn.example.com/product-alt.jpg"
  ]
}
```

Requirements:
- Publicly accessible URLs
- Image formats: JPG, PNG, WebP
- Recommended size: 800x800px
- Max file size: 2MB

### Timestamps

Use ISO 8601 format:

```json
{
  "startTime": "2023-05-05T01:07:58.846Z",
  "endTime": "2024-06-08T15:59:59.999Z"
}
```

## Next Steps

Explore each schema in detail:

- [Order Schema](/schemas/order) - Payment and transaction details
- [Item Schema](/schemas/item) - Product information
- [Option Schema](/schemas/option) - Item customizations
- [Person Schema](/schemas/person) - Customer profiles
- [Membership Schema](/schemas/membership) - Loyalty information
