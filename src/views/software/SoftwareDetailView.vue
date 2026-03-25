<template>
  <div class="detail">
    <section class="hero-card">
      <div class="hero-lead">
        <h1 class="hero-title">{{ displayPkg.name }}</h1>
        <div class="hero-meta-strip" aria-label="版本、评分与漏洞概览">
          <div class="hero-meta-cell">
            <span class="hero-meta-k">版本</span>
            <span class="hero-meta-v hero-meta-v--ver">v{{ displayPkg.version }}</span>
          </div>
          <span class="hero-meta-divider" aria-hidden="true" />
          <div class="hero-meta-cell">
            <span class="hero-meta-k">评分</span>
            <span class="hero-meta-v hero-meta-v--score">{{ displayPkg.score }}</span>
          </div>
          <span class="hero-meta-divider" aria-hidden="true" />
          <div class="hero-meta-cell hero-meta-cell--grow">
            <span class="hero-meta-k">漏洞</span>
            <span class="hero-meta-v hero-meta-v--vuln-line">
              <template v-if="vulnHeroParts.isEmpty">
                <span class="hero-vuln-empty">无已知漏洞</span>
              </template>
              <template v-else>
                <template v-for="(p, idx) in vulnHeroParts.parts" :key="p.key">
                  <span class="hero-vuln-group">
                    <span
                      class="hero-vuln-label hero-vuln-label--mid-gap"
                    >{{ p.label }}</span>
                    <span class="hero-vuln-num" :class="p.numClass">{{ p.n }}</span>
                  </span>
                  <span
                    v-if="idx < vulnHeroParts.parts.length - 1"
                    class="hero-vuln-between"
                    aria-hidden="true"
                  > </span>
                </template>
              </template>
            </span>
          </div>
        </div>
      </div>
      <div class="hero-actions">
        <button type="button" class="btn btn-ghost">选型 ▾</button>
        <button type="button" class="btn btn-ghost">订阅 ▾</button>
        <button type="button" class="btn btn-primary">下载</button>
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

    <div v-show="activeTab === 'intro'" class="tab-panel intro-split">
      <div class="readme-col">
        <section class="block readme-block">
          <h2 class="readme-title">
            {{ displayPkg.name }} — WSGI 工具库
          </h2>
          <div class="readme-badges">
            <span class="badge">构建 passing</span>
            <span class="badge badge-accent">v{{ displayPkg.version }}</span>
            <span
              v-for="(ln, li) in displayPkg.license.names"
              :key="'lb-' + li"
              class="badge"
            >{{ ln }}</span>
            <span class="badge">Python 3</span>
          </div>
          <p class="readme-p">
            <strong>Werkzeug</strong> 是一个用于 Python 的 comprehensive WSGI Web 应用库。它提供了请求/响应对象、路由、调试工具以及与 WSGI 服务器交互所需的基础能力。
          </p>
          <p class="readme-p">
            本项目在可信开源代码库中标记为<strong>工业</strong>场景常用组件，详见右侧<strong>基本信息</strong>与<strong>参考信息</strong>。
          </p>
          <p class="readme-p">
            更多文档见 <a :href="displayPkg.links.website" target="_blank" rel="noopener noreferrer" class="readme-link">官方文档</a> 与
            <a :href="displayPkg.links.source" target="_blank" rel="noopener noreferrer" class="readme-link">源码仓库</a>。
          </p>
          <h3 class="readme-h3">安装</h3>
          <div class="install-box">
            <code class="install-cmd">pip install {{ displayPkg.name }}=={{ displayPkg.version }}</code>
            <button type="button" class="install-copy" title="复制" @click="copyInstall">复制</button>
          </div>
          <h3 class="readme-h3">快速开始</h3>
          <pre class="readme-pre"><code>from werkzeug.wrappers import Request, Response

@Request.application
def application(request):
    return Response('Hello, Werkzeug!', mimetype='text/plain')</code></pre>
          <p class="readme-p readme-note">
            以上为 README 示例内容，部署后可替换为从仓库拉取的 <code>README.md</code> 渲染结果。
          </p>
        </section>
      </div>

      <aside class="meta-col meta-col-flat">
        <div class="link-stack">
          <div class="link-entry">
            <div class="link-label">源码地址</div>
            <a
              class="link-row"
              :href="displayPkg.links.source"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="'打开' + displayPkg.links.sourceText"
            >
              <span class="link-ico" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
              </span>
              <span class="link-url">{{ displayPkg.links.sourceText }}</span>
            </a>
          </div>
          <hr class="link-divider" />
          <div class="link-entry">
            <div class="link-label">源码包下载</div>
            <div class="link-multi link-multi--inline">
              <a
                v-for="(dl, di) in displayPkg.links.packageDownloads"
                :key="'pkg-' + di"
                class="link-pkg"
                :href="dl.href"
                target="_blank"
                rel="noopener noreferrer"
                :aria-label="'下载源码包：' + dl.label"
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
          <hr class="link-divider" />
          <div class="link-entry">
            <div class="link-label">官网地址</div>
            <a
              class="link-row"
              :href="displayPkg.links.website"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="'打开' + displayPkg.links.websiteText"
            >
              <span class="link-ico" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </span>
              <span class="link-url">{{ displayPkg.links.websiteText }}</span>
            </a>
          </div>
        </div>

        <hr class="meta-sep" />

        <section class="meta-section">
          <h2 class="meta-section-title">基本信息</h2>
          <dl class="meta-dl">
            <div class="meta-row">
              <dt>主语言类型</dt>
              <dd>{{ displayPkg.language }}</dd>
            </div>
            <div class="meta-row">
              <dt>开发商</dt>
              <dd>{{ displayPkg.author }}</dd>
            </div>
            <div class="meta-row">
              <dt>发布日期</dt>
              <dd>{{ displayPkg.released }}</dd>
            </div>
            <div class="meta-row meta-row-license">
              <dt>开源License</dt>
              <dd class="meta-dd-license">
                <span
                  v-for="(ln, li) in displayPkg.license.names"
                  :key="'lic-' + li"
                  class="license-pill"
                >{{ ln }}</span>
              </dd>
            </div>
          </dl>
        </section>

        <hr class="meta-sep" />

        <section class="meta-section">
          <h2 class="meta-section-title">参考信息</h2>
          <dl class="meta-dl">
            <div class="meta-row">
              <dt>漏洞数</dt>
              <dd>{{ displayPkg.vulnCount }}</dd>
            </div>
            <div class="meta-row">
              <dt>行业</dt>
              <dd>{{ displayPkg.industry }}</dd>
            </div>
            <div class="meta-row meta-row-full">
              <dt>版本描述</dt>
              <dd class="mono">{{ displayPkg.description }}</dd>
            </div>
          </dl>
        </section>
      </aside>
    </div>

    <div v-show="activeTab === 'versions'" class="tab-panel version-sheet">
      <!-- <p class="version-sheet__hint">按发布时间倒序，点击条目进入该版本的软件介绍。</p> -->
      <div class="version-list">
        <button
          v-for="(row, index) in versionHistory"
          :key="row.version"
          type="button"
          class="version-release"
          :class="{ 'version-release--active': isVersionRowActive(row) }"
          @click="goToVersionIntro(row)"
        >
          <div class="version-release__main">
            <div class="version-release__left">
              <span v-if="index === 0" class="version-release__pill">最新</span>
              <span class="version-release__ver">{{ row.version }}</span>
            </div>
            <div class="version-release__mid">
              <span class="version-release__chip">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {{ row.released }}
              </span>
              <span class="version-release__chip version-release__chip--warn">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                漏洞 {{ row.vulnCount }}
              </span>
              <span class="version-release__vendor">{{ row.vendor }}</span>
            </div>
            <div class="version-release__score" :title="'综合评分 ' + row.score">
              <span class="version-release__score-label">评分</span>
              <span class="version-release__score-val">{{ row.score }}</span>
            </div>
          </div>
        </button>
      </div>
    </div>

    <div v-show="activeTab !== 'intro' && activeTab !== 'versions'" class="tab-panel placeholder">
      <p class="placeholder-text">「{{ tabLabel }}」内容占位，可后续接入接口。</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const versionHistory = [
  {
    version: '2.3.7',
    score: '5.5',
    released: '2023-08-14',
    vulnCount: 3,
    vulnHigh: 1,
    vulnMid: 1,
    vulnLow: 1,
    vendor: 'Pallets',
    packageDownloads: [
      { href: 'https://github.com/pallets/werkzeug/archive/refs/tags/2.3.7.zip', label: '.zip' },
      { href: 'https://github.com/pallets/werkzeug/archive/refs/tags/2.3.7.tar.gz', label: '.tar.gz' },
      { href: 'https://pypi.org/project/Werkzeug/2.3.7/#files', label: '.whl' },
    ],
  },
  {
    version: '2.3.6',
    score: '5.4',
    released: '2023-07-01',
    vulnCount: 4,
    vulnHigh: 0,
    vulnMid: 2,
    vulnLow: 2,
    vendor: 'Pallets',
    licenseNames: ['BSD-3-Clause'],
  },
  { version: '2.3.5', score: '5.3', released: '2023-05-15', vulnCount: 5, vulnHigh: 2, vulnMid: 1, vulnLow: 2, vendor: 'Pallets' },
  { version: '2.3.4', score: '5.2', released: '2023-04-01', vulnCount: 5, vulnHigh: 0, vulnMid: 0, vulnLow: 0, vendor: 'Pallets' },
  { version: '2.3.3', score: '5.2', released: '2023-02-10', vulnCount: 6, vulnHigh: 1, vulnMid: 2, vulnLow: 3, vendor: 'Pallets' },
  { version: '2.3.2', score: '5.1', released: '2023-01-05', vulnCount: 7, vulnHigh: 0, vulnMid: 3, vulnLow: 4, vendor: 'Pallets' },
]

const tabs = computed(() => [
  { key: 'intro', label: '软件介绍' },
  { key: 'deps', label: '依赖关系' },
  { key: 'vuln', label: '漏洞信息' },
  { key: 'contrib', label: '贡献者信息' },
  { key: 'license', label: '许可证信息' },
  { key: 'versions', label: `软件版本 (${versionHistory.length})` },
])

const allowedTabs = ['intro', 'versions', 'deps', 'vuln', 'contrib', 'license']
const activeTab = ref('intro')

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
  router.replace({ query: { ...route.query, tab: key } })
}

function goToVersionIntro(row) {
  router.push({
    name: 'software-detail',
    query: { v: row.version, tab: 'intro' },
  })
}

function isVersionRowActive(row) {
  const qv = route.query.v
  const vStr = Array.isArray(qv) ? qv[0] : qv
  if (vStr && typeof vStr === 'string') return row.version === vStr
  return row.version === versionHistory[0]?.version
}

const tabLabel = computed(() => tabs.value.find((t) => t.key === activeTab.value)?.label ?? '')

const basePkg = {
  name: 'werkzeug',
  version: '2.3.7',
  score: '5.5',
  language: 'Python',
  author: 'pallets',
  released: '2023-08-14',
  versionId: 'sha256:4e0f4b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0',
  description: 'The comprehensive WSGI web application library.',
  vulnCount: 3,
  vulnHigh: 1,
  vulnMid: 1,
  vulnLow: 1,
  industry: '工业',
  links: {
    source: 'https://github.com/pallets/werkzeug',
    sourceText: '源码仓库',
    /** 多个源码包 / 格式：ZIP、tar.gz、PyPI 等，按版本可在 versionHistory 中覆盖 */
    packageDownloads: [
      { href: 'https://github.com/pallets/werkzeug/archive/refs/heads/main.zip', label: '.zip' },
      { href: 'https://github.com/pallets/werkzeug/archive/refs/heads/main.tar.gz', label: '.tar.gz' },
      { href: 'https://pypi.org/project/Werkzeug/#files', label: '.whl' },
    ],
    website: 'https://werkzeug.palletsprojects.com/',
    websiteText: '版本官网地址',
  },
  license: {
    /** 多 SPDX / 展示名，按接口返回条数渲染 */
    names: ['BSD-3-Clause', 'MIT', 'Apache-2.0', 'ISC'],
    type: 'bsd',
    status: '已批准',
  },
}

const currentVersionRow = computed(() => {
  const qv = route.query.v
  const vStr = Array.isArray(qv) ? qv[0] : qv
  if (vStr && typeof vStr === 'string') {
    const row = versionHistory.find((x) => x.version === vStr)
    if (row) return row
  }
  return versionHistory[0]
})

const displayPkg = computed(() => {
  const row = currentVersionRow.value
  const licenseNames = row.licenseNames ?? basePkg.license.names
  const names = Array.isArray(licenseNames) ? licenseNames : [licenseNames].filter(Boolean)
  const packageDownloads = row.packageDownloads ?? basePkg.links.packageDownloads
  return {
    ...basePkg,
    version: row.version,
    score: row.score,
    released: row.released,
    author: row.vendor,
    vulnCount: row.vulnCount,
    vulnHigh: row.vulnHigh,
    vulnMid: row.vulnMid,
    vulnLow: row.vulnLow,
    license: {
      ...basePkg.license,
      names: names.length ? names : ['—'],
    },
    links: {
      ...basePkg.links,
      packageDownloads: Array.isArray(packageDownloads) ? packageDownloads : [],
    },
  }
})

/** 头部漏洞：始终展示 高危n 中危n 低危n（有漏洞时）；仅数字用等级色，文字标签灰色 */
const vulnHeroParts = computed(() => {
  const hi = displayPkg.value.vulnHigh ?? 0
  const mid = displayPkg.value.vulnMid ?? 0
  const lo = displayPkg.value.vulnLow ?? 0
  if (hi === 0 && mid === 0 && lo === 0) {
    return { isEmpty: true, parts: [] }
  }
  const numClass = (n, level) => {
    if (n <= 0) return 'hero-vuln-num--zero'
    if (level === 'h') return 'hero-vuln-num--high'
    if (level === 'm') return 'hero-vuln-num--mid'
    return 'hero-vuln-num--low'
  }
  return {
    isEmpty: false,
    parts: [
      { key: 'h', label: '高危', n: hi, numClass: numClass(hi, 'h') },
      { key: 'm', label: '中危', n: mid, numClass: numClass(mid, 'm') },
      { key: 'l', label: '低危', n: lo, numClass: numClass(lo, 'l') },
    ],
  }
})

function copyInstall() {
  const p = displayPkg.value
  const text = `pip install ${p.name}==${p.version}`
  navigator.clipboard?.writeText(text).catch(() => {})
}
</script>

<style scoped>
.detail {
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

.hero-lead {
  flex: 1 1 220px;
  min-width: 0;
}

.hero-title {
  margin: 0 0 5px;
  font-size: clamp(24px, 2.4vw, 22px);
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
  word-break: break-word;
}

/* 单条信息带：左色条 + 分栏，醒目但仍是「一块」不是三个独立卡片 */
.hero-meta-strip {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 0;
  margin: 0;
  /* padding: 1px 16px; */
  /* background: linear-gradient(105deg, rgba(218, 32, 62, 0.07) 0%, #f9fafb 28%); */
  /* border: 1px solid #e8eaed; */
  /* border-left: 4px solid #da203e;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06); */
}

.hero-meta-cell {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding: 0 18px;
  min-width: 0;
}

.hero-meta-cell:first-of-type {
  padding-left: 0;
}

.hero-meta-cell--grow {
  flex: 1 1 180px;
  min-width: min(100%, 200px);
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

.hero-meta-v--score {
  font-variant-numeric: tabular-nums;
  color: #5f47da;
}

.hero-meta-v--vuln-line {
  font-weight: 600;
  color: #374151;
}

.hero-vuln-empty {
  color: #a8a8a8;
  font-weight: 500;
}

.hero-vuln-group {
  display: inline;
  white-space: nowrap;
}

.hero-vuln-label {
  color: #6b7280;
  font-weight: 600;
}

.hero-vuln-label--mid-gap + .hero-vuln-num {
  margin-left: 0.35em;
}

.hero-vuln-num {
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.hero-vuln-num--high {
  color: #d03710;
}

.hero-vuln-num--mid {
  color: #bb6503;
}

.hero-vuln-num--low {
  color: #f19e39;
}

.hero-vuln-num--zero {
  color: #9ca3af;
  font-weight: 700;
}

.hero-vuln-between {
  display: inline;
  margin: 0 0.35em;
}

.hero-meta-divider {
  width: 1px;
  flex-shrink: 0;
  align-self: stretch;
  min-height: 2.75rem;
  margin: 2px 0;
  background: linear-gradient(180deg, transparent, #d1d5db 12%, #d1d5db 88%, transparent);
}

@media (max-width: 560px) {
  .hero-meta-strip {
    flex-direction: column;
    padding: 12px 14px;
  }
  .hero-meta-divider {
    width: 100%;
    height: 1px;
    min-height: 0;
    margin: 10px 0;
    background: #e5e7eb;
  }
  .hero-meta-cell {
    padding: 0;
  }
  .hero-meta-cell--grow {
    min-width: 0;
  }
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  flex: 0 0 auto;
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
}
.btn-ghost:hover {
  background: #f9fafb;
}
.btn-primary {
  background: #da203e;
  border-color: #da203e;
  color: #fff;
  font-weight: 600;
}
.btn-primary:hover {
  filter: brightness(0.95);
}

@media (max-width: 720px) {
  .hero-card {
    padding: 14px;
  }
}

@media (max-width: 480px) {
  .hero-actions {
    width: 100%;
    justify-content: flex-start;
  }
}

.tabs {
  display: flex;
  flex-wrap: nowrap;
  gap: 4px;
  margin-top: 16px;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 2px 2px;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
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

/* 左右分栏：左约 70% / 右约 30%，窄屏单列 */
.intro-split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 340px);
  gap: 24px;
  align-items: start;
}

@media (max-width: 960px) {
  .intro-split {
    grid-template-columns: 1fr;
  }
  .block {
    padding: 16px 0;
    border-right: none;
  }
}

.readme-col {
  min-width: 0;
}

.readme-block {
  margin-bottom: 0;
}

.readme-title {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  line-height: 1.35;
  display: flex;
  align-items: center;
  gap: 8px;
}

.readme-title-icon {
  color: #da203e;
  font-size: 14px;
}

.readme-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  color: #374151;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

.badge-accent {
  background: rgba(218, 32, 62, 0.08);
  border-color: rgba(218, 32, 62, 0.25);
  color: #da203e;
  font-weight: 600;
}

.readme-p {
  margin: 0 0 12px;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.65;
}

.readme-p:last-of-type {
  margin-bottom: 0;
}

.readme-link {
  color: #da203e;
  font-weight: 500;
  text-decoration: none;
}
.readme-link:hover {
  text-decoration: underline;
}

.readme-h3 {
  margin: 20px 0 10px;
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

.readme-h3:first-of-type {
  margin-top: 8px;
}

.install-box {
  display: flex;
  align-items: stretch;
  gap: 8px;
  padding: 12px 14px;
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 8px;
}

.install-cmd {
  flex: 1;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
  font-size: 13px;
  color: #111827;
  word-break: break-all;
}

.install-copy {
  flex-shrink: 0;
  padding: 0 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
}
.install-copy:hover {
  background: #f9fafb;
}

.readme-pre {
  margin: 0 0 12px;
  padding: 14px 16px;
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.5;
  color: #374151;
}

.readme-pre code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
}

.readme-note {
  font-size: 13px !important;
  color: #9ca3af !important;
}

.readme-note code {
  font-size: 12px;
  padding: 2px 6px;
  background: #f3f4f6;
  border-radius: 4px;
}

.meta-col {
  min-width: 0;
}

/* 右侧：无白底卡片，仅用分隔线 */
.meta-col-flat {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 4px 0 8px;
}

.link-stack {
  display: flex;
  flex-direction: column;
}

.link-entry {
  padding: 12px 0 14px;
}

.link-label {
  font-size: 14px;
  font-weight: 500;
  color: #9ca3af;
  letter-spacing: 0.02em;
  margin-bottom: 8px;
}

.link-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  text-decoration: none;
  color: #111827;
  font-size: 13px;
  line-height: 1.45;
}
.link-row:hover .link-url {
  text-decoration: underline;
  color: #da203e;
}

.link-ico {
  flex-shrink: 0;
  margin-top: 2px;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
}

.link-url {
  word-break: break-all;
  min-width: 0;
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
  border-bottom: 1px solid transparent;
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

.link-divider {
  border: none;
  border-top: 1px solid #f3f4f6;
  margin: 0;
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

.meta-row-full {
  grid-template-columns: 88px 1fr;
}

.meta-row:last-child {
  border-bottom: none;
}

.meta-row dt {
  color: #9ca3af;
  font-weight: 500;
}

.meta-row dd {
  margin: 0;
  color: #111827;
}

.block {
  /* background: #fff; */
  border-right: 1px solid #e5e7eb;
  /* border-radius: 12px; */
  padding: 20px 24px;
  margin-bottom: 16px;
}

.desc {
  margin: 16px 0 0;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
}

.table-wrap {
  overflow-x: auto;
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
}
th {
  color: #6b7280;
  font-weight: 600;
  background: #fafafa;
}
.pill-ok {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.12);
  color: #15803d;
  font-size: 13px;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
  font-size: 12px;
  word-break: break-all;
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

/* —— 软件版本：列表卡片，主题色 #da203e —— */
.version-sheet {
  --v-accent: #da203e;
  --v-accent-soft: rgba(218, 32, 62, 0.1);
  --v-accent-ring: rgba(218, 32, 62, 0.28);
  padding: 0;
}

.version-sheet__hint {
  margin: 0 0 12px;
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.45;
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
  padding: 10px 14px 10px 14px;
  text-align: left;
  font: inherit;
  color: inherit;
  cursor: pointer;
  background: #fafafa;
  border: 1px solid #eceef2;
  border-radius: 8px;
  border-left: 3px solid transparent;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    border-left-color 0.18s ease,
    box-shadow 0.18s ease;
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
  padding: 4px 4px 4px 12px;
  margin-left: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--v-accent);
  white-space: nowrap;
  /* border-left: 1px solid #e8eaed; */
}

@media (max-width: 640px) {
  .version-release__score {
    margin-left: 0;
    width: 100%;
    justify-content: flex-start;
  }

  .version-release__vendor {
    width: 100%;
    margin-left: 0;
    padding-left: 4px;
    border-left: none;
  }
}
</style>
