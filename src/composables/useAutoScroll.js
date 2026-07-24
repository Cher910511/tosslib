import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 自动滚动动画 composable，支持 hover 暂停
 * @param {object} [opts]
 * @param {number} [opts.speed=0.55]  每帧偏移像素量
 * @returns {{
 *   offset: import('vue').Ref<number>,
 *   pause: import('vue').Ref<boolean>,
 *   reset: () => void,
 * }}
 */
export function useAutoScroll({ speed = 0.55 } = {}) {
  const offset = ref(0)
  const pause = ref(false)
  let raf = null
  let active = false

  function tick() {
    if (!active) return
    if (!pause.value) {
      offset.value += speed
    }
    raf = requestAnimationFrame(tick)
  }

  function reset() {
    offset.value = 0
  }

  onMounted(() => {
    active = true
    raf = requestAnimationFrame(tick)
  })

  onUnmounted(() => {
    active = false
    if (raf) cancelAnimationFrame(raf)
  })

  return { offset, pause, reset }
}