<template>
  <div class="detail">
    <section class="hero-card">
      <div class="hero-left">
        <div class="hero-icon" aria-hidden="true">W</div>
        <div class="hero-info">
          <h1 class="hero-title">{{ displayPkg.name }}</h1>
          <p class="hero-meta">
            <span>版本: {{ displayPkg.version }}</span>
            <span class="dot"> </span>
            <span>评分: {{ displayPkg.score }}</span>
          </p>
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
            <span class="badge">{{ displayPkg.license.name }}</span>
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
            <div class="link-label">包下载地址</div>
            <a
              class="link-row"
              :href="displayPkg.links.package"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="'打开' + displayPkg.links.packageText"
            >
              <span class="link-ico" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              </span>
              <span class="link-url">{{ displayPkg.links.packageText }}</span>
            </a>
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
            <div class="meta-row">
              <dt>开源License</dt>
              <dd>{{ displayPkg.license.name }}</dd>
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

    <div v-show="activeTab === 'versions'" class="tab-panel version-panel">
      <button
        v-for="row in versionHistory"
        :key="row.version"
        type="button"
        class="version-card"
        @click="goToVersionIntro(row)"
      >
        <span class="version-card__ver">{{ row.version }}</span>
        <span class="version-card__meta">
          <span class="version-card__ico" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </span>
           {{ row.score }}
        </span>
        <span class="version-card__meta">
          <span class="version-card__ico" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </span>
           {{ row.released }}
        </span>
        <span class="version-card__meta">
          <span class="version-card__ico" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </span>
           {{ row.vulnCount }}
        </span>
        <span class="version-card__author">
          <span class="version-card__ico" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9v.01"/><path d="M9 12v.01"/><path d="M9 15v.01"/><path d="M9 18v.01"/></svg>
          </span>
          <span class="version-card__author-name"> {{ row.vendor }}</span>
        </span>
      </button>
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
  { version: '2.3.7', score: '5.5', released: '2023-08-14', vulnCount: 3, vendor: 'Pallets' },
  { version: '2.3.6', score: '5.4', released: '2023-07-01', vulnCount: 4, vendor: 'Pallets' },
  { version: '2.3.5', score: '5.3', released: '2023-05-15', vulnCount: 5, vendor: 'Pallets' },
  { version: '2.3.4', score: '5.2', released: '2023-04-01', vulnCount: 5, vendor: 'Pallets' },
  { version: '2.3.3', score: '5.2', released: '2023-02-10', vulnCount: 6, vendor: 'Pallets' },
  { version: '2.3.2', score: '5.1', released: '2023-01-05', vulnCount: 7, vendor: 'Pallets' },
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
  industry: '工业',
  links: {
    source: 'https://github.com/pallets/werkzeug',
    package: 'https://pypi.org/project/Werkzeug/',
    website: 'https://werkzeug.palletsprojects.com/',
    sourceText: 'GitHub 源码仓库',
    packageText: 'PyPI 包页面',
    websiteText: '官方文档站',
  },
  license: {
    name: 'MIT',
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
  return {
    ...basePkg,
    version: row.version,
    score: row.score,
    released: row.released,
    author: row.vendor,
    vulnCount: row.vulnCount,
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
  gap: 20px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.hero-left {
  display: flex;
  gap: 16px;
  align-items: center;
}

.hero-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: linear-gradient(145deg, #7c3aed, #5b21b6);
  color: #fff;
  font-size: 28px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hero-title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 700;
  color: #111827;
}

.hero-meta {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}
.dot {
  margin: 0 6px;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
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

.tabs {
  display: flex;
  gap: 8px;
  margin-top: 20px;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 4px;
}

.tab {
  position: relative;
  padding: 12px 16px 14px;
  border: none;
  background: none;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  margin-bottom: -1px;
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

.version-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.version-card {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 66px;
  width: 100%;
  margin: 0;
  padding: 16px 20px;
  text-align: left;
  font: inherit;
  cursor: pointer;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.version-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.version-card__ver {
  font-weight: 700;
  font-size: 15px;
  color: #111827;
  min-width: 5.5rem;
}

.version-card__meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6b7280;
}

.version-card__ico {
  display: inline-flex;
  color: #0d9488;
  flex-shrink: 0;
}

.version-card__author {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  font-size: 14px;
  color: #6b7280;
}

.version-card__author-name {
  font-weight: 500;
}

@media (max-width: 900px) {
  .version-card__author {
    margin-left: 0;
    width: 100%;
  }
}
</style>
