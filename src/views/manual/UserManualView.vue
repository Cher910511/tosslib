<template>
  <div class="manual-page">
    <aside class="manual-aside" aria-label="手册目录">
      <div class="manual-brand">
        <div class="manual-brand-inner">
          <a
            class="manual-brand-home"
            :href="platformHomeUrl"
            title="进入可信开源代码库首页"
          >
            <span class="manual-brand-logo-wrap" aria-hidden="true">
              <svg
                class="manual-brand-logo"
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
              >
                <path
                  fill="#DA203E"
                  d="M16 0c8.837 0 16 7.163 16 16s-7.163 16-16 16c-3.567 0-6.86-1.168-9.52-3.14L9 13.643H4.775L2.96 25.273A15.93 15.93 0 0 1 0 16c0-1.381.175-2.722.504-4h11.56l-.476 3h4.05l.477-3h6.465l-.9 9h-6.994l.635-4h-4.05l-.72 4.53A3 3 0 0 0 13.514 25h9.071a3 3 0 0 0 2.943-2.418l.042-.283 1.1-11A3 3 0 0 0 23.685 8H2.142C4.908 3.218 10.078 0 16 0"
                />
              </svg>
            </span>
            <span class="manual-brand-name">可信开源代码库</span>
          </a>
          <span class="manual-brand-divider" aria-hidden="true" />
          <span class="manual-brand-doc">使用手册</span>
        </div>
      </div>

      <nav class="manual-toc">
        <div
          v-for="l1 in manualToc"
          :key="l1.id"
          class="toc-l1"
          :class="{
            'is-active-branch': activeBranchL1 === l1.id,
            'toc-l1--leaf': l1.doc && !l1.children?.length,
          }"
        >
          <!-- Leaf l1: 直接打开文档 -->
          <button
            v-if="l1.doc && !l1.children?.length"
            type="button"
            class="toc-l1-btn"
            :class="{ 'is-active': currentDoc === l1.doc }"
            @click="goDoc(l1.doc)"
          >
            <span class="toc-l1-label">{{ l1.title }}</span>
          </button>
          <!-- 可展开 l1 -->
          <template v-else>
            <button
              type="button"
              class="toc-l1-btn"
              :class="{ 'is-open': openL1.has(l1.id) }"
              :aria-expanded="openL1.has(l1.id)"
              @click="toggleL1(l1.id)"
            >
              <span class="toc-l1-label">{{ l1.title }}</span>
              <span
                class="toc-caret"
                :class="{ 'is-open': openL1.has(l1.id) }"
                aria-hidden="true"
              />
            </button>
          </template>
          <div v-show="openL1.has(l1.id)" class="toc-l2-wrap">
            <div
              v-for="l2 in l1.children"
              :key="l2.id"
              class="toc-l2"
            >
              <button
                type="button"
                class="toc-l2-btn"
                :class="{
                  'is-open': openL2.has(l2.id),
                  'is-active': currentDoc === l2.doc,
                }"
                :aria-expanded="l2.children?.length ? openL2.has(l2.id) : undefined"
                @click="l2.doc ? goDoc(l2.doc) : toggleL2(l2.id)"
              >
                <span class="toc-l2-label">{{ l2.title }}</span>
                <span
                  v-if="l2.children?.length"
                  class="toc-caret toc-caret--sm"
                  :class="{ 'is-open': openL2.has(l2.id) }"
                  aria-hidden="true"
                />
              </button>
              <div v-show="openL2.has(l2.id)" class="toc-l3-list">
                <button
                  v-for="l3 in l2.children"
                  :key="l3.id"
                  type="button"
                  class="toc-l3-btn"
                  :class="{ 'is-active': currentDoc === l3.doc }"
                  @click="goDoc(l3.doc)"
                >
                  {{ l3.title }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </aside>

    <main class="manual-main">
      <img
        class="manual-main-bg"
        :src="manualMainBgUrl"
        alt=""
        aria-hidden="true"
        decoding="async"
      />
      <article class="manual-article">
        <div class="manual-card">
        <header v-if="currentLeaf" class="manual-article-head">
          <nav class="manual-breadcrumb" aria-label="面包屑">
            <template v-for="(crumb, idx) in breadcrumbItems" :key="idx">
              <span v-if="idx > 0" class="manual-crumb-sep" aria-hidden="true">/</span>
              <span class="manual-crumb-text">{{ crumb }}</span>
            </template>
          </nav>
          <h1 class="manual-article-title">{{ currentLeaf.title }}</h1>
        </header>
        <div
          v-if="docHtml"
          class="manual-md"
          v-html="docHtml"
        />
        <p v-else class="manual-empty">未找到文档内容。</p>
        </div>
      </article>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  manualToc,
  findLeafByDoc,
  getDefaultDoc,
  findPathToDoc,
} from '../../data/manualToc.js'
import { renderMarkdown } from '../../utils/renderMarkdown.js'

const docModules = import.meta.glob('../../docs/manual/**/*.md', {
  as: 'raw',
  eager: true,
})

function resolveDocRaw(doc) {
  const key = `../../docs/manual/${doc}.md`
  return docModules[key] ?? ''
}

const route = useRoute()
const router = useRouter()

const platformHomeUrl = computed(() => {
  const href = router.resolve({ name: 'software-home' }).href
  return new URL(href, window.location.origin).href
})

/** 右侧顶栏渐变光晕背景（public/manual/manual-main-bg.svg） */
const manualMainBgUrl = computed(
  () => `${import.meta.env.BASE_URL}manual/manual-main-bg.svg`,
)

const openL1 = ref(new Set())
const openL2 = ref(new Set())

const currentDoc = computed(() => {
  const p = route.params.docId
  const id = Array.isArray(p) ? p[0] : p
  if (id && findLeafByDoc(id)) return id
  return getDefaultDoc()
})

const currentLeaf = computed(() => findLeafByDoc(currentDoc.value))

const docHtml = computed(() => {
  let html = renderMarkdown(resolveDocRaw(currentDoc.value))
  // 转换 markdown 中的相对图片路径 → public 绝对路径
  html = html.replace(/src="\.\.\/images\//g, 'src="/manual/images/')
  return html
})

const activeBranchL1 = computed(() => {
  const path = findPathToDoc(currentDoc.value)
  return path?.[0] ?? null
})

const breadcrumbItems = computed(() => {
  const path = findPathToDoc(currentDoc.value)
  if (!path?.length) return []
  const titles = []
  const walk = (nodes, depth = 0) => {
    for (const n of nodes) {
      if (n.id === path[depth]) {
        titles.push(n.title)
        if (depth < path.length - 1 && n.children?.length) walk(n.children, depth + 1)
        return true
      }
    }
    return false
  }
  walk(manualToc)
  return titles
})

function expandForDoc(doc) {
  const path = findPathToDoc(doc)
  if (!path || path.length < 2) return
  openL1.value = new Set([...openL1.value, path[0]])
  if (path.length >= 3) {
    openL2.value = new Set([...openL2.value, path[1]])
  }
}

function toggleL1(id) {
  const next = new Set(openL1.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  openL1.value = next
}

function toggleL2(id) {
  const next = new Set(openL2.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  openL2.value = next
}

function goDoc(doc) {
  if (doc === currentDoc.value) return
  router.push({ name: 'user-manual', params: { docId: doc } })
}

watch(
  currentDoc,
  (doc) => {
    expandForDoc(doc)
  },
  { immediate: true },
)

watch(
  () => route.params.docId,
  (p) => {
    const id = Array.isArray(p) ? p[0] : p
    if (!id || !findLeafByDoc(id)) {
      router.replace({ name: 'user-manual', params: { docId: getDefaultDoc() } })
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.manual-page {
  --manual-primary: #da203e;
  --manual-primary-soft: rgba(218, 32, 62, 0.1);
  --manual-primary-ring: rgba(218, 32, 62, 0.22);
  --manual-aside-w: 300px;
  --manual-border: #e8eaed;

  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  background: #fff;
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
.manual-aside {
  width: var(--manual-aside-w);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid var(--manual-border);
}

.manual-brand {
  flex-shrink: 0;
  padding: 18px 14px 14px;
  border-bottom: 1px solid var(--manual-border);
  background: #fff;
  overflow: visible;
}

.manual-brand-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0 8px;
}

.manual-brand-home {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: inherit;
  flex-shrink: 0;
}

.manual-brand-home:hover .manual-brand-name {
  color: #1a1a1a;
}

.manual-brand-home:hover {
  opacity: 0.92;
}

.manual-brand-logo-wrap {
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.manual-brand-logo {
  display: block;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.manual-brand-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.35;
  white-space: nowrap;
  transition: color 0.15s ease;
}

.manual-brand-divider {
  width: 1px;
  height: 14px;
  flex-shrink: 0;
  background: #d1d5db;
}

.manual-brand-doc {
  font-size: 15px;
  font-weight: 400;
  color: #9ca3af;
  line-height: 1.35;
  white-space: nowrap;
}

.manual-toc {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 8px 0 24px;
  scrollbar-width: thin;
}

.manual-toc::-webkit-scrollbar {
  width: 5px;
}

.manual-toc::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 999px;
}

.toc-l1 {
  margin-bottom: 2px;
}

.toc-l1-btn,
.toc-l2-btn,
.toc-l3-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border: none;
  background: transparent;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.toc-l1-btn {
  padding: 11px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.toc-l1-btn:hover {
  background: #f9fafb;
}

.toc-l1-label {
  flex: 1;
  min-width: 0;
}

.toc-l2-wrap {
  padding: 0;
}

.toc-l2 {
  margin: 0;
}

.toc-l2-btn {
  padding: 9px 20px 9px 28px;
  font-size: 14px;
  font-weight: 400;
  color: #4b5563;
}

.toc-l2-btn:hover {
  background: #f9fafb;
  color: #111827;
}

.toc-l1-btn.is-active {
  background: rgba(218, 32, 62, 0.08);
  color: var(--manual-primary);
  font-weight: 600;
}

.toc-l2-btn.is-active {
  background: rgba(218, 32, 62, 0.08);
  color: var(--manual-primary);
  font-weight: 500;
}

.toc-l2-label {
  flex: 1;
  min-width: 0;
}

.toc-l3-list {
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
}

.toc-l3-btn {
  display: block;
  width: 100%;
  padding: 9px 20px 9px 40px;
  font-size: 14px;
  font-weight: 400;
  color: #6b7280;
  line-height: 1.4;
}

.toc-l3-btn:hover {
  background: #f9fafb;
  color: #374151;
}

.toc-l3-btn.is-active {
  background: rgba(218, 32, 62, 0.08);
  color: var(--manual-primary);
  font-weight: 500;
}

/* 右侧细线箭头（参考文档站） */
.toc-caret {
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  border-right: 1.5px solid #9ca3af;
  border-bottom: 1.5px solid #9ca3af;
  transform: rotate(-45deg);
  transition: transform 0.2s ease;
}

.toc-caret.is-open {
  transform: rotate(45deg);
}

.toc-caret--sm {
  width: 6px;
  height: 6px;
}

/* —— 正文区：顶栏背景图 + 白卡片 —— */
.manual-main {
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background-color: #f8fafc;
}

.manual-main-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: auto;
  max-height: min(327px, 42vh);
  object-fit: contain;
  object-position: top center;
  display: block;
  pointer-events: none;
  user-select: none;
  z-index: 0;
}

.manual-article {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 20px 24px 32px;
  box-sizing: border-box;
}

.manual-card {
  width: 100%;
  margin: 0 auto;
  padding: 24px 28px 32px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
  box-sizing: border-box;
}

.manual-article-head {
  margin-bottom: 8px;
  padding-bottom: 0;
  border-bottom: none;
}

.manual-breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.4;
}

.manual-crumb-sep {
  margin: 0 6px;
  color: #d1d5db;
  user-select: none;
}

.manual-crumb-text {
  color: #9ca3af;
}

.manual-crumb-text:last-child {
  color: #6b7280;
}

.manual-article-title {
  margin: 0 0 20px;
  padding-bottom: 5px;
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.01em;
  line-height: 1.35;
}

.manual-empty {
  color: #9ca3af;
  font-size: 14px;
}

/* 正文：无卡片包裹，扁平排版 */
.manual-md {
  width: 100%;
  max-width: none;
  box-sizing: border-box;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
}

/* 页头已展示标题，隐藏 md 内首个 h1 避免重复 */
.manual-article:has(.manual-article-head) .manual-md :deep(h1:first-child) {
  display: none;
}

.manual-md :deep(h1) {
  margin: 2em 0 0.75em;
  padding-bottom: 12px;
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.4;
  border-bottom: 1px solid #e8eaed;
}

.manual-md :deep(h2) {
  margin: 30px 0 0;
  padding: 0 0 12px;
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.45;
  border-bottom: 1px solid #e8eaed;
}

.manual-md :deep(h2:first-child) {
  margin-top: 0;
}

.manual-md :deep(h3) {
  margin: 24px 0 10px;
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  line-height: 1.45;
}

.manual-md :deep(p) {
  margin: 0 0 14px;
  font-size: 14px;
  line-height: 1.65;
  color: #4b5563;
}

/* 紧跟章节标题的首段作为导语略浅 */
.manual-md :deep(h2 + p) {
  margin-top: 16px;
  color: #6b7280;
}

.manual-article:has(.manual-article-head) .manual-md :deep(> p:first-child) {
  color: #6b7280;
}

.manual-md :deep(ul) {
  margin: 0 0 16px;
  padding-left: 1.25em;
  list-style-type: disc;
}

.manual-md :deep(ol) {
  margin: 0 0 16px;
  padding-left: 1.35em;
  list-style-type: decimal;
}

.manual-md :deep(ul),
.manual-md :deep(ol) {
  font-size: 14px;
  line-height: 1.65;
  color: #4b5563;
}

.manual-md :deep(li) {
  margin-bottom: 10px;
  padding-left: 4px;
}

.manual-md :deep(li:last-child) {
  margin-bottom: 0;
}

.manual-md :deep(li > strong:first-child) {
  color: #1a1a1a;
  font-weight: 600;
}

.manual-md :deep(ol > li) {
  margin-bottom: 14px;
}

.manual-md :deep(ol > li > ul) {
  margin-top: 8px;
  margin-bottom: 0;
}

.manual-md :deep(blockquote) {
  margin: 0 0 16px;
  padding: 12px 16px;
  border-left: 3px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 0 6px 6px 0;
}

.manual-md :deep(blockquote p) {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.6;
}

.manual-md :deep(code) {
  padding: 2px 6px;
  border-radius: 4px;
  background: #f3f4f6;
  font-size: 0.92em;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  color: #374151;
}

.manual-md :deep(pre) {
  margin: 0 0 16px;
  padding: 14px 16px;
  background: #f6f7f9;
  border: 1px solid #e8eaed;
  border-radius: 6px;
  overflow-x: auto;
}

.manual-md :deep(pre code) {
  padding: 0;
  background: transparent;
  color: #374151;
  font-size: 13px;
}

.manual-md :deep(table) {
  width: 100%;
  margin: 0 0 16px;
  border-collapse: collapse;
  font-size: 14px;
}

.manual-md :deep(th),
.manual-md :deep(td) {
  border: 1px solid #e8eaed;
  padding: 10px 14px;
  text-align: left;
  line-height: 1.5;
}

.manual-md :deep(th) {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.manual-md :deep(a) {
  color: var(--manual-primary);
  text-decoration: none;
}

.manual-md :deep(a:hover) {
  text-decoration: underline;
}

.manual-md :deep(strong) {
  color: #1a1a1a;
  font-weight: 600;
}

.manual-md :deep(hr) {
  margin: 28px 0;
  border: none;
  border-top: 1px solid #e8eaed;
}

@media (max-width: 900px) {
  .manual-page {
    flex-direction: column;
  }

  .manual-aside {
    width: 100%;
    max-height: 42vh;
    box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06);
  }

  .manual-article {
    padding: 12px 14px 24px;
  }

  .manual-card {
    padding: 18px 16px 24px;
  }

  .manual-article-title {
    font-size: 22px;
    padding-bottom: 16px;
    margin-bottom: 16px;
  }
}
</style>
