<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

/**
 * 多系列折线图（浅色主题）。
 * 用于「开源风险情报趋势分析」：横轴年份，多图例对比。
 */
const props = defineProps({
  /** 横轴类目 */
  categories: { type: Array, default: () => [] },
  /** [{ name, color, data: number[] }] */
  series: { type: Array, default: () => [] },
  /** 纵轴最大值（不传则自适应） */
  max: { type: Number, default: null },
})

const chartRef = ref(null)
let chart = null
let ro = null

const AXIS_TEXT = '#7C93B0'
const SPLIT = 'rgba(0, 91, 203, 0.18)'

function update() {
  if (!chart) return
  const vals = props.series.flatMap((s) => s.data || [])
  const dataMax = vals.length ? Math.max(...vals) : 0
  // 纵轴取整到「万」的整数倍，刻度更干净
  const axisMax = props.max != null
    ? props.max
    : Math.ceil(dataMax / 50000) * 50000

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 22, 40, 0.96)',
      borderColor: 'rgba(0, 91, 203, 0.45)',
      borderWidth: 1,
      padding: [8, 12],
      textStyle: { color: '#E2ECF8', fontSize: 12 },
      extraCssText: 'box-shadow: 0 8px 24px rgba(0, 0, 0, 0.55); border-radius: 6px;',
      axisPointer: { type: 'line', lineStyle: { color: 'rgba(0, 91, 203, 0.35)', type: 'dashed' } },
      formatter: (ps) => {
        const head = `<div style="font-weight:600;margin-bottom:4px">${ps[0].axisValue} 年</div>`
        const rows = ps
          .map((p) => `<div style="display:flex;gap:8px;justify-content:space-between">
            <span>${p.marker}${p.seriesName}</span><b>${Number(p.value).toLocaleString()}</b></div>`)
          .join('')
        return head + rows
      },
    },
    legend: {
      top: 0,
      right: 0,
      itemWidth: 10,
      itemHeight: 6,
      itemGap: 12,
      icon: 'roundRect',
      textStyle: { color: AXIS_TEXT, fontSize: 11 },
    },
    grid: { left: 8, right: 8, top: 28, bottom: 4, containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.categories,
      axisLabel: { color: AXIS_TEXT, fontSize: 11 },
      axisLine: { lineStyle: { color: 'rgba(0, 91, 203, 0.2)' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      max: axisMax,
      splitLine: { lineStyle: { color: SPLIT } },
      axisLabel: {
        color: AXIS_TEXT,
        fontSize: 11,
        formatter: (v) => (v >= 10000 ? `${v / 10000}万` : v),
      },
      axisLine: { show: false },
    },
    series: props.series.map((s) => ({
      name: s.name,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      showSymbol: false,
      data: s.data,
      lineStyle: { width: 2, color: s.color },
      itemStyle: { color: s.color },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: `${s.color}33` },
          { offset: 1, color: `${s.color}00` },
        ]),
      },
      emphasis: { focus: 'series', scale: 1.4 },
      animationDuration: 1100,
    })),
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
watch(() => [props.categories, props.series, props.max], update, { deep: true })
onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  ro?.disconnect()
  chart?.dispose()
  chart = null
})
</script>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
  min-height: 0;
  flex: 1;
}
</style>
