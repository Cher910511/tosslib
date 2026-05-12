<template>
  <div class="detection-report-page">
    <iframe
      class="detection-report-frame"
      :src="reportSrc"
      title="检测报告"
      referrerpolicy="no-referrer"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

/** 与 Vite `public/reports/detection-report.html` 对应；子路径部署时依赖 BASE_URL */
const reportSrc = computed(() => {
  const base = import.meta.env.BASE_URL || '/'
  const path = 'reports/detection-report.html'
  return base.endsWith('/') ? `${base}${path}` : `${base}/${path}`
})
</script>

<style scoped>
.detection-report-page {
  height: calc(100vh - 140px);
  min-height: 420px;
  display: flex;
  flex-direction: column;
}

.detection-report-frame {
  flex: 1;
  width: 100%;
  min-height: 0;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}
</style>
