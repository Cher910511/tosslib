<template>
  <div class="page">
    <div class="inner">
      <header class="page-head">
        <div>
          <h1 class="h1">数据大屏</h1>
        </div>
        <div class="clock">{{ now }}</div>
      </header>

      <!-- 原 AnalyticsKpiCards -->
      <div class="kpi-row section">
        <div
          v-for="m in analyticsKpiMetrics"
          :key="m.id"
          class="kpi-card"
          :class="'risk-' + m.risk"
        >
          <span class="lab">{{ m.label }}</span>
          <CountUp :end="m.value" :duration="2200" class="num" />
        </div>
      </div>

      <div class="grid-2 section">
        <div class="glow-card panel">
          <div class="panel-title">漏洞趋势</div>
          <VulnerabilityTrend :data="vulnerabilityTrend" />
        </div>
        <div class="glow-card panel">
          <div class="panel-title">漏洞分级分布</div>
          <VulnerabilityDonut :data="vulnerabilityRisk" />
        </div>
      </div>

      <div class="grid-2 section">
        <div class="glow-card panel">
          <div class="panel-title">组件主语言占比</div>
          <LicensePie :data="languageDistribution" />
        </div>
        <div class="glow-card panel">
          <div class="panel-title">许可证分布</div>
          <IndustryBar :data="licenseBarCounts" />
        </div>
      </div>

      <div class="glow-card panel map-panel section">
        <div class="panel-title">开发者与仓库地理分布</div>
        <WorldMapChart :developer-data="developerCountryData" :repo-data="repoCountryData" />
      </div>

      <div class="grid-2 section">
        <div class="glow-card panel">
          <div class="panel-title">开发者活跃度趋势</div>
          <div ref="devActivityChartRef" class="chart-dev-act"></div>
        </div>
        <div class="glow-card panel">
          <div class="panel-title">行业组件覆盖</div>
          <div ref="indRadarChartRef" class="chart-ind-radar"></div>
        </div>
      </div>

      <div class="grid-2 section bottom-grid">
        <div class="glow-card panel vuln-panel">
          <div class="panel-title">高危漏洞列表</div>
          <div class="vuln-wrap">
            <div class="vuln-thead">
              <span>CVE ID</span>
              <span>漏洞级别</span>
              <span>组件</span>
              <span>发布时间</span>
              <span>修复状态</span>
            </div>
            <div
              ref="vulnTbodyRef"
              class="vuln-tbody"
              @mouseenter="vulnPause = true"
              @mouseleave="vulnPause = false"
            >
              <div
                ref="vulnInnerRef"
                class="vuln-tbody-inner"
                :style="{ transform: `translate3d(0, -${vulnOffset}px, 0)` }"
              >
                <div
                  v-for="item in vulnScrollRows"
                  :key="item.key"
                  class="vuln-tr"
                  :class="{ 'row-alert': item.row.level === '高危' }"
                >
                  <span class="vuln-mono">{{ item.row.cveId }}</span>
                  <span :class="vulnLevelClass(item.row.level)">{{ item.row.level }}</span>
                  <span class="vuln-comp" :title="item.row.component">{{ item.row.component }}</span>
                  <span>{{ item.row.publishTime }}</span>
                  <span class="vuln-status">{{ item.row.fixStatus }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="glow-card panel">
          <div class="panel-title">依赖链网络</div>
          <div ref="depGraphChartRef" class="chart-dep-graph"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import CountUp from '../../components/CountUp.vue'
import VulnerabilityTrend from '../../components/VulnerabilityTrend.vue'
import VulnerabilityDonut from '../../components/VulnerabilityDonut.vue'
import LicensePie from '../../components/LicensePie.vue'
import IndustryBar from '../../components/IndustryBar.vue'
import WorldMapChart from '../../components/WorldMapChart.vue'
import {
  analyticsKpiMetrics,
  vulnerabilityTrend,
  vulnerabilityRisk,
  languageDistribution,
  licenseBarCounts,
  developerCountryData,
  repoCountryData,
  developerActivityTrend,
  industryRadar,
  highVulnDashboardList,
  dependencyGraph,
} from '../../data/mockData.js'

const now = ref('')
let clockTimer = null

function tickClock() {
  now.value = new Date().toLocaleString('zh-CN', {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

/* —— DevActivityChart —— */
const devActivityChartRef = ref(null)
let devActivityChart = null

function updateDevActivityChart() {
  if (!devActivityChart) return
  const labels = developerActivityTrend.map((d) => d.label)
  const vals = developerActivityTrend.map((d) => d.value)
  devActivityChart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(8, 24, 48, 0.95)',
      borderColor: 'rgba(0, 180, 255, 0.5)',
      textStyle: { color: '#e0f4ff' },
    },
    grid: { left: 48, right: 14, top: 18, bottom: 28 },
    xAxis: {
      type: 'category',
      data: labels,
      axisLine: { lineStyle: { color: 'rgba(0, 180, 255, 0.35)' } },
      axisLabel: { color: '#7eb8e0', fontSize: 9, rotate: 35 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(0, 100, 180, 0.12)' } },
      axisLabel: { color: '#7eb8e0', fontSize: 10 },
    },
    series: [
      {
        name: '活跃提交量',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, color: '#00ff88' },
        itemStyle: { color: '#00ff88' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 255, 136, 0.25)' },
            { offset: 1, color: 'rgba(0, 40, 60, 0.02)' },
          ]),
        },
        data: vals,
      },
    ],
  })
}

/* —— IndustryRadarChart —— */
const indRadarChartRef = ref(null)
let indRadarChart = null

function updateIndRadarChart() {
  if (!indRadarChart) return
  indRadarChart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: 'rgba(8, 24, 48, 0.95)',
      borderColor: 'rgba(0, 180, 255, 0.5)',
      textStyle: { color: '#e0f4ff' },
    },
    radar: {
      indicator: industryRadar.indicators,
      center: ['50%', '52%'],
      radius: '62%',
      axisName: { color: '#7eb8e0', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(0, 120, 200, 0.2)' } },
      splitArea: {
        areaStyle: {
          color: ['rgba(0, 40, 90, 0.35)', 'rgba(0, 25, 60, 0.25)'],
        },
      },
    },
    series: [
      {
        type: 'radar',
        name: '行业组件覆盖',
        data: [
          {
            value: industryRadar.values,
            name: '覆盖度',
            areaStyle: { color: 'rgba(0, 212, 255, 0.22)' },
            lineStyle: { color: '#00d4ff', width: 2 },
            itemStyle: { color: '#00d4ff' },
          },
        ],
      },
    ],
  })
}

/* —— DependencyGraphChart —— */
const depGraphChartRef = ref(null)
let depGraphChart = null

const depGraphCategories = [
  { name: '框架' },
  { name: '风险组件' },
  { name: '运行时' },
]

function updateDepGraphChart() {
  if (!depGraphChart) return
  const nodes = (dependencyGraph.nodes || []).map((n) => ({
    ...n,
    category: n.category ?? 0,
    label: { show: true, color: '#e0f4ff', fontSize: 10 },
  }))
  const links = dependencyGraph.links || []
  depGraphChart.setOption({
    backgroundColor: 'transparent',
    tooltip: {},
    legend: {
      show: true,
      bottom: 0,
      textStyle: { color: '#7eb8e0', fontSize: 10 },
      data: depGraphCategories.map((c) => c.name),
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        roam: true,
        draggable: true,
        force: {
          repulsion: 220,
          edgeLength: [80, 140],
        },
        categories: depGraphCategories,
        data: nodes,
        links,
        lineStyle: {
          color: 'source',
          curveness: 0.12,
          width: 1.2,
          opacity: 0.65,
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: { width: 2 },
        },
        itemStyle: {
          borderColor: 'rgba(0, 212, 255, 0.6)',
          borderWidth: 1,
        },
      },
    ],
  })
}

/* —— HighVulnDashboardTable（内联） —— */
const vulnRowH = ref(40)
const vulnViewportH = ref(240)
const vulnTbodyRef = ref(null)
const vulnInnerRef = ref(null)

const vulnSegmentH = computed(() => {
  const n = highVulnDashboardList.length
  if (n <= 0) return 0
  return n * vulnRowH.value
})

const vulnCopyCount = computed(() => {
  const n = highVulnDashboardList.length
  if (n <= 0) return 0
  const seg = vulnSegmentH.value
  if (seg <= 0) return 2
  const v = Math.max(0, vulnViewportH.value)
  return Math.max(2, Math.ceil(1 + v / seg) + 1)
})

const vulnScrollRows = computed(() => {
  if (!highVulnDashboardList.length || vulnCopyCount.value < 1) return []
  const out = []
  for (let c = 0; c < vulnCopyCount.value; c++) {
    highVulnDashboardList.forEach((row, r) => {
      out.push({ row, key: `${c}-${r}-${row.cveId ?? r}` })
    })
  }
  return out
})

const vulnOffset = ref(0)
const vulnPause = ref(false)
let vulnRaf = null
let vulnRo = null
let vulnAnimActive = false

function vulnMeasureSizes() {
  const tb = vulnTbodyRef.value
  if (tb) {
    const h = tb.clientHeight
    if (h > 0) vulnViewportH.value = h
  }
  const first = vulnInnerRef.value?.querySelector('.vuln-tr')
  if (first) {
    const h = first.getBoundingClientRect().height
    if (h > 0.5) vulnRowH.value = h
  }
  const period = highVulnDashboardList.length * vulnRowH.value
  if (period > 0 && vulnOffset.value >= period) {
    vulnOffset.value = vulnOffset.value % period
  }
}

function vulnScheduleMeasure() {
  nextTick(() => vulnMeasureSizes())
}

function vulnTick() {
  if (!vulnAnimActive) return
  if (!vulnPause.value && highVulnDashboardList.length > 0) {
    const period = vulnSegmentH.value
    if (period > 0) {
      vulnOffset.value += 0.5
      if (vulnOffset.value >= period) vulnOffset.value -= period
    }
  }
  vulnRaf = requestAnimationFrame(vulnTick)
}

function vulnLevelClass(l) {
  if (l === '高危') return 'vuln-level-high'
  if (l === '中危') return 'vuln-level-medium'
  return 'vuln-level-low'
}

watch(() => developerActivityTrend, updateDevActivityChart, { deep: true })

onMounted(() => {
  tickClock()
  clockTimer = setInterval(tickClock, 1000)

  if (devActivityChartRef.value) {
    devActivityChart = echarts.init(devActivityChartRef.value)
    updateDevActivityChart()
    window.addEventListener('resize', () => devActivityChart?.resize())
  }
  if (indRadarChartRef.value) {
    indRadarChart = echarts.init(indRadarChartRef.value)
    updateIndRadarChart()
    window.addEventListener('resize', () => indRadarChart?.resize())
  }
  if (depGraphChartRef.value) {
    depGraphChart = echarts.init(depGraphChartRef.value)
    updateDepGraphChart()
    window.addEventListener('resize', () => depGraphChart?.resize())
  }

  vulnScheduleMeasure()
  vulnRo = new ResizeObserver(() => vulnMeasureSizes())
  if (vulnTbodyRef.value) vulnRo.observe(vulnTbodyRef.value)
  vulnAnimActive = true
  vulnRaf = requestAnimationFrame(vulnTick)
})

watch(
  () => [industryRadar.indicators, industryRadar.values],
  () => updateIndRadarChart(),
  { deep: true }
)

watch(
  () => dependencyGraph,
  () => updateDepGraphChart(),
  { deep: true }
)

onUnmounted(() => {
  clearInterval(clockTimer)
  vulnAnimActive = false
  if (vulnRaf) cancelAnimationFrame(vulnRaf)
  if (vulnRo) vulnRo.disconnect()
  devActivityChart?.dispose()
  indRadarChart?.dispose()
  depGraphChart?.dispose()
})
</script>

<style scoped>
.page {
  position: relative;
  min-height: 100%;
  background: transparent;
  padding: 20px 22px 28px;
}
.inner {
  position: relative;
  z-index: 0;
  max-width: 1400px;
  margin: 0 auto;
}
.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}
.h1 {
  margin: 0 0 6px;
  font-size: 22px;
  letter-spacing: 3px;
  color: var(--text-primary);
}
.clock {
  font-family: 'Orbitron', sans-serif;
  font-size: 15px;
  color: var(--accent-cyan);
  text-shadow: 0 0 12px rgba(0, 212, 255, 0.35);
  flex-shrink: 0;
}
.section {
  margin-bottom: 14px;
}
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.panel {
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  min-height: 280px;
}
.map-panel {
  min-height: 420px;
}
.vuln-panel {
  min-height: 0;
  align-self: start;
}
.bottom-grid {
  align-items: start;
}

/* KPI 原 AnalyticsKpiCards */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}
.kpi-card {
  padding: 14px 16px;
  border-radius: 10px;
  background: var(--gradient-surface-kpi);
  border: 1px solid var(--border-card);
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.kpi-card.risk-high {
  border-color: var(--risk-high-border);
  box-shadow: var(--risk-high-glow);
}
.kpi-card.risk-medium {
  border-color: var(--risk-medium-border);
  box-shadow: var(--risk-medium-glow);
}
.kpi-card.risk-low {
  border-color: var(--risk-low-border);
}
.lab {
  font-size: 13px;
  color: var(--text-secondary);
  letter-spacing: 1px;
}
.num {
  font-size: 28px;
  font-weight: 800;
  color: var(--accent-cyan);
  line-height: 1.15;
}
.kpi-card.risk-high .num {
  color: var(--danger);
  text-shadow: 0 0 14px rgba(255, 71, 87, 0.35);
}
.kpi-card.risk-medium .num {
  color: var(--warning);
}
.kpi-card.risk-low .num {
  color: var(--success-bright);
}

.chart-dev-act,
.chart-ind-radar,
.chart-dep-graph {
  flex: 1;
  width: 100%;
  min-height: 220px;
}
.chart-ind-radar {
  min-height: 260px;
}
.chart-dep-graph {
  min-height: 280px;
}

/* 高危列表 */
.vuln-wrap {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  height: 280px;
  min-height: 0;
  border: 1px solid var(--vuln-panel-border);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--vuln-panel-shadow);
}
.vuln-thead {
  display: grid;
  grid-template-columns: 1.1fr 0.55fr 1fr 0.75fr 0.75fr;
  gap: 8px;
  padding: 10px 14px;
  background: var(--vuln-thead-gradient);
  font-size: 12px;
  font-weight: 700;
  color: var(--vuln-thead-text);
  letter-spacing: 1px;
  flex-shrink: 0;
}
.vuln-tbody {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
}
.vuln-tbody-inner {
  will-change: transform;
}
.vuln-tr {
  display: grid;
  grid-template-columns: 1.1fr 0.55fr 1fr 0.75fr 0.75fr;
  gap: 8px;
  padding: 8px 14px;
  height: 40px;
  box-sizing: border-box;
  align-items: center;
  font-size: 12px;
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
}
.vuln-tr:nth-child(even) {
  background: var(--table-row-alt);
}
.vuln-tr.row-alert {
  background: rgba(255, 71, 87, 0.08);
}
.vuln-tr:hover {
  background: var(--table-row-hover);
}
.vuln-mono {
  font-family: 'Share Tech Mono', monospace;
  color: var(--text-code);
}
.vuln-comp {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.vuln-status {
  color: var(--text-status-soft);
  font-size: 11px;
}
.vuln-level-high {
  color: var(--danger);
  font-weight: 700;
}
.vuln-level-medium {
  color: var(--warning);
  font-weight: 600;
}
.vuln-level-low {
  color: var(--success);
  font-weight: 600;
}

@media (max-width: 1200px) {
  .kpi-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 960px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .kpi-row {
    grid-template-columns: 1fr;
  }
}
</style>
