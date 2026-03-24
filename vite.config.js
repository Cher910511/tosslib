import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * GitHub Pages「项目站」地址为 https://<用户>.github.io/<仓库名>/
 * 构建时需设置 base 为该子路径，否则 JS/CSS 会从域名根加载导致白屏/黑屏。
 *
 * CI 示例：env VITE_BASE: /${{ github.event.repository.name }}/
 * 用户主页仓库（username.github.io）部署在根路径时：VITE_BASE=/
 */
const base = process.env.VITE_BASE ?? '/'

export default defineConfig({
  plugins: [vue()],
  base,
  server: {
    /** 本地开发启动后默认打开软件详情页 */
    open: '/software/detail',
  },
})
