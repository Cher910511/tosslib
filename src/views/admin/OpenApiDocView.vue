<template>
  <div class="openapi-doc-page">
    <!-- 侧边栏 -->
    <aside class="doc-aside">
      <div class="doc-aside-top">
        <RouterLink class="doc-back-link" to="/software/openapi-tools" title="返回 OpenAPI">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </RouterLink>
        <span class="doc-aside-title">OpenAPI 文档</span>
      </div>
      <nav class="doc-nav">
        <button
          v-for="item in docToc"
          :key="item.doc"
          type="button"
          class="doc-nav-item"
          :class="{ 'is-active': currentDoc === item.doc }"
          @click="goDoc(item.doc)"
        >
          <span class="doc-nav-label">{{ item.title }}</span>
        </button>
      </nav>
    </aside>

    <!-- 正文区 -->
    <main class="doc-main">
      <article class="doc-article">
        <header class="doc-article-head">
          <nav class="doc-breadcrumb" aria-label="面包屑">
            <RouterLink to="/software/openapi-tools">OpenAPI</RouterLink>
            <span class="doc-crumb-sep" aria-hidden="true">/</span>
            <span class="doc-crumb-current">{{ currentTitle }}</span>
          </nav>
          <h1 class="doc-article-title">{{ currentTitle }}</h1>
        </header>
        <div
          v-if="docHtml"
          class="doc-md"
          v-html="docHtml"
        />
        <p v-else class="doc-empty">未找到文档内容。</p>
      </article>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { renderMarkdown } from '../../utils/renderMarkdown.js'

const docModules = import.meta.glob('../../docs/manual/openapi-*.md', {
  as: 'raw',
  eager: true,
})

function resolveDocRaw(doc) {
  const key = `../../docs/manual/${doc}.md`
  return docModules[key] ?? ''
}

const route = useRoute()
const router = useRouter()

const docToc = [
  { doc: 'openapi-overview', title: '概览', icon: '◈' },
  { doc: 'openapi-sca', title: 'SCA 扫描', icon: '◈' },
  { doc: 'openapi-vuln', title: '漏洞预警', icon: '◈' },
  { doc: 'openapi-sbom', title: 'SBOM 生成', icon: '◈' },
  { doc: 'openapi-ai', title: 'AI 智能选型助手', icon: '◈' },
  { doc: 'openapi-license', title: '开源合规查询', icon: '◈' },
  { doc: 'openapi-malware', title: '恶意代码检测', icon: '◈' },
  { doc: 'openapi-software-search', title: '软件搜索', icon: '◈' },
  { doc: 'openapi-software-detail', title: '软件详情', icon: '◈' },
  { doc: 'openapi-search', title: '组件搜索', icon: '◈' },
  { doc: 'openapi-detail', title: '组件详情', icon: '◈' },
  { doc: 'openapi-report', title: '报告生成', icon: '◈' },
]

const defaultDoc = 'openapi-overview'

const currentDoc = computed(() => {
  const p = route.params.docId
  const id = Array.isArray(p) ? p[0] : p
  if (id && docToc.some(item => item.doc === id)) return id
  return defaultDoc
})

const currentTitle = computed(() => {
  const found = docToc.find(item => item.doc === currentDoc.value)
  return found ? found.title : ''
})

const docHtml = computed(() => {
  let html = renderMarkdown(resolveDocRaw(currentDoc.value))
  html = html.replace(/src="\.\.\/images\//g, 'src="/manual/images/')
  return html
})

function goDoc(doc) {
  if (doc === currentDoc.value) return
  router.push({ name: 'openapi-doc', params: { docId: doc } })
}

watch(
  () => route.params.docId,
  (p) => {
    const id = Array.isArray(p) ? p[0] : p
    if (!id || !docToc.some(item => item.doc === id)) {
      router.replace({ name: 'openapi-doc', params: { docId: defaultDoc } })
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.openapi-doc-page {
  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  margin: -24px;
  background: #f8fafc;
  color: #1a1a1a;
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    'PingFang SC',
    'Microsoft YaHei',
    sans-serif;
}

/* —— 侧栏 —— */
.doc-aside {
  position: fixed;
  top: 60px;
  left: 220px;
  width: 240px;
  height: calc(100vh - 60px);
  height: calc(100dvh - 60px);
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.03);
  z-index: 10;
  overflow-y: auto;
}
.doc-aside::-webkit-scrollbar {
  width: 4px;
}
.doc-aside::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 999px;
}
.doc-aside-top {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px 13px;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(180deg, #fafbfc 0%, #fff 100%);
}
.doc-back-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #fff;
  border: 1px solid #e5e7eb;
  text-decoration: none;
  flex-shrink: 0;
  transition: all 0.15s;
}
.doc-back-link svg {
  stroke: #9ca3af;
}
.doc-back-link:hover {
  background: #da203e;
  border-color: #da203e;
}
.doc-back-link:hover svg {
  stroke: #fff;
}
.doc-aside-title {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: 0.3px;
}
.doc-nav {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 6px 8px 12px;
}
.doc-nav::-webkit-scrollbar {
  width: 4px;
}
.doc-nav::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 999px;
}
.doc-nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 2px;
  border: none;
  border-radius: 6px;
  background: transparent;
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
  text-align: left;
  cursor: pointer;
  transition: all 0.12s ease;
}
.doc-nav-item:hover {
  background: #f3f4f6;
  color: #1f2937;
}
.doc-nav-item.is-active {
  background: #fef2f3;
  color: #da203e;
  font-weight: 600;
  box-shadow: inset 0 0 0 1px rgba(218, 32, 62, 0.1);
}
.doc-nav-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

/* —— 正文 —— */
.doc-main {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  padding: 32px 40px 48px;
  margin-left: 240px;
}
.doc-article {
  max-width: 900px;
  margin: 0 auto;
}
.doc-article-head {
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8eaed;
}
.doc-breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 12px;
}
.doc-breadcrumb a {
  color: #6b7280;
  text-decoration: none;
}
.doc-breadcrumb a:hover {
  color: #da203e;
}
.doc-crumb-sep {
  color: #d1d5db;
  user-select: none;
}
.doc-crumb-current {
  color: #374151;
  font-weight: 500;
}
.doc-article-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.01em;
  line-height: 1.35;
}
.doc-empty {
  color: #9ca3af;
  font-size: 14px;
}

/* —— Markdown 渲染样式 —— */
.doc-md {
  line-height: 1.7;
}
.doc-md :deep(h1) {
  margin: 2em 0 0.75em;
  padding-bottom: 12px;
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  border-bottom: 1px solid #e8eaed;
}
.doc-md :deep(h2) {
  margin: 30px 0 0;
  padding: 0 0 12px;
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  border-bottom: 1px solid #e8eaed;
}
.doc-md :deep(h2:first-child) {
  margin-top: 0;
}
.doc-md :deep(h3) {
  margin: 24px 0 10px;
  font-size: 15px;
  font-weight: 600;
  color: #374151;
}
.doc-md :deep(p) {
  margin: 0 0 14px;
  font-size: 14px;
  line-height: 1.65;
  color: #4b5563;
}
.doc-md :deep(h2 + p) {
  margin-top: 16px;
  color: #6b7280;
}
.doc-md :deep(ul) {
  margin: 0 0 16px;
  padding-left: 1.25em;
  list-style-type: disc;
}
.doc-md :deep(ol) {
  margin: 0 0 16px;
  padding-left: 1.35em;
  list-style-type: decimal;
}
.doc-md :deep(ul),
.doc-md :deep(ol) {
  font-size: 14px;
  line-height: 1.65;
  color: #4b5563;
}
.doc-md :deep(li) {
  margin-bottom: 10px;
  padding-left: 4px;
}
.doc-md :deep(li:last-child) {
  margin-bottom: 0;
}
.doc-md :deep(blockquote) {
  margin: 0 0 16px;
  padding: 12px 16px;
  border-left: 3px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 0 6px 6px 0;
}
.doc-md :deep(blockquote p) {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
}
.doc-md :deep(code) {
  padding: 2px 6px;
  border-radius: 4px;
  background: #f3f4f6;
  font-size: 0.92em;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  color: #374151;
}
.doc-md :deep(pre) {
  margin: 0 0 16px;
  padding: 14px 16px;
  background: #f6f7f9;
  border: 1px solid #e8eaed;
  border-radius: 6px;
  overflow-x: auto;
}
.doc-md :deep(pre code) {
  padding: 0;
  background: transparent;
  color: #374151;
  font-size: 13px;
}
.doc-md :deep(.code-block-wrap) {
  position: relative;
  margin: 0 0 16px;
}
.doc-md :deep(.code-block-wrap pre) {
  margin: 0;
}
.doc-md :deep(.code-copy-btn) {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 12px;
  font-size: 12px;
  line-height: 1.5;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #6b7280;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
  opacity: 0;
  z-index: 2;
}
.doc-md :deep(.code-block-wrap:hover .code-copy-btn) {
  opacity: 1;
}
.doc-md :deep(.code-copy-btn:hover) {
  background: #f3f4f6;
  color: #374151;
  border-color: #9ca3af;
}
.doc-md :deep(table) {
  width: 100%;
  margin: 0 0 16px;
  border-collapse: collapse;
  font-size: 14px;
}
.doc-md :deep(th),
.doc-md :deep(td) {
  border: 1px solid #e8eaed;
  padding: 10px 14px;
  text-align: left;
  line-height: 1.5;
}
.doc-md :deep(th) {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}
.doc-md :deep(a) {
  color: #da203e;
  text-decoration: none;
}
.doc-md :deep(a:hover) {
  text-decoration: underline;
}
.doc-md :deep(strong) {
  color: #1a1a1a;
  font-weight: 600;
}
.doc-md :deep(hr) {
  margin: 28px 0;
  border: none;
  border-top: 1px solid #e8eaed;
}

@media (max-width: 900px) {
  .openapi-doc-page {
    flex-direction: column;
    margin: 0;
  }
  .doc-aside {
    width: 100%;
    max-height: 40vh;
  }
  .doc-main {
    padding: 20px;
  }
  .doc-article-title {
    font-size: 22px;
  }
}
</style>