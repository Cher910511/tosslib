<template>
  <div class="ic-page">
    <!-- 页头 -->
    <div class="ic-header">
      <div class="ic-header-left">
        <h1 class="ic-title">安全情报中心</h1>
        <div class="ic-tabs">
          <button type="button" class="ic-tab" :class="{ 'is-active': activeTab === 'vuln' }" @click="activeTab = 'vuln'">漏洞库</button>
          <button type="button" class="ic-tab" :class="{ 'is-active': activeTab === 'opi' }" @click="activeTab = 'opi'">舆情库</button>
        </div>
      </div>
      <div class="ic-header-right">
        <div class="ic-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="searchQuery" type="text" :placeholder="activeTab === 'vuln' ? '搜索 CVE 编号、软件名称...' : '搜索舆情事件、项目名称...'" />
        </div>
      </div>
    </div>

    <!-- ===================== 漏洞库 ===================== -->
    <template v-if="activeTab === 'vuln'">
      <!-- 风险概览 -->
      <section class="ic-section">
        <div class="ic-stat-row">
          <div class="ic-stat-card"><span class="ic-stat-num">1,284</span><span class="ic-stat-label">漏洞总数</span></div>
          <div class="ic-stat-card ic-stat-card--danger"><span class="ic-stat-num">326</span><span class="ic-stat-label">高危漏洞</span></div>
          <div class="ic-stat-card"><span class="ic-stat-num">187</span><span class="ic-stat-label">涉及软件</span></div>
          <div class="ic-stat-card"><span class="ic-stat-num">2,156</span><span class="ic-stat-label">涉及组件</span></div>
          <div class="ic-stat-card ic-stat-card--warn"><span class="ic-stat-num">48</span><span class="ic-stat-label">本周新增</span></div>
        </div>
      </section>

      <!-- 图表行 -->
      <section class="ic-section ic-section--grid-2">
        <div class="ic-chart-card">
          <h3 class="ic-card-title">漏洞新增趋势 <span class="ic-card-title-sub">最近 30 天</span></h3>
          <div ref="vulnTrendChartRef" class="ic-chart-box" />
        </div>
        <div class="ic-chart-card">
          <h3 class="ic-card-title">漏洞分类分布</h3>
          <div ref="vulnCategoryChartRef" class="ic-chart-box" />
        </div>
      </section>

      <!-- 重点漏洞关注区 -->
      <section class="ic-section">
        <div class="ic-card-hd">
          <h3 class="ic-card-title">重点漏洞关注</h3>
          <div class="ic-filter-group">
            <button v-for="f in vulnFilters" :key="f.key" type="button" class="ic-filter-btn" :class="{ 'is-active': activeVulnFilter === f.key }" @click="activeVulnFilter = f.key">{{ f.label }}</button>
          </div>
        </div>
        <div class="ic-vuln-grid">
          <div v-for="v in filteredVulnList" :key="v.cve" class="ic-vuln-card" @click="vulnDetail = v">
            <div class="ic-vuln-card-hd">
              <code class="ic-cve">{{ v.cve }}</code>
              <span class="ic-level" :class="'ic-level--' + v.level">{{ v.levelLabel }}</span>
              <span class="ic-cvss">CVSS {{ v.cvss }}</span>
            </div>
            <p class="ic-vuln-name">{{ v.name }}</p>
            <div class="ic-vuln-card-meta">
              <span>影响 <strong>{{ v.affectCount }}</strong> 个软件</span>
              <span class="ic-muted">{{ v.time }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 受影响软件排行 + 最新漏洞动态 -->
      <section class="ic-section ic-section--grid-2">
        <div class="ic-chart-card">
          <h3 class="ic-card-title">受影响软件排行</h3>
          <div class="ic-rank-list">
            <div v-for="(s, i) in affectedSoftware" :key="s.name" class="ic-rank-item">
              <span class="ic-rank-num" :class="{ 'ic-rank-num--top': i < 3 }">{{ i + 1 }}</span>
              <span class="ic-rank-name">{{ s.name }}</span>
              <span class="ic-rank-bar-wrap"><span class="ic-rank-bar" :style="{ width: s.pct + '%' }" /></span>
              <span class="ic-rank-count">{{ s.count }} 漏洞</span>
              <span class="ic-level" :class="'ic-level--' + s.level">{{ s.levelLabel }}</span>
            </div>
          </div>
        </div>
        <div class="ic-chart-card">
          <h3 class="ic-card-title">最新漏洞动态</h3>
          <div class="ic-timeline">
            <div v-for="(evt, i) in vulnEvents" :key="i" class="ic-tl-item">
              <div class="ic-tl-dot" :class="'ic-tl-dot--' + evt.type" />
              <div class="ic-tl-body">
                <span class="ic-tl-type" :class="'ic-tl-type--' + evt.type">{{ evt.typeLabel }}</span>
                <span class="ic-tl-text">{{ evt.text }}</span>
                <span class="ic-tl-time">{{ evt.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- ===================== 舆情库 ===================== -->
    <template v-if="activeTab === 'opi'">
      <!-- 舆情概览 -->
      <section class="ic-section">
        <div class="ic-stat-row">
          <div class="ic-stat-card"><span class="ic-stat-num">892</span><span class="ic-stat-label">舆情事件总数</span></div>
          <div class="ic-stat-card ic-stat-card--danger"><span class="ic-stat-num">127</span><span class="ic-stat-label">负面事件</span></div>
          <div class="ic-stat-card"><span class="ic-stat-num">36</span><span class="ic-stat-label">重点关注项目</span></div>
          <div class="ic-stat-card ic-stat-card--warn"><span class="ic-stat-num">23</span><span class="ic-stat-label">本周新增</span></div>
          <div class="ic-stat-card"><span class="ic-stat-num">48</span><span class="ic-stat-label">涉及组织</span></div>
        </div>
      </section>

      <!-- 图表行 -->
      <section class="ic-section ic-section--grid-2">
        <div class="ic-chart-card">
          <h3 class="ic-card-title">舆情趋势 <span class="ic-card-title-sub">最近 30 天</span></h3>
          <div ref="opiTrendChartRef" class="ic-chart-box" />
        </div>
        <div class="ic-chart-card">
          <h3 class="ic-card-title">舆情情绪分析</h3>
          <div ref="opiSentimentChartRef" class="ic-chart-box" />
        </div>
      </section>

      <!-- 热点项目榜 -->
      <section class="ic-section">
        <h3 class="ic-card-title">热点项目榜</h3>
        <div class="ic-hot-grid">
          <div v-for="(p, i) in hotProjects" :key="p.name" class="ic-hot-card">
            <div class="ic-hot-rank">{{ i + 1 }}</div>
            <div class="ic-hot-body">
              <div class="ic-hot-name">{{ p.name }}</div>
              <div class="ic-hot-meta">
                <span class="ic-hot-heat">🔥 {{ p.heat }}</span>
                <span class="ic-level" :class="'ic-level--' + p.level">{{ p.levelLabel }}</span>
                <span class="ic-muted">讨论 {{ p.discussions }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 热点事件流 + 重点关注项目 -->
      <section class="ic-section ic-section--grid-2">
        <div class="ic-chart-card">
          <h3 class="ic-card-title">热点事件流</h3>
          <div class="ic-news-feed">
            <div v-for="(n, i) in hotNews" :key="i" class="ic-news-card" @click="opiDetail = n">
              <div class="ic-news-hd">
                <span class="ic-level" :class="'ic-level--' + n.level">{{ n.levelLabel }}</span>
                <span class="ic-muted">{{ n.source }}</span>
                <span class="ic-muted">{{ n.time }}</span>
              </div>
              <p class="ic-news-title">{{ n.title }}</p>
              <p class="ic-news-summary">{{ n.summary }}</p>
            </div>
          </div>
        </div>
        <div class="ic-chart-card">
          <h3 class="ic-card-title">重点关注项目</h3>
          <div class="ic-focus-grid">
            <div v-for="p in focusProjects" :key="p.name" class="ic-focus-card" @click="opiDetail = { title: p.name + ' 最新动态', summary: p.latest }">
              <div class="ic-focus-name">{{ p.name }}</div>
              <div class="ic-focus-org">{{ p.org }}</div>
              <div class="ic-focus-meta">
                <span>风险指数 <strong :class="p.risk > 70 ? 'ic-danger' : ''">{{ p.risk }}</strong></span>
                <span>事件 <strong>{{ p.events }}</strong></span>
              </div>
              <p class="ic-focus-latest">{{ p.latest }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 舆情时间轴 -->
      <section class="ic-section">
        <h3 class="ic-card-title">舆情时间轴</h3>
        <div class="ic-tl-horizontal">
          <div v-for="(evt, i) in opiTimeline" :key="i" class="ic-tl-h-item">
            <div class="ic-tl-h-dot" :class="'ic-tl-h-dot--' + evt.type" />
            <div class="ic-tl-h-body">
              <span class="ic-tl-h-type">{{ evt.typeLabel }}</span>
              <span class="ic-tl-h-text">{{ evt.text }}</span>
              <span class="ic-tl-h-time">{{ evt.time }}</span>
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- 漏洞详情抽屉 -->
    <Teleport to="body">
      <div v-if="vulnDetail" class="ic-overlay" @click.self="vulnDetail = null">
        <div class="ic-drawer">
          <div class="ic-drawer-hd">
            <h3>{{ vulnDetail.cve }}</h3>
            <button type="button" class="ic-drawer-close" @click="vulnDetail = null">×</button>
          </div>
          <div class="ic-drawer-body">
            <dl class="ic-dl">
              <div class="ic-dl-row"><dt>漏洞名称</dt><dd>{{ vulnDetail.name }}</dd></div>
              <div class="ic-dl-row"><dt>风险等级</dt><dd><span class="ic-level" :class="'ic-level--' + vulnDetail.level">{{ vulnDetail.levelLabel }}</span></dd></div>
              <div class="ic-dl-row"><dt>CVSS 评分</dt><dd>{{ vulnDetail.cvss }}</dd></div>
              <div class="ic-dl-row"><dt>影响软件</dt><dd>{{ vulnDetail.affectCount }} 个</dd></div>
              <div class="ic-dl-row"><dt>发布时间</dt><dd>{{ vulnDetail.time }}</dd></div>
            </dl>
            <section class="ic-drawer-section"><h4>漏洞描述</h4><p>{{ vulnDetail.desc }}</p></section>
            <section class="ic-drawer-section"><h4>修复建议</h4><p>{{ vulnDetail.suggestion }}</p></section>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 舆情详情抽屉 -->
    <Teleport to="body">
      <div v-if="opiDetail" class="ic-overlay" @click.self="opiDetail = null">
        <div class="ic-drawer">
          <div class="ic-drawer-hd">
            <h3>{{ opiDetail.title }}</h3>
            <button type="button" class="ic-drawer-close" @click="opiDetail = null">×</button>
          </div>
          <div class="ic-drawer-body">
            <p style="font-size:13px;color:#6b7280;line-height:1.6;margin:0;">{{ opiDetail.summary }}</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const activeTab = ref('vuln')
const searchQuery = ref('')
const activeVulnFilter = ref('all')
const vulnDetail = ref(null)
const opiDetail = ref(null)

const vulnFilters = [
  { key: 'all', label: '全部' },
  { key: 'high', label: '高危' },
  { key: 'medium', label: '中危' },
  { key: 'low', label: '低危' },
]

// ====== 漏洞数据 ======
const vulnData = [
  { cve: 'CVE-2025-1234', name: 'Log4j2 远程代码执行漏洞', level: 'critical', levelLabel: '严重', cvss: '9.8', affectCount: 156, time: '2025-06-10', desc: 'Apache Log4j2 组件存在远程代码执行漏洞，攻击者可利用该漏洞在未授权的情况下远程执行任意代码。', suggestion: '建议升级至 Log4j 2.24.0 及以上版本。' },
  { cve: 'CVE-2025-5678', name: 'Spring Framework 目录遍历漏洞', level: 'high', levelLabel: '高危', cvss: '7.5', affectCount: 89, time: '2025-06-08', desc: 'Spring Framework 中存在目录遍历漏洞，攻击者可构造恶意请求读取服务器上的任意文件。', suggestion: '建议升级至 Spring Framework 6.1.6 及以上版本。' },
  { cve: 'CVE-2025-9012', name: 'Vue.js XSS 跨站脚本漏洞', level: 'medium', levelLabel: '中危', cvss: '5.4', affectCount: 42, time: '2025-06-05', desc: 'Vue.js 中存在跨站脚本攻击（XSS）漏洞，攻击者可通过恶意模板注入执行任意脚本。', suggestion: '建议升级至 Vue.js 3.4.0 及以上版本。' },
  { cve: 'CVE-2025-3456', name: 'OpenSSL 缓冲区溢出漏洞', level: 'critical', levelLabel: '严重', cvss: '9.1', affectCount: 203, time: '2025-06-03', desc: 'OpenSSL 中存在缓冲区溢出漏洞，攻击者可利用该漏洞导致服务崩溃或执行任意代码。', suggestion: '建议升级至 OpenSSL 3.3.1 及以上版本。' },
  { cve: 'CVE-2025-7890', name: 'Django SQL 注入漏洞', level: 'high', levelLabel: '高危', cvss: '8.2', affectCount: 67, time: '2025-05-28', desc: 'Django 中存在 SQL 注入漏洞，攻击者可通过特制请求执行任意数据库操作。', suggestion: '建议升级至 Django 5.0.6 及以上版本。' },
  { cve: 'CVE-2025-2345', name: 'Redis 信息泄露漏洞', level: 'low', levelLabel: '低危', cvss: '3.5', affectCount: 34, time: '2025-05-25', desc: 'Redis 中存在信息泄露漏洞，攻击者可通过特定命令获取服务器内存中的敏感信息。', suggestion: '建议升级至 Redis 7.2.5 及以上版本。' },
]

const filteredVulnList = computed(() => {
  let list = vulnData
  if (activeVulnFilter.value === 'high') list = list.filter(v => v.level === 'critical' || v.level === 'high')
  else if (activeVulnFilter.value === 'medium') list = list.filter(v => v.level === 'medium')
  else if (activeVulnFilter.value === 'low') list = list.filter(v => v.level === 'low')
  const q = searchQuery.value.trim().toLowerCase()
  if (q) list = list.filter(v => v.cve.toLowerCase().includes(q) || v.name.toLowerCase().includes(q))
  return list
})

const affectedSoftware = [
  { name: 'Apache Log4j', count: 28, pct: 100, level: 'critical', levelLabel: '严重' },
  { name: 'OpenSSL', count: 21, pct: 75, level: 'critical', levelLabel: '严重' },
  { name: 'Spring Framework', count: 18, pct: 64, level: 'high', levelLabel: '高危' },
  { name: 'Django', count: 14, pct: 50, level: 'high', levelLabel: '高危' },
  { name: 'Node.js', count: 11, pct: 39, level: 'medium', levelLabel: '中危' },
]

const vulnEvents = [
  { type: 'new', typeLabel: '新增', text: 'CVE-2025-1234 Log4j2 远程代码执行漏洞被收录', time: '2 小时前' },
  { type: 'update', typeLabel: '更新', text: 'CVE-2025-5678 Spring Framework 漏洞影响范围更新', time: '5 小时前' },
  { type: 'fix', typeLabel: '修复', text: 'OpenSSL 3.3.1 版本已修复 CVE-2025-3456', time: '1 天前' },
  { type: 'change', typeLabel: '变更', text: 'CVE-2025-6789 风险等级由中危升级为高危', time: '2 天前' },
  { type: 'new', typeLabel: '新增', text: 'CVE-2025-7890 Django SQL 注入漏洞被收录', time: '3 天前' },
]

// ====== 舆情数据 ======
const hotProjects = [
  { name: 'Log4j', heat: '98.6k', level: 'critical', levelLabel: '严重', discussions: '2,384' },
  { name: 'Spring Framework', heat: '76.2k', level: 'high', levelLabel: '高危', discussions: '1,892' },
  { name: 'Vue.js', heat: '45.8k', level: 'medium', levelLabel: '中危', discussions: '956' },
  { name: 'Redis', heat: '32.1k', level: 'high', levelLabel: '高危', discussions: '743' },
  { name: 'OpenSSL', heat: '28.7k', level: 'critical', levelLabel: '严重', discussions: '621' },
]

const hotNews = [
  { title: 'Log4j 被发现新的远程代码执行漏洞（CVE-2025-6789）', summary: 'Apache Log4j2 组件被披露存在新的远程代码执行漏洞，建议相关用户尽快升级。', level: 'critical', levelLabel: '严重', source: 'CNNVD', time: '2025-06-10' },
  { title: 'Spring 生态多个组件存在供应链投毒风险', summary: '安全研究人员发现 Spring 生态中有多个组件包被投毒，包含恶意代码。', level: 'critical', levelLabel: '严重', source: 'OSCS', time: '2025-06-08' },
  { title: 'Nginx 被曝拒绝服务漏洞，影响 1.24.x 系列版本', summary: 'Nginx 官方披露了一个拒绝服务漏洞，攻击者可发送特制请求导致服务崩溃。', level: 'medium', levelLabel: '中危', source: 'CNVD', time: '2025-06-05' },
  { title: 'npm 包被批量恶意篡改事件引发社区热议', summary: 'npm 生态中出现多起恶意包投毒事件，攻击者通过社会工程学获取维护者权限。', level: 'medium', levelLabel: '中危', source: '开源中国', time: '2025-06-03' },
]

const focusProjects = [
  { name: 'Log4j', org: 'Apache Software Foundation', risk: 92, events: 15, latest: 'CVE-2025-6789 漏洞细节已公开，多个 PoC 已发布' },
  { name: 'Spring Framework', org: 'VMware', risk: 78, events: 11, latest: 'Spring Boot 3.3.1 发布，修复 5 个安全漏洞' },
  { name: 'Redis', org: 'Redis Ltd.', risk: 65, events: 7, latest: 'Redis 7.2.5 发布，修复权限提升漏洞' },
  { name: 'Nginx', org: 'NGINX, Inc.', risk: 58, events: 4, latest: 'Nginx 1.26.1 发布，修复拒绝服务漏洞' },
]

const opiTimeline = [
  { type: 'security', typeLabel: '安全事件', text: 'Log4j 被披露新的远程代码执行漏洞', time: '2025-06-10' },
  { type: 'license', typeLabel: '许可证变更', text: 'Elasticsearch 从 Apache 2.0 变更为 SSPL', time: '2025-06-07' },
  { type: 'community', typeLabel: '社区争议', text: 'WordPress 社区关于 WP Engine 的商标争议持续升级', time: '2025-06-05' },
  { type: 'maintainer', typeLabel: '维护者退出', text: 'faker.js 核心维护者宣布退出项目维护', time: '2025-06-02' },
  { type: 'acquire', typeLabel: '企业收购', text: 'IBM 宣布收购 HashiCorp，Terraform 许可证引关注', time: '2025-05-28' },
  { type: 'security', typeLabel: '安全事件', text: 'npm 生态出现大规模恶意包投毒事件', time: '2025-05-25' },
]

// ====== ECharts ======
let charts = []

function disposeCharts() {
  charts.forEach(c => { try { c.dispose() } catch {} })
  charts = []
}

function initChart(el) {
  if (!el) return null
  const c = echarts.init(el)
  charts.push(c)
  return c
}

const vulnTrendChartRef = ref(null)
const vulnCategoryChartRef = ref(null)
const opiTrendChartRef = ref(null)
const opiSentimentChartRef = ref(null)

function renderVulnTrend() {
  const c = initChart(vulnTrendChartRef.value)
  if (!c) return
  c.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 16, top: 20, bottom: 24 },
    xAxis: { type: 'category', data: Array.from({ length: 30 }, (_, i) => `${i + 1}日`), axisLabel: { fontSize: 10, color: '#9ca3af', interval: 4 } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f3f4f6' } }, axisLabel: { fontSize: 10, color: '#9ca3af' } },
    series: [
      { name: '新增漏洞', type: 'line', smooth: true, data: [12, 15, 8, 20, 18, 25, 22, 28, 30, 24, 18, 15, 22, 26, 20, 18, 12, 8, 15, 22, 28, 32, 26, 20, 18, 24, 30, 28, 22, 18], lineStyle: { color: '#da203e', width: 2 }, itemStyle: { color: '#da203e' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(218,32,62,0.15)' }, { offset: 1, color: 'rgba(218,32,62,0)' }]) } },
      { name: '高危漏洞', type: 'line', smooth: true, data: [5, 8, 3, 10, 8, 12, 10, 14, 16, 10, 6, 5, 8, 12, 10, 8, 4, 2, 5, 8, 12, 15, 10, 8, 6, 10, 14, 12, 8, 6], lineStyle: { color: '#f59e0b', width: 2, type: 'dashed' }, itemStyle: { color: '#f59e0b' } },
    ],
    legend: { data: ['新增漏洞', '高危漏洞'], bottom: 0, icon: 'circle', itemWidth: 6, itemHeight: 6, textStyle: { fontSize: 11, color: '#6b7280' } },
  })
}

function renderVulnCategory() {
  const c = initChart(vulnCategoryChartRef.value)
  if (!c) return
  c.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    series: [{
      type: 'pie', radius: ['40%', '70%'], center: ['50%', '50%'],
      data: [
        { name: '远程代码执行(RCE)', value: 286, itemStyle: { color: '#7c1d1d' } },
        { name: '权限提升', value: 198, itemStyle: { color: '#dc2626' } },
        { name: 'SQL注入', value: 167, itemStyle: { color: '#ea580c' } },
        { name: 'XSS', value: 142, itemStyle: { color: '#f59e0b' } },
        { name: '依赖漏洞', value: 98, itemStyle: { color: '#6366f1' } },
        { name: '配置缺陷', value: 73, itemStyle: { color: '#6b7280' } },
      ],
      label: { fontSize: 11, color: '#6b7280', formatter: '{b}\n{d}%' },
      labelLine: { length: 8, length2: 8 },
      emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.15)' } },
    }],
  })
}

function renderOpiTrend() {
  const c = initChart(opiTrendChartRef.value)
  if (!c) return
  c.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 16, top: 20, bottom: 24 },
    xAxis: { type: 'category', data: Array.from({ length: 30 }, (_, i) => `${i + 1}日`), axisLabel: { fontSize: 10, color: '#9ca3af', interval: 4 } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f3f4f6' } }, axisLabel: { fontSize: 10, color: '#9ca3af' } },
    series: [
      { name: '正面', type: 'line', smooth: true, stack: 'total', data: [15, 18, 12, 20, 22, 18, 25, 30, 28, 22, 18, 15, 20, 25, 22, 18, 15, 10, 18, 22, 28, 32, 25, 20, 18, 22, 28, 25, 20, 18], lineStyle: { color: '#166534', width: 2 }, itemStyle: { color: '#166534' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(22,101,52,0.12)' }, { offset: 1, color: 'rgba(22,101,52,0)' }]) } },
      { name: '中性', type: 'line', smooth: true, stack: 'total', data: [8, 10, 6, 12, 14, 10, 15, 18, 16, 12, 10, 8, 12, 14, 12, 10, 8, 5, 10, 12, 15, 18, 14, 12, 10, 12, 15, 14, 12, 10], lineStyle: { color: '#6b7280', width: 2 }, itemStyle: { color: '#6b7280' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(107,114,128,0.1)' }, { offset: 1, color: 'rgba(107,114,128,0)' }]) } },
      { name: '负面', type: 'line', smooth: true, stack: 'total', data: [4, 6, 3, 8, 6, 5, 10, 12, 8, 6, 4, 3, 6, 8, 6, 5, 3, 2, 4, 6, 8, 10, 6, 5, 4, 6, 8, 7, 5, 4], lineStyle: { color: '#dc2626', width: 2 }, itemStyle: { color: '#dc2626' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(220,38,38,0.12)' }, { offset: 1, color: 'rgba(220,38,38,0)' }]) } },
    ],
    legend: { data: ['正面', '中性', '负面'], bottom: 0, icon: 'circle', itemWidth: 6, itemHeight: 6, textStyle: { fontSize: 11, color: '#6b7280' } },
  })
}

function renderOpiSentiment() {
  const c = initChart(opiSentimentChartRef.value)
  if (!c) return
  c.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    series: [{
      type: 'pie', radius: ['45%', '70%'], center: ['50%', '50%'],
      data: [
        { name: '正面', value: 428, itemStyle: { color: '#166534' } },
        { name: '中性', value: 337, itemStyle: { color: '#6b7280' } },
        { name: '负面', value: 127, itemStyle: { color: '#dc2626' } },
      ],
      label: { fontSize: 12, color: '#6b7280', formatter: '{b}\n{d}%' },
      labelLine: { length: 10, length2: 10 },
      emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.15)' } },
    }],
  })
}

onMounted(() => {
  renderVulnTrend()
  renderVulnCategory()
  renderOpiTrend()
  renderOpiSentiment()
})

watch(activeTab, () => {
  setTimeout(() => {
    disposeCharts()
    renderVulnTrend()
    renderVulnCategory()
    renderOpiTrend()
    renderOpiSentiment()
  }, 50)
})

onUnmounted(() => {
  disposeCharts()
})

const resizeHandler = () => charts.forEach(c => { try { c.resize() } catch {} })
window.addEventListener('resize', resizeHandler)
onUnmounted(() => window.removeEventListener('resize', resizeHandler))
</script>

<style scoped>
.ic-page { padding: 0; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif; }

/* 页头 */
.ic-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; gap: 16px; flex-wrap: wrap; }
.ic-header-left { display: flex; align-items: center; gap: 24px; }
.ic-title { font-size: 18px; font-weight: 600; color: #111827; margin: 0; white-space: nowrap; }
.ic-tabs { display: flex; gap: 0; background: #f3f4f6; border-radius: 6px; padding: 2px; }
.ic-tab { padding: 5px 16px; border: none; background: transparent; font-size: 13px; color: #6b7280; cursor: pointer; border-radius: 5px; transition: all 0.15s; font-family: inherit; }
.ic-tab.is-active { background: #fff; color: #111827; font-weight: 500; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
.ic-tab:hover:not(.is-active) { color: #374151; }
.ic-header-right { display: flex; align-items: center; gap: 12px; }
.ic-search { display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: #fff; border: 1px solid #d1d5db; border-radius: 6px; width: 260px; }
.ic-search svg { flex-shrink: 0; color: #9ca3af; }
.ic-search input { border: none; outline: none; font-size: 13px; color: #374151; width: 100%; background: transparent; }
.ic-search input::placeholder { color: #9ca3af; }

/* 区块 */
.ic-section { margin-bottom: 20px; }
.ic-section--grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

/* 统计卡片 */
.ic-stat-row { display: flex; gap: 12px; }
.ic-stat-card { flex: 1; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; display: flex; flex-direction: column; }
.ic-stat-card--danger { border-left: 3px solid #dc2626; }
.ic-stat-card--warn { border-left: 3px solid #f59e0b; }
.ic-stat-num { font-size: 28px; font-weight: 700; color: #111827; line-height: 1.2; }
.ic-stat-label { font-size: 12px; color: #6b7280; margin-top: 4px; }

/* 图表卡片 */
.ic-chart-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
.ic-card-title { font-size: 14px; font-weight: 600; color: #111827; margin: 0 0 12px; display: flex; align-items: center; gap: 8px; }
.ic-card-title-sub { font-size: 12px; font-weight: 400; color: #9ca3af; }
.ic-chart-box { width: 100%; height: 220px; }
.ic-card-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.ic-card-hd .ic-card-title { margin: 0; }

/* 筛选按钮 */
.ic-filter-group { display: flex; gap: 4px; background: #f3f4f6; border-radius: 5px; padding: 2px; }
.ic-filter-btn { padding: 3px 12px; border: none; background: transparent; font-size: 12px; color: #6b7280; cursor: pointer; border-radius: 4px; font-family: inherit; transition: all 0.15s; }
.ic-filter-btn.is-active { background: #fff; color: #111827; font-weight: 500; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
.ic-filter-btn:hover:not(.is-active) { color: #374151; }

/* 漏洞卡片网格 */
.ic-vuln-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.ic-vuln-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; cursor: pointer; transition: box-shadow 0.15s; }
.ic-vuln-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.ic-vuln-card-hd { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.ic-cve { font-family: 'SF Mono', 'Menlo', 'Consolas', monospace; font-size: 12px; color: #da203e; font-weight: 500; }
.ic-cvss { font-size: 11px; color: #9ca3af; margin-left: auto; }
.ic-vuln-name { font-size: 13px; color: #374151; margin: 0 0 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.ic-vuln-card-meta { display: flex; justify-content: space-between; font-size: 12px; color: #6b7280; }

/* 等级标签 */
.ic-level { display: inline-block; padding: 1px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; line-height: 18px; }
.ic-level--critical { background: #7c1d1d; color: #fff; }
.ic-level--high { background: #dc2626; color: #fff; }
.ic-level--medium { background: #f59e0b; color: #fff; }
.ic-level--low { background: #6b7280; color: #fff; }
.ic-muted { color: #9ca3af; font-size: 12px; }

/* 排行榜 */
.ic-rank-list { display: flex; flex-direction: column; gap: 6px; }
.ic-rank-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
.ic-rank-item:last-child { border-bottom: none; }
.ic-rank-num { width: 20px; font-size: 13px; font-weight: 500; color: #6b7280; text-align: center; }
.ic-rank-num--top { color: #da203e; font-weight: 700; }
.ic-rank-name { width: 130px; font-size: 13px; color: #374151; font-weight: 500; }
.ic-rank-bar-wrap { flex: 1; height: 6px; background: #f3f4f6; border-radius: 3px; overflow: hidden; }
.ic-rank-bar { height: 100%; background: linear-gradient(90deg, #da203e, #f59e0b); border-radius: 3px; transition: width 0.3s; }
.ic-rank-count { width: 60px; font-size: 12px; color: #6b7280; text-align: right; }
.ic-rank-item .ic-level { flex-shrink: 0; }

/* 时间轴 */
.ic-timeline { display: flex; flex-direction: column; gap: 0; }
.ic-tl-item { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
.ic-tl-item:last-child { border-bottom: none; }
.ic-tl-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 4px; flex-shrink: 0; }
.ic-tl-dot--new { background: #da203e; }
.ic-tl-dot--update { background: #f59e0b; }
.ic-tl-dot--fix { background: #166534; }
.ic-tl-dot--change { background: #6366f1; }
.ic-tl-body { flex: 1; }
.ic-tl-type { display: inline-block; padding: 0 6px; border-radius: 3px; font-size: 11px; font-weight: 500; line-height: 18px; margin-right: 6px; }
.ic-tl-type--new { background: #fef2f2; color: #991b1b; }
.ic-tl-type--update { background: #fffbeb; color: #92400e; }
.ic-tl-type--fix { background: #f0fdf4; color: #166534; }
.ic-tl-type--change { background: #eef2ff; color: #4338ca; }
.ic-tl-text { font-size: 13px; color: #374151; }
.ic-tl-time { display: block; font-size: 11px; color: #9ca3af; margin-top: 2px; }

/* 热点项目榜 */
.ic-hot-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
.ic-hot-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; display: flex; gap: 10px; align-items: flex-start; transition: box-shadow 0.15s; cursor: pointer; }
.ic-hot-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.ic-hot-rank { width: 24px; height: 24px; background: #f3f4f6; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #6b7280; flex-shrink: 0; }
.ic-hot-card:nth-child(1) .ic-hot-rank { background: #da203e; color: #fff; }
.ic-hot-card:nth-child(2) .ic-hot-rank { background: #dc2626; color: #fff; }
.ic-hot-card:nth-child(3) .ic-hot-rank { background: #f59e0b; color: #fff; }
.ic-hot-body { flex: 1; min-width: 0; }
.ic-hot-name { font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 4px; }
.ic-hot-meta { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.ic-hot-heat { color: #374151; }

/* 热点事件流 */
.ic-news-feed { display: flex; flex-direction: column; gap: 8px; }
.ic-news-card { padding: 12px; border: 1px solid #f3f4f6; border-radius: 6px; cursor: pointer; transition: background 0.15s; }
.ic-news-card:hover { background: #f9fafb; }
.ic-news-hd { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.ic-news-title { font-size: 13px; font-weight: 500; color: #111827; margin: 0 0 4px; }
.ic-news-summary { font-size: 12px; color: #6b7280; margin: 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* 重点关注项目 */
.ic-focus-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ic-focus-card { padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: box-shadow 0.15s; }
.ic-focus-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.ic-focus-name { font-size: 13px; font-weight: 600; color: #111827; }
.ic-focus-org { font-size: 11px; color: #9ca3af; margin-bottom: 6px; }
.ic-focus-meta { display: flex; gap: 12px; font-size: 12px; color: #6b7280; margin-bottom: 6px; }
.ic-danger { color: #dc2626; }
.ic-focus-latest { font-size: 12px; color: #6b7280; margin: 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* 水平时间轴 */
.ic-tl-horizontal { display: flex; gap: 0; overflow-x: auto; padding: 8px 0; }
.ic-tl-h-item { display: flex; gap: 8px; min-width: 200px; padding: 0 16px; border-left: 1px solid #e5e7eb; }
.ic-tl-h-item:first-child { border-left: none; }
.ic-tl-h-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 3px; flex-shrink: 0; }
.ic-tl-h-dot--security { background: #dc2626; }
.ic-tl-h-dot--license { background: #f59e0b; }
.ic-tl-h-dot--community { background: #6366f1; }
.ic-tl-h-dot--maintainer { background: #6b7280; }
.ic-tl-h-dot--acquire { background: #166534; }
.ic-tl-h-type { font-size: 11px; font-weight: 500; color: #6b7280; display: block; }
.ic-tl-h-text { font-size: 12px; color: #374151; display: block; margin: 2px 0; }
.ic-tl-h-time { font-size: 11px; color: #9ca3af; }

/* 抽屉 */
.ic-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.25); z-index: 1000; display: flex; justify-content: flex-end; }
.ic-drawer { width: 420px; background: #fff; height: 100%; overflow-y: auto; display: flex; flex-direction: column; }
.ic-drawer-hd { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #e5e7eb; flex-shrink: 0; }
.ic-drawer-hd h3 { margin: 0; font-size: 15px; font-weight: 600; color: #111827; }
.ic-drawer-close { padding: 0 4px; border: none; background: none; font-size: 20px; color: #9ca3af; cursor: pointer; line-height: 1; }
.ic-drawer-close:hover { color: #374151; }
.ic-drawer-body { padding: 16px 20px; flex: 1; }
.ic-dl { margin: 0; }
.ic-dl-row { display: flex; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
.ic-dl-row dt { width: 80px; font-size: 13px; color: #6b7280; flex-shrink: 0; }
.ic-dl-row dd { margin: 0; font-size: 13px; color: #374151; }
.ic-drawer-section { margin-top: 16px; }
.ic-drawer-section h4 { font-size: 13px; font-weight: 600; color: #111827; margin: 0 0 6px; }
.ic-drawer-section p { font-size: 13px; color: #6b7280; line-height: 1.6; margin: 0; }
</style>
