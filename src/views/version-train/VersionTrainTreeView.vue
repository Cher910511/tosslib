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
        <button type="button" class="vt-btn vt-btn-outline" @click="toggleAll">
          {{ allExpanded ? '全部收起' : '全部展开' }}
        </button>
      </div>
    </div>

    <!-- 调试：验证数据过滤是否正确 -->
    <div style="background:#fffbe6;border:2px solid #f59e0b;border-radius:6px;padding:10px 16px;margin-bottom:12px;font-size:13px;line-height:1.6">
      <strong style="color:#92400e">🔍 数据校验</strong>
      <div v-for="train in versionTrains.slice(0,2)" :key="train.id" style="margin-top:4px">
        <span style="color:#78350f">{{ train.id }}</span>:
        software items = <strong style="color:#da203e">{{ train.softwareList.filter(sw => sw.type === 'software').length }}</strong>
        (IDs: {{ train.softwareList.filter(sw => sw.type === 'software').map(sw => sw.id).join(',') }})
        |
        component items = <strong style="color:#2563eb">{{ train.softwareList.filter(comp => comp.type === 'component').length }}</strong>
        (IDs: {{ train.softwareList.filter(comp => comp.type === 'component').map(comp => comp.id).join(',') }})
        |
        openSwIds count = <strong style="color:#059669">{{ openSwIds.length }}</strong>
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
            <div class="vt-tree-train-info">
              <span class="vt-tree-train-id">{{ train.id }}</span>
              <span class="vt-tree-train-name">{{ train.name }}</span>
            </div>
            <span
              class="vt-badge"
              :class="train.status === '待发车' ? 'vt-badge--warn' : 'vt-badge--success'"
            >{{ train.status }}</span>
            <span class="vt-tree-train-count">{{ getSoftwareItems(train).length }} 个软件</span>
            <span class="vt-tree-train-date">创建于 {{ train.createdAt }}</span>
          </div>

          <!-- 子节点：软件列表（分页，每页5条），含组件展开 -->
          <div v-if="isTrainOpen(train.id)" class="vt-tree-children">
            <div
              v-for="(sw, swIdx) in getPaginatedSw(train)"
              :key="sw.id"
              class="vt-tree-software"
              :class="{
                'is-last': swIdx === getPaginatedSw(train).length - 1,
                'is-highlighted': searchQuery && sw.name.toLowerCase().includes(searchQuery.toLowerCase())
              }"
            >
              <div class="vt-tree-software-header" @click.stop="toggleSw(sw.id)">
                <span class="vt-tree-connector">{{ swIdx === getPaginatedSw(train).length - 1 ? '└' : '├' }}</span>
                <span class="vt-tree-toggle">{{ isSwOpen(sw.id) ? '▾' : '▸' }}</span>
                <div class="vt-tree-software-main">
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
              <!-- 组件子节点（调试展开） -->
              <div v-if="isSwOpen(sw.id)" class="vt-tree-sw-children" style="border:2px solid #3b82f6;background:#eff6ff;padding:8px 8px 8px 24px;margin:4px 2px;border-radius:4px">
                <div v-if="getComponentsForSw(train, sw.name).length === 0" style="color:#6b7280;font-size:12px;padding:4px 0">── 暂无组件</div>
                <div
                  v-for="(comp, compIdx) in getComponentsForSw(train, sw.name)"
                  :key="comp.id"
                  class="vt-tree-component"
                  style="background:#f8fafc;border:1px solid #93c5fd;border-left:4px solid #3b82f6;padding:5px 8px;margin:2px 0;border-radius:3px"
                >
                  <div style="display:flex;align-items:center;gap:6px;font-size:13px">
                    <span style="color:#3b82f6;font-family:monospace;font-weight:700;width:16px;text-align:center">{{ compIdx === getComponentsForSw(train, sw.name).length - 1 ? '└' : '├' }}</span>
                    <strong style="color:#1e40af;font-size:11px;background:#dbeafe;padding:1px 6px;border-radius:3px">组件</strong>
                    <span style="color:#1e293b;font-weight:600">{{ comp.name.split(' / ')[1] || comp.name }}</span>
                    <span style="color:#64748b;font-size:12px">v{{ comp.version }}</span>
                    <span style="color:#94a3b8;font-size:11px">{{ comp.lang }}</span>
                  </div>
                </div>
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
const allExpanded = ref(true)
// 初始状态：全部火车展开 + 全部软件展开（展示完整三级树）
const openTrainIds = ref(versionTrains.map(t => t.id))
const openSwIds = ref(
  versionTrains.flatMap(t => t.softwareList.filter(sw => sw.type === 'software').map(sw => sw.id))
)

function toggleAll() {
  allExpanded.value = !allExpanded.value
  if (allExpanded.value) {
    openTrainIds.value = versionTrains.map(t => t.id)
    // 全部展开时也展开所有软件，显示完整三级树
    openSwIds.value = versionTrains.flatMap(t =>
      t.softwareList.filter(sw => sw.type === 'software').map(sw => sw.id)
    )
  } else {
    openTrainIds.value = []
    openSwIds.value = []
  }
}

// 每个火车内软件列表的分页状态
const softwarePages = ref({})
const SW_PAGE_SIZE = 5

function getSwPage(trainId) {
  return softwarePages.value[trainId] || 1
}
function setSwPage(trainId, page) {
  softwarePages.value[trainId] = page
}

function getSoftwareItems(train) {
  return train.softwareList.filter(sw => sw.type === 'software')
}

function getPaginatedSw(train) {
  const items = getSoftwareItems(train)
  const page = getSwPage(train.id)
  const start = (page - 1) * SW_PAGE_SIZE
  return items.slice(start, start + SW_PAGE_SIZE)
}
function getSwTotalPages(train) {
  const items = getSoftwareItems(train)
  return Math.ceil(items.length / SW_PAGE_SIZE)
}

function getComponentsForSw(train, swName) {
  return train.softwareList.filter(item => item.type === 'component' && item.software === swName)
}

function toggleSw(id) {
  const idx = openSwIds.value.indexOf(id)
  if (idx >= 0) {
    openSwIds.value = openSwIds.value.filter(v => v !== id)
  } else {
    openSwIds.value = [...openSwIds.value, id]
  }
}
function isSwOpen(id) {
  return openSwIds.value.includes(id)
}

const pendingTrains = computed(() => versionTrains.filter(t => t.status === '待发车'))
const pendingSoftwareCount = computed(() =>
  versionTrains.filter(t => t.status === '待发车')
    .reduce((sum, t) => sum + getSoftwareItems(t).length, 0)
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
  const idx = openTrainIds.value.indexOf(id)
  if (idx >= 0) {
    openTrainIds.value = openTrainIds.value.filter(v => v !== id)
  } else {
    openTrainIds.value = [...openTrainIds.value, id]
  }
}
function isTrainOpen(id) {
  return openTrainIds.value.includes(id)
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
.vt-badge--micro {
  display: inline-block; padding: 0 6px; border-radius: 8px; font-size: 10px; font-weight: 500;
  line-height: 16px; vertical-align: middle;
}
.vt-badge--pass { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.vt-badge--fail { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.vt-badge--pend { background: #f9fafb; color: #9ca3af; border: 1px solid #e5e7eb; }

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

/* ======================== TREE LAYOUT ======================== */
/* Level 1: 火车 */
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

/* === LEVEL 2 容器：软件列表（48px 缩进） === */
.vt-tree-children {
  display: flex; flex-direction: column;
  padding: 4px 0 10px 48px;
  border-left: 2px solid #da203e;
  margin-left: 20px;
}

/* 每个软件节点 */
.vt-tree-software {
  margin: 2px 0;
  border-radius: 6px;
  background: #fef8f8;
  border: 1px solid #fce4e4;
  border-left: 3px solid #da203e;
  transition: box-shadow 0.12s, background 0.12s;
}
.vt-tree-software:hover {
  background: #fef0f0;
  box-shadow: 0 1px 4px rgba(218,32,62,0.08);
}
.vt-tree-software.is-highlighted {
  background: #fee8e8;
  border-color: #da203e;
  box-shadow: 0 0 0 2px rgba(218,32,62,0.1);
}

/* 软件行内容 */
.vt-tree-software-header {
  display: flex; align-items: center; gap: 6px;
  width: 100%; cursor: pointer; user-select: none;
  padding: 7px 10px;
  border-radius: 5px;
  transition: background 0.12s;
}
.vt-tree-software-header:hover { background: rgba(218,32,62,0.04); }

.vt-tree-connector {
  font-size: 14px; color: #da203e; font-weight: 700;
  flex-shrink: 0; width: 14px; text-align: center;
  font-family: monospace;
}

.vt-tree-software-main {
  display: flex; align-items: center; gap: 8px;
  flex: 1; min-width: 0;
}
.vt-tree-sw-name { font-size: 14px; font-weight: 600; color: #374151; }
.vt-tree-sw-version { font-size: 12px; color: #6b7280; white-space: nowrap; }
.vt-tree-software-meta { display: flex; gap: 6px; flex-shrink: 0; }
.vt-tree-meta-item { font-size: 11px; }
.scan-ok { color: #16a34a; font-weight: 500; }
.scan-none { color: #9ca3af; margin-left: 4px; }

/* === LEVEL 3 组件列表（再缩进 24px） === */
.vt-tree-sw-children {
  padding: 4px 0 6px 24px;
  display: flex; flex-direction: column; gap: 2px;
  border-left: 2px solid #d1d5db;
  margin: 2px 0 2px 6px;
}

/* 组件子节点 */
.vt-tree-component {
  margin: 0;
  border-radius: 4px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-left: 3px solid #64748b;
  padding: 4px 8px;
  transition: background 0.12s;
}
.vt-tree-component:hover {
  background: #e2e8f0;
}

.vt-tree-component-main {
  display: flex; align-items: center; gap: 6px;
}

.vt-tree-comp-connector {
  font-size: 13px; color: #64748b;
  flex-shrink: 0; width: 14px; text-align: center;
  font-family: monospace;
}

.vt-tree-comp-name { font-size: 13px; font-weight: 500; color: #334155; }
.vt-tree-comp-version { font-size: 11px; color: #94a3b8; white-space: nowrap; }
.vt-tree-comp-lang { font-size: 10px; color: #94a3b8; white-space: nowrap; }

/* 无组件占位 */
.vt-tree-comp-empty {
  padding: 6px 10px;
  font-size: 12px; color: #94a3b8;
  font-style: italic;
  text-align: center;
  font-family: monospace;
}

/* 空状态 */
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
