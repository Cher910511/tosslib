<template>
  <div class="report-page">
    <!-- ===== 工具栏 ===== -->
    <div class="report-toolbar">
      <div class="report-toolbar-left">
        <svg class="report-logo" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        <h1 class="report-title">访问行为看板</h1>
        <span class="report-subtitle">页面浏览 · 登录</span>
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
      <!-- 页面浏览趋势（图表） -->
      <section class="rpanel rpanel--wide">
        <header class="rpanel-hd">
          <h3 class="rpanel-title">页面浏览趋势（PV / UV）</h3>
          <div class="rpanel-ops"><span class="rpanel-tag">全站</span></div>
        </header>
        <div class="rpanel-body"><div ref="pvuvChartRef" class="rchart"></div></div>
      </section>

      <!-- 页面浏览 Top10（表格） -->
      <section class="rpanel rpanel--half">
        <header class="rpanel-hd">
          <h3 class="rpanel-title">页面浏览 Top10</h3>
          <div class="rpanel-ops"><span class="rpanel-tag">页面</span></div>
        </header>
        <div class="rpanel-body rpanel-body--table">
          <table class="rtable">
            <thead>
              <tr>
                <th>#</th>
                <th>页面</th>
                <th>PV</th>
                <th>UV</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in pageTop" :key="r.name">
                <td class="rtable-rank">{{ i + 1 }}</td>
                <td class="rtable-org">{{ r.name }}</td>
                <td>{{ r.pv }}</td>
                <td>{{ r.uv }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 纯表格：页面访问明细（全部页面，可滑动） -->
      <section class="rpanel rpanel--half">
        <header class="rpanel-hd">
          <h3 class="rpanel-title">页面访问明细</h3>
          <div class="rpanel-ops"><span class="rpanel-tag">全部</span></div>
        </header>
        <div class="rpanel-body rpanel-body--table page-detail-scroll">
          <table class="rtable">
            <thead>
              <tr>
                <th>#</th>
                <th>页面</th>
                <th>PV</th>
                <th>UV</th>
                <th>人均 PV</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in pageDetail" :key="r.name">
                <td class="rtable-rank">{{ i + 1 }}</td>
                <td class="rtable-org">{{ r.name }}</td>
                <td>{{ r.pv }}</td>
                <td>{{ r.uv }}</td>
                <td>{{ (r.pv / r.uv).toFixed(1) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 纯表格：用户活跃排行 -->
      <section class="rpanel rpanel--wide">
        <header class="rpanel-hd">
          <h3 class="rpanel-title">用户活跃排行</h3>
          <div class="rpanel-ops"><span class="rpanel-tag">Top10</span></div>
        </header>
        <div class="rpanel-body rpanel-body--table">
          <table class="rtable">
            <thead>
              <tr>
                <th>#</th>
                <th>用户</th>
                <th>组织</th>
                <th>停留时长</th>
                <th>PV</th>
                <th>最近访问</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in userActive" :key="r.name">
                <td class="rtable-rank">{{ i + 1 }}</td>
                <td class="rtable-org">{{ r.name }}</td>
                <td>{{ r.org }}</td>
                <td>{{ r.duration }}</td>
                <td>{{ r.pv }}</td>
                <td>{{ r.last }}</td>
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

/** KPI 随时间范围联动：PV/UV 按天数缩放，人均 PV/新访客占比（比率类）保持 */
const kpiList = computed(() => {
  const prefix = RANGE_LABEL[range.value] || '近30天'
  const days = range.value === 'custom'
    ? Math.max(1, Math.round((new Date(customEnd.value) - new Date(customStart.value)) / 86400000) + 1)
    : RANGE_DAYS[range.value] || 30
  const k = days / 30
  return [
    { label: `${prefix}PV`, value: Math.round(128400 * k), icon: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>', color: '#da203e', bg: '#fef2f2', trend: 12.4 },
    { label: `${prefix}UV`, value: Math.round(8923 * k), icon: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>', color: '#2563eb', bg: '#eff6ff', trend: 8.1 },
    { label: `${prefix}人均 PV`, value: (14.4 * k).toFixed(1), icon: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>', color: '#8b5cf6', bg: '#f5f3ff', trend: 4.1 },
    { label: `${prefix}新访客占比`, value: '38.5%', icon: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>', color: '#0891b2', bg: '#ecfeff', trend: 3.6 },
  ]
})

/** 表格数据：页面浏览 Top10（PV/UV） */
const pageTop = [
  { name: '软件库', pv: 48200, uv: 8600 },
  { name: '组件库', pv: 42100, uv: 7400 },
  { name: '首页', pv: 38600, uv: 8920 },
  { name: '软件详情', pv: 32400, uv: 6100 },
  { name: 'AI 助手', pv: 21800, uv: 4200 },
  { name: '组件详情', pv: 19300, uv: 3800 },
  { name: '工具集', pv: 14200, uv: 2900 },
  { name: '检测报告', pv: 9800, uv: 2100 },
  { name: '版本火车', pv: 7600, uv: 1500 },
  { name: '组织管理', pv: 5400, uv: 1200 },
]

/** 纯表格数据：页面访问明细（全部页面） */
const pageDetail = [
  { name: '软件库', pv: 48200, uv: 8600 },
  { name: '组件库', pv: 42100, uv: 7400 },
  { name: '首页', pv: 38600, uv: 8920 },
  { name: '软件详情', pv: 32400, uv: 6100 },
  { name: 'AI 助手', pv: 21800, uv: 4200 },
  { name: '组件详情', pv: 19300, uv: 3800 },
  { name: '工具集', pv: 14200, uv: 2900 },
  { name: '检测报告', pv: 9800, uv: 2100 },
  { name: '版本火车', pv: 7600, uv: 1500 },
  { name: '组织管理', pv: 5400, uv: 1200 },
  { name: '漏洞中心', pv: 4600, uv: 980 },
  { name: '许可证管理', pv: 3800, uv: 860 },
  { name: '软件出入库', pv: 3200, uv: 740 },
  { name: '需求反馈', pv: 2800, uv: 620 },
  { name: '数据看板', pv: 2400, uv: 560 },
  { name: '个人设置', pv: 1900, uv: 480 },
]

/** 纯表格数据：用户活跃排行 */
const userActive = [
  { name: '张建国', org: '中国工商银行', duration: '12h 40m', pv: 12840, last: '2026-08-11 09:42' },
  { name: '李思远', org: '华为技术有限公司', duration: '10h 22m', pv: 11420, last: '2026-08-11 09:18' },
  { name: '陈晓峰', org: '阿里巴巴集团', duration: '9h 05m', pv: 9860, last: '2026-08-11 08:56' },
  { name: '王明远', org: '平安科技', duration: '8h 48m', pv: 8740, last: '2026-08-11 08:31' },
  { name: '赵小明', org: '中国工商银行', duration: '7h 33m', pv: 7620, last: '2026-08-11 08:12' },
  { name: '郑子轩', org: '华为技术有限公司', duration: '6h 57m', pv: 6940, last: '2026-08-10 18:40' },
  { name: '周雅琴', org: '平安科技', duration: '6h 12m', pv: 6210, last: '2026-08-10 17:25' },
  { name: '刘子涵', org: '阿里巴巴集团', duration: '5h 46m', pv: 5680, last: '2026-08-10 16:58' },
  { name: '钱丽华', org: '中国工商银行', duration: '5h 03m', pv: 5120, last: '2026-08-10 16:12' },
  { name: '冯雨萱', org: '华为技术有限公司', duration: '4h 39m', pv: 4460, last: '2026-08-10 15:47' },
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

/* 仅保留 PV/UV 趋势图表 */
const pvuvChartRef = ref(null)
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
  initChart(pvuvChartRef, {
    color: ['#da203e', '#2563eb'],
    tooltip: { ...tooltipBase, trigger: 'axis' },
    legend: { ...legendBottom, data: ['PV', 'UV'] },
    grid: { left: 48, right: 14, top: 24, bottom: 36 },
    xAxis: { type: 'category', data: labels, ...axisStyle },
    yAxis: { type: 'value', ...splitLine, axisLabel: { color: '#9ca3af', fontSize: 10 } },
    series: [
      { name: 'PV', type: 'line', smooth: true, symbolSize: 5, data: genTrends(4200, labels.length, 4200), areaStyle: { opacity: 0.08 } },
      { name: 'UV', type: 'line', smooth: true, symbolSize: 5, data: genTrends(320, labels.length, 320) },
    ],
  })
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
