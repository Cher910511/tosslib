<template>
  <canvas ref="canvasRef" class="particle-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let ctx = null
let w = 0
let h = 0
let dpr = 1
let particles = []
let raf = null

class P {
  constructor() {
    this.reset()
  }
  reset() {
    this.x = Math.random() * w
    this.y = Math.random() * h
    this.vx = (Math.random() - 0.5) * 0.55
    this.vy = (Math.random() - 0.5) * 0.55
    this.r = Math.random() * 1.8 + 0.25
    this.a = Math.random() * 0.45 + 0.12
    this.hue = 185 + Math.random() * 40
  }
  step() {
    this.x += this.vx
    this.y += this.vy
    if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset()
  }
}

function loop() {
  if (!ctx) return
  ctx.clearRect(0, 0, w, h)
  for (const p of particles) {
    p.step()
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 10)
    g.addColorStop(0, `hsla(${p.hue}, 90%, 60%, ${p.a})`)
    g.addColorStop(0.4, `hsla(${p.hue}, 80%, 50%, ${p.a * 0.35})`)
    g.addColorStop(1, 'transparent')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r * 10, 0, Math.PI * 2)
    ctx.fill()
  }
  const linkDist = Math.min(140, w / 12)
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i]
      const b = particles[j]
      const d = Math.hypot(a.x - b.x, a.y - b.y)
      if (d < linkDist) {
        const alpha = 0.12 * (1 - d / linkDist)
        ctx.strokeStyle = `rgba(0, 200, 255, ${alpha})`
        ctx.lineWidth = 0.6
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }
    }
  }
  raf = requestAnimationFrame(loop)
}

function resize() {
  const c = canvasRef.value
  if (!c) return
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  w = window.innerWidth
  h = window.innerHeight
  c.width = w * dpr
  c.height = h * dpr
  c.style.width = `${w}px`
  c.style.height = `${h}px`
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  const count = Math.min(120, Math.floor((w * h) / 18000))
  if (particles.length !== count) {
    particles = Array.from({ length: count }, () => new P())
  }
}

onMounted(() => {
  const c = canvasRef.value
  if (!c) return
  ctx = c.getContext('2d')
  resize()
  window.addEventListener('resize', resize)
  particles = Array.from({ length: Math.min(120, Math.floor((w * h) / 18000)) }, () => new P())
  loop()
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  cancelAnimationFrame(raf)
})
</script>

<style scoped>
.particle-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>
