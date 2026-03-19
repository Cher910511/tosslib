<template>
  <div class="news-feed">
    <div class="thead">
      <span class="col-time">时间</span>
      <span class="col-level">等级</span>
      <span class="col-comp">软件</span>
      <span class="col-cve">关联CVE</span>
      <span class="col-status">状态</span>
      <span class="col-detail">摘要</span>
    </div>
    <div
      class="tbody"
      @mouseenter="pause = true"
      @mouseleave="pause = false"
    >
      <div class="tbody-inner" :style="{ transform: `translateY(-${offset}px)` }">
        <div
          v-for="(row, i) in doubledList"
          :key="`${row.id}-${i}`"
          class="tr"
        >
          <span class="col-time mono">{{ row.time }}</span>
          <span class="col-level">
            <span :class="['badge-level', levelClass(row.level)]">{{ row.level }}</span>
          </span>
          <span class="col-comp" :title="row.component">{{ row.component }}</span>
          <span class="col-cve mono" :title="formatCve(row.cve)">{{ formatCve(row.cve) }}</span>
          <span class="col-status">
            <span :class="['badge-status', statusClass(row.status)]">{{ row.status }}</span>
          </span>
          <div class="col-detail">
            <div class="title-line" :title="row.title">{{ row.title }}</div>
            <div class="content-line" :title="row.content">{{ row.content }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  list: { type: Array, default: () => [] },
})

/** 每条资讯块高度（与样式 .tr min-height + 边框一致） */
const ROW_H = 76

const doubledList = computed(() => [...props.list, ...props.list])
const offset = ref(0)
const pause = ref(false)
let raf = null

function tick() {
  if (!pause.value) {
    offset.value += 0.45
    const total = props.list.length * ROW_H
    if (total > 0 && offset.value >= total) offset.value = 0
  }
  raf = requestAnimationFrame(tick)
}

function formatCve(cve) {
  if (!cve || !cve.length) return '—'
  return cve.join('、')
}

function levelClass(l) {
  if (l === '严重') return 'lv-critical'
  if (l === '高危') return 'lv-high'
  if (l === '中危') return 'lv-medium'
  if (l === '低危') return 'lv-low'
  return 'lv-default'
}

function statusClass(s) {
  if (s === '已修复') return 'st-fixed'
  if (s === '已被利用') return 'st-exploited'
  if (s === '待修复') return 'st-pending'
  if (s === '部分修复') return 'st-partial'
  return 'st-default'
}

onMounted(() => {
  raf = requestAnimationFrame(tick)
})
onUnmounted(() => cancelAnimationFrame(raf))
</script>

<style scoped>
.news-feed {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid rgba(0, 212, 255, 0.28);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 0 20px rgba(0, 60, 120, 0.12);
}
.thead {
  display: grid;
  grid-template-columns: 132px 56px 108px minmax(100px, 1.1fr) 76px minmax(140px, 2fr);
  gap: 8px;
  align-items: center;
  padding: 10px 12px;
  background: linear-gradient(90deg, rgba(0, 100, 200, 0.5) 0%, rgba(0, 50, 110, 0.4) 100%);
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-cyan);
  letter-spacing: 1px;
  flex-shrink: 0;
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
  grid-template-columns: 132px 56px 108px minmax(100px, 1.1fr) 76px minmax(140px, 2fr);
  gap: 8px;
  align-items: center;
  padding: 10px 12px;
  min-height: 76px;
  border-bottom: 1px solid rgba(0, 100, 180, 0.14);
  font-size: 12px;
}
.tr:nth-child(even) {
  background: rgba(0, 40, 85, 0.22);
}
.tr:hover {
  background: rgba(0, 110, 200, 0.18);
}
.mono {
  font-family: 'Share Tech Mono', monospace;
  color: #9fd8ff;
  font-size: 11px;
  line-height: 1.35;
}
.col-time {
  word-break: break-all;
}
.col-comp {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-primary);
}
.col-cve {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.badge-level,
.badge-status {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
  border: 1px solid transparent;
}
.lv-critical {
  color: #ff6b9d;
  background: rgba(255, 50, 120, 0.2);
  border-color: rgba(255, 80, 140, 0.45);
}
.lv-high {
  color: var(--danger);
  background: rgba(255, 71, 87, 0.15);
  border-color: rgba(255, 71, 87, 0.4);
}
.lv-medium {
  color: var(--warning);
  background: rgba(255, 165, 2, 0.12);
  border-color: rgba(255, 165, 2, 0.35);
}
.lv-low {
  color: var(--success);
  background: rgba(46, 213, 115, 0.12);
  border-color: rgba(46, 213, 115, 0.35);
}
.lv-default {
  color: #7eb8e0;
  background: rgba(0, 100, 180, 0.2);
}
.st-fixed {
  color: var(--success);
  background: rgba(46, 213, 115, 0.12);
  border-color: rgba(46, 213, 115, 0.35);
}
.st-exploited {
  color: #ff4757;
  background: rgba(255, 50, 80, 0.18);
  border-color: rgba(255, 80, 100, 0.5);
  box-shadow: 0 0 8px rgba(255, 60, 90, 0.25);
}
.st-pending {
  color: var(--warning);
  background: rgba(255, 165, 2, 0.12);
  border-color: rgba(255, 165, 2, 0.4);
}
.st-partial {
  color: #00d4ff;
  background: rgba(0, 212, 255, 0.1);
  border-color: rgba(0, 212, 255, 0.35);
}
.st-default {
  color: var(--text-secondary);
  background: rgba(0, 60, 120, 0.25);
}
.col-detail {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.title-line {
  font-size: 13px;
  font-weight: 600;
  color: #e8f4ff;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.content-line {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
