<template>
  <div class="ic-page">
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

    <!-- 受影响软件排行 + 影响范围最大漏洞 -->
    <section class="ic-section ic-section--grid-2">
      <div class="ic-chart-card">
        <div class="ic-card-hd">
          <h3 class="ic-card-title">受影响软件排行</h3>
          <div class="ic-rank-tabs">
            <button type="button" class="ic-rank-tab" :class="{ 'is-active': rankTab === 'software' }" @click="rankTab = 'software'">按软件</button>
            <button type="button" class="ic-rank-tab" :class="{ 'is-active': rankTab === 'vuln' }" @click="rankTab = 'vuln'">按漏洞</button>
          </div>
        </div>
        <div class="ic-rank-list">
          <template v-if="rankTab === 'software'">
            <div v-for="(s, i) in affectedSoftware" :key="s.name" class="ic-rank-item">
              <span class="ic-rank-num" :class="{ 'ic-rank-num--top': i < 3 }">{{ i + 1 }}</span>
              <span class="ic-rank-name">{{ s.name }}</span>
              <span class="ic-rank-bar-wrap"><span class="ic-rank-bar" :style="{ width: s.pct + '%' }" /></span>
              <span class="ic-rank-count">{{ s.count }} 漏洞</span>
              <span class="ic-level" :class="'ic-level--' + s.level">{{ s.levelLabel }}</span>
            </div>
          </template>
          <template v-else>
            <div v-for="(v, i) in topVulnBySoftware" :key="v.cve" class="ic-rank-item">
              <span class="ic-rank-num" :class="{ 'ic-rank-num--top': i < 3 }">{{ i + 1 }}</span>
              <span class="ic-rank-name" style="width:150px;"><code class="ic-cve" style="font-size:12px;">{{ v.cve }}</code></span>
              <span class="ic-rank-bar-wrap"><span class="ic-rank-bar" :style="{ width: v.pct + '%' }" /></span>
              <span class="ic-rank-count">{{ v.count }} 个</span>
              <span class="ic-level" :class="'ic-level--' + v.level">{{ v.levelLabel }}</span>
            </div>
          </template>
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

    <!-- 漏洞列表 -->
    <section class="ic-section">
      <div class="ic-vlist-toolbar">
        <div class="ic-vlist-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="vulnSearch" type="text" placeholder="搜索漏洞编号、名称、组件..." />
        </div>
        <div class="ic-vlist-filters">
          <select v-model="vulnLevelFilter" class="ic-vlist-select">
            <option value="">全部等级</option>
            <option value="critical">严重</option>
            <option value="high">高危</option>
            <option value="medium">中危</option>
            <option value="low">低危</option>
          </select>
          <select v-model="vulnTypeFilter" class="ic-vlist-select">
            <option value="">全部类型</option>
            <option value="RCE">远程代码执行</option>
            <option value="sqli">SQL注入</option>
            <option value="xss">XSS</option>
            <option value="dos">拒绝服务</option>
            <option value="priv">权限提升</option>
          </select>
          <button type="button" class="ic-vlist-sort-btn" @click="sortByTime = !sortByTime">更新时间 {{ sortByTime ? '↓' : '↑' }}</button>
        </div>
      </div>
      <div class="ic-vlist-grid">
        <div v-for="v in paginatedVulnList" :key="v.cve" class="ic-vlist-card" @click="vulnDetail = v">
          <div class="ic-vlist-card-hd">
            <span class="ic-vlist-name">{{ v.name }}</span>
            <code class="ic-cve">{{ v.cve }}</code>
            <span class="ic-level" :class="'ic-level--' + v.level">{{ v.levelLabel }}</span>
          </div>
          <p class="ic-vlist-desc">{{ v.desc }}</p>
          <div class="ic-vlist-card-ft">
            <span class="ic-vlist-time">{{ v.time }}</span>
            <button type="button" class="ic-vlist-detail-btn" @click.stop="vulnDetail = v">查看详情 →</button>
          </div>
        </div>
      </div>
      <div class="ic-pagination">
        <button class="ic-page-btn" :disabled="vulnPage <= 1" @click="vulnPage--">‹</button>
        <span class="ic-page-info">{{ vulnPage }} / {{ vulnTotalPages }}</span>
        <button class="ic-page-btn" :disabled="vulnPage >= vulnTotalPages" @click="vulnPage++">›</button>
      </div>
    </section>

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
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const searchQuery = ref('')
const activeVulnFilter = ref('all')
const vulnDetail = ref(null)

const vulnFilters = [
  { key: 'all', label: '全部' },
  { key: 'high', label: '高危' },
  { key: 'medium', label: '中危' },
  { key: 'low', label: '低危' },
]

const vulnData = [
  { cve: 'CVE-2025-1234', name: 'Log4j2 远程代码执行漏洞', level: 'critical', levelLabel: '严重', cvss: '9.8', affectCount: 156, time: '2025-06-10', desc: 'Apache Log4j2 组件存在远程代码执行漏洞，攻击者可利用该漏洞在未授权的情况下远程执行任意代码。', suggestion: '建议升级至 Log4j 2.24.0 及以上版本。' },
  { cve: 'CVE-2025-5678', name: 'Spring Framework 目录遍历漏洞', level: 'high', levelLabel: '高危', cvss: '7.5', affectCount: 89, time: '2025-06-08', desc: 'Spring Framework 中存在目录遍历漏洞，攻击者可构造恶意请求读取服务器上的任意文件。', suggestion: '建议升级至 Spring Framework 6.1.6 及以上版本。' },
  { cve: 'CVE-2025-9012', name: 'Vue.js XSS 跨站脚本漏洞', level: 'medium', levelLabel: '中危', cvss: '5.4', affectCount: 42, time: '2025-06-05', desc: 'Vue.js 中存在跨站脚本攻击（XSS）漏洞，攻击者可通过恶意模板注入执行任意脚本。', suggestion: '建议升级至 Vue.js 3.4.0 及以上版本。' },
  { cve: 'CVE-2025-3456', name: 'OpenSSL 缓冲区溢出漏洞', level: 'critical', levelLabel: '严重', cvss: '9.1', affectCount: 203, time: '2025-06-03', desc: 'OpenSSL 中存在缓冲区溢出漏洞，攻击者可利用该漏洞导致服务崩溃或执行任意代码。', suggestion: '建议升级至 OpenSSL 3.3.1 及以上版本。' },
  { cve: 'CVE-2025-7890', name: 'Django SQL 注入漏洞', level: 'high', levelLabel: '高危', cvss: '8.2', affectCount: 67, time: '2025-05-28', desc: 'Django 中存在 SQL 注入漏洞，攻击者可通过特制请求执行任意数据库操作。', suggestion: '建议升级至 Django 5.0.6 及以上版本。' },
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
  { name: 'Vue.js', count: 9, pct: 32, level: 'medium', levelLabel: '中危' },
  { name: 'Redis', count: 8, pct: 28, level: 'high', levelLabel: '高危' },
  { name: 'Nginx', count: 7, pct: 25, level: 'medium', levelLabel: '中危' },
  { name: 'Kubernetes', count: 5, pct: 18, level: 'high', levelLabel: '高危' },
  { name: 'Apache Tomcat', count: 4, pct: 14, level: 'low', levelLabel: '低危' },
]

const vulnEvents = [
  { type: 'new', typeLabel: '新增', text: 'CVE-2025-1234 Log4j2 远程代码执行漏洞被收录', time: '2 小时前' },
  { type: 'update', typeLabel: '更新', text: 'CVE-2025-5678 Spring Framework 漏洞影响范围更新', time: '5 小时前' },
  { type: 'fix', typeLabel: '修复', text: 'OpenSSL 3.3.1 版本已修复 CVE-2025-3456', time: '1 天前' },
  { type: 'change', typeLabel: '变更', text: 'CVE-2025-6789 风险等级由中危升级为高危', time: '2 天前' },
  { type: 'new', typeLabel: '新增', text: 'CVE-2025-7890 Django SQL 注入漏洞被收录', time: '3 天前' },
]

// 漏洞列表筛选
const vulnSearch = ref('')
const vulnLevelFilter = ref('')
const vulnTypeFilter = ref('')
const sortByTime = ref(false)
const vulnPage = ref(1)
const vulnPageSize = 10
const rankTab = ref('software')

const vulnListData = [
  { cve: 'CVE-2025-1234', name: 'Log4j2 远程代码执行漏洞', level: 'critical', levelLabel: '严重', software: 'Log4j', affectCount: 156, time: '2025-06-10', fixed: false, desc: 'Apache Log4j2 组件存在远程代码执行漏洞，攻击者可利用该漏洞在未授权的情况下远程执行任意代码。', suggestion: '建议升级至 Log4j 2.24.0 及以上版本。', type: 'RCE' },
  { cve: 'CVE-2025-5678', name: 'Spring Framework 目录遍历漏洞', level: 'high', levelLabel: '高危', software: 'Spring Framework', affectCount: 89, time: '2025-06-08', fixed: true, desc: 'Spring Framework 中存在目录遍历漏洞，攻击者可构造恶意请求读取服务器上的任意文件。', suggestion: '建议升级至 Spring Framework 6.1.6 及以上版本。', type: 'priv' },
  { cve: 'CVE-2025-9012', name: 'Vue.js XSS 跨站脚本漏洞', level: 'medium', levelLabel: '中危', software: 'Vue.js', affectCount: 42, time: '2025-06-05', fixed: false, desc: 'Vue.js 中存在跨站脚本攻击（XSS）漏洞，攻击者可通过恶意模板注入执行任意脚本。', suggestion: '建议升级至 Vue.js 3.4.0 及以上版本。', type: 'xss' },
  { cve: 'CVE-2025-3456', name: 'OpenSSL 缓冲区溢出漏洞', level: 'critical', levelLabel: '严重', software: 'OpenSSL', affectCount: 203, time: '2025-06-03', fixed: true, desc: 'OpenSSL 中存在缓冲区溢出漏洞，攻击者可利用该漏洞导致服务崩溃或执行任意代码。', suggestion: '建议升级至 OpenSSL 3.3.1 及以上版本。', type: 'dos' },
  { cve: 'CVE-2025-7890', name: 'Django SQL 注入漏洞', level: 'high', levelLabel: '高危', software: 'Django', affectCount: 67, time: '2025-05-28', fixed: false, desc: 'Django 中存在 SQL 注入漏洞，攻击者可通过特制请求执行任意数据库操作。', suggestion: '建议升级至 Django 5.0.6 及以上版本。', type: 'sqli' },
  { cve: 'CVE-2025-2345', name: 'Redis 信息泄露漏洞', level: 'low', levelLabel: '低危', software: 'Redis', affectCount: 34, time: '2025-05-25', fixed: true, desc: 'Redis 中存在信息泄露漏洞，攻击者可通过特定命令获取服务器内存中的敏感信息。', suggestion: '建议升级至 Redis 7.2.5 及以上版本。', type: 'priv' },
  { cve: 'CVE-2025-4567', name: 'Kubernetes 特权提升漏洞', level: 'critical', levelLabel: '严重', software: 'Kubernetes', affectCount: 78, time: '2025-05-20', fixed: false, desc: 'Kubernetes 中存在特权提升漏洞，攻击者可通过特制请求获取集群管理员权限。', suggestion: '建议升级至 Kubernetes 1.28.3 及以上版本。', type: 'priv' },
  { cve: 'CVE-2025-5679', name: 'Apache Tomcat 文件包含漏洞', level: 'medium', levelLabel: '中危', software: 'Apache Tomcat', affectCount: 45, time: '2025-05-15', fixed: false, desc: 'Apache Tomcat 被曝存在文件包含漏洞，攻击者可利用该漏洞读取服务器上的任意文件。', suggestion: '建议升级至 Tomcat 10.1.20 及以上版本。', type: 'dos' },
  { cve: 'CVE-2025-6780', name: 'Nginx 请求走私漏洞', level: 'medium', levelLabel: '中危', software: 'Nginx', affectCount: 52, time: '2025-05-10', fixed: true, desc: 'Nginx 中存在请求走私漏洞，攻击者可能绕过安全规则获取未授权访问。', suggestion: '建议升级至 Nginx 1.26.1 及以上版本。', type: 'RCE' },
  { cve: 'CVE-2025-8901', name: 'GitLab CI/CD 密钥泄露漏洞', level: 'high', levelLabel: '高危', software: 'GitLab', affectCount: 36, time: '2025-05-05', fixed: false, desc: 'GitLab 中被发现 CI/CD 流水线密钥泄露风险，攻击者可通过特制请求获取敏感信息。', suggestion: '建议升级至关 GitLab 16.8 及以上版本。', type: 'priv' },
]

const topVulnBySoftware = [...vulnListData]
  .sort((a, b) => b.affectCount - a.affectCount)
  .slice(0, 10)
  .map(v => ({
    ...v,
    count: v.affectCount,
    pct: Math.round((v.affectCount / 203) * 100),
  }))

const filteredVulnList2 = computed(() => {
  let list = [...vulnListData]
  if (vulnLevelFilter.value) list = list.filter(v => v.level === vulnLevelFilter.value)
  if (vulnTypeFilter.value) list = list.filter(v => v.type === vulnTypeFilter.value)
  const q = vulnSearch.value.trim().toLowerCase()
  if (q) list = list.filter(v => v.cve.toLowerCase().includes(q) || v.name.toLowerCase().includes(q) || v.software.toLowerCase().includes(q))
  if (sortByTime.value) list.sort((a, b) => (a.time > b.time ? -1 : 1))
  else list.sort((a, b) => (a.time > b.time ? 1 : -1))
  return list
})

const vulnTotalPages = computed(() => Math.max(1, Math.ceil(filteredVulnList2.value.length / vulnPageSize)))

const paginatedVulnList = computed(() => {
  const start = (vulnPage.value - 1) * vulnPageSize
  return filteredVulnList2.value.slice(start, start + vulnPageSize)
})

watch([vulnSearch, vulnLevelFilter, vulnTypeFilter, sortByTime], () => { vulnPage.value = 1 })

let charts = []
function disposeCharts() { charts.forEach(c => { try { c.dispose() } catch {} }); charts = [] }
function initChart(el) { if (!el) return null; const c = echarts.init(el); charts.push(c); return c }

const vulnTrendChartRef = ref(null)
const vulnCategoryChartRef = ref(null)

function renderCharts() {
  const c1 = initChart(vulnTrendChartRef.value)
  if (c1) c1.setOption({
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

  const c2 = initChart(vulnCategoryChartRef.value)
  if (c2) c2.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
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
    }],
  })
}

onMounted(() => { renderCharts() })
onUnmounted(() => { disposeCharts() })

const resizeHandler = () => charts.forEach(c => { try { c.resize() } catch {} })
window.addEventListener('resize', resizeHandler)
onUnmounted(() => window.removeEventListener('resize', resizeHandler))
</script>

<style scoped>
.ic-page { padding: 0; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif; }
.ic-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; gap: 16px; flex-wrap: wrap; }
.ic-header-left { display: flex; align-items: center; gap: 24px; }
.ic-title { font-size: 18px; font-weight: 600; color: #111827; margin: 0; white-space: nowrap; }
.ic-tabs { display: flex; gap: 0; background: #f3f4f6; border-radius: 6px; padding: 2px; }
.ic-tab { padding: 5px 16px; border: none; background: transparent; font-size: 13px; color: #6b7280; cursor: pointer; border-radius: 5px; transition: all 0.15s; font-family: inherit; text-decoration: none; }
.ic-tab.is-active { background: #fff; color: #111827; font-weight: 500; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
.ic-tab:hover:not(.is-active) { color: #374151; }
.ic-header-right { display: flex; align-items: center; gap: 12px; }
.ic-search { display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: #fff; border: 1px solid #d1d5db; border-radius: 6px; width: 260px; }
.ic-search svg { flex-shrink: 0; color: #9ca3af; }
.ic-search input { border: none; outline: none; font-size: 13px; color: #374151; width: 100%; background: transparent; }
.ic-search input::placeholder { color: #9ca3af; }
.ic-section { margin-bottom: 20px; }
.ic-section--grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.ic-stat-row { display: flex; gap: 12px; }
.ic-stat-card { flex: 1; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 16px; display: flex; flex-direction: column; transition: box-shadow 0.15s; }
.ic-stat-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.ic-stat-card--danger { background: #fff; border-color: #fecaca; }
.ic-stat-card--warn { background: #fff; border-color: #fde68a; }
.ic-stat-num { font-size: 26px; font-weight: 700; color: #111827; line-height: 1.2; letter-spacing: -0.5px; }
.ic-stat-card--danger .ic-stat-num { color: #dc2626; }
.ic-stat-card--warn .ic-stat-num { color: #d97706; }
.ic-stat-label { font-size: 12px; color: #6b7280; margin-top: 4px; font-weight: 400; }
.ic-chart-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
.ic-card-title { font-size: 14px; font-weight: 600; color: #111827; margin: 0 0 12px; display: flex; align-items: center; gap: 8px; }
.ic-card-title-sub { font-size: 12px; font-weight: 400; color: #9ca3af; }
.ic-chart-box { width: 100%; height: 220px; }
/* 排行榜切换 */
.ic-rank-tabs { display: flex; gap: 4px; background: #f3f4f6; border-radius: 5px; padding: 2px; }
.ic-rank-tab { padding: 3px 12px; border: none; background: transparent; font-size: 12px; color: #6b7280; cursor: pointer; border-radius: 4px; font-family: inherit; }
.ic-rank-tab.is-active { background: #fff; color: #111827; font-weight: 500; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
.ic-card-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.ic-card-hd .ic-card-title { margin: 0; }
.ic-filter-group { display: flex; gap: 4px; background: #f3f4f6; border-radius: 5px; padding: 2px; }
.ic-filter-btn { padding: 3px 12px; border: none; background: transparent; font-size: 12px; color: #6b7280; cursor: pointer; border-radius: 4px; font-family: inherit; }
.ic-filter-btn.is-active { background: #fff; color: #111827; font-weight: 500; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
.ic-vuln-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.ic-vuln-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; cursor: pointer; transition: box-shadow 0.15s; }
.ic-vuln-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.ic-vuln-card-hd { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.ic-cve { font-family: 'SF Mono', 'Menlo', 'Consolas', monospace; font-size: 12px; color: #da203e; font-weight: 500; }
.ic-cvss { font-size: 11px; color: #9ca3af; margin-left: auto; }
.ic-vuln-name { font-size: 13px; color: #374151; margin: 0 0 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.ic-vuln-card-meta { display: flex; justify-content: space-between; font-size: 12px; color: #6b7280; }
.ic-level { display: inline-block; padding: 1px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; line-height: 18px; }
.ic-level--critical { background: #7c1d1d; color: #fff; }
.ic-level--high { background: #dc2626; color: #fff; }
.ic-level--medium { background: #f59e0b; color: #fff; }
.ic-level--low { background: #6b7280; color: #fff; }
.ic-muted { color: #9ca3af; font-size: 12px; }
.ic-section--grid-2 .ic-chart-card { display: flex; flex-direction: column; }
.ic-section--grid-2 .ic-chart-card .ic-card-title { flex-shrink: 0; }
.ic-rank-list { display: flex; flex-direction: column; gap: 6px; overflow-y: auto; padding-right: 4px; max-height: 280px; }
.ic-rank-list::-webkit-scrollbar { width: 4px; }
.ic-rank-list::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 2px; }
.ic-timeline { display: flex; flex-direction: column; gap: 0; }
.ic-tl-item { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
.ic-rank-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
.ic-rank-item:last-child { border-bottom: none; }
.ic-rank-num { width: 20px; font-size: 13px; font-weight: 500; color: #6b7280; text-align: center; }
.ic-rank-num--top { color: #da203e; font-weight: 700; }
.ic-rank-name { width: 130px; font-size: 13px; color: #374151; font-weight: 500; }
.ic-rank-bar-wrap { flex: 1; height: 6px; background: #f3f4f6; border-radius: 3px; overflow: hidden; }
.ic-rank-bar { height: 100%; background: linear-gradient(90deg, #da203e, #f59e0b); border-radius: 3px; }
.ic-rank-count { width: 60px; font-size: 12px; color: #6b7280; text-align: right; }
.ic-rank-item .ic-level { flex-shrink: 0; }
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
/* 漏洞列表 */
.ic-vlist-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
.ic-vlist-search { display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: #fff; border: 1px solid #d1d5db; border-radius: 6px; width: 280px; }
.ic-vlist-search svg { flex-shrink: 0; color: #9ca3af; }
.ic-vlist-search input { border: none; outline: none; font-size: 13px; color: #374151; width: 100%; background: transparent; }
.ic-vlist-search input::placeholder { color: #9ca3af; }
.ic-vlist-filters { display: flex; align-items: center; gap: 8px; }
.ic-vlist-select { height: 30px; padding: 0 28px 0 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; color: #374151; background: #fff; cursor: pointer; outline: none; appearance: auto; }
.ic-vlist-sort-btn { height: 30px; padding: 0 12px; border: 1px solid #d1d5db; background: #fff; border-radius: 6px; font-size: 12px; color: #374151; cursor: pointer; font-family: inherit; }
.ic-vlist-sort-btn:hover { border-color: #da203e; color: #da203e; }
.ic-vlist-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.ic-vlist-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px 14px; cursor: pointer; transition: box-shadow 0.2s; display: flex; flex-direction: column; }
.ic-vlist-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.ic-vlist-card-hd { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.ic-vlist-card-hd .ic-cve { font-family: 'SF Mono', 'Menlo', 'Consolas', monospace; font-size: 11px; color: #da203e; font-weight: 500; flex-shrink: 0; }
.ic-vlist-status { display: inline-block; padding: 0 6px; border-radius: 4px; font-size: 10px; font-weight: 500; line-height: 16px; margin-left: auto; flex-shrink: 0; }
.ic-vlist-status--ok { background: #f0fdf4; color: #166534; }
.ic-vlist-status--warn { background: #fef2f2; color: #991b1b; }
.ic-vlist-name { font-size: 13px; font-weight: 600; color: #111827; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; min-width: 0; }
.ic-vlist-soft { font-size: 11px; color: #6b7280; margin: 0 0 4px; }
.ic-vlist-desc { font-size: 11px; color: #6b7280; margin: 0 0 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; flex: 1; }
.ic-vlist-card-ft { display: flex; align-items: center; justify-content: space-between; padding-top: 6px; border-top: 1px solid #f3f4f6; }
.ic-vlist-time { font-size: 11px; color: #9ca3af; }
.ic-vlist-detail-btn { padding: 0; border: none; background: none; font: inherit; font-size: 11px; color: #da203e; cursor: pointer; font-weight: 500; }
.ic-vlist-detail-btn:hover { text-decoration: underline; }
.ic-pagination { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 14px; }
.ic-page-btn { padding: 3px 12px; border: 1px solid #e5e7eb; background: #fff; font-size: 13px; color: #374151; cursor: pointer; border-radius: 4px; font-family: inherit; }
.ic-page-btn:hover:not(:disabled) { border-color: #da203e; color: #da203e; }
.ic-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.ic-page-info { font-size: 12px; color: #6b7280; }
</style>
