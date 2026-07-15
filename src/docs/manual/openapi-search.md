# 组件搜索

高性能开源组件索引服务，支持按组件名称、版本、语言、版本火车等多维度检索。

- **方法**：GET
- **路径**：`/v1/components/search`
- **等级**：免费
- **Content-Type**：`application/json`

## 请求参数

| 参数 | 位置 | 类型 | 必填 | 说明 |
|:---|:---|:---|:---|:---|
| `Authorization` | Header | string | 是 | Bearer Token，格式 `Bearer sk_live_xxxx` |
| `component_name` | Query | string | 否 | 组件名称关键词 |
| `version` | Query | string | 否 | 组件版本号，精确匹配 |
| `language` | Query | string | 否 | 编程语言：`Java` / `JavaScript` / `Python` / `Go` / `TypeScript` 等 |
| `version_train` | Query | string | 否 | 版本火车名称 |
| `page_num` | Query | int | 否 | 页码，默认 1 |
| `page_size` | Query | int | 否 | 每页数量，默认 10，最大 100 |

## 请求示例

```bash
curl "https://api.tosslib.example/v1/components/search?component_name=openfeign&language=Java&page_num=1&page_size=10" \
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
| `data.content` | array | 组件列表 |

**`content[]` 元素结构**

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `id` | int | 组件 ID |
| `component_name` | string | 组件名称（含版本） |
| `version` | string | 版本号 |
| `component_code` | string | 组件唯一标识码 |
| `group_id` | string | Group ID（Maven 风格） |
| `artifact_id` | string | Artifact ID |
| `language` | string | 编程语言 |
| `license_name` | string | 许可证名称 |
| `inout_status` | int | 出入库状态码 |
| `inout_status_desc` | string | 出入库状态描述，如 `已入库` |

## 响应示例

```json
{
  "code": 200,
  "error_name": null,
  "msg": "success",
  "trace_id": "aae9024b3afa4837afa0ff3798186fc0",
  "data": {
    "page_num": 1,
    "page_size": 10,
    "total": 27531,
    "page_count": 2754,
    "content": [
      {
        "id": 30390,
        "component_name": "spring-cloud-openfeign-dependencies 4.2.0",
        "version": "4.2.0",
        "component_code": "9fee65f6838847dd529dd4635153b089",
        "group_id": "org.springframework.cloud",
        "artifact_id": "spring-cloud-openfeign-dependencies",
        "language": "Java",
        "license_name": "Apache License V2.0",
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
| 40012 | 400 | 参数不合法 |