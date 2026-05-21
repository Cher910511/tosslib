<template>
  <article class="cc-card">
    <header class="cc-head">
      <div class="cc-who">
        <div class="cc-avatar" aria-hidden="true">{{ initials }}</div>
        <div class="cc-names">
          <div class="cc-name-line">
            <span class="cc-name">{{ contributor.name }}</span>
            <span class="cc-login">@{{ contributor.login }}</span>
          </div>
        </div>
      </div>
      <span class="cc-rank" :title="'排名 ' + contributor.rank">#{{ contributor.rank }}</span>
    </header>
    <div class="cc-stats">
      <span>{{ contributor.commits }} commits</span>
      <span class="cc-add">{{ formatNum(contributor.additions) }}+</span>
      <span class="cc-del">{{ formatNum(contributor.deletions) }}-</span>
    </div>
    <div ref="chartRef" class="cc-chart" />
  </article>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  contributor: {
    type: Object,
    required: true,
  },
})

const chartRef = ref(null)
let chart = null

const initials = computed(() => {
  const n = props.contributor.name || ''
  return n.length >= 2 ? n.slice(0, 2) : n.slice(0, 1) || '?'
})

function formatNum(n) {
  return typeof n === 'number' ? n.toLocaleString('zh-CN') : String(n)
}

const THEME_RED = '#da203e'
const THEME_RED_FILL = 'rgba(218, 32, 62, 0.14)'

function buildOption() {
  const raw = props.contributor.series || []
  if (raw.length === 0) {
    return {
      backgroundColor: 'transparent',
      grid: { left: 2, right: 4, top: 6, bottom: 22 },
      xAxis: { type: 'category', data: ['—'], show: false },
      yAxis: { type: 'value', show: false, min: 0, max: 1 },
      series: [{ type: 'line', data: [0], silent: true }],
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: 'middle',
          style: { text: '所选范围内无数据', fill: '#9ca3af', fontSize: 12 },
        },
      ],
    }
  }

  const dates = raw.map((p) => p.date.slice(5))
  const vals = raw.map((p) => p.value)
  const maxV = Math.max(1, ...vals)
  const yMax = Math.ceil(maxV * 1.15)

  return {
    backgroundColor: 'transparent',
    animationDuration: 400,
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const p = params[0]
        const full = raw[p.dataIndex]?.date ?? p.name
        return `${full}<br/>${p.value} commits`
      },
    },
    grid: { left: 2, right: 4, top: 6, bottom: 22 },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisTick: { show: false },
      axisLabel: { color: '#9ca3af', fontSize: 9 },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: yMax,
      splitNumber: 3,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#9ca3af', fontSize: 9 },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
    },
    series: [
      {
        type: 'line',
        smooth: 0.35,
        symbol: 'circle',
        symbolSize: vals.length <= 2 ? 5 : 4,
        showSymbol: vals.length <= 6,
        lineStyle: { width: 2, color: THEME_RED },
        itemStyle: { color: THEME_RED },
        areaStyle: { color: THEME_RED_FILL },
        data: vals,
      },
    ],
  }
}

function dispose() {
  chart?.dispose()
  chart = null
}

function render() {
  if (!chartRef.value) return
  if (!chart) chart = echarts.init(chartRef.value)
  chart.setOption(buildOption(), true)
  chart.resize()
}

onMounted(() => {
  nextTick(render)
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  dispose()
})

function resize() {
  chart?.resize()
}

watch(
  () => props.contributor,
  () => nextTick(render),
  { deep: true },
)
</script>

<style scoped>
.cc-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 14px 14px 10px;
  background: #fff;
  border: 1px solid #eceef2;
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.cc-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.cc-who {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.cc-avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #fcd34d;
}

.cc-names {
  min-width: 0;
}

.cc-name-line {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px 8px;
}

.cc-name {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

.cc-login {
  font-size: 12px;
  color: #9ca3af;
}

.cc-rank {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: #d1d5db;
}

.cc-stats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 16px;
  margin-bottom: 6px;
  font-size: 12px;
  color: #6b7280;
}

.cc-add {
  color: #16a34a;
  font-weight: 600;
}

.cc-del {
  color: #dc2626;
  font-weight: 600;
}

.cc-chart {
  width: 100%;
  height: 132px;
  min-height: 132px;
}
</style>
