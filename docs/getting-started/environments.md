# Environments

Perkd provides separate test and production environments for safe development and testing.

## Environment Overview

| Environment | Base URL | App | Purpose |
|-------------|----------|-----|---------|
| **Test** | `https://api.perkd.io/test` | Private beta app (link from Perkd) | Development & Testing |
| **Production** | `https://api.perkd.io/prod` | [App Store](https://perkd.me/app) / [Google Play](https://perkd.me/app) | Live operations |

## Test Environment

### Purpose
- Develop and test integrations safely
- Use test digital cards without real money
- Debug callback handling
- Validate QR code generation

### Characteristics
- Isolated from production data
- Test API keys (prefix: `pk_test_`)
- Test digital cards in beta app
- No real financial transactions
- Sandbox payment processing

### Getting Access

1. **API Key** - Request from Perkd (format: `pk_test_...`)
2. **Beta App** - Install using private link provided by Perkd
3. **Test Card** - Receive digital test card in the app

### Example Request

```bash
curl -X POST "https://api.perkd.io/test/Actions/vending" \
  -H "x-api-key: pk_test_abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "action": "checkin",
    "machineId": "test-machine-001"
  }'
```

## Production Environment

### Purpose
- Live customer transactions
- Real digital cards and payments
- Production monitoring and logging

### Characteristics
- Real customer data
- Production API keys (prefix: `pk_live_`)
- Public Perkd app from app stores
- Real financial transactions
- Full payment processing

### Going Live Checklist

Before switching to production:

- [ ] Complete testing in test environment
- [ ] Verify callback endpoint is production-ready
- [ ] Obtain production API key from Perkd
- [ ] Update machine IPs for production whitelist
- [ ] Configure production callback URLs
- [ ] Test with real digital cards (small amounts)
- [ ] Set up monitoring and alerts
- [ ] Prepare rollback plan

### Example Request

```bash
curl -X POST "https://api.perkd.io/prod/Actions/vending" \
  -H "x-api-key: pk_live_xyz789..." \
  -H "Content-Type: application/json" \
  -d '{
    "action": "order",
    "machineId": "vm-hq-floor1-a",
    "items": [...]
  }'
```

## Best Practices

### Use Environment Variables

Never hardcode API keys or URLs. Use environment configuration:

::: code-group

```javascript [Node.js]
const PERKD_API_KEY = process.env.PERKD_API_KEY;
const PERKD_BASE_URL = process.env.PERKD_BASE_URL;

// Example: .env file
// PERKD_API_KEY=pk_test_abc123...
// PERKD_BASE_URL=https://api.perkd.io/test
```

```python [Python]
import os

PERKD_API_KEY = os.getenv('PERKD_API_KEY')
PERKD_BASE_URL = os.getenv('PERKD_BASE_URL')

# Example: .env file
# PERKD_API_KEY=pk_test_abc123...
# PERKD_BASE_URL=https://api.perkd.io/test
```

```php [PHP]
<?php
$perkdApiKey = getenv('PERKD_API_KEY');
$perkdBaseUrl = getenv('PERKD_BASE_URL');

// Example: .env file
// PERKD_API_KEY=pk_test_abc123...
// PERKD_BASE_URL=https://api.perkd.io/test
```

:::

### Separate Configurations

Maintain separate config files for each environment:

```
config/
  ├── test.json
  └── production.json
```

### API Key Management

| Do ✅ | Don't ❌ |
|-------|----------|
| Store in environment variables | Hardcode in source code |
| Use different keys per environment | Share keys between environments |
| Rotate keys periodically | Commit keys to version control |
| Restrict key access | Expose keys in client-side code |

### Testing Strategy

1. **Local Development** → Test environment
2. **Staging** → Test environment
3. **Production Preview** → Test environment with production-like data
4. **Live** → Production environment

## Switching Environments

To switch from test to production:

```diff
- const API_KEY = 'pk_test_abc123...';
- const BASE_URL = 'https://api.perkd.io/test';
+ const API_KEY = 'pk_live_xyz789...';
+ const BASE_URL = 'https://api.perkd.io/prod';
```

::: danger Production Safety
Always test thoroughly in the test environment before deploying to production. Production errors affect real customers and real money.
:::

## Support

- **Test Environment Issues** - Contact Perkd support team
- **Production Incidents** - Use priority support channel
- **API Key Rotation** - Request through Perkd account manager

[Continue to Authentication →](/getting-started/authentication)
