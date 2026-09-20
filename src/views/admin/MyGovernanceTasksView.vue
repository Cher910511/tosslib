<template>
  <div class="mgt-page">
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
        <div class="mgt-head-left">
          <h2 class="mgt-table-title">待治理清单列表</h2>
          <span class="mgt-head-hint">提示：请先查看治理模板说明再开始填写治理表格</span>
        </div>
        <div class="mgt-head-actions">
          <button type="button" class="mgt-head-tpl" @click="downloadSampleTemplate">下载示例模板</button>
          <button type="button" class="mgt-head-tpl" @click="openTemplateGuide">治理模板说明</button>
        </div>
      </header>

      <div class="mgt-table-wrap">
        <table class="mgt-table">
          <thead>
            <tr>
              <th>反馈组织</th>
              <th>反馈人</th>
              <th>清单文件</th>
              <th>软件条数</th>
              <th>回传状态</th>
              <th>成功条数</th>
              <th>失败条数</th>
              <th>回传时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in paginatedList" :key="r.id">
              <td class="mgt-name">{{ r.org || '—' }}</td>
              <td>{{ r.reporter || '—' }}</td>
              <td class="mgt-file" :title="r.fileName">{{ r.fileName }}</td>
              <td>{{ r.itemCount }} 条</td>
              <td>
                <span
                  v-if="returnStatusOf(r) !== '—'"
                  class="mgt-ret"
                  :class="returnStatusClass(r)"
                >{{ returnStatusOf(r) }}</span>
                <span v-else class="mgt-muted">—</span>
              </td>
              <td>{{ r.returnOkCount != null ? `${r.returnOkCount} 条` : '—' }}</td>
              <td>
                <button
                  v-if="r.returnFailCount != null && (r.returnFailures || []).length"
                  type="button"
                  class="mgt-op mgt-op--fail"
                  @click="openFailures(r)"
                >{{ r.returnFailCount }} 条</button>
                <span v-else-if="r.returnFailCount != null">{{ r.returnFailCount }} 条</span>
                <span v-else class="mgt-muted">—</span>
              </td>
              <td>{{ r.returnedAt || '—' }}</td>
              <td>
                <button type="button" class="mgt-op" @click="openDetail(r)">查看详情</button>
                <span class="mgt-sep">|</span>
                <button type="button" class="mgt-op" @click="downloadList(r)">下载清单</button>
                <template v-if="r.status === '已分配'">
                  <span class="mgt-sep">|</span>
                  <button type="button" class="mgt-op mgt-op--strong" @click="openReturn(r)">回传清单</button>
                </template>
              </td>
            </tr>
            <tr v-if="!paginatedList.length">
              <td colspan="9" class="mgt-empty">暂无符合条件的清单</td>
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

    <!-- 回传校验结果（点击失败条数进入：逐行展示未通过的字段与原因） -->
    <div v-if="failuresTarget" class="mgt-overlay" @click.self="closeFailures">
      <div class="mgt-modal mgt-modal--failures" role="dialog" aria-modal="true" aria-labelledby="mgt-failures-title">
        <header class="mgt-modal-hd">
          <h3 id="mgt-failures-title" class="mgt-modal-title">回传校验结果</h3>
          <button type="button" class="mgt-modal-close" aria-label="关闭" @click="closeFailures">✕</button>
        </header>

        <p class="mgt-fail-alert">
          校验未通过，共 {{ failuresTarget.returnFailCount }} 行存在问题，请修正后重新上传：
        </p>

        <div class="mgt-modal-table">
          <table class="mgt-table">
            <thead>
              <tr>
                <th>行号</th>
                <th>字段</th>
                <th>失败原因</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(f, i) in failuresTarget.returnFailures" :key="i">
                <td class="mgt-fail-row">{{ f.row ?? '—' }}</td>
                <td>{{ f.field }}</td>
                <td class="mgt-fail-reason">{{ f.reason }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer class="mgt-modal-ft">
          <button type="button" class="mgt-btn mgt-btn--primary" @click="closeFailures">知道了</button>
        </footer>
      </div>
    </div>

    <!-- 上传治理结果（共享组件：本页行内「回传清单」进入，清单已确定，弹窗内不再提供清单选择） -->
    <GovernanceUploadDialog
      :open="uploadOpen"
      :preset-list-id="uploadListId"
      @close="closeUpload"
      @imported="onUploadImported"
      @guide="openTemplateGuide"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getInboundRequests } from '../../data/inboundRequests.js'
import { writePrefilledTemplate, writeSampleTemplate } from '../../data/governanceTemplate.js'
import { USERS } from '../../data/orgData.js'
import GovernanceUploadDialog from '../../components/gov/GovernanceUploadDialog.vue'

const route = useRoute()
const router = useRouter()

/** 治理表格填写说明：新标签打开使用手册中的说明文档 */
function openTemplateGuide() {
  const href = router.resolve({
    name: 'user-manual',
    params: { docId: 'governance-template-guide' },
  }).href
  window.open(new URL(href, window.location.origin).href, '_blank', 'noopener')
}

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

/* ==================== 下载软件导入模板 ==================== */
// 模板列定义/解析/校验统一使用共享模块 governanceTemplate.js

/** 下载预填模板：按本清单软件预填软件名称/软件版本/托管地址，其余治理结果字段留空待填写 */
function downloadPrefilledTemplate(r) {
  writePrefilledTemplate(
    `${(r.org || '治理')}-软件导入模板-${(r.createdAt || '').replace(/[: ]/g, '-')}.xlsx`,
    r.items || [],
  )
}

/** 下载示例模板：含一条完整示例数据，供参照各列填写格式 */
function downloadSampleTemplate() {
  writeSampleTemplate()
}

/** 回传状态：待回传（尚未回传的已分配清单）/ 回传中 / 成功 / 失败 —— 取最近一次回传结果 */
function returnStatusOf(r) {
  if (r.returnStatus) return r.returnStatus
  return r.status === '已分配' ? '待回传' : '—'
}

/** 回传状态配色：成功=绿、失败=红、回传中=蓝、待回传=灰 */
function returnStatusClass(r) {
  const status = returnStatusOf(r)
  if (status === '成功') return 'is-ok'
  if (status === '失败') return 'is-bad'
  if (status === '回传中') return 'is-run'
  return 'is-wait'
}

/* ===== 回传校验结果弹窗（点击「失败条数」进入） ===== */
const failuresTarget = ref(null)

/** 打开回传校验结果：逐行展示未通过的字段与原因 */
function openFailures(r) {
  failuresTarget.value = r
}

function closeFailures() {
  failuresTarget.value = null
}

/* ===== 上传治理结果（共享组件 GovernanceUploadDialog） ===== */
const uploadOpen = ref(false)
const uploadListId = ref('')

/** 回传清单：直接在本页打开上传治理结果弹窗（清单已确定，弹窗内只读展示，不再跳转） */
function openReturn(r) {
  uploadListId.value = r.id
  uploadOpen.value = true
}

function closeUpload() {
  uploadOpen.value = false
  uploadListId.value = ''
}

/** 回传完成：刷新清单列表（回传状态/条数/时间与清单状态均已变化） */
function onUploadImported() {
  uploadOpen.value = false
  uploadListId.value = ''
  refreshTick.value += 1
}
</script>

<style scoped>
.mgt-page {
  padding: 8px 24px 32px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

/* 列表头左侧：填写提示 + 标题 */
.mgt-head-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.mgt-head-hint {
  font-size: 12px;
  color: #9ca3af;
  white-space: nowrap;
}

/* 列表头右侧：示例模板下载 + 说明入口 */
.mgt-head-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.mgt-head-tpl {
  flex-shrink: 0;
  padding: 6px 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  font-family: inherit;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}
.mgt-head-tpl:hover {
  border-color: #da203e;
  color: #da203e;
  background: #fef2f2;
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
/* 主操作按钮（回传清单）：hover 红底白字 */
.mgt-op--strong {
  font-weight: 600;
}
.mgt-op--strong:hover {
  background: #da203e;
  color: #fff;
  border-color: #da203e;
}

/* 回传状态：待回传 / 成功 / 失败 */
.mgt-ret {
  display: inline-block;
  padding: 1px 8px;
  border: 1px solid transparent;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}
.mgt-ret.is-ok {
  color: #047857;
  background: #d1fae5;
  border-color: #a7f3d0;
}
.mgt-ret.is-bad {
  color: #b91c1c;
  background: #fee2e2;
  border-color: #fecaca;
}
/* 回传中：蓝色 */
.mgt-ret.is-run {
  color: #1d4ed8;
  background: #dbeafe;
  border-color: #bfdbfe;
}
.mgt-ret.is-wait {
  color: #b45309;
  background: #fef3c7;
  border-color: #fde68a;
}

/* 失败条数：可点击查看回传校验结果 */
.mgt-op--fail {
  color: #b91c1c;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.mgt-op--fail:hover {
  color: #dc2626;
}

/* ===== 回传校验结果弹窗 ===== */
.mgt-modal--failures {
  width: min(720px, 100%);
}
.mgt-fail-alert {
  margin: 0;
  padding: 12px 20px;
  font-size: 13px;
  line-height: 1.6;
  color: #b91c1c;
  background: #fef2f2;
  border-bottom: 1px solid #fecaca;
  flex-shrink: 0;
}
.mgt-fail-row {
  width: 88px;
  color: #6b7280;
}
.mgt-fail-reason {
  color: #b91c1c;
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
