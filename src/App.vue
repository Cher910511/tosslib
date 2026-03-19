<template>
  <div class="viewport">
    <TechBackdrop />
    <ParticleBackground />
    <div class="scale-stage" :style="stageStyle">
      <div class="dashboard">
        <div class="bg-effects">
          <div class="scan-line"></div>
          <div class="corner-glow top-left"></div>
          <div class="corner-glow top-right"></div>
          <div class="corner-glow bottom-left"></div>
          <div class="corner-glow bottom-right"></div>
        </div>

        <!-- 顶部：醒目标题 -->
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

        <!-- 主体：左概览跨两行 | 中上双图 | 中下CVE | 右侧生态 -->
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
              <div class="panel-title">漏洞趋势（近五年）</div>
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
import PlatformOverview from './components/PlatformOverview.vue'
import VulnerabilityDonut from './components/VulnerabilityDonut.vue'
import VulnerabilityTrend from './components/VulnerabilityTrend.vue'
import CVEListTable from './components/CVEListTable.vue'
import SecurityNewsFeed from './components/SecurityNewsFeed.vue'
import LicensePie from './components/LicensePie.vue'
import IndustryBar from './components/IndustryBar.vue'
import TagCloud from './components/TagCloud.vue'
import CountryBar from './components/CountryBar.vue'
import SecurityGovernance from './components/SecurityGovernance.vue'
import ParticleBackground from './components/ParticleBackground.vue'
import TechBackdrop from './components/TechBackdrop.vue'
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
} from './data/mockData.js'

const DESIGN_W = 1920
const DESIGN_H = 1080

const currentTime = ref('')
const scale = ref(1)
const stageStyle = computed(() => ({
  transform: `scale(${scale.value})`,
}))

function updateScale() {
  const sw = window.innerWidth / DESIGN_W
  const sh = window.innerHeight / DESIGN_H
  scale.value = Math.min(sw, sh)
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
  position: fixed;
  inset: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #030510;
}

.scale-stage {
  width: 1920px;
  height: 1080px;
  flex-shrink: 0;
  transform-origin: center center;
  will-change: transform;
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

.bg-effects {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.scan-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.15), transparent);
  animation: scan 4s linear infinite;
}
@keyframes scan {
  0% { top: 0; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
.corner-glow {
  position: absolute;
  width: 200px;
  height: 200px;
  border: 1px solid rgba(0, 212, 255, 0.35);
  border-radius: 2px;
  box-shadow:
    0 0 40px rgba(0, 180, 255, 0.2),
    inset 0 0 30px rgba(0, 100, 200, 0.08);
  background: linear-gradient(135deg, rgba(0, 80, 160, 0.12) 0%, transparent 55%);
}
.corner-glow::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 24px;
  border-color: rgba(0, 212, 255, 0.7);
  border-style: solid;
}
.corner-glow.top-left::after {
  top: -1px;
  left: -1px;
  border-width: 2px 0 0 2px;
}
.corner-glow.top-right::after {
  top: -1px;
  right: -1px;
  border-width: 2px 2px 0 0;
}
.corner-glow.bottom-left::after {
  bottom: -1px;
  left: -1px;
  border-width: 0 0 2px 2px;
}
.corner-glow.bottom-right::after {
  bottom: -1px;
  right: -1px;
  border-width: 0 2px 2px 0;
}
.corner-glow.top-left { top: 16px; left: 16px; }
.corner-glow.top-right { top: 16px; right: 16px; }
.corner-glow.bottom-left { bottom: 16px; left: 16px; }
.corner-glow.bottom-right { bottom: 16px; right: 16px; }

/* —— 醒目标题区 —— */
.header {
  height: 92px;
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 28px;
  gap: 24px;
  background: linear-gradient(180deg, rgba(0, 40, 90, 0.55) 0%, rgba(5, 12, 30, 0.2) 100%);
  border-bottom: 1px solid rgba(0, 212, 255, 0.35);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
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
  height: 3px;
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.85), rgba(0, 180, 255, 0.3));
  border-radius: 2px;
  box-shadow: 0 0 12px rgba(0, 212, 255, 0.5);
}
.header-line.reverse {
  background: linear-gradient(90deg, rgba(0, 180, 255, 0.3), rgba(0, 212, 255, 0.85), transparent);
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
  color: rgba(0, 212, 255, 0.9);
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.6);
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
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
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
.time-label { font-size: 12px; color: var(--text-secondary); }
.time-value {
  font-family: 'Orbitron', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--accent-cyan);
  text-shadow: 0 0 14px rgba(0, 212, 255, 0.5);
}

/* —— 主网格：单页无滚动 —— */
.main-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 560px minmax(0, 1fr) 480px;
  grid-template-rows: 228px minmax(250px, 0.70fr) minmax(0, 0.72fr);
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
</style>
