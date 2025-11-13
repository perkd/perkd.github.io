---
aside: false
outline: deep
---

<script setup>
import spec from '../specs/callbacks-api.json'
</script>

# Callbacks API Reference

This page provides complete documentation for webhook callbacks that Perkd sends to partner systems.

::: warning Partner Implementation Required
These are endpoints that **you** (the partner) must implement on your server. Perkd will send HTTP POST requests to these URLs during machine operations.
:::

<CustomOASpec :spec="spec" />

## Implementation Guide

When implementing callback endpoints:

1. **Verify Webhook Signatures** - Use the `X-Perkd-Signature` header to validate requests
2. **Respond Quickly** - Return responses within 5 seconds to avoid timeouts
3. **Handle Retries** - Perkd will retry failed callbacks up to 3 times
4. **Use HTTPS** - All callback URLs must use HTTPS in production

## Additional Resources

- [Callbacks Overview](/machines/callbacks/)
- [Webhooks Best Practices](/guides/webhooks)
- [Testing Callbacks](/guides/testing)

## Need Help?

If you have questions about implementing callback endpoints:

1. Review the [Webhooks Best Practices Guide](/guides/webhooks)
2. Check the [Testing Guide](/guides/testing)
3. Contact support at support@perkd.com
