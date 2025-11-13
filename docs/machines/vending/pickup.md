# Pickup - Vending

Dispense pre-ordered or sample items to customers.

## Overview

The Pickup action allows customers to collect:
- Pre-ordered items from in-app purchases
- Sample products
- Loyalty rewards
- Pre-paid items

## Use Cases

- **In-App Orders** - Customer orders in app, picks up at machine
- **Sample Redemption** - Free samples from marketing campaigns
- **Loyalty Rewards** - Tier-based or promotional items
- **Pre-Paid Collections** - Items purchased ahead of time

## Generate Pickup QR

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

**Body (In-App Order):**
```json
{
  "action": "pickup",
  "machineId": "machine-001",
  "orderId": "663274bdbc608300006f294b",
  "items": [
    {
      "title": "Coke",
      "sku": "COLA_COKE01",
      "unitPrice": 3.00,
      "quantity": 1,
      "images": ["https://cdn.../coke.jpg"]
    }
  ],
  "referenceId": "session-001"
}
```

**Body (Sampling):**
```json
{
  "action": "pickup",
  "machineId": "machine-001",
  "items": [
    {
      "title": "Sample - New Energy Drink",
      "sku": "SAMPLE_ENERGY01",
      "unitPrice": 0,
      "quantity": 1,
      "images": ["https://cdn.../sample.jpg"]
    }
  ],
  "referenceId": "sample-campaign-001"
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | string | Yes | Must be `"pickup"` |
| `machineId` | string | Yes | Unique machine identifier |
| `items` | Item[] | Yes | Items to dispense |
| `orderId` | string | No | Perkd order ID (for in-app orders) |
| `referenceId` | string | No | Tracking ID |

### Response

```json
{
  "uri": "https://app.perkd.me/64633389e1788b003a234a3b?p=AlTJD..."
}
```

## Callback

When customer confirms pickup:

### Endpoint (Your Server)

```
POST {your_callback_url}/perkd/pickup/{machineId}
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
  "referenceId": "session-001"
}
```

### Response (Your Server)

```http
HTTP/1.1 200 OK

{
  "received": true
}
```

## Implementation Examples

### In-App Order Pickup

```javascript
// Customer checked in and has pending pickup
async function initiatePickup(machineId, order) {
  const response = await fetch('https://api.perkd.io/prod/Actions/vending', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.PERKD_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'pickup',
      machineId,
      orderId: order.id,
      items: order.items,
      referenceId: `pickup-${order.id}`
    })
  });

  const { uri } = await response.json();
  return uri;
}

// Handle callback
app.post('/perkd/pickup/:machineId', async (req, res) => {
  const { machineId } = req.params;
  const { status, items, referenceId } = req.body;

  if (status === 'success') {
    // Dispense items
    for (const item of items) {
      await dispenseProduct(machineId, item.sku, item.quantity);
    }

    // Mark order as fulfilled
    await markOrderFulfilled(referenceId);

    showMessage('Thank you! Please collect your items.');
  }

  res.status(200).json({ received: true });
});
```

### Sample Distribution

```javascript
// Marketing campaign: free samples
async function distributeSample(machineId, campaign) {
  const sampleItem = {
    title: campaign.productName,
    sku: campaign.sku,
    unitPrice: 0, // Free sample
    quantity: 1,
    images: [campaign.imageUrl]
  };

  const response = await fetch('https://api.perkd.io/prod/Actions/vending', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.PERKD_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'pickup',
      machineId,
      items: [sampleItem],
      referenceId: `sample-${campaign.id}-${Date.now()}`
    })
  });

  const { uri } = await response.json();
  return uri;
}

// Track sample distribution
app.post('/perkd/pickup/:machineId', async (req, res) => {
  const { items, referenceId } = req.body;

  if (referenceId.startsWith('sample-')) {
    // Track analytics
    await trackSampleDistribution({
      campaignId: referenceId.split('-')[1],
      machineId: req.params.machineId,
      timestamp: new Date()
    });

    // Dispense sample
    await dispenseProduct(req.params.machineId, items[0].sku, 1);
  }

  res.status(200).json({ received: true });
});
```

## Pickup from Check-In

When customer checks in and has pickup orders:

```javascript
app.post('/perkd/checkin/:machineId', async (req, res) => {
  const { pickups } = req.body;

  if (pickups && pickups.length > 0) {
    // Display available pickups
    showPickupOptions(pickups);

    // Customer selects order to pickup
    // Then generate pickup QR
    const selectedOrder = pickups[0];
    const uri = await initiatePickup(
      req.params.machineId,
      selectedOrder
    );

    displayQR(uri);
  }

  res.status(200).json({ received: true });
});
```

## Best Practices

### 1. Verify Order Eligibility

Check order can be fulfilled at this machine:

```javascript
function canFulfillOrder(order, machineId) {
  // Check if order assigned to this machine
  if (order.machineId && order.machineId !== machineId) {
    return false;
  }

  // Check inventory
  for (const item of order.items) {
    if (getStock(item.sku) < item.quantity) {
      return false;
    }
  }

  return true;
}
```

### 2. Track Pickup Status

Prevent duplicate pickups:

```javascript
const fulfilledOrders = new Set();

app.post('/perkd/pickup/:machineId', (req, res) => {
  const { referenceId } = req.body;

  if (fulfilledOrders.has(referenceId)) {
    console.warn('Order already fulfilled:', referenceId);
    return res.status(200).json({ received: true, duplicate: true });
  }

  // Process pickup
  processPickup(req.body);
  fulfilledOrders.add(referenceId);

  res.status(200).json({ received: true });
});
```

### 3. Handle Expiration

Pickup orders may have time limits:

```javascript
function isPickupExpired(order) {
  const expiryTime = new Date(order.expiryTime);
  return Date.now() > expiryTime.getTime();
}

async function initiatePickup(machineId, order) {
  if (isPickupExpired(order)) {
    showError('This pickup order has expired');
    return null;
  }

  // Generate pickup QR
  // ...
}
```

### 4. Update Order Status

Sync with backend systems:

```javascript
async function markOrderFulfilled(orderId) {
  await database.orders.update(orderId, {
    status: 'fulfilled',
    fulfilledAt: new Date(),
    fulfilledBy: machineId
  });

  // Notify customer
  await sendPushNotification(orderId, 'Your order has been dispensed!');
}
```

## Next Steps

- [Check In Action](/machines/vending/checkin) - Identify customers with pickups
- [Callbacks Reference](/machines/callbacks/pickup) - Detailed callback spec
- [Item Schema](/schemas/item) - Complete item structure
