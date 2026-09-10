# SCA 扫描

上传软件包文件，自动识别组件清单、依赖关系、漏洞信息、许可证合规等，输出完整的软件分析报告。支持常见打包格式及容器镜像。

- **方法**：POST
- **路径**：`/v1/sca/scan`
- **等级**：免费
- **Content-Type**：`multipart/form-data`

## 请求参数

| 参数 | 位置 | 类型 | 必填 | 说明 |
|:---|:---|:---|:---|:---|
| `file` | FormData | file | 是 | 待扫描文件，支持 `zip` / `jar` / `war` / `tar.gz` / 容器镜像 |
| `deep` | FormData | boolean | 否 | 是否启用深度依赖分析，默认 `false` |

> 文件大小上限为 **200MB**。超出限制将返回 `40002` 错误。

## 请求示例

```bash
curl -X POST https://api.tosslib.example/v1/sca/scan \
  -H "Authorization: Bearer sk_live_xxxx" \
  -F "file=@my-app.jar" \
  -F "deep=true"
```

## 响应参数

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `code` | int | 错误码，0 表示成功 |
| `msg` | string | 提示信息 |
| `data.scan_id` | string | 扫描任务 ID |
| `data.status` | string | 任务状态：`pending` / `running` / `done` / `failed` |
| `data.version` | string | 扫描到的版本号 |
| `data.integration_risk` | string | 集成风险等级：`low` / `medium` / `high` |
| `data.lang` | string | 主语言类型 |
| `data.developer` | string | 开发商/作者 |
| `data.release_date` | string | 发布日期（ISO 8601） |
| `data.licenses` | array | 许可证列表，含 `spdx_id` / `name` |
| `data.description` | string | 软件描述 |
| `data.kloc` | int | 代码量（千行） |
| `data.vuln_count` | int | 漏洞总数 |
| `data.vitality` | string | 软件生命力：`active` / `maintenance` / `eol` / `unknown` |
| `data.community_eol` | string | 社区 EOL 日期 |
| `data.version_description` | string | 版本描述/变更说明 |
| `data.homepage` | string | 官网地址 |
| `data.source_url` | string | 源码地址 |
| `data.source_repo` | string | 源码仓库地址（Git） |
| `data.source_download_url` | string | 源码包下载链接 |
| `data.copyright_report` | object | Copyright 报告，含 `total` / `items[]` |
| `data.dependencies` | array | 依赖关系列表，含 `name` / `version` / `license` / `is_direct` |
| `data.sbom` | object | SBOM 文件下载链接，含 `spdx_url` / `cyclonedx_url` |
| `data.vulnerabilities` | array | 漏洞列表，含 `cve_id` / `severity` / `cvss` / `summary` / `fix` |

## 响应示例

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "scan_id": "sc_8a3f2c1e",
    "status": "done",
    "version": "4.17.21",
    "integration_risk": "low",
    "lang": "JavaScript",
    "developer": "John-David Dalton",
    "release_date": "2024-03-15",
    "licenses": [
      { "spdx_id": "MIT", "name": "MIT License" }
    ],
    "description": "Lodash 是一个现代 JavaScript 实用工具库，提供模块化、高性能的辅助函数。",
    "kloc": 58,
    "vuln_count": 3,
    "vitality": "active",
    "community_eol": "2027-06-01",
    "version_description": "修复了模板注入漏洞 CVE-2021-23337",
    "homepage": "https://lodash.com",
    "source_url": "https://github.com/lodash/lodash",
    "source_repo": "https://github.com/lodash/lodash.git",
    "source_download_url": "https://github.com/lodash/lodash/archive/v4.17.21.tar.gz",
    "copyright_report": {
      "total": 12,
      "items": [
        { "holder": "JS Foundation", "year": "2024", "statement": "Copyright (c) JS Foundation and other contributors" }
      ]
    },
    "dependencies": [
      { "name": "some-dep", "version": "1.0.0", "license": "MIT", "is_direct": true }
    ],
    "sbom": {
      "spdx_url": "https://api.tosslib.example/v1/sbom/sb_xxx/download",
      "cyclonedx_url": "https://api.tosslib.example/v1/sbom/sb_xxx/download?format=cyclonedx"
    },
    "vulnerabilities": [
      {
        "cve_id": "CVE-2021-23337",
        "severity": "high",
        "cvss": 7.2,
        "summary": "Lodash 模板注入漏洞",
        "fix": "升级至 4.17.21 及以上",
        "affected_versions": ["< 4.17.21"]
      }
    ]
  }
}
```

## 专属错误码

| code | HTTP | 含义 |
|:---|:---|:---|
| 40001 | 400 | 不支持的文件格式 |
| 40002 | 400 | 文件大小超过限制（200MB） |
| 40003 | 400 | 文件解析失败 |
| 40004 | 400 | 扫描超时 |
