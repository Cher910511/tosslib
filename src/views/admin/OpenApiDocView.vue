<template>
  <div class="api-doc">
    <!-- ========== 顶部头部 ========== -->
    <header class="doc-header">
      <div class="header-inner">
        <button class="h-btn ghost back-btn" @click="back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          返回宣传页
        </button>
        <div class="header-brand">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          <span class="brand-name">OpenAPI</span>
          <span class="brand-ver">v1.0</span>
        </div>
        <nav class="header-nav">
          <a :class="{ active: tab === 'overview' }" @click="tab = 'overview'">概览</a>
          <a :class="{ active: tab === 'quickstart' }" @click="tab = 'quickstart'">快速开始</a>
          <a :class="{ active: tab === 'auth' }" @click="tab = 'auth'">认证</a>
          <a :class="{ active: tab === 'errors' }" @click="tab = 'errors'">错误码</a>
          <a :class="{ active: tab === 'changelog' }" @click="tab = 'changelog'">变更日志</a>
        </nav>
        <div class="header-actions">
          <button class="h-btn ghost" @click="copy(baseURL)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Base URL
          </button>
          <button class="h-btn primary" @click="showKeyModal = true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3"/></svg>
            申请密钥
          </button>
        </div>
      </div>
    </header>

    <!-- ========== 主体 ========== -->
    <div class="doc-body">
      <!-- 左侧接口列表 -->
      <aside class="doc-side">
        <div class="side-group">
          <p class="side-title">文档章节</p>
          <a :class="{ active: tab === 'overview' }" @click="tab = 'overview'">概览</a>
          <a :class="{ active: tab === 'quickstart' }" @click="tab = 'quickstart'">快速开始</a>
          <a :class="{ active: tab === 'auth' }" @click="tab = 'auth'">认证方式</a>
          <a :class="{ active: tab === 'errors' }" @click="tab = 'errors'">错误码</a>
          <a :class="{ active: tab === 'changelog' }" @click="tab = 'changelog'">变更日志</a>
        </div>
        <div class="side-group">
          <p class="side-title">接口列表</p>
          <a v-for="t in apis" :key="t.id"
             :class="{ active: tab === 'api' && currentApi === t.id }"
             @click="openApi(t.id)">
            <span class="side-name">{{ t.name }}</span>
            <span class="side-tag" :class="'st-' + t.tierType">{{ t.tier }}</span>
          </a>
        </div>
      </aside>

      <!-- 右侧内容：整页切换，不滑动 -->
      <main class="doc-content">
        <!-- 概览 -->
        <section v-if="tab === 'overview'" class="doc-section">
          <h2 class="sec-h2">概览</h2>
          <p class="sec-desc">OpenAPI 提供标准 RESTful 接口，覆盖软件组成分析、漏洞检测、许可证合规、SBOM 生成等核心场景，可快速集成到研发流水线中。</p>

          <div class="ov-grid">
            <div class="ov-card"><div class="ov-icon">🔌</div><h3>{{ apis.length }} 个接口</h3><p>覆盖检测到治理的完整链路</p></div>
            <div class="ov-card"><div class="ov-icon">⚡</div><h3>毫秒响应</h3><p>平均响应时间 &lt; 200ms</p></div>
            <div class="ov-card"><div class="ov-icon">🔒</div><h3>HTTPS 加密</h3><p>全链路 TLS 1.3 加密传输</p></div>
            <div class="ov-card"><div class="ov-icon">📈</div><h3>SLA 99.9%</h3><p>7×24 技术支持保障</p></div>
          </div>

          <div class="ov-info">
            <h3>Base URL</h3>
            <div class="code-line">
              <code>{{ baseURL }}</code>
              <button class="cp-btn" @click="copy(baseURL)">复制</button>
            </div>
            <p class="ov-tip">所有接口均以 <code>/v1</code> 为前缀，后续版本将保持向后兼容。</p>
          </div>

          <h3 class="sec-h3">接口速览</h3>
          <table class="doc-table">
            <thead><tr><th>接口</th><th>方法</th><th>路径</th><th>等级</th></tr></thead>
            <tbody>
              <tr v-for="t in apis" :key="t.id" class="row-link" @click="openApi(t.id)">
                <td>{{ t.name }}</td>
                <td><span class="api-method" :class="'m-' + t.method.toLowerCase()">{{ t.method }}</span></td>
                <td><code>{{ t.path }}</code></td>
                <td><span class="api-tier" :class="'at-' + t.tierType">{{ t.tier }}</span></td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- 快速开始 -->
        <section v-else-if="tab === 'quickstart'" class="doc-section">
          <h2 class="sec-h2">快速开始</h2>
          <p class="sec-desc">三步即可开始调用 OpenAPI 接口。</p>

          <div class="qs-step">
            <div class="qs-no">1</div>
            <div class="qs-body">
              <h3>申请 API Key</h3>
              <p>在控制台「密钥管理」页面创建密钥，每个密钥绑定一个项目，可独立设置配额与权限范围。</p>
            </div>
          </div>
          <div class="qs-step">
            <div class="qs-no">2</div>
            <div class="qs-body">
              <h3>构造请求</h3>
              <p>在请求头中携带 <code>Authorization: Bearer YOUR_API_KEY</code>，请求体使用 JSON 格式。</p>
              <pre class="code-block">curl -X POST https://api.tosslib.example/v1/sca/scan \
  -H "Authorization: Bearer sk_live_xxxx" \
  -H "Content-Type: application/json" \
  -d '{"package": "lodash@4.17.21"}'</pre>
            </div>
          </div>
          <div class="qs-step">
            <div class="qs-no">3</div>
            <div class="qs-body">
              <h3>解析响应</h3>
              <p>响应统一为 JSON，成功时 <code>code = 0</code>，失败时返回对应错误码与提示。</p>
              <pre class="code-block">{
  "code": 0,
  "msg": "ok",
  "data": { "scan_id": "sc_8a3f", "status": "done" }
}</pre>
            </div>
          </div>
        </section>

        <!-- 认证 -->
        <section v-else-if="tab === 'auth'" class="doc-section">
          <h2 class="sec-h2">认证方式</h2>
          <p class="sec-desc">OpenAPI 采用 Bearer Token 认证，密钥通过请求头传递。</p>

          <table class="doc-table">
            <thead><tr><th>参数</th><th>位置</th><th>说明</th></tr></thead>
            <tbody>
              <tr><td><code>Authorization</code></td><td>Header</td><td>固定格式 <code>Bearer YOUR_API_KEY</code>，必填</td></tr>
              <tr><td><code>X-Request-Id</code></td><td>Header</td><td>请求追踪 ID，建议填入 UUID，便于排障</td></tr>
            </tbody>
          </table>

          <h3 class="sec-h3">权限范围（Scope）</h3>
          <table class="doc-table">
            <thead><tr><th>Scope</th><th>可访问接口</th></tr></thead>
            <tbody>
              <tr><td><code>read</code></td><td>组件搜索、报告查询、漏洞查询</td></tr>
              <tr><td><code>scan</code></td><td>SCA 扫描、SBOM 生成、恶意代码检测</td></tr>
              <tr><td><code>admin</code></td><td>全部接口 + 配额管理</td></tr>
            </tbody>
          </table>
        </section>

        <!-- 接口详情 -->
        <section v-else-if="tab === 'api'" class="doc-section api-section">
          <div class="api-head">
            <span class="api-method" :class="'m-' + currentApiObj.method.toLowerCase()">{{ currentApiObj.method }}</span>
            <h2 class="sec-h2">{{ currentApiObj.name }}</h2>
            <span class="api-tier" :class="'at-' + currentApiObj.tierType">{{ currentApiObj.tier }}</span>
          </div>
          <p class="sec-desc">{{ currentApiObj.desc }}</p>
          <div class="api-path">
            <code>{{ currentApiObj.path }}</code>
            <button class="cp-btn" @click="copy(currentApiObj.path)">复制</button>
          </div>

          <h3 class="sec-h3">请求参数</h3>
          <table class="doc-table">
            <thead><tr><th>参数</th><th>位置</th><th>类型</th><th>必填</th><th>说明</th></tr></thead>
            <tbody>
              <tr v-for="p in currentApiObj.params" :key="p.name">
                <td><code>{{ p.name }}</code></td>
                <td>{{ p.in }}</td>
                <td>{{ p.type }}</td>
                <td>{{ p.required ? '是' : '否' }}</td>
                <td>{{ p.desc }}</td>
              </tr>
            </tbody>
          </table>

          <h3 class="sec-h3">请求示例</h3>
          <pre class="code-block">{{ currentApiObj.requestExample }}</pre>

          <h3 class="sec-h3">响应参数</h3>
          <table class="doc-table">
            <thead><tr><th>字段</th><th>类型</th><th>说明</th></tr></thead>
            <tbody>
              <tr v-for="r in currentApiObj.response" :key="r.name">
                <td><code>{{ r.name }}</code></td>
                <td>{{ r.type }}</td>
                <td>{{ r.desc }}</td>
              </tr>
            </tbody>
          </table>

          <h3 class="sec-h3">响应示例</h3>
          <pre class="code-block">{{ currentApiObj.responseExample }}</pre>

          <h3 class="sec-h3">专属错误码</h3>
          <table class="doc-table">
            <thead><tr><th>code</th><th>含义</th></tr></thead>
            <tbody>
              <tr v-for="e in currentApiObj.errors" :key="e.code">
                <td><code>{{ e.code }}</code></td>
                <td>{{ e.desc }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- 错误码 -->
        <section v-else-if="tab === 'errors'" class="doc-section">
          <h2 class="sec-h2">通用错误码</h2>
          <p class="sec-desc">所有接口共享的通用错误码，接口专属错误码见各接口文档。</p>
          <table class="doc-table">
            <thead><tr><th>code</th><th>HTTP</th><th>含义</th><th>处理建议</th></tr></thead>
            <tbody>
              <tr v-for="e in commonErrors" :key="e.code">
                <td><code>{{ e.code }}</code></td>
                <td>{{ e.http }}</td>
                <td>{{ e.desc }}</td>
                <td>{{ e.fix }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- 变更日志 -->
        <section v-else-if="tab === 'changelog'" class="doc-section">
          <h2 class="sec-h2">变更日志</h2>
          <div class="cl-item" v-for="c in changelog" :key="c.ver">
            <div class="cl-ver">
              <span class="cl-badge" :class="'cl-' + c.type">{{ c.type }}</span>
              <strong>{{ c.ver }}</strong>
              <span class="cl-date">{{ c.date }}</span>
            </div>
            <ul class="cl-list">
              <li v-for="item in c.items" :key="item">{{ item }}</li>
            </ul>
          </div>
        </section>
      </main>
    </div>

    <!-- 申请密钥弹窗 -->
    <div v-if="showKeyModal" class="modal-mask" @click.self="showKeyModal = false">
      <div class="modal">
        <h3>申请 API Key</h3>
        <p class="modal-tip">演示用密钥仅用于联调测试，请勿用于生产环境。</p>
        <div class="key-box">
          <code>sk_demo_8a3f2c1e9b0d4f5a7e6c2b1d3f4a5e6c</code>
          <button class="cp-btn" @click="copy('sk_demo_8a3f2c1e9b0d4f5a7e6c2b1d3f4a5e6c')">复制</button>
        </div>
        <div class="modal-actions">
          <button class="h-btn ghost" @click="showKeyModal = false">关闭</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <transition name="fade">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const baseURL = 'https://api.tosslib.example/v1'
const showKeyModal = ref(false)
const toast = ref('')
const tab = ref('overview')
const currentApi = ref(null)

function back() {
  router.push({ name: 'openapi-tools' })
}
function openApi(id) {
  currentApi.value = id
  tab.value = 'api'
}
function showToast(msg) {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 1500)
}
function copy(text) {
  navigator.clipboard?.writeText(text).then(() => showToast('已复制到剪贴板'))
}

const apis = [
  {
    id: 'sca', method: 'POST', path: '/v1/sca/scan', name: 'SCA 扫描', tier: '免费', tierType: 'free',
    desc: '上传软件包自动识别组件清单、许可证信息及依赖关系，支持多语言生态。',
    params: [
      { name: 'package', in: 'Body', type: 'string', required: true, desc: '软件包名及版本，如 lodash@4.17.21' },
      { name: 'lang', in: 'Body', type: 'string', required: false, desc: '指定语言生态，如 npm/maven/pypi' },
      { name: 'deep', in: 'Body', type: 'boolean', required: false, desc: '是否启用深度依赖树分析，默认 false' }
    ],
    requestExample: `curl -X POST https://api.tosslib.example/v1/sca/scan \\
  -H "Authorization: Bearer sk_live_xxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"package": "lodash@4.17.21", "deep": true}'`,
    response: [
      { name: 'code', type: 'int', desc: '错误码，0 表示成功' },
      { name: 'msg', type: 'string', desc: '提示信息' },
      { name: 'data.scan_id', type: 'string', desc: '扫描任务 ID' },
      { name: 'data.status', type: 'string', desc: '任务状态：pending/done' },
      { name: 'data.components', type: 'array', desc: '组件清单，含 name/version/license/dependencies' }
    ],
    responseExample: `{
  "code": 0,
  "msg": "ok",
  "data": {
    "scan_id": "sc_8a3f2c1e",
    "status": "done",
    "components": [
      { "name": "lodash", "version": "4.17.21", "license": "MIT", "dependencies": [] }
    ]
  }
}`,
    errors: [
      { code: 40001, desc: '包名格式不合法' },
      { code: 40002, desc: '不支持的语言生态' }
    ]
  },
  {
    id: 'vuln', method: 'GET', path: '/v1/vulnerabilities/query', name: '漏洞预警查询', tier: '热门', tierType: 'hot',
    desc: '基于 CVE/NVD 数据库实时检测软件漏洞，返回 CVSS 评分、影响范围及修复建议。',
    params: [
      { name: 'package', in: 'Query', type: 'string', required: true, desc: '软件包名，如 lodash' },
      { name: 'version', in: 'Query', type: 'string', required: true, desc: '版本号，如 4.17.21' },
      { name: 'severity', in: 'Query', type: 'string', required: false, desc: '按严重等级过滤：low/medium/high/critical' }
    ],
    requestExample: `curl https://api.tosslib.example/v1/vulnerabilities/query?package=lodash&version=4.17.21 \\
  -H "Authorization: Bearer sk_live_xxxx"`,
    response: [
      { name: 'code', type: 'int', desc: '错误码' },
      { name: 'data.total', type: 'int', desc: '匹配漏洞数' },
      { name: 'data.items', type: 'array', desc: '漏洞列表，含 cve_id/severity/cvss/summary/fix' }
    ],
    responseExample: `{
  "code": 0,
  "data": {
    "total": 1,
    "items": [
      {
        "cve_id": "CVE-2021-23337",
        "severity": "high",
        "cvss": 7.2,
        "summary": "Command Injection via template",
        "fix": "升级至 4.17.21 及以上"
      }
    ]
  }
}`,
    errors: [
      { code: 40401, desc: '未找到该包' },
      { code: 40402, desc: '版本不存在' }
    ]
  },
  {
    id: 'sbom', method: 'POST', path: '/v1/sbom/generate', name: 'SBOM 生成', tier: '免费', tierType: 'free',
    desc: '依据 SPDX/CycloneDX 标准生成软件物料清单文件，支持多种格式导出。',
    params: [
      { name: 'scan_id', in: 'Body', type: 'string', required: true, desc: 'SCA 扫描返回的任务 ID' },
      { name: 'format', in: 'Body', type: 'string', required: true, desc: '输出格式：spdx-json/cyclonedx-json/spdx-tag' },
      { name: 'name', in: 'Body', type: 'string', required: false, desc: '产物名称，用于报告归属' }
    ],
    requestExample: `curl -X POST https://api.tosslib.example/v1/sbom/generate \\
  -H "Authorization: Bearer sk_live_xxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"scan_id": "sc_8a3f2c1e", "format": "spdx-json"}'`,
    response: [
      { name: 'code', type: 'int', desc: '错误码' },
      { name: 'data.sbom_id', type: 'string', desc: 'SBOM 文件 ID' },
      { name: 'data.download_url', type: 'string', desc: '下载链接，1 小时有效' },
      { name: 'data.format', type: 'string', desc: '实际生成格式' }
    ],
    responseExample: `{
  "code": 0,
  "data": {
    "sbom_id": "sb_2c1e9b0d",
    "download_url": "https://api.tosslib.example/v1/sbom/sb_2c1e9b0d/download",
    "format": "spdx-json"
  }
}`,
    errors: [
      { code: 40003, desc: 'scan_id 无效或已过期' },
      { code: 40004, desc: '不支持的格式' }
    ]
  },
  {
    id: 'ai', method: 'POST', path: '/v1/ai/assist', name: 'AI 智能选型助手', tier: '内测', tierType: 'beta',
    desc: '集成大语言模型能力，提供代码审查建议、安全缺陷修复方案及自动化注释生成。',
    params: [
      { name: 'prompt', in: 'Body', type: 'string', required: true, desc: '用户输入提示，最长 4000 字符' },
      { name: 'context', in: 'Body', type: 'object', required: false, desc: '附加上下文：可含 repo/file/scan_id' },
      { name: 'mode', in: 'Body', type: 'string', required: false, desc: '模式：review/fix/comment，默认 review' }
    ],
    requestExample: `curl -X POST https://api.tosslib.example/v1/ai/assist \\
  -H "Authorization: Bearer sk_live_xxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "审查此段 SQL 拼接代码", "mode": "review"}'`,
    response: [
      { name: 'code', type: 'int', desc: '错误码' },
      { name: 'data.answer', type: 'string', desc: 'AI 回答内容（Markdown）' },
      { name: 'data.tokens', type: 'int', desc: '本次消耗 token 数' }
    ],
    responseExample: `{
  "code": 0,
  "data": {
    "answer": "## 安全建议\\n该段代码存在 SQL 注入风险，建议使用参数化查询...",
    "tokens": 428
  }
}`,
    errors: [
      { code: 40005, desc: 'prompt 超过 4000 字符' },
      { code: 40006, desc: 'mode 不合法' }
    ]
  },
  {
    id: 'license', method: 'POST', path: '/v1/license/analyze', name: '开源合规分析', tier: '免费', tierType: 'free',
    desc: '解析开源许可证法律文本，匹配合规条款并评估风险等级。',
    params: [
      { name: 'license', in: 'Body', type: 'string', required: true, desc: '许可证 SPDX 标识，如 MIT/Apache-2.0/GPL-3.0' },
      { name: 'use_case', in: 'Body', type: 'string', required: false, desc: '使用场景：commercial/internal/distribution' }
    ],
    requestExample: `curl -X POST https://api.tosslib.example/v1/license/analyze \\
  -H "Authorization: Bearer sk_live_xxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"license": "GPL-3.0", "use_case": "commercial"}'`,
    response: [
      { name: 'code', type: 'int', desc: '错误码' },
      { name: 'data.risk_level', type: 'string', desc: '风险等级：low/medium/high' },
      { name: 'data.obligations', type: 'array', desc: '须履行的义务清单' },
      { name: 'data.report_url', type: 'string', desc: '合规报告下载链接' }
    ],
    responseExample: `{
  "code": 0,
  "data": {
    "risk_level": "high",
    "obligations": ["开源修改后代码", "保留版权声明"],
    "report_url": "https://api.tosslib.example/v1/report/r_2c1e"
  }
}`,
    errors: [
      { code: 40007, desc: '未识别的许可证标识' },
      { code: 40008, desc: 'use_case 不合法' }
    ]
  },
  {
    id: 'malware', method: 'POST', path: '/v1/malware/scan', name: '恶意代码检测', tier: '热门', tierType: 'hot',
    desc: '结合静态分析与沙箱行为技术，检测软件包中潜在的恶意代码和后门程序。',
    params: [
      { name: 'package', in: 'Body', type: 'string', required: true, desc: '软件包名及版本' },
      { name: 'sandbox', in: 'Body', type: 'boolean', required: false, desc: '是否启用沙箱行为分析，默认 true' }
    ],
    requestExample: `curl -X POST https://api.tosslib.example/v1/malware/scan \\
  -H "Authorization: Bearer sk_live_xxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"package": "some-pkg@1.2.3", "sandbox": true}'`,
    response: [
      { name: 'code', type: 'int', desc: '错误码' },
      { name: 'data.verdict', type: 'string', desc: '结论：clean/suspicious/malicious' },
      { name: 'data.indicators', type: 'array', desc: '风险指标列表' },
      { name: 'data.confidence', type: 'float', desc: '置信度 0~1' }
    ],
    responseExample: `{
  "code": 0,
  "data": {
    "verdict": "suspicious",
    "indicators": ["动态执行 base64", "访问环境变量 API_KEY"],
    "confidence": 0.86
  }
}`,
    errors: [
      { code: 40009, desc: '沙箱执行超时' },
      { code: 40010, desc: '包体积超过限制（50MB）' }
    ]
  },
  {
    id: 'search', method: 'GET', path: '/v1/components/search', name: '组件搜索', tier: '免费', tierType: 'free',
    desc: '高性能开源组件索引服务，支持按名称、版本、语言等多维度检索。',
    params: [
      { name: 'q', in: 'Query', type: 'string', required: true, desc: '关键词' },
      { name: 'lang', in: 'Query', type: 'string', required: false, desc: '语言过滤：npm/maven/pypi/go' },
      { name: 'page', in: 'Query', type: 'int', required: false, desc: '页码，默认 1' },
      { name: 'size', in: 'Query', type: 'int', required: false, desc: '每页数量，默认 20，最大 100' }
    ],
    requestExample: `curl "https://api.tosslib.example/v1/components/search?q=lodash&lang=npm&size=5" \\
  -H "Authorization: Bearer sk_live_xxxx"`,
    response: [
      { name: 'code', type: 'int', desc: '错误码' },
      { name: 'data.total', type: 'int', desc: '匹配总数' },
      { name: 'data.items', type: 'array', desc: '组件列表，含 name/version/lang/license/repository' }
    ],
    responseExample: `{
  "code": 0,
  "data": {
    "total": 1,
    "items": [
      { "name": "lodash", "version": "4.17.21", "lang": "npm", "license": "MIT", "repository": "https://github.com/lodash/lodash" }
    ]
  }
}`,
    errors: [
      { code: 40011, desc: 'q 不能为空' },
      { code: 40012, desc: 'size 超过 100' }
    ]
  },
  {
    id: 'report', method: 'POST', path: '/v1/report/generate', name: '报告生成', tier: '免费', tierType: 'free',
    desc: '自动生成 PDF/HTML 格式的安全检测报告，支持自定义模板和批量导出。',
    params: [
      { name: 'scan_ids', in: 'Body', type: 'array', required: true, desc: '扫描任务 ID 数组，最多 50 个' },
      { name: 'format', in: 'Body', type: 'string', required: true, desc: '输出格式：pdf/html' },
      { name: 'template', in: 'Body', type: 'string', required: false, desc: '模板 ID，不填使用默认模板' }
    ],
    requestExample: `curl -X POST https://api.tosslib.example/v1/report/generate \\
  -H "Authorization: Bearer sk_live_xxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"scan_ids": ["sc_8a3f2c1e"], "format": "pdf"}'`,
    response: [
      { name: 'code', type: 'int', desc: '错误码' },
      { name: 'data.report_id', type: 'string', desc: '报告 ID' },
      { name: 'data.download_url', type: 'string', desc: '下载链接' },
      { name: 'data.expires_at', type: 'string', desc: '链接失效时间（ISO 8601）' }
    ],
    responseExample: `{
  "code": 0,
  "data": {
    "report_id": "r_2c1e9b0d",
    "download_url": "https://api.tosslib.example/v1/report/r_2c1e9b0d/download",
    "expires_at": "2026-07-07T17:00:00Z"
  }
}`,
    errors: [
      { code: 40013, desc: 'scan_ids 超过 50 个' },
      { code: 40014, desc: '不支持的 format' }
    ]
  }
]

const currentApiObj = computed(() => apis.find(a => a.id === currentApi.value) || apis[0])

// 进入文档页时若带 ?api=xxx 则直接打开该接口
watch(() => route.query.api, (id) => {
  if (id && apis.find(a => a.id === id)) {
    currentApi.value = id
    tab.value = 'api'
  }
}, { immediate: true })

const commonErrors = [
  { code: 0, http: '200', desc: '成功', fix: '无需处理' },
  { code: 40100, http: '401', desc: '未携带 API Key 或格式错误', fix: '检查 Authorization 头' },
  { code: 40101, http: '401', desc: 'API Key 无效或已停用', fix: '在控制台重新生成密钥' },
  { code: 40300, http: '403', desc: '权限不足（Scope 不匹配）', fix: '为密钥追加对应 Scope' },
  { code: 42900, http: '429', desc: '请求频率超过配额', fix: '降低频率或申请提升配额' },
  { code: 50000, http: '500', desc: '服务内部错误', fix: '保留 X-Request-Id 并联系技术支持' }
]

const changelog = [
  {
    type: 'major', ver: 'v1.0', date: '2026-07-01',
    items: [
      '正式发布 OpenAPI v1.0',
      '上线 8 个接口：SCA 扫描、漏洞预警、SBOM 生成、AI 助手、合规分析、恶意代码检测、组件搜索、报告生成',
      'Bearer Token 认证 + Scope 权限模型',
      '全链路 HTTPS（TLS 1.3）加密'
    ]
  },
  {
    type: 'minor', ver: 'v0.9', date: '2026-05-15',
    items: [
      '新增 AI 智能选型助手内测接口',
      '组件搜索接口支持 lang 多语言过滤'
    ]
  },
  {
    type: 'patch', ver: 'v0.8.3', date: '2026-04-02',
    items: [
      '修复 SCA 扫描 deep 模式下依赖树截断问题',
      '优化报告生成 PDF 模板字体兼容性'
    ]
  }
]
</script>

<style scoped>
/* ============================================================
   全局
   ============================================================ */
.api-doc {
  --brand: #da203e;
  --brand-soft: rgba(218, 32, 62, 0.06);
  --brand-mid: rgba(218, 32, 62, 0.12);
  --ink: #1a1a1a;
  --ink-2: #4a4a4a;
  --ink-3: #888;
  --bg: #fafafa;
  --border: #e5e5e6;

  margin: -24px;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: var(--bg);
  color: var(--ink);
  min-height: calc(100vh + 48px);
  display: flex;
  flex-direction: column;
}
.api-doc * { box-sizing: border-box; }
.api-doc code {
  font-family: 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
  font-size: 0.86rem;
  color: var(--brand);
  background: var(--brand-soft);
  padding: 1px 6px;
  border-radius: 4px;
}

/* ============================================================
   头部
   ============================================================ */
.doc-header {
  background: #fff;
  border-bottom: 1px solid var(--border);
}
.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 32px;
  height: 56px;
}
.back-btn { flex-shrink: 0; }
.header-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--brand);
  flex-shrink: 0;
}
.brand-name { font-size: 18px; font-weight: 800; letter-spacing: -0.01em; color: var(--ink); }
.brand-ver {
  font-size: 11px; font-weight: 600; color: var(--brand);
  background: var(--brand-soft); border: 1px solid rgba(218, 32, 62, 0.2);
  padding: 2px 8px; border-radius: 999px;
}
.header-nav { display: flex; gap: 22px; margin-left: auto; }
.header-nav a { font-size: 13px; color: var(--ink-2); cursor: pointer; transition: color 0.2s; }
.header-nav a:hover { color: var(--brand); }
.header-nav a.active { color: var(--brand); font-weight: 600; }
.header-actions { display: flex; gap: 10px; flex-shrink: 0; }
.h-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 999px; font-size: 13px;
  cursor: pointer; border: 1px solid transparent; transition: all 0.2s;
}
.h-btn.ghost { background: #fff; border-color: var(--border); color: var(--ink-2); }
.h-btn.ghost:hover { color: var(--brand); border-color: rgba(218, 32, 62, 0.3); }
.h-btn.primary { background: var(--brand); color: #fff; }
.h-btn.primary:hover { background: #c01e36; }

/* ============================================================
   主体
   ============================================================ */
.doc-body {
  flex: 1;
  display: grid;
  grid-template-columns: 240px 1fr;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}
.doc-side {
  border-right: 1px solid var(--border);
  background: #fff;
  padding: 24px 18px 40px;
  min-height: calc(100vh - 56px);
}
.side-group { margin-bottom: 24px; }
.side-title {
  font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
  color: var(--ink-3); margin: 0 0 10px; text-transform: uppercase;
}
.side-group a {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  padding: 7px 12px; margin-bottom: 2px; font-size: 13px; color: var(--ink-2);
  border-radius: 6px; cursor: pointer; transition: all 0.18s;
}
.side-group a:hover { background: var(--brand-soft); color: var(--brand); }
.side-group a.active { background: var(--brand-soft); color: var(--brand); font-weight: 600; }
.side-name { flex: 1; min-width: 0; }
.side-tag {
  font-size: 10px; font-weight: 600; letter-spacing: 0.04em;
  padding: 1px 8px; border-radius: 999px; flex-shrink: 0;
}
.st-free { background: #fef2f3; color: #da203e; }
.st-hot { background: #fff3e0; color: #e65100; }
.st-beta { background: #e8f5e9; color: #2e7d32; }

.doc-content { padding: 40px 48px 80px; min-width: 0; }
.doc-section { margin-bottom: 48px; }
.sec-h2 { font-size: 22px; font-weight: 700; color: var(--ink); margin: 0 0 10px; letter-spacing: -0.01em; }
.sec-h3 { font-size: 14px; font-weight: 700; color: var(--ink); margin: 24px 0 10px; letter-spacing: 0.02em; }
.sec-desc { font-size: 14px; line-height: 1.7; color: var(--ink-2); margin: 0 0 18px; }

/* 概览 */
.ov-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px; }
.ov-card {
  background: #fff; border: 1px solid var(--border); border-radius: 10px;
  padding: 18px 16px; text-align: center;
}
.ov-icon { font-size: 22px; margin-bottom: 8px; }
.ov-card h3 { font-size: 14px; font-weight: 700; color: var(--ink); margin: 0 0 4px; }
.ov-card p { font-size: 12px; color: var(--ink-3); margin: 0; }
.ov-info { background: #fff; border: 1px solid var(--border); border-radius: 10px; padding: 18px 20px; }
.ov-info h3 { font-size: 14px; font-weight: 700; margin: 0 0 12px; }
.code-line { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.code-line code { flex: 1; background: #1e1e1e; color: #f78c6c; padding: 6px 12px; border-radius: 6px; }
.ov-tip { font-size: 12px; color: var(--ink-3); margin: 6px 0 0; }

/* 接口速览表格行可点 */
.row-link { cursor: pointer; transition: background 0.15s; }
.row-link:hover { background: var(--brand-soft); }

/* 复制按钮 */
.cp-btn {
  background: var(--brand); color: #fff; border: none;
  padding: 4px 10px; border-radius: 6px; font-size: 12px; cursor: pointer; flex-shrink: 0;
}
.cp-btn:hover { background: #c01e36; }

/* 快速开始 */
.qs-step { display: flex; gap: 16px; margin-bottom: 22px; }
.qs-no {
  flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%;
  background: var(--brand); color: #fff; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.qs-body { flex: 1; }
.qs-body h3 { font-size: 14px; font-weight: 700; margin: 4px 0 6px; }
.qs-body p { font-size: 13px; color: var(--ink-2); margin: 0 0 8px; line-height: 1.6; }

/* 代码块 */
.code-block {
  background: #1e1e1e; color: #e6e6e6; border-radius: 8px; padding: 14px 16px;
  font-family: 'SF Mono', Menlo, Consolas, monospace; font-size: 12.5px; line-height: 1.6;
  overflow-x: auto; margin: 0 0 16px; white-space: pre-wrap;
}

/* 表格 */
.doc-table {
  width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px;
  background: #fff; border: 1px solid var(--border); border-radius: 8px; overflow: hidden;
}
.doc-table th, .doc-table td { padding: 10px 14px; text-align: left; border-bottom: 1px solid var(--border); }
.doc-table th { background: #fafafa; font-weight: 700; font-size: 12px; color: var(--ink); }
.doc-table tr:last-child td { border-bottom: none; }
.doc-table td { color: var(--ink-2); }

/* 接口区块 */
.api-section {
  background: #fff; border: 1px solid var(--border); border-radius: 12px;
  padding: 28px 32px; margin-bottom: 28px;
}
.api-head { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.api-method {
  font-family: 'SF Mono', Menlo, monospace; font-size: 11px; font-weight: 800;
  padding: 3px 9px; border-radius: 5px; letter-spacing: 0.04em; color: #fff; flex-shrink: 0;
}
.m-get { background: #2563eb; }
.m-post { background: #16a34a; }
.api-head .sec-h2 { margin: 0; }
.api-tier {
  font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 999px;
  margin-left: auto; flex-shrink: 0;
}
.at-free { background: #fef2f3; color: #da203e; }
.at-hot { background: #fff3e0; color: #e65100; }
.at-beta { background: #e8f5e9; color: #2e7d32; }
.api-path { display: flex; align-items: center; gap: 10px; margin: 12px 0 20px; }
.api-path code { flex: 1; background: #1e1e1e; color: #f78c6c; padding: 7px 14px; border-radius: 6px; }

/* 变更日志 */
.cl-item { margin-bottom: 22px; }
.cl-ver { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 14px; }
.cl-badge {
  font-size: 10px; font-weight: 700; letter-spacing: 0.06em;
  padding: 2px 8px; border-radius: 999px; color: #fff; text-transform: uppercase;
}
.cl-major { background: #da203e; }
.cl-minor { background: #2563eb; }
.cl-patch { background: #16a34a; }
.cl-date { font-size: 12px; color: var(--ink-3); }
.cl-list { margin: 0; padding-left: 20px; }
.cl-list li { font-size: 13px; color: var(--ink-2); line-height: 1.7; }

/* 弹窗 */
.modal-mask {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5);
  display: flex; align-items: center; justify-content: center; z-index: 50;
}
.modal { background: #fff; border-radius: 12px; padding: 24px 28px; width: 480px; max-width: 90vw; }
.modal h3 { font-size: 16px; font-weight: 700; margin: 0 0 8px; }
.modal-tip { font-size: 13px; color: var(--ink-3); margin: 0 0 14px; }
.key-box {
  display: flex; align-items: center; gap: 10px;
  background: #1e1e1e; padding: 10px 14px; border-radius: 8px; margin-bottom: 16px;
}
.key-box code { background: transparent; color: #f78c6c; padding: 0; flex: 1; }
.modal-actions { display: flex; justify-content: flex-end; }

/* Toast */
.toast {
  position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%);
  background: rgba(26, 26, 26, 0.92); color: #fff;
  padding: 8px 18px; border-radius: 999px; font-size: 13px; z-index: 100;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 响应式 */
@media (max-width: 1024px) {
  .doc-body { grid-template-columns: 200px 1fr; }
  .ov-grid { grid-template-columns: repeat(2, 1fr); }
  .doc-content { padding: 32px 24px 60px; }
}
@media (max-width: 768px) {
  .doc-body { grid-template-columns: 1fr; }
  .doc-side { border-right: none; border-bottom: 1px solid var(--border); }
  .header-nav { display: none; }
  .header-inner { padding: 0 16px; gap: 12px; }
  .ov-grid { grid-template-columns: 1fr; }
  .api-section { padding: 20px 18px; }
  .doc-content { padding: 24px 16px 48px; }
}
</style>
