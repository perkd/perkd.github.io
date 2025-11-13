<script setup lang="ts">
import { inject, computed } from 'vue'
import { useOpenapi } from 'vitepress-openapi/client'

const props = defineProps({
  operationId: String,
  method: String,
  path: String,
})

// Try using useOpenapi composable directly
const globalOpenApi = useOpenapi()

const responses = computed(() => {
  if (!globalOpenApi || !props.operationId) {
    console.log('ExampleResponse: No globalOpenApi or operationId', { globalOpenApi: !!globalOpenApi, operationId: props.operationId })
    return null
  }

  const operation = globalOpenApi.getOperation?.(props.operationId)
  console.log('ExampleResponse: Got operation', { operationId: props.operationId, operation, responses: operation?.responses })
  return operation?.responses || null
})
</script>

<template>
  <div>
    <!-- Debug info (remove later) -->
    <div v-if="!responses" class="text-sm text-red-500">
      Debug: No responses found for {{ operationId }}
    </div>

    <!-- Use OAResponses with the processed responses from the OpenAPI instance -->
    <OAResponses
      v-if="responses && operationId"
      :operation-id="operationId"
      :responses="responses"
    />
  </div>
</template>
