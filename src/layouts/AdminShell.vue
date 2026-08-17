<template>
  <div class="admin-shell">
    <aside class="admin-aside">
      <div class="admin-brand">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><path fill="#DA203E" d="M16 0c8.837 0 16 7.163 16 16s-7.163 16-16 16c-3.567 0-6.86-1.168-9.52-3.14L9 13.643H4.775L2.96 25.273A15.93 15.93 0 0 1 0 16c0-1.381.175-2.722.504-4h11.56l-.476 3h4.05l.477-3h6.465l-.9 9h-6.994l.635-4h-4.05l-.72 4.53A3 3 0 0 0 13.514 25h9.071a3 3 0 0 0 2.943-2.418l.042-.283 1.1-11A3 3 0 0 0 23.685 8H2.142C4.908 3.218 10.078 0 16 0"></path></svg>
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
        <RouterLink
          class="admin-nav-item"
          to="/software/components"
          :class="{ 'is-active': route.name === 'component-library' || route.name === 'component-detail' }"
        >
          <span class="nav-ico" aria-hidden="true">◇</span>
          组件库
        </RouterLink>
        <RouterLink class="admin-nav-item" to="/software/assistant" active-class="is-active">
          <span class="nav-ico" aria-hidden="true">✦</span>
          AI 助手
        </RouterLink>
        <RouterLink class="admin-nav-item" to="/software/signature-verify" active-class="is-active">
          <span class="nav-ico" aria-hidden="true">◈</span>
          签名验证
        </RouterLink>
        <RouterLink class="admin-nav-item" to="/software/toolset" active-class="is-active">
          <span class="nav-ico" aria-hidden="true">▤</span>
          工具集
        </RouterLink>
        <RouterLink class="admin-nav-item" to="/software/detection-report" active-class="is-active">
          <span class="nav-ico" aria-hidden="true">▧</span>
          检测报告
        </RouterLink>
        <!-- 软件管理（带二级菜单） -->
        <div class="admin-nav-group">
          <div
            class="admin-nav-item admin-nav-item--group"
            :class="{ 'is-open': softwareManageOpen }"
            @click="softwareManageOpen = !softwareManageOpen"
          >
            <span class="nav-ico" aria-hidden="true">▣</span>
            <span class="nav-label">软件管理</span>
            <span class="nav-caret" aria-hidden="true">{{ softwareManageOpen ? '▾' : '▸' }}</span>
          </div>
          <div v-show="softwareManageOpen" class="admin-nav-submenu">
            <RouterLink
              class="admin-nav-item admin-nav-item--sub"
              to="/software/manage"
              active-class="is-active"
            >
              <span class="nav-label">软件列表</span>
            </RouterLink>
            <RouterLink
              class="admin-nav-item admin-nav-item--sub"
              to="/software/scan"
              active-class="is-active"
            >
              <span class="nav-label">软件扫描</span>
            </RouterLink>
          </div>
        </div>
        <RouterLink class="admin-nav-item" to="/software/org" active-class="is-active">
          <span class="nav-ico" aria-hidden="true">⌘</span>
          组织管理
        </RouterLink>
        <RouterLink class="admin-nav-item" to="/software/openapi-tools" active-class="is-active">
          <span class="nav-ico" aria-hidden="true">◈</span>
          Open API
        </RouterLink>
        <!-- 安全情报中心（带二级菜单） -->
        <div class="admin-nav-group">
          <div
            class="admin-nav-item admin-nav-item--group"
            :class="{ 'is-open': intelOpen }"
            @click="intelOpen = !intelOpen"
          >
            <span class="nav-ico" aria-hidden="true">◉</span>
            <span class="nav-label">安全情报中心</span>
            <span class="nav-caret" aria-hidden="true">{{ intelOpen ? '▾' : '▸' }}</span>
          </div>
          <div v-show="intelOpen" class="admin-nav-submenu">
            <RouterLink
              class="admin-nav-item admin-nav-item--sub"
              to="/software/intel-vuln"
              active-class="is-active"
            >
              <span class="nav-label">漏洞库</span>
            </RouterLink>
            <RouterLink
              class="admin-nav-item admin-nav-item--sub"
              to="/software/intel-opi"
              active-class="is-active"
            >
              <span class="nav-label">舆情库</span>
            </RouterLink>
          </div>
        </div>
        <RouterLink class="admin-nav-item" to="/software/feedback" active-class="is-active">
          <span class="nav-ico" aria-hidden="true">▤</span>
          需求反馈
        </RouterLink>
        <RouterLink class="admin-nav-item" to="/software/standard-build" active-class="is-active">
          <span class="nav-ico" aria-hidden="true">▣</span>
          指标配置
        </RouterLink>
        <!-- 后台管理（带二级菜单） -->
        <div class="admin-nav-group">
          <div
            class="admin-nav-item admin-nav-item--group"
            :class="{ 'is-open': versionTrainOpen }"
            @click="versionTrainOpen = !versionTrainOpen"
          >
            <span class="nav-ico" aria-hidden="true">⚙️</span>
            <span class="nav-label">后台管理</span>
            <span class="nav-caret" aria-hidden="true">{{ versionTrainOpen ? '▾' : '▸' }}</span>
          </div>
          <div v-show="versionTrainOpen" class="admin-nav-submenu">
            <RouterLink
              class="admin-nav-item admin-nav-item--sub"
              to="/software/admin-flow"
              active-class="is-active"
            >
              <span class="nav-label">软件治理</span>
            </RouterLink>
            <RouterLink
              class="admin-nav-item admin-nav-item--sub"
              to="/software/board"
              active-class="is-active"
            >
              <span class="nav-label">数据看板</span>
            </RouterLink>
            <RouterLink
              class="admin-nav-item admin-nav-item--sub"
              to="/software/patch-plan"
              active-class="is-active"
            >
              <span class="nav-label">软件出入库</span>
            </RouterLink>
            <RouterLink
              class="admin-nav-item admin-nav-item--sub"
              to="/software/scan-details"
              active-class="is-active"
            >
              <span class="nav-label">扫描明细</span>
            </RouterLink>
            <RouterLink
              class="admin-nav-item admin-nav-item--sub"
              to="/software/vulnerability-alert"
              active-class="is-active"
            >
              <span class="nav-label">漏洞预警</span>
            </RouterLink>
          </div>
        </div>
      </nav>
      <div class="admin-aside-footer">
        <a
          class="admin-footer-manual"
          :href="manualPageUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="admin-footer-manual-ico" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </span>
          使用手册
        </a>
        <p class="admin-footer-icp">
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
          >渝ICP备2023009037号-13</a>
        </p>
      </div>
    </aside>

    <div class="admin-main">
      <header class="admin-header">
        <nav class="admin-breadcrumb" aria-label="面包屑">
          <template v-for="(c, i) in breadcrumbSegments" :key="i">
            <RouterLink v-if="c.to" :to="c.to">{{ c.label }}</RouterLink>
            <span v-else class="current">{{ c.label }}</span>
            <span v-if="i < breadcrumbSegments.length - 1" class="sep">/</span>
          </template>
        </nav>
        <div v-if="route.name === 'software-home'" class="admin-header-spacer" aria-hidden="true" />
        <div v-else class="admin-header-center">
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
                :placeholder="searchPlaceholder"
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
        <a
          class="admin-dash-pill"
          :href="dataScreenHomeUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          数据大屏
        </a>
        <RouterLink
          class="admin-help-btn"
          to="/software/workbench"
          title="工作台"
          aria-label="进入工作台"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        </RouterLink>
        <a
          class="admin-help-btn"
          :href="manualPageUrl"
          target="_blank"
          rel="noopener noreferrer"
          title="使用手册（新标签页打开）"
          aria-label="在新标签页打开使用手册"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </a>
        <div class="admin-user" ref="userMenuRef">
          <div class="admin-user-trigger" @click="toggleUserMenu">
            <div class="admin-avatar" aria-hidden="true">会</div>
            <div class="admin-user-meta">
              <span class="admin-user-name">会饮简</span>
              <span class="admin-user-mail">xluo6019@gmail.com</span>
            </div>
            <span class="admin-user-caret" aria-hidden="true">{{ userMenuOpen ? '▴' : '▾' }}</span>
          </div>
          <Transition name="dropdown">
            <div v-if="userMenuOpen" class="admin-user-dropdown">
              <div class="dropdown-header">
                <div class="dropdown-avatar">会</div>
                <div class="dropdown-meta">
                  <span class="dropdown-name">会饮简</span>
                  <span class="dropdown-mail">xluo6019@gmail.com</span>
                </div>
              </div>
              <div class="dropdown-divider" />
              <RouterLink class="dropdown-item" to="/software/api-keys" @click="userMenuOpen = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                密钥管理
              </RouterLink>
              <RouterLink class="dropdown-item" to="/software/personal-settings" @click="userMenuOpen = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                个人设置
              </RouterLink>
              <div class="dropdown-divider" />
              <button class="dropdown-item dropdown-item--danger" @click="handleLogout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                退出登录
              </button>
            </div>
          </Transition>
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

// 用户菜单下拉
const userMenuRef = ref(null)
const userMenuOpen = ref(false)

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value
}

function handleLogout() {
  userMenuOpen.value = false
  // 后续集成真实登出逻辑
}

// 软件管理二级菜单展开状态
const softwareManageOpen = ref(false)

// 版本火车二级菜单展开状态
const versionTrainOpen = ref(false)

// 安全情报中心二级菜单展开状态
const intelOpen = ref(false)

const componentDetailBreadcrumb = computed(() => {
  const id = route.params.id
  if (id != null && String(id).trim() !== '') return `组件详情 · ${String(id).trim()}`
  return '组件详情'
})

const manageListCrumb = computed(() => {
  const t = route.query.tab
  const tab = Array.isArray(t) ? t[0] : t
  return tab === 'component' ? '组件列表' : '软件列表'
})

/**
 * 面包屑配置：每个条目定义 { currentLabel, parentLabel?, parentTo? }
 * parentLabel / parentTo 可选，不传则只有"首页 > currentLabel"
 */
const breadcrumbConfig = {
  'workbench':        { currentLabel: '工作台' },
  'board':            { currentLabel: '数据看板' },
  'software-home':    { homeOnly: true },
  'software-library': { currentLabel: '软件库' },
  'component-library': { currentLabel: '组件库' },
  'code-assistant':   { currentLabel: 'AI 助手' },
  'signature-verify': { currentLabel: '签名验证' },
  'detection-report': { currentLabel: '检测报告' },
  'version-train-tree': { currentLabel: '版本火车信息树' },
  'version-train-release': { currentLabel: '版本火车发车' },
  'patch-plan':       { currentLabel: '软件出入库' },
  'openapi-tools':    { currentLabel: 'OpenAPI 工具集' },
  'requirement-feedback': { currentLabel: '需求反馈' },
  'api-keys':         { currentLabel: '密钥管理' },
  'personal-settings': { currentLabel: '个人设置' },
  'standard-build':   { currentLabel: '指标配置' },
  'admin-gov':        { currentLabel: '软件治理' },
  'software-detail':  { parentLabel: '软件库', parentTo: { name: 'software-library' }, currentLabel: '软件详情' },
  'admin-gov-detail': { parentLabel: '软件治理', parentTo: { name: 'admin-gov' }, currentLabel: '软件详情' },
}

const breadcrumbSegments = computed(() => {
  const name = route.name
  const cfg = breadcrumbConfig[name]

  /* 特殊路由：动态或组合条件 */
  if (route.meta.isComponentDetail) {
    return [
      { label: '首页', to: { name: 'software-home' } },
      { label: '组件库', to: { name: 'component-library' } },
      { label: componentDetailBreadcrumb.value },
    ]
  }
  if (name === 'software-manage' || name === 'software-scan') {
    return [
      { label: '首页', to: { name: 'software-home' } },
      { label: '软件管理', to: { name: 'software-manage' } },
      { label: name === 'software-scan' ? '软件扫描' : manageListCrumb.value },
    ]
  }
  if (name === 'intel-vuln' || name === 'intel-opi') {
    return [
      { label: '首页', to: { name: 'software-home' } },
      { label: route.meta.adminTitle || '' },
    ]
  }

  /* 已配置的路由 */
  if (cfg) {
    if (cfg.homeOnly) return [{ label: '首页' }]
    const segs = [{ label: '首页', to: { name: 'software-home' } }]
    if (cfg.parentLabel) {
      segs.push({ label: cfg.parentLabel, to: cfg.parentTo })
    }
    segs.push({ label: cfg.currentLabel })
    return segs
  }

  /* 兜底：只显示首页链接 */
  return [{ label: '首页', to: { name: 'software-home' } }]
})

const searchPlaceholder = computed(() =>
  route.name === 'software-manage' ? '搜索…' : '搜索软件或组件…',
)

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
  // 用户菜单点击外部关闭
  const menuEl = userMenuRef.value
  if (menuEl && !menuEl.contains(e.target)) {
    userMenuOpen.value = false
  }
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

/** 使用手册，新标签打开 */
const manualPageUrl = computed(() => {
  const href = router.resolve({ name: 'user-manual' }).href
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
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.admin-aside-footer {
  flex-shrink: 0;
  margin-top: auto;
  padding: 14px 16px 16px;
  border-top: 1px solid var(--admin-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.admin-footer-manual {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  text-decoration: none;
  transition: color 0.15s ease;
}

.admin-footer-manual:hover {
  color: var(--admin-primary);
}

.admin-footer-manual-ico {
  display: flex;
  opacity: 0.85;
}

.admin-footer-icp {
  margin: 0;
  font-size: 11px;
  line-height: 1.4;
  text-align: center;
}

.admin-footer-icp a {
  color: #9ca3af;
  text-decoration: none;
}

.admin-footer-icp a:hover {
  color: #6b7280;
  text-decoration: underline;
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

.admin-header-spacer {
  flex: 1;
  min-width: 0;
}

.admin-header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  min-width: 0;
}

.admin-dash-pill {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  margin-right: 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  background: #f3f4f6;
  text-decoration: none;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.admin-dash-pill:hover {
  background: #fee2e2;
  color: #da203e;
}

.admin-help-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin-right: 4px;
  border-radius: 999px;
  color: #6b7280;
  text-decoration: none;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.admin-help-btn:hover {
  background: rgba(218, 32, 62, 0.08);
  color: #da203e;
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
  position: relative;
}
.admin-user-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: background 0.15s;
}
.admin-user-trigger:hover {
  background: #f3f4f6;
}
.admin-user-caret {
  font-size: 10px;
  color: #9ca3af;
  line-height: 1;
  margin-left: -4px;
}

/* —— 下拉菜单 —— */
.admin-user-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 300;
  min-width: 220px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}
.dropdown-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
}
.dropdown-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e8b4bc, #da203e);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}
.dropdown-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1.2;
  min-width: 0;
}
.dropdown-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}
.dropdown-mail {
  font-size: 12px;
  color: #9ca3af;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dropdown-divider {
  height: 1px;
  background: #f3f4f6;
  margin: 0;
}
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 16px;
  font-size: 14px;
  color: #374151;
  text-decoration: none;
  cursor: pointer;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  font-family: inherit;
  transition: background 0.12s;
}
.dropdown-item:hover {
  background: #f9fafb;
}
.dropdown-item svg {
  flex-shrink: 0;
  color: #9ca3af;
}
.dropdown-item--danger {
  color: #dc2626;
}
.dropdown-item--danger svg {
  color: #dc2626;
}
.dropdown-item--danger:hover {
  background: #fef2f2;
}

/* —— 下拉动画 —— */
.dropdown-enter-active {
  transition: all 0.15s ease-out;
}
.dropdown-leave-active {
  transition: all 0.1s ease-in;
}
.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
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
