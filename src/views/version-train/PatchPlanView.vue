<template>
  <div class="shelf-page">
    <div class="shelf-tabs" role="tablist" aria-label="上下架类型">
      <button
        type="button"
        role="tab"
        class="shelf-tab"
        :class="{ 'is-active': activeTab === 'software' }"
        :aria-selected="activeTab === 'software'"
        @click="setTab('software')"
      >
        软件
      </button>
      <button
        type="button"
        role="tab"
        class="shelf-tab"
        :class="{ 'is-active': activeTab === 'component' }"
        :aria-selected="activeTab === 'component'"
        @click="setTab('component')"
      >
        组件
      </button>
    </div>

    <!-- 筛选信息 -->
    <section class="shelf-card shelf-filter-card">
      <header class="shelf-card-head">
        <button
          type="button"
          class="shelf-card-title-btn"
          :aria-expanded="filterOpen"
          @click="filterOpen = !filterOpen"
        >
          <span class="shelf-card-caret" :class="{ 'is-open': filterOpen }" aria-hidden="true" />
          <span class="shelf-card-title">筛选信息</span>
        </button>
        <div class="shelf-card-actions">
          <button
            type="button"
            class="shelf-btn shelf-btn--ghost"
            :disabled="!selectedIds.length"
            @click="batchShelf('上架中')"
          >
            批量上架
          </button>
          <button
            type="button"
            class="shelf-btn shelf-btn--ghost"
            :disabled="!selectedIds.length"
            @click="batchShelf('已下架')"
          >
            批量下架
          </button>
          <button type="button" class="shelf-btn shelf-btn--outline" @click="clearFilter">清空</button>
          <button type="button" class="shelf-btn shelf-btn--primary" @click="doFilter">筛选</button>
        </div>
      </header>
      <div v-show="filterOpen" class="shelf-filter-body">
        <!-- 软件筛选 -->
        <div v-if="activeTab === 'software'" class="shelf-filter-grid shelf-filter-grid--software">
          <div class="shelf-field">
            <label class="shelf-label">软件名称</label>
            <input
              v-model="swFilters.name"
              type="text"
              class="shelf-input"
              placeholder="请输入内容"
              @keyup.enter="doFilter"
            >
          </div>
          <div class="shelf-field">
            <label class="shelf-label">软件版本</label>
            <input
              v-model="swFilters.version"
              type="text"
              class="shelf-input"
              placeholder="请输入软件版本"
              @keyup.enter="doFilter"
            >
          </div>
          <div class="shelf-field">
            <label class="shelf-label">编程语言</label>
            <select v-model="swFilters.lang" class="shelf-select">
              <option value="">请输入</option>
              <option v-for="lang in langOptions" :key="lang" :value="lang">{{ lang }}</option>
            </select>
          </div>
          <div class="shelf-field">
            <label class="shelf-label">有无漏洞</label>
            <select v-model="swFilters.vuln" class="shelf-select">
              <option value="">请输入</option>
              <option value="yes">有漏洞</option>
              <option value="no">无漏洞</option>
            </select>
          </div>
          <div class="shelf-field">
            <label class="shelf-label">行业分类</label>
            <select v-model="swFilters.industry" class="shelf-select">
              <option value="">请输入</option>
              <option v-for="ind in industryOptions" :key="ind" :value="ind">{{ ind }}</option>
            </select>
          </div>
          <div class="shelf-field">
            <label class="shelf-label">上架状态</label>
            <select v-model="swFilters.shelf" class="shelf-select">
              <option value="">请选择</option>
              <option value="online">已上架</option>
              <option value="offline">已下架</option>
            </select>
          </div>
        </div>
        <!-- 组件筛选 -->
        <div v-else class="shelf-filter-grid shelf-filter-grid--component">
          <div class="shelf-field">
            <label class="shelf-label">组件名称</label>
            <input
              v-model="compFilters.name"
              type="text"
              class="shelf-input"
              placeholder="请输入"
              @keyup.enter="doFilter"
            >
          </div>
          <div class="shelf-field">
            <label class="shelf-label">组件版本</label>
            <input
              v-model="compFilters.version"
              type="text"
              class="shelf-input"
              placeholder="请输入"
              @keyup.enter="doFilter"
            >
          </div>
          <div class="shelf-field">
            <label class="shelf-label">编程语言</label>
            <select v-model="compFilters.lang" class="shelf-select">
              <option value="">请选择</option>
              <option v-for="lang in langOptions" :key="lang" :value="lang">{{ lang }}</option>
            </select>
          </div>
          <div class="shelf-field">
            <label class="shelf-label">上架状态</label>
            <select v-model="compFilters.shelf" class="shelf-select">
              <option value="">请选择</option>
              <option value="online">已上架</option>
              <option value="offline">已下架</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- 列表 -->
    <section class="shelf-card shelf-table-card">
      <header class="shelf-card-head shelf-card-head--table">
        <h2 class="shelf-card-title shelf-card-title--static">{{ listTitle }}</h2>
      </header>
      <div class="shelf-table-wrap">
        <!-- 软件表 -->
        <table v-if="activeTab === 'software'" class="shelf-table">
          <thead>
            <tr>
              <th class="shelf-th-chk">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  :indeterminate.prop="isIndeterminate"
                  aria-label="全选当前页"
                  @change="toggleAll"
                >
              </th>
              <th>软件名称</th>
              <th>最新版本评分</th>
              <th>版本发布时间</th>
              <th>行业分类</th>
              <th>最新版本漏洞数</th>
              <th>开发商</th>
              <th>编程语言</th>
              <th>上架状态</th>
              <th class="shelf-th-op">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in paginatedList" :key="row.id">
              <td class="shelf-td-chk">
                <input
                  type="checkbox"
                  :checked="selectedIds.includes(row.id)"
                  :aria-label="`选择 ${row.name}`"
                  @change="toggleItem(row.id)"
                >
              </td>
              <td>
                <button type="button" class="shelf-name-link" @click="onSoftwareClick(row)">
                  {{ row.name }}
                </button>
              </td>
              <td>
                <span v-if="row.score != null" class="shelf-score">
                  <span class="shelf-score-gauge" aria-hidden="true" />
                  {{ row.score }}
                </span>
                <span v-else class="shelf-score shelf-score--empty">--</span>
              </td>
              <td class="shelf-muted">{{ row.publishTime }}</td>
              <td>{{ row.industry }}</td>
              <td>
                <span
                  class="shelf-vuln"
                  :class="{ 'shelf-vuln--zero': row.vulnCount === 0, 'shelf-vuln--risk': row.vulnCount > 0 }"
                >
                  {{ row.vulnCount }}
                </span>
              </td>
              <td class="shelf-dev" :title="row.developer">{{ row.developer }}</td>
              <td><span class="shelf-lang">{{ row.lang }}</span></td>
              <td>
                <span
                  class="shelf-status-tag"
                  :class="isShelfOnline(row) ? 'shelf-status-tag--online' : 'shelf-status-tag--offline'"
                >
                  {{ getShelfLabel(row) }}
                </span>
              </td>
              <td class="shelf-td-op">
                <button
                  type="button"
                  class="shelf-op"
                  :class="{ 'shelf-op--off': isShelfOnline(row) }"
                  @click="toggleShelf(row)"
                >
                  {{ shelfActionLabel(row) }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 组件表 -->
        <table v-else class="shelf-table">
          <thead>
            <tr>
              <th class="shelf-th-chk">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  :indeterminate.prop="isIndeterminate"
                  aria-label="全选当前页"
                  @change="toggleAll"
                >
              </th>
              <th>组件名称</th>
              <th>组件版本</th>
              <th>groupId</th>
              <th>编程语言</th>
              <th>开源许可证</th>
              <th>上架状态</th>
              <th class="shelf-th-op">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in paginatedList" :key="row.id">
              <td class="shelf-td-chk">
                <input
                  type="checkbox"
                  :checked="selectedIds.includes(row.id)"
                  :aria-label="`选择 ${row.name}`"
                  @change="toggleItem(row.id)"
                >
              </td>
              <td class="shelf-comp-name">{{ row.name }}</td>
              <td>
                <button type="button" class="shelf-ver-link" @click="onComponentVersionClick(row)">
                  {{ row.version }}
                </button>
              </td>
              <td class="shelf-group">{{ row.groupId }}</td>
              <td><span class="shelf-lang-badge">{{ row.lang }}</span></td>
              <td>{{ row.license }}</td>
              <td>
                <span
                  class="shelf-status-tag"
                  :class="isShelfOnline(row) ? 'shelf-status-tag--online' : 'shelf-status-tag--offline'"
                >
                  {{ getShelfLabel(row) }}
                </span>
              </td>
              <td class="shelf-td-op">
                <button
                  type="button"
                  class="shelf-op"
                  :class="{ 'shelf-op--off': isShelfOnline(row) }"
                  @click="toggleShelf(row)"
                >
                  {{ shelfActionLabel(row) }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="shelf-footer">
        <span class="shelf-total">共计{{ filteredList.length }}条</span>
        <div class="shelf-pager">
          <button
            type="button"
            class="shelf-page-btn"
            :disabled="page <= 1"
            aria-label="上一页"
            @click="page = Math.max(1, page - 1)"
          >
            ‹
          </button>
          <template v-for="(p, idx) in pageItems" :key="`${p}-${idx}`">
            <span v-if="p === '…'" class="shelf-page-ellipsis">…</span>
            <button
              v-else
              type="button"
              class="shelf-page-btn"
              :class="{ 'is-active': p === page }"
              @click="page = p"
            >
              {{ p }}
            </button>
          </template>
          <button
            type="button"
            class="shelf-page-btn"
            :disabled="page >= totalPages"
            aria-label="下一页"
            @click="page = Math.min(totalPages, page + 1)"
          >
            ›
          </button>
          <label class="shelf-page-size">
            <span class="visually-hidden">每页条数</span>
            <select v-model.number="pageSize" class="shelf-page-select">
              <option :value="10">10条/页</option>
              <option :value="20">20条/页</option>
              <option :value="50">50条/页</option>
            </select>
          </label>
        </div>
      </footer>
    </section>

    <div v-if="toastMsg" class="shelf-toast" :class="toastType" role="status">
      {{ toastMsg }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { reviewResults, versionTrains } from '../../data/versionTrainData.js'

const route = useRoute()
const router = useRouter()
const filterOpen = ref(true)
const activeTab = ref(route.query.tab === 'component' ? 'component' : 'software')

const langOptions = ['Java', 'Python', 'JavaScript', 'Go', 'C', 'C++', 'TypeScript', 'Rust', 'Scala', 'Erlang']
const industryOptions = ['工业', '通信', '金融', '医疗', '教育', '互联网']

const listTitle = computed(() => (activeTab.value === 'software' ? '软件列表' : '组件列表'))

// —— 软件数据 ——
const SEED_SW = [
  {
    id: 'sw-1',
    name: 'requests',
    version: '2.32.3',
    score: 8.4,
    publishTime: '2026-03-26',
    industry: '通信,工业',
    vulnCount: 0,
    developer: 'Python Software Foundation',
    lang: 'Python',
    shelfStatus: '上架中',
  },
  {
    id: 'sw-2',
    name: 'protobuf-java',
    version: '4.28.2',
    score: 7.6,
    publishTime: '2026-03-25',
    industry: '工业',
    vulnCount: 3,
    developer: 'Protocol Buffers',
    lang: 'Java',
    shelfStatus: '上架中',
  },
  {
    id: 'sw-3',
    name: 'openclaw',
    version: '0.1.0',
    score: null,
    publishTime: '2026-03-20',
    industry: '互联网',
    vulnCount: 16,
    developer: 'OpenClaw Contributors',
    lang: 'JavaScript',
    shelfStatus: '已下架',
  },
]

function industriesForId(id) {
  const a = industryOptions[id % industryOptions.length]
  const b = industryOptions[(id + 2) % industryOptions.length]
  return id % 2 === 0 ? `${a},${b}` : a
}

function generateSoftwareData() {
  const list = [...SEED_SW]
  const usedNames = new Set(SEED_SW.map((s) => s.name))
  let seq = list.length

  for (const base of reviewResults) {
    if (usedNames.has(base.name)) continue
    usedNames.add(base.name)
    seq += 1
    const month = 1 + (seq % 6)
    const day = 1 + (seq % 28)
    list.push({
      id: `sw-${seq}`,
      name: base.name,
      version: base.version,
      score: Math.round((6 + (base.stars % 3000) / 1000) * 10) / 10,
      publishTime: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      industry: industriesForId(seq),
      vulnCount: base.vulnCount,
      developer: base.developer,
      lang: base.lang,
      shelfStatus: seq % 5 === 0 ? '已下架' : '上架中',
    })
  }

  while (list.length < 5075) {
    const base = reviewResults[(list.length - 1) % reviewResults.length]
    seq += 1
    const suffix = Math.floor(list.length / reviewResults.length)
    list.push({
      id: `sw-${seq}`,
      name: suffix > 0 ? `${base.name}-${suffix}` : base.name,
      version: base.version,
      score: Math.round((5 + ((seq * 7) % 40) / 10) * 10) / 10,
      publishTime: `2026-0${1 + (seq % 6)}-${String(1 + (seq % 28)).padStart(2, '0')}`,
      industry: industryOptions[seq % industryOptions.length] + (seq % 3 === 0 ? ',通信' : ''),
      vulnCount: Math.max(0, base.vulnCount + (seq % 4) - 1),
      developer: base.developer,
      lang: base.lang,
      shelfStatus: seq % 6 === 0 ? '已下架' : '上架中',
    })
  }
  return list
}

// —— 组件数据 ——
const COMP_SEED = [
  {
    id: 'comp-1',
    name: 'spring-cloud-openfeign-docs',
    version: '4.2.0',
    groupId: 'org.springframework.cloud',
    lang: 'Java',
    license: 'Apache License V2.0',
    shelfStatus: '上架中',
  },
  {
    id: 'comp-2',
    name: 'spring-cloud-starter-huawei-nacos',
    version: '1.10.13-2021.0.x',
    groupId: 'com.huaweicloud',
    lang: 'Java',
    license: 'Apache License V2.0',
    shelfStatus: '上架中',
  },
  {
    id: 'comp-3',
    name: 'spring-cloud-starter-alibaba-nacos-discovery',
    version: '2023.0.1.0',
    groupId: 'com.alibaba.cloud',
    lang: 'Java',
    license: 'Apache License V2.0',
    shelfStatus: '上架中',
  },
]

function formatLicense(lic) {
  if (!lic) return 'Apache License V2.0'
  if (lic === 'Apache-2.0') return 'Apache License V2.0'
  if (lic === 'MIT') return 'MIT License'
  if (lic === 'BSD-2-Clause' || lic === 'BSD-3-Clause') return 'BSD License'
  return lic
}

function inferGroupId(software, name) {
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
  return `com.${slug}.${name.replace(/[^a-z0-9.-]+/gi, '').slice(0, 12) || 'core'}`
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

function generateComponentData() {
  const list = COMP_SEED.map((r) => ({ ...r }))
  const templates = collectComponentTemplates()
  let seq = list.length

  for (const t of templates) {
    if (list.some((r) => r.name === t.name && r.version === t.version)) continue
    seq += 1
    list.push({
      id: `comp-${seq}`,
      ...t,
      shelfStatus: seq % 7 === 0 ? '已下架' : '上架中',
    })
  }

  const TARGET = 19862
  let ti = 0
  while (list.length < TARGET) {
    const t = templates[ti % templates.length] || {
      name: 'spring-cloud-commons',
      version: '4.1.0',
      groupId: 'org.springframework.cloud',
      lang: 'Java',
      license: 'Apache License V2.0',
    }
    ti += 1
    seq += 1
    const patch = Math.floor(list.length / Math.max(templates.length, 1))
    list.push({
      id: `comp-${seq}`,
      name: patch > 0 ? `${t.name}-${patch}` : t.name,
      version: t.version,
      groupId: t.groupId,
      lang: t.lang,
      license: t.license,
      shelfStatus: seq % 8 === 0 ? '已下架' : '上架中',
    })
  }
  return list
}

const allSw = ref(generateSoftwareData())
let allCompCache = null
const allComp = ref([])

function ensureCompData() {
  if (!allCompCache) {
    allCompCache = generateComponentData()
    allComp.value = allCompCache
  }
}

const swFilters = reactive({ name: '', version: '', lang: '', vuln: '', industry: '', shelf: '' })
const compFilters = reactive({ name: '', version: '', lang: '', shelf: '' })

const filteredSw = ref(allSw.value)
const filteredComp = ref([])

const filteredList = computed(() =>
  activeTab.value === 'software' ? filteredSw.value : filteredComp.value,
)

const page = ref(1)
const pageSize = ref(10)
const selectedIds = ref([])

function filterSoftware() {
  let list = allSw.value
  const n = swFilters.name.trim().toLowerCase()
  const v = swFilters.version.trim().toLowerCase()
  if (n) list = list.filter((s) => s.name.toLowerCase().includes(n))
  if (v) list = list.filter((s) => s.version.toLowerCase().includes(v))
  if (swFilters.lang) list = list.filter((s) => s.lang === swFilters.lang)
  if (swFilters.vuln === 'yes') list = list.filter((s) => s.vulnCount > 0)
  else if (swFilters.vuln === 'no') list = list.filter((s) => s.vulnCount === 0)
  if (swFilters.industry) list = list.filter((s) => s.industry.includes(swFilters.industry))
  list = applyShelfFilter(list, swFilters.shelf)
  filteredSw.value = list
}

function filterComponent() {
  ensureCompData()
  let list = allComp.value
  const n = compFilters.name.trim().toLowerCase()
  const v = compFilters.version.trim().toLowerCase()
  if (n) list = list.filter((s) => s.name.toLowerCase().includes(n))
  if (v) list = list.filter((s) => s.version.toLowerCase().includes(v))
  if (compFilters.lang) list = list.filter((s) => s.lang === compFilters.lang)
  list = applyShelfFilter(list, compFilters.shelf)
  filteredComp.value = list
}

function doFilter() {
  if (activeTab.value === 'software') filterSoftware()
  else filterComponent()
  page.value = 1
  selectedIds.value = []
}

function clearFilter() {
  if (activeTab.value === 'software') {
    swFilters.name = ''
    swFilters.version = ''
    swFilters.lang = ''
    swFilters.vuln = ''
    swFilters.industry = ''
    swFilters.shelf = ''
  } else {
    compFilters.name = ''
    compFilters.version = ''
    compFilters.lang = ''
    compFilters.shelf = ''
  }
  doFilter()
}

filterSoftware()
if (activeTab.value === 'component') {
  ensureCompData()
  filterComponent()
}

function getShelfStatus(row) {
  return row.shelfStatus || '上架中'
}

function isShelfOnline(row) {
  return getShelfStatus(row) === '上架中'
}

function getShelfLabel(row) {
  return isShelfOnline(row) ? '已上架' : '已下架'
}

function shelfActionLabel(row) {
  return isShelfOnline(row) ? '下架' : '上架'
}

function applyShelfFilter(list, shelf) {
  if (shelf === 'online') return list.filter((s) => isShelfOnline(s))
  if (shelf === 'offline') return list.filter((s) => !isShelfOnline(s))
  return list
}

function toggleShelf(row) {
  shelfRow(row, isShelfOnline(row) ? '已下架' : '上架中')
}

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
  () => route.query.tab,
  (t) => {
    const next = t === 'component' ? 'component' : 'software'
    if (next !== activeTab.value) {
      activeTab.value = next
      page.value = 1
      selectedIds.value = []
      doFilter()
    }
  },
)

function setTab(next) {
  if (activeTab.value === next) return
  activeTab.value = next
  page.value = 1
  selectedIds.value = []
  router.replace({
    name: 'patch-plan',
    query: next === 'component' ? { tab: 'component' } : {},
  })
  doFilter()
}

const isAllSelected = computed(() => {
  const list = paginatedList.value
  return list.length > 0 && list.every((s) => selectedIds.value.includes(s.id))
})

const isIndeterminate = computed(() => {
  const list = paginatedList.value
  const sel = list.filter((s) => selectedIds.value.includes(s.id))
  return sel.length > 0 && sel.length < list.length
})

function toggleAll(e) {
  if (e.target.checked) {
    const ids = paginatedList.value.map((s) => s.id)
    selectedIds.value = [...new Set([...selectedIds.value, ...ids])]
  } else {
    const pageIds = new Set(paginatedList.value.map((s) => s.id))
    selectedIds.value = selectedIds.value.filter((id) => !pageIds.has(id))
  }
}

function toggleItem(id) {
  const idx = selectedIds.value.indexOf(id)
  if (idx === -1) selectedIds.value.push(id)
  else selectedIds.value.splice(idx, 1)
}

function shelfRow(row, status) {
  row.shelfStatus = status
  const label = status === '上架中' ? '上架' : '下架'
  const kind = activeTab.value === 'software' ? '软件' : '组件'
  showToast(`已${label}${kind}「${row.name}」`, 'success')
}

function batchShelf(status) {
  if (!selectedIds.value.length) return
  if (activeTab.value === 'component') ensureCompData()
  const label = status === '上架中' ? '上架' : '下架'
  const source = activeTab.value === 'software' ? allSw.value : allComp.value
  let count = 0
  selectedIds.value.forEach((id) => {
    const row = source.find((s) => s.id === id)
    if (row) {
      row.shelfStatus = status
      count++
    }
  })
  const kind = activeTab.value === 'software' ? '软件' : '组件'
  showToast(`批量${label}${kind}完成，共 ${count} 项`, 'success')
  selectedIds.value = []
}

function onSoftwareClick(row) {
  router.push({ name: 'software-library', query: { q: row.name } })
}

function onComponentVersionClick(row) {
  router.push({
    name: 'component-library',
    query: { q: row.name },
  })
}

const toastMsg = ref('')
const toastType = ref('info')

function showToast(msg, type = 'info') {
  toastMsg.value = msg
  toastType.value = type
  setTimeout(() => {
    toastMsg.value = ''
  }, 2500)
}
</script>

<style scoped>
.shelf-page {
  padding: 0;
  min-height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', sans-serif;
}

.shelf-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: transparent;
  padding: 0;
}

.shelf-tab {
  position: relative;
  padding: 12px 24px 14px;
  margin-bottom: -1px;
  border: none;
  background: none;
  font: inherit;
  font-size: 15px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
}

.shelf-tab::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 16px;
  background: #e5e7eb;
}

.shelf-tabs .shelf-tab:last-child::after {
  display: none;
}

.shelf-tab.is-active {
  color: #da203e;
}

.shelf-tab.is-active::after {
  display: none;
}

.shelf-tab.is-active::before {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 12px;
  right: 12px;
  height: 2px;
  background: #da203e;
}

.shelf-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
}

.shelf-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.shelf-card-head--table {
  border-bottom: none;
  padding-bottom: 0;
}

.shelf-card-title-btn {
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

.shelf-card-caret {
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #6b7280;
  transition: transform 0.2s;
}

.shelf-card-caret.is-open {
  transform: rotate(180deg);
}

.shelf-card-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.shelf-card-title--static {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.shelf-card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.shelf-filter-body {
  padding: 16px 20px 20px;
}

.shelf-filter-grid {
  display: grid;
  gap: 16px 20px;
}

.shelf-filter-grid--software {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.shelf-filter-grid--component {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.shelf-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.shelf-label {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.shelf-input,
.shelf-select {
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

.shelf-input::placeholder {
  color: #9ca3af;
}

.shelf-input:focus,
.shelf-select:focus {
  border-color: #da203e;
  box-shadow: 0 0 0 2px rgba(218, 32, 62, 0.12);
}

.shelf-select {
  cursor: pointer;
  color: #6b7280;
}

.shelf-btn {
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

.shelf-btn--primary {
  background: #da203e;
  color: #fff;
  border-color: #da203e;
}

.shelf-btn--primary:hover {
  background: #c41c37;
  border-color: #c41c37;
}

.shelf-btn--outline {
  background: #fff;
  color: #374151;
  border-color: #d1d5db;
}

.shelf-btn--outline:hover {
  border-color: #da203e;
  color: #da203e;
}

.shelf-btn--ghost {
  background: #fff;
  color: #da203e;
  border-color: #da203e;
}

.shelf-btn--ghost:hover:not(:disabled) {
  background: #fef2f2;
}

.shelf-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.shelf-table-wrap {
  overflow-x: auto;
  padding: 0 20px;
}

.shelf-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.shelf-table th,
.shelf-table td {
  padding: 12px 10px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
}

.shelf-table th {
  font-weight: 500;
  color: #6b7280;
  background: #fafafa;
  white-space: nowrap;
}

.shelf-table tbody tr:hover {
  background: #fafafa;
}

.shelf-th-chk,
.shelf-td-chk {
  width: 44px;
  text-align: center;
}

.shelf-th-chk input,
.shelf-td-chk input {
  width: 16px;
  height: 16px;
  accent-color: #da203e;
  cursor: pointer;
}

.shelf-th-op,
.shelf-td-op {
  text-align: right;
  white-space: nowrap;
}

.shelf-name-link,
.shelf-ver-link {
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  color: #2563eb;
  cursor: pointer;
}

.shelf-name-link:hover,
.shelf-ver-link:hover {
  text-decoration: underline;
}

.shelf-comp-name {
  color: #111827;
  font-weight: 500;
}

.shelf-group {
  color: #374151;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
}

.shelf-score {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #111827;
}

.shelf-score-gauge {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #da203e;
  box-shadow: inset 0 0 0 2px #fff;
  flex-shrink: 0;
}

.shelf-score--empty {
  color: #9ca3af;
  font-weight: 400;
}

.shelf-muted {
  color: #374151;
}

.shelf-dev {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #374151;
}

.shelf-vuln {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.shelf-vuln--zero {
  color: #16a34a;
}

.shelf-vuln--risk {
  color: #da203e;
}

.shelf-lang {
  color: #2563eb;
}

.shelf-lang-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}

.shelf-status-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.shelf-status-tag--online {
  color: #16a34a;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.shelf-status-tag--offline {
  color: #6b7280;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

.shelf-op {
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-size: 13px;
  color: #da203e;
  cursor: pointer;
}

.shelf-op:hover {
  text-decoration: underline;
}

.shelf-op--off {
  color: #6b7280;
}

.shelf-op--off:hover {
  color: #da203e;
}

.shelf-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 20px 16px;
}

.shelf-total {
  font-size: 13px;
  color: #6b7280;
}

.shelf-pager {
  display: flex;
  align-items: center;
  gap: 6px;
}

.shelf-page-btn {
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

.shelf-page-btn:hover:not(:disabled):not(.is-active) {
  border-color: #da203e;
  color: #da203e;
}

.shelf-page-btn.is-active {
  background: #da203e;
  border-color: #da203e;
  color: #fff;
}

.shelf-page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.shelf-page-ellipsis {
  padding: 0 4px;
  color: #9ca3af;
  font-size: 13px;
  user-select: none;
}

.shelf-page-size {
  margin-left: 4px;
}

.shelf-page-select {
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

.shelf-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  z-index: 2000;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  animation: shelfToastIn 0.25s ease;
}

.shelf-toast.success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #15803d;
}

@keyframes shelfToastIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
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

@media (max-width: 1100px) {
  .shelf-filter-grid--software,
  .shelf-filter-grid--component {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .shelf-filter-grid--software,
  .shelf-filter-grid--component {
    grid-template-columns: 1fr;
  }

  .shelf-card-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
