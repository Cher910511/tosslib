<template>
  <div class="org-tab-content">
    <div class="org-tab-header">
      <h2 class="org-tab-title">组织成员</h2>
      <span class="org-tab-count">{{ filteredMembers.length }} 人</span>
      <button type="button" class="org-invite-btn" @click="toggleInvite">
        {{ inviteOpen ? '收起' : '邀请成员' }}
      </button>
    </div>

    <!-- 邀请成员：生成邀请链接，被邀请人自助注册后自动加入本组织 -->
    <section v-if="inviteOpen" class="org-invite-panel">
      <p class="org-invite-tip">
        生成邀请链接后发给被邀请人，对方点开填写资料即可自助注册，并自动加入
        <strong>{{ org.name }}</strong>，无需平台内部人员代建账号。
      </p>
      <div class="org-invite-form">
        <div class="org-invite-field">
          <label class="org-invite-label">组织内角色</label>
          <SearchSelect v-model="inviteRole" class="org-invite-select" :options="INVITE_ROLE_OPTIONS" />
        </div>
        <div class="org-invite-field">
          <label class="org-invite-label">有效期</label>
          <SearchSelect v-model="inviteExpireDays" class="org-invite-select" :options="EXPIRE_OPTIONS" number />
        </div>
        <div class="org-invite-field">
          <label class="org-invite-label">可使用次数</label>
          <SearchSelect v-model="inviteMaxUses" class="org-invite-select" :options="USE_OPTIONS" number />
        </div>
        <button type="button" class="org-invite-generate" @click="generateInvite">生成邀请链接</button>
      </div>

      <div v-if="lastInvite" class="org-invite-result">
        <input :value="buildInviteUrl(lastInvite.token)" type="text" class="org-invite-input" readonly />
        <button type="button" class="org-invite-copy" @click="copyInviteLink(lastInvite.token)">复制链接</button>
        <span class="org-invite-note">{{ inviteNote }}</span>
      </div>
    </section>

    <div class="org-member-search">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input v-model="searchQuery" type="text" class="org-member-input" placeholder="搜索成员姓名..." />
    </div>

    <p v-if="tip" class="org-member-tip" :class="{ 'is-error': tipError }">{{ tip }}</p>

    <div class="org-member-grid">
      <div v-for="user in filteredMembers" :key="user.userId" class="org-member-card">
        <img class="org-member-avatar" :src="avatarUrl(user)" :alt="user.name" />
        <div class="org-member-body">
          <span class="org-member-name">{{ user.name }}</span>
          <span class="org-member-role" :class="'org-member-role--' + user.orgRole">
            {{ orgRoleName(user.orgRole) }}
          </span>
          <span v-if="isLastAdmin(user.userId, org.id)" class="org-member-flag">唯一管理员</span>
        </div>
        <div class="org-member-actions">
          <SearchSelect
            class="org-member-select"
            :model-value="user.orgRole"
            :title="isLastAdmin(user.userId, org.id) ? '组织仅剩一名管理员，不可取消其身份（可先转移给其他成员）' : '设置组织身份'"
            :options="ORG_ROLES"
            value-key="id"
            label-key="name"
            @change="changeOrgRole(user, $event)"
          />
          <button type="button" class="org-member-btn" title="编辑角色"></button>
          <button type="button" class="org-member-btn org-member-btn--danger" title="移除成员">×</button>
        </div>
      </div>

      <div v-if="filteredMembers.length === 0" class="org-member-empty">
        <p class="org-member-empty-text">暂无成员</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  ORG_ROLES,
  orgRoleName,
  getOrgMemberships,
  setOrgRole,
  isLastAdmin,
} from '../../../data/orgMembershipData.js'
import {
  EXPIRE_OPTIONS,
  USE_OPTIONS,
  createInvite,
  buildInviteUrl,
} from '../../../data/inviteData.js'
import { avatarUrl } from '../../../utils/avatar.js'
import SearchSelect from '../../../components/common/SearchSelect.vue'

const props = defineProps({ org: { type: Object, required: true } })
const searchQuery = ref('')

/** 身份变更触发器：getOrgMemberships 读的是 localStorage（非响应式），需手动触发重算 */
const version = ref(0)

/**
 * 组织成员列表：以 (用户, 组织) 的组织身份为准（见 orgMembershipData）。
 * 同一成员在不同组织可有不同身份，故此处只展示本组织内的身份。
 */
const allMembers = computed(() => {
  void version.value
  return getOrgMemberships(props.org.id)
})

const filteredMembers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return allMembers.value
  return allMembers.value.filter((m) => m.name.toLowerCase().includes(q))
})

/* ===== 组织身份任免（依据《成员权限》规则校验） ===== */
const tip = ref('')
const tipError = ref(false)
let tipTimer = null
function showTip(text, isError = false) {
  tip.value = text
  tipError.value = isError
  if (tipTimer) clearTimeout(tipTimer)
  tipTimer = setTimeout(() => { tip.value = '' }, 4000)
}

/** 切换成员的组织身份：不通过则给出原因（下拉为单向绑定，失败时数据未变即保持原值） */
function changeOrgRole(member, nextRole) {
  const res = setOrgRole(member.userId, props.org.id, nextRole, '组织管理员')
  if (!res.ok) {
    showTip(res.reason, true)
    return
  }
  refresh()
  showTip(`已将 ${member.name} 设置为${orgRoleName(nextRole)}`)
}

/** 身份变更后重新读取，保证列表与存储一致 */
function refresh() {
  version.value += 1
}

/* ===== 邀请成员（谁都能邀：组织管理员在此生成本组织的邀请链接） ===== */
const inviteOpen = ref(false)
const INVITE_ROLE_OPTIONS = [
  { value: 'member', label: '组织成员' },
  { value: 'owner', label: '库主（组织管理员）' },
]
const inviteRole = ref('member')
const inviteExpireDays = ref(7)
const inviteMaxUses = ref(5)
const lastInvite = ref(null)
const inviteNote = ref('')

function toggleInvite() {
  inviteOpen.value = !inviteOpen.value
}

function generateInvite() {
  // 邀请加入本组织。注意区分两个维度：
  // - 组织内身份（库主=admin / 成员=member）属于「组织身份」，接受邀请时落库到组织成员列表
  // - 平台角色：组织成员无需平台角色，账号靠「组织角色」成立（合法性由 accountData 判定）
  lastInvite.value = createInvite({
    orgId: props.org.id,
    orgName: props.org.name,
    platformRoles: [],
    orgRole: inviteRole.value === 'owner' ? 'admin' : 'member',
    expireDays: inviteExpireDays.value,
    maxUses: inviteMaxUses.value,
    createdBy: '组织管理员',
    note: '组织成员邀请',
  })
  inviteNote.value = ''
}

function copyInviteLink(token) {
  const url = buildInviteUrl(token)
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(url)
      .then(() => { inviteNote.value = '已复制' })
      .catch(() => { inviteNote.value = '复制失败，请手动复制' })
  } else {
    inviteNote.value = '复制失败，请手动复制'
  }
}
</script>

<style scoped>
.org-tab-content {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px 28px;
}

.org-tab-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.org-tab-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.org-tab-count {
  font-size: 13px;
  font-weight: 600;
  color: #da203e;
  background: #fef2f2;
  padding: 2px 10px;
  border-radius: 10px;
}

.org-member-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  max-width: 320px;
  margin-bottom: 18px;
  color: #9ca3af;
}

.org-member-search:focus-within {
  border-color: #da203e;
  box-shadow: 0 0 0 2px rgba(218,32,62,0.1);
}

.org-member-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  font-family: inherit;
  color: #374151;
  background: transparent;
}

.org-member-input::placeholder { color: #9ca3af; }

.org-member-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.org-member-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border: 1px solid #f3f4f6;
  border-radius: 10px;
  transition: border-color 0.15s, background 0.15s;
}

.org-member-card:hover {
  border-color: #e5e7eb;
  background: #fafafa;
}

.org-member-avatar {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #f3f4f6;
  border: 1px solid #eef0f3;
  object-fit: cover;
}

.org-member-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.org-member-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.org-member-role {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
}

/* 组织身份配色：管理员=红、普通成员=蓝 */
.org-member-role--admin { color: #da203e; }
.org-member-role--member { color: #2563eb; }

/* 唯一管理员标记：取消其身份会被规则拦截，故显式提示 */
.org-member-flag {
  align-self: flex-start;
  margin-top: 2px;
  padding: 1px 6px;
  font-size: 11px;
  color: #b45309;
  background: #fef3c7;
  border-radius: 4px;
}

/* 身份变更结果提示 */
.org-member-tip {
  margin: 0 0 14px;
  padding: 9px 12px;
  font-size: 13px;
  color: #166534;
  background: #f0fdf4;
  border: 1px solid #dcfce7;
  border-radius: 6px;
}
.org-member-tip.is-error {
  color: #b91c1c;
  background: #fef2f2;
  border-color: #fecaca;
}

.org-member-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 组织身份下拉 */
.org-member-select {
  height: 30px;
  padding: 0 6px;
  font-size: 13px;
  font-family: inherit;
  color: #374151;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s;
}
.org-member-select:focus { border-color: #da203e; }

.org-member-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  font-size: 13px;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.org-member-btn:hover {
  border-color: #da203e;
  color: #da203e;
}

.org-member-btn--danger:hover {
  border-color: #dc2626;
  color: #dc2626;
}

.org-member-empty {
  padding: 40px;
  text-align: center;
}

.org-member-empty-text {
  margin: 0;
  color: #9ca3af;
  font-size: 14px;
}

/* ===== 邀请成员 ===== */
.org-invite-btn {
  margin-left: auto;
  height: 32px;
  padding: 0 14px;
  font-size: 13px;
  font-family: inherit;
  color: #fff;
  background: #da203e;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}
.org-invite-btn:hover { background: #c11b36; }

.org-invite-panel {
  margin-bottom: 18px;
  padding: 16px 18px;
  background: #f9fafb;
  border: 1px solid #eef0f3;
  border-radius: 10px;
}
.org-invite-tip {
  margin: 0 0 14px;
  font-size: 13px;
  line-height: 1.7;
  color: #4b5563;
}
.org-invite-form {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}
.org-invite-field { display: flex; flex-direction: column; gap: 6px; }
.org-invite-label { font-size: 12px; font-weight: 500; color: #374151; }
.org-invite-select {
  min-width: 132px;
  height: 32px;
  padding: 0 8px;
  font-size: 13px;
  font-family: inherit;
  color: #374151;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  outline: none;
  cursor: pointer;
}
.org-invite-select:focus { border-color: #da203e; }
.org-invite-generate {
  height: 32px;
  padding: 0 14px;
  font-size: 13px;
  font-family: inherit;
  color: #da203e;
  background: #fff;
  border: 1px solid #da203e;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}
.org-invite-generate:hover { background: #fef2f2; }

.org-invite-result {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding: 12px 14px;
  background: #f0fdf4;
  border: 1px solid #dcfce7;
  border-radius: 8px;
}
.org-invite-input {
  flex: 1;
  min-width: 0;
  height: 32px;
  padding: 0 10px;
  font-size: 12px;
  font-family: inherit;
  color: #4b5563;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  outline: none;
}
.org-invite-copy {
  height: 32px;
  padding: 0 14px;
  font-size: 13px;
  font-family: inherit;
  color: #166534;
  background: #fff;
  border: 1px solid #86efac;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
}
.org-invite-copy:hover { background: #ecfdf5; }
.org-invite-note { font-size: 12px; color: #166534; white-space: nowrap; }
</style>
