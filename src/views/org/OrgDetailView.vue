<template>
  <div class="org-detail-page">
    <!-- ====== 组织不存在 / 无访问权限 ======
         这两种情况都不渲染任何组织内容：
         组织详情含成员名单、权限矩阵、版本火车等敏感信息，
         外部人员（既非平台角色、也不属于该组织）不应看到。 -->
    <div v-if="accessState !== 'ok'" class="org-denied">
      <div class="org-denied-art" aria-hidden="true">
        <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <h2 class="org-denied-title">
        {{ accessState === 'not-found' ? '组织不存在' : '无权访问该组织' }}
      </h2>
      <p class="org-denied-text">
        {{
          accessState === 'not-found'
            ? '该组织可能已被删除，或链接有误。'
            : '您不是该组织的成员。组织详情仅对平台管理员与该组织成员开放，如需访问请联系组织管理员邀请您加入。'
        }}
      </p>
      <button type="button" class="org-denied-btn" @click="goBack">&larr; 返回组织列表</button>
    </div>

    <template v-else>
    <!-- ====== 组织信息卡片 ====== -->
    <div class="org-hero-card">
      <div class="org-hero-avatar" :style="{ background: avatarBg(org.name) }">{{ avatarLetter(org.name) }}</div>
      <div class="org-hero-body">
        <h1 class="org-hero-name">{{ org.name }}</h1>
        <p class="org-hero-industry">{{ org.industry }}</p>
        <p class="org-hero-desc">{{ org.description }}</p>
        <div class="org-hero-meta">
          <span class="org-hero-meta-item">
            <span class="org-hero-meta-label">管理员</span>
            <span class="org-hero-meta-value">{{ adminCount }} 人</span>
          </span>
          <span class="org-hero-meta-item">
            <span class="org-hero-meta-label">成员</span>
            <span class="org-hero-meta-value">{{ memberCount }} 人</span>
          </span>
          <span class="org-hero-meta-item">
            <span class="org-hero-meta-label">创建时间</span>
            <span class="org-hero-meta-value">{{ org.createdAt }}</span>
          </span>
        </div>
      </div>
      <button type="button" class="org-hero-back" @click="goBack">
        &larr; 返回组织列表
      </button>
    </div>

    <!-- ====== Tab 导航 ====== -->
    <div class="org-tabs">
      <button
        v-for="t in tabs"
        :key="t.key"
        type="button"
        class="org-tab"
        :class="{ 'is-active': activeTab === t.key }"
        @click="activeTab = t.key"
      >
        <span class="org-tab-ico" aria-hidden="true">{{ t.icon }}</span>
        <span class="org-tab-label">{{ t.label }}</span>
      </button>
    </div>

    <!-- ====== Tab 面板 ====== -->
    <div class="org-tab-panel">
      <OrgDashboardTab v-if="activeTab === 'dashboard'" :org="org" @switch-tab="activeTab = $event" />
      <OrgInfoTab v-else-if="activeTab === 'info'" :org="org" />
      <OrgMembersTab v-else-if="activeTab === 'members'" :org="org" />
      <MemberPermissionsTab v-else-if="activeTab === 'permissions'" :org="org" />
      <SubscriptionListTab v-else-if="activeTab === 'subscriptions'" :org="org" />
      <AlertSettingsTab v-else-if="activeTab === 'alerts'" :org="org" />
      <FeedbackTab v-else-if="activeTab === 'feedback'" :org="org" />
      <VersionTrainTab v-else-if="activeTab === 'trains'" :org="org" />
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { USERS } from '../../data/orgData'
import { findOrg } from '../../data/orgStore.js'
import { getOrgMemberships, getMembership } from '../../data/orgMembershipData.js'
import { hasRole } from '../../data/permissionData.js'
import OrgDashboardTab from './tabs/OrgDashboardTab.vue'
import OrgInfoTab from './tabs/OrgInfoTab.vue'
import OrgMembersTab from './tabs/OrgMembersTab.vue'
import MemberPermissionsTab from './tabs/MemberPermissionsTab.vue'
import SubscriptionListTab from './tabs/SubscriptionListTab.vue'
import AlertSettingsTab from './tabs/AlertSettingsTab.vue'
import FeedbackTab from './tabs/FeedbackTab.vue'
import VersionTrainTab from './tabs/VersionTrainTab.vue'

const route = useRoute()
const router = useRouter()

const tabs = [
  { key: 'dashboard', label: '工作台', icon: '' },
  { key: 'info', label: '组织信息', icon: '' },
  { key: 'members', label: '组织成员', icon: '' },
  { key: 'permissions', label: '成员权限', icon: '' },
  { key: 'subscriptions', label: '订阅列表', icon: '' },
  { key: 'alerts', label: '预警信息设置', icon: '' },
  { key: 'feedback', label: '需求反馈', icon: '' },
  { key: 'trains', label: '版本火车', icon: '' },
]

const activeTab = ref(
  (route.query.tab && ['dashboard','info','members','permissions','subscriptions','alerts','feedback','trains'].includes(route.query.tab))
    ? route.query.tab : 'dashboard'
)

const org = computed(() => {
  // 从「内置 + 平台新建」的组织源查找，否则新建组织打不开详情页
  return findOrg(route.params.orgId)
})

/**
 * 当前用户：与侧边栏、组织列表一致，走 route.query.user 演示切换（默认 USERS[0] = 平台管理员）。
 * 不能用 orgData 的 getCurrentUser()——那个读的是写死的 CURRENT_USER_ID，
 * 演示切角色时会导致准入校验形同虚设。
 */
const currentUser = computed(() => USERS.find((u) => u.id === route.query.user) || USERS[0])
const currentUserId = computed(() => currentUser.value?.id)
/** 平台角色跨组织可见（平台管理员需管理任意组织） */
const isPlatformAdmin = computed(() => hasRole(currentUserId.value, 'platform-admin'))

/** 当前用户在该组织中的身份（null = 不属于该组织） */
const myMembership = computed(() => (org.value ? getMembership(currentUserId.value, org.value.id) : null))

/**
 * 准入判定：
 *   组织不存在      → 提示不存在（原先会静默回退成「第一个组织」，
 *                     等于 URL 随便填都能看到某个组织的成员与配置）
 *   平台角色        → 放行（跨组织管理职责）
 *   本组织成员      → 放行
 *   其余（外部人员） → 拒绝，不渲染任何组织内容
 */
const accessState = computed(() => {
  if (!org.value) return 'not-found'
  if (isPlatformAdmin.value) return 'ok'
  if (myMembership.value) return 'ok'
  return 'denied'
})

/**
 * 管理员/成员人数从 (用户, 组织) 的组织身份统计（见 orgMembershipData），
 * 而不是 orgData 里静态的 adminIds/memberIds —— 否则在「组织成员」页任免后人数不会更新。
 */
const memberships = computed(() => getOrgMemberships(org.value?.id))
const adminCount = computed(() => memberships.value.filter((m) => m.orgRole === 'admin').length)
const memberCount = computed(() => memberships.value.filter((m) => m.orgRole === 'member').length)

function goBack() {
  router.push({ name: 'org-list' })
}

/** 与 OrgListView 一致的头像首字 */
function avatarLetter(name) {
  return name ? name.charAt(0) : '?'
}

const AVATAR_COLORS = [
  { bg: 'linear-gradient(135deg, #fef2f2, #fce4e4)', text: '#da203e' },
  { bg: 'linear-gradient(135deg, #eff6ff, #dbeafe)', text: '#2563eb' },
  { bg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', text: '#16a34a' },
  { bg: 'linear-gradient(135deg, #fefce8, #fef9c3)', text: '#ca8a04' },
  { bg: 'linear-gradient(135deg, #faf5ff, #f3e8ff)', text: '#9333ea' },
]

function avatarBg(name) {
  if (!name) return AVATAR_COLORS[0].bg
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length].bg
}
</script>

<style scoped>

/* ====== 无权限 / 组织不存在 ======
   刻意与「空列表」区分：这里是访问被拒绝，不是没有数据，
   故用居中卡片 + 锁形图标 + 可返回的出口，避免用户误以为是加载失败。 */
.org-denied {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 360px;
  padding: 48px 24px;
  text-align: center;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}
.org-denied-art {
  color: #d1d5db;
  margin-bottom: 18px;
}
.org-denied-title {
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 600;
  color: #374151;
}
.org-denied-text {
  max-width: 460px;
  margin: 0 0 24px;
  font-size: 13.5px;
  line-height: 1.7;
  color: #6b7280;
}
.org-denied-btn {
  height: 34px;
  padding: 0 16px;
  font-size: 13px;
  font-family: inherit;
  color: #374151;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.org-denied-btn:hover {
  color: #da203e;
  border-color: #fca5a5;
}

/* ====== Hero Card ====== */
.org-hero-card {
  display: flex;
  align-items: flex-start;
  gap: 22px;
  padding: 24px 28px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 24px;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.org-hero-avatar {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 14px;
  background: linear-gradient(135deg, #fef2f2 0%, #fce4e4 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.5);
}

.org-hero-body {
  flex: 1;
  min-width: 0;
}

.org-hero-name {
  margin: 0 0 2px;
  font-size: 22px;
  font-weight: 700;
  color: #111827;
}

.org-hero-industry {
  margin: 0 0 10px;
  font-size: 13px;
  color: #da203e;
  font-weight: 500;
}

.org-hero-desc {
  margin: 0 0 14px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
}

.org-hero-meta {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.org-hero-meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.org-hero-meta-label {
  color: #9ca3af;
}

.org-hero-meta-value {
  color: #374151;
  font-weight: 600;
}

.org-hero-back {
  position: absolute;
  top: 20px;
  right: 20px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  font-family: inherit;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s;
}

.org-hero-back:hover {
  border-color: #da203e;
  color: #da203e;
  background: #fef2f2;
}

/* ====== Tabs ====== */
.org-tabs {
  display: flex;
  gap: 0;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 24px;
  overflow-x: auto;
}

.org-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.org-tab:hover {
  color: #374151;
  background: #f9fafb;
}

.org-tab.is-active {
  color: #da203e;
  border-bottom-color: #da203e;
  font-weight: 600;
}

.org-tab-ico {
  font-size: 15px;
}

.org-tab-panel {
  min-height: 400px;
}
</style>
