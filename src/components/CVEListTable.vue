<template>
  <div class="table-scroll-wrap" :class="{ large: size === 'large' }">
    <div class="thead">
      <span>CVE ID</span>
      <span>组件名称</span>
      <span>漏洞等级</span>
      <span>发布时间</span>
    </div>
    <div
      class="tbody"
      @mouseenter="pause = true"
      @mouseleave="pause = false"
    >
      <div class="tbody-inner" :style="{ transform: `translateY(-${offset}px)` }">
        <div v-for="(row, i) in doubledList" :key="i" class="tr">
          <span class="mono">{{ row.cveId }}</span>
          <span class="comp" :title="row.component">{{ row.component }}</span>
          <span :class="levelClass(row.level)">{{ row.level }}</span>
          <span>{{ row.publishTime }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  list: { type: Array, default: () => [] },
  /** large：更大字号与行高，适合大屏主列表 */
  size: { type: String, default: 'default' },
})

const rowH = computed(() => (props.size === 'large' ? 40 : 36))

const doubledList = computed(() => [...props.list, ...props.list])
const offset = ref(0)
const pause = ref(false)
let raf = null

function tick() {
  if (!pause.value) {
    offset.value += 0.55
    const total = props.list.length * rowH.value
    if (offset.value >= total) offset.value = 0
  }
  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  raf = requestAnimationFrame(tick)
})
onUnmounted(() => cancelAnimationFrame(raf))

function levelClass(l) {
  if (l === '高危') return 'level-high'
  if (l === '中危') return 'level-medium'
  return 'level-low'
}
</script>

<style scoped>
.table-scroll-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid rgba(0, 212, 255, 0.28);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 0 20px rgba(0, 60, 120, 0.15);
}
.thead {
  display: grid;
  grid-template-columns: 1.15fr 1.05fr 0.65fr 0.85fr;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(90deg, rgba(0, 90, 180, 0.45) 0%, rgba(0, 50, 120, 0.35) 100%);
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-cyan);
  flex-shrink: 0;
  letter-spacing: 1px;
}
.table-scroll-wrap.large .thead {
  padding: 10px 18px;
  font-size: 14px;
}
.tbody {
  flex: 1;
  overflow: hidden;
  position: relative;
}
.tbody-inner {
  will-change: transform;
}
.tr {
  display: grid;
  grid-template-columns: 1.15fr 1.05fr 0.65fr 0.85fr;
  gap: 10px;
  padding: 10px 16px;
  height: 36px;
  align-items: center;
  font-size: 13px;
  border-bottom: 1px solid rgba(0, 100, 180, 0.14);
}
.table-scroll-wrap.large .tr {
  height: 40px;
  padding: 8px 18px;
  font-size: 14px;
}
.tr:nth-child(even) {
  background: rgba(0, 45, 95, 0.28);
}
.tr:hover {
  background: rgba(0, 120, 200, 0.22);
}
.mono {
  font-family: 'Share Tech Mono', monospace;
  color: #9fd8ff;
  font-weight: 500;
}
.comp {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.level-high { color: var(--danger); font-weight: 600; }
.level-medium { color: var(--warning); font-weight: 600; }
.level-low { color: var(--success); font-weight: 600; }
</style>
