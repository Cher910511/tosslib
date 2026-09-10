# 软件详情

查询指定软件的详细信息，包括基本信息、版本信息、生命周期、评分、下载地址等。

- **方法**：GET
- **路径**：`/v1/software/detail`
- **等级**：免费
- **Content-Type**：`application/json`

## 请求参数

| 参数 | 位置 | 类型 | 必填 | 说明 |
|:---|:---|:---|:---|:---|
| `Authorization` | Header | string | 是 | Bearer Token，格式 `Bearer sk_live_xxxx` |
| `software_id` | Query | int | 是 | 软件 ID |

## 请求示例

```bash
curl "https://api.tosslib.example/v1/software/detail?software_id=346" \
  -H "Authorization: Bearer sk_live_xxxx"
```

## 响应参数

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `code` | int | 状态码，200 表示成功 |
| `error_name` | string | 错误名称，成功时为 `null` |
| `msg` | string | 提示信息 |
| `trace_id` | string | 请求追踪 ID |
| `data.software_id` | int | 软件 ID |
| `data.software_name` | string | 软件名称 |
| `data.software_code` | string | 软件唯一标识码 |
| `data.main_language` | string | 主语言 |
| `data.developer` | string | 开发商/开发者 |
| `data.open_source_org` | string | 开源组织 |
| `data.industry_category` | string | 行业分类编码 |
| `data.industry_category_text` | string | 行业分类名称 |
| `data.domain` | string | 领域 |
| `data.description` | string | 软件描述 |
| `data.software_score` | float | 软件评分 |
| `data.version_count` | int | 版本数量 |
| `data.first_release_date` | string | 首次发布日期 |
| `data.homepage` | string | 官网地址 |
| `data.software_status` | int | 软件状态 |
| `data.inout_status` | int | 出入库状态码 |
| `data.inout_status_desc` | string | 出入库状态描述 |
| `data.software_create_time` | string | 创建时间 |
| `data.software_update_time` | string | 更新时间 |
| `data.lifecycle_stage` | int | 生命周期阶段 |
| `data.lifecycle_stage_str` | string | 生命周期阶段描述，如 `成长期` |
| `data.version_id` | int | 当前版本 ID |
| `data.version_name` | string | 当前版本名称 |
| `data.version_code` | string | 版本标识码 |
| `data.version_main_language` | string | 版本主语言 |
| `data.version_developer` | string | 版本开发商 |
| `data.release_date` | string | 发布日期 |
| `data.version_desc` | string | 版本描述 |
| `data.risk_desc` | string | 风险描述 |
| `data.license_name` | string | 许可证名称 |
| `data.introduce_type` | int | 引入类型 |
| `data.import_type` | string | 导入方式 |
| `data.level` | string | 等级 |
| `data.label` | string | 标签 |
| `data.integration_risk` | string | 集成风险 |
| `data.code_lines` | int | 代码行数 |
| `data.vuln_count` | int | 漏洞数量 |
| `data.eol_date` | string | EOL 日期 |
| `data.eol_disclosure_url` | string | EOL 公告地址 |
| `data.scm` | string | 源码仓库地址 |
| `data.version_homepage` | string | 版本官网地址 |
| `data.repo_scm` | string | 仓库 SCM 地址 |
| `data.tag` | string | 标签/版本标签 |
| `data.commit_id` | string | Commit ID |
| `data.branch` | string | 分支 |
| `data.the_branch` | string | 主分支 |
| `data.vul_disclosure_url` | string | 漏洞披露地址 |
| `data.fork_count` | int | Fork 数量 |
| `data.star_count` | int | Star 数量 |
| `data.watch_count` | int | Watch 数量 |
| `data.scorecard_score` | float | Scorecard 评分 |
| `data.criticality_score` | float | 关键性评分 |
| `data.version_status` | int | 版本状态 |
| `data.version_create_time` | string | 版本创建时间 |
| `data.version_update_time` | string | 版本更新时间 |
| `data.download_urls` | array | 下载地址列表 |
| `data.sign_url` | string | 签名文件下载地址 |
| `data.gitcode_scm` | string | GitCode 仓库地址 |

**`download_urls[]` 元素结构**

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `id` | int | 下载地址 ID |
| `url_type` | string | 地址类型 |
| `download_url` | string | 下载链接 |
| `file_key` | string | 文件格式，如 `tar.gz` |
| `opensource_url` | string | 开源镜像地址 |

## 响应示例

```json
{
  "code": 200,
  "error_name": null,
  "msg": "success",
  "trace_id": "7984bd6f6ad1477daa82453ec553b648",
  "data": {
    "software_id": 346,
    "software_name": "Apache ActiveMQ artemis",
    "main_language": "Java",
    "developer": "The Apache Software Foundation",
    "open_source_org": "",
    "industry_category": "INDUSTRY",
    "industry_category_text": "工业",
    "domain": "",
    "description": "Mirror of Apache ActiveMQ Artemis",
    "software_score": null,
    "version_count": 75,
    "first_release_date": null,
    "homepage": "https://activemq.apache.org/components/artemis",
    "software_status": 1,
    "inout_status": 1,
    "inout_status_desc": "已入库",
    "software_create_time": "2026-04-11T17:52:13",
    "software_update_time": "2026-07-10T16:45:11",
    "lifecycle_stage": 1,
    "lifecycle_stage_str": "成长期",
    "version_id": 558,
    "software_code": "35337b1865de1e1232e76881be23b45a",
    "version_name": "2.43.0",
    "version_code": "",
    "version_main_language": "Java",
    "version_developer": "The Apache Software Foundation",
    "release_date": "2025-10-13",
    "version_desc": "",
    "risk_desc": null,
    "license_name": "Apache License V2.0",
    "introduce_type": 1,
    "import_type": "Select",
    "level": "L3",
    "label": "",
    "integration_risk": "",
    "code_lines": 0,
    "vuln_count": 2,
    "eol_date": null,
    "eol_disclosure_url": "",
    "scm": "https://github.com/apache/activemq-artemis",
    "version_homepage": "https://activemq.apache.org/components/artemis",
    "repo_scm": "",
    "tag": "2.43.0",
    "commit_id": "",
    "branch": "",
    "the_branch": "main",
    "vul_disclosure_url": "",
    "fork_count": 0,
    "star_count": 0,
    "watch_count": 0,
    "scorecard_score": 4.60,
    "scorecard_eval_time": null,
    "criticality_score": 0.58,
    "criticality_eval_time": null,
    "version_status": 1,
    "version_create_time": "2026-04-11T17:52:13",
    "version_update_time": "2026-04-29T10:03:49",
    "download_urls": [
      {
        "id": 491021,
        "url_type": "1",
        "download_url": "https://raw.gitcode.com/opensource/gh_mirrors/act/artemis/archive/refs/heads/2.43.0.tar.gz",
        "file_key": "tar.gz",
        "opensource_url": "https://tosslib.com/opensource/gh_mirrors/act/artemis/archive/refs/heads/2.43.0.tar.gz"
      }
    ],
    "sign_url": "https://tosslib.com/sign/8cb0224f8b9e498a873082e45f1097e7/2.43.0.tar-sign.zip",
    "gitcode_scm": "https://gitcode.com/gh_mirrors/act/artemis"
  }
}
```

## 专属错误码

| code | HTTP | 含义 |
|:---|:---|:---|
| 40401 | 404 | 软件不存在 |