import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 每秒更新一次的实时时钟 composable
 * @param {string} [locale='zh-CN']
 * @returns {{ now: import('vue').Ref<string> }}
 */
export function useClock(locale = 'zh-CN') {
  const now = ref('')
  let timer = null

  function tick() {
    now.value = new Date().toLocaleString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  }

  onMounted(() => {
    tick()
    timer = setInterval(tick, 1000)
  })

  onUnmounted(() => {
    clearInterval(timer)
    timer = null
  })

  return { now }
}