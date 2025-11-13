# Setup Requirements

Complete these steps to prepare your integration with Perkd.

## 1. Receive from Perkd

Contact Perkd to obtain:

### API Key
A merchant-specific authentication key used in all API requests.

```bash
x-api-key: pk_test_abc123def456...
```

::: warning Environment-Specific Keys
You'll receive different API keys for test and production environments. Never use production keys in testing.
:::

### Digital Card for Testing
A test digital card will be provisioned in the Perkd app for your testing account. Use this to simulate customer interactions.

## 2. Provide to Perkd

### Callback Endpoint

A publicly accessible HTTPS URL where Perkd will send webhook notifications.

**Requirements:**
- Must be HTTPS (TLS/SSL required)
- Must return `200 OK` status code on success
- Should process callbacks idempotently
- Universal endpoint for all machines (machine ID is in the URL path)

**Example endpoint structure:**
```
https://api.yourdomain.com/perkd/{action}/{machineId}

https://api.yourdomain.com/perkd/checkin/machine-001
https://api.yourdomain.com/perkd/order/kiosk-hq-02
```

::: tip Callback Retry Logic
Perkd will retry callbacks until receiving a `200 OK` response. Implement idempotency to handle duplicate callbacks safely.
:::

### Machine IDs

Provide a list of unique identifiers for each vending machine or kiosk, along with location details.

| Machine ID | Type | Location | IP Address |
|------------|------|----------|------------|
| `vm-hq-floor1-a` | Vending | HQ Building, 1st Floor | `203.0.113.10` |
| `kiosk-mall-north` | Kiosk | North Mall Entrance | `203.0.113.20` |

**Requirements:**
- Must be universally unique across all your machines
- Use consistent naming convention
- Alphanumeric and hyphens only

### IP Addresses

Provide static IP addresses for all machines that will call the Perkd API for whitelisting.

::: danger Security Notice
Perkd uses IP whitelisting for additional security. Ensure your machines have static IPs or use a fixed gateway IP.
:::

## 3. Development Setup

### Install HTTP Client

Choose your preferred method to make API calls:

::: code-group

```bash [cURL]
# Included in most operating systems
curl --version
```

```bash [Node.js]
npm install axios
# or
npm install node-fetch
```

```bash [Python]
pip install requests
```

```bash [Postman]
# Download from https://www.postman.com/
# Import our collection from /resources/postman
```

:::

### Test Connectivity

Verify you can reach the Perkd API:

```bash
curl -I https://api.perkd.io/test
```

Expected response:
```
HTTP/2 200
access-control-allow-origin: *
```

## 4. Implement Callback Handler

Create an endpoint to receive webhooks from Perkd:

::: code-group

```javascript [Node.js/Express]
app.post('/perkd/:action/:machineId', (req, res) => {
  const { action, machineId } = req.params;
  const payload = req.body;

  console.log(`Received ${action} callback for ${machineId}`, payload);

  // Process the callback
  // ...

  // Return 200 to acknowledge receipt
  res.status(200).json({ received: true });
});
```

```python [Python/Flask]
@app.route('/perkd/<action>/<machine_id>', methods=['POST'])
def perkd_callback(action, machine_id):
    payload = request.json

    print(f"Received {action} callback for {machine_id}", payload)

    # Process the callback
    # ...

    # Return 200 to acknowledge receipt
    return jsonify({"received": True}), 200
```

```php [PHP]
<?php
$action = $_GET['action'];
$machineId = $_GET['machineId'];
$payload = json_decode(file_get_contents('php://input'), true);

error_log("Received $action callback for $machineId");

// Process the callback
// ...

// Return 200 to acknowledge receipt
http_response_code(200);
echo json_encode(['received' => true]);
```

:::

## 5. Security Checklist

- [ ] Use HTTPS for all API communication
- [ ] Store API keys securely (environment variables, not in code)
- [ ] Validate callback payloads before processing
- [ ] Implement idempotency for callback handlers
- [ ] Log all API interactions for debugging
- [ ] Use separate test/production environments
- [ ] Never expose API keys in client-side code

## Next Steps

Once setup is complete:

1. [Understand test vs production environments](/getting-started/environments)
2. [Learn how to authenticate API requests](/getting-started/authentication)
3. [Explore Machine APIs](/machines/)

[Continue to Environments →](/getting-started/environments)
