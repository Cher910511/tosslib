<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: { type: Array, default: () => [] },
})
const chartRef = ref(null)
let chart = null

onMounted(() => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  update()
  window.addEventListener('resize', () => chart?.resize())
})

watch(() => props.data, update, { deep: true })

function update() {
  if (!chart) return
  const names = props.data.map((d) => d.name)
  const vals = props.data.map((d) => d.value)
  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(8, 24, 48, 0.95)',
      borderColor: 'rgba(0, 180, 255, 0.5)',
      textStyle: { color: '#e0f4ff' },
      formatter: (p) => {
        const x = p[0]
        return `${x.name}<br/>${x.value.toLocaleString()}`
      },
    },
    grid: { left: 52, right: 16, top: 8, bottom: 8 },
    xAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(0, 100, 180, 0.12)' } },
      axisLabel: { color: '#7eb8e0', fontSize: 9 },
    },
    yAxis: {
      type: 'category',
      data: names,
      inverse: true,
      axisLabel: { color: '#7eb8e0', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(0, 180, 255, 0.25)' } },
    },
    series: [
      {
        type: 'bar',
        data: vals,
        barWidth: 10,
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: 'rgba(0, 100, 200, 0.5)' },
            { offset: 1, color: '#00d4ff' },
          ]),
        },
        emphasis: { itemStyle: { shadowBlur: 10 } },
        animationDuration: 1000,
        animationDelay: (idx) => idx * 50,
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
