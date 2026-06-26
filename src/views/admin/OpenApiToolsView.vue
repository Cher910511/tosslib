<template>
  <div class="api-landing">
    <!-- ========== 顶部横幅 ========== -->
    <div class="api-banner">
      <div class="banner-bg" aria-hidden="true">
        <div class="bg-orbe o1" />
        <div class="bg-orbe o2" />
        <div class="bg-orbe o3" />
      </div>

      <!-- 左侧大插画 -->
      <div class="banner-illus" aria-hidden="true">
        <svg viewBox="15 20 355 145" fill="none" xmlns="http://www.w3.org/2000/svg" class="illus-svg">
          <g class="server-group">
            <rect x="24" y="50" width="52" height="72" rx="6" fill="#da203e" fill-opacity="0.04" stroke="#da203e" stroke-width="1.5" stroke-opacity="0.2"/>
            <rect x="24" y="50" width="52" height="4" rx="2" fill="#da203e" fill-opacity="0.3"/>
            <rect x="32" y="62" width="36" height="4" rx="2" fill="#da203e" fill-opacity="0.1"/>
            <rect x="32" y="71" width="36" height="4" rx="2" fill="#da203e" fill-opacity="0.08"/>
            <rect x="32" y="80" width="24" height="4" rx="2" fill="#da203e" fill-opacity="0.06"/>
            <rect x="40" y="94" width="8" height="8" rx="2" fill="#da203e" fill-opacity="0.6"/>
            <rect x="52" y="94" width="8" height="8" rx="2" fill="#22c55e" fill-opacity="0.6"/>
          </g>
          <g class="line-group">
            <path d="M76 86h20" stroke="#da203e" stroke-width="1.5" stroke-dasharray="4 3" stroke-opacity="0.3"/>
            <circle cx="100" cy="86" r="4" fill="#da203e" fill-opacity="0.5">
              <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite"/>
            </circle>
          </g>
          <g class="server-main">
            <rect x="108" y="30" width="80" height="120" rx="10" fill="#da203e" fill-opacity="0.04" stroke="#da203e" stroke-width="2" stroke-opacity="0.3"/>
            <rect x="108" y="30" width="80" height="6" rx="3" fill="#da203e" fill-opacity="0.35"/>
            <rect x="120" y="46" width="56" height="50" rx="6" fill="#da203e" fill-opacity="0.04"/>
            <rect x="120" y="106" width="56" height="4" rx="2" fill="#da203e" fill-opacity="0.08"/>
            <rect x="120" y="115" width="44" height="4" rx="2" fill="#da203e" fill-opacity="0.06"/>
            <rect x="120" y="124" width="50" height="4" rx="2" fill="#da203e" fill-opacity="0.05"/>
            <rect x="120" y="133" width="38" height="4" rx="2" fill="#da203e" fill-opacity="0.04"/>
            <circle cx="148" cy="71" r="14" fill="#da203e" fill-opacity="0.1"/>
            <path d="M143 71h10M148 66v10" stroke="#da203e" stroke-width="2" stroke-opacity="0.5"/>
            <circle cx="130" cy="97" r="3" fill="#22c55e" fill-opacity="0.6">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="142" cy="97" r="3" fill="#22c55e" fill-opacity="0.5">
              <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="154" cy="97" r="3" fill="#22c55e" fill-opacity="0.4">
              <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2s" repeatCount="indefinite"/>
            </circle>
          </g>
          <g class="line-group-2">
            <path d="M188 90h18" stroke="#da203e" stroke-width="1.5" stroke-dasharray="4 3" stroke-opacity="0.3"/>
            <circle cx="210" cy="90" r="3" fill="#da203e" fill-opacity="0.4">
              <animate attributeName="opacity" values="0.1;0.5;0.1" dur="2.5s" repeatCount="indefinite"/>
            </circle>
            <path d="M213 87l6 3-6 3" stroke="#da203e" stroke-width="1.5" stroke-opacity="0.35"/>
          </g>
          <g class="server-right">
            <rect x="224" y="60" width="42" height="52" rx="5" fill="#da203e" fill-opacity="0.04" stroke="#da203e" stroke-width="1.5" stroke-opacity="0.15"/>
            <rect x="232" y="70" width="26" height="4" rx="2" fill="#da203e" fill-opacity="0.1"/>
            <rect x="232" y="79" width="26" height="4" rx="2" fill="#da203e" fill-opacity="0.08"/>
            <rect x="232" y="88" width="16" height="4" rx="2" fill="#da203e" fill-opacity="0.06"/>
          </g>
          <g class="bus-group">
            <path d="M50 132h220" stroke="#da203e" stroke-width="1" stroke-dasharray="3 5" stroke-opacity="0.12"/>
            <path d="M50 142h220" stroke="#da203e" stroke-width="1" stroke-dasharray="5 4" stroke-opacity="0.08"/>
            <path d="M50 152h220" stroke="#da203e" stroke-width="1" stroke-dasharray="2 6" stroke-opacity="0.06"/>
          </g>
          <circle r="3" fill="#da203e" opacity="0.5">
            <animateMotion dur="3s" repeatCount="indefinite" path="M50,137 L270,137"/>
          </circle>
          <circle r="2" fill="#da203e" opacity="0.35">
            <animateMotion dur="4s" repeatCount="indefinite" path="M50,147 L270,147"/>
          </circle>
          <g class="deco-dots">
            <circle cx="290" cy="45" r="3" fill="#da203e" fill-opacity="0.12"><animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite"/></circle>
            <circle cx="310" cy="55" r="2" fill="#da203e" fill-opacity="0.08"><animate attributeName="r" values="2;4;2" dur="2.5s" repeatCount="indefinite"/></circle>
            <circle cx="280" cy="70" r="2.5" fill="#da203e" fill-opacity="0.1"><animate attributeName="r" values="2.5;4.5;2.5" dur="3.5s" repeatCount="indefinite"/></circle>
            <circle cx="300" cy="80" r="2" fill="#da203e" fill-opacity="0.06"><animate attributeName="r" values="2;3.5;2" dur="2s" repeatCount="indefinite"/></circle>
          </g>
          <g class="mini-icons">
            <text x="295" y="110" font-size="14" fill="#da203e" opacity="0.15">🔒</text>
            <text x="310" y="125" font-size="12" fill="#da203e" opacity="0.1">📊</text>
            <text x="325" y="110" font-size="10" fill="#da203e" opacity="0.12">⚡</text>
            <text x="340" y="130" font-size="13" fill="#da203e" opacity="0.08">🔌</text>
            <text x="355" y="105" font-size="11" fill="#da203e" opacity="0.1">📋</text>
          </g>
        </svg>
      </div>

      <!-- 右边文字 -->
      <div class="banner-text">
        <div class="banner-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          开放接口 · 高效集成
          <span class="badge-dot" />
        </div>
        <h1 class="banner-title">OpenAPI</h1>
        <p class="banner-desc">
          提供标准 RESTful API 接口，覆盖软件组成分析、漏洞检测、许可证合规、SBOM 生成等核心场景。
          即插即用，快速集成到你的研发流水线中。
        </p>
      </div>
    </div>

    <!-- ========== 工具卡片网格 ========== -->
    <div class="cards-section">
      <!-- 弥散光晕 -->
      <div class="halo halo--lt" aria-hidden="true" />
      <div class="halo halo--rb" aria-hidden="true" />
      <!-- 点状网格纹理 -->
      <div class="dot-grid" aria-hidden="true" />

      <div class="cards-section-inner">
        <div class="section-header">
          <p class="section-desc">{{ tools.length }} 个开放接口，覆盖从检测到治理的完整链路</p>
        </div>

        <div class="api-grid">
          <div v-for="(t, idx) in tools" :key="t.name" class="api-card" :style="{ '--i': idx }">
            <div class="card-overlay">
              <span class="card-overlay-btn">即将上线</span>
            </div>

            <div class="card-icon">{{ t.icon }}</div>
            <div class="card-top-row">
              <h3 class="card-name">{{ t.name }}</h3>
              <span class="card-tier" :class="'ct-' + t.tierType">{{ t.tier }}</span>
            </div>

            <div class="card-subtags">
              <span v-for="tag in t.tags" :key="tag" class="card-subtag">{{ tag }}</span>
            </div>

            <div class="card-sep" />

            <p class="card-desc">{{ t.desc }}</p>

            <div class="card-tags">
              <span v-for="f in t.features" :key="f" class="card-tag">{{ f }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 底部特征条 ========== -->
    <div class="api-footer">
      <div class="footer-inner">
        <div class="footer-features">
          <div v-for="f in footerFeatures" :key="f.label" class="ff-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <span>{{ f.label }}</span>
          </div>
        </div>
        <p class="footer-info">基于 OpenAPI 3.0 规范 · RESTful 接口 · JSON 响应</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const tools = [
  { icon: '🔌', name: 'SCA 扫描 API', tier: '免费', tierType: 'free', desc: '提供软件组成分析扫描接口，支持上传软件包自动识别组件清单、许可证信息及依赖关系。', features: ['自动识别组件清单', '多语言支持', '依赖树分析'], tags: ['7×24 技术支持', 'SLA 99.9%'] },
  { icon: '🔒', name: '漏洞预警 API', tier: '热门', tierType: 'hot', desc: '基于 CVE/NVD 数据库实时检测软件漏洞，支持 CVSS 评分、影响范围分析及修复建议。', features: ['实时 CVE 匹配', 'CVSS 评分', '修复建议'], tags: ['实时更新', '专业维护'] },
  { icon: '📋', name: 'SBOM 生成 API', tier: '免费', tierType: 'free', desc: '根据软件物料清单标准（SPDX/CycloneDX）自动生成 SBOM 文件，支持多种格式导出。', features: ['SPDX 标准', 'CycloneDX', '多格式导出'], tags: ['标准合规', '一键生成'] },
  { icon: '💬', name: 'AI 智能选型助手 API', tier: '内测', tierType: 'beta', desc: '集成大语言模型能力，提供代码审查、安全缺陷修复建议及自动化注释生成。', features: ['代码审查', '缺陷修复', '注释生成'], tags: ['大模型驱动', '智能提效'] },
  { icon: '⚖️', name: '开源合规 API', tier: '免费', tierType: 'free', desc: '提供开源许可证法律文本解析、合规条款匹配及风险等级评估服务。', features: ['条款解析', '风险评级', '合规报告'], tags: ['法律级保障', '专家支持'] },
  { icon: '🤖', name: '恶意代码检测 API', tier: '热门', tierType: 'hot', desc: '基于静态分析与行为沙箱技术，检测软件包中潜在的恶意代码和后门程序。', features: ['静态分析', '沙箱检测', '风险标记'], tags: ['深度检测', '零误报优化'] },
  { icon: '🔍', name: '组件搜索 API', tier: '免费', tierType: 'free', desc: '提供高性能开源组件索引服务，支持按名称、版本、语言等多维度检索。', features: ['多维检索', '版本追踪', '依赖查询'], tags: ['海量索引', '毫秒响应'] },
  { icon: '📄', name: '报告生成 API', tier: '免费', tierType: 'free', desc: '自动生成 PDF/HTML 格式的安全检测报告，支持自定义模板和批量导出。', features: ['PDF 导出', 'HTML 导出', '自定义模板'], tags: ['多格式支持', '模板定制'] },
]

const footerFeatures = [
  { label: 'HTTPS 加密传输' },
  { label: 'API Key 认证' },
  { label: '频率限制保护' },
  { label: '7×24 技术支持' },
]
</script>

<style scoped>
/* ============================================================
   全局
   ============================================================ */
.api-landing {
  --brand: #da203e;
  --brand-soft: rgba(218, 32, 62, 0.06);
  --brand-mid: rgba(218, 32, 62, 0.12);

  margin: -24px;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: linear-gradient(180deg, #fce8eb 0%, #fef2f3 15%, #f9f9f9 30%, #f4f3f0 60%, #efeeea 100%);
  min-height: calc(100vh + 48px);
}

/* ============================================================
   顶部横幅
   ============================================================ */
.api-banner {
  position: relative;
  display: flex;
  align-items: center;
  gap: 40px;
  padding: 40px 48px 36px;
}

/* 背景装饰 */
.banner-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.bg-orbe {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
}
.o1 {
  width: 500px; height: 500px;
  background: rgba(255,255,255,0.06);
  top: -160px; right: -100px;
  animation: orbDrift 10s ease-in-out infinite;
}
.o2 {
  width: 350px; height: 350px;
  background: rgba(255,255,255,0.04);
  bottom: -120px; left: 10%;
  animation: orbDrift 8s ease-in-out infinite reverse;
}
.o3 {
  width: 200px; height: 200px;
  background: rgba(255,255,255,0.03);
  top: 30%; left: 60%;
  animation: orbDrift 6s ease-in-out infinite 2s;
}
@keyframes orbDrift {
  0%, 100% { transform: translate(0, 0); }
  33% { transform: translate(25px, -15px); }
  66% { transform: translate(-15px, 10px); }
}

/* 左侧 SVG 插画 */
.banner-illus {
  flex-shrink: 0;
  width: 380px;
  height: 260px;
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}
.illus-svg {
  width: 100%;
  height: 100%;
  display: block;
}

/* 右侧文字 */
.banner-text {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 2;
}
.banner-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 16px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid rgba(218, 32, 62, 0.15);
  margin-bottom: 14px;
}
.badge-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--brand);
  animation: pulseDot 1.5s ease-in-out infinite;
}
@keyframes pulseDot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.banner-title {
  font-size: 34px;
  font-weight: 800;
  margin: 0 0 12px;
  letter-spacing: -0.02em;
  color: #111827;
}
.banner-desc {
  font-size: 14px;
  line-height: 1.7;
  color: #64748b;
  margin: 0 0 20px;
  max-width: 540px;
}
.banner-meta {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.banner-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
}
.banner-meta-item svg {
  opacity: 0.5;
  flex-shrink: 0;
  color: var(--brand);
}
.banner-meta-item strong {
  color: #111827;
  font-weight: 700;
}

/* ============================================================
   卡片区域 — 极简编辑风
   ============================================================ */
.cards-section {
  position: relative;
  padding: 30px 24px 64px;
  overflow: hidden;
}

/* 弥散光晕 */
.halo {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}
.halo--lt {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(218, 32, 62, 0.06), transparent 70%);
  top: -200px;
  left: -150px;
}
.halo--rb {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(218, 32, 62, 0.04), transparent 70%);
  bottom: -150px;
  right: -100px;
}

/* 点状网格纹理 */
.dot-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(#d1cdc7 1.5px, transparent 1.5px);
  background-size: 40px 40px;
  opacity: 0.35;
  pointer-events: none;
  z-index: 0;
}

.cards-section-inner {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
}

/* 标题 */
.section-header {
  text-align: center;
  margin-bottom: 48px;
}
.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #da203e;
  margin: 0 0 12px;
  line-height: 1.15;
}
.section-divider {
  width: 60px;
  height: 2px;
  background: #da203e;
  margin: 0 auto 16px;
  opacity: 0.5;
}
.section-desc {
  font-size: 0.95rem;
  color: #4a4a4a;
  line-height: 1.6;
  margin: 0;
  letter-spacing: 0.01em;
}

/* 三列网格 */
.api-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

/* 卡片 */
.api-card {
  position: relative;
  background: #ffffff;
  border-radius: 14px;
  padding: 2rem 1.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  animation: cardIn 0.4s ease both;
  animation-delay: calc(var(--i) * 0.04s);
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.api-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.07);
}

/* hover 遮罩 — 极简毛玻璃 + 按钮 */
.card-overlay {
  position: absolute;
  inset: 0;
  border-radius: 14px;
  background: rgba(255,255,255,0.3);
  backdrop-filter: blur(0px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.35s ease, backdrop-filter 0.35s ease;
  pointer-events: none;
  z-index: 5;
}
.api-card:hover .card-overlay {
  opacity: 1;
  backdrop-filter: blur(6px);
  pointer-events: auto;
}
.card-overlay-btn {
  padding: 10px 36px;
  border-radius: 999px;
  background: #da203e;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  transform: translateY(10px);
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.api-card:hover .card-overlay-btn {
  transform: translateY(0);
}

/* 图标 */
.card-icon {
  font-size: 2.2rem;
  line-height: 1;
  margin-bottom: 1.2rem;
}

/* 标题行 — 名称 + 等级标签 */
.card-top-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0.85rem;
}
.card-name {
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.3;
}
.card-tier {
  margin-left: auto;
  flex-shrink: 0;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 2px 10px;
  border-radius: 999px;
}

/* 价值标签行 */
.card-subtags {
  display: flex;
  gap: 12px;
  margin-bottom: 0.85rem;
  flex-wrap: wrap;
}
.card-subtag {
  font-size: 0.78rem;
  color: #666;
  letter-spacing: 0.02em;
  position: relative;
}
.card-subtag + .card-subtag::before {
  content: '';
  position: absolute;
  left: -7px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #da203e;
  opacity: 0.2;
}
.ct-free {
  background: #fef2f3;
  color: #da203e;
}
.ct-hot {
  background: #fff3e0;
  color: #e65100;
}
.ct-beta {
  background: #e8f5e9;
  color: #2e7d32;
}

/* 分割线 */
.card-sep {
  width: 100%;
  height: 1px;
  background: #eeeeef;
  margin-bottom: 0.85rem;
}

/* 描述文字 */
.card-desc {
  font-size: 0.9rem;
  line-height: 1.65;
  color: #4a4a4a;
  margin: 0 0 0.85rem;
  letter-spacing: 0.01em;
}

/* 特性标签 */
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
}
.card-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  color: #4a4a4a;
  background: #f0f0f0;
  letter-spacing: 0.02em;
  line-height: 1.5;
}

/* ============================================================
   底部
   ============================================================ */
.api-footer {
  padding: 32px 48px 36px;
  border-top: 2px solid rgba(218, 32, 62, 0.08);
}
.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}
.footer-features {
  display: flex;
  gap: 32px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.ff-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #4a4a4a;
  letter-spacing: 0.02em;
}
.ff-item svg {
  color: #1a1a1a;
  opacity: 0.35;
  flex-shrink: 0;
}
.footer-info {
  font-size: 0.8rem;
  color: #888;
  margin: 0;
  letter-spacing: 0.03em;
}

/* ============================================================
   响应式
   ============================================================ */
@media (max-width: 1024px) {
  .api-grid { grid-template-columns: repeat(2, 1fr); }
  .banner-illus { width: 300px; height: 220px; }
}
@media (max-width: 768px) {
  .api-banner {
    flex-direction: column;
    gap: 16px;
    padding: 28px 20px;
    min-height: auto;
    background: transparent;
  }
  .banner-illus { width: 200px; height: 140px; align-self: flex-start; }
  .banner-title { font-size: 26px; }
  .banner-meta { gap: 12px; }
  .cards-section { padding: 40px 20px 44px; }
  .section-title { font-size: 1.8rem; }
  .api-grid { grid-template-columns: 1fr; gap: 20px; }
  .api-card { padding: 1.8rem; }
  .api-footer { padding: 24px 20px; }
  .footer-features { gap: 20px; }
}
</style>
