<template>
  <div class="org-list-page">
    <div class="org-list-header">
      <h1 class="org-list-title">组织管理</h1>
      <p class="org-list-subtitle">管理平台中所有组织的配置、成员、权限与版本火车</p>
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
        <div class="org-card-avatar">{{ org.avatar }}</div>
        <div class="org-card-body">
          <h2 class="org-card-name">{{ org.name }}</h2>
          <p class="org-card-industry">{{ org.industry }}</p>
          <p class="org-card-desc">{{ org.description }}</p>
          <div class="org-card-meta">
            <span class="org-card-meta-item">
              <span class="org-card-meta-label">管理员</span>
              <span class="org-card-meta-value">{{ org.adminIds.length }} 人</span>
            </span>
            <span class="org-card-meta-item">
              <span class="org-card-meta-label">成员</span>
              <span class="org-card-meta-value">{{ org.memberIds.length }} 人</span>
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ORGS } from '../../data/orgData'

const router = useRouter()
const searchQuery = ref('')

const filteredOrgs = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return ORGS
  return ORGS.filter((o) => o.name.toLowerCase().includes(q) || o.industry.toLowerCase().includes(q))
})

function goOrgDetail(orgId) {
  router.push({ name: 'org-detail', params: { orgId } })
}
</script>

<style scoped>
.org-list-page {
  max-width: 1100px;
  padding: 28px 32px;
}

.org-list-header {
  margin-bottom: 28px;
}

.org-list-title {
  margin: 0 0 4px;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.org-list-subtitle {
  margin: 0 0 18px;
  font-size: 14px;
  color: #6b7280;
}

.org-list-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  max-width: 400px;
  color: #9ca3af;
}

.org-list-search:focus-within {
  border-color: #da203e;
  box-shadow: 0 0 0 2px rgba(218, 32, 62, 0.1);
}

.org-search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  font-family: inherit;
  color: #374151;
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
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.org-card:hover {
  border-color: #da203e;
  box-shadow: 0 4px 14px rgba(218, 32, 62, 0.08);
  transform: translateY(-2px);
}

.org-card:focus-visible {
  outline: 2px solid #da203e;
  outline-offset: 2px;
}

.org-card-avatar {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: linear-gradient(135deg, #fef2f2 0%, #fce4e4 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
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
  color: #111827;
}

.org-card-industry {
  margin: 0 0 8px;
  font-size: 12px;
  color: #da203e;
  font-weight: 500;
}

.org-card-desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: #6b7280;
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
  color: #374151;
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
  color: #da203e;
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
</style>
