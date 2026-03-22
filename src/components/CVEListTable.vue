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
  border: 1px solid var(--border-card);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--inset-panel-soft);
}
.thead {
  display: grid;
  grid-template-columns: 1.15fr 1.05fr 0.65fr 0.85fr;
  gap: 10px;
  padding: 12px 16px;
  background: var(--gradient-table-head-cyan);
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
  border-bottom: 1px solid var(--table-cell-border);
}
.table-scroll-wrap.large .tr {
  height: 40px;
  padding: 8px 18px;
  font-size: 14px;
}
.tr:nth-child(even) {
  background: var(--table-row-alt);
}
.tr:hover {
  background: var(--table-row-hover);
}
.mono {
  font-family: 'Share Tech Mono', monospace;
  color: var(--text-code);
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
