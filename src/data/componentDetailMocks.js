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
 * @param {string | undefined} id 路由 param，已解码
 */
export function getComponentMock(id) {
  const raw = id != null && String(id).trim() !== '' ? String(id).trim() : 'vertx-web-sstore-cookie'
  const row = COMPONENT_MOCKS[raw] || buildFallbackMock(raw)
  const k = row.detailLang
  if (isDetailLangKey(k)) return row
  return { ...row, detailLang: 'java' }
}
