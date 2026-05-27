<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  scorecard: { type: Array, default: () => [] },
  criticality: { type: Array, default: () => [] },
})
const chartRef = ref(null)
let chart = null

onMounted(() => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  update()
  window.addEventListener('resize', () => chart?.resize())
})

watch(() => [props.scorecard, props.criticality], update, { deep: true })

function update() {
  if (!chart) return
  const scoreNames = [
    '0-1', '1-2', '2-3', '3-4', '4-5',
    '5-6', '6-7', '7-8', '8-9', '9-10',
  ]
  const critNames = [
    '0-0.1', '0.1-0.2', '0.2-0.3', '0.3-0.4', '0.4-0.5',
    '0.5-0.6', '0.6-0.7', '0.7-0.8', '0.8-0.9', '0.9-1.0',
  ]
  const scorecardVals = props.scorecard.map((d) => d.value)
  const criticalityVals = props.criticality.map((d) => d.value)

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(8, 24, 48, 0.95)',
      borderColor: 'rgba(0, 180, 255, 0.5)',
      textStyle: { color: '#e0f4ff' },
      formatter: (p) => {
        const idx = p[0].dataIndex
        return [
          `Scorecard: ${scoreNames[idx]}（${p[0].value.toLocaleString()}）`,
          `Criticality: ${critNames[idx]}（${p[1].value.toLocaleString()}）`,
        ].join('<br/>')
      },
    },
    legend: {
      data: ['Scorecard（0-10）', 'Criticality（0-1）'],
      bottom: 0,
      textStyle: { color: '#7eb8e0', fontSize: 9 },
      itemWidth: 10,
      itemHeight: 6,
    },
    grid: { left: 46, right: 54, top: 4, bottom: 24 },
    xAxis: {
      type: 'value',
      show: false,
    },
    yAxis: [
      {
        type: 'category',
        data: scoreNames,
        inverse: true,
        axisLabel: { color: '#00d4ff', fontSize: 9 },
        axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.35)' } },
        position: 'left',
      },
      {
        type: 'category',
        data: critNames,
        inverse: true,
        axisLabel: { color: '#ffaa00', fontSize: 9 },
        axisLine: { lineStyle: { color: 'rgba(255, 170, 0, 0.35)' } },
        position: 'right',
      },
    ],
    series: [
      {
        name: 'Scorecard（0-10）',
        type: 'bar',
        data: scorecardVals,
        barWidth: 5,
        barGap: '20%',
        itemStyle: {
          borderRadius: [0, 2, 2, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: 'rgba(0, 100, 200, 0.5)' },
            { offset: 1, color: '#00d4ff' },
          ]),
        },
        emphasis: { itemStyle: { shadowBlur: 8 } },
        animationDuration: 1000,
        animationDelay: (idx) => idx * 40,
      },
      {
        name: 'Criticality（0-1）',
        type: 'bar',
        data: criticalityVals,
        barWidth: 5,
        itemStyle: {
          borderRadius: [0, 2, 2, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: 'rgba(180, 120, 0, 0.5)' },
            { offset: 1, color: '#ffaa00' },
          ]),
        },
        emphasis: { itemStyle: { shadowBlur: 8 } },
        animationDuration: 1000,
        animationDelay: (idx) => idx * 40,
      },
    ],
  })
}
</script>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
  min-height: 0;
  flex: 1;
}
</style>
