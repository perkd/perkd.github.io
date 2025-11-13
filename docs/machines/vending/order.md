# Order - Vending

Create purchase orders for immediate checkout and payment.

## Overview

The Order action allows customers to:
1. View selected items and pricing
2. Complete payment in the Perkd app
3. Receive confirmation to dispense items

## Use Cases

- **Standard Purchase** - Customer selects items → scans → pays
- **Quick Checkout** - Fast payment with saved cards
- **Item Customization** - Support item options (temperature, size, etc.)
- **Multi-Item Orders** - Multiple products in single transaction

## Generate Order QR

### Endpoint

```
POST /Actions/vending
```

### Request

**Headers:**
```http
x-api-key: YOUR_API_KEY
Content-Type: application/json
```

**Body:**
```json
{
  "action": "order",
  "machineId": "machine-001",
  "items": [
    {
      "title": "Coke",
      "sku": "COLA_COKE01",
      "unitPrice": 3.00,
      "quantity": 1,
      "inventory": 10,
      "images": ["https://cdn.shopify.com/.../coke.jpg"]
    }
  ],
  "referenceId": "order-12345"
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | string | Yes | Must be `"order"` |
| `machineId` | string | Yes | Unique machine identifier |
| `items` | Item[] | Yes | Array of items to purchase |
| `referenceId` | string | No | Order ID for tracking |

### Item Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Product name |
| `sku` | string | Yes | Stock keeping unit (unique ID) |
| `unitPrice` | number | Yes | Price per unit |
| `quantity` | number | No | Quantity (default: 1) |
| `inventory` | number | No | Available stock (for validation) |
| `images` | string[] | Yes | Product image URLs |
| `variantId` | string | No | Shopify variant ID (if applicable) |
| `options` | Option[] | No | Item customization options |

See [Item Schema](/schemas/item) for complete structure.

### Response

```json
{
  "uri": "https://app.perkd.me/64633389e1788b003a234a3b?p=AlTJD..."
}
```

## Callback

When customer completes payment, Perkd sends:

### Endpoint (Your Server)

```
POST {your_callback_url}/perkd/order/{machineId}
```

### Payload

```json
{
  "status": "success",
  "items": [
    {
      "title": "Coke",
      "sku": "COLA_COKE01",
      "unitPrice": 3.00,
      "quantity": 1,
      "images": ["https://cdn.../coke.jpg"]
    }
  ],
  "referenceId": "order-12345"
}
```

### Response (Your Server)

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "received": true
}
```

## Callback Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | `"success"` or `"fail"` |
| `items` | Item[] | Items purchased (same as request) |
| `referenceId` | string | Echoed from request |

## Implementation Example

### 1. Generate Order QR

```javascript
async function createOrder(machineId, items) {
  const referenceId = `order-${Date.now()}`;

  const response = await fetch('https://api.perkd.io/prod/Actions/vending', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.PERKD_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'order',
      machineId,
      items,
      referenceId
    })
  });

  const { uri } = await response.json();
  return { uri, referenceId };
}
```

### 2. Display Order QR

```javascript
import QRCode from 'qrcode';

const items = [
  {
    title: 'Coke',
    sku: 'COLA_COKE01',
    unitPrice: 3.00,
    quantity: 1,
    inventory: 10,
    images: ['https://example.com/coke.jpg']
  },
  {
    title: 'Sprite',
    sku: 'SPRITE_01',
    unitPrice: 3.00,
    quantity: 2,
    inventory: 15,
    images: ['https://example.com/sprite.jpg']
  }
];

const { uri, referenceId } = await createOrder('machine-001', items);
const qrImage = await QRCode.toDataURL(uri);

displayOnScreen({
  qr: qrImage,
  total: items.reduce((sum, item) =>
    sum + (item.unitPrice * item.quantity), 0
  ),
  message: 'Scan to pay'
});

// Store pending order
pendingOrders.set(referenceId, { items, timestamp: Date.now() });
```

### 3. Handle Callback

```javascript
app.post('/perkd/order/:machineId', async (req, res) => {
  const { machineId } = req.params;
  const { status, items, referenceId } = req.body;

  console.log(`Order callback: ${status} for ${referenceId}`);

  if (status === 'success') {
    // Payment successful - dispense items
    await dispenseItems(machineId, items);
    await updateInventory(items);
    showMessage('Thank you! Dispensing items...');
  } else {
    // Payment failed
    showError('Payment failed. Items returned to stock.');
  }

  // Clean up pending order
  pendingOrders.delete(referenceId);

  // Acknowledge
  res.status(200).json({ received: true });
});
```

## Item Customization with Options

### Items with Options

```json
{
  "action": "order",
  "machineId": "machine-001",
  "items": [
    {
      "title": "Mushroom Max",
      "sku": "MMT890",
      "unitPrice": 5.90,
      "quantity": 1,
      "images": ["https://cdn.../mushroom.jpg"],
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
  ]
}
```

### Callback with Selected Options

```json
{
  "status": "success",
  "items": [
    {
      "title": "Mushroom Max",
      "sku": "MMT890",
      "unitPrice": 5.90,
      "quantity": 1,
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
  ]
}
```

See [Option Schema](/schemas/option) for complete option structure.

## Complete Example

```javascript
// vending-machine.js
import express from 'express';
import QRCode from 'qrcode';

const app = express();
app.use(express.json());

const pendingOrders = new Map();

// Customer selects items on machine
function selectItems() {
  return [
    {
      title: 'Coke',
      sku: 'COLA_COKE01',
      unitPrice: 3.00,
      quantity: 1,
      inventory: 10,
      images: ['https://example.com/coke.jpg']
    }
  ];
}

// Generate order QR
async function checkout(machineId, items) {
  const referenceId = `order-${Date.now()}-${machineId}`;

  const response = await fetch('https://api.perkd.io/prod/Actions/vending', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.PERKD_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'order',
      machineId,
      items,
      referenceId
    })
  });

  if (!response.ok) {
    throw new Error('Failed to create order');
  }

  const { uri } = await response.json();

  // Display QR
  const qrImage = await QRCode.toDataURL(uri);
  const total = items.reduce(
    (sum, item) => sum + (item.unitPrice * item.quantity),
    0
  );

  displayOnScreen({
    qr: qrImage,
    items: items.map(i => `${i.quantity}x ${i.title}`),
    total: `$${total.toFixed(2)}`,
    message: 'Scan to complete payment'
  });

  // Store pending order
  pendingOrders.set(referenceId, {
    items,
    timestamp: Date.now()
  });

  // Timeout after 5 minutes
  setTimeout(() => {
    if (pendingOrders.has(referenceId)) {
      pendingOrders.delete(referenceId);
      returnToIdle();
    }
  }, 5 * 60 * 1000);

  return referenceId;
}

// Receive payment callback
app.post('/perkd/order/:machineId', async (req, res) => {
  const { machineId } = req.params;
  const { status, items, referenceId } = req.body;

  // Validate order exists
  const pendingOrder = pendingOrders.get(referenceId);
  if (!pendingOrder) {
    console.warn('Received callback for unknown order:', referenceId);
    return res.status(200).json({ received: true });
  }

  if (status === 'success') {
    console.log(`✅ Payment successful for ${referenceId}`);

    // Dispense items
    for (const item of items) {
      await dispenseProduct(machineId, item.sku, item.quantity);

      // Handle options if present
      if (item.options) {
        await applyOptions(item.sku, item.options);
      }
    }

    // Update inventory
    await updateInventory(items);

    showMessage('Thank you! Please collect your items.');
  } else {
    console.log(`❌ Payment failed for ${referenceId}`);
    showError('Payment was not successful. Please try again.');
  }

  // Clean up
  pendingOrders.delete(referenceId);

  // Acknowledge receipt
  res.status(200).json({ received: true });
});

app.listen(3000);
```

## Best Practices

### 1. Validate Inventory

Check stock before generating QR:

```javascript
function checkInventory(items) {
  for (const item of items) {
    const stock = getStock(item.sku);
    if (stock < item.quantity) {
      throw new Error(`Insufficient stock for ${item.title}`);
    }
  }
}
```

### 2. Handle Timeouts

Cancel orders after timeout:

```javascript
const ORDER_TIMEOUT = 5 * 60 * 1000; // 5 minutes

setTimeout(() => {
  if (pendingOrders.has(referenceId)) {
    pendingOrders.delete(referenceId);
    returnItemsToStock(items);
    showMessage('Order cancelled due to timeout');
  }
}, ORDER_TIMEOUT);
```

### 3. Implement Idempotency

Handle duplicate callbacks:

```javascript
const processedOrders = new Set();

app.post('/perkd/order/:machineId', (req, res) => {
  const { referenceId } = req.body;

  if (processedOrders.has(referenceId)) {
    console.log('Duplicate callback, ignoring');
    return res.status(200).json({ received: true });
  }

  // Process order
  processOrder(req.body);
  processedOrders.add(referenceId);

  res.status(200).json({ received: true });
});
```

### 4. Reserve Stock

Reserve items when generating QR:

```javascript
async function createOrder(machineId, items) {
  // Reserve inventory
  await reserveStock(items);

  try {
    const { uri, referenceId } = await generateOrderQR(machineId, items);
    return { uri, referenceId };
  } catch (error) {
    // Release on error
    await releaseStock(items);
    throw error;
  }
}
```

## Error Handling

### Insufficient Stock

```javascript
try {
  checkInventory(items);
  await checkout(machineId, items);
} catch (error) {
  if (error.message.includes('Insufficient stock')) {
    showError('Sorry, item out of stock. Please make another selection.');
  }
}
```

### Payment Failure

```javascript
app.post('/perkd/order/:machineId', (req, res) => {
  if (req.body.status === 'fail') {
    logPaymentFailure(req.body);
    showError('Payment failed. Please try another payment method.');
  }
  res.status(200).json({ received: true });
});
```

## Next Steps

- [Pickup Action](/machines/vending/pickup) - Handle pre-ordered item pickup
- [Pay Action](/machines/vending/pay) - Standalone payment collection
- [Callbacks Reference](/machines/callbacks/order) - Detailed callback spec
- [Item Schema](/schemas/item) - Complete item object definition
- [Option Schema](/schemas/option) - Item customization options
