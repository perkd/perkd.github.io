# API Reference

Welcome to the Perkd Partner API Reference. This section provides interactive API documentation generated from OpenAPI specifications.

## Authentication

All Perkd Partner API endpoints require authentication using **Bearer Token** (JWT) in the request headers.

### Header Format

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Getting Your Token

To obtain API credentials and learn about authentication:

1. Review the [Authentication Guide](/getting-started/authentication)
2. Contact Perkd to get your API credentials
3. Generate JWT tokens for your requests

For detailed authentication documentation, see our [**Authentication Guide**](/getting-started/authentication).

---

## Available APIs

Browse the complete API documentation for each integration:

- **[Vending API](./vending.md)** - Machine check-in, ordering, pickup, and payment
- **[Kiosk API](./kiosk.md)** - Kiosk ordering and customization
- **[Callbacks API](./callbacks.md)** - Webhook callbacks to partner systems
- **[Payment API](./payment.md)** - Payment processing, commit, and cancel operations

## Using the API Reference

Each API reference page provides:

- **Interactive Documentation** - Explore all endpoints, parameters, and responses
- **Request/Response Examples** - See sample JSON payloads
- **Method Badges** - Visual indicators for HTTP methods (GET, POST, etc.)

## Quick Links

- [Getting Started Guide](/getting-started/)
- [Authentication](/getting-started/authentication)
- [Error Handling](/guides/error-handling)
- [Testing Guide](/guides/testing)
