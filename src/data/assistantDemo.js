/**
 * AI 助手页：推荐问题与演示回复（无真实大模型，点击后模拟延迟输出）
 */

import { COMPONENT_MOCKS } from './componentDetailMocks.js'

/**
 * @type {{ id: string, text: string, icon: string, category: string, categoryEmoji: string }[]}
 * 首条为「软件发现与选型」，仅用于欢迎卡首行；其余 5 条带 categoryEmoji，与欢迎列表、推荐按钮一致。
 */
export const RECOMMENDED_QUESTIONS = [
  {
    id: 'discover-java-crypto',
    text: '帮我推荐几个金融行业常用、高性能的 Java 加密库。',
    icon: 'discovery',
    category: '软件发现与选型',
    categoryEmoji: '',
  },
  {
    id: 'risk-cve',
    text: 'OpenSSL 当前最新的版本有高危漏洞吗？对应的 CVEID 是什么？',
    icon: 'vuln',
    category: '安全风险评估',
    categoryEmoji: '🛡️',
  },
  {
    id: 'license-compliance',
    text: '我想在商用项目里引入 axios，它的开源 License 有合规风险吗？',
    icon: 'license',
    category: '协议合规咨询',
    categoryEmoji: '⚖️',
  },
  {
    id: 'supply-chain',
    text: 'Werkzeug 的依赖树里，是否引用了含有风险的上游组件？',
    icon: 'supply',
    category: '供应链依赖分析',
    categoryEmoji: '⛓️',
  },
  {
    id: 'integrate-maven-npm',
    text: '请给出 thumbnailator 在 Maven、axios 在 NPM 中的引入配置代码。',
    icon: 'import',
    category: '快速集成指导',
    categoryEmoji: '💻',
  },
  {
    id: 'maintain-health',
    text: 'Werkzeug 的开发商是谁？最近一年的版本更新和评分情况如何？',
    icon: 'maintain',
    category: '维护状态查询',
    categoryEmoji: '📈',
  },
]

/**
 * @typedef {{ kind: 'component', componentId: string, title: string, version: string, language: string }} AssistantComponentCard
 * @typedef {{ kind: 'software', name: string, version: string, score: string, vulnCount: number, language: string }} AssistantSoftwareCard
 * @typedef {AssistantComponentCard | AssistantSoftwareCard} AssistantCard
 * @typedef {{ text: string, cards?: AssistantCard[] }} AssistantReply
 */

/**
 * @param {string} componentId
 * @returns {AssistantComponentCard}
 */
export function componentAssistantCard(componentId) {
  const m = COMPONENT_MOCKS[componentId]
  if (!m) {
    return {
      kind: 'component',
      componentId,
      title: componentId,
      version: '—',
      language: '—',
    }
  }
  return {
    kind: 'component',
    componentId,
    title: m.name,
    version: m.version,
    language: m.language,
  }
}

/** @returns {AssistantSoftwareCard} */
function softwareWerkzeugDemoCard() {
  return {
    kind: 'software',
    name: 'werkzeug',
    version: '2.3.7',
    score: '5.5',
    vulnCount: 3,
    language: 'Python',
  }
}

const matchers = [
  {
    test: (q) =>
      /thumbnailator|axios/i.test(q) && /maven|npm|pnpm|yarn|gradle/i.test(q) && /引入|配置|坐标|依赖|pom|package\.json|安装/i.test(q) ||
      (/maven|npm|pnpm|yarn|gradle/i.test(q) && /引入|配置|坐标|依赖|pom|package\.json|安装/i.test(q)),
    reply: () => ({
      text:
        '以下为演示：Java 可在 Maven / Gradle 中声明 GAV 坐标；JavaScript 可用 npm / yarn / pnpm 安装包名与版本。具体片段请以各组件详情页的「引入依赖」「快速开始」为准，可直接复制到工程。\n\n',
      cards: [componentAssistantCard('thumbnailator'), componentAssistantCard('axios')],
    }),
  },
  {
    test: (q) => /werkzeug/i.test(q) && /依赖树|供应链|上游|风险/.test(q),
    reply: () => ({
      text:
        'Werkzeug 为 Python WSGI 工具库，是否引入含风险的上游组件需结合 PyPI 依赖声明、SBOM 与漏洞情报穿透判断。以下为平台「软件详情」演示条目，可在依赖关系等栏目继续下钻（数据为演示）。\n\n',
      cards: [softwareWerkzeugDemoCard()],
    }),
  },
  {
    test: (q) => /依赖树|供应链|上游.*组件|含有风险的上游|穿透/i.test(q),
    reply: () => ({
      text:
        '供应链风险需结合 SBOM、锁文件与漏洞库做上游穿透；本平台演示中，Vert.x 相关条目会展示与上游模块的关联（如 vertx-web、vertx-core），可在详情继续查看 License 与漏洞字段并做策略标注。\n\n',
      cards: [componentAssistantCard('vertx-web-sstore-cookie')],
    }),
  },
  {
    test: (q) =>
      (/openssl/i.test(q) && /cve|漏洞|高危/i.test(q)) || /cveid|高危漏洞/i.test(q),
    reply: () => ({
      text:
        '是否命中高危与具体 CVE 编号取决于当前版本与情报库匹配结果。以下为演示：请在 OpenSSL 组件详情的「漏洞信息」中查看等级、CVE、影响说明（演示数据，生产环境请以厂商安全通告为准）。\n\n',
      cards: [componentAssistantCard('openssl')],
    }),
  },
  {
    test: (q) =>
      /axios/i.test(q) && /合规|license|许可证|开源协议/i.test(q) ||
      /合规风险/.test(q) ||
      (/license|许可证|开源协议/i.test(q) && /商用|商业|引入|项目/i.test(q)),
    reply: () => ({
      text:
        '开源 License 是否「可商用、无合规雷区」需结合使用方式（是否修改、是否再分发、专利与商标条款等）由法务评估。以下为演示：axios 为 MIT，一般允许商用但需保留版权声明；请在详情页核对 SPDX 与多版本许可记录。\n\n',
      cards: [componentAssistantCard('axios')],
    }),
  },
  {
    test: (q) =>
      /werkzeug/i.test(q) && (/开发商|维护者|谁在维护|作者|版本|评分|最近一年/.test(q)) ||
      (/开发商|维护者|谁在维护|作者是谁/.test(q) && /库|软件|组件/.test(q)) ||
      (/最近一年/.test(q) && /版本|评分|更新/.test(q)),
    reply: () => ({
      text:
        '维护主体、发布节奏与历史评分可在软件/组件详情的「基本信息」「版本历史」等栏目查看。以下为演示：Werkzeug 由 Pallets 社区维护，并可在平台查看演示用的评分与漏洞统计时间线。\n\n',
      cards: [softwareWerkzeugDemoCard()],
    }),
  },
  {
    test: (q) =>
      (/金融|加密库|国密|fips|tls/i.test(q) && /java/i.test(q) && /推荐|选型|常用|高性能/.test(q)) ||
      (/java/i.test(q) && /加密库/.test(q) && /推荐|几个/.test(q)),
    reply: () => ({
      text:
        '金融场景下的 Java 选型通常同时关注算法与协议（含国密/FIPS）、密钥与证书治理、以及漏洞响应速度。演示平台可跳转：OpenSSL（TLS/密码学能力参考）与 Vert.x 生态模块（Java 侧 Web/会话类示例）；生产请叠加内部安全基线与合规测评结论。\n\n',
      cards: [componentAssistantCard('openssl'), componentAssistantCard('vertx-web-sstore-cookie')],
    }),
  },
  {
    test: (q) => /图片|图像|image|jpeg|png|缩略图/i.test(q) && /java/i.test(q),
    reply: () => ({
      text:
        '在 Java 生态里，下面几款开源库常用于图片读取、缩放、格式转换与缩略图生成，可按场景选用：\n\n' +
        '• Thumbnailator — 链式 API，适合批量缩略图与尺寸变换。\n' +
        '• TwelveMonkeys ImageIO — 扩展标准 ImageIO，读写更多格式与元数据。\n' +
        '• imgscalr — 纯 Java 缩放实现，接入简单。\n\n' +
        '下方为本平台已收录的对应组件，可进入详情查看版本、License 与「引入依赖 / 快速开始」。',
      cards: [
        componentAssistantCard('thumbnailator'),
        componentAssistantCard('twelvemonkeys-imageio'),
        componentAssistantCard('imgscalr'),
      ],
    }),
  },
]

/**
 * @param {string} userText
 * @returns {AssistantReply}
 */
export function matchAssistantReply(userText) {
  const q = String(userText || '').trim()
  for (const m of matchers) {
    if (m.test(q)) return m.reply()
  }
  return {
    text:
      '感谢提问。当前为演示环境，我暂时只能识别首页欢迎区列出的几类问法（选型、CVE、License 合规、供应链、Maven/npm 引入、维护与评分等）以及部分扩展说法。\n\n' +
      '您可点击推荐问题或换一种表述重试；正式环境可接入大模型与平台检索接口。',
  }
}
