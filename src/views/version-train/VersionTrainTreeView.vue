<template>
  <div class="vt-page">
    <div class="vt-toolbar">
      <h1 class="vt-page-title">版本火车信息树</h1>
      <div class="vt-toolbar-actions">
        <div class="vt-search-box">
          <input
            v-model="searchQuery"
            type="text"
            class="vt-input"
            placeholder="搜索软件名称 / 版本火车号..."
          >
        </div>
        <button type="button" class="vt-btn vt-btn-outline" @click="expandedAll = !expandedAll">
          {{ expandedAll ? '全部收起' : '全部展开' }}
        </button>
      </div>
    </div>

    <!-- 版本火车总览 -->
    <div class="vt-summary-row">
      <div class="vt-summary-item">
        <span class="vt-summary-label">待发车火车</span>
        <span class="vt-summary-value">{{ pendingTrains.length }}</span>
      </div>
      <div class="vt-summary-item">
        <span class="vt-summary-label">待发布软件</span>
        <span class="vt-summary-value">{{ pendingSoftwareCount }}</span>
      </div>
      <div class="vt-summary-item">
        <span class="vt-summary-label">已发车火车</span>
        <span class="vt-summary-value">{{ releasedTrains }}</span>
      </div>
    </div>

    <!-- 版本火车树（按火车分组） -->
    <section class="vt-card">
      <div class="vt-card-header">
        <h2 class="vt-card-title">版本火车信息树</h2>
      </div>

      <div class="vt-tree">
        <!-- 每个版本火车一个节点 -->
        <div
          v-for="train in filteredTrains"
          :key="train.id"
          class="vt-tree-train"
        >
          <!-- 火车头 -->
          <div class="vt-tree-train-header" @click="toggleTrain(train.id)">
            <span class="vt-tree-toggle">{{ isTrainOpen(train.id) ? '▾' : '▸' }}</span>
            <span class="vt-tree-train-icon">🚂</span>
            <div class="vt-tree-train-info">
              <span class="vt-tree-train-id">{{ train.id }}</span>
              <span class="vt-tree-train-name">{{ train.name }}</span>
            </div>
            <span
              class="vt-badge"
              :class="train.status === '待发车' ? 'vt-badge--warn' : 'vt-badge--success'"
            >{{ train.status }}</span>
            <span class="vt-tree-train-count">{{ train.softwareList.length }} 个软件</span>
            <span class="vt-tree-train-date">创建于 {{ train.createdAt }}</span>
          </div>

          <!-- 子节点：软件列表（分页，每页5条） -->
          <div v-if="isTrainOpen(train.id)" class="vt-tree-children">
            <div
              v-for="sw in getPaginatedSw(train)"
              :key="sw.id"
              class="vt-tree-software"
              :class="{ 'is-highlighted': searchQuery && sw.name.toLowerCase().includes(searchQuery.toLowerCase()) }"
            >
              <div class="vt-tree-software-main">
                <span class="vt-tree-bullet">◈</span>
                <span class="vt-tree-sw-name">{{ sw.name }}</span>
                <span class="vt-tree-sw-version">v{{ sw.version }}</span>
                <span
                  class="vt-badge vt-badge--sm"
                  :class="sw.status === '待发布' ? 'vt-badge--warn' : 'vt-badge--success'"
                >{{ sw.status }}</span>
              </div>
              <div class="vt-tree-software-meta">
                <span v-if="sw.scanned" class="vt-tree-meta-item scan-ok">✓ 已扫描</span>
                <span v-else class="vt-tree-meta-item scan-none">○ 未扫描</span>
              </div>
            </div>
            <!-- 分页控件 -->
            <div v-if="getSwTotalPages(train) > 1" class="vt-tree-pagination">
              <button class="vt-page-btn vt-page-btn--xs" :disabled="getSwPage(train.id) <= 1" @click.stop="setSwPage(train.id, getSwPage(train.id) - 1)">‹</button>
              <span class="vt-tree-page-info">{{ getSwPage(train.id) }} / {{ getSwTotalPages(train) }}</span>
              <button class="vt-page-btn vt-page-btn--xs" :disabled="getSwPage(train.id) >= getSwTotalPages(train)" @click.stop="setSwPage(train.id, getSwPage(train.id) + 1)">›</button>
            </div>
          </div>
        </div>

        <div v-if="filteredTrains.length === 0" class="vt-tree-empty">
          <p>暂无匹配的版本火车</p>
        </div>
      </div>
    </section>

    <!-- 版本火车关系图（简化树形可视化） -->
    <section class="vt-card vt-card--secondary">
      <h2 class="vt-card-title">版本火车 - 依赖关系图</h2>
      <div class="vt-dag">
        <div class="vt-dag-node" v-for="train in versionTrains" :key="train.id">
          <div class="vt-dag-node-header">
            <span class="vt-dag-node-id">{{ train.id }}</span>
            <span class="vt-dag-node-status">{{ train.status }}</span>
          </div>
          <div class="vt-dag-node-body">
            <div class="vt-dag-software" v-for="sw in train.softwareList.slice(0, 4)" :key="sw.id">
              <span class="vt-dag-sw-dot"></span>
              <span class="vt-dag-sw-name">{{ sw.name }}</span>
              <span class="vt-dag-sw-ver">{{ sw.version }}</span>
            </div>
            <div v-if="train.softwareList.length > 4" class="vt-dag-more">
              +{{ train.softwareList.length - 4 }} 个更多
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { versionTrains, releaseHistory } from '../../data/versionTrainData.js'

const searchQuery = ref('')
const expandedAll = ref(true)
const openTrainIds = ref(new Set(versionTrains.map(t => t.id)))

// 每个火车内软件列表的分页状态
const softwarePages = ref({})
const SW_PAGE_SIZE = 5

function getSwPage(trainId) {
  return softwarePages.value[trainId] || 1
}
function setSwPage(trainId, page) {
  softwarePages.value[trainId] = page
}
function getPaginatedSw(train) {
  const page = getSwPage(train.id)
  const start = (page - 1) * SW_PAGE_SIZE
  return train.softwareList.slice(start, start + SW_PAGE_SIZE)
}
function getSwTotalPages(train) {
  return Math.ceil(train.softwareList.length / SW_PAGE_SIZE)
}

const pendingTrains = computed(() => versionTrains.filter(t => t.status === '待发车'))
const pendingSoftwareCount = computed(() =>
  versionTrains.filter(t => t.status === '待发车')
    .reduce((sum, t) => sum + t.softwareList.length, 0)
)
const releasedTrains = computed(() => releaseHistory.length)

const filteredTrains = computed(() => {
  if (!searchQuery.value) return versionTrains
  const q = searchQuery.value.toLowerCase()
  return versionTrains.filter(t =>
    t.id.toLowerCase().includes(q) ||
    t.name.toLowerCase().includes(q) ||
    t.softwareList.some(sw => sw.name.toLowerCase().includes(q))
  )
})

function toggleTrain(id) {
  const s = new Set(openTrainIds.value)
  if (s.has(id)) s.delete(id); else s.add(id)
  openTrainIds.value = s
}
function isTrainOpen(id) {
  return expandedAll.value || openTrainIds.value.has(id)
}
</script>

<style scoped>
.vt-page { padding: 24px; min-height: 100%; }
.vt-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
}
.vt-page-title {
  font-size: 20px; font-weight: 700;
  color: #111827; margin: 0;
}
.vt-toolbar-actions {
  display: flex; align-items: center; gap: 10px;
}
.vt-search-box { min-width: 240px; }
.vt-input {
  width: 100%; padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #374151;
  font-family: inherit; font-size: 14px;
  outline: none; transition: border-color 0.2s;
}
.vt-input:focus { border-color: #da203e; box-shadow: 0 0 0 2px rgba(218,32,62,0.1); }
.vt-input::placeholder { color: #9ca3af; }

.vt-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 18px; border: 1px solid #d1d5db;
  border-radius: 6px; font-family: inherit; font-size: 14px;
  cursor: pointer; transition: all 0.15s;
  background: #fff; color: #374151;
}
.vt-btn:hover { border-color: #da203e; color: #da203e; }
.vt-btn-outline { background: transparent; color: #da203e; border-color: #da203e; }
.vt-btn-outline:hover { background: #fef2f2; color: #b91c1c; }

/* Summary row */
.vt-summary-row {
  display: flex; gap: 16px; margin-bottom: 20px;
}
.vt-summary-item {
  flex: 1;
  padding: 16px 20px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  display: flex; flex-direction: column; gap: 6px;
  transition: box-shadow 0.2s, transform 0.15s;
}
.vt-summary-item:hover {
  box-shadow: 0 2px 8px rgba(218,32,62,0.12);
  transform: translateY(-1px);
}
.vt-summary-label {
  font-size: 13px; color: #6b7280; letter-spacing: 1px;
}
.vt-summary-value {
  font-size: 32px; font-weight: 700;
  color: #da203e; line-height: 1.1;
}

/* Badge */
.vt-badge {
  display: inline-block; padding: 2px 10px;
  border-radius: 10px; font-size: 12px; font-weight: 500;
}
.vt-badge--success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.vt-badge--warn { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
.vt-badge--sm { padding: 1px 8px; font-size: 11px; }

/* Card (shared) */
.vt-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.vt-card--secondary {
  opacity: 0.9;
  border-color: #f0f0f0;
}
.vt-card-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap; gap: 8px;
}
.vt-card-title {
  font-size: 15px; font-weight: 600;
  color: #111827;
  padding-left: 10px; border-left: 3px solid #da203e;
  margin: 0;
}

/* Tree */
.vt-tree { padding: 8px 0; }
.vt-tree-train { border-bottom: 1px solid #e5e7eb; }
.vt-tree-train:last-child { border-bottom: none; }
.vt-tree-train-header {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 20px;
  cursor: pointer;
  transition: background 0.15s;
  user-select: none;
}
.vt-tree-train-header:hover { background: #fafafa; }

.vt-tree-toggle {
  font-size: 12px; color: #9ca3af;
  width: 16px; text-align: center; flex-shrink: 0;
  transition: transform 0.15s;
}
.vt-tree-train-icon { font-size: 18px; flex-shrink: 0; }
.vt-tree-train-info {
  display: flex; flex-direction: column; gap: 2px; flex: 1;
  min-width: 0;
}
.vt-tree-train-id {
  font-size: 15px; font-weight: 600; color: #111827;
}
.vt-tree-train-name { font-size: 12px; color: #9ca3af; }
.vt-tree-train-count {
  font-size: 13px; color: #6b7280; white-space: nowrap;
}
.vt-tree-train-date {
  font-size: 12px; color: #9ca3af; white-space: nowrap;
}

/* Children nodes */
.vt-tree-children { padding: 0 0 8px 56px; }
.vt-tree-software {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px;
  margin: 2px 0;
  border-radius: 6px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  transition: all 0.15s;
}
.vt-tree-software:hover {
  background: #fef2f2;
  border-color: #fecaca;
  transform: translateX(2px);
}
.vt-tree-software.is-highlighted {
  border-color: #da203e;
  background: #fef2f2;
  box-shadow: 0 0 0 1px rgba(218,32,62,0.15);
}
.vt-tree-software-main {
  display: flex; align-items: center; gap: 10px;
}
.vt-tree-bullet { color: #da203e; font-size: 10px; }
.vt-tree-sw-name { font-size: 14px; font-weight: 500; color: #374151; }
.vt-tree-sw-version { font-size: 12px; color: #6b7280; }
.vt-tree-software-meta { display: flex; gap: 8px; }
.vt-tree-meta-item { font-size: 11px; }
.scan-ok { color: #16a34a; }
.scan-none { color: #9ca3af; }

.vt-tree-empty {
  padding: 48px 20px; text-align: center;
  color: #9ca3af; font-size: 14px;
}

/* Tree pagination */
.vt-tree-pagination {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; justify-content: center;
}
.vt-page-btn--xs {
  min-width: 26px; height: 26px; padding: 0; font-size: 14px;
  border: 1px solid #e5e7eb; border-radius: 4px; background: #fff;
  color: #374151; cursor: pointer; display: inline-flex;
  align-items: center; justify-content: center; transition: all 0.15s;
  line-height: 1;
}
.vt-page-btn--xs:hover:not(:disabled) { border-color: #da203e; color: #da203e; }
.vt-page-btn--xs:disabled { opacity: 0.35; cursor: default; }
.vt-tree-page-info {
  font-size: 12px; color: #9ca3af; min-width: 36px; text-align: center;
}

/* DAG visual */
.vt-dag {
  display: flex; gap: 20px; padding: 20px;
  overflow-x: auto;
}
.vt-dag-node {
  min-width: 220px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  transition: box-shadow 0.2s, transform 0.15s;
}
.vt-dag-node:hover {
  box-shadow: 0 4px 12px rgba(218,32,62,0.12);
  transform: translateY(-2px);
}
.vt-dag-node-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}
.vt-dag-node-id {
  font-size: 13px; font-weight: 600; color: #da203e;
}
.vt-dag-node-status { font-size: 11px; color: #9ca3af; }
.vt-dag-node-body { padding: 10px 14px; }
.vt-dag-software {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 0;
  font-size: 13px;
}
.vt-dag-software:hover { color: #da203e; }
.vt-dag-sw-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #da203e; flex-shrink: 0;
}
.vt-dag-sw-name { color: #374151; }
.vt-dag-sw-ver { color: #9ca3af; font-size: 11px; }
.vt-dag-more { font-size: 12px; color: #9ca3af; padding: 4px 0 0 12px; }
</style>
