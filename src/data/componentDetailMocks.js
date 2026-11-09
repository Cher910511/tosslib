/** 组件库详情演示数据，按路由 param `id` 索引；每项含 detailLang 决定「引入依赖」展示语言 */

import { isDetailLangKey } from './componentDetailLang.js'

const VERTX = {
  detailLang: 'java',
  name: 'vertx-web-sstore-cookie',
  version: '4.5.21',
  componentCode: 'db070c0e21f805f2f14bc02dd139fa80',
  groupId: 'io.vertx',
  artifactId: 'vertx-web-sstore-cookie',
  language: 'Java',
  descriptionEn:
    'Session store implementation for Vert.x Web using cookies. It integrates with the Vert.x Web stack to persist session state in HTTP cookies, suitable for stateless deployments and clustered setups when combined with Vert.x clustering.',
  descriptionZh:
    '基于 Cookie 的 Vert.x Web 会话存储实现，与 Vert.x Web 栈集成，用于在 HTTP Cookie 中持久化会话状态；在结合 Vert.x 集群能力时，也可用于无状态或集群部署场景。',
  parentSoftwares: [
    { name: 'vertx-web', version: '4.5.21', softwareDetailQuery: {} },
    { name: 'vertx-core', version: '4.5.21', softwareDetailQuery: {} },
  ],
  licenses: [
    { name: 'Apache License 2.0', code: 'Apache-2.0', version: '3.28.0', type: 'apache' },
    { name: 'Eclipse Public License 2.0', code: 'EPL-2.0', version: '3.28.0', type: 'epl' },
    { name: 'MIT License', code: 'MIT', version: '3.28.0', type: 'mit' },
    { name: 'BSD 3-Clause "New" or "Revised" License', code: 'BSD-3-Clause', version: '3.28.0', type: 'bsd' },
    { name: 'GNU Lesser General Public License v3.0 only', code: 'LGPL-3.0-only', version: '3.28.0', type: 'lgpl' },
    { name: 'Mozilla Public License 2.0', code: 'MPL-2.0', version: '3.28.0', type: 'mpl' },
  ],
  binaryPackages: [
    {
      kind: '二进制包',
      fileName: 'vertx-web-sstore-cookie-4.5.21.jar',
      href: 'https://test.tosslib.com/repo/io/vertx/vertx-web-sstore-cookie/4.5.21/vertx-web-sstore-cookie-4.5.21.jar',
    },
  ],
  packageDownloads: [
    {
      href: 'https://test.tosslib.com/repo/io/vertx/vertx-web-sstore-cookie/4.5.21/vertx-web-sstore-cookie-4.5.21.jar',
      label: '.jar',
    },
    {
      href: 'https://test.tosslib.com/repo/io/vertx/vertx-web-sstore-cookie/4.5.21/vertx-web-sstore-cookie-4.5.21.zip',
      label: '.zip',
    },
    {
      href: 'https://test.tosslib.com/repo/io/vertx/vertx-web-sstore-cookie/4.5.21/vertx-web-sstore-cookie-4.5.21.tar.gz',
      label: '.tar.gz',
    },
  ],
}

const REQUESTS = {
  detailLang: 'python',
  name: 'requests',
  version: '2.31.0',
  componentCode: 'py-req-demo-01',
  groupId: '',
  artifactId: 'requests',
  language: 'Python',
  descriptionEn: 'HTTP for Humans — simple and elegant HTTP library for Python.',
  descriptionZh: '简洁易用的 Python HTTP 客户端库，广泛用于调用 REST API 与网页请求场景。',
  parentSoftwares: [{ name: 'httpbin-demo', version: '1.0.0', softwareDetailQuery: {} }],
  licenses: [{ name: 'Apache License 2.0', code: 'Apache-2.0', version: '2.31.0', type: 'apache' }],
  binaryPackages: [],
  packageDownloads: [
    { href: 'https://files.pythonhosted.org/packages/demo/requests-2.31.0-py3-none-any.whl', label: '.whl' },
  ],

  // —— 模板化介绍区 ——
  versionDesc: '一个简单而优雅的 HTTP 库，支持发送 HTTP/1.1 请求。',
  overviewParagraphs: [
    '**requests** 是一个用 Python 编写的 HTTP 客户端库，把发请求这件事收敛成一行调用：不需要手工拼接 URL 查询串、不需要自己处理编码、也不需要为表单与 JSON 分别写序列化逻辑。',
    '它建立在 `urllib3` 之上，默认开启**连接复用（Keep-Alive）**与连接池，因此在批量调用场景下比裸 `urllib` 更省握手开销；同时保留完整的会话对象，可跨请求保持 Cookie 与认证头。',
    '项目的设计目标是最小惊讶：接口贴近自然语言，异常体系统一（连接错误、超时、HTTP 状态错误各有明确类型），并对外提供**流式上传下载**与国际化域名、URL 的透明处理。',
    '在工程实践中，它通常作为服务间调用的默认客户端：配合 `Session` 做连接池复用，配合 `timeout` 做超时兜底，配合 `raise_for_status()` 把异常交给上层统一处理，避免把状态判断散落在业务代码里。',
  ],
  envRequirement: 'Python 3.10 及以上（官方支持 3.10+）',
  installCmd: 'python -m pip install requests',
  quickStart: `import requests

# 发送 GET 请求
resp = requests.get(
    'https://api.github.com/repos/psf/requests',
    params={'page': 1},
    timeout=10,
)
resp.raise_for_status()
print(resp.status_code, resp.json()['full_name'])`,
  projectStructure: `requests/
├── requests/
│   ├── __init__.py       # 对外 API 入口
│   ├── api.py            # get/post/put/delete 等
│   ├── sessions.py       # Session 与连接池
│   ├── models.py         # Request/Response
│   ├── adapters.py       # HTTPAdapter
│   ├── cookies.py        # Cookie 持久化
│   └── structures.py     # 数据结构
└── tests/                # 测试用例`,
  features: [
    '极简的 HTTP/1.1 请求发送，无需手动拼接 URL 查询字符串',
    '连接复用（Keep-Alive）与连接池，默认开启',
    '国际化域名与 URL 自动处理',
    '会话对象支持 Cookie 持久化',
    '自动内容解码、流式上传与下载',
  ],

  // —— 右栏：源码地址 ——
  sourcePkgList: [
    { label: '.zip', href: 'https://files.pythonhosted.org/packages/demo/requests-2.31.0.zip' },
    { label: '.tar.gz', href: 'https://files.pythonhosted.org/packages/demo/requests-2.31.0.tar.gz' },
  ],
  signUrl: 'https://files.pythonhosted.org/packages/demo/requests-2.31.0.asc',
  copyrightUrl: 'https://github.com/psf/requests/blob/main/LICENSE',

  // —— 右栏：参考信息 ——
  codeLines: 12,
  vitality: '成熟期',
  eolDate: '',
  integrationRisk: '低',
  industry: '通信,工业',
}

const OPENSSL = {
  detailLang: 'cpp',
  name: 'openssl',
  version: '3.2.1',
  componentCode: 'cpp-openssl-demo',
  groupId: '',
  artifactId: 'openssl',
  language: 'C/C++',
  descriptionEn: 'OpenSSL toolkit for TLS and cryptography (Conan 包演示).',
  descriptionZh: 'TLS 与密码学工具库（演示 Conan 引入方式）。',
  parentSoftwares: [],
  licenses: [{ name: 'Apache License 2.0', code: 'Apache-2.0', version: '3.2.1', type: 'apache' }],
  binaryPackages: [],
  packageDownloads: [],
}

const AXIOS = {
  detailLang: 'javascript',
  name: 'axios',
  version: '1.6.7',
  componentCode: 'npm-axios-demo',
  groupId: '',
  artifactId: 'axios',
  language: 'JavaScript',
  descriptionEn: 'Promise based HTTP client for the browser and Node.js.',
  descriptionZh: '基于 Promise 的 HTTP 客户端，适用于浏览器与 Node.js 环境。',
  parentSoftwares: [],
  licenses: [{ name: 'MIT License', code: 'MIT', version: '1.6.7', type: 'mit' }],
  binaryPackages: [],
  packageDownloads: [{ href: 'https://registry.npmjs.org/axios/-/axios-1.6.7.tgz', label: '.tgz' }],
}

const VUE = {
  detailLang: 'typescript',
  name: 'vue',
  version: '3.4.21',
  componentCode: 'npm-vue-demo',
  groupId: '',
  artifactId: 'vue',
  language: 'TypeScript',
  descriptionEn: 'Progressive JavaScript framework; TypeScript 项目常用 npm 依赖示例。',
  descriptionZh: '渐进式前端框架；演示 TypeScript 场景下的 npm 引入。',
  parentSoftwares: [],
  licenses: [{ name: 'MIT License', code: 'MIT', version: '3.4.21', type: 'mit' }],
  binaryPackages: [],
  packageDownloads: [{ href: 'https://registry.npmjs.org/vue/-/vue-3.4.21.tgz', label: '.tgz' }],
}

const GIN = {
  detailLang: 'go',
  name: 'gin',
  version: '1.9.1',
  goModule: 'github.com/gin-gonic/gin',
  componentCode: 'go-gin-demo',
  groupId: '',
  artifactId: 'gin',
  language: 'Go',
  descriptionEn: 'HTTP web framework for Go.',
  descriptionZh: 'Go 语言 HTTP Web 框架，演示 go get 模块路径。',
  parentSoftwares: [],
  licenses: [{ name: 'MIT License', code: 'MIT', version: '1.9.1', type: 'mit' }],
  binaryPackages: [],
  packageDownloads: [],
}

const TOKIO = {
  detailLang: 'rust',
  name: 'tokio',
  version: '1.36.0',
  componentCode: 'rs-tokio-demo',
  groupId: '',
  artifactId: 'tokio',
  language: 'Rust',
  descriptionEn: 'Async runtime for Rust.',
  descriptionZh: 'Rust 异步运行时；演示 Cargo.toml 依赖写法。',
  parentSoftwares: [],
  licenses: [{ name: 'MIT License', code: 'MIT', version: '1.36.0', type: 'mit' }],
  binaryPackages: [],
  packageDownloads: [],
}

const KOTLINX_COROUTINES = {
  detailLang: 'kotlin',
  name: 'kotlinx-coroutines-core',
  version: '1.8.0',
  componentCode: 'kt-coroutines-demo',
  groupId: 'org.jetbrains.kotlinx',
  artifactId: 'kotlinx-coroutines-core',
  language: 'Kotlin',
  descriptionEn: 'Coroutines support libraries for Kotlin.',
  descriptionZh: 'Kotlin 协程核心库；演示 Gradle Kotlin DSL 引入。',
  parentSoftwares: [],
  licenses: [{ name: 'Apache License 2.0', code: 'Apache-2.0', version: '1.8.0', type: 'apache' }],
  binaryPackages: [],
  packageDownloads: [],
}

const AKKA_HTTP = {
  detailLang: 'scala',
  name: 'akka-http',
  version: '10.6.3',
  componentCode: 'scala-akka-http-demo',
  groupId: 'com.typesafe.akka',
  artifactId: 'akka-http',
  language: 'Scala',
  descriptionEn: 'Akka HTTP is a module for building reactive HTTP services.',
  descriptionZh: 'Akka HTTP 模块，用于构建响应式 HTTP 服务；演示 sbt 引入。',
  parentSoftwares: [],
  licenses: [{ name: 'Apache License 2.0', code: 'Apache-2.0', version: '10.6.3', type: 'apache' }],
  binaryPackages: [],
  packageDownloads: [],
}

const THUMBNAILATOR = {
  detailLang: 'java',
  name: 'thumbnailator',
  version: '0.4.20',
  componentCode: 'java-thumb-demo',
  groupId: 'net.coobird',
  artifactId: 'thumbnailator',
  language: 'Java',
  descriptionEn: 'Thumbnail generation library with fluent API for Java.',
  descriptionZh: 'Java 图片缩略图与尺寸变换库，链式 API，适合批量生成缩略图。',
  parentSoftwares: [],
  licenses: [{ name: 'MIT License', code: 'MIT', version: '0.4.20', type: 'mit' }],
  binaryPackages: [],
  packageDownloads: [],
}

const TWELVEMONKEYS_IMAGEIO = {
  detailLang: 'java',
  name: 'imageio-jpeg',
  version: '3.12.0',
  componentCode: 'java-12m-demo',
  groupId: 'com.twelvemonkeys.imageio',
  artifactId: 'imageio-jpeg',
  language: 'Java',
  descriptionEn: 'Extended ImageIO plugins for JPEG and more formats.',
  descriptionZh: '扩展 Java ImageIO 的编解码插件，支持更多图片格式与元数据读取。',
  parentSoftwares: [],
  licenses: [{ name: 'BSD 3-Clause', code: 'BSD-3-Clause', version: '3.12.0', type: 'bsd' }],
  binaryPackages: [],
  packageDownloads: [],
}

const IMGSCALR = {
  detailLang: 'java',
  name: 'imgscalr',
  version: '4.2',
  componentCode: 'java-imgscalr-demo',
  groupId: 'org.imgscalr',
  artifactId: 'imgscalr',
  language: 'Java',
  descriptionEn: 'Simple high-quality image scaling for Java.',
  descriptionZh: '纯 Java 实现的图片缩放库，API 简单，适合服务端生成多种尺寸。',
  parentSoftwares: [],
  licenses: [{ name: 'Apache License 2.0', code: 'Apache-2.0', version: '4.2', type: 'apache' }],
  binaryPackages: [],
  packageDownloads: [],
}

/**
 * MaxKB：开源知识库问答系统（Python / Django）。
 * 引入它主要是为了承载 0Day 漏洞演示数据（见 zerodayMocks.js）——
 * 现有 12 个组件都是基础库，没有可对应的 0Day 样例。
 */
const MAXKB = {
  detailLang: 'python',
  name: 'maxkb',
  version: '2.10.0',
  componentCode: 'py-maxkb-demo',
  groupId: '',
  artifactId: 'maxkb',
  language: 'Python',
  descriptionEn:
    'MaxKB is an open-source knowledge base question-answering system based on LLM, supporting RAG pipelines and agent workflows.',
  descriptionZh:
    'MaxKB 是基于大模型的开源知识库问答系统，支持 RAG 检索增强与工作流编排，可作为企业知识库与智能客服底座。',
  parentSoftwares: [],
  licenses: [
    { name: 'GNU General Public License v3.0', code: 'GPL-3.0', version: '2.10.0', type: 'gpl' },
    // 演示「同一组件存在多个许可证」的场景
    { name: '商业授权', code: 'Commercial', version: '2.10.0', type: 'other' },
  ],
  binaryPackages: [],
  packageDownloads: [
    { href: 'https://pypi.org/project/maxkb/', label: 'PyPI' },
  ],

  // —— 模板化介绍区 ——
  versionDesc: '基于大模型的开源知识库问答系统，支持 RAG 检索增强与工作流编排。',
  overviewParagraphs: [
    '**MaxKB** 是一套开箱即用的企业级知识库问答系统，把「文档进、答案出」的完整链路封装在同一个控制台里：上传文档、自动解析与向量化、检索增强、模型回答，步骤之间不需要自己写胶水代码。',
    '检索侧支持多种**分段策略**与重排，回答会附带原文出处，便于核对；应用侧可把知识库发布为独立访问页面或标准 API，由业务系统直接调用。',
    '它还提供**工作流编排**能力，可把知识检索、大模型调用与函数节点串成一条流程，用于客服、内部知识助手等场景。',
    '部署上支持容器化交付，数据库与向量库可独立部署；`ToolExecutor` 负责执行用户自定义函数，因此生产环境需要额外评估沙箱隔离与网络出站策略。',
  ],
  envRequirement: 'Python 3.10 及以上；推荐 4C8G 以上并单独部署向量库',
  installCmd: 'docker run -d --name=maxkb -p 8080:8080 registry.fit2cloud.com/maxkb/maxkb',
  quickStart: `# 1. 启动服务后访问 http://localhost:8080
# 2. 首次登录使用默认管理员账号创建知识库
# 3. 上传文档并等待向量化完成
# 4. 创建应用，选择模型与知识库即可对话`,
  projectStructure: `maxkb/
├── apps/
│   ├── application/      # 应用与对话
│   ├── knowledge/        # 知识库与文档解析
│   ├── models_provider/  # 模型接入
│   └── common/           # 工具沙箱、异常处理
├── ui/                   # 前端工程
└── installer/            # 部署脚本`,
  features: [
    '支持文档上传后自动解析与向量化，构建企业知识库',
    'RAG 检索增强，回答附带原文出处',
    '工作流编排，可串联检索、模型与函数节点',
    '多模型接入，兼容主流大模型 API',
    '应用对外发布为独立访问页面或 API',
  ],

  // —— 右栏：源码地址 ——
  sourcePkgList: [{ label: '.tar.gz', href: 'https://github.com/1Panel-dev/MaxKB/archive/refs/tags/v2.10.0.tar.gz' }],
  signUrl: '',
  copyrightUrl: 'https://github.com/1Panel-dev/MaxKB/blob/main/LICENSE',

  // —— 右栏：参考信息 ——
  codeLines: 186,
  vitality: '成长期',
  eolDate: '',
  integrationRisk: '中',
  industry: '互联网',
}

/** @type {Record<string, typeof VERTX & { detailLang: string, goModule?: string }>} */
export const COMPONENT_MOCKS = {
  'vertx-web-sstore-cookie': VERTX,
  requests: REQUESTS,
  openssl: OPENSSL,
  axios: AXIOS,
  vue: VUE,
  gin: GIN,
  tokio: TOKIO,
  'kotlinx-coroutines-core': KOTLINX_COROUTINES,
  'akka-http': AKKA_HTTP,
  thumbnailator: THUMBNAILATOR,
  'twelvemonkeys-imageio': TWELVEMONKEYS_IMAGEIO,
  imgscalr: IMGSCALR,
  maxkb: MAXKB,
}

/** 组件库列表展示顺序（与九种引入语言一一对应演示） */
export const COMPONENT_LIBRARY_IDS = [
  'vertx-web-sstore-cookie',
  'requests',
  'openssl',
  'axios',
  'vue',
  'gin',
  'tokio',
  'kotlinx-coroutines-core',
  'akka-http',
  'thumbnailator',
  'twelvemonkeys-imageio',
  'imgscalr',
  'maxkb',
]

function slugToArtifactId(slug) {
  const s = String(slug || 'package')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
  return s.replace(/^-|-$/g, '') || 'package'
}

function buildFallbackMock(id) {
  const name = String(id || 'component').trim() || 'component'
  const artifactId = slugToArtifactId(name)
  return {
    detailLang: 'java',
    name,
    version: '1.0.0',
    componentCode: 'demo-' + artifactId.slice(0, 12),
    groupId: 'org.example',
    artifactId,
    language: 'Java',
    descriptionEn: `Demo placeholder for component «${name}».`,
    descriptionZh: `演示组件「${name}」的占位说明，接入接口后可替换为真实元数据与依赖坐标。`,
    parentSoftwares: [],
    licenses: [{ name: 'MIT License', code: 'MIT', version: '1.0.0', type: 'mit' }],
    binaryPackages: [],
    packageDownloads: [],
  }
}

/**
 * 详情页视图期望的字段与 mock 原始字段存在差异，
 * 这里统一补齐展示所需的扩展字段（演示用默认值），
 * 保证任意组件都有完整信息可渲染。
 */
function enrichExtras(row) {
  const name = String(row.name || 'component')
  const lang = row.language || 'Java'
  const v = String(row.version || '1.0.0')
  // 版本号首段常是 1~2 位（如 2.31.0 → '2'），不能直接当年份，否则会拼出「2-01-15」
  const firstSeg = v.split('.')[0] || ''
  const year = /^\d{4}$/.test(firstSeg) ? firstSeg : '2024'
  const licenseCodes = Array.isArray(row.licenses)
    ? row.licenses.map((l) => l && l.code).filter(Boolean)
    : []
  // links 先算出来，后面的 scm / sourceUrl 要复用它（原来引用 row.links 时还没生成，回退永远落空）
  const links = row.links || {
    source: `https://github.com/demo/${name}`,
    sourceText: 'GitHub',
    website: `https://${name}.example.com`,
    websiteText: '官网',
    docs: `https://docs.${name}.example.com`,
    docsText: '文档',
  }
  return {
    ...row,
    author: row.author || '开源社区维护',
    released: row.released || `${year}-01-15`,
    lastUpdated: row.lastUpdated || '2024-03-20',
    industry: row.industry || '基础组件',
    score: row.score ?? 8.0,
    vulnCount: row.vulnCount ?? 0,
    stars: row.stars ?? 12800,
    downloads: row.downloads || '2.4M',
    license: row.license || { names: licenseCodes.length ? licenseCodes : ['MIT'] },
    links,
    tags: row.tags && row.tags.length ? row.tags : [lang, '开源', '稳定', '流行'],

    /* ===== 模板化介绍区（固定六块）所需字段 =====
       上游 README 排版不固定，这里只取结构化字段，
       缺什么就留空，由前端统一显示「—」，不伪造内容。 */
    versionDesc: row.versionDesc || row.descriptionZh || '',
    overviewParagraphs: row.overviewParagraphs || [],
    envRequirement: row.envRequirement || '',
    installCmd: row.installCmd || '',
    quickStart: row.quickStart || '',
    projectStructure: row.projectStructure || '',
    features: row.features || [],

    /* ===== 右栏「源码地址」 ===== */
    scm: row.scm || links.source || '',
    sourcePkgList: row.sourcePkgList || [],
    signUrl: row.signUrl || '',
    sourceUrl: row.sourceUrl || links.website || '',
    copyrightUrl: row.copyrightUrl || '',

    /* ===== 右栏「参考信息」 ===== */
    codeLines: row.codeLines ?? null,
    vitality: row.vitality || '',
    eolDate: row.eolDate || '',
    integrationRisk: row.integrationRisk || '',
  }
}

/**
 * @param {string | undefined} id 路由 param，已解码
 */
export function getComponentMock(id) {
  const raw = id != null && String(id).trim() !== '' ? String(id).trim() : 'vertx-web-sstore-cookie'
  const row = COMPONENT_MOCKS[raw] || buildFallbackMock(raw)
  const k = row.detailLang
  const base = isDetailLangKey(k) ? row : { ...row, detailLang: 'java' }
  return enrichExtras(base)
}
