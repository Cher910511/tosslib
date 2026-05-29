<template>
  <div class="org-tab-content">
    <div class="org-tab-header">
      <h2 class="org-tab-title">组织成员</h2>
      <span class="org-tab-count">{{ filteredMembers.length }} 人</span>
    </div>

    <div class="org-member-search">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input v-model="searchQuery" type="text" class="org-member-input" placeholder="搜索成员姓名..." />
    </div>

    <div class="org-member-grid">
      <div v-for="user in filteredMembers" :key="user.id" class="org-member-card">
        <span class="org-member-avatar">{{ user.avatar }}</span>
        <div class="org-member-body">
          <span class="org-member-name">{{ user.name }}</span>
          <span class="org-member-role" :class="'org-member-role--' + user.role">
            {{ roleLabel(user.role) }}
          </span>
        </div>
        <div class="org-member-actions">
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
import { getUsersByOrgId } from '../../../data/orgData'

const props = defineProps({ org: { type: Object, required: true } })
const searchQuery = ref('')

const allMembers = computed(() => getUsersByOrgId(props.org.id))

const filteredMembers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return allMembers.value
  return allMembers.value.filter((u) => u.name.toLowerCase().includes(q))
})

function roleLabel(role) {
  return { superadmin: '超级管理员', 'org-admin': '组织管理员', member: '组织成员' }[role] || role
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
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
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

.org-member-role--superadmin { color: #7c3aed; }
.org-member-role--org-admin { color: #da203e; }
.org-member-role--member { color: #2563eb; }

.org-member-actions {
  display: flex;
  gap: 4px;
}

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
</style>
