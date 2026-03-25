<template>
  <div class="admin-shell">
    <aside class="admin-aside">
      <div class="admin-brand">
        <svg data-v-ffa6468c="" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><path fill="#DA203E" d="M16 0c8.837 0 16 7.163 16 16s-7.163 16-16 16c-3.567 0-6.86-1.168-9.52-3.14L9 13.643H4.775L2.96 25.273A15.93 15.93 0 0 1 0 16c0-1.381.175-2.722.504-4h11.56l-.476 3h4.05l.477-3h6.465l-.9 9h-6.994l.635-4h-4.05l-.72 4.53A3 3 0 0 0 13.514 25h9.071a3 3 0 0 0 2.943-2.418l.042-.283 1.1-11A3 3 0 0 0 23.685 8H2.142C4.908 3.218 10.078 0 16 0"></path></svg>
        <span class="admin-brand-text">可信开源代码库</span>
      </div>
      <nav class="admin-nav">
        <RouterLink class="admin-nav-item" to="/software/home" active-class="is-active">
          <span class="nav-ico" aria-hidden="true">▦</span>
          首页
        </RouterLink>
        <RouterLink class="admin-nav-item" to="/software/library" active-class="is-active">
          <span class="nav-ico" aria-hidden="true">⟨⟩</span>
          软件库
        </RouterLink>
        <RouterLink class="admin-nav-item" to="/software/components" active-class="is-active">
          <span class="nav-ico" aria-hidden="true">◇</span>
          组件库
        </RouterLink>
        <a class="admin-nav-item is-disabled" href="#" @click.prevent>
          <span class="nav-ico" aria-hidden="true">▣</span>
          软件管理
        </a>
        <a class="admin-nav-item is-disabled" href="#" @click.prevent>
          <span class="nav-ico" aria-hidden="true">⌘</span>
          组织管理
        </a>
        <a class="admin-nav-item is-disabled" href="#" @click.prevent>
          <span class="nav-ico" aria-hidden="true">▤</span>
          需求反馈
        </a>
        <a
          class="admin-nav-item admin-nav-external"
          :href="dataScreenHomeUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="nav-ico" aria-hidden="true">▶</span>
          数据大屏
        </a>
      </nav>
    </aside>

    <div class="admin-main">
      <header class="admin-header">
        <nav class="admin-breadcrumb" aria-label="面包屑">
          <template v-if="route.name === 'software-home'">
            <span class="current">首页</span>
          </template>
          <template v-else-if="route.name === 'software-library'">
            <RouterLink to="/software/home">首页</RouterLink>
            <span class="sep">/</span>
            <span class="current">软件库</span>
          </template>
          <template v-else-if="route.name === 'component-library'">
            <RouterLink to="/software/home">首页</RouterLink>
            <span class="sep">/</span>
            <span class="current">组件库</span>
          </template>
          <template v-else-if="route.name === 'software-detail'">
            <RouterLink to="/software/home">首页</RouterLink>
            <span class="sep">/</span>
            <RouterLink to="/software/library">软件库</RouterLink>
            <span class="sep">/</span>
            <span class="current">软件详情</span>
          </template>
          <template v-else>
            <RouterLink to="/software/home">首页</RouterLink>
          </template>
        </nav>
        <div class="admin-header-center">
          <div ref="searchWrapRef" class="admin-search-wrap">
            <div class="admin-search">
              <select
                v-model="searchKind"
                class="admin-search-type"
                aria-label="搜索类型"
                @mousedown.stop
                @change="onSearchKindChange"
              >
                <option value="software">软件</option>
                <option value="component">组件</option>
              </select>
              <input
                v-model="searchQuery"
                type="search"
                class="admin-search-input"
                placeholder="搜索软件或组件…"
                autocomplete="off"
                aria-autocomplete="list"
                :aria-expanded="searchPanelOpen"
                @focus="openSearchPanel"
                @input="openSearchPanel"
                @keydown.escape.prevent="closeSearchPanel"
                @keydown.enter.prevent="submitSearch"
              />
              <button
                type="button"
                class="admin-search-btn"
                aria-label="搜索"
                @mousedown.prevent
                @click="submitSearch"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </button>
            </div>
            <div
              v-show="searchPanelOpen"
              class="admin-search-panel"
              role="listbox"
              aria-label="搜索建议与历史"
              @mousedown.prevent
            >
              <template v-if="!searchQueryTrimmed">
                <div v-if="historySoftware.length" class="search-section">
                  <div class="search-section-title">软件 · 搜索历史</div>
                  <button
                    v-for="(h, i) in historySoftware"
                    :key="'hs-' + i + h.text"
                    type="button"
                    class="search-row"
                    @click="goSoftware(h.text)"
                  >
                    <span class="search-row-badge search-row-badge--soft">软件</span>
                    <span class="search-row-text">{{ h.text }}</span>
                  </button>
                </div>
                <div v-if="historyComponent.length" class="search-section">
                  <div class="search-section-title">组件 · 搜索历史</div>
                  <button
                    v-for="(h, i) in historyComponent"
                    :key="'hc-' + i + h.text"
                    type="button"
                    class="search-row"
                    @click="goComponent(h.text)"
                  >
                    <span class="search-row-badge search-row-badge--comp">组件</span>
                    <span class="search-row-text">{{ h.text }}</span>
                  </button>
                </div>
                <p v-if="!historySoftware.length && !historyComponent.length" class="search-empty">
                  暂无搜索历史，输入关键词可匹配软件或组件。
                </p>
              </template>
              <template v-else>
                <div v-if="softMatches.length" class="search-section">
                  <div class="search-section-title">软件 · 匹配</div>
                  <button
                    v-for="name in softMatches"
                    :key="'ms-' + name"
                    type="button"
                    class="search-row"
                    @click="goSoftware(name)"
                  >
                    <span class="search-row-badge search-row-badge--soft">软件</span>
                    <span class="search-row-text">{{ name }}</span>
                  </button>
                </div>
                <div v-if="compMatches.length" class="search-section">
                  <div class="search-section-title">组件 · 匹配</div>
                  <button
                    v-for="name in compMatches"
                    :key="'mc-' + name"
                    type="button"
                    class="search-row"
                    @click="goComponent(name)"
                  >
                    <span class="search-row-badge search-row-badge--comp">组件</span>
                    <span class="search-row-text">{{ name }}</span>
                  </button>
                </div>
                <p v-if="!softMatches.length && !compMatches.length" class="search-empty">
                  无匹配项，按回车将用当前关键词搜索「{{ searchKind === 'software' ? '软件' : '组件' }}」库。
                </p>
              </template>
              <p class="search-hint">
                未选下列表时按搜索或回车：进入左侧所选类型（{{ searchKind === 'software' ? '软件' : '组件' }}）库
                <template v-if="searchQueryTrimmed">，并带上关键词</template>
                <template v-else> 的全部列表</template>。
              </p>
            </div>
          </div>
        </div>
        <div class="admin-user">
          <div class="admin-avatar" aria-hidden="true">会</div>
          <div class="admin-user-meta">
            <span class="admin-user-name">会饮篇</span>
            <span class="admin-user-mail">xlue019@gmail.com</span>
          </div>
        </div>
      </header>

      <main class="admin-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import {
  addSearchHistory,
  historyByType,
  matchCatalog,
  SOFTWARE_CATALOG,
  COMPONENT_CATALOG,
} from '../composables/useAdminSearch'

const route = useRoute()
const router = useRouter()

const searchWrapRef = ref(null)
const searchKind = ref('software')
const searchQuery = ref('')
const searchPanelOpen = ref(false)

const searchQueryTrimmed = computed(() => searchQuery.value.trim())

const historySoftware = ref([])
const historyComponent = ref([])

function refreshHistory() {
  historySoftware.value = historyByType('software')
  historyComponent.value = historyByType('component')
}

const softMatches = computed(() => matchCatalog(searchQuery.value, SOFTWARE_CATALOG))
const compMatches = computed(() => matchCatalog(searchQuery.value, COMPONENT_CATALOG))

function openSearchPanel() {
  refreshHistory()
  searchPanelOpen.value = true
}

function closeSearchPanel() {
  searchPanelOpen.value = false
}

function onSearchKindChange() {
  refreshHistory()
  if (searchQueryTrimmed.value) searchPanelOpen.value = true
}

function onDocClick(e) {
  const el = searchWrapRef.value
  if (el && !el.contains(e.target)) closeSearchPanel()
}

onMounted(() => {
  refreshHistory()
  document.addEventListener('click', onDocClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
})

function goSoftware(text) {
  const q =
    text !== undefined && text !== null ? String(text).trim() : searchQuery.value.trim()
  if (q) addSearchHistory('software', q)
  router.push({ name: 'software-library', query: q ? { q } : {} })
  searchPanelOpen.value = false
}

function goComponent(text) {
  const q =
    text !== undefined && text !== null ? String(text).trim() : searchQuery.value.trim()
  if (q) addSearchHistory('component', q)
  router.push({ name: 'component-library', query: q ? { q } : {} })
  searchPanelOpen.value = false
}

/** 未选下拉项时：由左侧类型决定进软件库或组件库；有关键词则写入 ?q= */
function submitSearch() {
  if (searchKind.value === 'software') goSoftware()
  else goComponent()
}

watch(
  () => [route.name, route.query.q],
  () => {
    if (route.name !== 'software-library' && route.name !== 'component-library') return
    const q = route.query.q
    const s = Array.isArray(q) ? q[0] : q
    searchQuery.value = typeof s === 'string' ? s : ''
    if (route.name === 'software-library') searchKind.value = 'software'
    if (route.name === 'component-library') searchKind.value = 'component'
  },
  { immediate: true },
)

/** 深色态势总览（/dash），新标签打开；含 GitHub Pages base */
const dataScreenHomeUrl = computed(() => {
  const href = router.resolve({ name: 'home' }).href
  return new URL(href, window.location.origin).href
})
</script>

<style scoped>
.admin-shell {
  --admin-primary: #da203e;
  --admin-primary-soft: rgba(218, 32, 62, 0.08);
  --admin-bg: #f4f5f7;
  --admin-card: #ffffff;
  --admin-text: #1a1a1a;
  --admin-muted: #6b7280;
  --admin-border: #e5e7eb;

  display: flex;
  width: 100%;
  flex: 1 1 auto;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--admin-bg);
  color: var(--admin-text);
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    'PingFang SC',
    'Microsoft YaHei',
    sans-serif;
}

.admin-aside {
  width: 220px;
  flex-shrink: 0;
  background: var(--admin-card);
  border-right: 1px solid var(--admin-border);
  display: flex;
  flex-direction: column;
  padding: 20px 0 24px;
}

.admin-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px 24px;
  border-bottom: 1px solid var(--admin-border);
  margin-bottom: 8px;
}

.admin-logo {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #da203e, #b81830);
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(218, 32, 62, 0.35);
}

.admin-brand-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--admin-text);
  line-height: 1.3;
}

.admin-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 12px;
}

.admin-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  text-decoration: none;
  transition:
    background 0.15s,
    color 0.15s;
}
.admin-nav-item:hover:not(.is-disabled) {
  background: #f3f4f6;
}
.admin-nav-item.is-active {
  background: var(--admin-primary-soft);
  color: var(--admin-primary);
  font-weight: 600;
}
.admin-nav-item.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.admin-nav-external {
  color: #374151;
}
.admin-nav-external:hover {
  background: #fef2f2;
  color: var(--admin-primary);
}

.nav-ico {
  width: 20px;
  text-align: center;
  font-size: 13px;
  opacity: 0.85;
}

.admin-main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-header {
  height: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 24px;
  background: var(--admin-card);
  border-bottom: 1px solid var(--admin-border);
}

.admin-breadcrumb {
  flex: 0 0 auto;
  font-size: 13px;
  color: var(--admin-muted);
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.admin-breadcrumb a {
  color: var(--admin-muted);
  text-decoration: none;
}
.admin-breadcrumb a:hover {
  color: var(--admin-primary);
}
.admin-breadcrumb .sep {
  color: #d1d5db;
  user-select: none;
}
.admin-breadcrumb .current {
  color: var(--admin-text);
  font-weight: 500;
}

.admin-header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  min-width: 0;
}

.admin-search-wrap {
  position: relative;
  max-width: 480px;
  width: 100%;
}

.admin-search {
  display: flex;
  align-items: stretch;
  min-height: 36px;
  width: 100%;
  border: 1px solid var(--admin-border);
  border-radius: 999px;
  overflow: hidden;
  background: #fafafa;
}

.admin-search-panel {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 8px);
  z-index: 200;
  padding: 8px 0 6px;
  background: #fff;
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
  max-height: min(380px, 72vh);
  overflow-y: auto;
}

.search-section {
  padding: 0 8px 8px;
}

.search-section-title {
  padding: 6px 10px 4px;
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  letter-spacing: 0.02em;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin: 2px 0;
  padding: 8px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font: inherit;
  font-size: 14px;
  color: #374151;
}

.search-row:hover {
  background: #f3f4f6;
}

.search-row-badge {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
}

.search-row-badge--soft {
  background: var(--admin-primary-soft);
  color: var(--admin-primary);
}

.search-row-badge--comp {
  background: #eef2ff;
  color: #4338ca;
}

.search-row-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-empty {
  margin: 0;
  padding: 12px 14px;
  font-size: 13px;
  color: #9ca3af;
}

.search-hint {
  margin: 0;
  padding: 10px 14px 6px;
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.45;
  border-top: 1px solid #f3f4f6;
}
.admin-search-type {
  border: none;
  background: #fff;
  padding: 0 12px;
  font-size: 13px;
  cursor: pointer;
}
.admin-search-input {
  flex: 1;
  border: none;
  padding: 0 14px;
  font-size: 14px;
  min-width: 0;
  background: transparent;
}
.admin-search-input:focus {
  outline: none;
}
.admin-search-btn {
  border: none;
  background: transparent;
  padding: 0 14px;
  cursor: pointer;
  color: var(--admin-muted);
  font-size: 16px;
}

.admin-user {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
}
.admin-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e8b4bc, #da203e);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
}
.admin-user-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1.2;
}
.admin-user-name {
  font-size: 14px;
  font-weight: 600;
}
.admin-user-mail {
  font-size: 12px;
  color: var(--admin-muted);
}

.admin-content {
  flex: 1;
  min-height: 0;
  padding: 24px;
  overflow: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
}
</style>
