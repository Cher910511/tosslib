<template>
  <div class="toolset-page">
    <!-- Hero -->
    <section class="ts-hero">
      <div class="ts-hero-bg" aria-hidden="true" />
      <div class="ts-hero-body">
        <h1 class="ts-title">工具集</h1>
        <div class="ts-hero-tag">全链路开源治理工具</div>
        <p class="ts-subtitle">从桌面端超级工厂到 IDE 插件，从交互式 Notebook 到标准 API 接口——覆盖开源治理的每一个环节。连接可信开源代码库，一站式完成组件选型、安全扫描、许可证合规与漏洞修复。</p>
      </div>
      <div class="ts-overview">
        <div class="ts-card" @click="scrollTo('sec-factory')">
          <div class="ts-card-header">
            <span class="ts-card-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></span>
            <div><h3 class="ts-card-title">超级工厂</h3><span class="ts-card-badge">桌面端 · Agent 驱动</span></div>
          </div>
          <p class="ts-card-desc">将可信开源代码库的全部能力带到你的桌面。智能 Agent 协助你完成组件选型、许可证合规、漏洞修复等全链路治理工作，无需打开浏览器。</p>
          <span class="ts-card-foot">macOS / Windows / Linux</span>
        </div>
        <div class="ts-card" @click="scrollTo('sec-vscode')">
          <div class="ts-card-header">
            <span class="ts-card-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></span>
            <div><h3 class="ts-card-title">VSCode 插件</h3><span class="ts-card-badge">编辑器 · 侧边栏</span></div>
          </div>
          <p class="ts-card-desc">在 VSCode 中直接使用可信开源代码库的全部能力。安装即用，无需切换窗口，让开源治理融入日常编码流程。</p>
          <span class="ts-card-foot">VSCode / Cursor / Windsurf</span>
        </div>
        <div class="ts-card" @click="scrollTo('sec-notebook')">
          <div class="ts-card-header">
            <span class="ts-card-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/></svg></span>
            <div><h3 class="ts-card-title">Notebook</h3><span class="ts-card-badge">交互式 · Jupyter</span></div>
          </div>
          <p class="ts-card-desc">基于 Jupyter 的在线交互式分析环境。编写 Python 脚本、可视化检测结果、一键生成报告——一切在浏览器中完成。</p>
          <span class="ts-card-foot">Python 3.11 · 浏览器即用</span>
        </div>
      </div>
    </section>

    <!-- 软件超级工厂 -->
    <section id="sec-factory" class="ts-section ts-section--alt">
      <div class="ts-inner">
        <div class="ts-sec-header">
          <h2 class="ts-section-title">软件超级工厂</h2>
          <span class="ts-section-badge">桌面端 Agent</span>
          <p class="ts-section-desc">智能 Agent 驱动，连接可信开源代码库，覆盖开源治理全流程。支持自然语言交互式选型、自动安全扫描与许可证合规检测。</p>
          <div class="ts-tags"><span class="ts-tag">macOS</span><span class="ts-tag">Windows</span><span class="ts-tag">Linux</span></div>
        </div>

        <div class="ts-chat-panel">
          <div class="ts-chat-msg ts-chat-msg--user">
            <div class="ts-chat-bubble">帮我写一个完整的 Web 后台管理系统，用 FastAPI + Vue3 技术栈，要有用户管理、权限控制和数据看板，同时确保所有开源依赖都经过安全审查。</div>
          </div>
          <div class="ts-chat-msg ts-chat-msg--agent">
            <div class="ts-chat-bubble"><div class="ts-chat-think">已连接可信开源代码库，正在生成项目代码并分析依赖...</div></div>
          </div>
          <div class="ts-chat-checklist">
            <div class="ts-chat-checklist-hd">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
              前置准备 · 治理任务分解
            </div>
            <div class="ts-chat-task ts-chat-task--done"><span class="ts-chat-task-icon">✓</span><span>搭建 FastAPI 项目骨架：路由、中间件、数据库连接配置</span></div>
            <div class="ts-chat-task ts-chat-task--done"><span class="ts-chat-task-icon">✓</span><span>扫描项目依赖树，识别 47 个开源组件及版本信息</span></div>
            <div class="ts-chat-task ts-chat-task--done"><span class="ts-chat-task-icon">✓</span><span>生成 Vue3 前端页面：登录、用户列表、权限分配、数据大屏</span></div>
            <div class="ts-chat-task ts-chat-task--active"><span class="ts-chat-task-icon">◷</span><span>许可证冲突检测：分析 GPL / AGPL / Apache / MIT 兼容性矩阵</span></div>
            <div class="ts-chat-task"><span class="ts-chat-task-icon">○</span><span>高危漏洞扫描：同步 CVE / NVD / CNNVD 数据库，标记 CVSS ≥ 7.0 漏洞</span></div>
            <div class="ts-chat-task"><span class="ts-chat-task-icon">○</span><span>编写单元测试：后端 API 全覆盖 + 前端组件测试</span></div>
            <div class="ts-chat-task"><span class="ts-chat-task-icon">○</span><span>SBOM 生成 + 安全替代方案推荐 + 治理报告输出</span></div>
          </div>
          <div class="ts-chat-msg ts-chat-msg--agent">
            <div class="ts-chat-bubble">
              <div class="ts-chat-summary-hd">项目交付总结</div>
              <div class="ts-chat-summary-grid">
                <div class="ts-chat-summary-item"><span class="ts-chat-summary-num">12</span><span class="ts-chat-summary-label">已生成文件</span></div>
                <div class="ts-chat-summary-item"><span class="ts-chat-summary-num">47</span><span class="ts-chat-summary-label">已扫描组件</span></div>
                <div class="ts-chat-summary-item"><span class="ts-chat-summary-num ts-chat-summary-num--warn">2</span><span class="ts-chat-summary-label">许可证冲突</span></div>
                <div class="ts-chat-summary-item"><span class="ts-chat-summary-num ts-chat-summary-num--ok">5</span><span class="ts-chat-summary-label">推荐替代</span></div>
              </div>
            </div>
          </div>
          <div class="ts-chat-input-wrap"><span class="ts-chat-input-hint">继续描述你的治理需求...</span></div>
          <div class="ts-downloads">
            <p class="ts-downloads-desc">支持 macOS、Windows、Linux，一次下载，全平台可用</p>
            <div class="ts-dl-btns">
              <a href="#" class="ts-dl-btn" @click.prevent><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v14m0 0-4-4m4 4 4-4M4 18v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg><span class="ts-dl-text"><small>macOS</small><strong>Intel / Apple Silicon</strong></span></a>
              <a href="#" class="ts-dl-btn" @click.prevent><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v14m0 0-4-4m4 4 4-4M4 18v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg><span class="ts-dl-text"><small>Windows</small><strong>Win 10 / Win 11</strong></span></a>
              <a href="#" class="ts-dl-btn" @click.prevent><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v14m0 0-4-4m4 4 4-4M4 18v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg><span class="ts-dl-text"><small>Linux</small><strong>AppImage / Deb</strong></span></a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- VSCode 插件 -->
    <section id="sec-vscode" class="ts-section ts-section--white">
      <div class="ts-inner">
        <div class="ts-sec-header"><h2 class="ts-section-title">VSCode 侧边栏插件</h2><span class="ts-section-badge">编辑器插件</span></div>
        <p class="ts-section-desc">在 VSCode / Cursor / Windsurf 中直接使用可信开源代码库的全部能力。安装即用，无需切换窗口，让开源治理融入日常编码流程。</p>
        <div class="ts-simple-list">
          <div class="ts-simple-item"><div class="ts-si-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div><div><h4>许可证实时检测</h4><p>对项目中使用的开源组件进行实时许可证扫描，第一时间发现 GPL、AGPL 等强传染性许可证，规避合规风险。覆盖 200+ 许可证类型与冲突矩阵。</p></div></div>
          <div class="ts-simple-item"><div class="ts-si-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div><div><h4>AI 智能选型</h4><p>连接平台可信数据库，根据你的技术栈和需求智能推荐经过安全审核的开源组件。多维度对比评分，杜绝盲目引入。已收录 50,000+ 可信组件。</p></div></div>
          <div class="ts-simple-item"><div class="ts-si-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></div><div><h4>编码辅助与风险高亮</h4><p>在编写代码时实时高亮依赖风险。鼠标悬停查看漏洞详情、CVSS 评分、修复建议，并智能推荐安全替代组件。支持 20+ 编程语言。</p></div></div>
          <div class="ts-simple-item"><div class="ts-si-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div><div><h4>一键漏洞修复</h4><p>检测项目依赖中的已知漏洞，覆盖 CVE / NVD / CNNVD，自动定位风险代码位置，提供经过验证的修复补丁和版本升级建议。</p></div></div>
        </div>
      </div>
    </section>

    <!-- Notebook -->
    <section id="sec-notebook" class="ts-section ts-section--alt">
      <div class="ts-inner">
        <div class="ts-sec-header"><h2 class="ts-section-title">Notebook</h2><span class="ts-section-badge">交互式环境</span></div>
        <p class="ts-section-desc">基于 Jupyter 的在线交互式分析环境。编写 Python 脚本调用平台 API，可视化检测结果，一键生成报告——一切在浏览器中完成。</p>
        <div class="ts-nb-preview-lg">
          <div class="ts-nb-preview-lg-bar"><span class="ts-dot ts-dot--r" /><span class="ts-dot ts-dot--y" /><span class="ts-dot ts-dot--g" /><span class="ts-nb-preview-title">notebook.ipynb</span></div>
          <div class="ts-nb-preview-lg-body">
            <div class="ts-nb-cell ts-nb-cell--md">In [1]: <span class="ts-code-kw">from</span> toss_sdk <span class="ts-code-kw">import</span> <span class="ts-code-fn">Scanner</span></div>
            <div class="ts-nb-cell ts-nb-cell--md">In [2]: scanner = <span class="ts-code-fn">Scanner</span>(<span class="ts-code-str">"my-project"</span>)</div>
            <div class="ts-nb-cell ts-nb-cell--md">In [3]: result = scanner.<span class="ts-code-fn">scan_all</span>()</div>
            <div class="ts-nb-cell ts-nb-cell--out"><span class="ts-nb-out-label">Out [3]:</span> 检测 47 个组件 · 0 高危 · 2 警告</div>
            <div class="ts-nb-cell ts-nb-cell--md">In [4]: result.<span class="ts-code-fn">to_report</span>(<span class="ts-code-str">"report.pdf"</span>)</div>
            <div class="ts-nb-cell ts-nb-cell--out"><span class="ts-nb-out-label">Out [4]:</span> 报告已生成</div>
          </div>
        </div>
        <div class="ts-simple-list ts-simple-list--cols">
          <div class="ts-simple-item"><div class="ts-si-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/></svg></div><div><h4>在线交互式分析</h4><p>基于 Jupyter 内核，支持 Python 3.11 与 SQL，预装 toss_sdk 及常用数据分析库。直接在浏览器中编写和运行代码，调用平台 API 进行组件扫描、漏洞检测与 SBOM 生成。</p></div></div>
          <div class="ts-simple-item"><div class="ts-si-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div><div><h4>交互式可视化</h4><p>内置 Matplotlib、Plotly、ECharts，漏洞分布、许可证占比、依赖关系图实时渲染，支持交互式探索与缩放。</p></div></div>
          <div class="ts-simple-item"><div class="ts-si-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div><h4>报告导出与 API 集成</h4><p>一键导出 PDF/HTML/Markdown 格式治理报告，支持自定义模板与中英文双语。Notebook 与平台治理 API 实时互通，数据自动同步。</p></div></div>
        </div>
      </div>
    </section>

    <div class="ts-footer"><p class="ts-footer-text">工具集 · 持续更新中 · 连接可信开源代码库</p></div>
  </div>
</template>

<script setup>
function scrollTo(id) { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
</script>

<style scoped>
.toolset-page { margin: -24px; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC', 'Microsoft YaHei', sans-serif; background: #fafafa; min-height: calc(100vh + 48px); color: #1a1a1a; -webkit-font-smoothing: antialiased; }

/* Hero */
.ts-hero { position: relative; padding: 60px 64px 48px; background: linear-gradient(160deg, #da203e 0%, #b0152e 100%); overflow: hidden; }
.ts-hero-bg { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 700px 400px at 75% 20%, rgba(255,255,255,0.08) 0%, transparent 60%), radial-gradient(ellipse 400px 250px at 25% 80%, rgba(255,255,255,0.05) 0%, transparent 50%); }
.ts-hero-body { position: relative; z-index: 1; }
.ts-title { font-size: 38px; font-weight: 800; margin: 0 0 14px; color: #fff; letter-spacing: -.02em; line-height: 1.15; }
.ts-hero-tag { display: inline-block; padding: 4px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; color: #fff; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); letter-spacing: .06em; margin-bottom: 16px; }
.ts-subtitle { font-size: 14px; line-height: 1.7; color: rgba(255,255,255,0.55); margin: 0 0 36px; max-width: 640px; font-weight: 400; }
.ts-hero-stats { display: flex; gap: 48px; margin-bottom: 44px; }
.ts-hero-stat { display: flex; flex-direction: column; gap: 4px; }
.ts-hero-stat-num { font-size: 30px; font-weight: 800; color: #fff; font-variant-numeric: tabular-nums; letter-spacing: -.02em; }
.ts-hero-stat-label { font-size: 12px; color: rgba(255,255,255,0.45); letter-spacing: .06em; }

/* Overview cards in hero */
.ts-overview { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
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
.ts-section--alt { background: #fff; }
.ts-section--white { background: #fff; }
.ts-inner { max-width: 1080px; margin: 0 auto; padding: 0 64px; }
.ts-section-title { font-size: 22px; font-weight: 700; color: #0f0f0f; margin: 0 0 8px; letter-spacing: -.01em; }
.ts-section-desc { font-size: 14px; line-height: 1.7; color: #888; margin: 0 0 36px; max-width: 600px; font-weight: 400; }
.ts-sec-header { margin-bottom: 28px; }
.ts-section-badge { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; color: #da203e; background: rgba(218,32,62,0.06); margin-bottom: 10px; letter-spacing: .04em; }
.ts-tags { display: flex; gap: 8px; margin-top: 10px; }
.ts-tag { padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 500; color: #888; background: #f0f0f0; letter-spacing: .03em; }

/* Chat panel */
.ts-chat-panel { max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }
.ts-chat-msg { display: flex; }
.ts-chat-msg--user { justify-content: flex-end; }
.ts-chat-bubble { max-width: 85%; padding: 12px 16px; border-radius: 12px; font-size: 13px; line-height: 1.6; }
.ts-chat-msg--user .ts-chat-bubble { background: #da203e; color: #fff; border-bottom-right-radius: 4px; }
.ts-chat-msg--agent .ts-chat-bubble { background: #fff; color: #333; border: 1px solid #eee; border-bottom-left-radius: 4px; }
.ts-chat-think { color: #999; font-style: italic; font-size: 12px; }
.ts-chat-checklist { background: #fff; border: 1px solid #eee; border-radius: 10px; padding: 16px 20px; }
.ts-chat-checklist-hd { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #333; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0; }
.ts-chat-checklist-hd svg { color: #da203e; }
.ts-chat-task { display: flex; align-items: center; gap: 10px; padding: 5px 0; font-size: 12px; color: #666; }
.ts-chat-task-icon { width: 18px; text-align: center; font-size: 11px; flex-shrink: 0; color: #ccc; }
.ts-chat-task--done .ts-chat-task-icon { color: #28c840; }
.ts-chat-task--done span:last-child { color: #aaa; text-decoration: line-through; }
.ts-chat-task--active .ts-chat-task-icon { color: #da203e; animation: spin 1.5s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.ts-chat-summary-hd { font-size: 13px; font-weight: 600; color: #333; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f0f0f0; }
.ts-chat-summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.ts-chat-summary-item { text-align: center; padding: 10px 0; }
.ts-chat-summary-num { display: block; font-size: 22px; font-weight: 700; color: #333; font-variant-numeric: tabular-nums; }
.ts-chat-summary-num--warn { color: #e5a850; }
.ts-chat-summary-num--err { color: #e05555; }
.ts-chat-summary-num--ok { color: #28c840; }
.ts-chat-summary-label { font-size: 11px; color: #aaa; margin-top: 2px; }
.ts-chat-input-wrap { background: #fff; border: 1px solid #e0e0e0; border-radius: 10px; padding: 12px 16px; }
.ts-chat-input-hint { font-size: 12px; color: #ccc; }

/* Downloads */
.ts-downloads { margin-top: 8px; padding: 14px 18px; border-radius: 10px; background: #fff; border: 1px solid #eee; }
.ts-downloads-desc { font-size: 11px; color: #bbb; margin: 0 0 10px; text-align: center; }
.ts-dl-btns { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
.ts-dl-btn { display: inline-flex; align-items: center; gap: 10px; padding: 6px 14px; border-radius: 6px; background: #fafafa; border: 1px solid #e8e8e8; text-decoration: none; transition: border-color .2s, box-shadow .2s; }
.ts-dl-btn:hover { border-color: #da203e; box-shadow: 0 2px 10px rgba(218,32,62,0.06); }
.ts-dl-btn svg { color: #da203e; }
.ts-dl-text { display: flex; flex-direction: column; gap: 1px; }
.ts-dl-text small { font-size: 10px; color: #aaa; font-weight: 500; letter-spacing: .04em; }
.ts-dl-text strong { font-size: 12px; color: #1a1a1a; font-weight: 600; }

/* Simple list */
.ts-simple-list { display: flex; flex-direction: column; gap: 1px; background: #eee; border-radius: 10px; overflow: hidden; border: 1px solid #eee; }
.ts-simple-list--cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; }
.ts-simple-item { padding: 20px 24px; background: #fff; display: flex; gap: 14px; align-items: flex-start; }
.ts-si-icon { width: 36px; height: 36px; border-radius: 8px; background: rgba(218,32,62,0.06); color: #da203e; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ts-simple-item h4 { font-size: 14px; font-weight: 600; color: #0f0f0f; margin: 0 0 6px; letter-spacing: -.01em; }
.ts-simple-item p { font-size: 12px; line-height: 1.65; color: #999; margin: 0; }

/* Notebook preview */
.ts-nb-preview-lg { border-radius: 10px; overflow: hidden; background: #fafafa; border: 1px solid #eee; margin-bottom: 24px; }
.ts-nb-preview-lg-bar { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #fff; border-bottom: 1px solid #eee; }
.ts-nb-preview-lg-body { padding: 14px 18px; display: flex; flex-direction: column; gap: 7px; font-family: 'SF Mono', 'JetBrains Mono', 'Consolas', monospace; font-size: 12px; line-height: 1.7; }
.ts-dot { width: 8px; height: 8px; border-radius: 50%; }
.ts-dot--r { background: #ff5f57; }
.ts-dot--y { background: #febc2e; }
.ts-dot--g { background: #28c840; }
.ts-nb-preview-title { margin-left: 6px; font-size: 11px; color: #bbb; }
.ts-nb-cell { padding: 4px 8px; border-radius: 3px; }
.ts-nb-cell--md { color: #555; }
.ts-nb-cell--out { color: #888; padding-left: 24px; }
.ts-nb-out-label { color: #ccc; margin-right: 6px; }
.ts-code-kw { color: #c792ea; }
.ts-code-fn { color: #82aaff; }
.ts-code-str { color: #c3e88d; }

/* Footer */
.ts-footer { padding: 36px 0; text-align: center; }
.ts-footer-text { font-size: 12px; color: #ccc; margin: 0; letter-spacing: .04em; }

/* Responsive */
@media (max-width: 1024px) {
  .ts-overview { grid-template-columns: 1fr; }
  .ts-hero { padding: 40px 32px 36px; }
  .ts-inner { padding: 0 32px; }
}
@media (max-width: 768px) {
  .ts-hero { padding: 32px 20px 28px; }
  .ts-title { font-size: 26px; }
  .ts-inner { padding: 0 20px; }
  .ts-hero-stats { gap: 28px; }
  .ts-hero-stat-num { font-size: 22px; }
  .ts-overview, .ts-simple-list--cols { grid-template-columns: 1fr; }
  .ts-dl-btns { flex-direction: column; align-items: center; }
  .ts-section { padding: 40px 0; }
  .ts-section-title { font-size: 19px; }
}
</style>
