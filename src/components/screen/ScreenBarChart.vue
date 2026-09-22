<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

/**
 * 通用条形/柱状图（浅色主题，主题色 #005BCB）。
 * 支持横向条形与纵向柱状，纵向可切换对数刻度（如仓库所属国家分布）。
 */
const props = defineProps({
  /** [{ name, value }] */
  data: { type: Array, default: () => [] },
  /** horizontal = 横向条形；vertical = 纵向柱状 */
  direction: { type: String, default: 'horizontal' },
  /** 纵向柱状时是否使用对数刻度 */
  log: { type: Boolean, default: false },
  /** 主轴色（默认主题蓝） */
  color: { type: String, default: '#005BCB' },
  /** 是否显示数值标签 */
  showValue: { type: Boolean, default: false },
  /** 对数刻度的范围（仅 log 为 true 时生效） */
  logMin: { type: Number, default: 100 },
  logMax: { type: Number, default: 100000 },
})

const chartRef = ref(null)
let chart = null
let ro = null

const AXIS_TEXT = '#7C93B0'
const SPLIT = 'rgba(0, 91, 203, 0.18)'

function tooltipBase() {
  return {
    backgroundColor: 'rgba(10, 22, 40, 0.96)',
    borderColor: 'rgba(0, 91, 203, 0.45)',
    borderWidth: 1,
    padding: [8, 12],
    textStyle: { color: '#E2ECF8', fontSize: 12 },
    extraCssText: 'box-shadow: 0 8px 24px rgba(0, 0, 0, 0.55); border-radius: 6px;',
  }
}

function update() {
  if (!chart) return
  const names = props.data.map((d) => d.name)
  const vals = props.data.map((d) => Number(d.value) || 0)
  const horizontal = props.direction === 'horizontal'

  const categoryAxis = {
    type: 'category',
    data: names,
    axisLabel: { color: AXIS_TEXT, fontSize: 11, interval: 0 },
    axisLine: { lineStyle: { color: 'rgba(0, 91, 203, 0.2)' } },
    axisTick: { show: false },
  }
  const valueAxis = {
    type: props.log && !horizontal ? 'log' : 'value',
    logBase: 10,
    min: props.log && !horizontal ? props.logMin : undefined,
    max: props.log && !horizontal ? props.logMax : undefined,
    splitLine: { lineStyle: { color: SPLIT } },
    axisLabel: {
      color: AXIS_TEXT,
      fontSize: 11,
      formatter: (v) => (v >= 1000 ? `${v / 1000}k` : v),
    },
    axisLine: { show: false },
  }

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(0, 91, 203, 0.06)' } },
      ...tooltipBase(),
      formatter: (p) => {
        const x = p[0]
        return `${x.name}<br/><b>${Number(x.value).toLocaleString()}</b>`
      },
    },
    grid: horizontal
      ? { left: 8, right: 34, top: 8, bottom: 4, containLabel: true }
      : { left: 8, right: 12, top: 16, bottom: 4, containLabel: true },
    xAxis: horizontal ? valueAxis : categoryAxis,
    yAxis: horizontal ? { ...categoryAxis, inverse: true } : valueAxis,
    series: [
      {
        type: 'bar',
        data: vals,
        barWidth: horizontal ? 9 : 16,
        itemStyle: {
          borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
          color: new echarts.graphic.LinearGradient(
            horizontal ? 0 : 0, horizontal ? 0 : 1,
            horizontal ? 1 : 0, horizontal ? 0 : 0,
            [
              { offset: 0, color: `${props.color}66` },
              { offset: 1, color: props.color },
            ],
          ),
        },
        label: props.showValue
          ? {
            show: true,
            position: horizontal ? 'right' : 'top',
            color: props.color,
            fontSize: 11,
            fontWeight: 600,
            formatter: (p) => Number(p.value).toLocaleString(),
          }
          : { show: false },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: `${props.color}55` } },
        animationDuration: 900,
        animationDelay: (idx) => idx * 60,
      },
    ],
  }, true)
}

function init() {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  update()
  // 容器尺寸变化时重绘（大屏缩放不触发 window.resize）
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
watch(() => [props.data, props.direction, props.log, props.color, props.showValue], update, { deep: true })
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
