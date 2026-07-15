# OpenAPI 概览

OpenAPI 提供标准 RESTful 接口，覆盖软件组成分析、漏洞检测、许可证合规、SBOM 生成等核心场景，可快速集成到研发流水线中。

## 核心指标

| 指标 | 值 |
|:---|:---|
| 接口数量 | 8 个 |
| 平均响应时间 | < 200ms |
| 传输加密 | HTTPS（TLS 1.3） |
| SLA | 99.9% |

## Base URL

```
https://api.tosslib.example/v1
```

所有接口均以 `/v1` 为前缀，后续版本将保持向后兼容。

## 接口速览

| 接口 | 方法 | 路径 | 等级 |
|:---|:---|:---|:---|
| SCA 扫描 | POST | `/v1/sca/scan` | 免费 |
| 漏洞预警 | GET | `/v1/vulnerabilities/alerts` | 热门 |
| SBOM 生成 | POST | `/v1/sbom/generate` | 免费 |
| AI 智能选型助手 | POST | `/v1/ai/assist` | 内测 |
| 开源合规查询 | GET | `/v1/license/query` | 免费 |
| 恶意代码检测 | POST | `/v1/malware/scan` | 热门 |
| 软件搜索 | GET | `/v1/software/search` | 免费 |
| 软件详情 | GET | `/v1/software/detail` | 免费 |
| 组件搜索 | GET | `/v1/components/search` | 免费 |
| 组件详情 | GET | `/v1/component/detail` | 免费 |
| 报告生成 | POST | `/v1/report/generate` | 免费 |

## 快速开始

### 1. 申请 API Key

在控制台「密钥管理」页面创建密钥，每个密钥绑定一个项目，可独立设置配额与权限范围。

### 2. 构造请求

在请求头中携带 `Authorization: Bearer YOUR_API_KEY`，请求体使用 JSON 格式。

```bash
curl -X POST https://api.tosslib.example/v1/sca/scan \
  -H "Authorization: Bearer sk_live_xxxx" \
  -H "Content-Type: application/json" \
  -d '{"package": "lodash@4.17.21"}'
```

### 3. 解析响应

响应统一为 JSON，成功时 `code = 0`，失败时返回对应错误码与提示。

```json
{
  "code": 0,
  "msg": "ok",
  "data": { "scan_id": "sc_8a3f", "status": "done" }
}
```

## 认证方式

OpenAPI 采用 Bearer Token 认证，密钥通过请求头传递。

| 参数 | 位置 | 说明 |
|:---|:---|:---|
| `Authorization` | Header | 固定格式 `Bearer YOUR_API_KEY`，必填 |
| `X-Request-Id` | Header | 请求追踪 ID，建议填入 UUID，便于排障 |

## 权限范围（Scope）

| Scope | 可访问接口 |
|:---|:---|
| `read` | 组件搜索、报告查询、漏洞查询 |
| `scan` | SCA 扫描、SBOM 生成、恶意代码检测 |
| `admin` | 全部接口 + 配额管理 |

## 通用错误码

| code | HTTP | 含义 | 处理建议 |
|:---|:---|:---|:---|
| 0 | 200 | 成功 | 无需处理 |
| 40100 | 401 | 未携带 API Key 或格式错误 | 检查 Authorization 头 |
| 40101 | 401 | API Key 无效或已停用 | 在控制台重新生成密钥 |
| 40300 | 403 | 权限不足（Scope 不匹配） | 为密钥追加对应 Scope |
| 42900 | 429 | 请求频率超过配额 | 降低频率或申请提升配额 |
| 50000 | 500 | 服务内部错误 | 保留 X-Request-Id 并联系技术支持 |

## 变更日志

### v1.0 — 2026-07-01

- 正式发布 OpenAPI v1.0
- 上线 8 个接口：SCA 扫描、漏洞预警、SBOM 生成、AI 助手、合规分析、恶意代码检测、组件搜索、报告生成
- Bearer Token 认证 + Scope 权限模型
- 全链路 HTTPS（TLS 1.3）加密

### v0.9 — 2026-05-15

- 新增 AI 智能选型助手内测接口
- 组件搜索接口支持 lang 多语言过滤

### v0.8.3 — 2026-04-02

- 修复 SCA 扫描 deep 模式下依赖树截断问题
- 优化报告生成 PDF 模板字体兼容性
