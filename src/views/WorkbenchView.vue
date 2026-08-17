<template>
  <div class="workbench-view">
    <!-- ===== 工作台头部 ===== -->
    <div class="wb-head">
      <!-- 左侧：用户信息 + 组织切换（多组织） -->
      <div class="wb-head-left">
        <div class="wb-avatar" :style="{ background: avatarBg(currentUser.name) }">{{ currentUser.name.charAt(0) }}</div>
        <div class="wb-user-meta">
          <span class="wb-user-name">{{ currentUser.name }}</span>
          <span class="wb-user-org">{{ currentOrg?.name || '未加入组织' }}</span>
        </div>
        <span class="wb-role-tag" :class="isAdmin ? 'wb-role-tag--admin' : 'wb-role-tag--member'">
          {{ isAdmin ? '组织管理员' : '普通成员' }}
        </span>
        <select v-if="hasMultiOrgs" v-model="activeOrgId" class="wb-org-switch" title="切换组织" @change="onOrgChange">
          <option v-for="o in userOrgs" :key="o.id" :value="o.id">{{ o.name }}</option>
        </select>
        <span class="wb-quick-sep" aria-hidden="true" />
        <!-- 常用快捷入口（所有角色通用） -->
        <button v-for="q in quickLinks" :key="q.label" type="button" class="wb-quick-link" @click="goQuick(q)">
          <span class="wb-quick-ico" aria-hidden="true" v-html="q.icon"></span>
          <span>{{ q.label }}</span>
        </button>
      </div>

      <!-- 右侧：演示切换 -->
      <div class="wb-user">
        <select v-model="demoUserId" class="wb-role-switch" title="演示：切换用户" @change="onRoleSwitch">
          <option v-for="u in DEMO_USERS" :key="u.id" :value="u.id">{{ u.label }}</option>
        </select>
      </div>
    </div>

    <!-- ===== 按角色渲染工作台 ===== -->
    <MemberWorkbench v-if="!isAdmin" :org="currentOrg" />
    <OrgDashboardTab v-else :org="currentOrg" :is-admin="true" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { USERS, ORGS, getOrgById, getUserOrgs, getUserOrgIds } from '../data/orgData'
import MemberWorkbench from './org/tabs/MemberWorkbench.vue'
import OrgDashboardTab from './org/tabs/OrgDashboardTab.vue'

const route = useRoute()

/** 常用快捷入口（所有角色通用），图标为内联 SVG */
const quickLinks = [
  {
    label: '软件库',
    icon: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    to: { name: 'software-library' },
  },
  {
    label: '组件库',
    icon: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    to: { name: 'component-library' },
  },
  {
    label: '版本火车',
    icon: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    to: { name: 'version-train-tree' },
  },
  {
    label: '使用手册',
    icon: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    to: { name: 'user-manual' },
  },
]

function goQuick(q) {
  router.push(q.to)
}

/** 演示用户列表（后续接入真实登录态：当前用户来自会话） */
const DEMO_USERS = [
  { id: 'user-admin-1', label: '张建国 · 组织管理员（单组织）' },
  { id: 'user-admin-3', label: '李思远 · 组织管理员（多组织）' },
  { id: 'user-mem-1', label: '赵小明 · 普通成员（单组织）' },
  { id: 'user-mem-6', label: '郑子轩 · 普通成员（多组织）' },
]

/** 演示：选择用户（默认单组织管理员，便于直接查看主场景） */
const demoUserId = ref(route.query.user || 'user-admin-1')

/** 当前登录用户（mock） */
const currentUser = computed(() => USERS.find((u) => u.id === demoUserId.value) || USERS[0])
const isAdmin = computed(() => currentUser.value?.role === 'org-admin')

/** 用户所属组织列表：主组织在前（单组织用户只有一个，直接展示；多组织用户在顶部切换） */
const userOrgs = computed(() => getUserOrgs(currentUser.value))

/** 当前选中的组织 ID（默认主组织 = 列表第一位） */
const activeOrgId = ref(userOrgs.value[0]?.id || null)

/** 当前组织（单组织用户放第一位直接展示；多组织用户可切换） */
const currentOrg = computed(() => getOrgById(activeOrgId.value) || userOrgs.value[0] || ORGS[0] || null)

/** 是否有多个组织（多组织时显示切换器） */
const hasMultiOrgs = computed(() => userOrgs.value.length > 1)

function onOrgChange() {
  // 切换组织后保持当前页（工作台内容随 currentOrg 联动刷新）
}

function onRoleSwitch() {
  // 切换用户后回到该用户的主组织
  const first = getUserOrgIds(currentUser.value)[0]
  if (first) activeOrgId.value = first
}

const AVATAR_COLORS = [
  { bg: 'linear-gradient(135deg, #fef2f2, #fce4e4)', text: '#da203e' },
  { bg: 'linear-gradient(135deg, #eff6ff, #dbeafe)', text: '#2563eb' },
  { bg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', text: '#16a34a' },
  { bg: 'linear-gradient(135deg, #fefce8, #fef9c3)', text: '#ca8a04' },
]
function avatarBg(name) {
  if (!name) return AVATAR_COLORS[0].bg
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length].bg
}
</script>

<style scoped>
.workbench-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ===== 头部 ===== */
.wb-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 18px 22px;
}
.wb-head-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  min-width: 0;
}
.wb-user {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
/* 快捷入口 */
.wb-quick-sep {
  width: 1px;
  height: 22px;
  background: #e5e7eb;
  flex-shrink: 0;
  margin: 0 2px;
}
.wb-quick-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border: 1px solid #eef0f2;
  border-radius: 8px;
  background: #fafafa;
  font-family: inherit;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
  white-space: nowrap;
}
.wb-quick-link:hover {
  border-color: #da203e;
  background: #fef2f2;
  color: #da203e;
}
.wb-quick-ico {
  font-size: 14px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.wb-quick-ico :deep(svg) {
  width: 14px;
  height: 14px;
}
.wb-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
}
.wb-user-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1.2;
}
.wb-user-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}
.wb-user-org {
  font-size: 12px;
  color: #9ca3af;
}
.wb-role-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  flex-shrink: 0;
}
.wb-role-tag--admin { background: #fef2f2; color: #da203e; }
.wb-role-tag--member { background: #eff6ff; color: #2563eb; }
.wb-role-switch {
  padding: 5px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 12px;
  font-family: inherit;
  color: #374151;
  cursor: pointer;
  outline: none;
}
.wb-role-switch:focus { border-color: #da203e; }
.wb-org-switch {
  padding: 5px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 12px;
  font-family: inherit;
  color: #374151;
  cursor: pointer;
  outline: none;
}
.wb-org-switch:focus { border-color: #da203e; }
</style>
