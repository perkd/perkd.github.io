---
aside: false
outline: deep
---

<script setup>
import spec from './specs/vending-api.json'
import ExampleResponse from './.vitepress/theme/components/ExampleResponse.vue'

// Get the first operation from the spec for testing
const operation = spec.paths['/vending/checkin'].post
</script>

# Test Custom Response Display

This page tests the custom example response component without running the actual API.

## Using OAOperation with Custom Slot

<OAOperation
  operation-id="vendingCheckin"
  :spec="spec"
>
  <template #playground="slotProps">
    <div class="custom-playground-wrapper">
      <h3 class="text-lg font-semibold mb-2">Request Example</h3>
      <div class="text-sm text-gray-600 mb-4">
        This shows the expected response without making an actual API call.
      </div>
      <ExampleResponse
        :operation-id="slotProps.operationId"
        :method="slotProps.method"
        :path="slotProps.path"
        :responses="operation.responses"
      />
    </div>
  </template>
</OAOperation>

## Test Notes

- The playground slot is overridden to show `ExampleResponse` component
- Response is generated from OpenAPI spec schema
- No actual API call is made
