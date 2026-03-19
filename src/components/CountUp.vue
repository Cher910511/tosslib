<template>
  <span class="count-up">{{ prefix }}{{ formatted }}{{ suffix }}</span>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  end: { type: Number, required: true },
  duration: { type: Number, default: 2000 },
  decimals: { type: Number, default: 0 },
  prefix: { type: String, default: '' },
  suffix: { type: String, default: '' },
  useLocale: { type: Boolean, default: true },
})
const displayValue = ref(0)
const formatted = computed(() => {
  const v = displayValue.value
  if (!props.useLocale) return String(v)
  if (props.decimals === 0) return Math.round(v).toLocaleString('zh-CN')
  return v.toLocaleString('zh-CN', {
    maximumFractionDigits: props.decimals,
    minimumFractionDigits: props.decimals,
  })
})
let raf = null

function animate() {
  const start = performance.now()
  const startVal = displayValue.value
  const endVal = props.end
  const dur = props.duration
  const decimals = props.decimals

  function step(now) {
    const elapsed = now - start
    const progress = Math.min(elapsed / dur, 1)
    const easeOut = 1 - Math.pow(1 - progress, 2)
    const current = startVal + (endVal - startVal) * easeOut
    displayValue.value = Number(current.toFixed(decimals))
    if (progress < 1) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
}

onMounted(() => {
  displayValue.value = 0
  animate()
})
watch(() => props.end, () => {
  if (raf) cancelAnimationFrame(raf)
  animate()
})
</script>

<style scoped>
.count-up {
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  color: var(--text-primary);
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
}
</style>
