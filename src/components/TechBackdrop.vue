<template>
  <div class="tech-backdrop" aria-hidden="true">
    <!-- 深空基底 + 流动极光 -->
    <div class="layer base-gradient"></div>
    <div class="layer aurora aurora-1"></div>
    <div class="layer aurora aurora-2"></div>
    <!-- 透视动态网格 -->
    <div class="layer grid-floor"></div>
    <div class="layer grid-fine"></div>
    <!-- 六边形科技纹理 -->
    <div class="layer hex-layer"></div>
    <!-- 横向数据流光 -->
    <div class="layer data-stream"></div>
    <!-- 环形扫描 -->
    <div class="layer sweep"></div>
    <!-- 多道细扫描线 -->
    <div class="layer scan-band scan-a"></div>
    <div class="layer scan-band scan-b"></div>
    <!-- 角落强光晕 -->
    <div class="layer orb orb-tl"></div>
    <div class="layer orb orb-br"></div>
    <!-- 暗角与噪点 -->
    <div class="layer vignette"></div>
    <div class="layer noise"></div>
  </div>
</template>

<style scoped>
.tech-backdrop {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  background: #030510;
}

.layer {
  position: absolute;
  inset: 0;
}

/* 基底：深蓝紫径向 */
.base-gradient {
  background:
    radial-gradient(ellipse 120% 80% at 50% -20%, rgba(0, 100, 220, 0.35) 0%, transparent 55%),
    radial-gradient(ellipse 90% 70% at 100% 50%, rgba(80, 0, 180, 0.12) 0%, transparent 50%),
    radial-gradient(ellipse 80% 60% at 0% 80%, rgba(0, 180, 200, 0.08) 0%, transparent 45%),
    linear-gradient(180deg, #050a18 0%, #0a1028 35%, #060814 100%);
}

/* 极光流动 */
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
  background: radial-gradient(
    ellipse at 30% 40%,
    rgba(0, 255, 200, 0.15) 0%,
    transparent 50%
  ),
  radial-gradient(ellipse at 70% 60%, rgba(0, 100, 255, 0.2) 0%, transparent 55%);
  animation: aurora-pulse 12s ease-in-out infinite alternate;
}
@keyframes aurora-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
@keyframes aurora-pulse {
  0% { opacity: 0.35; transform: scale(1); }
  100% { opacity: 0.55; transform: scale(1.08); }
}

/* 底部透视网格（科技感地面） */
.grid-floor {
  top: 35%;
  height: 65%;
  background-image:
    linear-gradient(90deg, rgba(0, 180, 255, 0.06) 1px, transparent 1px),
    linear-gradient(rgba(0, 180, 255, 0.05) 1px, transparent 1px);
  background-size: 48px 48px;
  transform-origin: 50% 0%;
  transform: perspective(400px) rotateX(68deg) scale(2.2);
  mask-image: linear-gradient(to bottom, transparent 0%, black 25%, black 70%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 25%, black 70%, transparent 100%);
  animation: grid-drift 20s linear infinite;
}
@keyframes grid-drift {
  0% { background-position: 0 0, 0 0; }
  100% { background-position: 48px 48px, 48px 48px; }
}

/* 细网格整屏微动 */
.grid-fine {
  background-image:
    linear-gradient(90deg, rgba(0, 140, 255, 0.04) 1px, transparent 1px),
    linear-gradient(rgba(0, 140, 255, 0.035) 1px, transparent 1px);
  background-size: 32px 32px;
  animation: grid-drift 28s linear infinite reverse;
  opacity: 0.85;
}

/* 六边形（SVG 平铺） */
.hex-layer {
  opacity: 0.12;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cpath fill='none' stroke='%2300d4ff' stroke-width='0.6' d='M14 0 L27 8.5 L27 25.5 L14 34 L1 25.5 L1 8.5 Z'/%3E%3C/svg%3E");
  background-size: 28px 49px;
  animation: hex-move 40s linear infinite;
}
@keyframes hex-move {
  0% { background-position: 0 0; }
  100% { background-position: 56px 98px; }
}

/* 横向流光条 */
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
  opacity: 0.6;
}
@keyframes stream {
  0% { background-position: 0 0; }
  100% { background-position: 400% 0; }
}

/* 中心弱扫描扇形 */
.sweep {
  background: conic-gradient(
    from 0deg at 50% 45%,
    transparent 0deg,
    rgba(0, 200, 255, 0.04) 25deg,
    transparent 55deg
  );
  animation: sweep-rotate 24s linear infinite;
  opacity: 0.9;
}
@keyframes sweep-rotate {
  to { transform: rotate(360deg); }
}

.scan-band {
  height: 100%;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(0, 212, 255, 0.04) 48%,
    rgba(0, 212, 255, 0.09) 50%,
    rgba(0, 212, 255, 0.04) 52%,
    transparent 100%
  );
  background-size: 100% 120px;
}
.scan-a {
  animation: scan-move 5s linear infinite;
}
.scan-b {
  animation: scan-move 7.5s linear infinite reverse;
  opacity: 0.5;
  background-size: 100% 180px;
}
@keyframes scan-move {
  0% { background-position: 0 -120px; }
  100% { background-position: 0 100vh; }
}

/* 光晕球 */
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
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(3%, 4%) scale(1.1); }
}

.vignette {
  box-shadow: inset 0 0 180px rgba(0, 0, 0, 0.75);
  pointer-events: none;
}

/* 细微噪点增加质感 */
.noise {
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  mix-blend-mode: overlay;
}
</style>
