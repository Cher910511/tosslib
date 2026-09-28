<template>
  <div class="donut">
    <div ref="chartRef" class="donut-chart" :class="{ 'is-full': hideLegend }"></div>
    <!-- 图例：右侧竖排，显示名称与占比（hideLegend 时不渲染，整宽让给主图） -->
    <ul v-if="!hideLegend" class="donut-legend">
      <li v-for="d in data" :key="d.name" class="donut-legend-item">
        <span class="donut-dot" :style="{ background: d.color }" />
        <span class="donut-name">{{ d.name }}</span>
        <span class="donut-value" :style="{ color: d.color }">{{ d.value }}{{ unit }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

/**
 * 环形图 + 右侧图例（浅色主题）。
 * 用于「漏洞风险分析」「指标完成情况」「用户行为分布」等。
 */
const props = defineProps({
  /** [{ name, value, color }] */
  data: { type: Array, default: () => [] },
  /** 单位后缀（如 %） */
  unit: { type: String, default: '%' },
  /** 中心显示的总计文案（不传则显示总数） */
  centerLabel: { type: String, default: '' },
  /** 环宽占比 */
  radius: { type: Array, default: () => ['58%', '78%'] },
  /** 玫瑰图：扇形半径按数值占比展开（主图更饱满，避免两侧留白） */
  rose: { type: Boolean, default: false },
  /** 隐藏右侧图例，把整个面板宽度让给主图 */
  hideLegend: { type: Boolean, default: false },
  /** 在扇形上直接显示数值标签（替代图例读数） */
  showValueLabel: { type: Boolean, default: false },
})

const chartRef = ref(null)
let chart = null
let ro = null

function update() {
  if (!chart) return
  const total = props.data.reduce((s, d) => s + (Number(d.value) || 0), 0)
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
      formatter: (p) => `${p.marker}${p.name}<br/><b>${p.value}${props.unit}</b>`,
    },
    // 中心总计
    graphic: props.centerLabel
      ? [{
        type: 'text',
        left: 'center',
        top: 'middle',
        style: { text: props.centerLabel, fill: '#56C2FF', fontSize: 12, fontWeight: 600 },
      }]
      : [],
    series: [
      {
        type: 'pie',
        // 玫瑰图：半径按数值占比展开，扇形更饱满
        roseType: props.rose ? 'radius' : false,
        radius: props.radius,
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        // 数值标签：扇形上直接显示数值，替代图例读数
        label: props.showValueLabel
          ? {
            show: true,
            position: 'inside',
            color: '#FFFFFF',
            fontSize: 11,
            fontWeight: 600,
            formatter: (p) => `${p.name}\n${p.value}`,
          }
          : { show: false },
        labelLine: { show: false },
        itemStyle: { borderColor: '#FFFFFF', borderWidth: 2 },
        emphasis: { scale: true, scaleSize: 6 },
        data: props.data.map((d) => ({
          name: d.name,
          value: d.value,
          itemStyle: { color: d.color },
        })),
        animationDuration: 900,
        animationType: 'scale',
      },
    ],
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
watch(() => [props.data, props.unit, props.centerLabel, props.rose, props.showValueLabel], update, { deep: true })
onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  ro?.disconnect()
  chart?.dispose()
  chart = null
})
</script>

<style scoped>
.donut {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}
.donut-chart {
  flex: 0 0 52%;
  height: 100%;
  min-height: 0;
}
/* 隐藏图例时主图独占整宽 */
.donut-chart.is-full { flex: 1 1 auto; width: 100%; }
.donut-legend {
  flex: 1;
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.donut-legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}
.donut-dot {
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  border-radius: 2px;
}
.donut-name {
  flex: 1;
  min-width: 0;
  color: #9DC0E4;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.donut-value {
  flex-shrink: 0;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
</style>
