<template>
  <div class="rs-viewport">
    <div class="rs-stage">
      <div class="rs-screen">
        <!-- ===== 背景：深空底 + 顶光 + 网格 + 光斑 + 粒子 ===== -->
        <div class="rs-bg" aria-hidden="true">
          <span class="rs-bg-halo" />
          <span class="rs-bg-blob rs-bg-blob--a" />
          <span class="rs-bg-blob rs-bg-blob--b" />
          <span class="rs-bg-grid" />
          <span class="rs-bg-dots" />
          <span v-for="p in 32" :key="`pt${p}`" class="rs-bg-particle" :style="particleStyle(p)" />
        </div>

        <!-- ===== 顶部标题区：居中标题 + 两侧刻度装饰 + 右侧时钟 ===== -->
        <header class="rs-top">
          <div class="rs-top-side" aria-hidden="true">
            <span v-for="i in 6" :key="`tl${i}`" class="rs-tick" :style="{ opacity: 0.25 + i * 0.13 }" />
          </div>
          <div class="rs-title-block">
            <span class="rs-title-deco" aria-hidden="true" />
            <h1 class="rs-brand-title">{{ platformMeta.title }}</h1>
            <span class="rs-title-deco rs-title-deco--r" aria-hidden="true" />
          </div>
          <div class="rs-top-right">
            <span class="rs-status"><i />{{ platformMeta.status }}</span>
            <span class="rs-clock">{{ clockLine }}</span>
          </div>
        </header>

        <!-- ===== 主体：左（用户行为）· 中（资产总览）· 右（风险行为） ===== -->
        <main class="rs-main">
          <!-- 左栏：用户行为 -->
          <div class="rs-col rs-col--left">
            <section class="rs-panel rs-flex--2">
              <h3 class="rs-panel-title">用户行为总览</h3>
              <div class="rs-kpi-grid">
                <div v-for="u in userOverview" :key="u.key" class="rs-kpi">
                  <span class="rs-kpi-label">{{ u.label }}</span>
                  <span class="rs-kpi-value">
                    <CountUp class="rs-kpi-num" :end="u.value" :decimals="u.decimals || 0" />
                  </span>
                </div>
              </div>
            </section>

            <section class="rs-panel rs-flex--2">
              <h3 class="rs-panel-title">开源资产使用</h3>
              <div class="rs-kpi-grid">
                <div v-for="u in usageStats" :key="u.key" class="rs-kpi">
                  <span class="rs-kpi-label">{{ u.label }}</span>
                  <span class="rs-kpi-value">
                    <CountUp class="rs-kpi-num" :end="u.value" :decimals="u.decimals || 0" />
                    <em v-if="u.unit" class="rs-kpi-unit">{{ u.unit }}</em>
                  </span>
                </div>
              </div>
            </section>

            <section class="rs-panel rs-flex--3">
              <div class="rs-panel-hd">
                <h3 class="rs-panel-title">用户活跃 Top5</h3>
                <span class="rs-panel-note">按页面浏览量</span>
              </div>
              <div class="rs-user-rank">
                <div v-for="(u, i) in topUsers5" :key="u.name" class="rs-user-rank-row">
                  <span class="rs-user-rank-no" :class="`is-${i + 1}`">{{ i + 1 }}</span>
                  <span class="rs-user-rank-name" :title="u.name">{{ u.name }}</span>
                  <span class="rs-user-rank-bar"><i :style="{ width: u.bar }" /></span>
                  <span class="rs-user-rank-value">{{ u.pv.toLocaleString() }}</span>
                </div>
              </div>
            </section>

            <section class="rs-panel rs-flex--2">
              <div class="rs-panel-hd">
                <h3 class="rs-panel-title">最新数据动态</h3>
              </div>
              <div class="rs-panel-body">
                <ScreenScrollList :items="liveFeed" :duration="24" />
              </div>
            </section>
          </div>

          <!-- 中栏：资产总览主视觉 + 趋势 -->
          <div class="rs-col rs-col--center">
            <section class="rs-panel rs-hero">
              <h3 class="rs-panel-title">资产总览</h3>
              <div class="rs-hero-stage">
                <!-- 同心环能量球 -->
                <div class="rs-orb" aria-hidden="true">
                  <span class="rs-orb-ring rs-orb-ring--1" />
                  <span class="rs-orb-ring rs-orb-ring--2" />
                  <span class="rs-orb-ring rs-orb-ring--3" />
                  <span class="rs-orb-ring rs-orb-ring--4" />
                  <span class="rs-orb-core" />
                  <span class="rs-orb-sat rs-orb-sat--1" />
                  <span class="rs-orb-sat rs-orb-sat--2" />
                </div>
                <div class="rs-hero-total">
                  <span class="rs-hero-label">可信开源资产总数</span>
                  <span class="rs-hero-num"><CountUp :end="heroTotal.value" /></span>
                  <span class="rs-hero-unit">{{ heroTotal.unit }}</span>
                  <span class="rs-hero-hint">{{ heroTotal.hint }}</span>
                </div>
              </div>
              <div class="rs-hero-grid">
                <div v-for="c in heroSideCards" :key="c.key" class="rs-hero-cell">
                  <span class="rs-hero-cell-label">{{ c.label }}</span>
                  <span class="rs-hero-cell-value">
                    <CountUp class="rs-hero-cell-num" :end="c.value" />
                    <em v-if="c.unit" class="rs-hero-cell-unit">{{ c.unit }}</em>
                  </span>
                  <span class="rs-hero-cell-hint">{{ c.hint }}</span>
                </div>
              </div>
            </section>

            <section class="rs-panel rs-flex--3">
              <div class="rs-panel-hd">
                <h3 class="rs-panel-title">开源风险情报趋势</h3>
                <span class="rs-panel-note">近十年</span>
              </div>
              <div class="rs-panel-body">
                <ScreenLineChart :categories="riskTrendIndexed.years" :series="riskTrendIndexed.series" />
              </div>
            </section>
          </div>

          <!-- 右栏：风险行为 -->
          <div class="rs-col rs-col--right">
            <section class="rs-panel rs-flex--2">
              <h3 class="rs-panel-title">安全风险总览</h3>
              <div class="rs-risk-list">
                <div v-for="r in riskOverview" :key="r.key" class="rs-risk-row" :class="`is-${r.tone}`">
                  <span class="rs-risk-label">{{ r.label }}</span>
                  <CountUp class="rs-risk-num" :end="r.value" />
                </div>
              </div>
            </section>

            <section class="rs-panel rs-flex--3">
              <h3 class="rs-panel-title">漏洞风险等级分布</h3>
              <div class="rs-panel-body rs-donut-center">
                <ScreenDonutChart :data="vulnLevelDistribution" unit="" :radius="['52%', '72%']" />
              </div>
            </section>

            <section class="rs-panel rs-flex--3">
              <div class="rs-panel-hd">
                <h3 class="rs-panel-title">最新漏洞动态</h3>
                <span class="rs-panel-note">{{ vulnFeed.length }} 条</span>
              </div>
              <div class="rs-panel-body">
                <ScreenTable :columns="vulnColumns" :rows="vulnFeed" :duration="46" />
              </div>
            </section>

            <section class="rs-panel rs-flex--3">
              <div class="rs-panel-hd">
                <h3 class="rs-panel-title">恶意代码检测动态</h3>
                <span class="rs-panel-note">{{ malwareFeed.length }} 条</span>
              </div>
              <div class="rs-panel-body">
                <ScreenTable :columns="malwareColumns" :rows="malwareFeed" :duration="34" />
              </div>
            </section>
          </div>
        </main>

        <!-- ===== 底部备案 ===== -->
        <footer class="rs-footer">
          <span>{{ footerInfo.copyright }}</span>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 可信开源代码库数据大屏 · 政务科技风三栏布局
 *
 * 布局参考经典政务大屏「左-中-右」三栏：
 *   左栏 = 用户行为（行为总览 KPI / 用户活跃 Top5 / 最新数据动态）
 *   中栏 = 资产总览主视觉（同心环能量球 + 分项卡片）+ 开源风险情报趋势
 *   右栏 = 风险行为（安全风险总览 / 漏洞等级分布 / 漏洞动态 / 恶意代码检测动态）
 *
 * 视觉：深空蓝底 + #005BCB 品牌青蓝 + 面板四角括号 + 中央能量球；
 *       克制发光与装饰密度，保证政务场景的高级感。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import CountUp from '../../components/CountUp.vue'
import ScreenLineChart from '../../components/screen/ScreenLineChart.vue'
import ScreenDonutChart from '../../components/screen/ScreenDonutChart.vue'
import ScreenScrollList from '../../components/screen/ScreenScrollList.vue'
import ScreenTable from '../../components/screen/ScreenTable.vue'
import {
  platformMeta,
  assetCards,
  riskOverview,
  vulnLevelDistribution,
  vulnFeed,
  malwareFeed,
  riskTrendIndexed,
  userOverview,
  usageStats,
  topUsers,
  liveFeed,
  footerInfo,
} from '../../data/regulatorScreenData.js'

/* ===== 资产总览：中心总数 + 环侧分项 ===== */
const heroTotal = assetCards.find((c) => c.key === 'total') || { value: 0, unit: '', hint: '' }
const heroSideCards = assetCards.filter((c) => c.key !== 'total')

/* ===== 用户活跃 Top5（按 PV 归一化进度条）===== */
const topUsers5 = computed(() => {
  const list = topUsers.slice(0, 5)
  const max = Math.max(...list.map((u) => u.pv), 1)
  return list.map((u) => ({ ...u, bar: `${Math.max(12, Math.round((u.pv / max) * 100))}%` }))
})

/* ===== 表格列定义 ===== */
const vulnColumns = [
  { key: 'level', label: '等级', width: '56px', align: 'center', tag: true },
  { key: 'time', label: '时间', width: '78px' },
  { key: 'name', label: '软件名称', width: 'minmax(0, 1fr)' },
  { key: 'version', label: '版本', width: '64px' },
  { key: 'cve', label: '漏洞编号', width: '110px' },
]

const malwareColumns = [
  { key: 'software', label: '软件', width: 'minmax(0, 1fr)' },
  { key: 'category', label: '恶意类别', width: '72px' },
  { key: 'threatLevel', label: '威胁等级', width: '62px', align: 'center', tag: true },
  { key: 'result', label: '检测结果', width: '74px', align: 'center', tag: true },
]

/* ===== 顶部时钟 ===== */
const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
const now = ref(new Date())
let clockTimer = null

const pad2 = (n) => String(n).padStart(2, '0')
const clockLine = computed(() => {
  const d = now.value
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}  ${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${WEEKDAYS[d.getDay()]}`
})

/** 背景粒子：确定性伪随机（同一序号位置固定，避免刷新跳动） */
function particleStyle(i) {
  const rnd = ((i * 9301 + 49297) % 233280) / 233280
  const rnd2 = ((i * 4523 + 12345) % 233280) / 233280
  return {
    left: `${(rnd * 100).toFixed(2)}%`,
    top: `${(rnd2 * 100).toFixed(2)}%`,
    animationDelay: `${(rnd * 9).toFixed(2)}s`,
    animationDuration: `${9 + (i % 5) * 2}s`,
  }
}

onMounted(() => {
  clockTimer = window.setInterval(() => { now.value = new Date() }, 1000)
})

onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer)
})
</script>

<style scoped>
/* ==================================================================
   政务科技风 · 三栏驾驶舱（流式自适应）
   深空蓝底 / #005BCB 品牌青蓝 / 中央能量球 / 四角括号面板
   ================================================================== */
.rs-viewport {
  /* 品牌与辉光层次 */
  --brand: #005BCB;
  --brand-bright: #38BDF8;
  --cyan: #22D3EE;
  --gold: #FFD98A;
  /* 文字层次 */
  --text-strong: #F5FAFF;
  --text: #D6E7FA;
  --text-sub: #9DC0E4;
  --text-dim: #6F94BC;
  /* 告警色：仅高危与异常 */
  --danger: #FF6B6B;
  --warn: #FBBF6E;
  /* 面板 */
  --glass: rgba(16, 56, 108, 0.3);
  --glass-strong: rgba(20, 68, 128, 0.42);
  --hairline: rgba(0, 145, 255, 0.4);
  --hairline-soft: rgba(0, 145, 255, 0.2);
  --gap: 12px;

  width: 100vw;
  height: 100vh;
  overflow: hidden;
  /* 深空蓝：上亮下暗的纵深感，顶部青光聚焦 */
  background:
    radial-gradient(1300px 620px at 50% -12%, rgba(0, 132, 220, 0.32), transparent 64%),
    radial-gradient(900px 520px at 6% 6%, rgba(0, 91, 203, 0.28), transparent 60%),
    radial-gradient(900px 520px at 96% 8%, rgba(34, 211, 238, 0.14), transparent 62%),
    linear-gradient(180deg, #0A2E52 0%, #072040 52%, #051630 100%);
}
.rs-stage {
  width: 100%;
  height: 100%;
}
.rs-screen {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px 16px 6px;
  box-sizing: border-box;
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  color: var(--text);
}

/* ===== 背景装饰 ===== */
.rs-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
.rs-bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  will-change: transform;
}
.rs-bg-blob--a {
  top: -12%; left: 6%; width: 44%; height: 38%;
  background: radial-gradient(circle, rgba(0, 132, 220, 0.24), transparent 68%);
  animation: rs-blob-a 32s ease-in-out infinite;
}
.rs-bg-blob--b {
  bottom: -14%; right: 2%; width: 42%; height: 36%;
  background: radial-gradient(circle, rgba(34, 211, 238, 0.13), transparent 70%);
  animation: rs-blob-b 38s ease-in-out infinite;
}
@keyframes rs-blob-a {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(6%, 8%) scale(1.1); }
}
@keyframes rs-blob-b {
  0%, 100% { transform: translate(0, 0) scale(1.05); }
  50% { transform: translate(-7%, -6%) scale(1); }
}
.rs-bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 145, 255, 0.11) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 145, 255, 0.11) 1px, transparent 1px);
  background-size: 76px 76px;
  mask-image: radial-gradient(ellipse at 50% 36%, #000 20%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse at 50% 36%, #000 20%, transparent 80%);
}
.rs-bg-dots {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(56, 189, 248, 0.14) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: radial-gradient(ellipse at 50% 45%, #000 15%, transparent 78%);
  -webkit-mask-image: radial-gradient(ellipse at 50% 45%, #000 15%, transparent 78%);
}
/* 漂浮粒子 */
.rs-bg-particle {
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: rgba(56, 189, 248, 0.55);
  box-shadow: 0 0 6px rgba(56, 189, 248, 0.5);
  opacity: 0;
  animation-name: rs-particle;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}
@keyframes rs-particle {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
  50% { transform: translateY(-30px) scale(1.25); opacity: 0.8; }
}

/* ===== 顶部标题区 ===== */
.rs-top {
  position: relative;
  z-index: 5;
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  height: clamp(52px, 6.5vh, 70px);
  padding-bottom: 10px;
}
/* 横幅底部流光线 */
.rs-top::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background:
    linear-gradient(90deg, transparent, rgba(0, 145, 255, 0.75) 18%, rgba(34, 211, 238, 0.9) 50%, rgba(0, 145, 255, 0.75) 82%, transparent);
}
.rs-top-side {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}
.rs-tick {
  width: clamp(18px, 1.6vw, 30px);
  height: 3px;
  border-radius: 2px;
  background: linear-gradient(90deg, rgba(56, 189, 248, 0.85), rgba(0, 91, 203, 0.1));
}
.rs-title-block {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 14px;
}
.rs-brand-title {
  margin: 0;
  font-size: clamp(19px, 1.56vw, 30px);
  font-weight: 700;
  letter-spacing: clamp(3px, 0.31vw, 6px);
  background: linear-gradient(180deg, #FFFFFF 22%, #BFE7FF 55%, #56C2FF 88%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 16px rgba(86, 194, 255, 0.45));
  white-space: nowrap;
}
.rs-title-deco {
  width: clamp(30px, 2.8vw, 54px);
  height: 10px;
  clip-path: polygon(0 50%, 30% 0, 100% 0, 70% 50%, 100% 100%, 30% 100%);
  background: linear-gradient(90deg, rgba(56, 189, 248, 0.15), var(--brand-bright));
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
}
.rs-title-deco--r {
  transform: scaleX(-1);
  background: linear-gradient(90deg, rgba(34, 211, 238, 0.15), var(--cyan));
}
.rs-top-right {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}
.rs-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  font-size: 12px;
  color: #6EE7A8;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.35);
  border-radius: 20px;
  white-space: nowrap;
}
.rs-status i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #34D399;
  box-shadow: 0 0 8px rgba(52, 211, 153, 0.8);
  animation: rs-blink 2s ease-in-out infinite;
}
@keyframes rs-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
.rs-clock {
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: clamp(12px, 0.95vw, 16px);
  font-weight: 600;
  color: var(--brand-bright);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

/* ===== 主体三栏 ===== */
.rs-main {
  position: relative;
  z-index: 2;
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 26fr 48fr 26fr;
  /* 关键：行高约束在可用空间内，防止面板内容把整页撑出视口 */
  grid-template-rows: minmax(0, 1fr);
  gap: var(--gap);
  padding-top: var(--gap);
}
.rs-col {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--gap);
}
/* 栏内纵向配比：数值越大分得越高 */
.rs-flex--2 { flex: 2; }
.rs-flex--3 { flex: 3; }
.rs-col--center .rs-hero { flex: 5; }

/* ===== 面板：玻璃面 + 辉光勾边 + 四角科技括号 ===== */
.rs-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 10px 13px 12px;
  background-image: linear-gradient(160deg, var(--glass-strong) 0%, var(--glass) 100%);
  border: 1px solid var(--hairline);
  border-radius: 6px;
  box-shadow:
    0 0 18px rgba(0, 145, 255, 0.12) inset,
    0 8px 26px rgba(0, 4, 12, 0.45);
  backdrop-filter: blur(7px);
  overflow: hidden;
  animation: rs-enter 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) both;
}
@keyframes rs-enter {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
/* 面板顶缘辉光线 */
.rs-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, rgba(56, 189, 248, 0.9), rgba(34, 211, 238, 0.4) 50%, transparent 92%);
  pointer-events: none;
}
/* 四角科技括号 */
.rs-panel::after {
  content: '';
  position: absolute;
  inset: 5px;
  pointer-events: none;
  background:
    linear-gradient(var(--brand-bright), var(--brand-bright)) left top / 12px 2px no-repeat,
    linear-gradient(var(--brand-bright), var(--brand-bright)) left top / 2px 12px no-repeat,
    linear-gradient(var(--brand-bright), var(--brand-bright)) right top / 12px 2px no-repeat,
    linear-gradient(var(--brand-bright), var(--brand-bright)) right top / 2px 12px no-repeat,
    linear-gradient(var(--brand-bright), var(--brand-bright)) left bottom / 12px 2px no-repeat,
    linear-gradient(var(--brand-bright), var(--brand-bright)) left bottom / 2px 12px no-repeat,
    linear-gradient(var(--brand-bright), var(--brand-bright)) right bottom / 12px 2px no-repeat,
    linear-gradient(var(--brand-bright), var(--brand-bright)) right bottom / 2px 12px no-repeat;
  opacity: 0.4;
  transition: opacity 0.25s;
}
.rs-panel:hover::after { opacity: 1; }

.rs-panel-hd {
  flex-shrink: 0;
  display: flex;
  align-items: baseline;
  gap: 9px;
}
.rs-panel-title {
  position: relative;
  margin: 0 0 8px;
  padding-left: 13px;
  font-size: clamp(11.5px, 0.7vw, 13.5px);
  font-weight: 600;
  letter-spacing: 0.8px;
  color: var(--text-strong);
  white-space: nowrap;
}
.rs-panel-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 2px;
  bottom: 2px;
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--cyan), rgba(0, 91, 203, 0.35));
  box-shadow: 0 0 8px rgba(34, 211, 238, 0.6);
}
.rs-panel-hd .rs-panel-title { margin-bottom: 0; }
.rs-panel-note {
  font-size: 10.5px;
  color: var(--text-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rs-panel-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* ===== 中栏主视觉：能量球 ===== */
.rs-hero-stage {
  position: relative;
  flex: 1;
  min-height: 0;
  display: grid;
  place-items: center;
}
.rs-orb {
  position: relative;
  width: min(38vh, 72%);
  aspect-ratio: 1;
}
/* 同心环：错速旋转 */
.rs-orb-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1px solid rgba(56, 189, 248, 0.28);
}
.rs-orb-ring--1 { animation: rs-spin 26s linear infinite; border-top-color: rgba(56, 189, 248, 0.85); }
.rs-orb-ring--2 {
  inset: 9%;
  border-style: dashed;
  border-color: rgba(0, 145, 255, 0.22);
  border-bottom-color: rgba(34, 211, 238, 0.7);
  animation: rs-spin 38s linear infinite reverse;
}
.rs-orb-ring--3 { inset: 19%; border-color: rgba(0, 145, 255, 0.16); border-top-color: rgba(56, 189, 248, 0.5); animation: rs-spin 30s linear infinite; }
.rs-orb-ring--4 { inset: 30%; border-color: rgba(34, 211, 238, 0.12); }
@keyframes rs-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
/* 核心光球 */
.rs-orb-core {
  position: absolute;
  inset: 38%;
  border-radius: 50%;
  background:
    radial-gradient(circle at 38% 32%, rgba(120, 210, 255, 0.55), rgba(0, 91, 203, 0.4) 55%, rgba(4, 22, 48, 0.9) 100%);
  box-shadow:
    0 0 34px rgba(56, 189, 248, 0.5),
    0 0 90px rgba(0, 132, 220, 0.35) inset;
  animation: rs-breathe 5s ease-in-out infinite;
}
@keyframes rs-breathe {
  0%, 100% { box-shadow: 0 0 26px rgba(56, 189, 248, 0.4), 0 0 80px rgba(0, 132, 220, 0.3) inset; }
  50% { box-shadow: 0 0 48px rgba(56, 189, 248, 0.65), 0 0 110px rgba(0, 132, 220, 0.4) inset; }
}
/* 环上卫星光点 */
.rs-orb-sat {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 7px;
  height: 7px;
  margin: -3.5px;
  border-radius: 50%;
  background: #7DDCFF;
  box-shadow: 0 0 12px rgba(125, 220, 255, 0.95);
}
.rs-orb-sat--1 { animation: rs-orbit-a 26s linear infinite; }
.rs-orb-sat--2 { animation: rs-orbit-b 38s linear infinite; }
@keyframes rs-orbit-a {
  from { transform: rotate(0deg) translateX(calc(min(38vh, 72%) / 2)); }
  to { transform: rotate(360deg) translateX(calc(min(38vh, 72%) / 2)); }
}
@keyframes rs-orbit-b {
  from { transform: rotate(160deg) translateX(calc(min(38vh, 72%) * 0.41)); }
  to { transform: rotate(-200deg) translateX(calc(min(38vh, 72%) * 0.41)); }
}
/* 中心数字 */
.rs-hero-total {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-align: center;
  transform: translateY(-6%);
}
.rs-hero-label {
  font-size: clamp(12px, 0.85vw, 15px);
  letter-spacing: 3px;
  color: var(--text-sub);
}
.rs-hero-num {
  font-family: 'DIN Alternate', 'Bahnschrift', ui-monospace, monospace;
  font-size: clamp(34px, 3.4vw, 62px);
  font-weight: 700;
  line-height: 1.05;
  color: #FFFFFF;
  text-shadow: 0 0 26px rgba(56, 189, 248, 0.75);
  font-variant-numeric: tabular-nums;
}
.rs-hero-unit {
  font-size: clamp(12px, 0.9vw, 15px);
  color: var(--gold);
}
.rs-hero-hint {
  font-size: 10.5px;
  color: #6EE7A8;
}
/* 球下分项：5 张数据卡 */
.rs-hero-grid {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  padding-top: 4px;
}
.rs-hero-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  background: rgba(6, 34, 70, 0.55);
  border: 1px solid var(--hairline-soft);
  border-radius: 6px;
  overflow: hidden;
  transition: border-color 0.2s;
}
.rs-hero-cell::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, var(--cyan), transparent);
}
.rs-hero-cell:hover { border-color: rgba(34, 211, 238, 0.55); }
.rs-hero-cell-label {
  font-size: 10.5px;
  color: var(--text-sub);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rs-hero-cell-value { display: flex; align-items: baseline; gap: 3px; }
.rs-hero-cell-num {
  font-family: 'DIN Alternate', ui-monospace, monospace;
  font-size: clamp(15px, 1.2vw, 22px);
  font-weight: 700;
  color: var(--text-strong);
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 14px rgba(56, 189, 248, 0.5);
}
.rs-hero-cell-unit { font-style: normal; font-size: 10px; color: var(--text-sub); }
.rs-hero-cell-hint {
  font-size: 9.5px;
  color: var(--text-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===== 左栏：用户行为 KPI ===== */
.rs-kpi-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(3, minmax(0, 1fr));
  gap: 7px;
}
.rs-kpi {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  padding: 5px 10px;
  background: rgba(6, 34, 70, 0.55);
  border: 1px solid var(--hairline-soft);
  border-radius: 6px;
  overflow: hidden;
}
.rs-kpi-label {
  font-size: 10.5px;
  color: var(--text-sub);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rs-kpi-num {
  font-family: 'DIN Alternate', ui-monospace, monospace;
  font-size: clamp(14px, 1.05vw, 20px);
  font-weight: 700;
  color: var(--brand-bright);
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 14px rgba(56, 189, 248, 0.5);
}

/* ===== 左栏：用户活跃 Top5 ===== */
.rs-user-rank {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-rows: repeat(5, minmax(0, 1fr));
  gap: 5px;
}
.rs-user-rank-row {
  display: grid;
  grid-template-columns: 18px minmax(0, 1.2fr) minmax(0, 1fr) 46px;
  align-items: center;
  gap: 7px;
  padding: 0 8px;
  background: rgba(6, 34, 70, 0.55);
  border: 1px solid var(--hairline-soft);
  border-radius: 5px;
  overflow: hidden;
}
.rs-user-rank-no {
  width: 15px;
  height: 15px;
  display: grid;
  place-items: center;
  font-family: ui-monospace, monospace;
  font-size: 9.5px;
  font-weight: 700;
  color: var(--text-sub);
  background: rgba(56, 120, 190, 0.24);
  border-radius: 3px;
}
.rs-user-rank-no.is-1 { color: #1A1305; background: linear-gradient(160deg, #FFE08A, #E8B33B); }
.rs-user-rank-no.is-2 { color: #0E1622; background: linear-gradient(160deg, #E8F1FA, #AFC4D8); }
.rs-user-rank-no.is-3 { color: #211004; background: linear-gradient(160deg, #F0BE93, #C77E45); }
.rs-user-rank-name {
  font-size: 10.5px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rs-user-rank-bar {
  height: 5px;
  border-radius: 3px;
  background: rgba(3, 14, 29, 0.6);
  overflow: hidden;
}
.rs-user-rank-bar i {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, rgba(0, 91, 203, 0.6), #38BDF8);
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.5);
}
.rs-user-rank-value {
  font-family: ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  color: var(--brand-bright);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* ===== 右栏：安全风险总览 ===== */
.rs-risk-list {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-rows: repeat(3, minmax(0, 1fr));
  gap: 7px;
}
.rs-risk-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 5px 11px 5px 16px;
  background: rgba(6, 34, 70, 0.55);
  border: 1px solid var(--hairline-soft);
  border-radius: 6px;
}
.rs-risk-row::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 20%;
  bottom: 20%;
  width: 3px;
  border-radius: 2px;
  background: var(--brand-bright);
  box-shadow: 0 0 6px rgba(56, 189, 248, 0.5);
}
.rs-risk-label { font-size: 11.5px; color: var(--text-sub); white-space: nowrap; }
.rs-risk-num {
  font-family: 'DIN Alternate', ui-monospace, monospace;
  font-size: clamp(16px, 1.2vw, 23px);
  font-weight: 700;
  color: var(--text-strong);
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 14px rgba(56, 189, 248, 0.5);
}
/* 漏洞总数（primary）：淡红 */
.rs-risk-row.is-primary { border-color: rgba(255, 138, 138, 0.5); }
.rs-risk-row.is-primary::before { background: #FF8A8A; box-shadow: 0 0 10px rgba(255, 138, 138, 0.85); }
.rs-risk-row.is-primary .rs-risk-num {
  color: #FF8A8A;
  text-shadow: 0 0 16px rgba(255, 138, 138, 0.7);
}
/* 高危漏洞数（danger）：深红 */
.rs-risk-row.is-danger { border-color: rgba(183, 28, 28, 0.75); }
.rs-risk-row.is-danger::before { background: #B71C1C; box-shadow: 0 0 10px rgba(183, 28, 28, 0.9); }
.rs-risk-row.is-danger .rs-risk-num { color: #D32F2F; text-shadow: 0 0 16px rgba(183, 28, 28, 0.9); }
.rs-risk-row.is-warn { border-color: rgba(251, 191, 110, 0.5); }
.rs-risk-row.is-warn::before { background: var(--warn); box-shadow: 0 0 10px rgba(251, 191, 110, 0.9); }
.rs-risk-row.is-warn .rs-risk-num { color: #FFC876; text-shadow: 0 0 16px rgba(251, 191, 110, 0.7); }

/* ===== 右栏：漏洞等级分布（环形居中，图例置底横排） ===== */
.rs-donut-center :deep(.donut) {
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}
.rs-donut-center :deep(.donut-chart) {
  flex: 1 1 auto;
  width: 100%;
  min-height: 0;
}
.rs-donut-center :deep(.donut-legend) {
  flex: none;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px 14px;
}
.rs-donut-center :deep(.donut-legend-item) { flex: none; }

/* ===== 底部备案 ===== */
.rs-footer {
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  font-size: 10.5px;
  color: var(--text-dim);
}

/* 各面板依次入场 */
.rs-col--left .rs-panel:nth-child(1) { animation-delay: 0.05s; }
.rs-col--left .rs-panel:nth-child(2) { animation-delay: 0.12s; }
.rs-col--left .rs-panel:nth-child(3) { animation-delay: 0.19s; }
.rs-col--center .rs-panel:nth-child(1) { animation-delay: 0.09s; }
.rs-col--center .rs-panel:nth-child(2) { animation-delay: 0.16s; }
.rs-col--right .rs-panel:nth-child(1) { animation-delay: 0.07s; }
.rs-col--right .rs-panel:nth-child(2) { animation-delay: 0.14s; }
.rs-col--right .rs-panel:nth-child(3) { animation-delay: 0.21s; }
.rs-col--right .rs-panel:nth-child(4) { animation-delay: 0.28s; }

/* 尊重系统「减少动态效果」偏好 */
@media (prefers-reduced-motion: reduce) {
  .rs-panel,
  .rs-bg-blob,
  .rs-bg-particle,
  .rs-orb-ring,
  .rs-orb-core,
  .rs-orb-sat,
  .rs-status i {
    animation: none !important;
  }
}
</style>
