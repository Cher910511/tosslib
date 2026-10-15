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

const AXIS_TEXT = '#9DC0E4'
const SPLIT = 'rgba(0, 145, 255, 0.18)'

/**
 * 纵轴上限取「整齐档位」：1 / 1.5 / 2 / 2.5 / 3 / 4 / 5 / 6 / 8 / 10 × 10^n。
 * 旧实现写死按 5 万取整，在万级数据（如 2.5 万）下会浪费近一半高度。
 */
function niceMax(v) {
  if (!v || v <= 0) return null
  const mag = Math.pow(10, Math.floor(Math.log10(v)))
  const norm = v / mag
  const steps = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]
  return mag * (steps.find((s) => norm <= s) ?? 10)
}

/** 单条纵轴配置；右侧轴不画分割线，避免与左轴网格线重叠 */
function axisCfg(max, showSplit, color) {
  return {
    type: 'value',
    max,
    splitLine: showSplit ? { lineStyle: { color: SPLIT } } : { show: false },
    axisLabel: {
      // 轴刻度取该轴首个系列的颜色，让「哪条线挂哪个轴」一眼可辨
      color: color || AXIS_TEXT,
      fontSize: 11,
      fontWeight: 'bold',
      formatter: (v) => (v >= 10000 ? `${v / 10000}万` : v),
    },
    // 轴基线染色，与刻度同色，强化左右轴的视觉归属
    axisLine: showSplit
      ? { show: true, lineStyle: { color: color || 'rgba(0, 145, 255, 0.2)' } }
      : { show: true, lineStyle: { color: color || SPLIT } },
  }
}

function update() {
  if (!chart) return
  // 按 series.axis 拆分左右两组：量级差异大的曲线（万级 vs 千级）走双纵轴，
  // 否则小量级曲线会被压成贴底直线。无人标记 axis:'right' 时行为与旧版一致（单轴）。
  const hasRight = props.series.some((s) => s.axis === 'right')
  const leftSeries = props.series.filter((s) => s.axis !== 'right')
  const rightSeries = props.series.filter((s) => s.axis === 'right')
  const leftVals = leftSeries.flatMap((s) => s.data || [])
  const rightVals = rightSeries.flatMap((s) => s.data || [])
  const leftMax = props.max != null ? props.max : niceMax(Math.max(...leftVals, 0))
  const rightMax = niceMax(Math.max(...rightVals, 0))
  /**
   * 复合图方案（需求：现在看不出哪两条线用左侧单位、哪两条用右侧单位）：
   *   左轴 = 折线（源码数 / 制品数，万级）
   *   右轴 = 柱状（漏洞感知 / 版本更新，千级）
   * 两条纵轴的刻度与基线各取该轴系列色 → 左右归属一眼可辨；
   * 图例文案补「（左轴）/（右轴）」后缀，避免用户靠猜。
   * 仅在双轴模式（存在 axis:'right'）下启用柱状，单轴用法行为不变。
   */
  const rightIsBar = hasRight
  const leftColor = leftSeries[0]?.color
  const rightColor = rightSeries[0]?.color

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 22, 40, 0.96)',
      borderColor: 'rgba(0, 145, 255, 0.45)',
      borderWidth: 1,
      padding: [8, 12],
      textStyle: { color: '#E2ECF8', fontSize: 12 },
      extraCssText: 'box-shadow: 0 8px 24px rgba(0, 0, 0, 0.55); border-radius: 6px;',
      axisPointer: { type: 'line', lineStyle: { color: 'rgba(0, 91, 203, 0.35)', type: 'dashed' } },
      formatter: (ps) => {
        const head = `<div style="font-weight:600;margin-bottom:4px">${ps[0].axisValue}</div>`
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
      // 双轴时在图例名后标注所属轴，配合轴刻度着色，一眼看出哪条挂哪个轴
      formatter: hasRight
        ? (name) => {
            const s = props.series.find((x) => x.name === name)
            return s && s.axis === 'right' ? `${name}（右轴）` : `${name}（左轴）`
          }
        : undefined,
    },
    grid: { left: 8, right: 8, top: 28, bottom: 4, containLabel: true },
    xAxis: {
      type: 'category',
      // 右侧为柱状，需要留出柱宽间隙（折线用 false 更贴合）
      boundaryGap: rightIsBar,
      data: props.categories,
      axisLabel: { color: AXIS_TEXT, fontSize: 11 },
      axisLine: { lineStyle: { color: 'rgba(0, 91, 203, 0.2)' } },
      axisTick: { show: false },
    },
    yAxis: hasRight
      ? [axisCfg(leftMax, true, leftColor), axisCfg(rightMax, false, rightColor)]
      : axisCfg(leftMax, true),
    series: props.series.map((s) => {
      const isRight = hasRight && s.axis === 'right'
      // 复合图：右轴系列用柱状，与左轴折线在「图形类型」上直接区分开
      if (isRight) {
        return {
          name: s.name,
          type: 'bar',
          yAxisIndex: 1,
          data: s.data,
          barMaxWidth: 14,
          itemStyle: { color: s.color, borderRadius: [2, 2, 0, 0] },
          emphasis: { focus: 'series' },
          animationDuration: 1100,
        }
      }
      return {
        name: s.name,
        type: 'line',
        yAxisIndex: 0,
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
      }
    }),
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
