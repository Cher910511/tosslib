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
          <div class="panel-title">制品主语言占比</div>
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
          <div class="panel-title">漏洞新增趋势</div>
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
              <span>风险等级</span>
              <span>漏洞编号</span>
              <span>所属软件</span>
              <span>发布时间</span>
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
                  :class="{ 'row-alert': Number(item.row.vuln_score) >= 7 }"
                >
                  <span><span :class="['vuln-risk-tag', riskClass(item.row.vuln_score)]">{{ riskLabel(item.row.vuln_score) }}</span></span>
                  <span class="vuln-mono">{{ item.row.vuln_public_id }}</span>
                  <span class="vuln-comp" :title="item.row.comp_name">{{ item.row.comp_name }}</span>
                  <span>{{ (item.row.vuln_created_at || '').slice(0, 10) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="glow-card panel">
          <div class="dep-graph-head">
            <div class="panel-title">依赖链网络</div>
            <select
              class="dep-graph-select"
              :value="activeDepGraph"
              aria-label="选择软件"
              @change="onDepGraphChange"
            >
              <option v-for="name in depGraphNames" :key="name" :value="name">{{ name }}</option>
            </select>
          </div>
          <div ref="depGraphChartRef" class="chart-dep-graph"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { useClock } from '../../composables/useClock'
import { useAutoScroll } from '../../composables/useAutoScroll'
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
  vulnAddedTrend,
  industryRadar,
  highVulnDashboardList,
  dependencyGraphs,
} from '../../data/mockData.js'

const now = useClock().now

/* —— 所有 echarts 实例统一管理 —— */
const chartInstances = []
function registerChart(chart) {
  if (chart) chartInstances.push(chart)
}
function onWindowResize() {
  chartInstances.forEach((c) => c.resize())
}

/* —— DevActivityChart —— */
const devActivityChartRef = ref(null)
let devActivityChart = null

function updateDevActivityChart() {
  if (!devActivityChart) return
  const labels = vulnAddedTrend.map((d) => d.label)
  const vals = vulnAddedTrend.map((d) => d.value)
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
        name: '漏洞新增数',
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
  { name: '父节点' },
  { name: '二级依赖' },
  { name: '三级依赖' },
]
const depGraphNames = Object.keys(dependencyGraphs)
const activeDepGraph = ref(depGraphNames[0])

function onDepGraphChange(e) {
  activeDepGraph.value = e.target.value
}

function updateDepGraphChart() {
  if (!depGraphChart) return
  const graph = dependencyGraphs[activeDepGraph.value] || { nodes: [], links: [] }
  const nodes = (graph.nodes || []).map((n) => ({
    ...n,
    category: n.category ?? 0,
    label: { show: true, color: '#e0f4ff', fontSize: 10 },
  }))
  const links = graph.links || []
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
      out.push({ row, key: `${c}-${r}-${row.vuln_public_id ?? r}` })
    })
  }
  return out
})

const vulnOffset = ref(0)
const vulnPause = ref(false)
let vulnRo = null

const { offset: autoOffset, pause: autoPause } = useAutoScroll({ speed: 0.5 })

/* 同步 autoOffset → vulnOffset，并处理 wrap-around */
watch(autoOffset, (v) => {
  const period = vulnSegmentH.value
  if (period > 0) {
    const wrapped = v >= period ? v % period : v
    vulnOffset.value = wrapped
    /* 当 wrap 发生时，将 autoOffset 拉回，避免累积误差 */
    if (v >= period) autoOffset.value = 0
  }
})

watch(autoPause, (v) => { vulnPause.value = v })
watch(vulnPause, (v) => { autoPause.value = v })

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
}

function vulnScheduleMeasure() {
  nextTick(() => vulnMeasureSizes())
}

/** 风险等级：≥9 超危、≥7 高危、≥4 中危、其余低危 */
function riskClass(s) {
  const v = Number(s)
  if (v >= 9) return 'risk-critical'
  if (v >= 7) return 'risk-high'
  if (v >= 4) return 'risk-medium'
  return 'risk-low'
}
function riskLabel(s) {
  const v = Number(s)
  if (v >= 9) return '超危'
  if (v >= 7) return '高危'
  if (v >= 4) return '中危'
  return '低危'
}

watch(() => vulnAddedTrend, updateDevActivityChart, { deep: true })

onMounted(() => {
  if (devActivityChartRef.value) {
    devActivityChart = echarts.init(devActivityChartRef.value)
    registerChart(devActivityChart)
    updateDevActivityChart()
  }
  if (indRadarChartRef.value) {
    indRadarChart = echarts.init(indRadarChartRef.value)
    registerChart(indRadarChart)
    updateIndRadarChart()
  }
  if (depGraphChartRef.value) {
    depGraphChart = echarts.init(depGraphChartRef.value)
    registerChart(depGraphChart)
    updateDepGraphChart()
  }
  window.addEventListener('resize', onWindowResize)

  vulnScheduleMeasure()
  vulnRo = new ResizeObserver(() => vulnMeasureSizes())
  if (vulnTbodyRef.value) vulnRo.observe(vulnTbodyRef.value)
})

watch(
  () => [industryRadar.indicators, industryRadar.values],
  () => updateIndRadarChart(),
  { deep: true }
)

watch(
  () => activeDepGraph,
  () => updateDepGraphChart(),
  { deep: true }
)

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
  if (vulnRo) vulnRo.disconnect()
  chartInstances.length = 0
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
  align-self: stretch;
}
.bottom-grid {
  align-items: stretch;
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

/* 依赖链网络 · 标题与软件下拉同行 */
.dep-graph-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.dep-graph-head .panel-title {
  margin-bottom: 0;
}
.dep-graph-select {
  padding: 4px 12px;
  border: 1px solid rgba(0, 180, 255, 0.35);
  border-radius: 6px;
  background: rgba(0, 40, 90, 0.4);
  font-size: 12px;
  font-family: inherit;
  color: var(--accent-cyan);
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s, background 0.15s;
}
.dep-graph-select:hover,
.dep-graph-select:focus {
  border-color: var(--accent-cyan);
  background: rgba(0, 60, 120, 0.5);
}
.dep-graph-select option {
  background: #0a1a38;
  color: #e0f4ff;
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
  grid-template-columns: 0.8fr 1.1fr 1fr 0.75fr;
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
  grid-template-columns: 0.8fr 1.1fr 1fr 0.75fr;
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
.vuln-risk-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  border: 1px solid transparent;
  white-space: nowrap;
}
.vuln-risk-tag.risk-critical {
  color: #ff6b9d;
  background: rgba(255, 50, 120, 0.2);
  border-color: rgba(255, 80, 140, 0.45);
}
.vuln-risk-tag.risk-high {
  color: var(--danger);
  background: rgba(255, 71, 87, 0.15);
  border-color: rgba(255, 71, 87, 0.4);
}
.vuln-risk-tag.risk-medium {
  color: var(--warning);
  background: rgba(255, 165, 2, 0.12);
  border-color: rgba(255, 165, 2, 0.35);
}
.vuln-risk-tag.risk-low {
  color: var(--success);
  background: rgba(46, 213, 115, 0.12);
  border-color: rgba(46, 213, 115, 0.35);
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
