<template>
  <div class="stackbar">
    <div ref="chartRef" class="stackbar-chart"></div>
    <!-- 图例：名称 + 数值 + 占比（横排，随宽度换行） -->
    <ul class="stackbar-legend">
      <li v-for="d in data" :key="d.name" class="stackbar-legend-item">
        <span class="stackbar-dot" :style="{ background: d.color }" />
        <span class="stackbar-name">{{ d.name }}</span>
        <span class="stackbar-value" :style="{ color: d.color }">{{ fmt(d.value) }}</span>
        <span class="stackbar-percent">{{ percentOf(d.value) }}%</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

/**
 * 百分比堆叠条：把若干等级在「总量」中的占比堆成一条横向色带。
 * 用于「漏洞风险等级分布」——单维分布，堆叠条比环形图更易读出各档占比。
 *
 * 实现要点：横向堆叠需要「每个等级一个 series」且共用 stack 名，
 * 单 series 多数据点会渲染成并排的多个柱子，达不到堆叠效果。
 */
const props = defineProps({
  /** [{ name, value, color }] */
  data: { type: Array, default: () => [] },
  /** 堆叠条粗细（px 或百分比字符串）。堆叠条属横向细带，不宜过粗 */
  barWidth: { type: [Number, String], default: 26 },
  /** 段内数值标签的最小占比阈值（%，低于此值不显示，避免文字溢出小段） */
  labelMinPercent: { type: Number, default: 7 },
})

const chartRef = ref(null)
let chart = null
let ro = null

const AXIS_TEXT = '#9DC0E4'

const totalOf = () => props.data.reduce((s, d) => s + (Number(d.value) || 0), 0) || 1
const fmt = (n) => Number(n || 0).toLocaleString()
const percentOf = (v) => Number(((Number(v) || 0) / totalOf()) * 100).toFixed(1)

function update() {
  if (!chart) return
  const total = totalOf()

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(10, 22, 40, 0.96)',
      borderColor: 'rgba(0, 145, 255, 0.45)',
      borderWidth: 1,
      padding: [8, 12],
      textStyle: { color: '#E2ECF8', fontSize: 12 },
      extraCssText: 'box-shadow: 0 8px 24px rgba(0, 0, 0, 0.55); border-radius: 6px;',
      formatter: (p) => `${p.marker}${p.seriesName}<br/><b>${fmt(p.value)}</b>（${percentOf(p.value)}%）`,
    },
    grid: { left: 0, right: 0, top: 0, bottom: 0, containLabel: false },
    xAxis: { type: 'value', max: total, show: false },
    yAxis: { type: 'category', data: [''], show: false, axisLine: { show: false } },
    series: props.data.map((d) => {
      const pct = (Number(d.value) || 0) / total * 100
      return {
        name: d.name,
        type: 'bar',
        stack: 'total',
        barWidth: props.barWidth,
        itemStyle: { color: d.color },
        label: {
          // 段太窄时隐藏文字，否则数字会溢出色块
          show: pct >= props.labelMinPercent,
          position: 'inside',
          color: '#FFFFFF',
          fontSize: 12,
          fontWeight: 600,
          formatter: () => fmt(d.value),
        },
        emphasis: { itemStyle: { shadowBlur: 12, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
        data: [Number(d.value) || 0],
      }
    }),
    animationDuration: 900,
    animationDelay: (idx) => idx * 90,
  }, true)
}

function init() {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  update()
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => chart?.resize())
    ro.observe(chartRef.value)
  }
  window.addEventListener('resize', onResize)
}

function onResize() {
  chart?.resize()
}

onMounted(init)
watch(() => [props.data, props.barWidth], update, { deep: true })
onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  ro?.disconnect()
  chart?.dispose()
  chart = null
})
</script>

<style scoped>
.stackbar {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}
.stackbar-chart {
  width: 100%;
  flex: 0 0 auto;
  /* 高度只需容纳条形粗细 + 少量留白（ECharts 会把 bar 垂直居中） */
  height: 48px;
  min-height: 0;
}
/* 图例：横排 + 自动换行，与深色面板一致 */
.stackbar-legend {
  flex-shrink: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px 16px;
}
.stackbar-legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  white-space: nowrap;
}
.stackbar-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 2px;
}
.stackbar-name { color: #9DC0E4; }
.stackbar-value {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.stackbar-percent {
  color: #6F94BC;
  font-variant-numeric: tabular-nums;
}
</style>
