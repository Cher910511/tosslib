<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

const WORLD_MAP_URL =
  'https://cdn.jsdelivr.net/npm/echarts@5.5.0/map/json/world.json'

const props = defineProps({
  developerData: { type: Array, default: () => [] },
  repoData: { type: Array, default: () => [] },
})
const chartRef = ref(null)
let chart = null
let mapReady = false

onMounted(async () => {
  if (!chartRef.value) return
  try {
    const res = await fetch(WORLD_MAP_URL)
    if (!res.ok) throw new Error('map http')
    const worldJson = await res.json()
    echarts.registerMap('world', worldJson)
    mapReady = true
  } catch (e) {
    try {
      const local = await fetch('/world.json')
      if (local.ok) {
        echarts.registerMap('world', await local.json())
        mapReady = true
      }
    } catch (_) {
      mapReady = false
    }
    if (!mapReady) console.warn('世界地图加载失败，请联网或将 world.json 放入 public/', e)
  }
  chart = echarts.init(chartRef.value)
  updateOption()
  window.addEventListener('resize', () => chart?.resize())
})

watch(
  () => [props.developerData, props.repoData],
  () => updateOption(),
  { deep: true }
)

function updateOption() {
  if (!chart) return
  const dev = props.developerData || []
  const repo = props.repoData || []

  if (!mapReady) {
    chart.setOption(
      {
        backgroundColor: 'transparent',
        graphic: [
          {
            type: 'text',
            left: 'center',
            top: '42%',
            style: {
              text: '世界地图未加载\n请联网或放置 public/world.json',
              fill: 'rgba(0, 180, 255, 0.65)',
              fontSize: 13,
              textAlign: 'center',
            },
          },
        ],
        series: [],
      },
      true
    )
    return
  }

  const devMax = Math.max(...dev.map((d) => d.value), 1)
  chart.setOption(
    {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(8, 24, 48, 0.95)',
        borderColor: 'rgba(0, 180, 255, 0.5)',
        textStyle: { color: '#e0f4ff' },
        formatter: (p) => {
          if (p.seriesName && p.value != null) {
            const v = Array.isArray(p.value) ? p.value[2] : p.value
            return `${p.seriesName}<br/>${p.name}: ${v?.toLocaleString?.() ?? v}`
          }
          return p.name || ''
        },
      },
      visualMap: {
        show: true,
        min: 0,
        max: devMax,
        left: 8,
        bottom: 24,
        text: ['高', '低'],
        textStyle: { color: '#7eb8e0', fontSize: 10 },
        inRange: {
          color: ['rgba(0, 40, 80, 0.9)', 'rgba(0, 120, 200, 0.85)', '#00d4ff'],
        },
        calculable: true,
        seriesIndex: 0,
      },
      geo: {
        map: 'world',
        roam: false,
        itemStyle: {
          areaColor: 'rgba(15, 45, 90, 0.85)',
          borderColor: 'rgba(0, 120, 200, 0.45)',
          borderWidth: 1,
        },
        emphasis: {
          itemStyle: { areaColor: 'rgba(0, 180, 255, 0.4)' },
          label: { show: false },
        },
      },
      series: [
        {
          name: '开发者国家热力',
          type: 'map',
          map: 'world',
          geoIndex: 0,
          data: dev.map((d) => ({ name: d.name, value: d.value })),
          itemStyle: { borderColor: 'rgba(0, 120, 200, 0.3)', borderWidth: 0.5 },
          emphasis: { label: { show: true, color: '#fff', fontSize: 10 } },
          animationDuration: 800,
        },
        {
          name: '开发者分布',
          type: 'scatter',
          coordinateSystem: 'geo',
          data: dev.map((d) => ({
            name: d.name,
            value: [...geoCoord(d.name), d.value],
          })),
          symbolSize: (val) => Math.max(8, Math.min(28, val[2] / 4000)),
          itemStyle: {
            color: '#00d4ff',
            borderColor: 'rgba(0, 212, 255, 0.6)',
            borderWidth: 1,
            shadowBlur: 10,
            shadowColor: 'rgba(0, 212, 255, 0.5)',
          },
          emphasis: { scale: 1.2 },
        },
        {
          name: '仓库分布',
          type: 'scatter',
          coordinateSystem: 'geo',
          data: repo.map((d) => ({
            name: d.name,
            value: [...geoCoord(d.name), d.value],
          })),
          symbolSize: (val) => Math.max(6, Math.min(22, val[2] / 25000)),
          itemStyle: {
            color: '#00ff88',
            borderColor: 'rgba(0, 255, 136, 0.6)',
            borderWidth: 1,
            shadowBlur: 8,
            shadowColor: 'rgba(0, 255, 136, 0.4)',
          },
          emphasis: { scale: 1.2 },
        },
      ],
    },
    true
  )
}

function geoCoord(name) {
  const map = {
    China: [105, 38],
    'United States': [-98, 38],
    Germany: [10.5, 51],
    'United Kingdom': [-2, 54],
    Japan: [138, 36],
    France: [2, 46],
    India: [78, 21],
    Canada: [-106, 56],
    Russia: [100, 60],
    Brazil: [-55, -10],
    'South Korea': [128, 36],
    Australia: [134, -25],
    Netherlands: [5, 52],
    Israel: [35, 31],
    Singapore: [104, 1.3],
    Spain: [-4, 40],
    Italy: [12, 43],
    Sweden: [15, 62],
    Poland: [20, 52],
    Ukraine: [31, 49],
  }
  return map[name] || [0, 0]
}
</script>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
  min-height: 260px;
}
</style>
