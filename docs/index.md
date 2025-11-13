---
layout: home

hero:
  name: Perkd Partner API
  text: Integrate with Perkd's digital wallet platform
  tagline: Build seamless payment and loyalty experiences for vending machines, kiosks, and more
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started/
    - theme: alt
      text: API Reference
      link: /machines/

features:
  - icon: 🏪
    title: Machine APIs
    details: Generate QR codes for check-in, ordering, pickup, and payment at vending machines and kiosks

  - icon: 🔔
    title: Real-time Callbacks
    details: Receive instant webhooks when customers interact with your machines through the Perkd app

  - icon: 💳
    title: Flexible Payments
    details: Support both immediate capture and two-step authorization/commit payment flows

  - icon: 🎯
    title: Member Loyalty
    details: Access customer membership data, tiers, and available pickup orders

  - icon: 🔧
    title: Easy Integration
    details: RESTful APIs with simple authentication, comprehensive schemas, and Postman collection

  - icon: 🌍
    title: Multi-environment
    details: Separate test and production environments with dedicated API keys
---

## Quick Example

Generate a QR code for a customer to order from your vending machine:

```bash
curl -X POST "https://api.perkd.io/prod/Actions/vending" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "order",
    "machineId": "machine-001",
    "items": [{
      "title": "Coke",
      "sku": "COLA_COKE01",
      "unitPrice": 3.00,
      "quantity": 1,
      "images": ["https://example.com/coke.jpg"]
    }],
    "referenceId": "order-12345"
  }'
```

Response includes a URI that can be encoded as a QR code for customers to scan.

## What You'll Need

Before getting started, ensure you have:

- **API Key** - Provided by Perkd for your environment (test/production)
- **Callback Endpoint** - A publicly accessible URL to receive webhooks
- **Machine IDs** - Unique identifiers for each of your machines
- **IP Whitelisting** - Provide your machine IP addresses to Perkd

[Start building →](/getting-started/)
