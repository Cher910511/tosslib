<template>
  <svg
    class="assistant-prompt-icon"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <g v-if="name === 'image'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2.5" y="5" width="19" height="15" rx="2.5" />
      <path d="M2.5 17.5l5.2-5 3.4 3.4L14.2 9 21.5 16.2" />
      <circle cx="8.5" cy="9" r="1.6" fill="currentColor" stroke="none" />
    </g>
    <g v-else-if="name === 'http'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
      <path d="M10 13.5a4.5 4.5 0 0 1 0-6.3l.9-.9a4.5 4.5 0 0 1 6.4 6.4l-.9.9" />
      <path d="M14 10.5a4.5 4.5 0 0 1 0 6.3l-.9.9a4.5 4.5 0 0 1-6.4-6.4l.9-.9" />
    </g>
    <g v-else-if="name === 'typescript'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 8l4 4-4 4" />
      <path d="M7 16L3 12l4-4" />
    </g>
    <g v-else-if="name === 'rust'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
      <path d="M12 2v4M12 18v4M4.5 7l3.5 2M16 15l3.5 2M2 12h4M18 12h4M4.5 17l3.5-2M16 9l3.5-2" />
      <circle cx="12" cy="12" r="3" />
    </g>
    <g v-else-if="name === 'software'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.3 7L12 12l8.7-5M12 22V12" />
    </g>
    <g v-else-if="name === 'go'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 10l3 3-3 3M13 16h4.5" />
    </g>
    <g v-else-if="name === 'discovery'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="10.5" cy="10.5" r="5.5" />
      <path d="M15 15l5.5 5.5" />
    </g>
    <g v-else-if="name === 'supply'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="5" width="8" height="6" rx="1.5" />
      <rect x="13" y="13" width="8" height="6" rx="1.5" />
      <path d="M9 11l6 6" />
    </g>
    <g v-else-if="name === 'vuln'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3l8 4v6c0 4.5-2.5 8.5-8 10-5.5-1.5-8-5.5-8-10V7l8-4z" />
      <path d="M12 9v5M12 17h.01" />
    </g>
    <g v-else-if="name === 'license'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 3h12l-1 18H9L8 3z" />
      <path d="M10 8h8M10 12h6M10 16h7" />
    </g>
    <g v-else-if="name === 'maintain'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="9" cy="8" r="2.5" />
      <circle cx="16" cy="8" r="2.5" />
      <path d="M4 20c0-2.5 3-4.5 8.5-4.5S21 17.5 21 20" />
    </g>
    <g v-else-if="name === 'import'" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 4v9" />
      <path d="M8.5 10.5L12 14l3.5-3.5" />
      <path d="M5 18h14v2H5z" />
    </g>
    <g v-else stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
      <path d="M12 3l1.8 3.6L18 8l-3.2 3.1L16 15l-4-1.9L8 15l1.2-3.9L6 8l4.2-1.4L12 3z" />
    </g>
  </svg>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true,
  },
})
</script>

<style scoped>
.assistant-prompt-icon {
  display: block;
  width: 24px;
  height: 24px;
}
</style>
