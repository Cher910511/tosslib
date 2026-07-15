# 开源合规分析

查询开源许可证详情，包括许可证类型、状态、允许范围、限制条款及义务要求。

- **方法**：GET
- **路径**：`/v1/license/query`
- **等级**：免费
- **Content-Type**：`application/json`

## 请求参数

| 参数 | 位置 | 类型 | 必填 | 说明 |
|:---|:---|:---|:---|:---|
| `Authorization` | Header | string | 是 | Bearer Token，格式 `Bearer sk_live_xxxx` |
| `name` | Query | string | 是 | 许可证名称，如 `Apache License 2.0`、`MIT`、`GPL-3.0` |

## 请求示例

```bash
curl "https://api.tosslib.example/v1/license/query?name=Apache%20License%202.0" \
  -H "Authorization: Bearer sk_live_xxxx"
```

## 响应参数

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `code` | int | 错误码，0 表示成功 |
| `msg` | string | 提示信息 |
| `data.name` | string | 许可证名称 |
| `data.version` | string | 许可证版本 |
| `data.type` | string | 许可证类型，如 `apache` / `gpl` / `mit` / `bsd` |
| `data.status` | string | 状态：`approved` / `restricted` / `unclassified` |
| `data.permissions` | array | 允许的行为列表 |
| `data.limitations` | array | 限制条款列表 |
| `data.obligations` | array | 必须履行的义务列表 |
| `data.description` | string | 许可证描述 |

## 响应示例

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "name": "Apache License 2.0",
    "version": "3.28.0",
    "type": "apache",
    "status": "approved",
    "permissions": [
      "commercial-use",
      "modifications",
      "distribution",
      "patent-use",
      "private-use"
    ],
    "limitations": [
      "trademark-use",
      "liability",
      "warranty"
    ],
    "obligations": [
      "include-copyright",
      "document-changes"
    ],
    "description": "A permissive license whose main conditions require preservation of copyright and license notices. Contributors provide an express grant of patent rights. Licensed works, modifications, and larger works may be distributed under different terms and without source code."
  }
}
```

## 专属错误码

| code | HTTP | 含义 |
|:---|:---|:---|
| 40007 | 400 | 未识别的许可证名称 |