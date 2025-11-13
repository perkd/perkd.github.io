---
aside: false
outline: deep
---

<script setup>
import spec from '../specs/payment-api.json'
</script>

# Payment API Reference

This page provides complete API documentation for Perkd's payment processing endpoints.

<CustomOASpec :spec="spec" />

## Payment Flow

The typical payment flow is:

1. **Authorize** - Reserve funds (via callback to partner)
2. **Commit** - Finalize the charge after successful fulfillment
3. **Cancel** - Release authorization or refund if needed

## Important Notes

- Authorizations expire after 7 days
- Committed amounts can differ from authorized amounts (e.g., for tips or adjustments)
- Refunds are processed immediately but may take 3-5 business days to appear

## Additional Resources

- [Payment Overview](/machines/payment/)
- [Payment Commit](/machines/payment/commit)
- [Payment Cancel](/machines/payment/cancel)

## Need Help?

If you have questions about payment processing:

1. Check the [Getting Started Guide](/getting-started/)
2. Review the [Error Handling Guide](/guides/error-handling)
3. Contact support at support@perkd.com
