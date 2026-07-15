# 漏洞预警

查询已关注软件的漏洞预警信息，支持按软件包名、严重等级、处理状态、预警时间范围筛选。每条预警包含 CVE 详情、置信度、处理状态及处置建议。

- **方法**：GET
- **路径**：`/v1/vulnerabilities/alerts`
- **等级**：热门
- **Content-Type**：`application/json`

## 请求参数

| 参数 | 位置 | 类型 | 必填 | 说明 |
|:---|:---|:---|:---|:---|
| `Authorization` | Header | string | 是 | Bearer Token，格式 `Bearer sk_live_xxxx` |
| `package` | Query | string | 否 | 软件包名筛选，不传返回全部关注软件 |
| `severity` | Query | string | 否 | 严重等级筛选：`low` / `medium` / `high` / `critical` |
| `status` | Query | string | 否 | 处理状态筛选：`pending` / `resolved` / `ignored` |
| `alerted_after` | Query | string | 否 | 预警时间起始（ISO 8601），如 `2026-07-01T00:00:00Z` |
| `alerted_before` | Query | string | 否 | 预警时间截止（ISO 8601），如 `2026-07-14T23:59:59Z` |
| `page` | Query | int | 否 | 页码，默认 1 |
| `size` | Query | int | 否 | 每页数量，默认 20，最大 50 |

## 请求示例

```bash
curl "https://api.tosslib.example/v1/vulnerabilities/alerts?severity=critical&status=pending&alerted_after=2026-07-01T00:00:00Z" \
  -H "Authorization: Bearer sk_live_xxxx"
```

## 响应参数

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `code` | int | 错误码，0 表示成功 |
| `msg` | string | 提示信息 |
| `data.total` | int | 匹配告警总数 |
| `data.page` | int | 当前页码 |
| `data.items` | array | 告警列表 |

**`items[]` 元素结构**

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `alert_id` | string | 告警 ID |
| `package` | string | 软件包名 |
| `version` | string | 版本号 |
| `title` | string | 预警标题，如 `【漏洞预警】lxml 5.3.0 存在 HIGH 漏洞` |
| `cve_id` | string | CVE 编号 |
| `severity` | string | 风险等级：`low` / `medium` / `high` / `critical` |
| `cvss` | float | CVSS 评分 0~10 |
| `confidence` | float | 置信度 0~1 |
| `published_at` | string | 漏洞发布时间（ISO 8601） |
| `alerted_at` | string | 预警时间（ISO 8601） |
| `patch_status` | string | 修补状态：`patched` / `unpatched` / `partial` |
| `status` | string | 处理状态：`pending` / `resolved` / `ignored` |
| `summary` | string | 漏洞简介 |
| `suggestion` | string | 处置建议 |
| `detail_url` | string | 漏洞详情链接 |

## 响应示例

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "total": 1,
    "page": 1,
    "items": [
      {
        "alert_id": "alt_8a3f2c1e",
        "package": "lxml",
        "version": "5.3.0",
        "title": "【漏洞预警】lxml 5.3.0 存在 HIGH 漏洞",
        "cve_id": "CVE-2026-50001",
        "severity": "critical",
        "cvss": 9.8,
        "confidence": 0.95,
        "published_at": "2026-07-13T19:47:00Z",
        "alerted_at": "2026-07-13T20:00:00Z",
        "patch_status": "unpatched",
        "status": "pending",
        "summary": "lxml XML反序列化漏洞(CVE-2026-50001)，攻击者可通过构造恶意XML触发远程代码执行。",
        "suggestion": "建议您及时查看详细信息并采取必要措施。",
        "detail_url": "https://tosslib.example/v1/vulnerabilities/detail/CVE-2026-50001"
      }
    ]
  }
}
```

## 告警通知内容格式

当触发预警时，通知内容按以下模板生成：

```
软件安全风险预警

【漏洞预警】lxml 5.3.0 存在 HIGH 漏洞

漏洞信息如下：

漏洞名称：【漏洞预警】lxml 5.3.0 存在 超危 漏洞 CVE-2026-50001
漏洞编号：CVE-2026-50001
风险等级：CRITICAL
CVSS评分：9.8
置信度：0.95
预警时间：2026-07-13 20:00:00
处理状态：未处理
发布时间：2026-07-13 19:47:00
修补状态：未修补
漏洞简介：lxml XML反序列化漏洞(CVE-2026-50001)，攻击者可通过构造恶意XML触发远程代码执行。
建议您及时查看详细信息并采取必要措施。
```

## 专属错误码

| code | HTTP | 含义 |
|:---|:---|:---|
| 40401 | 404 | 未找到该软件包 |
| 40402 | 404 | 版本不存在 |