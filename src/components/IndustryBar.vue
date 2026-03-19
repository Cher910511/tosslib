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
  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(8, 24, 48, 0.95)',
      borderColor: 'rgba(0, 180, 255, 0.5)',
      textStyle: { color: '#e0f4ff' },
    },
    grid: { left: 44, right: 12, top: 8, bottom: 24 },
    xAxis: {
      type: 'category',
      data: props.data.map((d) => d.name),
      axisLabel: { color: '#7eb8e0', fontSize: 10, rotate: 25 },
      axisLine: { lineStyle: { color: 'rgba(0, 180, 255, 0.3)' } },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(0, 100, 180, 0.12)' } },
      axisLabel: { color: '#7eb8e0', fontSize: 10 },
    },
    series: [
      {
        name: '覆盖量',
        type: 'bar',
        barWidth: '50%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#00d4ff' },
            { offset: 1, color: 'rgba(0, 80, 180, 0.6)' },
          ]),
        },
        emphasis: { itemStyle: { shadowBlur: 12, shadowColor: 'rgba(0, 212, 255, 0.5)' } },
        data: props.data.map((d) => d.value),
        animationDelay: (idx) => idx * 80,
        animationDuration: 1200,
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
