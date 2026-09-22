<template>
  <div class="org-list-page">
    <div class="org-list-header">
      <div class="org-list-hd-row">
        <div>
          <h1 class="org-list-title">组织管理</h1>
          <p class="org-list-subtitle">管理平台中所有组织的配置、成员、权限与版本火车</p>
        </div>
        <button type="button" class="org-create-btn" @click="openCreate">新建组织</button>
      </div>
      <div class="org-list-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="searchQuery" type="text" class="org-search-input" placeholder="搜索组织名称..." />
      </div>
    </div>

    <div class="org-grid">
      <div
        v-for="org in filteredOrgs"
        :key="org.id"
        class="org-card"
        @click="goOrgDetail(org.id)"
        role="button"
        :tabindex="0"
        @keydown.enter="goOrgDetail(org.id)"
      >
        <div
          class="org-card-avatar"
          :style="{ background: avatarBg(org.name) }"
        >{{ avatarLetter(org.name) }}</div>
        <div class="org-card-body">
          <h2 class="org-card-name">{{ org.name }}</h2>
          <p class="org-card-industry">{{ org.industry }}</p>
          <p class="org-card-desc">{{ org.description }}</p>
          <div class="org-card-meta">
            <span class="org-card-meta-item">
              <span class="org-card-meta-label">管理员</span>
              <span class="org-card-meta-value">{{ adminCountOf(org.id) }} 人</span>
            </span>
            <span class="org-card-meta-item">
              <span class="org-card-meta-label">成员</span>
              <span class="org-card-meta-value">{{ memberCountOf(org.id) }} 人</span>
            </span>
            <span class="org-card-meta-item">
              <span class="org-card-meta-label">创建时间</span>
              <span class="org-card-meta-value">{{ org.createdAt }}</span>
            </span>
          </div>
        </div>
        <div class="org-card-arrow" aria-hidden="true">→</div>
      </div>

      <div v-if="filteredOrgs.length === 0" class="org-empty">
        <div class="org-empty-art" aria-hidden="true">
          <svg width="64" height="64" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="#f3f4f6" stroke="#e5e7eb" stroke-width="1.2" d="M24 28h72v52H24z"/>
            <path fill="#fff" stroke="#e5e7eb" d="M32 36h20v8H32zM48 48h24v6H48zM32 58h40v6H32z"/>
            <circle cx="88" cy="40" r="4" fill="#fee2e2" stroke="#fecaca"/>
          </svg>
        </div>
        <p class="org-empty-text">未找到匹配的组织</p>
      </div>
    </div>

    <!-- 新建组织弹窗：建组织 + 可直接指定组织管理员 -->
    <Teleport to="body">
      <Transition name="org-fade">
        <div v-if="createOpen" class="org-overlay" @click.self="closeCreate">
          <div class="org-dialog">
            <header class="org-dialog-hd">
              <h3 class="org-dialog-title">新建组织</h3>
              <button type="button" class="org-dialog-close" @click="closeCreate">&times;</button>
            </header>

            <div class="org-dialog-body">
              <div class="org-field">
                <label class="org-field-label">组织名称 <span class="org-req">*</span></label>
                <input v-model.trim="createForm.name" type="text" class="org-field-input" placeholder="请输入组织全称" />
              </div>
              <div class="org-field">
                <label class="org-field-label">所属行业</label>
                <SearchSelect v-model="createForm.industry" class="org-field-input" :options="INDUSTRY_OPTIONS" />
              </div>
              <div class="org-field">
                <label class="org-field-label">组织管理员</label>
                <SearchSelect v-model="createForm.adminUserId" class="org-field-input" :options="adminCandidates" value-key="id" label-key="name" all-label="暂不指定" />
                <p class="org-field-hint">指定的账号将成为本组织的管理员（拥有组织最高权限）</p>
              </div>
              <div class="org-field org-field--full">
                <label class="org-field-label">组织简介</label>
                <textarea v-model.trim="createForm.description" class="org-field-textarea" rows="3" placeholder="选填，简要说明组织情况"></textarea>
              </div>
              <div class="org-field">
                <label class="org-field-label">联系邮箱</label>
                <input v-model.trim="createForm.contactEmail" type="email" class="org-field-input" placeholder="选填" />
              </div>
              <div class="org-field">
                <label class="org-field-label">联系电话</label>
                <input v-model.trim="createForm.contactPhone" type="tel" class="org-field-input" placeholder="选填" />
              </div>

              <p v-if="createMsg" class="org-create-msg" :class="{ 'is-error': createMsgError }">{{ createMsg }}</p>
            </div>

            <footer class="org-dialog-ft">
              <button type="button" class="org-btn" @click="closeCreate">取消</button>
              <button type="button" class="org-btn org-btn--primary" @click="doCreateOrg">创建组织</button>
            </footer>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getOrgAdminCount, getOrgMemberships, addOrgMember } from '../../data/orgMembershipData.js'
import { getOrgs, createOrg, INDUSTRY_OPTIONS } from '../../data/orgStore.js'
import { getAllAccounts } from '../../data/accountData.js'
import { getCurrentUsername } from '../../data/orgData.js'
import SearchSelect from '../../components/common/SearchSelect.vue'

/** 当前操作人标识（用户名）：留痕统一记用户名 */
const CURRENT_OPERATOR = getCurrentUsername()

const router = useRouter()
const searchQuery = ref('')

/** 全部组织：内置 + 平台管理员新建（见 orgStore） */
const orgs = ref(getOrgs())

/**
 * 管理员/成员人数从 (用户, 组织) 的组织身份统计（见 orgMembershipData），
 * 而不是 orgData 里静态的 adminIds/memberIds —— 否则任免后人数不会更新。
 */
function adminCountOf(orgId) {
  return getOrgAdminCount(orgId)
}

function memberCountOf(orgId) {
  return getOrgMemberships(orgId).filter((m) => m.orgRole === 'member').length
}

const filteredOrgs = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return orgs.value
  return orgs.value.filter((o) => o.name.toLowerCase().includes(q) || (o.industry || '').toLowerCase().includes(q))
})

/* ===== 新建组织 ===== */
const createOpen = ref(false)
const createMsg = ref('')
const createMsgError = ref(false)
const createForm = ref({
  name: '', industry: '金融', description: '', contactEmail: '', contactPhone: '', adminUserId: '',
})

/** 可选作组织管理员的账号（平台全部账号） */
const adminCandidates = computed(() => getAllAccounts().map((u) => ({
  id: u.id, name: u.name, source: u.accountSource,
})))

function openCreate() {
  createForm.value = { name: '', industry: '金融', description: '', contactEmail: '', contactPhone: '', adminUserId: '' }
  createMsg.value = ''
  createMsgError.value = false
  createOpen.value = true
}

function closeCreate() {
  createOpen.value = false
}

function doCreateOrg() {
  const f = createForm.value
  const res = createOrg({
    name: f.name, industry: f.industry, description: f.description,
    contactEmail: f.contactEmail, contactPhone: f.contactPhone,
    operator: CURRENT_OPERATOR,
  })
  if (!res.ok) {
    createMsgError.value = true
    createMsg.value = res.reason
    return
  }
  // 指定组织管理员：落库组织身份（admin）
  let adminNote = '（未指定管理员，可稍后在组织成员中设置）'
  if (f.adminUserId) {
    const acc = adminCandidates.value.find((u) => u.id === f.adminUserId)
    addOrgMember(f.adminUserId, res.org.id, 'admin', CURRENT_OPERATOR)
    adminNote = `，组织管理员：${acc?.name || f.adminUserId}`
  }
  orgs.value = getOrgs()
  createMsgError.value = false
  createMsg.value = `组织「${res.org.name}」已创建${adminNote}`
  createForm.value = { name: '', industry: '金融', description: '', contactEmail: '', contactPhone: '', adminUserId: '' }
  setTimeout(() => { createOpen.value = false }, 1200)
}

function goOrgDetail(orgId) {
  router.push({ name: 'org-detail', params: { orgId } })
}

/** 取组织名称首字符作为头像文字 */
function avatarLetter(name) {
  return name ? name.charAt(0) : '?'
}

/** 根据名称生成稳定的色板 */
const AVATAR_COLORS = [
  { bg: 'linear-gradient(135deg, #fef2f2, #fce4e4)', text: '#da203e' },
  { bg: 'linear-gradient(135deg, #eff6ff, #dbeafe)', text: '#2563eb' },
  { bg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', text: '#16a34a' },
  { bg: 'linear-gradient(135deg, #fefce8, #fef9c3)', text: '#ca8a04' },
  { bg: 'linear-gradient(135deg, #faf5ff, #f3e8ff)', text: '#9333ea' },
  { bg: 'linear-gradient(135deg, #fdf2f8, #fce7f3)', text: '#db2777' },
  { bg: 'linear-gradient(135deg, #ecfeff, #cffafe)', text: '#0891b2' },
  { bg: 'linear-gradient(135deg, #fff7ed, #ffedd5)', text: '#ea580c' },
]

function avatarBg(name) {
  if (!name) return AVATAR_COLORS[0].bg
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0
  }
  const idx = Math.abs(hash) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx].bg
}
</script>

<style scoped>
.org-list-page {
  max-width: 1100px;
}

.org-list-header {
  margin-bottom: 28px;
}

.org-list-title {
  margin: 0 0 4px;
  font-size: 24px;
  font-weight: 700;
  color: var(--admin-text, #111827);
}

.org-list-subtitle {
  margin: 0 0 18px;
  font-size: 14px;
  color: var(--admin-muted, #6b7280);
}

.org-list-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1px solid var(--admin-border, #e5e7eb);
  border-radius: 8px;
  background: var(--admin-card, #fff);
  max-width: 400px;
  color: #9ca3af;
}

.org-list-search:focus-within {
  border-color: var(--admin-primary, #da203e);
  box-shadow: 0 0 0 2px rgba(218, 32, 62, 0.1);
}

.org-search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  font-family: inherit;
  color: var(--admin-text, #374151);
  background: transparent;
}

.org-search-input::placeholder {
  color: #9ca3af;
}

.org-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 900px) {
  .org-grid {
    grid-template-columns: 1fr;
  }
}

.org-card {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  padding: 20px 22px;
  background: var(--admin-card, #fff);
  border: 1px solid var(--admin-border, #e5e7eb);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.org-card:hover {
  border-color: var(--admin-primary, #da203e);
  box-shadow: 0 4px 14px rgba(218, 32, 62, 0.08);
  transform: translateY(-2px);
}

.org-card:focus-visible {
  outline: 2px solid var(--admin-primary, #da203e);
  outline-offset: 2px;
}

.org-card-avatar {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.5);
}

.org-card-body {
  flex: 1;
  min-width: 0;
}

.org-card-name {
  margin: 0 0 2px;
  font-size: 17px;
  font-weight: 700;
  color: var(--admin-text, #111827);
}

.org-card-industry {
  margin: 0 0 8px;
  font-size: 12px;
  color: var(--admin-primary, #da203e);
  font-weight: 500;
}

.org-card-desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--admin-muted, #6b7280);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.org-card-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.org-card-meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.org-card-meta-label {
  color: #9ca3af;
}

.org-card-meta-value {
  color: var(--admin-text, #374151);
  font-weight: 600;
}

.org-card-arrow {
  flex-shrink: 0;
  align-self: center;
  font-size: 18px;
  color: #d1d5db;
  transition: color 0.2s, transform 0.2s;
}

.org-card:hover .org-card-arrow {
  color: var(--admin-primary, #da203e);
  transform: translateX(4px);
}

.org-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
}

.org-empty-art {
  margin-bottom: 12px;
  opacity: 0.5;
}

.org-empty-text {
  margin: 0;
  font-size: 14px;
  color: #9ca3af;
}

/* ===== 头部：标题 + 新建组织入口 ===== */
.org-list-hd-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.org-create-btn {
  flex-shrink: 0;
  height: 36px;
  padding: 0 18px;
  font-size: 14px;
  font-family: inherit;
  color: #fff;
  background: var(--admin-primary, #da203e);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}
.org-create-btn:hover { background: #c11b36; }

/* ===== 新建组织弹窗 ===== */
.org-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: rgba(15, 23, 42, 0.45);
}
.org-dialog {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 560px;
  max-height: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 16px 48px rgba(15, 23, 42, 0.2);
  overflow: hidden;
}
.org-dialog-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f1f3;
}
.org-dialog-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}
.org-dialog-close {
  padding: 0 4px;
  font-size: 22px;
  line-height: 1;
  color: #9ca3af;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s;
}
.org-dialog-close:hover { color: #4b5563; }

.org-dialog-body {
  flex: 1;
  overflow-y: auto;
  padding: 18px 20px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.org-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.org-field--full { grid-column: 1 / -1; }
.org-field-label { font-size: 13px; font-weight: 500; color: #374151; }
.org-req { color: var(--admin-primary, #da203e); }
.org-field-input {
  width: 100%;
  height: 34px;
  padding: 0 10px;
  font-size: 13px;
  font-family: inherit;
  color: #374151;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
}
.org-field-input:focus { border-color: var(--admin-primary, #da203e); }
.org-field-textarea {
  width: 100%;
  padding: 8px 10px;
  font-size: 13px;
  font-family: inherit;
  line-height: 1.6;
  color: #374151;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  outline: none;
  resize: vertical;
  box-sizing: border-box;
  transition: border-color 0.15s;
}
.org-field-textarea:focus { border-color: var(--admin-primary, #da203e); }
.org-field-hint { margin: 0; font-size: 12px; color: #9ca3af; }

.org-create-msg {
  grid-column: 1 / -1;
  margin: 0;
  padding: 9px 12px;
  font-size: 13px;
  color: #166534;
  background: #f0fdf4;
  border: 1px solid #dcfce7;
  border-radius: 6px;
}
.org-create-msg.is-error {
  color: #b91c1c;
  background: #fef2f2;
  border-color: #fecaca;
}

.org-dialog-ft {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid #f0f1f3;
}
.org-btn {
  height: 34px;
  padding: 0 16px;
  font-size: 13px;
  font-family: inherit;
  color: #374151;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}
.org-btn:hover { border-color: #9ca3af; background: #f9fafb; }
.org-btn--primary {
  color: #fff;
  background: var(--admin-primary, #da203e);
  border-color: var(--admin-primary, #da203e);
}
.org-btn--primary:hover { background: #c11b36; border-color: #c11b36; }

/* 弹窗淡入淡出 */
.org-fade-enter-active,
.org-fade-leave-active { transition: opacity 0.18s ease; }
.org-fade-enter-from,
.org-fade-leave-to { opacity: 0; }

@media (max-width: 600px) {
  .org-dialog-body { grid-template-columns: 1fr; }
}
</style>
