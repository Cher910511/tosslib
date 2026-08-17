<template>
  <div class="boards-page">
    <!-- ===== Tab 切换 ===== -->
    <div class="boards-tabs">
      <button
        v-for="t in tabs"
        :key="t.key"
        type="button"
        class="boards-tab"
        :class="{ 'is-active': active === t.key }"
        @click="active = t.key"
      >
        <span class="boards-tab-ico" v-html="t.icon"></span>
        {{ t.label }}
      </button>
    </div>

    <!-- ===== 三个看板内容（v-if 延迟挂载：避免 echarts 在隐藏容器 0 尺寸初始化导致图表堆叠） ===== -->
    <div v-if="active === 'business'">
      <BusinessBoardView />
    </div>
    <div v-else-if="active === 'download'">
      <DownloadApiBoardView />
    </div>
    <div v-else-if="active === 'behavior'">
      <BehaviorBoardView />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BusinessBoardView from './BusinessBoardView.vue'
import DownloadApiBoardView from './DownloadApiBoardView.vue'
import BehaviorBoardView from './BehaviorBoardView.vue'

const active = ref('business')

const tabs = [
  { key: 'business', label: '业务与系统', icon: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
  { key: 'download', label: '下载与接口', icon: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' },
  { key: 'behavior', label: '访问行为', icon: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' },
]
</script>

<style scoped>
.boards-page {
  min-height: 100%;
}
/* 仅数据看板页：缩小看板子页内边距（report.css 全局不动，避免影响其他页面） */
.boards-page :deep(.report-page) {
  padding: 12px 16px 20px;
}
/* Tab 栏 */
.boards-tabs {
  display: flex;
  gap: 6px;
  padding: 12px 20px 0;
  border-bottom: 1px solid #e5e7eb;
}
.boards-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.boards-tab:hover {
  color: #374151;
}
.boards-tab.is-active {
  color: #da203e;
  font-weight: 600;
  border-bottom-color: #da203e;
}
.boards-tab-ico {
  display: inline-flex;
  align-items: center;
}
</style>
