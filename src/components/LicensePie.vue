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
    color: ['#00d4ff', '#0066ff', '#7c3aed', '#2ed573', '#ffa502', '#ff4757'],
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(8, 24, 48, 0.95)',
      borderColor: 'rgba(0, 180, 255, 0.5)',
      textStyle: { color: '#e0f4ff' },
      formatter: '{b}: {c}%',
    },
    legend: {
      orient: 'vertical',
      right: 8,
      top: 'center',
      textStyle: { color: '#7eb8e0', fontSize: 10 },
      itemWidth: 10,
      itemHeight: 8,
    },
    series: [
      {
        name: '许可证',
        type: 'pie',
        radius: ['35%', '58%'],
        center: ['38%', '50%'],
        roseType: 'radius',
        itemStyle: {
          borderRadius: 4,
          borderColor: 'rgba(10, 20, 50, 0.9)',
          borderWidth: 1,
        },
        label: { color: '#e0f4ff', fontSize: 10 },
        emphasis: { scale: true },
        animationDuration: 1000,
        data: props.data,
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
