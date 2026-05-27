<template>
  <div class="pp-page">

    <!-- ====== KPI 条 ====== -->
    <div class="pp-kpi-row">
      <div class="pp-kpi-item pp-kpi-item--danger">
        <div class="pp-kpi-value pp-kpi-value--danger">{{ stats.highCriticalCve }}</div>
        <div class="pp-kpi-label">高危漏洞</div>
      </div>
      <div class="pp-kpi-item pp-kpi-item--orange">
        <div class="pp-kpi-value pp-kpi-value--orange">{{ stats.affectedTrains }}</div>
        <div class="pp-kpi-label">影响版本火车</div>
      </div>
      <div class="pp-kpi-item pp-kpi-item--indigo">
        <div class="pp-kpi-value pp-kpi-value--indigo">{{ stats.affectedComponents }}</div>
        <div class="pp-kpi-label">影响组件</div>
      </div>
      <div class="pp-kpi-item pp-kpi-item--amber">
        <div class="pp-kpi-value pp-kpi-value--amber">{{ stats.affectedSoftware }}</div>
        <div class="pp-kpi-label">影响软件</div>
      </div>
    </div>

    <!-- ====== 漏洞预警信息模块 ====== -->
    <section class="pp-section pp-cve-section">
      <div class="pp-section-header">
        <h3 class="pp-section-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          漏洞预警信息
        </h3>
        <div class="pp-section-actions">
          <div class="pp-cve-search">
            <svg class="pp-cve-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="cveSearch" type="text" class="pp-cve-input" placeholder="搜索 CVE 编号或组件名..." />
          </div>
        </div>
      </div>
      <div class="pp-cve-table-wrap">
        <table class="pp-cve-table">
          <thead>
            <tr>
              <th>CVE 编号</th>
              <th>严重级别</th>
              <th>影响组件</th>
              <th>影响版本</th>
              <th>发布时间</th>
              <th>漏洞描述</th>
              <th>影响状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cve in paginatedCveList" :key="cve.id" :class="{ 'pp-cve-row--affected': cve.affected, 'pp-cve-row--resolved': !cve.affected }">
              <td><span class="pp-code">{{ cve.cveId }}</span></td>
              <td>
                <span class="pp-level" :class="'pp-level--' + levelClass(cve.level)">{{ cve.level }}</span>
              </td>
              <td>{{ cve.component }}</td>
              <td><span class="pp-code">{{ cve.version }}</span></td>
              <td class="pp-text-muted">{{ cve.publishTime }}</td>
              <td class="pp-cve-desc">{{ cve.description }}</td>
              <td>
                <span class="pp-badge" :class="cve.affected ? 'pp-badge--danger' : 'pp-badge--muted'">
                  {{ cve.affected ? '受影响' : '已处理' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="pp-pagination" v-if="filteredCveList.length > 0">
          <button class="pp-page-btn" :disabled="cvePage <= 1" @click="cvePage = 1">«</button>
          <button class="pp-page-btn" :disabled="cvePage <= 1" @click="cvePage--">‹</button>
          <button v-for="p in cvePageNumbers" :key="p" class="pp-page-btn" :class="{ 'pp-page-btn--active': p === cvePage }" @click="cvePage = p">{{ p }}</button>
          <button class="pp-page-btn" :disabled="cvePage >= cveTotalPages" @click="cvePage++">›</button>
          <button class="pp-page-btn" :disabled="cvePage >= cveTotalPages" @click="cvePage = cveTotalPages">»</button>
        </div>
      </div>
    </section>

    <!-- ====== 底部左右分栏：版本火车 + 软件上下架 ====== -->
    <div class="pp-bottom-layout">
      <!-- 左侧：版本火车列表 -->
      <aside class="pp-train-sidebar">
        <div class="pp-train-sidebar-header">
          <h4 class="pp-train-sidebar-title">版本火车</h4>
          <div class="pp-sidebar-search">
            <svg class="pp-sidebar-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="trainSearch" type="text" class="pp-sidebar-input" placeholder="搜索火车号或名称..." />
          </div>
        </div>
        <div class="pp-train-sidebar-list">
          <button
            v-for="train in filteredTrains"
            :key="train.id"
            type="button"
            class="pp-train-item"
            :class="{ 'pp-train-item--active': activeTrainId === train.id }"
            @click="activeTrainId = train.id"
          >
            <div class="pp-train-item-main">
              <span class="pp-train-name">{{ train.name }}</span>
              <span class="pp-train-badge">{{ train.softwareList.length }}</span>
            </div>
            <div class="pp-train-item-meta">
              <span class="pp-train-status" :class="'pp-train-status--' + (train.status === '待发车' ? 'pending' : 'released')">{{ train.status }}</span>
              <span class="pp-train-id">{{ train.id }}</span>
            </div>
          </button>
        </div>
        <div v-if="filteredTrains.length === 0" class="pp-train-sidebar-empty">
          <span class="pp-text-muted">没有匹配的版本火车</span>
        </div>
      </aside>

      <!-- 右侧：软件上下架列表 -->
      <main class="pp-sw-main">
        <section class="pp-sw-section">
          <!-- 头部 -->
          <div class="pp-sw-header" v-if="activeTrain">
            <div class="pp-sw-header-row">
              <div class="pp-sw-header-info">
                <h3 class="pp-sw-title">{{ activeTrain.id }} — {{ activeTrain.name }}</h3>
                <span class="pp-sw-header-meta">共 {{ activeTrain.softwareList.length }} 个软件/组件</span>
                <span class="pp-sw-header-meta pp-sw-header-meta--affected" v-if="affectedSwCount > 0">{{ affectedSwCount }} 个受影响</span>
              </div>
              <div class="pp-sw-header-actions">
                <div class="pp-sw-search">
                  <svg class="pp-sw-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input v-model="swNameSearch" type="text" class="pp-sw-input" placeholder="搜索名称..." />
                </div>
                <div class="pp-sw-search">
                  <svg class="pp-sw-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input v-model="swVerSearch" type="text" class="pp-sw-input" placeholder="搜索版本..." />
                </div>
              </div>
            </div>
            <!-- 批量操作栏 -->
            <div v-if="selectedSwBatch.length > 0" class="pp-batch-bar">
              <span class="pp-batch-count">已选 {{ selectedSwBatch.length }} 项</span>
              <div class="pp-batch-actions">
                <button type="button" class="pp-btn pp-btn-outline pp-btn-xs" @click="batchShelf('上架中')">批量上架</button>
                <button type="button" class="pp-btn pp-btn-outline pp-btn-xs" @click="batchShelf('已下架')">批量下架</button>
              </div>
              <button type="button" class="pp-linkish pp-linkish--muted" @click="selectedSwBatch = []">取消选择</button>
            </div>
          </div>
          <div class="pp-sw-empty" v-if="!activeTrain">
            <div class="pp-empty-msg">请从左侧列表选择一个版本火车</div>
          </div>

          <!-- 受影响软件表（标红） -->
          <template v-if="activeTrain && affectedSwList.length > 0">
            <div class="pp-sw-subtitle">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              受影响软件/组件
            </div>
            <div class="pp-sw-table-wrap">
              <table class="pp-sw-table">
                <thead>
                  <tr>
                    <th class="pp-th-chk"><input type="checkbox" :checked="isAffectedAllSelected" :indeterminate.prop="isAffectedIndeterminate" @change="toggleAffectedAll"></th>
                    <th>名称</th>
                    <th>类型</th>
                    <th>版本号</th>
                    <th>关联 CVE</th>
                    <th>严重级别</th>
                    <th class="pp-th-shelf">上架状态</th>
                    <th class="pp-th-op">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="sw in paginatedAffectedSw" :key="sw.id" class="pp-sw-row--affected">
                    <td class="pp-td-chk"><input type="checkbox" :checked="selectedSwBatch.includes(swKey(sw))" @change="toggleSw(sw)"></td>
                    <td><span class="pp-sw-name-affected">{{ sw.name }}</span></td>
                    <td><span class="pp-badge" :class="sw.type === 'component' ? 'pp-badge--muted' : 'pp-badge--primary'">{{ sw.type === 'component' ? '组件' : '软件' }}</span></td>
                    <td><span class="pp-code">{{ sw.version }}</span></td>
                    <td><span class="pp-code">{{ sw.relatedCve || '--' }}</span></td>
                    <td><span class="pp-level" :class="'pp-level--' + levelClass(sw.severity || '中危')">{{ sw.severity || '--' }}</span></td>
                    <td class="pp-td-shelf">
                      <template v-if="activeTrain.status === '已发车' || activeTrain.status === '已结束'">
                        <span class="pp-badge" :class="getShelfClass(sw)">{{ getShelfLabel(sw) }}</span>
                      </template>
                      <template v-else>
                        <span class="pp-text-muted">--</span>
                      </template>
                    </td>
                    <td class="pp-td-op">
                      <template v-if="activeTrain.status === '待发车'">
                        <button type="button" class="pp-linkish pp-linkish--danger" @click="removeSw(sw)">移除</button>
                      </template>
                      <template v-else-if="activeTrain.status === '已发车'">
                        <button v-if="getShelfStatus(sw) !== '上架中'" type="button" class="pp-linkish" @click="shelfSw(sw, '上架中')">上架</button>
                        <span v-if="getShelfStatus(sw) !== '上架中' && getShelfStatus(sw) !== '已下架'" class="pp-op-sep"></span>
                        <button v-if="getShelfStatus(sw) !== '已下架'" type="button" class="pp-linkish pp-linkish--danger" @click="shelfSw(sw, '已下架')">下架</button>
                      </template>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-if="affectedSwList.length > affectedPageSize" class="pp-pagination">
                <button class="pp-page-btn" :disabled="affectedPage <= 1" @click="affectedPage--">‹</button>
                <span class="pp-page-info">{{ affectedPage }} / {{ affectedTotalPages }}</span>
                <button class="pp-page-btn" :disabled="affectedPage >= affectedTotalPages" @click="affectedPage++">›</button>
              </div>
            </div>
          </template>

          <!-- 其他软件/组件 -->
          <template v-if="activeTrain">
            <div class="pp-sw-subtitle pp-sw-subtitle--other">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              其他软件/组件
            </div>
            <div class="pp-sw-table-wrap">
              <table class="pp-sw-table">
                <thead>
                  <tr>
                    <th class="pp-th-chk"><input type="checkbox" :checked="isOtherAllSelected" :indeterminate.prop="isOtherIndeterminate" @change="toggleOtherAll"></th>
                    <th>名称</th>
                    <th>类型</th>
                    <th>版本号</th>
                    <th>编程语言</th>
                    <th>开源许可证</th>
                    <th class="pp-th-shelf">上架状态</th>
                    <th class="pp-th-op">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="sw in paginatedOtherSw" :key="sw.id">
                    <td class="pp-td-chk"><input type="checkbox" :checked="selectedSwBatch.includes(swKey(sw))" @change="toggleSw(sw)"></td>
                    <td>{{ sw.name }}</td>
                    <td><span class="pp-badge" :class="sw.type === 'component' ? 'pp-badge--muted' : 'pp-badge--primary'">{{ sw.type === 'component' ? '组件' : '软件' }}</span></td>
                    <td><span class="pp-code">{{ sw.version }}</span></td>
                    <td>{{ sw.lang || '--' }}</td>
                    <td>{{ sw.license || '--' }}</td>
                    <td class="pp-td-shelf">
                      <template v-if="activeTrain.status === '已发车' || activeTrain.status === '已结束'">
                        <span class="pp-badge" :class="getShelfClass(sw)">{{ getShelfLabel(sw) }}</span>
                      </template>
                      <template v-else>
                        <span class="pp-text-muted">--</span>
                      </template>
                    </td>
                    <td class="pp-td-op">
                      <template v-if="activeTrain.status === '待发车'">
                        <button type="button" class="pp-linkish pp-linkish--danger" @click="removeSw(sw)">移除</button>
                      </template>
                      <template v-else-if="activeTrain.status === '已发车'">
                        <button v-if="getShelfStatus(sw) !== '上架中'" type="button" class="pp-linkish" @click="shelfSw(sw, '上架中')">上架</button>
                        <span v-if="getShelfStatus(sw) !== '上架中' && getShelfStatus(sw) !== '已下架'" class="pp-op-sep"></span>
                        <button v-if="getShelfStatus(sw) !== '已下架'" type="button" class="pp-linkish pp-linkish--danger" @click="shelfSw(sw, '已下架')">下架</button>
                      </template>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-if="otherSwList.length > otherPageSize" class="pp-pagination">
                <button class="pp-page-btn" :disabled="otherPage <= 1" @click="otherPage--">‹</button>
                <span class="pp-page-info">{{ otherPage }} / {{ otherTotalPages }}</span>
                <button class="pp-page-btn" :disabled="otherPage >= otherTotalPages" @click="otherPage++">›</button>
              </div>
            </div>
          </template>

          <!-- 空状态 -->
          <div v-if="activeTrain && fullFilteredList.length === 0" class="pp-sw-empty">
            <div class="pp-empty-msg">没有匹配的软件/组件</div>
          </div>
        </section>
      </main>
    </div>

    <!-- Toast -->
    <div v-if="toastMsg" class="pp-toast" :class="toastType">
      <span>{{ toastMsg }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { versionTrains as _versionTrains, patchPlanCVEList } from '../../data/versionTrainData.js'

const versionTrains = reactive(_versionTrains)

// ============================
// KPI 统计
// ============================
const stats = computed(() => {
  const highCritical = patchPlanCVEList.filter(c => (c.level === '严重' || c.level === '高危') && c.affected)
  // 受影响的组件名集合
  const affectedCompNames = new Set(patchPlanCVEList.filter(c => c.affected).map(c => c.component))
  const affectedTrainSet = new Set()
  let compCount = 0
  let swCount = 0
  versionTrains.forEach(t => {
    t.softwareList.forEach(sw => {
      if (affectedCompNames.has(sw.name)) {
        affectedTrainSet.add(t.id)
        if (sw.type === 'component') compCount++
        else swCount++
      }
    })
  })
  return {
    highCriticalCve: highCritical.length,
    affectedTrains: affectedTrainSet.size,
    affectedComponents: compCount,
    affectedSoftware: swCount,
  }
})

// ============================
// 漏洞预警
// ============================
const cveSearch = ref('')
const filteredCveList = computed(() => {
  const q = cveSearch.value.trim().toLowerCase()
  if (!q) return patchPlanCVEList
  return patchPlanCVEList.filter(c =>
    c.cveId.toLowerCase().includes(q) || c.component.toLowerCase().includes(q)
  )
})

// CVE 列表分页（每页5条）
const cvePage = ref(1)
const cvePageSize = 5
const cveTotalPages = computed(() => Math.max(1, Math.ceil(filteredCveList.value.length / cvePageSize)))
const cvePageNumbers = computed(() => {
  const total = cveTotalPages.value
  const cur = cvePage.value
  const pages = []
  let start = Math.max(1, cur - 2)
  let end = Math.min(total, cur + 2)
  if (end - start < 4) {
    if (start === 1) end = Math.min(total, start + 4)
    else start = Math.max(1, end - 4)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})
const paginatedCveList = computed(() => {
  const start = (cvePage.value - 1) * cvePageSize
  return filteredCveList.value.slice(start, start + cvePageSize)
})

// ============================
// 版本火车侧边栏
// ============================
const trainSearch = ref('')
const activeTrainId = ref(versionTrains[0]?.id || '')

const filteredTrains = computed(() => {
  const q = trainSearch.value.trim().toLowerCase()
  if (!q) return versionTrains
  return versionTrains.filter(t =>
    t.id.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)
  )
})

const activeTrain = computed(() =>
  versionTrains.find(t => t.id === activeTrainId.value) || null
)

// ============================
// 上架状态追踪（key = trainId-swId）
// ============================
const shelfStatusMap = reactive(new Map())

function swKey(sw) {
  return activeTrainId.value + '-' + sw.id
}

function getShelfStatus(sw) {
  const k = swKey(sw)
  return shelfStatusMap.get(k) || '待处理'
}

function getShelfLabel(sw) {
  const s = getShelfStatus(sw)
  return s === '上架中' ? '已上架' : s === '已下架' ? '已下架' : '待处理'
}

function getShelfClass(sw) {
  const s = getShelfStatus(sw)
  if (s === '上架中') return 'pp-badge--success'
  if (s === '已下架') return 'pp-badge--danger'
  return 'pp-badge--muted'
}

function setShelfStatus(sw, status) {
  shelfStatusMap.set(swKey(sw), status)
}

// ============================
// 匹配受影响的软件（关联 CVE）
// ============================
const cveComponentSet = computed(() => {
  const map = new Map()
  patchPlanCVEList.filter(c => c.affected).forEach(c => {
    map.set(c.component, { cveId: c.cveId, severity: c.level })
  })
  return map
})

// 软件搜索
const swNameSearch = ref('')
const swVerSearch = ref('')

const fullFilteredList = computed(() => {
  if (!activeTrain.value) return []
  let list = activeTrain.value.softwareList
  const ns = swNameSearch.value.trim().toLowerCase()
  const vs = swVerSearch.value.trim().toLowerCase()
  if (ns) list = list.filter(sw => sw.name.toLowerCase().includes(ns))
  if (vs) list = list.filter(sw => sw.version.toLowerCase().includes(vs))
  return list
})

// 受影响的软件（关联 CVE 的放到最上面）
const affectedSwList = computed(() => {
  let list = fullFilteredList.value.filter(sw => cveComponentSet.value.has(sw.name))
    .map(sw => {
      const cveInfo = cveComponentSet.value.get(sw.name)
      return { ...sw, relatedCve: cveInfo?.cveId || '--', severity: cveInfo?.severity || '--' }
    })
  // 已发车/已结束状态下，已下架的软件不展示在受影响列表中
  if (activeTrain.value && (activeTrain.value.status === '已发车' || activeTrain.value.status === '已结束')) {
    list = list.filter(sw => getShelfStatus(sw) !== '已下架')
  }
  return list
})

const affectedSwCount = computed(() => affectedSwList.value.length)

const otherSwList = computed(() => {
  const affectedNames = new Set(affectedSwList.value.map(sw => swKey(sw)))
  return fullFilteredList.value.filter(sw => !affectedNames.has(swKey(sw)))
})

// ============================
// 受影响列表分页
// ============================
const affectedPage = ref(1)
const affectedPageSize = 10
const affectedTotalPages = computed(() => Math.max(1, Math.ceil(affectedSwList.value.length / affectedPageSize)))
const paginatedAffectedSw = computed(() => {
  const start = (affectedPage.value - 1) * affectedPageSize
  return affectedSwList.value.slice(start, start + affectedPageSize)
})

// 其他列表分页
const otherPage = ref(1)
const otherPageSize = 15
const otherTotalPages = computed(() => Math.max(1, Math.ceil(otherSwList.value.length / otherPageSize)))
const paginatedOtherSw = computed(() => {
  const start = (otherPage.value - 1) * otherPageSize
  return otherSwList.value.slice(start, start + otherPageSize)
})

// 切换火车或搜索时重置分页
import { watch } from 'vue'
watch([activeTrainId, swNameSearch, swVerSearch], () => {
  affectedPage.value = 1
  otherPage.value = 1
})

watch(cveSearch, () => { cvePage.value = 1 })

// ============================
// 批量选择
// ============================
const selectedSwBatch = ref([])

// 受影响全选
const isAffectedAllSelected = computed(() => {
  const list = paginatedAffectedSw.value
  return list.length > 0 && list.every(sw => selectedSwBatch.value.includes(swKey(sw)))
})
const isAffectedIndeterminate = computed(() => {
  const list = paginatedAffectedSw.value
  const selected = list.filter(sw => selectedSwBatch.value.includes(swKey(sw)))
  return selected.length > 0 && selected.length < list.length
})
function toggleAffectedAll(e) {
  if (e.target.checked) {
    const ids = paginatedAffectedSw.value.map(sw => swKey(sw))
    selectedSwBatch.value = [...new Set([...selectedSwBatch.value, ...ids])]
  } else {
    const pageKeys = new Set(paginatedAffectedSw.value.map(sw => swKey(sw)))
    selectedSwBatch.value = selectedSwBatch.value.filter(k => !pageKeys.has(k))
  }
}

// 其他全选
const isOtherAllSelected = computed(() => {
  const list = paginatedOtherSw.value
  return list.length > 0 && list.every(sw => selectedSwBatch.value.includes(swKey(sw)))
})
const isOtherIndeterminate = computed(() => {
  const list = paginatedOtherSw.value
  const selected = list.filter(sw => selectedSwBatch.value.includes(swKey(sw)))
  return selected.length > 0 && selected.length < list.length
})
function toggleOtherAll(e) {
  if (e.target.checked) {
    const ids = paginatedOtherSw.value.map(sw => swKey(sw))
    selectedSwBatch.value = [...new Set([...selectedSwBatch.value, ...ids])]
  } else {
    const pageKeys = new Set(paginatedOtherSw.value.map(sw => swKey(sw)))
    selectedSwBatch.value = selectedSwBatch.value.filter(k => !pageKeys.has(k))
  }
}

// 单个切换
function toggleSw(sw) {
  const k = swKey(sw)
  const idx = selectedSwBatch.value.indexOf(k)
  if (idx === -1) selectedSwBatch.value.push(k)
  else selectedSwBatch.value.splice(idx, 1)
}

// ============================
// 上下架操作
// ============================
function shelfSw(sw, status) {
  setShelfStatus(sw, status)
  addLog(status === '上架中' ? '上架' : '下架', `${sw.name} v${sw.version}`)
  showToast(`${status === '上架中' ? '已上架' : '已下架'} ${sw.name}`, 'success')
}

function removeSw(sw) {
  if (!activeTrain.value) return
  const idx = activeTrain.value.softwareList.indexOf(sw)
  if (idx !== -1) {
    activeTrain.value.softwareList.splice(idx, 1)
    addLog('移除', `${sw.name} v${sw.version}`)
    showToast(`已移除 ${sw.name}`, 'info')
  }
}

function batchShelf(status) {
  const label = status === '上架中' ? '上架' : '下架'
  let count = 0
  selectedSwBatch.value.forEach(key => {
    const [trainId, swId] = key.split('-')
    const train = versionTrains.find(t => t.id === trainId)
    if (train) {
      const sw = train.softwareList.find(s => s.id === Number(swId))
      if (sw) {
        shelfStatusMap.set(key, status)
        count++
      }
    }
  })
  addLog(`批量${label}`, `共 ${count} 项`)
  showToast(`批量${label}完成：${count} 项`, 'success')
  selectedSwBatch.value = []
}

// ============================
// 操作记录
// ============================
const operationLogs = ref([])
const showLogModal = ref(false)

function addLog(type, detail) {
  operationLogs.value.unshift({
    id: Date.now() + Math.random(),
    time: new Date().toLocaleString('zh-CN'),
    type,
    detail,
  })
}

// ============================
// Toast
// ============================
const toastMsg = ref('')
const toastType = ref('info')
function showToast(msg, type = 'info') {
  toastMsg.value = msg
  toastType.value = type
  setTimeout(() => { toastMsg.value = '' }, 2500)
}

// ============================
// 工具函数
// ============================
function levelClass(level) {
  if (level === '严重') return 'critical'
  if (level === '高危') return 'high'
  if (level === '中危') return 'medium'
  if (level === '低危') return 'low'
  return 'muted'
}
</script>

<style scoped>
.pp-page { padding: 24px; min-height: 100%; }

/* ====== KPI ====== */
.pp-kpi-row {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
  margin-bottom: 20px;
}
.pp-kpi-item {
  border-radius: 10px;
  padding: 18px 20px; text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.pp-kpi-item--danger { background: #fef2f2; border: 1px solid #fecaca; }
.pp-kpi-item--orange { background: #fff7ed; border: 1px solid #fed7aa; }
.pp-kpi-item--amber  { background: #fffbeb; border: 1px solid #fde68a; }
.pp-kpi-item--gray   { background: #f3f4f6; border: 1px solid #e5e7eb; }
.pp-kpi-item--indigo { background: #eef2ff; border: 1px solid #c7d2fe; }
.pp-kpi-value {
  font-size: 32px; font-weight: 700; line-height: 1.2;
  margin-bottom: 4px;
}
.pp-kpi-value--danger { color: #dc2626; }
.pp-kpi-value--orange { color: #ea580c; }
.pp-kpi-value--amber  { color: #d97706; }
.pp-kpi-value--gray   { color: #6b7280; }
.pp-kpi-value--indigo { color: #4f46e5; }
.pp-kpi-label { font-size: 13px; color: #6b7280; }

/* ====== 通用 section ====== */
.pp-section {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 10px;
  margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow: hidden;
}
.pp-section-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; border-bottom: 1px solid #e5e7eb;
}
.pp-section-title {
  font-size: 15px; font-weight: 700; color: #111827; margin: 0;
  display: flex; align-items: center; gap: 8px;
}
.pp-section-actions { display: flex; align-items: center; gap: 10px; }

/* ====== CVE 预警表 ====== */
.pp-cve-table-wrap { overflow-x: auto; }
.pp-cve-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.pp-cve-table th, .pp-cve-table td { padding: 10px 14px; text-align: left; border-bottom: 1px solid #e5e7eb; white-space: nowrap; }
.pp-cve-table th { font-weight: 600; color: #374151; background: #f9fafb; font-size: 12px; }
.pp-cve-table tbody tr:hover { background: #f9fafb; }
.pp-cve-row--affected { background: #fff; }
.pp-cve-row--resolved td { color: #9ca3af; }
.pp-cve-desc { max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #6b7280; }
.pp-cve-search { position: relative; }
.pp-cve-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; }
.pp-cve-input {
  padding: 7px 12px 7px 30px; border: 1px solid #e5e7eb; border-radius: 5px;
  font-family: inherit; font-size: 13px; color: #374151; outline: none; width: 220px;
  background: #f9fafb; transition: all 0.2s;
}
.pp-cve-input:focus { border-color: #da203e; background: #fff; box-shadow: 0 0 0 2px rgba(218,32,62,0.1); }

/* ====== 底部左右分栏 ====== */
.pp-bottom-layout {
  display: flex; gap: 20px; align-items: stretch;
}

/* ====== 版本火车侧边栏 ====== */
.pp-train-sidebar {
  width: 300px; min-width: 260px;
  background: #fff; border: 1px solid #e5e7eb; border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  display: flex; flex-direction: column;
  overflow: hidden;
}
.pp-train-sidebar-header {
  padding: 14px 16px 10px; border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}
.pp-train-sidebar-title { font-size: 15px; font-weight: 700; color: #111827; margin: 0 0 10px 0; }
.pp-sidebar-search { position: relative; }
.pp-sidebar-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; }
.pp-sidebar-input {
  width: 100%; padding: 7px 12px 7px 30px; border: 1px solid #e5e7eb; border-radius: 5px;
  font-family: inherit; font-size: 13px; color: #374151; outline: none;
  background: #f9fafb; transition: all 0.2s;
}
.pp-sidebar-input:focus { border-color: #da203e; background: #fff; box-shadow: 0 0 0 2px rgba(218,32,62,0.1); }
.pp-train-sidebar-list { flex: 1; overflow-y: auto; padding: 6px 0; }
.pp-train-item {
  display: flex; flex-direction: column; gap: 3px;
  width: 100%; padding: 11px 16px; border: none; border-left: 3px solid transparent;
  background: transparent; cursor: pointer; text-align: left; font-family: inherit;
  transition: all 0.12s;
}
.pp-train-item:hover { background: #f9fafb; }
.pp-train-item--active { background: #fef2f2; border-left-color: #da203e; }
.pp-train-item-main { display: flex; align-items: center; justify-content: space-between; }
.pp-train-name { font-size: 14px; font-weight: 600; color: #111827; }
.pp-train-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 22px; height: 20px; padding: 0 6px; border-radius: 10px;
  font-size: 11px; font-weight: 600; background: #f3f4f6; color: #6b7280;
  border: 1px solid #e5e7eb; flex-shrink: 0;
}
.pp-train-item-meta { display: flex; align-items: center; gap: 8px; }
.pp-train-status { font-size: 11px; padding: 1px 8px; border-radius: 3px; font-weight: 500; white-space: nowrap; }
.pp-train-status--pending { background: #f0fdf4; color: #16a34a; }
.pp-train-status--released { background: #eef2ff; color: #4f46e5; }
.pp-train-id { font-size: 11px; color: #9ca3af; font-family: monospace; }
.pp-train-sidebar-empty { padding: 40px 16px; text-align: center; }
.pp-text-muted { color: #9ca3af; font-size: 13px; }

/* ====== 右侧软件主区 ====== */
.pp-sw-main { flex: 1; min-width: 0; }
.pp-sw-section { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden; }

/* Header */
.pp-sw-header { border-bottom: 1px solid #e5e7eb; }
.pp-sw-header-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; flex-wrap: wrap; gap: 10px;
}
.pp-sw-header-info { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.pp-sw-title { font-size: 15px; font-weight: 700; color: #111827; margin: 0; }
.pp-sw-header-meta { font-size: 12px; color: #9ca3af; }
.pp-sw-header-meta--affected { color: #dc2626; font-weight: 600; }
.pp-sw-header-actions { display: flex; align-items: center; gap: 10px; }
.pp-sw-search { position: relative; }
.pp-sw-search-icon { position: absolute; left: 9px; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; }
.pp-sw-input {
  padding: 6px 10px 6px 28px; border: 1px solid #e5e7eb; border-radius: 5px;
  font-family: inherit; font-size: 13px; color: #374151; outline: none; width: 160px;
  background: #f9fafb; transition: all 0.2s;
}
.pp-sw-input:focus { border-color: #da203e; background: #fff; box-shadow: 0 0 0 2px rgba(218,32,62,0.1); }

/* Batch bar */
.pp-batch-bar {
  display: flex; align-items: center; gap: 10px;
  background: #fef2f2; padding: 7px 20px; border-top: 1px solid #fecaca;
}
.pp-batch-count { font-size: 13px; font-weight: 600; color: #da203e; white-space: nowrap; }
.pp-batch-actions { display: flex; gap: 6px; }

/* 子标题 */
.pp-sw-subtitle {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 20px 6px; font-size: 13px; font-weight: 600;
  color: #dc2626; border-bottom: 1px solid #f3f4f6;
}
.pp-sw-subtitle--other { color: #6b7280; border-top: 1px solid #e5e7eb; }

/* 表格 */
.pp-sw-table-wrap { overflow-x: auto; }
.pp-sw-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.pp-sw-table th, .pp-sw-table td { padding: 9px 14px; text-align: left; border-bottom: 1px solid #e5e7eb; white-space: nowrap; }
.pp-sw-table th { font-weight: 600; color: #374151; background: #f9fafb; font-size: 12px; }
.pp-sw-table tbody tr:hover { background: #f9fafb; }
.pp-sw-row--affected { background: #fef2f2; }
.pp-sw-row--affected:hover { background: #fee2e2 !important; }
.pp-sw-name-affected { color: #dc2626; font-weight: 600; }
.pp-th-chk { width: 36px; text-align: center; }
.pp-td-chk { text-align: center; }
.pp-th-shelf { text-align: center; }
.pp-td-shelf { text-align: center; }
.pp-th-op { text-align: right; }
.pp-td-op { text-align: right; white-space: nowrap; }

/* 空状态 */
.pp-sw-empty { padding: 40px 20px; text-align: center; }
.pp-empty-msg { color: #9ca3af; font-size: 14px; }

/* ====== 公共组件 ====== */
.pp-code { font-size: 12px; color: #da203e; font-weight: 600; font-family: monospace; }
.pp-badge {
  display: inline-block; padding: 2px 10px; border-radius: 10px;
  font-size: 12px; font-weight: 500; white-space: nowrap;
}
.pp-badge--success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.pp-badge--danger { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.pp-badge--muted { background: #f3f4f6; color: #6b7280; border: 1px solid #e5e7eb; }
.pp-badge--primary { background: #eef2ff; color: #4f46e5; border: 1px solid #c7d2fe; }
.pp-level {
  display: inline-block; padding: 1px 8px; border-radius: 3px;
  font-size: 11px; font-weight: 600;
}
.pp-level--critical { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.pp-level--high { background: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; }
.pp-level--medium { background: #eef2ff; color: #2563eb; border: 1px solid #c7d2fe; }
.pp-level--low { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.pp-level--muted { background: #f3f4f6; color: #9ca3af; border: 1px solid #e5e7eb; }

.pp-text-muted { color: #9ca3af; font-size: 12px; }

.pp-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 18px; border: 1px solid #d1d5db; border-radius: 6px;
  font-family: inherit; font-size: 14px; cursor: pointer;
  transition: all 0.15s; background: #fff; color: #374151; line-height: 1.4;
}
.pp-btn:hover { border-color: #da203e; color: #da203e; }
.pp-btn-xs { padding: 5px 14px; font-size: 13px; }
.pp-btn-outline { background: transparent; color: #da203e; border-color: #da203e; }
.pp-btn-outline:hover { background: #fef2f2; color: #b91c1c; }

.pp-linkish { padding: 0; border: none; background: none; font-family: inherit; font-size: 13px; color: #da203e; cursor: pointer; }
.pp-linkish:hover { text-decoration: underline; }
.pp-linkish--muted { color: #9ca3af; }
.pp-linkish--muted:hover { color: #6b7280; }
.pp-linkish--danger { color: #dc2626; }
.pp-linkish--danger:hover { color: #b91c1c; }
.pp-op-sep { color: #d1d5db; font-size: 12px; user-select: none; margin: 0 3px; }

/* 分页 */
.pp-pagination {
  display: flex; align-items: center; justify-content: center;
  gap: 8px; padding: 12px 20px; border-top: 1px solid #e5e7eb;
}
.pp-page-btn {
  min-width: 30px; height: 30px; padding: 0 8px;
  border: 1px solid #e5e7eb; border-radius: 5px; background: #fff;
  color: #374151; cursor: pointer; font-size: 14px;
  display: inline-flex; align-items: center; justify-content: center;
  transition: all 0.15s; font-family: inherit;
}
.pp-page-btn:hover:not(:disabled) { border-color: #da203e; color: #da203e; }
.pp-page-btn:disabled { opacity: 0.35; cursor: default; }
.pp-page-btn--active { background: #da203e; color: #fff; border-color: #da203e; }
.pp-page-btn--active:hover { background: #b91c1c; }
.pp-page-info { font-size: 13px; color: #6b7280; min-width: 36px; text-align: center; }

/* Toast */
.pp-toast {
  position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
  padding: 12px 24px; border-radius: 8px;
  font-size: 14px; z-index: 2000;
  animation: ppToastIn 0.3s ease;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}
.pp-toast.info { background: #eef2ff; border: 1px solid #c7d2fe; color: #4338ca; }
.pp-toast.success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; }
@keyframes ppToastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(12px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
</style>
