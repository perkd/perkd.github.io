# Check In - Vending

Identify customers and show available pickup orders.

## Overview

The Check In action allows customers to identify themselves at a vending machine, displaying:
- Member profile information
- Loyalty tier and status
- Available pre-orders for pickup
- Personalized offers

## Use Cases

- **Member Recognition** - Greet customers by name
- **Pre-Order Display** - Show items ready for pickup
- **Loyalty Integration** - Display member tier and benefits
- **Personalized Service** - Offer customized promotions

## Generate Check In QR

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
  "action": "checkin",
  "machineId": "machine-001",
  "referenceId": "session-001"
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | string | Yes | Must be `"checkin"` |
| `machineId` | string | Yes | Unique machine identifier |
| `referenceId` | string | No | Session or transaction ID for tracking |

### Response

```json
{
  "uri": "https://app.perkd.me/64633389e1788b003a234a3b?p=AlTJD..."
}
```

## Callback

When customer completes check-in in the app, Perkd sends:

### Endpoint (Your Server)

```
POST {your_callback_url}/perkd/checkin/{machineId}
```

### Payload

```json
{
  "person": {
    "familyName": "Lee",
    "givenName": "Michelle",
    "fullName": "Michelle Lee",
    "gender": "f",
    "birthDate": "1988-11-11",
    "profileImageUrl": "https://s3.../profile.jpg"
  },
  "membership": {
    "cardNumber": "IGTEST000194",
    "tier": 1,
    "startTime": "2023-05-05T01:07:58.846Z",
    "endTime": "2024-06-08T15:59:59.999Z",
    "cardImageUrl": "https://s3.../card.png"
  },
  "pickups": [
    {
      "orderId": "663274bdbc608300006f294b",
      "items": [
        {
          "title": "Coke",
          "sku": "COLA_COKE01",
          "unitPrice": 3.00,
          "quantity": 1,
          "images": ["https://cdn.../coke.jpg"]
        }
      ]
    }
  ],
  "referenceId": "session-001"
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

### Person Object

| Field | Type | Description |
|-------|------|-------------|
| `familyName` | string | Last name |
| `givenName` | string | First name |
| `fullName` | string | Full name |
| `gender` | string | Gender (`"m"`, `"f"`, `"o"`) |
| `birthDate` | string | Date of birth (ISO 8601) |
| `profileImageUrl` | string | Profile photo URL |

See [Person Schema](/schemas/person) for full details.

### Membership Object

| Field | Type | Description |
|-------|------|-------------|
| `cardNumber` | string | Membership card number |
| `tier` | number | Membership tier level |
| `startTime` | string | Membership start (ISO 8601) |
| `endTime` | string | Membership expiry (ISO 8601) |
| `cardImageUrl` | string | Digital card image URL |

See [Membership Schema](/schemas/membership) for full details.

### Pickups Array

List of available orders for pickup at this machine.

| Field | Type | Description |
|-------|------|-------------|
| `orderId` | string | Order ID from Perkd |
| `items` | Item[] | Items in this pickup order |

See [Item Schema](/schemas/item) for item structure.

## Implementation Example

### 1. Generate Check In QR

```javascript
async function generateCheckInQR(machineId) {
  const response = await fetch('https://api.perkd.io/prod/Actions/vending', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.PERKD_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'checkin',
      machineId: machineId,
      referenceId: `session-${Date.now()}`
    })
  });

  const { uri } = await response.json();
  return uri;
}
```

### 2. Display QR Code

```javascript
import QRCode from 'qrcode';

const uri = await generateCheckInQR('machine-001');
const qrDataURL = await QRCode.toDataURL(uri);

// Display on machine screen
displayQR(qrDataURL);

// Auto-clear after 1 hour
setTimeout(() => clearQR(), 60 * 60 * 1000);
```

### 3. Handle Callback

```javascript
app.post('/perkd/checkin/:machineId', async (req, res) => {
  const { machineId } = req.params;
  const { person, membership, pickups, referenceId } = req.body;

  console.log(`Check-in for ${person.fullName} at ${machineId}`);

  // Display welcome message
  await displayWelcome({
    name: person.givenName,
    tier: membership.tier,
    image: person.profileImageUrl
  });

  // Show available pickups
  if (pickups && pickups.length > 0) {
    await displayPickups(pickups);
  }

  // Acknowledge
  res.status(200).json({ received: true });
});
```

## Complete Example

```javascript
// vending-machine.js
import express from 'express';
import QRCode from 'qrcode';

const app = express();
app.use(express.json());

// Generate check-in QR
async function startCheckIn(machineId) {
  const referenceId = `checkin-${Date.now()}`;

  // Call Perkd API
  const response = await fetch('https://api.perkd.io/prod/Actions/vending', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.PERKD_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'checkin',
      machineId,
      referenceId
    })
  });

  const { uri } = await response.json();

  // Display QR on machine screen
  const qrImage = await QRCode.toDataURL(uri);
  await displayOnScreen({
    type: 'qr',
    image: qrImage,
    message: 'Scan to check in'
  });

  return referenceId;
}

// Receive callback
app.post('/perkd/checkin/:machineId', (req, res) => {
  const { machineId } = req.params;
  const { person, membership, pickups } = req.body;

  // Welcome customer
  displayOnScreen({
    type: 'welcome',
    name: person.givenName,
    tier: `Tier ${membership.tier}`,
    image: person.profileImageUrl
  });

  // Show pickups if available
  if (pickups?.length > 0) {
    const totalItems = pickups.reduce(
      (sum, p) => sum + p.items.length,
      0
    );
    displayOnScreen({
      type: 'pickups',
      count: totalItems,
      orders: pickups
    });
  }

  res.status(200).json({ received: true });
});

app.listen(3000);
```

## Best Practices

### 1. Personalize Experience

Use customer data to personalize the interface:

```javascript
function personalizeWelcome(person, membership) {
  return {
    greeting: `Welcome back, ${person.givenName}!`,
    tierBadge: `Tier ${membership.tier}`,
    specialOffer: getTierOffer(membership.tier)
  };
}
```

### 2. Highlight Pickups

Make pickup orders prominent:

```javascript
if (pickups.length > 0) {
  showBanner('You have items ready for pickup!');
  highlightPickupButton();
}
```

### 3. Handle No Pickups

Provide clear messaging when no pickups are available:

```javascript
if (!pickups || pickups.length === 0) {
  showMessage('No pickups available. Browse our products!');
}
```

### 4. Timeout Idle Sessions

Clear sensitive data after timeout:

```javascript
setTimeout(() => {
  clearPersonalInfo();
  returnToIdleScreen();
}, 30000); // 30 seconds
```

## Error Handling

### No Member Data

If customer is not a member:

```javascript
app.post('/perkd/checkin/:machineId', (req, res) => {
  if (!req.body.membership) {
    showMessage('Not a member yet? Sign up in the app!');
  }
  res.status(200).json({ received: true });
});
```

### Network Issues

Handle API call failures:

```javascript
try {
  const uri = await generateCheckInQR(machineId);
  displayQR(uri);
} catch (error) {
  console.error('Check-in failed:', error);
  showError('Unable to generate check-in code. Please try again.');
}
```

## Next Steps

- [Pickup Action](/machines/vending/pickup) - Dispense picked-up items
- [Order Action](/machines/vending/order) - Create new purchases
- [Callbacks Reference](/machines/callbacks/checkin) - Detailed callback spec
- [Person Schema](/schemas/person) - Full person object definition
- [Membership Schema](/schemas/membership) - Full membership object definition
