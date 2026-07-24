<template>
  <div>
    <!-- 扫描状态条 -->
    <div class="scan-bar">
      <div class="scan-bar-left">
        <span class="scan-bar-label">扫描结果 ·</span>
        <span class="scan-bar-name">{{ softwareName }} v{{ version }}</span>
      </div>
      <div class="scan-bar-right">
        <span class="scan-bar-item">扫描时间：{{ scanTime }}</span>
        <span class="scan-bar-divider">|</span>
        <span class="scan-bar-item">状态：<span :style="{ color: statusColor }">{{ statusText }}</span></span>
        <span class="scan-bar-divider">|</span>
        <span class="scan-bar-item">耗时：{{ scanDuration }}</span>
      </div>
      <button type="button" class="scan-bar-back" @click="goBack">← 返回扫描</button>
    </div>

    <!-- 复用软件详情页组件 -->
    <SoftwareDetailView />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SoftwareDetailView from './SoftwareDetailView.vue'

const route = useRoute()
const router = useRouter()

const softwareName = ref('')
const version = ref('')
const scanTime = ref('')
const status = ref('pending')
const scanDuration = ref('')

const statusText = computed(() => {
  const map = { pending: '待扫描', scanning: '扫描中', completed: '已完成', failed: '失败' }
  return map[status.value] || status.value
})

const statusColor = computed(() => {
  const map = { pending: '#d97706', scanning: '#0369a1', completed: '#059669', failed: '#dc2626' }
  return map[status.value] || '#6b7280'
})

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'software-scan' })
  }
}

onMounted(() => {
  softwareName.value = route.query.name || route.params.name || '未知软件'
  version.value = route.query.version || route.params.version || '1.0.0'
  scanTime.value = new Date().toLocaleString('zh-CN')
  scanDuration.value = '2分34秒'
})
</script>

<style scoped>
.scan-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 18px;
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  flex-wrap: wrap;
}

.scan-bar-left {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.scan-bar-label {
  color: #6b7280;
  font-weight: 500;
}

.scan-bar-name {
  font-weight: 700;
}

.scan-bar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
}

.scan-bar-item {
  white-space: nowrap;
}

.scan-bar-divider {
  color: #d1d5db;
  font-size: 12px;
}

.scan-bar-back {
  margin-left: auto;
  padding: 6px 14px;
  font-size: 13px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.scan-bar-back:hover {
  color: #da203e;
  border-color: #da203e;
  background: #fef2f2;
}
</style>