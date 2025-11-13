<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  spec: {
    type: Object,
    required: true
  }
})

// Extract all operations from the spec
const operations = computed(() => {
  const ops: Array<{
    operationId: string
    method: string
    path: string
    operation: any
  }> = []

  if (!props.spec?.paths) return ops

  for (const [path, pathItem] of Object.entries(props.spec.paths)) {
    const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']

    for (const method of methods) {
      const operation = pathItem[method]
      if (operation && operation.operationId) {
        ops.push({
          operationId: operation.operationId,
          method: method.toUpperCase(),
          path,
          operation
        })
      }
    }
  }

  return ops
})
</script>

<template>
  <div class="custom-oa-spec">
    <OAOperation
      v-for="op in operations"
      :key="op.operationId"
      :operation-id="op.operationId"
      :spec="spec"
      :hide-branding="true"
    >
      <!-- Override header to use operationId as the ID -->
      <template #header="{ operation, method, path }">
        <div class="flex flex-col">
          <div class="flex flex-row gap-2"></div>
          <h1 :id="op.operationId" tabindex="-1" class="scroll-m-[var(--vp-nav-height)]">
            {{ operation.summary }}
            <a class="header-anchor header-anchor" :href="`#${op.operationId}`" :aria-label="`Permalink to ${operation.summary}`">​</a>
          </h1>
        </div>
      </template>

      <!-- Hide security slot -->
      <template #security>
        <!-- Empty -->
      </template>

      <!-- Parameters slot -->
      <template #parameters="paramsSlot">
        <!-- Render parameters if they exist, otherwise empty -->
        <OAParameters
          v-if="paramsSlot.parameters?.length"
          :operation-id="paramsSlot.operationId"
          :parameters="paramsSlot.parameters"
        />
      </template>

      <!-- Hide playground slot -->
      <template #playground>
        <!-- Empty -->
      </template>

      <!-- Responses slot - keep in left column, will duplicate for right -->
      <template #responses="responsesSlot">
        <!-- Hidden in left column -->
        <div class="custom-responses-left" style="display: none;">
          <OAResponses
            :operation-id="responsesSlot.operationId"
            :responses="responsesSlot.responses"
          />
        </div>
        <!-- Visible in right column via CSS -->
        <div class="custom-responses-right">
          <OAResponses
            :operation-id="responsesSlot.operationId"
            :responses="responsesSlot.responses"
          />
        </div>
      </template>

      <!-- Hide code samples for clean layout -->
      <template #code-samples>
        <!-- Empty -->
      </template>
    </OAOperation>
  </div>
</template>

<style>
@media (min-width: 640px) {
  /* Grid with 2 rows: row 1 for description/path, row 2 for request-body/responses */
  .custom-oa-spec .OAPath > .grid.sm\:grid-cols-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto; /* Two rows that adapt to content */
    gap: 1rem 1.5rem;
    align-items: start;
    margin-bottom: 3rem;
  }

  /* Use display: contents so children participate in parent grid */
  .custom-oa-spec .OAPathContentStart {
    display: contents;
  }

  /* Description area: column 1, row 1 */
  .custom-oa-spec .OAPathContentStart > div:first-child {
    grid-column: 1;
    grid-row: 1;
  }

  /* Request Body: column 1, row 2 (bottom left) */
  .custom-oa-spec .OAPathContentStart > div:has(h2#request-body) {
    grid-column: 1;
    grid-row: 2;
  }

  /* Parameters (if exists): column 1, row 2 */
  .custom-oa-spec .OAPathContentStart > div:has(h2#parameters) {
    grid-column: 1;
    grid-row: 2;
  }

  /* Hide the mobile path badge in left column */
  .custom-oa-spec .OAPathContentStart div.sm\:hidden {
    display: none !important;
  }

  /* Hide left responses */
  .custom-oa-spec .custom-responses-left {
    display: none !important;
  }

  /* Right responses: column 2, row 2 (bottom right) */
  .custom-oa-spec .custom-responses-right {
    grid-column: 2;
    grid-row: 2;
    padding-left: 1.5rem;
  }

  /* Path badge: column 2, row 1 (top right) */
  .custom-oa-spec .OAPathContentEnd {
    grid-column: 2;
    grid-row: 1;
    position: static !important;
    padding-left: 1.5rem;
  }

  /* Show the desktop path badge */
  .custom-oa-spec .OAPathContentEnd > div:first-child {
    display: block !important;
    margin-top: 2rem !important;
  }
}

/* Remove mt-[48px] from operation titles */
.custom-oa-spec h1 {
  margin-top: 0 !important;
}

.custom-oa-spec h2 {
  margin-top: 0 !important;
}

/* Remove margin from Request Body container */
.custom-oa-spec .OAPathContentStart div:has(h2#request-body) {
  margin-top: 0.4rem !important;
}

/* Remove margin from Parameters container */
.custom-oa-spec .OAPathContentStart div:has(h2#parameters) {
  margin-top: 0 !important;
  padding-top: 0 !important;
}

/* Remove margin from any heading containers */
.custom-oa-spec div:has(h2[id]) {
  margin-top: 0.2rem !important;
}
</style>
