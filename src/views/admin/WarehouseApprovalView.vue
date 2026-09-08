<template>
  <div class="wav-page">
    <!-- 筛选信息 -->
    <section class="wav-card wav-filter-card">
      <header class="wav-card-hd">
        <button type="button" class="wav-filter-toggle" :aria-expanded="filterOpen" @click="filterOpen = !filterOpen">
          <span class="wav-caret" :class="{ 'is-open': filterOpen }" aria-hidden="true" />
          <span class="wav-filter-title">筛选信息</span>
        </button>
        <div class="wav-filter-actions">
          <button type="button" class="wav-btn wav-btn--outline" @click="clearFilter">清空</button>
          <button type="button" class="wav-btn wav-btn--primary" @click="doFilter">筛选</button>
        </div>
      </header>
      <div v-show="filterOpen" class="wav-filter-body">
        <div class="wav-filter-grid">
          <div class="wav-field">
            <label class="wav-label">软件名称</label>
            <input v-model.trim="filters.name" type="text" class="wav-input" placeholder="请输入软件名称" />
          </div>
          <div class="wav-field">
            <label class="wav-label">治理负责人</label>
            <input v-model.trim="filters.owner" type="text" class="wav-input" placeholder="请输入库主姓名" />
          </div>
          <div class="wav-field">
            <label class="wav-label">审核状态</label>
            <select v-model="filters.status" class="wav-input">
              <option value="">全部</option>
              <option value="待审批">待审批</option>
              <option value="已入库">已入库</option>
              <option value="已拒绝">已拒绝</option>
              <option value="已作废">已作废</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- 审批列表 -->
    <section class="wav-card wav-table-card">
      <header class="wav-card-hd wav-table-hd">
        <h2 class="wav-table-title">审批入库列表</h2>
        <div class="wav-table-actions">
          <span v-if="selectedCount > 0" class="wav-selected-tip">已选 {{ selectedCount }} 项</span>
          <button
            type="button"
            class="wav-btn wav-btn--primary"
            :disabled="selectedCount === 0"
            @click="askBatchApprove"
          >批量审核入库</button>
          <button
            type="button"
            class="wav-btn wav-btn--danger"
            :disabled="selectedCount === 0"
            @click="askBatchReject"
          >批量拒绝</button>
        </div>
      </header>

      <div class="wav-table-wrap">
        <table class="wav-table">
          <thead>
            <tr>
              <th class="wav-th-chk">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  :indeterminate="isIndeterminate"
                  @change="toggleAll"
                />
              </th>
              <th>软件名称</th>
              <th>版本</th>
              <th>编程语言</th>
              <th>开源许可证</th>
              <th>治理负责人</th>
              <th>漏洞数</th>
              <th>国标评分</th>
              <th>提交时间</th>
              <th>入库时间</th>
              <th>审核状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in paginatedList" :key="item.id">
              <td class="wav-td-chk">
                <input
                  type="checkbox"
                  :disabled="item.warehouseStatus === '已入库'"
                  :checked="selectedIds.includes(item.id)"
                  @change="toggleSelect(item)"
                />
              </td>
              <td class="wav-name">{{ item.name }}</td>
              <td>
                <button type="button" class="wav-version-link" @click="goSoftwareDetail(item)">
                  {{ item.version }}
                </button>
              </td>
              <td>{{ item.lang || '—' }}</td>
              <td>{{ item.license || '—' }}</td>
              <td>
                <span class="wav-owner-name">{{ item.govOwner || '—' }}</span>
              </td>
              <td>
                <span class="wav-vuln" :class="(item.vulnCount || 0) > 0 ? 'wav-vuln--risk' : 'wav-vuln--none'">{{ item.vulnCount ?? 0 }}</span>
              </td>
              <td>
                <button type="button" class="wav-score wav-score--link" :class="scoreTone(item)" @click="openScore(item)">
                  {{ item.nationalScore == null ? '未评分' : item.nationalScore.toFixed(1) }}
                </button>
              </td>
              <td>{{ item.createdAt || '—' }}</td>
              <td>{{ item.warehouseTime || '—' }}</td>
              <td><span class="wav-status" :class="'wav-status--' + item.warehouseStatus">{{ item.warehouseStatus }}</span></td>
              <td class="wav-td-op">
                <template v-if="item.warehouseStatus === '待审批'">
                  <button type="button" class="wav-op wav-op--approve" @click="askApprove(item)">审核入库</button>
                  <span class="wav-sep">|</span>
                  <button type="button" class="wav-op wav-op--danger" @click="askReject(item)">拒绝</button>
                </template>
                <template v-else-if="item.warehouseStatus === '已拒绝'">
                  <button type="button" class="wav-op wav-op--approve" @click="askReapprove(item)">重新审核入库</button>
                </template>
                <span v-else class="wav-muted">—</span>
              </td>
            </tr>
            <tr v-if="!paginatedList.length">
              <td colspan="12" class="wav-empty">暂无符合条件的软件，库主在软件治理中提交入库审核后会在此展示</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页器 -->
      <footer v-if="filteredList.length" class="wav-footer">
        <span class="wav-total">共计 {{ filteredList.length }} 条</span>
        <div class="wav-pager">
          <button type="button" class="wav-page-btn" :disabled="page <= 1" aria-label="上一页" @click="page = Math.max(1, page - 1)">‹</button>
          <template v-for="(p, idx) in pageItems" :key="`${p}-${idx}`">
            <span v-if="p === '…'" class="wav-page-ellipsis">…</span>
            <button v-else type="button" class="wav-page-btn" :class="{ 'is-active': p === page }" @click="page = p">{{ p }}</button>
          </template>
          <button type="button" class="wav-page-btn" :disabled="page >= totalPages" aria-label="下一页" @click="page = Math.min(totalPages, page + 1)">›</button>
          <label class="wav-page-size">
            <span class="visually-hidden">每页条数</span>
            <select v-model.number="pageSize" class="wav-page-select">
              <option :value="10">10条/页</option>
              <option :value="20">20条/页</option>
              <option :value="50">50条/页</option>
            </select>
          </label>
        </div>
      </footer>
    </section>

    <!-- 只读评分弹窗 -->
    <IndicatorScoreDialog
      :visible="!!scoreViewItem"
      :item="scoreViewItem"
      readonly
      @update:visible="(v) => { if (!v) scoreViewItem = null }"
    />

    <!-- 二次确认弹窗 -->
    <div v-if="confirmTarget" class="wav-overlay" @click.self="cancelConfirm">
      <div class="wav-modal wav-modal--sm" role="dialog" aria-modal="true" aria-labelledby="wav-confirm-title">
        <header class="wav-modal-hd">
          <h3 id="wav-confirm-title" class="wav-modal-title">
            {{ confirmTarget.action === 'approve' ? (confirmTarget.batch ? '批量审核入库' : '确认审核入库') : (confirmTarget.batch ? '批量拒绝' : '确认拒绝') }}
          </h3>
          <button type="button" class="wav-modal-close" aria-label="关闭" @click="cancelConfirm">✕</button>
        </header>
        <div class="wav-confirm-body">
          <template v-if="confirmTarget.batch">
            <p class="wav-confirm-text">
              确定要<strong>{{ confirmTarget.action === 'approve' ? '审核入库' : '拒绝' }}</strong>选中的
              <strong>{{ confirmTarget.items.length }} 个软件</strong> 吗？
            </p>
            <p class="wav-confirm-sub">{{ confirmTarget.items.map((i) => i.name).join('、') }}</p>
          </template>
          <p v-else class="wav-confirm-text">
            确定要<strong>{{ confirmTarget.action === 'approve' ? '审核入库' : '拒绝' }}</strong>软件
            <strong>{{ confirmTarget.items[0].name }} v{{ confirmTarget.items[0].version }}</strong> 吗？
          </p>
          <p v-if="confirmTarget.action === 'approve'" class="wav-confirm-hint">
            审核通过后软件将正式入库，并回写对应入库需求清单状态。
          </p>
          <template v-else>
            <p class="wav-confirm-hint">
              拒绝后该软件将标记为「已拒绝」，库主需重新处理后再次提交。
            </p>
            <p class="wav-confirm-hint wav-confirm-hint--warn">
              拒绝后该软件将<strong>加入黑名单</strong>，此后该软件名称和版本<strong>不能再次入库</strong>。
            </p>
            <div class="wav-field wav-confirm-reason">
              <label class="wav-label">拒绝原因 <span class="wav-required">*</span></label>
              <textarea
                v-model.trim="rejectReasonInput"
                class="wav-input wav-textarea"
                rows="3"
                placeholder="请填写拒绝原因"
              ></textarea>
            </div>
          </template>
        </div>
        <footer class="wav-modal-ft">
          <button
            type="button"
            class="wav-btn"
            :class="confirmTarget.action === 'approve' ? 'wav-btn--primary' : 'wav-btn--danger'"
            :disabled="confirmTarget.action === 'reject' && !rejectReasonInput.trim()"
            @click="confirmAction"
          >{{ confirmTarget.action === 'approve' ? '确认入库' : '确认拒绝' }}</button>
          <button type="button" class="wav-btn wav-btn--outline" @click="cancelConfirm">取消</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { softwareList, approveWarehouse, rejectWarehouse } from '../../data/governanceStore.js'
import { getInboundRequests, updateInboundStatus } from '../../data/inboundRequests.js'
import { sendMessage } from '../../data/messagesStore.js'
import { USERS } from '../../data/orgData.js'
import IndicatorScoreDialog from '../../components/gov/IndicatorScoreDialog.vue'

/* —— 筛选 —— */
const filterOpen = ref(true)
const filters = reactive({ name: '', owner: '', status: '' })

/** 审批列表：软件治理中已进入第 5 步（软件入库）的全部软件 */
const allApprovalItems = computed(() =>
  softwareList.value.filter((i) => i.currentStep === 5),
)

const filteredList = computed(() => {
  let list = allApprovalItems.value
  const n = filters.name.trim().toLowerCase()
  const o = filters.owner.trim().toLowerCase()
  if (n) list = list.filter((i) => i.name.toLowerCase().includes(n))
  if (o) list = list.filter((i) => (i.govOwner || '').toLowerCase().includes(o))
  if (filters.status) list = list.filter((i) => i.warehouseStatus === filters.status)
  return list
})

function doFilter() {
  page.value = 1
}
function clearFilter() {
  filters.name = ''
  filters.owner = ''
  filters.status = ''
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

/** 国标评分列色调 */
function scoreTone(item) {
  if (item.nationalScore == null) return 'wav-score--empty'
  return item.nationalScore >= 60 ? 'wav-score--ok' : 'wav-score--bad'
}

/* —— 只读评分弹窗：点击评分列查看 —— */
const scoreViewItem = ref(null)
function openScore(item) {
  scoreViewItem.value = item
}

/* —— 版本跳转软件详情 —— */
const router = useRouter()
function goSoftwareDetail(item) {
  router.push({ name: 'software-detail', query: { name: item.name, version: item.version } })
}

/* —— 多选（待审批 / 已拒绝可选，均可批量审核入库） —— */
const selectedIds = ref([])

const selectedItems = computed(() =>
  allApprovalItems.value.filter((i) => selectedIds.value.includes(i.id) && i.warehouseStatus !== '已入库'),
)
const selectedCount = computed(() => selectedItems.value.length)

const pageSelectable = computed(() => paginatedList.value.filter((i) => i.warehouseStatus !== '已入库'))
const isAllSelected = computed(() =>
  pageSelectable.value.length > 0 && pageSelectable.value.every((i) => selectedIds.value.includes(i.id)),
)
const isIndeterminate = computed(() => {
  const sel = pageSelectable.value.filter((i) => selectedIds.value.includes(i.id))
  return sel.length > 0 && sel.length < pageSelectable.value.length
})

function toggleAll(e) {
  if (e.target.checked) {
    const ids = pageSelectable.value.map((i) => i.id)
    selectedIds.value = [...new Set([...selectedIds.value, ...ids])]
  } else {
    const pageIds = new Set(pageSelectable.value.map((i) => i.id))
    selectedIds.value = selectedIds.value.filter((id) => !pageIds.has(id))
  }
}

function toggleSelect(item) {
  const idx = selectedIds.value.indexOf(item.id)
  if (idx === -1) selectedIds.value.push(item.id)
  else selectedIds.value.splice(idx, 1)
}

function clearSelection() {
  selectedIds.value = []
}

/** 站内信接收人：需求提出方（submitter）。治理负责人通过「我的待治理清单」查看审核状态，不发站内信 */
function messageRecipientsOf(item) {
  const submitter = USERS.find((x) => x.name === item.submitter)
  return submitter ? [submitter.id] : ['user-super-1']
}

/** 审核入库：待审批 → 已入库，并回写入库需求清单状态，同时发送站内信 */
function approveItem(item) {
  approveWarehouse(item)
  syncInboundStatus(item)
  messageRecipientsOf(item).forEach((id) => sendMessage(id, 'approved', item.name))
}

/** 拒绝：待审批 → 已拒绝（记录原因）；高危漏洞软件加入黑名单，否则答疑联系管理员 */
function rejectItem(item, reason) {
  rejectWarehouse(item, reason)
  const type = (item.vulnCount || 0) > 0 ? 'blacklisted' : 'question'
  messageRecipientsOf(item).forEach((id) => sendMessage(id, type, item.name))
}

/* —— 二次确认（审核入库 / 拒绝） —— */
const confirmTarget = ref(null) // { items, action: 'approve' | 'reject', batch }
const rejectReasonInput = ref('')

function askApprove(item) {
  confirmTarget.value = { items: [item], action: 'approve', batch: false }
}
function askReject(item) {
  rejectReasonInput.value = ''
  confirmTarget.value = { items: [item], action: 'reject', batch: false }
}
/** 拒绝后重新审核入库：走审核通过流程 */
function askReapprove(item) {
  confirmTarget.value = { items: [item], action: 'approve', batch: false }
}
/** 批量审核入库 */
function askBatchApprove() {
  if (!selectedCount.value) return
  confirmTarget.value = { items: selectedItems.value, action: 'approve', batch: true }
}
/** 批量拒绝（仅对待审批生效，已拒绝的无需重复拒绝） */
function askBatchReject() {
  const items = selectedItems.value.filter((i) => i.warehouseStatus === '待审批')
  if (!items.length) return
  rejectReasonInput.value = ''
  confirmTarget.value = { items, action: 'reject', batch: true }
}
function cancelConfirm() {
  confirmTarget.value = null
  rejectReasonInput.value = ''
}
function confirmAction() {
  if (!confirmTarget.value) return
  const { items, action } = confirmTarget.value
  if (action === 'reject' && !rejectReasonInput.value.trim()) return
  if (action === 'approve') items.forEach((item) => approveItem(item))
  else items.forEach((item) => rejectItem(item, rejectReasonInput.value.trim()))
  confirmTarget.value = null
  rejectReasonInput.value = ''
  clearSelection()
}

/** 按软件名回写入库需求清单状态：该清单中任一软件被审核通过 → 清单标记已入库 */
function syncInboundStatus(item) {
  const list = getInboundRequests()
  list.forEach((r) => {
    if (r.status === '已入库') return
    const hit = (r.items || []).some((x) => x.name && x.name.toLowerCase() === (item.name || '').toLowerCase())
    if (hit) updateInboundStatus(r.id, '已入库')
  })
}
</script>

<style scoped>
.wav-page {
  padding: 8px 24px 32px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

/* 卡片 */
.wav-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
}
.wav-card-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
}
.wav-table-hd {
  border-bottom: none;
  padding-bottom: 12px;
}
.wav-table-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}
.wav-table-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.wav-selected-tip {
  font-size: 12px;
  font-weight: 600;
  color: #da203e;
}
/* 筛选信息卡 */
.wav-filter-toggle {
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
.wav-caret {
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #6b7280;
  transition: transform 0.2s;
}
.wav-caret.is-open {
  transform: rotate(180deg);
}
.wav-filter-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}
.wav-filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.wav-filter-body {
  padding: 16px 20px 20px;
}
.wav-filter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px 20px;
}
.wav-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.wav-label {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}
.wav-input {
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
.wav-input::placeholder {
  color: #9ca3af;
}
.wav-input:focus {
  border-color: #da203e;
  box-shadow: 0 0 0 2px rgba(218, 32, 62, 0.12);
}

/* 表格 */
.wav-table-wrap {
  overflow-x: auto;
  padding: 0 20px;
}
.wav-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.wav-table th,
.wav-table td {
  padding: 12px 10px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
  white-space: nowrap;
}
.wav-table th {
  font-weight: 500;
  color: #6b7280;
  background: #fafafa;
}
.wav-table tbody tr:hover {
  background: #fafafa;
}
/* 多选复选框列 */
.wav-th-chk,
.wav-td-chk {
  width: 40px;
  text-align: center;
}
.wav-th-chk input,
.wav-td-chk input {
  width: 16px;
  height: 16px;
  accent-color: #da203e;
  cursor: pointer;
}
.wav-td-chk input:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}
/* 确认弹窗：拒绝原因输入 */
.wav-confirm-sub {
  margin: 4px 0 6px;
  font-size: 12px;
  color: #6b7280;
  word-break: break-all;
}
.wav-confirm-reason {
  margin-top: 10px;
}
.wav-textarea {
  min-height: 76px;
  padding: 8px 12px;
  resize: vertical;
  line-height: 1.5;
  font-family: inherit;
}
.wav-required {
  margin-left: 2px;
  color: #da203e;
}
.wav-name {
  color: #111827;
  font-weight: 500;
}
/* 版本链接：点击跳转软件详情 */
.wav-version-link {
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  color: #2563eb;
  cursor: pointer;
  transition: color 0.12s;
}
.wav-version-link:hover {
  color: #da203e;
  text-decoration: underline;
}
.wav-empty {
  text-align: center;
  color: #9ca3af;
  padding: 24px 12px;
}
.wav-td-op {
  text-align: right;
}

/* 治理负责人 */
.wav-owner-name {
  font-weight: 600;
  color: #374151;
}

/* 漏洞数标签 */
.wav-vuln {
  display: inline-block;
  min-width: 24px;
  text-align: center;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  line-height: 18px;
}
.wav-vuln--none {
  color: #166534;
  background: #f0fdf4;
}
.wav-vuln--risk {
  color: #991b1b;
  background: #fef2f2;
}

/* 状态 / 评分 */
.wav-score {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
/* 评分列可点击 */
.wav-score--link {
  border: none;
  font-family: inherit;
  cursor: pointer;
  transition: filter 0.15s, opacity 0.15s;
}
.wav-score--link:hover {
  filter: brightness(0.92);
  opacity: 0.85;
}
.wav-score--ok {
  color: #16a34a;
  background: #f0fdf4;
}
.wav-score--bad {
  color: #dc2626;
  background: #fef2f2;
}
.wav-score--empty {
  color: #9ca3af;
  background: #f3f4f6;
}
.wav-status {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
.wav-status--待审批 {
  color: #b45309;
  background: #fef3c7;
  border: 1px solid #fde68a;
}
.wav-status--已入库 {
  color: #16a34a;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}
.wav-status--已拒绝 {
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
}
.wav-status--已作废 {
  color: #6b7280;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

/* 操作按钮（统一：白底红字文字按钮，语义靠 hover 区分） */
.wav-op {
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
.wav-op:hover {
  background: #fef2f2;
  border-color: #fecaca;
}
/* 审核入库：主操作，hover 红底白字突出 */
.wav-op--approve {
  font-weight: 600;
}
.wav-op--approve:hover {
  background: #da203e;
  color: #fff;
  border-color: #da203e;
}
/* 拒绝：危险操作，hover 深红底白字 */
.wav-op--danger {
  color: #dc2626;
}
.wav-op--danger:hover {
  background: #dc2626;
  color: #fff;
  border-color: #dc2626;
}
.wav-sep {
  margin: 0 6px;
  color: #e5e7eb;
  font-size: 12px;
  user-select: none;
}

/* 通用按钮 */
.wav-btn {
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
.wav-btn--primary {
  background: #da203e;
  color: #fff;
  border-color: #da203e;
}
.wav-btn--primary:hover {
  background: #c41c37;
  border-color: #c41c37;
}
.wav-btn--danger {
  background: #fff;
  color: #dc2626;
  border-color: #dc2626;
}
.wav-btn--danger:hover {
  background: #dc2626;
  color: #fff;
}
.wav-btn--outline {
  background: #fff;
  color: #374151;
  border-color: #d1d5db;
}
.wav-btn--outline:hover {
  border-color: #da203e;
  color: #da203e;
}

/* 页脚分页 */
.wav-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 20px 16px;
  border-top: 1px solid #f0f0f0;
}
.wav-total {
  font-size: 12px;
  color: #6b7280;
}
.wav-pager {
  display: flex;
  align-items: center;
  gap: 6px;
}
.wav-page-btn {
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
.wav-page-btn:hover:not(:disabled):not(.is-active) {
  border-color: #da203e;
  color: #da203e;
}
.wav-page-btn.is-active {
  background: #da203e;
  border-color: #da203e;
  color: #fff;
}
.wav-page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.wav-page-ellipsis {
  padding: 0 4px;
  color: #9ca3af;
  font-size: 13px;
  user-select: none;
}
.wav-page-size {
  margin-left: 4px;
}
.wav-page-select {
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

/* 弹窗 */
.wav-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(17, 24, 39, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.wav-modal {
  width: min(760px, 100%);
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

/* 二次确认弹窗：窄版 */
.wav-modal--sm {
  width: min(420px, 100%);
}

.wav-confirm-body {
  padding: 18px 20px 20px;
}

.wav-confirm-text {
  margin: 0 0 6px;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}

.wav-confirm-text strong {
  color: #111827;
}

.wav-confirm-hint {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.5;
}
.wav-confirm-hint--warn {
  color: #b45309;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 6px;
  padding: 8px 10px;
  margin-top: 8px;
}
.wav-confirm-hint--warn strong {
  color: #b91c1c;
}
.wav-modal-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}
.wav-modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}
.wav-modal-close {
  border: none;
  background: none;
  font-size: 16px;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
}
.wav-modal-close:hover {
  color: #dc2626;
}
.wav-modal-meta {
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
.wav-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.wav-muted {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
}
.wav-modal-ft {
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
