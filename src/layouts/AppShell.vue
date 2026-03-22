<template>
  <div class="app-shell">
    <!-- 全应用统一背景（侧栏 + 主内容同一套） -->
    <div class="shell-bg" aria-hidden="true">
      <div class="tech-backdrop is-docked" aria-hidden="true">
        <div class="layer base-gradient"></div>
        <div class="layer aurora aurora-1"></div>
        <div class="layer aurora aurora-2"></div>
        <div class="layer grid-floor"></div>
        <div class="layer grid-fine"></div>
        <div class="layer hex-layer"></div>
        <div class="layer data-stream"></div>
        <div class="layer sweep"></div>
        <div class="layer scan-band scan-a"></div>
        <div class="layer scan-band scan-b"></div>
        <div class="layer orb orb-tl"></div>
        <div class="layer orb orb-br"></div>
        <div class="layer vignette"></div>
        <div class="layer noise"></div>
      </div>
      <canvas ref="particleCanvasRef" class="particle-canvas docked" aria-hidden="true"></canvas>
    </div>

    <aside class="sidebar">
      <div class="brand">
        <span class="brand-mark">TOS</span>
        <div class="brand-text">
          <span class="brand-title">可信开源</span>
          <span class="brand-sub">数据平台</span>
        </div>
      </div>

      <nav class="nav">
        <RouterLink
          class="nav-item"
          :to="{ name: 'home' }"
          active-class="active"
          exact-active-class="active"
        >
          <span class="nav-icon">◇</span>
          <span>态势总览</span>
        </RouterLink>

        <div class="nav-dropdown">
          <button
            type="button"
            class="nav-dropdown-trigger"
            :class="{ 'is-open': analyticsOpen, 'is-active-group': isAnalyticsRoute }"
            :aria-expanded="analyticsOpen"
            aria-controls="nav-analytics-sub"
            @click="analyticsOpen = !analyticsOpen"
          >
            <span class="nav-icon">▸</span>
            <span class="trigger-label">数据报表</span>
            <span class="caret" aria-hidden="true">{{ analyticsOpen ? '▲' : '▼' }}</span>
          </button>
          <div
            id="nav-analytics-sub"
            v-show="analyticsOpen"
            class="nav-dropdown-panel"
            role="region"
          >
            <RouterLink
              class="nav-item sub"
              :to="{ name: 'analytics-screen' }"
              active-class="active"
            >
              <span class="nav-icon">▣</span>
              <span>数据大屏</span>
            </RouterLink>
            <RouterLink
              class="nav-item sub"
              :to="{ name: 'report-tables' }"
              active-class="active"
            >
              <span class="nav-icon">▦</span>
              <span>标准表格</span>
            </RouterLink>
          </div>
        </div>
      </nav>
    </aside>

    <main class="shell-main">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()
const analyticsOpen = ref(false)

const isAnalyticsRoute = computed(() => route.path.startsWith('/analytics'))

watch(
  () => route.path,
  (path) => {
    if (path.startsWith('/analytics')) {
      analyticsOpen.value = true
    } else {
      analyticsOpen.value = false
    }
  },
  { immediate: true }
)

/* —— 粒子背景（原 ParticleBackground，固定 docked） —— */
const particleCanvasRef = ref(null)
let pCtx = null
let pW = 0
let pH = 0
let pDpr = 1
let pParticles = []
let pRaf = null

class ParticleDot {
  constructor() {
    this.reset()
  }
  reset() {
    this.x = Math.random() * pW
    this.y = Math.random() * pH
    this.vx = (Math.random() - 0.5) * 0.55
    this.vy = (Math.random() - 0.5) * 0.55
    this.r = Math.random() * 1.8 + 0.25
    this.a = Math.random() * 0.45 + 0.12
    this.hue = 185 + Math.random() * 40
  }
  step() {
    this.x += this.vx
    this.y += this.vy
    if (this.x < 0 || this.x > pW || this.y < 0 || this.y > pH) this.reset()
  }
}

function particleLoop() {
  if (!pCtx) return
  pCtx.clearRect(0, 0, pW, pH)
  for (const p of pParticles) {
    p.step()
    const g = pCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 10)
    g.addColorStop(0, `hsla(${p.hue}, 90%, 60%, ${p.a})`)
    g.addColorStop(0.4, `hsla(${p.hue}, 80%, 50%, ${p.a * 0.35})`)
    g.addColorStop(1, 'transparent')
    pCtx.fillStyle = g
    pCtx.beginPath()
    pCtx.arc(p.x, p.y, p.r * 10, 0, Math.PI * 2)
    pCtx.fill()
  }
  const linkDist = Math.min(140, pW / 12)
  for (let i = 0; i < pParticles.length; i++) {
    for (let j = i + 1; j < pParticles.length; j++) {
      const a = pParticles[i]
      const b = pParticles[j]
      const d = Math.hypot(a.x - b.x, a.y - b.y)
      if (d < linkDist) {
        const alpha = 0.12 * (1 - d / linkDist)
        pCtx.strokeStyle = `rgba(0, 200, 255, ${alpha})`
        pCtx.lineWidth = 0.6
        pCtx.beginPath()
        pCtx.moveTo(a.x, a.y)
        pCtx.lineTo(b.x, b.y)
        pCtx.stroke()
      }
    }
  }
  pRaf = requestAnimationFrame(particleLoop)
}

function particleResize() {
  const c = particleCanvasRef.value
  if (!c) return
  pDpr = Math.min(window.devicePixelRatio || 1, 2)
  if (c.parentElement) {
    pW = Math.max(1, c.parentElement.clientWidth)
    pH = Math.max(1, c.parentElement.clientHeight)
  } else {
    pW = window.innerWidth
    pH = window.innerHeight
  }
  c.width = pW * pDpr
  c.height = pH * pDpr
  c.style.width = `${pW}px`
  c.style.height = `${pH}px`
  if (pCtx) {
    pCtx.setTransform(pDpr, 0, 0, pDpr, 0, 0)
  }
  const count = Math.min(120, Math.floor((pW * pH) / 18000))
  if (pParticles.length !== count) {
    pParticles = Array.from({ length: count }, () => new ParticleDot())
  }
}

let particleResizeObserver = null

onMounted(() => {
  const c = particleCanvasRef.value
  if (!c) return
  pCtx = c.getContext('2d')
  particleResize()
  particleResizeObserver = new ResizeObserver(() => particleResize())
  if (c.parentElement) particleResizeObserver.observe(c.parentElement)
  pParticles = Array.from({ length: Math.min(120, Math.floor((pW * pH) / 18000)) }, () => new ParticleDot())
  particleLoop()
})

onUnmounted(() => {
  if (particleResizeObserver) {
    particleResizeObserver.disconnect()
    particleResizeObserver = null
  }
  cancelAnimationFrame(pRaf)
})
</script>

<style scoped>
.app-shell {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  max-height: 100vh;
  max-height: 100dvh;
  background: var(--bg-dark);
  overflow: hidden;
}

.shell-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.sidebar {
  position: relative;
  z-index: 1;
  width: 232px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 20px 12px 16px;
  /* 与主区同一背景，仅做弱分隔 */
  background: transparent;
  border-right: 1px solid var(--border-subtle);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px 18px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--border-subtle);
}
.brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Orbitron', sans-serif;
  font-weight: 800;
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--text-on-accent);
  background: var(--gradient-brand);
  box-shadow: var(--brand-mark-shadow);
}
.brand-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.brand-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 2px;
}
.brand-sub {
  font-size: 11px;
  color: var(--text-secondary);
  letter-spacing: 3px;
  text-transform: uppercase;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  border-radius: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  letter-spacing: 1px;
  transition:
    background 0.15s,
    color 0.15s;
  border: 1px solid transparent;
}
.nav-item.sub {
  padding-left: 28px;
  font-size: 13px;
}
.nav-item:hover {
  background: var(--nav-hover-bg);
  color: var(--text-primary);
}
.nav-item.active {
  background: var(--nav-active-bg);
  border-color: var(--nav-active-border);
  color: var(--accent-cyan);
}
.nav-icon {
  opacity: 0.85;
  font-size: 12px;
  width: 18px;
  text-align: center;
  flex-shrink: 0;
}

.nav-dropdown {
  margin-top: 6px;
}
.nav-dropdown-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  color: var(--text-secondary);
  font-family: inherit;
  font-size: 14px;
  letter-spacing: 1px;
  text-align: left;
  transition:
    background 0.15s,
    color 0.15s,
    border-color 0.15s;
}
.nav-dropdown-trigger:hover {
  background: var(--nav-hover-bg);
  color: var(--text-primary);
}
.nav-dropdown-trigger.is-open,
.nav-dropdown-trigger.is-active-group {
  color: var(--text-primary);
}
.nav-dropdown-trigger.is-active-group {
  border-color: var(--nav-active-border);
  background: var(--nav-active-bg);
}
.trigger-label {
  flex: 1;
}
.caret {
  font-size: 10px;
  opacity: 0.75;
  flex-shrink: 0;
}
.nav-dropdown-panel {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 0 2px 0;
  margin-left: 4px;
  border-left: 1px solid var(--border-subtle);
}

.shell-main {
  position: relative;
  z-index: 1;
  flex: 1 1 0%;
  min-width: 0;
  min-height: 0;
  background: transparent;
  overflow-x: auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
}

/* —— TechBackdrop（原组件内联） —— */
.tech-backdrop {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  background: var(--bg-dark);
}
.tech-backdrop.is-docked {
  position: absolute;
}
.tech-backdrop .layer {
  position: absolute;
  inset: 0;
}
.base-gradient {
  background:
    radial-gradient(ellipse 120% 80% at 50% -20%, rgba(0, 100, 220, 0.35) 0%, transparent 55%),
    radial-gradient(ellipse 90% 70% at 100% 50%, rgba(80, 0, 180, 0.12) 0%, transparent 50%),
    radial-gradient(ellipse 80% 60% at 0% 80%, rgba(0, 180, 200, 0.08) 0%, transparent 45%),
    linear-gradient(180deg, #050a18 0%, #0a1028 35%, #060814 100%);
}
.aurora {
  opacity: 0.45;
  filter: blur(60px);
  mix-blend-mode: screen;
}
.aurora-1 {
  background: linear-gradient(
    125deg,
    transparent 0%,
    rgba(0, 212, 255, 0.25) 25%,
    transparent 50%,
    rgba(100, 80, 255, 0.2) 75%,
    transparent 100%
  );
  background-size: 200% 200%;
  animation: aurora-shift 18s ease-in-out infinite;
}
.aurora-2 {
  background: radial-gradient(ellipse at 30% 40%, rgba(0, 255, 200, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 60%, rgba(0, 100, 255, 0.2) 0%, transparent 55%);
  animation: aurora-pulse 12s ease-in-out infinite alternate;
}
@keyframes aurora-shift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
@keyframes aurora-pulse {
  0% {
    opacity: 0.42;
    transform: scale(1);
  }
  100% {
    opacity: 0.5;
    transform: scale(1.03);
  }
}
.grid-floor {
  top: 35%;
  height: 65%;
  background-image: linear-gradient(90deg, rgba(0, 180, 255, 0.06) 1px, transparent 1px),
    linear-gradient(rgba(0, 180, 255, 0.05) 1px, transparent 1px);
  background-size: 48px 48px;
  transform-origin: 50% 0%;
  transform: perspective(400px) rotateX(68deg) scale(2.2);
  mask-image: linear-gradient(to bottom, transparent 0%, black 25%, black 70%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 25%, black 70%, transparent 100%);
  animation: grid-drift 20s linear infinite;
}
@keyframes grid-drift {
  0% {
    background-position: 0 0, 0 0;
  }
  100% {
    background-position: 48px 48px, 48px 48px;
  }
}
.grid-fine {
  background-image: linear-gradient(90deg, rgba(0, 140, 255, 0.04) 1px, transparent 1px),
    linear-gradient(rgba(0, 140, 255, 0.035) 1px, transparent 1px);
  background-size: 32px 32px;
  animation: grid-drift 28s linear infinite reverse;
  opacity: 0.85;
}
.hex-layer {
  opacity: 0.12;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cpath fill='none' stroke='%2300d4ff' stroke-width='0.6' d='M14 0 L27 8.5 L27 25.5 L14 34 L1 25.5 L1 8.5 Z'/%3E%3C/svg%3E");
  background-size: 28px 49px;
  animation: hex-move 40s linear infinite;
}
@keyframes hex-move {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 56px 98px;
  }
}
.data-stream {
  background: repeating-linear-gradient(
    90deg,
    transparent 0,
    transparent 80px,
    rgba(0, 212, 255, 0.03) 80px,
    rgba(0, 212, 255, 0.06) 120px,
    transparent 200px
  );
  background-size: 400% 100%;
  animation: stream 8s linear infinite;
  mix-blend-mode: screen;
  opacity: 0.38;
}
@keyframes stream {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 400% 0;
  }
}
.sweep {
  background: conic-gradient(from 0deg at 50% 45%, transparent 0deg, rgba(0, 200, 255, 0.04) 25deg, transparent 55deg);
  animation: sweep-rotate 24s linear infinite;
  opacity: 0.9;
}
@keyframes sweep-rotate {
  to {
    transform: rotate(360deg);
  }
}
.scan-band {
  height: 100%;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(0, 212, 255, 0.025) 48%,
    rgba(0, 212, 255, 0.045) 50%,
    rgba(0, 212, 255, 0.025) 52%,
    transparent 100%
  );
  background-size: 100% 120px;
}
.scan-a {
  animation: scan-move 9s linear infinite;
}
.scan-b {
  animation: scan-move 13s linear infinite reverse;
  opacity: 0.32;
  background-size: 100% 180px;
}
@keyframes scan-move {
  0% {
    background-position: 0 -120px;
  }
  100% {
    background-position: 0 100vh;
  }
}
.orb {
  width: 55vmax;
  height: 55vmax;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
  mix-blend-mode: screen;
}
.orb-tl {
  top: -20%;
  left: -15%;
  background: radial-gradient(circle, rgba(0, 212, 255, 0.35) 0%, transparent 70%);
  animation: orb-float 14s ease-in-out infinite alternate;
}
.orb-br {
  bottom: -25%;
  right: -10%;
  background: radial-gradient(circle, rgba(120, 80, 255, 0.3) 0%, transparent 70%);
  animation: orb-float 18s ease-in-out infinite alternate-reverse;
}
@keyframes orb-float {
  0% {
    transform: translate(0, 0) scale(1);
  }
  100% {
    transform: translate(2%, 2%) scale(1.04);
  }
}
.vignette {
  box-shadow: inset 0 0 180px rgba(0, 0, 0, 0.75);
  pointer-events: none;
}
.noise {
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  mix-blend-mode: overlay;
}
@media (prefers-reduced-motion: reduce) {
  .aurora-1,
  .aurora-2,
  .grid-floor,
  .grid-fine,
  .hex-layer,
  .data-stream,
  .sweep,
  .scan-a,
  .scan-b,
  .orb-tl,
  .orb-br {
    animation: none !important;
  }
  .aurora-2 {
    opacity: 0.45;
    transform: none;
  }
  .orb-tl,
  .orb-br {
    transform: none;
  }
}

.particle-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
.particle-canvas.docked {
  position: absolute;
}
</style>
