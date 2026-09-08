<template>
  <div class="settings-page">
    <div class="page-header">
      <div class="page-header-text">
        <h1 class="page-title">个人设置</h1>
      </div>
    </div>

    <!-- ========== 标签页导航 ========== -->
    <div class="settings-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="settings-tab"
        :class="{ 'is-active': activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="settings-card">
      <!-- ========== 个人信息 ========== -->
      <div v-if="activeTab === 'profile'" class="settings-form">
        <!-- 头像 -->
        <div class="form-row">
          <span class="form-label">头像</span>
          <div class="form-control">
            <div class="avatar-upload">
              <div class="avatar-preview">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <button type="button" class="btn btn-sm btn-ghost">上传头像</button>
            </div>
          </div>
        </div>

        <!-- 昵称 -->
        <div class="form-row">
          <span class="form-label">昵称 <span class="required">*</span></span>
          <div class="form-control">
            <div class="form-field-row">
              <input
                v-model="form.nickname"
                type="text"
                class="form-input"
                placeholder="请输入昵称"
              />
              <button type="button" class="btn-edit-icon" aria-label="编辑昵称" title="编辑">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 邮件 -->
        <div class="form-row">
          <span class="form-label">邮件 <span class="required">*</span></span>
          <div class="form-control">
            <div class="form-field-row">
              <input
                v-model="form.email"
                type="email"
                class="form-input"
                placeholder="请输入邮箱地址"
              />
              <button type="button" class="btn-edit-icon" aria-label="编辑邮箱" title="编辑">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 电话 -->
        <div class="form-row">
          <span class="form-label">电话 <span class="required">*</span></span>
          <div class="form-control">
            <div class="form-field-row">
              <input
                v-model="form.phone"
                type="tel"
                class="form-input"
                placeholder="请输入电话号码"
              />
              <button type="button" class="btn-edit-icon" aria-label="编辑电话" title="编辑">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 密码 -->
        <div class="form-row">
          <span class="form-label">密码</span>
          <div class="form-control">
            <button type="button" class="btn-link" @click="handleResetPwd">重置密码</button>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-primary" @click="handleSave">保存修改</button>
        </div>
      </div>

      <!-- ========== 我的治理清单 ========== -->
      <div v-if="activeTab === 'my-governance'" class="mg-card">
        <!-- 筛选信息 -->
        <header class="mg-card-hd">
          <button type="button" class="mg-filter-toggle" :aria-expanded="govFilterOpen" @click="govFilterOpen = !govFilterOpen">
            <span class="mg-caret" :class="{ 'is-open': govFilterOpen }" aria-hidden="true" />
            <span class="mg-filter-title">筛选信息</span>
          </button>
          <div class="mg-filter-actions">
            <button type="button" class="mg-btn mg-btn--outline" @click="clearGovFilter">清空</button>
          </div>
        </header>
        <div v-show="govFilterOpen" class="mg-filter-body">
          <div class="mg-filter-grid">
            <div class="mg-field">
              <label class="mg-label">软件名称</label>
              <input v-model.trim="govFilters.name" type="text" class="mg-input" placeholder="请输入软件名称" />
            </div>
            <div class="mg-field">
              <label class="mg-label">版本</label>
              <input v-model.trim="govFilters.version" type="text" class="mg-input" placeholder="请输入版本号" />
            </div>
            <div class="mg-field">
              <label class="mg-label">审核状态</label>
              <select v-model="govFilters.status" class="mg-input">
                <option value="">全部</option>
                <option value="待审批">待审批</option>
                <option value="已入库">已入库</option>
                <option value="已拒绝">已拒绝</option>
                <option value="已作废">已作废</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 数据表格（字段与软件治理最后一步一致） -->
        <div class="mg-table-wrap">
          <table class="mg-table">
            <thead>
              <tr>
                <th>软件名称</th>
                <th>版本</th>
                <th>软件地址</th>
                <th>治理负责人</th>
                <th>提交时间</th>
                <th>入库时间</th>
                <th>审核状态</th>
                <th>原因</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in govPaginated" :key="item.id">
                <td class="mg-name">{{ item.name }}</td>
                <td>
                  <button
                    v-if="item.warehouseStatus === '已入库'"
                    type="button"
                    class="mg-version-link"
                    @click="goSoftwareDetail(item)"
                  >{{ item.version }}</button>
                  <span v-else>{{ item.version }}</span>
                </td>
                <td class="mg-url" :title="item.repoUrl">{{ item.repoUrl || '—' }}</td>
                <td>
                  <span class="mg-owner-name">{{ item.govOwner || '—' }}</span>
                </td>
                <td>{{ item.createdAt || '—' }}</td>
                <td>{{ item.warehouseTime || '—' }}</td>
                <td><span class="mg-status" :class="'mg-status--' + item.warehouseStatus">{{ item.warehouseStatus }}</span></td>
                <td class="mg-reject-reason" :title="reasonOf(item)">{{ reasonOf(item) }}</td>
              </tr>
              <tr v-if="!govPaginated.length">
                <td colspan="8" class="mg-empty">暂无治理清单数据</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页器 -->
        <footer v-if="filteredItems.length" class="mg-footer">
          <span class="mg-total">共计 {{ filteredItems.length }} 条</span>
          <div class="mg-pager">
            <button type="button" class="mg-page-btn" :disabled="govPage <= 1" aria-label="上一页" @click="govPage = Math.max(1, govPage - 1)">‹</button>
            <template v-for="(p, idx) in govPageItems" :key="`${p}-${idx}`">
              <span v-if="p === '…'" class="mg-page-ellipsis">…</span>
              <button v-else type="button" class="mg-page-btn" :class="{ 'is-active': p === govPage }" @click="govPage = p">{{ p }}</button>
            </template>
            <button type="button" class="mg-page-btn" :disabled="govPage >= govTotalPages" aria-label="下一页" @click="govPage = Math.min(govTotalPages, govPage + 1)">›</button>
            <label class="mg-page-size">
              <span class="visually-hidden">每页条数</span>
              <select v-model.number="govPageSize" class="mg-page-select">
                <option :value="10">10条/页</option>
                <option :value="20">20条/页</option>
                <option :value="50">50条/页</option>
              </select>
            </label>
          </div>
        </footer>
      </div>

      <!-- ========== 订阅列表 ========== -->
      <div v-if="activeTab === 'subscription'" class="settings-empty">
        <p class="empty-text">暂无订阅列表内容</p>
      </div>

      <!-- ========== 预警信息 ========== -->
      <div v-if="activeTab === 'alert'" class="settings-empty">
        <p class="empty-text">暂无预警信息</p>
      </div>

      <!-- ========== 预警信息设置 ========== -->
      <div v-if="activeTab === 'alert-settings'" class="settings-empty">
        <p class="empty-text">暂无预警信息设置</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getInboundRequests } from '../../data/inboundRequests.js'
import { softwareList, voidedList } from '../../data/governanceStore.js'
import { USERS } from '../../data/orgData.js'

const route = useRoute()
const router = useRouter()

const activeTab = ref('profile')

const tabs = [
  { key: 'profile', label: '个人信息' },
  { key: 'my-governance', label: '我的治理清单' },
  { key: 'subscription', label: '订阅列表' },
  { key: 'alert', label: '预警信息' },
  { key: 'alert-settings', label: '预警信息设置' },
]

const form = reactive({
  nickname: '会饮篇',
  email: 'xluo6019@gmail.com',
  phone: '137****8230',
})

function handleResetPwd() {
  // 后续集成重置密码逻辑
}

function handleSave() {
  // 后续集成保存逻辑
}

/* —— 我的治理清单：当前用户上传的清单及其中软件数据情况 —— */
const currentUser = computed(() => USERS.find((u) => u.id === route.query.user) || USERS[0])
const isSuperAdmin = computed(() => currentUser.value?.role === 'superadmin')

const userOrgIds = computed(() => {
  const u = currentUser.value
  if (!u) return []
  if (Array.isArray(u.orgIds) && u.orgIds.length) return u.orgIds.filter(Boolean)
  if (u.orgId) return [u.orgId]
  return []
})

/** 当前用户相关的入库需求清单：平台管理员看全部，库主看本组织被分配的，成员看自己提交的 */
const myInboundLists = computed(() => {
  const list = getInboundRequests()
  if (isSuperAdmin.value) return list
  if (currentUser.value?.role === 'owner') {
    return list.filter((r) => r.assignedOrgId && userOrgIds.value.includes(r.assignedOrgId))
  }
  return list.filter((r) => (r.submitter || r.reporter) === currentUser.value?.name)
})

/** 当前用户治理的软件：治理列表 + 已作废记录（作废后从治理列表移除，记录保留展示） */
const myGovernanceItems = computed(() => {
  const merged = [...voidedList.value, ...softwareList.value]
  if (isSuperAdmin.value) return merged
  if (currentUser.value?.role === 'owner') {
    return merged.filter((i) => i.govOwner === currentUser.value.name)
  }
  return merged.filter((i) => (i.submitter || i.govOwner) === currentUser.value.name)
})

/* —— 筛选 —— */
const govFilterOpen = ref(true)
const govFilters = reactive({ name: '', version: '', status: '' })

const filteredItems = computed(() => {
  let list = myGovernanceItems.value
  const name = govFilters.name.trim().toLowerCase()
  const version = govFilters.version.trim().toLowerCase()
  if (name) list = list.filter((i) => i.name.toLowerCase().includes(name))
  if (version) list = list.filter((i) => (i.version || '').toLowerCase().includes(version))
  if (govFilters.status) list = list.filter((i) => i.warehouseStatus === govFilters.status)
  return list
})

function clearGovFilter() {
  govFilters.name = ''
  govFilters.version = ''
  govFilters.status = ''
  govPage.value = 1
}

/** 「原因」列：已拒绝→拒绝原因，已作废→作废原因，必须存在；缺失时显式警示 */
function reasonOf(item) {
  if (item.warehouseStatus === '已拒绝') return item.rejectReason || '未填写原因'
  if (item.warehouseStatus === '已作废') return item.voidReason || '未填写原因'
  return '—'
}

/** 已入库软件版本点击 → 软件详情 */
function goSoftwareDetail(item) {
  router.push({ name: 'software-detail', query: { name: item.name, version: item.version } })
}

/* —— 分页 —— */
const govPage = ref(1)
const govPageSize = ref(10)
const govTotalPages = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / govPageSize.value)))
const govPaginated = computed(() => {
  const start = (govPage.value - 1) * govPageSize.value
  return filteredItems.value.slice(start, start + govPageSize.value)
})
const govPageItems = computed(() => {
  const total = govTotalPages.value
  const cur = govPage.value
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
watch(govPageSize, () => { govPage.value = 1 })
</script>

<style scoped>
.settings-page {
  min-height: 100%;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--admin-text, #1a1a1a);
}

/* ========== 标签页 ========== */
.settings-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--admin-border, #e5e7eb);
  margin-bottom: 24px;
}

.settings-tab {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--admin-muted, #6b7280);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
  font-family: inherit;
  letter-spacing: 0.5px;
}

.settings-tab:hover {
  color: var(--admin-text, #1a1a1a);
}

.settings-tab.is-active {
  color: var(--admin-primary, #da203e);
  border-bottom-color: var(--admin-primary, #da203e);
}

/* ========== 卡片容器 ========== */
.settings-card {
  background: var(--admin-card, #fff);
  border: 1px solid var(--admin-border, #e5e7eb);
  border-radius: 12px;
  padding: 8px 28px 28px;
}

/* ========== 表单 ========== */
.settings-form {
  display: flex;
  flex-direction: column;
}

.form-row {
  display: flex;
  align-items: flex-start;
  padding: 20px 0;
  border-bottom: 1px solid var(--admin-border, #e5e7eb);
}

.form-row:last-of-type {
  border-bottom: none;
}

.form-label {
  width: 120px;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--admin-text, #1a1a1a);
  line-height: 36px;
}

.required {
  color: #dc2626;
  margin-left: 2px;
}

.form-control {
  flex: 1;
  min-width: 0;
}

.form-field-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-input {
  flex: 1;
  min-width: 0;
  max-width: 360px;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid var(--admin-border, #e5e7eb);
  border-radius: 6px;
  background: var(--admin-bg, #fafafa);
  color: var(--admin-text, #1a1a1a);
  font-family: inherit;
  transition: border-color 0.15s, background 0.15s;
}

.form-input:focus {
  outline: none;
  border-color: var(--admin-primary, #da203e);
  background: #fff;
}

/* ========== 编辑图标按钮 ========== */
.btn-edit-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--admin-border, #e5e7eb);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  color: #9ca3af;
  transition: color 0.15s, border-color 0.15s;
  flex-shrink: 0;
}

.btn-edit-icon:hover {
  color: var(--admin-primary, #da203e);
  border-color: var(--admin-primary, #da203e);
}

/* ========== 头像上传 ========== */
.avatar-upload {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-preview {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--admin-bg, #f3f4f6);
  border: 1px solid var(--admin-border, #e5e7eb);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  overflow: hidden;
}

/* ========== 按钮（复用项目已有 btn 体系） ========== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.btn-sm {
  padding: 6px 14px;
  font-size: 13px;
}

.btn-primary {
  background: var(--admin-primary, #da203e);
  color: #fff;
  border-color: var(--admin-primary, #da203e);
}

.btn-primary:hover {
  background: #b81830;
  border-color: #b81830;
}

.btn-ghost {
  background: transparent;
  color: var(--admin-muted, #6b7280);
  border-color: var(--admin-border, #e5e7eb);
}

.btn-ghost:hover {
  background: #f3f4f6;
  color: var(--admin-text, #1a1a1a);
}

/* ========== 链接样式按钮 ========== */
.btn-link {
  background: none;
  border: none;
  padding: 0;
  font-size: 14px;
  color: var(--admin-primary, #da203e);
  cursor: pointer;
  font-family: inherit;
  line-height: 36px;
  font-weight: 500;
}

.btn-link:hover {
  text-decoration: underline;
}

.form-actions {
  padding-top: 24px;
  display: flex;
  gap: 12px;
}

/* ========== 空状态 ========== */
.settings-empty {
  padding: 48px 0;
  text-align: center;
}

.empty-text {
  margin: 0;
  font-size: 14px;
  color: var(--admin-muted, #9ca3af);
}

/* ========== 我的治理清单（软件库风格） ========== */
.mg-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
.mg-card-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
}
.mg-filter-toggle {
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
.mg-caret {
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #6b7280;
  transition: transform 0.2s;
}
.mg-caret.is-open {
  transform: rotate(180deg);
}
.mg-filter-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}
.mg-filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.mg-btn {
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
.mg-btn--outline {
  background: #fff;
  color: #374151;
  border-color: #d1d5db;
}
.mg-btn--outline:hover {
  border-color: #da203e;
  color: #da203e;
}
.mg-filter-body {
  padding: 16px 20px 20px;
  border-bottom: 1px solid #f0f0f0;
}
.mg-filter-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px 20px;
}
.mg-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.mg-label {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}
.mg-input {
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
.mg-input::placeholder {
  color: #9ca3af;
}
.mg-input:focus {
  border-color: #da203e;
  box-shadow: 0 0 0 2px rgba(218, 32, 62, 0.12);
}
.mg-table-wrap {
  overflow-x: auto;
  padding: 0 20px;
}
.mg-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.mg-table th,
.mg-table td {
  padding: 12px 10px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: middle;
  white-space: nowrap;
}
.mg-table th {
  font-weight: 500;
  color: #6b7280;
  background: #fafafa;
}
.mg-table tbody tr:hover {
  background: #fafafa;
}
.mg-name {
  color: #111827;
  font-weight: 500;
}
.mg-url {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #2563eb;
  font-size: 12px;
}
.mg-version-link {
  border: none;
  background: none;
  padding: 0;
  font-family: inherit;
  font-size: inherit;
  color: #2563eb;
  cursor: pointer;
  text-decoration: underline;
}
.mg-version-link:hover {
  color: #1d4ed8;
}
.mg-empty {
  text-align: center;
  color: #9ca3af;
  padding: 24px 12px;
}
.mg-owner {
  display: flex;
  flex-direction: column;
  line-height: 1.35;
}
.mg-owner-name {
  font-weight: 600;
  color: #374151;
}
.mg-owner-org {
  font-size: 11px;
  color: #9ca3af;
}
.mg-vuln {
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
.mg-vuln--none {
  color: #166534;
  background: #f0fdf4;
}
.mg-vuln--risk {
  color: #991b1b;
  background: #fef2f2;
}
.mg-score {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.mg-score--ok {
  color: #16a34a;
  background: #f0fdf4;
}
.mg-score--bad {
  color: #dc2626;
  background: #fef2f2;
}
.mg-score--empty {
  color: #9ca3af;
  background: #f3f4f6;
}
.mg-status {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
.mg-status--待审批 {
  color: #b45309;
  background: #fef3c7;
  border: 1px solid #fde68a;
}
.mg-status--已入库 {
  color: #16a34a;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}
.mg-status--已拒绝 {
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
}
.mg-status--已作废 {
  color: #6b7280;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}
.mg-reject-reason {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #b91c1c;
  font-size: 12px;
}
.mg-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px 20px 16px;
  border-top: 1px solid #f0f0f0;
}
.mg-total {
  font-size: 12px;
  color: #6b7280;
}
.mg-pager {
  display: flex;
  align-items: center;
  gap: 6px;
}
.mg-page-btn {
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
.mg-page-btn:hover:not(:disabled):not(.is-active) {
  border-color: #da203e;
  color: #da203e;
}
.mg-page-btn.is-active {
  background: #da203e;
  border-color: #da203e;
  color: #fff;
}
.mg-page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.mg-page-ellipsis {
  padding: 0 4px;
  color: #9ca3af;
  font-size: 13px;
  user-select: none;
}
.mg-page-size {
  margin-left: 4px;
}
.mg-page-select {
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