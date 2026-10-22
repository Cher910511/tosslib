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

        <!-- ===== 主体：上 2/3（用户数 + 日变化数据 | 资产数 | 安全风险总览 + 资产趋势）+ 下 1/3（组织活跃度 / 漏洞动态 / 恶意代码动态） ===== -->
        <main class="rs-main">
          <!-- 上区-左栏：用户数 -->
          <div class="rs-col rs-col--left">
            <section class="rs-panel rs-panel--fill">
              <div class="rs-panel-hd">
                <h3 class="rs-panel-title">用户数</h3>
                <span class="rs-panel-note">柱顶标数值  悬停看明细</span>
              </div>
              <!-- 注册用户数 / 注册组织数：放大卡形式（领导要求突出），置于柱图上方 -->
              <div class="rs-kpi-featured">
                <div
                  v-for="u in userOverviewFeatured"
                  :key="u.key"
                  class="rs-kpi-featured-card"
                  :class="`is-${u.key}`"
                >
                  <span class="rs-kpi-featured-label">
                    <span
                      class="rs-kpi-featured-icon"
                      aria-hidden="true"
                      v-html="FEATURED_ICONS[u.key]"
                    />
                    {{ u.label }}
                  </span>
                  <span class="rs-kpi-featured-value">
                    <CountUp class="rs-kpi-featured-num" :end="u.value" />
                    <em v-if="u.unit" class="rs-kpi-featured-unit">{{ u.unit }}</em>
                  </span>
                </div>
              </div>
              <!-- 柱图 6 根：注册用户数 / 活跃用户 / 注册组织数 / 活跃组织 / 用户活跃率 / 企业活跃率。
                   数量（人/家）走左轴、活跃率（%）走右轴，柱顶直接标数值；明细由悬停 tooltip 给出 -->
              <div ref="userChartRef" class="rs-chart rs-chart--user" />
            </section>

          </div>

          <!-- 上区-右栏：日变化数据 -->
          <div class="rs-col rs-col--right">
            <section class="rs-panel rs-panel--mstat">
              <div class="rs-panel-hd">
                <h3 class="rs-panel-title">日变化数据</h3>
                <span class="rs-panel-note">悬停查看数值与比对  点击名称下钻</span>
              </div>
              <!-- 展现形式改造：6 张指标卡改为一张雷达图（6 轴 = 6 项月报统计量）。
                   图形按对数归一只表达相对量级，实际数值与「较上日/周/月」比对
                   全部收进悬停 tooltip；点击下方名称条仍可下钻（原卡片点击行为保留）。 -->
              <div class="rs-radar-wrap">
                <div ref="radarChartRef" class="rs-chart rs-chart--radar" />
                <!-- 就近轴悬停浮层：只显示当前指向的单个指标（数值 + 较上日/周/月） -->
                <div
                  v-show="radarTip.show"
                  class="rs-radar-tip"
                  :style="radarTip.style"
                  v-html="radarTip.html"
                />
              </div>
              <div class="rs-legend-chips">
                <button
                  v-for="(m, i) in monthlyReportStats"
                  :key="m.key"
                  type="button"
                  class="rs-chip"
                  :style="{ color: RADAR_AXIS_COLORS[i % RADAR_AXIS_COLORS.length] }"
                  :title="`点击查看「${m.label}」的组织下钻数据`"
                  @click="openMetricDrill(m)"
                >
                  <i
                    class="rs-chip-dot"
                    aria-hidden="true"
                    :style="{
                      background: RADAR_AXIS_COLORS[i % RADAR_AXIS_COLORS.length],
                      boxShadow: `0 0 6px ${RADAR_AXIS_COLORS[i % RADAR_AXIS_COLORS.length]}`,
                    }"
                  />
                  {{ m.label }}
                </button>
              </div>
            </section>
          </div>

          <!-- 中栏：资产总览主视觉 + 资产统计 -->
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

                <!-- 四周科技装饰：四角括号 + 上下光束 + 左右光带 + 浮动粒子。
                     起因：四角指标卡移入「资产统计」后，本面板四周空了出来，
                     原先由卡片占据的视觉重量需要用轻量装饰补回。
                     全部 pointer-events: none，不干扰中央球体与面板交互。 -->
                <div class="rs-hero-deco" aria-hidden="true">
                  <!-- 四角科技括号（带角部辉光） -->
                  <span class="rs-hero-corner rs-hero-corner--tl" />
                  <span class="rs-hero-corner rs-hero-corner--tr" />
                  <span class="rs-hero-corner rs-hero-corner--bl" />
                  <span class="rs-hero-corner rs-hero-corner--br" />
                  <!-- 上下横向光束：中间亮、两端淡出 -->
                  <span class="rs-hero-beam rs-hero-beam--top" />
                  <span class="rs-hero-beam rs-hero-beam--bottom" />
                  <!-- 左右竖向光带 -->
                  <span class="rs-hero-vlight rs-hero-vlight--left" />
                  <span class="rs-hero-vlight rs-hero-vlight--right" />
                  <!-- 浮动粒子：缓慢上浮 + 明暗呼吸 -->
                  <span v-for="p in 20" :key="`hd${p}`" class="rs-hero-dot" :style="heroDotStyle(p)" />
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

              <!-- 底部 SBOM 覆盖率指标带已按要求移入下方「资产流转统计」
                   （排在「本月净增资产」之后），本面板不再展示。 -->
            </section>

            <!-- 资产统计：4 项资产规模（源码数/制品数/许可证/语言生态，沿用 assetFlowStats 顺序）。
                 展现形式保持为数值卡（此前一度改为双轴柱图，按反馈恢复原样）；
                 每张卡下方的进度条此前已按要求去掉（各项量纲不可比，给条会误导）。 -->
            <section class="rs-panel rs-panel--hug">
              <div class="rs-panel-hd">
                <h3 class="rs-panel-title">资产统计</h3>
              </div>
              <div class="rs-flow-grid">
                <div v-for="a in assetFlowStats" :key="a.key" class="rs-flow-card">
                  <span class="rs-flow-label">{{ a.label }}</span>
                  <span class="rs-flow-value">
                    <CountUp class="rs-flow-num" :end="a.value" :decimals="a.decimals || 0" />
                    <em v-if="a.unit" class="rs-flow-unit">{{ a.unit }}</em>
                  </span>
                </div>
              </div>
            </section>

          </div>

          <!-- 下区（1/3 高度）：组织活跃度 Top10 / 最新漏洞动态 / 恶意代码检测动态，三块严格等分 -->
          <div class="rs-bottom">
            <section class="rs-panel">
              <div class="rs-panel-hd">
                <h3 class="rs-panel-title">组织活跃度 Top10</h3>
                <span class="rs-panel-note">点击组织看用户明细</span>
              </div>
              <!-- 组织活跃度榜单：平台以组织为统计单位（用户必须先加入组织才能使用），
                   故由「用户活跃」改为「组织活跃度」；名次带往期比对箭头，点击可下钻。 -->
              <div class="rs-org-rank">
                <button
                  v-for="o in orgActivity10"
                  :key="o.name"
                  type="button"
                  class="rs-org-row"
                  :title="`${o.name}：活跃度 ${o.score.toLocaleString()}，点击查看该组织内用户明细`"
                  @click="openOrgDrill(o.name)"
                >
                  <span class="rs-org-no" :class="`is-${o.rank}`">{{ o.rank }}</span>
                  <span class="rs-org-name" :title="o.name">{{ o.name }}</span>
                  <span class="rs-org-bar"><i :style="{ width: o.bar }" /></span>
                  <span class="rs-org-value">{{ o.score.toLocaleString() }}</span>
                  <!-- 往期名次比对：↑ 上升 / ↓ 下降 / — 持平 -->
                  <span class="rs-org-delta" :class="deltaClass(o.delta)" :title="`上期第 ${o.prevRank} 名`">
                    <i class="rs-org-arrow" :class="deltaClass(o.delta)" aria-hidden="true" />
                    <b>{{ o.delta === 0 ? '持平' : Math.abs(o.delta) }}</b>
                  </span>
                </button>
              </div>
            </section>

            <section class="rs-panel">
              <div class="rs-panel-hd">
                <h3 class="rs-panel-title">最新漏洞动态</h3>
                <span class="rs-panel-note">最新 {{ vulnFeed10.length }} 条</span>
              </div>
              <div class="rs-panel-body">
                <ScreenTable :columns="vulnColumns" :rows="vulnFeed10" :duration="46" />
              </div>
            </section>

            <section class="rs-panel">
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

    <!-- 组织下钻弹窗：展示脱敏后的用户级统计（月报统计量与组织活跃度两处复用） -->
    <OrgDrillDialog
      :open="drillOpen"
      :title="drillTitle"
      :subtitle="drillSubtitle"
      :users="drillUsers"
      :show-org="drillShowOrg"
      :metric-key="drillMetricKey"
      @close="drillOpen = false"
    />
  </div>
</template>

<script setup>
/**
 * 可信开源代码库数据大屏 · 政务科技风两段式布局
 *
 * 布局按领导要求改为「上 2/3 + 下 1/3」：
 *   上区（2/3 高度）三栏 = 日变化数据（月报统计量，较上日/周/月比对，可下钻）
 *                        + 资产趋势（源码/制品/漏洞感知/版本更新，近 12 月）
 *                      + 资产数（资产总览主视觉能量球 + 资产统计分项）
 *                      + 用户数（注册用户/注册企业放大 + 活跃度指标）
 *                        + 安全风险总览（漏洞总数 / 高危漏洞数 / 恶意代码检出）
 *   下区（1/3 高度）三列 = 组织活跃度 Top10 / 最新漏洞动态 / 恶意代码检测动态
 *
 * 上下两行都是 repeat(3, 1fr) 严格等分，竖直分隔线上下贯通、左右对称。
 *
 * 视觉：深空蓝底 + #005BCB 品牌青蓝 + 面板四角括号 + 中央能量球；
 *       克制发光与装饰密度，保证政务场景的高级感。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import CountUp from '../../components/CountUp.vue'
import ScreenTable from '../../components/screen/ScreenTable.vue'
import OrgDrillDialog from '../../components/screen/OrgDrillDialog.vue'
import {
  platformMeta,
  assetCards,
  vulnFeed,
  malwareFeed,
  userOverview,
  monthlyReportStats,
  orgActivityTop10,
  orgDrillStats,
  maskUserName,
  USER_OVERVIEW_FEATURED_KEYS,
  assetFlowStats,
  footerInfo,
} from '../../data/regulatorScreenData.js'

/* ===== 用户行为总览：放大项 ===== */
/** 放大展示：注册用户数 / 注册组织数（领导要求突出） */
const userOverviewFeatured = computed(() =>
  userOverview.filter((u) => USER_OVERVIEW_FEATURED_KEYS.includes(u.key)))

/** 放大卡图标（内联 SVG，stroke=currentColor；颜色由卡片的 .is-* 类注入） */
const FEATURED_ICONS = {
  // 注册用户：双人剪影
  regUser:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>'
    + '<path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  // 注册组织：楼宇
  regOrg:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/>'
    + '<path d="M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01"/></svg>',
}

/* ===== 上区三块面板：图表化改造（ECharts）=====
   改造原则：只换展现形式，数据项与改造前一一对应，不新增任何指标。
   具体数值一律收进 tooltip（鼠标悬停显示），图上只保留图形与名称。 */

/** 图表公共样式：深色 tooltip / 轴文字 / 分割线，与面板玻璃质感对齐 */
const CHART_TIP = {
  backgroundColor: 'rgba(8, 24, 46, 0.96)',
  borderColor: 'rgba(56, 189, 248, 0.45)',
  borderWidth: 1,
  padding: [8, 12],
  textStyle: { color: '#E2ECF8', fontSize: 12 },
  extraCssText: 'box-shadow: 0 10px 26px rgba(0, 0, 0, 0.55); border-radius: 6px;',
}
const AXIS_TEXT = '#9DC0E4'
const AXIS_SPLIT = 'rgba(0, 145, 255, 0.18)'

/** 柱体渐变：顶部亮、底部透，配同色辉光，避免平涂色块显得廉价 */
function barGradient(top, bottom, shadow) {
  return {
    borderRadius: [3, 3, 0, 0],
    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: top },
      { offset: 1, color: bottom },
    ]),
    shadowBlur: 10,
    shadowColor: shadow,
  }
}

/** 取用户行为总览里的某一项（找不到时给 0，避免图表报错） */
function userItem(key) {
  return userOverview.find((u) => u.key === key) || { value: 0, unit: '', label: key }
}

/**
 * 左栏「用户数」：柱状图（4 根柱）。
 * 顺序 = 注册用户数 / 活跃用户 / 注册组织数 / 活跃组织；柱顶直接标数值。
 * 已按反馈去掉两根「活跃率」柱，只留数量柱（人 / 家同轴，单位在 tooltip 中注明）；
 * 活跃率仍作为悬停明细附带显示（活跃数 / 注册数，由既有两项相除得到）。
 */
function userChartOption() {
  const regUser = userItem('regUser')
  const regOrg = userItem('regOrg')
  const activeUser = userItem('activeUser')
  const activeOrg = userItem('activeOrg')
  const rate = (active, registered) =>
    registered > 0 ? Number(((active / registered) * 100).toFixed(1)) : 0
  /** 每根柱的元信息：类目 / tooltip 文案 / 归属系列（同一类目只有一根柱有值） */
  const rows = [
    { cat: '注册用户数', label: regUser.label || '注册用户数量', value: regUser.value, unit: regUser.unit, series: '注册' },
    { cat: '活跃用户', label: activeUser.label || '活跃用户', value: activeUser.value, unit: regUser.unit, extra: `活跃率 ${rate(activeUser.value, regUser.value)}%`, series: '活跃' },
    { cat: '注册组织数', label: regOrg.label || '注册组织数量', value: regOrg.value, unit: regOrg.unit, series: '注册' },
    { cat: '活跃组织', label: activeOrg.label || '活跃组织', value: activeOrg.value, unit: regOrg.unit, extra: `活跃率 ${rate(activeOrg.value, regOrg.value)}%`, series: '活跃' },
  ]
  /** 每个系列只在自己的类目上有值；barGap:-100% 让同位置的柱重叠居中 */
  const makeSeries = (name, colors) => ({
    name,
    type: 'bar',
    barWidth: '58%',
    barMaxWidth: 86,
    barGap: '-100%',
    itemStyle: barGradient(...colors),
    label: {
      show: true,
      position: 'top',
      // 数字跟系列同色：注册青蓝、活跃金色；Orbitron 字体 + 加粗，投屏更醒目
      color: name === '注册' ? '#7DDCFF' : '#FFD98A',
      fontSize: 13,
      fontWeight: 700,
      fontFamily: "'Orbitron', 'DIN Alternate', ui-monospace, monospace",
      formatter: (p) => Number(p.value).toLocaleString(),
    },
    data: rows.map((r) => (r.series === name ? r.value : null)),
  })
  return {
    animationDuration: 900,
    // 留出放大卡的空间：顶部留白加大，柱体高度随之收一档
    grid: { left: 6, right: 6, top: 52, bottom: 4, containLabel: true },
    legend: {
      top: 0,
      right: 0,
      itemWidth: 16,
      itemHeight: 10,
      itemGap: 18,
      icon: 'roundRect',
      data: ['注册', '活跃'],
      textStyle: { color: '#B9D6F2', fontSize: 13, fontWeight: 600 },
    },
    tooltip: {
      trigger: 'item',
      ...CHART_TIP,
      formatter: (p) => {
        const r = rows[p.dataIndex]
        const extra = r.extra
          ? `<div style="display:flex;gap:16px;justify-content:space-between">
              <span style="color:#C8DEF5">占比</span>
              <b style="color:#FFD98A">${r.extra}</b></div>`
          : ''
        return `<div style="font-weight:600;margin-bottom:4px;color:#7DDCFF">${r.label}</div>
          <div style="display:flex;gap:16px;justify-content:space-between">
          <span style="color:#C8DEF5">${r.cat}</span>
          <b>${Number(r.value).toLocaleString()} ${r.unit || ''}</b></div>${extra}`
      },
    },
    xAxis: {
      type: 'category',
      data: rows.map((r) => r.cat),
      axisLabel: { color: '#C8DEF5', fontSize: 10.5, interval: 0 },
      axisLine: { lineStyle: { color: 'rgba(0, 145, 255, 0.25)' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#7DDCFF',
        fontSize: 10,
        formatter: (v) => (v >= 1000 ? `${v / 1000}k` : v),
      },
      splitLine: { lineStyle: { color: AXIS_SPLIT, type: 'dashed' } },
    },
    series: [
      makeSeries('注册', ['#38BDF8', 'rgba(0, 91, 203, 0.35)', 'rgba(56, 189, 248, 0.35)']),
      makeSeries('活跃', ['#FFD98A', 'rgba(180, 130, 20, 0.3)', 'rgba(255, 217, 138, 0.3)']),
    ],
  }
}

/* ===== 资产总览：中心总数（主视觉）=====
   四角指标卡与底部 SBOM 指标带已按要求移入中栏「资产流转统计」表格，
   故不再需要 heroSideCards / heroBand / CORNER_POS —— 已随之删除，避免死代码。
   注意：不要用 regulatorMetrics —— 那是平台暂无口径的**演示数据**，属造数。 */
const heroTotal = assetCards.find((c) => c.key === 'total') || { value: 0, unit: '', hint: '' }

/* ===== 平台使用情况（月报统计量）：比对项 + 组织下钻 ===== */
/** 箭头符号：增加 ↑ / 减少 ↓ / 持平 — */
const ARROW = { up: '↑', down: '↓', flat: '—' }

/**
 * 把某指标的 compare 展开为三行比对（较上日 / 较上周 / 较上月）。
 * 需求原话：增加「较上日/周/月，增加/持平/减少 XXX」并配趋势箭头。
 * 数值带符号（如 +320 / -140），持平显示「持平」。
 */
function compareItems(metric) {
  const c = metric.compare || {}
  return [
    { key: 'day', label: '日', dir: c.dayDir || 'flat', val: Number(c.day) || 0 },
    { key: 'week', label: '周', dir: c.weekDir || 'flat', val: Number(c.week) || 0 },
    { key: 'month', label: '月', dir: c.monthDir || 'flat', val: Number(c.month) || 0 },
  ].map((x) => ({
    ...x,
    arrow: ARROW[x.dir],
    text: x.dir === 'flat' ? '持平' : `${x.val > 0 ? '+' : ''}${x.val.toLocaleString()}`,
  }))
}

/* ===== 右栏「日变化数据」：雷达图 ===== */
/** 雷达轴名：完整标签过长，按语义折成两行；完整名称仍出现在 tooltip 里 */
const RADAR_AXIS_NAME = {
  visits: '平台\n访问量',
  search: '开源项目\n搜索量',
  download: '源码\n下载',
  inbound: '代码入库\n反馈量',
  batchPull: '研发场景\n继承',
  singlePull: '在线使用\n系统',
}

/** 雷达 6 轴专色：鲜艳霓虹档（亮青/天蓝/紫/青绿/绿/金），第 3 轴用紫色点缀 */
const RADAR_AXIS_COLORS = ['#00E5FF', '#00B0FF', '#A855F7', '#00E5C3', '#22E06B', '#FFC53D']

/**
 * 右栏「日变化数据」：雷达图（6 轴 = 6 项月报统计量，与改造前的 6 张卡一一对应）。
 * 6 项量级从 42 到 12,680，线性归一会把小值压成贴中心的一条线；
 * 故按对数归一到 0~1 **只用于图形形状**，实际数值与「较上日/周/月」全部由 tooltip 给出，
 * 原始数据不做任何改动。
 */
function radarChartOption() {
  const maxValue = Math.max(...monthlyReportStats.map((m) => m.value), 10)
  const denom = Math.log(maxValue)
  const normalized = monthlyReportStats.map((m) =>
    Number((Math.log(Math.max(m.value, 1)) / denom).toFixed(4)),
  )
  /* 鲜艳霓虹配色（按反馈再鲜艳一档）：
     面积 = 径向渐变（中心亮青 0.62 → 中段亮蓝 0.5 → 外缘亮紫 0.3）；
     描边 = 对角线性渐变（亮青 → 亮蓝 → 亮紫），配同色辉光；
     网格环与分区底色同步提亮。 */
  const areaGradient = new echarts.graphic.RadialGradient(0.5, 0.5, 0.92, [
    { offset: 0, color: 'rgba(0, 229, 255, 0.62)' },
    { offset: 0.55, color: 'rgba(0, 176, 255, 0.5)' },
    { offset: 1, color: 'rgba(168, 85, 247, 0.3)' },
  ])
  const strokeGradient = new echarts.graphic.LinearGradient(0, 0, 1, 1, [
    { offset: 0, color: '#00E5FF' },
    { offset: 0.5, color: '#00B0FF' },
    { offset: 1, color: '#A855F7' },
  ])
  return {
    animationDuration: 900,
    // 自带 tooltip 会把 6 项全部列出，按反馈关闭，改由 bindRadarHover 的就近轴浮层只显示当前一项
    tooltip: { show: false },
    radar: {
      // 中心再上移（53% → 50%）：底部名称条占位，整图偏上更平衡
      center: ['50%', '50%'],
      // 字号放大一档（11.5 → 13），半径相应从 74% 收到 71%，避免轴名贴边被裁
      radius: '71%',
      splitNumber: 4,
      indicator: monthlyReportStats.map((m, i) => ({
        name: RADAR_AXIS_NAME[m.key] || m.label,
        max: 1,
        // RadarModel 会把 indicator.color 合并进该轴的 nameTextStyle → 轴名按轴着色
        color: RADAR_AXIS_COLORS[i % RADAR_AXIS_COLORS.length],
      })),
      axisName: { fontSize: 13, lineHeight: 17 },
      axisLine: { lineStyle: { color: 'rgba(125, 211, 252, 0.32)' } },
      // splitLine.color 支持数组：按环序号轮转，每一圈一个鲜艳色
      splitLine: {
        lineStyle: {
          width: 1,
          color: [
            'rgba(0, 229, 255, 0.42)',
            'rgba(0, 176, 255, 0.38)',
            'rgba(168, 85, 247, 0.38)',
            'rgba(0, 229, 195, 0.34)',
          ],
        },
      },
      splitArea: { areaStyle: { color: ['rgba(0, 229, 255, 0.1)', 'rgba(168, 85, 247, 0.18)'] } },
    },
    series: [
      // 光晕层：同一组数值加粗低透明描边，纯装饰、不参与悬停与缩放
      {
        type: 'radar',
        silent: true,
        symbol: 'none',
        lineStyle: {
          width: 9,
          color: strokeGradient,
          opacity: 0.18,
          shadowBlur: 14,
          shadowColor: 'rgba(56, 189, 248, 0.4)',
        },
        data: [{ value: normalized }],
        z: 1,
      },
      {
        type: 'radar',
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: {
          width: 2.2,
          color: strokeGradient,
          shadowBlur: 12,
          shadowColor: 'rgba(56, 189, 248, 0.65)',
        },
        itemStyle: {
          color: '#A5F3FC',
          borderColor: '#22D3EE',
          borderWidth: 1.4,
          shadowBlur: 8,
          shadowColor: 'rgba(34, 211, 238, 0.7)',
        },
        areaStyle: { color: areaGradient },
        data: [{ value: normalized, name: '月报统计量' }],
        z: 2,
      },
    ],
  }
}

/* ===== 上区图表实例：两个容器各自 init，统一 ResizeObserver 与销毁 =====
   面板随视口缩放（且大屏本体按 vw/vh 流式布局），故用 ResizeObserver 跟随容器。 */
const userChartRef = ref(null)
const radarChartRef = ref(null)
/** [{ chart, ro }]：卸载时统一 disconnect + dispose，避免实例泄漏 */
const chartEntries = []

function mountChart(el, option) {
  if (!el) return null
  const chart = echarts.init(el)
  chart.setOption(option)
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => chart.resize()) : null
  ro?.observe(el)
  chartEntries.push({ chart, ro })
  return chart
}

/* ===== 雷达图「就近轴」悬停提示 =====
   echarts 雷达图的 item tooltip 只能整系列展示（会把 6 项全部列出），
   按反馈改为只显示鼠标当前指向的那一轴：按鼠标相对雷达中心的角度就近取轴，
   用 DOM 浮层渲染（样式与 echarts tooltip 保持一致）。 */
const radarTip = ref({ show: false, html: '', style: {} })
/** 与 radarChartOption 中 center ['50%','50%']、radius '71%' 保持一致 */
const RADAR_CENTER = { x: 0.5, y: 0.5 }
const RADAR_RADIUS = 0.71

/** 鼠标位置命中的雷达轴下标；不在雷达范围内返回 -1 */
function radarAxisAt(offsetX, offsetY, w, h) {
  const cx = w * RADAR_CENTER.x
  const cy = h * RADAR_CENTER.y
  const radius = (RADAR_RADIUS * Math.min(w, h)) / 2
  const dx = offsetX - cx
  const dy = offsetY - cy
  const dist = Math.hypot(dx, dy)
  if (dist < 6 || dist > radius * 1.08) return -1
  const count = monthlyReportStats.length
  // ECharts 雷达轴自正上方起「逆时针」均分（coordToPoint: x=cx+cosθ, y=cy−sinθ，startAngle=90°）。
  // 先把鼠标方位角换算回 echarts 的角度体系（屏幕 y 向下，故取 −dy），再按 360/count 就近取整。
  const theta = (Math.atan2(-dy, dx) * 180) / Math.PI
  const idx = Math.round((theta - 90) / (360 / count))
  return ((idx % count) + count) % count
}

/** 单个指标的浮层内容：名称 + 实际数值 + 较上日/周/月比对（比对一项一行，宽度只取最长一行） */
function radarTipHtml(m) {
  const cmp = compareItems(m)
    .map((c) => {
      const color = c.dir === 'up' ? '#6EE7A8' : c.dir === 'down' ? '#FF8A7A' : '#8FA8C4'
      return `<span style="color:${color}">较${c.label === '日' ? '昨日' : `上${c.label}`} ${c.text}</span>`
    })
    .join('')
  return `<div class="rs-tip-title">${m.label}</div>
    <div class="rs-tip-value">${Number(m.value).toLocaleString()}<em>${m.unit || ''}</em></div>
    <div class="rs-tip-cmp">${cmp}</div>`
}

/** 绑定雷达图的就近轴悬停（zrender 层监听，不依赖 echarts 的系列级 tooltip） */
function bindRadarHover(chart, el) {
  const zr = chart.getZr()
  zr.on('mousemove', (e) => {
    const w = el.clientWidth
    const h = el.clientHeight
    const idx = radarAxisAt(e.offsetX, e.offsetY, w, h)
    if (idx < 0) {
      radarTip.value.show = false
      return
    }
    radarTip.value = {
      show: true,
      html: radarTipHtml(monthlyReportStats[idx]),
      style: {
        left: `${Math.min(e.offsetX + 16, Math.max(w - 200, 8))}px`,
        top: `${Math.min(e.offsetY + 12, Math.max(h - 110, 8))}px`,
      },
    }
  })
  zr.on('globalout', () => { radarTip.value.show = false })
}

/* ===== 组织下钻弹窗（按指标下钻）===== */
const drillOpen = ref(false)
const drillTitle = ref('')
const drillSubtitle = ref('')
/** 弹窗行数据：单组织下钻时用该组织用户；按指标下钻时为跨组织的用户集合（带 org 字段） */
const drillUsers = ref([])
/** 是否显示「所属组织」列 */
const drillShowOrg = ref(false)
/** 聚焦指标列（高亮对应列） */
const drillMetricKey = ref('')

/**
 * 点击月报统计量卡片 → 打开组织下钻弹窗。
 * 因平台真实看板只到组织级，这里按「指标 → 对应的用户级字段」做跨组织汇总展示：
 *   visits/search/download → pv/download/ai 等用户行为字段
 * 展示的是**脱敏后**的用户数据（数据层已过 maskUserName），并标出各用户所属组织。
 */
function openMetricDrill(metric) {
  const FIELD = { visits: 'pv', search: 'pv', download: 'download', embed: 'api', inbound: 'ai', batchPull: 'api', singlePull: 'api' }
  const field = FIELD[metric.key] || 'pv'
  const rows = []
  Object.entries(orgDrillStats).forEach(([org, users]) => {
    users.forEach((u) => rows.push({ ...u, org }))
  })
  rows.sort((a, b) => (Number(b[field]) || 0) - (Number(a[field]) || 0))
  drillTitle.value = `${metric.label} · 组织下钻`
  drillSubtitle.value = `按「${metric.label}」相关的用户行为降序展示，跨组织汇总；用户姓名已脱敏`
  drillUsers.value = rows
  drillShowOrg.value = true
  drillMetricKey.value = field
  drillOpen.value = true
}

/** 点击组织（组织活跃度榜单）→ 打开该组织内的用户级下钻 */
function openOrgDrill(orgName) {
  drillTitle.value = `${orgName} · 用户级统计`
  drillSubtitle.value = '该组织内用户活跃分布，用户姓名已脱敏'
  drillUsers.value = orgDrillStats[orgName] || []
  drillShowOrg.value = false
  drillMetricKey.value = 'pv'
  drillOpen.value = true
}

/* ===== 组织活跃度 Top10（按活跃度得分归一化进度条）===== */
const orgActivity10 = computed(() => {
  const list = orgActivityTop10.slice(0, 10)
  const max = Math.max(...list.map((o) => o.score), 1)
  return list.map((o) => ({
    ...o,
    bar: `${Math.max(12, Math.round((o.score / max) * 100))}%`,
    // 名次变化：正=上升，负=下降，0=持平
    delta: (o.prevRank || o.rank) - o.rank,
  }))
})

/** 名次变化方向 → 样式类（up 上升 / down 下降 / flat 持平） */
function deltaClass(delta) {
  if (delta > 0) return 'is-up'
  if (delta < 0) return 'is-down'
  return 'is-flat'
}

/* 注：原先这里有一个 flowBarWidth()（按 barMax 归一算条形宽度）。
   资产统计卡下方的进度条已按要求去掉，该函数随之删除，避免死代码。 */

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

/**
 * 「资产总览」面板内浮动粒子的位置与动画参数。
 * 与全屏 particleStyle 用同一套确定性伪随机（同序号每次结果一致），
 * 但把粒子收在面板四周：靠近中部的粒子会让中央球体显得杂乱，故按环形分布。
 */
function heroDotStyle(i) {
  const rnd = ((i * 7919 + 104729) % 233280) / 233280
  const rnd2 = ((i * 6151 + 31337) % 233280) / 233280
  // 左右两侧各占约 1/3，避免压在中间球体上
  const left = rnd < 0.5 ? rnd * 62 : 38 + rnd * 62
  return {
    left: `${left.toFixed(2)}%`,
    top: `${(8 + rnd2 * 84).toFixed(2)}%`,
    animationDelay: `${(rnd * 7).toFixed(2)}s`,
    animationDuration: `${7 + (i % 4) * 2.5}s`,
    // 粒子大小 1~2.5px 之间微差，避免整齐划一显得机械
    width: `${(1 + rnd2 * 1.5).toFixed(2)}px`,
    height: `${(1 + rnd2 * 1.5).toFixed(2)}px`,
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
  // 图表在 DOM 就绪后初始化（面板入场动画只做 transform，不影响布局尺寸）
  mountChart(userChartRef.value, userChartOption())
  const radarChart = mountChart(radarChartRef.value, radarChartOption())
  if (radarChart) bindRadarHover(radarChart, radarChartRef.value)
})

onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer)
  chartEntries.forEach(({ chart, ro }) => {
    ro?.disconnect()
    chart.dispose()
  })
  chartEntries.length = 0
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

/* ===== 主体：上区 2/3（用户数 + 日变化数据 · 资产数 · 安全风险总览 + 资产趋势）+ 下区 1/3（组织活跃度 / 漏洞动态 / 恶意代码动态） ===== */
.rs-main {
  position: relative;
  z-index: 2;
  flex: 1;
  min-height: 0;
  display: grid;
  /* 上区三栏严格等分（领导要求版面左右对称，不按内容重量配比）：
     用户数 / 资产数 / 日变化数据 各占三分之一。 */
  grid-template-columns: repeat(3, minmax(0, 1fr));
  /* 关键：上区 2 份、下区 1 份，行高约束在可用空间内，防止内容把整页撑出视口 */
  grid-template-rows: minmax(0, 2fr) minmax(0, 1fr);
  gap: var(--gap);
  padding-top: var(--gap);
}
/* 上区三个栏位各占一列一行；下区三列表跨满整行 */
.rs-col--left { grid-column: 1; grid-row: 1; }
.rs-col--center { grid-column: 2; grid-row: 1; }
.rs-col--right { grid-column: 3; grid-row: 1; }
.rs-bottom {
  grid-column: 1 / -1;
  grid-row: 2;
  min-height: 0;
  display: grid;
  /* 下区 1/3：组织活跃度 Top10 / 最新漏洞动态 / 恶意代码检测动态，三块严格等宽。
     与上区三栏同一套 repeat(3, 1fr)，竖直分隔线上下贯通、左右对称。 */
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--gap);
}
.rs-col {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--gap);
}
/* 栏内纵向配比（上区现为三个单面板栏，左右两栏各一块面板独占整栏高度）：
   左栏只有「用户数」、右栏只有「日变化数据」，二者都 flex:1 铺满；
   中栏「资产总览」吃掉扣掉「资产统计」后的剩余高度（球体按容器查询单位自适应）。
   注意必须用栏位限定，避免影响下区各列的高度。 */
.rs-col--left .rs-panel--fill { flex: 1; }
.rs-col--right .rs-panel--mstat { flex: 1; }
.rs-col--center .rs-hero { flex: 1; }
/* 上区三块面板均已图表化（echarts 深色配置见脚本）：
   图容器 flex:1 铺满面板剩余高度，「名称 / 数值」由图形与悬停 tooltip 承载。 */
.rs-chart {
  flex: 1;
  min-height: 0;
  width: 100%;
}

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

/* ---- 四周科技装饰：四角括号 / 上下光束 / 左右光带 / 浮动粒子 ----
   用途：四角指标卡移入「资产统计」后本面板四周空出，用轻量装饰补回视觉重量。
   层级：DOM 顺序在背景 SVG 之后、中央球体之前 → 天然压在背景上、衬在球体下，
   故不设 z-index。整体 pointer-events: none，不影响面板交互。
   透明度整体克制（0.4~0.9），避免与中央球体争夺注意力。 */
.rs-hero-deco {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* 四角科技括号：只保留朝内的两条边，形成「框角」效果 */
.rs-hero-corner {
  position: absolute;
  width: 34px;
  height: 34px;
  border: 2px solid rgba(56, 189, 248, 0.5);
  filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.4));
}

.rs-hero-corner--tl {
  top: 10px;
  left: 10px;
  border-right: none;
  border-bottom: none;
  border-top-left-radius: 3px;
}

.rs-hero-corner--tr {
  top: 10px;
  right: 10px;
  border-left: none;
  border-bottom: none;
  border-top-right-radius: 3px;
}

.rs-hero-corner--bl {
  bottom: 10px;
  left: 10px;
  border-right: none;
  border-top: none;
  border-bottom-left-radius: 3px;
}

.rs-hero-corner--br {
  bottom: 10px;
  right: 10px;
  border-left: none;
  border-top: none;
  border-bottom-right-radius: 3px;
}

/* 上下横向光束：中间亮、两端淡出；::after 再补一层极淡辉光，
   避免只是一根细线显得单薄 */
.rs-hero-beam {
  position: absolute;
  left: 12%;
  right: 12%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(125, 220, 255, 0.5) 50%, transparent);
}

.rs-hero-beam::after {
  content: '';
  position: absolute;
  left: 18%;
  right: 18%;
  height: 26px;
  background: linear-gradient(180deg, rgba(56, 189, 248, 0.12), transparent);
}

.rs-hero-beam--top {
  top: 14px;
}

.rs-hero-beam--bottom {
  bottom: 14px;
}

/* 下光束的辉光向下淡出，方向与上光束相反 */
.rs-hero-beam--bottom::after {
  top: auto;
  bottom: 0;
  background: linear-gradient(0deg, rgba(56, 189, 248, 0.12), transparent);
}

/* 左右竖向光带：进一步框住中央区域，同时不遮挡球体 */
.rs-hero-vlight {
  position: absolute;
  top: 18%;
  bottom: 18%;
  width: 1px;
  background: linear-gradient(180deg, transparent, rgba(56, 189, 248, 0.4) 50%, transparent);
}

.rs-hero-vlight--left {
  left: 16px;
}

.rs-hero-vlight--right {
  right: 16px;
}

/* 浮动粒子：缓慢上浮 + 明暗呼吸；大小与位置由 heroDotStyle 逐颗给出 */
.rs-hero-dot {
  position: absolute;
  border-radius: 50%;
  background: rgba(125, 220, 255, 0.9);
  box-shadow: 0 0 7px rgba(56, 189, 248, 0.7);
  animation-name: rs-hero-float;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

@keyframes rs-hero-float {
  0% {
    transform: translateY(6px);
    opacity: 0;
  }
  25% {
    opacity: 0.95;
  }
  75% {
    opacity: 0.7;
  }
  100% {
    transform: translateY(-16px);
    opacity: 0;
  }
}

/* ---- 四角指标卡的样式已随卡片移入「资产流转统计」而删除 ----
   原先这里有 .rs-hero-metric / -frame / -scan / -label / -num / -unit 及
   tone 配色、扫描光动画等约 120 行；四角卡移除后这些选择器已无任何模板引用，
   保留会成为死代码，故一并删除（历史实现可查 git 记录）。 */

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

/* ---- 底部 SBOM 指标带的样式已随该指标移入「资产流转统计」而删除 ---- */

/* ===== 中栏：资产统计（资产维度）===== */
/* 面板按内容高度，不参与拉伸 —— 否则卡片下方留白 */
.rs-panel--hug {
  flex: 0 0 auto;
}
/* 4 列 × 1 行 = 4 项资产规模：软件源码数 / 组织制品数 / 开源许可证数量 / 覆盖语言生态数。
   「本期流转与覆盖」一行与卡片进度条此前已按要求移除（各项量纲不可比，给条会误导）。 */
.rs-flow-grid {
  flex: none;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 7px;
}
.rs-flow-card {
  display: flex;
  flex-direction: column;
  justify-content: safe center;
  gap: 5px;
  min-height: 62px;
  padding: 7px 10px;
  /* 底色加深，与浅色文字拉开对比（投屏环境光会进一步压低对比） */
  background: rgba(4, 22, 46, 0.82);
  border: 1px solid rgba(0, 145, 255, 0.34);
  border-radius: 6px;
  overflow: hidden;
}
.rs-flow-label {
  flex-shrink: 0;
  font-size: clamp(10.5px, 0.7vw, 12.5px);
  font-weight: 500;
  color: #C8DEF5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rs-flow-value { display: flex; align-items: baseline; gap: 3px; min-width: 0; }
.rs-flow-num {
  font-family: 'DIN Alternate', ui-monospace, monospace;
  font-size: clamp(15px, 1.15vw, 23px);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #A5E7FF;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 16px rgba(56, 189, 248, 0.6);
  white-space: nowrap;
}
.rs-flow-unit {
  flex-shrink: 0;
  font-style: normal;
  font-size: clamp(9.5px, 0.62vw, 11.5px);
  color: #A8C6E6;
}

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
  /* 资产总览中心总数下方的提示（如「较昨日新增 1,842 项」）：调大一号便于投屏辨认 */
  font-size: clamp(11.5px, 0.78vw, 13px);
  color: #6EE7A8;
}

/* ===== 左栏：用户数（放大卡 + 活跃占比柱图）===== */
/* 面板占满整栏高度：放大卡按内容高度置顶，柱图（.rs-chart 为 flex:1）吃掉剩余高度。 */
.rs-panel--fill {
  flex: 1;
}
.rs-panel--fill .rs-kpi-featured { flex: none; }

/* 放大展示卡（注册用户数 / 注册组织数）：领导要求突出，数值更大 */
.rs-kpi-featured {
  flex: none;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
  /* 与下方柱图保持呼吸间距（用户反馈柱图贴卡片太紧，再次加大） */
  margin-bottom: 24px;
}
.rs-kpi-featured-card {
  display: flex;
  flex-direction: column;
  justify-content: safe center;
  gap: 8px;
  padding: 12px 14px;
  /* 比普通指标卡更亮的底 + 品牌色描边，形成视觉主次 */
  background: linear-gradient(150deg, rgba(9, 46, 92, 0.85), rgba(5, 26, 54, 0.7));
  border: 1px solid rgba(0, 145, 255, 0.4);
  border-radius: 6px;
  box-shadow: inset 0 0 18px rgba(0, 91, 203, 0.22);
  overflow: hidden;
}
.rs-kpi-featured-label {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13.5px;
  color: #B9D6F2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* 放大卡图标：做成带底色的图标块（30px 圆角方块），颜色与底色由卡片的 .is-* 类注入 */
.rs-kpi-featured-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  border: 1px solid rgba(56, 189, 248, 0.45);
  background: rgba(56, 189, 248, 0.14);
}
.rs-kpi-featured-icon :deep(svg) {
  display: block;
  width: 21px;
  height: 21px;
}
/* 按实体分色：注册用户 = 青蓝，注册组织 = 金色（图标底色、数字、描边同步） */
.rs-kpi-featured-card.is-regUser { border-color: rgba(56, 189, 248, 0.55); }
.rs-kpi-featured-card.is-regOrg { border-color: rgba(255, 217, 138, 0.5); }
.rs-kpi-featured-card.is-regUser .rs-kpi-featured-icon {
  color: #7DDCFF;
  background: rgba(56, 189, 248, 0.15);
  border-color: rgba(56, 189, 248, 0.5);
}
.rs-kpi-featured-card.is-regOrg .rs-kpi-featured-icon {
  color: #FDE68A;
  background: rgba(253, 230, 138, 0.14);
  border-color: rgba(253, 230, 138, 0.5);
}
.rs-kpi-featured-card.is-regUser .rs-kpi-featured-num { color: #7DDCFF; }
.rs-kpi-featured-card.is-regOrg .rs-kpi-featured-num { color: #FFD98A; }
.rs-kpi-featured-value {
  display: flex;
  align-items: baseline;
  gap: 3px;
  min-width: 0;
}
/* 放大：左栏现在只承载「用户数」，字号比普通指标卡再大一档；
   字体用全局已加载的 Orbitron（科技感数字字体），比 DIN 更有辨识度 */
.rs-kpi-featured-num {
  font-family: 'Orbitron', 'DIN Alternate', ui-monospace, monospace;
  font-size: clamp(42px, 3.6vw, 68px);
  font-weight: 700;
  letter-spacing: 0.01em;
  color: #7DDCFF;
  font-variant-numeric: tabular-nums;
  /* 去掉文字辉光（曾反馈「光影感不科技」）：纯净实色数字更利落 */
  text-shadow: none;
}
.rs-kpi-featured-unit {
  flex-shrink: 0;
  font-style: normal;
  font-size: 12px;
  color: var(--text-sub);
}

/* ===== 上区右栏：日变化数据（雷达图 + 名称条）===== */
/* 雷达图占面板主体，外面包一层定位容器用于放置自绘的「就近轴」悬停浮层 */
.rs-radar-wrap {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
/* 底部名称条只放指标名（数值与比对在悬停浮层中），
   点击名称仍可下钻，与改造前「点击指标卡下钻」的行为一致。 */
.rs-chart--radar {
  flex: 1;
  min-height: 0;
}
/* 就近轴浮层：只显示鼠标当前指向的那一个指标，样式对齐 echarts tooltip。
   宽度随内容自适应（max-content）——此前写死 min/max-width 且比对不换行，
   长文本会溢出卡片；现在宽度只取最长一行，max-width 仅作兜底。 */
.rs-radar-tip {
  position: absolute;
  z-index: 5;
  width: max-content;
  max-width: 240px;
  box-sizing: border-box;
  padding: 7px 10px;
  pointer-events: none;
  background: rgba(8, 24, 46, 0.96);
  border: 1px solid rgba(56, 189, 248, 0.45);
  border-radius: 6px;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.55);
}
.rs-radar-tip :deep(.rs-tip-title) {
  margin-bottom: 3px;
  font-size: 11px;
  color: #C8DEF5;
}
.rs-radar-tip :deep(.rs-tip-value) {
  font-family: 'DIN Alternate', ui-monospace, monospace;
  font-size: 17px;
  font-weight: 700;
  color: #7DDCFF;
  font-variant-numeric: tabular-nums;
}
.rs-radar-tip :deep(.rs-tip-value em) {
  margin-left: 2px;
  font-style: normal;
  font-size: 10px;
  color: #A8C6E6;
}
.rs-radar-tip :deep(.rs-tip-cmp) {
  margin-top: 3px;
  display: flex;
  flex-direction: column;
  gap: 1px;
  font-size: 10.5px;
  white-space: nowrap;
}
.rs-legend-chips {
  flex: none;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 5px;
  margin-top: 6px;
}
/* 名称条本体是 button（可点击下钻），需重置按钮默认样式。
   文字色由模板按雷达轴色内联注入（与上方 6 条轴一一对应），故此处不再写死 color。 */
.rs-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 4px 8px;
  font: inherit;
  font-size: 12px;
  line-height: 1.3;
  font-weight: 600;
  color: #A8C6E6;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: rgba(6, 34, 70, 0.55);
  border: 1px solid var(--hairline-soft);
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
/* 轴色圆点：颜色由模板内联注入 */
.rs-chip-dot {
  width: 7px;
  height: 7px;
  flex-shrink: 0;
  border-radius: 50%;
}
.rs-chip:hover {
  border-color: rgba(34, 211, 238, 0.6);
  background: rgba(10, 46, 92, 0.85);
}

/* 注：原「日变化数据」的 6 张指标卡（.rs-mstat-grid / .rs-mstat-* 及日/周/月
   比对行、CSS 三角箭头）已随雷达图改造整体移除，样式一并删除，避免死代码；
   数值与「较上日/周/月」比对现由图表 tooltip 承载（深色 tooltip 见脚本 CHART_TIP）。 */

/* ===== 左栏：组织活跃度 Top10（组织维度 + 往期名次比对 + 点击下钻）===== */
/* 需求要点：① 不再展示用户姓名（个人敏感信息）；② 改为组织维度；
             ③ 点击组织可下钻看脱敏后的用户明细；④ 名次带往期比对。 */
.rs-org-rank {
  flex: 1;
  min-height: 0;
  display: grid;
  /* 行高：下限 30px（舒适可读），空间富余时按 1fr 均分撑满。
     装不下时靠 overflow-y 手动滚动 —— 注意这里**没有、也不要加任何
     自动滚动动画**（曾用 ScreenUserRank 做过跑马灯式自动滚动，已移除）；
     手动滚动是允许的，不必为消除滚动条而把行高压到不可读。 */
  grid-auto-rows: minmax(30px, 1fr);
  gap: 4px;
  overflow-y: auto;
  /* 细滚动条：手动滚动可用，且能提示「下方还有内容」（不隐藏数据） */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 145, 255, 0.45) transparent;
}
/* Chrome（投屏环境）走 webkit 伪元素，与上面的 thin 保持一致的细样式 */
.rs-org-rank::-webkit-scrollbar { width: 4px; }
.rs-org-rank::-webkit-scrollbar-track { background: transparent; }
.rs-org-rank::-webkit-scrollbar-thumb {
  background: rgba(0, 145, 255, 0.45);
  border-radius: 2px;
}
/* 行本体是 button（可点击下钻），需重置按钮默认样式 */
.rs-org-row {
  display: grid;
  /* 名次 | 组织名 | 活跃度条 | 得分 | 名次变化 */
  grid-template-columns: 18px minmax(0, 1.2fr) minmax(0, 1fr) 46px 38px;
  align-items: center;
  gap: 7px;
  /* 不设固定高度：由 .rs-org-rank 的 grid-auto-rows 分配，随屏幕压缩变矮 */
  min-height: 0;
  padding: 0 8px;
  font: inherit;
  text-align: left;
  color: inherit;
  background: rgba(6, 34, 70, 0.55);
  border: 1px solid var(--hairline-soft);
  border-radius: 5px;
  cursor: pointer;
  transition: border-color 0.18s, background 0.18s;
}
.rs-org-row:hover { border-color: rgba(34, 211, 238, 0.6); background: rgba(10, 46, 92, 0.85); }

.rs-org-no {
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
.rs-org-no.is-1 { color: #1A1305; background: linear-gradient(160deg, #FFE08A, #E8B33B); }
.rs-org-no.is-2 { color: #0E1622; background: linear-gradient(160deg, #E8F1FA, #AFC4D8); }
.rs-org-no.is-3 { color: #211004; background: linear-gradient(160deg, #F0BE93, #C77E45); }

.rs-org-name {
  font-size: 10.5px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rs-org-bar {
  height: 5px;
  border-radius: 3px;
  background: rgba(3, 14, 29, 0.6);
  overflow: hidden;
}
.rs-org-bar i {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, rgba(0, 91, 203, 0.6), #38BDF8);
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.5);
}
.rs-org-value {
  font-family: ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  color: var(--brand-bright);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* 名次变化：数字 + 箭头，颜色区分升/降/持平 */
.rs-org-delta {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
  font-size: 9.5px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.rs-org-delta.is-up { color: #6EE7A8; }
.rs-org-delta.is-down { color: #FF8A7A; }
.rs-org-delta.is-flat { color: #8FA8C4; }
/* 箭头用 CSS 三角绘制，避免依赖字体符号（投屏缺字体会变豆腐块） */
.rs-org-arrow {
  width: 0;
  height: 0;
  border-left: 3px solid transparent;
  border-right: 3px solid transparent;
}
.rs-org-arrow.is-up { border-bottom: 5px solid #6EE7A8; }
.rs-org-arrow.is-down { border-top: 5px solid #FF8A7A; }
.rs-org-arrow.is-flat {
  width: 6px;
  height: 2px;
  border: none;
  background: #8FA8C4;
  border-radius: 1px;
}

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

/* 下区「组织活跃度 Top10」：在 1/3 高度内放 10 行，行高压到可读下限，
   超出时按既有约定允许手动滚动（不为挤空间牺牲可读性）。 */
.rs-bottom .rs-org-rank { grid-auto-rows: minmax(24px, 1fr); }

/* 注：上区右栏原有「安全风险总览」（.rs-panel--risk / .rs-risk-* 三行分色）
   与「资产趋势」（.rs-panel--chart + ScreenLineChart），两个面板已按要求整体移除，
   其全部样式与 --risk-* 颜色变量随之删除（漏洞/恶意代码仍在下区两张明细表中体现）。 */

/* 各面板依次入场：上区从左到右，下区从左上到右下 */
.rs-col--left .rs-panel:nth-child(1) { animation-delay: 0.05s; }
.rs-col--center .rs-panel:nth-child(1) { animation-delay: 0.09s; }
.rs-col--center .rs-panel:nth-child(2) { animation-delay: 0.16s; }
.rs-col--right .rs-panel:nth-child(1) { animation-delay: 0.07s; }
.rs-bottom .rs-panel:nth-child(1) { animation-delay: 0.22s; }
.rs-bottom .rs-panel:nth-child(2) { animation-delay: 0.26s; }
.rs-bottom .rs-panel:nth-child(3) { animation-delay: 0.30s; }

/* ==================================================================
   小屏适配（三档：紧凑 → 收紧 → 纵向堆叠）
   ================================================================== */

/* --- 一档：高度不足（如 1366×768）时压缩纵向占用 --- */
@media (max-height: 820px) {
  .rs-viewport { --gap: 8px; }
  .rs-screen { padding: 8px 12px 3px; }
  .rs-top { height: clamp(44px, 6vh, 58px); padding-bottom: 6px; }
  .rs-panel { padding: 7px 10px 8px; }
  /* ---- 上区矮屏压缩：放大卡与名称条收紧，图表本身随容器自适应 ---- */
  .rs-kpi-featured { margin-bottom: 18px; gap: 6px; }
  .rs-kpi-featured-card { padding: 7px 9px; gap: 3px; }
  .rs-kpi-featured-label { font-size: 12px; }
  .rs-kpi-featured-num {
    font-size: clamp(29px, 2.4vw, 46px);
    text-shadow: none;
  }
  .rs-chip { padding: 3px 6px; font-size: 11px; }
  .rs-legend-chips { gap: 4px; margin-top: 4px; }
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
  /* 组织活跃度榜单：窄屏收一档字号与列宽 */
  .rs-org-row { grid-template-columns: 16px minmax(0, 1.15fr) minmax(0, 0.85fr) 44px 34px; gap: 5px; padding: 0 6px; }
  .rs-org-name { font-size: 10px; }
  /* 注：原先此处收紧「四角指标卡」——该卡已移入资产流转统计，规则随之删除 */
  /* 球体尺寸由容器查询单位自适应，此处不再覆盖 width（覆盖会与 cq 的 height 冲突） */
}

/* --- 三档：窄屏或极矮屏：三栏降级为纵向单栏，允许滚动，避免内容被裁切 --- */
@media (max-width: 1024px), (max-height: 640px) {
  .rs-viewport { height: auto; min-height: 100vh; overflow: visible; }
  .rs-screen { height: auto; min-height: 100vh; padding: 10px 10px 6px; }
  .rs-main {
    /* 单栏堆叠：上区三栏（用户数 / 资产数 / 日变化）与下区三列表全部按内容高度纵向排列 */
    grid-template-columns: minmax(0, 1fr);
    grid-auto-rows: auto;
  }
  .rs-main > .rs-col,
  .rs-bottom { grid-column: 1; grid-row: auto; }
  .rs-bottom { grid-template-columns: minmax(0, 1fr); grid-auto-rows: auto; }
  .rs-col { gap: var(--gap); }
  /* 解除栏内纵向配比与填充，改为按内容高度 + 最小高度 */
  .rs-col--left .rs-panel,
  .rs-col--right .rs-panel,
  .rs-col--center .rs-hero { flex: none; }
  /* 面板不再整栏拉伸时，图表改为按固定高度呈现（容器高度为 0 会画不出图） */
  .rs-chart--user,
  .rs-chart--radar { flex: none; height: 300px; }
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
  /* 资产统计：窄屏/极矮屏下 4 列太挤（「开源许可证数量」这类 7 字标签会被裁），降为 2 列 */
  .rs-flow-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
  /* 名称条在移动端两列排布，避免 6 个 7 字标签挤成一行 */
  .rs-legend-chips { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .rs-panel { min-height: 180px; }
}

/* 尊重系统「减少动态效果」偏好。
   注：原先列表中的 .rs-hero-metric-scan::after（四角卡扫描光）已随卡片移除而删除。 */
@media (prefers-reduced-motion: reduce) {
  .rs-panel,
  .rs-bg-blob,
  .rs-bg-particle,
  .rs-bg-scan,
  .rs-bg-tech,
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
