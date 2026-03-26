<template>
  <div class="comp-detail">
    <section class="hero-card">
      <div class="hero-lead hero-lead--component">
        <div class="hero-lead-text">
          <h1 class="hero-title">{{ comp.name }}</h1>
          <div class="hero-meta-cell">
            <span class="hero-meta-k">版本</span>
            <span class="hero-meta-v hero-meta-v--ver">v{{ comp.version }}</span>
          </div>
        </div>
      </div>
    </section>

    <div class="tabs">
      <button
        v-for="t in tabs"
        :key="t.key"
        type="button"
        class="tab"
        :class="{ 'is-active': activeTab === t.key }"
        @click="setTab(t.key)"
      >
        {{ t.label }}
      </button>
    </div>

    <div v-show="activeTab === 'version'" class="tab-panel comp-split">
      <div class="comp-main">
        <article class="comp-intro">
          <section class="comp-block-section">
            <h2 class="comp-block-title">描述</h2>
            <p class="comp-block-body">{{ comp.descriptionZh }}</p>
            <p v-if="comp.descriptionEn" class="comp-block-body comp-block-body--en">{{ comp.descriptionEn }}</p>
            <!-- <p class="comp-desc-disclaimer" role="note">本内容为AI自动翻译结果，仅供参考，具体请以原文为准。</p> -->
          </section>

          <section class="comp-block-section">
            <h2 class="comp-block-title">引入依赖</h2>
            <div class="dep-code-box">
              <div class="dep-code-toolbar">
                <div class="dep-format-tabs" role="tablist" aria-label="引入方式">
                  <button
                    v-for="fmt in depFormatTabsList"
                    :key="fmt.key"
                    type="button"
                    class="dep-format-tab"
                    role="tab"
                    :aria-selected="isDepFormatTabActive(fmt.key)"
                    :class="{ 'is-active': isDepFormatTabActive(fmt.key), 'is-single': !isJavaDepMulti }"
                    @click="onDepFormatTabClick(fmt.key)"
                  >
                    {{ fmt.label }}
                  </button>
                </div>
                <button
                  type="button"
                  class="dep-copy-icon-btn"
                  :title="copyFeedback === 'ok' ? '已复制' : copyFeedback === 'fail' ? '复制失败' : '复制'"
                  :aria-label="copyFeedback === 'ok' ? '已复制到剪贴板' : copyFeedback === 'fail' ? '复制失败' : '复制代码'"
                  @click="copyDepSnippet"
                >
                  <svg
                    v-if="copyFeedback !== 'ok'"
                    class="dep-copy-svg"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                  <svg
                    v-else
                    class="dep-copy-svg dep-copy-svg--ok"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </button>
              </div>
              <pre class="dep-pre"><code class="hljs" v-html="highlightedDep"></code></pre>
            </div>
          </section>

          <!-- <section class="comp-block-section">
            <h2 class="comp-block-title">
              快速开始
            </h2>
            <div
              v-for="(block, qi) in quickStartBlocks"
              :key="'qs-' + qi + '-' + block.title"
              class="quick-start-step"
            >
              <h3 class="quick-start-step-title">{{ block.title }}</h3>
              <div class="dep-code-box quick-start-code-box">
                <pre class="dep-pre"><code class="hljs" v-html="block.html"></code></pre>
              </div>
            </div>
          </section> -->
        </article>
      </div>

      <!-- 与 SoftwareDetailView 右侧：meta-col-flat，无独立白底卡片 -->
      <aside class="meta-col meta-col-flat">
        <section class="meta-section">
          <h2 class="meta-section-title">基本信息</h2>
          <dl class="meta-dl">
            <div class="meta-row">
              <dt>组件编码</dt>
              <dd class="mono">{{ comp.componentCode }}</dd>
            </div>
            <div v-if="comp.groupId" class="meta-row">
              <dt>groupId</dt>
              <dd class="mono">{{ comp.groupId }}</dd>
            </div>
            <div class="meta-row">
              <dt>artifactId</dt>
              <dd class="mono">{{ comp.artifactId }}</dd>
            </div>
            <div class="meta-row">
              <dt>版本</dt>
              <dd>{{ comp.version }}</dd>
            </div>
            <div class="meta-row">
              <dt>编程语言</dt>
              <dd>{{ currentLangLabel }}</dd>
            </div>
            <div class="meta-row meta-row-license">
              <dt>开源License</dt>
              <dd class="meta-dd-license">
                <span
                  v-for="lic in licensePillItems"
                  :key="lic.code"
                  class="license-pill"
                >{{ lic.code }}</span>
                <span
                  v-if="licenseMoreCount > 0"
                  class="license-pill license-pill--more"
                  :title="'另 ' + licenseMoreCount + ' 项：' + licenseMoreTooltip"
                >…</span>
              </dd>
            </div>
          </dl>
        </section>

        <template v-if="hasLinkAsideBlocks">
          <hr class="meta-sep" />

          <div class="link-stack">
            <div v-if="hasPackageDownloads" class="link-entry link-entry--after-table">
              <div class="link-label">实体包下载</div>
              <div class="link-multi link-multi--inline">
                <a
                  v-for="(dl, di) in comp.packageDownloads"
                  :key="'pkg-' + di"
                  class="link-pkg"
                  :href="dl.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  :aria-label="'下载实体包：' + dl.label"
                >
                  <span class="link-pkg-ico" aria-hidden="true">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                  </span>
                  <span class="link-pkg-txt">{{ dl.label }}</span>
                </a>
              </div>
            </div>

            <hr v-if="hasPackageDownloads && hasParentSoftwares" class="link-divider" />

            <div v-if="hasParentSoftwares" class="link-entry">
              <div class="link-label">所属软件</div>
              <div class="comp-parent-sw-list">
                <button
                  v-for="(sw, si) in comp.parentSoftwares"
                  :key="'psw-' + si"
                  type="button"
                  class="comp-parent-sw-tile"
                  :aria-label="'进入所属软件「' + sw.name + '」的软件详情'"
                  @click="goSoftwareDetail(sw)"
                >
                  <div class="comp-parent-sw-tile-left">
                    <span class="comp-parent-sw-tile-line">
                      <span class="comp-parent-sw-tile-name">{{ sw.name }}</span>
                      <span class="comp-parent-sw-tile-sep" aria-hidden="true">·</span>
                      <span class="comp-parent-sw-tile-ver">v{{ sw.version }}</span>
                    </span>
                  </div>
                  <div class="comp-parent-sw-tile-right">
                    <span class="comp-parent-sw-tile-action">软件详情</span>
                    <svg
                      class="comp-parent-sw-tile-chevron"
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    ><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </template>

        <!-- <section class="meta-section">
          <h2 class="meta-section-title">所属软件</h2>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>所属软件名称</th>
                  <th>所属软件版本编码</th>
                  <th>所属版本</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{{ comp.parentSoftware.name }}</td>
                  <td>
                    <a
                      class="table-link-code"
                      :href="comp.parentSoftware.versionCodeHref"
                      target="_blank"
                      rel="noopener noreferrer"
                    >{{ comp.parentSoftware.versionCode }}</a>
                  </td>
                  <td>{{ comp.parentSoftware.version }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section> -->

        <hr v-if="hasLinkAsideBlocks" class="meta-sep" />

        <!-- <section class="meta-section">
          <h2 class="meta-section-title">实体包信息</h2>
          <div class="table-wrap table-wrap--tight">
            <table>
              <thead>
                <tr>
                  <th>类型</th>
                  <th>文件名</th>
                  <th>下载地址</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(pkg, i) in comp.binaryPackages" :key="'bp-' + i">
                  <td>{{ pkg.kind }}</td>
                  <td class="mono">{{ pkg.fileName }}</td>
                  <td>
                    <a
                      class="table-link-code"
                      :href="pkg.href"
                      target="_blank"
                      rel="noopener noreferrer"
                    >{{ pkg.href }}</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section> -->
      </aside>
    </div>

    <div v-show="activeTab === 'versions'" class="tab-panel version-sheet">
      <div class="version-list">
        <button
          v-for="(row, index) in componentVersionHistory"
          :key="row.version"
          type="button"
          class="version-release"
          :class="{ 'version-release--active': isVersionRowActive(row) }"
          @click="goToVersionDetail(row)"
        >
          <div class="version-release__main">
            <div class="version-release__left">
              <span v-if="index === 0" class="version-release__pill">最新</span>
              <span class="version-release__ver">{{ row.version }}</span>
            </div>
            <div class="version-release__mid">
              <!-- <span class="version-release__chip">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {{ row.released }}
              </span> -->
              <!-- <span class="version-release__chip version-release__chip--warn">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                漏洞 {{ row.vulnCount }}
              </span> -->
              <!-- <div class="version-release__score" :title="'综合评分 ' + row.score">
                <span class="version-release__score-label">评分</span>
                <span class="version-release__score-val">{{ row.score }}</span>
              </div> -->
            </div>
            <!-- <span class="version-release__vendor">{{ row.vendor }}</span> -->
          </div>
        </button>
      </div>
    </div>

    <div v-show="activeTab === 'deps'" class="tab-panel">
      <div class="placeholder">
        <p class="placeholder-text">「依赖路径」内容占位，可后续接入接口。</p>
      </div>
    </div>

    <div v-show="activeTab === 'license'" class="tab-panel">
      <section class="block license-tab-block">
        <h2 class="readme-title">License 信息</h2>
        <!-- <p class="readme-p readme-note license-tab-hint">
          以下为许可证完整字段；「版本信息」中仅展示 SPDX 等短标签，超过 5 条时以「…」折叠。
        </p> -->
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>名称</th>
                <th>编码</th>
                <th>版本</th>
                <th>类型</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(lic, i) in licensesSafe" :key="'lic-tab-' + i">
                <td>{{ lic.name }}</td>
                <td class="mono">{{ lic.code }}</td>
                <td>{{ lic.version }}</td>
                <td>{{ lic.type }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  DETAIL_LANG_LABELS,
  DETAIL_LANG_HIGHLIGHT,
  JAVA_DEP_FORMAT_KEYS,
  JAVA_DEP_FORMAT_LABELS,
  JAVA_DEP_FORMAT_HIGHLIGHT,
  DEP_TOOL_TAB_LABELS,
  buildDependencySnippet,
} from '../../data/componentDetailLang.js'
import { getComponentMock } from '../../data/componentDetailMocks.js'
import { getQuickStartSections } from '../../data/componentQuickStart.js'
import { getComponentVersionHistory } from '../../data/componentVersionHistory.js'
import { highlightCode } from '../../utils/highlightSnippet.js'
import 'highlight.js/styles/github.css'

const route = useRoute()
const router = useRouter()

const LICENSE_PILL_MAX = 5

/** 路由 param `id` 在部分环境下可能为数组，统一成字符串避免 getComponentMock 异常 */
const routeCompId = computed(() => {
  const p = route.params.id
  if (p == null) return ''
  return Array.isArray(p) ? String(p[0] ?? '').trim() : String(p).trim()
})

const compBase = computed(() => getComponentMock(routeCompId.value))

const componentVersionHistory = computed(() => getComponentVersionHistory(routeCompId.value))

const currentVersionRow = computed(() => {
  const qv = route.query.v
  const vStr = Array.isArray(qv) ? qv[0] : qv
  const hist = componentVersionHistory.value
  if (vStr && typeof vStr === 'string') {
    const row = hist.find((x) => x.version === vStr)
    if (row) return row
  }
  return hist[0] ?? null
})

const comp = computed(() => {
  const base = compBase.value
  const row = currentVersionRow.value
  if (!row) return base
  return {
    ...base,
    version: row.version,
    ...(row.packageDownloads !== undefined ? { packageDownloads: row.packageDownloads } : {}),
    ...(row.parentSoftwares !== undefined ? { parentSoftwares: row.parentSoftwares } : {}),
    ...(row.licenses !== undefined ? { licenses: row.licenses } : {}),
    ...(row.descriptionZh !== undefined ? { descriptionZh: row.descriptionZh } : {}),
    ...(row.descriptionEn !== undefined ? { descriptionEn: row.descriptionEn } : {}),
  }
})

const hasPackageDownloads = computed(
  () => Array.isArray(comp.value.packageDownloads) && comp.value.packageDownloads.length > 0,
)

const hasParentSoftwares = computed(
  () => Array.isArray(comp.value.parentSoftwares) && comp.value.parentSoftwares.length > 0,
)

const hasLinkAsideBlocks = computed(
  () => hasPackageDownloads.value || hasParentSoftwares.value,
)

/** 由组件数据决定展示哪种语言的「引入依赖」，不再在页内切换语言 */
const detailLangKey = computed(() => comp.value.detailLang)

const javaDepFormat = ref('maven')
/** @type {import('vue').Ref<null | 'ok' | 'fail'>} */
const copyFeedback = ref(null)

let copyResetTimer = 0

function clearCopyResetTimer() {
  if (copyResetTimer) {
    window.clearTimeout(copyResetTimer)
    copyResetTimer = 0
  }
}

watch(
  () => routeCompId.value,
  () => {
    javaDepFormat.value = 'maven'
    copyFeedback.value = null
    clearCopyResetTimer()
  },
)

/** Java 有多种子格式；其余语言仅一种，Tab 仍展示标签但不可切换 */
const isJavaDepMulti = computed(() => detailLangKey.value === 'java')

const depFormatTabsList = computed(() => {
  const lang = detailLangKey.value
  if (lang === 'java') {
    return JAVA_DEP_FORMAT_KEYS.map((k) => ({ key: k, label: JAVA_DEP_FORMAT_LABELS[k] }))
  }
  const label = DEP_TOOL_TAB_LABELS[lang] || '依赖'
  return [{ key: `single-${lang}`, label }]
})

function isDepFormatTabActive(tabKey) {
  if (detailLangKey.value === 'java') return javaDepFormat.value === tabKey
  return true
}

function onDepFormatTabClick(tabKey) {
  if (detailLangKey.value !== 'java') return
  javaDepFormat.value = tabKey
}

onUnmounted(() => {
  clearCopyResetTimer()
})

const tabs = computed(() => [
  { key: 'version', label: '版本信息' },
  { key: 'deps', label: '依赖路径' },
  { key: 'license', label: '许可证信息' },
  { key: 'versions', label: `组件版本 (${componentVersionHistory.value.length})` },
])

const allowedTabs = ['version', 'versions', 'deps', 'license']
const activeTab = ref('version')

watch(
  () => route.query.tab,
  (t) => {
    const tStr = Array.isArray(t) ? t[0] : t
    if (tStr && allowedTabs.includes(String(tStr))) {
      activeTab.value = String(tStr)
    }
  },
  { immediate: true },
)

function setTab(key) {
  activeTab.value = key
  router.replace({
    name: 'component-detail',
    params: { ...route.params },
    query: { ...route.query, tab: key },
  })
}

function goToVersionDetail(row) {
  router.push({
    name: 'component-detail',
    params: { ...route.params },
    query: { ...route.query, v: row.version, tab: 'version' },
  })
}

function isVersionRowActive(row) {
  const qv = route.query.v
  const vStr = Array.isArray(qv) ? qv[0] : qv
  const hist = componentVersionHistory.value
  if (vStr && typeof vStr === 'string') return row.version === vStr
  return row.version === hist[0]?.version
}

const currentLangLabel = computed(() => DETAIL_LANG_LABELS[detailLangKey.value] || comp.value.language)

const depSnippetRaw = computed(() =>
  buildDependencySnippet(detailLangKey.value, comp.value, javaDepFormat.value),
)

const highlightLangForDep = computed(() => {
  if (detailLangKey.value === 'java') {
    return JAVA_DEP_FORMAT_HIGHLIGHT[javaDepFormat.value] || 'xml'
  }
  return DETAIL_LANG_HIGHLIGHT[detailLangKey.value] || 'bash'
})

const highlightedDep = computed(() =>
  highlightCode(depSnippetRaw.value, highlightLangForDep.value),
)

const quickStartBlocks = computed(() =>
  getQuickStartSections(detailLangKey.value, comp.value)
    .filter((s) => s.code && String(s.code).trim() !== '')
    .map((s) => ({
      title: s.title,
      html: highlightCode(s.code, s.highlight),
    })),
)

const licensesSafe = computed(() => (Array.isArray(comp.value.licenses) ? comp.value.licenses : []))

const licensePillItems = computed(() => licensesSafe.value.slice(0, LICENSE_PILL_MAX))

const licenseMoreCount = computed(() => Math.max(0, licensesSafe.value.length - LICENSE_PILL_MAX))

const licenseMoreTooltip = computed(() =>
  licensesSafe.value.slice(LICENSE_PILL_MAX).map((l) => l.code).join('、'),
)

async function copyDepSnippet() {
  const text = depSnippetRaw.value
  if (!text) return
  clearCopyResetTimer()
  try {
    await navigator.clipboard.writeText(text)
    copyFeedback.value = 'ok'
  } catch {
    copyFeedback.value = 'fail'
  }
  copyResetTimer = window.setTimeout(() => {
    copyFeedback.value = null
    copyResetTimer = 0
  }, 5000)
}

function goSoftwareDetail(sw) {
  const q = sw.softwareDetailQuery && typeof sw.softwareDetailQuery === 'object' ? sw.softwareDetailQuery : {}
  router.push({
    name: 'software-detail',
    query: { tab: 'intro', ...q },
  })
}
</script>

<style scoped>
/* —— 顶栏、Tab、分栏（与软件详情对齐） —— */
.comp-detail {
  margin: 0 auto;
}

.hero-card {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 16px;
  padding: 16px 18px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.hero-lead--component {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.comp-hero-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #4571cf;
  color: #fff;
  font-size: 22px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hero-lead-text {
  min-width: 0;
}

.hero-title {
  margin: 0 0 6px;
  font-size: clamp(18px, 2.2vw, 22px);
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
  word-break: break-word;
}

.hero-meta-cell {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  min-width: 0;
}

.hero-meta-k {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9ca3af;
  line-height: 1.2;
}

.hero-meta-v {
  font-size: clamp(14px, 2vw, 17px);
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

.hero-meta-v--ver {
  font-variant-numeric: tabular-nums;
  color: #4571cf;
}

.comp-hero-sub {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.tabs {
  display: flex;
  flex-wrap: nowrap;
  gap: 4px;
  margin-top: 16px;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 2px 2px;
  overflow-x: auto;
}

.tab {
  position: relative;
  flex-shrink: 0;
  padding: 10px 14px 12px;
  border: none;
  background: none;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  margin-bottom: -1px;
  white-space: nowrap;
}
.tab:hover {
  color: #111827;
}
.tab.is-active {
  color: #da203e;
  font-weight: 600;
}
.tab.is-active::after {
  content: '';
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 0;
  height: 3px;
  background: #da203e;
  border-radius: 2px 2px 0 0;
}

.tab-panel {
  margin-top: 20px;
}

.comp-split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 340px);
  gap: 24px;
  align-items: start;
}

@media (max-width: 960px) {
  .comp-split {
    grid-template-columns: 1fr;
  }
}

.comp-main {
  min-width: 0;
}

/* 左侧介绍区：无白底卡片，随页面灰底 */
.comp-intro {
  padding: 4px 12px 24px 12px;
}

.comp-block-section {
  margin-bottom: 24px;
}

.comp-block-section:last-of-type {
  margin-bottom: 0;
}

.comp-block-title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  line-height: 1.35;
}

.comp-block-title-sub {
  margin-left: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #9ca3af;
  vertical-align: middle;
}

.quick-start-step {
  margin-bottom: 18px;
}

.quick-start-step:last-child {
  margin-bottom: 0;
}

.quick-start-step-title {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
}

.quick-start-code-box .dep-pre {
  margin: 0;
}

.comp-block-body {
  margin: 0 0 10px;
  font-size: 14px;
  color: #374151;
  line-height: 1.75;
}

.comp-block-body:last-child {
  margin-bottom: 0;
}

.comp-block-body--en {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.7;
}

.comp-desc-disclaimer {
  margin: 10px 0 0;
  font-size: 11px;
  line-height: 1.5;
  color: #b4b2b2;
  font-weight: 400;
}

.dep-code-box {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
  background: #e5e7eb;
}

.dep-code-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  padding: 8px 10px;
  background: #f3f4f6;
  border-bottom: 1px solid #d1d5db;
}

.dep-format-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-height: 32px;
  align-items: center;
}

.dep-format-tab {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  font-family: inherit;
  line-height: 1.2;
}

.dep-format-tab:hover {
  color: #111827;
  background: #e5e7eb;
}

.dep-format-tab.is-active {
  color: #111827;
  font-weight: 600;
  background: #fff;
  border-color: #d1d5db;
}

.dep-format-tab.is-single {
  cursor: default;
  pointer-events: none;
}

.dep-copy-icon-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 32px;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
}

.dep-copy-icon-btn:hover {
  background: #e5e7eb;
  color: #111827;
}

.dep-copy-svg {
  display: block;
}

.dep-copy-svg--ok {
  color: #16a34a;
}

.dep-pre {
  margin: 0;
  padding: 16px 18px;
  background: #e5e7eb;
  border: none;
  border-radius: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 1.55;
  color: #1f2937;
  overflow-x: auto;
}

.dep-pre code {
  font-family: inherit;
  white-space: pre;
  display: block;
  background: transparent !important;
  padding: 0 !important;
}

.dep-pre :deep(.hljs) {
  background: transparent !important;
  padding: 0;
}

.readme-title {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  line-height: 1.35;
}

.readme-p {
  margin: 0 0 12px;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.65;
}

.readme-note {
  font-size: 13px !important;
  color: #9ca3af !important;
}

.block {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

/* —— 右侧：与 SoftwareDetailView meta-col-flat 一致 —— */
.meta-col {
  min-width: 0;
}

.meta-col-flat {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 4px 0 8px;
}

.comp-split > aside.meta-col-flat {
  border-left: 1px solid #e5e7eb;
  padding-left: 24px;
}

@media (max-width: 960px) {
  .comp-split > aside.meta-col-flat {
    border-left: none;
    padding-left: 0;
  }
}

.meta-sep {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 8px 0 4px;
}

.meta-section {
  padding: 12px 0 8px;
}

.meta-section-title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

.meta-dl {
  margin: 0;
}

.meta-row {
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
}

.meta-section .meta-dl .meta-row:last-child {
  border-bottom: none;
}

.meta-row-license dd {
  min-width: 0;
}

.meta-dd-license {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 8px;
  align-items: center;
}

.license-pill {
  display: inline-block;
  padding: 3px 9px;
  font-size: 13px;
  line-height: 1.35;
  color: #374151;
  background: #f9fafb;
  border: 1px solid #e8eaed;
  border-radius: 6px;
}

.license-pill--more {
  cursor: default;
  color: #6b7280;
  font-weight: 700;
  min-width: 1.75rem;
  text-align: center;
}

.meta-row dt {
  color: #9ca3af;
  font-weight: 500;
}

.meta-row dd {
  margin: 0;
  color: #111827;
  word-break: break-all;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
  font-size: 12px;
  word-break: break-all;
}

.table-wrap {
  overflow-x: auto;
}

.table-wrap--tight table {
  font-size: 12px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th,
td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: top;
}

th {
  color: #6b7280;
  font-weight: 600;
  background: #fafafa;
}

tbody tr:last-child td {
  border-bottom: none;
}

.table-link-code {
  color: #2563eb;
  text-decoration: none;
  word-break: break-all;
}
.table-link-code:hover {
  text-decoration: underline;
  color: #da203e;
}

/* 与软件详情 link-stack 一致 */
.link-stack {
  display: flex;
  flex-direction: column;
}

.link-divider {
  border: none;
  border-top: 1px solid #f3f4f6;
  margin: 0;
}

.comp-parent-sw-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 所属软件：中性灰条，button 导航（非 RouterLink） */
.comp-parent-sw-tile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  text-align: left;
  font: inherit;
  color: inherit;
  cursor: pointer;
  background: #f9fafb;
  border: 1px solid #e8eaed;
  border-radius: 8px;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.comp-parent-sw-tile:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.comp-parent-sw-tile:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(107, 114, 128, 0.35);
}

.comp-parent-sw-tile-left {
  min-width: 0;
  flex: 1 1 auto;
}

.comp-parent-sw-tile-line {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 8px;
  font-size: 14px;
  line-height: 1.4;
}

.comp-parent-sw-tile-name {
  font-weight: 700;
  color: #111827;
  word-break: break-word;
}

.comp-parent-sw-tile:hover .comp-parent-sw-tile-name {
  color: #111827;
}

.comp-parent-sw-tile-sep {
  color: #d1d5db;
  font-weight: 700;
  user-select: none;
}

.comp-parent-sw-tile-ver {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: #6b7280;
  font-size: 13px;
}

.comp-parent-sw-tile-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.comp-parent-sw-tile-action {
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  white-space: nowrap;
}

.comp-parent-sw-tile:hover .comp-parent-sw-tile-action {
  color: #4b5563;
}

.comp-parent-sw-tile-chevron {
  flex-shrink: 0;
  color: #9ca3af;
  transition: color 0.15s ease, transform 0.15s ease;
}

.comp-parent-sw-tile:hover .comp-parent-sw-tile-chevron {
  color: #6b7280;
  transform: translateX(2px);
}

/* 实体包下载：与软件详情 link-entry / link-pkg 一致 */
.link-entry {
  padding: 12px 0 14px;
}

.link-entry--after-table {
  padding-top: 8px;
}

.link-label {
  font-size: 14px;
  font-weight: 500;
  color: #9ca3af;
  letter-spacing: 0.02em;
  margin: 8px 0 8px 0;
}

.link-multi--inline {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 14px;
}

.link-pkg {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: #111827;
  text-decoration: none;
  line-height: 1.4;
}

.link-pkg-ico {
  display: flex;
  flex-shrink: 0;
  color: #6b7280;
  transition: color 0.15s ease;
}

.link-pkg-txt {
  border-bottom: 1px solid transparent;
}

.link-pkg:hover {
  color: #da203e;
}

.link-pkg:hover .link-pkg-ico {
  color: #da203e;
}

.link-pkg:hover .link-pkg-txt {
  border-bottom-color: rgba(218, 32, 62, 0.45);
}

.link-pkg:focus-visible {
  outline: none;
  border-radius: 4px;
  box-shadow: 0 0 0 2px rgba(218, 32, 62, 0.35);
}

.placeholder {
  padding: 48px 24px;
  text-align: center;
  background: #fff;
  border: 1px dashed #e5e7eb;
  border-radius: 12px;
}
.placeholder-text {
  margin: 0;
  color: #9ca3af;
  font-size: 14px;
}

.license-tab-block {
  max-width: 100%;
}

.license-tab-hint {
  margin-top: -8px !important;
}

@media (max-width: 520px) {
  .meta-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}

/* —— 组件版本列表（与软件详情 version-sheet 一致） —— */
.version-sheet {
  --v-accent: #da203e;
  --v-accent-soft: rgba(218, 32, 62, 0.1);
  --v-accent-ring: rgba(218, 32, 62, 0.28);
  padding: 0;
}

.version-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.version-release {
  flex: 1 1 auto;
  min-width: 0;
  margin: 0 0 8px;
  padding: 14px 14px 14px 14px;
  text-align: left;
  font: inherit;
  color: inherit;
  cursor: pointer;
  background: #fafafa;
  border: 1px solid #eceef2;
  border-radius: 8px;
  border-left: 3px solid transparent;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
  /* transition:
    background 0.18s ease,
    border-color 0.18s ease,
    border-left-color 0.18s ease,
    box-shadow 0.18s ease; */
}

.version-release:hover {
  background: #fff;
  border-color: #e5e7eb;
  border-left-color: rgba(218, 32, 62, 0.55);
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.05);
}

.version-release:focus-visible {
  outline: none;
  border-left-color: var(--v-accent);
  box-shadow: 0 0 0 3px var(--v-accent-ring);
}

.version-release--active {
  background: #fff;
  border-color: #f5d0d6;
  border-left-color: var(--v-accent);
  box-shadow: 0 2px 8px rgba(218, 32, 62, 0.07);
}

.version-release__main {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 30px;
}

.version-release__left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.version-release__mid {
  display: flex;
  flex: 1 1 240px;
  align-items: center;
  flex-wrap: wrap;
  column-gap: 20px;
  row-gap: 14px;
  min-width: 0;
}

.version-release__pill {
  display: inline-block;
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: var(--v-accent);
  background: var(--v-accent-soft);
  border-radius: 4px;
}

.version-release__ver {
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #111827;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.version-release__score {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  margin-left: auto;
  padding: 5px 10px;
  background: #fff;
  border: 1px solid #e8eaed;
  border-radius: 6px;
}

.version-release__score-label {
  font-size: 10px;
  font-weight: 600;
  color: #9ca3af;
  letter-spacing: 0.04em;
}

.version-release__score-val {
  font-size: 14px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--v-accent);
  line-height: 1;
}

.version-release__chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  font-size: 12px;
  background: #f3f4f6;
  border-radius: 6px;
  color: #4b5563;
}

.version-release__chip svg {
  flex-shrink: 0;
  color: #6b7280;
  opacity: 0.9;
}

.version-release__chip--warn {
  background: rgba(251, 191, 36, 0.14);
  color: #a16207;
}

.version-release__chip--warn svg {
  color: #ca8a04;
}

.version-release__vendor {
  margin-left: auto;
  align-self: center;
  padding: 4px 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--v-accent);
  white-space: nowrap;
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .version-release__score {
    width: 100%;
    justify-content: flex-start;
  }

  .version-release__vendor {
    width: 100%;
    margin-left: 0;
  }
}
</style>
