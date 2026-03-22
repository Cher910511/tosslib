<template>
  <div class="viewport">
    <div class="scale-stage" :style="stageStyle">
      <div class="dashboard">
        <header class="header">
          <div class="header-left">
            <div class="header-line"></div>
            <div class="header-meta">
              <span class="header-tag">TRUSTED OPENSOURCE</span>
              <span class="header-sub">实时态势 · 安全可信</span>
            </div>
          </div>
          <div class="title-block">
            <h1 class="main-title">
              <span class="title-text">可信开源代码库数据大屏</span>
            </h1>
            <div class="title-underline"></div>
          </div>
          <div class="header-right">
            <div class="header-time">
              <span class="time-label">当前时间</span>
              <span class="time-value">{{ currentTime }}</span>
            </div>
            <div class="header-line reverse"></div>
          </div>
        </header>

        <main class="main-grid">
          <div class="cell platform-cell glow-card">
            <PlatformOverview :data="platformOverview" />
          </div>

          <div class="cell charts-row">
            <div class="glow-card chart-compact">
              <div class="panel-title">漏洞风险分析</div>
              <VulnerabilityDonut :data="vulnerabilityRisk" />
            </div>
            <div class="glow-card chart-compact">
              <div class="panel-title">漏洞趋势</div>
              <VulnerabilityTrend :data="vulnerabilityTrend" />
            </div>
          </div>

          <div class="cell right-stack">
            <div class="glow-card right-block">
              <div class="panel-title">许可证分布</div>
              <LicensePie :data="licenseDistribution" />
            </div>
            <div class="glow-card right-block">
              <div class="panel-title">覆盖行业领域</div>
              <IndustryBar :data="industrySectors" />
            </div>
            <div class="glow-card right-block tag-block">
              <div class="panel-title">覆盖关键行业</div>
              <TagCloud :tags="keyIndustries" />
            </div>
            <div class="glow-card right-block bar-block">
              <div class="panel-title">开发者国家 Top10</div>
              <CountryBar :data="developerCountryTop10" />
            </div>
            <div class="glow-card right-block bar-block">
              <div class="panel-title">仓库所属国家 Top10</div>
              <CountryBar :data="repoCountryTop10" />
            </div>
          </div>

          <div class="cell news-cell glow-card">
            <div class="panel-title panel-title-lg">最新数据动态</div>
            <SecurityNewsFeed :list="securityNews" />
          </div>

          <div class="cell cve-cell glow-card">
            <div class="panel-title panel-title-lg">最新漏洞列表</div>
            <CVEListTable :list="latestCVEList" size="large" />
          </div>
        </main>

        <footer class="footer">
          <SecurityGovernance :data="securityGovernance" />
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import PlatformOverview from '../components/PlatformOverview.vue'
import VulnerabilityDonut from '../components/VulnerabilityDonut.vue'
import VulnerabilityTrend from '../components/VulnerabilityTrend.vue'
import CVEListTable from '../components/CVEListTable.vue'
import SecurityNewsFeed from '../components/SecurityNewsFeed.vue'
import LicensePie from '../components/LicensePie.vue'
import IndustryBar from '../components/IndustryBar.vue'
import TagCloud from '../components/TagCloud.vue'
import CountryBar from '../components/CountryBar.vue'
import SecurityGovernance from '../components/SecurityGovernance.vue'
import {
  platformOverview,
  vulnerabilityRisk,
  vulnerabilityTrend,
  latestCVEList,
  securityNews,
  licenseDistribution,
  industrySectors,
  keyIndustries,
  developerCountryTop10,
  repoCountryTop10,
  securityGovernance,
} from '../data/mockData.js'

const DESIGN_W = 1920
const DESIGN_H = 1080
/** 与侧边栏宽度大致对齐，缩放时按主内容区计算 */
const SIDEBAR_W = 232

function computeScale() {
  if (typeof window === 'undefined') return 1
  const mw = Math.max(320, window.innerWidth - SIDEBAR_W)
  const sw = mw / DESIGN_W
  const sh = window.innerHeight / DESIGN_H
  return Math.min(sw, sh)
}

const currentTime = ref('')
/** 首屏即用正确缩放，避免先 scale(1) 再变小造成整页「跳闪」 */
const scale = ref(computeScale())
const stageStyle = computed(() => ({
  transform: `scale(${scale.value})`,
}))

function updateScale() {
  scale.value = computeScale()
}

let timer = null
let resizeTimer = null
function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}
function onResize() {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    updateScale()
    resizeTimer = null
  }, 80)
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
  updateScale()
  /* 等布局/字体稳定后再校正一次，避免首帧与最终布局不一致 */
  requestAnimationFrame(() => {
    updateScale()
    requestAnimationFrame(updateScale)
  })
  window.addEventListener('resize', onResize)
})
onUnmounted(() => {
  clearInterval(timer)
  window.removeEventListener('resize', onResize)
  if (resizeTimer) clearTimeout(resizeTimer)
})
</script>

<style scoped>
.viewport {
  position: absolute;
  inset: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.scale-stage {
  width: 1920px;
  height: 1080px;
  flex-shrink: 0;
  transform-origin: center center;
  /* 避免长期 will-change 与背景动画叠加重绘导致闪烁 */
  position: relative;
  z-index: 1;
}

.dashboard {
  width: 1920px;
  height: 1080px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.header {
  height: 92px;
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 28px;
  gap: 24px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-card);
}
.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}
.header-right {
  justify-content: flex-end;
}
.header-line {
  flex: 1;
  max-width: 200px;
  height: 1px;
  background: var(--border-subtle);
  border-radius: 1px;
}
.header-line.reverse {
  background: var(--border-subtle);
}
.header-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.header-tag {
  font-family: 'Orbitron', sans-serif;
  font-size: 11px;
  letter-spacing: 3px;
  color: var(--accent-cyan);
}
.header-sub {
  font-size: 12px;
  color: var(--text-secondary);
}
.title-block {
  text-align: center;
  position: relative;
}
.main-title {
  margin: 0;
  line-height: 1.15;
}
.title-text {
  font-family: 'Orbitron', sans-serif;
  font-size: 46px;
  font-weight: 900;
  letter-spacing: 10px;
  display: inline-block;
  background: linear-gradient(
    110deg,
    #a8d8ff 0%,
    #00d4ff 25%,
    #ffffff 45%,
    #00d4ff 65%,
    #7eb8e0 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 24px rgba(0, 212, 255, 0.55)) drop-shadow(0 0 60px rgba(0, 120, 255, 0.35));
  animation: title-shine 5s ease-in-out infinite;
}
@keyframes title-shine {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
.title-underline {
  margin: 8px auto 0;
  width: min(720px, 85vw);
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(90deg, transparent, #00d4ff, rgba(0, 212, 255, 0.4), #00d4ff, transparent);
  box-shadow: 0 0 16px rgba(0, 212, 255, 0.7);
}
.header-time {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.time-label {
  font-size: 12px;
  color: var(--text-secondary);
}
.time-value {
  font-family: 'Orbitron', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--accent-cyan);
}

.main-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 560px minmax(0, 1fr) 480px;
  grid-template-rows: 228px minmax(250px, 0.7fr) minmax(0, 0.72fr);
  gap: 12px;
  padding: 12px 16px 10px;
  position: relative;
  z-index: 1;
}
.platform-cell {
  grid-row: 1 / -1;
  grid-column: 1;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
.charts-row {
  grid-column: 2;
  grid-row: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  min-height: 0;
}
.chart-compact {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
.news-cell {
  grid-column: 2;
  grid-row: 2;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
.cve-cell {
  grid-column: 2;
  grid-row: 3;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
.panel-title-lg {
  font-size: 16px !important;
  letter-spacing: 3px !important;
  margin-bottom: 10px !important;
}
.right-stack {
  grid-row: 1 / -1;
  grid-column: 3;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}
.right-block {
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1.05;
  overflow: hidden;
}
.tag-block {
  flex: 0 0 auto;
  min-height: 52px;
}
.bar-block {
  flex: 1.15;
}

.footer {
  height: 138px;
  flex-shrink: 0;
  padding: 0 16px 10px;
  position: relative;
  z-index: 1;
}

@media (prefers-reduced-motion: reduce) {
  .title-text {
    animation: none !important;
  }
}

</style>
