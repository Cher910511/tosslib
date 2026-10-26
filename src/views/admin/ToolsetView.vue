<template>
  <div class="toolset-page">
    <!-- Hero -->
    <section class="ts-hero">
      <div class="ts-hero-bg" aria-hidden="true" />
      <div class="ts-hero-body">
        <h1 class="ts-title">工具集</h1>
        <div class="ts-hero-tag">全链路开源治理工具</div>
        <p class="ts-subtitle">
          从桌面端与编辑器插件，到本地开源软件盘点，再到浏览器中即可完成的在线工具——覆盖开源治理的每一个环节。连接可信开源代码库，一站式完成组件选型、安全扫描、许可证合规与物料清单生成。
        </p>
      </div>
      <div class="ts-overview">
        <div class="ts-card" @click="scrollTo('sec-download')">
          <div class="ts-card-header">
            <span class="ts-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v12m0 0-4-4m4 4 4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>
            </span>
            <div>
              <h3 class="ts-card-title">工具下载</h3>
              <span class="ts-card-badge">桌面端 · 编辑器插件 · 本地工具</span>
            </div>
          </div>
          <p class="ts-card-desc">下载安装包，在本地完成开源治理。支持超级工厂、VSCode 插件与开源软件摸底工具，覆盖 macOS、Windows、Linux。</p>
          <span class="ts-card-foot">{{ DOWNLOAD_TOOLS.length }} 个工具 · 安装包下载</span>
        </div>
        <div class="ts-card" @click="scrollTo('sec-online')">
          <div class="ts-card-header">
            <span class="ts-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18"/></svg>
            </span>
            <div>
              <h3 class="ts-card-title">在线工具</h3>
              <span class="ts-card-badge">浏览器即用 · 无需安装</span>
            </div>
          </div>
          <p class="ts-card-desc">打开网页即可使用的在线能力，无需下载安装。包括软件物料清单生成等工具，并持续接入更多在线服务。</p>
          <span class="ts-card-foot">{{ ONLINE_TOOLS.length }} 个工具 · 持续接入中</span>
        </div>
      </div>
    </section>

    <!-- 模块一：工具下载 -->
    <section id="sec-download" class="ts-section ts-section--white">
      <div class="ts-inner">
        <div class="ts-sec-header">
          <div class="ts-sec-index">01</div>
          <h2 class="ts-section-title">工具下载</h2>
          <span class="ts-section-badge">安装包 · 本地运行</span>
          <p class="ts-section-desc">
            下载并安装到本地，在桌面端、编辑器中或本机环境中完成开源治理。所有工具均支持 macOS、Windows 与 Linux。
          </p>
        </div>

        <div class="ts-dl-list">
          <article
            v-for="tool in DOWNLOAD_TOOLS"
            :key="tool.key"
            class="ts-dl-card"
            :class="{ 'ts-dl-card--editions': tool.editions }"
          >
            <div class="ts-dl-main">
              <div class="ts-si-icon ts-si-icon--lg" v-html="tool.icon" />
              <div class="ts-dl-info">
                <h4 class="ts-dl-name">
                  {{ tool.name }}
                  <span v-if="tool.isNew" class="ts-new-badge">NEW</span>
                </h4>
                <p class="ts-si-sub">{{ tool.subtitle }}</p>
                <p class="ts-dl-desc">{{ tool.desc }}</p>
              </div>
            </div>
            <!-- 带版本区分的工具（在线版 / 离线版） -->
            <div v-if="tool.editions" class="ts-dl-editions">
              <div v-for="ed in tool.editions" :key="ed.key" class="ts-dl-edition">
                <div class="ts-ed-hd">
                  <span class="ts-ed-name">{{ ed.label }}</span>
                  <span class="ts-ed-tag" :class="'ts-ed-tag--' + ed.key">{{ ed.tag }}</span>
                </div>
                <p class="ts-ed-desc">{{ ed.desc }}</p>
                <div class="ts-dl-btns">
                  <a
                    v-for="p in ed.platforms"
                    :key="p.os"
                    href="#"
                    class="ts-dl-btn"
                    @click.prevent
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v14m0 0-4-4m4 4 4-4M4 18v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>
                    <span class="ts-dl-text">
                      <small>{{ p.os }}</small>
                      <strong>{{ p.detail }}</strong>
                    </span>
                  </a>
                </div>
              </div>
            </div>

            <!-- 单一形态的工具 -->
            <div v-else class="ts-dl-btns">
              <a
                v-for="p in tool.platforms"
                :key="p.os"
                href="#"
                class="ts-dl-btn"
                @click.prevent
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v14m0 0-4-4m4 4 4-4M4 18v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>
                <span class="ts-dl-text">
                  <small>{{ p.os }}</small>
                  <strong>{{ p.detail }}</strong>
                </span>
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- 模块二：在线工具 -->
    <section id="sec-online" class="ts-section">
      <div class="ts-inner">
        <div class="ts-sec-header">
          <div class="ts-sec-index">02</div>
          <h2 class="ts-section-title">在线工具</h2>
          <span class="ts-section-badge">浏览器即用</span>
          <p class="ts-section-desc">
            平台集成实用工具，满足不同场景下的使用需求，无需安装，点击即可直接使用。
          </p>
        </div>

        <div class="ts-online-grid">
          <article
            v-for="tool in ONLINE_TOOLS"
            :key="tool.key"
            class="ts-online-card"
            role="link"
            tabindex="0"
            @click="openOnlineTool(tool)"
            @keydown.enter="openOnlineTool(tool)"
            @keydown.space.prevent="openOnlineTool(tool)"
          >
            <div class="ts-online-hd">
              <span class="ts-tool-icon ts-tool-icon--online" v-html="tool.icon" />
              <span class="ts-online-flag">在线</span>
            </div>
            <h3 class="ts-online-title">{{ tool.name }}</h3>
            <p class="ts-online-desc">{{ tool.desc }}</p>
            <div class="ts-online-foot">
              <span class="ts-online-tags">
                <span v-for="tag in tool.tags" :key="tag" class="ts-tag ts-tag--sm">{{ tag }}</span>
              </span>
              <span class="ts-online-enter">进入 →</span>
            </div>
          </article>

          <!-- 占位：后续在线工具接入 -->
          <div class="ts-online-card ts-online-card--soon">
            <span class="ts-soon-icon">+</span>
            <h3 class="ts-online-title">更多在线工具</h3>
            <p class="ts-online-desc">在线能力持续接入中，后续将陆续上线更多无需安装的在线工具。</p>
            <div class="ts-online-foot">
              <span class="ts-online-tags"><span class="ts-tag ts-tag--sm">敬请期待</span></span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="ts-footer"><p class="ts-footer-text">工具集 · 持续更新中 · 连接可信开源代码库</p></div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

/* ============================================================
 * 工具下载（安装包类工具）
 * 新增工具：在 DOWNLOAD_TOOLS 中追加一项即可，卡片自动渲染
 * ============================================================ */
const DOWNLOAD_TOOLS = [
  {
    key: 'factory',
    name: '软件超级工厂',
    subtitle: '桌面端 · Agent 驱动',
    isNew: false,
    desc: '将可信开源代码库的全部能力带到你的桌面。智能 Agent 协助你完成组件选型、许可证合规、漏洞修复与 SBOM 生成等全链路治理工作，无需打开浏览器。',
    platforms: [
      { os: 'macOS', detail: 'Intel / Apple Silicon' },
      { os: 'Windows', detail: 'Win 10 / Win 11' },
      { os: 'Linux', detail: 'AppImage / Deb' },
    ],
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  },
  {
    key: 'vscode',
    name: 'VSCode 插件',
    subtitle: '编辑器 · 侧边栏',
    isNew: false,
    desc: '在 VSCode / Cursor / Windsurf 中直接使用可信开源代码库的全部能力。安装即用，无需切换窗口，让许可证检测、漏洞扫描与智能选型融入日常编码流程。',
    platforms: [
      { os: 'VSCode', detail: 'Marketplace 安装' },
      { os: 'Cursor', detail: '扩展导入' },
      { os: 'Windsurf', detail: 'Open VSX' },
    ],
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
  },
  {
    key: 'survey',
    name: '开源软件摸底工具',
    subtitle: '桌面端 · 本地盘点 · 联网校验',
    isNew: true,
    desc: '扫描本地代码仓库，自动识别正在使用的开源软件及版本，并校验其是否已纳入可信开源代码库管理。支持在线版与离线版，适配不同网络环境。',
    editions: [
      {
        key: 'online',
        label: '在线版',
        tag: '需联网',
        desc: '识别本地软件及版本信息，并通过接口实时比对可信软件库数据。',
        platforms: [
          { os: 'Windows', detail: 'Win 10 / Win 11 · x64' },
          { os: 'macOS', detail: 'Intel / Apple Silicon' },
        ],
      },
      {
        key: 'offline',
        label: '离线版',
        tag: '免联网',
        desc: '内置软件数据，无需联网即可完成比对与识别，适用于内网隔离、无外网等场景。',
        platforms: [
          { os: 'Windows 7', detail: 'Win 7 SP1 · x86 / x64' },
          { os: 'Windows', detail: 'Win 10 / Win 11 · x64' },
          { os: 'macOS', detail: 'Intel / Apple Silicon' },
        ],
      },
    ],
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6.5"/><line x1="15.5" y1="15.5" x2="21" y2="21"/><path d="M7.5 10.5h6"/><path d="M10.5 7.5v6"/></svg>',
  },
]

/* ============================================================
 * 在线工具（浏览器内打开，跳转到工具集下的子页面）
 * 新增工具：在 ONLINE_TOOLS 中追加一项并补充 route 即可
 * ============================================================ */
const ONLINE_TOOLS = [
  {
    key: 'sbom',
    name: '软件物料清单生成',
    desc: '上传源码包，自动解析依赖关系并生成符合 SPDX / CycloneDX 标准的软件物料清单，支持多格式导出、许可证分析与漏洞查看。',
    tags: ['SPDX', 'CycloneDX', '多格式导出'],
    route: { name: 'sbom-generate' },
    icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="13" y2="16"/></svg>',
  },
]

function openOnlineTool(tool) {
  if (tool.route) router.push(tool.route)
}

function scrollTo(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<style scoped>
.toolset-page { margin: -24px; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC', 'Microsoft YaHei', sans-serif; background: #fafafa; min-height: calc(100vh + 48px); color: #1a1a1a; -webkit-font-smoothing: antialiased; }

/* Hero */
.ts-hero { position: relative; padding: 60px 64px 48px; background: linear-gradient(160deg, #da203e 0%, #b0152e 100%); overflow: hidden; }
.ts-hero-bg { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 700px 400px at 75% 20%, rgba(255,255,255,0.08) 0%, transparent 60%), radial-gradient(ellipse 400px 250px at 25% 80%, rgba(255,255,255,0.05) 0%, transparent 50%); }
.ts-hero-body { position: relative; z-index: 1; }
.ts-title { font-size: 38px; font-weight: 800; margin: 0 0 14px; color: #fff; letter-spacing: -.02em; line-height: 1.15; }
.ts-hero-tag { display: inline-block; padding: 4px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; color: #fff; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); letter-spacing: .06em; margin-bottom: 16px; }
.ts-subtitle { font-size: 14px; line-height: 1.7; color: rgba(255,255,255,0.55); margin: 0 0 36px; max-width: 680px; font-weight: 400; }

/* Overview cards in hero */
.ts-overview { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.ts-card { padding: 24px; border-radius: 10px; background: rgba(255,255,255,0.1); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.12); cursor: pointer; transition: background .2s, border-color .2s; display: flex; flex-direction: column; }
.ts-card:hover { background: rgba(255,255,255,0.16); border-color: rgba(255,255,255,0.25); }
.ts-card-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
.ts-card-icon { width: 40px; height: 40px; border-radius: 10px; background: rgba(255,255,255,0.15); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ts-card-title { font-size: 15px; font-weight: 700; color: #fff; margin: 0 0 2px; letter-spacing: -.01em; }
.ts-card-badge { font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.55); }
.ts-card-desc { font-size: 12px; line-height: 1.6; color: rgba(255,255,255,0.55); margin: 0 0 auto; flex: 1; }
.ts-card-foot { display: block; margin-top: 14px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: rgba(255,255,255,0.35); letter-spacing: .03em; }

/* Sections */
.ts-section { padding: 56px 0; background: #fafafa; }
.ts-section--white { background: #fff; }
.ts-inner { max-width: 1080px; margin: 0 auto; padding: 0 64px; }
.ts-sec-header { margin-bottom: 28px; }
.ts-sec-index { font-size: 12px; font-weight: 700; color: #da203e; letter-spacing: .12em; margin-bottom: 8px; font-variant-numeric: tabular-nums; }
.ts-section-title { font-size: 22px; font-weight: 700; color: #0f0f0f; margin: 0 0 8px; letter-spacing: -.01em; }
.ts-section-desc { font-size: 14px; line-height: 1.7; color: #888; margin: 0; max-width: 640px; font-weight: 400; }
.ts-section-badge { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; color: #da203e; background: rgba(218,32,62,0.06); margin-bottom: 10px; letter-spacing: .04em; }
.ts-tag { padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 500; color: #888; background: #f0f0f0; letter-spacing: .03em; }
.ts-tag--sm { font-size: 10px; padding: 2px 8px; }

/* 工具下载大卡片 */
.ts-dl-list { display: flex; flex-direction: column; gap: 14px; }
.ts-dl-card { display: flex; align-items: flex-start; justify-content: space-between; gap: 28px; padding: 24px 28px; background: #fff; border: 1px solid #eee; border-radius: 10px; transition: border-color .2s, box-shadow .2s; }
.ts-dl-card:hover { border-color: rgba(218,32,62,0.3); box-shadow: 0 4px 18px rgba(0,0,0,0.05); }
.ts-dl-main { display: flex; gap: 16px; flex: 1; min-width: 0; }
.ts-si-icon { width: 36px; height: 36px; border-radius: 8px; background: rgba(218,32,62,0.06); color: #da203e; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ts-si-icon--lg { width: 46px; height: 46px; border-radius: 10px; }
.ts-dl-info { min-width: 0; }
.ts-dl-name { display: flex; align-items: center; gap: 7px; font-size: 16px; font-weight: 700; color: #0f0f0f; margin: 0 0 4px; letter-spacing: -.01em; }
.ts-si-sub { font-size: 11px; color: #b5b5b5; margin: 0 0 8px !important; letter-spacing: .02em; }
.ts-dl-desc { font-size: 12.5px; line-height: 1.7; color: #999; margin: 0; max-width: 620px; }
.ts-new-badge { padding: 1px 6px; border-radius: 3px; font-size: 9px; font-weight: 700; color: #fff; background: #da203e; letter-spacing: .06em; }

/* 带在线版/离线版的工具卡片：内容在上，两个版本并排在下 */
.ts-dl-card--editions { flex-direction: column; align-items: stretch; gap: 0; }
.ts-dl-editions { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; width: 100%; margin-top: 18px; padding-top: 16px; border-top: 1px solid #f4f4f4; }
.ts-dl-edition { display: flex; flex-direction: column; gap: 8px; padding: 16px 18px; background: #fafbfc; border: 1px solid #f0f1f3; border-radius: 8px; }
.ts-ed-hd { display: flex; align-items: center; gap: 8px; }
.ts-ed-name { font-size: 13px; font-weight: 700; color: #0f0f0f; }
.ts-ed-tag { padding: 1px 7px; border-radius: 3px; font-size: 9.5px; font-weight: 600; letter-spacing: .04em; }
.ts-ed-tag--online { color: #2f9e57; background: rgba(47,158,87,0.1); }
.ts-ed-tag--offline { color: #c98a2e; background: rgba(229,168,80,0.12); }
.ts-ed-desc { font-size: 11.5px; line-height: 1.65; color: #9ca3af; margin: 0 0 2px; }
.ts-dl-edition .ts-dl-btns { flex-direction: row; flex-wrap: wrap; gap: 8px; }
.ts-dl-edition .ts-dl-btn { flex: 1 1 auto; min-width: 150px; background: #fff; }

/* Download buttons */
.ts-dl-btns { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }
.ts-dl-btn { display: inline-flex; align-items: center; gap: 9px; padding: 6px 14px; border-radius: 6px; background: #fafafa; border: 1px solid #ececec; text-decoration: none; transition: border-color .2s, box-shadow .2s, background .2s; min-width: 178px; box-sizing: border-box; }
.ts-dl-btn:hover { border-color: #da203e; background: #fff; box-shadow: 0 2px 10px rgba(218,32,62,0.08); }
.ts-dl-btn svg { color: #da203e; flex-shrink: 0; }
.ts-dl-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.ts-dl-text small { font-size: 10px; color: #aaa; font-weight: 500; letter-spacing: .03em; }
.ts-dl-text strong { font-size: 11.5px; color: #1a1a1a; font-weight: 600; white-space: nowrap; }

/* 在线工具卡片 */
.ts-online-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.ts-online-card { display: flex; flex-direction: column; padding: 22px; border-radius: 10px; background: #fff; border: 1px solid #eee; cursor: pointer; outline: none; transition: border-color .2s, box-shadow .2s, transform .2s; }
.ts-online-card:hover, .ts-online-card:focus-visible { border-color: rgba(218,32,62,0.4); box-shadow: 0 6px 24px rgba(0,0,0,0.07); transform: translateY(-2px); }
.ts-online-card:hover .ts-online-enter { color: #da203e; }
.ts-online-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.ts-tool-icon--online { width: 38px; height: 38px; border-radius: 10px; background: rgba(218,32,62,0.07); color: #da203e; display: flex; align-items: center; justify-content: center; }
.ts-online-flag { padding: 2px 8px; border-radius: 3px; font-size: 10px; font-weight: 600; color: #2f9e57; background: rgba(47,158,87,0.08); letter-spacing: .04em; }
.ts-online-title { font-size: 15px; font-weight: 700; color: #0f0f0f; margin: 0 0 8px; letter-spacing: -.01em; }
.ts-online-desc { font-size: 12px; line-height: 1.7; color: #999; margin: 0 0 auto; }
.ts-online-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 16px; padding-top: 14px; border-top: 1px solid #f2f2f2; }
.ts-online-tags { display: flex; gap: 5px; flex-wrap: wrap; }
.ts-online-enter { font-size: 11px; font-weight: 600; color: #c9c9c9; white-space: nowrap; transition: color .2s; }
.ts-online-card--soon { cursor: default; border-style: dashed; background: #fcfcfc; }
.ts-online-card--soon:hover { border-color: #e5e5e5; box-shadow: none; transform: none; }
.ts-soon-icon { width: 38px; height: 38px; margin-bottom: 14px; border-radius: 10px; background: #f4f4f4; color: #c9c9c9; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 300; }
.ts-online-card--soon .ts-online-title { color: #b5b5b5; }
.ts-online-card--soon .ts-online-desc { color: #c9c9c9; }

/* Footer */
.ts-footer { padding: 36px 0; text-align: center; }
.ts-footer-text { font-size: 12px; color: #ccc; margin: 0; letter-spacing: .04em; }

/* Responsive */
@media (max-width: 1100px) {
  .ts-online-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 1024px) {
  .ts-overview { grid-template-columns: 1fr; }
  .ts-hero { padding: 40px 32px 36px; }
  .ts-inner { padding: 0 32px; }
}
@media (max-width: 768px) {
  .ts-hero { padding: 32px 20px 28px; }
  .ts-title { font-size: 26px; }
  .ts-inner { padding: 0 20px; }
  .ts-overview, .ts-online-grid { grid-template-columns: 1fr; }
  .ts-dl-card { flex-direction: column; gap: 16px; }
  .ts-dl-editions { grid-template-columns: 1fr; }
  .ts-dl-btns { width: 100%; }
  .ts-dl-btn { width: 100%; }
  .ts-dl-edition .ts-dl-btns { flex-direction: column; }
  .ts-dl-edition .ts-dl-btn { min-width: 0; }
  .ts-section { padding: 40px 0; }
  .ts-section-title { font-size: 19px; }
}
</style>
