<template>
  <div class="report-page">
    <!-- ===== 工具栏 ===== -->
    <div class="report-toolbar">
      <div class="report-toolbar-left">
        <svg class="report-logo" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        <h1 class="report-title">下载与接口看板</h1>
        <span class="report-subtitle">下载行为 · 制品分发 · OpenAPI 调用</span>
      </div>
      <div class="report-toolbar-right">
        <span class="report-refresh-hint">上次刷新：{{ lastRefresh }}</span>
        <select v-model="range" class="report-range" aria-label="时间范围" @change="onRangeChange">
          <option value="24h">最近 24 小时</option>
          <option value="7d">最近 7 天</option>
          <option value="30d">最近 30 天</option>
          <option value="90d">最近 90 天</option>
          <option value="custom">自定义</option>
        </select>
        <input type="date" class="report-date" :value="customStart" @change="onDateChange('start', $event.target.value)" aria-label="开始日期" />
        <span class="report-date-sep">至</span>
        <input type="date" class="report-date" :value="customEnd" @change="onDateChange('end', $event.target.value)" aria-label="结束日期" />
        <button type="button" class="report-refresh" @click="refresh">↻ 刷新</button>
      </div>
    </div>

    <!-- ===== KPI 行 ===== -->
    <div class="report-kpi-grid">
      <div v-for="k in kpiList" :key="k.label" class="report-kpi">
        <div class="report-kpi-hd">
          <span class="report-kpi-ico" :style="{ color: k.color, background: k.bg }" v-html="k.icon"></span>
          <span class="report-kpi-label">{{ k.label }}</span>
        </div>
        <div class="report-kpi-value" :style="{ color: k.color }">{{ k.value }}</div>
        <div v-if="range !== 'custom'" class="report-kpi-foot">
          <span :class="k.trend >= 0 ? 'trend-up' : 'trend-down'">{{ k.trend >= 0 ? '▲' : '▼' }} {{ Math.abs(k.trend) }}%</span>
          <span>较上周期</span>
        </div>
      </div>
    </div>

    <!-- ===== 面板网格 ===== -->
    <div class="report-grid">
      <!-- 下载趋势（图表） -->
      <section class="rpanel rpanel--wide">
        <header class="rpanel-hd">
          <h3 class="rpanel-title">下载趋势（软件 / 组件）</h3>
          <div class="rpanel-ops"><span class="rpanel-tag">下载</span></div>
        </header>
        <div class="rpanel-body"><div ref="downloadChartRef" class="rchart"></div></div>
      </section>

      <!-- 热门下载制品 Top10（表格） -->
      <section class="rpanel rpanel--half">
        <header class="rpanel-hd">
          <h3 class="rpanel-title">热门下载制品 Top10</h3>
          <div class="rpanel-ops">
            <span class="rpanel-tag">制品</span>
            <button type="button" class="report-export" @click="exportTop100('制品')">导出 Top100</button>
          </div>
        </header>
        <div class="rpanel-body rpanel-body--table">
          <table class="rtable">
            <thead>
              <tr>
                <th>#</th>
                <th>制品</th>
                <th>版本</th>
                <th>下载量</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in hotTop" :key="r.name">
                <td class="rtable-rank">{{ i + 1 }}</td>
                <td class="rtable-org">{{ r.name }}</td>
                <td>{{ r.version }}</td>
                <td>{{ r.count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 热门下载软件 Top10（表格，与制品并排） -->
      <section class="rpanel rpanel--half">
        <header class="rpanel-hd">
          <h3 class="rpanel-title">热门下载软件 Top10</h3>
          <div class="rpanel-ops">
            <span class="rpanel-tag">软件</span>
            <button type="button" class="report-export" @click="exportTop100('软件')">导出 Top100</button>
          </div>
        </header>
        <div class="rpanel-body rpanel-body--table">
          <table class="rtable">
            <thead>
              <tr>
                <th>#</th>
                <th>软件</th>
                <th>版本</th>
                <th>下载量</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in hotSoftware" :key="r.name">
                <td class="rtable-rank">{{ i + 1 }}</td>
                <td class="rtable-org">{{ r.name }}</td>
                <td>{{ r.version }}</td>
                <td>{{ r.count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- OpenAPI 调用趋势（图表） -->
      <section class="rpanel rpanel--wide">
        <header class="rpanel-hd">
          <h3 class="rpanel-title">OpenAPI 调用趋势</h3>
          <div class="rpanel-ops"><span class="rpanel-tag">接口</span></div>
        </header>
        <div class="rpanel-body"><div ref="openapiChartRef" class="rchart"></div></div>
      </section>

      <!-- 纯表格：接口调用明细 -->
      <section class="rpanel rpanel--wide">
        <header class="rpanel-hd">
          <h3 class="rpanel-title">接口调用明细</h3>
          <div class="rpanel-ops"><span class="rpanel-tag">Top10</span></div>
        </header>
        <div class="rpanel-body rpanel-body--table">
          <table class="rtable">
            <thead>
              <tr>
                <th>#</th>
                <th>接口</th>
                <th>调用次数</th>
                <th>成功率</th>
                <th>平均耗时</th>
                <th>调用组织数</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in apiDetail" :key="r.name">
                <td class="rtable-rank">{{ i + 1 }}</td>
                <td class="rtable-org">{{ r.name }}</td>
                <td>{{ r.count }}</td>
                <td>{{ r.success }}</td>
                <td>{{ r.latency }}</td>
                <td>{{ r.orgs }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import '../../../styles/report.css'

const range = ref('7d')
const lastRefresh = ref('--:--:--')
/** 自定义时间段的起止日期（默认近 7 天） */
const customStart = ref('2026-08-11')
const customEnd = ref('2026-08-17')

/** 日期格式化 YYYY-MM-DD */
function fmtDate(d) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 选择预设范围：自动更新日期框为对应区间，再刷新 */
function onRangeChange() {
  const days = RANGE_DAYS[range.value]
  if (days) {
    const end = new Date()
    const start = new Date(end.getTime() - (days - 1) * 86400000)
    customStart.value = fmtDate(start)
    customEnd.value = fmtDate(end)
  }
  refresh()
}

/** 手动改起止日期：自动切到「自定义」，再刷新 */
function onDateChange(which, val) {
  if (which === 'start') customStart.value = val
  else customEnd.value = val
  range.value = 'custom'
  refresh()
}

/** 时间范围 → 标签前缀 / 天数 */
const RANGE_LABEL = { '24h': '今日', '7d': '近7天', '30d': '近30天', '90d': '近90天', custom: '区间' }
const RANGE_DAYS = { '24h': 1, '7d': 7, '30d': 30, '90d': 90 }

/** KPI 随时间范围联动：总量类指标按范围天数放大，比率/均值类指标不变 */
const kpiList = computed(() => {
  const prefix = RANGE_LABEL[range.value] || '近30天'
  const days = range.value === 'custom'
    ? Math.max(1, Math.round((new Date(customEnd.value) - new Date(customStart.value)) / 86400000) + 1)
    : RANGE_DAYS[range.value] || 30
  const daily = { download: 3640, software: 2140, artifact: 1500, api: 58210 }
  return [
    { label: `${prefix}下载`, value: daily.download * days, icon: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>', color: '#da203e', bg: '#fef2f2', trend: -3.2 },
    { label: `${prefix}软件下载`, value: daily.software * days, icon: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>', color: '#2563eb', bg: '#eff6ff', trend: 5.6 },
    { label: `${prefix}制品下载`, value: daily.artifact * days, icon: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>', color: '#16a34a', bg: '#f0fdf4', trend: 8.3 },
    { label: `${prefix}OpenAPI 调用`, value: daily.api * days, icon: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>', color: '#d97706', bg: '#fff7ed', trend: 22.7 },
    { label: '调用成功率', value: '98.6%', icon: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>', color: '#16a34a', bg: '#f0fdf4', trend: 0.4 },
    { label: '平均响应时长', value: '86ms', icon: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>', color: '#8b5cf6', bg: '#f5f3ff', trend: -6.2 },
  ]
})

/** 表格数据：热门下载制品 Top10 */
const hotTop = [
  { name: 'Spring Boot', kind: '软件', version: '3.5.12', count: 1280 },
  { name: 'Redis', kind: '软件', version: '7.2.4', count: 980 },
  { name: 'Vue.js', kind: '软件', version: '3.5.13', count: 860 },
  { name: 'Nginx', kind: '软件', version: '1.26.0', count: 720 },
  { name: 'Kafka', kind: '软件', version: '3.9.2', count: 640 },
  { name: 'log4j-core', kind: '组件', version: '2.24.3', count: 460 },
  { name: 'spring-core', kind: '组件', version: '6.2.17', count: 420 },
  { name: 'jackson-databind', kind: '组件', version: '2.19.4', count: 380 },
  { name: 'Elasticsearch', kind: '软件', version: '8.15.0', count: 340 },
  { name: 'hibernate-core', kind: '组件', version: '6.6.44.Final', count: 310 },
]

/** 表格数据：热门下载软件 Top10 */
const hotSoftware = [
  { name: 'Spring Boot', version: '3.5.12', count: 1280 },
  { name: 'Redis', version: '7.2.4', count: 980 },
  { name: 'Vue.js', version: '3.5.13', count: 860 },
  { name: 'Nginx', version: '1.26.0', count: 720 },
  { name: 'Kafka', version: '3.9.2', count: 640 },
  { name: 'Elasticsearch', version: '8.15.0', count: 340 },
  { name: 'MySQL', version: '8.4.0', count: 290 },
  { name: 'PostgreSQL', version: '16.3', count: 250 },
  { name: 'Tomcat', version: '10.1.24', count: 220 },
  { name: 'Gradle', version: '8.9.0', count: 180 },
]

/** 纯表格数据：接口调用明细 */
const apiDetail = [
  { name: '/software/list', count: 18200, success: '99.1%', latency: '72ms', orgs: 46 },
  { name: '/component/list', count: 16400, success: '99.3%', latency: '68ms', orgs: 44 },
  { name: '/vuln/query', count: 11800, success: '98.8%', latency: '95ms', orgs: 40 },
  { name: '/download/create', count: 9400, success: '99.0%', latency: '81ms', orgs: 38 },
  { name: '/sbom/get', count: 7200, success: '98.5%', latency: '112ms', orgs: 34 },
  { name: '/license/query', count: 5600, success: '99.2%', latency: '64ms', orgs: 32 },
  { name: '/user/login', count: 4300, success: '99.6%', latency: '58ms', orgs: 48 },
  { name: '/train/list', count: 3800, success: '99.4%', latency: '60ms', orgs: 30 },
  { name: '/feedback/submit', count: 2900, success: '99.0%', latency: '88ms', orgs: 28 },
  { name: '/subscribe/toggle', count: 2400, success: '98.9%', latency: '76ms', orgs: 26 },
]

function genTrends(base, count, seed) {
  const out = []
  let v = seed
  for (let i = 0; i < count; i++) {
    v = Math.max(base * 0.3, v + (Math.random() - 0.45) * base * 0.18)
    out.push(Math.round(v))
  }
  return out
}
function genLabels() {
  if (range.value === 'custom') {
    // 自定义时间段：按起止日期生成每日标签（如 07-15 … 08-14）
    const start = new Date(customStart.value)
    const end = new Date(customEnd.value)
    const days = Math.max(1, Math.round((end - start) / 86400000) + 1)
    const pad = (n) => String(n).padStart(2, '0')
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(start.getTime() + i * 86400000)
      return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    })
  }
  const count = range.value === '24h' ? 24 : range.value === '7d' ? 7 : range.value === '90d' ? 12 : 30
  if (range.value === '24h') return Array.from({ length: count }, (_, i) => `${String(i).padStart(2, '0')}:00`)
  if (range.value === '7d') return Array.from({ length: count }, (_, i) => `周${'一二三四五六日'[i % 7]}`)
  return Array.from({ length: count }, (_, i) => `${i + 1}日`)
}

/* 仅保留两个趋势图表 */
const downloadChartRef = ref(null)
const openapiChartRef = ref(null)
let charts = []

const axisStyle = { axisLine: { lineStyle: { color: '#e5e7eb' } }, axisLabel: { color: '#6b7280', fontSize: 11 }, axisTick: { show: false } }
const splitLine = { splitLine: { lineStyle: { color: '#f3f4f6' } } }
const tooltipBase = { backgroundColor: 'rgba(255,255,255,0.96)', borderColor: '#e5e7eb', textStyle: { color: '#374151' } }
const legendBottom = { bottom: 0, textStyle: { fontSize: 11, color: '#6b7280' }, itemWidth: 12, itemHeight: 10 }

function initChart(elRef, option) {
  if (!elRef?.value) return
  const c = echarts.init(elRef.value)
  c.setOption(option)
  charts.push(c)
}

function renderAll() {
  const labels = genLabels()

  initChart(downloadChartRef, {
    color: ['#2563eb', '#16a34a'],
    tooltip: { ...tooltipBase, trigger: 'axis' },
    legend: { ...legendBottom, data: ['软件下载', '组件下载'] },
    grid: { left: 48, right: 14, top: 24, bottom: 36 },
    xAxis: { type: 'category', data: labels, ...axisStyle },
    yAxis: { type: 'value', ...splitLine, axisLabel: { color: '#9ca3af', fontSize: 10 } },
    series: [
      { name: '软件下载', type: 'line', smooth: true, symbolSize: 5, data: genTrends(260, labels.length, 260), areaStyle: { opacity: 0.08 } },
      { name: '组件下载', type: 'line', smooth: true, symbolSize: 5, data: genTrends(140, labels.length, 140) },
    ],
  })

  initChart(openapiChartRef, {
    tooltip: { ...tooltipBase, trigger: 'axis' },
    grid: { left: 48, right: 14, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: labels, ...axisStyle },
    yAxis: { type: 'value', ...splitLine, axisLabel: { color: '#9ca3af', fontSize: 10 } },
    series: [{
      name: '调用量', type: 'line', smooth: true, symbolSize: 5,
      lineStyle: { color: '#d97706', width: 2 },
      itemStyle: { color: '#d97706' },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(217,119,6,0.2)' }, { offset: 1, color: 'rgba(217,119,6,0.02)' }]) },
      data: genTrends(1900, labels.length, 1900),
    }],
  })
}

/** 导出热门下载 Top100（制品/软件）为 CSV 文件 */
function exportTop100(type) {
  // 基础数据（表格中的 Top10）
  const base = type === '软件' ? hotSoftware : hotTop
  // 生成 Top100：前 10 条用真实数据，其余按递减量补足到 100
  const rows = []
  let count = base[0]?.count ?? 1000
  for (let i = 0; i < 100; i++) {
    if (i < base.length) {
      rows.push({ ...base[i], rank: i + 1 })
    } else {
      count = Math.max(1, Math.round(count * 0.96))
      rows.push({
        rank: i + 1,
        name: `${type === '软件' ? '软件' : '制品'}${i + 1}`,
        kind: type,
        version: '—',
        count,
      })
    }
  }
  // 组装 CSV（加 BOM 保证 Excel 中文不乱码）
  const header = type === '软件'
    ? '排名,软件,版本,下载量'
    : '排名,制品,类型,版本,下载量'
  const lines = rows.map((r) => type === '软件'
    ? `${r.rank},${r.name},${r.version},${r.count}`
    : `${r.rank},${r.name},${r.kind},${r.version},${r.count}`)
  const csv = '\uFEFF' + [header, ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  // 文件名标注当前筛选的时间段
  const rangeLabel = RANGE_LABEL[range.value] || '近30天'
  const period = range.value === 'custom'
    ? `${customStart.value}至${customEnd.value}`
    : rangeLabel
  a.download = `热门下载${type}Top100_${period}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function refresh() {
  charts.forEach((c) => c.dispose())
  charts = []
  renderAll()
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  lastRefresh.value = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

let resizeHandler = null
onMounted(() => {
  refresh()
  resizeHandler = () => charts.forEach((c) => c.resize())
  window.addEventListener('resize', resizeHandler)
})
onUnmounted(() => {
  window.removeEventListener('resize', resizeHandler)
  charts.forEach((c) => c.dispose())
  charts = []
})
</script>
