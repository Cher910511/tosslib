<template>
  <div class="report-page">
    <!-- ===== 工具栏 ===== -->
    <div class="report-toolbar">
      <div class="report-toolbar-left">
        <svg class="report-logo" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        <h1 class="report-title">业务与系统看板</h1>
        <span class="report-subtitle">需求反馈 · 订阅 · 版本火车 · AI 助手</span>
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
      <!-- 需求反馈类型分布（表格） -->
      <section class="rpanel rpanel--half">
        <header class="rpanel-hd">
          <h3 class="rpanel-title">需求反馈类型分布</h3>
          <div class="rpanel-ops"><span class="rpanel-tag">反馈</span></div>
        </header>
        <div class="rpanel-body rpanel-body--table">
          <table class="rtable">
            <thead>
              <tr>
                <th>反馈类型</th>
                <th>数量</th>
                <th>占比</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in feedbackTypeDist" :key="r.type">
                <td>{{ r.type }}</td>
                <td>{{ r.count }}</td>
                <td>{{ r.pct }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 需求反馈提交趋势（图表，替代无数据的订阅统计） -->
      <section class="rpanel rpanel--half">
        <header class="rpanel-hd">
          <h3 class="rpanel-title">需求反馈提交趋势</h3>
          <div class="rpanel-ops"><span class="rpanel-tag">反馈</span></div>
        </header>
        <div class="rpanel-body"><div ref="feedbackTrendChartRef" class="rchart"></div></div>
      </section>

      <!-- 版本火车状态分布（扇形图） -->
      <section class="rpanel rpanel--half">
        <header class="rpanel-hd">
          <h3 class="rpanel-title">版本火车状态分布</h3>
          <div class="rpanel-ops"><span class="rpanel-tag">后端统计</span></div>
        </header>
        <div class="rpanel-body"><div ref="trainChartRef" class="rchart"></div></div>
      </section>

      <!-- 版本火车 Top（表格，软件/组件 tab 切换） -->
      <section class="rpanel rpanel--half">
        <header class="rpanel-hd">
          <h3 class="rpanel-title">版本火车热门组成</h3>
          <div class="rpanel-ops">
            <div class="train-tabs">
              <button
                type="button"
                class="train-tab"
                :class="{ 'is-active': trainType === '软件' }"
                @click="trainType = '软件'"
              >软件</button>
              <button
                type="button"
                class="train-tab"
                :class="{ 'is-active': trainType === '组件' }"
                @click="trainType = '组件'"
              >组件</button>
            </div>
          </div>
        </header>
        <div class="rpanel-body rpanel-body--table">
          <table class="rtable">
            <thead>
              <tr>
                <th>#</th>
                <th>{{ trainType }}</th>
                <th>版本</th>
                <th>加入次数</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in trainTopFiltered" :key="r.name">
                <td class="rtable-rank">{{ i + 1 }}</td>
                <td class="rtable-org">{{ r.name }}</td>
                <td>{{ r.version }}</td>
                <td>{{ r.count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- AI 助手对话趋势（图表） -->
      <section class="rpanel rpanel--wide">
        <header class="rpanel-hd">
          <h3 class="rpanel-title">AI 助手对话趋势</h3>
          <div class="rpanel-ops"><span class="rpanel-tag">后端统计</span></div>
        </header>
        <div class="rpanel-body"><div ref="aiChartRef" class="rchart"></div></div>
      </section>

      <!-- AI 组织使用排行（表格） -->
      <section class="rpanel rpanel--half">
        <header class="rpanel-hd">
          <h3 class="rpanel-title">AI 组织使用排行</h3>
          <div class="rpanel-ops"><span class="rpanel-tag">后端统计</span></div>
        </header>
        <div class="rpanel-body rpanel-body--table">
          <table class="rtable">
            <thead>
              <tr>
                <th>#</th>
                <th>组织</th>
                <th>使用人数</th>
                <th>对话次数</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in aiOrgRank" :key="r.org">
                <td class="rtable-rank">{{ i + 1 }}</td>
                <td class="rtable-org">{{ r.org }}</td>
                <td>{{ r.users }}</td>
                <td>{{ r.dialogs }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- AI 提问次数分布（表格） -->
      <section class="rpanel rpanel--half">
        <header class="rpanel-hd">
          <h3 class="rpanel-title">AI 提问次数分布</h3>
          <div class="rpanel-ops"><span class="rpanel-tag">后端统计</span></div>
        </header>
        <div class="rpanel-body rpanel-body--table">
          <table class="rtable">
            <thead>
              <tr>
                <th>提问次数</th>
                <th>用户数</th>
                <th>占比</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in aiScaleDist" :key="r.range">
                <td>{{ r.range }}</td>
                <td>{{ r.count }}</td>
                <td>{{ r.pct }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 纯表格：需求反馈明细 -->
      <section class="rpanel rpanel--wide">
        <header class="rpanel-hd">
          <h3 class="rpanel-title">需求反馈明细</h3>
          <div class="rpanel-ops"><span class="rpanel-tag">Top10</span></div>
        </header>
        <div class="rpanel-body rpanel-body--table">
          <table class="rtable">
            <thead>
              <tr>
                <th>#</th>
                <th>用户</th>
                <th>组织</th>
                <th>反馈类型</th>
                <th>内容摘要</th>
                <th>提交时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in feedbackDetail" :key="r.id">
                <td class="rtable-rank">{{ i + 1 }}</td>
                <td class="rtable-org">{{ r.user }}</td>
                <td>{{ r.org }}</td>
                <td>{{ r.type }}</td>
                <td class="rtable-text" :title="r.content">{{ r.content }}</td>
                <td>{{ r.time }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 纯表格：活跃组织排行 -->
      <section class="rpanel rpanel--full">
        <header class="rpanel-hd">
          <h3 class="rpanel-title">活跃组织排行</h3>
          <div class="rpanel-ops"><span class="rpanel-tag">Top10</span></div>
        </header>
        <div class="rpanel-body rpanel-body--table">
          <table class="rtable">
            <thead>
              <tr>
                <th>#</th>
                <th>组织</th>
                <th>登录人数</th>
                <th>PV</th>
                <th>下载量</th>
                <th>OpenAPI 调用</th>
                <th>AI 对话</th>
                <th>明细</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in orgRank" :key="r.org">
                <td class="rtable-rank">{{ i + 1 }}</td>
                <td class="rtable-org">{{ r.org }}</td>
                <td>{{ r.login }}</td>
                <td>{{ r.pv }}</td>
                <td>{{ r.download }}</td>
                <td>{{ r.api }}</td>
                <td>{{ r.ai }}</td>
                <td><button type="button" class="rtable-link" @click="openOrgDetail(r)">查看</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ===== 组织成员明细弹窗 ===== -->
      <Teleport to="body">
        <div v-if="orgDetail" class="od-overlay" @click.self="closeOrgDetail">
          <div class="od-dialog">
            <div class="od-hd">
              <h3 class="od-title">{{ orgDetail.org }} · 组织成员明细</h3>
              <button type="button" class="od-close" @click="closeOrgDetail">&times;</button>
            </div>
            <div class="od-body">
              <table class="rtable">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>用户</th>
                    <th>登录次数</th>
                    <th>PV</th>
                    <th>UV</th>
                    <th>下载量</th>
                    <th>OpenAPI</th>
                    <th>AI 对话</th>
                    <th>最近活跃时间</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(m, i) in orgDetailMembers" :key="m.user">
                    <td class="rtable-rank">{{ i + 1 }}</td>
                    <td class="rtable-org">{{ m.user }}</td>
                    <td>{{ m.login }}</td>
                    <td>{{ m.pv }}</td>
                    <td>{{ m.uv }}</td>
                    <td>{{ m.download }}</td>
                    <td>{{ m.api }}</td>
                    <td>{{ m.ai }}</td>
                    <td>{{ m.lastActive }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Teleport>
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

/** KPI 随时间范围联动：增量类（需求反馈/AI 对话）按天数缩放，存量类（订阅/版本火车/活跃组织）保持原值 */
const kpiList = computed(() => {
  const prefix = RANGE_LABEL[range.value] || '近30天'
  const days = range.value === 'custom'
    ? Math.max(1, Math.round((new Date(customEnd.value) - new Date(customStart.value)) / 86400000) + 1)
    : RANGE_DAYS[range.value] || 30
  const k = days / 30
  return [
    { label: `${prefix}需求反馈`, value: Math.round(186 * k), icon: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>', color: '#da203e', bg: '#fef2f2', trend: 3.4 },
    { label: `${prefix}订阅总数`, value: 12840, icon: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>', color: '#2563eb', bg: '#eff6ff', trend: 6.8 },
    { label: `${prefix}版本火车`, value: 50, icon: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="13" rx="2"/><path d="M8 21l2-5M16 21l-2-5M4 13h16"/></svg>', color: '#16a34a', bg: '#f0fdf4', trend: 4.2 },
    { label: `${prefix}AI 对话次数`, value: Math.round(6840 * k), icon: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="14" rx="2"/><rect x="9" y="8" width="6" height="4" rx="1"/><path d="M9 15h6M12 2v2M12 20v2"/></svg>', color: '#d97706', bg: '#fff7ed', trend: 18.6 },
    { label: `${prefix}活跃组织`, value: 48, icon: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1M14 9h1M9 13h1M14 13h1M9 17h1M14 17h1"/></svg>', color: '#0891b2', bg: '#ecfeff', trend: 7.1 },
  ]
})

/** 表格数据：需求反馈类型分布 */
const feedbackTypeDist = [
  { type: '资源缺失', count: 34, pct: 34 },
  { type: '功能需求', count: 26, pct: 26 },
  { type: '使用体验', count: 15, pct: 15 },
  { type: '异常反馈', count: 12, pct: 12 },
  { type: '权限安全', count: 7, pct: 7 },
  { type: '账号登录', count: 4, pct: 4 },
  { type: '其他', count: 2, pct: 2 },
]

/** 表格数据：版本火车状态分布 */
const trainStatus = [
  { status: '已发车', count: 24, pct: 48 },
  { status: '待发车', count: 12, pct: 24 },
  { status: '已过期', count: 9, pct: 18 },
]

/** 表格数据：版本火车热门组成（软件 / 组件 分组） */
const trainTop = [
  // 软件
  { name: 'Apache Log4j', type: '软件', version: '2.24.3', count: 18 },
  { name: 'Spring Boot', type: '软件', version: '3.5.12', count: 15 },
  { name: 'Guava', type: '软件', version: '33.4.0', count: 12 },
  { name: 'Jackson Databind', type: '软件', version: '2.19.4', count: 10 },
  { name: 'Redis', type: '软件', version: '7.2.4', count: 9 },
  { name: 'Nginx', type: '软件', version: '1.26.0', count: 8 },
  { name: 'Kafka', type: '软件', version: '3.9.2', count: 6 },
  { name: 'Elasticsearch', type: '软件', version: '8.15.0', count: 5 },
  { name: 'Vue.js', type: '软件', version: '3.5.13', count: 4 },
  { name: 'Hadoop', type: '软件', version: '3.4.0', count: 3 },
  // 组件
  { name: 'commons-lang3', type: '组件', version: '3.17.0', count: 9 },
  { name: 'slf4j-api', type: '组件', version: '2.0.16', count: 8 },
  { name: 'junit-jupiter', type: '组件', version: '5.11.4', count: 6 },
  { name: 'byte-buddy', type: '组件', version: '1.17.5', count: 5 },
  { name: 'mockito-core', type: '组件', version: '5.15.2', count: 4 },
  { name: 'hamcrest', type: '组件', version: '3.0', count: 3 },
  { name: 'log4j-core', type: '组件', version: '2.24.3', count: 3 },
  { name: 'jackson-core', type: '组件', version: '2.19.4', count: 2 },
  { name: 'netty-buffer', type: '组件', version: '4.1.116', count: 2 },
  { name: 'snakeyaml', type: '组件', version: '2.3', count: 1 },
]
/** 当前展示的版本火车组成类型（软件/组件） */
const trainType = ref('软件')
/** 按当前类型过滤后的热门组成 */
const trainTopFiltered = computed(() => trainTop.filter((r) => r.type === trainType.value))

/** 表格数据：AI 组织使用排行 */
const aiOrgRank = [
  { org: '中国工商银行', users: 320, dialogs: 1860 },
  { org: '华为技术有限公司', users: 280, dialogs: 1540 },
  { org: '阿里巴巴集团', users: 210, dialogs: 1120 },
  { org: '平安科技', users: 150, dialogs: 860 },
  { org: '中信集团', users: 96, dialogs: 540 },
  { org: '国家电网', users: 88, dialogs: 480 },
  { org: '中国移动', users: 76, dialogs: 420 },
  { org: '腾讯云', users: 64, dialogs: 360 },
  { org: '百度智能云', users: 55, dialogs: 310 },
  { org: '字节跳动', users: 50, dialogs: 280 },
]

/** 模拟：平台内各用户的 AI 提问次数（确定性伪随机，长尾分布） */
function genQuestionCounts(n) {
  const out = []
  let v = 2
  for (let i = 0; i < n; i++) {
    v = (v * 7 + 13) % 501
    out.push(v + 1)
  }
  return out
}
const userQuestionCounts = genQuestionCounts(100)

/** AI 提问次数分布：按实际数据自动分档（固定 10 档） */
const aiScaleDist = computed(() => {
  const vals = userQuestionCounts
  const n = vals.length
  const max = Math.max(...vals)
  const bins = 10
  const width = Math.max(1, Math.ceil(max / bins))
  const buckets = Array.from({ length: bins }, () => 0)
  vals.forEach((v) => {
    const idx = Math.min(bins - 1, Math.floor((v - 1) / width))
    buckets[idx]++
  })
  return buckets.map((count, idx) => {
    const start = idx * width + 1
    const end = (idx + 1) * width
    const range = idx === bins - 1 ? `${start}+ 次` : `${start}-${end} 次`
    return { range, count, pct: Math.round((count / n) * 100) }
  })
})

/** 纯表格数据：需求反馈明细 */
const feedbackDetail = [
  { id: 1, user: '赵小明', org: '中国工商银行', type: '资源缺失', content: '缺少 log4j-core 2.24.3 的源码包', time: '2026-08-11 09:20' },
  { id: 2, user: '李思远', org: '华为技术有限公司', type: '功能需求', content: '希望支持组件批量导入功能', time: '2026-08-11 08:45' },
  { id: 3, user: '周雅琴', org: '平安科技', type: '使用体验', content: '软件详情页评分展示不够直观', time: '2026-08-10 17:30' },
  { id: 4, user: '刘子涵', org: '阿里巴巴集团', type: '异常反馈', content: '扫描报告导出 CSV 偶尔乱码', time: '2026-08-10 16:12' },
  { id: 5, user: '郑子轩', org: '华为技术有限公司', type: '权限安全', content: '建议增加审计日志查看权限', time: '2026-08-10 14:50' },
  { id: 6, user: '钱丽华', org: '中国工商银行', type: '账号登录', content: '企业 SSO 登录偶发超时', time: '2026-08-10 11:25' },
  { id: 7, user: '陈晓峰', org: '阿里巴巴集团', type: '资源缺失', content: '缺少 OpenSSL 3.3.0 的 Windows 制品', time: '2026-08-10 10:05' },
  { id: 8, user: '冯雨萱', org: '华为技术有限公司', type: '功能需求', content: 'AI 助手希望支持扫描结果问答', time: '2026-08-09 18:40' },
  { id: 9, user: '王明远', org: '平安科技', type: '使用体验', content: '版本火车信息树展开层级过多', time: '2026-08-09 15:22' },
  { id: 10, user: '杨思琪', org: '阿里巴巴集团', type: '其他', content: '建议增加移动端适配', time: '2026-08-09 13:08' },
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

/** 活跃组织排行（PV/下载/OpenAPI/AI 均来自埋点统计） */
const orgRank = [
  { org: '中国工商银行', login: 1860, pv: 28400, download: 1180, api: 18200, ai: 640 },
  { org: '华为技术有限公司', login: 1540, pv: 23600, download: 960, api: 15400, ai: 520 },
  { org: '阿里巴巴集团', login: 1120, pv: 17800, download: 720, api: 11200, ai: 380 },
  { org: '平安科技', login: 860, pv: 12400, download: 540, api: 8600, ai: 290 },
  { org: '中信集团', login: 540, pv: 8600, download: 320, api: 5200, ai: 170 },
  { org: '国家电网', login: 480, pv: 7400, download: 280, api: 4600, ai: 150 },
  { org: '中国移动', login: 420, pv: 6600, download: 240, api: 3900, ai: 130 },
  { org: '腾讯云', login: 360, pv: 5400, download: 190, api: 3100, ai: 110 },
  { org: '百度智能云', login: 310, pv: 4700, download: 160, api: 2700, ai: 90 },
  { org: '字节跳动', login: 280, pv: 4100, download: 140, api: 2300, ai: 80 },
]

/** 组织成员明细（组织下每个用户的登录 / PV / UV / 下载 / OpenAPI / AI / 最近活跃） */
const orgMembers = [
  { org: '中国工商银行', user: '张建国', login: 620, pv: 9460, uv: 2860, download: 380, api: 5820, ai: 260, lastActive: '2026-08-14 09:42' },
  { org: '中国工商银行', user: '赵小明', login: 480, pv: 8320, uv: 2540, download: 320, api: 4960, ai: 210, lastActive: '2026-08-14 09:18' },
  { org: '中国工商银行', user: '钱丽华', login: 390, pv: 6540, uv: 2100, download: 260, api: 4120, ai: 170, lastActive: '2026-08-14 08:55' },
  { org: '中国工商银行', user: '孙丽', login: 370, pv: 4080, uv: 1160, download: 180, api: 2560, ai: 110, lastActive: '2026-08-13 17:30' },
  { org: '华为技术有限公司', user: '李思远', login: 540, pv: 8240, uv: 2480, download: 330, api: 5120, ai: 220, lastActive: '2026-08-14 09:05' },
  { org: '华为技术有限公司', user: '郑子轩', login: 430, pv: 7360, uv: 2260, download: 290, api: 4680, ai: 190, lastActive: '2026-08-14 08:40' },
  { org: '华为技术有限公司', user: '冯雨萱', login: 330, pv: 5020, uv: 1520, download: 210, api: 3180, ai: 140, lastActive: '2026-08-13 18:20' },
  { org: '华为技术有限公司', user: '吴昊', login: 240, pv: 2980, uv: 960, download: 130, api: 1820, ai: 80, lastActive: '2026-08-13 16:45' },
  { org: '阿里巴巴集团', user: '陈晓峰', login: 410, pv: 6820, uv: 2040, download: 270, api: 4280, ai: 180, lastActive: '2026-08-14 08:50' },
  { org: '阿里巴巴集团', user: '刘子涵', login: 350, pv: 5840, uv: 1780, download: 230, api: 3660, ai: 150, lastActive: '2026-08-14 08:22' },
  { org: '阿里巴巴集团', user: '杨思琪', login: 230, pv: 3140, uv: 1020, download: 140, api: 1980, ai: 90, lastActive: '2026-08-13 15:10' },
  { org: '阿里巴巴集团', user: '何静', login: 130, pv: 2000, uv: 700, download: 90, api: 1280, ai: 60, lastActive: '2026-08-13 11:35' },
  { org: '平安科技', user: '王明远', login: 380, pv: 5480, uv: 1640, download: 220, api: 3420, ai: 145, lastActive: '2026-08-14 09:12' },
  { org: '平安科技', user: '周雅琴', login: 280, pv: 4120, uv: 1280, download: 170, api: 2560, ai: 110, lastActive: '2026-08-13 17:58' },
  { org: '平安科技', user: '曹磊', login: 200, pv: 2800, uv: 880, download: 120, api: 1720, ai: 75, lastActive: '2026-08-13 14:26' },
  { org: '中信集团', user: '许文强', login: 260, pv: 3820, uv: 1140, download: 160, api: 2380, ai: 100, lastActive: '2026-08-13 16:02' },
  { org: '中信集团', user: '邓丽', login: 180, pv: 2560, uv: 820, download: 105, api: 1620, ai: 68, lastActive: '2026-08-12 18:15' },
  { org: '国家电网', user: '林涛', login: 240, pv: 3420, uv: 1020, download: 140, api: 2140, ai: 88, lastActive: '2026-08-13 15:40' },
  { org: '国家电网', user: '黄蓉', login: 160, pv: 2260, uv: 740, download: 95, api: 1420, ai: 58, lastActive: '2026-08-12 17:05' },
  { org: '中国移动', user: '徐斌', login: 210, pv: 3120, uv: 940, download: 128, api: 1960, ai: 80, lastActive: '2026-08-13 14:48' },
  { org: '中国移动', user: '胡军', login: 150, pv: 2140, uv: 680, download: 88, api: 1340, ai: 54, lastActive: '2026-08-12 16:32' },
  { org: '腾讯云', user: '罗强', login: 180, pv: 2620, uv: 820, download: 106, api: 1660, ai: 66, lastActive: '2026-08-13 13:20' },
  { org: '腾讯云', user: '高翔', login: 120, pv: 1680, uv: 540, download: 70, api: 1060, ai: 42, lastActive: '2026-08-12 15:12' },
  { org: '百度智能云', user: '梁晨', login: 160, pv: 2280, uv: 720, download: 92, api: 1430, ai: 58, lastActive: '2026-08-13 12:36' },
  { org: '百度智能云', user: '宋佳', login: 100, pv: 1440, uv: 460, download: 58, api: 920, ai: 36, lastActive: '2026-08-12 14:08' },
  { org: '字节跳动', user: '沈飞', login: 150, pv: 2180, uv: 700, download: 86, api: 1360, ai: 54, lastActive: '2026-08-13 11:42' },
  { org: '字节跳动', user: '韩雪', login: 90, pv: 1280, uv: 420, download: 52, api: 820, ai: 30, lastActive: '2026-08-12 13:55' },
]

/** 当前查看明细的组织 */
const orgDetail = ref(null)
/** 当前组织的成员明细 */
const orgDetailMembers = computed(() => {
  if (!orgDetail.value) return []
  return orgMembers.filter((m) => m.org === orgDetail.value.org)
})
function openOrgDetail(org) {
  orgDetail.value = org
}
function closeOrgDetail() {
  orgDetail.value = null
}

/* 图表：需求反馈趋势 + 版本火车状态分布 + AI 对话趋势 */
const feedbackTrendChartRef = ref(null)
const aiChartRef = ref(null)
const trainChartRef = ref(null)
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

  // 需求反馈提交趋势：折线图
  initChart(feedbackTrendChartRef, {
    tooltip: { ...tooltipBase, trigger: 'axis' },
    color: ['#da203e'],
    grid: { left: 40, right: 14, top: 24, bottom: 36 },
    xAxis: { type: 'category', data: labels, ...axisStyle },
    yAxis: { type: 'value', ...splitLine, axisLabel: { color: '#9ca3af', fontSize: 10 } },
    series: [{
      name: '提交量', type: 'line', smooth: true, symbolSize: 5,
      areaStyle: { opacity: 0.08 },
      data: genTrends(20, labels.length, 20),
    }],
  })

  // 版本火车状态分布：扇形图
  initChart(trainChartRef, {
    tooltip: { ...tooltipBase, trigger: 'item', formatter: '{b}: {c} 辆 ({d}%)' },
    color: ['#22c55e', '#f59e0b', '#9ca3af', '#3b82f6'],
    legend: { ...legendBottom },
    series: [{
      type: 'pie', radius: ['38%', '58%'], center: ['50%', '60%'],
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 12, fontWeight: 700, color: '#374151' } },
      data: trainStatus.map((r) => ({ name: r.status, value: r.count })),
    }],
  })

  initChart(aiChartRef, {
    color: ['#0891b2'],
    tooltip: { ...tooltipBase, trigger: 'axis' },
    legend: { ...legendBottom, data: ['对话次数'] },
    grid: { left: 48, right: 14, top: 24, bottom: 36 },
    xAxis: { type: 'category', data: labels, ...axisStyle },
    yAxis: { type: 'value', ...splitLine, axisLabel: { color: '#9ca3af', fontSize: 10 } },
    series: [
      { name: '对话次数', type: 'line', smooth: true, symbolSize: 5, data: genTrends(220, labels.length, 220), areaStyle: { opacity: 0.08 } },
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

<style scoped>
/* 版本火车热门组成：软件/组件 tab 切换 */
.train-tabs {
  display: inline-flex;
  gap: 4px;
  padding: 2px;
  background: #f3f4f6;
  border-radius: 8px;
}
.train-tab {
  padding: 4px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}
.train-tab:hover {
  color: #374151;
}
.train-tab.is-active {
  background: #fff;
  color: #da203e;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* 组织成员明细弹窗 */
.rtable-link {
  border: none;
  background: none;
  font-size: 12px;
  color: #2563eb;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
}
.rtable-link:hover {
  text-decoration: underline;
}
.od-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.od-dialog {
  width: 780px;
  max-width: 94vw;
  max-height: 82vh;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.od-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #f3f4f6;
}
.od-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}
.od-close {
  border: none;
  background: none;
  font-size: 20px;
  line-height: 1;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}
.od-close:hover {
  background: #f3f4f6;
  color: #374151;
}
.od-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 14px 20px 20px;
}
</style>
