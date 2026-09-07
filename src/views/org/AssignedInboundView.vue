<template>
  <div class="ai-page">
    <!-- 流程提示 -->
    <div class="ai-tip">
      <span class="ai-tip-title">治理流程</span>
      <span>平台管理员分配清单给您后，请下载清单并参照软件治理的导入模板补全信息，维护完成后在「软件治理」第一步导入，治理结束后提交平台审批入库。</span>
    </div>

    <!-- 演示视角切换 -->
    <div class="ai-view-switch">
      <span class="ai-view-label">演示视角：</span>
      <select v-model="demoUserId" class="ai-view-select">
        <option v-for="u in adminUsers" :key="u.id" :value="u.id">{{ u.name }}（{{ orgNameOf(u) }}）</option>
        <option v-for="u in superUsers" :key="u.id" :value="u.id">{{ u.name }}（全部）</option>
      </select>
    </div>

    <!-- 列表 -->
    <section class="ai-card">
      <header class="ai-card-hd">
        <h2 class="ai-card-title">分配给我的清单</h2>
        <span class="ai-card-badge">共 {{ myList.length }} 条</span>
      </header>
      <div class="ai-table-wrap">
        <table class="ai-table">
          <thead>
            <tr>
              <th>反馈组织</th>
              <th>反馈人</th>
              <th>联系方式</th>
              <th>清单文件</th>
              <th>软件条数</th>
              <th>分配时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in myList" :key="r.id">
              <td class="ai-name">{{ r.org }}</td>
              <td>{{ r.reporter }}</td>
              <td>{{ r.contact }}</td>
              <td class="ai-file" :title="r.fileName">{{ r.fileName }}</td>
              <td>{{ r.itemCount }} 条</td>
              <td>{{ r.assignedAt || '—' }}</td>
              <td>
                <span class="ai-status" :class="'ai-status--' + r.status">{{ r.status }}</span>
              </td>
              <td>
                <button type="button" class="ai-op" @click="openDetail(r)">查看详情</button>
                <button type="button" class="ai-op" @click="downloadOriginal(r)">下载原清单</button>
                <button type="button" class="ai-op ai-op--primary" @click="goGovernance(r)">去治理</button>
              </td>
            </tr>
            <tr v-if="!myList.length">
              <td colspan="8" class="ai-empty">暂无分配给您的清单</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 查看详情弹窗（解析后的四列表格 + 分页） -->
    <div v-if="detailTarget" class="ai-overlay" @click.self="closeDetail">
      <div class="ai-modal" role="dialog" aria-modal="true" aria-labelledby="ai-modal-title">
        <header class="ai-modal-hd">
          <h3 id="ai-modal-title" class="ai-modal-title">{{ detailTarget.org }} · 入库需求清单</h3>
          <button type="button" class="ai-modal-close" aria-label="关闭" @click="closeDetail">✕</button>
        </header>
        <div class="ai-modal-meta">
          <span>反馈人：{{ detailTarget.reporter }}</span>
          <span>联系方式：{{ detailTarget.contact }}</span>
          <span>清单文件：{{ detailTarget.fileName }}</span>
          <span>提交时间：{{ detailTarget.createdAt }}</span>
        </div>
        <div class="ai-table-wrap ai-modal-table">
          <table class="ai-table">
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
              <tr v-for="(row, i) in detailPagedItems" :key="i">
                <td class="ai-table-num">{{ (detailPage - 1) * detailPageSize + i + 1 }}</td>
                <td class="ai-name">{{ row.name }}</td>
                <td>{{ row.version }}</td>
                <td class="ai-cell-ellipsis" :title="row.url">{{ row.url }}</td>
                <td>{{ row.scene }}</td>
              </tr>
              <tr v-if="!detailTarget.items.length">
                <td colspan="5" class="ai-empty">该清单无解析数据</td>
              </tr>
            </tbody>
          </table>
        </div>
        <footer v-if="detailTarget.items.length" class="ai-modal-pager">
          <span class="ai-total">共 {{ detailTarget.items.length }} 条</span>
          <div class="ai-pager">
            <button type="button" class="ai-page-btn" :disabled="detailPage <= 1" aria-label="上一页" @click="goDetailPage(detailPage - 1)">‹</button>
            <template v-for="(p, idx) in detailPageItems" :key="`${p}-${idx}`">
              <span v-if="p === '…'" class="ai-page-ellipsis">…</span>
              <button v-else type="button" class="ai-page-btn" :class="{ 'is-active': p === detailPage }" @click="goDetailPage(p)">{{ p }}</button>
            </template>
            <button type="button" class="ai-page-btn" :disabled="detailPage >= detailPageCount" aria-label="下一页" @click="goDetailPage(detailPage + 1)">›</button>
            <label class="ai-page-size">
              <span class="visually-hidden">每页条数</span>
              <select v-model.number="detailPageSize" class="ai-page-select">
                <option :value="5">5条/页</option>
                <option :value="10">10条/页</option>
                <option :value="20">20条/页</option>
              </select>
            </label>
          </div>
        </footer>
        <footer class="ai-modal-ft">
          <button type="button" class="ai-btn ai-btn--primary" @click="goGovernance(detailTarget)">去治理</button>
          <button type="button" class="ai-btn ai-btn--outline" @click="closeDetail">关闭</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getInboundRequests } from '../../data/inboundRequests.js'
import { USERS, ORGS, getOrgById, getCurrentUser } from '../../data/orgData.js'

const router = useRouter()

/** 演示：库主（owner）视角切换（默认当前登录用户） */
const currentUser = getCurrentUser()
const adminUsers = USERS.filter((u) => u.role === 'owner')
const superUsers = USERS.filter((u) => u.role === 'superadmin')
const demoUserId = ref(currentUser?.id || adminUsers[0]?.id || '')
const demoUser = computed(() => USERS.find((u) => u.id === demoUserId.value))

function orgNameOf(u) {
  const orgId = u.orgIds?.[0] || u.orgId
  const org = getOrgById(orgId)
  return org ? org.name : '未分配组织'
}

/** 当前视角用户所属组织 ID 集合 */
const demoOrgIds = computed(() => {
  const u = demoUser.value
  if (!u) return []
  if (Array.isArray(u.orgIds) && u.orgIds.length) return u.orgIds.filter(Boolean)
  if (u.orgId) return [u.orgId]
  return []
})

const isSuper = computed(() => demoUser.value?.role === 'superadmin')

/** 分配给我的清单：库主看本组织被分配的；平台管理员看全部已分配 */
const myList = computed(() => {
  const list = getInboundRequests()
  if (isSuper.value) {
    return list.filter((r) => r.assignedOrgId && r.status !== '待分配')
  }
  return list.filter((r) => r.assignedOrgId && demoOrgIds.value.includes(r.assignedOrgId))
})

/* —— 查看详情弹窗分页 —— */
const detailTarget = ref(null)
const detailPage = ref(1)
const detailPageSize = ref(5)

const detailPageCount = computed(() => {
  const n = detailTarget.value?.items?.length || 0
  return Math.max(1, Math.ceil(n / detailPageSize.value))
})

const detailPagedItems = computed(() => {
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

/** 下载原清单：导出四列 CSV（UTF-8 BOM，Excel 可直接打开） */
function downloadOriginal(r) {
  const header = ['开源软件名称', '版本号', '开源网站地址', '主要应用场景']
  const lines = [header.join(',')]
  r.items.forEach((row) => {
    lines.push([row.name, row.version, row.url, row.scene].map((cell) => {
      const s = String(cell == null ? '' : cell)
      return `"${s.replace(/"/g, '""')}"`
    }).join(','))
  })
  const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${r.org}-入库需求清单-${(r.createdAt || '').replace(/[: ]/g, '-')}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(a.href)
}

/** 去治理：跳转软件治理页 */
function goGovernance(r) {
  router.push({ name: 'admin-gov' })
}
</script>

<style scoped>
.ai-page {
  padding: 8px 24px 32px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

/* 流程提示条 */
.ai-tip {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 10px 14px;
  margin-bottom: 14px;
  background: linear-gradient(135deg, #fffdf7, #fef9ef);
  border: 1px solid #fde68a;
  border-radius: 10px;
  font-size: 12px;
  color: #6b7280;
}
.ai-tip-title {
  font-weight: 700;
  color: #b45309;
  flex-shrink: 0;
}

/* 演示视角切换 */
.ai-view-switch {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  font-size: 13px;
  color: #374151;
}
.ai-view-label {
  font-weight: 600;
}
.ai-view-select {
  height: 30px;
  padding: 0 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  color: #374151;
  background: #fff;
  cursor: pointer;
  outline: none;
}
.ai-view-select:focus {
  border-color: #da203e;
}

/* 卡片 */
.ai-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.ai-card-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
}
.ai-card-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}
.ai-card-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 99px;
  background: #f3f4f6;
  color: #6b7280;
}

/* 表格 */
.ai-table-wrap {
  overflow-x: auto;
  padding: 0 20px;
}
.ai-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.ai-table th,
.ai-table td {
  padding: 12px 10px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
  white-space: nowrap;
}
.ai-table th {
  font-weight: 500;
  color: #6b7280;
  background: #fafafa;
}
.ai-table tbody tr:hover {
  background: #fafafa;
}
.ai-name {
  color: #111827;
  font-weight: 500;
}
.ai-file {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ai-cell-ellipsis {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ai-table-num {
  color: #9ca3af;
}
.ai-empty {
  text-align: center;
  color: #9ca3af;
  padding: 24px 12px;
}

/* 状态 */
.ai-status {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
.ai-status--已分配 {
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}
.ai-status--治理中 {
  color: #b45309;
  background: #fef3c7;
  border: 1px solid #fde68a;
}
.ai-status--待入库 {
  color: #7c3aed;
  background: #f5f3ff;
  border: 1px solid #ddd6fe;
}
.ai-status--已入库 {
  color: #16a34a;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

/* 操作按钮 */
.ai-op {
  padding: 4px 12px;
  margin-right: 6px;
  border: 0 solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  color: #da203e;
  cursor: pointer;
  transition: all 0.15s;
}
.ai-op:hover {
  background: #fef2f2;
  border-color: #fecaca;
}
.ai-op--primary {
  background: #da203e;
  color: #fff;
}
.ai-op--primary:hover {
  background: #c01e38;
  color: #fff;
}

/* 按钮 */
.ai-btn {
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
.ai-btn--primary {
  background: #da203e;
  color: #fff;
  border-color: #da203e;
}
.ai-btn--primary:hover {
  background: #c41c37;
  border-color: #c41c37;
}
.ai-btn--outline {
  background: #fff;
  color: #374151;
  border-color: #d1d5db;
}
.ai-btn--outline:hover {
  border-color: #da203e;
  color: #da203e;
}

/* 分页 */
.ai-total {
  font-size: 12px;
  color: #6b7280;
}
.ai-pager {
  display: flex;
  align-items: center;
  gap: 6px;
}
.ai-page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: #fff;
  color: #374151;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}
.ai-page-btn:hover:not(:disabled):not(.is-active) {
  border-color: #da203e;
  color: #da203e;
}
.ai-page-btn.is-active {
  background: #da203e;
  border-color: #da203e;
  color: #fff;
}
.ai-page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.ai-page-ellipsis {
  padding: 0 4px;
  color: #9ca3af;
  font-size: 12px;
  user-select: none;
}
.ai-page-size {
  margin-left: 4px;
}
.ai-page-select {
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
.ai-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(17, 24, 39, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.ai-modal {
  width: min(860px, 100%);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}
.ai-modal-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}
.ai-modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}
.ai-modal-close {
  border: none;
  background: none;
  font-size: 16px;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
}
.ai-modal-close:hover {
  color: #dc2626;
}
.ai-modal-meta {
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
.ai-modal-table {
  flex: 1;
  overflow: auto;
  padding: 4px 20px;
}
.ai-modal-pager {
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
.ai-modal-ft {
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
