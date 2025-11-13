# Pay - Vending

Collect payments or authorize funds at vending machines.

## Overview

The Pay action supports two payment modes:

1. **Immediate Capture** (default) - Payment charged immediately
2. **Authorization Only** - Hold funds, capture later with [Commit](/machines/payment/commit)

## Use Cases

- **Service Payments** - Parking fees, locker rental
- **Deposits** - Refundable deposits
- **Pre-Authorization** - Hold funds before service
- **Variable Amounts** - Amount determined after interaction

## Generate Payment QR

### Endpoint

```
POST /Actions/vending
```

### Request (Immediate Capture)

**Headers:**
```http
x-api-key: YOUR_API_KEY
Content-Type: application/json
```

**Body:**
```json
{
  "action": "pay",
  "machineId": "machine-001",
  "order": {
    "currency": "MYR",
    "amount": 20
  },
  "referenceId": "txn-12345"
}
```

### Request (Authorization Only)

```json
{
  "action": "pay",
  "machineId": "machine-001",
  "order": {
    "currency": "MYR",
    "amount": 50
  },
  "capture": false,
  "referenceId": "auth-12345"
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `action` | string | Yes | Must be `"pay"` |
| `machineId` | string | Yes | Unique machine identifier |
| `order` | Order | Yes | Payment details |
| `order.currency` | string | Yes | ISO 4217 currency code (e.g., "MYR", "SGD") |
| `order.amount` | number | Yes | Amount in local currency |
| `capture` | boolean | No | `false` to authorize only (default: `true`) |
| `referenceId` | string | No | Transaction ID |

### Response

```json
{
  "uri": "https://app.perkd.me/64633389e1788b003a234a3b?p=AlTJD..."
}
```

## Callback

When payment completes:

### Endpoint (Your Server)

```
POST {your_callback_url}/perkd/pay/{machineId}
```

### Payload (Immediate Capture)

```json
{
  "status": "success",
  "currency": "MYR",
  "amount": 20,
  "referenceId": "txn-12345"
}
```

### Payload (Authorization Only)

```json
{
  "status": "success",
  "currency": "MYR",
  "amount": 50,
  "intentId": "intent_7l0Wu9igpsDTUJYWLPzA9",
  "referenceId": "auth-12345"
}
```

::: tip Intent ID
When `capture: false`, you receive an `intentId`. Use this to [commit](/machines/payment/commit) or [cancel](/machines/payment/cancel) the payment later.
:::

### Response (Your Server)

```http
HTTP/1.1 200 OK

{
  "received": true
}
```

## Implementation Examples

### Immediate Payment

```javascript
// Simple payment collection
async function collectPayment(machineId, amount) {
  const response = await fetch('https://api.perkd.io/prod/Actions/vending', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.PERKD_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'pay',
      machineId,
      order: {
        currency: 'MYR',
        amount: amount
      },
      referenceId: `pay-${Date.now()}`
    })
  });

  const { uri } = await response.json();
  return uri;
}

// Handle callback
app.post('/perkd/pay/:machineId', async (req, res) => {
  const { status, amount, referenceId } = req.body;

  if (status === 'success') {
    console.log(`Payment received: ${amount} MYR`);
    await recordPayment(referenceId, amount);
    showMessage(`Payment successful: RM${amount}`);
  } else {
    showError('Payment failed. Please try again.');
  }

  res.status(200).json({ received: true });
});
```

### Authorization & Capture

```javascript
// Authorize payment
async function authorizePayment(machineId, amount) {
  const response = await fetch('https://api.perkd.io/prod/Actions/vending', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.PERKD_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'pay',
      machineId,
      order: {
        currency: 'MYR',
        amount: amount
      },
      capture: false, // Authorize only
      referenceId: `auth-${Date.now()}`
    })
  });

  const { uri } = await response.json();
  return uri;
}

// Store intent ID from callback
const authorizations = new Map();

app.post('/perkd/pay/:machineId', (req, res) => {
  const { status, intentId, amount, referenceId } = req.body;

  if (status === 'success' && intentId) {
    // Store authorization
    authorizations.set(referenceId, {
      intentId,
      amount,
      timestamp: Date.now()
    });

    console.log(`Authorized ${amount} MYR, intent: ${intentId}`);
    showMessage('Payment authorized. Proceed with service.');
  }

  res.status(200).json({ received: true });
});

// Later: Capture the payment
async function capturePayment(referenceId) {
  const auth = authorizations.get(referenceId);
  if (!auth) throw new Error('Authorization not found');

  const response = await fetch('https://api.perkd.io/prod/Pay/commit', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.PERKD_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      intentId: auth.intentId,
      order: {
        amount: auth.amount,
        currency: 'MYR'
      },
      referenceId: referenceId
    })
  });

  if (response.ok) {
    console.log('Payment captured successfully');
    authorizations.delete(referenceId);
  }
}
```

## Payment Status

| Status | Description | Action |
|--------|-------------|--------|
| `success` | Payment completed | Proceed with service |
| `fail` | Payment failed | Show error, retry |

## Best Practices

### 1. Validate Amount

```javascript
function validateAmount(amount) {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }
  if (amount > 999) {
    throw new Error('Amount exceeds maximum');
  }
  return true;
}
```

### 2. Handle Currency

```javascript
const SUPPORTED_CURRENCIES = ['MYR', 'SGD', 'USD'];

function validateCurrency(currency) {
  if (!SUPPORTED_CURRENCIES.includes(currency)) {
    throw new Error(`Unsupported currency: ${currency}`);
  }
}
```

### 3. Track Authorizations

```javascript
// Clean up expired authorizations
setInterval(() => {
  const now = Date.now();
  const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

  for (const [ref, auth] of authorizations.entries()) {
    if (now - auth.timestamp > MAX_AGE) {
      console.log(`Cancelling expired authorization: ${ref}`);
      cancelPayment(auth.intentId);
      authorizations.delete(ref);
    }
  }
}, 60 * 60 * 1000); // Check hourly
```

### 4. Implement Reconciliation

```javascript
async function reconcilePayments() {
  const payments = await getUnreconciledPayments();

  for (const payment of payments) {
    const perkdRecord = await fetchPerkdTransaction(payment.referenceId);
    if (perkdRecord.status !== payment.status) {
      await handleDiscrepancy(payment, perkdRecord);
    }
  }
}
```

## Error Handling

### Payment Failure

```javascript
app.post('/perkd/pay/:machineId', (req, res) => {
  if (req.body.status === 'fail') {
    logPaymentFailure({
      machineId: req.params.machineId,
      amount: req.body.amount,
      referenceId: req.body.referenceId,
      timestamp: new Date()
    });

    showError('Payment declined. Please try another payment method.');
  }

  res.status(200).json({ received: true });
});
```

### Authorization Timeout

```javascript
function setupAuthTimeout(referenceId, timeoutMs = 30000) {
  return setTimeout(() => {
    const auth = authorizations.get(referenceId);
    if (auth) {
      console.log('Authorization timeout:', referenceId);
      cancelPayment(auth.intentId);
      authorizations.delete(referenceId);
      showError('Authorization expired');
    }
  }, timeoutMs);
}
```

## Next Steps

- [Payment Commit](/machines/payment/commit) - Capture authorized payment
- [Payment Cancel](/machines/payment/cancel) - Cancel authorization
- [Callbacks Reference](/machines/callbacks/pay) - Detailed callback spec
- [Order Schema](/schemas/order) - Payment object structure
