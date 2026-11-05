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
