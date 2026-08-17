<template>
  <div class="member-workbench">
    <!-- ===== KPI 指标行（6 卡片） ===== -->
    <div class="mw-kpi">
      <div class="mw-stat">
        <div class="mw-stat-body">
          <div class="mw-stat-info">
            <span class="mw-stat-value">{{ kpi.availableTrains }}</span>
            <span class="mw-stat-label">当前可用火车</span>
          </div>
          <span class="mw-stat-ico mw-stat-ico--blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></span>
        </div>
        <div class="mw-stat-foot"><span class="mw-stat-change mw-stat-change--up">+2 本月新增</span></div>
      </div>
      <div class="mw-stat">
        <div class="mw-stat-body">
          <div class="mw-stat-info">
            <span class="mw-stat-value">{{ kpi.mySoftware }}</span>
            <span class="mw-stat-label">我的软件</span>
          </div>
          <span class="mw-stat-ico mw-stat-ico--purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></span>
        </div>
        <div class="mw-stat-foot"><span class="mw-stat-change mw-stat-change--up">+6 较上周</span></div>
      </div>
      <div class="mw-stat">
        <div class="mw-stat-body">
          <div class="mw-stat-info">
            <span class="mw-stat-value">{{ kpi.myComponents }}</span>
            <span class="mw-stat-label">我的制品</span>
          </div>
          <span class="mw-stat-ico mw-stat-ico--cyan"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></span>
        </div>
        <div class="mw-stat-foot"><span class="mw-stat-change mw-stat-change--up">+23 较上周</span></div>
      </div>
      <div class="mw-stat">
        <div class="mw-stat-body">
          <div class="mw-stat-info">
            <span class="mw-stat-value mw-stat-value--danger">{{ kpi.pendingAlerts }}</span>
            <span class="mw-stat-label">待处理预警</span>
          </div>
          <span class="mw-stat-ico mw-stat-ico--red"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span>
        </div>
        <div class="mw-stat-foot"><span class="mw-stat-change mw-stat-change--danger">+2 较上周</span></div>
      </div>
      <div class="mw-stat">
        <div class="mw-stat-body">
          <div class="mw-stat-info">
            <span class="mw-stat-value">{{ kpi.monthNewSoftware }}</span>
            <span class="mw-stat-label">本月新增软件</span>
          </div>
          <span class="mw-stat-ico mw-stat-ico--green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></span>
        </div>
        <div class="mw-stat-foot"><span class="mw-stat-change mw-stat-change--up">+4 较上月</span></div>
      </div>
      <div class="mw-stat">
        <div class="mw-stat-body">
          <div class="mw-stat-info">
            <span class="mw-stat-value">{{ kpi.monthNewProducts }}</span>
            <span class="mw-stat-label">本月新增制品</span>
          </div>
          <span class="mw-stat-ico mw-stat-ico--orange"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></span>
        </div>
        <div class="mw-stat-foot"><span class="mw-stat-change mw-stat-change--up">+4 较上月</span></div>
      </div>
    </div>

    <!-- ===== 可用火车 + 风险提示 ===== -->
    <div class="mw-grid mw-grid--2">
      <!-- 当前可用版本火车 -->
      <div class="mw-card">
        <div class="mw-card-hd">
          <h3>当前可用版本火车</h3>
          <div class="mw-card-actions">
            <input v-model.trim="trainKeyword" type="search" class="mw-search" placeholder="搜索火车名称/编号..." />
          </div>
        </div>
        <div class="mw-train-scroll">
          <div class="mw-train-list">
            <div v-for="t in filteredTrains" :key="t.id" class="mw-train-item">
              <div class="mw-train-head">
                <span class="mw-train-name" :title="t.code">{{ t.name }}</span>
                <span class="mw-train-status">已发车</span>
              </div>
              <div class="mw-train-meta">
                <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mw-meta-ico" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> {{ t.start }} ~ {{ t.end }}</span>
                <span>软件 {{ t.softwareCount }} · 制品 {{ t.componentCount }}</span>
              </div>
            </div>
            <p v-if="!filteredTrains.length" class="mw-empty-sm">暂无已发车版本火车</p>
          </div>
        </div>
      </div>

      <!-- 风险预警 -->
      <div class="mw-card">
        <div class="mw-card-hd">
          <h3>风险预警</h3>
          <div class="mw-card-actions">
            <input v-model.trim="alertKeyword" type="search" class="mw-search" placeholder="搜索预警名称..." />
          </div>
        </div>
        <div class="mw-alert-scroll">
          <div class="mw-alert-list">
            <div v-for="a in filteredAlerts" :key="a.id" class="mw-alert-item" @click="goAlertDetail(a)">
              <div class="mw-alert-head">
                <span class="mw-alert-name" :title="a.name">{{ a.name }}</span>
                <span class="mw-alert-level" :class="'mw-alert-level--' + a.level">{{ a.level }}</span>
              </div>
              <div class="mw-alert-meta">
                <span>发布时间：{{ a.time }}</span>
                <span class="mw-alert-detail" :title="a.detail">{{ a.detail }}</span>
              </div>
            </div>
            <p v-if="!filteredAlerts.length" class="mw-empty-sm">暂无匹配的组织预警信息</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 我的订阅项目 ===== -->
    <div class="mw-card">
      <div class="mw-card-hd">
        <h3>我的订阅项目</h3>
        <div class="mw-card-actions">
          <input v-model.trim="subKeyword" type="search" class="mw-search" placeholder="搜索项目名称..." />
        </div>
      </div>
      <div class="mw-sub-table">
        <div class="mw-sub-row mw-sub-row--head">
          <span>软件名称</span>
          <span>版本</span>
          <span>编程语言</span>
          <span>开发商</span>
          <span>订阅时间</span>
          <span>预警状态</span>
        </div>
        <div v-for="s in pagedSubscriptions" :key="s.id" class="mw-sub-row">
          <span class="mw-sub-name">{{ s.name }}</span>
          <span class="mw-sub-ver">{{ s.version }}</span>
          <span class="mw-sub-lang">{{ s.language }}</span>
          <span class="mw-sub-developer">{{ s.developer }}</span>
          <span class="mw-sub-time">{{ s.subscribedAt }}</span>
          <span>
            <span v-if="s.hasAlert" class="mw-sub-alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mw-meta-ico" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> 有预警
            </span>
            <span v-else class="mw-sub-alert-ok">正常</span>
          </span>
        </div>
        <p v-if="!filteredSubscriptions.length" class="mw-empty-sm">暂无订阅项目</p>
        <footer v-else class="mw-pager">
          <span class="mw-pager-total">共 {{ filteredSubscriptions.length }} 项 · 第 {{ subPage }}/{{ subPageCount }} 页</span>
          <div class="mw-pager-btns">
            <button type="button" class="mw-page-btn" :disabled="subPage <= 1" @click="goSubPage(subPage - 1)">上一页</button>
            <button
              v-for="p in subPageCount"
              :key="p"
              type="button"
              class="mw-page-btn"
              :class="{ 'is-active': p === subPage }"
              @click="goSubPage(p)"
            >{{ p }}</button>
            <button type="button" class="mw-page-btn" :disabled="subPage >= subPageCount" @click="goSubPage(subPage + 1)">下一页</button>
          </div>
        </footer>
      </div>
    </div>

    <!-- ===== 我的可用软件（卡片流） ===== -->
    <div class="mw-card">
      <div class="mw-card-hd">
        <h3>我的可用软件</h3>
        <div class="mw-card-actions">
          <input v-model.trim="softKeyword" type="search" class="mw-search" placeholder="搜索软件名..." />
          <select v-model="softTrain" class="mw-select">
            <option value="">全部火车</option>
            <option v-for="t in trains" :key="t.id" :value="t.code">{{ t.code }}</option>
          </select>
        </div>
      </div>
      <div class="mw-soft-grid">
        <div v-for="s in pagedSoftware" :key="s.id" class="mw-soft-card">
          <div class="mw-soft-head">
            <span class="mw-soft-name" :title="s.name">{{ s.name }}</span>
            <span class="mw-soft-ver">{{ s.version }}</span>
          </div>
          <div class="mw-soft-meta">
            <span class="mw-score" :class="scoreClass(s.score)">{{ s.score }}</span>
            <span class="mw-vuln" :class="{ 'has-vuln': s.vulnCount > 0 }">{{ s.vulnCount }} 漏洞</span>
            <span class="mw-license">{{ s.license }}</span>
          </div>
          <div class="mw-soft-foot">
            <span class="mw-lang-tag" :title="s.language">{{ s.language }}</span>
            <div class="mw-soft-ops">
              <button type="button" class="mw-link" @click="download(s.name, s.version)">下载源码</button>
              <span class="mw-sep">|</span>
              <button type="button" class="mw-link" @click="toDetail(s)">详情</button>
            </div>
          </div>
        </div>
      </div>
      <p v-if="!filteredSoftware.length" class="mw-empty-sm">暂无可用软件</p>
      <footer v-else class="mw-pager">
        <span class="mw-pager-total">共 {{ filteredSoftware.length }} 个 · 第 {{ softPage }}/{{ softPageCount }} 页</span>
        <div class="mw-pager-btns">
          <button type="button" class="mw-page-btn" :disabled="softPage <= 1" @click="goSoftPage(softPage - 1)">上一页</button>
          <button
            v-for="p in softPageCount"
            :key="p"
            type="button"
            class="mw-page-btn"
            :class="{ 'is-active': p === softPage }"
            @click="goSoftPage(p)"
          >{{ p }}</button>
          <button type="button" class="mw-page-btn" :disabled="softPage >= softPageCount" @click="goSoftPage(softPage + 1)">下一页</button>
        </div>
      </footer>
    </div>

    <!-- ===== 可用制品 + 图表 ===== -->
    <div class="mw-grid mw-grid--2">
      <div class="mw-card mw-card--wide">
        <div class="mw-card-hd">
          <h3>我的可用制品</h3>
          <div class="mw-card-actions">
            <input v-model.trim="compKeyword" type="search" class="mw-search" placeholder="搜索制品名/来源组织..." />
          </div>
        </div>
        <div class="mw-comp-table">
          <div class="mw-comp-row mw-comp-row--head">
            <span>制品名称</span>
            <span>版本</span>
            <span>来源组织</span>
            <span>下载</span>
          </div>
          <div class="mw-comp-row" v-for="c in pagedComponents" :key="c.id">
            <span class="mw-comp-name" :title="c.name">{{ c.name }}</span>
            <span class="mw-comp-ver">{{ c.version }}</span>
            <span class="mw-comp-group" :title="c.sourceOrg">{{ c.sourceOrg }}</span>
            <button type="button" class="mw-link" @click="download(c.name, c.version)">下载</button>
          </div>
          <p v-if="!filteredComponents.length" class="mw-empty-sm">暂无可用制品</p>
          <footer v-else class="mw-pager">
            <span class="mw-pager-total">共 {{ filteredComponents.length }} 个 · 第 {{ compPage }}/{{ compPageCount }} 页</span>
            <div class="mw-pager-btns">
              <button type="button" class="mw-page-btn" :disabled="compPage <= 1" @click="goCompPage(compPage - 1)">上一页</button>
              <button
                v-for="p in compPageCount"
                :key="p"
                type="button"
                class="mw-page-btn"
                :class="{ 'is-active': p === compPage }"
                @click="goCompPage(p)"
              >{{ p }}</button>
              <button type="button" class="mw-page-btn" :disabled="compPage >= compPageCount" @click="goCompPage(compPage + 1)">下一页</button>
            </div>
          </footer>
        </div>
      </div>

      <div class="mw-card mw-card--charts">
        <div class="mw-card-hd">
          <h3>订阅与评分分布</h3>
        </div>
        <div class="mw-card-body">
          <div class="mw-charts-row">
            <div class="mw-chart-block">
              <p class="mw-chart-label">订阅类型分布</p>
              <div ref="subTypeChartRef" class="mw-chart mw-chart--sm"></div>
            </div>
            <div class="mw-chart-block">
              <p class="mw-chart-label">软件评分分布</p>
              <div ref="scoreChartRef" class="mw-chart mw-chart--sm"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'

defineProps({ org: { type: Object, required: true } })
const router = useRouter()

/* —— 数据（模拟：仅已发车版本火车内的软件/制品） —— */
const kpi = {
  availableTrains: 4,
  mySoftware: 128,
  myComponents: 356,
  pendingAlerts: 6,
  monthNewSoftware: 14,
  monthNewProducts: 14,
}

const trains = [
  { id: 'vt-01', name: '2026 Q1 第一次发车', code: 'VT-2026-05-001', start: '2026-05-01', end: '2026-08-01', softwareCount: 32, componentCount: 96 },
  { id: 'vt-02', name: '2026 Q2 安全加固发车', code: 'VT-2026-06-001', start: '2026-06-15', end: '2026-09-15', softwareCount: 28, componentCount: 84 },
  { id: 'vt-03', name: '2026 Q2 功能迭代发车', code: 'VT-2026-07-001', start: '2026-07-01', end: '2026-10-01', softwareCount: 36, componentCount: 108 },
  { id: 'vt-04', name: '2026 Q3 首批发车', code: 'VT-2026-07-002', start: '2026-07-20', end: '2026-10-20', softwareCount: 32, componentCount: 68 },
  { id: 'vt-05', name: '2026 Q3 安全加固发车', code: 'VT-2026-08-001', start: '2026-08-01', end: '2026-11-01', softwareCount: 26, componentCount: 78 },
  { id: 'vt-06', name: '2026 Q3 补丁更新发车', code: 'VT-2026-08-002', start: '2026-08-15', end: '2026-11-15', softwareCount: 18, componentCount: 54 },
  { id: 'vt-07', name: '2026 Q4 预发布发车', code: 'VT-2026-09-001', start: '2026-09-01', end: '2026-12-01', softwareCount: 30, componentCount: 90 },
  { id: 'vt-08', name: '2026 Q4 例行发车', code: 'VT-2026-09-002', start: '2026-09-20', end: '2026-12-20', softwareCount: 22, componentCount: 66 },
]

/* —— 版本火车搜索 —— */
const trainKeyword = ref('')
const filteredTrains = computed(() => {
  const kw = trainKeyword.value.trim().toLowerCase()
  if (!kw) return trains
  return trains.filter((t) => t.name.toLowerCase().includes(kw) || t.code.toLowerCase().includes(kw))
})

/** 根据火车编号（code）查火车名称 */
function trainName(code) {
  const t = trains.find((x) => x.code === code)
  return t ? t.name : code
}

const alerts = [
  { id: 1, level: '高危', name: 'Apache Log4j2 远程代码执行', time: '2026-08-02', detail: 'Log4j2 存在 JNDI 注入漏洞，可导致远程代码执行，建议升级至 2.24.3。' },
  { id: 2, level: '超危', name: 'OpenSSL 缓冲区溢出漏洞', time: '2026-07-30', detail: 'OpenSSL 部分版本存在缓冲区溢出，可能被利用执行任意代码，请及时升级。' },
  { id: 3, level: '高危', name: 'Spring Framework 权限绕过', time: '2026-07-28', detail: 'Spring 框架存在权限校验绕过漏洞，影响低版本应用，需升级至 6.1.5 以上。' },
  { id: 4, level: '中危', name: 'Nginx HTTP/2 请求走私', time: '2026-07-25', detail: 'Nginx HTTP/2 模块存在请求走私风险，建议关闭 HTTP/2 或升级补丁。' },
  { id: 5, level: '中危', name: 'Redis 权限提升漏洞', time: '2026-07-23', detail: 'Redis 默认配置下存在未授权访问风险，可能导致权限提升，请配置 ACL。' },
  { id: 6, level: '低危', name: 'Vue.js XSS 渲染风险', time: '2026-07-20', detail: 'Vue.js 部分模板存在 XSS 渲染风险，建议使用安全插值并升级至 3.5 以上。' },
  { id: 7, level: '高危', name: 'Kafka 反序列化漏洞', time: '2026-07-18', detail: 'Kafka 客户端反序列化存在远程代码执行风险，请升级至 3.9 以上版本。' },
  { id: 8, level: '中危', name: 'Elasticsearch 信息泄露', time: '2026-07-15', detail: 'Elasticsearch 未授权访问可能导致敏感数据泄露，请启用安全认证。' },
  { id: 9, level: '低危', name: 'jackson-databind DoS', time: '2026-07-12', detail: 'jackson-databind 存在反序列化拒绝服务风险，建议升级至 2.19 以上。' },
  { id: 10, level: '中危', name: 'Netty 内存泄漏风险', time: '2026-07-10', detail: 'Netty 长连接场景存在内存泄漏风险，长时间运行可能耗尽内存，建议升级补丁。' },
]

/* —— 组织风险预警：展示最新 10 条 —— */
const RECENT_ALERT_LIMIT = 10
const recentAlerts = computed(() => alerts.slice(0, RECENT_ALERT_LIMIT))

/* —— 风险预警搜索 —— */
const alertKeyword = ref('')
const filteredAlerts = computed(() => {
  const kw = alertKeyword.value.trim().toLowerCase()
  if (!kw) return recentAlerts.value
  return recentAlerts.value.filter((a) => a.name.toLowerCase().includes(kw))
})

/** 点击预警项进入组织预警详情页 */
function goAlertDetail(a) {
  router.push({ name: 'vulnerability-alert', query: { alert: a.name } })
}

const software = [
  { id: 1, name: 'Spring Boot', version: '3.5.12', score: 9.3, vulnCount: 0, license: 'Apache-2.0', language: 'Java', train: 'VT-2026-05-001' },
  { id: 2, name: 'Apache Log4j2', version: '2.24.3', score: 8.1, vulnCount: 2, license: 'Apache-2.0', language: 'Java', train: 'VT-2026-05-001' },
  { id: 3, name: 'Redis', version: '7.2.4', score: 9.6, vulnCount: 0, license: 'BSD-3-Clause', language: 'C', train: 'VT-2026-06-001' },
  { id: 4, name: 'Nginx', version: '1.26.0', score: 9.1, vulnCount: 1, license: 'BSD-2-Clause', language: 'C', train: 'VT-2026-06-001' },
  { id: 5, name: 'Vue.js', version: '3.5.13', score: 9.4, vulnCount: 0, license: 'MIT', language: 'TypeScript', train: 'VT-2026-07-001' },
  { id: 6, name: 'OpenSSL', version: '3.3.0', score: 8.6, vulnCount: 3, license: 'Apache-2.0', language: 'C', train: 'VT-2026-07-001' },
  { id: 7, name: 'Elasticsearch', version: '8.15.0', score: 8.8, vulnCount: 1, license: 'Elastic-2.0', language: 'Java', train: 'VT-2026-07-002' },
  { id: 8, name: 'Kafka', version: '3.9.2', score: 9.0, vulnCount: 0, license: 'Apache-2.0', language: 'Scala', train: 'VT-2026-07-002' },
]

const components = [
  { id: 1, name: 'spring-core', version: '6.2.17', groupId: 'org.springframework', sourceOrg: 'VMware' },
  { id: 2, name: 'log4j-core', version: '2.24.3', groupId: 'org.apache.logging.log4j', sourceOrg: 'Apache' },
  { id: 3, name: 'jackson-databind', version: '2.19.4', groupId: 'com.fasterxml.jackson.core', sourceOrg: 'FasterXML' },
  { id: 4, name: 'hibernate-core', version: '6.6.44.Final', groupId: 'org.hibernate.orm', sourceOrg: 'Hibernate' },
  { id: 5, name: 'vue', version: '3.5.13', groupId: 'org.vuejs', sourceOrg: 'Evan You' },
  { id: 6, name: 'react', version: '18.3.1', groupId: 'org.facebook.react', sourceOrg: 'Meta' },
  { id: 7, name: 'netty-all', version: '4.1.112', groupId: 'io.netty', sourceOrg: 'Netty' },
  { id: 8, name: 'guava', version: '33.2.0', groupId: 'com.google.guava', sourceOrg: 'Google' },
  { id: 9, name: 'commons-text', version: '1.12.0', groupId: 'org.apache.commons', sourceOrg: 'Apache' },
  { id: 10, name: 'fastjson', version: '2.0.47', groupId: 'com.alibaba', sourceOrg: 'Alibaba' },
  { id: 11, name: 'tomcat-embed-core', version: '10.1.33', groupId: 'org.apache.tomcat', sourceOrg: 'Apache' },
  { id: 12, name: 'gson', version: '2.11.0', groupId: 'com.google.code.gson', sourceOrg: 'Google' },
]

/* —— 可用制品搜索 + 分页 —— */
const compKeyword = ref('')
const filteredComponents = computed(() => {
  const kw = compKeyword.value.trim().toLowerCase()
  if (!kw) return components
  return components.filter((c) => c.name.toLowerCase().includes(kw) || c.sourceOrg.toLowerCase().includes(kw))
})
const COMP_PAGE_SIZE = 6
const compPage = ref(1)
const pagedComponents = computed(() => {
  const start = (compPage.value - 1) * COMP_PAGE_SIZE
  return filteredComponents.value.slice(start, start + COMP_PAGE_SIZE)
})
const compPageCount = computed(() => Math.max(1, Math.ceil(filteredComponents.value.length / COMP_PAGE_SIZE)))

function goCompPage(p) {
  if (p < 1 || p > compPageCount.value) return
  compPage.value = p
}

const licenses = [
  { name: 'Apache-2.0', compliant: true },
  { name: 'MIT', compliant: true },
  { name: 'BSD-3-Clause', compliant: true },
  { name: 'BSD-2-Clause', compliant: true },
  { name: 'GPL-3.0', compliant: false },
]

/** 我的订阅项目（普通成员：仅订阅所在组织已发车内的项目） */
const subscriptions = [
  { id: 1, name: 'Spring Boot', version: '3.5.12', language: 'Java', developer: 'VMware', subscribedAt: '2026-05-12', hasAlert: true },
  { id: 2, name: 'Redis', version: '7.2.4', language: 'C', developer: 'Redis Ltd', subscribedAt: '2026-06-20', hasAlert: false },
  { id: 3, name: 'log4j-core', version: '2.24.3', language: 'Java', developer: 'Apache', subscribedAt: '2026-05-18', hasAlert: true },
  { id: 4, name: 'Vue.js', version: '3.5.13', language: 'TypeScript', developer: 'Evan You', subscribedAt: '2026-07-03', hasAlert: false },
  { id: 5, name: 'Kafka', version: '3.9.2', language: 'Scala', developer: 'Apache', subscribedAt: '2026-07-25', hasAlert: false },
  { id: 6, name: 'Nginx', version: '1.26.0', language: 'C', developer: 'Nginx Inc', subscribedAt: '2026-06-08', hasAlert: true },
  { id: 7, name: 'OpenSSL', version: '3.3.0', language: 'C', developer: 'OpenSSL Project', subscribedAt: '2026-07-12', hasAlert: true },
  { id: 8, name: 'spring-core', version: '6.2.17', language: 'Java', developer: 'VMware', subscribedAt: '2026-05-26', hasAlert: false },
  { id: 9, name: 'Elasticsearch', version: '8.15.0', language: 'Java', developer: 'Elastic', subscribedAt: '2026-07-30', hasAlert: false },
  { id: 10, name: 'jackson-databind', version: '2.19.4', language: 'Java', developer: 'FasterXML', subscribedAt: '2026-06-15', hasAlert: false },
]

/* —— 订阅项目搜索 + 分页 —— */
const subKeyword = ref('')
const filteredSubscriptions = computed(() => {
  const kw = subKeyword.value.trim().toLowerCase()
  if (!kw) return subscriptions
  return subscriptions.filter((s) => s.name.toLowerCase().includes(kw))
})
const SUB_PAGE_SIZE = 5
const subPage = ref(1)
const pagedSubscriptions = computed(() => {
  const start = (subPage.value - 1) * SUB_PAGE_SIZE
  return filteredSubscriptions.value.slice(start, start + SUB_PAGE_SIZE)
})
const subPageCount = computed(() => Math.max(1, Math.ceil(filteredSubscriptions.value.length / SUB_PAGE_SIZE)))

function goSubPage(p) {
  if (p < 1 || p > subPageCount.value) return
  subPage.value = p
}

/* —— 筛选 —— */
const softKeyword = ref('')
const softTrain = ref('')

const filteredSoftware = computed(() => {
  const kw = softKeyword.value.toLowerCase()
  return software.filter((s) => {
    const okKw = !kw || s.name.toLowerCase().includes(kw)
    const okTrain = !softTrain.value || s.train === softTrain.value
    return okKw && okTrain
  })
})

/* —— 可用软件分页 —— */
const SOFT_PAGE_SIZE = 8
const softPage = ref(1)
const pagedSoftware = computed(() => {
  const start = (softPage.value - 1) * SOFT_PAGE_SIZE
  return filteredSoftware.value.slice(start, start + SOFT_PAGE_SIZE)
})
const softPageCount = computed(() => Math.max(1, Math.ceil(filteredSoftware.value.length / SOFT_PAGE_SIZE)))

function goSoftPage(p) {
  if (p < 1 || p > softPageCount.value) return
  softPage.value = p
}

function scoreClass(score) {
  if (score >= 9) return 'mw-score--high'
  if (score >= 8) return 'mw-score--mid'
  return 'mw-score--low'
}

/* —— 操作 —— */
function download(name, version) {
  // TODO: 接入下载校验账号权限的接口
  alert(`开始下载：${name} ${version}`)
}

function toDetail(s) {
  router.push({ name: 'software-detail', query: { name: s.name, version: s.version } })
}

function goLib(kind) {
  router.push({ name: kind === 'software' ? 'software-library' : 'component-library', query: { released: '1' } })
}

function goDownload() {
  alert('下载中心（待接入）')
}

function goManual() {
  router.push({ name: 'user-manual' })
}

/* ===== 图表（订阅类型分布 / 软件评分分布） ===== */
const subTypeChartRef = ref(null)
const scoreChartRef = ref(null)
let charts = []

function initChart(elRef, option) {
  if (!elRef?.value) return
  const c = echarts.init(elRef.value)
  c.setOption(option)
  charts.push(c)
}

function renderCharts() {
  /* 订阅类型分布（软件/制品） */
  const subKind = subscriptions.reduce(
    (acc, s) => {
      if (s.kind === '软件') acc.soft += 1
      else acc.comp += 1
      return acc
    },
    { soft: 0, comp: 0 },
  )
  initChart(subTypeChartRef, {
    tooltip: { trigger: 'item', formatter: '{b}: {c} 项 ({d}%)' },
    color: ['#2563eb', '#8b5cf6'],
    legend: { bottom: 0, textStyle: { fontSize: 11, color: '#6b7280' }, itemWidth: 12, itemHeight: 10 },
    series: [{
      type: 'pie', radius: ['42%', '68%'], center: ['50%', '44%'],
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 12, fontWeight: 700, color: '#374151' } },
      data: [
        { name: '软件', value: subKind.soft },
        { name: '制品', value: subKind.comp },
      ],
    }],
  })

  /* 软件评分分布（柱状图：评分区间 → 软件数量） */
  const buckets = [
    { range: '≥9.0', count: 0 },
    { range: '8.0~8.9', count: 0 },
    { range: '7.0~7.9', count: 0 },
    { range: '<7.0', count: 0 },
  ]
  software.forEach((s) => {
    if (s.score >= 9) buckets[0].count += 1
    else if (s.score >= 8) buckets[1].count += 1
    else if (s.score >= 7) buckets[2].count += 1
    else buckets[3].count += 1
  })
  initChart(scoreChartRef, {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: '{b}<br/>软件数: {c}' },
    grid: { left: 30, right: 30, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: buckets.map((b) => b.range), axisLine: { lineStyle: { color: '#e5e7eb' } }, axisLabel: { color: '#6b7280', fontSize: 11 }, axisTick: { show: false } },
    yAxis: { type: 'value', minInterval: 1, axisLabel: { color: '#9ca3af', fontSize: 10 }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
    series: [{
      name: '软件数', type: 'bar', barWidth: 22, borderRadius: [4, 4, 0, 0],
      itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#60a5fa' }, { offset: 1, color: '#93c5fd' }]) },
      label: { show: true, position: 'top', fontSize: 11, fontWeight: 700, color: '#374151' },
      data: buckets.map((b) => b.count),
    }],
  })
}

function resizeCharts() {
  charts.forEach((c) => c.resize())
}

onMounted(() => {
  renderCharts()
  window.addEventListener('resize', resizeCharts)
})
onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
  charts.forEach((c) => c.dispose())
  charts = []
})
</script>

<style scoped>
.member-workbench {
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* ===== KPI ===== */
.mw-kpi { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
.mw-stat { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
.mw-stat:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.mw-stat-body { display: flex; align-items: center; justify-content: space-between; padding: 14px 14px 8px; }
.mw-stat-info { display: flex; flex-direction: column; gap: 2px; }
.mw-stat-value { font-size: 24px; font-weight: 700; color: #111827; line-height: 1.2; }
.mw-stat-value--danger { color: #dc2626; }
.mw-stat-label { font-size: 12px; color: #6b7280; }
.mw-stat-ico { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.mw-stat-ico svg { width: 17px; height: 17px; }
.mw-meta-ico { width: 13px; height: 13px; vertical-align: -2px; flex-shrink: 0; }
.mw-train-meta .mw-meta-ico { vertical-align: -1px; }
.mw-sub-alert { display: inline-flex; align-items: center; gap: 3px; }
.mw-stat-ico--blue { background: #eff6ff; }
.mw-stat-ico--purple { background: #f5f3ff; }
.mw-stat-ico--cyan { background: #ecfeff; }
.mw-stat-ico--red { background: #fef2f2; }
.mw-stat-ico--green { background: #f0fdf4; }
.mw-stat-ico--orange { background: #fff7ed; }
.mw-stat-foot { padding: 5px 14px 9px; border-top: 1px solid #f9fafb; }
.mw-stat-change { font-size: 11px; font-weight: 500; color: #6b7280; }
.mw-stat-change--up { color: #16a34a; }
.mw-stat-change--danger { color: #dc2626; }

/* ===== 布局 ===== */
.mw-grid { display: flex; flex-wrap: wrap; gap: 14px; }
.mw-grid--2 > .mw-card { flex: 1 1 calc(50% - 7px); min-width: 320px; }
.mw-grid--3 > .mw-card { flex: 1 1 calc(33.33% - 10px); min-width: 260px; }
/* 可用制品卡与图表卡：比例均衡、降低 min-width 保证并排一行 */
.mw-grid--2 > .mw-card--wide { flex: 1.1 1 calc(52% - 7px); min-width: 240px; }
.mw-grid--2 > .mw-card--charts { flex: 1 1 calc(48% - 7px); min-width: 220px; }

/* ===== 卡片 ===== */
.mw-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
/* 图表卡：纵向 flex，body 撑满剩余高度，图表垂直居中、不留空白 */
.mw-card--charts { display: flex; flex-direction: column; }
.mw-card--charts .mw-card-hd { flex-shrink: 0; }
.mw-card--charts .mw-card-body {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: stretch;
}
.mw-card--charts .mw-charts-row {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: stretch;
  justify-content: center;
}
.mw-card--charts .mw-chart-block {
  flex: 1 1 50%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.mw-card--charts .mw-chart {
  flex: 1;
  min-height: 0;
  width: 100%;
}
.mw-card-hd { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 16px; border-bottom: 1px solid #f3f4f6; }
.mw-card-hd h3 { margin: 0; font-size: 14px; font-weight: 600; color: #374151; white-space: nowrap; }
.mw-card-badge { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 99px; background: #f3f4f6; color: #6b7280; }
.mw-card-badge--ok { background: #dcfce7; color: #16a34a; }
.mw-card-badge--warn { background: #fef3c7; color: #d97706; }
.mw-card-body { padding: 14px 10px 14px; display: flex; flex-direction: column; justify-content: center; }
.mw-chart { width: 100%; height: 180px; }
.mw-chart--sm { height: 150px; }
.mw-charts-row { display: flex; gap: 8px; align-items: center; justify-content: center; }
.mw-chart-block { flex: 1 1 50%; min-width: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.mw-chart-label {
  margin: 0 0 4px;
  padding: 0 2px;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-align: center;
}
.mw-card-actions { display: flex; gap: 8px; }

.mw-search { padding: 5px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; font-family: inherit; outline: none; width: 140px; }
.mw-search:focus { border-color: #da203e; }
.mw-select { padding: 5px 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; font-family: inherit; color: #374151; outline: none; cursor: pointer; }
.mw-select:focus { border-color: #da203e; }

/* ===== 火车列表（纵向滑动块） ===== */
.mw-train-scroll {
  overflow-y: auto;
  max-height: 300px;
  padding: 6px 0;
}
.mw-train-scroll::-webkit-scrollbar { width: 6px; }
.mw-train-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
.mw-train-scroll::-webkit-scrollbar-track { background: #f3f4f6; }
.mw-train-list { display: flex; flex-direction: column; }
.mw-train-item {
  padding: 10px 16px;
  border-bottom: 1px solid #f9fafb;
}
.mw-train-item:last-child { border-bottom: none; }
.mw-train-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; gap: 8px; }
.mw-train-name { font-size: 13px; font-weight: 600; color: #111827; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mw-train-status { font-size: 11px; font-weight: 600; padding: 1px 8px; border-radius: 10px; background: #dcfce7; color: #16a34a; flex-shrink: 0; }
.mw-train-meta { display: flex; gap: 14px; font-size: 12px; color: #6b7280; flex-wrap: wrap; }

/* ===== 风险预警（版本火车式卡片 + 纵向滚动 + hover 点击） ===== */
.mw-alert-scroll {
  overflow-y: auto;
  max-height: 300px;
  padding: 6px 0;
}
.mw-alert-scroll::-webkit-scrollbar { width: 6px; }
.mw-alert-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
.mw-alert-scroll::-webkit-scrollbar-track { background: #f3f4f6; }
.mw-alert-list { display: flex; flex-direction: column; padding: 0 10px; }
.mw-alert-item {
  padding: 10px 12px;
  border-bottom: 1px solid #f9fafb;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.mw-alert-item:last-child { border-bottom: none; }
.mw-alert-item:hover {
  background: #fef2f2;
  border-color: #da203e;
}
.mw-alert-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px; }
.mw-alert-level { font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; flex-shrink: 0; width: max-content; }
.mw-alert-level--超危 { background: #7f1d1d; color: #fff; }
.mw-alert-level--高危 { background: #fef2f2; color: #dc2626; }
.mw-alert-level--中危 { background: #fffbeb; color: #d97706; }
.mw-alert-level--低危 { background: #f0fdf4; color: #16a34a; }
.mw-alert-name { font-size: 13px; font-weight: 600; color: #374151; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mw-alert-meta { display: flex; flex-direction: column; gap: 2px; font-size: 11px; color: #9ca3af; }
.mw-alert-detail { color: #6b7280; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ===== 软件卡片流 ===== */
.mw-soft-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 12px; }
.mw-soft-card { border: 1px solid #eef0f2; border-radius: 10px; padding: 10px 12px; background: #fafafa; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.mw-soft-card:hover { border-color: #da203e; }
.mw-soft-head { display: flex; align-items: center; gap: 6px; }
.mw-soft-name { flex: 1; font-size: 13px; font-weight: 600; color: #374151; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mw-soft-ver { font-size: 11px; font-weight: 600; color: #2563eb; background: #eff6ff; padding: 1px 6px; border-radius: 4px; flex-shrink: 0; }
.mw-soft-meta { display: flex; align-items: center; gap: 8px; }
.mw-score { font-size: 12px; font-weight: 700; padding: 1px 8px; border-radius: 10px; }
.mw-score--high { background: #dcfce7; color: #16a34a; }
.mw-score--mid { background: #dbeafe; color: #2563eb; }
.mw-score--low { background: #fef3c7; color: #d97706; }
.mw-vuln { font-size: 11px; color: #9ca3af; }
.mw-vuln.has-vuln { color: #dc2626; font-weight: 600; }
.mw-license { margin-left: auto; font-size: 11px; color: #6b7280; background: #f3f4f6; padding: 1px 6px; border-radius: 4px; }
.mw-soft-foot { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #f3f4f6; padding-top: 6px; }
.mw-lang-tag { font-size: 10px; color: #2563eb; background: #eff6ff; padding: 1px 6px; border-radius: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 55%; }
.mw-soft-ops { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.mw-link { padding: 0; border: none; background: none; font: inherit; font-size: 12px; color: #da203e; cursor: pointer; }
.mw-link:hover { text-decoration: underline; }
.mw-sep { color: #d1d5db; font-size: 11px; }

/* ===== 制品表 ===== */
.mw-comp-table { display: flex; flex-direction: column; }
.mw-comp-row { display: grid; grid-template-columns: 1.1fr 0.6fr 1fr auto; gap: 6px; align-items: center; padding: 8px 10px; border-bottom: 1px solid #f9fafb; font-size: 12px; }
.mw-comp-row:last-child { border-bottom: none; }
.mw-comp-row--head {
  background: #f9fafb;
  color: #6b7280;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.02em;
}
.mw-comp-name { font-weight: 600; color: #374151; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mw-comp-ver { color: #2563eb; font-weight: 600; }
.mw-comp-group { color: #9ca3af; font-family: 'SF Mono', Monaco, Consolas, monospace; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ===== 我的订阅项目 ===== */
.mw-sub-table { display: flex; flex-direction: column; }
.mw-sub-row {
  display: grid;
  grid-template-columns: 1.3fr 0.6fr 0.7fr 1fr 0.9fr 0.8fr;
  gap: 10px;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid #f9fafb;
  font-size: 12px;
  min-width: 0;
}
.mw-sub-row:last-child { border-bottom: none; }
.mw-sub-row--head {
  background: #f9fafb;
  color: #6b7280;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.02em;
}
.mw-sub-row > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mw-sub-name { font-weight: 600; color: #111827; }
.mw-sub-ver { color: #2563eb; font-weight: 600; }
.mw-sub-lang { color: #6b7280; font-size: 11px; }
.mw-sub-developer { color: #6b7280; font-size: 11px; }
.mw-sub-time { color: #9ca3af; font-size: 11px; }
.mw-sub-alert { font-size: 11px; font-weight: 700; color: #dc2626; }
.mw-sub-alert-ok { font-size: 11px; font-weight: 600; color: #16a34a; }

/* ===== 分页器（总数左、按钮右） ===== */
.mw-pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 16px;
  border-top: 1px solid #f3f4f6;
  flex-wrap: wrap;
}
.mw-pager-total { font-size: 12px; color: #9ca3af; }
.mw-pager-btns { display: flex; align-items: center; gap: 6px; }
.mw-page-btn {
  min-width: 30px;
  height: 26px;
  padding: 0 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  font-family: inherit;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}
.mw-page-btn:hover:not(:disabled):not(.is-active) { border-color: #da203e; color: #da203e; }
.mw-page-btn.is-active { background: #da203e; border-color: #da203e; color: #fff; font-weight: 600; }
.mw-page-btn:disabled { opacity: 0.45; cursor: not-allowed; }

/* ===== 许可证 ===== */
.mw-license-list { display: flex; flex-direction: column; }
.mw-license-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; border-bottom: 1px solid #f9fafb; font-size: 12px; }
.mw-license-item:last-child { border-bottom: none; }
.mw-license-name { color: #374151; font-weight: 500; }
.mw-license-tag { font-size: 11px; font-weight: 600; padding: 1px 8px; border-radius: 10px; }
.mw-license-tag--ok { background: #dcfce7; color: #16a34a; }
.mw-license-tag--warn { background: #fef3c7; color: #d97706; }

/* ===== 快捷入口 ===== */
.mw-quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 12px; }
.mw-quick-grid--4 { grid-template-columns: repeat(4, 1fr); }
.mw-quick { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; padding: 12px; border: 1px solid #eef0f2; border-radius: 10px; background: #fafafa; cursor: pointer; text-align: left; font-family: inherit; transition: border-color 0.15s; }
.mw-quick:hover { border-color: #da203e; }
.mw-quick-ico { font-size: 20px; }
.mw-quick-text { font-size: 13px; font-weight: 600; color: #374151; }
.mw-quick-sub { font-size: 11px; color: #9ca3af; }

/* ===== 空态 ===== */
.mw-empty-sm { text-align: center; color: #9ca3af; font-size: 13px; padding: 20px 12px; margin: 0; }

/* ===== 响应式 ===== */
@media (max-width: 1200px) {
  .mw-kpi { grid-template-columns: repeat(3, 1fr); }
  .mw-soft-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 800px) {
  .mw-kpi { grid-template-columns: repeat(2, 1fr); }
  .mw-soft-grid { grid-template-columns: repeat(2, 1fr); }
  .mw-grid--2 > .mw-card { flex: 1 1 100%; }
  .mw-grid--3 > .mw-card { flex: 1 1 100%; }
}
</style>
