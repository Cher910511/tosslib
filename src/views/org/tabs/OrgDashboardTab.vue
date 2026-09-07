<template>
  <div class="dash-tab">
    <div v-if="!isAdmin" class="dash-forbidden">
      <div class="dash-forbidden-icon">!</div>
      <p>仅库主可查看工作台</p>
    </div>

    <template v-else>
      <!-- KPI 指标行 -->
      <div class="dash-kpi">
        <div class="dash-stat">
          <div class="dash-stat-body">
            <div class="dash-stat-info">
              <span class="dash-stat-value">128</span>
              <span class="dash-stat-label">使用中的软件</span>
            </div>
            <div class="dash-stat-icon dash-stat-icon--blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            </div>
          </div>
          <div class="dash-stat-foot">
            <span class="dash-stat-change dash-stat-change--up">+6 本周新增</span>
          </div>
        </div>
        <div class="dash-stat">
          <div class="dash-stat-body">
            <div class="dash-stat-info">
              <span class="dash-stat-value">356</span>
              <span class="dash-stat-label">使用中的组件</span>
            </div>
            <div class="dash-stat-icon dash-stat-icon--purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            </div>
          </div>
          <div class="dash-stat-foot">
            <span class="dash-stat-change dash-stat-change--up">+23 本周新增</span>
          </div>
        </div>
        <div class="dash-stat">
          <div class="dash-stat-body">
            <div class="dash-stat-info">
              <span class="dash-stat-value dash-stat-value--danger">12</span>
              <span class="dash-stat-label">下架软件</span>
            </div>
            <div class="dash-stat-icon dash-stat-icon--red">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
          </div>
          <div class="dash-stat-foot">
            <span class="dash-stat-change dash-stat-change--down">-2 较上月</span>
          </div>
        </div>
        <div class="dash-stat">
          <div class="dash-stat-body">
            <div class="dash-stat-info">
              <span class="dash-stat-value dash-stat-value--danger">45</span>
              <span class="dash-stat-label">下架组件</span>
            </div>
            <div class="dash-stat-icon dash-stat-icon--red">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
          </div>
          <div class="dash-stat-foot">
            <span class="dash-stat-change dash-stat-change--up">+5 较上月</span>
          </div>
        </div>
        <div class="dash-stat">
          <div class="dash-stat-body">
            <div class="dash-stat-info">
              <span class="dash-stat-value">6</span>
              <span class="dash-stat-label">本周新增预警</span>
            </div>
            <div class="dash-stat-icon dash-stat-icon--orange">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
          </div>
          <div class="dash-stat-foot">
            <span class="dash-stat-change dash-stat-change--danger">+2 较上周</span>
          </div>
        </div>
      </div>

      <!-- 版本火车状态堆叠条 -->
      <div class="dash-train-strip">
        <div class="dash-train-strip-hd">
          <h3>版本火车状态</h3>
          <span class="dash-train-strip-badge">共 12 辆</span>
        </div>
        <div class="dash-train-strip-body">
          <div class="dash-train-bar">
            <div class="dash-train-bar-seg dash-train-bar--released" style="width:33.33%"><span>已发车 4</span></div>
            <div class="dash-train-bar-seg dash-train-bar--pending" style="width:33.33%"><span>待发车 4</span></div>
            <div class="dash-train-bar-seg dash-train-bar--expired" style="width:33.34%"><span>已过期 4</span></div>
          </div>
        </div>
        <div class="dash-train-strip-legend">
          <span class="dash-train-legend-item"><span class="dash-train-dot" style="background:#22c55e" />已发车 4</span>
          <span class="dash-train-legend-item"><span class="dash-train-dot" style="background:#f59e0b" />待发车 4</span>
          <span class="dash-train-legend-item"><span class="dash-train-dot" style="background:#9ca3af" />已过期 4</span>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="dash-panels">
        <!-- 第一行：风险等级分布 + 漏洞软件排行（同一卡片，灰色分割线隔开） -->
        <div class="dash-panel dash-panel--full dash-panel--merged">
          <div class="dash-merged-left">
            <div class="dash-panel-hd">
              <h3>风险等级分布</h3>
            </div>
            <div class="dash-panel-body">
              <div ref="levelChartRef" class="dash-echart"></div>
            </div>
          </div>
          <div class="dash-merged-divider" aria-hidden="true"></div>
          <div class="dash-merged-right">
            <div class="dash-panel-hd">
              <h3>漏洞软件排行</h3>
              <label class="dash-rank-filter">
                <input type="checkbox" v-model="showOffShelf" />
                <span>包含已下架</span>
              </label>
            </div>
            <div class="dash-panel-body">
              <template v-if="orgHasData">
              <div class="dash-rank-list">
                <div class="dash-rank-item">
                  <span class="dash-rank-num dash-rank-num--1">1</span>
                  <span class="dash-rank-name">Log4j 2</span>
                  <span class="dash-rank-ver">2.23.1</span>
                  <span class="dash-rank-vuln-badge">12 漏洞</span>
                </div>
                <div class="dash-rank-item">
                  <span class="dash-rank-num dash-rank-num--2">2</span>
                  <span class="dash-rank-name">OpenSSL</span>
                  <span class="dash-rank-ver">3.3.0</span>
                  <span class="dash-rank-vuln-badge">9 漏洞</span>
                </div>
                <div class="dash-rank-item">
                  <span class="dash-rank-num dash-rank-num--3">3</span>
                  <span class="dash-rank-name">Spring Framework</span>
                  <span class="dash-rank-ver">6.1.5</span>
                  <span class="dash-rank-vuln-badge">7 漏洞</span>
                </div>
                <div v-if="showOffShelf" class="dash-rank-item">
                  <span class="dash-rank-num">4</span>
                  <span class="dash-rank-name">Grafana</span>
                  <span class="dash-rank-ver">11.1.0</span>
                  <span class="dash-rank-vuln-badge dash-rank-vuln-badge--off">6 漏洞</span>
                  <span class="dash-rank-off-badge">下架</span>
                </div>
                <div class="dash-rank-item">
                  <span class="dash-rank-num">4</span>
                  <span class="dash-rank-name">Nginx</span>
                  <span class="dash-rank-ver">1.26.0</span>
                  <span class="dash-rank-vuln-badge">5 漏洞</span>
                </div>
                <div class="dash-rank-item">
                  <span class="dash-rank-num">5</span>
                  <span class="dash-rank-name">Redis</span>
                  <span class="dash-rank-ver">7.2.4</span>
                  <span class="dash-rank-vuln-badge">4 漏洞</span>
                </div>
                <div class="dash-rank-item">
                  <span class="dash-rank-num">6</span>
                  <span class="dash-rank-name">Elasticsearch</span>
                  <span class="dash-rank-ver">8.15.0</span>
                  <span class="dash-rank-vuln-badge">4 漏洞</span>
                </div>
                <div class="dash-rank-item">
                  <span class="dash-rank-num">7</span>
                  <span class="dash-rank-name">Prometheus</span>
                  <span class="dash-rank-ver">2.54.0</span>
                  <span class="dash-rank-vuln-badge">3 漏洞</span>
                </div>
                <div class="dash-rank-item">
                  <span class="dash-rank-num">8</span>
                  <span class="dash-rank-name">RabbitMQ</span>
                  <span class="dash-rank-ver">3.13.6</span>
                  <span class="dash-rank-vuln-badge">3 漏洞</span>
                </div>
                <div class="dash-rank-item">
                  <span class="dash-rank-num">9</span>
                  <span class="dash-rank-name">PostgreSQL</span>
                  <span class="dash-rank-ver">16.3</span>
                  <span class="dash-rank-vuln-badge">2 漏洞</span>
                </div>
                <div v-if="!showOffShelf" class="dash-rank-item">
                  <span class="dash-rank-num">10</span>
                  <span class="dash-rank-name">Vue.js</span>
                  <span class="dash-rank-ver">3.4.31</span>
                  <span class="dash-rank-vuln-badge">1 漏洞</span>
                </div>
              </div>
              </template>
              <div v-else class="dash-rank-empty">
                <span class="dash-empty-icon">🔒</span>
                <p class="dash-empty-text">暂无漏洞数据</p>
                <p class="dash-empty-hint">该组织暂无存在漏洞的软件</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 第二行：软件与组件概况 + 近 30 天预警趋势 + 最新预警 -->
        <div class="dash-panel dash-panel--third">
          <div class="dash-panel-hd">
            <h3>软件与组件概况</h3>
            <span class="dash-panel-badge">总计 541</span>
          </div>
          <div class="dash-panel-body">
            <div ref="overviewChartRef" class="dash-echart dash-echart--sm"></div>
          </div>
        </div>
        <div class="dash-panel dash-panel--third">
          <div class="dash-panel-hd">
            <h3>近 30 天预警趋势</h3>
            <span class="dash-panel-badge">日报</span>
          </div>
          <div class="dash-panel-body">
            <div ref="trendChartRef" class="dash-echart"></div>
          </div>
        </div>
        <div class="dash-panel dash-panel--third">
          <div class="dash-panel-hd">
            <h3>最新预警</h3>
            <span class="dash-panel-badge">5 条</span>
          </div>
          <div class="dash-panel-body" style="padding:2px 6px;">
            <template v-if="orgHasData">
              <div class="dash-alert-list" style="border-top:none;padding:0;">
                <div class="dash-alert-item">
                  <span class="dash-alert-level dash-alert-level--high">高危</span>
                  <span class="dash-alert-name">Apache Log4j2 远程代码执行</span>
                  <span class="dash-alert-time">07-02</span>
                </div>
                <div class="dash-alert-item">
                  <span class="dash-alert-level dash-alert-level--critical">超危</span>
                  <span class="dash-alert-name">OpenSSL 缓冲区溢出漏洞</span>
                  <span class="dash-alert-time">06-30</span>
                </div>
                <div class="dash-alert-item">
                  <span class="dash-alert-level dash-alert-level--high">高危</span>
                  <span class="dash-alert-name">Spring Framework 权限绕过</span>
                  <span class="dash-alert-time">06-28</span>
                </div>
                <div class="dash-alert-item">
                  <span class="dash-alert-level dash-alert-level--mid">中危</span>
                  <span class="dash-alert-name">Nginx HTTP/2 请求走私</span>
                  <span class="dash-alert-time">06-25</span>
                </div>
                <div class="dash-alert-item">
                  <span class="dash-alert-level dash-alert-level--mid">中危</span>
                  <span class="dash-alert-name">Redis 权限提升漏洞</span>
                  <span class="dash-alert-time">06-23</span>
                </div>
              </div>
              <button type="button" class="dash-alert-more" @click="$emit('switchTab', 'alerts')">查看详情 →</button>
            </template>
            <div v-else class="dash-empty-state">
              <span class="dash-empty-icon">🛡️</span>
              <p class="dash-empty-text">暂无预警信息</p>
              <p class="dash-empty-hint">当前组织没有待处理的漏洞预警</p>
            </div>
          </div>
        </div>

        <!-- 发车中软件/组件列表 -->
        <div class="dash-panel dash-panel--full">
          <div class="dash-panel-hd">
            <div class="dash-tabs">
              <button
                v-for="t in releaseTabs"
                :key="t.key"
                type="button"
                class="dash-tab-btn"
                :class="{ 'is-active': releaseTab === t.key }"
                @click="releaseTab = t.key"
              >{{ t.label }}<span class="dash-tab-count">{{ t.count }}</span></button>
            </div>
            <div class="dash-panel-actions">
              <select v-model="releaseTrain" class="dash-release-select" aria-label="版本火车筛选">
                <option value="">全部火车</option>
                <option v-for="t in ORG_TRAINS" :key="t.code" :value="t.code">{{ t.name }}</option>
              </select>
              <input v-model.trim="releaseKeyword" type="search" class="dash-release-search" placeholder="搜索名称..." />
            </div>
          </div>
          <div class="dash-panel-body dash-panel-body--table">
            <table class="dash-table">
              <thead>
                <!-- 软件 Tab -->
                <tr v-if="releaseTab === 'software'">
                  <th>软件名称</th>
                  <th>版本号</th>
                  <th>语言</th>
                  <th>许可证</th>
                  <th class="dash-th-sort" @click="toggleReleaseSort('vulnCount')">
                    漏洞数
                    <svg class="dash-sort-svg" viewBox="0 0 1024 1024" width="16" height="16">
                      <path d="M692.705882 572.235294l-180.705882 240.941177-180.705882-240.941177h361.411764z" :fill="releaseSortField === 'vulnCount' && releaseSortDir === 'desc' ? '#374151' : '#d1d5db'" />
                      <path d="M512 150.588235l180.705882 240.941177H331.294118L512 150.588235z" :fill="releaseSortField === 'vulnCount' && releaseSortDir === 'asc' ? '#374151' : '#d1d5db'" />
                    </svg>
                  </th>
                  <th>开发商</th>
                  <th>版本发布时间</th>
                  <th class="dash-th-sort" @click="toggleReleaseSort('score')">
                    版本评分
                    <svg class="dash-sort-svg" viewBox="0 0 1024 1024" width="16" height="16">
                      <path d="M692.705882 572.235294l-180.705882 240.941177-180.705882-240.941177h361.411764z" :fill="releaseSortField === 'score' && releaseSortDir === 'desc' ? '#374151' : '#d1d5db'" />
                      <path d="M512 150.588235l180.705882 240.941177H331.294118L512 150.588235z" :fill="releaseSortField === 'score' && releaseSortDir === 'asc' ? '#374151' : '#d1d5db'" />
                    </svg>
                  </th>
                  <th>状态</th>
                </tr>
                <!-- 组件 Tab -->
                <tr v-else>
                  <th>组件名称</th>
                  <th>组件版本</th>
                  <th>组织编号</th>
                  <th>编程语言</th>
                  <th>开源许可证</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="releaseTab === 'software'">
                  <tr v-for="item in pagedReleaseItems" :key="item.key">
                    <td class="dash-table-name">{{ item.name }}</td>
                    <td><span class="dash-version-link" @click="goDetail(item)">{{ item.version }}</span></td>
                    <td><span class="dash-lang">{{ item.lang }}</span></td>
                    <td>{{ item.license }}</td>
                    <td>
                      <span class="dash-vuln" :class="{ 'dash-vuln--zero': item.vulnCount === 0, 'dash-vuln--risk': item.vulnCount > 0 }">{{ item.vulnCount }}</span>
                    </td>
                    <td class="dash-dev" :title="item.developer">{{ item.developer }}</td>
                    <td>{{ item.publishTime }}</td>
                    <td><span class="dash-score">{{ item.score }}</span></td>
                    <td><span class="dash-table-status dash-table-status--on">发车中</span></td>
                  </tr>
                </template>
                <template v-else>
                  <tr v-for="item in pagedReleaseItems" :key="item.key">
                    <td class="dash-table-name">{{ item.name }}</td>
                    <td><span class="dash-version-link" @click="goDetail(item)">{{ item.version }}</span></td>
                    <td class="dash-org" :title="item.orgId">{{ item.orgId }}</td>
                    <td><span class="dash-lang">{{ item.lang }}</span></td>
                    <td>{{ item.license }}</td>
                    <td><span class="dash-table-status dash-table-status--on">发车中</span></td>
                  </tr>
                </template>
                <tr v-if="!filteredReleaseItems.length">
                  <td :colspan="releaseTab === 'software' ? 9 : 6" class="dash-table-empty">当前没有发车中的软件或组件</td>
                </tr>
              </tbody>
            </table>
            <footer v-if="filteredReleaseItems.length" class="dash-pager">
              <span class="dash-pager-total">共 {{ filteredReleaseItems.length }} 项 · 第 {{ releasePage }}/{{ releasePageCount }} 页</span>
              <div class="dash-pager-btns">
                <button type="button" class="dash-page-btn" :disabled="releasePage <= 1" @click="goReleasePage(releasePage - 1)">上一页</button>
                <button
                  v-for="p in releasePageCount"
                  :key="p"
                  type="button"
                  class="dash-page-btn"
                  :class="{ 'is-active': p === releasePage }"
                  @click="goReleasePage(p)"
                >{{ p }}</button>
                <button type="button" class="dash-page-btn" :disabled="releasePage >= releasePageCount" @click="goReleasePage(releasePage + 1)">下一页</button>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'

const props = defineProps({ org: { type: Object, required: true } })
const emit = defineEmits(['switchTab'])
const router = useRouter()
const isAdmin = true

// 根据组织ID区分数据：org-001(工商银行)和org-003(华为)有完整数据，其他组织数据为空
const orgHasData = computed(() => ['org-001', 'org-003'].includes(props.org.id))
const showOffShelf = ref(false)

/* —— 发车中软件/组件列表 —— */
const releasingSoftware = [
  { id: 1, name: 'Spring Boot', version: '3.5.12', trainCode: 'VT-2026-07-001', license: 'Apache-2.0', lang: 'Java', vulnCount: 0, developer: 'VMware', publishTime: '2026-06-15', score: 9.2 },
  { id: 2, name: 'Redis', version: '7.2.4', trainCode: 'VT-2026-07-001', license: 'BSD-3-Clause', lang: 'C', vulnCount: 1, developer: 'Redis Ltd.', publishTime: '2026-05-20', score: 8.7 },
  { id: 3, name: 'Vue.js', version: '3.5.13', trainCode: 'VT-2026-07-002', license: 'MIT', lang: 'JavaScript', vulnCount: 0, developer: 'Vue.js', publishTime: '2026-07-01', score: 9.0 },
  { id: 4, name: 'OpenSSL', version: '3.3.0', trainCode: 'VT-2026-07-002', license: 'Apache-2.0', lang: 'C', vulnCount: 3, developer: 'OpenSSL Project', publishTime: '2026-04-18', score: 7.4 },
]
const releasingComponents = [
  { id: 1, name: 'spring-core', version: '6.2.17', orgId: 'org.springframework', trainCode: 'VT-2026-07-001', license: 'Apache-2.0', lang: 'Java', vulnCount: 0, developer: 'VMware', publishTime: '2026-06-10', score: 8.9 },
  { id: 2, name: 'log4j-core', version: '2.24.3', orgId: 'org.apache.logging.log4j', trainCode: 'VT-2026-07-001', license: 'Apache-2.0', lang: 'Java', vulnCount: 4, developer: 'Apache', publishTime: '2026-06-22', score: 6.8 },
  { id: 3, name: 'jackson-databind', version: '2.19.4', orgId: 'com.fasterxml.jackson.core', trainCode: 'VT-2026-07-002', license: 'Apache-2.0', lang: 'Java', vulnCount: 2, developer: 'FasterXML', publishTime: '2026-07-05', score: 7.9 },
  { id: 4, name: 'hibernate-core', version: '6.6.44.Final', orgId: 'org.hibernate.orm', trainCode: 'VT-2026-07-002', license: 'LGPL-2.1', lang: 'Java', vulnCount: 0, developer: 'Hibernate', publishTime: '2026-05-30', score: 8.2 },
]

/** 根据火车编号（code）查火车名称 */
function trainName(code) {
  const t = ORG_TRAINS.find((x) => x.code === code)
  return t ? t.name : code
}

const ORG_TRAINS = [
  { code: 'VT-2026-07-001', name: '2026 Q2 功能迭代发车' },
  { code: 'VT-2026-07-002', name: '2026 Q3 首批发车' },
]

/* —— 发车中列表：Tab + 火车筛选 + 搜索 + 分页 —— */
const releaseTab = ref('software')
const releaseTrain = ref('')
const releaseKeyword = ref('')
const RELEASE_PAGE_SIZE = 5
const releasePage = ref(1)

/** 漏洞数 / 版本评分 排序状态（参考软件库表头排序） */
const releaseSortField = ref('')
const releaseSortDir = ref('asc')

function toggleReleaseSort(field) {
  if (releaseSortField.value === field) {
    if (releaseSortDir.value === 'asc') { releaseSortDir.value = 'desc' }
    else { releaseSortField.value = ''; releaseSortDir.value = 'asc' }
  } else { releaseSortField.value = field; releaseSortDir.value = 'asc' }
}

const releaseTabs = computed(() => [
  { key: 'software', label: '软件', count: releasingSoftware.length },
  { key: 'component', label: '组件', count: releasingComponents.length },
])

/** 当前 Tab 的原始数据 */
const releaseTabItems = computed(() =>
  releaseTab.value === 'software' ? releasingSoftware : releasingComponents,
)

/** 按版本火车 + 关键词过滤 + 漏洞数/评分排序 */
const filteredReleaseItems = computed(() => {
  const kw = releaseKeyword.value.trim().toLowerCase()
  let list = releaseTabItems.value.filter((item) => {
    const okTrain = !releaseTrain.value || item.trainCode === releaseTrain.value
    const okKw = !kw || item.name.toLowerCase().includes(kw)
    return okTrain && okKw
  })
  if (releaseSortField.value === 'vulnCount') {
    list = [...list].sort((a, b) => releaseSortDir.value === 'asc'
      ? (a.vulnCount || 0) - (b.vulnCount || 0)
      : (b.vulnCount || 0) - (a.vulnCount || 0))
  } else if (releaseSortField.value === 'score') {
    list = [...list].sort((a, b) => releaseSortDir.value === 'asc'
      ? (a.score || 0) - (b.score || 0)
      : (b.score || 0) - (a.score || 0))
  }
  return list
})

const releasePageCount = computed(() => Math.max(1, Math.ceil(filteredReleaseItems.value.length / RELEASE_PAGE_SIZE)))

const pagedReleaseItems = computed(() => {
  const start = (releasePage.value - 1) * RELEASE_PAGE_SIZE
  return filteredReleaseItems.value.slice(start, start + RELEASE_PAGE_SIZE).map((item) => ({
    ...item,
    key: `${releaseTab.value}-${item.id}`,
    kind: releaseTab.value === 'software' ? '软件' : '组件',
  }))
})

function goReleasePage(p) {
  if (p < 1 || p > releasePageCount.value) return
  releasePage.value = p
}

/** 点击版本跳转：软件 → 软件详情，组件 → 组件库（与软件库页一致） */
function goDetail(item) {
  if (releaseTab.value === 'software') {
    router.push({ name: 'software-detail', query: { q: item.name } })
  } else {
    router.push({ name: 'component-library', query: { q: item.name } })
  }
}

const levelChartRef = ref(null)
const overviewChartRef = ref(null)
const trendChartRef = ref(null)

let charts = []

function initCharts() {
  initLevel()
  initOverview()
  initTrend()
}

function initLevel() {
  if (!levelChartRef.value) return
  const c = echarts.init(levelChartRef.value)
  c.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} 项 ({d}%)' },
    color: ['#7f1d1d', '#dc2626', '#f59e0b', '#6b7280'],
    series: [{
      type: 'pie', radius: ['45%', '70%'],
      avoidLabelOverlap: true, padAngle: 2,
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, position: 'outside', fontSize: 11, fontWeight: 600, color: '#374151', formatter: '{b}' },
      emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.15)' } },
      data: [
        { value: 12, name: '超危' },
        { value: 28, name: '高危' },
        { value: 35, name: '中危' },
        { value: 15, name: '低危' },
      ],
    }],
  })
  charts.push(c)
}

function initOverview() {
  if (!overviewChartRef.value) return
  const c = echarts.init(overviewChartRef.value)
  c.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: (p) => {
      const total = p.reduce((s, d) => s + d.value, 0)
      return p.map(d => `${d.marker} ${d.seriesName}: ${d.value}`).join('<br/>') + `<br/>合计: ${total}`
    }},
    legend: { data: ['使用中', '已下架'], bottom: 0, textStyle: { fontSize: 11, color: '#6b7280' }, itemWidth: 10, itemHeight: 10 },
    grid: { left: 40, right: 10, top: 20, bottom: 40 },
    xAxis: { type: 'category', data: ['软件', '组件'], axisLabel: { fontSize: 12, fontWeight: 600, color: '#374151' } },
    yAxis: { type: 'value', show: false },
    series: [
      {
        name: '使用中', type: 'bar', barWidth: 20, barGap: '20%', borderRadius: [4, 4, 0, 0],
        itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#3b82f6' }, { offset: 1, color: '#93c5fd' }]) },
        label: { show: true, position: 'top', fontSize: 12, fontWeight: 700, color: '#374151' },
        data: [128, 356],
      },
      {
        name: '已下架', type: 'bar', barWidth: 20, borderRadius: [4, 4, 0, 0],
        itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#ef4444' }, { offset: 1, color: '#fca5a5' }]) },
        label: { show: true, position: 'top', fontSize: 12, fontWeight: 700, color: '#dc2626' },
        data: [12, 45],
      },
    ],
  })
  charts.push(c)
}

function initTrend() {
  if (!trendChartRef.value) return
  const c = echarts.init(trendChartRef.value)
  const hasData = orgHasData.value
  c.setOption({
    color: ['#da203e'],
    tooltip: { trigger: 'axis', formatter: '{b}<br/>预警数: {c}' },
    dataZoom: hasData ? [{
      type: 'slider', start: 0, end: 100,
      height: 14, bottom: 4,
      borderColor: '#e5e7eb', backgroundColor: '#f9fafb',
      fillerColor: 'rgba(218,32,62,0.1)', handleStyle: { color: '#da203e' },
      textStyle: { fontSize: 10, color: '#9ca3af' }, showDetail: false,
    }] : undefined,
    grid: { left: 45, right: 20, top: 24, bottom: hasData ? 40 : 16 },
    xAxis: {
      type: 'category', boundaryGap: false,
      data: ['06-01', '06-05', '06-10', '06-15', '06-20', '06-25', '06-30'],
      axisLabel: { fontSize: 11, color: '#9ca3af' },
      axisLine: { lineStyle: { color: '#f3f4f6' } },
    },
    yAxis: {
      type: 'value', axisLabel: { fontSize: 11, color: '#9ca3af' },
      splitLine: { lineStyle: { color: '#f3f4f6' } },
      min: 0, max: hasData ? undefined : 10,
    },
    series: [{
      type: 'line', smooth: true, symbol: hasData ? 'circle' : 'none', symbolSize: 6,
      lineStyle: { width: 2 },
      areaStyle: hasData ? {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(218,32,62,0.2)' },
          { offset: 1, color: 'rgba(218,32,62,0.02)' },
        ]),
      } : undefined,
      data: hasData ? [2, 5, 3, 8, 6, 4, 6] : [0, 0, 0, 0, 0, 0, 0],
    }],
  })
  charts.push(c)
}

function handleResize() {
  charts.forEach(c => c?.resize())
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  charts.forEach(c => c?.dispose())
  charts = []
})
</script>

<style scoped>
.dash-tab { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif; }

/* Forbidden */
.dash-forbidden {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 80px 20px; color: #9ca3af; gap: 12px;
}
.dash-forbidden-icon {
  width: 48px; height: 48px; border-radius: 50%; background: #f3f4f6;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-weight: 700; color: #d1d5db;
}
.dash-forbidden p { margin: 0; font-size: 14px; }

/* KPI Stats */
.dash-kpi { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-bottom: 22px; }
.dash-stat {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;
  transition: box-shadow 0.2s;
}
.dash-stat:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.dash-stat-body {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 18px 10px;
}
.dash-stat-info { display: flex; flex-direction: column; gap: 2px; }
.dash-stat-value { font-size: 28px; font-weight: 700; color: #111827; line-height: 1.2; }
.dash-stat-value--danger { color: #dc2626; }
.dash-stat-label { font-size: 12px; color: #6b7280; }
.dash-stat-icon {
  width: 38px; height: 38px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.dash-stat-icon--blue { background: #eff6ff; color: #3b82f6; }
.dash-stat-icon--purple { background: #f5f3ff; color: #8b5cf6; }
.dash-stat-icon--red { background: #fef2f2; color: #ef4444; }
.dash-stat-icon--orange { background: #fff7ed; color: #f97316; }
.dash-stat-foot {
  padding: 6px 18px 10px; border-top: 1px solid #f9fafb;
}
.dash-stat-change { font-size: 11px; font-weight: 500; }
.dash-stat-change--up { color: #16a34a; }
.dash-stat-change--down { color: #6b7280; }
.dash-stat-change--danger { color: #dc2626; }

/* Version train horizontal stacked bar */
.dash-train-strip {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 14px 18px 16px;
  margin-bottom: 16px;
}
.dash-train-strip-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.dash-train-strip-hd h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}
.dash-train-strip-badge {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}
.dash-train-strip-body {
  padding: 0;
}
.dash-train-bar {
  display: flex;
  width: 100%;
  height: 28px;
  border-radius: 4px;
  overflow: hidden;
}
.dash-train-bar-seg {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  transition: opacity 0.15s;
}
.dash-train-bar-seg:hover { opacity: 0.85; }
.dash-train-bar-seg span {
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 4px;
}
.dash-train-bar--released { background: #22c55e; }
.dash-train-bar--pending { background: #f59e0b; }
.dash-train-bar--expired { background: #9ca3af; }
.dash-train-strip-legend {
  display: flex;
  gap: 14px;
  flex-shrink: 0;
  margin-top: 10px;
}
.dash-train-legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
}
.dash-train-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

/* 待办提醒条 */
.dash-todo-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #fffdf7, #fef9ef);
  border: 1px solid #fde68a;
  border-radius: 10px;
}
.dash-todo-item {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.dash-todo-ico { width: 13px; height: 13px; flex-shrink: 0; }
.dash-todo-item--warn { background: #fef3c7; color: #b45309; }
.dash-todo-item--danger { background: #fee2e2; color: #b91c1c; }
.dash-todo-item--info { background: #dbeafe; color: #1d4ed8; }
.dash-todo-item--ok { background: #dcfce7; color: #15803d; }
.dash-todo-more {
  margin-left: auto;
  font-size: 12px;
  font-weight: 500;
  color: #da203e;
  cursor: pointer;
  border: none;
  background: none;
  font-family: inherit;
}
.dash-todo-more:hover { text-decoration: underline; }

/* 最近操作日志 */
.dash-log-list { display: flex; flex-direction: column; }
.dash-log-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-bottom: 1px solid #f9fafb;
  font-size: 12px;
}
.dash-log-row:last-child { border-bottom: none; }
.dash-log-level {
  flex-shrink: 0;
  min-width: 40px;
  text-align: center;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
}
.dash-log-level.level--ok { background: #dcfce7; color: #16a34a; }
.dash-log-level.level--info { background: #eff6ff; color: #2563eb; }
.dash-log-level.level--warn { background: #fef3c7; color: #d97706; }
.dash-log-level.level--fail { background: #fee2e2; color: #dc2626; }
.dash-log-msg { flex: 1; color: #374151; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dash-log-time { flex-shrink: 0; font-size: 11px; color: #9ca3af; }

/* Vulnerability ranking list */
.dash-rank-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(5, auto);
  grid-auto-flow: column;
  gap: 6px 14px;
  padding: 2px 0;
}
.dash-rank-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 6px;
  border-radius: 5px;
  background: #fafafa;
  border: 1px solid #f3f4f6;
  font-size: 12px;
  min-width: 0;
}
.dash-rank-num {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  background: #f3f4f6;
  flex-shrink: 0;
}
.dash-rank-num--1 { background: #fef2f2; color: #dc2626; }
.dash-rank-num--2 { background: #fff7ed; color: #d97706; }
.dash-rank-num--3 { background: #fffbeb; color: #d97706; }
.dash-rank-name { flex: 1; font-weight: 600; color: #374151; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; }
.dash-rank-ver {
  font-size: 11px; font-weight: 600; color: #2563eb; background: #eff6ff;
  padding: 1px 6px; border-radius: 4px; flex-shrink: 0;
}
.dash-rank-vuln-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 22px; height: 18px; padding: 0 5px;
  border-radius: 9px; font-size: 11px; font-weight: 700;
  background: #fef2f2; color: #dc2626; flex-shrink: 0;
}
.dash-rank-vuln-badge--off { background: #f3f4f6; color: #9ca3af; }
.dash-rank-off-badge { font-size: 9px; padding: 1px 4px; border-radius: 3px; background: #e5e7eb; color: #6b7280; flex-shrink: 0; }
.dash-rank-filter {
  display: flex; align-items: center; gap: 4px; cursor: pointer; user-select: none; font-size: 12px; color: #6b7280;
}
.dash-rank-filter input[type="checkbox"] { margin: 0; accent-color: #da203e; }

/* Alert list */
.dash-alert-list {
  display: flex; flex-direction: column; gap: 0; padding: 6px 0 2px; border-top: 1px solid #f3f4f6;
}
.dash-alert-item {
  display: flex; align-items: center; gap: 8px; padding: 7px 4px; font-size: 12px; border-bottom: 1px solid #f9fafb;
}
.dash-alert-item:last-child { border-bottom: none; }
.dash-alert-more {
  display: block; width: 100%; padding: 7px 0; margin-top: 2px;
  border: none; border-top: 1px solid #f3f4f6; border-radius: 0;
  background: transparent; font-family: inherit; font-size: 12px; color: #da203e;
  cursor: pointer; text-align: center; font-weight: 500; transition: background 0.15s;
}
.dash-alert-more:hover { background: #fef2f2; }

/* Empty state */
.dash-empty-state, .dash-rank-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 24px 12px; text-align: center;
}
.dash-empty-icon { font-size: 28px; margin-bottom: 6px; display: block; }
.dash-empty-text { margin: 0 0 4px; font-size: 14px; font-weight: 600; color: #6b7280; }
.dash-empty-hint { margin: 0; font-size: 12px; color: #9ca3af; }
.dash-alert-level {
  font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; flex-shrink: 0;
}
.dash-alert-level--critical { background: #7f1d1d; color: #fff; }
.dash-alert-level--high { background: #fef2f2; color: #dc2626; }
.dash-alert-level--mid { background: #fffbeb; color: #d97706; }
.dash-alert-name { flex: 1; color: #374151; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dash-alert-time { font-size: 11px; color: #9ca3af; flex-shrink: 0; }

/* Panels Grid */
.dash-panels { display: flex; flex-wrap: wrap; gap: 16px; }
.dash-panel {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;
}
.dash-panel--half { flex: 1 1 calc(50% - 8px); min-width: 320px; }
.dash-panel--third { flex: 1 1 calc(33.33% - 11px); min-width: 240px; }
.dash-panel--two-thirds { flex: 1 1 calc(66.67% - 6px); min-width: 360px; }
.dash-panel--full { flex: 1 1 100%; }

/* 合并卡片：风险等级 + 漏洞排行，左右两栏 + 灰色竖线分割 */
.dash-panel--merged { display: flex; align-items: stretch; }
.dash-merged-left { flex: 3 1 30%; min-width: 0; display: flex; flex-direction: column; }
.dash-merged-right { flex: 7 1 70%; min-width: 0; display: flex; flex-direction: column; }
.dash-merged-divider { width: 1px; flex-shrink: 0; background: #e5e7eb; }
.dash-merged-left .dash-panel-hd, .dash-merged-right .dash-panel-hd { border-bottom: 1px solid #f3f4f6; }
.dash-merged-left .dash-panel-body, .dash-merged-right .dash-panel-body { flex: 1; min-height: 0; overflow: hidden; }

.dash-panel-hd {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px; border-bottom: 1px solid #f3f4f6;
}
.dash-panel-hd h3 { margin: 0; font-size: 14px; font-weight: 600; color: #374151; }
.dash-panel-badge {
  font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 99px;
  background: #f3f4f6; color: #6b7280;
}
.dash-panel-badge--ok { background: #dcfce7; color: #16a34a; }

.dash-panel-body { padding: 6px 8px 4px; }
.dash-panel-body--table { padding: 0 0 4px; overflow-x: auto; }
.dash-table { width: 100%; border-collapse: collapse; font-size: 12px; min-width: 900px; }
.dash-table th { padding: 8px 12px; text-align: left; font-weight: 600; color: #6b7280; background: #f9fafb; border-bottom: 1px solid #e5e7eb; white-space: nowrap; }
.dash-table td { padding: 8px 12px; border-bottom: 1px solid #f9fafb; color: #374151; white-space: nowrap; }
.dash-table tbody tr:hover { background: #fafafa; }
.dash-table-name { font-weight: 600; color: #111827; }
.dash-version-link { color: #2563eb; cursor: pointer; transition: color 0.12s; }
.dash-version-link:hover { color: #da203e; text-decoration: underline; }
.dash-table-empty { text-align: center; color: #9ca3af; padding: 16px 12px; }
.dash-th-sort { cursor: pointer; user-select: none; white-space: nowrap; }
.dash-sort-svg { vertical-align: middle; width: 16px; height: 16px; display: inline-block; margin-left: 2px; }
.dash-lang { color: #374151; }
.dash-vuln {
  display: inline-block; min-width: 24px; text-align: center;
  padding: 1px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;
  font-variant-numeric: tabular-nums; line-height: 18px;
}
.dash-vuln--zero { color: #166534; background: #f0fdf4; }
.dash-vuln--risk { color: #991b1b; background: #fef2f2; }
.dash-dev { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dash-org {
  max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px; color: #4b5563;
}
.dash-score { font-weight: 600; color: #111827; font-variant-numeric: tabular-nums; }
.dash-table-tag { display: inline-block; padding: 1px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
.dash-table-tag--soft { background: #eff6ff; color: #2563eb; }
.dash-table-tag--comp { background: #f5f3ff; color: #8b5cf6; }
.dash-table-status { display: inline-block; padding: 1px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
.dash-table-status--on { background: #dcfce7; color: #16a34a; }

/* Tab 切换 */
.dash-tabs { display: flex; gap: 4px; align-items: center; }
.dash-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}
.dash-tab-btn:hover { background: #f3f4f6; color: #374151; }
.dash-tab-btn.is-active { background: #da203e; color: #fff; }
.dash-tab-count {
  font-size: 10px;
  font-weight: 700;
  padding: 0 6px;
  border-radius: 99px;
  background: #f3f4f6;
  color: #6b7280;
  line-height: 16px;
}
.dash-tab-btn.is-active .dash-tab-count { background: rgba(255,255,255,0.25); color: #fff; }

/* 面板右上角筛选 */
.dash-panel-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.dash-release-select {
  height: 28px;
  padding: 0 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 12px;
  font-family: inherit;
  color: #374151;
  cursor: pointer;
  outline: none;
}
.dash-release-select:focus { border-color: #da203e; }
.dash-release-search {
  height: 28px;
  width: 150px;
  padding: 0 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 12px;
  font-family: inherit;
  color: #374151;
  outline: none;
}
.dash-release-search:focus { border-color: #da203e; }

/* 分页器 */
.dash-pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 12px;
  border-top: 1px solid #f3f4f6;
  flex-wrap: wrap;
}
.dash-pager-total { font-size: 12px; color: #9ca3af; }
.dash-pager-btns { display: flex; align-items: center; gap: 6px; }
.dash-page-btn {
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
.dash-page-btn:hover:not(:disabled):not(.is-active) { border-color: #da203e; color: #da203e; }
.dash-page-btn.is-active { background: #da203e; border-color: #da203e; color: #fff; font-weight: 600; }
.dash-page-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.dash-echart { width: 100%; height: 200px; }
.dash-echart--sm { width: 100%; height: 180px; }
.dash-echart--wide { height: 220px; }

/* Meta Grid */
.dash-meta-grid {
  display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; padding: 8px 6px 14px;
}
.dash-meta-cell {
  text-align: center; padding: 16px 8px 14px;
  background: linear-gradient(135deg, #fafafa 0%, #f7f8fa 100%);
  border: 1px solid #f0f0f0; border-radius: 10px;
}
.dash-meta-num { display: block; font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 4px; }
.dash-meta-num--ok { color: #16a34a; }
.dash-meta-label { font-size: 12px; color: #6b7280; }

/* Responsive */
@media (max-width: 1000px) {
  .dash-kpi { grid-template-columns: repeat(3, 1fr); }
  .dash-panel--half { flex: 1 1 100%; }
  .dash-panel--third { flex: 1 1 calc(50% - 8px); }
  .dash-meta-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 600px) {
  .dash-kpi { grid-template-columns: repeat(2, 1fr); }
  .dash-panel--third { flex: 1 1 100%; }
  .dash-meta-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
