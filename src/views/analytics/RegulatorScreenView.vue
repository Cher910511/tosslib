<template>
  <div class="rs-viewport">
    <div class="rs-stage" :style="stageStyle">
      <div class="rs-screen">
        <!-- ===== 背景：极淡网格 / 坐标线 / 抽象节点网络 / 扫描线 / 粒子 ===== -->
        <div class="rs-bg" aria-hidden="true">
          <span class="rs-bg-halo" />
          <span class="rs-bg-aurora rs-bg-aurora--a" />
          <span class="rs-bg-aurora rs-bg-aurora--b" />
          <span class="rs-bg-aurora rs-bg-aurora--c" />
          <span class="rs-bg-grid" />
          <span class="rs-bg-diag" />
          <span class="rs-bg-coord" />
          <span class="rs-bg-network" />
          <span class="rs-bg-constellation" />
          <span class="rs-bg-orbit rs-bg-orbit--1" />
          <span class="rs-bg-orbit rs-bg-orbit--2" />
          <span class="rs-bg-orbit rs-bg-orbit--3" />
          <span class="rs-bg-streak rs-bg-streak--a" />
          <span class="rs-bg-streak rs-bg-streak--b" />
          <span class="rs-bg-scan" />
          <span v-for="p in 24" :key="`d${p}`" class="rs-bg-dot" :style="particleStyle(p)" />
          <span class="rs-bg-corner rs-bg-corner--tl" />
          <span class="rs-bg-corner rs-bg-corner--tr" />
          <span class="rs-bg-corner rs-bg-corner--bl" />
          <span class="rs-bg-corner rs-bg-corner--br" />
        </div>

        <!-- ===== 顶部品牌标题区（标题居中，两侧对称装饰）===== -->
        <header class="rs-top">
          <div class="rs-top-side" aria-hidden="true">
            <span v-for="i in 5" :key="`tl${i}`" class="rs-tick" :style="{ opacity: 0.35 + i * 0.13 }" />
          </div>
          <div class="rs-title-block">
            <span class="rs-title-deco" aria-hidden="true" />
            <h1 class="rs-brand-title">{{ platformMeta.title }}</h1>
            <span class="rs-title-deco rs-title-deco--r" aria-hidden="true" />
          </div>
          <div class="rs-top-right">
            <div class="rs-clock">
              <span class="rs-clock-time">{{ clockLine }}</span>
            </div>
          </div>
        </header>

        <!-- ===== 主体：非对称模块化布局 ===== -->
        <main class="rs-main">
          <!-- 资产总览 -->
          <section class="rs-panel p-assets">
            <h3 class="rs-panel-title">资产总览</h3>
            <div class="rs-asset-grid">
              <div
                v-for="c in assetCards"
                :key="c.key"
                class="rs-asset"
                :class="{ 'is-featured': c.featured }"
              >
                <span class="rs-asset-label">{{ c.label }}</span>
                <span class="rs-asset-value">
                  <CountUp class="rs-asset-num" :end="c.value" />
                  <em v-if="c.unit" class="rs-asset-unit">{{ c.unit }}</em>
                </span>
                <span v-if="c.hint" class="rs-asset-hint">{{ c.hint }}</span>
              </div>
            </div>
          </section>

          <!-- 最新漏洞动态 -->
          <section class="rs-panel p-vulnfeed">
            <div class="rs-panel-hd">
              <h3 class="rs-panel-title">最新漏洞动态</h3>
              <span class="rs-panel-count">{{ vulnFeed.length }} 条</span>
            </div>
            <div class="rs-panel-body">
              <ScreenTable :columns="vulnColumns" :rows="vulnFeed" :duration="46" />
            </div>
          </section>

          <!-- 安全风险总览 -->
          <section class="rs-panel p-risk">
            <h3 class="rs-panel-title">安全风险总览</h3>
            <div class="rs-risk-list">
              <div v-for="r in riskOverview" :key="r.key" class="rs-risk-row" :class="`is-${r.tone}`">
                <span class="rs-risk-label">{{ r.label }}</span>
                <CountUp class="rs-risk-num" :end="r.value" />
              </div>
            </div>
          </section>

          <!-- 漏洞风险等级分布（环形） -->
          <section class="rs-panel p-vulnlevel">
            <h3 class="rs-panel-title">漏洞风险等级分布</h3>
            <div class="rs-panel-body">
              <ScreenDonutChart :data="vulnLevelDistribution" unit="" :radius="['50%', '74%']" />
            </div>
          </section>

          <!-- 恶意代码检测动态 -->
          <section class="rs-panel p-malware">
            <div class="rs-panel-hd">
              <h3 class="rs-panel-title">恶意代码检测动态</h3>
              <span class="rs-panel-count">{{ malwareFeed.length }} 条</span>
            </div>
            <div class="rs-panel-body">
              <ScreenTable :columns="malwareColumns" :rows="malwareFeed" :duration="34" />
            </div>
          </section>

          <!-- 风险情报趋势（面积） -->
          <section class="rs-panel p-trend">
            <div class="rs-panel-hd">
              <h3 class="rs-panel-title">开源风险情报趋势</h3>
              <span class="rs-panel-note">近十年 · 指数化（首年 = 100）</span>
            </div>
            <div class="rs-panel-body">
              <ScreenLineChart :categories="riskTrendIndexed.years" :series="riskTrendIndexed.series" />
            </div>
          </section>

          <!-- 技术栈分类分布（榜单） -->
          <section class="rs-panel p-tech">
            <div class="rs-panel-hd">
              <h3 class="rs-panel-title">技术栈分类</h3>
              <span class="rs-panel-note">共 {{ techStackTotal }} 类 · Top 10</span>
            </div>
            <div class="rs-panel-body">
              <ScreenRankList :data="techStackTop10" />
            </div>
          </section>

          <!-- 开发者国家 Top10（横向条形） -->
          <section class="rs-panel p-country">
            <h3 class="rs-panel-title">开源贡献者国家 Top10</h3>
            <div class="rs-panel-body">
              <ScreenBarChart :data="developerCountries" direction="horizontal" />
            </div>
          </section>

          <!-- 开源资产使用统计 -->
          <section class="rs-panel p-usage">
            <h3 class="rs-panel-title">开源资产使用</h3>
            <div class="rs-kpi-grid">
              <div v-for="u in usageStats" :key="u.key" class="rs-kpi">
                <span class="rs-kpi-label">{{ u.label }}</span>
                <span class="rs-kpi-value">
                  <CountUp class="rs-kpi-num" :end="u.value" :decimals="u.decimals || 0" />
                  <em class="rs-kpi-unit">{{ u.unit }}</em>
                </span>
              </div>
            </div>
          </section>

          <!-- 用户信息与行为（KPI + 用户活跃 Top5） -->
          <section class="rs-panel p-user">
            <h3 class="rs-panel-title">用户信息与行为</h3>
            <div class="rs-kpi-grid rs-kpi-grid--user">
              <div v-for="u in userOverview" :key="u.key" class="rs-kpi">
                <span class="rs-kpi-label">{{ u.label }}</span>
                <span class="rs-kpi-value">
                  <CountUp class="rs-kpi-num" :end="u.value" :decimals="u.decimals || 0" />
                </span>
              </div>
            </div>
            <div class="rs-user-rank">
              <div class="rs-user-rank-hd">用户活跃 Top5<span>按页面浏览量</span></div>
              <div class="rs-user-rank-list">
                <div v-for="(u, i) in topUsers5" :key="u.name" class="rs-user-rank-row">
                  <span class="rs-user-rank-no" :class="`is-${i + 1}`">{{ i + 1 }}</span>
                  <span class="rs-user-rank-name" :title="u.name">{{ u.name }}</span>
                  <span class="rs-user-rank-bar"><i :style="{ width: u.bar }" /></span>
                  <span class="rs-user-rank-value">{{ u.pv.toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- 最新数据动态 -->
          <section class="rs-panel p-feed">
            <div class="rs-panel-hd">
              <h3 class="rs-panel-title">最新数据动态</h3>
            </div>
            <div class="rs-panel-body">
              <ScreenScrollList :items="liveFeed" :duration="24" />
            </div>
          </section>
        </main>

        <!-- ===== 底部版权 ===== -->
        <footer class="rs-footer">
          <span>{{ footerInfo.copyright }}</span>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 可信开源代码库数据大屏 · 数据驾驶舱（1920×1080 单屏）
 *
 * 视觉方向：深色 · 克制科技感 · 数据驾驶舱
 * - 深海军蓝渐变底 + 半透明玻璃卡片 + 极细 #005BCB 描边
 * - 非对称模块化布局，关系网络作为中心视觉焦点
 * - 橙色/红色仅用于高危与告警，正常数据用蓝/青/白分层
 *
 * 数据原则：平台已有概念取自 mockData.js；下载与接口、访问行为两块
 * 取自平台真实数据看板（cntoss.cn /admin/board，近 7 天）。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import CountUp from '../../components/CountUp.vue'
import ScreenBarChart from '../../components/screen/ScreenBarChart.vue'
import ScreenLineChart from '../../components/screen/ScreenLineChart.vue'
import ScreenDonutChart from '../../components/screen/ScreenDonutChart.vue'
import ScreenScrollList from '../../components/screen/ScreenScrollList.vue'
import ScreenTable from '../../components/screen/ScreenTable.vue'
import ScreenRankList from '../../components/screen/ScreenRankList.vue'
import {
  platformMeta,
  assetCards,
  riskOverview,
  vulnLevelDistribution,
  vulnFeed,
  malwareFeed,
  riskTrendIndexed,
  techStackTop10,
  techStackTotal,
  developerCountries,
  usageStats,
  userOverview,
  topUsers,
  liveFeed,
  footerInfo,
} from '../../data/regulatorScreenData.js'

/* ===== 用户活跃 Top5（真实数据，按 PV 归一化进度条）===== */
const topUsers5 = computed(() => {
  const list = topUsers.slice(0, 5)
  const max = Math.max(...list.map((u) => u.pv), 1)
  return list.map((u) => ({ ...u, bar: `${Math.max(12, Math.round((u.pv / max) * 100))}%` }))
})

/* ===== 表格列定义 ===== */
const vulnColumns = [
  { key: 'level', label: '等级', width: '62px', align: 'center', tag: true },
  { key: 'time', label: '时间', width: '82px' },
  { key: 'name', label: '软件名称', width: 'minmax(0, 1fr)' },
  { key: 'version', label: '版本', width: '74px' },
  { key: 'cve', label: '漏洞编号', width: '124px' },
  { key: 'cwe', label: 'CWE 类型', width: 'minmax(0, 1fr)' },
]

const malwareColumns = [
  { key: 'software', label: '软件', width: 'minmax(0, 1fr)' },
  { key: 'category', label: '恶意类别', width: '80px' },
  { key: 'type', label: '类型小类', width: 'minmax(0, 0.85fr)' },
  { key: 'threatLevel', label: '威胁等级', width: '72px', align: 'center', tag: true },
  { key: 'result', label: '检测结果', width: '84px', align: 'center', tag: true },
]

/* ===== 设计尺寸与等比缩放（1920×1080，铺满视口，不滚动）===== */
const DESIGN_W = 1920
const DESIGN_H = 1080

function computeScale() {
  if (typeof window === 'undefined') return 1
  return Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H)
}

const scale = ref(computeScale())
const stageStyle = computed(() => ({ transform: `scale(${scale.value})` }))

let resizeTimer = null
function onResize() {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => { scale.value = computeScale() }, 120)
}

/* ===== 顶部时钟 ===== */
const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
const now = ref(new Date())
let clockTimer = null

const pad2 = (n) => String(n).padStart(2, '0')
const clockTime = computed(() => {
  const d = now.value
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
})
const clockDate = computed(() => {
  const d = now.value
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${WEEKDAYS[d.getDay()]}`
})

/** 时钟：时间与日期拼成一行展示 */
const clockLine = computed(() => {
  const d = now.value
  return `${clockTime.value}  ${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${WEEKDAYS[d.getDay()]}`
})

/** 背景漂浮光点：确定性伪随机（同一序号位置固定，避免刷新跳动） */
function particleStyle(i) {
  const rnd = ((i * 9301 + 49297) % 233280) / 233280
  const rnd2 = ((i * 4523 + 12345) % 233280) / 233280
  return {
    left: `${(rnd * 100).toFixed(2)}%`,
    top: `${(rnd2 * 100).toFixed(2)}%`,
    animationDelay: `${(rnd * 9).toFixed(2)}s`,
    animationDuration: `${8 + (i % 6) * 1.8}s`,
  }
}

onMounted(() => {
  window.addEventListener('resize', onResize)
  clockTimer = window.setInterval(() => { now.value = new Date() }, 1000)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (resizeTimer) clearTimeout(resizeTimer)
  if (clockTimer) clearInterval(clockTimer)
})
</script>

<style scoped>
/* ==================================================================
   深色数据驾驶舱 · 1920×1080 单屏等比缩放
   品牌色 #005BCB；深海军蓝渐变；玻璃卡片；极细描边
   ================================================================== */
.rs-viewport {
  /* 品牌与文字层次 */
  --brand: #005BCB;
  --brand-bright: #4CD7FF;
  --cyan: #2DE3EE;
  --text-strong: #F7FBFF;
  --text: #DCE9F8;
  --text-sub: #AFC7E4;
  --text-dim: #8AA6C6;
  /* 告警色：仅用于高危与异常 */
  --danger: #FF6B6B;
  --warn: #FBBF6E;
  --ok: #6EE7A8;
  /* 玻璃卡片 */
  --glass: rgba(43, 92, 154, 0.62);
  --glass-strong: rgba(52, 108, 176, 0.72);
  --hairline: rgba(0, 145, 255, 0.52);
  --hairline-soft: rgba(0, 145, 255, 0.3);
  --gap: 11px;

  width: 100vw;
  height: 100vh;
  overflow: hidden;
  /* 深海军蓝 → 蓝黑渐变，克制、不做大面积亮色渐变 */
  /* 青蓝驾驶舱底：色相从藏青往青调一档，层次更透亮 */
  background:
    radial-gradient(1200px 640px at 16% -8%, rgba(0, 137, 201, 0.4), transparent 62%),
    radial-gradient(1000px 560px at 88% 4%, rgba(45, 212, 235, 0.26), transparent 64%),
    radial-gradient(900px 520px at 50% 112%, rgba(56, 200, 248, 0.24), transparent 66%),
    radial-gradient(760px 460px at 76% 82%, rgba(34, 211, 238, 0.16), transparent 68%),
    linear-gradient(168deg, #0E3A54 0%, #0C3050 46%, #08253F 100%);
}
.rs-stage {
  width: 1920px;
  height: 1080px;
  transform-origin: top left;
}
.rs-screen {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px 16px 6px;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  color: var(--text);
}

/* ===== 背景：极淡网格 / 坐标线 / 抽象节点网络 / 扫描线 / 粒子 ===== */
.rs-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
/* 细网格 */
.rs-bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 91, 203, 0.09) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 91, 203, 0.09) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: radial-gradient(ellipse at 50% 40%, #000 24%, transparent 82%);
  -webkit-mask-image: radial-gradient(ellipse at 50% 40%, #000 24%, transparent 82%);
}
/* 坐标刻度线：仅在上下边缘示意，营造仪表感 */
.rs-bg-coord {
  position: absolute;
  inset: 0;
  background-image:
    repeating-linear-gradient(90deg, rgba(0, 91, 203, 0.22) 0 1px, transparent 1px 72px),
    repeating-linear-gradient(0deg, rgba(0, 91, 203, 0.16) 0 1px, transparent 1px 72px);
  background-size: 100% 6px, 6px 100%;
  background-position: 0 0, 0 0;
  background-repeat: no-repeat;
  opacity: 0.5;
}
/* 抽象节点网络：用多重径向渐变模拟，透明度极低 */
.rs-bg-network {
  position: absolute;
  inset: 0;
  opacity: 0.5;
  background-image:
    radial-gradient(circle at 12% 22%, rgba(56, 189, 248, 0.5) 0 1.4px, transparent 1.4px),
    radial-gradient(circle at 28% 68%, rgba(56, 189, 248, 0.4) 0 1.2px, transparent 1.2px),
    radial-gradient(circle at 46% 34%, rgba(34, 211, 238, 0.4) 0 1.4px, transparent 1.4px),
    radial-gradient(circle at 63% 78%, rgba(56, 189, 248, 0.36) 0 1.2px, transparent 1.2px),
    radial-gradient(circle at 78% 26%, rgba(34, 211, 238, 0.42) 0 1.4px, transparent 1.4px),
    radial-gradient(circle at 90% 62%, rgba(56, 189, 248, 0.34) 0 1.2px, transparent 1.2px),
    radial-gradient(circle at 34% 12%, rgba(0, 91, 203, 0.5) 0 1.2px, transparent 1.2px),
    radial-gradient(circle at 70% 52%, rgba(0, 91, 203, 0.44) 0 1.2px, transparent 1.2px);
}
/* 扫描线：缓慢自上而下 */
.rs-bg-scan {
  position: absolute;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(180deg, transparent, rgba(56, 189, 248, 0.055), transparent);
  animation: rs-bg-scan 15s linear infinite;
}
@keyframes rs-bg-scan {
  0% { transform: translateY(-200px); }
  100% { transform: translateY(1080px); }
}
/* 漂浮光点 */
.rs-bg-dot {
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: rgba(56, 189, 248, 0.6);
  box-shadow: 0 0 6px rgba(56, 189, 248, 0.5);
  animation-name: rs-bg-float;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}
@keyframes rs-bg-float {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.18; }
  50% { transform: translateY(-26px) scale(1.3); opacity: 0.7; }
}

/* 顶部中央光晕：给整屏一个「舞台灯」焦点，打破灰败的均匀感 */
.rs-bg-halo {
  position: absolute;
  top: -240px;
  left: 50%;
  width: 1100px;
  height: 560px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(96, 210, 255, 0.22), rgba(45, 227, 238, 0.08) 46%, transparent 72%);
  filter: blur(30px);
  pointer-events: none;
}
/* 星座连线：星点 + 细连线，像星图一样铺在背景上 */
.rs-bg-constellation {
  position: absolute;
  inset: 0;
  opacity: 0.55;
  background-image:
    radial-gradient(circle at 8% 18%, rgba(94, 234, 212, 0.65) 0 1.6px, transparent 1.6px),
    radial-gradient(circle at 15% 62%, rgba(94, 234, 212, 0.5) 0 1.2px, transparent 1.2px),
    radial-gradient(circle at 26% 34%, rgba(125, 211, 252, 0.6) 0 1.4px, transparent 1.4px),
    radial-gradient(circle at 38% 76%, rgba(94, 234, 212, 0.45) 0 1.2px, transparent 1.2px),
    radial-gradient(circle at 47% 12%, rgba(125, 211, 252, 0.55) 0 1.4px, transparent 1.4px),
    radial-gradient(circle at 58% 54%, rgba(94, 234, 212, 0.5) 0 1.6px, transparent 1.6px),
    radial-gradient(circle at 67% 28%, rgba(125, 211, 252, 0.45) 0 1.2px, transparent 1.2px),
    radial-gradient(circle at 76% 68%, rgba(94, 234, 212, 0.55) 0 1.4px, transparent 1.4px),
    radial-gradient(circle at 86% 20%, rgba(125, 211, 252, 0.6) 0 1.6px, transparent 1.6px),
    radial-gradient(circle at 92% 58%, rgba(94, 234, 212, 0.45) 0 1.2px, transparent 1.2px),
    linear-gradient(12deg, transparent 49.85%, rgba(94, 234, 212, 0.14) 49.85%, rgba(94, 234, 212, 0.14) 50.15%, transparent 50.15%),
    linear-gradient(78deg, transparent 49.85%, rgba(125, 211, 252, 0.12) 49.85%, rgba(125, 211, 252, 0.12) 50.15%, transparent 50.15%),
    linear-gradient(-24deg, transparent 49.85%, rgba(94, 234, 212, 0.1) 49.85%, rgba(94, 234, 212, 0.1) 50.15%, transparent 50.15%),
    linear-gradient(140deg, transparent 49.85%, rgba(125, 211, 252, 0.1) 49.85%, rgba(125, 211, 252, 0.1) 50.15%, transparent 50.15%);
}
/* 轨道光弧环：右下角三层同心弧，缓慢旋转 */
.rs-bg-orbit {
  position: absolute;
  right: -160px;
  bottom: -200px;
  border: 1px solid rgba(94, 234, 212, 0.22);
  border-radius: 50%;
  will-change: transform;
}
.rs-bg-orbit--1 {
  width: 460px;
  height: 460px;
  border-top-color: rgba(94, 234, 212, 0.5);
  animation: rs-orbit 40s linear infinite;
}
.rs-bg-orbit--2 {
  width: 640px;
  height: 640px;
  right: -250px;
  bottom: -290px;
  border-style: dashed;
  border-color: rgba(125, 211, 252, 0.2);
  border-bottom-color: rgba(125, 211, 252, 0.45);
  animation: rs-orbit 55s linear infinite reverse;
}
.rs-bg-orbit--3 {
  width: 840px;
  height: 840px;
  right: -350px;
  bottom: -390px;
  border-color: rgba(94, 234, 212, 0.12);
  border-top-color: rgba(94, 234, 212, 0.3);
  animation: rs-orbit 70s linear infinite;
}
@keyframes rs-orbit {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 氛围光斑：三团缓慢漂移的彩色光晕，提亮背景层次 */
.rs-bg-aurora {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  will-change: transform;
}
.rs-bg-aurora--a {
  top: -10%;
  left: 4%;
  width: 46%;
  height: 34%;
  background: radial-gradient(circle, rgba(0, 132, 255, 0.34), transparent 68%);
  animation: rs-aurora-a 28s ease-in-out infinite;
}
.rs-bg-aurora--b {
  top: 14%;
  right: -8%;
  width: 44%;
  height: 40%;
  background: radial-gradient(circle, rgba(34, 211, 238, 0.26), transparent 70%);
  animation: rs-aurora-b 34s ease-in-out infinite;
}
.rs-bg-aurora--c {
  bottom: -14%;
  left: 26%;
  width: 54%;
  height: 32%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.2), transparent 72%);
  animation: rs-aurora-c 31s ease-in-out infinite;
}
@keyframes rs-aurora-a {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(7%, 9%) scale(1.14); }
}
@keyframes rs-aurora-b {
  0%, 100% { transform: translate(0, 0) scale(1.06); }
  50% { transform: translate(-9%, 7%) scale(1); }
}
@keyframes rs-aurora-c {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-6%, -8%) scale(1.12); }
}
/* 斜向条纹：增加织物般的质感 */
.rs-bg-diag {
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    45deg,
    rgba(56, 189, 248, 0.05) 0 1px,
    transparent 1px 26px
  );
  opacity: 0.6;
}
/* 斜向流光带：缓慢明暗呼吸 */
.rs-bg-streak {
  position: absolute;
  width: 1px;
  height: 170%;
  background: linear-gradient(180deg, transparent, rgba(56, 189, 248, 0.55), transparent);
  opacity: 0.4;
}
.rs-bg-streak--a {
  left: 24%;
  transform: rotate(16deg);
  animation: rs-streak 10s ease-in-out infinite;
}
.rs-bg-streak--b {
  right: 27%;
  transform: rotate(-16deg);
  animation: rs-streak 12s ease-in-out infinite 2.5s;
}
@keyframes rs-streak {
  0%, 100% { opacity: 0.12; }
  50% { opacity: 0.6; }
}
/* 四角装饰：细线角标，营造仪表盘边界感 */
.rs-bg-corner {
  position: absolute;
  width: 56px;
  height: 56px;
  border: 2px solid rgba(56, 189, 248, 0.42);
}
.rs-bg-corner--tl { top: 8px; left: 10px; border-right: none; border-bottom: none; }
.rs-bg-corner--tr { top: 8px; right: 10px; border-left: none; border-bottom: none; }
.rs-bg-corner--bl { bottom: 8px; left: 10px; border-right: none; border-top: none; }
.rs-bg-corner--br { bottom: 8px; right: 10px; border-left: none; border-top: none; }

/* ===== 顶部品牌标题区：标题居中，左右对称装饰 ===== */
.rs-top {
  position: relative;
  z-index: 5;
  flex-shrink: 0;
  /* 三列等分：左装饰 1fr / 标题 auto / 右侧 1fr —— 两侧等宽才能保证标题真居中
     （此前用 flex + 只有左侧 flex:1，导致标题被挤向右侧） */
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  height: 70px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--hairline-soft);
}
/* 标题底部的流光分隔线 */
.rs-top::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.75), rgba(34, 211, 238, 0.75), transparent);
  animation: rs-top-line 5s ease-in-out infinite;
}
@keyframes rs-top-line {
  0%, 100% { opacity: 0.45; }
  50% { opacity: 1; }
}
/* 两侧对称刻度装饰 */
.rs-top-side {
  /* min-width:0 防止内容撑破 1fr 轨道，从而保证标题始终居中 */
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}
.rs-tick {
  width: 30px;
  height: 3px;
  border-radius: 2px;
  background: linear-gradient(90deg, rgba(56, 189, 248, 0.85), rgba(0, 91, 203, 0.08));
}
/* 居中标题块 */
.rs-title-block {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 14px;
}
.rs-brand-title {
  margin: 0;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 6px;
  /* 白→青渐变字：高级感核心 */
  background: linear-gradient(180deg, #FFFFFF 18%, #CFF3FF 52%, #7FD8FF 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 14px rgba(77, 215, 255, 0.45)) drop-shadow(0 2px 8px rgba(0, 20, 40, 0.6));
}
@keyframes rs-title-glow {
  0%, 100% { text-shadow: 0 0 22px rgba(56, 189, 248, 0.5), 0 0 44px rgba(0, 91, 203, 0.35); }
  50% { text-shadow: 0 0 32px rgba(56, 189, 248, 0.8), 0 0 62px rgba(34, 211, 238, 0.45); }
}
/* 标题两侧的发光短条 */
.rs-title-deco {
  width: 54px;
  height: 3px;
  border-radius: 2px;
  background: linear-gradient(90deg, transparent, var(--brand-bright));
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.6);
}
.rs-title-deco--r {
  background: linear-gradient(270deg, transparent, var(--brand-bright));
}
.rs-top-right {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
}
.rs-clock {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
  padding: 4px 13px;
  background: var(--glass);
  border: 1px solid var(--hairline);
  border-radius: 7px;
}
.rs-clock-time {
  font-family: 'Orbitron', 'SF Mono', ui-monospace, monospace;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--brand-bright);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* ===== 主体：非对称模块化布局（12 列 × 4 行）=====
   刻意避免机械三栏等分：关系网络占据中心 4×2 的大焦点，
   表格占右侧 4×2 纵向长条，其余模块按信息量分配宽窄。 */
.rs-main {
  position: relative;
  z-index: 2;
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-template-rows: repeat(8, minmax(0, 1fr));
  column-gap: var(--gap);
  row-gap: 6px;
  padding-top: 10px;
}
/* 第 1 行（占 2 细行）：开源资产使用 / 资产总览（最宽焦点）/ 安全风险 */
.p-usage { grid-column: 1 / 3; grid-row: 1 / 3; }
.p-assets { grid-column: 3 / 10; grid-row: 1 / 3; }
.p-risk { grid-column: 10 / 13; grid-row: 1 / 3; }
/* 第 2 视觉行：漏洞等级 / 漏洞动态 / 风险趋势（右侧 3/8 高，不再纵贯两行） */
.p-vulnlevel { grid-column: 1 / 4; grid-row: 3 / 5; }
.p-vulnfeed { grid-column: 4 / 8; grid-row: 3 / 5; }
.p-trend { grid-column: 8 / 13; grid-row: 3 / 6; }
/* 第 3 视觉行：恶意代码 / 最新数据动态 / 用户信息（补在趋势下方） */
.p-malware { grid-column: 1 / 5; grid-row: 5 / 7; }
.p-feed { grid-column: 5 / 8; grid-row: 5 / 7; }
.p-user { grid-column: 8 / 13; grid-row: 6 / 9; }
/* 第 4 视觉行：技术栈 / 开发者国家 */
.p-tech { grid-column: 1 / 5; grid-row: 7 / 9; }
.p-country { grid-column: 5 / 8; grid-row: 7 / 9; }


/* ===== 玻璃卡片：半透明深蓝 + 噪点纹理 + 极细描边 ===== */
.rs-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 9px 12px 11px;
  /* 轻微渐变 + 噪点纹理 */
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E"),
    linear-gradient(158deg, rgba(58, 118, 190, 0.56) 0%, rgba(34, 78, 136, 0.52) 100%);
  border: 1px solid var(--hairline);
  border-radius: 8px;
  box-shadow:
    0 1px 0 rgba(160, 220, 255, 0.12) inset,
    0 8px 28px rgba(0, 10, 30, 0.4);
  backdrop-filter: blur(7px);
  overflow: hidden;
  animation: rs-enter 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) both;
}
@keyframes rs-enter {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
/* 左上角极细高光：替代传统发光边框 */
.rs-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, rgba(76, 201, 255, 0.9), rgba(34, 211, 238, 0.35) 42%, transparent 72%);
  pointer-events: none;
}
/* 悬停：描边微亮，不做大面积发光 */
.rs-panel:hover { border-color: rgba(56, 189, 248, 0.5); }

/* 面板头部 */
.rs-panel-hd {
  flex-shrink: 0;
  display: flex;
  align-items: baseline;
  gap: 9px;
  margin-bottom: 6px;
}
.rs-panel-title {
  position: relative;
  margin: 0;
  padding-left: 12px;
  padding-bottom: 6px;
  margin-bottom: 4px;
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: 0.8px;
  color: var(--text-strong);
  white-space: nowrap;
  /* 标题底线：从中线渐隐，增强模块秩序感 */
  border-bottom: 1px solid transparent;
  border-image: linear-gradient(90deg, rgba(77, 215, 255, 0.55), rgba(77, 215, 255, 0.06) 60%, transparent) 1;
}
/* 标题前竖条：亮青渐变 + 辉光 */
.rs-panel-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 3px;
  bottom: 11px;
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--brand-bright), rgba(45, 227, 238, 0.25));
  box-shadow: 0 0 8px rgba(77, 215, 255, 0.55);
}
.rs-panel-note {
  font-size: 10.5px;
  color: var(--text-sub);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rs-panel-count {
  margin-left: auto;
  font-size: 10.5px;
  color: var(--text-sub);
  font-variant-numeric: tabular-nums;
}
.rs-panel-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* ===== 资产总览（3×2 玻璃小卡）===== */
.rs-asset-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 7px;
}
.rs-asset {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  padding: 7px 10px 7px 14px;
  background: linear-gradient(135deg, rgba(96, 168, 236, 0.3), rgba(60, 110, 170, 0.16) 60%, rgba(40, 80, 130, 0.22));
  border: 1px solid var(--hairline-soft);
  border-radius: 6px;
  overflow: hidden;
  transition: border-color 0.18s, background 0.18s;
}
/* 小卡左侧渐变光条：数字卡片的秩序感来源 */
.rs-asset::before {
  content: '';
  position: absolute;
  left: 0;
  top: 14%;
  bottom: 14%;
  width: 3px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--brand-bright), rgba(45, 227, 238, 0.15));
  opacity: 0.75;
}
.rs-asset:hover {
  border-color: rgba(76, 201, 255, 0.6);
  background: rgba(96, 164, 230, 0.34);
}
/* 核心资产：仅用左侧品牌色细线强调，不做整卡发光 */
.rs-asset.is-featured {
  border-color: rgba(56, 189, 248, 0.42);
  background: linear-gradient(140deg, rgba(0, 145, 255, 0.44), rgba(84, 150, 218, 0.32));
}
.rs-asset.is-featured::before {
  content: '';
  position: absolute;
  left: 0;
  top: 12%;
  bottom: 12%;
  width: 2px;
  border-radius: 1px;
  background: var(--brand-bright);
}
.rs-asset-label {
  font-size: 11px;
  color: var(--text-sub);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rs-asset-value { display: flex; align-items: baseline; gap: 3px; }
/* 数字：等宽科技感字体，白/亮蓝分层 */
.rs-asset-num {
  font-family: 'Orbitron', 'SF Mono', ui-monospace, monospace;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--text-strong);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.5px;
  text-shadow: 0 0 16px rgba(76, 201, 255, 0.55);
}
.rs-asset.is-featured .rs-asset-num { color: var(--brand-bright); }
.rs-asset-unit { font-style: normal; font-size: 11px; color: var(--text-sub); }
.rs-asset-hint {
  font-size: 10px;
  color: var(--text-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===== 安全风险总览（3 行）===== */
.rs-risk-list {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-rows: repeat(3, minmax(0, 1fr));
  gap: 6px;
}
.rs-risk-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 5px 11px;
  background: rgba(84, 150, 218, 0.24);
  border: 1px solid var(--hairline-soft);
  border-radius: 6px;
}
.rs-risk-label {
  font-size: 11.5px;
  color: var(--text-sub);
  white-space: nowrap;
}
.rs-risk-num {
  font-family: 'Orbitron', 'SF Mono', ui-monospace, monospace;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-strong);
  font-variant-numeric: tabular-nums;
}
/* 告警色仅用于高危与恶意代码，不做整屏红 */
.rs-risk-row.is-danger { border-color: rgba(255, 107, 107, 0.5); background: rgba(140, 52, 62, 0.42); }
.rs-risk-row.is-danger .rs-risk-num { color: var(--danger); }
.rs-risk-row.is-warn { border-color: rgba(251, 191, 110, 0.46); background: rgba(128, 92, 42, 0.4); }
.rs-risk-row.is-warn .rs-risk-num { color: var(--warn); }

/* ===== KPI 网格（资产使用 / 用户信息）===== */
.rs-kpi-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(3, minmax(0, 1fr));
  gap: 6px;
}
.rs-kpi {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1px;
  padding: 5px 9px;
  background: rgba(84, 150, 218, 0.24);
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
.rs-kpi-value { display: flex; align-items: baseline; gap: 2px; }
.rs-kpi-num {
  font-family: 'Orbitron', 'SF Mono', ui-monospace, monospace;
  font-size: 20px;
  font-weight: 700;
  color: var(--brand-bright);
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 14px rgba(76, 201, 255, 0.5);
}
.rs-kpi-unit { font-style: normal; font-size: 10px; color: var(--text-sub); }
/* 用户面板：KPI 收紧为 3×2，剩余高度给活跃榜单 */
.rs-kpi-grid--user {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  flex: none;
  height: 44%;
}

/* ===== 用户活跃 Top5 榜单 ===== */
.rs-user-rank {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin-top: 6px;
}
.rs-user-rank-hd {
  flex-shrink: 0;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--text);
}
.rs-user-rank-hd span { font-size: 10px; font-weight: 400; color: var(--text-dim); }
.rs-user-rank-list {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-rows: repeat(5, minmax(0, 1fr));
  gap: 3px;
}
.rs-user-rank-row {
  display: grid;
  grid-template-columns: 16px minmax(0, 1.15fr) minmax(0, 1fr) 44px;
  align-items: center;
  gap: 6px;
  padding: 0 7px;
  background: rgba(84, 150, 218, 0.24);
  border: 1px solid var(--hairline-soft);
  border-radius: 5px;
  overflow: hidden;
}
.rs-user-rank-no {
  width: 14px;
  height: 14px;
  display: grid;
  place-items: center;
  font-family: 'Orbitron', ui-monospace, monospace;
  font-size: 9.5px;
  font-weight: 700;
  color: var(--text-sub);
  background: rgba(120, 175, 235, 0.22);
  border-radius: 3px;
}
/* 前三名：金银铜徽标 */
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
  background: rgba(10, 26, 46, 0.5);
  overflow: hidden;
}
.rs-user-rank-bar i {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, rgba(0, 91, 203, 0.55), #4CC9FF);
  box-shadow: 0 0 8px rgba(76, 201, 255, 0.45);
}
.rs-user-rank-value {
  font-family: 'Orbitron', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  color: var(--brand-bright);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* ===== 底部备案 ===== */
.rs-footer {
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  height: 24px;
  font-size: 10.5px;
  color: var(--text-dim);
}

/* 各区段依次入场（按视觉顺序错峰） */
.p-assets { animation-delay: 0.04s; }
.p-usage { animation-delay: 0.08s; }
.p-risk { animation-delay: 0.12s; }
.p-vulnlevel { animation-delay: 0.16s; }
.p-vulnfeed { animation-delay: 0.20s; }
.p-trend { animation-delay: 0.26s; }
.p-malware { animation-delay: 0.32s; }
.p-feed { animation-delay: 0.36s; }
.p-tech { animation-delay: 0.42s; }
.p-country { animation-delay: 0.46s; }
.p-user { animation-delay: 0.50s; }


/* 尊重系统「减少动态效果」偏好 */
@media (prefers-reduced-motion: reduce) {
  .rs-panel,
  .rs-bg-scan,
  .rs-bg-dot,
  .rs-bg-orbit,
  .rs-bg-streak {
    animation: none !important;
  }
}
</style>
