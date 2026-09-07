<template>
  <div class="mgt-page">
    <!-- 顶部：返回 + 标题 -->
    <div class="mgt-head">
      <button type="button" class="mgt-back" @click="goBack">
        ← 返回软件治理
      </button>
      <h1 class="mgt-title">我的待治理清单</h1>
    </div>

    <!-- 筛选信息 -->
    <section class="mgt-card mgt-filter-card">
      <header class="mgt-card-hd">
        <button type="button" class="mgt-filter-toggle" :aria-expanded="filterOpen" @click="filterOpen = !filterOpen">
          <span class="mgt-caret" :class="{ 'is-open': filterOpen }" aria-hidden="true" />
          <span class="mgt-filter-title">筛选信息</span>
        </button>
        <div class="mgt-filter-actions">
          <button type="button" class="mgt-btn mgt-btn--outline" @click="clearFilter">清空</button>
          <button type="button" class="mgt-btn mgt-btn--primary" @click="doFilter">筛选</button>
        </div>
      </header>
      <div v-show="filterOpen" class="mgt-filter-body">
        <div class="mgt-filter-grid">
          <div class="mgt-field">
            <label class="mgt-label">反馈组织</label>
            <input v-model.trim="filters.org" type="text" class="mgt-input" placeholder="请输入反馈组织" />
          </div>
          <div class="mgt-field">
            <label class="mgt-label">清单文件</label>
            <input v-model.trim="filters.fileName" type="text" class="mgt-input" placeholder="请输入清单文件名" />
          </div>
        </div>
      </div>
    </section>

    <!-- 清单列表 -->
    <section class="mgt-card mgt-table-card">
      <header class="mgt-card-hd mgt-table-hd">
        <h2 class="mgt-table-title">待治理清单列表</h2>
        <span class="mgt-count">共 {{ filteredList.length }} 条</span>
      </header>

      <div class="mgt-table-wrap">
        <table class="mgt-table">
          <thead>
            <tr>
              <th>反馈组织</th>
              <th>反馈人</th>
              <th>清单文件</th>
              <th>软件条数</th>
              <th>提交时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in paginatedList" :key="r.id">
              <td class="mgt-name">{{ r.org || '—' }}</td>
              <td>{{ r.reporter || '—' }}</td>
              <td class="mgt-file" :title="r.fileName">
                {{ r.fileName }}
                <span v-if="r.status === '已分配'" class="mgt-badge">待回传</span>
              </td>
              <td>{{ r.itemCount }} 条</td>
              <td>{{ r.createdAt || '—' }}</td>
              <td>
                <button type="button" class="mgt-op" @click="openDetail(r)">查看详情</button>
                <span class="mgt-sep">|</span>
                <button type="button" class="mgt-op" @click="downloadList(r)">下载清单</button>
                <template v-if="r.status === '已分配' || r.status === '治理中'">
                  <span class="mgt-sep">|</span>
                  <button type="button" class="mgt-op mgt-op--strong" @click="openReturn(r)">回传清单</button>
                </template>
              </td>
            </tr>
            <tr v-if="!paginatedList.length">
              <td colspan="6" class="mgt-empty">暂无符合条件的清单</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页器 -->
      <footer v-if="filteredList.length" class="mgt-footer">
        <span class="mgt-total">共计 {{ filteredList.length }} 条</span>
        <div class="mgt-pager">
          <button type="button" class="mgt-page-btn" :disabled="page <= 1" aria-label="上一页" @click="page = Math.max(1, page - 1)">‹</button>
          <template v-for="(p, idx) in pageItems" :key="`${p}-${idx}`">
            <span v-if="p === '…'" class="mgt-page-ellipsis">…</span>
            <button v-else type="button" class="mgt-page-btn" :class="{ 'is-active': p === page }" @click="page = p">{{ p }}</button>
          </template>
          <button type="button" class="mgt-page-btn" :disabled="page >= totalPages" aria-label="下一页" @click="page = Math.min(totalPages, page + 1)">›</button>
          <label class="mgt-page-size">
            <span class="visually-hidden">每页条数</span>
            <select v-model.number="pageSize" class="mgt-page-select">
              <option :value="10">10条/页</option>
              <option :value="20">20条/页</option>
              <option :value="50">50条/页</option>
            </select>
          </label>
        </div>
      </footer>
    </section>

    <!-- 查看详情弹窗 -->
    <div v-if="detailTarget" class="mgt-overlay" @click.self="closeDetail">
      <div class="mgt-modal" role="dialog" aria-modal="true" aria-labelledby="mgt-modal-title">
        <header class="mgt-modal-hd">
          <h3 id="mgt-modal-title" class="mgt-modal-title">{{ detailTarget.org || '开源软件入库' }} · 入库需求清单</h3>
          <button type="button" class="mgt-modal-close" aria-label="关闭" @click="closeDetail">✕</button>
        </header>
        <div class="mgt-modal-meta">
          <span>反馈人：{{ detailTarget.reporter || '—' }}</span>
          <span>联系方式：{{ detailTarget.contact || '—' }}</span>
          <span>清单文件：{{ detailTarget.fileName }}</span>
          <span>提交时间：{{ detailTarget.createdAt }}</span>
        </div>
        <div class="mgt-table-wrap mgt-modal-table">
          <table class="mgt-table">
            <thead>
              <tr>
                <th>#</th>
                <th>开源软件名称</th>
                <th>版本号</th>
                <th>开源网站地址</th>
                <th>主要应用场景</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in detailItems" :key="i">
                <td>{{ (detailPage - 1) * detailPageSize + i + 1 }}</td>
                <td class="mgt-name">{{ row.name }}</td>
                <td>{{ row.version }}</td>
                <td class="mgt-file" :title="row.url">{{ row.url }}</td>
                <td>{{ row.scene }}</td>
              </tr>
              <tr v-if="!detailTarget.items.length">
                <td colspan="5" class="mgt-empty">该清单无解析数据</td>
              </tr>
            </tbody>
          </table>
        </div>
        <footer v-if="detailTarget.items.length" class="mgt-modal-pager">
          <span class="mgt-muted">共 {{ detailTarget.items.length }} 条</span>
          <div class="mgt-pager">
            <button type="button" class="mgt-page-btn" :disabled="detailPage <= 1" aria-label="上一页" @click="goDetailPage(detailPage - 1)">‹</button>
            <template v-for="(p, idx) in detailPageItems" :key="`${p}-${idx}`">
              <span v-if="p === '…'" class="mgt-page-ellipsis">…</span>
              <button v-else type="button" class="mgt-page-btn" :class="{ 'is-active': p === detailPage }" @click="goDetailPage(p)">{{ p }}</button>
            </template>
            <button type="button" class="mgt-page-btn" :disabled="detailPage >= detailPageCount" aria-label="下一页" @click="goDetailPage(detailPage + 1)">›</button>
            <label class="mgt-page-size">
              <span class="visually-hidden">每页条数</span>
              <select v-model.number="detailPageSize" class="mgt-page-select">
                <option :value="5">5条/页</option>
                <option :value="10">10条/页</option>
                <option :value="20">20条/页</option>
              </select>
            </label>
          </div>
        </footer>
        <footer class="mgt-modal-ft">
          <button type="button" class="mgt-btn mgt-btn--primary" @click="downloadList(detailTarget)">下载清单</button>
          <button type="button" class="mgt-btn mgt-btn--outline" @click="closeDetail">关闭</button>
        </footer>
      </div>
    </div>

    <!-- 回传清单弹窗 -->
    <div v-if="returnTarget" class="mgt-overlay" @click.self="closeReturn">
      <div class="mgt-modal" role="dialog" aria-modal="true" aria-labelledby="mgt-return-title">
        <header class="mgt-modal-hd">
          <h3 id="mgt-return-title" class="mgt-modal-title">回传治理清单</h3>
          <button type="button" class="mgt-modal-close" aria-label="关闭" @click="closeReturn">✕</button>
        </header>
        <div class="mgt-modal-meta">
          <span>反馈组织：{{ returnTarget.org || '—' }}</span>
          <span>反馈人：{{ returnTarget.reporter || '—' }}</span>
          <span>清单文件：{{ returnTarget.fileName }}</span>
        </div>

        <!-- 回传成功态 -->
        <div v-if="returnImportedCount != null" class="mgt-return-body">
          <div class="mgt-return-done">
            <p class="mgt-return-done-title">✓ 回传成功，已导入 {{ returnImportedCount }} 条软件</p>
            <p class="mgt-return-done-hint">软件已进入「软件治理 → 软件获取」列表，清单状态更新为「治理中」。</p>
          </div>
        </div>

        <!-- 上传 + 校验 -->
        <div v-else class="mgt-return-body">
          <div class="mgt-return-upload">
            <input ref="returnFileRef" type="file" accept=".xlsx,.xls,.csv" class="visually-hidden" @change="onReturnFile" />
            <button type="button" class="mgt-btn mgt-btn--outline" @click="returnFileRef?.click()">选择回传文件</button>
            <button type="button" class="mgt-btn mgt-btn--outline" @click="downloadPrefilledTemplate(returnTarget)">下载预填模板</button>
            <span v-if="returnFileName" class="mgt-return-file" :title="returnFileName">{{ returnFileName }}</span>
            <span v-if="returnParsing" class="mgt-muted">解析中…</span>
          </div>
          <p class="mgt-return-tip">
            请按治理模板维护（名称、版本、提交人、提交组织已预填）。校验规则：必填项齐全、名称+版本与本清单一致、未与已入库软件重复；任一条不通过则整份文件无法导入。
          </p>
          <p v-if="returnError" class="mgt-return-error">{{ returnError }}</p>

          <div v-if="returnRows.length" class="mgt-return-result">
            <p class="mgt-return-summary">
              共解析 {{ returnRows.length }} 条 · 通过 <strong class="is-ok">{{ passedReturnRows.length }}</strong> 条 · 未通过 <strong :class="failedReturnRows.length ? 'is-bad' : ''">{{ failedReturnRows.length }}</strong> 条
              <template v-if="failedReturnRows.length">，请修正后重新上传</template>
            </p>
            <table class="mgt-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>名称</th>
                  <th>版本</th>
                  <th>校验结果</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in returnRows" :key="i">
                  <td class="mgt-muted">{{ i + 1 }}</td>
                  <td class="mgt-name">{{ row.name || '—' }}</td>
                  <td>{{ row.version || '—' }}</td>
                  <td class="mgt-return-check">
                    <span v-if="row.errors.length" class="mgt-return-fail">✗ {{ row.errors.join('；') }}</span>
                    <span v-else class="mgt-return-pass">✓ 通过</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <footer class="mgt-modal-ft">
          <template v-if="returnImportedCount != null">
            <button type="button" class="mgt-btn mgt-btn--outline" @click="closeReturn">关闭</button>
            <button type="button" class="mgt-btn mgt-btn--primary" @click="goGovernance">前往软件治理</button>
          </template>
          <template v-else>
            <button type="button" class="mgt-btn mgt-btn--outline" @click="closeReturn">取消</button>
            <button
              type="button"
              class="mgt-btn mgt-btn--primary"
              :disabled="!canImportReturn || returnImporting"
              @click="confirmReturnImport"
            >{{ returnImporting ? '导入中…' : '确认导入（' + passedReturnRows.length + ' 条）' }}</button>
          </template>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as XLSX from 'xlsx'
import { getInboundRequests, updateInboundStatus } from '../../data/inboundRequests.js'
import { softwareList, importFromInbound } from '../../data/governanceStore.js'
import { USERS } from '../../data/orgData.js'

const route = useRoute()
const router = useRouter()

/* —— 当前用户角色：与侧边栏共用 route.query.user，默认平台管理员 —— */
const currentUser = computed(() => USERS.find((u) => u.id === route.query.user) || USERS[0])
const isSuperAdmin = computed(() => currentUser.value?.role === 'superadmin')

/** 当前用户所属组织 ID 集合 */
const userOrgIds = computed(() => {
  const u = currentUser.value
  if (!u) return []
  if (Array.isArray(u.orgIds) && u.orgIds.length) return u.orgIds.filter(Boolean)
  if (u.orgId) return [u.orgId]
  return []
})

/** 清单数据非响应式（localStorage + 种子），用版本号驱动刷新 */
const refreshTick = ref(0)

/** 我的待治理清单：库主看本组织被分配的；平台管理员看全部已分配 */
const assignedLists = computed(() => {
  refreshTick.value
  const list = getInboundRequests()
  if (isSuperAdmin.value) {
    return list.filter((r) => r.assignedOrgId && r.status !== '待分配')
  }
  return list.filter((r) => r.assignedOrgId && userOrgIds.value.includes(r.assignedOrgId))
})

/* —— 筛选 —— */
const filterOpen = ref(true)
const filters = reactive({ org: '', fileName: '' })

const filteredList = computed(() => {
  let list = assignedLists.value
  const org = filters.org.trim().toLowerCase()
  const fileName = filters.fileName.trim().toLowerCase()
  if (org) list = list.filter((r) => (r.org || '').toLowerCase().includes(org))
  if (fileName) list = list.filter((r) => (r.fileName || '').toLowerCase().includes(fileName))
  return list
})

function doFilter() {
  page.value = 1
}
function clearFilter() {
  filters.org = ''
  filters.fileName = ''
  page.value = 1
}

/* —— 分页 —— */
const page = ref(1)
const pageSize = ref(10)

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

/** 返回软件治理 */
function goBack() {
  router.push({ name: 'admin-gov' })
}

/* —— 查看详情弹窗分页 —— */
const detailTarget = ref(null)
const detailPage = ref(1)
const detailPageSize = ref(5)

const detailPageCount = computed(() => {
  const n = detailTarget.value?.items?.length || 0
  return Math.max(1, Math.ceil(n / detailPageSize.value))
})

const detailItems = computed(() => {
  const items = detailTarget.value?.items || []
  const start = (detailPage.value - 1) * detailPageSize.value
  return items.slice(start, start + detailPageSize.value)
})

const detailPageItems = computed(() => {
  const total = detailPageCount.value
  const cur = detailPage.value
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

function goDetailPage(p) {
  if (p < 1 || p > detailPageCount.value) return
  detailPage.value = p
}

watch(detailPageSize, () => {
  detailPage.value = 1
})

function openDetail(r) {
  detailTarget.value = r
  detailPage.value = 1
}
function closeDetail() {
  detailTarget.value = null
}

/** 下载清单：导出四列 CSV（UTF-8 BOM，Excel 可直接打开） */
function downloadList(r) {
  const header = ['开源软件名称', '版本号', '开源网站地址', '主要应用场景']
  const lines = [header.join(',')]
  ;(r.items || []).forEach((row) => {
    lines.push([row.name, row.version, row.url, row.scene].map((cell) => {
      const s = String(cell == null ? '' : cell)
      return `"${s.replace(/"/g, '""')}"`
    }).join(','))
  })
  const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${(r.org || '开源软件入库')}-需求清单-${(r.createdAt || '').replace(/[: ]/g, '-')}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(a.href)
}

/* ==================== 回传治理清单 ==================== */

// 治理模板列（与软件治理导入模板一致；提交人 / 提交组织为预填标识列）
const TEMPLATE_HEADERS = [
  '名称*', '版本*', '主语言*', '开源许可证*', '官方发布日期', '项目描述', '开发商', '开源许可证ID',
  '官网地址', '分支', '社区标签(Tag)', 'Commit ID', '软件文件*', '代码量(KL)',
  '开源社区源码托管地址*', '官网漏洞披露地址', '下线日期', '提交人', '提交组织',
]

// 表头别名（按长度倒序做包含匹配，避免「开源许可证」抢先吃掉「开源许可证ID」）
const HEADER_ALIASES = [
  ['name', ['开源软件名称', '软件名称', '名称']],
  ['version', ['版本号', '版本']],
  ['lang', ['主语言', '语言']],
  ['licenseId', ['开源许可证ID', '许可证ID']],
  ['license', ['开源许可证', '许可证']],
  ['releaseDate', ['官方发布日期', '发布日期']],
  ['desc', ['项目描述', '描述']],
  ['developer', ['开发商', '开发者']],
  ['homepage', ['官网地址', '官网']],
  ['branch', ['分支']],
  ['tag', ['社区标签', '标签']],
  ['commitId', ['Commit ID', 'CommitID', 'Commit']],
  ['file', ['软件文件', '文件']],
  ['codeSize', ['代码量']],
  ['repoUrl', ['开源社区源码托管地址', '源码托管地址', '仓库地址', '托管地址']],
  ['vulnUrl', ['官网漏洞披露地址', '漏洞披露地址']],
  ['offlineDate', ['下线日期']],
  ['submitter', ['提交人']],
  ['submitOrg', ['提交组织']],
]

const ALIAS_FLAT = HEADER_ALIASES
  .flatMap(([key, aliases]) => aliases.map((alias) => ({ key, alias: alias.replace(/\*/g, '').replace(/\s+/g, '').toLowerCase() })))
  .sort((a, b) => b.alias.length - a.alias.length)

// 必填列：缺任一项即校验失败
const REQUIRED_KEYS = [
  ['name', '名称'], ['version', '版本'], ['lang', '主语言'],
  ['license', '开源许可证'], ['file', '软件文件'], ['repoUrl', '源码托管地址'],
]

function normHeader(v) {
  return String(v ?? '').replace(/\*/g, '').replace(/\s+/g, '').trim().toLowerCase()
}

/** 匹配表头单元格属于哪一列，返回列 key 或 null */
function matchHeaderKey(cell) {
  const t = normHeader(cell)
  if (!t) return null
  for (const { key, alias } of ALIAS_FLAT) {
    if (t.includes(alias)) return key
  }
  return null
}

/** 从 SheetJS 单元格取值 */
function cellText(v) {
  if (v == null) return ''
  if (typeof v === 'object') {
    if (v.w != null) return String(v.w).trim()
    if (v.v != null) return String(v.v).trim()
    return ''
  }
  return String(v).trim()
}

/** 下载预填模板：名称/版本/提交人/提交组织预填，其余列留空待维护 */
function downloadPrefilledTemplate(r) {
  const csvCell = (cell) => {
    const s = String(cell == null ? '' : cell)
    return `"${s.replace(/"/g, '""')}"`
  }
  const lines = [TEMPLATE_HEADERS.join(',')]
  ;(r.items || []).forEach((item) => {
    const row = TEMPLATE_HEADERS.map((h) => {
      const key = h.replace(/\*/g, '').trim()
      if (key === '名称') return item.name ?? ''
      if (key === '版本') return item.version ?? ''
      if (key === '提交人') return r.reporter || ''
      if (key === '提交组织') return r.org || ''
      return ''
    })
    lines.push(row.map(csvCell).join(','))
  })
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${(r.org || '治理')}-治理清单回传模板-${(r.createdAt || '').replace(/[: ]/g, '-')}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(a.href)
}

/* —— 回传弹窗状态 —— */
const returnTarget = ref(null)
const returnFileRef = ref(null)
const returnFileName = ref('')
const returnParsing = ref(false)
const returnError = ref('')
const returnRows = ref([]) // [{ name, version, lang, ..., errors: string[] }]
const returnImporting = ref(false)
const returnImportedCount = ref(null)

function resetReturnState() {
  returnFileName.value = ''
  returnParsing.value = false
  returnError.value = ''
  returnRows.value = []
  returnImporting.value = false
  returnImportedCount.value = null
}

function openReturn(r) {
  resetReturnState()
  returnTarget.value = r
}

function closeReturn() {
  returnTarget.value = null
  resetReturnState()
}

function goGovernance() {
  closeReturn()
  router.push({ name: 'admin-gov' })
}

const passedReturnRows = computed(() => returnRows.value.filter((row) => row.errors.length === 0))
const failedReturnRows = computed(() => returnRows.value.filter((row) => row.errors.length > 0))
const canImportReturn = computed(() => returnRows.value.length > 0 && failedReturnRows.value.length === 0 && !returnParsing.value)

/** 选择回传文件：解析 + 逐条严格校验 */
async function onReturnFile(e) {
  const file = e.target?.files?.[0]
  if (e.target) e.target.value = ''
  if (!file || !returnTarget.value) return
  const ext = file.name.toLowerCase()
  if (!ext.endsWith('.xlsx') && !ext.endsWith('.xls') && !ext.endsWith('.csv')) {
    resetReturnState()
    returnError.value = '仅支持 .xlsx / .xls / .csv 格式文件'
    return
  }
  returnParsing.value = true
  returnError.value = ''
  returnRows.value = []
  returnImportedCount.value = null
  try {
    const buf = await file.arrayBuffer()
    const workbook = XLSX.read(buf, { type: 'array' })
    const rows = parseReturnSheet(workbook)
    if (!rows.length) {
      returnError.value = '未解析到有效数据，请确认使用回传模板（表头需含治理模板列）'
      return
    }
    returnRows.value = validateReturnRows(rows, returnTarget.value)
    returnFileName.value = file.name
  } catch (err) {
    returnError.value = '文件解析失败，请确认是有效的 Excel / CSV 文件'
  } finally {
    returnParsing.value = false
  }
}

/** 解析回传表格：定位表头行（≥3 个已知列）后逐行提取 */
function parseReturnSheet(workbook) {
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) return []
  const grid = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
  let headerRow = -1
  const colIdx = {}
  for (let i = 0; i < grid.length && i < 30; i++) {
    const found = {}
    let hit = 0
    grid[i].forEach((cell, c) => {
      const key = matchHeaderKey(cell)
      if (key && !(key in found)) {
        found[key] = c
        hit += 1
      }
    })
    if (hit >= 3) {
      headerRow = i
      Object.assign(colIdx, found)
      break
    }
  }
  if (headerRow === -1) return []
  const out = []
  for (let i = headerRow + 1; i < grid.length; i++) {
    const row = {}
    Object.entries(colIdx).forEach(([key, c]) => {
      row[key] = cellText(grid[i][c])
    })
    if (Object.values(row).every((v) => !v)) continue // 跳过空行
    out.push(row)
  }
  return out
}

/**
 * 逐条严格校验：
 * 1. 模板必填项齐全
 * 2. 名称+版本能对应上分配清单（忽略大小写）
 * 3. 名称+版本在表格内不重复
 * 4. 未与已入库软件重复（只查 warehouseStatus === '已入库'，在流程中的不算）
 */
function validateReturnRows(rows, target) {
  const seen = new Set()
  const items = target?.items || []
  return rows.map((row) => {
    const errors = []
    REQUIRED_KEYS.forEach(([key, label]) => {
      if (!row[key]) errors.push(`${label}必填`)
    })
    const name = row.name || ''
    const version = row.version || ''
    if (name && version) {
      const matched = items.some((it) =>
        (it.name || '').toLowerCase() === name.toLowerCase()
        && String(it.version || '').toLowerCase() === version.toLowerCase())
      if (!matched) errors.push('名称+版本与分配清单不匹配')

      const dupKey = name.toLowerCase() + '@' + version.toLowerCase()
      if (seen.has(dupKey)) errors.push('表格内名称+版本重复')
      else seen.add(dupKey)

      const inLibrary = softwareList.value.some((s) =>
        (s.name || '').toLowerCase() === name.toLowerCase()
        && String(s.version || '').toLowerCase() === version.toLowerCase()
        && s.warehouseStatus === '已入库')
      if (inLibrary) errors.push('该软件已入库，无需重复回传')
    }
    return { ...row, errors }
  })
}

/** 确认导入：全部通过后写入软件获取列表，清单状态置为「治理中」 */
async function confirmReturnImport() {
  if (!canImportReturn.value || !returnTarget.value) return
  returnImporting.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 400)) // 模拟提交
    const created = importFromInbound(passedReturnRows.value, returnTarget.value)
    updateInboundStatus(returnTarget.value.id, '治理中')
    refreshTick.value++ // 清单状态变化后刷新列表（待回传徽标消失）
    returnImportedCount.value = created.length
  } finally {
    returnImporting.value = false
  }
}
</script>

<style scoped>
.mgt-page {
  padding: 8px 24px 32px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

/* 顶部 */
.mgt-head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}
.mgt-back {
  flex-shrink: 0;
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  font-family: inherit;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}
.mgt-back:hover {
  border-color: #da203e;
  color: #da203e;
  background: #fef2f2;
}
.mgt-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

/* 卡片 */
.mgt-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
}
.mgt-card-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
}
.mgt-table-hd {
  border-bottom: none;
  padding-bottom: 12px;
}
.mgt-table-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}
.mgt-count {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 99px;
  background: #f3f4f6;
  color: #6b7280;
}

/* 筛选信息卡 */
.mgt-filter-toggle {
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
.mgt-caret {
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #6b7280;
  transition: transform 0.2s;
}
.mgt-caret.is-open {
  transform: rotate(180deg);
}
.mgt-filter-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}
.mgt-filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.mgt-filter-body {
  padding: 16px 20px 20px;
}
.mgt-filter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px 20px;
}
.mgt-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.mgt-label {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}
.mgt-input {
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
.mgt-input::placeholder {
  color: #9ca3af;
}
.mgt-input:focus {
  border-color: #da203e;
  box-shadow: 0 0 0 2px rgba(218, 32, 62, 0.12);
}

/* 表格 */
.mgt-table-wrap {
  overflow-x: auto;
  padding: 0 20px;
}
.mgt-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.mgt-table th,
.mgt-table td {
  padding: 12px 10px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
  white-space: nowrap;
}
.mgt-table th {
  font-weight: 500;
  color: #6b7280;
  background: #fafafa;
}
.mgt-table tbody tr:hover {
  background: #fafafa;
}
.mgt-name {
  color: #111827;
  font-weight: 500;
}
.mgt-file {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mgt-empty {
  text-align: center;
  color: #9ca3af;
  padding: 24px 12px;
}
.mgt-sep {
  margin: 0 6px;
  color: #e5e7eb;
  font-size: 12px;
  user-select: none;
}
.mgt-muted {
  font-size: 12px;
  color: #9ca3af;
}

/* 操作按钮 */
.mgt-op {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border: 0 solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  color: #da203e;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.mgt-op:hover {
  background: #fef2f2;
  border-color: #fecaca;
}
/* 回传清单：主操作，hover 红底白字 */
.mgt-op--strong {
  font-weight: 600;
}
.mgt-op--strong:hover {
  background: #da203e;
  color: #fff;
  border-color: #da203e;
}

/* 待回传徽标 */
.mgt-badge {
  display: inline-block;
  margin-left: 8px;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  color: #b45309;
  background: #fef3c7;
  border: 1px solid #fde68a;
  vertical-align: middle;
}

/* 回传弹窗主体 */
.mgt-return-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.mgt-return-upload {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.mgt-return-file {
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: #374151;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 4px 10px;
}
.mgt-return-tip {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.6;
}
.mgt-return-error {
  margin: 0;
  font-size: 13px;
  color: #dc2626;
}
.mgt-return-summary {
  margin: 0;
  font-size: 13px;
  color: #374151;
}
.mgt-return-summary .is-ok { color: #16a34a; }
.mgt-return-summary .is-bad { color: #dc2626; }
.mgt-return-check { white-space: normal; min-width: 220px; }
.mgt-return-pass {
  color: #16a34a;
  font-size: 12px;
}
.mgt-return-fail {
  color: #dc2626;
  font-size: 12px;
  line-height: 1.5;
}
.mgt-return-done {
  padding: 32px 16px;
  text-align: center;
}
.mgt-return-done-title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
  color: #16a34a;
}
.mgt-return-done-hint {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

/* 页脚分页 */
.mgt-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 20px 16px;
  border-top: 1px solid #f0f0f0;
}
.mgt-total {
  font-size: 12px;
  color: #6b7280;
}
.mgt-pager {
  display: flex;
  align-items: center;
  gap: 6px;
}
.mgt-page-btn {
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
.mgt-page-btn:hover:not(:disabled):not(.is-active) {
  border-color: #da203e;
  color: #da203e;
}
.mgt-page-btn.is-active {
  background: #da203e;
  border-color: #da203e;
  color: #fff;
}
.mgt-page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.mgt-page-ellipsis {
  padding: 0 4px;
  color: #9ca3af;
  font-size: 13px;
  user-select: none;
}
.mgt-page-size {
  margin-left: 4px;
}
.mgt-page-select {
  height: 32px;
  padding: 0 28px 0 10px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 12px;
  color: #374151;
  background: #fff;
  cursor: pointer;
  font-family: inherit;
}

/* 通用按钮 */
.mgt-btn {
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
.mgt-btn--primary {
  background: #da203e;
  color: #fff;
  border-color: #da203e;
}
.mgt-btn--primary:hover {
  background: #c41c37;
  border-color: #c41c37;
}
.mgt-btn--outline {
  background: #fff;
  color: #374151;
  border-color: #d1d5db;
}
.mgt-btn--outline:hover {
  border-color: #da203e;
  color: #da203e;
}

/* 弹窗 */
.mgt-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(17, 24, 39, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.mgt-modal {
  width: min(860px, 100%);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}
.mgt-modal-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}
.mgt-modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}
.mgt-modal-close {
  border: none;
  background: none;
  font-size: 16px;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
}
.mgt-modal-close:hover {
  color: #dc2626;
}
.mgt-modal-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  padding: 12px 20px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  font-size: 12px;
  color: #6b7280;
  flex-shrink: 0;
}
.mgt-modal-table {
  flex: 1;
  overflow: auto;
  padding: 4px 20px;
}
.mgt-modal-pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
  flex-shrink: 0;
}
.mgt-modal-ft {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;
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
</style>
