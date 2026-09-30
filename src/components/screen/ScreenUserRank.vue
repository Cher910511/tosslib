<template>
  <div ref="wrapRef" class="urank">
    <div
      class="urank-track"
      :class="{ 'is-scrolling': overflowing }"
      :style="{ '--ur-duration': `${duration}s` }"
    >
      <!-- 仅在需要滚动时渲染两遍（无缝衔接需要）；不滚动时一遍即可，
           否则行数会翻倍、把自动高度的面板撑高（单栏布局下的隐患）。
           第二遍对无障碍隐藏。 -->
      <div
        v-for="pass in (overflowing ? 2 : 1)"
        :key="pass"
        class="urank-pass"
        :aria-hidden="pass === 2 ? 'true' : 'false'"
      >
        <div v-for="(u, i) in users" :key="`${pass}-${i}`" class="urank-row">
          <span class="urank-no" :class="`is-${i + 1}`">{{ i + 1 }}</span>
          <span class="urank-name" :title="u.name">{{ u.name }}</span>
          <span class="urank-bar"><i :style="{ width: u.bar }" /></span>
          <span class="urank-value">{{ num(u.pv) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 用户活跃排行榜（前 N 名）：固定行高 + 超出容器时无缝自动滚动。
 * 与 ScreenTable 同一交互口径（容器装得下就不滚动，避免露白与无谓动画）。
 *
 * 无缝滚动的关键：行距不能用容器 gap，必须用每行 margin-bottom ——
 * 这样「内容总高」是行高与间距的整数倍，translateY(-50%) 才能正好落到
 * 第二遍内容的起点；用 gap 时末行没有 gap，会累积误差导致循环处跳一下。
 */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  /** [{ name, pv, bar }]，bar 为进度条宽度（如 '80%'） */
  users: { type: Array, default: () => [] },
  /** 一轮滚动秒数 */
  duration: { type: Number, default: 26 },
})

const wrapRef = ref(null)
const overflowing = ref(false)
let ro = null

/** 千分位 */
function num(v) {
  return Number(v || 0).toLocaleString()
}

function measure() {
  const el = wrapRef.value
  if (!el) return
  const n = props.users.length
  if (!n) return

  // 行距（.urank-row 的 margin-bottom）与行高上下限
  const MB = 4
  const MIN_ROW = 32
  const MAX_ROW = 120

  /**
   * 先判定「容器高度是否确定」，只有确定时才做行高自适应。
   *
   * 单栏布局（≤1239px）下面板变为 flex: 0 0 auto、高度由内容决定，此时
   * clientHeight 会随 --ur-row-h 一起变大 —— 自适应将形成正反馈
   * （avail → rowH 变大 → 内容更高 → avail 更大），实测把整页高度顶到
   * 浏览器上限哨兵值 2^25，页面被撑爆。故用面板的 flex-basis 区分上下文：
   *   常规三栏 → 面板 flex 为 "2 1 0%"（basis 0%，高度由栏高分配，确定）
   *   单栏     → 面板 flex 为 "0 0 auto"（basis auto，高度随内容，不确定）
   */
  const panel = el.parentElement
  const definiteHeight = !!panel && getComputedStyle(panel).flexBasis !== 'auto'

  if (!definiteHeight) {
    // 自动高度：保持固定行高，面板自然容纳全部行（无需滚动，也不放大行高）
    el.style.setProperty('--ur-row-h', `${MIN_ROW}px`)
    overflowing.value = false
    return
  }

  // 安全上限：即使上下文判定失效，也不会把布局撑爆
  const avail = Math.min(el.clientHeight, 2000)

  /**
   * 行高自适应：每行分得 avail / n，扣掉行距后即为行高，限制在 [32, 120]。
   * 取整是为了两遍内容高度严格相等 —— 无缝滚动依赖 translateY(-50%)
   * 正好落在一遍的接缝上，出现半像素就会每圈跳一下。
   *
   * 一份逻辑覆盖两种情况：
   *   - 容器够高：行高被撑大，内容填满容器，不留白、不滚动；
   *   - 容器不足：行高触底 32px，内容高于容器，进入无缝滚动。
   * 注意：改 MB / MIN_ROW 时下面的滚动判定公式要同步改。
   */
  const rowH = Math.max(MIN_ROW, Math.min(MAX_ROW, Math.floor(avail / n - MB)))
  el.style.setProperty('--ur-row-h', `${rowH}px`)
  // 内容确实高出容器才滚动（留 4px 容差，避免临界抖动）
  overflowing.value = (rowH + MB) * n > avail + 4
}

onMounted(() => {
  measure()
  if (typeof ResizeObserver !== 'undefined' && wrapRef.value) {
    ro = new ResizeObserver(measure)
    ro.observe(wrapRef.value)
  }
})

watch(() => props.users, () => {
  requestAnimationFrame(measure)
}, { deep: true })

onBeforeUnmount(() => {
  ro?.disconnect()
  ro = null
})
</script>

<style scoped>
.urank {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  /* 上下渐隐，滚动更自然 */
  mask-image: linear-gradient(180deg, transparent 0, #000 8px, #000 calc(100% - 8px), transparent 100%);
  -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 8px, #000 calc(100% - 8px), transparent 100%);
}
.urank-track.is-scrolling {
  animation: ur-scroll var(--ur-duration, 26s) linear infinite;
}
/* 悬停暂停，便于查看具体条目 */
.urank:hover .urank-track.is-scrolling { animation-play-state: paused; }
@keyframes ur-scroll {
  from { transform: translateY(0); }
  to { transform: translateY(-50%); }
}

/* 每遍内容的包裹层：flow-root 建立 BFC，阻断末行 margin-bottom 塌陷穿出，
   使每遍高度 = (行高 + 行距) × 行数，translateY(-50%) 才能精确落在接缝上。
   不要改用 flex/grid 之外的技巧，也不要把行距换成容器 gap —— 末行无 gap 会再次累积误差。 */
.urank-pass {
  display: flow-root;
}

/* 行：高由 JS 按容器高度写入 --ur-row-h（下限 32px），行距用 margin-bottom。
   行距必须用 margin 而非容器 gap —— 末行没有 gap 会累积误差，
   translateY(-50%) 落点偏移，每圈跳一下（详见 measure() 注释）。 */
.urank-row {
  display: grid;
  grid-template-columns: 18px minmax(0, 1.2fr) minmax(0, 1fr) 46px;
  align-items: center;
  gap: 7px;
  height: var(--ur-row-h, 32px);
  margin-bottom: 4px;
  padding: 0 8px;
  background: rgba(6, 34, 70, 0.55);
  border: 1px solid var(--hairline-soft, rgba(0, 145, 255, 0.2));
  border-radius: 5px;
  box-sizing: border-box;
}

/* 名次徽标 */
.urank-no {
  width: 15px;
  height: 15px;
  display: grid;
  place-items: center;
  font-family: ui-monospace, monospace;
  font-size: 9.5px;
  font-weight: 700;
  color: #9DC0E4;
  background: rgba(56, 120, 190, 0.24);
  border-radius: 3px;
}
.urank-no.is-1 { color: #1A1305; background: linear-gradient(160deg, #FFE08A, #E8B33B); }
.urank-no.is-2 { color: #0E1622; background: linear-gradient(160deg, #E8F1FA, #AFC4D8); }
.urank-no.is-3 { color: #211004; background: linear-gradient(160deg, #F0BE93, #C77E45); }

.urank-name {
  font-size: 10.5px;
  color: #D6E7FA;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 进度条 */
.urank-bar {
  height: 5px;
  border-radius: 3px;
  background: rgba(3, 14, 29, 0.6);
  overflow: hidden;
}
.urank-bar i {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, rgba(0, 91, 203, 0.6), #38BDF8);
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.5);
}

.urank-value {
  font-family: ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  color: #38BDF8;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* 尊重系统「减少动态效果」偏好 */
@media (prefers-reduced-motion: reduce) {
  .urank-track.is-scrolling { animation: none; }
}
</style>
