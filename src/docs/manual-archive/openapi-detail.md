# 组件详情

查询指定组件的详细信息，包括组件基本信息、许可证、源码地址等。

- **方法**：GET
- **路径**：`/v1/component/detail`
- **等级**：免费
- **Content-Type**：`application/json`

## 请求参数

| 参数 | 位置 | 类型 | 必填 | 说明 |
|:---|:---|:---|:---|:---|
| `Authorization` | Header | string | 是 | Bearer Token，格式 `Bearer sk_live_xxxx` |
| `component_id` | Query | int | 是 | 组件 ID |

## 请求示例

```bash
curl "https://api.tosslib.example/v1/component/detail?component_id=30390" \
  -H "Authorization: Bearer sk_live_xxxx"
```

## 响应参数

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `code` | int | 状态码，200 表示成功 |
| `error_name` | string | 错误名称，成功时为 `null` |
| `msg` | string | 提示信息 |
| `trace_id` | string | 请求追踪 ID |
| `data.id` | int | 组件 ID |
| `data.component_name` | string | 组件名称（含版本） |
| `data.component_code` | string | 组件唯一标识码 |
| `data.version` | string | 版本号 |
| `data.group_id` | string | Group ID（Maven 风格） |
| `data.artifact_id` | string | Artifact ID |
| `data.package_name` | string | 包名 |
| `data.language` | string | 编程语言 |
| `data.license_name` | string | 许可证名称 |
| `data.description` | string | 组件描述 |
| `data.homepage` | string | 官网地址 |
| `data.scm` | string | 源码仓库地址 |
| `data.code_lines` | int | 代码行数 |
| `data.software_id` | int | 所属软件 ID |
| `data.software_version_id` | int | 所属软件版本 ID |
| `data.import_type` | string | 导入方式 |
| `data.level` | string | 等级 |
| `data.label` | string | 标签 |
| `data.status` | int | 组件状态 |
| `data.inout_status` | int | 出入库状态码 |
| `data.inout_status_desc` | string | 出入库状态描述，如 `已入库` |

## 响应示例

```json
{
  "code": 200,
  "error_name": null,
  "msg": "success",
  "trace_id": "ad3c73b33e34461abaaf94de15adc53b",
  "data": {
    "id": 30390,
    "component_name": "spring-cloud-openfeign-dependencies 4.2.0",
    "component_code": "9fee65f6838847dd529dd4635153b089",
    "version": "4.2.0",
    "group_id": "org.springframework.cloud",
    "artifact_id": "spring-cloud-openfeign-dependencies",
    "package_name": "",
    "language": "Java",
    "license_name": "Apache License V2.0",
    "description": "Support for using OpenFeign in Spring Cloud apps",
    "homepage": "https://spring.io/projects/spring-cloud-openfeign",
    "scm": "https://github.com/spring-cloud/spring-cloud-openfeign",
    "code_lines": 0,
    "software_id": 5428,
    "software_version_id": 10075,
    "import_type": "1",
    "level": "",
    "label": "v4.2.0",
    "status": 1,
    "inout_status": 1,
    "inout_status_desc": "已入库"
  }
}
```

## 专属错误码

| code | HTTP | 含义 |
|:---|:---|:---|
| 40402 | 404 | 组件不存在 |