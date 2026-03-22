/**
 * GitHub Pages 无服务端回退：将 index.html 复制为 404.html，
 * 这样直接打开或刷新子路径时仍由 Vue Router 接管。
 */
import { copyFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const dist = resolve(process.cwd(), 'dist')
const index = resolve(dist, 'index.html')
const fallback = resolve(dist, '404.html')

if (!existsSync(index)) {
  console.error('copy-spa-fallback: dist/index.html 不存在，请先执行 vite build')
  process.exit(1)
}
copyFileSync(index, fallback)
console.log('copy-spa-fallback: 已生成 dist/404.html')
