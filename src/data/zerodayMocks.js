/**
 * 0Day 漏洞演示数据，按组件 id 挂载（与 componentDetailMocks.js 的 COMPONENT_MOCKS 同键）。
 *
 * 字段严格对应《0Day 漏洞样例可直接提供字段 V1.0》的六项：
 *   vulnerability_types  漏洞类别
 *   summary              漏洞描述
 *   severity             漏洞等级（沿用供应链漏洞的 CRITICAL/HIGH/MEDIUM/LOW 体系）
 *   affected_components  涉及组件
 *   affected_files       涉及文件
 *   impact               漏洞影响
 *
 * 展示边界（实现时必须遵守）：
 *   1. 0Day 行展示「类别」并加 0Day 标签，**不展示漏洞编号**；
 *   2. 不提供入口函数、行号、代码片段、验证状态、验证过程、修复状态、修复建议；
 *   3. 原文未提供的风险评分 / 发现日期 / 发布日期 / 更新时间一律不补造，
 *      界面需要展示时显示「—」，不得用等级、自评向量或平台同步时间顶替；
 *   4. 原文的凭据、请求数据包、授权图片链接不纳入。
 *
 * 刻意不设 cve_id / cvss_score / publish_date / fix_suggestion / ref_url 字段：
 * 从数据结构上就不给「补造这些值」留口子。
 */

/** @type {Record<string, Array<{
 *   id: string, severity: string, vulnerability_types: string, summary: string,
 *   affected_components: string, affected_files: string, impact: string
 * }>>} */
export const ZERODAY_BY_COMPONENT = {
  maxkb: [
    {
      id: 'zd-maxkb-toolexec-001',
      severity: 'HIGH',
      vulnerability_types: '用户代码执行（RCE）、沙箱绕过',
      summary: 'MaxKB V2.10.0 的 ToolExecutor 用户 Python 代码被执行，沙箱存在多处可绕过缺陷。',
      affected_components: 'MaxKB ToolExecutor 沙箱',
      affected_files: 'apps/common/utils/tool_code.py',
      impact: '通过 socket 扫描和攻击内网；文件系统读取；沙箱配置读取；DNS 数据外传；外网 C2 通信。',
    },
    {
      id: 'zd-maxkb-file-read-002',
      severity: 'CRITICAL',
      vulnerability_types: '路径穿越、任意文件读取',
      summary: '知识库文档上传环节未对归档内的相对路径做归一化校验，解压时可写入工程目录之外的路径并随后被下载接口读取。',
      affected_components: 'MaxKB 知识库文档解析服务',
      affected_files: 'apps/common/handle/impl/zip_split_handle.py',
      impact: '读取容器内任意文件，包括数据库连接串、平台密钥与其它租户上传的文档；可进一步覆盖启动脚本实现持久化。',
    },
    {
      id: 'zd-maxkb-ssrf-003',
      severity: 'HIGH',
      vulnerability_types: '服务端请求伪造（SSRF）',
      summary: 'Web 站点抓取与 URL 导入未限制目标地址，攻击者可构造指向内网或云元数据服务的地址，由服务端代为发起请求。',
      affected_components: 'MaxKB Web 站点抓取、知识库 URL 导入',
      affected_files: 'apps/common/utils/web.py',
      impact: '探测并访问内网服务；读取云厂商元数据接口获取临时凭据；绕过网络边界访问仅内网可达的管理接口。',
    },
    {
      id: 'zd-maxkb-idor-004',
      severity: 'MEDIUM',
      vulnerability_types: '越权访问（IDOR）',
      summary: '应用对话相关的部分接口仅校验登录态，未校验资源归属，替换请求中的资源标识即可访问他人空间下的会话与知识库内容。',
      affected_components: 'MaxKB 应用对话接口',
      affected_files: 'apps/application/views/application_chat_record.py',
      impact: '横向读取其它用户的知识库问答内容与上传文档摘要，配合其他缺陷可进一步获取文档原文。',
    },
    {
      id: 'zd-maxkb-info-leak-005',
      severity: 'MEDIUM',
      vulnerability_types: '敏感信息泄漏',
      summary: '异常处理未区分运行环境，生产模式下仍将完整堆栈与数据库连接信息返回给前端；同时调试日志中记录了模型接口的明文密钥。',
      affected_components: 'MaxKB 全局异常处理与日志模块',
      affected_files: 'apps/common/exception/handle_exception.py',
      impact: '泄露数据库地址与凭据、第三方模型接口密钥；堆栈中的文件路径与依赖版本可被用于进一步挑选攻击面。',
    },
  ],
}

/**
 * 取某组件的 0Day 漏洞列表。
 * 无对应数据时返回空数组 —— 界面据此展示「暂无 0Day 漏洞情报」，
 * 不伪造条目，也不把「没有数据」表现为「绝对安全」。
 */
export function getZerodayByComponent(componentId) {
  const key = componentId != null ? String(componentId).trim() : ''
  if (!key) return []
  return ZERODAY_BY_COMPONENT[key] || []
}