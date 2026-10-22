<template>
  <div class="org-list-page">
    <div class="org-list-header">
      <div class="org-list-hd-row">
        <div>
          <h1 class="org-list-title">组织管理</h1>
          <p class="org-list-subtitle">管理您所属组织的配置、成员、权限与版本火车</p>
        </div>
        <!-- 新建组织：建完**创建者自己就是该组织的管理员**（见 doCreateOrg），
             故任何角色都可用 —— 组织管理是「我的组织」，在这里建组织等于为自己开一个组织。
             若要建一个「自己不属于」的组织（指定别人当管理员），
             走「平台权限设置 → 组织列表」的新建组织。 -->
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
        <!-- 删除组织：平台管理员可删任意；组织管理员仅可删自己任管理员的组织。
             内置组织（静态种子）一律不显示按钮。
             @click.stop 必需 —— 卡片整块有 @click 跳详情，不阻止冒泡会先跳走。 -->
        <button
          v-if="canDeleteOrg(org.id)"
          type="button"
          class="org-card-del"
          title="删除组织"
          aria-label="删除组织"
          @click.stop="openDelete(org)"
        >
          删除
        </button>
      </div>

      <div v-if="filteredOrgs.length === 0" class="org-empty">
        <div class="org-empty-art" aria-hidden="true">
          <svg width="64" height="64" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="#f3f4f6" stroke="#e5e7eb" stroke-width="1.2" d="M24 28h72v52H24z"/>
            <path fill="#fff" stroke="#e5e7eb" d="M32 36h20v8H32zM48 48h24v6H48zM32 58h40v6H32z"/>
            <circle cx="88" cy="40" r="4" fill="#fee2e2" stroke="#fecaca"/>
          </svg>
        </div>
        <!-- 区分两种空：搜索无结果 / 本就不属于任何组织（后者是权限过滤的结果，需说明原因） -->
        <p class="org-empty-text">
          {{ searchQuery.trim() ? '未找到匹配的组织' : '您尚未加入任何组织' }}
        </p>
        <p v-if="!searchQuery.trim()" class="org-empty-sub">
          您可以点右上角「新建组织」为自己创建一个组织；加入他人组织需由该组织管理员邀请
        </p>
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

              <!-- 无需指定组织管理员：创建者本人即为该组织管理员（见 doCreateOrg）。
                   若要创建「自己不属于」的组织并指定他人当管理员，
                   请走「平台权限设置 → 组织列表」的新建组织。 -->
              <p class="org-field-hint org-field-hint--full">
                创建后<strong>您将成为该组织的管理员</strong>。若需创建由他人管理的组织，请前往「平台权限设置 → 组织列表」。
              </p>

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
    <!-- 删除组织二次确认（仅平台管理员可触发） -->
    <Teleport to="body">
      <Transition name="org-fade">
        <div v-if="deleteTarget" class="org-overlay" @click.self="closeDelete">
          <div class="org-dialog org-dialog--sm">
            <header class="org-dialog-hd">
              <h3 class="org-dialog-title">删除组织</h3>
              <button type="button" class="org-dialog-close" @click="closeDelete">&times;</button>
            </header>

            <div class="org-dialog-body">
              <p class="org-del-warn">
                确定要删除组织「<b>{{ deleteTarget.name }}</b>」吗？
              </p>
              <ul class="org-del-list">
                <li>该组织的成员关系将一并清除，相关人员会失去此组织的权限</li>
                <li>此操作不可恢复，请先确认组织内已无需要保留的成员与版本火车</li>
              </ul>
              <p v-if="deleteMsg" class="org-create-msg is-error">{{ deleteMsg }}</p>
            </div>

            <footer class="org-dialog-ft">
              <button type="button" class="org-btn" @click="closeDelete">取消</button>
              <button type="button" class="org-btn org-btn--danger" @click="doDeleteOrg">确认删除</button>
            </footer>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// 删除组织的权限判定 + 级联清理已收敛到 dissolveOrg，本页不再直接动成员关系
import { getOrgAdminCount, getOrgMemberships, getMemberships, getMembership, addOrgMember, dissolveOrg } from '../../data/orgMembershipData.js'
import { getOrgs, createOrg, deleteOrgRaw, INDUSTRY_OPTIONS } from '../../data/orgStore.js'
import { USERS, ORGS } from '../../data/orgData.js'
import SearchSelect from '../../components/common/SearchSelect.vue'

const route = useRoute()
const router = useRouter()
const searchQuery = ref('')

/**
 * 当前用户：与侧边栏一致，走 route.query.user 演示切换（默认 USERS[0] = 平台管理员）。
 * 注意**不能**用 orgData 的 getCurrentUser() —— 那个读的是写死的 CURRENT_USER_ID，
 * 演示切到 ?user=user-mem-1 时本页仍会当成平台管理员，
 * 导致过滤失效、删除按钮越权显示。
 */
const currentUser = computed(() => USERS.find((u) => u.id === route.query.user) || USERS[0])
const currentUserId = computed(() => currentUser.value?.id)
/** 当前操作人标识（用户名）：留痕统一记用户名 */
const currentOperator = computed(() => currentUser.value?.username || currentUser.value?.name || '系统')

/**
 * 组织数据版本号（响应式）。
 * getOrgs / getMemberships 都直接读 localStorage，属**非响应式**数据源 ——
 * 增删组织或成员后必须递增本计数器，下面依赖它们的 computed 才会重新求值。
 */
const orgVersion = ref(0)

/** 当前用户所属的组织 id 集合（决定非平台角色能看到哪些组织） */
const myOrgIds = computed(() => {
  void orgVersion.value // 显式依赖：成员变更后触发重算
  return getMemberships()
    .filter((m) => m.userId === currentUserId.value)
    .map((m) => m.orgId)
})

/**
 * 可见组织：**只包含当前用户所属的组织**（内置 + 平台新建，见 orgStore）。
 *
 * 本页定位是「我的组织列表」，不做任何角色的全量豁免 ——
 * 平台管理员不属于任何组织时，这里就是空的（查看全部组织请去
 * 「平台权限设置 → 组织列表」）。
 * 这既符合「组织管理 = 看所在组织」的定位，也避免本页变成全平台组织名录，
 * 让任何成员都能看到别家组织的成员与配置。
 */
const orgs = computed(() => {
  void orgVersion.value
  return getOrgs().filter((o) => myOrgIds.value.includes(o.id))
})

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

/* ===== 新建组织 =====
   本页（「我的组织」）建组织 = 为自己开一个组织，故创建者本人直接成为该组织管理员，
   无需、也不应再选「组织管理员」—— 若在这里把管理员指定给别人，
   创建者自己就不属于该组织，那这个组织马上就会从本页列表里消失。
   需要「创建者不属于该组织、由他人管理」的场景，走平台权限设置的「组织列表」。 */
const createOpen = ref(false)
const createMsg = ref('')
const createMsgError = ref(false)
const createForm = ref({
  name: '', industry: '金融', description: '', contactEmail: '', contactPhone: '',
})

function openCreate() {
  createForm.value = { name: '', industry: '金融', description: '', contactEmail: '', contactPhone: '' }
  createMsg.value = ''
  createMsgError.value = false
  createOpen.value = true
}

function closeCreate() {
  createOpen.value = false
}

function doCreateOrg() {
  const f = createForm.value
  if (!f.name) {
    createMsgError.value = true
    createMsg.value = '请填写组织名称'
    return
  }
  const res = createOrg({
    name: f.name, industry: f.industry, description: f.description,
    contactEmail: f.contactEmail, contactPhone: f.contactPhone,
    operator: currentOperator.value,
    // 记录创建者角色快照：本页任何角色都能建组织，需区分是否平台管理员所建
    operatorId: currentUserId.value,
  })
  if (!res.ok) {
    createMsgError.value = true
    createMsg.value = res.reason
    return
  }
  // 创建者本人成为该组织的管理员：新建组织必须有一名管理员，
  // 而本页是「我的组织」，创建者就是唯一确定的管理员人选。
  const addRes = addOrgMember(currentUserId.value, res.org.id, 'admin', currentOperator.value)
  if (!addRes.ok) {
    /**
     * 组织已建但管理员没落库 → 回滚这次创建。
     * 否则会留下「没有任何管理员」的组织（违反「新建组织必须有一名管理员」），
     * 且不检查返回值时会提示创建成功 —— 属静默失败，实测复现过。
     * 用 deleteOrgRaw 而非 dissolveOrg：这是刚发起创建者的补偿操作，
     * 不应再被权限口径二次拦截（否则回滚会失败、静默留残）。
     */
    deleteOrgRaw(res.org.id)
    createMsgError.value = true
    createMsg.value = `创建失败：${addRes.reason || '组织管理员未能加入'}（已回滚，未创建组织）`
    return
  }
  orgVersion.value += 1
  createMsgError.value = false
  createMsg.value = `组织「${res.org.name}」已创建，您是组织管理员`
  createForm.value = { name: '', industry: '金融', description: '', contactEmail: '', contactPhone: '', adminUserId: '' }
  setTimeout(() => { createOpen.value = false }, 1200)
}

function goOrgDetail(orgId) {
  router.push({ name: 'org-detail', params: { orgId } })
}

/* ===== 删除组织 =====
   权限：平台管理员可删任意；组织管理员可删**自己在该组织中为管理员**的组织。
   级联清理（成员关系）由数据层 dissolveOrg 内部完成 ——
   orgMembershipData 已 import orgStore，编排逻辑必须放在 orgMembershipData 一侧，
   否则 orgStore 反向引用会形成循环依赖。 */
const deleteTarget = ref(null)
const deleteMsg = ref('')
const deleteMsgError = ref(false)

/** 该组织是否为内置组织（内置不可删，与数据层校验一致，用于隐藏按钮） */
function isBuiltinOrg(orgId) {
  return ORGS.some((o) => o.id === orgId)
}

/**
 * 当前用户能否删除该组织（决定按钮是否显示）。
 *
 * 口径必须与数据层 dissolveOrg **完全一致**：仅「自己在该组织中任管理员」可删。
 * 本页**不给平台管理员任何全局豁免** —— 否则会出现「按钮给了、点了被拒」
 * 的误导（实测：平台管理员兼任某组织普通成员时，按钮可见但数据层返回
 * 「仅组织管理员可删除本组织」）。用户已明确本页口径为「只删自己任组织管理员的」。
 *
 * 删不了的组织，自有其去处：内置组织不可删；成员建的组织由其组织管理员在本页删；
 * 平台级删除（含「平台管理员创建的组织」）在「平台权限设置 → 组织列表」。
 */
function canDeleteOrg(orgId) {
  if (isBuiltinOrg(orgId)) return false
  return getMembership(currentUserId.value, orgId)?.orgRole === 'admin'
}

/** 打开删除确认（阻止卡片跳转由模板里的 @click.stop 负责） */
function openDelete(org) {
  deleteTarget.value = org
  deleteMsg.value = ''
  deleteMsgError.value = false
}

function closeDelete() {
  deleteTarget.value = null
  deleteMsg.value = ''
}

/** 确认删除：权限判定 + 级联清理 + 删除组织，均由数据层 dissolveOrg 完成 */
function doDeleteOrg() {
  const org = deleteTarget.value
  if (!org) return
  const res = dissolveOrg(org.id, currentUserId.value)
  if (!res.ok) {
    deleteMsgError.value = true
    deleteMsg.value = res.reason || '删除失败'
    return
  }
  orgVersion.value += 1
  closeDelete()
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

/* 卡片上的删除按钮：默认低调，悬停才显红，避免与「进入详情」争夺注意力 */
.org-card-del {
  position: absolute;
  right: 14px;
  bottom: 14px;
  padding: 3px 9px;
  font-size: 12px;
  font-family: inherit;
  color: #9ca3af;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s, color 0.15s, border-color 0.15s, background 0.15s;
}
/* 悬停卡片或按钮本身时显现（键盘聚焦也要能看见，故含 :focus-visible） */
.org-card:hover .org-card-del,
.org-card-del:focus-visible {
  opacity: 1;
}
.org-card-del:hover,
.org-card-del:focus-visible {
  color: #dc2626;
  border-color: #fca5a5;
  background: #fef2f2;
  outline: none;
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
/* 空态补充说明：解释「为何看不到组织」（权限过滤的结果，不是故障） */
.org-empty-sub {
  max-width: 420px;
  margin: 8px auto 0;
  font-size: 12.5px;
  line-height: 1.6;
  color: #c0c6cf;
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
/* 跨两列的说明文字（如「创建后您将成为该组织的管理员」） */
.org-field-hint--full { grid-column: 1 / -1; line-height: 1.6; }
.org-field-hint--full strong { color: #374151; }

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
/* 危险操作按钮（删除组织确认） */
.org-btn--danger {
  color: #fff;
  background: #dc2626;
  border-color: #dc2626;
}
.org-btn--danger:hover { background: #b91c1c; border-color: #b91c1c; }
/* 删除确认弹窗收窄：内容比建组织表单少得多 */
.org-dialog--sm { max-width: 440px; }
.org-del-warn {
  margin: 0 0 10px;
  font-size: 14px;
  line-height: 1.6;
  color: #111827;
}
.org-del-warn b { color: #dc2626; }
.org-del-list {
  margin: 0;
  padding-left: 18px;
  font-size: 12.5px;
  line-height: 1.75;
  color: #6b7280;
}

/* 弹窗淡入淡出 */
.org-fade-enter-active,
.org-fade-leave-active { transition: opacity 0.18s ease; }
.org-fade-enter-from,
.org-fade-leave-to { opacity: 0; }

@media (max-width: 600px) {
  .org-dialog-body { grid-template-columns: 1fr; }
}
</style>
