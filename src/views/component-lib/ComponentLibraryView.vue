<template>
  <div class="comp-page">

    <!-- ========== 筛选区 ========== -->
    <section class="comp-card">
      <header class="comp-card-head">
        <button
          type="button"
          class="comp-card-title-btn"
          :aria-expanded="filterOpen"
          @click="filterOpen = !filterOpen"
        >
          <span class="comp-card-caret" :class="{ 'is-open': filterOpen }" aria-hidden="true" />
          <span class="comp-card-title">筛选条件</span>
        </button>
        <div class="comp-card-actions">
          <button type="button" class="comp-btn comp-btn--outline" @click="clearFilter">清空</button>
          <button type="button" class="comp-btn comp-btn--primary" @click="doFilter">筛选</button>
        </div>
      </header>
      <div v-show="filterOpen" class="comp-filter-body">
        <div class="comp-filter-grid">
          <div class="comp-field">
            <label class="comp-label">组件名称</label>
            <input
              v-model="filters.name"
              type="text"
              class="comp-input"
              placeholder="请输入"
              @keyup.enter="doFilter"
            >
          </div>
          <div class="comp-field">
            <label class="comp-label">组件版本</label>
            <input
              v-model="filters.version"
              type="text"
              class="comp-input"
              placeholder="请输入"
              @keyup.enter="doFilter"
            >
          </div>
          <div class="comp-field">
            <label class="comp-label">编程语言</label>
            <select v-model="filters.lang" class="comp-select">
              <option value="">请选择</option>
              <option v-for="lang in langOptions" :key="lang" :value="lang">{{ lang }}</option>
            </select>
          </div>
          <div class="comp-field">
            <label class="comp-label">版本火车</label>
            <select v-model="filters.train" class="comp-select">
              <option value="">请选择版本火车</option>
              <option v-for="t in trainOptions" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== 数据表格 ========== -->
    <section class="comp-card comp-table-card">
      <header class="comp-card-head comp-card-head--table">
        <h2 class="comp-card-title comp-card-title--static">组件列表</h2>
      </header>
      <div class="comp-table-wrap">
        <table class="comp-table">
          <thead>
            <tr>
              <th>组件名称</th>
              <th>组件版本</th>
              <th>组织编号</th>
              <th>编程语言</th>
              <th>开源许可证</th>
              <th>出入库状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in paginatedList" :key="row.id">
              <td>
                <span
                  class="comp-name-cell"
                  @click="onNameClick(row)"
                  title="点击搜索该组件"
                >{{ row.name || '-' }}</span>
              </td>
              <td>
                <button
                  type="button"
                  class="comp-ver-link"
                  @click="onVersionClick(row)"
                  title="查看组件详情"
                >{{ row.version }}</button>
              </td>
              <td><code class="comp-group-id">{{ row.groupId }}</code></td>
              <td><span class="comp-lang-badge">{{ row.lang }}</span></td>
              <td><span class="comp-license">{{ row.license }}</span></td>
              <td>
                <span
                  class="comp-status-tag"
                  :class="row.shelfStatus === '已入库' ? 'comp-status-tag--online' : 'comp-status-tag--offline'"
                >{{ row.shelfStatus }}</span>
              </td>
            </tr>
            <tr v-if="!paginatedList.length">
              <td colspan="6" class="comp-empty-cell">无匹配组件，请调整筛选条件后重试。</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ========== 分页 ========== -->
      <footer class="comp-footer">
        <span class="comp-total">共计 {{ filteredList.length }} 条</span>
        <div class="comp-pager">
          <button
            type="button"
            class="comp-page-btn"
            :disabled="page <= 1"
            aria-label="上一页"
            @click="page = Math.max(1, page - 1)"
          >
            ‹
          </button>
          <template v-for="(p, idx) in pageItems" :key="`${p}-${idx}`">
            <span v-if="p === '…'" class="comp-page-ellipsis">…</span>
            <button
              v-else
              type="button"
              class="comp-page-btn"
              :class="{ 'is-active': p === page }"
              @click="page = p"
            >
              {{ p }}
            </button>
          </template>
          <button
            type="button"
            class="comp-page-btn"
            :disabled="page >= totalPages"
            aria-label="下一页"
            @click="page = Math.min(totalPages, page + 1)"
          >
            ›
          </button>
          <label class="comp-page-size">
            <span class="visually-hidden">每页条数</span>
            <select v-model.number="pageSize" class="comp-page-select">
              <option :value="10">10条/页</option>
              <option :value="20">20条/页</option>
              <option :value="50">50条/页</option>
            </select>
          </label>
        </div>
      </footer>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { versionTrains } from '../../data/versionTrainData.js'

const route = useRoute()
const router = useRouter()

const filterOpen = ref(true)

const langOptions = ['Java', 'Python', 'JavaScript', 'Go', 'C', 'C++', 'TypeScript', 'Rust', 'Scala', 'Erlang']

// 从版本火车数据提取火车名称列表
const trainOptions = computed(() =>
  versionTrains.map((t) => t.name).filter(Boolean),
)

// ========== 种子数据（spring-cloud-openefig 系列）==========
const COMP_SEED = [
  { name: 'spring-cloud-openefig-docs',       version: '4.2.0', groupId: 'org.springframework.cloud', lang: 'Java', license: 'Apache License V2.0', shelfStatus: '已入库' },
  { name: 'spring-cloud-openefig-dependencies', version: '4.2.0', groupId: 'org.springframework.cloud', lang: 'Java', license: 'Apache License V2.0', shelfStatus: '已入库' },
  { name: 'spring-cloud-starter-openefig',    version: '4.2.0', groupId: 'org.springframework.cloud', lang: 'Java', license: 'Apache License V2.0', shelfStatus: '已入库' },
  { name: 'spring-cloud-openefig',            version: '4.2.0', groupId: 'org.springframework.cloud', lang: 'Java', license: 'Apache License V2.0', shelfStatus: '已入库' },
  { name: 'spring-cloud-openefig-core',       version: '4.2.0', groupId: 'org.springframework.cloud', lang: 'Java', license: 'Apache License V2.0', shelfStatus: '已入库' },
  { name: 'spring-cloud-openefig',            version: '4.2.1', groupId: 'org.springframework.cloud', lang: 'Java', license: 'Apache License V2.0', shelfStatus: '已入库' },
  { name: 'spring-cloud-openefi',             version: '4.3.1', groupId: 'org.springframework.cloud', lang: 'Java', license: 'Apache License V2.0', shelfStatus: '已入库' },
  { name: '',                                  version: '4.3.1', groupId: 'org.springframework.cloud', lang: 'Java', license: 'Apache License V2.0', shelfStatus: '已入库' },
  { name: 'spring-cloud-openefig-dependencies', version: '4.3.1', groupId: 'org.springframework.cloud', lang: 'Java', license: 'Apache License V2.0', shelfStatus: '已入库' },
  { name: 'spring-cloud-openefig',            version: '4.3.1', groupId: 'org.springframework.cloud', lang: 'Java', license: 'Apache License V2.0', shelfStatus: '已入库' },
  { name: 'spring-cloud-openefig-docs',       version: '4.3.1', groupId: 'org.springframework.cloud', lang: 'Java', license: 'Apache License V2.0', shelfStatus: '已入库' },
  { name: 'spring-cloud-openefig-core',       version: '4.3.1', groupId: 'org.springframework.cloud', lang: 'Java', license: 'Apache License V2.0', shelfStatus: '已入库' },
]

// ========== 从版本火车数据收集组件模板 ==========
function inferGroupId(software, compName) {
  const map = {
    'Spring Boot': 'org.springframework.boot',
    'Apache Kafka': 'org.apache.kafka',
    Elasticsearch: 'org.elasticsearch',
    'Vue.js': 'org.vuejs',
    Nacos: 'com.alibaba.cloud',
    Consul: 'com.ecwid.consul',
  }
  if (map[software]) return map[software]
  const slug = (software || 'lib').toLowerCase().replace(/[^a-z0-9]+/g, '')
  return `com.${slug}.${compName.replace(/[^a-z0-9.-]+/gi, '').slice(0, 12) || 'core'}`
}

function collectComponentTemplates() {
  const templates = []
  const seen = new Set()
  for (const train of versionTrains) {
    for (const item of train.softwareList || []) {
      if (item.type !== 'component') continue
      const shortName = item.name.includes(' / ') ? item.name.split(' / ').pop() : item.name
      const key = `${shortName}::${item.version}`
      if (seen.has(key)) continue
      seen.add(key)
      templates.push({
        name: shortName,
        version: item.version,
        groupId: inferGroupId(item.software, shortName),
        lang: item.lang,
        license: formatLicense(item.license),
      })
    }
  }
  return templates
}

function formatLicense(lic) {
  if (!lic) return 'Apache License V2.0'
  if (lic === 'Apache-2.0') return 'Apache License V2.0'
  if (lic === 'MIT') return 'MIT License'
  if (lic === 'BSD-2-Clause' || lic === 'BSD-3-Clause') return 'BSD License'
  if (lic === 'MPL-2.0') return 'Mozilla Public License 2.0'
  return lic
}

// 扩展的组件名称池（用于生成海量数据）
const COMP_NAME_POOL = [
  'spring-cloud-commons', 'spring-cloud-config-client', 'spring-cloud-config-server',
  'spring-cloud-netflix-eureka-client', 'spring-cloud-netflix-zuul',
  'spring-cloud-gateway', 'spring-cloud-bus', 'spring-cloud-sleuth',
  'spring-cloud-stream', 'spring-cloud-function', 'spring-cloud-task',
  'spring-cloud-zookeeper', 'spring-cloud-kubernetes', 'spring-cloud-circuitbreaker',
  'spring-cloud-openfeign', 'spring-cloud-loadbalancer', 'spring-cloud-netflix-hystrix',
  'jackson-core', 'jackson-databind', 'jackson-annotations',
  'log4j-core', 'log4j-api', 'log4j-jul',
  'h2', 'flyway-core', 'postgresql-jdbc',
  'lettuce', 'redisson', 'jedis',
  'kafka-clients', 'kafka-streams', 'kafka-connect',
  'elasticsearch-rest-client', 'elasticsearch-java', 'elasticsearch-analysis-ik',
  'prometheus-client', 'prometheus-alertmanager', 'prometheus-node-exporter',
  'consul-client', 'consul-template',
  'tomcat-catalina', 'tomcat-jdbc', 'tomcat-websocket',
  'netty-buffer', 'netty-codec', 'netty-handler',
  'reactor-core', 'reactor-netty', 'reactor-extra',
]

function generateAllData() {
  const list = []
  let seq = 0

  // 1. 种子数据
  for (const s of COMP_SEED) {
    seq += 1
    list.push({ id: `comp-${seq}`, ...s })
  }

  // 2. 版本火车组件
  const templates = collectComponentTemplates()
  for (const t of templates) {
    if (list.some((r) => r.name === t.name && r.version === t.version)) continue
    seq += 1
    list.push({
      id: `comp-${seq}`,
      ...t,
      shelfStatus: seq % 7 === 0 ? '已出库' : '已入库',
    })
  }

  // 3. 填充到 30391 条
  const TARGET = 30391
  let ti = 0
  while (list.length < TARGET) {
    seq += 1
    const poolIdx = (seq - 1) % COMP_NAME_POOL.length
    const baseName = COMP_NAME_POOL[poolIdx]
    const major = 3 + (seq % 5)
    const minor = (seq * 7) % 20
    const patch = (seq * 13) % 30
    const groupPrefix = baseName.startsWith('spring-cloud') ? 'org.springframework.cloud'
      : baseName.startsWith('jackson') ? 'com.fasterxml.jackson.core'
      : baseName.startsWith('log4j') ? 'org.apache.logging.log4j'
      : baseName.startsWith('h2') ? 'com.h2database'
      : baseName.startsWith('flyway') ? 'org.flywaydb'
      : baseName.startsWith('postgresql') ? 'org.postgresql'
      : baseName.startsWith('lettuce') || baseName.startsWith('redisson') || baseName.startsWith('jedis') ? 'io.lettuce'
      : baseName.startsWith('kafka') ? 'org.apache.kafka'
      : baseName.startsWith('elasticsearch') ? 'org.elasticsearch'
      : baseName.startsWith('prometheus') ? 'io.prometheus'
      : baseName.startsWith('consul') ? 'com.ecwid.consul'
      : baseName.startsWith('tomcat') ? 'org.apache.tomcat'
      : baseName.startsWith('netty') ? 'io.netty'
      : baseName.startsWith('reactor') ? 'io.projectreactor'
      : 'com.example'

    list.push({
      id: `comp-${seq}`,
      name: baseName,
      version: `${major}.${minor}.${patch}`,
      groupId: groupPrefix,
      lang: ['Java', 'Java', 'Java', 'Java', 'Go', 'JavaScript', 'TypeScript'][poolIdx % 7],
      license: 'Apache License V2.0',
      shelfStatus: seq % 8 === 0 ? '已出库' : '已入库',
    })
    ti++
  }

  return list
}

const allData = ref(generateAllData())

const filters = reactive({
  name: '',
  version: '',
  lang: '',
  train: '',
})

const filteredList = ref(allData.value)
const page = ref(1)
const pageSize = ref(10)

function doFilter() {
  let list = allData.value
  const n = filters.name.trim().toLowerCase()
  const v = filters.version.trim().toLowerCase()
  if (n) list = list.filter((r) => r.name.toLowerCase().includes(n))
  if (v) list = list.filter((r) => r.version.toLowerCase().includes(v))
  if (filters.lang) list = list.filter((r) => r.lang === filters.lang)
  // 版本火车筛选：简单模拟，按名称前缀匹配火车名称关键词
  if (filters.train) {
    const trainName = filters.train.toLowerCase()
    // 按火车名称关键词模糊匹配组件名
    if (trainName.includes('安全补丁')) {
      list = list.filter((r) => r.name.toLowerCase().includes('security') || r.name.toLowerCase().includes('jackson') || r.name.toLowerCase().includes('netty') || r.name.toLowerCase().includes('tomcat') || r.name.toLowerCase().includes('log4j'))
    } else if (trainName.includes('q2')) {
      list = list.filter((r) => r.name.toLowerCase().includes('spring-cloud') || r.name.toLowerCase().includes('kafka') || r.name.toLowerCase().includes('redis') || r.name.toLowerCase().includes('elasticsearch'))
    }
  }
  filteredList.value = list
  page.value = 1
}

function clearFilter() {
  filters.name = ''
  filters.version = ''
  filters.lang = ''
  filters.train = ''
  doFilter()
}

// 初始化
doFilter()

const totalPages = computed(() => Math.max(1, Math.ceil(filteredList.value.length / pageSize.value)))

const paginatedList = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredList.value.slice(start, start + pageSize.value)
})

const pageItems = computed(() => {
  const total = totalPages.value
  const cur = page.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const items = [1]
  if (cur > 3) items.push('…')
  const start = Math.max(2, cur - 1)
  const end = Math.min(total - 1, cur + 1)
  for (let i = start; i <= end; i++) items.push(i)
  if (cur < total - 2) items.push('…')
  items.push(total)
  return items
})

watch(pageSize, () => {
  page.value = 1
})

watch(
  () => route.query.q,
  (q) => {
    const s = Array.isArray(q) ? q[0] : q
    if (typeof s === 'string' && s.trim()) {
      filters.name = s.trim()
      doFilter()
    }
  },
  { immediate: true },
)

function onNameClick(row) {
  if (row.name) {
    router.push({ name: 'component-detail', params: { id: row.id } })
  }
}

function onVersionClick(row) {
  router.push({ name: 'component-detail', params: { id: row.name || 'unknown' } })
}
</script>

<style scoped>
.comp-page {
  padding: 0;
  min-height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', sans-serif;
}

/* ========== 卡片 ========== */
.comp-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
}

.comp-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.comp-card-head--table {
  border-bottom: none;
  padding-bottom: 12px;
}

.comp-card-title-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  cursor: pointer;
  color: #111827;
}

.comp-card-caret {
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #6b7280;
  transition: transform 0.2s;
}

.comp-card-caret.is-open {
  transform: rotate(180deg);
}

.comp-card-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.comp-card-title--static {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.comp-card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/* ========== 筛选区 ========== */
.comp-filter-body {
  padding: 16px 20px 20px;
}

.comp-filter-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px 20px;
}

.comp-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.comp-label {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.comp-input,
.comp-select {
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-family: inherit;
  font-size: 13px;
  color: #111827;
  background: #fff;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.comp-input::placeholder {
  color: #9ca3af;
}

.comp-input:focus,
.comp-select:focus {
  border-color: #da203e;
  box-shadow: 0 0 0 2px rgba(218, 32, 62, 0.12);
}

.comp-select {
  cursor: pointer;
  color: #6b7280;
}

/* ========== 按钮 ========== */
.comp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  height: 32px;
  padding: 0 16px;
  border-radius: 4px;
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;
}

.comp-btn--primary {
  background: #da203e;
  color: #fff;
  border-color: #da203e;
}

.comp-btn--primary:hover {
  background: #c41c37;
  border-color: #c41c37;
}

.comp-btn--outline {
  background: #fff;
  color: #374151;
  border-color: #d1d5db;
}

.comp-btn--outline:hover {
  border-color: #da203e;
  color: #da203e;
}

/* ========== 表格 ========== */
.comp-table-card {
  overflow: hidden;
}

.comp-table-wrap {
  overflow-x: auto;
  padding: 0 20px;
}

.comp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.comp-table th,
.comp-table td {
  padding: 12px 10px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}

.comp-table th {
  font-weight: 500;
  color: #6b7280;
  background: #fafafa;
  white-space: nowrap;
}

.comp-table tbody tr:hover {
  background: #fafafa;
}

.comp-name-cell {
  color: #111827;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.12s;
}

.comp-name-cell:hover {
  color: #da203e;
  text-decoration: underline;
}

.comp-ver-link {
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  color: #2563eb;
  cursor: pointer;
}

.comp-ver-link:hover {
  text-decoration: underline;
}

.comp-group-id {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  color: #374151;
  background: #f3f4f6;
  padding: 1px 6px;
  border-radius: 3px;
}

.comp-lang-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  color: #374151;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

.comp-license {
  color: #374151;
  font-size: 12px;
}

.comp-status-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.comp-status-tag--online {
  color: #16a34a;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.comp-status-tag--offline {
  color: #6b7280;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

.comp-empty-cell {
  padding: 32px 14px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}

/* ========== 底部分页 ========== */
.comp-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 20px 16px;
  border-top: 1px solid #f0f0f0;
}

.comp-total {
  font-size: 13px;
  color: #6b7280;
}

.comp-pager {
  display: flex;
  align-items: center;
  gap: 6px;
}

.comp-page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: #fff;
  color: #374151;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.comp-page-btn:hover:not(:disabled):not(.is-active) {
  border-color: #da203e;
  color: #da203e;
}

.comp-page-btn.is-active {
  background: #da203e;
  border-color: #da203e;
  color: #fff;
}

.comp-page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.comp-page-ellipsis {
  padding: 0 4px;
  color: #9ca3af;
  font-size: 13px;
  user-select: none;
}

.comp-page-size {
  margin-left: 4px;
}

.comp-page-select {
  height: 32px;
  padding: 0 28px 0 10px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 13px;
  color: #374151;
  background: #fff;
  cursor: pointer;
  font-family: inherit;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ========== 响应式 ========== */
@media (max-width: 1100px) {
  .comp-filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .comp-filter-grid {
    grid-template-columns: 1fr;
  }

  .comp-card-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>