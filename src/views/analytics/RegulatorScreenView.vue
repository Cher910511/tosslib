<template>
  <div class="rs-viewport">
    <div class="rs-stage">
      <div class="rs-screen">
        <!-- ===== 背景：深空底 + 顶光 + 网格 + 地面透视 + 电路 + 扫描 + 暗角 + 噪点 + 粒子 ===== -->
        <div class="rs-bg" aria-hidden="true">
          <span class="rs-bg-halo" />
          <span class="rs-bg-blob rs-bg-blob--a" />
          <span class="rs-bg-blob rs-bg-blob--b" />
          <span class="rs-bg-grid" />
          <span class="rs-bg-dots" />
          <!-- 地面透视网格：纵向汇聚线 + 间距递增横向线，营造纵深 -->
          <span class="rs-bg-floor" />
          <!-- 电路走线：两侧边缘的正交折线与节点（内联 SVG，随屏幕拉伸） -->
          <svg class="rs-bg-circuit" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <g stroke="#38BDF8" stroke-width="1.2" fill="none" opacity="0.3">
              <path d="M0 168 H156 L196 208 H330" />
              <path d="M0 372 H108 L146 334 H252" />
              <path d="M0 620 H132 L170 658 H286" />
              <path d="M0 866 H174 L212 828 H318" />
              <path d="M1920 208 H1772 L1734 246 H1608" />
              <path d="M1920 452 H1798 L1760 414 H1652" />
              <path d="M1920 700 H1756 L1718 738 H1602" />
              <path d="M1920 924 H1800 L1762 886 H1660" />
            </g>
            <g fill="#7DDCFF" opacity="0.6">
              <circle cx="330" cy="208" r="2.6" /><circle cx="252" cy="334" r="2.6" />
              <circle cx="286" cy="658" r="2.6" /><circle cx="318" cy="828" r="2.6" />
              <circle cx="1608" cy="246" r="2.6" /><circle cx="1652" cy="414" r="2.6" />
              <circle cx="1602" cy="738" r="2.6" /><circle cx="1660" cy="886" r="2.6" />
            </g>
          </svg>
          <!-- 扫描光带：自上而下缓慢扫过 -->
          <span class="rs-bg-scan" />
          <!-- 科技素材：透明底 SVG（经 mask 着色），低透明度散布作底纹 -->
          <span
            v-for="(t, i) in techMarks"
            :key="`tech${i}`"
            class="rs-bg-tech"
            :style="t.style"
          />
          <span v-for="p in 32" :key="`pt${p}`" class="rs-bg-particle" :style="particleStyle(p)" />
          <!-- 四角屏框 + 暗角 + 噪点（最后叠加，压住整体层次） -->
          <span class="rs-bg-corners" />
          <span class="rs-bg-vignette" />
          <span class="rs-bg-noise" />
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
            <section class="rs-panel rs-panel--kpi">
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

            <section class="rs-panel rs-panel--kpi">
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

            <section class="rs-panel rs-flex--2">
              <div class="rs-panel-hd">
                <h3 class="rs-panel-title">用户活跃 Top10</h3>
                <span class="rs-panel-note">按页面浏览量</span>
              </div>
              <!-- 排行榜：固定行高 + 超出容器无缝自动滚动（见 ScreenUserRank） -->
              <ScreenUserRank :users="topUsers10" />
            </section>
          </div>

          <!-- 中栏：资产总览主视觉 + 趋势 -->
          <div class="rs-col rs-col--center">
            <section class="rs-panel rs-hero">
              <h3 class="rs-panel-title">资产总览</h3>
              <div class="rs-hero-stage">
                <!-- 背景图：透视网格 + 电路走线 + 节点（内联 SVG，随面板拉伸铺满） -->
                <svg
                  class="rs-hero-bg"
                  viewBox="0 0 800 420"
                  preserveAspectRatio="xMidYMid slice"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="rsBgFade" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.5" />
                      <stop offset="60%" stop-color="#38BDF8" stop-opacity="0.16" />
                      <stop offset="100%" stop-color="#38BDF8" stop-opacity="0" />
                    </linearGradient>
                    <radialGradient id="rsBgGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stop-color="#0EA5E9" stop-opacity="0.3" />
                      <stop offset="70%" stop-color="#0EA5E9" stop-opacity="0.04" />
                      <stop offset="100%" stop-color="#0EA5E9" stop-opacity="0" />
                    </radialGradient>
                  </defs>

                  <!-- 中心柔光 -->
                  <ellipse cx="400" cy="210" rx="330" ry="200" fill="url(#rsBgGlow)" />

                  <!-- 透视网格：纵向线自消失点发散 -->
                  <g stroke="url(#rsBgFade)" stroke-width="1" fill="none" opacity="0.5">
                    <path d="M400 168 L-40 420" /><path d="M400 168 L80 420" />
                    <path d="M400 168 L200 420" /><path d="M400 168 L320 420" />
                    <path d="M400 168 L480 420" /><path d="M400 168 L600 420" />
                    <path d="M400 168 L720 420" /><path d="M400 168 L840 420" />
                  </g>
                  <!-- 透视网格：横向线间距递增 -->
                  <g stroke="url(#rsBgFade)" stroke-width="1" fill="none" opacity="0.32">
                    <path d="M-40 232 H840" /><path d="M-40 262 H840" />
                    <path d="M-40 300 H840" /><path d="M-40 348 H840" />
                    <path d="M-40 404 H840" />
                  </g>

                  <!-- 电路走线：正交折线 + 端点节点 -->
                  <g stroke="#38BDF8" stroke-width="1.2" fill="none" opacity="0.42">
                    <path d="M0 96 H118 L152 130 H268" />
                    <path d="M0 306 H96 L128 274 H236" />
                    <path d="M800 118 H676 L644 152 H540" />
                    <path d="M800 330 H690 L656 296 H556" />
                    <path d="M60 420 V356 L96 320" />
                    <path d="M742 420 V368 L706 332" />
                  </g>
                  <g fill="#7DDCFF" opacity="0.85">
                    <circle cx="268" cy="130" r="2.6" /><circle cx="236" cy="274" r="2.6" />
                    <circle cx="540" cy="152" r="2.6" /><circle cx="556" cy="296" r="2.6" />
                    <circle cx="118" cy="96" r="2" /><circle cx="676" cy="118" r="2" />
                    <circle cx="96" cy="306" r="2" /><circle cx="690" cy="330" r="2" />
                  </g>
                  <!-- 角落方括号装饰 -->
                  <g stroke="#38BDF8" stroke-width="1.5" fill="none" opacity="0.5">
                    <path d="M18 54 V18 H54" /><path d="M746 18 H782 V54" />
                    <path d="M18 366 V402 H54" /><path d="M746 402 H782 V366" />
                  </g>
                </svg>

                <!-- 四角指标卡：左上 / 右上 / 左下 / 右下 -->
                <div
                  v-for="(c, i) in heroSideCards"
                  :key="c.key"
                  class="rs-hero-metric"
                  :class="[`is-${c.tone || 'primary'}`, `is-corner-${CORNER_POS[i % 4]}`]"
                  :title="c.hint || c.label"
                >
                  <!-- 装饰层：四角括号 + 扫描光（::before / ::after 已用于色条与角部柔光） -->
                  <span class="rs-hero-metric-frame" aria-hidden="true" />
                  <span class="rs-hero-metric-scan" aria-hidden="true" />
                  <span class="rs-hero-metric-label">{{ c.label }}</span>
                  <span class="rs-hero-metric-value">
                    <CountUp class="rs-hero-metric-num" :end="c.value" :decimals="c.decimals || 0" />
                    <em v-if="c.unit" class="rs-hero-metric-unit">{{ c.unit }}</em>
                  </span>
                </div>

                <!-- 中心：能量球 + 地台 -->
                <div class="rs-hero-center">
                  <div class="rs-orb" aria-hidden="true">
                    <span class="rs-orb-ticks" />
                    <span class="rs-orb-ring rs-orb-ring--1" />
                    <span class="rs-orb-ring rs-orb-ring--2" />
                    <span class="rs-orb-ring rs-orb-ring--3" />
                    <span class="rs-orb-ring rs-orb-ring--4" />
                    <span class="rs-orb-arc rs-orb-arc--a" />
                    <span class="rs-orb-arc rs-orb-arc--b" />
                    <span class="rs-orb-arc rs-orb-arc--c" />
                    <span class="rs-orb-core" />
                    <span class="rs-orb-pulse" />
                    <span class="rs-orb-pulse rs-orb-pulse--2" />
                    <!-- 卫星光点：外层容器自转，光点贴在容器边缘 → 自动跟随球体尺寸 -->
                    <span class="rs-orb-orbit rs-orb-orbit--1"><i class="rs-orb-sat" /></span>
                    <span class="rs-orb-orbit rs-orb-orbit--2"><i class="rs-orb-sat" /></span>
                    <span class="rs-orb-orbit rs-orb-orbit--3"><i class="rs-orb-sat" /></span>
                  </div>
                  <div class="rs-hero-total">
                    <span class="rs-hero-label">可信开源资产总数</span>
                    <span class="rs-hero-value">
                      <CountUp class="rs-hero-num" :end="heroTotal.value" />
                      <em class="rs-hero-unit">{{ heroTotal.unit }}</em>
                    </span>
                    <span class="rs-hero-hint">{{ heroTotal.hint }}</span>
                  </div>
                  <!-- 立体地台：椭圆光环平台 + 球体投影 -->
                  <div class="rs-hero-plinth" aria-hidden="true">
                    <span class="rs-hero-plinth-ring rs-hero-plinth-ring--1" />
                    <span class="rs-hero-plinth-ring rs-hero-plinth-ring--2" />
                    <span class="rs-hero-plinth-ring rs-hero-plinth-ring--3" />
                  </div>
                </div>
              </div>

              <!-- 底部指标带：SBOM 覆盖率（进度条形式，把余量用起来） -->
              <div class="rs-hero-band">
                <span class="rs-hero-band-label">{{ heroBand.label }}</span>
                <span class="rs-hero-band-bar">
                  <i :style="{ width: `${heroBand.value}%` }" />
                </span>
                <span class="rs-hero-band-value">
                  <CountUp :end="heroBand.value" :decimals="heroBand.decimals || 1" />
                  <em>{{ heroBand.unit }}</em>
                </span>
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
                <ScreenDonutChart
                  :data="vulnLevelDistribution"
                  unit=""
                  :radius="['16%', '78%']"
                  rose
                  hide-legend
                  show-value-label
                />
              </div>
            </section>

            <section class="rs-panel rs-flex--3">
              <div class="rs-panel-hd">
                <h3 class="rs-panel-title">最新漏洞动态</h3>
                <span class="rs-panel-note">最新 {{ vulnFeed10.length }} 条</span>
              </div>
              <div class="rs-panel-body">
                <ScreenTable :columns="vulnColumns" :rows="vulnFeed10" :duration="46" />
              </div>
            </section>

            <section class="rs-panel rs-flex--3">
              <div class="rs-panel-hd">
                <h3 class="rs-panel-title">恶意代码检测动态</h3>
                <span class="rs-panel-note">最新 {{ malwareFeed10.length }} 条</span>
              </div>
              <div class="rs-panel-body">
                <ScreenTable :columns="malwareColumns" :rows="malwareFeed10" :duration="34" />
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
 *   左栏 = 用户行为（行为总览 KPI / 开源资产使用 / 用户活跃 Top10）
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
import ScreenTable from '../../components/screen/ScreenTable.vue'
import ScreenUserRank from '../../components/screen/ScreenUserRank.vue'
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
  footerInfo,
} from '../../data/regulatorScreenData.js'

/* ===== 资产总览：中心总数 + 左右指标列 + 底部指标带 ===== */
const heroTotal = assetCards.find((c) => c.key === 'total') || { value: 0, unit: '', hint: '' }
/** 底部指标带：SBOM 覆盖率（百分比，用进度条形式呈现） */
const heroBand = assetCards.find((c) => c.key === 'sbom') || { label: 'SBOM 覆盖率', value: 0, unit: '%', decimals: 1 }
/**
 * 左右指标列：仅使用「资产总览」的真实字段（去掉总数与底部带）。
 * 注意：不要用 regulatorMetrics —— 那是平台暂无口径的**演示数据**，
 * 拿它填充主视觉属于造数，需等平台补齐真实口径后再纳入。
 */
const heroSideCards = computed(() =>
  assetCards.filter((c) => c.key !== 'total' && c.key !== 'sbom'))
/** 四角方位：按顺序落到 左上 → 右上 → 左下 → 右下 */
const CORNER_POS = ['tl', 'tr', 'bl', 'br']

/* ===== 用户活跃 Top10（按 PV 归一化进度条）===== */
const topUsers10 = computed(() => {
  const list = topUsers.slice(0, 10)
  const max = Math.max(...list.map((u) => u.pv), 1)
  return list.map((u) => ({ ...u, bar: `${Math.max(12, Math.round((u.pv / max) * 100))}%` }))
})

/* ===== 实时列表：各取最新 10 条滚动 ===== */
const vulnFeed10 = computed(() => vulnFeed.slice(0, 10))
const malwareFeed10 = computed(() => malwareFeed.slice(0, 10))

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

/* ===== 科技素材底纹 =====
   来源：Iconify 上的开源图标集（tabler/lucide/ph/carbon/iconoir，均为 MIT/ISC/Apache-2.0），
   已下载到 src/assets/tech/，详见同目录 README.md。
   这些 SVG 用 currentColor 描边，无法直接 <img> 引用（会渲染成黑色），
   故改用 CSS mask：取其 alpha 通道再填充主题色，既是透明底又能着色。 */
const techModules = import.meta.glob('../../assets/tech/*.svg', {
  eager: true, query: '?url', import: 'default',
})
const TECH_URLS = Object.values(techModules)

/** 素材散布位（百分比）：贴左右边缘与下方，避开中央能量球与四角指标卡 */
const TECH_SLOTS = [
  { x: 3.2, y: 15, size: 62, rot: -12, o: 0.16 },
  { x: 95.5, y: 22, size: 54, rot: 10, o: 0.14 },
  { x: 5.5, y: 52, size: 44, rot: 8, o: 0.12 },
  { x: 93.0, y: 58, size: 58, rot: -8, o: 0.15 },
  { x: 8.5, y: 86, size: 50, rot: 14, o: 0.13 },
  { x: 91.0, y: 88, size: 46, rot: -14, o: 0.12 },
  { x: 20.0, y: 8, size: 38, rot: 6, o: 0.1 },
  { x: 80.0, y: 6, size: 40, rot: -6, o: 0.1 },
  { x: 30.0, y: 94, size: 42, rot: 10, o: 0.11 },
  { x: 70.0, y: 93, size: 36, rot: -10, o: 0.1 },
  { x: 46.0, y: 4, size: 30, rot: 0, o: 0.08 },
  { x: 54.0, y: 96, size: 32, rot: 0, o: 0.08 },
]

const techMarks = computed(() =>
  TECH_SLOTS.map((slot, i) => {
    const url = TECH_URLS.length ? TECH_URLS[i % TECH_URLS.length] : ''
    return {
      style: {
        left: `${slot.x}%`,
        top: `${slot.y}%`,
        width: `${slot.size}px`,
        height: `${slot.size}px`,
        opacity: String(slot.o),
        transform: `translate(-50%, -50%) rotate(${slot.rot}deg)`,
        // mask 取 SVG 的 alpha 通道，再以背景色填充 → 透明底 + 可着色
        maskImage: `url(${url})`,
        WebkitMaskImage: `url(${url})`,
        animationDelay: `${(i * 0.7).toFixed(1)}s`,
      },
    }
  }),
)

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
/* 顶部中央舞台光（此前模板有引用但缺样式，属死元素，现补回） */
.rs-bg-halo {
  position: absolute;
  top: -240px;
  left: 50%;
  width: 1400px;
  height: 620px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(0, 150, 240, 0.22), rgba(34, 211, 238, 0.07) 48%, transparent 72%);
  filter: blur(34px);
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
/* 地面网格：屏幕下半部的高密度细网格，向上渐隐融入背景
   注意：mask 只用单层。多层 mask-image 默认按并集合成（add），
   写成「径向 + 线性」两层会互相叠加导致网格铺满全屏，达不到渐隐效果。 */
.rs-bg-floor {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 46%;
  opacity: 0.55;
  background-image:
    repeating-linear-gradient(90deg, rgba(0, 145, 255, 0.18) 0 1px, transparent 1px 42px),
    repeating-linear-gradient(180deg, rgba(0, 145, 255, 0.2) 0 1px, transparent 1px 30px);
  mask-image: linear-gradient(180deg, transparent 0%, #000 46%, #000 100%);
  -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 46%, #000 100%);
}
/* 电路走线 SVG：铺满整屏 */
.rs-bg-circuit {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.55;
}
/* 扫描光带：自上而下缓慢扫过，制造「系统在运行」的观感 */
.rs-bg-scan {
  position: absolute;
  left: 0;
  right: 0;
  height: 220px;
  background: linear-gradient(180deg, transparent, rgba(0, 145, 255, 0.06) 45%, rgba(56, 189, 248, 0.1) 50%, rgba(0, 145, 255, 0.06) 55%, transparent);
  animation: rs-bg-scan 16s linear infinite;
}
@keyframes rs-bg-scan {
  0% { transform: translateY(-240px); }
  100% { transform: translateY(1080px); }
}
/* 四角屏框：贴屏幕四角的亮线括号 */
.rs-bg-corners {
  position: absolute;
  inset: 8px;
  background:
    linear-gradient(#38BDF8, #38BDF8) left top / 46px 2px no-repeat,
    linear-gradient(#38BDF8, #38BDF8) left top / 2px 46px no-repeat,
    linear-gradient(#38BDF8, #38BDF8) right top / 46px 2px no-repeat,
    linear-gradient(#38BDF8, #38BDF8) right top / 2px 46px no-repeat,
    linear-gradient(#38BDF8, #38BDF8) left bottom / 46px 2px no-repeat,
    linear-gradient(#38BDF8, #38BDF8) left bottom / 2px 46px no-repeat,
    linear-gradient(#38BDF8, #38BDF8) right bottom / 46px 2px no-repeat,
    linear-gradient(#38BDF8, #38BDF8) right bottom / 2px 46px no-repeat;
  opacity: 0.45;
}
/* 暗角：四周压暗，聚焦中心内容 */
.rs-bg-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 46%, transparent 52%, rgba(2, 10, 24, 0.42) 100%);
}
/* 噪点：极低透明度的 SVG 噪波，消除大面积渐变的色带感 */
.rs-bg-noise {
  position: absolute;
  inset: 0;
  opacity: 0.5;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
}
/* 科技素材底纹：mask 取 SVG alpha 通道 + 主题色填充（透明底、可着色、可调透明度）
   位置/尺寸/旋转由行内 style 提供，此处只负责外观与呼吸动画 */
.rs-bg-tech {
  position: absolute;
  background-color: rgba(125, 220, 255, 0.9);
  /* mask-size 需与元素同尺寸，图标才会铺满而非重复 */
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: contain;
  will-change: mask-image, opacity;
  animation: rs-tech-breathe 9s ease-in-out infinite;
}
@keyframes rs-tech-breathe {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.7); }
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
/* 左栏纵向配比。两个 KPI 面板已改为按内容高度（不参与分配，见 .rs-panel--kpi），
   故此处配比只作用于「用户活跃 Top10」，它独占左栏剩余空间并靠滚动展示。
   保留 rs-flex--2/3 供中栏与右栏复用。 */
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

/* 面板标题到内容的统一下间距：两种结构（裸标题 / .rs-panel-hd 包裹）共用同一变量 */
.rs-panel {
  --panel-hd-gap: 6px;
}
.rs-panel-hd {
  flex-shrink: 0;
  display: flex;
  align-items: baseline;
  gap: 9px;
  margin-bottom: var(--panel-hd-gap);
}
.rs-panel-title {
  position: relative;
  margin: 0 0 var(--panel-hd-gap);
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

/* ===== 中栏主视觉：中央能量球 + 四角指标卡 =====
   注意：此处只允许有一条 .rs-hero-stage 规则。四角卡片用绝对定位落在
   圆形主视觉之外的四个角落（圆的外接矩形四角天然留白）。 */
.rs-hero-stage {
  position: relative;
  flex: 1;
  min-height: 0;
  display: grid;
  /* 仅 .rs-hero-center 在流内，居中即可；四角卡片为绝对定位不受影响 */
  place-items: center;
  /* 关键：作为尺寸容器，让球体/地台按「stage 自身高度」定尺寸。
     此前用 vh 定尺寸，而 stage 高度往往小于视口高度（面板被其它区块挤压），
     导致球体外接矩形高出 stage、压到四角卡片上（实测侵入 26px）。 */
  container-type: size;
}

/* ---- 背景图：透视网格 + 电路走线（内联 SVG，随面板拉伸铺满） ---- */
.rs-hero-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.9;
}

/* ---- 四角指标卡：左上 / 右上 / 左下 / 右下 ---- */
.rs-hero-metric {
  position: absolute;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(2px, 0.4vh, 5px);
  /* 放大：卡片更宽更高，承载大号数值 */
  min-width: clamp(132px, 11vw, 210px);
  min-height: clamp(62px, 8.4vh, 104px);
  padding: clamp(7px, 0.9vh, 13px) clamp(10px, 0.85vw, 17px);
  background: linear-gradient(150deg, rgba(6, 34, 70, 0.8), rgba(4, 20, 44, 0.55));
  border: 1px solid var(--hairline-soft);
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.25s, background 0.25s, box-shadow 0.25s, transform 0.25s;
}
/* 四角定位 */
.rs-hero-metric.is-corner-tl { top: 0; left: 0; }
.rs-hero-metric.is-corner-tr { top: 0; right: 0; }
.rs-hero-metric.is-corner-bl { bottom: 0; left: 0; }
.rs-hero-metric.is-corner-br { bottom: 0; right: 0; }
/* 左侧色条：按 tone 着色（加粗 + 辉光，让每张卡有明确色相） */
.rs-hero-metric::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, var(--metric-tone, var(--cyan)), transparent 88%);
  box-shadow: 0 0 10px var(--metric-tone, var(--cyan));
}
/* 右上角柔光点缀 */
.rs-hero-metric::after {
  content: '';
  position: absolute;
  right: -12px;
  top: -12px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, rgba(56, 189, 248, 0.26), transparent 70%);
}

/* ---- 装饰层 1：四角科技括号（外层子元素，避免与色条/柔光争用伪元素） ---- */
.rs-hero-metric-frame {
  position: absolute;
  inset: 4px;
  pointer-events: none;
  background:
    linear-gradient(var(--metric-tone, var(--cyan)), var(--metric-tone, var(--cyan))) left top / 13px 2px no-repeat,
    linear-gradient(var(--metric-tone, var(--cyan)), var(--metric-tone, var(--cyan))) left top / 2px 13px no-repeat,
    linear-gradient(var(--metric-tone, var(--cyan)), var(--metric-tone, var(--cyan))) right bottom / 13px 2px no-repeat,
    linear-gradient(var(--metric-tone, var(--cyan)), var(--metric-tone, var(--cyan))) right bottom / 2px 13px no-repeat;
  opacity: 0.65;
  transition: opacity 0.25s;
}
/* ---- 装饰层 2：顶部光条 + 自上而下的扫描光 ---- */
.rs-hero-metric-scan {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--metric-tone, var(--cyan)), rgba(56, 189, 248, 0.15) 70%, transparent);
  pointer-events: none;
}
.rs-hero-metric-scan::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 46px;
  background: linear-gradient(180deg, rgba(125, 220, 255, 0.14), transparent);
  animation: rs-metric-scan 4.5s ease-in-out infinite;
}
@keyframes rs-metric-scan {
  0% { transform: translateY(-52px); opacity: 0; }
  18% { opacity: 1; }
  82% { opacity: 1; }
  100% { transform: translateY(112px); opacity: 0; }
}

.rs-hero-metric:hover {
  border-color: var(--metric-tone, var(--cyan));
  background: linear-gradient(150deg, rgba(10, 46, 92, 0.9), rgba(4, 20, 44, 0.65));
  box-shadow: 0 0 22px -6px var(--metric-tone, var(--cyan)), 0 6px 18px rgba(0, 4, 12, 0.45);
  transform: translateY(-2px);
}
.rs-hero-metric:hover .rs-hero-metric-frame { opacity: 1; }
.rs-hero-metric-label {
  font-size: clamp(10px, 0.68vw, 13px);
  line-height: 1.35;
  color: var(--text-sub);
  /* 标题最多两行，超出省略 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.rs-hero-metric-value { display: flex; align-items: baseline; gap: 3px; min-width: 0; }
.rs-hero-metric-num {
  font-family: 'Orbitron', 'DIN Alternate', ui-monospace, monospace;
  /* 放大：指标数值比上一版更大 */
  font-size: clamp(19px, 1.5vw, 32px);
  font-weight: 700;
  color: var(--text-strong);
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 16px rgba(56, 189, 248, 0.55);
}
.rs-hero-metric-unit { font-style: normal; font-size: clamp(10px, 0.62vw, 12px); color: var(--text-sub); }

/* tone 配色：仅改色条 + 数值色，保持整体克制 */
.rs-hero-metric.is-primary { --metric-tone: var(--brand-bright); }
.rs-hero-metric.is-danger  { --metric-tone: var(--danger); }
.rs-hero-metric.is-warn    { --metric-tone: var(--warn); }
.rs-hero-metric.is-ok      { --metric-tone: #34D399; }
.rs-hero-metric.is-danger .rs-hero-metric-num { color: #FF8A7A; text-shadow: 0 0 14px rgba(255, 107, 107, 0.6); }
.rs-hero-metric.is-warn .rs-hero-metric-num { color: #FFC876; text-shadow: 0 0 14px rgba(251, 191, 110, 0.6); }
.rs-hero-metric.is-ok .rs-hero-metric-num { color: #6EE7A8; text-shadow: 0 0 14px rgba(52, 211, 153, 0.6); }

/* ---- 中央：能量球 + 地台 ---- */
.rs-hero-center {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
}

/* ---- 立体地台：球体下方三层椭圆光环平台（透视压扁成椭圆） ---- */
.rs-hero-plinth {
  position: absolute;
  left: 50%;
  bottom: 2%;
  /* 与 .rs-orb 同用容器查询单位，比球体宽约 12% 以"托住"它 */
  width: min(108cqh, 63cqw);
  height: calc(min(108cqh, 63cqw) * 0.2);
  transform: translateX(-50%);
  pointer-events: none;
}
.rs-hero-plinth-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1px solid rgba(56, 189, 248, 0.32);
}
/* 内圈：亮实线 + 辉光，作为球体的落点 */
.rs-hero-plinth-ring--1 {
  border-color: rgba(125, 220, 255, 0.6);
  box-shadow: 0 0 18px rgba(56, 189, 248, 0.4), inset 0 0 22px rgba(56, 189, 248, 0.22);
}
/* 中圈：虚线扩散环 */
.rs-hero-plinth-ring--2 {
  inset: 12% -6%;
  border-style: dashed;
  border-color: rgba(0, 145, 255, 0.3);
  animation: rs-plinth 7s ease-out infinite;
}
/* 外圈：更大更淡的呼吸环 */
.rs-hero-plinth-ring--3 {
  inset: 26% -14%;
  border-color: rgba(34, 211, 238, 0.2);
  animation: rs-plinth 7s ease-out infinite;
  animation-delay: 3.5s;
}
@keyframes rs-plinth {
  0% { transform: scale(0.9); opacity: 0.7; }
  100% { transform: scale(1.16); opacity: 0; }
}

/* ---- 底部指标带：SBOM 覆盖率 ---- */
.rs-hero-band {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
  padding: 7px 12px;
  background: linear-gradient(90deg, rgba(6, 34, 70, 0.72), rgba(4, 20, 44, 0.45));
  border: 1px solid var(--hairline-soft);
  border-radius: 6px;
}
.rs-hero-band-label {
  flex-shrink: 0;
  font-size: clamp(10px, 0.66vw, 12px);
  color: var(--text-sub);
  white-space: nowrap;
}
.rs-hero-band-bar {
  position: relative;
  flex: 1;
  min-width: 0;
  height: 5px;
  border-radius: 3px;
  background: rgba(3, 14, 29, 0.6);
  overflow: hidden;
}
.rs-hero-band-bar i {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, rgba(0, 91, 203, 0.6), var(--cyan));
  box-shadow: 0 0 10px rgba(34, 211, 238, 0.6);
}
.rs-hero-band-value {
  flex-shrink: 0;
  font-family: 'Orbitron', 'DIN Alternate', ui-monospace, monospace;
  font-size: clamp(12px, 0.85vw, 16px);
  font-weight: 700;
  color: var(--brand-bright);
  font-variant-numeric: tabular-nums;
}
.rs-hero-band-value em { font-style: normal; font-size: 10px; color: var(--text-sub); margin-left: 2px; }
.rs-orb {
  position: relative;
  /* 不能用百分比宽度（曾因 auto 列循环依赖塌陷为 0×0）。
     改用容器查询单位：cqh/cqw = stage 高度/宽度的 1%，故球体永远不超过 stage。
     96cqh / 56cqw 为「放大到接近四角卡片、仍保留约 20px 间隙」的实测安全值
     （间隙按圆几何算：卡片内角点到圆心距离 − 半径，必须 > 0）。
     改此值需同步 .rs-hero-plinth。 */
  height: min(96cqh, 56cqw);
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
/* ---- 环外刻度尺：最外圈 60 格刻度，静止，压住外缘留白 ---- */
.rs-orb-ticks {
  position: absolute;
  /* 收到 -5%：保证在 stage 余量最小时（矮屏）也不越出面板内容区 */
  inset: -5%;
  border-radius: 50%;
  background: repeating-conic-gradient(
    from 0deg,
    rgba(56, 189, 248, 0.42) 0deg 0.6deg,
    transparent 0.6deg 6deg
  );
  mask-image: radial-gradient(circle, transparent 0 88%, #000 88% 100%, transparent 100%);
  -webkit-mask-image: radial-gradient(circle, transparent 0 88%, #000 88% 100%, transparent 100%);
  opacity: 0.75;
}

/* ---- 分段弧：三道光弧，长短错落，与环反向/同向旋转 ---- */
.rs-orb-arc {
  position: absolute;
  border-radius: 50%;
  border: 2px solid transparent;
}
.rs-orb-arc--a {
  inset: 4.5%;
  border-top-color: rgba(56, 189, 248, 0.9);
  border-right-color: rgba(56, 189, 248, 0.35);
  filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.7));
  animation: rs-spin 16s linear infinite;
}
.rs-orb-arc--b {
  inset: 14%;
  border-bottom-color: rgba(34, 211, 238, 0.85);
  filter: drop-shadow(0 0 6px rgba(34, 211, 238, 0.6));
  animation: rs-spin 22s linear infinite reverse;
}
.rs-orb-arc--c {
  inset: 25%;
  border-left-color: rgba(125, 220, 255, 0.75);
  animation: rs-spin 12s linear infinite;
}

/* ---- 呼吸脉冲：从核心向外扩散的圆环 ---- */
.rs-orb-pulse {
  position: absolute;
  inset: 38%;
  border-radius: 50%;
  border: 1px solid rgba(125, 220, 255, 0.55);
  animation: rs-pulse-out 3.6s ease-out infinite;
}
.rs-orb-pulse--2 { animation-delay: 1.8s; }
@keyframes rs-pulse-out {
  0% { transform: scale(0.9); opacity: 0.85; }
  100% { transform: scale(2.1); opacity: 0; }
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
/* 环上卫星光点：外层轨道容器自转，光点贴在容器边缘
   → 尺寸自动跟随球体，不必在 keyframes 里硬编码（旧写法的坑） */
.rs-orb-orbit {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  animation-name: rs-orb-spin;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
.rs-orb-orbit--1 { animation-duration: 26s; }
.rs-orb-orbit--2 { animation-duration: 38s; animation-direction: reverse; animation-delay: -12s; }
.rs-orb-orbit--3 { animation-duration: 46s; animation-delay: -28s; }
.rs-orb-sat {
  position: absolute;
  /* 贴在轨道容器顶部边缘 = 环上 */
  top: 0;
  left: 50%;
  width: 7px;
  height: 7px;
  margin: -3.5px 0 0 -3.5px;
  border-radius: 50%;
  background: #7DDCFF;
  box-shadow: 0 0 12px rgba(125, 220, 255, 0.95);
}
@keyframes rs-orb-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
  font-size: clamp(13px, 0.95vw, 17px);
  letter-spacing: 3px;
  color: var(--text-sub);
}
/* 数字 + 单位「项」同行基线对齐 */
.rs-hero-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 6px;
}
.rs-hero-num {
  /* 数值沿用大屏科技字 Orbitron（index.html 已加载）。
     注意：本类现在挂在 CountUp 根元素上，必须自行带上 Orbitron，
     否则会被组件内置的 .count-up 字体栈覆盖成系统等宽字 */
  font-family: 'Orbitron', 'DIN Alternate', 'Bahnschrift', ui-monospace, monospace;
  /* 放大：中心数据是主视觉，字号明显大于四角指标 */
  font-size: clamp(44px, 4.6vw, 86px);
  font-weight: 700;
  line-height: 1.05;
  color: #FFFFFF;
  text-shadow: 0 0 30px rgba(56, 189, 248, 0.8);
  font-variant-numeric: tabular-nums;
}
.rs-hero-unit {
  font-style: normal;
  font-size: clamp(16px, 1.2vw, 22px);
  color: var(--gold);
}
.rs-hero-hint {
  font-size: 10.5px;
  color: #6EE7A8;
}

/* ===== 左栏：用户行为 KPI ===== */
/* KPI 面板（用户行为总览 / 开源资产使用）：两个面板样式完全统一 ——
   面板按内容高度（flex: 0 0 auto），不参与拉伸，故两panel的标题、卡片高度、
   间距完全一致；左栏剩余纵向空间全部由「用户活跃 Top10」吸收。
   这样矮屏下卡片也永不被压缩，指标标题与数值始终完整可见。 */
.rs-panel--kpi {
  flex: 0 0 auto;
}
.rs-kpi-grid {
  /* 不参与拉伸：行高固定，卡片不被压扁（曾用 minmax(0,1fr)，矮屏下会把
     卡片压到文字裁切）。改为定高后靠下方面板吸收剩余空间。 */
  flex: none;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  /* 行高 minmax(46px, auto)：下限保证紧凑美观，上限按内容撑开 ——
     写死高度会让「标签 + 数值」放不下而被 overflow 裁掉（实测 V2 曾裁 6px）。
     行数自适应：用户行为总览 8 项（4 行）、开源资产使用 6 项（3 行）。 */
  grid-auto-rows: minmax(46px, auto);
  gap: 7px;
}
.rs-kpi {
  display: flex;
  flex-direction: column;
  /* 与 V2 统一：标签与数值居中聚拢 + 适中间隙。
     用 safe center 而非普通 center —— 内容万一超出时退化为顶对齐，
     不会把顶部「指标标题」裁掉（space-between 会把二者顶到卡片两端，过散）。 */
  justify-content: safe center;
  gap: 8px;
  padding: 5px 10px;
  background: rgba(6, 34, 70, 0.55);
  border: 1px solid var(--hairline-soft);
  border-radius: 6px;
  overflow: hidden;
}
.rs-kpi-label {
  flex-shrink: 0;
  font-size: 10.5px;
  line-height: 1.3;
  color: var(--text-sub);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* 数值 + 单位：同行基线对齐 */
.rs-kpi-value {
  display: flex;
  align-items: baseline;
  gap: 2px;
  min-width: 0;
}
.rs-kpi-num {
  font-family: 'DIN Alternate', ui-monospace, monospace;
  font-size: clamp(14px, 1.05vw, 20px);
  font-weight: 700;
  color: var(--brand-bright);
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 14px rgba(56, 189, 248, 0.5);
}
.rs-kpi-unit {
  flex-shrink: 0;
  font-style: normal;
  font-size: 10px;
  color: var(--text-sub);
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

/* ==================================================================
   小屏适配（三档：紧凑 → 收紧 → 纵向堆叠）
   ================================================================== */

/* --- 一档：高度不足（如 1366×768）时压缩纵向占用 --- */
@media (max-height: 820px) {
  .rs-viewport { --gap: 8px; }
  .rs-screen { padding: 8px 12px 3px; }
  .rs-top { height: clamp(44px, 6vh, 58px); padding-bottom: 6px; }
  .rs-panel { padding: 7px 10px 8px; }
  /* KPI 网格保持 2 列，不再在矮屏改成 3 列：
     「用户行为总览」有 8 项，3 列会排成 3+3+2，末行只有 2 个而错位；
     2 列时 8 项正好 4 行 × 2、6 项正好 3 行 × 2，两栏都能整行填满。 */
  .rs-kpi { padding: 4px 7px; }
  .rs-kpi-label { font-size: 9.5px; }
  /* 四角卡片收紧，给中央球体留出更高空间 */
  .rs-hero-metric {
    min-width: clamp(116px, 10vw, 178px);
    min-height: clamp(54px, 7.6vh, 88px);
    padding: 6px 10px 7px;
  }
  .rs-hero-metric-num { font-size: clamp(17px, 1.35vw, 27px); }
  .rs-footer { height: 26px; }
}

/* --- 二档：宽度不足（笔记本 / 小尺寸屏）时收紧横向密度 --- */
@media (max-width: 1440px) {
  .rs-viewport { --gap: 9px; }
  .rs-screen { padding: 10px 12px 4px; }
  /* 两侧刻度装饰让位给标题与状态 */
  .rs-top-side { display: none; }
  .rs-panel { padding: 8px 10px 9px; }
  .rs-panel-title { padding-left: 10px; letter-spacing: 0.4px; }
  .rs-title-deco { width: 22px; height: 8px; }
  .rs-status { font-size: 11px; padding: 3px 9px; }
  /* 排行榜已抽为 ScreenUserRank 组件（样式随组件 scoped），此处不再覆盖 */
  /* 横向空间变窄：卡片与球体同步收一档，避免贴边 */
  .rs-hero-metric {
    min-width: clamp(120px, 11vw, 172px);
    min-height: clamp(56px, 7.8vh, 92px);
  }
  .rs-hero-metric-num { font-size: clamp(17px, 1.35vw, 26px); }
  /* 球体尺寸由容器查询单位自适应，此处不再覆盖 width（覆盖会与 cq 的 height 冲突） */
}

/* --- 三档：窄屏或极矮屏：三栏降级为纵向单栏，允许滚动，避免内容被裁切 --- */
@media (max-width: 1024px), (max-height: 640px) {
  .rs-viewport { height: auto; min-height: 100vh; overflow: visible; }
  .rs-screen { height: auto; min-height: 100vh; padding: 10px 10px 6px; }
  .rs-main {
    /* 单栏堆叠 */
    grid-template-columns: minmax(0, 1fr);
    /* 每栏各自成行，按内容高度排布 */
    grid-auto-rows: auto;
  }
  .rs-col { gap: var(--gap); }
  /* 解除栏内纵向配比，改为按内容高度 + 最小高度 */
  .rs-flex--2,
  .rs-flex--3,
  .rs-col--center .rs-hero { flex: none; }
  .rs-panel { min-height: 200px; }
  /* 窄屏下卡片回到常规流与球体共用高度，stage 必须留出「球体 + 两行卡片」的空间。
     注意 container-type: size 含 contain: size —— 内容不会撑高容器，
     所以这里必须显式给足高度，否则内容溢出（实测球体被顶出 20px）。 */
  .rs-col--center .rs-hero { min-height: 560px; }
  .rs-hero-stage {
    min-height: 480px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 7px;
    align-content: center;
  }
  /* 球体尺寸必须让出卡片占用：不能沿用 96cqh（那会让球体吃掉整个 stage 高度） */
  .rs-orb { height: min(40cqh, 46cqw); }
  /* 窄屏：单栏布局下背景容器随内容拉到数千 px 高，按百分比散布的素材会被摊得
     极稀疏，且贴边位（x=3.2%/95.5%）加半个图标宽后会溢出屏幕 —— 直接关闭 */
  .rs-bg-tech { display: none; }
  .rs-hero-center {
    order: -1;
    margin-bottom: 8px;
    /* 跨满整行 */
    grid-column: 1 / -1;
  }
  /* 卡片脱离四角绝对定位，回到常规流参与 2×2 网格 */
  .rs-hero-metric {
    position: static;
    min-width: 0;
    min-height: 0;
  }
  /* 球体尺寸由容器查询单位自适应（cqh 跟随 stage 高度），无需在此覆盖 */
  .rs-footer { height: 26px; }
}

/* --- 四档：移动端窄幅：进一步压缩字号与留白 --- */
@media (max-width: 640px) {
  .rs-viewport { --gap: 7px; }
  .rs-top { height: auto; flex-wrap: wrap; }
  .rs-top-right { gap: 8px; }
  .rs-status { display: none; }
  .rs-brand-title { font-size: 16px; letter-spacing: 2px; }
  .rs-clock { font-size: 11px; }
  .rs-kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: none; grid-auto-rows: minmax(52px, auto); }
  .rs-kpi-label { font-size: 10px; white-space: normal; }
  /* 极窄屏：卡片保持 2 列（继承三档的常规流），仅再压一档字号 */
  .rs-hero-metric { padding: 7px 9px 8px; }
  .rs-hero-metric-label { font-size: 10px; }
  .rs-hero-metric-num { font-size: 18px; }
  .rs-hero-band { flex-wrap: wrap; }
  .rs-hero-band-label { flex: 1 1 auto; }
  .rs-panel { min-height: 180px; }
}

/* 尊重系统「减少动态效果」偏好 */
@media (prefers-reduced-motion: reduce) {
  .rs-panel,
  .rs-bg-blob,
  .rs-bg-particle,
  .rs-bg-scan,
  .rs-bg-tech,
  .rs-hero-metric-scan::after,
  .rs-orb-ring,
  .rs-orb-core,
  .rs-orb-orbit,
  .rs-orb-arc,
  .rs-orb-pulse,
  .rs-hero-plinth-ring,
  .rs-status i {
    animation: none !important;
  }
}
</style>
