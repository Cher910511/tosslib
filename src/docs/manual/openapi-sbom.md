# SBOM 生成

根据 SCA 扫描结果生成软件物料清单（SBOM），返回组件列表。

- **方法**：POST
- **路径**：`/v1/sbom/generate`
- **等级**：免费
- **Content-Type**：`application/json`

## 请求参数

| 参数 | 位置 | 类型 | 必填 | 说明 |
|:---|:---|:---|:---|:---|
| `Authorization` | Header | string | 是 | Bearer Token，格式 `Bearer sk_live_xxxx` |
| `scan_id` | Body | string | 是 | SCA 扫描返回的任务 ID |

## 请求示例

```bash
curl -X POST https://api.tosslib.example/v1/sbom/generate \
  -H "Authorization: Bearer sk_live_xxxx" \
  -H "Content-Type: application/json" \
  -d '{"scan_id": "sc_8a3f2c1e"}'
```

## 响应参数

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `code` | int | 错误码，0 表示成功 |
| `msg` | string | 提示信息 |
| `data.package_name` | string | 扫描产物名称 |
| `data.total` | int | 组件总数 |
| `data.items` | array | 组件列表 |

**`items[]` 元素结构**

| 字段 | 类型 | 说明 |
|:---|:---|:---|
| `index` | int | 序号 |
| `group_id` | string | Group ID（Maven 风格） |
| `package_name` | string | 组件包名 |
| `version` | string | 版本号 |
| `lang` | string | 编程语言 |
| `purl` | string | Package URL（如 `pkg:maven/joda-time/joda-time@2.10`） |

## 响应示例

```json
{
  "code": 0,
  "msg": "ok",
  "data": {
    "package_name": "my-app",
    "total": 3,
    "items": [
      {
        "index": 1,
        "group_id": "joda-time",
        "package_name": "joda-time",
        "version": "2.10",
        "lang": "Java",
        "purl": "pkg:maven/joda-time/joda-time@2.10"
      },
      {
        "index": 2,
        "group_id": "net.sf.trove4j",
        "package_name": "core",
        "version": "3.1.0",
        "lang": "Java",
        "purl": "pkg:maven/net.sf.trove4j/core@3.1.0"
      },
      {
        "index": 3,
        "group_id": "com.squareup.okhttp3",
        "package_name": "okhttp",
        "version": "3.6.0",
        "lang": "Java",
        "purl": "pkg:maven/com.squareup.okhttp3/okhttp@3.6.0"
      }
    ]
  }
}
```

## 专属错误码

| code | HTTP | 含义 |
|:---|:---|:---|
| 40003 | 400 | scan_id 无效或已过期 |