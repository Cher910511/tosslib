<template>
  <div class="tag-cloud">
    <span
      v-for="(t, i) in tags"
      :key="t"
      class="tag"
      :style="tagStyle(i)"
    >{{ t }}</span>
  </div>
</template>

<script setup>
const props = defineProps({
  tags: { type: Array, default: () => [] },
})

function tagStyle(i) {
  const sizes = [14, 16, 18, 13, 15, 17, 14, 16]
  const delays = i * 0.12
  return {
    fontSize: `${sizes[i % sizes.length]}px`,
    animationDelay: `${delays}s`,
    opacity: 0.85 + (i % 3) * 0.05,
  }
}
</script>

<style scoped>
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 10px;
  align-content: center;
  justify-content: center;
  padding: 8px 6px;
  min-height: 0;
}
.tag {
  padding: 4px 12px;
  border: 1px solid rgba(0, 180, 255, 0.35);
  border-radius: 20px;
  color: var(--text-primary);
  background: linear-gradient(135deg, rgba(0, 60, 120, 0.4), rgba(0, 30, 60, 0.5));
  box-shadow: 0 0 12px rgba(0, 180, 255, 0.15);
  animation: pulse 3s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 8px rgba(0, 180, 255, 0.15); }
  50% { box-shadow: 0 0 18px rgba(0, 212, 255, 0.35); }
}
</style>
