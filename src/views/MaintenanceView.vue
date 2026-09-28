<template>
  <div class="mt-page">
    <div class="mt-card">
      <h1 class="mt-title">系统维护升级中</h1>
      <p class="mt-desc">
        平台正在进行版本发布与系统升级，期间服务暂时不可用。<br />
        升级完成后将自动恢复，请稍后再试。
      </p>
      <div class="mt-progress" role="progressbar" aria-label="升级进行中">
        <span class="mt-progress-bar" />
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 系统维护升级页（静态页）
 *
 * 用途：流水线发版期间对外展示，替代正常页面。
 * 特点：不依赖后台布局（无侧边栏/顶栏）、不请求接口、无任何数据依赖。
 * 访问：/maintenance
 */
</script>

<style scoped>
.mt-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(160deg, #f6f7f9 0%, #eef1f5 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  box-sizing: border-box;
}

.mt-card {
  width: 100%;
  max-width: 460px;
  padding: 48px 40px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.06);
  text-align: center;
  box-sizing: border-box;
}

.mt-title {
  margin: 0 0 14px;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #111827;
}

.mt-desc {
  margin: 0 0 28px;
  font-size: 14px;
  line-height: 1.9;
  color: #6b7280;
}

/* 进度条：不定长滚动 */
.mt-progress {
  position: relative;
  height: 4px;
  background: #f0f1f3;
  border-radius: 3px;
  overflow: hidden;
}
.mt-progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 38%;
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, rgba(218, 32, 62, 0.35), #da203e);
  animation: mt-progress 1.8s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}
@keyframes mt-progress {
  0% { left: -40%; }
  100% { left: 100%; }
}

/* 尊重系统「减少动态效果」偏好 */
@media (prefers-reduced-motion: reduce) {
  .mt-progress-bar {
    animation: none !important;
    /* 关闭动画后停在中间，避免看起来卡在起点 */
    left: 31%;
  }
}
</style>
