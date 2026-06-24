<template>
  <div class="ic-page">
    <!-- 图表 + 热门舆情 行 -->
    <section class="ic-section ic-section--grid-3">
      <div class="ic-chart-card">
        <h3 class="ic-card-title">舆情趋势 <span class="ic-card-title-sub">最近 30 天</span></h3>
        <div ref="opiTrendChartRef" class="ic-chart-box" />
      </div>
      <div class="ic-chart-card">
        <h3 class="ic-card-title">舆情情绪分析</h3>
        <div ref="opiSentimentChartRef" class="ic-chart-box" />
      </div>
      <div class="ic-chart-card">
        <h3 class="ic-card-title">热门舆情</h3>
        <div class="ic-hot-list">
          <div v-for="(item, i) in hotList" :key="i" class="ic-hot-row" @click="openOpiDetail(item)">
            <div class="ic-hot-rank" :class="{ 'ic-hot-rank--top': i < 3 }">{{ i + 1 }}</div>
            <div class="ic-hot-body">
              <div class="ic-hot-title">{{ item.title }}</div>
              <div class="ic-hot-meta">
                <span class="ic-hot-heat">🔥 {{ item.heat }}</span>
                <span class="ic-level" :class="'ic-level--' + item.level">{{ item.levelLabel }}</span>
                <span class="ic-hot-soft">{{ item.software }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 舆情时间轴（全宽） -->
    <section class="ic-section ic-timeline-card">
      <h3 class="ic-card-title">舆情时间轴</h3>
      <div class="ic-tl-h-track">
        <div class="ic-tl-h-line" />
        <div v-for="(evt, i) in opiTimeline" :key="i" class="ic-tl-h-node">
          <div class="ic-tl-h-node-dot" :class="'ic-tl-h-node-dot--' + evt.type" />
          <div class="ic-tl-h-node-body">
            <div class="ic-tl-h-node-hd">
              <span class="ic-tl-h-node-tag" :class="'ic-tl-h-node-tag--' + evt.type">{{ evt.typeLabel }}</span>
              <span class="ic-tl-h-node-source">{{ evt.source }}</span>
              <span class="ic-tl-h-node-time">{{ evt.time }}</span>
            </div>
            <p class="ic-tl-h-node-title">{{ evt.text }}</p>
            <p class="ic-tl-h-node-desc">{{ evt.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 实时舆情（全宽） -->
    <section class="ic-section">
      <div class="ic-chart-card">
        <div class="ic-card-hd">
          <h3 class="ic-card-title">实时舆情</h3>
          <div class="ic-filter-group">
            <button v-for="f in riskFilters" :key="f.key" type="button" class="ic-filter-btn" :class="{ 'is-active': activeRisk === f.key }" @click="activeRisk = f.key; page = 1">{{ f.label }}</button>
          </div>
        </div>
        <div class="ic-rt-search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="searchQuery" type="text" placeholder="搜索标题、软件或标签..." />
        </div>
        <div class="ic-realtime-list">
          <div v-for="(item, i) in paginatedRealtime" :key="i" class="ic-rt-card" @click="openOpiDetail(item)">
            <div class="ic-rt-hd">
              <span class="ic-level" :class="'ic-level--' + item.level">{{ item.levelLabel }}</span>
              <div class="ic-rt-tags">
                <span v-for="tag in item.tags" :key="tag" class="ic-rt-tag">{{ tag }}</span>
              </div>
              <span class="ic-rt-source">{{ item.source }}</span>
              <span class="ic-rt-time">{{ item.time }}</span>
            </div>
            <p class="ic-rt-title">{{ item.title }}</p>
          </div>
          <div v-if="paginatedRealtime.length === 0" class="ic-empty">暂无匹配的舆情</div>
        </div>
        <div v-if="realtimeTotalPages > 1" class="ic-pagination">
          <button class="ic-page-btn" :disabled="page <= 1" @click="page--">‹</button>
          <span class="ic-page-info">{{ page }} / {{ realtimeTotalPages }}</span>
          <button class="ic-page-btn" :disabled="page >= realtimeTotalPages" @click="page++">›</button>
        </div>
      </div>
    </section>

    <Teleport to="body">
      <div v-if="opiDetail" class="ic-overlay" @click.self="opiDetail = null">
        <div class="ic-drawer ic-drawer--opi">
          <div class="ic-drawer-hd">
            <div class="ic-drawer-hd-left">
              <span class="ic-level" :class="'ic-level--' + opiDetail.level">{{ opiDetail.levelLabel }}</span>
              <h3 class="ic-drawer-title">{{ opiDetail.title }}</h3>
            </div>
            <button type="button" class="ic-drawer-close" @click="opiDetail = null">×</button>
          </div>
          <div class="ic-drawer-body">
            <div class="ic-opi-meta-grid">
              <div class="ic-opi-meta-item">
                <span class="ic-opi-meta-label">发布时间</span>
                <span class="ic-opi-meta-value">{{ opiDetail.time }}</span>
              </div>
              <div class="ic-opi-meta-item">
                <span class="ic-opi-meta-label">信息来源</span>
                <span class="ic-opi-meta-value">{{ opiDetail.source }}</span>
              </div>
              <div class="ic-opi-meta-item">
                <span class="ic-opi-meta-label">涉及软件</span>
                <span class="ic-opi-meta-value">{{ opiDetail.software }}</span>
              </div>
              <div class="ic-opi-meta-item">
                <span class="ic-opi-meta-label">热度</span>
                <span class="ic-opi-meta-value">🔥 {{ opiDetail.heat || '--' }}</span>
              </div>
            </div>
            <div v-if="opiDetail.tags" class="ic-opi-tags">
              <span v-for="tag in opiDetail.tags" :key="tag" class="ic-rt-tag">{{ tag }}</span>
            </div>
            <div class="ic-opi-divider" />
            <section class="ic-drawer-section">
              <h4 class="ic-drawer-section-title">事件描述</h4>
              <p class="ic-drawer-section-text">{{ opiDetail.content || opiDetail.summary || '暂无详细描述' }}</p>
            </section>
            <section v-if="opiDetail.cves && opiDetail.cves.length > 0" class="ic-drawer-section">
              <h4 class="ic-drawer-section-title">关联漏洞</h4>
              <div class="ic-opi-cve-list">
                <span v-for="cve in opiDetail.cves" :key="cve" class="ic-opi-cve-item">{{ cve }}</span>
              </div>
            </section>
            <div class="ic-opi-divider" />
            <section class="ic-drawer-section">
              <h4 class="ic-drawer-section-title">相关推荐</h4>
              <div class="ic-opi-rel-list">
                <div v-for="(rel, i) in relatedList" :key="i" class="ic-opi-rel-item" @click="opiDetail = rel">
                  <span class="ic-level" :class="'ic-level--' + rel.level" style="font-size:10px;line-height:16px;">{{ rel.levelLabel }}</span>
                  <div class="ic-opi-rel-body">
                    <span class="ic-opi-rel-title">{{ rel.title }}</span>
                    <span class="ic-opi-rel-source">{{ rel.source }} · {{ rel.time }}</span>
                  </div>
                </div>
              </div>
            </section>
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
const activeRisk = ref('all')
const page = ref(1)
const pageSize = 6
const opiDetail = ref(null)

const riskFilters = [
  { key: 'all', label: '全部' },
  { key: 'high', label: '高危' },
  { key: 'medium', label: '中危' },
  { key: 'low', label: '低危' },
]

// 实时舆情数据（时间倒序）
const realtimeData = [
  { title: 'Log4j 被披露新的远程代码执行漏洞（CVE-2025-6789）', level: 'critical', levelLabel: '严重', tags: ['RCE', '远程代码执行'], source: 'CNNVD', time: '2025-06-10 14:23', software: 'Log4j', heat: '98.6k', content: 'Apache Log4j2 组件被披露存在新的远程代码执行漏洞（CVE-2025-6789），CVSS 评分 9.8，影响所有 2.x 系列版本。该漏洞可被远程攻击者利用，无需身份验证即可执行任意代码。', cves: ['CVE-2025-6789'], summary: 'Apache Log4j2 组件被披露存在新的远程代码执行漏洞，建议相关用户尽快升级。' },
  { title: 'Spring 生态多个组件存在供应链投毒风险', level: 'critical', levelLabel: '严重', tags: ['供应链', '投毒'], source: 'OSCS', time: '2025-06-09 11:45', software: 'Spring Framework', heat: '76.2k', content: '安全研究人员发现 Spring 生态中有多个组件包被投毒，包含恶意代码。建议开发者在引入 Spring 相关组件时校验来源和签名，使用官方仓库和已验证的版本。', cves: [], summary: '安全研究人员发现 Spring 生态中有多个组件包被投毒，包含恶意代码。' },
  { title: 'Nginx 被曝拒绝服务漏洞，影响 1.24.x 系列版本', level: 'medium', levelLabel: '中危', tags: ['DoS', '拒绝服务'], source: 'CNVD', time: '2025-06-08 09:30', software: 'Nginx', heat: '32.1k', content: 'Nginx 官方披露了一个拒绝服务漏洞，攻击者可发送特制请求导致 Nginx 服务崩溃。该漏洞影响 Nginx 1.24.x 系列版本，建议升级至 1.26.1 及以上版本。', cves: ['CVE-2025-7891'], summary: 'Nginx 官方披露了一个拒绝服务漏洞，攻击者可发送特制请求导致服务崩溃。' },
  { title: 'Redis 发布安全更新，修复多个高危漏洞', level: 'high', levelLabel: '高危', tags: ['安全更新', '漏洞修复'], source: 'Redis 官方', time: '2025-06-07 16:50', software: 'Redis', heat: '45.3k', content: 'Redis 官方发布了 7.2.5 版本，修复了多个高危安全漏洞，包括权限提升和远程代码执行风险。建议所有使用 Redis 7.0.x 及以下版本的用户尽快升级。', cves: ['CVE-2025-2345', 'CVE-2025-2346'], summary: 'Redis 官方发布了 7.2.5 版本，修复了多个高危安全漏洞。' },
  { title: 'npm 包被批量恶意篡改事件引发社区热议', level: 'medium', levelLabel: '中危', tags: ['投毒', 'npm'], source: '开源中国', time: '2025-06-06 13:20', software: 'Node.js', heat: '28.7k', content: 'npm 生态中出现多起恶意包投毒事件，攻击者通过社会工程学手段获取维护者权限后篡改包内容。建议使用 npm 包时启用完整性校验和双因素认证。', cves: [], summary: 'npm 生态中出现多起恶意包投毒事件，攻击者通过社会工程学获取维护者权限。' },
  { title: 'OpenSSL 被曝证书验证绕过漏洞', level: 'high', levelLabel: '高危', tags: ['证书', '验证绕过'], source: 'OpenSSL 官方', time: '2025-06-05 10:15', software: 'OpenSSL', heat: '52.8k', content: 'OpenSSL 官方披露了一个证书验证绕过漏洞，攻击者可通过特制证书绕过验证机制，导致中间人攻击风险。建议升级至 OpenSSL 3.3.1 及以上版本。', cves: ['CVE-2025-3457'], summary: 'OpenSSL 官方披露了一个证书验证绕过漏洞，建议升级至最新版本。' },
  { title: 'Django 被发现 SQL 注入漏洞，影响 5.0.x 版本', level: 'high', levelLabel: '高危', tags: ['SQL注入', '数据库'], source: 'Django 官方', time: '2025-06-04 08:50', software: 'Django', heat: '38.5k', content: 'Django 官方披露了一个 SQL 注入漏洞，攻击者可通过特制请求执行任意数据库操作。该漏洞影响 Django 5.0.x 系列版本，建议升级至 5.0.6 及以上版本。', cves: ['CVE-2025-7890'], summary: 'Django 官方披露了一个 SQL 注入漏洞，建议升级至最新版本。' },
  { title: 'Kubernetes 被曝特权提升漏洞，影响多个版本', level: 'critical', levelLabel: '严重', tags: ['权限提升', '容器'], source: 'Kubernetes 官方', time: '2025-06-03 15:40', software: 'Kubernetes', heat: '62.4k', content: 'Kubernetes 官方披露了一个特权提升漏洞，攻击者可通过特制请求获取集群管理员权限。建议升级至 Kubernetes 1.28.3 及以上版本。', cves: ['CVE-2025-4567'], summary: 'Kubernetes 官方披露了一个特权提升漏洞，建议升级至最新版本。' },
  { title: 'Apache Tomcat 被曝文件包含漏洞', level: 'medium', levelLabel: '中危', tags: ['文件包含', '信息泄露'], source: 'Apache 官方', time: '2025-06-02 11:20', software: 'Apache Tomcat', heat: '25.6k', content: 'Apache Tomcat 被曝存在文件包含漏洞，攻击者可利用该漏洞读取服务器上的任意文件。该漏洞影响 Tomcat 9.x 及 10.x 系列版本。', cves: ['CVE-2025-5679'], summary: 'Apache Tomcat 被曝存在文件包含漏洞，建议升级至最新版本。' },
  { title: 'GitLab 被发现 CI/CD 流水线密钥泄露风险', level: 'high', levelLabel: '高危', tags: ['密钥泄露', 'CI/CD'], source: 'GitLab 官方', time: '2025-06-01 09:10', software: 'GitLab', heat: '41.2k', content: 'GitLab 官方披露了一个 CI/CD 流水线密钥泄露风险，攻击者可通过特制请求获取 CI/CD 变量中的敏感信息。建议升级至 GitLab 16.8 及以上版本。', cves: [], summary: 'GitLab 官方披露了 CI/CD 流水线密钥泄露风险，建议升级至最新版本。' },
]

const relatedList = [
  { title: 'Log4j 漏洞影响范围持续扩大', level: 'critical', levelLabel: '严重', tags: ['RCE'], source: 'CNNVD', time: '2025-06-10', software: 'Log4j', heat: '98.6k', content: '', cves: [] },
  { title: 'Spring Boot 发布安全更新公告', level: 'high', levelLabel: '高危', tags: ['安全更新'], source: 'Spring 官方', time: '2025-06-08', software: 'Spring Framework', heat: '42.1k', content: '', cves: [] },
  { title: '开源软件供应链安全指南发布', level: 'low', levelLabel: '低危', tags: ['合规', '指南'], source: 'Linux 基金会', time: '2025-06-07', software: '开源软件', heat: '18.5k', content: '', cves: [] },
]

const hotList = [...realtimeData].sort((a, b) => parseFloat(b.heat) - parseFloat(a.heat))

const filteredRealtime = computed(() => {
  let list = realtimeData
  if (activeRisk.value === 'high') list = list.filter(v => v.level === 'critical' || v.level === 'high')
  else if (activeRisk.value === 'medium') list = list.filter(v => v.level === 'medium')
  else if (activeRisk.value === 'low') list = list.filter(v => v.level === 'low')
  const q = searchQuery.value.trim().toLowerCase()
  if (q) list = list.filter(v => v.title.toLowerCase().includes(q) || v.software.toLowerCase().includes(q) || (v.tags || []).some(t => t.toLowerCase().includes(q)))
  return list
})

const realtimeTotalPages = computed(() => Math.max(1, Math.ceil(filteredRealtime.value.length / pageSize)))

const paginatedRealtime = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredRealtime.value.slice(start, start + pageSize)
})

watch(searchQuery, () => { page.value = 1 })
watch(activeRisk, () => { page.value = 1 })

function openOpiDetail(item) {
  opiDetail.value = item
}

const opiTimeline = [
  { type: 'security', typeLabel: '安全事件', text: 'Log4j 被披露新的远程代码执行漏洞', desc: 'Apache Log4j2 组件被披露存在新的远程代码执行漏洞（CVE-2025-6789），CVSS 评分 9.8，影响所有 2.x 系列版本。', source: 'CNNVD', time: '2025-06-10' },
  { type: 'license', typeLabel: '许可证变更', text: 'Elasticsearch 从 Apache 2.0 变更为 SSPL', desc: 'Elasticsearch 宣布将其开源许可证从 Apache 2.0 变更为 SSPL，引发社区关于开源合规的广泛讨论。', source: 'Elastic 官方', time: '2025-06-07' },
  { type: 'community', typeLabel: '社区争议', text: 'WordPress 社区商标争议持续升级', desc: 'WordPress 基金会与 WP Engine 之间的商标授权争议持续升级，双方未能达成一致意见。', source: '开源中国', time: '2025-06-05' },
  { type: 'maintainer', typeLabel: '维护者退出', text: 'faker.js 核心维护者宣布退出项目维护', desc: 'faker.js 核心维护者因长期缺乏社区支持与资金援助，正式宣布退出项目维护工作。', source: 'GitHub', time: '2025-06-02' },
  { type: 'acquire', typeLabel: '企业收购', text: 'IBM 宣布收购 HashiCorp', desc: 'IBM 以 64 亿美元收购 HashiCorp，Terraform 等核心开源项目的许可证变更引发社区关注。', source: 'Reuters', time: '2025-05-28' },
  { type: 'security', typeLabel: '安全事件', text: 'npm 生态出现大规模恶意包投毒事件', desc: 'npm 仓库中发现大量恶意包通过依赖混淆方式进行投毒，影响数千个下游项目。', source: 'OSCS', time: '2025-05-25' },
]

let charts = []
function disposeCharts() { charts.forEach(c => { try { c.dispose() } catch {} }); charts = [] }
function initChart(el) { if (!el) return null; const c = echarts.init(el); charts.push(c); return c }

const opiTrendChartRef = ref(null)
const opiSentimentChartRef = ref(null)

function renderCharts() {
  const c1 = initChart(opiTrendChartRef.value)
  if (c1) c1.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 36, right: 10, top: 4, bottom: 34 },
    xAxis: { type: 'category', data: Array.from({ length: 30 }, (_, i) => `${i + 1}日`), axisLabel: { fontSize: 9, color: '#9ca3af', interval: 5 } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f3f4f6' } }, axisLabel: { fontSize: 9, color: '#9ca3af' }, show: true },
    series: [
      { name: '正面', type: 'line', smooth: true, stack: 'total', data: [15, 18, 12, 20, 22, 18, 25, 30, 28, 22, 18, 15, 20, 25, 22, 18, 15, 10, 18, 22, 28, 32, 25, 20, 18, 22, 28, 25, 20, 18], lineStyle: { color: '#166534', width: 2 }, itemStyle: { color: '#166534' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(22,101,52,0.12)' }, { offset: 1, color: 'rgba(22,101,52,0)' }]) } },
      { name: '中性', type: 'line', smooth: true, stack: 'total', data: [8, 10, 6, 12, 14, 10, 15, 18, 16, 12, 10, 8, 12, 14, 12, 10, 8, 5, 10, 12, 15, 18, 14, 12, 10, 12, 15, 14, 12, 10], lineStyle: { color: '#6b7280', width: 2 }, itemStyle: { color: '#6b7280' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(107,114,128,0.1)' }, { offset: 1, color: 'rgba(107,114,128,0)' }]) } },
      { name: '负面', type: 'line', smooth: true, stack: 'total', data: [4, 6, 3, 8, 6, 5, 10, 12, 8, 6, 4, 3, 6, 8, 6, 5, 3, 2, 4, 6, 8, 10, 6, 5, 4, 6, 8, 7, 5, 4], lineStyle: { color: '#dc2626', width: 2 }, itemStyle: { color: '#dc2626' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(220,38,38,0.12)' }, { offset: 1, color: 'rgba(220,38,38,0)' }]) } },
    ],
    legend: { data: ['正面', '中性', '负面'], bottom: 0, left: 'center', icon: 'circle', itemWidth: 6, itemHeight: 6, textStyle: { fontSize: 10, color: '#6b7280' } },
  })

  const c2 = initChart(opiSentimentChartRef.value)
  if (c2) c2.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center', itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 11, color: '#6b7280' } },
    series: [{
      type: 'pie', radius: ['35%', '58%'], center: ['40%', '50%'],
      data: [
        { name: '正面', value: 428, itemStyle: { color: '#166534' } },
        { name: '中性', value: 337, itemStyle: { color: '#6b7280' } },
        { name: '负面', value: 127, itemStyle: { color: '#dc2626' } },
      ],
      label: { show: false },
      emphasis: { label: { show: true } },
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
.ic-section--grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
.ic-section--grid-3 .ic-chart-card { display: flex; flex-direction: column; }
.ic-section--grid-3 .ic-chart-box { flex: 1; min-height: 60px; width: 100%; }
.ic-stat-row { display: flex; gap: 12px; }
.ic-stat-card { flex: 1; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; display: flex; flex-direction: column; }
.ic-stat-card--danger { border-left: 3px solid #dc2626; }
.ic-stat-card--warn { border-left: 3px solid #f59e0b; }
.ic-stat-num { font-size: 28px; font-weight: 700; color: #111827; line-height: 1.2; }
.ic-stat-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
.ic-chart-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
.ic-card-title { font-size: 14px; font-weight: 600; color: #111827; margin: 0 0 12px; display: flex; align-items: center; gap: 8px; }
.ic-card-title-sub { font-size: 12px; font-weight: 400; color: #9ca3af; }
.ic-chart-box { width: 100%; height: 180px; }
.ic-level { display: inline-block; padding: 1px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; line-height: 18px; }
.ic-level--critical { background: #7c1d1d; color: #fff; }
.ic-level--high { background: #dc2626; color: #fff; }
.ic-level--medium { background: #f59e0b; color: #fff; }
.ic-level--low { background: #6b7280; color: #fff; }
.ic-muted { color: #9ca3af; font-size: 12px; }
/* 热门舆情（情绪分析卡片内嵌） */
.ic-hot-inline { border-top: 1px solid #f3f4f6; margin-top: 12px; padding-top: 12px; }
.ic-hot-inline-title { font-size: 13px; font-weight: 600; color: #111827; margin: 0 0 8px; }
/* 实时舆情 */
.ic-rt-search { display: flex; align-items: center; gap: 6px; padding: 6px 10px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 10px; }
.ic-rt-search svg { flex-shrink: 0; color: #9ca3af; }
.ic-rt-search input { border: none; outline: none; font-size: 12px; color: #374151; width: 100%; background: transparent; }
.ic-rt-search input::placeholder { color: #9ca3af; }
.ic-realtime-list { display: flex; flex-direction: column; gap: 6px; }
.ic-rt-card { padding: 10px 12px; border: 1px solid #f3f4f6; border-radius: 6px; cursor: pointer; transition: background 0.15s; }
.ic-rt-card:hover { background: #f9fafb; }
.ic-rt-hd { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; flex-wrap: wrap; }
.ic-rt-tags { display: flex; gap: 4px; flex-wrap: wrap; }
.ic-rt-tag { display: inline-block; padding: 0 6px; border-radius: 3px; font-size: 10px; line-height: 18px; background: #f3f4f6; color: #6b7280; font-weight: 500; }
.ic-rt-source { font-size: 11px; color: #9ca3af; }
.ic-rt-time { font-size: 11px; color: #9ca3af; margin-left: auto; }
.ic-rt-title { font-size: 13px; color: #374151; margin: 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.ic-empty { text-align: center; padding: 24px; color: #9ca3af; font-size: 13px; }
/* 热门舆情 */
.ic-hot-list { display: flex; flex-direction: column; gap: 4px; max-height: 210px; overflow-y: auto; padding-right: 4px; }
.ic-hot-list::-webkit-scrollbar { width: 4px; }
.ic-hot-list::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 2px; }
.ic-hot-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f3f4f6; cursor: pointer; transition: background 0.1s; }
.ic-hot-row:last-child { border-bottom: none; }
.ic-hot-row:hover { background: #f9fafb; margin: 0 -12px; padding-left: 12px; padding-right: 12px; border-radius: 6px; }
.ic-hot-rank { width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #6b7280; background: #f3f4f6; flex-shrink: 0; }
.ic-hot-rank--top { background: #da203e; color: #fff; }
.ic-hot-rank:nth-child(2) { background: #dc2626; color: #fff; }
.ic-hot-rank:nth-child(3) { background: #f59e0b; color: #fff; }
.ic-hot-body { flex: 1; min-width: 0; }
.ic-hot-title { font-size: 13px; font-weight: 500; color: #111827; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.ic-hot-meta { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.ic-hot-heat { color: #374151; font-weight: 500; }
.ic-hot-soft { color: #9ca3af; font-size: 11px; }
/* 舆情详情 */
.ic-drawer--opi { width: 500px; }
.ic-opi-detail-title { font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 16px; line-height: 1.5; }
.ic-opi-detail-info { display: flex; flex-direction: column; gap: 0; margin-bottom: 12px; border: 1px solid #f3f4f6; border-radius: 8px; overflow: hidden; }
.ic-opi-detail-row { display: flex; padding: 8px 12px; border-bottom: 1px solid #f3f4f6; }
.ic-opi-detail-row:last-child { border-bottom: none; }
.ic-opi-detail-label { width: 80px; font-size: 12px; color: #6b7280; flex-shrink: 0; }
.ic-opi-detail-tags { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 12px; }
.ic-opi-cve-item { display: inline-block; padding: 2px 10px; background: #fef2f2; color: #991b1b; border-radius: 4px; font-size: 12px; font-family: 'SF Mono', monospace; margin-right: 6px; margin-bottom: 4px; }
.ic-opi-rel-item { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f3f4f6; cursor: pointer; }
.ic-opi-rel-item:last-child { border-bottom: none; }
.ic-opi-rel-item:hover { opacity: 0.7; }
.ic-opi-rel-title { font-size: 13px; color: #374151; }
.ic-card-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.ic-card-hd .ic-card-title { margin: 0; }
.ic-filter-group { display: flex; gap: 4px; background: #f3f4f6; border-radius: 5px; padding: 2px; }
.ic-filter-btn { padding: 3px 12px; border: none; background: transparent; font-size: 12px; color: #6b7280; cursor: pointer; border-radius: 4px; font-family: inherit; }
.ic-filter-btn.is-active { background: #fff; color: #111827; font-weight: 500; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
/* 分页 */
.ic-pagination { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 12px; padding-top: 10px; border-top: 1px solid #f3f4f6; }
.ic-page-btn { padding: 3px 12px; border: 1px solid #e5e7eb; background: #fff; font-size: 13px; color: #374151; cursor: pointer; border-radius: 4px; font-family: inherit; transition: all 0.15s; }
.ic-page-btn:hover:not(:disabled) { border-color: #da203e; color: #da203e; }
.ic-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.ic-page-info { font-size: 12px; color: #6b7280; }
.ic-timeline-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
.ic-tl-h-track { display: flex; gap: 0; padding: 12px 0 8px; position: relative; }
.ic-tl-h-line { position: absolute; left: 6px; right: 6px; top: 18px; height: 2px; background: #e5e7eb; }
.ic-tl-h-node { flex: 1; min-width: 0; padding: 0 16px 0 0; display: flex; flex-direction: column; flex-shrink: 0; }
.ic-tl-h-node:last-child { padding-right: 0; }
.ic-tl-h-node-dot { width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; border: 2px solid #fff; box-shadow: 0 0 0 2px currentColor; z-index: 1; margin-bottom: 14px; align-self: flex-start; }
.ic-tl-h-node-dot--security { color: #dc2626; background: #fef2f2; }
.ic-tl-h-node-dot--license { color: #f59e0b; background: #fffbeb; }
.ic-tl-h-node-dot--community { color: #6366f1; background: #eef2ff; }
.ic-tl-h-node-dot--maintainer { color: #6b7280; background: #f9fafb; }
.ic-tl-h-node-dot--acquire { color: #166534; background: #f0fdf4; }
.ic-tl-h-node-body { width: 100%; }
.ic-tl-h-node-hd { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; flex-wrap: wrap; }
.ic-tl-h-node-tag { display: inline-block; padding: 0 8px; border-radius: 4px; font-size: 11px; font-weight: 500; line-height: 20px; }
.ic-tl-h-node-tag--security { background: #fef2f2; color: #991b1b; }
.ic-tl-h-node-tag--license { background: #fffbeb; color: #92400e; }
.ic-tl-h-node-tag--community { background: #eef2ff; color: #4338ca; }
.ic-tl-h-node-tag--maintainer { background: #f3f4f6; color: #6b7280; }
.ic-tl-h-node-tag--acquire { background: #f0fdf4; color: #166534; }
.ic-tl-h-node-source { font-size: 11px; color: #9ca3af; }
.ic-tl-h-node-time { font-size: 11px; color: #9ca3af; margin-left: auto; }
.ic-tl-h-node-title { font-size: 13px; font-weight: 500; color: #111827; margin: 0 0 4px; }
.ic-tl-h-node-desc { font-size: 12px; color: #6b7280; margin: 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

.ic-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.25); z-index: 1000; display: flex; justify-content: flex-end; }
.ic-drawer { width: 420px; background: #fff; height: 100%; display: flex; flex-direction: column; }
.ic-drawer-hd { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #e5e7eb; flex-shrink: 0; gap: 12px; }
.ic-drawer-hd h3 { margin: 0; font-size: 15px; font-weight: 600; color: #111827; }
.ic-drawer-close { padding: 0 4px; border: none; background: none; font-size: 20px; color: #9ca3af; cursor: pointer; line-height: 1; flex-shrink: 0; }
.ic-drawer-close:hover { color: #374151; }
.ic-drawer-body { padding: 20px; flex: 1; overflow-y: auto; }
/* 舆情详情 */
.ic-drawer--opi { width: 520px; }
.ic-drawer-hd-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.ic-drawer-title { margin: 0; font-size: 15px; font-weight: 600; color: #111827; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.ic-opi-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid #f3f4f6; border-radius: 8px; overflow: hidden; margin-bottom: 12px; }
.ic-opi-meta-item { padding: 10px 14px; border-bottom: 1px solid #f3f4f6; }
.ic-opi-meta-item:nth-child(n+3) { border-bottom: none; }
.ic-opi-meta-item:nth-child(odd) { border-right: 1px solid #f3f4f6; }
.ic-opi-meta-label { display: block; font-size: 11px; color: #9ca3af; margin-bottom: 2px; }
.ic-opi-meta-value { font-size: 13px; color: #374151; font-weight: 500; }
.ic-opi-tags { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 4px; }
.ic-opi-divider { height: 1px; background: #f3f4f6; margin: 16px 0; }
.ic-drawer-section { margin-bottom: 0; }
.ic-drawer-section-title { font-size: 13px; font-weight: 600; color: #111827; margin: 0 0 8px; }
.ic-drawer-section-text { font-size: 13px; color: #6b7280; line-height: 1.7; margin: 0; }
.ic-opi-cve-list { display: flex; flex-wrap: wrap; gap: 6px; }
.ic-opi-cve-item { display: inline-block; padding: 3px 10px; background: #fef2f2; color: #991b1b; border-radius: 4px; font-size: 12px; font-family: 'SF Mono', 'Menlo', monospace; }
.ic-opi-rel-list { display: flex; flex-direction: column; }
.ic-opi-rel-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f3f4f6; cursor: pointer; transition: opacity 0.15s; }
.ic-opi-rel-item:last-child { border-bottom: none; }
.ic-opi-rel-item:hover { opacity: 0.7; }
.ic-opi-rel-body { flex: 1; min-width: 0; }
.ic-opi-rel-title { display: block; font-size: 13px; color: #374151; line-height: 1.4; }
.ic-opi-rel-source { display: block; font-size: 11px; color: #9ca3af; margin-top: 2px; }
</style>
