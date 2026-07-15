# 软件搜索

搜索平台中的软件列表，支持按名称、版本、语言、漏洞状态、行业分类、版本火车等多维度检索。

- **方法**：GET
- **路径**：`/v1/software/search`
- **等级**：免费
- **Content-Type**：`application/json`

## 请求参数

| 参数 | 位置 | 类型 | 必填 | 说明 |
|:---|:---|:---|:---|:---|
| `Authorization` | Header | string | 是 | Bearer Token，格式 `Bearer sk_live_xxxx` |
| `software_name` | Query | string | 否 | 软件名称关键词 |
| `version` | Query | string | 否 | 软件版本号 |
| `language` | Query | string | 否 | 编程语言：`Java` / `Python` / `JavaScript` / `Go` / `TypeScript` 等 |
| `has_vuln` | Query | bool | 否 | 有无漏洞：`true` / `false` |
| `industry_category` | Query | string | 否 | 行业分类：`INDUSTRY` / `COMMUNICATION` / `FINANCE` / `MEDICAL` 等 |
| `version_train` | Query | string | 否 | 版本火车名称 |
| `page_num` | Query | int | 否 | 页码，默认 1 |
| `page_size` | Query | int | 否 | 每页数量，默认 10，最大 100 |

## 请求示例

```bash
curl "https://api.tosslib.example/v1/software/search?software_name=openfeign&language=Java&page_num=1&page_size=10" \
  -H "Authorization: Bearer sk_live_xxxx"
```

## 响应参数

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `code` | int | 状态码，200 表示成功 |
| `error_name` | string | 错误名称，成功时为 `null` |
| `msg` | string | 提示信息 |
| `trace_id` | string | 请求追踪 ID |
| `data.page_num` | int | 当前页码 |
| `data.page_size` | int | 每页数量 |
| `data.total` | int | 匹配总数 |
| `data.page_count` | int | 总页数 |
| `data.content` | array | 软件列表 |

**`content[]` 元素结构**

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `software_id` | int | 软件 ID |
| `software_version_id` | int | 软件版本 ID |
| `software_name` | string | 软件名称 |
| `software_code` | string | 软件唯一标识码 |
| `version_name` | string | 版本名称 |
| `developer` | string | 开发商/开发者 |
| `main_language` | string | 主语言类型 |
| `release_date` | string | 发布日期 |
| `industry_category` | string | 行业分类编码 |
| `industry_category_str` | string | 行业分类名称 |
| `vuln_count` | int | 漏洞数量 |
| `software_score` | float | 软件评分 |
| `scorecard_score` | float | Scorecard 评分 |
| `criticality_score` | float | 关键性评分 |
| `lifecycle_stage` | int | 生命周期阶段 |
| `inout_status` | int | 出入库状态码 |
| `inout_status_desc` | string | 出入库状态描述，如 `已入库` |

## 响应示例

```json
{
  "code": 200,
  "error_name": null,
  "msg": "success",
  "trace_id": "4f83554682ff4ad095843f383c7a6852",
  "data": {
    "page_num": 1,
    "page_size": 10,
    "total": 5387,
    "page_count": 539,
    "content": [
      {
        "software_id": 1682,
        "software_version_id": 17211,
        "software_name": "lua-resty-http",
        "software_code": "aut1682e3c9a8e63fa54bb8a7de",
        "version_name": "v0.18.0",
        "developer": "Ledge Tech",
        "main_language": "Others",
        "release_date": "2026-07-06 00:00:00",
        "industry_category": "INDUSTRY",
        "industry_category_str": "工业",
        "vuln_count": 0,
        "software_score": null,
        "scorecard_score": 4.80,
        "criticality_score": null,
        "lifecycle_stage": 3,
        "inout_status": 1,
        "inout_status_desc": "已入库"
      }
    ]
  }
}
```

## 专属错误码

| code | HTTP | 含义 |
|:---|:---|:---|
| 40011 | 400 | 参数不合法 |