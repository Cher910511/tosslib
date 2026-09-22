<template>
  <div class="rk">
    <div
      v-for="(item, i) in data"
      :key="item.name"
      class="rk-row"
      :class="`rk-row--t${tierOf(i)}`"
    >
      <span class="rk-no" :class="`rk-no--t${tierOf(i)}`">{{ i + 1 }}</span>
      <span class="rk-name" :title="item.name">{{ item.name }}</span>
      <span class="rk-bar">
        <span class="rk-bar-fill" :style="{ width: barWidth(item.value) }" />
      </span>
      <span class="rk-value">{{ formatNum(item.value) }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

/**
 * Top10 榜单：名次 + 名称 + 占比条 + 数值。
 * 前三名用金银铜配色突出，条形长度按最大值归一化。
 */
const props = defineProps({
  /** [{ name, value }] */
  data: { type: Array, default: () => [] },
  /** 数值单位后缀 */
  unit: { type: String, default: '' },
})

const maxValue = computed(() => Math.max(1, ...props.data.map((d) => Number(d.value) || 0)))

/** 前三名分档：t1 金 / t2 银 / t3 铜 / t4 普通 */
function tierOf(index) {
  return index < 3 ? index + 1 : 4
}

function barWidth(value) {
  const pct = ((Number(value) || 0) / maxValue.value) * 100
  return `${Math.max(6, pct)}%`
}

function formatNum(n) {
  return Number(n || 0).toLocaleString()
}
</script>

<style scoped>
.rk {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 2px;
}
.rk-row {
  display: grid;
  grid-template-columns: 20px minmax(0, 1.35fr) minmax(0, 1fr) 56px;
  align-items: center;
  gap: 7px;
  min-height: 0;
  padding: 2px 0;
}
/* 名次徽标 */
.rk-no {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-family: 'Orbitron', -apple-system, sans-serif;
  font-size: 11px;
  font-weight: 700;
  color: #94A9C4;
  background: rgba(100, 116, 139, 0.22);
  border-radius: 4px;
}
.rk-no--t1 { color: #fff; background: linear-gradient(135deg, #F59E0B, #D97706); }
.rk-no--t2 { color: #fff; background: linear-gradient(135deg, #94A3B8, #64748B); }
.rk-no--t3 { color: #fff; background: linear-gradient(135deg, #D97706, #92400E); }

.rk-name {
  font-size: 12px;
  color: #C8D8EC;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.rk-row--t1 .rk-name { font-weight: 600; }

.rk-bar {
  height: 5px;
  background: rgba(0, 91, 203, 0.2);
  border-radius: 3px;
  overflow: hidden;
}
.rk-bar-fill {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, rgba(0, 91, 203, 0.35), #38BDF8);
}
.rk-row--t1 .rk-bar-fill { background: linear-gradient(90deg, rgba(245, 158, 11, 0.5), #F59E0B); }
.rk-row--t2 .rk-bar-fill { background: linear-gradient(90deg, rgba(148, 163, 184, 0.5), #94A3B8); }
.rk-row--t3 .rk-bar-fill { background: linear-gradient(90deg, rgba(217, 119, 6, 0.5), #D97706); }

.rk-value {
  font-family: 'Orbitron', -apple-system, sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #38BDF8;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
</style>
