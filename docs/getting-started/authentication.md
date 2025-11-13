# Authentication

All Perkd API requests require authentication using API keys.

## API Key Authentication

Perkd uses API keys passed via the `x-api-key` HTTP header.

### Basic Usage

```bash
curl https://api.perkd.io/prod/Actions/vending \
  -H "x-api-key: YOUR_API_KEY"
```

### Header Format

```
x-api-key: pk_test_abc123def456...
```

| Header | Value | Required |
|--------|-------|----------|
| `x-api-key` | Your API key | Yes ✅ |
| `Content-Type` | `application/json` (for POST requests) | For POST/PUT |

## API Key Types

### Test Keys
- **Prefix:** `pk_test_`
- **Environment:** Test only
- **App:** Beta app (private link)
- **Safety:** No real transactions

### Production Keys
- **Prefix:** `pk_live_`
- **Environment:** Production only
- **App:** Public app (App Store/Google Play)
- **Safety:** Real transactions ⚠️

::: warning Never Mix Environments
Using a test key with production URL (or vice versa) will result in authentication errors.
:::

## Implementation Examples

### cURL

```bash
curl -X POST "https://api.perkd.io/prod/Actions/vending" \
  -H "x-api-key: pk_live_xyz789..." \
  -H "Content-Type: application/json" \
  -d '{
    "action": "order",
    "machineId": "machine-001",
    "items": [...]
  }'
```

### JavaScript/Node.js

::: code-group

```javascript [Axios]
import axios from 'axios';

const client = axios.create({
  baseURL: 'https://api.perkd.io/prod',
  headers: {
    'x-api-key': process.env.PERKD_API_KEY,
    'Content-Type': 'application/json'
  }
});

const response = await client.post('/Actions/vending', {
  action: 'order',
  machineId: 'machine-001',
  items: [...]
});
```

```javascript [Fetch]
const response = await fetch('https://api.perkd.io/prod/Actions/vending', {
  method: 'POST',
  headers: {
    'x-api-key': process.env.PERKD_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'order',
    machineId: 'machine-001',
    items: [...]
  })
});

const data = await response.json();
```

:::

### Python

::: code-group

```python [Requests]
import requests
import os

headers = {
    'x-api-key': os.getenv('PERKD_API_KEY'),
    'Content-Type': 'application/json'
}

response = requests.post(
    'https://api.perkd.io/prod/Actions/vending',
    headers=headers,
    json={
        'action': 'order',
        'machineId': 'machine-001',
        'items': [...]
    }
)

data = response.json()
```

```python [HTTPX]
import httpx
import os

async with httpx.AsyncClient() as client:
    response = await client.post(
        'https://api.perkd.io/prod/Actions/vending',
        headers={
            'x-api-key': os.getenv('PERKD_API_KEY'),
            'Content-Type': 'application/json'
        },
        json={
            'action': 'order',
            'machineId': 'machine-001',
            'items': [...]
        }
    )
    data = response.json()
```

:::

### PHP

```php
<?php

$apiKey = getenv('PERKD_API_KEY');
$baseUrl = 'https://api.perkd.io/prod';

$ch = curl_init("$baseUrl/Actions/vending");

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        "x-api-key: $apiKey",
        'Content-Type: application/json'
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'action' => 'order',
        'machineId' => 'machine-001',
        'items' => [...]
    ])
]);

$response = curl_exec($ch);
$data = json_decode($response, true);

curl_close($ch);
```

## Security Best Practices

### ✅ Do

- **Store keys in environment variables**
  ```bash
  export PERKD_API_KEY=pk_live_xyz789...
  ```

- **Use different keys for test/production**
  ```javascript
  const apiKey = process.env.NODE_ENV === 'production'
    ? process.env.PERKD_LIVE_KEY
    : process.env.PERKD_TEST_KEY;
  ```

- **Rotate keys periodically**
  - Contact Perkd to issue new keys
  - Update all machines
  - Revoke old keys

- **Restrict key access**
  - Only authorized personnel
  - Secure storage (e.g., AWS Secrets Manager, HashiCorp Vault)

### ❌ Don't

- **Never commit keys to version control**
  ```bash
  # Add to .gitignore
  .env
  .env.local
  config/secrets.json
  ```

- **Never expose in client-side code**
  - Keys should only exist on your servers
  - Never in JavaScript sent to browsers

- **Never share keys between environments**
  - Test keys → test environment only
  - Production keys → production only

- **Never log keys**
  ```javascript
  // Bad ❌
  console.log('API Key:', apiKey);

  // Good ✅
  console.log('API Key:', apiKey.substring(0, 10) + '...');
  ```

## Error Handling

### Invalid or Missing Key

**Request:**
```bash
curl https://api.perkd.io/prod/Actions/vending
# Missing x-api-key header
```

**Response:**
```json
{
  "error": "Unauthorized",
  "message": "Missing or invalid API key"
}
```
HTTP Status: `401 Unauthorized`

### Wrong Environment

**Request:**
```bash
curl https://api.perkd.io/prod/Actions/vending \
  -H "x-api-key: pk_test_abc123..."
# Using test key with production URL
```

**Response:**
```json
{
  "error": "Forbidden",
  "message": "Invalid API key for this environment"
}
```
HTTP Status: `403 Forbidden`

## Key Management

### Obtaining Keys

1. Contact Perkd partner support
2. Provide:
   - Company name
   - Environment (test/production)
   - Technical contact email
3. Receive API key securely (not via email)

### Rotating Keys

1. Request new key from Perkd
2. Update environment variables on all machines
3. Test with new key
4. Notify Perkd to revoke old key
5. Monitor for errors

### Compromised Keys

If a key is compromised:

1. **Immediately contact Perkd support**
2. Request key revocation
3. Obtain new key
4. Update all systems
5. Review access logs
6. Investigate the compromise

::: danger Emergency Key Rotation
If you suspect your API key has been compromised, contact Perkd immediately for emergency key rotation. Do not wait.
:::

## Next Steps

Now that you understand authentication:

1. [Explore Machine APIs](/machines/)
2. [Review data schemas](/schemas/)
3. [Learn about callbacks](/machines/callbacks/)

[Continue to Machine APIs →](/machines/)
