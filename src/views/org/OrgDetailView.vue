<template>
  <div class="org-detail-page">
    <!-- ====== 组织信息卡片 ====== -->
    <div class="org-hero-card">
      <div class="org-hero-avatar">{{ org.avatar }}</div>
      <div class="org-hero-body">
        <h1 class="org-hero-name">{{ org.name }}</h1>
        <p class="org-hero-desc">{{ org.description }}</p>
      </div>
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
      <OrgInfoTab v-if="activeTab === 'info'" :org="org" />
      <OrgMembersTab v-else-if="activeTab === 'members'" :org="org" />
      <MemberPermissionsTab v-else-if="activeTab === 'permissions'" :org="org" />
      <SubscriptionListTab v-else-if="activeTab === 'subscriptions'" :org="org" />
      <AlertSettingsTab v-else-if="activeTab === 'alerts'" :org="org" />
      <FeedbackTab v-else-if="activeTab === 'feedback'" :org="org" />
      <VersionTrainTab v-else-if="activeTab === 'trains'" :org="org" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrgById, ORGS } from '../../data/orgData'
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
  { key: 'info', label: '组织信息', icon: '' },
  { key: 'members', label: '组织成员', icon: '' },
  { key: 'permissions', label: '成员权限', icon: '' },
  { key: 'subscriptions', label: '订阅列表', icon: '' },
  { key: 'alerts', label: '预警信息设置', icon: '' },
  { key: 'feedback', label: '需求反馈', icon: '' },
  { key: 'trains', label: '版本火车', icon: '' },
]

const activeTab = ref(
  (route.query.tab && ['info','members','permissions','subscriptions','alerts','feedback','trains'].includes(route.query.tab))
    ? route.query.tab : 'info'
)

const org = computed(() => {
  const o = getOrgById(route.params.orgId)
  if (!o) {
    // 如果找不到组织，回退到第一个
    return ORGS[0] || null
  }
  return o
})

function goBack() {
  router.push({ name: 'org-list' })
}
</script>

<style scoped>

/* ====== Hero Card ====== */
.org-hero-card {
  display: flex;
  align-items: flex-start;
  gap: 22px;
  padding: 24px 28px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  margin-bottom: 24px;
  position: relative;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
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
